// srcset for photography with WebP derivatives. The manifest is written by
// scripts/derive-photos.mjs and lists only files that exist and beat the
// JPEG, with their true widths. The JPEG always stays as `src`.
import DERIVATIVES from '../data/photo-derivatives.json';

const table = DERIVATIVES as Record<string, [string, number][]>;

export const photoSrcset = (src: string): string | undefined =>
  table[src]?.map(([file, width]) => `${file} ${width}w`).join(', ');
