import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    await removeAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('[Logout] Error', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
