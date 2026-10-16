// Innovation content — mirrors cms/schemas/innovationItem.ts. /innovation
// leads with the Wassup platform, then the biomedical and device programmes.
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
  group: WassupGroup;
  status: WassupStatus;
  summary: string;
  points?: string[];
}

export const WASSUP_PLATFORM = {
  name: 'Wassup',
  heading: 'One platform. A person signs off every output.',
  body: 'Wassup is the Integrant clinical AI platform: a family of software agents for clinicians, their practices and research teams, built on shared foundations. Each agent drafts, organises or answers; a qualified person reviews the result and makes the decision.',
} as const;

export const WASSUP_GROUPS: { id: WassupGroup; label: string }[] = [
  { id: 'clinical', label: 'Clinical & practice' },
  { id: 'research', label: 'Research & platform' },
];

export const WASSUP_PRODUCTS: WassupProduct[] = [
  {
    slug: 'secretary',
    name: 'Wassup Secretary',
    group: 'clinical',
    status: 'In use',
    summary: 'A voice agent for the practice phone line. It answers calls around the clock, takes messages and passes urgent calls to the team.',
    points: [
      'Answers the practice line at any hour and records the reason for each call.',
      'Flags urgent calls and sends a text alert to the practice team.',
      'Logs every call in a dashboard so staff can follow up during practice hours.',
    ],
  },
  {
    slug: 'doc',
    name: 'Wassup Doc',
    group: 'clinical',
    status: 'In development',
    summary: 'A clinical workflow agent that drafts the operation note from theatre audio for the surgeon to review and sign.',
  },
  {
    slug: 'first-opinion',
    name: 'Wassup First Opinion',
    group: 'clinical',
    status: 'In development',
    summary: 'Drafts structured medico-legal reports from case material for the reporting doctor to review, edit and sign.',
  },
  {
    slug: 'hive',
    name: 'Wassup Hive',
    group: 'research',
    status: 'In development',
    summary: 'Decision support that brings relevant case information together in real time, for review by the treating clinician.',
  },
  {
    slug: 'genesis',
    name: 'Wassup Genesis',
    group: 'research',
    status: 'In development',
    summary: 'A computational research engine for early-stage biomedical discovery work, operated by the research team.',
  },
];

/** How every Wassup agent works — function language only. Icons are stroke
 *  paths for svg[data-draw]. */
export const WASSUP_STEPS = [
  {
    index: '01',
    label: 'Capture',
    copy: 'The agent takes in what the task needs: a call, theatre audio or case documents.',
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
    copy: 'A complete draft is assembled: a message, a note or a report.',
    icon: ['M 12 6 H 40 V 46 H 12 Z', 'M 18 14 H 34', 'M 18 21 H 34', 'M 18 28 H 34', 'M 18 35 H 28'],
  },
  {
    index: '04',
    label: 'Review & sign',
    copy: 'Nothing is final until a qualified person reviews it. The agent drafts; the person decides.',
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
    body: 'The Wassup platform: software agents for clinicians, practices and research, each built around human review.',
  },
  {
    title: 'Biologics',
    body: 'Graft materials and frame systems developed in consultation with the surgeons who specify them.',
  },
] as const;
