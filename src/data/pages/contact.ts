// Contact page content — mirrors cms/schemas/page.ts + siteSettings.ts.
// Verified facts only (content-archive/structured/site-facts.json):
// the ONLY published email is admin@integrant.com.au, the address is
// 5 Ward Avenue Potts Point, and NO phone number exists — do not add one.

export const CONTACT = {
  address: {
    line1: '5 Ward Avenue',
    line2: 'Potts Point NSW 2011',
    country: 'Australia',
    /** Potts Point — rendered as a readout, not a map pin. */
    coordinates: '33.87°S · 151.22°E',
  },
  email: 'admin@integrant.com.au',
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
