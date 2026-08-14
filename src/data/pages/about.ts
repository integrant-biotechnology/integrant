// About page content — "The Record". Only client-verified facts render:
// milestones carry a `verified` flag and the page filters on it, so an
// unverified date simply doesn't exist publicly. Everything else here is
// derivable from the codebase/archive (product counts, divisions, address)
// or is voice, not fact.

import { PRODUCTS } from '../products';
import { ANATOMY_AREAS } from '../anatomy-areas';

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
    // Populated from the client questionnaire (docs/client-inputs.md).
    // Nothing renders while verified === false.
    { year: '', label: 'FOUNDED — SYDNEY', verified: false },
    { year: '', label: 'FIRST IMPLANT SYSTEM', verified: false },
    { year: '', label: 'BIO-TECH DIVISION', verified: false },
    { year: '', label: 'AI DOCUMENTATION APP', verified: false },
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
  facts: [
    { value: String(PRODUCTS.length), label: 'Product systems' },
    { value: String(ANATOMY_AREAS.filter((a) => a.productSlugs.length > 0).length), label: 'Anatomical regions covered' },
    { value: '2', label: 'Divisions — med-tech · bio-tech' },
  ],
} as const;

export const verifiedMilestones = ABOUT.milestones.filter((m) => m.verified);
