# Legacy homepage capture — salvage record (14 Aug 2026)

Source: user-saved copy of the live https://integrant.com.au homepage
("Biotechnology & Orthopaedic Medical Devices _ Integrant_files", 132 files).
The 114 WordPress/Elementor css/js files were deleted (reproducible junk);
the 15 images below were moved here. This folder sits under /brand and is
excluded from deployment by .vercelignore — nothing here ships directly.

## Dedupe vs content-archive/assets (MD5)

| File | Content | Status |
|---|---|---|
| 1.png | FrameIT ring assembly (photo, transparent bg, ~2300px) | DUPLICATE of archive asset |
| 2.png | FrameIT tower assembly, Integrant mark visible | DUPLICATE of archive asset |
| 3.png | FrameIT U-frame / foot plate assembly | DUPLICATE of archive asset |
| 4.png | FrameIT triple-ring stack (fourth distinct view) | DUPLICATE of archive asset |
| 1-2.png | Anatomy illustration — foot & ankle (1057²) | NET-NEW |
| 2-2.png | Anatomy illustration — shoulder | NET-NEW |
| 3-2.png | Anatomy illustration — hand & wrist | NET-NEW |
| 4-4.png | Anatomy illustration — spine (posterior torso, interbody device) | NET-NEW |
| 5-1.png | Anatomy illustration — hip / upper leg | NET-NEW |
| 6-1.png | Anatomy illustration — knee | NET-NEW |
| 7-1.png | Anatomy illustration — elbow / upper limb | NET-NEW |
| Integrant-logo-81x74.png · logov3 · logov5 ×2 | Legacy logo lockups (raster; logov5 carries the old tagline) | NET-NEW, not adopted — no more vector data than our current trace; tagline is puffery vs the no-hype voice |

The seven illustrations are the legacy homepage anatomy-carousel art that was
lost to a slug collision during the original scrape — the only material here
the archive did not already hold at quality.

## Usage

- 1.png–4.png → graded to grayscale WebP-with-alpha at
  `public/photo/products/frameit-01..04.webp`, shown via ProductViewer on
  /products/med-tech/frameit. First-party provenance recorded in
  src/data/photography.ts.
- 1-2 … 7-1 → graded to 900px grayscale WebP at
  `public/photo/anatomy/<region>.webp`, mounted on the /for-surgeons anatomy
  index via `ANATOMY_AREAS[].illustration`. One per region;
  `external-fixators` intentionally has none (its product page carries the
  real FrameIT photography).
- Regrade after any change: `node scripts/grade-photo.mjs`.

TGA posture: illustrations are descriptive anatomy with device-placement
markers — captions stay generic, no outcome or indication language.
