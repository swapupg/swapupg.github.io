# swapupg.github.io

The public entry point at [swapupg.github.io](https://swapupg.github.io/) opens [Agent Explainer](https://swapupg.github.io/agent-explainer/).

This small static site supplies the account-level GitHub Pages address. The application remains in [swapupg/agent-explainer](https://github.com/swapupg/agent-explainer), with its existing deployment and shared links.

## Behavior

- The root page returns HTTP 200 and redirects to `/agent-explainer/` using `location.replace`, avoiding an extra back-button entry.
- An experiment hash such as `#/experiment/duplicate-action/1/repaired/7` is preserved.
- Query parameters are discarded. The destination is fixed on the same origin.
- A visible link remains available if JavaScript is disabled or the redirect does not run.
- No dependencies, accounts, API keys, or telemetry.

## Publishing

GitHub Pages publishes the root of `main`. `.nojekyll` keeps the files unchanged. Push a commit to `main` to deploy; inspect the GitHub Pages workflow and verify the root address after deployment.

To restore an earlier version, revert the relevant change and push to `main`. Restoring this entry page does not change the Agent Explainer application.

## Smoke checks

Open the root address and confirm the lab loads. Open a root URL with a shared experiment hash and confirm it reaches the same paused step. Confirm the existing `/agent-explainer/` URL still works. With JavaScript disabled, confirm the root page shows its accessible fallback link.

MIT licensed; see [LICENSE](LICENSE).
