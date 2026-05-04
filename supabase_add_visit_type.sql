ALTER TABLE guests ADD COLUMN IF NOT EXISTS visit_type text DEFAULT 'first' CHECK (visit_type IN ('first', 'second', 'third', 'regular'));
