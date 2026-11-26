/**
 * Make /services/ work as well as /services.
 *
 * The build emits flat files. GitHub Pages serves /services from services.html
 * but answers /services/ with a 404, and it has no redirect rules. So each page
 * is also written to <route>/index.html.
 *
 * A copy rather than a redirect stub: if Pages ever preferred the folder over
 * the file, a stub would loop forever, where a copy just serves the page. The
 * copy's canonical is the slashless URL, so search engines see one page.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
let n = 0;

for (const entry of fs.readdirSync(DIST, { recursive: true, encoding: 'utf8' })) {
  const file = entry.split(path.sep).join('/');
  if (!/^(blog\/|services\/)?[^/]+\.html$/.test(file) || /(^|\/)(index|404)\.html$/.test(file)) continue;

  const copy = path.join(DIST, file.replace(/\.html$/, ''), 'index.html');
  if (fs.existsSync(copy)) continue;

  fs.mkdirSync(path.dirname(copy), { recursive: true });
  fs.copyFileSync(path.join(DIST, file), copy);
  n++;
}

console.log(`slash-stubs: ${n} pages also served with a trailing slash`);
