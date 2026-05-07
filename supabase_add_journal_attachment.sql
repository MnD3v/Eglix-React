-- Migration to add multiple attachments (images/PDFs) to journal entries
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
