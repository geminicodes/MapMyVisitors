/*
  # Create Users Table for MapMyVisitors

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `email` (text, unique, not null) - User's email address
      - `widget_id` (text, unique, not null) - Unique widget identifier for embed code
      - `paid` (boolean, default false) - Payment status
      - `watermark_removed` (boolean, default false) - Whether user paid to remove watermark
      - `created_at` (timestamptz, default now()) - Account creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp
  
  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data by widget_id
    - Service role can read/write all data (for API endpoints)
  
  3. Indexes
    - Index on `widget_id` for fast lookups
    - Index on `email` for user queries
*/

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  widget_id text UNIQUE NOT NULL,
  paid boolean DEFAULT false NOT NULL,
  watermark_removed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data by widget_id"
  ON users
  FOR SELECT
  TO authenticated
  USING (widget_id = current_setting('request.jwt.claim.widget_id', true));

CREATE INDEX IF NOT EXISTS idx_users_widget_id ON users(widget_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_updated_at'
  ) THEN
    CREATE TRIGGER users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
