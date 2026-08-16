/**
 * Site metrics — the single source for every credibility figure on the site
 * (hero strip, Trust band, /about "on the record").
 *
 * COMPLIANCE (TGA): this module is a structural gate, the same pattern as
 * `publishedResearch` / `publishableCases` / `verifiedMilestones`. Pages may
 * only import `verifiedMetrics`; a row with `verified: false` physically
 * cannot render. Counts are DERIVED from the data modules at build time so
 * the numbers can never drift from what the site actually documents.
 *
 * Client-supplied figures (years of research, procedure counts, milestones)
 * enter here as `verified: false` and stay dark until the claim has both
 * client verification and TGA compliance review — see docs/client-inputs.md.
 * Never flip a flag without recorded sign-off.
 */
import { PRODUCTS, PRODUCT_LINES } from './products';
import { ANATOMY_AREAS } from './anatomy-areas';

export interface SiteMetric {
  id: string;
  /** count → tabular numeral with count-up; readout → qualitative caps value */
  kind: 'count' | 'readout';
  value: string | number;
  label: string;
  /** HARD GATE — unverified rows never render anywhere. */
  verified: boolean;
  /** Provenance note for reviewers. Never rendered. */
  source?: string;
}

export const SITE_METRICS: SiteMetric[] = [
  {
    id: 'systems',
    kind: 'count',
    value: PRODUCTS.length,
    label: 'Product systems',
    verified: true,
    source: 'Derived: src/data/products.ts',
  },
  {
    id: 'regions',
    kind: 'count',
    value: ANATOMY_AREAS.filter((a) => a.productSlugs.length > 0).length,
    label: 'Anatomical regions',
    verified: true,
    source: 'Derived: src/data/anatomy-areas.ts (regions with mapped systems)',
  },
  {
    id: 'divisions',
    kind: 'count',
    value: PRODUCT_LINES.length,
    label: 'Divisions — Med · Bio',
    verified: true,
    source: 'Derived: src/data/products.ts PRODUCT_LINES',
  },
  {
    id: 'supply',
    kind: 'readout',
    value: 'AU·NZ',
    label: 'Regulated supply',
    verified: true,
    source: 'Cleared claim — carried over from the reviewed Stats band',
  },
  {
    id: 'artg',
    kind: 'readout',
    value: 'ARTG listed',
    label: 'Med-tech implant systems',
    verified: true,
    source: 'Carried over from the reviewed Platform section chip (TI-6AL-4V · ARTG LISTED)',
  },
  {
    id: 'ai',
    kind: 'readout',
    value: 'AI-assisted',
    label: 'Documentation — in development',
    verified: true,
    source: 'Activity descriptor only; mirrors the reviewed Innovation copy',
  },
  // ---- Client-owed figures: stay dark until verified + TGA-reviewed -------
  // { id: 'research-years', kind: 'count', value: 0, label: 'Years of research',
  //   verified: false, source: 'Awaiting client verification — docs/client-inputs.md' },
];

/** The only export a page may render from. */
export const verifiedMetrics = SITE_METRICS.filter((m) => m.verified);

export const getMetric = (id: string) => verifiedMetrics.find((m) => m.id === id);
