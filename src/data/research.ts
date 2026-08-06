// Research activity ledger — mirrors cms/schemas/research.ts. The compliance
// contract is structural: the page imports `publishedResearch`, which only
// ever contains rows a human has marked complianceReviewed. Summaries and
// methodology describe ACTIVITY — never clinical outcomes, effect sizes or
// comparative results (TGA).

export type ResearchStatus = 'Planned' | 'Active' | 'Completed';

export interface ResearchItem {
  ref: string; // ledger reference, e.g. 'R-001'
  slug: string;
  title: string;
  status: ResearchStatus;
  /** Activity, not outcomes. */
  summary: string;
  methodology?: string;
  partners: string[];
  /** Publisher DOI link only — PDFs are never hosted (copyright + TGA). */
  doi?: string;
  /** Set true only after the client's TGA review of this exact row. */
  complianceReviewed: boolean;
  reviewNotes?: string;
}

export const RESEARCH: ResearchItem[] = [
  {
    ref: 'R-001',
    slug: 'subtalar-arthrodesis-2018',
    title: 'Subtalar arthrodesis — published surgical technique',
    status: 'Completed',
    summary:
      'Peer-reviewed publication describing a subtalar arthrodesis technique. Listed as research activity; refer to the publisher for the full text.',
    partners: [],
    // DOI to be confirmed by the client before this row can be reviewed —
    // the archived PDF (subtalar-arthrodesis-slater-2018.pdf) is not hosted.
    complianceReviewed: false,
    reviewNotes:
      'Real publication found in the legacy archive. Needs: confirmed citation/DOI from the client, then TGA review of the summary wording.',
  },
];

/** The only export pages may render from. */
export const publishedResearch = RESEARCH.filter((r) => r.complianceReviewed);
