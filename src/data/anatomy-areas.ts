// The browse-by-anatomy axis — mirrors cms/schemas/anatomyArea.ts for later
// Sanity import. The 8 regions come from the legacy site's header navigation
// (content-archive/structured/navigation.json); productSlugs are derived only
// from each product's `applications` field in products.ts — no product is
// mapped to a region its own data doesn't claim. Regions without products
// render as portfolio-in-development, which is honest and matches the legacy
// nav's ambition.

export interface AnatomyArea {
  slug: string;
  name: string;
  /** Activity-descriptive only — never indications or outcomes (TGA). */
  summary: string;
  order: number;
  productSlugs: string[];
  /**
   * First-party anatomy illustration (legacy homepage art, regraded to
   * grayscale WebP in public/photo/anatomy/). Descriptive anatomy with
   * device-placement markers only — captions stay generic (TGA). Regions
   * without one render the existing text-only plate.
   */
  illustration?: string;
}

export const ANATOMY_AREAS: AnatomyArea[] = [
  {
    slug: 'foot-ankle',
    illustration: '/photo/anatomy/foot-ankle.webp',
    name: 'Foot & Ankle',
    summary:
      'The core of the portfolio — fixation, fusion, ligament repair and external fixation systems developed for foot and ankle surgery.',
    order: 1,
    productSlugs: [
      'archit',
      'anchorit',
      'screwit',
      'fuseit',
      'loopit',
      'nailit',
      'screw-sets',
      'ankle-fusion-set',
      'frameit',
      'graftit',
    ],
  },
  {
    slug: 'hand-wrist',
    illustration: '/photo/anatomy/hand-wrist.webp',
    name: 'Hand & Wrist',
    summary:
      'Small-bone fixation and ligament reconstruction instrumentation sized for hand and wrist anatomy.',
    order: 2,
    productSlugs: ['screwit', 'anchorit', '2-5mm-screw'],
  },
  {
    slug: 'shoulder',
    illustration: '/photo/anatomy/shoulder.webp',
    name: 'Shoulder',
    summary: 'Suture anchor configurations sized for larger joint capsules.',
    order: 3,
    productSlugs: ['anchorit'],
  },
  {
    slug: 'knee',
    illustration: '/photo/anatomy/knee.webp',
    name: 'Knee',
    summary: 'Anchor configurations rated for the loads of knee ligament work.',
    order: 4,
    productSlugs: ['anchorit'],
  },
  {
    slug: 'spine',
    illustration: '/photo/anatomy/spine.webp',
    name: 'Spine',
    summary: 'Portfolio in development.',
    order: 5,
    productSlugs: [],
  },
  {
    slug: 'hip',
    illustration: '/photo/anatomy/hip.webp',
    name: 'Hip',
    summary: 'Portfolio in development.',
    order: 6,
    productSlugs: [],
  },
  {
    slug: 'elbow',
    illustration: '/photo/anatomy/elbow.webp',
    name: 'Elbow',
    summary: 'Portfolio in development.',
    order: 7,
    productSlugs: [],
  },
  {
    slug: 'external-fixators',
    name: 'External Fixators',
    summary:
      'Frame-based external fixation for realignment, lengthening and staged reconstruction.',
    order: 8,
    productSlugs: ['frameit'],
  },
];

export const getAnatomyArea = (slug: string) => ANATOMY_AREAS.find((a) => a.slug === slug);
