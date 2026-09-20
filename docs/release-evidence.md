# Release evidence

Verified 20 September 2026 against **https://modelfieldnotes.com**.

## Production

- First passing website deployment: `a88cadb474cb784b61deebbd305f0b9db363351b`, [Actions run 35530431179](https://github.com/swapupg/swapupg.github.io/actions/runs/35530431179). The deployed `/build-info.json` identifies the exact source commit for subsequent releases.
- Agent Explainer domain migration: `3bc37caab23a4b1b147db24269b406b561cd117f`, [Actions run 35530430410](https://github.com/swapupg/agent-explainer/actions/runs/35530430410). Its deployed JavaScript asset matches the local verified build. Simulation behavior is unchanged.
- **36 website browser journeys and 72 Agent Explainer journeys passed against live HTTPS**, across Chromium, Firefox, WebKit and a narrow mobile emulation.
- Production smoke checks passed in Chromium, Firefox and WebKit: old GitHub Pages root and project experiment links, all three scenario hashes at a selected repaired step, www redirection, and a nested article redirect. Runs open paused.
- All 12 sitemap pages, their referenced stylesheet/scripts/images, self-hosted fonts and both RSS feeds return successfully over HTTPS. Unknown paths return HTTP 404 and the recovery page.
- GitHub approved a certificate for apex and www. HTTPS enforcement is enabled; HTTP and www redirect to the canonical HTTPS origin.
- Public DNS verified through Cloudflare and Google resolvers. Four apex A records and www CNAME are correct. The five original email-forwarding MX records, SPF and GitHub ownership TXT remain present.
- All 16 distinct launch-content source references returned HTTP 200 (including legitimate redirects).

## Build, accessibility and performance

- Node 24.21.0 locally, Node 24 in CI; clean locked npm install, TypeScript, ESLint, three publication-policy unit tests, Astro build and HTML/link/feed/budget validation pass. CI builds from a clean checkout.
- Real-build draft and future fixtures are excluded from pages, archives, search, feeds, sitemap and social images across all three content collections. This contract check runs in CI.
- Tests include JavaScript-disabled reading, denied storage, clipboard fallback, history, section-fragment refresh, root experiment forwarding and axe accessibility checks. No violations were reported on the tested pages and themes.
- Responsive reflow checked at 320, 390, 768 and 1440 pixels; keyboard focus and reduced motion checked. Desktop and mobile compositions inspected visually.
- **Live mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100.** FCP 0.9 s, LCP 0.9 s, CLS 0.048. One laboratory run; field performance can vary.
- First-party JavaScript: ordinary articles **1,033 bytes gzip**, archive **1,331 bytes gzip**, below the 100 KB budget (inline and external scripts included, metadata excluded).
- npm audit: no vulnerabilities reported at verification time.

## Reproduce

```sh
npm ci
npm run check
npm run test:publication
npx playwright install chromium firefox webkit
npm run test:e2e
SITE_URL=https://modelfieldnotes.com npm run test:e2e
npm run smoke:production
```

`smoke:production` requires the live commit to equal local HEAD. Set `EXPECTED_COMMIT` explicitly when verifying a prior deployment. Agent Explainer maintains its own independent browser suite; use `PLAYWRIGHT_BASE_URL=https://modelfieldnotes.com/agent-explainer/ npm run test:e2e` in that repository.

A preliminary HTTP-based Agent Explainer check correctly encountered the HTTPS redirect and failed four strict same-origin assertions. All 72 passed when run against the canonical HTTPS origin. No certificate validation was bypassed.

## Unverified / human follow-up

- Human comprehension pilot, manual screen-reader usability, native browser zoom, physical iOS/Android devices, and long-term field performance. Automated reflow checks do not establish these outcomes.
- A production rollback drill has not been performed. Previous source/build artifacts and deployment/domain rollback instructions are preserved.
- Research findings are author-reported and have not been independently reproduced.
- Recurring writing and automatic publication are intentionally outside this release.
