# Editorial and open-source automation

GitHub Actions runs these workflows independently of your laptop. No visitor data enters the pipeline. Source texts stay in runner memory; public artifacts contain the output, links, hashes, short evidence excerpts, and verification results.

## Schedule and publishing rules

| Work                  | America/New_York schedule                        | Result                                                                        |
| --------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Daily brief           | Every day, 08:17                                 | Automatically published only after evidence and site checks                   |
| Research digest       | Friday, 09:17                                    | Five full papers; review PR, never auto-merged                                |
| Open-source candidate | Saturday, 09:17                                  | Isolated tests, source artifact, review notification                          |
| Project release       | Manual dispatch + protected environment approval | Exact reviewed candidate becomes a public repository; website listing is a PR |

GitHub schedules are best effort and can be delayed, dropped, or disabled after 60 days of repository inactivity. They use the timezone setting to follow daylight saving time. All paid runs share a concurrency group; GitHub retains at most one pending run, so inspect missed editions and use manual dispatch for catch-up. Discovery covers at most seven days and never backfills fabricated editions.

Daily entries use `/notes/daily-YYYY-MM-DD/`, an automated organization byline, the writing RSS feed, and the Notes format filter. Quiet days can produce no post. Weekly research uses one deeper paper treatment and four shorter treatments. Fewer than five accessible full papers produces a retained selection artifact, not an invented issue.

## One-time secure activation

1. Add an **OpenAI project API key** as repository secret `OPENAI_API_KEY` in [Actions secrets](https://github.com/swapupg/swapupg.github.io/settings/secrets/actions). Use a dedicated project with the appropriate model access. Do not put keys in chat, source code, issue text, artifacts, or `.env` commits.
2. Allow GitHub Actions to create pull requests in repository Actions settings. Default workflow permission remains read-only; only the named publishing jobs request writes. Jobs never approve or merge their own PRs.
3. Create environment `project-release`, with Swapnil as a required reviewer and main-only branch policy. Add a separate, expiring user publishing credential as environment secret `PROJECT_PUBLISH_TOKEN`. It must be able to create public repositories under `swapupg` and write source/releases. GitHub App **installation** tokens cannot create repositories in a personal account; a user-authorized token is needed. A fine-grained token must have the appropriate Administration and Contents write permissions and coverage for the newly created repo. If using a classic PAT, use `public_repo` rather than `repo`; candidates contain no workflows, so `workflow` scope is unnecessary. Never reuse/upload the local CLI's broad account token.
4. Leave repository variable `AUTOMATION_ENABLED=false`. Manually dispatch daily, research, and build with `dry_run=true`. These are **paid**, budgeted runs; they write no public content or new repositories. Inspect source evidence, checks, full candidate code and meaningful test assertions. A skipped run is not a successful live generation test.
5. Only after all three live dry runs succeed and the website gates pass, set `AUTOMATION_ENABLED=true`. Weekly research and project releases still need review.

The release environment approval must be required, not merely an environment with a name. The same owner may dispatch and approve after reviewing; disable administrator bypass. Review all generated source before approval. A test suite generated with a program can share its blind spots.

## Spend policy

The standard Responses API model is `gpt-5.6-terra`, medium reasoning, no automatic model fallback. Standard prices recorded on 2026-09-20 are $2/M input and $12/M output, conservatively charging cached input at the full rate. Pricing expires on 2026-10-20; verify the official pricing and model documentation and update `automation/policy.ts` in a reviewed commit before renewing it.

| Category | Per run | Per calendar month |
| -------- | ------: | -----------------: |
| Daily    |   $0.75 |                $25 |
| Research |      $2 |                $10 |
| Build    |      $3 |                $15 |
| Combined |       — |            **$50** |

The calendar is New York local time. Crossing a date boundary stops a run before another paid call. Each request reserves a conservative input-byte bound, schema/framing allowance, and maximum output tokens (including reasoning), **durably before** the request. Known usage reconciles downward. Timeouts, unknown usage, or crashes leave the reservation charged until manually reconciled. Provider retries are off. Retries within the same GitHub run share its cap; new runs still share monthly/category limits.

To keep the cap enforceable, discovery uses bounded public RSS/Atom fetches and GitHub repository search, **not OpenAI's paid web-search tool**. Full sources are downloaded with allowlisted HTTPS redirects, byte limits and timeouts. This is a deliberate implementation adjustment: hosted search can introduce additional input/tool charges that lack a dependable small per-call bound. The initial catalog covers OpenAI, Hugging Face, Google DeepMind, Microsoft Research and arXiv; this is a source selection, not comprehensive news coverage. Unreadable or oversized sources are omitted, never summarized from snippets as if fully read.

The cap covers calls made through this pipeline, not other API clients, taxes, or GitHub charges. Set an account/project budget alert as a second layer. Do not edit/delete outstanding ledger reservations to force more spending.

## State, idempotency, and recovery

The `automation-state` branch stores `.automation/state.json`. Never merge it into main. It contains edition status and spend reservations, not keys or full source text. Updates use GitHub's file SHA as an optimistic lock; conflicts stop before the paid call. All paid workflows share one concurrency group. The branch starts from main only to bootstrap a valid ref.

An edition has a stable kind/date ID. Paid dry runs have separate `dry-` state records. Source URLs already published or sent for review are excluded. Existing article bytes must match exactly before a retry can reuse them; changed editions require manual review. A daily entry is recorded as published only after the exact deployed commit, page, and RSS are observed. A bot push explicitly dispatches the normal Pages workflow because it does not trigger push workflows automatically.

If a deployment fails after its content commit, fix the failing checks and dispatch **Verify and deploy Model Fieldnotes** with the exact content SHA. Do not regenerate the article. After checking the live page/feed, reconcile the pending record to published with a documented state-branch commit. This deliberately favors duplicate prevention over blind retries. Review PRs have independent exact-SHA validation with `verify_only=true`.

If a run stops before publication, the 30-day artifact keeps evidence and, when available, a static HTML preview. Inspect the Actions log and the deduplicated operational issue. Full paper texts are not archived. Missing sources are recorded; source warnings are not falsely presented as successful coverage.

## Project candidates and approval

Initial prototypes are dependency-free Node 24 browser apps, CLIs, or libraries; this keeps installs and isolated execution auditable within the budget. The generator compares live public repositories and cannot write workflow files, hidden files, traversal paths, or package lifecycle hooks. It does not execute generated code. A separate job runs tests in a non-root, read-only, resource-limited Docker container with no network or secrets. There is one generation/test attempt per candidate; failed work remains an honest artifact. No automatic repair loop consumes the rest of the budget.

Download `candidate-RUN_ID`. Inspect all source, README examples, MIT license, dependency notices, limitations, alternatives and `test-results.txt`. Preview browser apps locally without credentials, or run CLI/library examples in a disposable environment. The `release.json` digest covers all source paths and bytes; publishing rechecks disk contents and rejects added/mutated files.

To approve, dispatch **Approved project release** with the successful candidate run ID and exact digest, then approve the protected `project-release` environment. The job verifies workflow provenance, refuses dry-run candidates, and cannot execute candidate code. A different digest needs a new dispatch and approval. Repository-name collisions stop publication. Partial creation resumes only for a repo marked with the same digest and unchanged initial/candidate commit. The source is tagged `v0.1.0`; a project-page PR follows. Existing repositories are never overwritten or auto-merged. Improving an existing tool currently requires a manually authored PR; the automated builder stops on a collision.

## Pause and rollback

- Set `AUTOMATION_ENABLED=false` to stop scheduled paid generation and automatic publication. Also cancel any running paid workflow; changing the variable does not revoke a job's already-captured environment. Disable the workflows in Actions for an immediate scheduling stop. Manual project-release remains explicit and protected; cancel pending approvals too.
- Revoke/rotate a compromised key in the provider and replace its GitHub secret. Never print the old value.
- Revert an unwanted article commit normally; Pages rebuilds from main. Correct substantive errors visibly rather than silently erasing the history.
- Restore an earlier verified website with the Pages workflow's `deploy_ref`. This changes the deployed version, not DNS, repository source, or the ledger. Deployment artifacts are retained 90 days; automation diagnostics 30 days.
- For a accidentally released project, stop before any destructive deletion and decide whether to archive, correct, or remove it explicitly.

## Verification commands

```sh
npm ci
npm run check
npm run test:publication
npm run test:automation-content
npm run test:e2e
```

`node scripts/check-automation-content.mjs --browser` temporarily builds a growing daily archive, weekly issue and CLI project, runs all browser tests, then removes every fixture and rebuilds the real site. Fixtures never belong in a deployment. Live dry runs require credentials and spend reservations; unit fixtures never call the paid API.

See [release evidence](./verification.md) for what was actually tested and outstanding activation steps. Sources: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-terra), [GitHub schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [workflow triggering](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow), and [personal repository creation](https://docs.github.com/en/rest/repos/repos#create-a-repository-for-the-authenticated-user).
