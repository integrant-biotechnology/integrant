// Photography grading pipeline — every licensed source image is graded into
// the monolith system: grayscale, mild contrast lift, role-sized, mozjpeg.
// Sources live in brand/photo-src/ (repo-only, never deployed); graded
// derivatives land in public/photo/. Re-run after adding/replacing a source:
//   node scripts/grade-photo.mjs
// The manifest of record (licenses, photographers, placements) is
// src/data/photography.ts.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const JOBS = [
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
for (const job of JOBS) {
  let img = sharp(job.src);
  if (job.region) img = img.extract(job.region);
  let pipeline = img.grayscale();
  if (job.blur) pipeline = pipeline.blur(job.blur);
  const info = await pipeline
    .linear(1.08, -8) // mild contrast lift — the monolith grade
    .resize(job.width, job.height, { fit: 'cover', position: job.position ?? 'centre' })
    .jpeg({ quality: job.quality, mozjpeg: true })
    .toFile(job.out);
  console.log(job.out.padEnd(36), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}
