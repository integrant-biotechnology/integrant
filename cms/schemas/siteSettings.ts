import type { SchemaType } from './types';

/** Singleton — global site settings. */
const siteSettings: SchemaType = {
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    { name: 'siteTitle', title: 'Site title', type: 'string' },
    { name: 'contactEmail', title: 'Contact email', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'address', title: 'Address', type: 'text', rows: 3 },
    { name: 'socialLinks', title: 'Social links', type: 'array', of: [{ type: 'url' }] },
    {
      name: 'announcement',
      title: 'Announcement bar',
      type: 'string',
      description: 'Optional site-wide banner (e.g. app launch)',
    },
  ],
};

export default siteSettings;
