/**
 * Neural field generator — deterministic constellation geometry, rendered to
 * SVG at build time.
 *
 * The site's signature motif lives in the WebGL hero, which can't be reused on
 * content sections (a shader per section is not viable). This produces the same
 * visual language as static markup: zero JS, zero WebGL, no repaint cost, and
 * it themes for free because everything inherits `currentColor`.
 *
 * Determinism matters: with Math.random() the geometry would change on every
 * build, producing noisy diffs and a site that subtly reshuffles between
 * deploys. Every variant is driven by an explicit seed.
 */

export type FieldVariant = 'lattice' | 'organic' | 'edge' | 'dense';

export interface FieldNode {
  x: number;
  y: number;
  r: number;
  /** A few nodes read as "fired" — slightly larger, with a halo. */
  fired: boolean;
}

export interface FieldGeometry {
  width: number;
  height: number;
  nodes: FieldNode[];
  edges: [FieldNode, FieldNode][];
}

/** mulberry32 — small, fast, well-distributed for this purpose. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1000;
const H = 600;

interface VariantSpec {
  count: number;
  radius: number;
  maxDegree: number;
  firedEvery: number;
}

const SPECS: Record<FieldVariant, VariantSpec> = {
  // Ordered ANN grid — the "machine" sections
  lattice: { count: 48, radius: 260, maxDegree: 3, firedEvery: 11 },
  // Irregular cluster — the "biology" sections
  organic: { count: 54, radius: 190, maxDegree: 3, firedEvery: 13 },
  // Sparse corner anchor — the default
  edge: { count: 26, radius: 240, maxDegree: 2, firedEvery: 9 },
  // Contrast bands and the 404
  dense: { count: 84, radius: 165, maxDegree: 3, firedEvery: 15 },
};

export function buildField(variant: FieldVariant, seed: number): FieldGeometry {
  const spec = SPECS[variant];
  const rand = rng(seed);
  const nodes: FieldNode[] = [];

  if (variant === 'lattice') {
    // Layered columns, mild jitter — reads as an artificial network
    const cols = 8;
    const rows = 6;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() < 0.18) continue; // gaps keep it from looking like graph paper
        nodes.push({
          x: 60 + (c * (W - 120)) / (cols - 1) + (rand() - 0.5) * 16,
          y: 60 + (r * (H - 120)) / (rows - 1) + (rand() - 0.5) * 16,
          r: 2.4,
          fired: false,
        });
      }
    }
  } else if (variant === 'edge') {
    // Hug the frame so the centre stays clear for copy
    for (let i = 0; i < spec.count; i++) {
      const onVertical = rand() < 0.5;
      const near = rand() < 0.5;
      nodes.push({
        x: onVertical ? (near ? rand() * 190 : W - rand() * 190) : rand() * W,
        y: onVertical ? rand() * H : near ? rand() * 150 : H - rand() * 150,
        r: 2.2,
        fired: false,
      });
    }
  } else {
    for (let i = 0; i < spec.count; i++) {
      nodes.push({ x: rand() * W, y: rand() * H, r: 2.3, fired: false });
    }
  }

  nodes.forEach((n, i) => {
    if (i % spec.firedEvery === 0) {
      n.fired = true;
      n.r = 3.4;
    }
  });

  // Radius-limited nearest neighbours with a degree cap — the same rule the
  // hero shader uses, so both layers read as one system.
  const degree = new Array(nodes.length).fill(0);
  const edges: [FieldNode, FieldNode][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (degree[i]! >= spec.maxDegree || degree[j]! >= spec.maxDegree) continue;
      const a = nodes[i]!;
      const b = nodes[j]!;
      if (Math.hypot(a.x - b.x, a.y - b.y) > spec.radius) continue;
      edges.push([a, b]);
      degree[i]!++;
      degree[j]!++;
    }
  }

  return { width: W, height: H, nodes, edges };
}

const n = (v: number) => Math.round(v * 10) / 10;

/**
 * Renders geometry to SVG markup. Colour comes from `currentColor`.
 *
 * `pulse` adds a few separate fibres that carry a travelling impulse (CSS
 * animated). Deliberately a handful, not all of them — the field must stay a
 * background, and every animated stroke is a compositor layer.
 */
export function renderField(geo: FieldGeometry, pulse = false): string {
  const lines = geo.edges
    .map(([a, b]) => `M${n(a.x)} ${n(a.y)}L${n(b.x)} ${n(b.y)}`)
    .join('');

  // pick a spread of edges rather than adjacent ones, so impulses don't cluster
  const impulses = pulse
    ? geo.edges
        .filter((_, i) => i % Math.max(1, Math.floor(geo.edges.length / 5)) === 0)
        .slice(0, 5)
        .map(
          ([a, b], i) =>
            `<path class="field-impulse" d="M${n(a.x)} ${n(a.y)}L${n(b.x)} ${n(b.y)}" ` +
            `fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" ` +
            `opacity="0.9" style="--d:${(i * 1.05).toFixed(2)}s"/>`
        )
        .join('')
    : '';

  const plain = geo.nodes.filter((p) => !p.fired);
  const fired = geo.nodes.filter((p) => p.fired);

  const dots = (set: FieldNode[], op: number) =>
    set
      .map((p) => `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${p.r}" opacity="${op}"/>`)
      .join('');

  return (
    `<path d="${lines}" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55"/>` +
    impulses +
    `<g fill="currentColor">${dots(plain, 0.9)}${dots(fired, 1)}</g>` +
    fired
      .map((p) => `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${p.r * 3}" fill="currentColor" opacity="0.18"/>`)
      .join('')
  );
}
