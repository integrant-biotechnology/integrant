// Clinical case archive — mirrors cms/schemas/clinicalImage.ts. The consent
// contract is structural: pages import `publishableCases`, which only ever
// contains entries with consentConfirmed === true. The legacy site's imagery
// (22 photos, content-archive/pages/clinical-images.md) is modelled here so
// each case renders automatically the moment its consent document is
// verified — and cannot render before.

export interface ClinicalCase {
  id: string; // case plate reference, e.g. 'CASE 001'
  title: string;
  /** Descriptive only — procedure and anatomy, never outcome language. */
  caseSummary: string;
  anatomyAreaSlug: string;
  productSlug?: string;
  /** Ordered image filenames within content-archive/assets (moved to an
   *  approved public location only when consent verifies — never imported
   *  from the archive directly). */
  images: { file: string; caption: string }[];
  consentConfirmed: boolean;
  hcpOnly: boolean;
  reviewNotes?: string;
}

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'CASE 001',
    title: 'Modified Broström — lateral ligament reconstruction',
    caseSummary:
      'Five-step operative sequence: arthroscopy, diathermy of bleeding points, exposure of the lateral ligaments, anchor placement, suture management.',
    anatomyAreaSlug: 'foot-ankle',
    productSlug: 'anchorit',
    images: [
      { file: '1.jpg', caption: 'Ankle arthroscopy' },
      { file: '2.jpg', caption: 'Diathermy of bleeding points' },
      { file: '3.jpg', caption: 'The lateral ligaments' },
      { file: '4.jpg', caption: 'The anchors' },
      { file: '5.jpg', caption: 'A needle is cut from each of the sutures' },
    ],
    consentConfirmed: false,
    hcpOnly: true,
    reviewNotes:
      'The only captioned sequence on the legacy site. Blocked on documented patient consent; images stay in content-archive until then.',
  },
  {
    id: 'CASE 002',
    title: 'Intra-operative case photography — uncatalogued',
    caseSummary:
      '17 intra-operative photographs captured 2019–2020, currently without case metadata. Each requires identification, captioning and consent verification before it can join the archive.',
    anatomyAreaSlug: 'foot-ankle',
    images: [],
    consentConfirmed: false,
    hcpOnly: true,
    reviewNotes:
      'Filenames recorded in content-archive/pages/clinical-images.md (docs array). Do not model individually until the client identifies the cases.',
  },
];

/** The only export pages may render from. */
export const publishableCases = CLINICAL_CASES.filter((c) => c.consentConfirmed);
