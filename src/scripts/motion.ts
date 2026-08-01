/**
 * Site motion system — Lenis smooth scroll + GSAP ScrollTrigger,
 * every animation behind a single reduced-motion gate.
 * Debug: ?motion=off forces the static experience.
 */

export async function initMotion(): Promise<void> {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(window.location.search);
  const off = reduce.matches || params.get('motion') === 'off';

  document.documentElement.dataset.motion = off ? 'off' : 'on';
  if (off) return; // static page is fully readable with zero JS motion

  const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('lenis'),
  ]);

  gsap.registerPlugin(ScrollTrigger);

  // --- Lenis <-> ScrollTrigger ---
  const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // If reduced motion is enabled mid-session, stop smoothing + kill triggers
  reduce.addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.dataset.motion = 'off';
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.globalTimeline.clear();
      document
        .querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-hero], .sweep')
        .forEach((el) => gsap.set(el, { clearProps: 'all' }));
    }
  });

  // --- Hero content entrance (staggered, once) ---
  gsap.fromTo(
    '[data-reveal-hero]',
    { autoAlpha: 0, y: 26 },
    { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.15 }
  );

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
