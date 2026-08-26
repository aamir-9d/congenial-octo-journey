/**
 * The featured case study.
 *
 * This section makes numeric claims about a real client on a marketing page.
 * The failure that matters is not a broken layout — it is a figure that the
 * source data does not support, which is the exact thing this site sells
 * against. So nothing here is a hand-written expectation: every displayed
 * figure is recomputed from the raw period totals and compared.
 *
 * The article and the section are checked against the same source, so the two
 * cannot drift apart either.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { CASE_STUDY, MORE_CASES, RAW } from '../src/data/case-study.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist', 'index.html');
const POST = path.join(ROOT, 'src', 'content', 'blog', `${CASE_STUDY.slug}.md`);

const built = fs.existsSync(DIST);
const skip = !built && 'run `npm run build` first';
const html = built ? fs.readFileSync(DIST, 'utf8') : '';

const per = (w: typeof RAW.before, k: 'cost' | 'installs' | 'trials' | 'paid') => w[k] / w.days;

test('the control really is a control', () => {
  // The whole claim rests on the top of the funnel not having moved. If either
  // of these ever drifts past a few percent, the section's argument is void and
  // the copy has to change, not the threshold.
  const spend = per(RAW.after, 'cost') / per(RAW.before, 'cost') - 1;
  const installs = per(RAW.after, 'installs') / per(RAW.before, 'installs') - 1;

  assert.ok(Math.abs(spend) < 0.05, `daily spend moved ${(spend * 100).toFixed(1)}%, too much to call it held`);
  assert.ok(Math.abs(installs) < 0.05, `daily installs moved ${(installs * 100).toFixed(1)}%`);

  // And the copy has to state the figures it is claiming.
  assert.match(CASE_STUDY.control, /\$651/);
  assert.match(CASE_STUDY.control, /\$665/);
  assert.match(CASE_STUDY.control, /4,283/);
  assert.match(CASE_STUDY.control, /4,293/);
});

test('every displayed figure matches the arithmetic', () => {
  const find = (label: string) => {
    const f = CASE_STUDY.figures.find((x) => x.label === label);
    assert.ok(f, `figure "${label}" is no longer displayed`);
    return f!;
  };

  const i2t = (w: typeof RAW.before) => (w.trials / w.installs) * 100;
  const cpt = (w: typeof RAW.before) => w.cost / w.trials;
  const cpp = (w: typeof RAW.before) => w.cost / w.paid;

  const checks: Array<[string, 'before' | 'after', number, string]> = [
    ['Install → trial', 'before', i2t(RAW.before), '0.62%'],
    ['Install → trial', 'after', i2t(RAW.after), '4.00%'],
    ['Payers per day', 'before', per(RAW.before, 'paid'), '7.0'],
    ['Payers per day', 'after', per(RAW.after, 'paid'), '31.8'],
    ['Cost per trial', 'before', cpt(RAW.before), '$24.61'],
    ['Cost per trial', 'after', cpt(RAW.after), '$3.87'],
    ['Cost per payer', 'before', cpp(RAW.before), '$92.95'],
    ['Cost per payer', 'after', cpp(RAW.after), '$20.91'],
  ];

  for (const [label, side, computed, shown] of checks) {
    assert.equal(find(label)[side], shown, `${label} (${side}) is displayed as something else`);

    // The tolerance is half the last displayed digit: "31.8" is one decimal,
    // so any value that rounds to it is correct. A fixed epsilon would either
    // reject correct rounding or wave through a wrong figure at 2dp.
    const numeric = Number(shown.replace(/[$%,]/g, ''));
    const decimals = shown.split('.')[1]?.replace(/[^0-9]/g, '').length ?? 0;
    const tolerance = 0.5 * 10 ** -decimals;

    assert.ok(
      Math.abs(computed - numeric) <= tolerance,
      `${label} (${side}) shows ${shown} but the totals give ${computed.toFixed(4)}`,
    );
  }
});

test('the caveats that qualify the figures are on the card, not only in the article', () => {
  // A reader who takes only the numbers away should still take the caveat. The
  // trial-to-paid drop and the billing-frequency point are the two that stop
  // the headline figures being read as more than they are.
  const t2p = (w: typeof RAW.before) => (w.paid / w.trials) * 100;

  assert.ok(t2p(RAW.after) < t2p(RAW.before), 'the trial-to-paid drop is no longer real');
  assert.match(CASE_STUDY.caveat, /26\.5%/);
  assert.match(CASE_STUDY.caveat, /18\.5%/);
  assert.match(CASE_STUDY.caveat, /billing frequency/i);
});

test('the section renders, and links to the article that backs it', { skip }, () => {
  assert.match(html, /data-section="case-study"/, 'the case study section did not render');
  assert.ok(html.includes(`/blog/${CASE_STUDY.slug}`), 'the card does not link to the article');

  const article = fs.readFileSync(POST, 'utf8');
  assert.ok(article.length > 3_000, 'the article backing the section is missing or thin');

  // Every figure on the card has to appear in the article too, or the card is
  // making a claim the piece behind it does not substantiate.
  for (const f of CASE_STUDY.figures) {
    for (const value of [f.before, f.after]) {
      if (value.startsWith('~')) continue; // approximations are worded differently in prose
      assert.ok(
        article.includes(value),
        `the card shows ${value} for "${f.label}" but the article never states it`,
      );
    }
  }
});

test('the client stays withheld', { skip }, () => {
  assert.match(CASE_STUDY.kicker, /WITHHELD/);
  assert.match(html, /Client names withheld/);
});

test('further case studies link to posts that exist, and claim no figures', { skip }, () => {
  for (const c of MORE_CASES) {
    const file = path.join(ROOT, 'src', 'content', 'blog', `${c.slug}.md`);
    assert.ok(fs.existsSync(file), `${c.slug} has no article behind it`);
    assert.ok(html.includes(`/blog/${c.slug}`), `${c.slug} does not render on the homepage`);

    // These carry no published revenue figures, so the card must not imply
    // one. A currency amount, or a percentage attached to lift/growth language,
    // would be a success claim with nothing behind it. A percentage that
    // describes the failure -- "70-80% of ad revenue" -- is fine and is the
    // point of the study, so it is deliberately not caught here.
    const claim = /\$[\d,]+|\b\d+(\.\d+)?%\s*(lift|increase|uplift|growth)/i.exec(c.summary);
    assert.equal(claim, null, `${c.slug} summary makes a numeric claim: "${claim?.[0]}"`);
  }
});
