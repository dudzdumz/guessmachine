import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TRANSACTION_DEPTHS = new WeakMap();
const MIGRATIONS = [
  [1, join(HERE, 'migrations', '001_initial.sql')],
  [2, join(HERE, 'migrations', '002_game_runtime.sql')],
  [3, join(HERE, 'migrations', '003_foundry.sql')],
  [4, join(HERE, 'migrations', '004_foundry_audit.sql')],
  [5, join(HERE, 'migrations', '005_custom_categories.sql')],
  [6, join(HERE, 'migrations', '006_custom_manufacturing.sql')],
];

export function openDatabase(filename = ':memory:') {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys = ON;');
  if (filename !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  migrateDatabase(db);
  return db;
}

export function migrateDatabase(db) {
  db.exec(readFileSync(MIGRATIONS[0][1], 'utf8'));
  for (const [version, filename] of MIGRATIONS) {
    const applied = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(version);
    if (applied) continue;
    db.exec(readFileSync(filename, 'utf8'));
    db.prepare('INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)').run(version, new Date().toISOString());
  }
}

export function inTransaction(db, operation) {
  const depth = TRANSACTION_DEPTHS.get(db) ?? 0;
  const savepoint = `guess_engine_savepoint_${depth}`;
  if (depth === 0) db.exec('BEGIN IMMEDIATE;');
  else db.exec(`SAVEPOINT ${savepoint};`);
  TRANSACTION_DEPTHS.set(db, depth + 1);
  try {
    const result = operation();
    if (depth === 0) db.exec('COMMIT;');
    else db.exec(`RELEASE SAVEPOINT ${savepoint};`);
    return result;
  } catch (error) {
    if (depth === 0) db.exec('ROLLBACK;');
    else {
      db.exec(`ROLLBACK TO SAVEPOINT ${savepoint};`);
      db.exec(`RELEASE SAVEPOINT ${savepoint};`);
    }
    throw error;
  } finally {
    if (depth === 0) TRANSACTION_DEPTHS.delete(db);
    else TRANSACTION_DEPTHS.set(db, depth);
  }
}
