// Interaction/overflow QA gate against the built site (astro preview :4322).
// Per route × width × theme: horizontal overflow, console errors, page
// errors, failed subresource requests. Plus: the ≥44px touch-target
// contract, theme-toggle behaviour (VISIBLE background change, round-trip
// restore, reload persistence, cross-tab sync), ?motion=off and ?tier=1
// passes, and the contact/partners/HCP-gate interaction flows.
//
// Usage: npx astro preview --port 4322 & node scripts/qa-sweep.mjs
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const ROUTES = [
  '/', '/about', '/contact', '/partners', '/for-surgeons', '/innovation',
  '/research', '/clinical-images', '/products', '/404',
  '/products/med-tech/archit', '/products/med-tech/anchorit', '/products/med-tech/screwit',
  '/products/med-tech/fuseit', '/products/med-tech/loopit', '/products/med-tech/nailit',
  '/products/med-tech/screw-sets', '/products/med-tech/screw-removal-set',
  '/products/med-tech/ankle-fusion-set', '/products/med-tech/2-5mm-screw',
  '/products/bio-tech/frameit', '/products/bio-tech/graftit',
];
const WIDTHS = [390, 768, 1024, 1280];
const problems = [];
const browser = await chromium.launch();

// --- 1. overflow + console + network sweep -------------------------------
for (const theme of ['dark', 'light']) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: theme });
    const page = await ctx.newPage();
    const pageIssues = [];
    page.on('console', (m) => m.type() === 'error' && pageIssues.push(`console: ${m.text().slice(0, 120)}`));
    page.on('pageerror', (e) => pageIssues.push(`pageerror: ${String(e).slice(0, 120)}`));
    page.on('requestfailed', (r) => {
      const f = r.failure()?.errorText ?? '';
      if (!f.includes('ERR_ABORTED')) pageIssues.push(`reqfail: ${r.url().slice(-60)} ${f}`);
    });
    page.on('response', (r) => r.status() >= 400 && !r.url().includes('/404') && pageIssues.push(`http${r.status()}: ${r.url().slice(-60)}`));
    for (const route of ROUTES) {
      pageIssues.length = 0;
      await page.goto(BASE + route + '?motion=off', { waitUntil: 'load' });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) problems.push(`OVERFLOW ${overflow}px ${theme}/${width} ${route}`);
      pageIssues.forEach((i) => problems.push(`${i} @ ${theme}/${width} ${route}`));
    }
    await ctx.close();
  }
}
console.log('sweep done:', problems.length, 'problems');

// --- 2. touch-target contract at 390/768/1024 ----------------------------
for (const width of [390, 768, 1024]) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await ctx.newPage();
  for (const route of ['/', '/contact', '/for-surgeons', '/products/med-tech/archit']) {
    await page.goto(BASE + route + '?motion=off', { waitUntil: 'load' });
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    });
    const small = await page.evaluate(() => {
      const sel = [...document.querySelectorAll('a, button, summary, input, textarea, [role="button"]')];
      return sel
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && el.offsetParent !== null && !el.disabled;
        })
        .map((el) => ({ t: (el.textContent || el.ariaLabel || el.name || '?').trim().slice(0, 24), h: Math.round(el.getBoundingClientRect().height) }))
        .filter((x) => x.h < 44);
    });
    small.forEach((s) => problems.push(`TAP<44 ${width} ${route} "${s.t}" ${s.h}px`));
  }
  await ctx.close();
}
console.log('touch done:', problems.length, 'problems total');

// --- 3. theme toggle: VISIBLE change, round trip, persistence -------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  const sampleBgs = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('main section')]
        .filter((s) => { const r = s.getBoundingClientRect(); return r.top < innerHeight * 3; })
        .map((s) => getComputedStyle(s).backgroundColor)
        .join('|')
    );
  for (const route of ['/', '/about', '/contact', '/partners', '/for-surgeons', '/innovation', '/research', '/products']) {
    await page.goto(BASE + route + '?forcevisible', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    const bgBefore = await sampleBgs();
    await page.click('.theme-toggle').catch(() => problems.push(`TOGGLE missing @ ${route}`));
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      meta: document.querySelector('meta[name="theme-color"]')?.content,
      metaCount: document.querySelectorAll('meta[name="theme-color"]').length,
    }));
    const bgAfter = await sampleBgs();
    if (after.theme === before) problems.push(`TOGGLE no-flip @ ${route}`);
    if (bgAfter === bgBefore) problems.push(`TOGGLE INVISIBLE (no section background changed) @ ${route}`);
    if (after.metaCount !== 1) problems.push(`THEME-META count=${after.metaCount} @ ${route}`);
    if (after.meta !== (after.theme === 'light' ? '#ffffff' : '#000000')) problems.push(`THEME-META wrong ${after.meta} for ${after.theme} @ ${route}`);
    await page.click('.theme-toggle');
    await page.waitForTimeout(500);
    if ((await sampleBgs()) !== bgBefore) problems.push(`TOGGLE round-trip mismatch @ ${route}`);
    await page.click('.theme-toggle');
    await page.waitForTimeout(300);
    const chosen = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(300);
    const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
    if (persisted !== chosen) problems.push(`TOGGLE choice lost on reload @ ${route} (${chosen} -> ${persisted})`);
    await page.evaluate(() => localStorage.clear());
  }
  await ctx.close();
}
console.log('toggle done:', problems.length, 'problems total');

// --- 4. tier + motion + interaction flows ---------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(BASE + '/?tier=1&forcevisible', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const tier = await page.evaluate(() => document.querySelector('[data-hero]')?.dataset.tier);
  if (tier !== '1') problems.push(`TIER expected 1 got ${tier}`);

  await page.goto(BASE + '/?motion=off', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const anims = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  if (anims > 0) problems.push(`MOTION-OFF still ${anims} running animations on /`);

  // contact: channel allowlist (prefill only exists once the form is enabled)
  await page.goto(BASE + '/contact?channel=surgeons', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const subj1 = await page.evaluate(() => document.querySelector('input[name="subject"]')?.value);
  const formDisabled = await page.evaluate(() => document.querySelector('input[name="name"]')?.disabled);
  if (!formDisabled && subj1 !== 'Surgeon enquiry') problems.push(`CHANNEL surgeons -> "${subj1}"`);
  await page.goto(BASE + '/contact?channel=<script>x</script>', { waitUntil: 'load' });
  const subj2 = await page.evaluate(() => document.querySelector('input[name="subject"]')?.value);
  if (subj2) problems.push(`CHANNEL junk reflected: "${subj2}"`);

  // partners plates (walk first: reveal-hidden elements are unclickable)
  await page.goto(BASE + '/partners?forcevisible', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.click('details.plate summary');
  const open = await page.evaluate(() => document.querySelector('details.plate').open);
  if (!open) problems.push('PARTNERS plate did not open');

  // Cross-tab theme sync
  {
    const pageB = await ctx.newPage();
    await pageB.goto(BASE + '/about', { waitUntil: 'load' });
    await page.goto(BASE + '/products', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const target = (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light' ? 'dark' : 'light';
    await page.click('.theme-toggle');
    await page.waitForTimeout(600);
    const synced = await pageB.evaluate(() => document.documentElement.dataset.theme);
    if (synced !== target) problems.push(`CROSS-TAB not synced (expected ${target}, got ${synced})`);
    await pageB.close();
    await page.evaluate(() => localStorage.clear());
  }

  // HCP gate: confirm, persist across reload
  await page.goto(BASE + '/clinical-images', { waitUntil: 'load' });
  await page.click('#hcp-confirm');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(300);
  const gateHidden = await page.evaluate(() => document.getElementById('hcp-gate').hidden);
  if (!gateHidden) problems.push('HCP gate did not persist across reload');

  await ctx.close();
}

await browser.close();
if (problems.length) {
  console.log('FAILURES:');
  problems.forEach((p) => console.log(' -', p));
  process.exit(1);
}
console.log('QA GATE GREEN: 22 routes x 4 widths x 2 themes clean; touch contract holds; toggle, tier, motion, flows all pass.');
