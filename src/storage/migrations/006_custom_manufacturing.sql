PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS custom_manufacturing_jobs (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES custom_category_definitions(category_id) ON DELETE RESTRICT,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  definition_version INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'ready', 'limited', 'failed', 'cancelled')),
  item_budget INTEGER NOT NULL,
  provider_call_budget INTEGER NOT NULL,
  completed_items INTEGER NOT NULL DEFAULT 0,
  provider_calls INTEGER NOT NULL DEFAULT 0,
  result_json TEXT,
  failure_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  UNIQUE(category_id, definition_version)
);

CREATE INDEX IF NOT EXISTS idx_custom_manufacturing_status ON custom_manufacturing_jobs(account_id, status, created_at);
