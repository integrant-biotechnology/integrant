/**
 * Monochrome volumetric light — OGL fullscreen fragment shader.
 * White god-rays from the top-left corner through drifting particulate,
 * straight off the brand board's theatre-lamp imagery.
 *
 * Robustness: FPS auto-degrade (drop DPR, then bail to T1), WebGL context-loss
 * bail-out, pause when off-screen or tab hidden, damped pointer drift on
 * fine-pointer devices only.
 */
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { heroScroll } from './hero-bridge';

const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uAim;       // damped pointer offset, ±0.035
  uniform float uIntensity;
  varying vec2 vUv;

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

  uniform float uScroll; // 0 at page top → 1 when the hero has handed over

  // Theatre-lamp power-on: dark → two warm-up blips → bloom to full
  float bootEnvelope(float t) {
    float ramp = smoothstep(0.35, 1.6, t);
    ramp *= 0.7 + 0.3 * smoothstep(1.6, 2.3, t);
    float blip1 = step(0.42, t) * step(t, 0.50) * 0.45;
    float blip2 = step(0.68, t) * step(t, 0.74) * 0.7;
    return max(ramp, max(blip1, blip2));
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

    // Distance attenuation + drifting particulate
    float atten = exp(-dist * 1.55);
    float dust = fbm(vUv * vec2(3.0 * uAspect, 3.0) + vec2(uTime * 0.016, -uTime * 0.011));
    float vol = cone * rays * atten * (0.55 + 0.65 * dust);

    // Bright dust motes twinkling inside the beam
    vec2 mp = vUv * vec2(9.0 * uAspect, 9.0) + vec2(uTime * 0.035, uTime * 0.05);
    float mn = noise(mp);
    float motes = smoothstep(0.80, 0.96, mn) * (0.45 + 0.55 * sin(uTime * 1.7 + mn * 21.0));
    vol += motes * cone * atten * 0.4;

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

  const program = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uAim: { value: [0, 0] },
      uIntensity: { value: 1 },
      uScroll: { value: 0 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

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
    program.uniforms.uAspect.value = hero.clientWidth / Math.max(hero.clientHeight, 1);
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
    program.uniforms.uAim.value = [aim.x, aim.y];
    program.uniforms.uTime.value = (now - t0) / 1000;
    program.uniforms.uScroll.value = heroScroll.value;
    renderer.render({ scene: mesh });
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
