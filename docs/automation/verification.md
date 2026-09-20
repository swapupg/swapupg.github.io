# Automation verification — 2026-09-20

## Active configuration

- `OPENAI_API_KEY` is installed in GitHub Secrets with the owner's confirmation. A read-only model lookup and real Responses calls succeeded. No key value was printed or committed.
- `AUTOMATION_ENABLED=true`: daily generation at 08:17 New York time; research Friday at 09:17; project candidates Saturday at 09:17. GitHub schedules are best effort. The next scheduled daily run is September 21, 2026.
- Daily briefs publish automatically only when all evidence and site checks pass. Uncertain/sensitive drafts go to review. Weekly research and projects always require review.
- **Public repository creation is not activated:** environment `project-release` requires `swapupg` review, allows only `main`, and disallows administrator bypass. Its separate `PROJECT_PUBLISH_TOKEN` is still missing. Candidate generation/testing works without that token.

## Successful live dry runs

| Workflow              | Evidence                                                                                 | Result                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Daily briefing        | [Run 35543488483](https://github.com/swapupg/swapupg.github.io/actions/runs/35543488483) | Actual source reading, two paid generation/verification calls, candidate rendering, full build and browser gates passed. Draft remained review-only; nothing published.           |
| Five-paper research   | [Run 35543149840](https://github.com/swapupg/swapupg.github.io/actions/runs/35543149840) | Five accessible full arXiv papers read; generation, independent automated checks, rendering and site gates passed. Nothing published.                                             |
| Open-source candidate | [Run 35543523423](https://github.com/swapupg/swapupg.github.io/actions/runs/35543523423) | `context-sieve` source generated and verified; four Node tests passed in the non-root, read-only, resource-limited Docker container with no network or secrets. Nothing released. |

Source/evidence, static editorial previews, candidate code and test output are in the runs' 30-day artifacts. Dry-run candidates cannot be published through the release workflow. The prototype needs human product/code review, including fixing its incomplete description and adding CLI integration coverage; passing its generated tests does not make it release-ready.

Confirmed API usage during activation was **$1.361300**. An additional **$0.227520** reservation remains unreconciled after a rejected schema request; it continues to count against the budget rather than being silently refunded. The `automation-state` branch is the authoritative ledger for subsequent spending.

## Problems found and corrected during activation

- A first-run two-day window missed weekday sources on Sunday. Startup now uses the planned seven-day catch-up window.
- Unmatched evidence stopped the run rather than producing the intended review-only candidate. It now blocks automatic publication and records the reason for review. Missing sources, stale/future dates and malformed content still fail validation.
- Quote wrappers are normalized, but ellipses/paraphrased excerpts never count as exact evidence. Prompts explicitly require contiguous copied source text.
- Ordinary discussion of a system prompt no longer trips the source-instruction alarm. Actual requests to ignore instructions or reveal secrets still require review.
- Generated titles/descriptions have compact limits and summary instructions, preventing oversized homepage cards.
- The project's `uri` JSON Schema format was rejected by the provider. Project links now use a supported GitHub URL pattern and retain independent allowlist checks.
- Conventional CLI `bin/` files are allowed; traversal, workflows and hidden paths remain forbidden. Rejected source is retained as inert JSON for inspection.
- The weekly notification job installs its dependencies before posting its operational report.

## Other verified checks

- 28 unit/contract tests pass locally, including source evidence, failed reservation persistence, uncertain billing, spending stops, source fetch boundaries, candidate mutation checks, quote formatting, and workflow credential isolation.
- Type checking and ESLint pass. Production build, internal links, social/canonical metadata, RSS, draft/future exclusion, and the JavaScript budget pass.
- 40 browser tests pass across Chromium, Firefox, WebKit and mobile, including temporary growing archives and actual generated editorial content in cloud runs.
- Production HTTPS, deployed commit, assets, feeds, old-domain redirects and Agent Explainer shared-link compatibility were checked during the website deployment. Subsequent successful Pages runs are available in Actions.
- Operational failure and review notifications were exercised. Default workflow token permissions remain read-only; write permissions are limited to the relevant jobs. Jobs do not approve or merge their own PRs.

## Still unverified

- The first scheduled run has not fired. No automatic daily article has yet been published; no real editorial PR has yet been opened by a non-dry run.
- Protected release approval, public repository creation, version tagging, project-page PR creation and partial-release recovery have not been exercised end to end. They require the separate publishing credential and approval of an exact candidate.
- Generated content/code remains fallible. The successful dry runs establish workflow operation, not factual infallibility, production-grade generated software, or guaranteed posting frequency.

Previous production commit `3c2cd012c8d22a551d43231f3a3a1c8d921fa6a1` and its verified artifact remain available for rollback. See the [operator guide](README.md) for pause, credential setup, review and recovery instructions.
