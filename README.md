# Integrant — Website Rebuild

Premium rebuild of [integrant.com.au](https://integrant.com.au) on Astro.
**Current state: v0.1 hero-concept prototype** — the full-viewport
volumetric-light hero, nav, and three proof sections, per the approved
project plan ("Monolith" black-and-white design language from the brand
board in `brand/`).

## Stack

- **Astro** (static output) + **Tailwind CSS v4** — tokens in `src/styles/global.css`
- **OGL** WebGL god-rays hero shader with a formal degradation ladder
  (T3/T2 shader → T1 CSS/SVG rays → T0 static for reduced motion)
- **GSAP ScrollTrigger + Lenis** behind a single `prefers-reduced-motion` gate
- **Rajdhani** (display/readout) + **Titillium Web** (body), self-hosted
- Sanity schema stubs in `cms/schemas/` (Studio project deferred — needs client login)

## Commands

```bash
npm run dev       # dev server on :4321
npm run build     # static build to dist/
npm run preview   # serve the build
```

## QA debug parameters

- `?tier=0|1|2|3` — force a hero capability tier
- `?motion=off` — force the static (reduced-motion) experience

## Notes

- All copy is **placeholder pending content review and TGA compliance sign-off**.
- `<meta name="robots" content="noindex">` is set in `src/layouts/Base.astro` — remove at production launch.
- Brand sources live in `brand/` (not shipped); web derivatives in `public/brand/`.
- Asset requests outstanding: vector logo (SVG/AI/EPS), Nexa font license decision, product photography/CAD.
