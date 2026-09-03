# Website KPI framework

Analytics for integrant.com.au run on **Plausible** — a cookieless, privacy-first
service (EU-hosted). No consent banner is required, nothing personal is
collected, and the dashboard reads at a glance. One Plausible account can hold
every site the team wants to watch.

## Where the numbers live

- **Dashboard:** plausible.io → site `integrant.com.au`. A password-protected
  shared link can be issued to anyone who needs read access without a login.
- **Email reports:** weekly and monthly summaries can be sent to any address
  from Site settings → Email reports.
- **Realtime:** the same dashboard, "Realtime" range, for checking a campaign
  the moment it goes out.

## The KPI set

| Area | KPI | Read it as | Plausible view |
|---|---|---|---|
| Reach | Unique visitors | How many people, not hits | Top bar · Unique visitors |
| Reach | Visits / pageviews | Depth of traffic | Top bar |
| Reach | Country split | Australia vs US / EU investor interest | Locations → Countries |
| Reach | Device split | Phone vs desktop audience | Devices |
| Engagement | Visit duration | Are people reading | Top bar · Visit duration |
| Engagement | Bounce rate | Landing-page fit | Top bar · Bounce rate |
| Engagement | Top pages | What people came for | Pages → Top pages |
| Engagement | Product interest | Which systems draw attention | Pages, filter `page = /products/*` |
| Acquisition | Referrers | Who sends traffic | Sources → Top sources |
| Acquisition | Campaigns | Which outreach worked | Sources → UTM campaign (see convention below) |
| Acquisition | Search terms | What people searched to find us | Sources → Google (after Search Console is linked, post-launch) |
| Conversion | Request Meeting rate | Intent to talk | Goals → `Request Meeting` (conversion rate = per unique visitor) |
| Conversion | Email Click rate | Direct enquiry intent | Goals → `Email Click` |
| Conversion | Contact Submit rate | Completed enquiries | Goals → `Contact Submit` |
| Conversion | View System | Catalogue engagement | Goals → `View System`, property `product` |
| Clinical | HCP gate accepts | Professional audience on clinical pages | Goals → `HCP Gate Accept` |
| Hygiene | 404s | Broken inbound links | Goals → `404`, property `path` |
| Hygiene | Hostname split | Staging vs live traffic | Filter → Hostname |

Every goal carries a `location` property (nav, hero, footer, partners,
for-surgeons, research, clinical-images, product, careers, catalogue …) so a
conversion can always be traced to the element that produced it.

## Goals to create in Plausible (Site settings → Goals → Custom event)

`Request Meeting` · `Email Click` · `Contact Submit` · `View System` ·
`HCP Gate Accept` · `404` — plus the two built-ins `Outbound Link: Click` and
`File Download` (App Store link and IFU documents, once live).

## Campaign link convention

Every link shared outside the site (LinkedIn, email, conference slides,
investor packs) carries UTM tags so the source is attributed:

```
https://integrant.com.au/?utm_source=linkedin&utm_medium=social&utm_campaign=frameit-launch
https://integrant.com.au/products?utm_source=newsletter&utm_medium=email&utm_campaign=sept-update
https://integrant.com.au/?utm_source=investor-deck&utm_medium=pdf&utm_campaign=seed-round
```

- `utm_source` — where the link is placed (linkedin, newsletter, investor-deck, conference)
- `utm_medium` — the channel type (social, email, pdf, print)
- `utm_campaign` — the specific push, lower-case, hyphenated

## Reporting cadence

- **Weekly (email report):** visitors, top pages, sources, goal conversions.
- **Monthly (short note):** trend vs previous month, campaign results, product
  interest ranking, conversion rate, any 404s to fix.
- **Post-launch:** link Google Search Console for search keywords; add the
  cutover date as an annotation so before/after is obvious.

## Notes

- Analytics record the domain `integrant.com.au` from day one, even while the
  site is served from integrant.vercel.app, so the history is continuous
  across the DNS cutover. Use the Hostname filter to separate the two.
- Team browsers can be excluded from the numbers by opening any page and
  running `localStorage.plausible_ignore = "true"` once in the browser console.
- The Privacy page (/privacy) describes this setup to visitors.
