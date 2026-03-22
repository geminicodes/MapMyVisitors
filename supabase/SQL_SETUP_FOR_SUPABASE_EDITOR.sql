/*
  MapMyVisitors - one-shot Supabase setup script
  ------------------------------------------------
  Use this in Supabase SQL Editor when you want a single copy-paste setup.
  This script is idempotent (safe to run more than once).
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  widget_id text UNIQUE NOT NULL,
  paid boolean NOT NULL DEFAULT false,
  watermark_removed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS watermark_removed boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_format_check') THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_email_format_check
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_widget_id_format_check') THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_widget_id_format_check
      CHECK (widget_id ~ '^[A-Za-z0-9_-]{8,20}$');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can read own data by widget_id'
  ) THEN
    CREATE POLICY "Users can read own data by widget_id"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (widget_id = current_setting('request.jwt.claim.widget_id', true));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Service role full access to users'
  ) THEN
    CREATE POLICY "Service role full access to users"
      ON public.users
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_widget_id ON public.users(widget_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_paid ON public.users(paid) WHERE paid = true;

-- ------------------------------------------------------------
-- visitors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  country text NOT NULL,
  country_code text NOT NULL,
  city text,
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  page_url text NOT NULL,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visitors_latitude_range_check') THEN
    ALTER TABLE public.visitors
      ADD CONSTRAINT visitors_latitude_range_check
      CHECK (latitude >= -90 AND latitude <= 90);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visitors_longitude_range_check') THEN
    ALTER TABLE public.visitors
      ADD CONSTRAINT visitors_longitude_range_check
      CHECK (longitude >= -180 AND longitude <= 180);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'visitors' AND policyname = 'Allow public visitor inserts'
  ) THEN
    CREATE POLICY "Allow public visitor inserts"
      ON public.visitors
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'visitors' AND policyname = 'Service role can read all visitors'
  ) THEN
    CREATE POLICY "Service role can read all visitors"
      ON public.visitors
      FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'visitors' AND policyname = 'Service role can manage all visitors'
  ) THEN
    CREATE POLICY "Service role can manage all visitors"
      ON public.visitors
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_visitors_user_id ON public.visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_user_created ON public.visitors(user_id, created_at DESC);

-- ------------------------------------------------------------
-- monthly_pageviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monthly_pageviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  pageview_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE public.monthly_pageviews ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.monthly_pageviews ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.monthly_pageviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'monthly_pageviews_count_positive_check') THEN
    ALTER TABLE public.monthly_pageviews
      ADD CONSTRAINT monthly_pageviews_count_positive_check
      CHECK (pageview_count >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'monthly_pageviews' AND policyname = 'Service role full access to monthly_pageviews'
  ) THEN
    CREATE POLICY "Service role full access to monthly_pageviews"
      ON public.monthly_pageviews
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'monthly_pageviews' AND policyname = 'Service role can manage all pageviews'
  ) THEN
    CREATE POLICY "Service role can manage all pageviews"
      ON public.monthly_pageviews
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_monthly_pageviews_user_id ON public.monthly_pageviews(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_pageviews_month ON public.monthly_pageviews(month);
CREATE INDEX IF NOT EXISTS idx_monthly_pageviews_user_month ON public.monthly_pageviews(user_id, month DESC);

-- ------------------------------------------------------------
-- shared trigger function + triggers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_pageviews_updated_at ON public.monthly_pageviews;
CREATE TRIGGER update_monthly_pageviews_updated_at
  BEFORE UPDATE ON public.monthly_pageviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Atomic monthly pageview increment used by app/api/track
CREATE OR REPLACE FUNCTION public.increment_monthly_pageviews(
  p_user_id uuid,
  p_month date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.monthly_pageviews (user_id, month, pageview_count)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    pageview_count = public.monthly_pageviews.pageview_count + 1,
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_monthly_pageviews(uuid, date) TO service_role;

-- ------------------------------------------------------------
-- customers (Gumroad/license auth dashboard model)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  license_key text UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'basic',
  purchased_at timestamptz DEFAULT now(),
  pageviews_used integer DEFAULT 0,
  pageviews_limit integer DEFAULT 10000,
  website_domains text[] DEFAULT '{}',
  status text DEFAULT 'active',
  widget_id text,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS widget_id text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_widget_id_format_check') THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_widget_id_format_check
      CHECK (widget_id IS NULL OR widget_id ~ '^[A-Za-z0-9_-]{12}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_user_id_fkey') THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS customers_widget_id_unique
  ON public.customers(widget_id)
  WHERE widget_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS customers_user_id_unique
  ON public.customers(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_license_key ON public.customers(license_key);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Service role full access to customers'
  ) THEN
    CREATE POLICY "Service role full access to customers"
      ON public.customers
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Customers can read own data'
  ) THEN
    CREATE POLICY "Customers can read own data"
      ON public.customers
      FOR SELECT
      TO authenticated
      USING (email = current_setting('app.current_user_email', true));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Customers can update own domains'
  ) THEN
    CREATE POLICY "Customers can update own domains"
      ON public.customers
      FOR UPDATE
      TO authenticated
      USING (email = current_setting('app.current_user_email', true))
      WITH CHECK (email = current_setting('app.current_user_email', true));
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

