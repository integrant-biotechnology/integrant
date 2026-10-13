import type { SchemaType } from './types';

/** News / announcements (app launch PR, regulatory milestones, events). */
const news: SchemaType = {
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'publishedAt', title: 'Published at', type: 'datetime' },
    { name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 },
    { name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] },
    { name: 'coverImage', title: 'Cover image', type: 'image' },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['Press release', 'Company'] },
    },
    { name: 'sourceName', title: 'Original source (e.g. Business Wire)', type: 'string' },
    { name: 'sourceUrl', title: 'Original source URL', type: 'url' },
    {
      name: 'published',
      title: 'Published',
      description: 'Only published items render on the site. Copy must be free of therapeutic claims.',
      type: 'boolean',
      initialValue: false,
    },
  ],
};

export default news;
