import 'server-only';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const TOKEN_NAME = 'mapmyvisitors_token';

export interface CustomerPayload {
  id: string;
  email: string;
  licenseKey: string;
  plan: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    // Never allow weak or missing secrets in production.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is missing or too short (min 32 chars).');
    }
    logger.warn('[Auth] JWT_SECRET missing/too short; auth tokens are disabled in this environment.');
    throw new Error('JWT_SECRET is missing or too short (min 32 chars).');
  }
  return secret;
}

export function createToken(payload: CustomerPayload): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): CustomerPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as CustomerPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME);
  return token?.value || null;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getCurrentCustomer(): Promise<CustomerPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}
