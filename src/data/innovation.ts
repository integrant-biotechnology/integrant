// Innovation content — mirrors cms/schemas/innovationItem.ts. /innovation
// leads with the Wassup ecosystem, then the biomedical and device programmes.
//
// Copy discipline (TGA + US pre-filing securities guidance) — hard rules:
//   · function only, plus a plain status label: 'In use' or 'In development';
//   · never timelines, valuations, metrics, peer names, customer or pilot
//     names, or any listing / investor language;
//   · no therapeutic, diagnostic or outcome claims — every output is drafted
//     for a person to review, and that person decides;
//   · canonical product names only (Doc, Secretary, First Opinion, Hive,
//     Genesis) — scripts/audit-copy.mjs fails on retired names and Horizon,
//     which is kept off the site;
//   · Wassup is an Integrant platform (ownership confirmed by Integrant, Oct 2026).

export type WassupGroup = 'clinical' | 'research';
export type WassupStatus = 'In use' | 'In development';

export interface WassupProduct {
  slug: string;
  name: string;
  /** One-word role, set as the card's readout line. */
  role: string;
  group: WassupGroup;
  status: WassupStatus;
  summary: string;
  /** What the product does — function language, one line each. */
  capabilities: string[];
  /** The human-review principle for this product, in a single sentence. */
  principle: string;
}

export const WASSUP_PLATFORM = {
  name: 'Wassup',
  heading: 'One ecosystem. Five products. Designed around human review.',
  body: 'Wassup is the Integrant clinical AI ecosystem: one architecture, with products built on top of it. Each product takes on one demanding part of clinical, medico-legal or research work: answering the practice line, drafting the operation note, preparing an expert report, surfacing the right case at the point of decision, organising translational evidence. The products are being built on a shared foundation, so identity, audit, model access and human review are designed once and shared across them.',
} as const;

/** The layered architecture drawn in section 01: products on a shared
 *  foundation, under one governance layer. Design language from the
 *  platform blueprint — these describe the architecture, not certifications. */
export const WASSUP_FOUNDATION = [
  { label: 'Identity & access', detail: 'Role-based access for users and services' },
  { label: 'Audit trail', detail: 'Designed to record inputs, outputs and sign-off' },
  { label: 'Model gateway', detail: 'A controlled route to the AI models used' },
  { label: 'Prompt registry', detail: 'Versioned, reviewed instructions' },
  { label: 'Evidence store', detail: 'Designed to hold the sources behind citations' },
  { label: 'Evaluation harness', detail: 'Outputs tested against agreed thresholds' },
  { label: 'Human review', detail: 'Draft, review, approve — in one workflow' },
  { label: 'Notifications', detail: 'Alerts routed to the right person' },
] as const;

export const WASSUP_GROUPS: { id: WassupGroup; label: string; lede: string }[] = [
  { id: 'clinical', label: 'Clinical & practice', lede: 'Products for the practice, the theatre and the medico-legal report.' },
  { id: 'research', label: 'Research', lede: 'Products for clinical decision support and translational research.' },
];

export const WASSUP_PRODUCTS: WassupProduct[] = [
  {
    slug: 'secretary',
    name: 'Wassup Secretary',
    role: 'Practice reception',
    group: 'clinical',
    status: 'In use',
    summary: 'An AI voice and reception service for the practice phone line. It is designed to answer calls outside practice hours and flag urgent matters to the practice team.',
    capabilities: [
      'Answers the practice line, including after hours, and identifies the caller against the patient list',
      'Records the reason for each call and takes post-operative and general messages',
      'Flags urgent calls and sends a text alert to the practice team',
      'Logs calls in a command centre for follow-up during practice hours',
    ],
    principle: 'Wassup Secretary takes the call; the practice team decides what happens next.',
  },
  {
    slug: 'doc',
    name: 'Wassup Doc',
    role: 'Clinical documentation',
    group: 'clinical',
    status: 'In development',
    summary: 'Ambient clinical documentation for orthopaedic and regenerative-medicine practice. Wassup Doc is being developed to turn the consultation or the case into structured draft records for the clinician to sign.',
    capabilities: [
      'Is being developed to transcribe the consultation or theatre audio',
      'Is being developed to draft structured clinical and operation notes',
      'Is being developed to assist with procedure coding',
      'Is being developed to retrieve relevant patient and clinical context',
    ],
    principle: 'Wassup Doc is being developed so that a note stays a draft until the clinician reviews and signs it.',
  },
  {
    slug: 'first-opinion',
    name: 'Wassup First Opinion',
    role: 'Medico-legal reporting',
    group: 'clinical',
    status: 'In development',
    summary: 'Drafting support for independent medical expert reports, being developed to work from the clinical record bundle and the letter of instruction towards a report in the required court format.',
    capabilities: [
      'Is being developed to ingest and structure clinical record bundles',
      'Is being developed to draft responses question by question against the letter of instruction',
      'Is being developed to cite verifiable sources, each with an audit trail',
      'Is being developed to export in the solicitor-specified report format',
    ],
    principle: 'The qualified practitioner is intended to be the author of record and to sign each report.',
  },
  {
    slug: 'hive',
    name: 'Wassup Hive',
    role: 'Clinical decision support',
    group: 'research',
    status: 'In development',
    summary: 'Clinical decision support being developed on a de-identified record of surgical decisions, to bring relevant references to the clinician during the consult.',
    capabilities: [
      'A data layer of de-identified clinical decisions, designed with data lineage',
      'A point-of-care surface, being explored for screen and spatial-computing devices',
      'A contributor opt-in and privacy framework in development',
    ],
    principle: 'Designed so that the system surfaces and the doctor decides.',
  },
  {
    slug: 'genesis',
    name: 'Wassup Genesis',
    role: 'Translational research',
    group: 'research',
    status: 'In development',
    summary: 'A structured decision engine for translational medicine, being developed to move a research question from clinical problem to an organised evidence package through a staged reasoning cascade.',
    capabilities: [
      'Staged outputs from problem definition through to a human-review checklist',
      'Evidence graded by source and strength; inference and assumption kept separate',
      'Multi-pass review gates designed to run before outputs are released',
      'An audit record of sources, reasoning, assumptions and gaps, designed into each output',
    ],
    principle: 'Genesis organises evidence for scientists, clinicians and regulators to judge. It does not replace them.',
  },
];

/** Section 04 — the governance design every product inherits. Framed as
 *  "designed with reference to": design alignment, never certification. */
export const WASSUP_GOVERNANCE = [
  { title: 'Australian privacy law', body: 'Being designed with reference to the Privacy Act 1988 and the Australian Privacy Principles, including APP 8 for cross-border disclosure.' },
  { title: 'Breach readiness', body: 'Controls and records being designed to support the Notifiable Data Breaches scheme.' },
  { title: 'Security controls', body: 'Being designed with reference to ACSC Essential Eight guidance and ISO/IEC 27001 Annex A control themes.' },
  { title: 'Decision support', body: 'Clinical, legal and scientific outputs are intended as decision support for a qualified professional to review and approve.' },
  { title: 'Traceable outputs', body: 'Designed to record sources, versions, reviewers and sign-off for product outputs.' },
  { title: 'Health record boundary', body: 'Wassup does not connect to the My Health Record system.' },
] as const;

/** How every Wassup product works — function language only. Icons are stroke
 *  paths for svg[data-draw]. */
export const WASSUP_STEPS = [
  {
    index: '01',
    label: 'Capture',
    copy: 'Wassup is designed to take in what the task needs: a call, theatre audio or case documents.',
    icon: ['M 20 8 H 32 V 28 C 32 34, 20 34, 20 28 Z', 'M 14 24 C 14 36, 38 36, 38 24', 'M 26 36 V 44', 'M 18 44 H 34'],
  },
  {
    index: '02',
    label: 'Structure',
    copy: 'The input is organised into the sections the task requires.',
    icon: ['M 10 8 V 44', 'M 10 8 H 16', 'M 10 44 H 16', 'M 42 8 V 44', 'M 42 8 H 36', 'M 42 44 H 36', 'M 20 16 H 32', 'M 20 26 H 32', 'M 20 36 H 32'],
  },
  {
    index: '03',
    label: 'Draft',
    copy: 'A draft is prepared for review: a message, a note or a report.',
    icon: ['M 12 6 H 40 V 46 H 12 Z', 'M 18 14 H 34', 'M 18 21 H 34', 'M 18 28 H 34', 'M 18 35 H 28'],
  },
  {
    index: '04',
    label: 'Review & sign',
    copy: 'Designed so that a qualified person reviews the draft before it is relied on. Wassup drafts; the person decides.',
    icon: ['M 8 34 C 14 24, 18 40, 24 30 C 30 20, 32 36, 38 28 C 41 24, 43 30, 46 27'],
  },
] as const;

/** The R&D programmes, described by scope — never by claims or dates. */
export const RD_PROGRAMMES = [
  {
    title: 'Implant systems',
    body: 'Extending the fixation and fusion range region by region, with instrumentation designed alongside each implant.',
  },
  {
    title: 'Clinical software',
    body: 'The Wassup ecosystem: AI products for clinicians, practices and research, each built around human review.',
  },
  {
    title: 'Biologics',
    body: 'Graft materials and frame systems developed in consultation with the surgeons who specify them.',
  },
] as const;
