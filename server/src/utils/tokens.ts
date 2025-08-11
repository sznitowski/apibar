// src/utils/tokens.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function generarAccessToken(payload: object, expiresIn = process.env.JWT_EXPIRES_IN || '15m') {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn });
}

// ya lo tenías para refresh:
export function generarRefreshTokenRaw(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// nuevo para reset (podrías reutilizar los de refresh, pero lo dejo explícito):
export function generarResetTokenRaw(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
