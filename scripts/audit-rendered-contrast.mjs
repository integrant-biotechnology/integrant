// Rendered-contrast gate: measures what the browser actually paints, not
// what the token table promises. Crawls every route in both themes and
// asserts WCAG AA on every visible text node — 4.5:1 normal, 3:1 large
// (≥24px, or ≥18.66px bold). Decorative content must be aria-hidden to be
// exempt; that's the contract that keeps "information rendered as texture"
// (the 8%-opacity numeral bug) from ever shipping again.
//
// Usage: node scripts/audit-rendered-contrast.mjs [baseUrl]
//   (default http://localhost:4322 — `npx astro preview --port 4322`)
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

const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const blend = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

  // Effective background: what is actually PAINTED beneath the element —
  // sampled from the hit-testing stack at the element's centre, so a fixed
  // nav over a dark hero resolves to the hero, not the body behind it.
  const effectiveBg = (el) => {
    const rect = el.getBoundingClientRect();
    const cx = Math.min(Math.max(rect.left + rect.width / 2, 1), innerWidth - 1);
    const cy = Math.min(Math.max(rect.top + rect.height / 2, 1), innerHeight - 1);
    const stack = document.elementsFromPoint(cx, cy);
    const start = stack.indexOf(el);
    const below = start >= 0 ? stack.slice(start + 1) : stack.filter((n) => !n.contains(el));
    const layers = [];
    // The element's own containers up to the stack may carry translucent bgs
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) { layers.push(bg); if (bg.a >= 0.99) break; }
    }
    if (!layers.length || layers[layers.length - 1].a < 0.99) {
      for (const n of below) {
        const bg = parse(getComputedStyle(n).backgroundColor);
        if (bg && bg.a > 0) { layers.push(bg); if (bg.a >= 0.99) break; }
      }
    }
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    const last = layers[layers.length - 1];
    if (last && last.a >= 0.99) acc = last;
    for (let i = layers.length - (last && last.a >= 0.99 ? 2 : 1); i >= 0; i--) acc = blend(layers[i], acc);
    return acc;
  };

  const problems = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  const candidates = [];
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (!text) continue;
    const el = walker.currentNode.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    candidates.push({ el, text });
  }
  for (const { el, text } of candidates) {
    if (el.closest('[aria-hidden="true"], script, style, noscript, [hidden]')) continue;
    if (el.closest(':disabled') || el.disabled) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    let rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    // Bring below-fold content into the viewport so the paint stack is real.
    if (rect.top < 0 || rect.bottom > innerHeight) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
    }
    const color = parse(cs.color);
    if (!color) continue;
    const bg = effectiveBg(el);
    const fg = color.a < 1 ? blend(color, bg) : color;
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const threshold = px >= 24 || (px >= 18.66 && bold) ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r < threshold) {
      problems.push({
        text: text.slice(0, 48),
        ratio: Math.round(r * 100) / 100,
        threshold,
        px,
        tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 3).join('.') : ''),
      });
    }
  }
  return problems;
};

const browser = await chromium.launch();
let total = 0;
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
  // Dark-first (Aug 2026): the site ignores prefers-color-scheme — only an
  // explicit stored choice yields light. Seed it before any page script runs.
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem('integrant-theme', t);
    } catch {}
  }, theme);
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route + '?motion=off', { waitUntil: 'load' });
    await page.waitForTimeout(200);
    const problems = await page.evaluate(AUDIT);
    for (const p of problems) {
      console.error(`FAIL ${theme} ${route} — "${p.text}" ${p.ratio}:1 (needs ${p.threshold}:1, ${p.px}px) <${p.tag}>`);
      total++;
    }
  }
  await ctx.close();
}
await browser.close();

if (total > 0) {
  console.error(`\n${total} rendered-contrast violations.`);
  process.exit(1);
}
console.log(`Rendered contrast clean: ${ROUTES.length} routes x 2 themes, every visible text node ≥ AA.`);
