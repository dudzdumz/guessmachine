import { join } from 'node:path';
import { openDatabase } from './storage/database.mjs';
import { importMvpSeed } from './storage/seed.mjs';
import { createAppServer } from './http/server.mjs';

const port = Number(process.env.PORT ?? 3000);
const databasePath = process.env.GUESS_MACHINE_DB ?? join(process.cwd(), 'data', 'guess-machine.sqlite');
const db = openDatabase(databasePath);
importMvpSeed(db);
const { server } = createAppServer({ db });
server.listen(port, () => console.log(`Guess Machine ready at http://localhost:${port}`));

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
