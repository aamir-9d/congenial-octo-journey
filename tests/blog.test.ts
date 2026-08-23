/**
 * Blog checks.
 *
 * These posts are republished from the author's own LinkedIn articles, so the
 * thing most worth protecting is that the transcription stays intact — the code
 * blocks in particular. A Markdown fence that loses a line, or a backtick that
 * closes early, produces a page that still builds and still looks fine while
 * quietly serving broken code to someone who copies it.
 *
 * Requires `npm run build`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content', 'blog');
const DIST = path.join(ROOT, 'dist');

const built = fs.existsSync(path.join(DIST, 'blog.html'));
const skip = !built && 'run `npm run build` first';

const sources = fs.existsSync(CONTENT)
  ? fs.readdirSync(CONTENT).filter((f) => f.endsWith('.md'))
  : [];

const frontmatter = (file: string) => {
  const raw = fs.readFileSync(path.join(CONTENT, file), 'utf8');
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  assert.ok(m, `${file} has no frontmatter block`);
  const fields: Record<string, string> = {};
  for (const line of m[1]!.split('\n')) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]!] = kv[2]!.replace(/^['"]|['"]$/g, '');
  }
  return { fields, body: m[2]! };
};

test('every post carries the frontmatter the collection requires', () => {
  assert.equal(sources.length, 4, 'expected the four republished articles');

  for (const file of sources) {
    const { fields } = frontmatter(file);
    for (const key of ['title', 'kicker', 'date', 'tag']) {
      assert.ok(fields[key], `${file} is missing "${key}"`);
    }
    assert.match(fields.date!, /^\d{4}-\d{2}-\d{2}$/, `${file} date is not ISO`);
    assert.ok(fields.kicker!.length > 40, `${file} kicker is too thin to describe the post`);
  }
});

test('every post credits the LinkedIn original', () => {
  for (const file of sources) {
    const { fields } = frontmatter(file);
    assert.ok(fields.source, `${file} has no source URL`);
    assert.match(
      fields.source!,
      /^https:\/\/www\.linkedin\.com\/pulse\//,
      `${file} source is not a LinkedIn Pulse URL`,
    );
  }
});

test('code fences are balanced and none is empty', () => {
  for (const file of sources) {
    const { body } = frontmatter(file);
    const fences = body.match(/^```/gm) ?? [];
    assert.equal(
      fences.length % 2,
      0,
      `${file} has an unclosed code fence — everything after it renders as code`,
    );

    for (const block of body.matchAll(/^```(\w*)\n([\s\S]*?)^```/gm)) {
      assert.ok(block[1], `${file} has a fence with no language, so it loses highlighting`);
      assert.ok(block[2]!.trim().length > 0, `${file} has an empty code block`);
    }
  }
});

test('the index lists every post, newest first', { skip }, () => {
  const html = fs.readFileSync(path.join(DIST, 'blog.html'), 'utf8');
  const rows = (html.match(/class="blog__row"/g) ?? []).length;
  assert.equal(rows, sources.length);

  const dates = [...html.matchAll(/datetime="(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]!);
  const sorted = [...dates].sort().reverse();
  assert.deepEqual(dates, sorted, 'posts are not in newest-first order');
});

test('each post builds, and its code survives into the HTML', { skip }, () => {
  // A sample of distinctive identifiers from each article. If a fence broke or
  // a line was dropped in transcription, one of these goes missing.
  const markers: Record<string, string[]> = {
    'leveraging-skan-for-ios': ['NSAdvertisingAttributionReportEndpoint', 'fidelity-type', 'did-win'],
    'mastering-jql-in-javascript': ['groupByUser', 'mixpanel.reducer.count', 'Post-Question Video'],
    'app-conversion-rate-analysis-in-python': ['join_unique_values', 'conversion_rate', 'total_counts'],
    'master-onboarding-insights-with-pandas': [
      'reverse_country_code_map',
      'pick_random_category',
      'cvr_done',
    ],
  };

  for (const [slug, needles] of Object.entries(markers)) {
    const file = path.join(DIST, 'blog', `${slug}.html`);
    assert.ok(fs.existsSync(file), `${slug} did not build`);

    const html = fs.readFileSync(file, 'utf8');

    // Search the text, not the markup. Shiki wraps each token in its own span,
    // so a dotted identifier like `mixpanel.reducer.count` is split across
    // several elements and a raw substring search would miss it.
    const text = html
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    for (const needle of needles) {
      assert.ok(text.includes(needle), `${slug} lost "${needle}" — check the transcription`);
    }

    assert.match(html, /class="astro-code/, `${slug} has no highlighted code block`);
    assert.match(
      html,
      new RegExp(`rel="canonical" href="[^"]*/blog/${slug}"`),
      `${slug} canonical does not point at itself`,
    );
    assert.match(html, /linkedin\.com\/pulse\//, `${slug} does not credit the original`);
  }
});

test('the sitemap covers the posts, dated when they were published', { skip }, () => {
  const xml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');

  assert.match(xml, /\/blog<\/loc>|\/blog<\//, 'the blog index is missing from the sitemap');

  for (const file of sources) {
    const slug = file.replace(/\.md$/, '');
    const { fields } = frontmatter(file);
    assert.ok(xml.includes(`/blog/${slug}`), `${slug} is missing from the sitemap`);

    // Its own date, not the build date — a rebuild must not claim a year-old
    // article just changed.
    const entry = new RegExp(`/blog/${slug}</loc>\\s*<lastmod>([^<]+)</lastmod>`);
    const m = entry.exec(xml);
    assert.ok(m, `${slug} has no lastmod`);
    assert.equal(m[1], fields.date, `${slug} lastmod is not its publication date`);
  }
});
