import { join } from 'node:path';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';

const databasePath = process.env.GUESS_MACHINE_DB ?? join(process.cwd(), 'data', 'guess-machine.sqlite');
const db = openDatabase(databasePath);
const result = importMvpSeed(db);
db.close();
console.log(`Seeded ${result.facts} Facts, ${result.variants} Variants, and ${result.categories} Categories (${result.revision}).`);
