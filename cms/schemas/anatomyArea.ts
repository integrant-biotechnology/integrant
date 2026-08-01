import type { SchemaType } from './types';

/** Anatomy area — the "browse by anatomy" axis (8 regions). */
const anatomyArea: SchemaType = {
  name: 'anatomyArea',
  title: 'Anatomy area',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'summary', title: 'Summary', type: 'text', rows: 3 },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'order', title: 'Display order', type: 'number' },
  ],
};

export default anatomyArea;
