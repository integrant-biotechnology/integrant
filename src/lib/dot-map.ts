// Build-time dot-map of Australia for the contact page's location plate.
// A coarse coastline polygon is rasterised into a grid of dots (point-in-
// polygon), rendered as static SVG — zero client JS, same philosophy as
// neural-field.ts. Coordinates are rough by design: at dot-grid resolution
// only the silhouette matters.

type Pt = [number, number]; // [lon, lat]

const MAINLAND: Pt[] = [
  [142.4, -10.7], [143.6, -14.2], [145.3, -14.9], [145.8, -16.9], [146.8, -19.3],
  [148.8, -20.3], [150.5, -23.4], [153.1, -27.5], [153.5, -28.8], [153.1, -30.3],
  [152.5, -32.4], [151.2, -33.9], [150.7, -35.2], [150.0, -37.1], [149.0, -37.8],
  [146.4, -39.1], [144.9, -38.4], [143.5, -38.8], [141.4, -38.4], [139.7, -37.3],
  [139.0, -35.7], [138.5, -35.0], [137.8, -35.1], [136.9, -35.3], [137.2, -34.2],
  [136.8, -33.7], [135.9, -34.9], [135.1, -34.6], [134.2, -32.7], [133.7, -32.1],
  [131.0, -31.5], [127.2, -32.3], [123.6, -33.9], [121.9, -33.9], [119.4, -34.5],
  [117.9, -35.1], [115.1, -34.4], [114.9, -33.5], [115.7, -33.2], [115.7, -31.8],
  [114.6, -28.8], [113.4, -26.2], [113.8, -26.6], [113.4, -25.5], [113.7, -24.0],
  [114.1, -21.9], [115.5, -21.6], [117.1, -20.7], [118.6, -20.3], [120.9, -19.6],
  [122.2, -18.0], [122.9, -16.4], [124.6, -16.4], [125.2, -15.5], [126.9, -13.8],
  [128.2, -14.8], [129.6, -14.9], [130.4, -12.6], [131.2, -12.3], [132.4, -12.2],
  [132.6, -11.5], [136.1, -12.1], [136.9, -12.3], [135.9, -14.9], [139.2, -17.7],
  [140.9, -17.6], [141.5, -15.0], [141.6, -12.9],
];

const TASMANIA: Pt[] = [
  [144.7, -40.7], [146.4, -41.2], [148.3, -40.9], [148.3, -42.2], [147.0, -43.6],
  [145.2, -42.2],
];

// Even-odd ray casting.
function inside(poly: Pt[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export interface DotMap {
  width: number;
  height: number;
  dots: { x: number; y: number; r: number }[];
  sydney: { x: number; y: number };
}

/** Project lon/lat to plate space and rasterise into a dot grid. */
export function buildDotMap(cols = 52): DotMap {
  const lonMin = 112.5;
  const lonMax = 154.5;
  const latMin = -44.5;
  const latMax = -9.5;
  const width = 520;
  const height = (width * (latMax - latMin)) / (lonMax - lonMin) / 0.85; // mild flattening
  const px = (lon: number) => ((lon - lonMin) / (lonMax - lonMin)) * width;
  const py = (lat: number) => ((latMax - lat) / (latMax - latMin)) * height;

  const step = width / cols;
  const dots: DotMap['dots'] = [];
  for (let gy = step / 2; gy < height; gy += step) {
    for (let gx = step / 2; gx < width; gx += step) {
      const lon = lonMin + (gx / width) * (lonMax - lonMin);
      const lat = latMax - (gy / height) * (latMax - latMin);
      if (inside(MAINLAND, lon, lat) || inside(TASMANIA, lon, lat)) {
        // Deterministic size variation keyed off the grid position — reads as
        // texture, never randomises between builds.
        const v = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233));
        dots.push({ x: +gx.toFixed(1), y: +gy.toFixed(1), r: +(0.9 + v * 0.7).toFixed(2) });
      }
    }
  }

  return { width: Math.round(width), height: Math.round(height), dots, sydney: { x: +px(151.21).toFixed(1), y: +py(-33.87).toFixed(1) } };
}
