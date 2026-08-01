/**
 * Legacy content migration scraper — integrant.com.au → content-archive/
 *
 * Exhaustive, polite, single-run capture of the WordPress/Elementor site:
 * sitemap URLs + discovered internal links, raw HTML, clean Markdown with
 * rich frontmatter, structured JSON (products/shop/seo/navigation/forms/
 * site-facts), full-resolution assets, compliance pre-flags, and a
 * migration inventory (INDEX.md + redirects.draft.json).
 *
 * Usage:  node scripts/scrape-legacy.mjs           # full capture
 *         node scripts/scrape-legacy.mjs --diff    # re-scrape, report hash drift
 */
import { load } from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ORIGIN = 'https://integrant.com.au';
const OUT = 'content-archive';
const UA = 'IntegrantSiteMigration/1.0 (site rebuild; contact: skalaliya@gmail.com)';
const DELAY_MS = 500;
const ASSET_DELAY_MS = 150;
const MAX_PAGES = 80;
const DIFF_MODE = process.argv.includes('--diff');

// Implant/system pages that become the product catalogue (vs generic pages)
const PRODUCT_SLUGS = new Set([
  'arch-it', 'anchor-it', 'screwit', 'nail-it', 'fuse-it', 'loopit',
  'frame-it', 'graft-it', 'integrant-screw-sets', 'integrant-screw-removal-set',
  'integrant-2-5mm-screw', 'anterior-ankle-fusion-set',
  'integrant-anterior-ankle-fusion-set',
]);
const BIO_SLUGS = new Set(['frame-it', 'graft-it']);

// Legacy path → new-site route (drives INDEX + redirects draft)
const ROUTE_MAP = {
  '/': '/',
  '/home/': '/',
  '/about-us/': '/about',
  '/contact/': '/contact',
  '/explore-products/': '/products',
  '/bio-tech/': '/products/bio-tech',
  '/supplier/': '/partners',
  '/pricing/': '/for-surgeons',
  '/amenities/': '/for-surgeons',
  '/clinical-images/': '/clinical-images',
  '/shop/': '/products',
  '/arch-it/': '/products/med-tech/archit',
  '/anchor-it/': '/products/med-tech/anchorit',
  '/screwit/': '/products/med-tech/screwit',
  '/nail-it/': '/products/med-tech/nailit',
  '/fuse-it/': '/products/med-tech/fuseit',
  '/loopit/': '/products/med-tech/loopit',
  '/integrant-screw-sets/': '/products/med-tech/screw-sets',
  '/integrant-screw-removal-set/': '/products/med-tech/screw-removal-set',
  '/integrant-2-5mm-screw/': '/products/med-tech/2-5mm-screw',
  '/anterior-ankle-fusion-set/': '/products/med-tech/ankle-fusion-set',
  '/integrant-anterior-ankle-fusion-set/': '/products/med-tech/ankle-fusion-set',
  '/frame-it/': '/products/bio-tech/frameit',
  '/graft-it/': '/products/bio-tech/graftit',
};
const DROP = new Set(['/sample-page/', '/hello-world/']);
// /home/ and the U+200B dupe are redirect-only (drop content, keep redirect)
const REDIRECT_ONLY = new Set(['/home/', '/integrant-anterior-ankle-fusion-set/']);

const CLAIM_KEYWORDS = [
  'treat', 'cure', 'heal', 'regenerat', 'clinical result', 'outcome',
  'pain relief', 'recovery', 'approved', 'tga', 'indication', 'therapy',
  'therapeutic', 'guarantee', 'proven',
];

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
td.use(gfm);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const normUrl = (u) => u.normalize('NFKC').replace(/[​‌‍﻿]/g, '');
const slugOf = (u) => {
  const p = new URL(u).pathname;
  return p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '__');
};
const pathOf = (u) => {
  let p = new URL(normUrl(u)).pathname;
  if (!p.endsWith('/')) p += '/';
  return p;
};

async function fetchWithRetry(url, asText = true) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      if (!res.ok) {
        if (attempt === 0) { await sleep(1000); continue; }
        return { ok: false, status: res.status };
      }
      return { ok: true, status: res.status, body: asText ? await res.text() : Buffer.from(await res.arrayBuffer()) };
    } catch (err) {
      if (attempt === 0) { await sleep(1500); continue; }
      return { ok: false, status: 0, error: String(err) };
    }
  }
}

// --- 1. Collect URLs from sitemaps ---
async function sitemapUrls() {
  const urls = new Set();
  for (const sm of ['page-sitemap.xml', 'product-sitemap.xml', 'post-sitemap.xml']) {
    const res = await fetchWithRetry(`${ORIGIN}/${sm}`);
    if (!res.ok) continue;
    for (const m of res.body.matchAll(/<loc><!\[CDATA\[([^\]]+)\]\]><\/loc>/g)) {
      urls.add(normUrl(m[1]));
    }
    await sleep(DELAY_MS);
  }
  return urls;
}

function isCrawlable(href) {
  if (!href) return false;
  let u;
  try { u = new URL(href, ORIGIN); } catch { return false; }
  if (u.origin !== ORIGIN) return false;
  if (u.search || u.hash) return false;
  const p = u.pathname;
  if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mov|css|js|xml)$/i.test(p)) return false;
  if (/^\/(wp-|feed|comments|cart|checkout|my-account|tag|author|product-category)/.test(p)) return false;
  return true;
}

// --- 2. Extraction helpers ---
function extractMain($) {
  let main = $('[data-elementor-type="wp-page"]').first();
  if (!main.length) main = $('main').first();
  if (!main.length) main = $('#content').first();
  if (!main.length) main = $('body');
  const clone = load(`<div>${main.html() ?? ''}</div>`);
  clone('script, style, noscript, header, footer, nav, form, .elementor-location-header, .elementor-location-footer, .elementor-menu-toggle').remove();
  return clone;
}

function bestImgUrl(el, $) {
  const srcset = $(el).attr('srcset') || $(el).attr('data-srcset');
  if (srcset) {
    const candidates = srcset.split(',').map((s) => {
      const [u, w] = s.trim().split(/\s+/);
      return { u, w: parseInt(w) || 0 };
    });
    candidates.sort((a, b) => b.w - a.w);
    if (candidates[0]?.u) return candidates[0].u;
  }
  return $(el).attr('src') || $(el).attr('data-src') || null;
}

const originalRes = (u) => u.replace(/-\d{2,4}x\d{2,4}(\.\w{3,4})$/, '$1');

function complianceScan(text) {
  const lower = text.toLowerCase();
  return CLAIM_KEYWORDS.filter((k) => lower.includes(k));
}

const yamlStr = (v) => JSON.stringify(v ?? '');

// --- main ---
const report = { fetched: [], failed: [], discovered: [], assets: { ok: 0, failed: [], skippedLarge: [], videos: [] }, hashDrift: [] };
const assetQueue = new Map(); // remoteUrl -> { name, fallback }
const usedNames = new Map();

function queueAsset(remote, fallback = null) {
  const clean = normUrl(remote.split('?')[0]);
  if (assetQueue.has(clean)) return assetQueue.get(clean).name;
  let name = path.basename(new URL(clean, ORIGIN).pathname) || `asset-${hash(clean)}`;
  if (usedNames.has(name) && usedNames.get(name) !== clean) {
    const ext = path.extname(name);
    name = `${path.basename(name, ext)}-${hash(clean).slice(0, 6)}${ext}`;
  }
  usedNames.set(name, clean);
  assetQueue.set(clean, { name, fallback: fallback && fallback !== clean ? fallback : null });
  return name;
}

for (const dir of ['raw', 'pages', 'products', 'shop', 'assets', 'structured', 'screenshots']) {
  await mkdir(path.join(OUT, dir), { recursive: true });
}

console.log('▸ collecting sitemap urls…');
const queue = [...(await sitemapUrls())];
const seen = new Set(queue.map(pathOf));
console.log(`  ${queue.length} sitemap urls`);

const structured = { products: [], shop: [], seo: [], forms: [], navigation: null, siteFacts: null };
const pages = [];

let i = 0;
while (i < queue.length && i < MAX_PAGES) {
  const url = normUrl(queue[i++]);
  const res = await fetchWithRetry(url);
  await sleep(DELAY_MS);
  if (!res.ok) { report.failed.push({ url, status: res.status }); continue; }
  const html = res.body;
  const $ = load(html);
  const p = pathOf(url);
  const slug = slugOf(url);

  // discover internal links not in sitemap
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (!isCrawlable(href)) return;
    const cp = pathOf(new URL(href, ORIGIN).href);
    if (!seen.has(cp)) {
      seen.add(cp);
      queue.push(new URL(cp, ORIGIN).href);
      report.discovered.push(cp);
    }
  });

  // raw
  await writeFile(path.join(OUT, 'raw', `${slug}.html`), html);

  const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  const main = extractMain($);
  const headingOutline = [];
  main('h1, h2, h3').each((_, h) => {
    const t = main(h).text().trim().replace(/\s+/g, ' ');
    if (t) headingOutline.push(`${h.tagName}: ${t}`);
  });

  // images + docs → queue assets, rewrite refs
  const images = [];
  main('img').each((_, img) => {
    const src = bestImgUrl(img, main);
    if (!src || src.startsWith('data:')) { main(img).remove(); return; }
    const abs = new URL(src, ORIGIN).href;
    const orig = originalRes(abs);
    const name = queueAsset(orig, abs);
    images.push({ file: name, alt: main(img).attr('alt') || '', legacyUrl: abs });
    main(img).attr('src', `../assets/${name}`);
    main(img).removeAttr('srcset').removeAttr('data-srcset').removeAttr('data-src');
  });
  const docs = [];
  main('a[href*="wp-content/uploads"]').each((_, a) => {
    const href = new URL(main(a).attr('href'), ORIGIN).href;
    if (/\.(mp4|mov|webm|avi)$/i.test(href)) { report.assets.videos.push(href); return; }
    const name = queueAsset(href);
    docs.push({ file: name, text: main(a).text().trim(), legacyUrl: href });
    main(a).attr('href', `../assets/${name}`);
  });

  const bodyText = main('div').first().text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(' ').length : 0;
  const contentHash = hash(bodyText);
  const complianceFlags = complianceScan(bodyText);
  const markdown = td.turndown(main('div').first().html() ?? '');

  const isShop = p.startsWith('/product/');
  const coreSlug = p.replace(/^\/|\/$/g, '');
  const isProduct = PRODUCT_SLUGS.has(coreSlug);
  const bucket = isShop ? 'shop' : isProduct ? 'products' : 'pages';

  const fm = [
    '---',
    `url: ${yamlStr(url)}`,
    `path: ${yamlStr(p)}`,
    `title: ${yamlStr(title)}`,
    `metaDescription: ${yamlStr(metaDescription)}`,
    `canonical: ${yamlStr(canonical)}`,
    `ogImage: ${yamlStr(ogImage)}`,
    `scrapedAt: ${yamlStr(new Date().toISOString())}`,
    `contentHash: ${yamlStr(contentHash)}`,
    `wordCount: ${wordCount}`,
    `headingOutline: ${JSON.stringify(headingOutline)}`,
    `images: ${JSON.stringify(images)}`,
    `docs: ${JSON.stringify(docs)}`,
    `complianceFlags: ${JSON.stringify(complianceFlags)}`,
    '---',
    '',
  ].join('\n');
  if (!DIFF_MODE) {
    await writeFile(path.join(OUT, bucket, `${slug}.md`), fm + markdown + '\n');
  } else {
    try {
      const prev = await readFile(path.join(OUT, bucket, `${slug}.md`), 'utf8');
      const prevHash = prev.match(/contentHash: "([0-9a-f]+)"/)?.[1];
      if (prevHash && prevHash !== contentHash) report.hashDrift.push(p);
    } catch { report.hashDrift.push(`${p} (new)`); }
  }

  // SEO record
  structured.seo.push({ path: p, title, metaDescription, canonical, ogImage, h1: headingOutline.find((h) => h.startsWith('h1')) ?? '' });

  // forms
  $('form').each((_, f) => {
    const fields = [];
    $(f).find('input, textarea, select').each((_, el) => {
      const type = $(el).attr('type') || el.tagName;
      if (['hidden', 'submit'].includes(type)) return;
      fields.push({ name: $(el).attr('name') || '', type, placeholder: $(el).attr('placeholder') || '' });
    });
    if (fields.length) structured.forms.push({ page: p, action: $(f).attr('action') || '', fields });
  });

  // spec tables → structured products
  if (isProduct) {
    const tables = [];
    main('table').each((_, t) => {
      const rows = [];
      main(t).find('tr').each((_, tr) => {
        const cells = [];
        main(tr).find('th, td').each((_, c) => cells.push(main(c).text().trim().replace(/\s+/g, ' ')));
        if (cells.some(Boolean)) rows.push(cells);
      });
      if (rows.length) tables.push(rows);
    });
    structured.products.push({
      slug: coreSlug,
      name: (headingOutline.find((h) => h.startsWith('h1')) ?? title).replace(/^h1:\s*/, ''),
      line: BIO_SLUGS.has(coreSlug) ? 'bio-tech' : 'med-tech',
      path: p,
      targetRoute: ROUTE_MAP[p] ?? null,
      specTables: tables,
      images,
      docs,
      wordCount,
      complianceFlags,
    });
  }

  // WooCommerce shop items
  if (isShop) {
    structured.shop.push({
      slug: coreSlug.replace('product/', ''),
      name: title,
      path: p,
      price: $('.price').first().text().trim().replace(/\s+/g, ' '),
      sku: $('.sku').first().text().trim(),
      categories: $('.posted_in a').map((_, a) => $(a).text().trim()).get(),
      gallery: images.map((im) => im.file),
      shortDescription: $('.woocommerce-product-details__short-description').text().trim().replace(/\s+/g, ' '),
    });
  }

  // navigation + site facts from the homepage
  if (p === '/') {
    const nav = { header: [], footer: [] };
    $('header a[href], .elementor-location-header a[href], nav a[href]').each((_, a) => {
      const t = $(a).text().trim().replace(/\s+/g, ' ');
      if (t) nav.header.push({ text: t, href: $(a).attr('href') });
    });
    $('footer a[href], .elementor-location-footer a[href]').each((_, a) => {
      const t = $(a).text().trim().replace(/\s+/g, ' ');
      if (t) nav.footer.push({ text: t, href: $(a).attr('href') });
    });
    structured.navigation = nav;
  }

  const full = $('body').text();
  if (p === '/' || p === '/contact/') {
    const facts = structured.siteFacts ?? { phones: [], emails: [], abn: [], socials: [], addressCandidates: [] };
    for (const m of full.matchAll(/(?:\+61|\(0\d\)|0\d)[\d\s()-]{7,12}/g)) facts.phones.push(m[0].trim().replace(/\s+/g, ' '));
    for (const m of full.matchAll(/[\w.+-]+@[\w-]+\.[\w.]+/g)) facts.emails.push(m[0]);
    for (const m of full.matchAll(/ABN[:\s]*(\d{2}\s?\d{3}\s?\d{3}\s?\d{3})/gi)) facts.abn.push(m[1]);
    $('a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"], a[href*="twitter"], a[href*="youtube"]').each((_, a) => facts.socials.push($(a).attr('href')));
    for (const m of full.matchAll(/\d+[\w\s/,-]{5,60}(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Place|Pl|Parade|Hwy|Highway)[\w\s,]{0,40}(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s*\d{4}/gi)) facts.addressCandidates.push(m[0].replace(/\s+/g, ' ').trim());
    facts.phones = [...new Set(facts.phones)];
    facts.emails = [...new Set(facts.emails)];
    facts.abn = [...new Set(facts.abn)];
    facts.socials = [...new Set(facts.socials)];
    facts.addressCandidates = [...new Set(facts.addressCandidates)];
    structured.siteFacts = facts;
  }

  pages.push({ path: p, slug, bucket, title, wordCount, imageCount: images.length, complianceFlags });
  report.fetched.push(p);
  console.log(`  ✓ ${p} (${bucket}, ${wordCount}w, ${images.length}img)`);
}

if (DIFF_MODE) {
  console.log(`\n▸ diff complete: ${report.hashDrift.length} page(s) drifted`);
  for (const d of report.hashDrift) console.log(`  Δ ${d}`);
  process.exit(0);
}

// --- 3. Download assets (originals with sized fallback) ---
console.log(`\n▸ downloading ${assetQueue.size} assets…`);
for (const [remote, { name, fallback }] of assetQueue) {
  const dest = path.join(OUT, 'assets', name);
  if (existsSync(dest)) { report.assets.ok++; continue; }
  let res = await fetchWithRetry(remote, false);
  if (!res.ok && fallback) {
    // stripped "original" doesn't exist — take the sized variant we saw on-page
    res = await fetchWithRetry(fallback, false);
  }
  if (!res.ok) {
    report.assets.failed.push({ remote, status: res.status });
    continue;
  }
  if (res.body.length > 20 * 1024 * 1024) {
    report.assets.skippedLarge.push({ remote, bytes: res.body.length });
    continue;
  }
  await writeFile(dest, res.body);
  report.assets.ok++;
  await sleep(ASSET_DELAY_MS);
}

// --- 4. Structured outputs ---
const w = (f, data) => writeFile(path.join(OUT, 'structured', f), JSON.stringify(data, null, 2));
await w('products.json', structured.products);
await w('shop.json', structured.shop);
await w('seo.json', structured.seo);
await w('forms.json', structured.forms);
await w('navigation.json', structured.navigation);
await w('site-facts.json', structured.siteFacts);

// --- 5. INDEX.md + redirects draft ---
const disposition = (p, bucket) => {
  if (DROP.has(p)) return 'drop';
  if (REDIRECT_ONLY.has(p)) return 'drop (redirect only)';
  if (bucket === 'shop') return 'archive (Phase 2 shop)';
  if (bucket === 'products') return 'migrate → rewrite';
  return 'rewrite';
};
const rows = pages
  .sort((a, b) => a.path.localeCompare(b.path))
  .map((pg) => `| \`${pg.path}\` | ${pg.bucket} | ${pg.title.replace(/\|/g, '·').slice(0, 48)} | ${pg.wordCount} | ${pg.imageCount} | ${pg.complianceFlags.length ? '⚑ ' + pg.complianceFlags.slice(0, 3).join(', ') : '—'} | ${disposition(pg.path, pg.bucket)} | ${ROUTE_MAP[pg.path] ?? (pg.bucket === 'shop' ? '(shop, Phase 2)' : 'TBD')} |`);
const index = `# Legacy Content Inventory — integrant.com.au
Scraped: ${new Date().toISOString()} · ${pages.length} URLs · ${assetQueue.size} assets · re-sync with \`npm run scrape:diff\`

| Legacy path | Type | Title | Words | Imgs | Compliance flags | Disposition | New route |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}

**Image grading:** legacy imagery defaults to \`reshoot\` for hero/marketing use; product renders and clinical photography in \`assets/\` graded \`usable\` case-by-case during the rewrite pass.
**Compliance:** ⚑ rows carry claim-adjacent language — TGA review before any copy migrates.
**Videos (not downloaded):** ${report.assets.videos.length ? report.assets.videos.join(', ') : 'none found'}
`;
await writeFile(path.join(OUT, 'INDEX.md'), index);

const redirects = Object.entries(ROUTE_MAP)
  .filter(([from, to]) => from !== to && from !== '/')
  .map(([from, to]) => ({ source: from.replace(/\/$/, ''), destination: to, permanent: true }));
await writeFile(path.join(OUT, 'redirects.draft.json'), JSON.stringify(redirects, null, 2));

// --- 6. Report ---
const summary = {
  pagesFetched: report.fetched.length,
  discoveredBeyondSitemap: report.discovered,
  pageFailures: report.failed,
  assets: { downloaded: report.assets.ok, failed: report.assets.failed, skippedLarge: report.assets.skippedLarge, videos: report.assets.videos },
};
await writeFile(path.join(OUT, 'scrape-report.json'), JSON.stringify(summary, null, 2));
console.log('\n▸ done');
console.log(`  pages: ${summary.pagesFetched} (+${report.discovered.length} discovered) · failures: ${report.failed.length}`);
console.log(`  assets: ${report.assets.ok} ok · ${report.assets.failed.length} failed · ${report.assets.skippedLarge.length} skipped-large`);
if (report.failed.length) console.log('  FAILED PAGES:', JSON.stringify(report.failed));
if (report.assets.failed.length) console.log('  FAILED ASSETS:', JSON.stringify(report.assets.failed.slice(0, 10)));
