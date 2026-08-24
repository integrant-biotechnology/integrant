# Integrant — Website Rebuild

Investor-grade rebuild of [integrant.com.au](https://integrant.com.au) — orthopaedic med-tech, bio-tech and AI clinical software, unified as one platform story: **“Where biology becomes intelligence.”**

**Live staging:** https://integrant.vercel.app · **Design concept (Figma):** [Neural Genesis](https://www.figma.com/design/OxDexcGVcMOJSoTtSArabs)

## The experience

- **Cinematic hero** — a WebGL theatre-lamp power-on reveals a living biological neural field (OGL, three GPU passes, fully procedural vertex animation)
- **The morph** — on scroll, biological neurons reorganize into an artificial neural-network lattice, then bloom to white as the page hands off from darkness to a bright, airy content world
- **Strict monochrome brand system** — #000/#FFF only, Rajdhani + Titillium Web, hairlines, film grain
- **Engineered to degrade** — capability tiers T0–T3 (static → CSS rays → WebGL), FPS auto-downgrade, context-loss recovery, one global reduced-motion gate; ~74KB gz total JS

## Stack

Astro 5 (static) · Tailwind CSS v4 · OGL · GSAP + ScrollTrigger + SplitText · Lenis · Vercel

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | dev server on `:4321` |
| `npm run build` | static production build to `dist/` |
| `npm run scrape` | full legacy-site capture into `content-archive/` |
| `npm run scrape:diff` | detect legacy content drift vs the archive |

QA params: `?motion=off` · `?tier=1\|2\|3` · `?morph=1` · `?forcevisible`

## Repository layout

- `src/` — the site: layouts, components (hero shader, sections, UI), motion system, data modules, styles
- `content-archive/` — complete capture of the legacy WordPress site: markdown + structured JSON (real product spec tables), full-res assets, screenshots, migration inventory. **Source material only — never imported by the site.**
- `cms/schemas/` — Sanity schema stubs for the future Studio
- `brand/` — source brand assets (brand board, logo originals)

## Conventions

Deploys promote via Git pushes once the repo is connected to the Vercel project (or `vercel deploy --prod` from local). `noindex` stays until DNS cutover. All copy passes brand-voice rewrite + TGA compliance review before publishing.
