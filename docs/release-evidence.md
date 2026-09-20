# Release evidence

Candidate review: 20 September 2026. Production verification is pending deployment.

## Verified locally

- Node 24.21.0, locked npm install, TypeScript, ESLint, three publication-policy unit tests, Astro build and HTML/link/feed/budget validation pass.
- 36 Playwright journeys pass across Chromium, Firefox, WebKit and mobile emulation. Includes JavaScript-disabled reading, denied storage, clipboard fallback, history, fragment refresh, root experiment forwarding, and axe accessibility checks.
- Responsive layouts checked at 320, 390, 768 and 1440 pixels; keyboard focus, both themes and reduced motion checked.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100. FCP 1.4 s, LCP 1.5 s, CLS 0. Local preview measurements are not a guarantee of field performance.
- Real-build draft/future fixtures excluded from pages, archives, search, feeds, sitemap and social images across all three content collections.
- npm audit: no vulnerabilities reported.
- GitHub domain ownership verified using its DNS TXT challenge. Existing DNS and production commit backed up; see deployment.md.

## Unverified / human follow-up

- Human comprehension pilot, screen-reader usability, physical iOS/Android devices and long-term field performance. Automated checks do not establish these outcomes.
- Research findings are author-reported and have not been independently reproduced.
- Recurring writing and automatic publication are intentionally outside this release.
