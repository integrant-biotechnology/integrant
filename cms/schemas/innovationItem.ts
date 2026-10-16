import type { SchemaType } from './types';

/**
 * Innovation item — one Wassup platform product. Mirrors WassupProduct in
 * src/data/innovation.ts. Function-only copy with a plain status label.
 */
const innovationItem: SchemaType = {
  name: 'innovationItem',
  title: 'Wassup product',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    {
      name: 'group',
      title: 'Group',
      type: 'string',
      options: { list: ['clinical', 'research'] },
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['In use', 'In development'] },
    },
    { name: 'role', title: 'Role', type: 'string' },
    { name: 'summary', title: 'Summary', type: 'text', rows: 3 },
    { name: 'capabilities', title: 'Capabilities', type: 'array', of: [{ type: 'string' }] },
    { name: 'principle', title: 'Human-review principle', type: 'string' },
  ],
};

export default innovationItem;
