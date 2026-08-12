import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { randomUUID } from 'node:crypto';
import { GameService } from '../engine/game-service.mjs';
import { EngineError } from '../engine/errors.mjs';

const CONTENT_TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

async function jsonBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new EngineError('PAYLOAD_TOO_LARGE', 'REQUEST TOO LARGE', { category: 'validation', status: 413 });
  }
  if (!body) return {};
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Object body required');
    return parsed;
  } catch {
    throw new EngineError('INVALID_JSON', 'INVALID REQUEST', { category: 'validation' });
  }
}

function send(response, status, data) {
  const body = JSON.stringify(data);
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'content-length': Buffer.byteLength(body) });
  response.end(body);
}

function token(request) {
  return request.headers['x-game-token'];
}

export function createAppServer({ db, publicDirectory = join(process.cwd(), 'public') }) {
  const service = new GameService(db);
  const server = createServer(async (request, response) => {
    const correlationId = randomUUID();
    try {
      const url = new URL(request.url, 'http://localhost');
      const path = url.pathname;
      if (request.method === 'GET' && path === '/api/health') return send(response, 200, { status: 'ok', engine: 'guess-machine', providers_required: false });
      if (request.method === 'POST' && path === '/api/games') return send(response, 201, service.createGame(await jsonBody(request)));
      const match = path.match(/^\/api\/games\/([^/]+)(?:\/(.*))?$/);
      if (match) {
        const [, gameId, action = 'state'] = match;
        if (request.method === 'POST' && action === 'prepare') return send(response, 200, service.prepareGame(gameId, token(request), await jsonBody(request)));
        if (request.method === 'GET' && action === 'preparation') return send(response, 200, service.getPreparation(gameId, token(request)));
        if (request.method === 'GET' && action === 'board') return send(response, 200, service.getBoard(gameId, token(request)));
        if (request.method === 'POST' && action === 'select-category') return send(response, 200, service.selectCategory(gameId, token(request), await jsonBody(request)));
        if (request.method === 'POST' && action === 'activate') return send(response, 200, service.activateSlot(gameId, token(request), await jsonBody(request)));
        if (request.method === 'GET' && action === 'active-question') return send(response, 200, service.getActiveQuestion(gameId, token(request)));
        if (request.method === 'POST' && action === 'reveal') return send(response, 200, service.revealAnswer(gameId, token(request), await jsonBody(request)));
        if (request.method === 'POST' && action === 'outcomes') return send(response, 200, service.recordOutcome(gameId, token(request), await jsonBody(request)));
        if (request.method === 'POST' && action === 'complete') return send(response, 200, service.completeGame(gameId, token(request), await jsonBody(request)));
        if (request.method === 'POST' && action === 'abandon') return send(response, 200, service.abandonGame(gameId, token(request), await jsonBody(request)));
        if (request.method === 'GET' && action === 'state') return send(response, 200, service.readGameState(gameId, token(request)));
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') throw new EngineError('NOT_FOUND', 'NOT FOUND', { status: 404 });
      const requested = path === '/' ? 'index.html' : path.slice(1);
      const safe = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
      const filename = join(publicDirectory, safe);
      if (!filename.startsWith(publicDirectory)) throw new EngineError('NOT_FOUND', 'NOT FOUND', { status: 404 });
      const file = await readFile(filename);
      response.writeHead(200, { 'content-type': CONTENT_TYPES[extname(filename)] ?? 'application/octet-stream', 'content-length': file.length });
      response.end(request.method === 'HEAD' ? undefined : file);
    } catch (error) {
      if (error?.code === 'ENOENT') return send(response, 404, { code: 'NOT_FOUND', user_safe_message: 'NOT FOUND', correlation_id: correlationId });
      const engineError = error instanceof EngineError ? error : new EngineError('INTERNAL_ERROR', 'MACHINE ERROR', { status: 500 });
      send(response, engineError.status, engineError.toPublic(correlationId));
    }
  });
  return { server, service };
}
