import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createInMemoryRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const visitorsLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  maxEntries: 100_000,
});

function validateWidgetId(widgetId: string): boolean {
  return /^[a-zA-Z0-9_-]{12}$/.test(widgetId);
}

interface VisitorData {
  id: string;
  lat: number;
  lng: number;
  city: string | null;
  country: string;
  timestamp: string;
  isRecent: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { widgetId: string } }
) {
  const headers = {
    'Cache-Control': 'public, max-age=10',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { widgetId } = params;

    if (!validateWidgetId(widgetId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid widget ID format' },
        { status: 400, headers }
      );
    }

    if (!visitorsLimiter.allow(widgetId)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const parsedLimit = Number.parseInt(limitParam || '50', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;

    const supabase = createServiceClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, paid, watermark_removed')
      .eq('widget_id', widgetId)
      .maybeSingle();

    if (userError) {
      logger.error('[Visitors] Database error', { message: userError.message });
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

    const { data: visitors, error: visitorsError } = await supabase
      .from('visitors')
      .select('id, latitude, longitude, city, country, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (visitorsError) {
      logger.error('[Visitors] Error fetching visitors', { message: visitorsError.message });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch visitors' },
        { status: 500, headers }
      );
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const formattedVisitors: VisitorData[] = (visitors || [])
      .map((v) => {
        const lat = typeof v.latitude === 'number' ? v.latitude : Number(v.latitude);
        const lng = typeof v.longitude === 'number' ? v.longitude : Number(v.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        const createdAt = new Date(v.created_at);
        return {
          id: v.id,
          lat,
          lng,
          city: v.city,
          country: v.country,
          timestamp: v.created_at,
          isRecent: createdAt > fiveMinutesAgo,
        };
      })
      .filter((v): v is VisitorData => v !== null);

    // Accurate counts should not depend on the visual limit.
    const [todayRes, activeRes] = await Promise.all([
      supabase
        .from('visitors')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString()),
      supabase
        .from('visitors')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', fiveMinutesAgo.toISOString()),
    ]);

    if (todayRes.error) {
      logger.error('[Visitors] Failed to count totalToday', { message: todayRes.error.message });
    }
    if (activeRes.error) {
      logger.error('[Visitors] Failed to count activeNow', { message: activeRes.error.message });
    }

    const showWatermark = !(user.watermark_removed === true);

    // Response shape is consumed by `public/widget-src.js` directly.
    return NextResponse.json(
      {
        success: true,
        paid: true,
        showWatermark,
        visitors: formattedVisitors,
        totalToday: todayRes.count ?? 0,
        activeNow: activeRes.count ?? 0,
      },
      { headers }
    );
  } catch (error) {
    logger.error('[Visitors] Error', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
