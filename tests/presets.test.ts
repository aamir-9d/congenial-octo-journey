/**
 * Cohort preset checks.
 *
 * The presets are new UI over a validated model, which is exactly where a
 * plausible-looking wrong number can creep in: someone edits a preset, the page
 * still builds, the card still reads "day 277", and the figure is quietly a lie.
 *
 * So nothing here is a hand-written expectation except the three the brief
 * specifies. Everything else is computed from calc-model.ts — the same source
 * the chart draws from.
 *
 * Requires `npm run build` for the rendered checks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { PRESETS, presetBreakeven } from '../src/data/presets.ts';
import { INITIAL_STATE, computeView } from '../src/scripts/calc-model.ts';

const DIST = path.resolve(import.meta.dirname, '..', 'dist', 'index.html');
const built = fs.existsSync(DIST);
const skip = !built && 'run `npm run build` first';
const html = built ? fs.readFileSync(DIST, 'utf8') : '';

test('the three presets produce the breakevens the brief specifies', () => {
  const actual = Object.fromEntries(PRESETS.map((p) => [p.key, presetBreakeven(p)]));

  assert.equal(actual.conservative, 'never');
  assert.equal(actual.typical, 'day 277');
  assert.equal(actual.aggressive, 'day 37');
});

test('Typical is the repo INITIAL_STATE, not a copy of its numbers', () => {
  const typical = PRESETS.find((p) => p.key === 'typical')!;

  // Identity, not equality by eye. If INITIAL_STATE ever moves, Typical moves
  // with it and the day-277 assertion above catches the consequence.
  for (const [key, value] of Object.entries(typical.state)) {
    assert.equal(
      value,
      INITIAL_STATE[key as keyof typeof INITIAL_STATE],
      `Typical.${key} has drifted from INITIAL_STATE`,
    );
  }

  // And the default page state must therefore be the Typical cohort.
  assert.equal(computeView(INITIAL_STATE).tileTrue, 'day 277');
});

test('each preset varies only the five funnel fields', () => {
  const allowed = new Set(['i2t', 't2p', 'price', 'retention', 'cpi']);

  for (const p of PRESETS) {
    for (const key of Object.keys(p.state)) {
      assert.ok(allowed.has(key), `${p.label} sets "${key}", which no preset should touch`);
    }
    assert.equal(Object.keys(p.state).length, 5, `${p.label} does not set all five fields`);
  }
});

test('the presets are ordered worst to best, and each is distinct', () => {
  const days = PRESETS.map((p) => {
    const label = presetBreakeven(p);
    return label === 'never' ? Infinity : Number(label.replace('day ', ''));
  });

  const sorted = [...days].sort((a, b) => b - a);
  assert.deepEqual(days, sorted, 'presets are not ordered from slowest payback to fastest');
  assert.equal(new Set(days).size, days.length, 'two presets produce the same breakeven');
});

test('every preset renders, with the figure the model computes', { skip }, () => {
  const buttons = [...html.matchAll(/<button[^>]*data-preset="([a-z]+)"[\s\S]*?<\/button>/g)];
  assert.equal(buttons.length, PRESETS.length, 'not every preset rendered');

  for (const [markup, key] of buttons) {
    const preset = PRESETS.find((p) => p.key === key);
    assert.ok(preset, `rendered an unknown preset: ${key}`);

    const text = markup!.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    assert.ok(
      text.includes(presetBreakeven(preset!)),
      `${key} shows a breakeven the model does not produce`,
    );
    assert.ok(text.includes(preset!.label), `${key} is missing its label`);
  }

  // Exactly one lit on load, and it is the one matching the default state.
  const pressed = [...html.matchAll(/data-preset="([a-z]+)"[^>]*aria-pressed="true"/g)];
  assert.equal(pressed.length, 1, 'expected exactly one preset selected on load');
  assert.equal(pressed[0]![1], 'typical');
});

test('the presets are subscription-only', { skip }, () => {
  // The ad model has no trial funnel, so a preset over it would be meaningless.
  assert.match(html, /class="calc__presets"[^>]*data-when="isSub"/);
});
