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

export type FieldVariant =
  | 'lattice'
  | 'organic'
  | 'edge'
  | 'dense'
  // Premium-redesign scientific language (Aug 2026):
  | 'scaffold' // trabecular hex lattice — bone-scaffold microarchitecture
  | 'molecule' // sparse bond-line clusters — the chemistry sections
  | 'imaging'; // registration arcs + crosshair ticks — clinical-imaging plates

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
  /** Non-graph strokes (imaging arcs, double bonds) appended verbatim. */
  extras?: string;
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
  // Trabecular hex lattice — open cellular polygons, not a network graph
  scaffold: { count: 0, radius: 132, maxDegree: 4, firedEvery: 17 },
  // Bond-line chemistry clusters; edges are authored per ring, not derived
  molecule: { count: 0, radius: 0, maxDegree: 2, firedEvery: 9999 },
  // Pure instrument-plate strokes; no node/edge graph at all
  imaging: { count: 0, radius: 0, maxDegree: 0, firedEvery: 9999 },
};

export function buildField(variant: FieldVariant, seed: number): FieldGeometry {
  const spec = SPECS[variant];
  const rand = rng(seed);
  const nodes: FieldNode[] = [];

  // --- Authored-geometry variants (they return their own edges/extras) ---
  if (variant === 'scaffold') return buildScaffold(rand);
  if (variant === 'molecule') return buildMolecule(rand);
  if (variant === 'imaging') return buildImaging(rand);

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
 * Trabecular scaffold: a jittered hex grid with ~30% of cell walls removed —
 * open cellular polygons that read as bone-scaffold microarchitecture rather
 * than a network graph. Same seeded determinism as every other variant.
 */
function buildScaffold(rand: () => number): FieldGeometry {
  const spacing = 112;
  const vStep = spacing * 0.866;
  const nodes: FieldNode[] = [];
  const grid: (FieldNode | null)[][] = [];

  let row = 0;
  for (let y = 40; y <= H - 40; y += vStep, row++) {
    const cells: (FieldNode | null)[] = [];
    const offset = row % 2 === 1 ? spacing / 2 : 0;
    for (let x = 40 + offset; x <= W - 40; x += spacing) {
      if (rand() < 0.12) {
        cells.push(null); // missing junction — keeps the lattice porous
        continue;
      }
      const node: FieldNode = {
        x: x + (rand() - 0.5) * 44,
        y: y + (rand() - 0.5) * 44,
        r: 2.2,
        fired: false,
      };
      cells.push(node);
      nodes.push(node);
    }
    grid.push(cells);
  }

  // Cell walls: connect each junction to its right neighbour and the two
  // below it, dropping ~30% so polygons open up like trabeculae.
  const edges: [FieldNode, FieldNode][] = [];
  const link = (a: FieldNode | null | undefined, b: FieldNode | null | undefined) => {
    if (a && b && rand() >= 0.3) edges.push([a, b]);
  };
  for (let r = 0; r < grid.length; r++) {
    const odd = r % 2 === 1;
    for (let c = 0; c < grid[r]!.length; c++) {
      const here = grid[r]![c];
      link(here, grid[r]![c + 1]);
      link(here, grid[r + 1]?.[c]);
      link(here, grid[r + 1]?.[odd ? c + 1 : c - 1]);
    }
  }

  nodes.forEach((node, i) => {
    if (i % SPECS.scaffold.firedEvery === 0) {
      node.fired = true;
      node.r = 3.2;
    }
  });

  return { width: W, height: H, nodes, edges };
}

/**
 * Bond-line chemistry: three or four sparse hexagon rings with one substituent
 * spur each, placed away from the centre so copy stays clear. A couple of ring
 * bonds render doubled (offset parallel stroke) via `extras`.
 */
function buildMolecule(rand: () => number): FieldGeometry {
  const nodes: FieldNode[] = [];
  const edges: [FieldNode, FieldNode][] = [];
  let extras = '';

  // Cluster anchors hug the frame's thirds, never the centre
  const anchors = [
    { x: 130 + rand() * 110, y: 100 + rand() * 110 },
    { x: W - 180 - rand() * 110, y: 90 + rand() * 130 },
    { x: 150 + rand() * 130, y: H - 150 - rand() * 90 },
    { x: W - 160 - rand() * 120, y: H - 140 - rand() * 100 },
  ].slice(0, 3 + (rand() < 0.5 ? 1 : 0));

  for (const anchor of anchors) {
    const ringR = 44 + rand() * 10;
    const tilt = rand() * Math.PI;
    const ring: FieldNode[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = tilt + (i * Math.PI) / 3;
      const node: FieldNode = {
        x: anchor.x + Math.cos(angle) * ringR,
        y: anchor.y + Math.sin(angle) * ringR,
        r: i % 3 === 0 ? 2.6 : 2.1,
        fired: false,
      };
      ring.push(node);
      nodes.push(node);
    }
    for (let i = 0; i < 6; i++) {
      const a = ring[i]!;
      const b = ring[(i + 1) % 6]!;
      edges.push([a, b]);
      // Alternate bonds double up — the classic aromatic-ring shorthand
      if (i % 2 === 0) {
        const mx = (a.x + b.x) / 2 - anchor.x;
        const my = (a.y + b.y) / 2 - anchor.y;
        const mag = Math.hypot(mx, my) || 1;
        const off = 6;
        const ox = (mx / mag) * -off;
        const oy = (my / mag) * -off;
        const shrink = 0.18;
        const ax = a.x + (b.x - a.x) * shrink + ox;
        const ay = a.y + (b.y - a.y) * shrink + oy;
        const bx = b.x - (b.x - a.x) * shrink + ox;
        const by = b.y - (b.y - a.y) * shrink + oy;
        extras +=
          `<path d="M${n(ax)} ${n(ay)}L${n(bx)} ${n(by)}" fill="none" ` +
          `stroke="currentColor" stroke-width="1" opacity="0.45"/>`;
      }
    }
    // One substituent spur off a deterministic vertex
    const from = ring[Math.floor(rand() * 6)]!;
    const spurAngle = Math.atan2(from.y - anchor.y, from.x - anchor.x);
    const spur: FieldNode = {
      x: from.x + Math.cos(spurAngle) * 52,
      y: from.y + Math.sin(spurAngle) * 52,
      r: 3,
      fired: true,
    };
    nodes.push(spur);
    edges.push([from, spur]);
  }

  return { width: W, height: H, nodes, edges, extras };
}

/**
 * Clinical-imaging registration field: concentric arc segments, corner
 * crosshair ticks and scattered "+" registration marks. No node/edge graph —
 * pure instrument-plate language, so the copy zone stays completely clear.
 */
function buildImaging(rand: () => number): FieldGeometry {
  let extras = '';
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number, op: number) => {
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return (
      `<path d="M${n(x0)} ${n(y0)}A${n(r)} ${n(r)} 0 ${large} 1 ${n(x1)} ${n(y1)}" ` +
      `fill="none" stroke="currentColor" stroke-width="1" opacity="${op}"/>`
    );
  };

  // Two arc families sweeping in from opposite corners
  const c1 = { x: -60 + rand() * 80, y: -40 + rand() * 60 };
  const c2 = { x: W + 40 - rand() * 80, y: H + 30 - rand() * 60 };
  for (let i = 0; i < 3; i++) {
    const base1 = 0.28 + rand() * 0.25;
    extras += arc(c1.x, c1.y, 220 + i * 120 + rand() * 30, base1, base1 + 0.5 + rand() * 0.35, 0.55);
    const base2 = Math.PI + 0.25 + rand() * 0.25;
    extras += arc(c2.x, c2.y, 200 + i * 130 + rand() * 30, base2, base2 + 0.45 + rand() * 0.35, 0.5);
  }

  // Registration "+" marks scattered off-centre
  for (let i = 0; i < 7; i++) {
    const x = 60 + rand() * (W - 120);
    const edgeBias = rand() < 0.5 ? rand() * 130 : H - 130 + rand() * 100;
    const y = Math.min(H - 20, Math.max(20, edgeBias + (rand() - 0.5) * 40));
    const s = 6;
    extras +=
      `<path d="M${n(x - s)} ${n(y)}H${n(x + s)}M${n(x)} ${n(y - s)}V${n(y + s)}" ` +
      `fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/>`;
  }

  // Corner crosshair ticks — the plate's registration frame
  const tick = (x: number, y: number, dx: number, dy: number) =>
    `<path d="M${n(x)} ${n(y)}h${n(dx)}M${n(x)} ${n(y)}v${n(dy)}" fill="none" ` +
    `stroke="currentColor" stroke-width="1.2" opacity="0.8"/>`;
  extras += tick(28, 28, 18, 18) + tick(W - 28, 28, -18, 18) + tick(28, H - 28, 18, -18) + tick(W - 28, H - 28, -18, -18);

  return { width: W, height: H, nodes: [], edges: [], extras };
}

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

  // Everything sits in one inner group so CSS can drift it slowly. An <svg>
  // clips its content by default, so the drift can never bleed over the
  // section boundary into a neighbour — no overflow-hidden needed upstream.
  return (
    `<g class="field-inner">` +
    (lines
      ? `<path d="${lines}" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55"/>`
      : '') +
    (geo.extras ?? '') +
    impulses +
    `<g fill="currentColor">${dots(plain, 0.9)}${dots(fired, 1)}</g>` +
    fired
      .map((p) => `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${p.r * 3}" fill="currentColor" opacity="0.18"/>`)
      .join('') +
    `</g>`
  );
}
