// About page content — "The Record". Only client-verified facts render:
// milestones carry a `verified` flag and the page filters on it, so an
// unverified date simply doesn't exist publicly. Everything else here is
// derivable from the codebase/archive (product counts, divisions, address)
// or is voice, not fact.

import { PRODUCTS } from '../products';

export interface Milestone {
  year: string;
  label: string; // readout style, e.g. 'FIRST IMPLANT SYSTEM'
  detail?: string;
  /** Set true only when the client confirms the date. */
  verified: boolean;
}

export const ABOUT = {
  thesis:
    'Integrant exists to close the distance between the operating theatre and the workshop — implant systems, biologics and clinical software designed by the people who use them.',
  founder: {
    name: 'Dr Gordon Slater',
    role: 'Founder',
    monogram: 'S',
    // Bio renders only after the client questionnaire returns; until then the
    // plate carries role + discipline lines only.
    bio: null as string | null,
    // Client-supplied portrait (source original in brand/, grayscale web
    // derivative generated via sharp — regenerate at 680x907 q82 if replaced).
    portrait: '/founder/gordon-slater.jpg',
  },
  milestones: [
    // Nothing renders while verified === false. The verified rows are taken
    // from the Australian Business Register (ABN active from 1 Apr 2015) and
    // the company's own published announcements (see src/data/news.ts);
    // the rest wait on the client questionnaire (docs/client-inputs.md).
    { year: '2015', label: 'Integrant founded in Sydney', verified: true },
    { year: '', label: 'First implant system', verified: false },
    { year: '', label: 'Bio-tech division', verified: false },
    { year: '2026', label: 'Series A capital raise closed', verified: true },
    { year: '2026', label: 'Nasdaq ticker symbol INGT reserved', verified: true },
  ] as Milestone[],
  careers: {
    heading: 'Work at Integrant.',
    body: 'We hire slowly and deliberately — engineering, clinical support and operations, in Sydney. Send a CV and a note on what you want to build.',
    email: 'admin@integrant.com.au',
  },
  location: {
    address: '5 Ward Avenue, Potts Point NSW 2011',
    coordinates: '33.87°S · 151.22°E',
    label: 'SYDNEY · AUSTRALIA',
  },
  /** Public record backing the ARTG statement — the regulator's own register. */
  tgaSponsorRecord: 'https://www.tga.gov.au/resources/sponsor/integrant-pty-ltd',
} as const;

export const verifiedMilestones = ABOUT.milestones.filter((m) => m.verified);
