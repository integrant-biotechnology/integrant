// Newsroom entries — mirrors cms/schemas/news.ts for later Sanity import.
//
// Rules for every row:
//   · `date` is the ISO calendar day of the original announcement.
//   · `summary` and `body` are neutral rewrites. Press releases are written
//     for the market; this site is medical-device advertising under TGA
//     rules, so therapeutic, efficacy and comparative language from the
//     original never carries over. scripts/audit-copy.mjs enforces that.
//   · `sourceUrl` links to the full original, which stays the record.
//   · `published` is the gate: only publishedNews may be rendered.

export type NewsCategory = 'Press release' | 'Company';

export interface NewsItem {
  slug: string;
  /** ISO calendar day, YYYY-MM-DD. */
  date: string;
  title: string;
  summary: string;
  body: string[];
  category: NewsCategory;
  sourceName: string;
  sourceUrl: string;
  published: boolean;
}

export const NEWS: NewsItem[] = [
  {
    slug: 'series-a-capital-raise-closed',
    date: '2026-04-24',
    title: 'Series A capital raise closed',
    summary:
      'Integrant has closed its Series A capital raise and is exploring a pre-IPO placement ahead of a planned Nasdaq listing.',
    body: [
      'Integrant has closed its Series A capital raise, which opened in April 2025. Financial terms were not disclosed.',
      'Since the round opened, the company has reported progress in the development of its AI platform. In light of that progress, Integrant is exploring a pre-IPO placement ahead of a listing on the Nasdaq Stock Market planned for November 2026, under the proposed ticker symbol INGT.',
      'The company has said the proceeds of any placement would support final-stage development, operational scaling and market readiness.',
    ],
    category: 'Press release',
    sourceName: 'Business Wire',
    sourceUrl:
      'https://www.businesswire.com/news/home/20260422882502/en/Integrant-announces-closure-of-Series-A-capital-raise.-Now-exploring-pre-IPO-raise-ahead-of-November-listing',
    published: true,
  },
  {
    slug: 'nasdaq-ticker-symbol-ingt-reserved',
    date: '2026-04-16',
    title: 'Nasdaq ticker symbol INGT reserved',
    summary:
      'The Nasdaq Stock Market has granted Integrant the ticker symbol INGT, a step toward a planned initial public offering.',
    body: [
      'Integrant has been granted the ticker symbol INGT by the Nasdaq Stock Market, a step in preparing for the company’s planned initial public offering.',
      'Integrant is a Sydney-based company, founded in 2015, working across orthopaedic implant systems, biologics and AI clinical software.',
      'The company has said it intends to apply the proceeds of a listing to clinical programs, regulatory submissions and entry into markets outside Australia and New Zealand.',
    ],
    category: 'Press release',
    sourceName: 'Business Wire',
    sourceUrl:
      'https://www.businesswire.com/news/home/20260414004727/en/Integrant-Awarded-Nasdaq-Ticker-INGT-Ahead-of-Highly-Anticipated-IPO',
    published: true,
  },
];

/** The only export pages may render from — newest first. */
export const publishedNews = NEWS.filter((n) => n.published).sort((a, b) => b.date.localeCompare(a.date));

export const getNews = (slug: string) => publishedNews.find((n) => n.slug === slug);

/** Company boilerplate — the "About Integrant" paragraph for media use. */
export const BOILERPLATE =
  'Integrant is a Sydney-based orthopaedic company founded in 2015. It designs and supplies implant systems and instrumentation, graft materials and external fixation, and is developing AI clinical documentation software for the operating theatre. Integrant Pty Ltd supplies healthcare professionals across Australia and New Zealand.';

/** Public company identifiers — ABN from the Australian Business Register. */
export const COMPANY = {
  legalName: 'Integrant Pty Ltd',
  abn: '73 605 083 485',
  abnRecord: 'https://abr.business.gov.au/ABN/View/73605083485',
  linkedin: 'https://www.linkedin.com/company/integrantau/',
} as const;

export const MEDIA_CONTACT = {
  email: 'media@integrant.com.au',
} as const;
