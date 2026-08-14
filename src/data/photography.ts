// Photography manifest — the licensing record for every image on the site.
// All images are free-license (Unsplash License: commercial use permitted,
// no attribution required — attribution kept here as professional record
// and for client handover). Sources in brand/photo-src/ (never deployed);
// graded derivatives in public/photo/ via scripts/grade-photo.mjs.
//
// USAGE CONTRACT (TGA + honesty): these are AMBIENCE ONLY. None may be
// captioned or presented as Integrant's products, staff, facilities or
// clinical work. No identifiable faces, no third-party device branding.
// The client can replace any entry 1:1 with commissioned photography.

export interface PhotoRecord {
  file: string; // public/photo/<file>
  role: 'backdrop' | 'plate' | 'product' | 'illustration';
  usedOn: string;
  subject: string;
  photographer: string;
  source: string;
  license: 'Unsplash License' | 'First party (Integrant)';
}

// First-party assets salvaged from the legacy site capture
// (brand/legacy-capture/ — see its README for the dedupe record). These are
// Integrant's own product photography and commissioned illustration; the
// ambience-only rule above does not apply to them, but the TGA rules do:
// generic captions, no outcome or indication language.
const FIRST_PARTY: PhotoRecord[] = [
  ...[1, 2, 3, 4].map((n) => ({
    file: `products/frameit-0${n}.webp`,
    role: 'product' as const,
    usedOn: '/products/bio-tech/frameit (+ catalogue thumbnail)',
    subject: `FrameIT external fixator, assembly ${n} of 4 (mark visible on parts)`,
    photographer: 'Integrant (legacy site capture)',
    source: 'brand/legacy-capture/' + n + '.png',
    license: 'First party (Integrant)' as const,
  })),
  ...(
    [
      ['foot-ankle', 'Foot & ankle'],
      ['shoulder', 'Shoulder'],
      ['hand-wrist', 'Hand & wrist'],
      ['spine', 'Spine'],
      ['hip', 'Hip'],
      ['knee', 'Knee'],
      ['elbow', 'Elbow'],
    ] as const
  ).map(([slug, name]) => ({
    file: `anatomy/${slug}.webp`,
    role: 'illustration' as const,
    usedOn: '/for-surgeons (02 — Specify)',
    subject: `${name} anatomy illustration with device-placement markers (legacy homepage art)`,
    photographer: 'Integrant (legacy site capture)',
    source: 'brand/legacy-capture/',
    license: 'First party (Integrant)' as const,
  })),
];

export const PHOTOGRAPHY: PhotoRecord[] = [
  ...FIRST_PARTY,
  {
    file: 'theatre.jpg',
    role: 'backdrop',
    usedOn: '/for-surgeons',
    subject: 'Operating theatre, surgeons unidentifiable (ambience)',
    photographer: 'Alexander Mass',
    source: 'https://unsplash.com/photos/END14vM3wsQ',
    license: 'Unsplash License',
  },
  {
    file: 'theatre-lights.jpg',
    role: 'backdrop',
    usedOn: '/innovation',
    subject: 'Surgical lamps, lights-only crop of the same frame',
    photographer: 'Alexander Mass',
    source: 'https://unsplash.com/photos/END14vM3wsQ',
    license: 'Unsplash License',
  },
  {
    file: 'metal.jpg',
    role: 'backdrop',
    usedOn: '/products',
    subject: 'Spun-metal concentric texture (abstract material ambience)',
    photographer: 'Fikri Rasyid',
    source: 'https://unsplash.com/photos/FnKKF2bATEE',
    license: 'Unsplash License',
  },
  {
    file: 'sydney-day.jpg',
    role: 'backdrop',
    usedOn: '/about',
    subject: 'Sydney Harbour Bridge, daylight',
    photographer: 'Henrique Felix',
    source: 'https://unsplash.com/photos/YHzmg4K4Oio',
    license: 'Unsplash License',
  },
  {
    file: 'sydney-night.jpg',
    role: 'backdrop',
    usedOn: '/contact',
    subject: 'Sydney Harbour Bridge at night, light beams',
    photographer: 'Benjamin Sow',
    source: 'https://unsplash.com/photos/ZsH1wHv2iTU',
    license: 'Unsplash License',
  },
  {
    file: 'tray.jpg',
    role: 'plate',
    usedOn: '/for-surgeons (01 — Consult)',
    subject: 'Sterile instrument tray (generic instruments)',
    photographer: 'César Badilla Miranda',
    source: 'https://unsplash.com/photos/Z6sbbTdPJTY',
    license: 'Unsplash License',
  },
  {
    file: 'phone.jpg',
    role: 'plate',
    usedOn: '/innovation (02 — The app)',
    subject: 'Hands with phone in low light (no identifiable face)',
    photographer: 'Gilles Lambert',
    source: 'https://unsplash.com/photos/pb_lF8VWaPU',
    license: 'Unsplash License',
  },
];
