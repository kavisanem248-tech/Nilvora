import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/passwords';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { createSession, checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/session';
import { UserProfile, UserRole } from '@/types';

function withoutPasswordCredentials(user: UserProfile & { passwordHash?: string; salt?: string }) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  delete safeUser.salt;
  return safeUser;
}

function createSessionResponse(data: Record<string, unknown>, token: string) {
  const response = NextResponse.json(data);
  response.cookies.set('nilvora_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrPhone, password, otpCode, authMode, isDemoMode, demoRole, requestedRole } = body;

    const validLoginRoles: UserRole[] = ['buyer', 'seller', 'broker', 'builder', 'legal_pro', 'admin'];
    if (typeof requestedRole !== 'string' || !validLoginRoles.includes(requestedRole as UserRole)) {
      return NextResponse.json(
        { success: false, error: 'Choose a valid account role before signing in.' },
        { status: 400 }
      );
    }
    if (typeof emailOrPhone !== 'string' || !emailOrPhone.trim()) {
      return NextResponse.json({ success: false, error: 'Email address or phone number is required.' }, { status: 400 });
    }

    // 1. Rate Limiting Check
    const rateLimitKey = (typeof emailOrPhone === 'string' ? emailOrPhone : 'unknown_login').trim().toLowerCase();
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Account temporarily locked for security. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Demo Persona Quick-Switch Handler
    if (isDemoMode && demoRole) {
      if (process.env.NODE_ENV === 'production' || !['buyer', 'seller', 'broker'].includes(demoRole)) {
        return NextResponse.json(
          { success: false, error: 'Demo sign-in is available only for buyer, seller, and broker previews outside production.' },
          { status: 403 }
        );
      }
      if (demoRole !== requestedRole) {
        return NextResponse.json(
          { success: false, error: 'The selected role does not match this demo account.' },
          { status: 403 }
        );
      }

      // Find matching demo user in DB or create verified placeholder
      let demoUser = db.getUsers().find((u) => u.role === demoRole);
      if (!demoUser) {
        demoUser = {
          id: `demo-${demoRole}-1`,
          fullName: `Demo ${demoRole.toUpperCase()}`,
          displayName: `Demo ${demoRole}`,
          email: `${demoRole}.demo@nilvora.in`,
          phone: '+91 98400 11223',
          role: demoRole as UserRole,
          preferredLanguage: 'en',
          state: 'Tamil Nadu',
          district: 'Chennai',
          locality: 'Ambattur',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        db.createUser(demoUser);
      }

      const session = createSession(demoUser);
      const safeUser = withoutPasswordCredentials(demoUser);

      return createSessionResponse({
        success: true,
        message: `Signed in under ${demoRole.toUpperCase()} demo persona.`,
        isDemoMode: true,
        sessionToken: session.token,
        user: safeUser,
      }, session.token);
    }

    // 3. Production Password Login Mode
    if (authMode === 'password') {
      if (typeof emailOrPhone !== 'string' || typeof password !== 'string' || !emailOrPhone || !password) {
        return NextResponse.json(
          { success: false, error: 'Email or phone and password are required.' },
          { status: 400 }
        );
      }

      const configuredAdminEmail = process.env.NILVORA_ADMIN_EMAIL?.trim().toLowerCase();
      const configuredAdminUsername = process.env.NILVORA_ADMIN_USERNAME?.trim().toLowerCase();
      const isDevelopmentAdminAlias = process.env.NODE_ENV !== 'production' &&
        Boolean(configuredAdminUsername) &&
        emailOrPhone.trim().toLowerCase() === configuredAdminUsername;
      const user = isDevelopmentAdminAlias
        ? db.getUsers().find((account) => account.role === 'admin' && account.email.toLowerCase() === configuredAdminEmail)
        : db.getUserByEmail(emailOrPhone) || db.getUsers().find(
            (account) => normalizePhoneNumber(account.phone) === normalizePhoneNumber(emailOrPhone)
          );

      if (!user) {
        const failure = recordFailedAttempt(rateLimitKey);
        return NextResponse.json(
          {
            success: false,
            error: failure.locked
              ? 'Too many failed login attempts. Account locked for 15 minutes.'
              : 'Invalid credentials. Please verify your email/phone and password.',
          },
          { status: 401 }
        );
      }

      const configuredAdminPassword = process.env.NILVORA_ADMIN_PASSWORD;
      const configuredPasswordBytes = configuredAdminPassword ? Buffer.from(configuredAdminPassword) : undefined;
      const suppliedPasswordBytes = Buffer.from(password);
      const configuredAdminMatch =
        user.role === 'admin' &&
        configuredAdminEmail === user.email.toLowerCase() &&
        configuredPasswordBytes !== undefined &&
        configuredPasswordBytes.length >= (process.env.NODE_ENV === 'production' ? 16 : 8) &&
        configuredPasswordBytes.length === suppliedPasswordBytes.length &&
        crypto.timingSafeEqual(configuredPasswordBytes, suppliedPasswordBytes) &&
        (!isDevelopmentAdminAlias || user.email.toLowerCase() === configuredAdminEmail);
      const storedPasswordMatch = Boolean(user.passwordHash && user.salt) &&
        verifyPassword(password, user.passwordHash || '', user.salt || '');
      const isMatch = storedPasswordMatch || configuredAdminMatch;
      if (!isMatch) {
        const failure = recordFailedAttempt(rateLimitKey);
        return NextResponse.json(
          {
            success: false,
            error: failure.locked
              ? 'Too many failed login attempts. Account locked for 15 minutes.'
              : 'Invalid credentials. Please verify your email/phone and password.',
          },
          { status: 401 }
        );
      }
      if (user.role !== requestedRole) {
        return NextResponse.json(
          { success: false, error: 'This account is not authorized for the selected role.' },
          { status: 403 }
        );
      }

      // Successful password authentication: reset rate limiter
      resetRateLimit(rateLimitKey);
      const session = createSession(user);

      db.addAuditLog({
        userId: user.id,
        action: 'USER_LOGIN_SUCCESS',
        resource: 'auth/login',
        resourceId: user.id,
        details: { method: 'password', role: user.role },
      });

      const safeUser = withoutPasswordCredentials(user);

      return createSessionResponse({
        success: true,
        message: 'Authentication successful.',
        isDemoMode: false,
        sessionToken: session.token,
        user: safeUser,
      }, session.token);
    }

    // 4. Production Phone OTP Login Mode
    if (authMode === 'otp') {
      if (requestedRole === 'admin') {
        return NextResponse.json(
          { success: false, error: 'Admin accounts must sign in with their authorized password.' },
          { status: 403 }
        );
      }
      if (typeof emailOrPhone !== 'string' || !emailOrPhone || typeof otpCode !== 'string' || !otpCode) {
        return NextResponse.json(
          { success: false, error: 'Mobile number and 6-digit OTP are required.' },
          { status: 400 }
        );
      }

      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Phone OTP sign-in is unavailable until a verified SMS provider is configured.' },
          { status: 503 }
        );
      }

      // In local development, accept only the OTP explicitly shown by the sign-in form.
      if (otpCode !== '849201' && otpCode !== '924810') {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json(
          { success: false, error: 'Invalid or expired OTP code. Please request a new code.' },
          { status: 401 }
        );
      }

      let user = db.getUsers().find(
        (account) => normalizePhoneNumber(account.phone) === normalizePhoneNumber(emailOrPhone)
      ) || db.getUserByEmail(emailOrPhone);

      if (!user) {
        if (requestedRole !== 'buyer') {
          return NextResponse.json(
            { success: false, error: 'Create an account with your selected role before signing in.' },
            { status: 404 }
          );
        }

        user = {
          id: `user-phone-${Date.now()}`,
          fullName: 'Verified Mobile User',
          displayName: 'Mobile User',
          email: `${emailOrPhone.replace(/\D/g, '')}@nilvora-sms.in`,
          phone: emailOrPhone,
          role: 'buyer',
          preferredLanguage: 'en',
          state: 'Tamil Nadu',
          district: 'Chennai',
          locality: 'Ambattur',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        db.createUser(user);
      }
      if (user.role !== requestedRole) {
        return NextResponse.json(
          { success: false, error: 'This account is not authorized for the selected role.' },
          { status: 403 }
        );
      }

      resetRateLimit(rateLimitKey);
      const session = createSession(user);

      db.addAuditLog({
        userId: user.id,
        action: 'USER_LOGIN_OTP_SUCCESS',
        resource: 'auth/login',
        resourceId: user.id,
        details: { method: 'otp', phone: emailOrPhone },
      });

      const safeUser = withoutPasswordCredentials(user);

      return createSessionResponse({
        success: true,
        message: 'Phone OTP verified successfully.',
        isDemoMode: false,
        sessionToken: session.token,
        user: safeUser,
      }, session.token);
    }

    return NextResponse.json({ success: false, error: 'Invalid authMode specified.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error processing sign-in.' },
      { status: 500 }
    );
  }
}
