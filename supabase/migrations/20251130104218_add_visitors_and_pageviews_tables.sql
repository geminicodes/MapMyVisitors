/*
  # Add Visitors and Monthly Pageviews Tables

  1. New Tables
    - `visitors`
      - `id` (uuid, primary key) - Unique visitor record identifier
      - `user_id` (uuid, foreign key) - References users table
      - `country` (text) - Visitor's country
      - `country_code` (text) - Two-letter country code
      - `city` (text, nullable) - Visitor's city
      - `latitude` (decimal) - Geographic latitude
      - `longitude` (decimal) - Geographic longitude
      - `page_url` (text) - Page where visit occurred
      - `user_agent` (text, nullable) - Browser user agent
      - `referrer` (text, nullable) - Referrer URL
      - `created_at` (timestamptz) - Visit timestamp
    
    - `monthly_pageviews`
      - `id` (uuid, primary key) - Unique record identifier
      - `user_id` (uuid, foreign key) - References users table
      - `month` (date) - Month for tracking (YYYY-MM-01)
      - `pageview_count` (integer) - Count of pageviews for the month
      - Unique constraint on (user_id, month)
  
  2. Security
    - Enable RLS on both tables
    - Service role can read/write all data
  
  3. Indexes
    - Index on user_id for fast lookups
    - Index on created_at for time-based queries
    - Index on month for pageview queries
*/

CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country text NOT NULL,
  country_code text NOT NULL,
  city text,
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  page_url text NOT NULL,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all visitors"
  ON visitors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_visitors_user_id ON visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);

CREATE TABLE IF NOT EXISTS monthly_pageviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month date NOT NULL,
  pageview_count integer DEFAULT 0 NOT NULL,
  UNIQUE(user_id, month)
);

ALTER TABLE monthly_pageviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all pageviews"
  ON monthly_pageviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_monthly_pageviews_user_id ON monthly_pageviews(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_pageviews_month ON monthly_pageviews(month);
