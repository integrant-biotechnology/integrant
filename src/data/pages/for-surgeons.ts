// For Surgeons page content — "The Tray". Public page addressed to HCPs, so
// the same no-outcomes discipline applies as everywhere else. `showPricing`
// mirrors cms/schemas/page.ts — the pricing plate is designed but renders
// nothing until the client decides to publish a fee structure.

export interface WorkflowStep {
  index: string; // '01'
  label: string; // 'CONSULT'
  heading: string;
  body: string;
}

export const FOR_SURGEONS = {
  showPricing: false,
  steps: [
    {
      index: '01',
      label: 'CONSULT',
      heading: 'Direct access, not a call centre.',
      body: 'Enquiries go to the team that engineers the systems. Loan sets, instrumentation walk-throughs and theatre scheduling are arranged directly from Sydney.',
    },
    {
      index: '02',
      label: 'SPECIFY',
      heading: 'Browse by anatomy.',
      body: 'The portfolio is indexed the way you operate — by region. Every system lists its catalogue specifications; instructions for use accompany each device.',
    },
    {
      index: '03',
      label: 'THEATRE',
      heading: 'Sets configured for the procedure.',
      body: 'Instrumentation, implants and disposables configured as documented tray systems, with catalogue references matching the labels on the box.',
    },
    {
      index: '04',
      label: 'DOCUMENT',
      heading: 'Operation notes, drafted for you to sign.',
      body: 'Wassup Doc, in development, drafts structured operation notes from theatre audio for surgeon review and signature.',
    },
  ] as WorkflowStep[],
  ifuNote: 'IFU — ON REQUEST', // replaced by ARTG/IFU references once client-verified
  pricing: {
    // Designed slot; populated only when showPricing flips true.
    heading: 'Fee structure',
    rows: [] as { item: string; detail: string }[],
  },
} as const;
