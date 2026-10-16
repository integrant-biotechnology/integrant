// Copy gate: scans the visible text of every built page and fails on wording
// that must never ship —
//   1. "unfinished" tells: placeholder states a visitor reads as a site that
//      is not ready (pending, provisioning, in preparation, …);
//   2. therapeutic or outcome claims (TGA medical-device advertising rules);
//   3. securities-promotion language on a site that discusses a capital raise.
// A page that legitimately needs one of these phrases gets an explicit entry
// in ALLOW — route + rule id — so every exception is reviewed, not accidental.
//
// Usage: npm run build && node scripts/audit-copy.mjs
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { HTML_FILES, dist } from './routes.mjs';

const RULES = [
  // --- unfinished tells ---------------------------------------------------
  { id: 'pending', group: 'unfinished', re: /\bpending\b/i },
  { id: 'provisioning', group: 'unfinished', re: /\bprovisioning\b/i },
  { id: 'gated', group: 'unfinished', re: /\bgated\b/i },
  { id: 'in-preparation', group: 'unfinished', re: /\bin preparation\b/i },
  { id: 'in-review', group: 'unfinished', re: /\b(?:in|under) review\b/i },
  { id: 'site-rebuild', group: 'unfinished', re: /\bsite rebuild\b/i },
  { id: 'portfolio-in-development', group: 'unfinished', re: /\bportfolio in development\b/i },
  { id: 'coming-soon', group: 'unfinished', re: /\bcoming soon\b/i },
  { id: 'tbc', group: 'unfinished', re: /\bTB[CD]\b/ },
  { id: 'lorem', group: 'unfinished', re: /\blorem ipsum\b/i },
  { id: 'being-consolidated', group: 'unfinished', re: /\bbeing (?:consolidated|connected)\b/i },
  // --- therapeutic / outcome claims --------------------------------------
  { id: 'disease-modifying', group: 'therapeutic', re: /\bdisease[- ]modifying\b/i },
  { id: 'efficacy', group: 'therapeutic', re: /\b(?:superior|proven|greater) efficacy\b/i },
  { id: 'cure', group: 'therapeutic', re: /\bcures?\b/i },
  { id: 'clinically-proven', group: 'therapeutic', re: /\bclinically proven\b/i },
  { id: 'better-alternative', group: 'therapeutic', re: /\bbetter alternative\b/i },
  { id: 'faster-healing', group: 'therapeutic', re: /\b(?:faster|accelerated?s?|improved) (?:bone )?healing\b/i },
  { id: 'reduces-need', group: 'therapeutic', re: /\breduc\w+ the need for\b/i },
  { id: 'treatment-claim', group: 'therapeutic', re: /\b(?:non-invasive|effective|breakthrough) (?:treatment|therapy)\b/i },
  // --- securities promotion ----------------------------------------------
  { id: 'invest-now', group: 'securities', re: /\binvest (?:now|today)\b/i },
  { id: 'guaranteed', group: 'securities', re: /\bguaranteed?\b/i },
  { id: 'highly-anticipated', group: 'securities', re: /\bhighly anticipated\b/i },
  { id: 'buy-shares', group: 'securities', re: /\b(?:buy|purchase) shares\b/i },
  { id: 'valuation', group: 'securities', re: /\bvaluations?\b/i },
  // --- Wassup platform: build-side detail that must stay off the site ------
  { id: 'pilot-customer', group: 'wassup', re: /\b(?:Regen-U|Caponas)\b/i },
  { id: 'drug-discovery', group: 'wassup', re: /\bdrug discovery\b/i },
  { id: 'retired-wassup-name', group: 'wassup', re: /\bWassup (?:Copilot|Voice|Counsel|Spider)\b/i },
  { id: 'integrant-app', group: 'wassup', re: /\bIntegrant app\b/i },
];

// route → rule ids that are legitimately present there.
const ALLOW = {};

const routeOf = (file) => {
  const rel = path.relative(dist, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
};

const failures = [];
for (const file of HTML_FILES) {
  const route = routeOf(file);
  // textContent glues adjacent elements together ("BIOLOGICSGATED"), which
  // defeats word-boundary matching — pad every tag so words stay separate.
  const $ = cheerio.load(readFileSync(file, 'utf8').replace(/</g, ' <'));
  $('script, style, noscript, template').remove();
  // Meta copy is published copy too (search results, link previews).
  const meta = $('meta[name="description"], meta[property="og:description"], meta[property="og:title"]')
    .map((_, el) => $(el).attr('content') ?? '')
    .get()
    .join(' \n ');
  const attrs = $('[alt], [aria-label], [title]')
    .map((_, el) => [$(el).attr('alt'), $(el).attr('aria-label'), $(el).attr('title')].filter(Boolean).join(' '))
    .get()
    .join(' \n ');
  const text = [$('title').text(), meta, attrs, $('body').text()].join(' \n ').replace(/\s+/g, ' ');

  for (const rule of RULES) {
    if (ALLOW[route]?.includes(rule.id)) continue;
    const match = rule.re.exec(text);
    if (!match) continue;
    const at = match.index;
    const excerpt = text.slice(Math.max(0, at - 50), at + match[0].length + 50).trim();
    failures.push(`[${rule.group}/${rule.id}] ${route} — …${excerpt}…`);
  }
}

if (failures.length) {
  console.error(`COPY GATE FAILED — ${failures.length} finding(s):`);
  failures.forEach((f) => console.error('  ' + f));
  process.exit(1);
}
console.log(`Copy gate clean: ${HTML_FILES.length} pages, ${RULES.length} rules, no unfinished tells or regulated claims.`);
