// Type-floor gate: no small wording, anywhere. Crawls every route in both
// themes at phone and desktop widths and asserts the computed font-size of
// every visible text node is at or above the floor:
//   desktop (≥768px viewport)  16px
//   phone   (<768px viewport)  15px
// Only aria-hidden decoration is exempt (neural fields, the footer
// watermark, section numerals). The op-note mock is a document, not
// texture, so it carries its own 14px minimum instead of an exemption.
// SVG <text> is measured by its painted box, so diagram labels count too.
//
// Usage: node scripts/audit-type-floor.mjs [baseUrl]
//   (default http://localhost:4322 — `npx astro preview --port 4322`)
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const ROUTES = [
  '/', '/about', '/contact', '/partners', '/for-surgeons', '/innovation',
  '/research', '/clinical-images', '/products', '/privacy', '/404',
  '/products/med-tech/archit', '/products/med-tech/anchorit', '/products/med-tech/screwit',
  '/products/med-tech/fuseit', '/products/med-tech/loopit', '/products/med-tech/nailit',
  '/products/med-tech/screw-sets', '/products/med-tech/screw-removal-set',
  '/products/med-tech/ankle-fusion-set', '/products/med-tech/2-5mm-screw',
  '/products/bio-tech/frameit', '/products/bio-tech/graftit',
];
const WIDTHS = [390, 1280];
const FLOOR = { phone: 15, desktop: 16, opNote: 14 };

const AUDIT = (floor) => {
  const problems = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (!text) continue;
    const el = walker.currentNode.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('[aria-hidden="true"], script, style, noscript, template, [hidden]')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    // Inputs/buttons off-screen still count; nothing else is skipped for position.
    const isSvg = el.namespaceURI === 'http://www.w3.org/2000/svg';
    // SVG text scales with its viewBox: measure what is painted, not the attribute.
    const px = isSvg ? Math.round((rect.height / 1.2) * 10) / 10 : parseFloat(cs.fontSize);
    const min = el.closest('.op-note') ? floor.opNote : floor.base;
    if (px < min) {
      const cls = typeof el.className === 'string' ? el.className : (el.className?.baseVal ?? '');
      problems.push({
        px,
        min,
        text: text.slice(0, 44),
        tag: el.tagName.toLowerCase() + (cls ? '.' + cls.split(' ').filter(Boolean).slice(0, 3).join('.') : ''),
      });
    }
  }
  return problems;
};

const browser = await chromium.launch();
let total = 0;
let checked = 0;
for (const theme of ['dark', 'light']) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('integrant-theme', t);
      } catch {}
    }, theme);
    const page = await ctx.newPage();
    const floor = { base: width < 768 ? FLOOR.phone : FLOOR.desktop, opNote: FLOOR.opNote };
    for (const route of ROUTES) {
      const res = await page.goto(BASE + route + '?motion=off', { waitUntil: 'load' });
      if (!res || (res.status() >= 400 && route !== '/404')) {
        console.error(`FAIL ${theme}/${width} ${route} — HTTP ${res?.status() ?? 'none'}`);
        total++;
        continue;
      }
      await page.waitForTimeout(150);
      const problems = await page.evaluate(AUDIT, floor);
      checked++;
      for (const p of problems) {
        console.error(`FAIL ${theme}/${width} ${route} — ${p.px}px < ${p.min}px "${p.text}" <${p.tag}>`);
        total++;
      }
    }
    await ctx.close();
  }
}
await browser.close();

if (total > 0) {
  console.error(`\n${total} text node(s) below the type floor.`);
  process.exit(1);
}
console.log(`Type floor holds: ${checked} route×theme×width passes, nothing under ${FLOOR.desktop}px desktop / ${FLOOR.phone}px phone.`);
