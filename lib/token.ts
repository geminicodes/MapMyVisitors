import 'server-only';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

interface TokenPayload {
  userId: string;
  widgetId: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is missing or too short (min 32 chars).');
    }
    logger.warn('[Token] JWT_SECRET missing/too short; magic links are disabled in this environment.');
    throw new Error('JWT_SECRET is missing or too short (min 32 chars).');
  }
  return secret;
}

export function generateMagicToken(userId: string, widgetId: string): string {
  const secret = getJwtSecret();
  const payload = {
    userId,
    widgetId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
  };

  return jwt.sign(payload, secret);
}

export function verifyMagicToken(token: string): TokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as unknown as {
      userId?: unknown;
      widgetId?: unknown;
    };
    if (typeof decoded.userId !== 'string' || typeof decoded.widgetId !== 'string') {
      return null;
    }
    return { userId: decoded.userId, widgetId: decoded.widgetId };
  } catch (error) {
    logger.debug('[Token] Verification failed', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return null;
  }
}
