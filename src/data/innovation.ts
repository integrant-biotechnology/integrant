// Innovation items — mirrors cms/schemas/innovationItem.ts. Copy discipline
// (TGA + substantiation): describe FUNCTION only. Never time-saved, accuracy,
// error-reduction or any claim that would require substantiation — "listens,
// structures, drafts — the surgeon signs" is the ceiling.

export interface InnovationItem {
  slug: string;
  title: string;
  category: 'App' | 'AI workflow' | 'R&D';
  summary: string;
  body?: string[];
  /** Rendered as an App Store CTA only when non-null; otherwise an IN REVIEW plate. */
  appStoreUrl: string | null;
  /** Locked plate — Phase 3 subscriber portal, shown as design language only. */
  gated: boolean;
  chips?: string[];
}

export const INNOVATION_ITEMS: InnovationItem[] = [
  {
    slug: 'documentation-app',
    title: 'The Integrant app',
    category: 'App',
    summary:
      'In development: clinical documentation for the operating theatre. The app is being built to listen to the case and draft the operation note for the surgeon to review and sign.',
    body: [
      'Audio from the case will be transcribed and organised into the sections an operation note requires: approach, findings, implants, closure.',
      'Every draft stays a draft until the surgeon signs it. The app writes; the surgeon decides.',
      'Signed notes will export as PDF for the patient record.',
    ],
    appStoreUrl: null, // client to supply when App Store listing is live
    gated: false,
    chips: ['In development', 'Neural documentation', 'AI-assisted', 'iOS'],
  },
  {
    slug: 'ai-workflow',
    title: 'From audio to signed note',
    category: 'AI workflow',
    summary:
      'The pipeline behind the app: capture, structure, draft, sign — with the surgeon holding the pen at the end.',
    appStoreUrl: null,
    gated: false,
  },
  {
    slug: 'rd-pipeline',
    title: 'In development',
    category: 'R&D',
    summary:
      'Engineering continues across all three parts of the platform, each programme led by the people who will use the result in theatre.',
    appStoreUrl: null,
    gated: false,
  },
];

/** Wassup Secretary — the one software product in use today. Same copy
 *  discipline as the app: describe what it does, never metrics, automation
 *  rates, languages or comparisons (build-side figures stay off the site). */
export const SECRETARY = {
  title: 'Wassup Secretary',
  status: 'In use · Sydney orthopaedic practice',
  summary:
    'A voice agent for the practice phone line. Wassup Secretary answers calls around the clock, takes messages and passes urgent calls to the team.',
  body: [
    'Answers the practice line at any hour and records the reason for each call.',
    'Flags urgent calls and sends a text alert to the practice team.',
    'Logs every call in a dashboard so staff can follow up during practice hours.',
  ],
} as const;

/** The R&D programmes, described by scope — never by claims or dates. */
export const RD_PROGRAMMES = [
  {
    title: 'Implant systems',
    body: 'Extending the fixation and fusion range region by region, with instrumentation designed alongside each implant.',
  },
  {
    title: 'Clinical software',
    body: 'Building outward from the operation note toward structured documentation for the whole surgical team.',
  },
  {
    title: 'Biologics',
    body: 'Graft materials and frame systems developed in consultation with the surgeons who specify them.',
  },
] as const;
