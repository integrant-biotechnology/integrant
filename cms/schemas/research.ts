import type { SchemaType } from './types';

/**
 * Research / trial summary — describes research activity only.
 * Compliance guardrail: no unapproved-indication promotion, no outcome
 * claims; content reviewed against TGA advertising rules before publish.
 */
const research: SchemaType = {
  name: 'research',
  title: 'Research summary',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'status', title: 'Status', type: 'string', options: { list: ['Planned', 'Active', 'Completed'] } },
    { name: 'summary', title: 'Summary (activity, not outcomes)', type: 'text', rows: 4 },
    { name: 'methodology', title: 'Methodology', type: 'array', of: [{ type: 'block' }] },
    { name: 'partners', title: 'Partners', type: 'array', of: [{ type: 'string' }] },
    {
      name: 'complianceReviewed',
      title: 'Compliance reviewed (TGA)',
      type: 'boolean',
      description: 'Required before publish',
      initialValue: false,
    },
  ],
};

export default research;
