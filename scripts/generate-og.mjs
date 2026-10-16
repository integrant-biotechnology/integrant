// Per-page OG plates — 1200×630, strict B&W, Rajdhani, the vector mark.
// Run locally (`node --experimental-strip-types scripts/generate-og.mjs`);
// outputs are committed to public/og/ so the Vercel build needs no browser.
// Playwright renders the plates with the site's actual self-hosted fonts —
// pixel-identical typography to the site itself.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { PRODUCTS } = await import(path.join(root, 'src/data/products.ts'));
const { publishedNews } = await import(path.join(root, 'src/data/news.ts'));
const { formatDateShort } = await import(path.join(root, 'src/lib/format-date.ts'));

const font = (file) =>
  readFileSync(path.join(root, 'node_modules/@fontsource/rajdhani/files', file)).toString('base64');
const rajdhani700 = font('rajdhani-latin-700-normal.woff2');
const rajdhani500 = font('rajdhani-latin-500-normal.woff2');

// The mark path — single source of truth in src/lib/brand-mark-path.ts.
const { BRAND_MARK_PATH: markD } = await import(path.join(root, 'src/lib/brand-mark-path.ts'));

const PAGES = [
  { file: 'home.png', eyebrow: 'ORTHOPAEDIC MED-TECH · BIO-TECH · AI', title: 'Where biology becomes intelligence.' },
  { file: 'products.png', eyebrow: 'PRODUCT SYSTEMS · MED-TECH · BIO-TECH', title: 'The catalogue.' },
  { file: 'about.png', eyebrow: 'ORTHOPAEDIC MED-TECH · BIO-TECH · AI', title: 'About Integrant.' },
  { file: 'contact.png', eyebrow: 'SYDNEY · AUSTRALIA', title: 'Contact.' },
  { file: 'partners.png', eyebrow: 'DISTRIBUTION · HOSPITALS · SUPPLIERS · RESEARCH', title: 'Partners.' },
  { file: 'for-surgeons.png', eyebrow: 'CONSULT · SPECIFY · THEATRE · DOCUMENT', title: 'For surgeons.' },
  { file: 'innovation.png', eyebrow: 'AI · BIOMEDICAL · MEDICAL DEVICES', title: 'Wassup, the clinical AI platform.' },
  { file: 'research.png', eyebrow: 'ACTIVITY · METHODOLOGY · PARTNERSHIPS', title: 'Clinical research.' },
  { file: 'clinical-images.png', eyebrow: 'HEALTHCARE PROFESSIONALS ONLY', title: 'The case file.' },
  { file: 'privacy.png', eyebrow: 'SITE PRIVACY STATEMENT', title: 'Privacy.' },
  { file: 'news.png', eyebrow: 'ANNOUNCEMENTS · PRESS · MEDIA', title: 'News.' },
  { file: 'investors.png', eyebrow: 'COMPANY · PLATFORM · ANNOUNCEMENTS', title: 'Investors.' },
  ...publishedNews.map((n) => ({
    file: `news-${n.slug}.png`,
    eyebrow: `${n.category.toUpperCase()} · ${formatDateShort(n.date)}`,
    title: `${n.title}.`,
  })),
  ...PRODUCTS.map((p) => ({
    file: `product-${p.slug}.png`,
    eyebrow: p.category.toUpperCase(),
    title: `${p.name}.`,
  })),
];

const html = ({ eyebrow, title }) => `<!doctype html><html><head><style>
@font-face { font-family: Rajdhani; font-weight: 700; src: url(data:font/woff2;base64,${rajdhani700}) format('woff2'); }
@font-face { font-family: Rajdhani; font-weight: 500; src: url(data:font/woff2;base64,${rajdhani500}) format('woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #000; color: #fff; font-family: Rajdhani; position: relative; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
.frame { position: absolute; inset: 28px; border: 1px solid rgba(255,255,255,0.16); }
.corner { position: absolute; width: 22px; height: 22px; }
.tl { top: 16px; left: 16px; border-top: 2px solid #fff; border-left: 2px solid #fff; }
.br { bottom: 16px; right: 16px; border-bottom: 2px solid #fff; border-right: 2px solid #fff; }
.lockup { display: flex; align-items: center; gap: 20px; }
.word { font-weight: 700; font-size: 30px; letter-spacing: 0.42em; }
.eyebrow { font-weight: 500; font-size: 21px; letter-spacing: 0.34em; color: rgba(255,255,255,0.62); margin-bottom: 22px; }
h1 { font-weight: 700; font-size: ${title.length > 30 ? 72 : title.length > 22 ? 84 : 104}px; line-height: 0.98; letter-spacing: -0.01em; max-width: 980px; }
.foot { display: flex; justify-content: space-between; align-items: baseline; }
.url { font-weight: 500; font-size: 20px; letter-spacing: 0.3em; color: rgba(255,255,255,0.55); }
</style></head><body>
<div class="frame"></div><div class="corner tl"></div><div class="corner br"></div>
<div class="lockup">
  <svg viewBox="0 0 1539 1533" width="64" height="64" fill="#fff" fill-rule="evenodd"><path d="${markD}"/></svg>
  <span class="word">INTEGRANT</span>
</div>
<div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div>
<div class="foot"><span class="url">INTEGRANT.COM.AU</span><span class="url">SYDNEY · AUSTRALIA</span></div>
</body></html>`;

mkdirSync(path.join(root, 'public/og'), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const plate of PAGES) {
  await page.setContent(html(plate), { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(root, 'public/og', plate.file) });
  console.log('og:', plate.file);
}
await browser.close();
console.log(`${PAGES.length} plates written to public/og/`);
