// The browse-by-anatomy axis — mirrors cms/schemas/anatomyArea.ts for later
// Sanity import. Regions come from the legacy site's header navigation
// (content-archive/structured/navigation.json); productSlugs are derived only
// from each product's `applications` field in products.ts — no product is
// mapped to a region its own data doesn't claim. A region is listed only
// once it has at least one system in the catalogue.

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
    productSlugs: ['screwit', 'anchorit'],
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
    slug: 'external-fixators',
    name: 'External Fixators',
    summary:
      'Frame-based external fixation for realignment, lengthening and staged reconstruction.',
    order: 8,
    productSlugs: ['frameit'],
  },
];

export const getAnatomyArea = (slug: string) => ANATOMY_AREAS.find((a) => a.slug === slug);
