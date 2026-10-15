/**
 * Product technical drawings — one hand-authored line drawing per system.
 *
 * The universal no-photo state: schematic engineering sketches of objective
 * construction (outline, thread form, holes, centreline), never device
 * renders and never anatomy — which keeps them TGA-safe by nature and means
 * the photography gap can never block a page. Consumed by ProductPlate.astro
 * (catalogue cards, detail heroes, related thumbs) and the /for-surgeons
 * theatre section.
 *
 * Drawing language (matches the original three for-surgeons instruments):
 * 120×300 viewBox, single-weight strokes, a dashed vertical centreline
 * (marked data-no-draw by the renderer), thread ticks as short diagonals.
 */

export interface ProductDrawing {
  viewBox: string;
  paths: string[];
  /** Dashed construction line — rendered with data-no-draw. */
  dashed?: string;
}

export const PRODUCT_DRAWINGS: Record<string, ProductDrawing> = {
  // Conical tapered arthroereisis implant — fenestrated body, soft threads
  archit: {
    viewBox: '0 0 120 300',
    paths: [
      // Driver interface + conical body, wide shoulder to soft tip
      'M 46 22 H 74 V 40 H 46 Z',
      'M 40 40 H 80 L 66 248 C 66 262, 54 262, 54 248 Z',
      // Soft thread form — pitch widens as the cone narrows
      'M 41 68 L 79 78', 'M 42 100 L 78 110', 'M 44 132 L 76 142',
      'M 46 164 L 74 174', 'M 48 196 L 72 206', 'M 51 226 L 69 234',
      // Fenestrations down the midline
      'M 60 90 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
      'M 60 152 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
      'M 60 210 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
    ],
    dashed: 'M 60 0 V 300',
  },

  // Suture screw anchor — anchor body, fibre-wire pair (original drawing)
  anchorit: {
    viewBox: '0 0 120 300',
    paths: [
      'M 60 96 m -13 0 a 13 13 0 1 0 26 0 a 13 13 0 1 0 -26 0',
      'M 48 118 H 72 L 72 248 L 60 282 L 48 248 Z',
      'M 48 140 L 72 150', 'M 48 168 L 72 178', 'M 48 196 L 72 206', 'M 48 224 L 72 234',
      'M 54 86 C 40 48, 52 30, 44 8',
      'M 66 86 C 80 48, 68 30, 76 8',
    ],
    dashed: 'M 60 60 V 300',
  },

  // Cannulated screw — head, run-out, threaded shaft (original drawing)
  screwit: {
    viewBox: '0 0 120 300',
    paths: [
      'M 42 12 H 78 L 72 40 H 48 Z',
      'M 52 12 V 6 H 68 V 12',
      'M 52 40 L 52 252 L 60 286 L 68 252 L 68 40',
      'M 50 64 L 70 74', 'M 50 92 L 70 102', 'M 50 120 L 70 130',
      'M 50 148 L 70 158', 'M 50 176 L 70 186', 'M 50 204 L 70 214', 'M 50 232 L 70 242',
    ],
    dashed: 'M 60 0 V 300',
  },

  // Arthrodesis plug — domed body, ingrowth pores (original drawing)
  fuseit: {
    viewBox: '0 0 120 300',
    paths: [
      'M 42 70 H 78 V 262 C 78 276, 42 276, 42 262 Z',
      'M 42 70 C 42 58, 78 58, 78 70',
      'M 52 106 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      'M 68 140 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      'M 52 174 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      'M 68 208 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      'M 52 242 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
    ],
    dashed: 'M 60 40 V 300',
  },

  // Suture-button loop construct — two buttons, continuous double loop
  loopit: {
    viewBox: '0 0 120 300',
    paths: [
      // Cortical buttons top + bottom
      'M 40 28 H 80 V 44 H 40 Z',
      'M 40 256 H 80 V 272 H 40 Z',
      // Button holes
      'M 52 36 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      'M 68 36 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      'M 52 264 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      'M 68 264 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      // The double loop — two suture strands bowing between the buttons
      'M 52 44 C 24 100, 24 200, 52 256',
      'M 68 44 C 96 100, 96 200, 68 256',
      'M 52 44 C 44 110, 76 190, 68 256',
      'M 68 44 C 76 110, 44 190, 52 256',
    ],
    dashed: 'M 60 10 V 290',
  },

  // Intramedullary nail — slender profile, transverse locking holes
  nailit: {
    viewBox: '0 0 120 300',
    paths: [
      'M 52 18 H 68 L 68 262 C 68 276, 52 276, 52 262 Z',
      'M 52 18 C 52 10, 68 10, 68 18',
      // Proximal + distal transverse locking holes
      'M 60 42 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      'M 60 68 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      'M 60 216 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      'M 60 244 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
      // Insertion-jig thread at the proximal end
      'M 56 30 L 64 34', 'M 56 34 L 64 38',
    ],
    dashed: 'M 60 0 V 300',
  },

  // Screw set — paired profiles, two diameters side by side
  'screw-sets': {
    viewBox: '0 0 120 300',
    paths: [
      // Larger-diameter screw, left
      'M 26 26 H 54 L 49 48 H 31 Z',
      'M 31 48 L 31 240 L 40 268 L 49 240 L 49 48',
      'M 30 72 L 50 80', 'M 30 100 L 50 108', 'M 30 128 L 50 136',
      'M 30 156 L 50 164', 'M 30 184 L 50 192', 'M 30 212 L 50 220',
      // Smaller-diameter screw, right
      'M 72 44 H 92 L 89 62 H 75 Z',
      'M 75 62 L 75 232 L 82 256 L 89 232 L 89 62',
      'M 74 84 L 90 90', 'M 74 108 L 90 114', 'M 74 132 L 90 138',
      'M 74 156 L 90 162', 'M 74 180 L 90 186', 'M 74 204 L 90 210',
    ],
    dashed: 'M 60 10 V 290',
  },

  // Removal set — T-handle driver above a reverse-thread extractor
  'screw-removal-set': {
    viewBox: '0 0 120 300',
    paths: [
      // T-handle
      'M 24 26 H 96 V 40 H 24 Z',
      'M 24 33 C 18 33, 18 33, 24 33',
      // Driver shaft with flats
      'M 54 40 H 66 V 148 H 54 Z',
      'M 54 60 H 66', 'M 54 80 H 66',
      // Conical extractor tip — reverse-cut thread leans the other way
      'M 50 148 H 70 L 63 262 C 63 272, 57 272, 57 262 Z',
      'M 68 168 L 52 176', 'M 67 192 L 53 200', 'M 66 216 L 54 224', 'M 64 240 L 56 246',
    ],
    dashed: 'M 60 12 V 292',
  },

  // Anterior fusion plate — elevation with staggered screw holes
  'ankle-fusion-set': {
    viewBox: '0 0 120 300',
    paths: [
      // Plate outline — waisted, rounded ends
      'M 44 24 C 30 24, 30 44, 40 54 L 50 130 C 52 146, 52 154, 50 170 L 40 246 C 30 256, 30 276, 44 276 L 76 276 C 90 276, 90 256, 80 246 L 70 170 C 68 154, 68 146, 70 130 L 80 54 C 90 44, 90 24, 76 24 Z',
      // Six screw holes, staggered through the waist
      'M 60 44 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0',
      'M 60 88 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0',
      'M 60 128 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
      'M 60 172 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0',
      'M 60 212 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0',
      'M 60 256 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0',
    ],
    dashed: 'M 60 0 V 300',
  },

  // External ring frame, plan view — outer ring with its hole pattern, an
  // inner ring joined by three struts, and two tensioned fixation wires
  // crossing the ring clamped at the outer plate.
  frameit: {
    viewBox: '0 0 240 240',
    paths: [
      // Outer ring (two plate edges) and its hole pattern
      'M 16 120 a 104 104 0 1 0 208 0 a 104 104 0 1 0 -208 0',
      'M 32 120 a 88 88 0 1 0 176 0 a 88 88 0 1 0 -176 0',
      'M 212.8 120.0 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 208.1 149.7 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 194.5 176.4 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 173.2 197.7 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 146.5 211.3 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 116.8 216.0 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 87.1 211.3 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 60.4 197.7 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 39.1 176.4 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 25.5 149.7 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 20.8 120.0 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 25.5 90.3 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 39.1 63.6 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 60.4 42.3 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 87.1 28.7 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 116.8 24.0 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 146.5 28.7 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 173.2 42.3 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 194.5 63.6 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      'M 208.1 90.3 a 3.2 3.2 0 1 0 6.4 0 a 3.2 3.2 0 1 0 -6.4 0',
      // Inner ring and holes
      'M 62 120 a 58 58 0 1 0 116 0 a 58 58 0 1 0 -116 0',
      'M 72 120 a 48 48 0 1 0 96 0 a 48 48 0 1 0 -96 0',
      'M 169.0 133.7 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 155.3 157.5 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 131.5 171.2 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 104.1 171.2 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 80.3 157.5 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 66.6 133.7 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 66.6 106.3 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 80.3 82.5 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 104.1 68.8 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 131.5 68.8 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 155.3 82.5 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      'M 169.0 106.3 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0',
      // Connecting struts
      'M 120.0 178.0 L 120.0 208.0',
      'M 69.8 91.0 L 43.8 76.0',
      'M 170.2 91.0 L 196.2 76.0',
      // Fixation wires and their clamps
      'M 207.0 160.6 L 33.0 79.4',
      'M 198.6 64.9 L 41.4 175.1',
      'M 202.0 155.6 h 10 v 10 h -10 Z',
      'M 28.0 74.4 h 10 v 10 h -10 Z',
      'M 193.6 59.9 h 10 v 10 h -10 Z',
      'M 36.4 170.1 h 10 v 10 h -10 Z',
    ],
    dashed: 'M 120 4 V 236',
  },

  // Injectable graft — syringe barrel, plunger, granule fill
  graftit: {
    viewBox: '0 0 120 300',
    paths: [
      // Plunger rod + thumb plate
      'M 40 18 H 80 V 26 H 40 Z',
      'M 56 26 H 64 V 58 H 56 Z',
      // Barrel with finger flanges
      'M 30 58 H 90 V 66 H 30 Z',
      'M 42 66 H 78 V 218 L 66 232 H 54 L 42 218 Z',
      // Graduation marks
      'M 42 96 H 52', 'M 42 126 H 52', 'M 42 156 H 52', 'M 42 186 H 52',
      // Delivery tip
      'M 56 232 H 64 V 262 H 56 Z',
      // Granules in the barrel
      'M 58 104 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
      'M 68 130 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
      'M 54 158 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
      'M 66 184 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
      'M 58 206 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
    ],
    dashed: 'M 60 10 V 290',
  },
};

export const getDrawing = (slug: string): ProductDrawing | undefined => PRODUCT_DRAWINGS[slug];
