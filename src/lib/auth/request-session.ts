import { NextRequest } from 'next/server';
import { getSession, ServerSession } from './session';
import { db } from '@/lib/db';

export function getRequestSession(request: NextRequest): ServerSession | null {
  const token =
    request.cookies.get('nilvora_session')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    request.headers.get('x-nilvora-token');

  const session = getSession(token);
  if (!session) return null;

  const user = db.getUserById(session.user.id);
  if (!user) return null;
  session.user = user;
  return session;
}
