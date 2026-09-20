# Automation verification — 2026-09-20

## Verified locally

- Node 24 type checking and ESLint: passed with zero errors/warnings.
- 23 unit/contract tests: passed. Includes reservation-before-call, failed persistence, unknown billing/no retries, category/month/run stops, pricing expiry, date boundaries, source evidence, source redirects/size limits, prompt-injection review routing, candidate mutations, path restrictions, and workflow isolation contracts.
- Production build: 14 real HTML pages; internal links, canonical/social metadata, feeds and 100 KB compressed JavaScript ceiling passed.
- Draft/future publication exclusion: passed for all three collections.
- Temporary growing-content contract: daily briefing author/JSON-LD, homepage balance, feed separation, weekly issue labeling and CLI project pages passed. Fixtures removed and real site rebuilt.
- 40 browser tests with the temporary growing archive: passed in Chromium, Firefox, WebKit and mobile. Includes keyboard/contrast checks, responsive layouts, no JavaScript, clipboard/storage failure, filters/history, and root experiment forwarding.
- Dependency audit: zero vulnerabilities.
- Live source discovery: accessed the Hugging Face feed/article and full arXiv HTML papers; unavailable OpenAI articles were recorded and skipped. No paid model request made during these checks.

## GitHub configuration verified

- `AUTOMATION_ENABLED=false`: schedules installed but paid generation/publication paused.
- `project-release` environment requires `swapupg` review, disallows administrator bypass, and allows only the `main` branch. Self-review is allowed because the sole owner must be able to dispatch and approve after inspection.
- GitHub Actions may create PRs; default token permission remains read-only and workflow write permissions are job-specific. The workflows do not approve or merge PRs.
- Previous production commit `3c2cd012c8d22a551d43231f3a3a1c8d921fa6a1` preserved in a local Git bundle. Its passing Pages run is `35530878809`, with the previous verified site artifact retained by GitHub.

## Unverified / activation gates

- Ownership/permission to upload the existing workspace OpenAI key is awaiting confirmation. No key value was printed or committed.
- No repository `OPENAI_API_KEY` or protected-environment `PROJECT_PUBLISH_TOKEN` had been installed at verification time.
- Paid end-to-end daily, research, and project dry runs have **not** run. Provider structured-output compatibility and real generation quality therefore remain unverified.
- Actual Docker execution of an AI-generated project, protected approval/release, new-repository creation, partial-release recovery, real model spend reconciliation, and first automatic daily publication remain unverified. Unit/workflow checks do not substitute for these live gates.
- Scheduled execution timing is best effort, not an SLA. The live schedule has not yet fired.
- Improving an existing project uses a manual PR; the current automated generator creates bounded dependency-free candidates and refuses name collisions. It does not automatically modify existing projects.

The website deployment's exact commit and remote test result are available in [Pages Actions](https://github.com/swapupg/swapupg.github.io/actions/workflows/pages.yml) and the live `/build-info.json`. Do not enable the schedules until the three paid dry runs succeed. No fixture article or dummy public repository is an acceptable substitute.
