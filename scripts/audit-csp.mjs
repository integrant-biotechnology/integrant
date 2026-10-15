// CSP gate: replays every built route in a real browser with the exact
// security headers from vercel.json applied to each response, and fails on
// any Content-Security-Policy violation or page error. The local preview
// does not send Vercel's headers, so this is the only place the policy is
// exercised before it reaches production.
//
// Usage: npx astro preview --port 4322 & node scripts/audit-csp.mjs [baseUrl]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { ROUTES } from './routes.mjs';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const headers = Object.fromEntries(vercel.headers[0].headers.map((h) => [h.key.toLowerCase(), h.value]));
if (!headers['content-security-policy']) {
  console.error('vercel.json has no Content-Security-Policy header');
  process.exit(1);
}

const browser = await chromium.launch();
const problems = [];
// Default motion (shader + GSAP) and the reduced-motion path both run.
for (const query of ['?forcevisible', '?motion=off']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('**/*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), ...headers } });
  });
  await ctx.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__cspViolations.push(`${e.violatedDirective} blocked ${e.blockedURI || 'inline'}`),
    );
  });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + route + query, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(250);
    const violations = await page.evaluate(() => window.__cspViolations);
    for (const v of new Set(violations)) problems.push(`${route}${query}: ${v}`);
    for (const e of errors) problems.push(`${route}${query}: page error ${e}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();

if (problems.length) {
  console.error('CSP GATE FAILED:');
  [...new Set(problems)].forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log(`CSP gate clean: ${ROUTES.length} routes x 2 motion modes, no policy violations or page errors.`);
