-- Add website column to churches table
ALTER TABLE churches ADD COLUMN IF NOT EXISTS website TEXT;

-- Refresh the schema cache (Supabase sometimes needs this)
NOTIFY pgrst, 'reload config';
