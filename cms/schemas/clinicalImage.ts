import type { SchemaType } from './types';

/**
 * Clinical image — consented case imagery for the filterable gallery.
 * Nothing publishes without consentConfirmed; consider an HCP gate at render.
 */
const clinicalImage: SchemaType = {
  name: 'clinicalImage',
  title: 'Clinical image',
  type: 'document',
  fields: [
    { name: 'title', title: 'Case title', type: 'string' },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'caseSummary', title: 'Case summary', type: 'text', rows: 4 },
    {
      name: 'anatomyArea',
      title: 'Anatomy area',
      type: 'reference',
      to: [{ type: 'anatomyArea' }],
    },
    { name: 'product', title: 'Product used', type: 'reference', to: [{ type: 'product' }] },
    {
      name: 'consentConfirmed',
      title: 'Patient consent documented',
      type: 'boolean',
      description: 'Required before publish — no consent, no publish',
      initialValue: false,
    },
    {
      name: 'hcpOnly',
      title: 'Healthcare-professional gate',
      type: 'boolean',
      initialValue: true,
    },
  ],
};

export default clinicalImage;
