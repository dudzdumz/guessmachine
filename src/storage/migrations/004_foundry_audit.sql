PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS manufacturing_events (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES manufacturing_jobs(id) ON DELETE CASCADE,
  draft_id TEXT REFERENCES question_drafts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_manufacturing_events_job ON manufacturing_events(job_id, occurred_at);
