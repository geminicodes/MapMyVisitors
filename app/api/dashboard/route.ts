import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createInMemoryRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const dashboardLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  maxEntries: 100_000,
});

function validateWidgetId(widgetId: string): boolean {
  return /^[a-zA-Z0-9_-]{12}$/.test(widgetId);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const widgetId = searchParams.get('widgetId');

    if (!widgetId) {
      return NextResponse.json(
        { success: false, error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    if (!validateWidgetId(widgetId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid widget ID format' },
        { status: 400 }
      );
    }

    if (!dashboardLimiter.allow(widgetId)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const supabase = createServiceClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('email, widget_id, paid, watermark_removed')
      .eq('widget_id', widgetId)
      .maybeSingle();

    if (error) {
      logger.error('[Dashboard] Database error', { message: error.message });
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.paid) {
      return NextResponse.json(
        { success: false, error: 'Payment required' },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        widgetId: user.widget_id,
        paid: user.paid,
        watermarkRemoved: user.watermark_removed,
      },
    });
  } catch (error) {
    logger.error('[Dashboard] Error', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
