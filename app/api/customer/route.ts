import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const { data: customerData, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customer.id)
      .maybeSingle();

    if (error || !customerData) {
      logger.error('[Customer] Database error', { message: error?.message ?? 'unknown_error' });
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customerData.id,
        email: customerData.email,
        plan: customerData.plan,
        widget_id: customerData.widget_id,
        pageviews_used: customerData.pageviews_used,
        pageviews_limit: customerData.pageviews_limit,
        website_domains: customerData.website_domains,
        status: customerData.status,
      },
    });
  } catch (error) {
    logger.error('[Customer] Error', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
