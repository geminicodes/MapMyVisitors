/*
  # Comprehensive Schema Improvements for MapMyVisitors

  ## Purpose
  Add production-ready constraints, indexes, RLS policies, and helper functions
  to optimize performance and security for high-volume visitor tracking.

  ## Changes

  1. **Data Validation Constraints**
     - Email format validation
     - Widget ID format validation (8-20 chars)
     - Latitude/longitude range validation
     - Pageview count non-negative validation

  2. **Performance Indexes**
     - Composite indexes for common queries
     - Partial indexes for paid users
     - Covering indexes for dashboard queries

  3. **RLS Policies**
     - Public inserts on visitors table
     - Service role access controls
     - Secure multi-tenant data isolation

  4. **Helper Functions**
     - Atomic pageview increment
     - Auto-update timestamps

  5. **Documentation**
     - Comprehensive table/column comments
     - Index purpose documentation
*/

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ENABLE EXTENSIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ADD TABLE COMMENTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON TABLE users IS 'Paying customers who own embeddable widget codes';
COMMENT ON COLUMN users.id IS 'Primary key - UUID v4';
COMMENT ON COLUMN users.email IS 'User email address - unique, used for recovery';
COMMENT ON COLUMN users.widget_id IS 'Unique alphanumeric ID used in widget script (8-20 chars)';
COMMENT ON COLUMN users.paid IS 'Whether user completed $29 payment (set by webhook)';
COMMENT ON COLUMN users.watermark_removed IS 'Whether user paid $19 to remove watermark';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last modification timestamp - auto-updated';

COMMENT ON TABLE visitors IS 'Pageview events from widgets - optimized for high write volume';
COMMENT ON COLUMN visitors.id IS 'Primary key - UUID v4';
COMMENT ON COLUMN visitors.user_id IS 'Widget owner (foreign key to users)';
COMMENT ON COLUMN visitors.country IS 'Country name from IP geolocation';
COMMENT ON COLUMN visitors.country_code IS 'ISO 3166-1 alpha-2 code (US, GB, etc)';
COMMENT ON COLUMN visitors.city IS 'City name (nullable)';
COMMENT ON COLUMN visitors.latitude IS 'Latitude (-90 to 90, 6 decimals)';
COMMENT ON COLUMN visitors.longitude IS 'Longitude (-180 to 180, 6 decimals)';
COMMENT ON COLUMN visitors.page_url IS 'Full URL where widget is embedded';
COMMENT ON COLUMN visitors.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN visitors.referrer IS 'HTTP referrer URL';
COMMENT ON COLUMN visitors.created_at IS 'Pageview timestamp - indexed';

COMMENT ON TABLE monthly_pageviews IS 'Monthly pageview aggregates - enforces 10k limit';
COMMENT ON COLUMN monthly_pageviews.id IS 'Primary key - UUID v4';
COMMENT ON COLUMN monthly_pageviews.user_id IS 'Widget owner';
COMMENT ON COLUMN monthly_pageviews.month IS 'Month start date (YYYY-MM-01)';
COMMENT ON COLUMN monthly_pageviews.pageview_count IS 'Total pageviews - incremented atomically';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ADD MISSING COLUMNS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monthly_pageviews' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE monthly_pageviews ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monthly_pageviews' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE monthly_pageviews ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DATA VALIDATION CONSTRAINTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_format_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_email_format_check
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_widget_id_format_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_widget_id_format_check
      CHECK (widget_id ~ '^[A-Za-z0-9_-]{8,20}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visitors_latitude_range_check') THEN
    ALTER TABLE visitors ADD CONSTRAINT visitors_latitude_range_check
      CHECK (latitude >= -90 AND latitude <= 90);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visitors_longitude_range_check') THEN
    ALTER TABLE visitors ADD CONSTRAINT visitors_longitude_range_check
      CHECK (longitude >= -180 AND longitude <= 180);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'monthly_pageviews_count_positive_check') THEN
    ALTER TABLE monthly_pageviews ADD CONSTRAINT monthly_pageviews_count_positive_check
      CHECK (pageview_count >= 0);
  END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PERFORMANCE INDEXES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_users_paid ON users(paid) WHERE paid = true;
CREATE INDEX IF NOT EXISTS idx_visitors_user_created ON visitors(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_pageviews_user_month ON monthly_pageviews(user_id, month DESC);

COMMENT ON INDEX idx_users_paid IS 'Partial index for fast paid user lookups';
COMMENT ON INDEX idx_visitors_user_created IS 'Composite index for recent visitors query (ORDER BY created_at DESC LIMIT 50)';
COMMENT ON INDEX idx_monthly_pageviews_user_month IS 'Fast current month pageview lookups';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RLS POLICIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'visitors' AND policyname = 'Allow public visitor inserts'
  ) THEN
    CREATE POLICY "Allow public visitor inserts"
      ON visitors FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'visitors' AND policyname = 'Service role can read all visitors'
  ) THEN
    CREATE POLICY "Service role can read all visitors"
      ON visitors FOR SELECT USING (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role full access to users'
  ) THEN
    CREATE POLICY "Service role full access to users"
      ON users FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_pageviews' AND policyname = 'Service role full access to monthly_pageviews'
  ) THEN
    CREATE POLICY "Service role full access to monthly_pageviews"
      ON monthly_pageviews FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HELPER FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION increment_monthly_pageviews(
  p_user_id UUID,
  p_month DATE
)
RETURNS void AS $$
BEGIN
  INSERT INTO monthly_pageviews (user_id, month, pageview_count)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    pageview_count = monthly_pageviews.pageview_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_monthly_pageviews IS
  'Atomically increment monthly pageview count with upsert';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_pageviews_updated_at ON monthly_pageviews;
CREATE TRIGGER update_monthly_pageviews_updated_at
  BEFORE UPDATE ON monthly_pageviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- UPDATE STATISTICS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANALYZE users;
ANALYZE visitors;
ANALYZE monthly_pageviews;
