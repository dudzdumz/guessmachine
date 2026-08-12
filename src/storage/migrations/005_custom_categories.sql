PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS custom_category_definitions (
  category_id TEXT PRIMARY KEY REFERENCES categories(id) ON DELETE RESTRICT,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  original_scope_text TEXT NOT NULL,
  normalized_scope_json TEXT NOT NULL DEFAULT '{}',
  readiness_status TEXT NOT NULL CHECK (readiness_status IN ('draft', 'limited', 'ready', 'retired', 'failed')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  ready_at TEXT,
  retired_at TEXT
);

CREATE TABLE IF NOT EXISTS custom_knowledge_maps (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES custom_category_definitions(category_id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  scope_version INTEGER NOT NULL,
  branches_json TEXT NOT NULL,
  capacity_json TEXT NOT NULL,
  source_viability_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'viable', 'too_narrow', 'source_poor', 'retired')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(category_id, version)
);

CREATE INDEX IF NOT EXISTS idx_custom_definitions_owner_status ON custom_category_definitions(account_id, readiness_status, created_at);
CREATE INDEX IF NOT EXISTS idx_custom_maps_category_status ON custom_knowledge_maps(category_id, status, version);
