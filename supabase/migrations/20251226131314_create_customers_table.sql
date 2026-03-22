/*
  # Create Customers Table for License Management

  1. New Tables
    - `customers`
      - `id` (uuid, primary key) - Unique customer identifier
      - `email` (text, unique, not null) - Customer email address
      - `license_key` (text, unique, not null) - Gumroad license key
      - `plan` (text, not null, default 'basic') - Subscription plan (basic/premium)
      - `purchased_at` (timestamptz) - Date of purchase from Gumroad
      - `pageviews_used` (integer, default 0) - Current pageviews used
      - `pageviews_limit` (integer, default 10000) - Monthly pageviews limit
      - `website_domains` (text[], default '{}') - Array of allowed domains
      - `status` (text, default 'active') - Account status (active/suspended/cancelled)
      - `created_at` (timestamptz, default now()) - Record creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp

  2. Security
    - Enable RLS on `customers` table
    - Add policy for customers to read their own data only
    - Add policy for customers to update their own website_domains

  3. Important Notes
    - Each license key is unique and tied to one email
    - Default plan is 'basic' with 10,000 pageviews/month
    - Status tracks account lifecycle
*/

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  license_key text UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'basic',
  purchased_at timestamptz DEFAULT now(),
  pageviews_used integer DEFAULT 0,
  pageviews_limit integer DEFAULT 10000,
  website_domains text[] DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Your app accesses `customers` via server-side service role key.
-- This policy ensures it always works even when RLS is enabled.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Service role full access to customers'
  ) THEN
    CREATE POLICY "Service role full access to customers"
      ON customers FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Optional: keep `updated_at` fresh
CREATE OR REPLACE FUNCTION update_customers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at_column();

CREATE POLICY "Customers can read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (email = current_setting('app.current_user_email', true));

CREATE POLICY "Customers can update own domains"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (email = current_setting('app.current_user_email', true))
  WITH CHECK (email = current_setting('app.current_user_email', true));

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_license_key ON customers(license_key);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
