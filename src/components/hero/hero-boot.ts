/**
 * Hero capability ladder.
 *  T3 — WebGL2 + dpr ≥ 2 desktop: full-quality shader, DPR capped at 2
 *  T2 — WebGL available: shader, DPR capped at 1.5
 *  T1 — no WebGL / saveData / very low memory: CSS+SVG ray drift
 *  T0 — prefers-reduced-motion: static composition
 * Debug: append ?tier=0|1|2|3 to force a tier.
 */

type Tier = 0 | 1 | 2 | 3;

let destroyShader: (() => void) | null = null;

export function detectTier(): Tier {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return 1;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return 1;

  // True phones ride T1: the shader's synchronous GLSL compile is a ~1s
  // main-thread stall on mid-range handsets, and the compressed mobile pin
  // (+45%) gives the morph little room to read anyway. The CSS/SVG ray
  // drift is compositor-only and battery-friendly. Tablets (≥768 shortest
  // side) and desktops keep the full WebGL experience.
  if (window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 768) {
    return 1;
  }

  const probe = document.createElement('canvas');
  const gl2 = probe.getContext('webgl2');
  const gl = gl2 ?? probe.getContext('webgl');
  if (!gl) return 1;

  const fine = window.matchMedia('(pointer: fine)').matches;
  return gl2 && fine && window.devicePixelRatio >= 2 ? 3 : 2;
}

export function applyTier(hero: HTMLElement, canvas: HTMLCanvasElement, tier: Tier): void {
  if (destroyShader) {
    destroyShader();
    destroyShader = null;
  }
  hero.dataset.tier = String(tier);

  if (tier < 2) return;

  const start = () => {
    import('./hero-shader')
      .then((m) => {
        destroyShader = m.mountHeroShader(canvas, hero, tier, () => {
          // Shader self-reported failure (context loss, sustained low FPS at min quality)
          destroyShader = null;
          hero.dataset.tier = '1';
        });
      })
      .catch(() => {
        hero.dataset.tier = '1';
      });
  };

  // Defer off the critical path — the static gradient owns first paint
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 1500 });
  } else {
    window.setTimeout(start, 300);
  }
}
