// Analytics gate: proves the Plausible wiring end-to-end without a network.
//   1. Builds with PUBLIC_PLAUSIBLE_DOMAIN set and serves it on :4323.
//   2. Asserts the tag renders (domain, first-party api + src) on every route.
//   3. Stubs window.plausible + the /stats/* proxy, clicks every [data-event]
//      control on every route and asserts each goal fires exactly once with
//      the expected properties; drives the contact form (JS path + ?sent=1).
//   4. Asserts zero console/page errors while doing so.
//   5. Rebuilds WITHOUT the domain and asserts dist carries no tag at all.
//
// Usage: node scripts/audit-analytics.mjs
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const DOMAIN = 'integrant.com.au';
const PORT = 4323;
const BASE = `http://localhost:${PORT}`;
const ROUTES = [
  '/', '/about', '/contact', '/partners', '/for-surgeons', '/innovation',
  '/research', '/clinical-images', '/products', '/privacy', '/404',
  '/products/med-tech/archit', '/products/bio-tech/frameit',
];
const EVENTS = new Set(['Request Meeting', 'Email Click', 'Contact Submit', 'View System', 'HCP Gate Accept', '404']);
const problems = [];

const build = (env) => {
  const r = spawnSync('npx', ['astro', 'build'], { env: { ...process.env, ...env }, stdio: 'pipe', encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stdout, r.stderr); throw new Error('build failed'); }
};
const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const waitFor = async (url, tries = 40) => {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview did not start');
};

// --- 1. instrumented build ---------------------------------------------
build({ PUBLIC_PLAUSIBLE_DOMAIN: DOMAIN, PUBLIC_CONTACT_FORM_ENABLED: '1' });
const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
try {
  await waitFor(BASE + '/');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    // Recorder stands in for the Plausible script; the queue stub in <head>
    // must hand off to it, so install it before any page script runs.
    window.__events = [];
    window.plausible = (name, opts) => window.__events.push({ name, props: opts?.props ?? {} });
  });
  await ctx.route('**/stats/**', (route) =>
    route.fulfill({ status: 202, contentType: 'application/javascript', body: '/* stubbed */' }),
  );
  await ctx.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  const page = await ctx.newPage();
  const pageIssues = [];
  page.on('console', (m) => m.type() === 'error' && pageIssues.push(`console: ${m.text().slice(0, 140)}`));
  page.on('pageerror', (e) => pageIssues.push(`pageerror: ${String(e).slice(0, 140)}`));

  // --- 2 + 3. tag + every data-event control on every route ---------------
  let clicks = 0;
  for (const route of ROUTES) {
    await page.goto(BASE + route + '?motion=off', { waitUntil: 'load' });
    const tag = await page.evaluate(() => {
      const s = document.querySelector('script[data-domain]');
      return s ? { domain: s.getAttribute('data-domain'), api: s.getAttribute('data-api'), src: s.getAttribute('src'), defer: s.hasAttribute('defer') } : null;
    });
    if (!tag) problems.push(`TAG missing @ ${route}`);
    else if (tag.domain !== DOMAIN || tag.api !== '/stats/api/event' || tag.src !== '/stats/js/script.js' || !tag.defer)
      problems.push(`TAG wrong ${JSON.stringify(tag)} @ ${route}`);

    if (route === '/404') {
      const ev = await page.evaluate(() => window.__events);
      const hit = ev.filter((e) => e.name === '404');
      if (hit.length !== 1 || hit[0].props.path !== '/404') problems.push(`404 event ${JSON.stringify(hit)} @ ${route}`);
    }

    const controls = await page.evaluate(() =>
      [...document.querySelectorAll('[data-event]')].map((el, i) => {
        el.setAttribute('data-qa-idx', String(i));
        const props = {};
        for (const [k, v] of Object.entries(el.dataset)) {
          if (k !== 'event' && k.startsWith('event')) props[k.slice(5, 6).toLowerCase() + k.slice(6)] = v;
        }
        return { i, name: el.dataset.event, props, tag: el.tagName, href: el.getAttribute('href') ?? '' };
      }),
    );
    if (route === '/' && controls.length === 0) problems.push('no data-event controls on /');
    for (const c of controls) {
      if (!EVENTS.has(c.name)) { problems.push(`UNKNOWN event "${c.name}" @ ${route}`); continue; }
      if (!c.props.location && !['HCP Gate Accept', 'Contact Submit'].includes(c.name)) problems.push(`NO location prop for ${c.name} @ ${route}`);
      await page.evaluate(() => (window.__events = []));
      // Neutralise navigation so the same document keeps recording; the
      // delegated listener runs in the capture phase, before this handler.
      await page.evaluate((i) => {
        const el = document.querySelector(`[data-qa-idx="${i}"]`);
        el.addEventListener('click', (e) => e.preventDefault(), { once: true });
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
      }, c.i);
      // Visible controls get a real pointer click; controls that are hidden at
      // this width (mobile menu) get a dispatched click — same capture path.
      const visible = await page.evaluate((i) => {
        const el = document.querySelector(`[data-qa-idx="${i}"]`);
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      }, c.i);
      if (visible) await page.click(`[data-qa-idx="${c.i}"]`, { force: true });
      else await page.evaluate((i) => document.querySelector(`[data-qa-idx="${i}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })), c.i);
      clicks++;
      const ev = await page.evaluate(() => window.__events);
      const mine = ev.filter((e) => e.name === c.name);
      if (mine.length !== 1) problems.push(`EVENT ${c.name} fired ${mine.length}x (expected 1) @ ${route} <${c.tag} ${c.href}>`);
      else if (JSON.stringify(mine[0].props) !== JSON.stringify(c.props)) problems.push(`PROPS ${c.name} got ${JSON.stringify(mine[0].props)} want ${JSON.stringify(c.props)} @ ${route}`);
    }
  }

  // --- contact form: JS submit path + non-JS return path -------------------
  await page.goto(BASE + '/contact?channel=partners&motion=off', { waitUntil: 'load' });
  await page.fill('input[name="name"]', 'QA');
  await page.fill('input[name="email"]', 'qa@example.com');
  await page.fill('textarea[name="message"]', 'Automated analytics gate.');
  await page.evaluate(() => (window.__events = []));
  await page.click('#enquiry button[type="submit"]');
  await page.waitForTimeout(400);
  let ev = await page.evaluate(() => window.__events);
  let hit = ev.filter((e) => e.name === 'Contact Submit');
  if (hit.length !== 1 || hit[0].props.channel !== 'partners') problems.push(`CONTACT SUBMIT (js) ${JSON.stringify(ev)}`);
  const statusText = await page.textContent('#form-status');
  if (!/RECEIVED/.test(statusText ?? '')) problems.push(`CONTACT form success state missing: "${statusText}"`);

  await page.goto(BASE + '/contact?sent=1&channel=%3Cscript%3E&motion=off', { waitUntil: 'load' });
  ev = await page.evaluate(() => window.__events);
  hit = ev.filter((e) => e.name === 'Contact Submit');
  if (hit.length !== 1 || hit[0].props.channel !== 'direct') problems.push(`CONTACT SUBMIT (sent=1) ${JSON.stringify(ev)}`);

  // --- HCP gate must still work with tracking attached -------------------
  await page.goto(BASE + '/clinical-images?motion=off', { waitUntil: 'load' });
  // The loop above already accepted the gate in this session — reset it.
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await page.click('#hcp-confirm');
  await page.waitForTimeout(200);
  const gateHidden = await page.evaluate(() => document.getElementById('hcp-gate').hidden);
  if (!gateHidden) problems.push('HCP gate did not open after tracked click');

  // --- 4. no page errors ---------------------------------------------------
  pageIssues.forEach((i) => problems.push(i));
  await browser.close();
  console.log(`instrumented pass: ${ROUTES.length} routes, ${clicks} tracked controls clicked`);
} finally {
  preview.kill();
}

// --- 5. clean build carries nothing --------------------------------------
build({ PUBLIC_PLAUSIBLE_DOMAIN: '', PUBLIC_CONTACT_FORM_ENABLED: '' });
// The helper module is always bundled (inert without window.plausible) and
// /privacy names the service in prose — the tag itself is what must be absent.
const leaks = walk('dist').filter((f) => /\.html$/.test(f) && /data-domain=|\/stats\/(js|api)\//.test(readFileSync(f, 'utf8')));
if (leaks.length) problems.push(`LEAK: analytics present in clean build: ${leaks.slice(0, 3).join(', ')}`);

if (problems.length) {
  console.log('FAILURES:');
  problems.forEach((p) => console.log(' -', p));
  process.exit(1);
}
console.log('ANALYTICS GATE GREEN: tag correct on every route, every goal fires once with the right props, contact + HCP flows intact, clean build carries no tag.');
