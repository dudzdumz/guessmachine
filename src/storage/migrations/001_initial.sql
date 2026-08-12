PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  category_type TEXT NOT NULL DEFAULT 'built_in' CHECK (category_type IN ('built_in', 'custom')),
  lifecycle_state TEXT NOT NULL DEFAULT 'available' CHECK (lifecycle_state IN ('candidate', 'available', 'retired')),
  owner_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  parent_id TEXT REFERENCES knowledge_nodes(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL DEFAULT 'available' CHECK (lifecycle_state IN ('available', 'retired')),
  UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  canonical_name_en TEXT NOT NULL,
  canonical_name_ar TEXT,
  lifecycle_state TEXT NOT NULL DEFAULT 'available' CHECK (lifecycle_state IN ('available', 'retired')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entity_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  UNIQUE(entity_id, language, normalized_alias)
);

CREATE TABLE IF NOT EXISTS facts (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  subject_key TEXT NOT NULL,
  predicate_key TEXT NOT NULL,
  object_key TEXT NOT NULL,
  qualifiers TEXT NOT NULL DEFAULT '',
  statement_en TEXT NOT NULL,
  statement_ar TEXT NOT NULL,
  stability_class TEXT NOT NULL DEFAULT 'historical' CHECK (stability_class IN ('historical', 'periodic', 'current')),
  lifecycle_state TEXT NOT NULL DEFAULT 'verified' CHECK (lifecycle_state IN ('candidate', 'verified', 'stale', 'rejected', 'retired')),
  verified_at TEXT,
  valid_from TEXT,
  valid_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_categories (
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  relevance REAL NOT NULL DEFAULT 1 CHECK (relevance >= 0 AND relevance <= 1),
  PRIMARY KEY(fact_id, category_id)
);

CREATE TABLE IF NOT EXISTS fact_nodes (
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  node_id TEXT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE RESTRICT,
  PRIMARY KEY(fact_id, node_id)
);

CREATE TABLE IF NOT EXISTS fact_entities (
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  role TEXT NOT NULL,
  PRIMARY KEY(fact_id, entity_id, role)
);

CREATE TABLE IF NOT EXISTS source_evidence (
  id TEXT PRIMARY KEY,
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  source_title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  publisher TEXT,
  trust_tier TEXT NOT NULL CHECK (trust_tier IN ('official', 'authoritative', 'reputable', 'supplementary')),
  supported_claim TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'unavailable', 'contradicted', 'superseded'))
);

CREATE TABLE IF NOT EXISTS validations (
  id TEXT PRIMARY KEY,
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  validation_type TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'needs_review')),
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  notes TEXT,
  validator TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  question_intent TEXT NOT NULL,
  answer_type TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL DEFAULT 'available' CHECK (lifecycle_state IN ('candidate', 'approved', 'available', 'quarantined', 'retired', 'rejected')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS question_variants (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  question_text TEXT NOT NULL,
  answer_display TEXT NOT NULL,
  explanation TEXT,
  normalized_question TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL DEFAULT 'available' CHECK (lifecycle_state IN ('candidate', 'approved', 'available', 'quarantined', 'retired', 'rejected')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(question_id, language, version)
);

CREATE TABLE IF NOT EXISTS accepted_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES question_variants(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  answer_text TEXT NOT NULL,
  normalized_answer TEXT NOT NULL,
  answer_kind TEXT NOT NULL DEFAULT 'alias' CHECK (answer_kind IN ('canonical', 'alias', 'transliteration')),
  UNIQUE(question_id, language, normalized_answer)
);

CREATE TABLE IF NOT EXISTS difficulty_profiles (
  question_id TEXT PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (100, 200, 300)),
  source TEXT NOT NULL DEFAULT 'editorial' CHECK (source IN ('editorial', 'predicted', 'calibrated', 'override')),
  confidence REAL,
  rationale TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fact_categories_category ON fact_categories(category_id, fact_id);
CREATE INDEX IF NOT EXISTS idx_fact_nodes_node ON fact_nodes(node_id, fact_id);
CREATE INDEX IF NOT EXISTS idx_fact_entities_entity ON fact_entities(entity_id, fact_id);
CREATE INDEX IF NOT EXISTS idx_evidence_fact_status ON source_evidence(fact_id, status);
CREATE INDEX IF NOT EXISTS idx_validation_fact_result ON validations(fact_id, result);
CREATE INDEX IF NOT EXISTS idx_questions_fact_lifecycle ON questions(fact_id, lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_variants_question_language ON question_variants(question_id, language, lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_difficulty_level ON difficulty_profiles(level, question_id);
