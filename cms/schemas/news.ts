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
  ],
};

export default news;
