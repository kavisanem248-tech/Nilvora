import { NextRequest, NextResponse } from 'next/server';
import { revokeSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = request.cookies.get('nilvora_session')?.value ||
      authHeader?.replace(/^Bearer\s+/i, '') ||
      request.headers.get('x-nilvora-token');

    if (token) {
      revokeSession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully. Session invalidated.',
    });
    response.cookies.set('nilvora_session', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error logging out' },
      { status: 500 }
    );
  }
}
