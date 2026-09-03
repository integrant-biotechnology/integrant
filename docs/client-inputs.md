# Integrant website — inputs needed from the client

Sent alongside the full-site buildout (Aug 2026). Nothing on this list blocks
the build from proceeding — every item has a designed fallback — but each one
unlocks a section that is currently held back.

## Needed to activate features

| # | Item | Unlocks | Fallback until then |
|---|------|---------|---------------------|
| 1 | **Resend account API key** (resend.com, free tier) + which inbox receives enquiries | The contact form sending directly from the site | Contact page shows a mail link to admin@integrant.com.au |
| 2 | **About questionnaire**: founding year · key milestones with dates (first implant system, bio-tech division, app) · Dr Slater short bio · ABN | The company timeline and founder biography on /about | Timeline hidden; founder plate shows name + role only |
| 3 | Is **partners@integrant.com.au** a live mailbox? (it appears on the old site) | Direct partner contact channel | All partner enquiries route to admin@ |
| 4 | **Publish a fee structure for surgeons?** (yes/no — and the structure if yes) | Pricing section on /for-surgeons | Section stays off; nothing renders |
| 5 | **ARTG inclusion numbers** per product + IFU documents | Regulatory references on product pages | "IFU — on request" |
| 6 | ~~Founder portrait~~ **RECEIVED Aug 2026** — live on /about (grayscale derivative; original archived in brand/) | — | — |
| 7 | **App Store URL** for the Integrant app | Download CTA on /innovation | "In review — App Store" plate |
| 8 | **Research activity list**: title, status, partners, DOI per item — each row needs your regulatory adviser's sign-off before it renders | Rows on /research | Page shows a designed "documented as programs are reviewed" state |
| 9 | **Patient consent documents** for the 22 archived surgical photos (incl. the Modified Broström sequence) — or a consent process for new cases | Case imagery on /clinical-images | HCP-gated page with "archive in preparation" state |
| 10 | **Credibility metrics, verified**: years of research/practice · procedure or case counts · any figures you want in the hero metrics strip. Each number needs (a) a source you can substantiate and (b) your regulatory adviser's TGA review — case counts were previously removed from legacy copy as a compliance risk, so nothing renders until both are recorded. Wire-in point: `src/data/site-metrics.ts` (flip `verified` only with sign-off noted in `source`) | Additional rows in the homepage hero metrics strip + Trust band | Strip shows the four cleared claims (12 systems · 5 regions · 2 divisions · AU·NZ) plus qualitative readouts |
| 20 | **Plausible analytics account** — create at plausible.io (recommended owner: admin@integrant.com.au so it survives handover), add the site `integrant.com.au` (timezone Australia/Sydney), then invite Sam as admin. After that: the goals listed in docs/kpi-framework.md, a shared dashboard link and weekly email reports for Adelaide and Dr Slater | Website KPIs (visitors, sources, product interest, enquiry conversions) | Tracking code is built and tested but dormant until the domain is confirmed and set on Vercel |
| 21 | **Privacy statement sign-off** — /privacy is drafted from what the site actually does (cookieless analytics, enquiries by email, no trackers); needs a read by your legal/regulatory adviser before DNS cutover | A published, accurate privacy page | Page is live in draft, marked "under review" |

## Needed before launch (DNS cutover)

| # | Item | Why |
|---|------|-----|
| 11 | Clinical/regulatory sign-off on the 12 product pages (each carries recorded review notes) | Every product is currently marked review-pending by design |
| 12 | Registrar/DNS access + an agreed cutover window | Pointing integrant.com.au at the new site |
| 13 | Current DNS record inventory — **especially MX/SPF/DKIM** | Email for admin@ must survive the cutover untouched |
| 14 | Confirmation the old WordPress site is exported/backed up | Before it is decommissioned |

## Standing items (no urgency)

| # | Item | Notes |
|---|------|-------|
| 15 | Vector logo source files | Site currently uses a high-fidelity trace of the brand PNG |
| 16 | Nexa font license decision | Brand board lists Nexa (commercial); site uses licensed Rajdhani/Titillium until confirmed |
| 17 | Product photography / CAD renders | ArchIT, FuseIT and the 2.5 mm screw have none; the site design covers this with technical line drawings |
| 18 | Commissioned site photography (optional) | The site currently uses licensed free-stock ambience (credits: src/data/photography.ts) — theatre, Sydney, materials. Any commissioned shot can replace an entry 1:1 via scripts/grade-photo.mjs |
| 19 | Sanity CMS login | Content is code-managed and import-ready whenever the CMS is provisioned |
