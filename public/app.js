const $ = (selector) => document.querySelector(selector);
const state = {
  language: 'ar', gameId: null, hostToken: null, displayToken: null, board: null,
  selectedCategory: null, difficulty: null, activeQuestion: null, sound: false,
};

const copy = {
  ar: { standby: 'في وضع الاستعداد', preparing: 'الماكينة تجهّز الأسئلة', ready: 'GAME READY — جاهزة للعب', choose: 'اختر فئة أولاً', chooseHint: 'المقبض نائم حتى تختاروا مجال السؤال.', turn: 'الدور الآن:', reveal: 'اكشف الإجابة', answer: 'الإجابة', newGame: 'لعبة جديدة', start: 'ابدأ التجهيز', noCategory: 'NO CATEGORY' },
  en: { standby: 'STANDBY', preparing: 'THE MACHINE IS PREPARING', ready: 'GAME READY', choose: 'Choose a category first', chooseHint: 'The dial stays dormant until a category is selected.', turn: 'Current turn:', reveal: 'Reveal answer', answer: 'Answer', newGame: 'New game', start: 'Prepare game', noCategory: 'NO CATEGORY' },
};

function idempotency(prefix) { return `${prefix}-${crypto.randomUUID()}`; }
function accountId() {
  let value = localStorage.getItem('guess-machine-account');
  if (!value) { value = `acct_${crypto.randomUUID()}`; localStorage.setItem('guess-machine-account', value); }
  return value;
}

async function api(path, { method = 'GET', body, token = state.hostToken } = {}) {
  const response = await fetch(path, { method, headers: { ...(token ? { 'x-game-token': token } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(data.user_safe_message ?? data.code ?? 'MACHINE ERROR');
  return data;
}

function setLanguage(language) {
  state.language = language;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-language]').forEach((button) => button.classList.toggle('active', button.dataset.language === language));
  $('#start-game span').textContent = copy[language].start;
  $('#new-game').textContent = copy[language].newGame;
}

function status(text, ready = false) {
  $('#machine-status-text').textContent = text;
  document.body.classList.toggle('ready', ready);
}

function toast(message) {
  const element = $('#toast'); element.textContent = message; element.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 2200);
}

function playThump(level = 200) {
  if (!state.sound) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = level === 300 ? 'sine' : 'triangle';
  oscillator.frequency.setValueAtTime(level === 100 ? 105 : level === 200 ? 78 : 52, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(35, context.currentTime + .16);
  gain.gain.setValueAtTime(.18, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .2);
  oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .21);
  oscillator.addEventListener('ended', () => context.close());
}

function selectedCategoryView() { return state.board?.categories.find((category) => category.category_id === state.selectedCategory); }
function available(level) { return selectedCategoryView()?.difficulties.find((item) => item.level === level)?.status === 'available'; }

function renderScores() {
  $('#score-rail').replaceChildren(...state.board.teams.map((team) => {
    const element = document.createElement('div');
    element.className = `team-score ${team.team_id === state.board.active_team_id ? 'active' : ''}`;
    const name = document.createElement('span'); name.textContent = team.display_name;
    const score = document.createElement('strong'); score.textContent = team.score;
    element.append(name, score); return element;
  }));
  const current = state.board.teams.find((team) => team.team_id === state.board.active_team_id);
  $('#turn-copy').textContent = `${copy[state.language].turn} ${current?.display_name ?? ''}`;
}

function renderCategories() {
  $('#category-grid').replaceChildren(...state.board.categories.map((category, index) => {
    const card = document.createElement('button');
    const exhausted = category.difficulties.every((item) => item.status !== 'available');
    card.type = 'button'; card.className = `category-card ${category.category_id === state.selectedCategory ? 'active' : ''} ${exhausted ? 'exhausted' : ''}`;
    card.dataset.index = String(index + 1).padStart(2, '0'); card.disabled = exhausted;
    card.setAttribute('aria-pressed', category.category_id === state.selectedCategory ? 'true' : 'false');
    card.setAttribute('aria-label', `${category.display_name}: ${category.difficulties.map((d) => `${d.level} ${d.status}`).join(', ')}`);
    const code = document.createElement('small'); code.textContent = `CATEGORY / ${String(index + 1).padStart(2, '0')}`;
    const title = document.createElement('strong'); title.textContent = category.display_name;
    const lights = document.createElement('div'); lights.className = 'slot-lights';
    for (const item of category.difficulties) {
      const light = document.createElement('span'); light.className = `slot-light ${item.status}`;
      const dot = document.createElement('i'); const label = document.createElement('span'); label.textContent = item.level;
      light.append(dot, label); lights.append(light);
    }
    card.append(code, title, lights); card.addEventListener('click', () => selectCategory(category.category_id)); return card;
  }));
}

function renderDial() {
  const category = selectedCategoryView();
  const awake = Boolean(category);
  $('#dial-control').classList.toggle('dormant', !awake);
  $('#dial-heading').textContent = category?.display_name ?? copy[state.language].choose;
  $('#dial-instruction').textContent = category ? (state.language === 'ar' ? 'لفّ المقبض إلى القيمة ثم اضغط لتشغيل السؤال.' : 'Turn to a value, then press to feed the question.') : copy[state.language].chooseHint;
  $('#readout-category').textContent = category?.display_name ?? copy[state.language].noCategory;
  $('#readout-value').textContent = state.difficulty ?? '—';
  const angle = state.difficulty === 100 ? -58 : state.difficulty === 200 ? 0 : state.difficulty === 300 ? 58 : -90;
  $('#dial').style.setProperty('--dial-angle', `${angle}deg`);
  $('#dial-press').disabled = !awake || !state.difficulty || !available(state.difficulty);
  $('#difficulty-direct').replaceChildren(...[100, 200, 300].map((level) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = level;
    button.disabled = !awake || !available(level); button.classList.toggle('active', state.difficulty === level);
    button.addEventListener('click', () => chooseDifficulty(level)); return button;
  }));
}

function renderBoard() { renderScores(); renderCategories(); renderDial(); }

async function refreshBoard() {
  state.board = await api(`/api/games/${state.gameId}/board`, { token: state.displayToken });
  renderBoard();
}

async function selectCategory(categoryId) {
  try {
    const result = await api(`/api/games/${state.gameId}/select-category`, { method: 'POST', body: { category_id: categoryId, acting_team_id: state.board.active_team_id, expected_state_version: state.board.state_version, idempotency_key: idempotency('select') } });
    state.selectedCategory = result.selected_category_id; state.difficulty = null; await refreshBoard();
  } catch (error) { toast(error.message); await refreshBoard(); }
}

function chooseDifficulty(level) {
  if (!available(level)) { toast(state.language === 'ar' ? 'هذه القيمة استُخدمت' : 'That value is already used'); return; }
  state.difficulty = level; renderDial();
  if (navigator.vibrate) navigator.vibrate(level === 100 ? 18 : level === 200 ? 30 : 45);
  if (state.sound) playThump(level === 300 ? 200 : 100);
}

async function engage() {
  if (!state.selectedCategory || !state.difficulty) return;
  $('#dial-press').disabled = true; document.body.classList.add('engaging'); playThump(state.difficulty);
  if (navigator.vibrate) navigator.vibrate(state.difficulty === 300 ? [25, 20, 45] : 30);
  try {
    const active = await api(`/api/games/${state.gameId}/activate`, { method: 'POST', body: { category_id: state.selectedCategory, difficulty: state.difficulty, team_id: state.board.active_team_id, expected_state_version: state.board.state_version, idempotency_key: idempotency('activate') } });
    state.activeQuestion = active; setTimeout(() => showQuestion(active), 260);
  } catch (error) { toast(error.message); await refreshBoard(); }
  finally { setTimeout(() => document.body.classList.remove('engaging'), 400); }
}

function showQuestion(active) {
  $('#question-category').textContent = active.category.display_name;
  $('#question-value').textContent = active.difficulty;
  $('#question-text').textContent = active.question_text;
  $('#answer-panel').classList.add('hidden'); $('#outcome-actions').classList.add('hidden'); $('#reveal-answer').classList.remove('hidden');
  $('#question-stage').classList.remove('hidden');
}

async function revealAnswer() {
  try {
    const answer = await api(`/api/games/${state.gameId}/reveal`, { method: 'POST', body: { slot_id: state.activeQuestion.slot_id, expected_state_version: state.activeQuestion.state_version, idempotency_key: idempotency('reveal') } });
    state.answer = answer; $('#answer-text').textContent = answer.answer_display; $('#answer-explanation').textContent = answer.explanation ?? '';
    $('#answer-panel').classList.remove('hidden'); $('#outcome-actions').classList.remove('hidden'); $('#reveal-answer').classList.add('hidden');
  } catch (error) { toast(error.message); }
}

async function recordOutcome(outcome) {
  const teamId = state.board.active_team_id;
  document.querySelectorAll('#outcome-actions button').forEach((button) => { button.disabled = true; });
  try {
    await api(`/api/games/${state.gameId}/outcomes`, { method: 'POST', body: { slot_id: state.activeQuestion.slot_id, team_id: teamId, outcome, expected_state_version: state.answer.state_version, idempotency_key: idempotency('outcome') } });
    $('#question-stage').classList.add('hidden'); state.activeQuestion = null; state.answer = null; state.selectedCategory = null; state.difficulty = null;
    document.body.classList.add('resetting'); await refreshBoard(); setTimeout(() => document.body.classList.remove('resetting'), 800);
    if (state.board.game_status === 'completed') { status(state.language === 'ar' ? 'اكتملت اللعبة' : 'GAME COMPLETE', true); $('#new-game').classList.remove('hidden'); }
  } catch (error) { toast(error.message); }
  finally { document.querySelectorAll('#outcome-actions button').forEach((button) => { button.disabled = false; }); }
}

async function startGame() {
  const button = $('#start-game'); button.disabled = true; $('#setup-error').textContent = '';
  status(copy[state.language].preparing);
  try {
    const created = await api('/api/games', { method: 'POST', token: null, body: {
      account_id: accountId(), language: state.language, region: 'OM', game_mode: 'classic_100_200_300', idempotency_key: idempotency('create'),
      teams: [{ display_name: $('#team-one').value.trim() }, { display_name: $('#team-two').value.trim() }],
      selected_category_ids: ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'],
    } });
    Object.assign(state, { gameId: created.game_id, hostToken: created.host_token, displayToken: created.display_token });
    await api(`/api/games/${state.gameId}/prepare`, { method: 'POST', body: { expected_state_version: created.state_version, idempotency_key: idempotency('prepare') } });
    await refreshBoard(); $('#setup').classList.add('hidden'); $('#game').classList.remove('hidden'); status(copy[state.language].ready, true);
  } catch (error) { $('#setup-error').textContent = error.message; status(copy[state.language].standby); }
  finally { button.disabled = false; }
}

function dialFromPointer(event) {
  if (!state.selectedCategory) return;
  const rect = $('#dial').getBoundingClientRect();
  const angle = Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI + 90;
  const normalized = ((angle + 180) % 360) - 180;
  chooseDifficulty(normalized < -25 ? 100 : normalized > 25 ? 300 : 200);
}

document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
$('#start-game').addEventListener('click', startGame);
$('#dial-press').addEventListener('click', engage);
$('#reveal-answer').addEventListener('click', revealAnswer);
$('#outcome-actions').addEventListener('click', (event) => { const outcome = event.target.closest('[data-outcome]')?.dataset.outcome; if (outcome) recordOutcome(outcome); });
$('#sound-toggle').addEventListener('click', (event) => { state.sound = !state.sound; event.currentTarget.setAttribute('aria-pressed', String(state.sound)); if (state.sound) playThump(100); });
$('#new-game').addEventListener('click', () => location.reload());
$('#dial-control').addEventListener('keydown', (event) => {
  if (!state.selectedCategory) return;
  const availableLevels = [100, 200, 300].filter(available); if (!availableLevels.length) return;
  let index = Math.max(0, availableLevels.indexOf(state.difficulty));
  if (['ArrowRight', 'ArrowUp'].includes(event.key)) index = Math.min(availableLevels.length - 1, index + 1);
  else if (['ArrowLeft', 'ArrowDown'].includes(event.key)) index = Math.max(0, index - 1);
  else if (['Enter', ' '].includes(event.key)) { event.preventDefault(); engage(); return; } else return;
  event.preventDefault(); chooseDifficulty(availableLevels[index]);
});
$('#dial').addEventListener('pointerdown', (event) => { event.currentTarget.setPointerCapture(event.pointerId); dialFromPointer(event); });
$('#dial').addEventListener('pointermove', (event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) dialFromPointer(event); });
setLanguage('ar'); status(copy.ar.standby);
