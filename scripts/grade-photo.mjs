// Photography grading pipeline — every licensed source image is graded into
// the monolith system: grayscale, mild contrast lift, role-sized, mozjpeg.
// Sources live in brand/photo-src/ (repo-only, never deployed); graded
// derivatives land in public/photo/. Re-run after adding/replacing a source:
//   node scripts/grade-photo.mjs
// The manifest of record (licenses, photographers, placements) is
// src/data/photography.ts.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

// First-party legacy-capture cutouts (brand/legacy-capture/): graded to
// grayscale WebP with alpha preserved. `alpha: true` switches the pipeline —
// fit 'inside' (never crop a cutout) and no linear() lift, which would also
// rescale the alpha channel and fog the transparency.
const FRAMEIT = [1, 2, 3, 4].flatMap((n) => [
  // 1400w for large/retina wells + 700w for the srcset's mobile/default pick
  { src: `brand/legacy-capture/${n}.png`, out: `public/photo/products/frameit-0${n}.webp`, width: 1400, quality: 78, alpha: true },
  { src: `brand/legacy-capture/${n}.png`, out: `public/photo/products/frameit-0${n}-700.webp`, width: 700, quality: 78, alpha: true },
]);

const ANATOMY = Object.entries({
  '1-2': 'foot-ankle',
  '2-2': 'shoulder',
  '3-2': 'hand-wrist',
  '4-4': 'spine',
  '5-1': 'hip',
  '6-1': 'knee',
  '7-1': 'elbow',
}).map(([file, region]) => ({
  src: `brand/legacy-capture/${file}.png`,
  out: `public/photo/anatomy/${region}.webp`,
  width: 900,
  quality: 74,
  alpha: true,
}));

// Archive product images promoted by the visual triage (14 Aug 2026) —
// sources staged in brand/legacy-capture/products-src/ so content-archive/
// itself is never read by the build. Rejected during the same review:
// AnchorIT + LoopIT technique illustrations (instructional), NailIT clinical
// photo + patient X-rays (consent posture), LoopIT wire cutout (washed out).
const ARCHIVE_PRODUCTS = [
  ['1-09ca6e', 'screw-removal-01', 1400],
  ['1-09ca6e', 'screw-removal-01-700', 700],
  ['3-d66989', 'screw-removal-02', 1400],
  ['3-d66989', 'screw-removal-02-700', 700],
  ['2-e14271', 'screw-removal-03', 1400],
  ['2-e14271', 'screw-removal-03-700', 700],
  ['3mm-e1592316643165', 'screw-sets-01', 700],
  ['4mm', 'screw-sets-02', 700],
  ['666mm', 'screw-sets-03', 700],
  ['4-1', 'graftit-01', 800],
  ['Integrant-Anterior-Ankle-Fusion', 'ankle-fusion-01', 700],
].map(([file, out, width]) => ({
  src: `brand/legacy-capture/products-src/${file}.png`,
  out: `public/photo/products/${out}.webp`,
  width,
  quality: 78,
  alpha: true,
}));

const JOBS = [
  ...FRAMEIT,
  ...ANATOMY,
  ...ARCHIVE_PRODUCTS,
  // role: backdrop = 1920w q68 · plate = 1200w q78
  { src: 'brand/photo-src/theatre.jpg', out: 'public/photo/theatre.jpg', width: 1920, height: 1080, quality: 68, position: 'attention' },
  { src: 'brand/photo-src/theatre.jpg', out: 'public/photo/theatre-lights.jpg', width: 1920, height: 700, quality: 68, region: { left: 0, top: 0, width: 2400, height: 900 } },
  { src: 'brand/photo-src/metal.jpg', out: 'public/photo/metal.jpg', width: 1600, height: 900, quality: 52, blur: 1.4 }, // high-frequency detail; sits under a 60% scrim
  { src: 'brand/photo-src/sydney-day.jpg', out: 'public/photo/sydney-day.jpg', width: 1920, height: 1080, quality: 56, blur: 0.8 },
  { src: 'brand/photo-src/sydney-night.jpg', out: 'public/photo/sydney-night.jpg', width: 1920, height: 1080, quality: 68, position: 'attention' },
  { src: 'brand/photo-src/tray.jpg', out: 'public/photo/tray.jpg', width: 1200, height: 800, quality: 78 },
  { src: 'brand/photo-src/phone.jpg', out: 'public/photo/phone.jpg', width: 1200, height: 800, quality: 78 },
];

mkdirSync('public/photo', { recursive: true });
mkdirSync('public/photo/products', { recursive: true });
mkdirSync('public/photo/anatomy', { recursive: true });
for (const job of JOBS) {
  let img = sharp(job.src);
  if (job.region) img = img.extract(job.region);
  let pipeline = img.grayscale();
  if (job.blur) pipeline = pipeline.blur(job.blur);
  const info = job.alpha
    ? await pipeline
        .resize(job.width, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: job.quality })
        .toFile(job.out)
    : await pipeline
        .linear(1.08, -8) // mild contrast lift — the monolith grade
        .resize(job.width, job.height, { fit: 'cover', position: job.position ?? 'centre' })
        .jpeg({ quality: job.quality, mozjpeg: true })
        .toFile(job.out);
  console.log(job.out.padEnd(36), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}
