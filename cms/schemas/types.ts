/**
 * Minimal structural types for Sanity schema definitions.
 * These files are plain data — drop them into a Sanity Studio's schema
 * registry once the Studio project is created (needs the client's Sanity
 * account; deferred from the prototype phase).
 */

export interface SchemaField {
  name: string;
  title: string;
  type: string;
  of?: Array<{ type: string; to?: Array<{ type: string }> }>;
  to?: Array<{ type: string }>;
  options?: Record<string, unknown>;
  description?: string;
  validation?: unknown;
  fields?: SchemaField[];
  initialValue?: unknown;
  rows?: number;
}

export interface SchemaType {
  name: string;
  title: string;
  type: 'document' | 'object';
  fields: SchemaField[];
  description?: string;
}
