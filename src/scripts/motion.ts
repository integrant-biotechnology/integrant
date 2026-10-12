/**
 * Site motion system — Lenis smooth scroll + GSAP ScrollTrigger,
 * every animation behind a single reduced-motion gate.
 *
 * The hero runs a cinematic "power-on" sequence on load (synced with the
 * shader's lamp warm-up envelope), then pins and hands off to the story
 * section under scroll control (beam sweep + dim via hero-bridge).
 *
 * Opt-in attribute API (the whole surface — nothing else is wired up):
 *   [data-reveal]        fade/rise on scroll entry
 *   [data-reveal-group]  parent whose [data-reveal-item] children stagger in
 *                        as one timeline (use instead of N separate reveals)
 *   [data-sweep]         clip-reveal + light band across a .sweep headline
 *   svg[data-draw]       stroke draw-on (opt out per element: data-no-draw)
 *   [data-count]         numeral count-up
 *   [data-magnetic]      pointer-follow on CTAs (fine pointers only)
 *   [data-parallax="s"]  scrubbed vertical drift, speed s (e.g. 0.1);
 *                        transform-only, never on NeuralField (it drifts
 *                        via CSS already)
 *
 * FOUC guard: an inline head script sets html[data-motion="pending"], which
 * hides .boot-hide elements via CSS until GSAP owns their inline styles.
 * Debug: ?motion=off forces the static experience.
 */
import { heroScroll, heroMorph } from '../components/hero/hero-bridge';

export async function initMotion(): Promise<void> {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(window.location.search);
  const off = reduce.matches || params.get('motion') === 'off';

  if (off) {
    root.dataset.motion = 'off';
    return; // static page is fully readable with zero JS motion
  }

  // Never initialize against a hidden or zero-sized viewport (prerendered
  // tabs, background loads): ScrollTrigger would pin degenerate dimensions
  // and SplitText would measure collapsed lines. The power-on plays when
  // the page is actually seen — the show starts when the curtain rises.
  const forceVisible = params.has('forcevisible');
  if ((document.hidden && !forceVisible) || window.innerWidth === 0) {
    await new Promise<void>((resolve) => {
      // Poll as a backup: some embedders resize a hidden viewport without
      // dispatching resize events.
      const poll = window.setInterval(() => check(), 500);
      const check = () => {
        if ((!document.hidden || forceVisible) && window.innerWidth > 0) {
          document.removeEventListener('visibilitychange', check);
          window.removeEventListener('resize', check);
          window.clearInterval(poll);
          resolve();
        }
      };
      document.addEventListener('visibilitychange', check);
      window.addEventListener('resize', check);
      check();
    });
  }

  const [{ gsap }, { ScrollTrigger }, { SplitText }, { default: Lenis }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
    import('lenis'),
  ]);

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // --- Lenis <-> ScrollTrigger ---
  const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.95 });
  // QA hook: lets headless verification drive real scrolls (?forcevisible)
  if (forceVisible) (window as unknown as { __lenis: unknown }).__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Stable line-splitting needs final font metrics — force the display face
  // to be resolved before measuring, don't just trust fonts.ready timing.
  await Promise.race([
    Promise.all([document.fonts.load('700 4.5rem Rajdhani'), document.fonts.ready]),
    new Promise((r) => setTimeout(r, 1200)),
  ]);

  // --- Hero: power-on choreography + pinned scroll hand-off ---
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  let split: InstanceType<typeof SplitText> | null = null;

  if (hero) {
    const q = (sel: string) => hero.querySelector<HTMLElement>(sel);
    const logo = q('.hero-logo');
    const eyebrow = q('.hero-eyebrow');
    const h1 = q('.hero-h1');
    const sub = q('.hero-sub');
    const ctaWrap = q('.hero-cta-wrap');
    const metrics = q('.hero-metrics');

    if (h1) split = new SplitText(h1, { type: 'lines', mask: 'lines', linesClass: 'hero-line' });

    // Claim initial states with inline styles, then release the CSS guard —
    // no frame exists where unstyled content flashes.
    gsap.set([logo, eyebrow, sub, ctaWrap, metrics], { autoAlpha: 0 });
    gsap.set(logo, { y: 14, scale: 0.96 });
    // Compression lands exactly on the resting --tracking-eyebrow value
    gsap.set(eyebrow, { letterSpacing: '0.38em' });
    gsap.set([sub, ctaWrap], { y: 18 });
    if (split) {
      gsap.set(h1, { autoAlpha: 1 });
      gsap.set(split.lines, { yPercent: 112 });
    }
    root.dataset.motion = 'on';

    // Timed against the shader's bootEnvelope: blips ~0.4–0.75s, full ~1.6s.
    // The split is reverted on completion — masks exist only for the reveal,
    // so late resizes never fight stale line boxes.
    const boot = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });
    boot
      .to(logo, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1 }, 0.55)
      .to(eyebrow, { autoAlpha: 1, letterSpacing: '0.16em', duration: 1.0 }, 0.75)
      .to(split ? split.lines : h1, { yPercent: 0, autoAlpha: 1, duration: 1.15, stagger: 0.12, ease: 'power4.out' }, 0.9)
      .to(sub, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.35)
      .to(ctaWrap, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.5)
      .to(metrics, { autoAlpha: 1, duration: 0.9 }, 1.7);

    // QA override: inspect the lattice state without scrolling
    if (params.get('morph') === '1') heroMorph.value = 1;

    // Pin the hero for the full act: content exits (0–50%), the biological
    // field reorganizes into the ANN lattice (15–85%), then the bloom floods
    // the frame (82–100%) so the unpin lands seamlessly on the Vision
    // section. Fully reversible under scrub.
    //
    // Phones get a compressed pin: at +110% the hero cost ~2.1 screens of
    // thumb-scrolling before any content. The proportions are unchanged, so
    // the morph and bloom still read — the act is just tighter. Desktop is
    // untouched. ScrollTrigger re-evaluates this on resize via its own
    // matchMedia integration.
    const phone = window.matchMedia('(max-width: 767px)');
    const pinLength = () => (phone.matches ? '+=45%' : '+=110%');

    gsap
      .timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: pinLength,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      .to('.hero-content', { yPercent: -16, autoAlpha: 0, ease: 'none', duration: 0.5 }, 0)
      // The metrics strip exits faster than the headline so it never overlaps
      // the morph's visual peak; pin length / morph / bloom are untouched.
      .to('.hero-metrics', { autoAlpha: 0, yPercent: 30, ease: 'none', duration: 0.3 }, 0)
      .to(heroScroll, { value: 1, ease: 'none', duration: 1 }, 0)
      .to(heroMorph, { value: 1, ease: 'none', duration: 0.7 }, 0.15)
      .fromTo(
        '.hero-bloom',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 2.4, ease: 'none', duration: 0.18 },
        0.82
      );
  } else {
    root.dataset.motion = 'on';
  }

  // If reduced motion is enabled mid-session, stop smoothing + kill triggers
  reduce.addEventListener('change', (e) => {
    if (e.matches) {
      root.dataset.motion = 'off';
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.globalTimeline.clear();
      heroScroll.value = 0;
      heroMorph.value = 0;
      split?.revert();
      document
        .querySelectorAll<HTMLElement>(
          '[data-reveal], [data-reveal-item], [data-parallax], .boot-hide, .sweep, .hero-content, .hero-bloom'
        )
        .forEach((el) => gsap.set(el, { clearProps: 'all' }));
      document
        .querySelectorAll<SVGElement>('svg[data-draw] path, svg[data-draw] line, svg[data-draw] circle')
        .forEach((el) => el.removeAttribute('style'));
    }
  });

  // A width change across the phone breakpoint changes the pin length
  window.addEventListener('resize', () => ScrollTrigger.refresh(), { passive: true });

  // --- Scroll reveals ---
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      }
    );
  });

  // --- Grouped reveals: one staggered timeline per parent, not N triggers ---
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-reveal-item]');
    if (!items.length) return;
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 84%', once: true },
      }
    );
  });

  // --- Parallax drift: transform-only, scrubbed against the parent ---
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax ?? '0.1') || 0.1;
    gsap.fromTo(
      el,
      { yPercent: 8 * speed * 10 },
      {
        yPercent: -8 * speed * 10,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          scrub: true,
          start: 'top bottom',
          end: 'bottom top',
        },
      }
    );
  });

  // --- Light-sweep headlines: clip reveal + a band of light crossing the text ---
  document.querySelectorAll<HTMLElement>('[data-sweep]').forEach((el) => {
    gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
    tl.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power4.inOut' }).fromTo(
      el,
      { backgroundPosition: '115% 0' },
      { backgroundPosition: '-15% 0', duration: 1.4, ease: 'power2.inOut' },
      0.15
    );
  });

  // --- Hairline draw-on: molecule bonds, EEG pulses (svg[data-draw]) ---
  document.querySelectorAll<SVGSVGElement>('svg[data-draw]').forEach((svg) => {
    const strokes = Array.from(
      svg.querySelectorAll<SVGGeometryElement>(
        'path:not([data-no-draw]), line:not([data-no-draw]), polyline:not([data-no-draw]), circle:not([data-no-draw])'
      )
    ).filter((el) => typeof el.getTotalLength === 'function');
    strokes.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    gsap.to(strokes, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: 'power2.inOut',
      stagger: 0.12,
      scrollTrigger: { trigger: svg, start: 'top 82%', once: true },
    });
  });

  // --- Stat counters ---
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count ?? el.textContent ?? '0');
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration: 1.6,
      ease: 'power2.out',
      snap: { value: 1 },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(counter.value));
      },
    });
  });

  // --- Magnetic CTAs (fine pointers only) ---
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * 12);
        yTo(((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      el.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }
}
