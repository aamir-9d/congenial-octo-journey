/**
 * /automation and the E2E Apps MCP: the page may not claim more than is true.
 *
 * The page was rebuilt in November 2026 around a server that was built but not
 * deployed, and an account sign-in that was not built at all. The approved
 * board draws the finished thing: an address to copy, "Add to Claude", a
 * platform shown as connected. Shipping that drawing as it stands would have
 * been a page of promises nothing behind it could keep.
 *
 * So every such statement reads two flags in src/data/automation.ts
 * (`MCP.status`, `MCP.accounts`), and this file pins what each state may and
 * may not show. The assertions follow the flags, so flipping one to 'live' on
 * the day it is true keeps this file honest rather than failing it.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  MCP,
  HEADER,
  PLATFORMS,
  STATUS_LABEL,
  PANEL,
  TOOLS,
  SECURITY,
  STEPS,
  FAQS,
  EXAMPLES,
  TEASER,
  MCP_LEGAL_UPDATED,
} from '../src/data/automation.ts';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const built = fs.existsSync(path.join(DIST, 'automation.html'));
const skip = !built && 'run `npm run build` first';

const read = (f: string) => fs.readFileSync(path.join(DIST, f), 'utf8');
const html = built ? read('automation.html') : '';
const page = html.slice(html.indexOf('<body'));

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
const text = (s: string) =>
  decode(s.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
/** One section of the page, by its data-section name. Sections do not nest. */
const section = (name: string) =>
  new RegExp(`<section\\b[^>]*data-section="${name}"[^>]*>[\\s\\S]*?</section>`).exec(page)?.[0] ?? '';

const serverOpen = MCP.status === 'live';
const accountsOpen = serverOpen && MCP.accounts === 'live';

/* -------------------------------------------------------------- the switch */

test('the two flags exist and the address is the one the server will answer at', () => {
  assert.ok(['coming', 'live'].includes(MCP.status));
  assert.ok(['coming', 'live'].includes(MCP.accounts));
  assert.equal(MCP.address, 'https://mcp.e2eapp.com/mcp');
});

test('no platform is available before account connection is', () => {
  if (!accountsOpen) {
    const early = PLATFORMS.filter((p) => p.status === 'available').map((p) => p.name);
    assert.deepEqual(early, [], `listed as available while accounts are '${MCP.accounts}': ${early.join(', ')}`);
  }
  const by = Object.fromEntries(PLATFORMS.map((p) => [p.name, p]));
  assert.equal(PLATFORMS.length, 8);
  assert.equal(by['Google Ads']!.how, 'Connector on your computer');
  // The four that are being built come before the four that are only planned.
  for (const n of ['Meta Ads', 'TikTok Ads', 'Google Play', 'App Store Connect']) {
    assert.equal(by[n]!.status, 'next', `${n} is not built; it may only be 'next'`);
  }
});

/* ------------------------------------------------------------------ header */

test('one h1, and it is the header the board draws', { skip }, () => {
  const h1 = [...page.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]!));
  assert.deepEqual(h1, [HEADER.title]);
  assert.equal(HEADER.title, "Your app's growth data, inside Claude and ChatGPT");
});

test('while the server is not open, the header does not offer it', { skip: skip || serverOpen }, () => {
  const hero = section('automation-intro');
  assert.ok(hero, 'the header section is missing');

  // The whole page, not just the header: the buttons must not survive anywhere.
  assert.doesNotMatch(page, /Add to Claude/, '"Add to Claude" is on the page before the server is open');
  assert.doesNotMatch(page, /Add to ChatGPT/, '"Add to ChatGPT" is on the page before the server is open');

  // The address is shown, marked, and cannot be copied, clicked or followed.
  const box = /<div\b[^>]*data-mcp-address="([a-z]+)"[^>]*>([\s\S]*?)<\/div>/.exec(hero);
  assert.ok(box, 'the address box is missing');
  assert.equal(box[1], 'coming');
  assert.match(text(box[2]!), /Opening soon/, 'the address is not marked "Opening soon"');
  assert.doesNotMatch(box[2]!, /<button\b/, 'the address box has a button before the address works');
  assert.doesNotMatch(page, /\sdata-copy=/, 'a Copy control is rendered');
  assert.doesNotMatch(page, />\s*Copy\s*</, 'something on the page is labelled "Copy"');
  assert.doesNotMatch(html, new RegExp(`href="${MCP.address.replace(/[.]/g, '\\.')}`), 'the address is a link');
  assert.doesNotMatch(html, /href="https?:\/\/mcp\.e2eapp\.com/, 'something links to the server');

  // One action, to the contact form, and a line saying why.
  const actions = [...hero.matchAll(/<a\b[^>]*class="[^"]*\bbtn-(?:primary|secondary)\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(actions.length, 1, 'the header should have exactly one button while the server is not open');
  assert.equal(text(actions[0]![1]!), 'Discuss your setup');
  assert.match(actions[0]![0], /href="\/#contact"/);
  assert.match(text(hero), /The server is being opened\./);

  // The steps and the first question say so too.
  assert.match(text(section('automation-steps')), /When it opens, you add our address/);
  assert.doesNotMatch(text(section('automation-steps')), /mcp\.e2eapp\.com/, 'a step prints the address as if it could be pasted');
  assert.equal(FAQS[0]!.q, 'When does it open?');
});

test('once the server is open, the header is the board', { skip: skip || !serverOpen }, () => {
  const hero = section('automation-intro');
  assert.match(hero, /data-mcp-address="live"/);
  assert.match(hero, new RegExp(`data-copy="${MCP.address}"`));
  assert.match(text(hero), /Add to Claude/);
  assert.match(text(hero), /Add to ChatGPT/);
  assert.doesNotMatch(text(hero), /Opening soon/);
  assert.match(page, /id="steps"/, 'the "Add to…" buttons point at #steps, which is not on the page');
});

test('the sample chat is labelled, and its figures are the earnings example’s', { skip }, () => {
  const hero = text(section('automation-intro'));
  assert.match(hero, /Sample data/, 'the chat card is not labelled "Sample data"');

  const e = EXAMPLES.find((x) => x.id === 'earnings')!;
  assert.ok(hero.includes(e.question), 'the chat does not ask the example’s question');
  assert.ok(hero.includes(e.finding), 'the chat does not state the example’s finding');
  assert.ok(hero.includes(e.next), 'the chat does not give the example’s next check');

  // The two bars are the daily averages either side of the step, recomputed.
  const pts = e.chart.points;
  const split = e.chart.splitAfter!;
  const mean = (a: number, b: number) => pts.slice(a, b).reduce((s, p) => s + p.v, 0) / (b - a);
  const fmt = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
  const before = fmt(mean(0, split + 1));
  const after = fmt(mean(split + 1, pts.length));
  assert.equal(before, '$1,815');
  assert.equal(after, '$1,402');
  const values = [...section('automation-intro').matchAll(/class="[^"]*chat__bar-value[^"]*"[^>]*>([^<]*)</g)].map((m) => m[1]);
  assert.deepEqual(values, [before, after], 'the bars do not show the two averages the finding quotes');
});

/* -------------------------------------------------------------- accounts */

test('while accounts are not open, nothing is shown as connected', { skip: skip || accountsOpen }, () => {
  assert.doesNotMatch(text(page), /\bConnected\b/, 'a row reads "Connected" before anything can connect');

  const panel = /<div\b[^>]*data-connections="([a-z]+)"[^>]*>([\s\S]*?)<\/ul>/.exec(section('automation-connect'));
  assert.ok(panel, 'the connections panel is missing');
  assert.equal(panel[1], 'preview');
  assert.match(text(panel[2]!), /^Your connections Preview/, 'the panel is not labelled "Preview"');
  assert.doesNotMatch(panel[2]!, /<button\b/, 'the preview has a working-looking button');
  assert.doesNotMatch(panel[2]!, /class="[^"]*\bbadge\b/, 'a preview row carries a filled status badge');

  // Every row carries Coming or Next, and none shows the finished page's action.
  const rows = [...panel[2]!.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1]!));
  assert.equal(rows.length, PANEL.length);
  rows.forEach((row, i) => {
    assert.match(row, /(Coming|Next)$/, `panel row ${i + 1} has no status: "${row}"`);
    const r = PANEL[i]!;
    if ('action' in r) assert.ok(!row.endsWith(r.action), `panel row ${i + 1} shows "${r.action}"`);
    if ('sample' in r) assert.ok(!row.includes('shared'), `panel row ${i + 1} shows sample account figures`);
  });

  // Step two is announced, and marked.
  const step = /<li\b[^>]*data-step="02"[^>]*>([\s\S]*?)<\/li>/.exec(section('automation-steps'))?.[1] ?? '';
  assert.match(text(step), /Coming Connect your accounts When account connection opens/);
  assert.equal(STEPS[1]!.coming, true);

  // The account data card is marked.
  const card = /<div\b[^>]*data-account-data="coming"[^>]*>([\s\S]*?)<\/ul>/.exec(section('automation-inside'))?.[1] ?? '';
  assert.match(text(card), /With your accounts connected Coming Your numbers, read for you/);
});

test('the method tools are the six that are built', { skip }, () => {
  assert.deepEqual(
    TOOLS.map((t) => t.name),
    [
      'Payback calculator',
      'Attribution audit checklist',
      'Common faults',
      'iOS measurement for Google Ads',
      'Google Ads scaling rules',
      'Ad monetisation checks',
    ],
  );
  const inside = text(section('automation-inside'));
  for (const t of TOOLS) assert.ok(inside.includes(`${t.name} ${t.does}`), `${t.name} is not listed`);
  assert.match(inside, /No sign-in needed Our method, as tools/);
});

test('security states only what is true today; account promises sit under their own heading', { skip: skip || accountsOpen }, () => {
  const sec = section('automation-security');
  const mark = sec.indexOf('data-when-accounts-open');
  assert.ok(mark > 0, 'the "When account connection opens" block is missing');
  const at = sec.lastIndexOf('<', mark);

  const today = text(sec.slice(0, at));
  const later = text(sec.slice(at));

  assert.deepEqual(
    SECURITY.built.map((c) => c.title),
    ['It signs in to nothing', 'It stores nothing', 'No tool that writes', 'No outbound requests'],
  );
  for (const c of SECURITY.built) assert.ok(today.includes(`${c.title} ${c.body}`), `"${c.title}" is not on the page`);

  assert.match(later, /^[^A-Za-z]*When account connection opens/, 'the account promises have no sub-heading');
  for (const c of SECURITY.accounts) {
    assert.ok(later.includes(c.body), `"${c.title}" is not under "When account connection opens"`);
    assert.ok(!today.includes(c.title), `"${c.title}" is stated as true today`);
    assert.match(c.body, /\bwill\b/, `"${c.title}" is not written in the future tense`);
  }
});

test('the status table is written from PLATFORMS and stacks on a phone', { skip }, () => {
  const sec = section('automation-platforms');
  const rows = [...sec.matchAll(/<tr\b[^>]*data-platform-status="([a-z]+)"[^>]*>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, PLATFORMS.length);
  rows.forEach((m, i) => {
    const p = PLATFORMS[i]!;
    assert.equal(m[1], p.status);
    assert.equal(text(m[2]!), `${p.name} ${p.how} ${STATUS_LABEL[p.status]}`);
  });
  assert.deepEqual(STATUS_LABEL, { available: 'Available', coming: 'Coming', next: 'Next' });

  // Below 700px each row is a block, so the table has nothing to scroll.
  // The built CSS is minified and scoped: `.ptable[cid] tbody[cid] tr[cid]{…}`.
  const phone = html.split(/@media\s*\(max-width:\s*699px\)\s*\{/).slice(1).find((c) => c.startsWith('.ptable')) ?? '';
  assert.ok(phone, 'the status table has no rules for a phone');
  assert.match(
    phone.slice(0, phone.indexOf('@media') > 0 ? phone.indexOf('@media') : undefined),
    /\.ptable\[[^\]]+\] tbody\[[^\]]+\] tr\[[^\]]+\]\{[^{}]*display:grid/,
    'table rows do not stack on a phone',
  );
  assert.doesNotMatch(html, /\.ptable[^{}]*\{[^{}]*overflow-x:\s*(auto|scroll)/, 'the status table scrolls sideways');
});

/* ------------------------------------------------------------- swipe rows */

test('every swipe row on /automation has a dot per card', { skip }, () => {
  const rows = [...page.matchAll(/<(?:div|ol|ul)\b[^>]*\sdata-swipe(?=[\s>])[^>]*>/g)];
  assert.ok(rows.length >= 2, `expected the steps and the security cards as swipe rows, found ${rows.length}`);

  for (const row of rows) {
    const name = /class="([^"]*)"/.exec(row[0])?.[1] ?? row[0];
    assert.match(name, /\bswipe\b/, `.${name}: data-swipe without the swipe class`);

    const rest = page.slice(row.index! + row[0].length);
    const metaAt = rest.search(/<div\b[^>]*\sdata-swipe-meta(?=[\s>])/);
    assert.ok(metaAt > 0, `.${name}: no [data-swipe-meta] block after the row`);

    // Cards are the row's `.gcard` children; none of them nests another.
    const cards = (rest.slice(0, metaAt).match(/class="[^"]*\bgcard\b(?!-)/g) ?? []).length;
    const meta = rest.slice(metaAt, rest.indexOf('</div>', metaAt));
    const dots = (/<span\b[^>]*data-swipe-dots[^>]*>([\s\S]*?)<\/span>/.exec(meta)?.[1]?.match(/<i\b/g) ?? []).length;
    assert.ok(cards > 0, `.${name}: no cards`);
    assert.equal(dots, cards, `.${name}: ${cards} cards but ${dots} dots`);
    assert.match(text(meta), new RegExp(`\\b1 of ${cards}$`), `.${name}: the counter does not count ${cards} cards`);
  }
});

/* ------------------------------------------------------------------- FAQ */

test('the FAQPage structured data is the visible questions, word for word', { skip }, () => {
  const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]!))
    .flatMap((b) => b['@graph'] ?? [b]);
  const faq = nodes.filter((n) => n['@type'] === 'FAQPage');
  assert.equal(faq.length, 1, '/automation should carry exactly one FAQPage node');
  assert.ok(nodes.some((n) => n['@type'] === 'Service'), 'the Service node is gone');

  const fromSchema = faq[0].mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({
    q: q.name,
    a: q.acceptedAnswer.text,
  }));
  const visible = [...section('automation-faq').matchAll(/<div\b[^>]*data-faq[^>]*>\s*<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(
    (m) => ({ q: text(m[1]!), a: text(m[2]!) }),
  );

  assert.ok(visible.length >= 5, `only ${visible.length} questions are on the page`);
  assert.deepEqual(visible, FAQS, 'the visible questions are not the FAQS array');
  assert.deepEqual(fromSchema, FAQS, 'the structured data is not the FAQS array');
});

/* ----------------------------------------------------- nothing said twice */

test('the earlier offer cards and connection list are gone', { skip }, async () => {
  const data = await import('../src/data/automation.ts');
  assert.ok(!('OFFER' in data), 'OFFER is back: the page would describe the server twice');
  assert.ok(!('CONNECTIONS' in data), 'CONNECTIONS is back: the status table already lists every platform');
  assert.doesNotMatch(page, /data-section="automation-offer"/);
  assert.doesNotMatch(text(page), /On request/, 'a platform is still described as "On request"');

  // The homepage card still describes the service, briefly.
  assert.ok(TEASER.body.split(/\s+/).length < 60, 'the homepage teaser is no longer a card’s worth of words');
});

/* ------------------------------------------------------------ legal pages */

test('/mcp/privacy and /mcp/terms exist, say what is true, and are findable', { skip }, () => {
  const sitemap = read('sitemap.xml');
  const nav = /<div id="nav-links"[^>]*>([\s\S]*?)<\/div>/.exec(page)?.[1] ?? '';
  assert.ok(nav, 'the top bar was not found');

  for (const name of ['privacy', 'terms']) {
    const file = path.join('mcp', `${name}.html`);
    assert.ok(fs.existsSync(path.join(DIST, file)), `/mcp/${name} was not built`);
    const src = read(file);
    const body = src.slice(src.indexOf('<body'));
    const words = text(body);

    assert.equal((body.match(/<h1\b/g) ?? []).length, 1, `/mcp/${name} does not have exactly one h1`);
    assert.match(words, new RegExp(`Last updated:? ${MCP_LEGAL_UPDATED}`), `/mcp/${name} shows no "Last updated" date`);
    assert.equal(MCP_LEGAL_UPDATED, '28 November 2026');

    assert.match(sitemap, new RegExp(`<loc>https://e2eapp\\.com/mcp/${name}</loc>`), `/mcp/${name} is not in the sitemap`);
    assert.match(section('automation-faq'), new RegExp(`href="/mcp/${name}"`), `/automation does not link /mcp/${name}`);
    assert.doesNotMatch(nav, /href="\/mcp\//, 'a legal page is in the main navigation');

    // What both pages must say, because it is what the server does.
    assert.match(words, /six read-only method tools and four saved prompts/i);
    assert.match(words, /no account and no sign-in/);
    assert.match(words, /hello@e2eapp\.com/);
    assert.match(words, /will be updated before/, `/mcp/${name} does not promise an update before account connection opens`);
    assert.doesNotMatch(src, /href="https?:\/\/mcp\.e2eapp\.com/, `/mcp/${name} links the server address`);
  }

  const privacy = text(read(path.join('mcp', 'privacy.html')));
  assert.match(privacy, /not kept and they are not logged/);
  assert.match(privacy, /makes no outbound requests/);
  assert.match(privacy, /Cloudflare processes requests as the hosting provider and keeps standard request metadata/);

  const terms = text(read(path.join('mcp', 'terms.html')));
  assert.match(terms, /planning estimates and general guidance/);
  assert.match(terms, /not advice/);
  assert.match(terms, /no warranty/);
  // The governing-law sentence is /terms's own, not a new one.
  const law = /These terms are governed by[^.]*\./.exec(text(read('terms.html')))?.[0];
  assert.ok(law, '/terms no longer states a governing law; /mcp/terms must not state one on its own');
  assert.ok(terms.includes(law!), '/mcp/terms states a governing law that /terms does not');
});
