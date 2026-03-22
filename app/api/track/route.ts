import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getLocationFromIP } from '@/lib/geoip';
import { createInMemoryRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const trackLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  maxEntries: 200_000,
});

function validateWidgetId(widgetId: string): boolean {
  return /^[a-zA-Z0-9_-]{12}$/.test(widgetId);
}

function validateUrl(url: string): boolean {
  if (!url || url.length > 2048) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function utcMonthStartISODate(now: Date): string {
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return monthStart.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function checkMonthlyLimit(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
): Promise<{ allowed: boolean; currentCount: number; month: string }> {
  const month = utcMonthStartISODate(new Date());

  const { data, error } = await supabase
    .from('monthly_pageviews')
    .select('pageview_count')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();

  if (error) {
    logger.error('[Track] Error checking monthly limit', { message: error.message });
    throw error;
  }

  const currentCount = data?.pageview_count || 0;
  return { allowed: currentCount < 10000, currentCount, month };
}

async function incrementMonthlyPageviews(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  month: string
): Promise<void> {
  // Atomic increment via SECURITY DEFINER function in migrations.
  const { error } = await supabase.rpc('increment_monthly_pageviews', {
    p_user_id: userId,
    p_month: month,
  });

  if (error) {
    logger.error('[Track] Error incrementing monthly pageviews', { message: error.message });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    if (!trackLimiter.allow(ip.trim())) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { widgetId, pageUrl, referrer } = body;

    if (!widgetId || !validateWidgetId(widgetId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid widget ID' },
        { status: 400, headers }
      );
    }

    if (!pageUrl || !validateUrl(pageUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid page URL' },
        { status: 400, headers }
      );
    }

    const supabase = createServiceClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, paid')
      .eq('widget_id', widgetId)
      .maybeSingle();

    if (userError) {
      logger.error('[Track] Database error', { message: userError.message });
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500, headers }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Widget ID not found' },
        { status: 404, headers }
      );
    }

    if (!user.paid) {
      return NextResponse.json(
        { success: false, error: 'Payment required' },
        { status: 402, headers }
      );
    }

    const { allowed, month } = await checkMonthlyLimit(supabase, user.id);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Monthly limit reached (10,000 pageviews)' },
        { status: 429, headers }
      );
    }

    const location = await getLocationFromIP(ip);
    const userAgent = request.headers.get('user-agent') || null;

    const { error: insertError } = await supabase
      .from('visitors')
      .insert({
        user_id: user.id,
        country: location.country,
        country_code: location.countryCode,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        page_url: pageUrl,
        user_agent: userAgent,
        referrer: referrer || null,
      });

    if (insertError) {
      logger.error('[Track] Error inserting visitor', { message: insertError.message });
      return NextResponse.json(
        { success: false, error: 'Failed to track visitor' },
        { status: 500, headers }
      );
    }

    await incrementMonthlyPageviews(supabase, user.id, month);

    return NextResponse.json(
      { success: true, message: 'Tracked' },
      { headers }
    );
  } catch (error) {
    logger.error('[Track] Error', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}
