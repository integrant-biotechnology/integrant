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
}

export const ANATOMY_AREAS: AnatomyArea[] = [
  {
    slug: 'foot-ankle',
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
    name: 'Hand & Wrist',
    summary:
      'Small-bone fixation and ligament reconstruction instrumentation sized for hand and wrist anatomy.',
    order: 2,
    productSlugs: ['screwit', 'anchorit', '2-5mm-screw'],
  },
  {
    slug: 'shoulder',
    name: 'Shoulder',
    summary: 'Suture anchor configurations sized for larger joint capsules.',
    order: 3,
    productSlugs: ['anchorit'],
  },
  {
    slug: 'knee',
    name: 'Knee',
    summary: 'Anchor configurations rated for the loads of knee ligament work.',
    order: 4,
    productSlugs: ['anchorit'],
  },
  {
    slug: 'spine',
    name: 'Spine',
    summary: 'Portfolio in development.',
    order: 5,
    productSlugs: [],
  },
  {
    slug: 'hip',
    name: 'Hip',
    summary: 'Portfolio in development.',
    order: 6,
    productSlugs: [],
  },
  {
    slug: 'elbow',
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
