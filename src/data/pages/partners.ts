// Partners page content. Legacy /supplier published Partners@integrant.com.au
// but the mailbox is unconfirmed — every CTA routes through /contact until
// the client confirms it (docs/client-inputs.md).

export interface PartnerModel {
  id: string;
  label: string;
  /** What Integrant looks for. */
  seeks: string;
  /** What Integrant provides. */
  provides: string;
}

export const PARTNER_MODELS: PartnerModel[] = [
  {
    id: 'distribution',
    label: 'Distribution',
    seeks:
      'Established surgical distributors in Australia, New Zealand and selected export markets, with orthopaedic theatre coverage.',
    provides:
      'A focused foot-and-ankle portfolio, loan-set logistics, instrumentation training and direct access to the engineering team.',
  },
  {
    id: 'hospitals',
    label: 'Hospitals & procurement',
    seeks:
      'Hospital groups and day-surgery networks standardising their small-bone fixation and fusion inventory.',
    provides:
      'Consolidated set architecture, transparent catalogue specifications and responsive supply from Sydney.',
  },
  {
    id: 'suppliers',
    label: 'Suppliers & manufacturing',
    seeks:
      'Precision manufacturing partners — implant-grade machining, anodising, packaging and sterilisation services.',
    provides:
      'Long-run engineering relationships with documented quality requirements.',
  },
  {
    id: 'research',
    label: 'Research & clinical',
    seeks:
      'Institutions and clinical teams for investigator-led research collaborations.',
    provides:
      'Device expertise, engineering support and a documented research process. Activity is published on the research page as programs are disclosed.',
  },
];
