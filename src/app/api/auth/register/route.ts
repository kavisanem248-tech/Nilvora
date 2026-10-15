import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/passwords';
import { createSession } from '@/lib/auth/session';
import { validatePublicRegistrationRole } from '@/lib/auth/rbac';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { BrokerProfile, UserProfile } from '@/types';
import { PublicRegistrationRole } from '@/lib/auth/rbac';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName, email, phone, password, otpCode, role, locality, preferredLanguage,
      consentDpdp, agencyName, reraNumber, experienceYears,
    } = body;

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Account registration is unavailable until phone verification is configured.' },
        { status: 503 }
      );
    }

    if (otpCode !== '924810') {
      return NextResponse.json(
        { success: false, error: 'Enter the development verification code shown in the registration form.' },
        { status: 401 }
      );
    }

    if (
      typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 120 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof phone !== 'string' || normalizePhoneNumber(phone).length !== 10 ||
      typeof password !== 'string' || password.length > 200 ||
      typeof role !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid name, email, 10-digit phone number, password, and account role.' },
        { status: 400 }
      );
    }

    // 1. Mandatory Fields Validation
    if (!fullName || !email || !phone || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, password, and role are required.' },
        { status: 400 }
      );
    }

    // 2. DPDP Act 2023 Consent Requirement
    if (!consentDpdp) {
      return NextResponse.json(
        {
          success: false,
          error: 'Statutory consent under India’s Digital Personal Data Protection (DPDP) Act 2023 is required to create a NILVORA account.',
        },
        { status: 400 }
      );
    }

    // 3. Role Security Check: Strictly prevent public registration of Admin accounts
    const roleValidation = validatePublicRegistrationRole(role);
    if (!roleValidation.valid) {
      // Log security violation audit event
      db.addAuditLog({
        userId: 'anonymous',
        action: 'SECURITY_ALERT_UNAUTHORIZED_ROLE_REGISTRATION_ATTEMPT',
        resource: 'auth/register',
        resourceId: email,
        details: { attemptedRole: role, email, phone },
      });

      return NextResponse.json(
        { success: false, error: roleValidation.error },
        { status: 403 }
      );
    }
    const publicRole = role as PublicRegistrationRole;
    if (role === 'broker' && (
      typeof agencyName !== 'string' || !agencyName.trim() || agencyName.trim().length > 160 ||
      typeof reraNumber !== 'string' || !reraNumber.trim() || reraNumber.trim().length > 80 ||
      !Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 60
    )) {
      return NextResponse.json(
        { success: false, error: 'Broker registration requires a valid agency name, RERA number, and experience from 0 to 60 years.' },
        { status: 400 }
      );
    }

    // 4. Duplicate Check
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhoneNumber(phone);
    const existing = db.getUsers().find(
      (user) => user.email.toLowerCase() === normalizedEmail ||
        normalizePhoneNumber(user.phone) === normalizedPhone
    );
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 5. Password Strength Validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    // 6. Cryptographic Password Hashing
    const { hash, salt } = hashPassword(password);

    // 7. Persist User Record in DB
    const newUser: UserProfile & { passwordHash: string; salt: string } = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: fullName.trim(),
      displayName: fullName.trim().split(' ')[0],
      email: normalizedEmail,
      phone: phone.trim(),
      role: publicRole,
      preferredLanguage: preferredLanguage === 'ta' ? 'ta' : 'en',
      state: 'Tamil Nadu',
      district: 'Chennai',
      locality: locality || 'Ambattur',
      isVerified: true,
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt: salt,
    };

    db.createUser(newUser);
    if (publicRole === 'broker') {
      const brokerProfile: BrokerProfile = {
        id: `broker-${newUser.id}`,
        profileId: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        avatarUrl: '',
        agencyName: agencyName.trim(),
        reraNumber: reraNumber.trim(),
        experienceYears,
        serviceAreas: [newUser.locality],
        defaultCommissionPercent: 0,
        bio: '',
        rating: 0,
        totalDealsClosed: 0,
        isReraVerified: false,
        subscriptionTier: 'starter',
      };
      db.createBrokerProfile(brokerProfile);
    }

    // 8. Log Registration Audit Event
    db.addAuditLog({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      resource: 'users',
      resourceId: newUser.id,
      details: { role: newUser.role, locality: newUser.locality, dpdpConsent: true },
    });

    // 9. Create Server Session
    const session = createSession(newUser);

    // Strip password credentials from response
    const safeUser: UserProfile = {
      id: newUser.id,
      authUserId: newUser.authUserId,
      fullName: newUser.fullName,
      displayName: newUser.displayName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      preferredLanguage: newUser.preferredLanguage,
      state: newUser.state,
      district: newUser.district,
      locality: newUser.locality,
      avatarUrl: newUser.avatarUrl,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created and verified successfully.',
        sessionToken: session.token,
        user: safeUser,
      },
      { status: 201 }
    );
    response.cookies.set('nilvora_session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
