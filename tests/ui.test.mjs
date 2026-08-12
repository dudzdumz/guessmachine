import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('UI keeps the all-visible category grid and one shared 100/200/300 dial', async () => {
  const [html, css, js] = await Promise.all([
    readFile(new URL('../public/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../public/app.js', import.meta.url), 'utf8'),
  ]);
  assert.match(html, /id="category-grid"/);
  assert.match(html, /id="dial-control"/);
  assert.match(html, />100</);
  assert.match(html, />200</);
  assert.match(html, />300</);
  assert.match(css, /grid-template-columns: repeat\(4/);
  assert.match(css, /deep|aubergine|--aubergine/);
  assert.doesNotMatch(html + css + js, /carousel/i);
});

test('dial engagement calls prepared slot activation, never generation', async () => {
  const js = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  assert.match(js, /\/activate/);
  assert.doesNotMatch(js, /generate|openai|searchProvider|reasoningProvider/i);
  assert.match(js, /keydown/);
  assert.match(js, /difficulty-direct/);
});
