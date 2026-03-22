/*
  Add widget identity to customers so embeds use 12-char IDs.
*/
 
-- Needed for gen_random_uuid() / general UUID helpers (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
 
-- 1) Add columns (nullable for now, so existing rows don't break immediately)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS widget_id text;
 
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS user_id uuid;
 
-- 2) Constraints/indexes (do this before NOT NULL so you can backfill safely)
CREATE UNIQUE INDEX IF NOT EXISTS customers_widget_id_unique ON customers(widget_id) WHERE widget_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS customers_user_id_unique ON customers(user_id) WHERE user_id IS NOT NULL;
 
ALTER TABLE customers
  ADD CONSTRAINT customers_widget_id_format_check
  CHECK (widget_id IS NULL OR widget_id ~ '^[A-Za-z0-9_-]{12}$');
 
ALTER TABLE customers
  ADD CONSTRAINT customers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id);
 
-- NOTE: Do NOT add NOT NULL yet. Backfill first, then run a follow-up migration:
-- ALTER TABLE customers ALTER COLUMN widget_id SET NOT NULL;
-- ALTER TABLE customers ALTER COLUMN user_id SET NOT NULL;
