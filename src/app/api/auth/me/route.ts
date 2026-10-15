import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth/request-session';
import { ROLE_PERMISSIONS } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);

  if (session) {
    const user = session.user;
    return NextResponse.json({
      success: true,
      authenticated: true,
      session: {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        primaryRole: user.role,
        permissions: ROLE_PERMISSIONS[user.role] || [],
        dpdpConsentStatus: 'granted',
        isVerified: user.isVerified,
        jurisdiction: 'Tamil Nadu, India',
        expiresAt: new Date(session.expiresAt).toISOString(),
      },
      meta: {
        framework: 'Next.js 16 (React 19)',
        compliance: 'DPDP Act 2023 & TNRERA Rules 2017',
        serverTime: new Date().toISOString(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    authenticated: false,
    meta: {
      framework: 'Next.js 16 (React 19)',
      compliance: 'DPDP Act 2023 & TNRERA Rules 2017',
      serverTime: new Date().toISOString(),
    },
  });
}
