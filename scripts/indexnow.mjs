/**
 * Tell Bing (and the other IndexNow engines: Yandex, Seznam, Naver) that pages
 * are new or changed, so they are crawled now rather than whenever the sitemap
 * is next read. ChatGPT search and Copilot draw on Bing's index.
 *
 *   node scripts/indexnow.mjs                 every URL in the live sitemap
 *   node scripts/indexnow.mjs /about /faq     just these paths
 *
 * The key is public by design: IndexNow proves ownership by finding the same
 * key in a file at the site root (public/<key>.txt). Run it after a deploy has
 * finished, never before: the engines fetch the key file and the pages.
 *
 * Built-ins only (Node 18+ fetch). See https://www.indexnow.org/documentation
 */
import fs from 'node:fs';
import path from 'node:path';

const HOST = 'e2eapp.com';
const SITE = `https://${HOST}`;

const keyFile = fs
  .readdirSync(path.resolve(import.meta.dirname, '..', 'public'))
  .find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file (32 hex characters + .txt) in public/');
const key = keyFile.replace('.txt', '');

const args = process.argv.slice(2);
let urls;
if (args.length) {
  urls = args.map((p) => new URL(p, SITE).href);
} else {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
if (!urls.length) throw new Error('No URLs to submit');

// The key file must be live first, or every engine rejects the batch.
const live = await fetch(`${SITE}/${key}.txt`);
if (!live.ok || (await live.text()).trim() !== key) {
  throw new Error(`${SITE}/${key}.txt is not live yet (HTTP ${live.status}). Deploy first.`);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${key}.txt`, urlList: urls }),
});

// 200 = received, 202 = received and the key is still being checked.
console.log(`IndexNow: HTTP ${res.status} for ${urls.length} URL(s)`);
if (res.status !== 200 && res.status !== 202) {
  console.log(await res.text());
  process.exitCode = 1;
}
