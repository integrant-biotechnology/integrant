import type { SchemaType } from './types';

/**
 * Product — the core catalogue document.
 * Covers both divisions; implants stay enquiry-only (purchasable=false)
 * until Phase 2 e-commerce.
 */
const product: SchemaType = {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    {
      name: 'line',
      title: 'Product line',
      type: 'string',
      options: { list: ['Med-Tech', 'Bio-Tech'] },
    },
    {
      name: 'anatomyAreas',
      title: 'Anatomy areas',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'anatomyArea' }] }],
    },
    { name: 'tagline', title: 'Tagline', type: 'string' },
    { name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] },
    {
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      of: [{ type: 'object' }],
      description: 'Label/value pairs rendered as the engineering-panel spec table',
    },
    { name: 'sizes', title: 'Sizes / configurations', type: 'array', of: [{ type: 'string' }] },
    {
      name: 'indications',
      title: 'Indications',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Must match ARTG inclusions — compliance review before publish',
    },
    { name: 'artgNumber', title: 'ARTG number', type: 'string' },
    { name: 'images', title: 'Images', type: 'array', of: [{ type: 'image' }] },
    {
      name: 'model3d',
      title: '3D model (GLB)',
      type: 'file',
      description: 'Optional — powers the interactive implant viewer',
    },
    { name: 'documents', title: 'Documents / IFU', type: 'array', of: [{ type: 'file' }] },
    { name: 'sku', title: 'SKU', type: 'string' },
    {
      name: 'purchasable',
      title: 'Purchasable (Phase 2 shop)',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'related',
      title: 'Related products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
    },
  ],
};

export default product;
