-- Table: import_tasks
CREATE TABLE IF NOT EXISTS import_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT,
  image_base64 TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_tasks_status ON import_tasks(status);
CREATE INDEX IF NOT EXISTS idx_import_tasks_created ON import_tasks(created_at);
