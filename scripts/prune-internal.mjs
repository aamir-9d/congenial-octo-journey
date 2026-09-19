/**
 * Remove the internal review artifacts from the built site.
 *
 * Three routes exist for us, not for visitors: the September audit page, the
 * brand book and the logo directions. All three are noindex, none is in the
 * sitemap, and nothing on the site links to any of them — but they were still
 * being deployed, and between them they were roughly 670KB of a public site
 * whose largest real page is 35KB over the wire.
 *
 * They are not deleted from the repo. `npm run dev` still serves all three at
 * their usual URLs, which is the point: they stay readable for us and stop
 * being part of what we ship. `BUILD_INTERNAL=1 npm run build` puts them back
 * into dist/ when one of them needs to be shared as a link.
 *
 * Why a prune rather than a build-time exclusion: Astro has no per-page "build
 * but do not emit" switch, and the one mechanism that would work — prefixing
 * the filename with an underscore — also hides the page from the dev server,
 * which defeats the reason for keeping it. Two of the three are not Astro
 * pages at all; they are pre-built HTML sitting in public/, so only a step
 * after the build can see all three in one place.
 *
 * Deletes from dist/ ONLY. It never touches src/ or public/.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

/** Built paths that exist for internal review, relative to dist/. */
const INTERNAL = ['audit.html', 'brand-book', 'logo-directions', path.join('img', 'audit')];

if (process.env.BUILD_INTERNAL === '1') {
  console.log('prune-internal: BUILD_INTERNAL=1 — keeping the internal review pages');
  process.exit(0);
}

if (!fs.existsSync(DIST)) {
  console.error('prune-internal: no dist/ — run the build first');
  process.exit(1);
}

const removed = [];
for (const entry of INTERNAL) {
  const target = path.join(DIST, entry);
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, { recursive: true, force: true });
  removed.push(entry);
}

/* img/ exists only to hold the audit screenshots today. If pruning them leaves
   it empty, take the directory too rather than deploying an empty folder —
   but only if it really is empty, so that dropping a founder portrait into
   public/img/ later is not silently undone. */
const img = path.join(DIST, 'img');
if (fs.existsSync(img) && fs.readdirSync(img).length === 0) {
  fs.rmdirSync(img);
  removed.push('img');
}

console.log(
  removed.length
    ? `prune-internal: removed ${removed.join(', ')} (BUILD_INTERNAL=1 keeps them)`
    : 'prune-internal: nothing to remove',
);
