import { UserProfile, UserRole } from '@/types';
import { generateSessionToken } from './passwords';

export interface ServerSession {
  token: string;
  user: UserProfile;
  createdAt: number;
  expiresAt: number;
  ipAddress?: string;
}

// In-memory session and rate-limiting stores
const activeSessions: Map<string, ServerSession> = new Map();
const loginAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function createSession(user: UserProfile, ipAddress?: string): ServerSession {
  const token = generateSessionToken();
  const now = Date.now();
  const session: ServerSession = {
    token,
    user,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    ipAddress,
  };

  activeSessions.set(token, session);
  return session;
}

export function getSession(token: string | null | undefined): ServerSession | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

export function revokeSession(token: string): boolean {
  return activeSessions.delete(token);
}

export function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  if (record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginAttempts.delete(key);
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { allowed: remaining > 0, remainingAttempts: remaining };
}

export function recordFailedAttempt(key: string): { locked: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(key, record);
    return { locked: true, retryAfterSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  loginAttempts.set(key, record);
  return { locked: false };
}

export function resetRateLimit(key: string): void {
  loginAttempts.delete(key);
}
