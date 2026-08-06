// Gate-1 check: every redirect destination in redirects.draft.json must
// resolve to a page in dist/ (hash stripped, pattern destinations checked
// against their static prefix). Run after `npm run build`; exits non-zero
// on any dead destination — wire the map into vercel.json only when green.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first');
  process.exit(1);
}

const redirects = JSON.parse(readFileSync(path.join(root, 'content-archive/redirects.draft.json'), 'utf8'));

// Self-redirect loops are fatal: Vercel serves the redirect before the
// static file, so a same-path entry loops forever.
const loops = redirects.filter((r) => r.source === r.destination.split('#')[0]);

const failures = [];
for (const r of redirects) {
  const target = r.destination.split('#')[0].split('?')[0];
  if (target === '/') continue;
  const file = path.join(dist, target, 'index.html');
  if (!existsSync(file)) failures.push(`${r.source} → ${r.destination} (no ${target}/index.html in dist)`);
}

if (loops.length) {
  console.error('SELF-REDIRECT LOOPS:');
  loops.forEach((r) => console.error(`  ${r.source} → ${r.destination}`));
}
if (failures.length) {
  console.error('DEAD DESTINATIONS:');
  failures.forEach((f) => console.error(`  ${f}`));
}
if (loops.length || failures.length) process.exit(1);
console.log(`${redirects.length} redirects validated — every destination exists in dist/, no loops.`);
