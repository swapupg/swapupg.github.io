# Release evidence

## Task cost calculator — September 21, 2026

- Type checking (68 files), lint, 51 unit tests, production build, link/metadata/feed validation, and the 100 KB compressed JavaScript budget pass. Dependency audit reports zero vulnerabilities.
- All 80 browser tests pass across Chromium, Firefox, WebKit, and mobile emulation. New coverage includes illustrative calculations, comparison, zero completions, invalid/blank inputs, human review, stale-result removal, reset/refresh, clipboard fallback, no-JavaScript explanation, 320–1440 pixel reflow, and light/dark axe checks.
- Tests caught a native-reset timing issue before release; reset now synchronously restores defaults and hides comparison/results. An additional refresh check caught Firefox restoring edited values, so page-show explicitly restores the example and form autocomplete is disabled. The no-script explanation was directly inspected and checked through its rendered paragraph.
- Linux Chrome CI caught overlapping smooth fragment scrolls during successive article-section navigation; a mobile reload check also exposed competing saved-scroll restoration. Section links now use immediate scrolling, and fragment reloads suspend saved-scroll restoration until the target is aligned. The original viewport assertions remain; all 40 repeated section-navigation journeys passed after the fix. The failed candidate was not deployed.
- Desktop comparison results and mobile dark-theme introduction were visually inspected. A captioned 30-second clip uses the existing actual Agent Explainer recording; the simulation and original-source labels are retained. Captions and a plain-text description accompany it.
- Draft/future exclusion and automated-authorship build fixtures passed, including a repeat after the reset fix. The Pages workflow repeats these checks on the exact release commit. Live smoke checks include the calculator, demonstration assets, all sitemap pages, feeds, exact deployed commit, prior Fieldbook/lab journeys, and legacy redirects.

Rollback baseline: `edc6f857718c434ddae458883b94265946d2a76a`, successful Pages run `35675990672`; both retained build artifacts were confirmed available. Search Console ownership, sitemap submission, indexing, search traffic, physical devices, manual screen-reader usability, and a new Lighthouse measurement remain unverified. Search setup needs the owner's Namecheap session and Google-account confirmation.

## Leadership & Organizations — September 21, 2026

Local evidence for `/leadership/`, two new essays, the curated reading list, and homepage/archive/article pathways:

- Type checking (63 files), lint, 37 unit tests, production build, internal page/section links, metadata, feeds, and the 100 KB compressed JavaScript budget pass. No additional client-side JavaScript was introduced.
- All 68 browser journeys pass across Chromium, Firefox, WebKit, and mobile emulation. New coverage checks leadership discovery, both essays, personal attribution, social-image paths, feeds, topic filtering, source-access labels, no-JavaScript reading, 320–1440 pixel reflow, and axe accessibility checks in light and dark themes.
- A topic-label wrapping regression on the existing perspective essay was caught by the narrow-screen tests and fixed before release. All browser tests then passed.
- Real-build draft/future exclusion and automated-authorship fixtures verify that ineligible entries do not appear in the leadership section. The dependency audit reports zero vulnerabilities.
- Desktop hub and reading list in light/dark themes, and the mobile manager essay, were visually inspected. Source methods, versions, and access limitations are recorded in `docs/product/leadership-organizations.md`.
- Production verification runs after passing GitHub Actions with `npm run smoke:production`: exact deployed commit, the new hub and both essay journeys, existing Fieldbook/lab journeys, HTTPS pages, assets, feeds, and legacy redirects.

Rollback baseline: `24d077b105243c2f23fcb2ec17fc14aa683a6c68`, successful Pages run `35644774996`; both its Pages and verified-site artifacts were confirmed available before release. Physical devices, manual screen-reader usability, and a production rollback drill remain unverified. No new Lighthouse or reader-comprehension result is claimed.

## Perspective release — September 21, 2026

Local evidence for the homepage thesis, three perspective pathways, and “What changes when AI can do the work?”:

- Type checking (59 files), lint, 36 unit tests, production build, internal pages/section links, feeds, and the 100 KB compressed JavaScript budget pass.
- All 60 browser journeys pass across Chromium, Firefox, WebKit, and mobile emulation. Coverage includes the new essay, section fragments, history, canonical sharing fallback, signed feeds, no-JavaScript reading, and accessibility/reflow checks.
- Draft/future exclusion and automation-content attribution checks pass. npm audit reports zero vulnerabilities.
- Desktop homepage and perspective cards, mobile essay, mobile dark-theme homepage, and the essay social image were visually inspected. The existing portrait and diagram are preserved.
- The new source claims were checked against the primary materials recorded in `docs/product/brand-fieldbook.md`. Predictions and illustrations are labeled; no new measured model results are claimed.
- Production verification is performed after the passing Pages workflow using `npm run smoke:production`, which checks the exact live commit, homepage → essay → guide, all three lab failure/repair/share journeys, redirects, sitemap pages, assets, and feeds. The workflow retains the verified artifact and checksum for 90 days.

Rollback baseline: `4fe6a08f939859f9df53360413af92553c01888d` (previous successful Pages run `35634226622`). Dispatch that exact `deploy_ref` and revert the release if needed. Physical-device testing, manual screen-reader usability, and a production rollback drill remain unverified. The performance figures below belong to the earlier release; no new Lighthouse score is claimed here.

## Initial site release

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
- Recurring writing and automatic publication were outside the initial September 20 release. Later releases added the behavior documented in the current publishing and automation guides.
