import type { SchemaType } from './types';

/** Generic marketing/content page (About, For Surgeons, Careers, …). */
const page: SchemaType = {
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'hero', title: 'Hero heading', type: 'string' },
    { name: 'intro', title: 'Intro', type: 'text', rows: 3 },
    { name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] },
    {
      name: 'showPricing',
      title: 'Show pricing block (For Surgeons)',
      type: 'boolean',
      description: 'CMS-toggled — stays off until the fee structure is finalised',
      initialValue: false,
    },
    { name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2 },
    { name: 'ogImage', title: 'Social share image', type: 'image' },
  ],
};

export default page;
