import crypto from 'crypto';

/**
 * Hash a password using PBKDF2 with SHA-256 and a random salt.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

/**
 * Verify a password against a stored hash and salt.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash || !salt) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

/**
 * Generate a cryptographically random session token.
 */
export function generateSessionToken(): string {
  return `nilvora_sess_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Generate a secure 6-digit numeric OTP for phone verification.
 */
export function generateSecureOtp(): string {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}
