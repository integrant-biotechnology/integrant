/**
 * Monochrome volumetric light + neural constellation — OGL, three passes:
 *
 *   1. Fullscreen god-rays fragment pass (the theatre lamp, off the brand board)
 *   2. Synapse lines — hairline connections with light impulses traveling along
 *      them (gl.LINES, additive)
 *   3. Neural/stellar points — drifting particles in 3D depth, lit by the beam,
 *      occasionally "firing" (gl.POINTS, additive)
 *
 * The plexus is fully procedural in the vertex shaders: positions derive from
 * (base, seed, uTime), so there is ZERO per-frame CPU/buffer work — the graph
 * topology is fixed at init and both endpoints of every line recompute the
 * same drift as their particle. Everything shares the beam-cone math, the
 * power-on envelope, and the scroll hand-off (dim + sweep + recede).
 *
 * Robustness: FPS auto-degrade (drop DPR, then bail to T1), WebGL context-loss
 * bail-out, pause when off-screen or tab hidden, damped pointer parallax on
 * fine-pointer devices only.
 */
import { Renderer, Program, Mesh, Triangle, Geometry } from 'ogl';
import { heroScroll, heroMorph } from './hero-bridge';

/** GLSL shared by every pass: hash/noise, power-on envelope, beam light. */
const GLSL_COMMON = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uAim;
  uniform float uScroll;
  uniform float uInvert; // 0 = god-rays on black, 1 = blueprint on white

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Theatre-lamp power-on: dark → two warm-up blips → bloom to full
  float bootEnvelope(float t) {
    float ramp = smoothstep(0.35, 1.6, t);
    ramp *= 0.7 + 0.3 * smoothstep(1.6, 2.3, t);
    float blip1 = step(0.42, t) * step(t, 0.50) * 0.45;
    float blip2 = step(0.68, t) * step(t, 0.74) * 0.7;
    return max(ramp, max(blip1, blip2));
  }

  // How much lamp light reaches a point (uv space, matches the rays pass)
  float beamLight(vec2 uvPos) {
    vec2 light = vec2(0.14, 1.10 + 0.16 * uScroll) + uAim;
    vec2 p = uvPos - light;
    p.x *= uAspect;
    float dist = length(p);
    float ang = atan(p.y, p.x);
    float aimAng = -1.12 + 0.22 * uScroll;
    float cone = smoothstep(0.95, 0.25, abs(ang - aimAng));
    return cone * exp(-dist * 1.3);
  }
`;

/** Procedural particle drift + bio→AI morph shared by points + lines. */
const GLSL_DRIFT = /* glsl */ `
  uniform float uMorph; // 0 = biological field → 1 = ANN lattice

  vec3 wander(float seed) {
    float s = 0.55 + 0.45 * fract(seed * 7.31);
    return vec3(
      sin(uTime * 0.11 * s + seed * 17.0),
      cos(uTime * 0.13 * s + seed * 23.0),
      sin(uTime * 0.09 * s + seed * 29.0)
    ) * 0.045;
  }

  // Barely-perceptible rotation of the organic field (the cosmos turning)
  vec3 spin(vec3 p) {
    float ra = uTime * 0.006;
    float c = cos(ra);
    float sn = sin(ra);
    p.xy = mat2(c, -sn, sn, c) * p.xy;
    return p;
  }

  // Per-particle morph progress: a wave of organization sweeps the field,
  // each particle snapping to its lattice slot on its own delay.
  float morphE(float delay) {
    float e = smoothstep(delay, delay + 0.45, uMorph);
    return e * e * (3.0 - 2.0 * e);
  }

  // Organic drift → machine stillness. The lattice barely breathes (12%
  // residual wander, no rotation): biology is alive, the machine is precise.
  vec3 morphPos(vec3 a, vec3 b, float seed, float delay) {
    float e = morphE(delay);
    vec3 organic = spin(a + wander(seed));
    vec3 machine = b + wander(seed) * 0.12;
    return mix(organic, machine, e);
  }

  // Depth parallax from the damped pointer + scroll recede (deep = slower)
  vec2 place(vec3 p) {
    vec2 xy = p.xy;
    xy += uAim * mix(0.3, 2.6, p.z);
    xy.y += uScroll * mix(0.10, 0.32, p.z) * (1.0 - 0.7 * uMorph);
    return xy;
  }
`;

const RAYS_VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const RAYS_FRAGMENT = /* glsl */ `
  precision highp float;
  ${GLSL_COMMON}
  uniform float uIntensity;
  varying vec2 vUv;

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(19.7, 7.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Light source just above the top-left corner; recedes as you scroll
    vec2 light = vec2(0.14, 1.10 + 0.16 * uScroll) + uAim;
    vec2 p = vUv - light;
    p.x *= uAspect;

    float dist = length(p);
    float ang = atan(p.y, p.x);

    // Beam cone aimed down-right; sweeps gently with scroll hand-off
    float aimAng = -1.12 + 0.22 * uScroll;
    float cone = smoothstep(0.95, 0.25, abs(ang - aimAng));

    // Layered angular ray bands, drifting very slowly
    float rays = 0.55 + 0.45 * sin(ang * 22.0 + uTime * 0.13);
    rays *= 0.62 + 0.38 * sin(ang * 9.0 - uTime * 0.07 + fbm(vec2(ang * 4.0, uTime * 0.03)) * 3.0);
    rays *= 0.75 + 0.25 * sin(ang * 47.0 - uTime * 0.05);
    rays = pow(max(rays, 0.0), 2.4);

    // Distance attenuation + soft drifting particulate (kept low-contrast —
    // the plexus passes carry the "matter in the light" role now)
    float atten = exp(-dist * 1.55);
    float dust = fbm(vUv * vec2(3.0 * uAspect, 3.0) + vec2(uTime * 0.016, -uTime * 0.011));
    float vol = cone * rays * atten * (0.70 + 0.40 * dust);

    // Soft ambient bloom near the source
    float amb = exp(-dist * 2.6) * 0.30 + exp(-dist * 1.1) * 0.07;

    // Fade the beam out toward the lower third so the CTA sits on near-black
    float floorFade = smoothstep(-0.08, 0.42, vUv.y);
    float edgeFade = smoothstep(1.06, 0.72, vUv.x);

    // Organic lamp micro-flicker, power-on envelope, scroll dim
    float flicker = 0.965 + 0.035 * noise(vec2(uTime * 2.7, 3.1));
    float l = (vol * 1.15 + amb) * floorFade * edgeFade * uIntensity;
    l *= bootEnvelope(uTime) * flicker * (1.0 - 0.62 * uScroll);

    // Filmic-ish rolloff, monochrome
    l = 1.0 - exp(-l * 1.7);

    // Fine animated grain in lit regions + dither to kill banding
    float g = hash(gl_FragCoord.xy + fract(uTime * 0.7) * 61.7);
    l += (g - 0.5) * 0.055 * l;
    l += (hash(gl_FragCoord.xy) - 0.5) / 160.0;

    gl_FragColor = vec4(vec3(max(l, 0.0)), 1.0);
  }
`;

const POINTS_VERTEX = /* glsl */ `
  ${GLSL_COMMON}
  ${GLSL_DRIFT}
  attribute vec3 aPos;
  attribute vec3 aPosB;
  attribute float aSeed;
  attribute float aSize;
  attribute float aDelay;
  uniform float uDpr;
  varying float vBright;

  void main() {
    float e = morphE(aDelay);
    vec3 p = morphPos(aPos, aPosB, aSeed, aDelay);
    vec2 xy = place(p);
    vec2 uvPos = xy * 0.5 + 0.5;

    float beam = beamLight(uvPos);

    // Slow individual twinkle — steadies as the machine takes over
    float tw = 0.6 + 0.4 * (1.0 - 0.7 * e) * sin(uTime * (0.5 + fract(aSeed * 3.7)) + aSeed * 40.0);

    // Occasional neuron "firing": a ~1.5s bloom every ~25s, staggered
    float ph = fract(uTime * 0.04 + aSeed);
    float fire = smoothstep(0.0, 0.04, ph) * smoothstep(0.13, 0.05, ph);
    // The lattice computes: an extra firing cycle fades in with the morph
    float ph2 = fract(uTime * 0.085 + aSeed * 1.7);
    fire += smoothstep(0.0, 0.03, ph2) * smoothstep(0.10, 0.04, ph2) * e;

    // Machine neurons hold a steady glow; biology relies on the lamp
    vBright = (0.14 + 0.9 * beam) * tw + fire * (0.35 + 0.65 * beam) + e * 0.30;
    vBright *= bootEnvelope(uTime - 0.45) * (1.0 - 0.45 * uScroll * (1.0 - 0.6 * e));

    gl_PointSize = aSize * uDpr * mix(0.65, 1.5, p.z) * (1.0 + fire * 1.6);
    gl_Position = vec4(xy, 0.0, 1.0);
  }
`;

const POINTS_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uInvert;
  varying float vBright;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float halo = smoothstep(1.0, 0.25, d);
    float core = smoothstep(0.45, 0.0, d);
    float a = (halo * 0.45 + core * 0.9) * vBright;
    gl_FragColor = vec4(vec3(1.0 - uInvert), a);
  }
`;

const LINES_VERTEX = /* glsl */ `
  ${GLSL_COMMON}
  ${GLSL_DRIFT}
  attribute vec3 aPos;
  attribute vec3 aPosB;
  attribute float aSeed;
  attribute float aDelay;
  attribute float aT;        // 0 at one endpoint, 1 at the other
  attribute float aEdgeFade; // closer rest-length = stronger line
  attribute float aEdgePhase;
  varying float vT;
  varying float vFade;
  varying float vPhase;
  varying float vBeam;
  varying float vEnv;
  varying float vMorph;

  void main() {
    vec3 p = morphPos(aPos, aPosB, aSeed, aDelay);
    vec2 xy = place(p);
    vT = aT;
    vFade = aEdgeFade;
    vPhase = aEdgePhase;
    vMorph = morphE(aDelay);
    vBeam = beamLight(xy * 0.5 + 0.5);
    vEnv = bootEnvelope(uTime - 0.6) * (1.0 - 0.45 * uScroll * (1.0 - 0.6 * vMorph));
    gl_Position = vec4(xy, 0.0, 1.0);
  }
`;

const LINES_FRAGMENT = /* glsl */ `
  precision highp float;
  ${GLSL_COMMON}
  varying float vT;
  varying float vFade;
  varying float vPhase;
  varying float vBeam;
  varying float vEnv;
  varying float vMorph;

  void main() {
    // Resting synapse: hairline, brighter where the lamp reaches it —
    // and steadier once it becomes a layer connection
    float base = vFade * (0.038 + 0.085 * vBeam + 0.05 * vMorph);

    // Light impulse traveling along the fiber — more cycles fire as the
    // network "computes" harder in its machine state
    float cycle = uTime * 0.14 + vPhase * 7.0;
    float gate = step(0.72 - 0.4 * vMorph, hash(vec2(floor(cycle), vPhase * 91.7)));
    float pos = fract(cycle) * 1.5 - 0.25;
    float imp = exp(-pow((vT - pos) * 7.0, 2.0)) * gate;

    float a = (base + imp * vFade * (0.10 + 0.55 * vBeam + 0.20 * vMorph)) * vEnv;
    gl_FragColor = vec4(vec3(1.0 - uInvert), a);
  }
`;

type Tier = 2 | 3;

export function mountHeroShader(
  canvas: HTMLCanvasElement,
  hero: HTMLElement,
  tier: Tier,
  onFail: () => void
): () => void {
  const maxDpr = tier === 3 ? 2 : 1.5;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  const renderer = new Renderer({
    canvas,
    dpr,
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
  const gl = renderer.gl;

  const sharedUniforms = () => ({
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uAim: { value: [0, 0] },
    uScroll: { value: 0 },
    uMorph: { value: 0 },
    uInvert: { value: 0 },
  });

  // --- Pass 1: god-rays ---
  const raysProgram = new Program(gl, {
    vertex: RAYS_VERTEX,
    fragment: RAYS_FRAGMENT,
    uniforms: { ...sharedUniforms(), uIntensity: { value: 1 } },
  });
  const raysMesh = new Mesh(gl, { geometry: new Triangle(gl), program: raysProgram });

  // --- Constellation graph (fixed topology, procedural motion) ---
  const N = tier === 3 ? 380 : 240;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const pPos = new Float32Array(N * 3);
  const pSeed = new Float32Array(N);
  const pSize = new Float32Array(N);
  const star = new Uint8Array(N);

  for (let i = 0; i < N; i++) {
    const isStar = Math.random() < 0.22;
    star[i] = isStar ? 1 : 0;
    pPos[i * 3] = rand(-1.25, 1.25);
    pPos[i * 3 + 1] = rand(-1.15, 1.15);
    pPos[i * 3 + 2] = isStar ? rand(0.0, 0.22) : rand(0.25, 1.0);
    pSeed[i] = Math.random();
    pSize[i] = isStar ? rand(1.1, 1.9) : rand(1.8, 3.6);
  }

  // Lattice targets: a 6×10 grid of xy sites, stacked in depth — each site
  // becomes a glowing "artificial neuron" of 3–5 additive points. Stars keep
  // their positions (the universe stays behind the machine). Morph delays
  // sweep the wave of organization left → right across the field.
  const pPosB = new Float32Array(N * 3);
  const pDelay = new Float32Array(N);
  const LCOLS = 6;
  const LROWS = 10;
  {
    let k = 0;
    for (let i = 0; i < N; i++) {
      if (star[i]) {
        pPosB[i * 3] = pPos[i * 3]!;
        pPosB[i * 3 + 1] = pPos[i * 3 + 1]!;
        pPosB[i * 3 + 2] = pPos[i * 3 + 2]!;
        pDelay[i] = 0;
        continue;
      }
      const col = k % LCOLS;
      const row = Math.floor(k / LCOLS) % LROWS;
      const dep = Math.floor(k / (LCOLS * LROWS));
      pPosB[i * 3] = -0.85 + (col * 1.7) / (LCOLS - 1) + rand(-0.012, 0.012);
      pPosB[i * 3 + 1] = -0.74 + (row * 1.48) / (LROWS - 1) + rand(-0.012, 0.012);
      pPosB[i * 3 + 2] = 0.3 + Math.min(dep / 4, 1) * 0.7;
      pDelay[i] = (col / (LCOLS - 1)) * 0.38 + Math.random() * 0.16;
      k++;
    }
  }

  const RADIUS = 0.23;
  const degree = new Uint8Array(N);
  const edges: Array<[number, number, number]> = []; // [i, j, restDist]
  const maxEdges = Math.floor(N * 1.4);
  outer: for (let i = 0; i < N; i++) {
    if (star[i]) continue;
    for (let j = i + 1; j < N; j++) {
      if (star[j] || degree[i]! >= 3 || degree[j]! >= 3) continue;
      const dx = pPos[i * 3]! - pPos[j * 3]!;
      const dy = pPos[i * 3 + 1]! - pPos[j * 3 + 1]!;
      const dz = (pPos[i * 3 + 2]! - pPos[j * 3 + 2]!) * 0.35;
      const d = Math.hypot(dx, dy, dz);
      if (d < RADIUS) {
        edges.push([i, j, d]);
        degree[i]!++;
        degree[j]!++;
        if (edges.length >= maxEdges) break outer;
      }
    }
  }

  // --- Pass 2: synapse lines ---
  const E = edges.length;
  const lPos = new Float32Array(E * 2 * 3);
  const lPosB = new Float32Array(E * 2 * 3);
  const lSeed = new Float32Array(E * 2);
  const lDelay = new Float32Array(E * 2);
  const lT = new Float32Array(E * 2);
  const lFade = new Float32Array(E * 2);
  const lPhase = new Float32Array(E * 2);
  edges.forEach(([i, j, d], e) => {
    const fade = Math.min(1, Math.max(0, (RADIUS - d) / (RADIUS * 0.7)));
    const phase = Math.random();
    for (const [k, idx, t] of [
      [0, i, 0],
      [1, j, 1],
    ] as const) {
      const v = e * 2 + k;
      lPos[v * 3] = pPos[idx * 3]!;
      lPos[v * 3 + 1] = pPos[idx * 3 + 1]!;
      lPos[v * 3 + 2] = pPos[idx * 3 + 2]!;
      lPosB[v * 3] = pPosB[idx * 3]!;
      lPosB[v * 3 + 1] = pPosB[idx * 3 + 1]!;
      lPosB[v * 3 + 2] = pPosB[idx * 3 + 2]!;
      lSeed[v] = pSeed[idx]!;
      lDelay[v] = pDelay[idx]!;
      lT[v] = t;
      lFade[v] = fade;
      lPhase[v] = phase;
    }
  });

  const linesProgram = new Program(gl, {
    vertex: LINES_VERTEX,
    fragment: LINES_FRAGMENT,
    uniforms: sharedUniforms(),
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const applyPalette = (invert: boolean) => {
    const src = gl.SRC_ALPHA;
    const dst = invert ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE;
    linesProgram.setBlendFunc(src, dst);
    pointsProgram.setBlendFunc(src, dst);
    gl.clearColor(invert ? 1 : 0, invert ? 1 : 0, invert ? 1 : 0, 1);
    for (const p of programs) p.uniforms.uInvert!.value = invert ? 1 : 0;
  };

  linesProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
  const linesMesh = new Mesh(gl, {
    mode: gl.LINES,
    geometry: new Geometry(gl, {
      aPos: { size: 3, data: lPos },
      aPosB: { size: 3, data: lPosB },
      aSeed: { size: 1, data: lSeed },
      aDelay: { size: 1, data: lDelay },
      aT: { size: 1, data: lT },
      aEdgeFade: { size: 1, data: lFade },
      aEdgePhase: { size: 1, data: lPhase },
    }),
    program: linesProgram,
  });

  // --- Pass 3: neural points ---
  const pointsProgram = new Program(gl, {
    vertex: POINTS_VERTEX,
    fragment: POINTS_FRAGMENT,
    uniforms: { ...sharedUniforms(), uDpr: { value: dpr } },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  pointsProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
  const pointsMesh = new Mesh(gl, {
    mode: gl.POINTS,
    geometry: new Geometry(gl, {
      aPos: { size: 3, data: pPos },
      aPosB: { size: 3, data: pPosB },
      aSeed: { size: 1, data: pSeed },
      aSize: { size: 1, data: pSize },
      aDelay: { size: 1, data: pDelay },
    }),
    program: pointsProgram,
  });

  const programs = [raysProgram, linesProgram, pointsProgram];

  const isLight = () => document.documentElement.dataset.theme === 'light';
  let invert = isLight();
  applyPalette(invert);

  // A theme switch only changes palette + blending — no context teardown.
  const onThemeChange = () => {
    invert = isLight();
    applyPalette(invert);
  };
  window.addEventListener('integrant:themechange', onThemeChange);

  // QA override: embedded preview panes report visibilityState "hidden",
  // which would (correctly) pause the loop. ?forcevisible bypasses the gate.
  const ignoreVisibility = new URLSearchParams(window.location.search).has('forcevisible');

  let raf = 0;
  let running = false;
  let destroyed = false;
  let visible = true;
  let pageVisible = ignoreVisibility || !document.hidden;
  let firstFrame = false;
  const t0 = performance.now();

  // --- sizing ---
  const resize = () => {
    renderer.dpr = dpr;
    renderer.setSize(hero.clientWidth, hero.clientHeight);
    const aspect = hero.clientWidth / Math.max(hero.clientHeight, 1);
    for (const p of programs) p.uniforms.uAspect!.value = aspect;
    pointsProgram.uniforms.uDpr!.value = dpr;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(hero);

  // --- damped pointer drift (fine pointers only) ---
  const aim = { x: 0, y: 0, tx: 0, ty: 0 };
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const onPointer = (e: PointerEvent) => {
    aim.tx = (e.clientX / window.innerWidth - 0.5) * 0.07;
    aim.ty = (0.5 - e.clientY / window.innerHeight) * 0.05;
  };
  if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true });

  // --- FPS monitor: degrade DPR, then bail to T1 ---
  let frames = 0;
  let lastCheck = performance.now();
  let strikes = 0;
  const checkFps = (now: number) => {
    frames++;
    if (now - lastCheck >= 1000) {
      const fps = (frames * 1000) / (now - lastCheck);
      frames = 0;
      lastCheck = now;
      if (fps < 45) {
        strikes++;
        if (strikes >= 2) {
          strikes = 0;
          if (dpr > 1) {
            dpr = 1;
            resize();
          } else {
            fail();
          }
        }
      } else {
        strikes = 0;
      }
    }
  };

  // --- render loop ---
  const loop = (now: number) => {
    if (!running || destroyed) return;
    raf = requestAnimationFrame(loop);
    aim.x += (aim.tx - aim.x) * 0.03;
    aim.y += (aim.ty - aim.y) * 0.03;
    const t = (now - t0) / 1000;
    for (const p of programs) {
      p.uniforms.uTime!.value = t;
      p.uniforms.uAim!.value = [aim.x, aim.y];
      p.uniforms.uScroll!.value = heroScroll.value;
      p.uniforms.uMorph!.value = heroMorph.value;
    }
    if (invert) {
      renderer.render({ scene: linesMesh });
      renderer.render({ scene: pointsMesh, clear: false });
    } else {
      renderer.render({ scene: raysMesh });
      renderer.render({ scene: linesMesh, clear: false });
      renderer.render({ scene: pointsMesh, clear: false });
    }
    if (!firstFrame) {
      firstFrame = true;
      canvas.style.opacity = '1';
    }
    checkFps(now);
  };

  const setRunning = () => {
    const should = visible && pageVisible && !destroyed;
    if (should && !running) {
      running = true;
      lastCheck = performance.now();
      frames = 0;
      raf = requestAnimationFrame(loop);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true;
      setRunning();
    },
    { threshold: 0.01 }
  );
  io.observe(hero);

  const onVisibility = () => {
    pageVisible = ignoreVisibility || !document.hidden;
    setRunning();
  };
  document.addEventListener('visibilitychange', onVisibility);

  // --- context loss: never show a dead canvas ---
  const onContextLost = (e: Event) => {
    e.preventDefault();
    fail();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('integrant:themechange', onThemeChange);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    if (finePointer) window.removeEventListener('pointermove', onPointer);
    canvas.style.opacity = '0';
    const ext = gl.getExtension('WEBGL_lose_context');
    ext?.loseContext();
  };

  const fail = () => {
    destroy();
    onFail();
  };

  setRunning();
  return destroy;
}
