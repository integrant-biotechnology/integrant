/**
 * WCAG contrast audit for the theme token scale.
 *
 * Colour decisions in a dual-theme system are easy to get wrong in whichever
 * theme you weren't looking at. This asserts every ink × surface pair in both
 * themes (and inside contrast bands) rather than trusting the eye.
 *
 * Usage: node scripts/audit-contrast.mjs
 */

const THEMES = {
  dark: {
    surfaces: { base: '#050505', raised: '#0a0a0a', inset: '#0f0f0f' },
    inks: {
      ink: 'rgba(245,245,245,1)',
      'ink-2': 'rgba(255,255,255,0.62)',
      'ink-3': 'rgba(255,255,255,0.48)',
    },
  },
  light: {
    surfaces: { base: '#ffffff', raised: '#fafafa', inset: '#f2f2f2' },
    inks: {
      ink: 'rgba(10,10,10,1)',
      'ink-2': 'rgba(10,10,10,0.68)',
      'ink-3': 'rgba(10,10,10,0.58)',
    },
  },
  'contrast band': {
    surfaces: { base: '#000000', raised: '#050505', inset: '#0d0d0d' },
    inks: {
      ink: 'rgba(245,245,245,1)',
      'ink-2': 'rgba(255,255,255,0.62)',
      'ink-3': 'rgba(255,255,255,0.48)',
    },
  },
};

// ink-3 carries readouts/labels, which are uppercase Rajdhani at ~11px —
// small text, so it is held to the 4.5:1 bar, not the 3:1 large-text bar.
const MIN = 4.5;

const parse = (c) => {
  if (c.startsWith('#')) {
    const h = c.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const [r, g, b, a = '1'] = c.match(/[\d.]+/g);
  return [+r, +g, +b, +a];
};

const over = (fg, bg) => {
  const [fr, fg_, fb, fa] = parse(fg);
  const [br, bg_, bb] = parse(bg);
  return [fr * fa + br * (1 - fa), fg_ * fa + bg_ * (1 - fa), fb * fa + bb * (1 - fa)];
};

const lum = ([r, g, b]) => {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const ratio = (fg, bg) => {
  const a = lum(over(fg, bg));
  const b = lum(parse(bg).slice(0, 3));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

let failures = 0;
for (const [theme, { surfaces, inks }] of Object.entries(THEMES)) {
  console.log(`\n${theme}`);
  for (const [sName, s] of Object.entries(surfaces)) {
    for (const [iName, i] of Object.entries(inks)) {
      const r = ratio(i, s);
      const ok = r >= MIN;
      if (!ok) failures++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${iName.padEnd(6)} on ${sName.padEnd(7)} ${r.toFixed(2)}:1`);
    }
  }
}

console.log(
  failures === 0
    ? `\nAll pairs clear WCAG AA (${MIN}:1).`
    : `\n${failures} pair(s) BELOW ${MIN}:1 — fix before shipping.`
);
process.exit(failures === 0 ? 0 : 1);
