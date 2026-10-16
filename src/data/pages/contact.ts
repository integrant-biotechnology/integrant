// Contact page content — mirrors cms/schemas/page.ts + siteSettings.ts.
// Verified facts only. admin@integrant.com.au and the 5 Ward Avenue address
// come from content-archive/structured/site-facts.json; media@integrant.com.au
// is the contact published on the company's own press releases (April 2026).
// No phone number is published on the site — do not add one without sign-off.

export const CONTACT = {
  address: {
    line1: '5 Ward Avenue',
    line2: 'Potts Point NSW 2011',
    country: 'Australia',
    /** Potts Point — rendered as a readout, not a map pin. */
    coordinates: '33.87°S · 151.22°E',
  },
  email: 'admin@integrant.com.au',
  mediaEmail: 'media@integrant.com.au',
  /** Direct lines — the primary contact design whenever the form is off. */
  direct: [
    {
      id: 'general',
      label: 'General & product enquiries',
      detail: 'Systems, specifications, loan sets and clinical support.',
      email: 'admin@integrant.com.au',
    },
    {
      id: 'media',
      label: 'Media enquiries',
      detail: 'Press, interviews and company news.',
      email: 'media@integrant.com.au',
    },
  ],
  channels: [
    { label: 'General & product enquiries', value: 'admin@integrant.com.au', href: 'mailto:admin@integrant.com.au' },
    { label: 'Distribution & partnerships', value: 'Partner enquiries', href: '/partners' },
    { label: 'Surgeons & clinical teams', value: 'For surgeons', href: '/for-surgeons' },
  ],
  form: {
    // Field set carried from the legacy WPForms capture (structured/forms.json).
    fields: ['name', 'email', 'subject', 'message'] as const,
    responseNote: 'RECEIVED — RESPONSE WITHIN 2 BUSINESS DAYS',
  },
} as const;
