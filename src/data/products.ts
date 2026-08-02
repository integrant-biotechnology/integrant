/**
 * Product catalogue — curated from content-archive/structured/products.json.
 *
 * COMPLIANCE (TGA): every string here is a brand-voice rewrite of the legacy
 * copy, deliberately limited to *objective product attributes* — construction,
 * geometry, materials, kit contents, catalogue numbers. Legacy outcome claims,
 * comparative language and efficacy statistics ("better alternative for bone
 * healing", recurrence rates, case counts, rehabilitation timelines) are
 * intentionally NOT reproduced. `applications` lists procedure/anatomy
 * descriptors only; full indications, contraindications and warnings live in
 * the IFU and must be verified against ARTG inclusions before launch.
 *
 * Every entry carries `reviewStatus: 'pending'` until clinical + regulatory
 * sign-off. Catalogue numbers and dimensions are transcribed from the legacy
 * spec tables and must be confirmed against current manufacturing records.
 */

export type ProductLine = 'med-tech' | 'bio-tech';

export interface SpecTable {
  caption?: string;
  columns: string[];
  rows: string[][];
}

export interface Product {
  slug: string;
  name: string;
  line: ProductLine;
  category: string;
  tagline: string;
  /** Lead paragraph — design intent, construction, no outcome claims. */
  summary: string;
  /** Objective design/construction attributes. */
  features: string[];
  /** Label → value engineering attributes. */
  specs: { label: string; value: string }[];
  /** Procedure / anatomy descriptors. Not a substitute for IFU indications. */
  applications?: string[];
  /** Kit or system contents, where the legacy page documented them. */
  contents?: string[];
  tables?: SpecTable[];
  /** Reference documents present in the archive (not yet published). */
  archiveDocuments?: number;
  /** Legacy page this was derived from, for traceability. */
  legacyPath: string;
  reviewStatus: 'pending';
  /** Compliance notes for the review pass — never rendered publicly. */
  reviewNotes?: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: 'archit',
    name: 'ArchIT',
    line: 'med-tech',
    category: 'Subtalar arthroereisis implant',
    tagline: 'Conical geometry for the tarsal canal.',
    summary:
      'A subtalar arthroereisis implant shaped to the anatomy of the tarsal canal. The conical taper and soft thread form are designed to maximise implant-to-bone contact, while fenestrations through the body allow soft-tissue ingrowth. Supplied with dedicated dilators for a keyhole insertion technique.',
    features: [
      'Conical tapered body matched to the tarsal canal',
      'Soft thread form for broad implant-to-bone contact',
      'Geometry designed to resist implant migration',
      'Fenestrated holes permitting soft-tissue ingrowth',
      'Dilator set for keyhole insertion',
    ],
    specs: [
      { label: 'Type', value: 'Subtalar arthroereisis implant' },
      { label: 'Geometry', value: 'Conical, tapered, fenestrated' },
      { label: 'Sizes', value: '8–12 mm' },
      { label: 'Catalogue range', value: 'AI08 – AI12' },
    ],
    applications: ['Hindfoot', 'Subtalar joint'],
    tables: [
      {
        caption: 'Catalogue',
        columns: ['Ref', 'Description', 'Size'],
        rows: [
          ['AI08', 'ArchIT subtalar arthroereisis implant', '8 mm'],
          ['AI09', 'ArchIT subtalar arthroereisis implant', '9 mm'],
          ['AI10', 'ArchIT subtalar arthroereisis implant', '10 mm'],
          ['AI11', 'ArchIT subtalar arthroereisis implant', '11 mm'],
          ['AI12', 'ArchIT subtalar arthroereisis implant', '12 mm'],
        ],
      },
    ],
    legacyPath: '/arch-it/',
    reviewStatus: 'pending',
    reviewNotes:
      'Legacy page listed indications (excessive pronation, PTTD, paediatric pes valgus) and an outcome sentence — withheld pending ARTG verification.',
  },
  {
    slug: 'anchorit',
    name: 'AnchorIT',
    line: 'med-tech',
    category: 'Suture screw anchor',
    tagline: 'A suture anchor built for the foot and ankle.',
    summary:
      'A suture screw anchor developed specifically for foot and ankle work, where fine needles and light suture are often the limiting factor. AnchorIT pairs a self-tapping anchor body with the Ultrapoint needle and fibre-wire suture, sized for the joint capsules encountered in the foot. Available in two configurations.',
    features: [
      'Ultrapoint needle profile for dense capsular tissue',
      'Fibre-wire suture material',
      'Self-tapping screw body',
      'Two configurations — small and large',
    ],
    specs: [
      { label: 'Type', value: 'Suture screw anchor' },
      { label: 'Suture', value: 'Fibre wire' },
      { label: 'Needle', value: 'Ultrapoint' },
      { label: 'Configurations', value: 'Small · Large' },
    ],
    applications: [
      'Lateral ankle ligament stabilisation',
      'Achilles tendon repair',
      'Metatarsal ligament and tendon repair',
      'Scapholunate ligament reconstruction',
      'Collateral ligament reconstruction — hand and wrist',
    ],
    tables: [
      {
        caption: 'Configurations',
        columns: ['Configuration', 'Pull-out (tested)', 'Typical anatomy'],
        rows: [
          ['Small', '3,500 N', 'Ankle · metatarsal · wrist'],
          ['Large', '5,000 N', 'Shoulder · knee'],
        ],
      },
    ],
    legacyPath: '/anchor-it/',
    reviewStatus: 'pending',
    reviewNotes:
      'Pull-out figures transcribed from legacy copy — require test-report substantiation before publication. Legacy rehabilitation/return-to-sport claim removed.',
  },
  {
    slug: 'screwit',
    name: 'ScrewIT',
    line: 'med-tech',
    category: '2.5 mm cannulated screw system',
    tagline: 'Cannulated fixation for forefoot, hand and wrist.',
    summary:
      'A 2.5 mm titanium cannulated screw system supplied as a complete instrument set. The screw geometry combines a variable pitch with a conical head, fine head threads and a triple-cut lead thread.',
    features: [
      'Variable pitch',
      'Gentle slope on the conical head',
      'Fine head threads',
      'Aggressive head notch',
      'Triple-cut lead thread',
    ],
    specs: [
      { label: 'Diameter', value: '2.5 mm' },
      { label: 'Material', value: 'Titanium' },
      { label: 'Type', value: 'Cannulated screw system' },
      { label: 'Catalogue prefix', value: 'MI25' },
    ],
    applications: ['Forefoot bone repair', 'Hand and wrist bone repair'],
    contents: [
      'Cannulated AO handle',
      'Cannulated power driver',
      'Cannulated hard-bone countersink',
      'Cannulated 1.9 mm drill',
      '2.0 mm drill',
      'Depth gauge',
      '0.9 mm guide wires',
    ],
    legacyPath: '/screwit/',
    reviewStatus: 'pending',
  },
  {
    slug: 'fuseit',
    name: 'FuseIT',
    line: 'med-tech',
    category: 'Surgical fusion aid',
    tagline: 'A structural device for complex fusion.',
    summary:
      'A threaded, fenestrated titanium plug developed as a structural device for complex fusion procedures. The thread form is designed for macro-interlock between the fusion surfaces and the device, with fenestrations supporting osseointegration. The cannulated body also allows use in opening-wedge osteotomies. Biocompatible with GraftIT.',
    features: [
      'Threaded, fenestrated conical plug',
      'Macro-interlock between device and fusion surfaces',
      'Cannulated — supports opening-wedge osteotomy technique',
      'Biocompatible with GraftIT',
    ],
    specs: [
      { label: 'Material', value: 'Titanium alloy Ti-6Al-4V' },
      { label: 'Shape', value: 'Conical fenestrated plug' },
      { label: 'Lengths', value: '1 cm · 2 cm' },
      { label: 'Diameters', value: '6 · 8 · 10 · 12 mm' },
    ],
    applications: ['Hindfoot and ankle fusion', 'Opening-wedge osteotomy'],
    tables: [
      {
        caption: 'Product range',
        columns: ['Length', 'Diameter', 'Catalogue'],
        rows: [
          ['1 cm', '6 mm', 'LA010-6'],
          ['1 cm', '8 mm', 'LA010-8'],
          ['1 cm', '10 mm', 'LA010-10'],
          ['1 cm', '12 mm', 'LA010-12'],
          ['2 cm', '6 mm', 'LA020-6'],
          ['2 cm', '8 mm', 'LA020-8'],
          ['2 cm', '10 mm', 'LA020-10'],
          ['2 cm', '12 mm', 'LA020-12'],
        ],
      },
    ],
    legacyPath: '/fuse-it/',
    reviewStatus: 'pending',
    reviewNotes:
      '2 cm catalogue numbers duplicated the 1 cm codes on the legacy page (LA010-*) — corrected to LA020-* by inference. MUST be confirmed against manufacturing records. Legacy allograft-complication comparison removed.',
  },
  {
    slug: 'loopit',
    name: 'LoopIT',
    line: 'med-tech',
    category: 'Double loop lift implant',
    tagline: 'Double-loop fixation for syndesmotic repair.',
    summary:
      'A double loop lift implant developed for ankle syndesmosis repair. Product documentation is being consolidated with the clinical team.',
    features: ['Double-loop construct'],
    specs: [
      { label: 'Type', value: 'Double loop lift implant' },
      { label: 'Documentation', value: 'In preparation' },
    ],
    applications: ['Ankle syndesmosis repair'],
    legacyPath: '/loopit/',
    reviewStatus: 'pending',
    reviewNotes: 'Legacy page was largely imagery with minimal copy — needs authored content from the clinical team.',
  },
  {
    slug: 'nailit',
    name: 'NailIT',
    line: 'med-tech',
    category: 'Nail correction device',
    tagline: 'Correction, not splinting.',
    summary:
      'A device for the correction of nail deformity. Where earlier wire and shape-memory devices act as a splint during normal nail growth, NailIT is designed to address the deformity and its surrounding environment. Applied as a short in-clinic procedure.',
    features: [
      'Designed to correct deformity rather than splint growth',
      'Short application procedure',
      'In-clinic application',
    ],
    specs: [
      { label: 'Type', value: 'Nail correction device' },
      { label: 'Setting', value: 'In-clinic procedure' },
    ],
    applications: ['Ingrown toenail correction'],
    legacyPath: '/nail-it/',
    reviewStatus: 'pending',
    reviewNotes:
      'Legacy page carried efficacy statistics (recurrence rate, satisfaction, next-day activity) and epidemiology figures — all removed pending substantiation.',
  },
  {
    slug: 'screw-sets',
    name: 'Screw Sets',
    line: 'med-tech',
    category: '2.0 mm twist-off · 3.0 mm cannulated',
    tagline: 'Titanium fixation across two systems.',
    summary:
      'Two titanium screw systems supplied as complete sets. The 2.0 mm twist-off screw is self-drilling and self-tapping, available in eight lengths. The 3.0 mm cannulated system covers a wider length range for larger fixation.',
    features: [
      'Titanium construction',
      'Self-drilling, self-tapping 2.0 mm twist-off design',
      '3.0 mm cannulated system with guide-pin range',
      'Length increments of 1–2 mm',
    ],
    specs: [
      { label: 'Systems', value: '2.0 mm twist-off · 3.0 mm cannulated' },
      { label: 'Material', value: 'Titanium' },
      { label: '2.0 mm lengths', value: '11 – 20 mm' },
      { label: '3.0 mm lengths', value: '14 – 48 mm' },
    ],
    tables: [
      {
        caption: '2.0 mm twist-off screw',
        columns: ['Length', 'Catalogue'],
        rows: [
          ['11 mm', 'LA-007-11'],
          ['12 mm', 'LA-007-12'],
          ['13 mm', 'LA-007-13'],
          ['14 mm', 'LA-007-14'],
          ['15 mm', 'LA-007-15'],
          ['16 mm', 'LA-007-16'],
          ['18 mm', 'LA-007-18'],
          ['20 mm', 'LA-007-20'],
        ],
      },
      {
        caption: '3.0 mm cannulated system',
        columns: ['Length', 'Catalogue'],
        rows: [
          ['14 mm', 'LA-008-14'],
          ['16 mm', 'LA-008-16'],
          ['18 mm', 'LA-008-18'],
          ['20 mm', 'LA-008-20'],
          ['22 mm', 'LA-008-22'],
          ['24 mm', 'LA-008-24'],
          ['26 mm', 'LA-008-26'],
          ['28 mm', 'LA-008-28'],
          ['30 mm', 'LA-008-30'],
          ['32 mm', 'LA-008-32'],
          ['34 mm', 'LA-008-34'],
          ['36 mm', 'LA-008-36'],
          ['38 mm', 'LA-008-38'],
          ['40 mm', 'LA-008-40'],
          ['42 mm', 'LA-008-42'],
          ['44 mm', 'LA-008-44'],
          ['46 mm', 'LA-008-46'],
          ['48 mm', 'LA-008-48'],
        ],
      },
    ],
    legacyPath: '/integrant-screw-sets/',
    reviewStatus: 'pending',
    reviewNotes:
      'Legacy page repeated the 2.0 mm description verbatim for the 3.0 mm system — 3.0 mm copy needs authoring. Surgical-technique narrative (Weil osteotomy) held back for a surgeon-gated technique library.',
  },
  {
    slug: 'screw-removal-set',
    name: 'Screw Removal Set',
    line: 'med-tech',
    category: 'Revision instrumentation',
    tagline: 'Every Integrant screw, one set.',
    summary:
      'A single set covering removal of all Integrant screws, including extraction instruments for broken and damaged screws — assembled so revision work is not delayed by missing or incorrect instruments.',
    features: [
      'Screwdriver shafts for all Integrant screw sizes and drives',
      'Extraction instruments for broken and damaged screws',
      'Single-set coverage across the range',
    ],
    specs: [
      { label: 'Hex drives', value: '1.5 · 2.5 · 3.5 · 4.0 mm' },
      { label: 'StarDrive recesses', value: 'T4 · T5 · T6 · T8 · T15 · T25 · T40' },
      { label: 'Cruciform', value: '1.0 · 1.3 · 1.5 · 2.0 · 2.4 mm' },
    ],
    contents: [
      'Cortex screws',
      'Cancellous bone screws',
      'Shaft screws',
      'Cannulated screws',
      'Locking screws',
      'Locking bolts',
    ],
    legacyPath: '/integrant-screw-removal-set/',
    reviewStatus: 'pending',
  },
  {
    slug: 'ankle-fusion-set',
    name: 'Anterior Ankle Fusion Set',
    line: 'med-tech',
    category: 'Plate and screw system',
    tagline: 'One plate. Sixty-three screw options.',
    summary:
      'An anterior ankle fusion set comprising a six-hole plate anatomically contoured to the tibiotalar surface, supplied with 63 screw options — one of each of three diameters across 21 lengths. Six portals with rounded edges allow angular variation in screw orientation, and configuration can be changed intra-operatively.',
    features: [
      'Low-profile six-hole plate',
      'Anatomically contoured to the tibiotalar surface',
      'Six portals with rounded edges for angular variation',
      'Three screw diameters across 21 lengths',
      'Configurable intra-operatively',
      'Primary and revision configurations',
    ],
    specs: [
      { label: 'Plate', value: '6-hole, low profile, anatomically contoured' },
      { label: 'Screw options', value: '63 (3 diameters × 21 lengths)' },
      { label: 'Application', value: 'Primary and revision' },
    ],
    applications: ['Anterior ankle arthrodesis'],
    legacyPath: '/anterior-ankle-fusion-set/',
    reviewStatus: 'pending',
    reviewNotes:
      'Legacy page published pre/post-operative patient radiographs (sample cases) — excluded pending documented patient consent and HCP gating. "Able to withstand delayed fusion" claim removed.',
  },
  {
    slug: '2-5mm-screw',
    name: '2.5 mm Screw',
    line: 'med-tech',
    category: 'Cannulated screw',
    tagline: 'Documentation in preparation.',
    summary:
      'The 2.5 mm screw is supplied within the ScrewIT cannulated system. A dedicated specification sheet is being prepared with the clinical team.',
    features: [],
    specs: [
      { label: 'Diameter', value: '2.5 mm' },
      { label: 'System', value: 'ScrewIT' },
      { label: 'Documentation', value: 'In preparation' },
    ],
    legacyPath: '/integrant-2-5mm-screw/',
    reviewStatus: 'pending',
    reviewNotes: 'Legacy page had no content. Consider consolidating into the ScrewIT page.',
  },
  {
    slug: 'frameit',
    name: 'FrameIT',
    line: 'bio-tech',
    category: 'External frame',
    tagline: 'Stabilise, distract, realign.',
    summary:
      'An external fixation frame designed to stabilise and adjust bone and joints — relieving load across a joint, shifting bone toward an improved alignment, addressing advanced fractures, or lengthening bone. Developed in consultation with surgeons and supplied with all equipment required for frame application.',
    features: [
      'Designed in consultation with surgeons',
      'Complete equipment set for frame application',
      'Thicker wires requiring no tensioning',
      'Training available',
    ],
    specs: [
      { label: 'Type', value: 'External fixation frame' },
      { label: 'Wires', value: 'Thicker gauge, no tensioning required' },
      { label: 'Supply', value: 'Complete application set' },
    ],
    applications: [
      'Fracture realignment',
      'Fracture non-union',
      'Bone lengthening',
      'Bone straightening',
      'Distraction',
      'Foot and ankle realignment',
      'Advanced ankle arthrodesis',
    ],
    legacyPath: '/frame-it/',
    reviewStatus: 'pending',
    reviewNotes:
      'Legacy applications list included "Charcot Foot (Reduce Amputation Risk)" — risk-reduction claim removed; Charcot listed as anatomy/indication requires ARTG verification.',
  },
  {
    slug: 'graftit',
    name: 'GraftIT',
    line: 'bio-tech',
    category: 'Coralline hydroxyapatite graft',
    tagline: 'Natural hydroxyapatite, injectable.',
    summary:
      'A bone graft material of natural coralline hydroxyapatite — a mineral form of calcium apatite, Ca₁₀(PO₄)₆(OH)₂, structurally comparable to the mineral phase of human bone. Supplied injectable via a dedicated syringe delivery apparatus with a range of attachments, stored at room temperature, with no complex preparation protocol.',
    features: [
      'Natural coralline hydroxyapatite',
      'Injectable via dedicated syringe apparatus with attachments',
      'Macroporous structure',
      'Room-temperature storage',
      'No complex preparation protocol',
      'Sourced from renewable material',
    ],
    specs: [
      { label: 'Composition', value: 'Coralline hydroxyapatite — Ca₁₀(PO₄)₆(OH)₂' },
      { label: 'Form', value: 'Injectable' },
      { label: 'Delivery', value: 'Syringe apparatus with attachments' },
      { label: 'Storage', value: 'Room temperature' },
    ],
    archiveDocuments: 9,
    legacyPath: '/graft-it/',
    reviewStatus: 'pending',
    reviewNotes:
      'HIGHEST COMPLIANCE RISK. Legacy page led with "The better alternative for bone healing" plus safety/efficacy claims, a 200,000-case count, osteoconductivity performance claims and infection/co-morbidity comparisons — all removed. Nine referenced literature PDFs sit in content-archive/assets/ and must not be republished as product substantiation without regulatory review. NZ Medsafe position also to confirm.',
  },
];

export const PRODUCT_LINES: { id: ProductLine; label: string; blurb: string }[] = [
  {
    id: 'med-tech',
    label: 'Med-Tech',
    blurb: 'Fixation, fusion and correction systems engineered for foot, ankle, hand and wrist.',
  },
  {
    id: 'bio-tech',
    label: 'Bio-Tech',
    blurb: 'Graft materials and external fixation supporting the body’s own repair.',
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productsByLine = (line: ProductLine) => PRODUCTS.filter((p) => p.line === line);
