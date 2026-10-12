# Integrant

Website for Integrant Biotechnology — orthopaedic med-tech, bio-tech and AI clinical software, presented as one platform.

**Live site:** [integrant.com.au](https://integrant.com.au)

## Overview

- **Cinematic hero** — a WebGL scene in which a biological neural field reorganises into an artificial neural-network lattice as the visitor scrolls. It is fully procedural: three GPU passes with all animation computed in vertex shaders.
- **Strict monochrome brand system** — black, white and a grayscale ramp only, set in Rajdhani and Titillium Web, with dark and light themes.
- **Product catalogue** — twelve product detail pages generated from typed data modules, alongside pages for surgeons, partners, research and innovation.
- **Engineered to degrade** — capability tiers from a static image through CSS to full WebGL, automatic frame-rate downgrade, context-loss recovery and a single reduced-motion gate.

## Stack

| | |
|---|---|
| Framework | [Astro 7](https://astro.build) — static output |
| Styling | Tailwind CSS 4 — semantic tokens in `src/styles/global.css` |
| Graphics and motion | OGL, GSAP (ScrollTrigger, SplitText), Lenis |
| Analytics | Plausible, proxied first-party |
| Hosting | Vercel |

## Getting started

Use the Node.js version pinned in `.nvmrc`.

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321`.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Static production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run qa` | Build, then run the contrast, redirect and type-scale audits |
| `npm run qa:sweep` | Layout, touch-target and theme checks across routes and viewport widths |
| `npm run qa:analytics` | Verify that each analytics event fires once with the expected properties |
| `npm run validate:redirects` | Check every redirect destination against the build output |

Debug parameters for local QA: `?motion=off` forces the reduced-motion experience, `?tier=1|2|3` forces a graphics capability tier, `?morph=1` starts the hero in its final state.

## Project structure

```text
src/
  layouts/      Base layout: metadata, fonts, theme resolution
  components/   Navigation, hero (shader and bridge), page sections, UI primitives
  pages/        Routes, including the product catalogue and detail pages
  data/         Typed content modules that drive the pages
  scripts/      Motion system and analytics
  styles/       Design tokens for both themes
api/            Serverless function behind the contact form
cms/schemas/    Content schemas for a future CMS
scripts/        Build, audit and QA tooling
public/         Static assets: brand marks, share images, product photography
brand/          Source brand assets
content-archive/ Capture of the previous site, kept as reference; never imported by the site
```

## Conventions

- **Theming** — components use semantic colour tokens only; raw colour utilities are not used, so every surface responds to both themes.
- **Accessibility** — every ink and surface pairing is audited to WCAG AA, interactive elements have a 44px minimum hit area, and all motion sits behind a reduced-motion gate.
- **Type scale** — no visible text is set below 16px on desktop or 15px on phones; the audit in `npm run qa` enforces this.
- **Deployment** — pushes to `main` deploy to production.

## Compliance

Integrant's products are medical devices, so all published copy is written to the TGA Therapeutic Goods Advertising Code: no therapeutic claims, no outcome promises and no comparative language. Research and clinical-image sections render only entries that have been marked as compliance-reviewed and consent-confirmed.

## Licence

No open-source licence is granted. All rights are reserved by the respective owners.
