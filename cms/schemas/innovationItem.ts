import type { SchemaType } from './types';

/**
 * Innovation item — app showcase, AI workflow story, R&D pipeline teasers.
 * The gated/portal fields are Phase 3 hooks (paywall-ready, not paywalled).
 */
const innovationItem: SchemaType = {
  name: 'innovationItem',
  title: 'Innovation item',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['App', 'AI workflow', 'R&D'] },
    },
    { name: 'summary', title: 'Summary', type: 'text', rows: 3 },
    { name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] },
    { name: 'media', title: 'Media', type: 'array', of: [{ type: 'image' }] },
    {
      name: 'appStoreUrl',
      title: 'App Store URL',
      type: 'url',
      description: 'Populate once the iOS app is approved',
    },
    {
      name: 'gated',
      title: 'Subscriber-gated (Phase 3 portal)',
      type: 'boolean',
      initialValue: false,
    },
  ],
};

export default innovationItem;
