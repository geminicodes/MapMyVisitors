import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createInMemoryRateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const streamLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  maxEntries: 100_000,
});

function validateWidgetId(widgetId: string): boolean {
  return /^[a-zA-Z0-9_-]{12}$/.test(widgetId);
}

function parseLimit(value: string | null): number {
  const parsedLimit = Number.parseInt(value || '50', 10);
  return Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
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

interface VisitorsSnapshot {
  success: true;
  paid: true;
  showWatermark: boolean;
  visitors: VisitorData[];
  totalToday: number;
  activeNow: number;
}

async function fetchSnapshot(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  showWatermark: boolean,
  limit: number
): Promise<VisitorsSnapshot> {
  const { data: visitors, error: visitorsError } = await supabase
    .from('visitors')
    .select('id, latitude, longitude, city, country, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (visitorsError) {
    throw visitorsError;
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

  const [todayRes, activeRes] = await Promise.all([
    supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('created_at', fiveMinutesAgo.toISOString()),
  ]);

  return {
    success: true,
    paid: true,
    showWatermark,
    visitors: formattedVisitors,
    totalToday: todayRes.count ?? 0,
    activeNow: activeRes.count ?? 0,
  };
}

function snapshotHash(snapshot: VisitorsSnapshot): string {
  const pointKey = snapshot.visitors
    .map((v) => `${v.id}:${v.lat}:${v.lng}:${v.timestamp}:${v.isRecent ? 1 : 0}`)
    .join('|');
  return `${snapshot.totalToday}:${snapshot.activeNow}:${snapshot.showWatermark ? 1 : 0}:${pointKey}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { widgetId: string } }
) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { widgetId } = params;
    if (!validateWidgetId(widgetId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid widget ID format' },
        { status: 400, headers: corsHeaders }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (!streamLimiter.allow(`${widgetId}:${ip.trim()}`)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: corsHeaders }
      );
    }

    const limit = parseLimit(request.nextUrl.searchParams.get('limit'));
    const supabase = createServiceClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, paid, watermark_removed')
      .eq('widget_id', widgetId)
      .maybeSingle();

    if (userError) {
      logger.error('[Visitors Stream] Database error', { message: userError.message });
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Widget ID not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!user.paid) {
      return NextResponse.json(
        { success: false, error: 'Payment required' },
        { status: 402, headers: corsHeaders }
      );
    }

    const showWatermark = !(user.watermark_removed === true);
    const encoder = new TextEncoder();
    let closed = false;
    let updateTimer: NodeJS.Timeout | null = null;
    let keepAliveTimer: NodeJS.Timeout | null = null;
    let lastHash: string | null = null;

    const close = (controller?: ReadableStreamDefaultController<Uint8Array>) => {
      if (closed) return;
      closed = true;
      if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
      }
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      if (controller) {
        try {
          controller.close();
        } catch {
          // Ignore close errors if stream already closed.
        }
      }
    };

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enqueue = (chunk: string) => {
          if (closed) return;
          controller.enqueue(encoder.encode(chunk));
        };

        const pushSnapshot = async (initial = false) => {
          try {
            const snapshot = await fetchSnapshot(supabase, user.id, showWatermark, limit);
            const currentHash = snapshotHash(snapshot);
            if (initial || currentHash !== lastHash) {
              lastHash = currentHash;
              enqueue(`data: ${JSON.stringify(snapshot)}\n\n`);
            }
          } catch (error) {
            logger.error('[Visitors Stream] Snapshot error', {
              message: error instanceof Error ? error.message : 'unknown_error',
            });
            enqueue(`event: error\ndata: {"message":"snapshot_failed"}\n\n`);
          }
        };

        void pushSnapshot(true);
        updateTimer = setInterval(() => {
          void pushSnapshot(false);
        }, 3000);

        keepAliveTimer = setInterval(() => {
          enqueue(': keepalive\n\n');
        }, 15000);

        request.signal.addEventListener('abort', () => close(controller));
      },
      cancel() {
        close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    logger.error('[Visitors Stream] Error', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
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
