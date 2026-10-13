// Single source of truth for the QA gates' route list: every page the build
// actually emitted. Derived from dist/ so a new page can never be skipped by
// an audit, and a removed page can never leave a stale entry behind.
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const dist = path.join(root, 'dist');

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });

/** Absolute paths of every built HTML document. */
export const HTML_FILES = walk(dist).sort();

/** Site routes, '/' first, in a stable order. */
export const ROUTES = HTML_FILES.map((file) => {
  const rel = path.relative(dist, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.slice(0, -'.html'.length);
}).sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
