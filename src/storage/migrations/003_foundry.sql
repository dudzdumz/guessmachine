PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS provider_runs (
  id TEXT PRIMARY KEY,
  capability TEXT NOT NULL,
  adapter_key TEXT NOT NULL,
  task TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  input_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  usage_json TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS manufacturing_jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL CHECK (job_type IN ('question_writing', 'fact_verification', 'question_foundry', 'inventory_replenishment')),
  dedupe_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'needs_review', 'completed', 'failed', 'cancelled')),
  input_json TEXT NOT NULL,
  result_json TEXT,
  failure_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS question_drafts (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES manufacturing_jobs(id) ON DELETE SET NULL,
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  question_intent TEXT NOT NULL,
  answer_type TEXT NOT NULL,
  requested_difficulty INTEGER NOT NULL CHECK (requested_difficulty IN (100, 200, 300)),
  locked_answer_en TEXT NOT NULL,
  locked_answer_ar TEXT NOT NULL,
  variants_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('candidate', 'quality_passed', 'rejected', 'approved', 'published')),
  published_question_id TEXT REFERENCES questions(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quality_assessments (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL REFERENCES question_drafts(id) ON DELETE CASCADE,
  pipeline_version TEXT NOT NULL,
  disposition TEXT NOT NULL CHECK (disposition IN ('passed', 'rejected', 'needs_review')),
  checks_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_candidates (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES manufacturing_jobs(id) ON DELETE SET NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  node_id TEXT REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  subject_key TEXT NOT NULL,
  predicate_key TEXT NOT NULL,
  object_key TEXT NOT NULL,
  qualifiers TEXT NOT NULL DEFAULT '',
  statement_en TEXT NOT NULL,
  statement_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_type TEXT NOT NULL,
  source_plan_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('candidate', 'verified', 'rejected', 'needs_review')),
  promoted_fact_id TEXT REFERENCES facts(id) ON DELETE SET NULL,
  rejection_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_demands (
  id TEXT PRIMARY KEY,
  demand_key TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  difficulty INTEGER NOT NULL CHECK (difficulty IN (100, 200, 300)),
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  current_stock INTEGER NOT NULL,
  target_stock INTEGER NOT NULL,
  requested_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'satisfied', 'cancelled', 'failed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  satisfied_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_provider_runs_capability_status ON provider_runs(capability, status, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_type_status ON manufacturing_jobs(job_type, status, created_at);
CREATE INDEX IF NOT EXISTS idx_drafts_fact_status ON question_drafts(fact_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_fact_candidates_status ON fact_candidates(status, category_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_demands_status ON inventory_demands(status, category_id, difficulty, language);
