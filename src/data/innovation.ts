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
      'Clinical documentation for the operating theatre. The app listens to the case and drafts the operation note — structured, complete, ready for the surgeon to review and sign.',
    body: [
      'Audio from the case is transcribed and organised into the sections an operation note requires: approach, findings, implants, closure.',
      'Every draft stays a draft until the surgeon signs it. The app writes; the surgeon decides.',
      'Reports export as PDF for the patient record.',
    ],
    appStoreUrl: null, // client to supply when App Store listing is live
    gated: false,
    chips: ['Neural documentation', 'AI-assisted', 'iOS', 'PDF reports'],
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
      'Active development programs across implant systems and clinical software. Detail is published as programs reach disclosure.',
    appStoreUrl: null,
    gated: true,
  },
];
