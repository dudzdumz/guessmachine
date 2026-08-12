import { createHash, randomUUID } from 'node:crypto';
import { inTransaction } from '../storage/database.mjs';
import { assembleGamePackage } from './assembly.mjs';
import { EngineError } from './errors.mjs';
import { QuestionBank } from './question-bank.mjs';

const ALLOWED_OUTCOMES = new Set(['correct', 'incorrect', 'skipped', 'voided', 'disputed']);

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function intentHash(value) {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

export class GameService {
  constructor(db, { now = () => new Date().toISOString(), id = (prefix) => `${prefix}_${randomUUID()}` } = {}) {
    this.db = db;
    this.now = now;
    this.id = id;
  }

  #game(gameId) {
    const game = this.db.prepare('SELECT * FROM games WHERE id=?').get(gameId);
    if (!game) throw new EngineError('GAME_NOT_FOUND', 'GAME NOT FOUND', { category: 'validation', status: 404 });
    return game;
  }

  #authorize(gameId, token, required = 'display') {
    const game = this.#game(gameId);
    const host = token && token === game.host_token;
    const display = token && token === game.display_token;
    if (!host && !display) throw new EngineError('UNAUTHORIZED', 'UNAUTHORIZED', { category: 'authorization', status: 403 });
    if (required === 'host' && !host) throw new EngineError('UNAUTHORIZED', 'HOST CONTROL REQUIRED', { category: 'authorization', status: 403 });
    return { game, role: host ? 'host' : 'display' };
  }

  #checkVersion(game, expectedStateVersion) {
    if (expectedStateVersion !== undefined && expectedStateVersion !== null && Number(expectedStateVersion) !== game.state_version) {
      throw new EngineError('STALE_CLIENT_STATE', 'MACHINE STATE HAS CHANGED', { category: 'conflict', status: 409 });
    }
  }

  #idempotent(actorScope, operation, key, intent, action) {
    if (!key || typeof key !== 'string' || key.length > 200) {
      throw new EngineError('INVALID_IDEMPOTENCY_KEY', 'VALID IDEMPOTENCY KEY REQUIRED', { category: 'validation' });
    }
    const hash = intentHash(intent);
    return inTransaction(this.db, () => {
      const existing = this.db.prepare(`SELECT intent_hash, response_json FROM idempotency_records
        WHERE actor_scope=? AND operation=? AND idempotency_key=?`).get(actorScope, operation, key);
      if (existing) {
        if (existing.intent_hash !== hash) throw new EngineError('IDEMPOTENCY_CONFLICT', 'REQUEST KEY WAS USED FOR A DIFFERENT ACTION', { category: 'conflict', status: 409 });
        return JSON.parse(existing.response_json);
      }
      const result = action();
      this.db.prepare(`INSERT INTO idempotency_records(actor_scope, operation, idempotency_key, intent_hash, response_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`).run(actorScope, operation, key, hash, JSON.stringify(result), this.now());
      return result;
    });
  }

  createGame(request) {
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      throw new EngineError('INVALID_REQUEST', 'INVALID GAME REQUEST', { category: 'validation' });
    }
    const accountId = String(request.account_id ?? '').trim();
    const language = request.language;
    const region = String(request.region ?? 'OM').trim().toUpperCase();
    const categoryIds = [...new Set(request.selected_category_ids ?? [])];
    const teams = request.teams ?? [];
    if (!accountId || accountId.length > 128) throw new EngineError('ACCOUNT_REQUIRED', 'VALID ACCOUNT REQUIRED', { category: 'validation' });
    if (!['ar', 'en'].includes(language)) throw new EngineError('INVALID_LANGUAGE', 'LANGUAGE MUST BE AR OR EN', { category: 'validation' });
    if (!/^[A-Z]{2}$/.test(region)) throw new EngineError('INVALID_REGION', 'VALID REGION REQUIRED', { category: 'validation' });
    if (request.group_id !== undefined && request.group_id !== null && (typeof request.group_id !== 'string' || request.group_id.length > 128)) {
      throw new EngineError('INVALID_GROUP', 'VALID GROUP REQUIRED', { category: 'validation' });
    }
    if (!Array.isArray(teams) || teams.length < 2 || teams.length > 8 || teams.some((team) => !team || typeof team !== 'object' || !String(team.display_name ?? '').trim() || String(team.display_name).trim().length > 60)) {
      throw new EngineError('INVALID_TEAMS', 'TWO TO EIGHT NAMED TEAMS ARE REQUIRED', { category: 'validation' });
    }
    const normalizedTeamNames = teams.map((team) => String(team.display_name).trim().toLocaleLowerCase(language));
    if (new Set(normalizedTeamNames).size !== teams.length) throw new EngineError('DUPLICATE_TEAMS', 'TEAM NAMES MUST BE UNIQUE', { category: 'validation' });
    if (!Array.isArray(request.selected_category_ids) || categoryIds.length < 1 || categoryIds.length > 12 || categoryIds.some((id) => typeof id !== 'string' || id.length > 128)) {
      throw new EngineError('INVALID_CATEGORIES', 'SELECT VALID CATEGORIES', { category: 'validation' });
    }
    if (request.game_mode !== undefined && request.game_mode !== 'classic_100_200_300') {
      throw new EngineError('INVALID_GAME_MODE', 'GAME MODE NOT AVAILABLE', { category: 'validation' });
    }
    const validCategories = this.db.prepare(`SELECT id FROM categories
      WHERE lifecycle_state='available' AND (category_type='built_in' OR owner_account_id=?)
      AND id IN (${categoryIds.map(() => '?').join(',')})`).all(accountId, ...categoryIds);
    if (validCategories.length !== categoryIds.length) throw new EngineError('CATEGORY_NOT_AVAILABLE', 'CATEGORY NOT READY', { category: 'validation' });

    const intent = { accountId, language, region, categoryIds, teams: teams.map((team) => String(team.display_name).trim()) };
    return this.#idempotent(accountId, 'create_game', request.idempotency_key, intent, () => inTransaction(this.db, () => {
      const now = this.now();
      const gameId = this.id('game');
      const hostToken = this.id('host');
      const displayToken = this.id('display');
      this.db.prepare(`INSERT INTO accounts(id, display_name, created_at) VALUES (?, ?, ?)
        ON CONFLICT(id) DO NOTHING`).run(accountId, request.account_display_name ?? 'Guess Machine Account', now);
      this.db.prepare(`INSERT INTO games(id, account_id, group_id, language, region, game_mode, status, host_token, display_token, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`).run(
          gameId, accountId, request.group_id ?? null, language, region, request.game_mode ?? 'classic_100_200_300', hostToken, displayToken, now, now,
        );
      const teamViews = teams.map((team, index) => ({ team_id: this.id('team'), display_name: String(team.display_name).trim(), score: 0, turn_state: index === 0 ? 'active' : 'waiting' }));
      for (const [index, team] of teamViews.entries()) {
        this.db.prepare('INSERT INTO teams(id, game_id, display_name, score, turn_order) VALUES (?, ?, ?, 0, ?)')
          .run(team.team_id, gameId, team.display_name, index);
      }
      this.db.prepare('UPDATE games SET active_team_id=? WHERE id=?').run(teamViews[0].team_id, gameId);
      categoryIds.forEach((categoryId, index) => this.db.prepare('INSERT INTO game_categories(game_id, category_id, position) VALUES (?, ?, ?)').run(gameId, categoryId, index));
      return { game_id: gameId, status: 'draft', preparation_required: true, state_version: 1, host_token: hostToken, display_token: displayToken, teams: teamViews };
    }));
  }

  prepareGame(gameId, token, request) {
    const { game } = this.#authorize(gameId, token, 'host');
    let preparationStarted = false;
    try {
      return this.#idempotent(gameId, 'prepare_game', request.idempotency_key, { gameId }, () => {
        const current = this.#game(gameId);
        this.#checkVersion(current, request.expected_state_version);
        if (current.status === 'completed' || current.status === 'abandoned') throw new EngineError('GAME_ALREADY_COMPLETED', 'GAME ALREADY FINISHED', { category: 'runtime_state', status: 409 });
        preparationStarted = true;
        this.db.prepare("UPDATE games SET status='preparing', state_version=state_version+1, updated_at=? WHERE id=?").run(this.now(), gameId);
        const categories = this.db.prepare('SELECT category_id FROM game_categories WHERE game_id=? ORDER BY position').all(gameId).map((row) => row.category_id);
        const exclusions = this.db.prepare('SELECT DISTINCT fact_id FROM exposures WHERE account_id=?').all(current.account_id).map((row) => row.fact_id);
        const assembled = assembleGamePackage(this.db, { gameId, categoryIds: categories, language: game.language, excludeFactIds: exclusions, now: this.now() });
        this.db.prepare("UPDATE games SET status='ready', state_version=state_version+1, updated_at=?, failure_code=NULL WHERE id=?").run(this.now(), gameId);
        const ready = this.#game(gameId);
        return { game_id: gameId, package_id: assembled.packageId, state: 'ready', progress_stage: 'ready', state_version: ready.state_version };
      });
    } catch (error) {
      if (preparationStarted) {
        this.db.prepare("UPDATE games SET status='failed', state_version=state_version+1, updated_at=?, failure_code=? WHERE id=?")
          .run(this.now(), error.code ?? 'PREPARATION_FAILED', gameId);
      }
      throw error;
    }
  }

  getPreparation(gameId, token) {
    const { game } = this.#authorize(gameId, token);
    const pkg = this.db.prepare('SELECT id, status, ready_at, expires_at, failure_code FROM game_packages WHERE game_id=?').get(gameId);
    return { game_id: gameId, package_id: pkg?.id ?? null, state: game.status, progress_stage: game.status === 'ready' ? 'ready' : game.status, failure_code: game.failure_code, state_version: game.state_version };
  }

  getBoard(gameId, token) {
    const { game } = this.#authorize(gameId, token);
    const teams = this.db.prepare('SELECT id, display_name, score, turn_order FROM teams WHERE game_id=? ORDER BY turn_order').all(gameId)
      .map((team) => ({ team_id: team.id, display_name: team.display_name, score: team.score, turn_state: team.id === game.active_team_id ? 'active' : 'waiting' }));
    const categories = this.db.prepare(`SELECT c.id, c.name_en, c.name_ar, gc.position FROM game_categories gc
      JOIN categories c ON c.id=gc.category_id WHERE gc.game_id=? ORDER BY gc.position`).all(gameId).map((category) => {
        const slots = this.db.prepare(`SELECT gs.difficulty, gs.status FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
          WHERE gp.game_id=? AND gs.category_id=? ORDER BY difficulty`).all(gameId, category.id);
        return {
          category_id: category.id,
          display_name: game.language === 'ar' ? category.name_ar : category.name_en,
          selected: game.selected_category_id === category.id,
          difficulties: slots.map((slot) => ({ level: slot.difficulty, status: slot.status === 'available' ? 'available' : slot.status === 'active' || slot.status === 'revealed' ? 'selected' : slot.status === 'used' || slot.status === 'voided' ? 'used' : 'disabled' })),
        };
      });
    const activeSlot = this.db.prepare(`SELECT gs.id, gs.category_id, gs.difficulty, gs.status FROM game_slots gs
      JOIN game_packages gp ON gp.id=gs.package_id WHERE gp.game_id=? AND gs.status IN ('active','revealed') LIMIT 1`).get(gameId);
    return {
      game_id: gameId,
      language: game.language,
      direction: game.language === 'ar' ? 'rtl' : 'ltr',
      active_team_id: game.active_team_id,
      selected_category_id: game.selected_category_id,
      categories,
      game_status: game.status,
      teams,
      active_slot_summary: activeSlot ? { slot_id: activeSlot.id, category_id: activeSlot.category_id, difficulty: activeSlot.difficulty, state: activeSlot.status } : null,
      state_version: game.state_version,
    };
  }

  selectCategory(gameId, token, request) {
    const { game } = this.#authorize(gameId, token, 'host');
    return this.#idempotent(gameId, 'select_category', request.idempotency_key, { categoryId: request.category_id, teamId: request.acting_team_id }, () => inTransaction(this.db, () => {
      this.#checkVersion(this.#game(gameId), request.expected_state_version);
      if (!['ready', 'active'].includes(game.status)) throw new EngineError('GAME_NOT_READY', 'MACHINE NOT READY', { category: 'runtime_state', status: 409 });
      if (request.acting_team_id !== game.active_team_id) throw new EngineError('INVALID_TURN', 'NOT THIS TEAM’S TURN', { category: 'runtime_state', status: 409 });
      const available = this.db.prepare(`SELECT COUNT(*) count FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
        WHERE gp.game_id=? AND gs.category_id=? AND gs.status='available'`).get(gameId, request.category_id).count;
      if (!available) throw new EngineError('CATEGORY_NOT_AVAILABLE', 'CATEGORY NOT READY', { category: 'runtime_state', status: 409 });
      this.db.prepare('UPDATE games SET selected_category_id=?, state_version=state_version+1, updated_at=? WHERE id=?').run(request.category_id, this.now(), gameId);
      const updated = this.#game(gameId);
      return { game_id: gameId, selected_category_id: request.category_id, valid_difficulties: this.db.prepare(`SELECT difficulty FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
        WHERE gp.game_id=? AND gs.category_id=? AND gs.status='available' ORDER BY difficulty`).all(gameId, request.category_id).map((row) => row.difficulty), state_version: updated.state_version };
    }));
  }

  activateSlot(gameId, token, request) {
    const { game } = this.#authorize(gameId, token, 'host');
    return this.#idempotent(gameId, 'activate_slot', request.idempotency_key, { categoryId: request.category_id, difficulty: request.difficulty, teamId: request.team_id }, () => inTransaction(this.db, () => {
      const current = this.#game(gameId);
      this.#checkVersion(current, request.expected_state_version);
      if (!['ready', 'active'].includes(current.status)) throw new EngineError('GAME_NOT_READY', 'MACHINE NOT READY', { category: 'runtime_state', status: 409 });
      if (current.active_team_id !== request.team_id) throw new EngineError('INVALID_TURN', 'NOT THIS TEAM’S TURN', { category: 'runtime_state', status: 409 });
      if (current.selected_category_id && current.selected_category_id !== request.category_id) throw new EngineError('CATEGORY_NOT_AVAILABLE', 'SELECTED CATEGORY CHANGED', { category: 'runtime_state', status: 409 });
      const active = this.db.prepare(`SELECT gs.id FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
        WHERE gp.game_id=? AND gs.status IN ('active','revealed') LIMIT 1`).get(gameId);
      if (active) throw new EngineError('SLOT_ALREADY_ACTIVE', 'A QUESTION IS ALREADY ACTIVE', { category: 'conflict', status: 409 });
      const slot = this.db.prepare(`SELECT gs.*, gp.expires_at package_expires_at FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
        WHERE gp.game_id=? AND gp.status='ready' AND gs.category_id=? AND gs.difficulty=?`).get(gameId, request.category_id, request.difficulty);
      if (!slot) throw new EngineError('CATEGORY_NOT_AVAILABLE', 'SLOT NOT AVAILABLE', { category: 'runtime_state', status: 409 });
      if (slot.status !== 'available') throw new EngineError('DIFFICULTY_ALREADY_USED', 'SLOT ALREADY USED', { category: 'runtime_state', status: 409 });
      if (slot.package_expires_at && slot.package_expires_at <= this.now()) {
        throw new EngineError('PACKAGE_EXPIRED', 'PREPARED GAME HAS EXPIRED', { category: 'runtime_state', status: 409 });
      }
      const bank = new QuestionBank(this.db);
      const primaryEligible = slot.primary_available === 1 && bank.isEligibleReference({
        factId: slot.primary_fact_id,
        questionId: slot.primary_question_id,
        variantId: slot.primary_variant_id,
        language: slot.primary_language_snapshot,
        asOf: this.now(),
      });
      const fallbackEligible = slot.fallback_available === 1 && bank.isEligibleReference({
        factId: slot.fallback_fact_id,
        questionId: slot.fallback_question_id,
        variantId: slot.fallback_variant_id,
        language: slot.fallback_language_snapshot,
        asOf: this.now(),
      });
      const usePrimary = primaryEligible;
      if (!usePrimary && !fallbackEligible) throw new EngineError('QUESTION_UNAVAILABLE', 'MACHINE COULD NOT LOAD THIS QUESTION', { category: 'runtime_state', status: 409 });
      const prefix = usePrimary ? 'primary' : 'fallback';
      const served = {
        factId: slot[`${prefix}_fact_id`], questionId: slot[`${prefix}_question_id`], variantId: slot[`${prefix}_variant_id`],
        question: slot[`${prefix}_question_snapshot`], answer: slot[`${prefix}_answer_snapshot`], explanation: slot[`${prefix}_explanation_snapshot`], language: slot[`${prefix}_language_snapshot`],
      };
      const now = this.now();
      this.db.prepare(`UPDATE game_slots SET status='active', selected_team_id=?, served_fact_id=?, served_question_id=?, served_variant_id=?,
        served_question_snapshot=?, served_answer_snapshot=?, served_explanation_snapshot=?, served_language_snapshot=?, served_source=?, fallback_reason=?, activated_at=? WHERE id=?`)
        .run(request.team_id, served.factId, served.questionId, served.variantId, served.question, served.answer, served.explanation, served.language, prefix, usePrimary ? null : 'primary_ineligible_or_unavailable', now, slot.id);
      this.db.prepare("UPDATE games SET status='active', selected_category_id=?, state_version=state_version+1, updated_at=? WHERE id=?").run(request.category_id, now, gameId);
      const updated = this.#game(gameId);
      this.db.prepare(`INSERT INTO exposures(
        id, account_id, group_id, game_id, slot_id, category_id, difficulty,
        fact_id, question_id, variant_id, served_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(this.id('exposure'), current.account_id, current.group_id, gameId, slot.id, slot.category_id, slot.difficulty,
          served.factId, served.questionId, served.variantId, now);
      this.db.prepare(`INSERT INTO game_events(id, game_id, slot_id, event_type, state_version, payload_json, occurred_at)
        VALUES (?, ?, ?, 'question_exposed', ?, ?, ?)`)
        .run(this.id('event'), gameId, slot.id, updated.state_version, JSON.stringify({ served_source: prefix, fallback_reason: usePrimary ? null : 'primary_ineligible_or_unavailable' }), now);
      return this.#activeQuestionView(updated, { ...slot, id: slot.id, status: 'active', served_question_snapshot: served.question, served_language_snapshot: served.language, activated_at: now });
    }));
  }

  #activeQuestionView(game, slot) {
    const category = this.db.prepare('SELECT id, name_en, name_ar FROM categories WHERE id=?').get(slot.category_id);
    return {
      game_id: game.id,
      slot_id: slot.id,
      category: { category_id: category.id, display_name: game.language === 'ar' ? category.name_ar : category.name_en },
      difficulty: slot.difficulty,
      question_text: slot.served_question_snapshot,
      format: 'text',
      presentation_metadata: { language: slot.served_language_snapshot, direction: slot.served_language_snapshot === 'ar' ? 'rtl' : 'ltr' },
      state: slot.status,
      served_at: slot.activated_at,
      state_version: game.state_version,
    };
  }

  getActiveQuestion(gameId, token) {
    const { game } = this.#authorize(gameId, token);
    const slot = this.db.prepare(`SELECT gs.* FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=? AND gs.status IN ('active','revealed') LIMIT 1`).get(gameId);
    if (!slot) return null;
    return this.#activeQuestionView(game, slot);
  }

  revealAnswer(gameId, token, request) {
    const { game } = this.#authorize(gameId, token, 'host');
    return this.#idempotent(gameId, 'reveal_answer', request.idempotency_key, { slotId: request.slot_id }, () => inTransaction(this.db, () => {
      this.#checkVersion(this.#game(gameId), request.expected_state_version);
      const slot = this.db.prepare(`SELECT gs.* FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id WHERE gp.game_id=? AND gs.id=?`).get(gameId, request.slot_id);
      if (!slot || slot.status !== 'active') throw new EngineError('SLOT_NOT_ACTIVE', 'QUESTION IS NOT ACTIVE', { category: 'runtime_state', status: 409 });
      const now = this.now();
      this.db.prepare("UPDATE game_slots SET status='revealed', revealed_at=? WHERE id=?").run(now, slot.id);
      this.db.prepare('UPDATE games SET state_version=state_version+1, updated_at=? WHERE id=?').run(now, gameId);
      const updated = this.#game(gameId);
      const answers = this.db.prepare('SELECT answer_text FROM accepted_answers WHERE question_id=? AND language=? ORDER BY id').all(slot.served_question_id, slot.served_language_snapshot).map((row) => row.answer_text);
      return { slot_id: slot.id, answer_display: slot.served_answer_snapshot, accepted_answers: answers, explanation: slot.served_explanation_snapshot, state: 'revealed', permitted_actions: [...ALLOWED_OUTCOMES], state_version: updated.state_version };
    }));
  }

  recordOutcome(gameId, token, request) {
    const { game } = this.#authorize(gameId, token, 'host');
    if (!ALLOWED_OUTCOMES.has(request.outcome)) throw new EngineError('INVALID_OUTCOME', 'INVALID OUTCOME', { category: 'validation' });
    if (request.response_time_ms !== undefined && (!Number.isInteger(request.response_time_ms) || request.response_time_ms < 0 || request.response_time_ms > 86_400_000)) {
      throw new EngineError('INVALID_RESPONSE_TIME', 'INVALID RESPONSE TIME', { category: 'validation' });
    }
    for (const value of [request.dispute_note, request.technical_failure]) {
      if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 1000)) {
        throw new EngineError('INVALID_OUTCOME_CONTEXT', 'INVALID OUTCOME CONTEXT', { category: 'validation' });
      }
    }
    const outcomeIntent = {
      slotId: request.slot_id,
      teamId: request.team_id,
      outcome: request.outcome,
      responseTimeMs: request.response_time_ms ?? null,
      hostOverride: Boolean(request.host_override),
      disputeNote: request.dispute_note ?? null,
      technicalFailure: request.technical_failure ?? null,
    };
    return this.#idempotent(gameId, 'record_outcome', request.idempotency_key, outcomeIntent, () => inTransaction(this.db, () => {
      this.#checkVersion(this.#game(gameId), request.expected_state_version);
      const slot = this.db.prepare(`SELECT gs.* FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id WHERE gp.game_id=? AND gs.id=?`).get(gameId, request.slot_id);
      if (!slot || slot.status !== 'revealed') throw new EngineError('SLOT_NOT_REVEALED', 'REVEAL THE ANSWER FIRST', { category: 'runtime_state', status: 409 });
      if (slot.selected_team_id !== request.team_id) throw new EngineError('INVALID_TURN', 'OUTCOME TEAM DOES NOT MATCH', { category: 'runtime_state', status: 409 });
      const scoreDelta = request.outcome === 'correct' ? slot.difficulty : 0;
      const now = this.now();
      this.db.prepare(`INSERT INTO outcomes(
        id, account_id, game_id, slot_id, team_id, category_id, difficulty,
        fact_id, question_id, variant_id, outcome, score_delta, response_time_ms,
        host_override, dispute_note, technical_failure, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(this.id('outcome'), game.account_id, gameId, slot.id, request.team_id, slot.category_id, slot.difficulty,
          slot.served_fact_id, slot.served_question_id, slot.served_variant_id, request.outcome, scoreDelta,
          request.response_time_ms ?? null, request.host_override ? 1 : 0, request.dispute_note ?? null,
          request.technical_failure ?? null, now);
      this.db.prepare('UPDATE teams SET score=score+? WHERE id=? AND game_id=?').run(scoreDelta, request.team_id, gameId);
      this.db.prepare("UPDATE game_slots SET status=?, completed_at=? WHERE id=?").run(request.outcome === 'voided' ? 'voided' : 'used', now, slot.id);
      const teams = this.db.prepare('SELECT id, turn_order FROM teams WHERE game_id=? ORDER BY turn_order').all(gameId);
      const currentIndex = teams.findIndex((team) => team.id === request.team_id);
      const nextTeamId = teams[(currentIndex + 1) % teams.length].id;
      const remaining = this.db.prepare(`SELECT COUNT(*) count FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
        WHERE gp.game_id=? AND gs.status='available'`).get(gameId).count;
      const gameStatus = remaining === 0 ? 'completed' : 'ready';
      this.db.prepare(`UPDATE games SET status=?, active_team_id=?, selected_category_id=NULL, state_version=state_version+1,
        updated_at=?, completed_at=? WHERE id=?`).run(gameStatus, nextTeamId, now, gameStatus === 'completed' ? now : null, gameId);
      const updated = this.#game(gameId);
      this.db.prepare(`INSERT INTO game_events(id, game_id, slot_id, event_type, state_version, payload_json, occurred_at)
        VALUES (?, ?, ?, 'outcome_recorded', ?, ?, ?)`)
        .run(this.id('event'), gameId, slot.id, updated.state_version, JSON.stringify({ outcome: request.outcome, score_delta: scoreDelta }), now);
      return { slot_id: slot.id, slot_state: request.outcome === 'voided' ? 'voided' : 'used', outcome: request.outcome, score_delta: scoreDelta,
        teams: this.db.prepare('SELECT id team_id, display_name, score FROM teams WHERE game_id=? ORDER BY turn_order').all(gameId).map((team) => ({ ...team })),
        active_team_id: updated.active_team_id, game_status: updated.status, state_version: updated.state_version };
    }));
  }

  completeGame(gameId, token, request) {
    const { game } = this.#authorize(gameId, token, 'host');
    return this.#idempotent(gameId, 'complete_game', request.idempotency_key, { gameId }, () => inTransaction(this.db, () => {
      const current = this.#game(gameId);
      this.#checkVersion(current, request.expected_state_version);
      if (['completed', 'abandoned'].includes(current.status)) throw new EngineError('GAME_ALREADY_COMPLETED', 'GAME ALREADY FINISHED', { category: 'runtime_state', status: 409 });
      const active = this.db.prepare(`SELECT COUNT(*) count FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
        WHERE gp.game_id=? AND gs.status IN ('active','revealed')`).get(gameId).count;
      if (active) throw new EngineError('SLOT_ALREADY_ACTIVE', 'RESOLVE ACTIVE QUESTION FIRST', { category: 'runtime_state', status: 409 });
      const now = this.now();
      this.db.prepare("UPDATE games SET status='completed', state_version=state_version+1, updated_at=?, completed_at=? WHERE id=?").run(now, now, gameId);
      const updated = this.#game(gameId);
      return { game_id: gameId, completion_status: 'completed', teams: this.db.prepare('SELECT id team_id, display_name, score FROM teams WHERE game_id=? ORDER BY turn_order').all(gameId).map((team) => ({ ...team })), state_version: updated.state_version };
    }));
  }

  abandonGame(gameId, token, request) {
    const { game } = this.#authorize(gameId, token, 'host');
    return this.#idempotent(gameId, 'abandon_game', request.idempotency_key, { reason: request.reason ?? null }, () => inTransaction(this.db, () => {
      const current = this.#game(gameId);
      this.#checkVersion(current, request.expected_state_version);
      if (['completed', 'abandoned'].includes(current.status)) throw new EngineError('GAME_ALREADY_COMPLETED', 'GAME ALREADY FINISHED', { category: 'runtime_state', status: 409 });
      const now = this.now();
      this.db.prepare("UPDATE games SET status='abandoned', state_version=state_version+1, updated_at=?, completed_at=? WHERE id=?").run(now, now, gameId);
      return { game_id: gameId, status: 'abandoned', state_version: this.#game(gameId).state_version };
    }));
  }

  readGameState(gameId, token) {
    const auth = this.#authorize(gameId, token);
    return { board: this.getBoard(gameId, token), active_question: this.getActiveQuestion(gameId, token), role: auth.role };
  }
}
