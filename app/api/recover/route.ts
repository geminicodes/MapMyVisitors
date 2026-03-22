import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateMagicToken } from '@/lib/token';
import { sendMagicLinkEmail } from '@/lib/email';
import { createInMemoryRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const recoveryLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  maxEntries: 50_000,
});

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    if (!recoveryLimiter.allow(ip.trim())) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, email, widget_id, paid')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (dbError) {
      logger.error('[Recovery] Database error', { message: dbError.message });
    }

    if (user && user.paid) {
      // Best-effort: never leak whether the account exists, and never fail the endpoint.
      try {
        const token = generateMagicToken(user.id, user.widget_id);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!appUrl) {
          logger.error('[Recovery] Missing NEXT_PUBLIC_APP_URL; cannot construct magic link');
        } else {
          const magicLink = `${appUrl}/dashboard?token=${token}`;
          const { success } = await sendMagicLinkEmail(normalizedEmail, magicLink);
          if (!success) {
            logger.error('[Recovery] Email send failed');
          }
        }
      } catch (error) {
        logger.error('[Recovery] Failed to generate/send magic link', {
          message: error instanceof Error ? error.message : 'unknown_error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a magic link shortly.',
    });
  } catch (error) {
    logger.error('[Recovery] Error', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    // Preserve privacy semantics: don't fail closed in a way that reveals internal state.
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a magic link shortly.',
    });
  }
}
