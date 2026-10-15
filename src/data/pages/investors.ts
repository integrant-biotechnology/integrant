// Investors page content.
//
// Every statement about the company's capital position is a SourcedFact: it
// carries the date and URL of the public announcement it comes from, and the
// page prints that date beside it. Nothing here is a forecast, a valuation
// or an invitation to invest — add a row only when there is a published
// source for it, and never a raise amount, valuation or price. The planned
// listing month is the one the company announced and has since confirmed.
import { NEWS } from '../news';

export interface SourcedFact {
  label: string;
  value: string;
  /** ISO calendar day of the announcement the fact is taken from. */
  asOf: string;
  sourceUrl: string;
}

const source = (slug: string) => {
  const item = NEWS.find((n) => n.slug === slug);
  if (!item) throw new Error(`investors.ts: no news item "${slug}" to source a fact from`);
  return { asOf: item.date, sourceUrl: item.sourceUrl };
};

const ticker = source('nasdaq-ticker-symbol-ingt-reserved');
const seriesA = source('series-a-capital-raise-closed');

export const INVESTORS = {
  thesis: {
    headline: 'Three supply chains, built as one platform.',
    body: 'Orthopaedic care reaches the operating theatre through separate suppliers of implants, biologics and software. Integrant is building all three as a single system, specified by the surgeons who use it.',
  },
  company: [
    { label: 'Entity', value: 'Integrant Pty Ltd' },
    { label: 'ABN', value: '73 605 083 485' },
    { label: 'Founded', value: '2015' },
    { label: 'Headquarters', value: 'Sydney, Australia' },
    { label: 'Status', value: 'Privately held' },
    { label: 'Markets', value: 'Australia · New Zealand' },
  ],
  capital: [
    { label: 'Series A', value: 'Closed', ...seriesA },
    { label: 'Proposed exchange', value: 'Nasdaq', ...ticker },
    { label: 'Reserved ticker symbol', value: 'INGT', ...ticker },
    { label: 'Planned listing', value: 'November 2026', ...seriesA },
    { label: 'Pre-IPO placement', value: 'Being explored', ...seriesA },
  ] satisfies readonly SourcedFact[],
  pillars: [
    {
      index: '01',
      title: 'Implant systems',
      body: 'Fixation, fusion and correction systems for the foot, ankle, hand and wrist, supplied with their instrumentation.',
      href: '/products#med-tech',
      link: 'Med-tech catalogue',
    },
    {
      index: '02',
      title: 'Biologics',
      body: 'Graft materials and external fixation developed in consultation with the surgeons who specify them.',
      href: '/products#bio-tech',
      link: 'Bio-tech catalogue',
    },
    {
      index: '03',
      title: 'AI clinical software',
      body: 'Documentation software, in development, that drafts the operation note from the case for the surgeon to review and sign.',
      href: '/innovation',
      link: 'The innovation program',
    },
  ],
  notice: [
    'This page is provided for general information only. It is not an offer to sell, or a solicitation of an offer to buy, securities in any jurisdiction, and it is not financial product advice.',
    'Any offer of securities would be made only through formal offer documents and in accordance with applicable law. Statements about a proposed listing, capital raising or future plans are forward-looking: they reflect intentions at the date of the announcement cited, are subject to change, and may not occur.',
  ],
} as const;
