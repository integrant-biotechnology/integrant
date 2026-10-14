// Responsive WebP derivatives for the ambience photography and the founder
// portrait. The JPEG originals stay as the fallback `src`; pages serve the
// derivatives through `srcset` (src/lib/photo.ts), driven by the manifest
// this script writes. A width is kept only if it is narrower than the
// original and its WebP is smaller than the JPEG — otherwise the JPEG wins.
// Re-run after replacing a photo:  node scripts/derive-photos.mjs
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WIDTHS = [800, 1600];
const sources = [
  ...readdirSync(path.join(root, 'public/photo')).filter((f) => f.endsWith('.jpg')).map((f) => `/photo/${f}`),
  '/founder/gordon-slater.jpg',
];

const manifest = {};
for (const src of sources) {
  const file = path.join(root, 'public', src);
  const original = statSync(file).size;
  const { width } = await sharp(file).metadata();
  const variants = [];
  for (const w of WIDTHS.filter((w) => w < width)) {
    const outRel = src.replace(/\.jpg$/, `-${w}.webp`);
    const out = path.join(root, 'public', outRel);
    const info = await sharp(file).resize({ width: w }).webp({ quality: 74 }).toFile(out);
    if (info.size >= original) {
      unlinkSync(out);
      continue;
    }
    variants.push([outRel, w]);
  }
  // The original's own width, as WebP, when it beats the JPEG.
  const fullRel = src.replace(/\.jpg$/, '.webp');
  const fullOut = path.join(root, 'public', fullRel);
  const full = await sharp(file).webp({ quality: 74 }).toFile(fullOut);
  if (full.size < original) variants.push([fullRel, width]);
  else {
    unlinkSync(fullOut);
    // Keep the JPEG itself as the widest candidate so large screens never
    // get an upscaled smaller derivative.
    if (variants.length) variants.push([src, width]);
  }
  if (variants.length) manifest[src] = variants;
  console.log(src, `${Math.round(original / 1024)} KB jpg →`, variants.map(([f, w]) => `${w}w`).join(', ') || 'kept as jpg');
}
writeFileSync(path.join(root, 'src/data/photo-derivatives.json'), JSON.stringify(manifest, null, 2) + '\n');
