PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  group_id TEXT,
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  region TEXT NOT NULL DEFAULT 'OM',
  game_mode TEXT NOT NULL DEFAULT 'classic_100_200_300',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'preparing', 'ready', 'active', 'completed', 'abandoned', 'failed')),
  active_team_id TEXT,
  selected_category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  state_version INTEGER NOT NULL DEFAULT 1,
  host_token TEXT NOT NULL UNIQUE,
  display_token TEXT NOT NULL UNIQUE,
  failure_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  turn_order INTEGER NOT NULL,
  UNIQUE(game_id, turn_order)
);

CREATE TABLE IF NOT EXISTS game_categories (
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL,
  PRIMARY KEY(game_id, category_id),
  UNIQUE(game_id, position)
);

CREATE TABLE IF NOT EXISTS game_packages (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE REFERENCES games(id) ON DELETE CASCADE,
  contract_version INTEGER NOT NULL DEFAULT 1,
  assembly_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'ready', 'invalid', 'failed')),
  created_at TEXT NOT NULL,
  ready_at TEXT,
  expires_at TEXT,
  failure_code TEXT
);

CREATE TABLE IF NOT EXISTS game_slots (
  id TEXT PRIMARY KEY,
  package_id TEXT NOT NULL REFERENCES game_packages(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  difficulty INTEGER NOT NULL CHECK (difficulty IN (100, 200, 300)),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'revealed', 'used', 'voided', 'disabled')),

  primary_fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  primary_question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  primary_variant_id TEXT NOT NULL REFERENCES question_variants(id) ON DELETE RESTRICT,
  primary_question_snapshot TEXT NOT NULL,
  primary_answer_snapshot TEXT NOT NULL,
  primary_explanation_snapshot TEXT,
  primary_language_snapshot TEXT NOT NULL,
  primary_available INTEGER NOT NULL DEFAULT 1 CHECK (primary_available IN (0, 1)),

  fallback_fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  fallback_question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  fallback_variant_id TEXT NOT NULL REFERENCES question_variants(id) ON DELETE RESTRICT,
  fallback_question_snapshot TEXT NOT NULL,
  fallback_answer_snapshot TEXT NOT NULL,
  fallback_explanation_snapshot TEXT,
  fallback_language_snapshot TEXT NOT NULL,
  fallback_available INTEGER NOT NULL DEFAULT 1 CHECK (fallback_available IN (0, 1)),

  served_fact_id TEXT REFERENCES facts(id) ON DELETE RESTRICT,
  served_question_id TEXT REFERENCES questions(id) ON DELETE RESTRICT,
  served_variant_id TEXT REFERENCES question_variants(id) ON DELETE RESTRICT,
  served_question_snapshot TEXT,
  served_answer_snapshot TEXT,
  served_explanation_snapshot TEXT,
  served_language_snapshot TEXT,
  served_source TEXT CHECK (served_source IN ('primary', 'fallback')),
  fallback_reason TEXT,

  selected_team_id TEXT REFERENCES teams(id) ON DELETE RESTRICT,
  activated_at TEXT,
  revealed_at TEXT,
  completed_at TEXT,
  UNIQUE(package_id, category_id, difficulty),
  UNIQUE(package_id, primary_fact_id)
);

CREATE TABLE IF NOT EXISTS exposures (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  group_id TEXT,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slot_id TEXT NOT NULL UNIQUE REFERENCES game_slots(id) ON DELETE RESTRICT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  difficulty INTEGER NOT NULL CHECK (difficulty IN (100, 200, 300)),
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  variant_id TEXT NOT NULL REFERENCES question_variants(id) ON DELETE RESTRICT,
  served_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outcomes (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slot_id TEXT NOT NULL UNIQUE REFERENCES game_slots(id) ON DELETE RESTRICT,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  difficulty INTEGER NOT NULL CHECK (difficulty IN (100, 200, 300)),
  fact_id TEXT NOT NULL REFERENCES facts(id) ON DELETE RESTRICT,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  variant_id TEXT NOT NULL REFERENCES question_variants(id) ON DELETE RESTRICT,
  outcome TEXT NOT NULL CHECK (outcome IN ('correct', 'incorrect', 'skipped', 'voided', 'disputed')),
  score_delta INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER,
  host_override INTEGER NOT NULL DEFAULT 0 CHECK (host_override IN (0, 1)),
  dispute_note TEXT,
  technical_failure TEXT,
  recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS idempotency_records (
  actor_scope TEXT NOT NULL,
  operation TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  intent_hash TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(actor_scope, operation, idempotency_key)
);

CREATE TABLE IF NOT EXISTS game_events (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slot_id TEXT REFERENCES game_slots(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  state_version INTEGER NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_games_account_status ON games(account_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_teams_game ON teams(game_id, turn_order);
CREATE INDEX IF NOT EXISTS idx_slots_package_status ON game_slots(package_id, status);
CREATE INDEX IF NOT EXISTS idx_exposures_account_fact ON exposures(account_id, fact_id, served_at);
CREATE INDEX IF NOT EXISTS idx_exposures_group_fact ON exposures(group_id, fact_id, served_at);
CREATE INDEX IF NOT EXISTS idx_outcomes_fact ON outcomes(fact_id, outcome, recorded_at);
CREATE INDEX IF NOT EXISTS idx_events_game_version ON game_events(game_id, state_version);
