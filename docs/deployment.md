# Deployment and rollback

## Hosting

The repository is `swapupg/swapupg.github.io`. GitHub Pages uses GitHub Actions, with `modelfieldnotes.com` configured in repository Pages settings. Astro generates static pages with this canonical origin. With Actions, the repository Pages setting is authoritative; a CNAME file is not required.

The domain has been verified in the GitHub account's Pages settings using `_github-pages-challenge-swapupg`. Keep its TXT record. Namecheap remains the DNS provider; do not change nameservers, domain ownership, DNSSEC, or mail settings during a website release.

Target web records:

| Type  | Host | Value              |
| ----- | ---- | ------------------ |
| A     | @    | 185.199.108.153    |
| A     | @    | 185.199.109.153    |
| A     | @    | 185.199.110.153    |
| A     | @    | 185.199.111.153    |
| CNAME | www  | swapupg.github.io. |

Configure the GitHub Pages domain before pointing web DNS at it. Preserve the verification TXT, existing SPF, and Namecheap email-forwarding MX records. There is no wildcard record and no IPv6 record in this launch configuration. GitHub handles the www-to-apex redirect and HTTPS after certificate provisioning.

## Release

Run the full check and browser suite, then publish a passing commit. The workflow retains the compiled archive and its checksum for 90 days. Deployments use that same artifact. After a deployment, run `npm run smoke:production` (or set `EXPECTED_COMMIT` for a rollback), then verify:

- The deployed `build-info.json` commit matches the workflow checkout.
- Apex and www HTTPS, nested articles, 404 recovery, RSS, sitemap, social images, and fonts work.
- Legacy GitHub Pages links retain their paths and experiment hashes.
- Agent Explainer at `/agent-explainer/` still completes baseline, repair, replay, and share journeys.
- Mail DNS and domain-verification records remain unchanged.

Agent Explainer is a separate repository and workflow. Its application is inherited under the account site's custom domain. Do not copy its build into this website or replace its paths with article routes.

## Roll back

For subsequent Model Fieldnotes releases, dispatch the website workflow with `deploy_ref` set to a previously verified Model Fieldnotes commit. It revalidates and deploys that version. Preserve content and working changes on a branch before any local reversal. Check the public endpoint after rollback.

The pre-migration homepage is commit `561bedd32f78a8f6d02f6220eb02e6565524b616`, with archive SHA-256 `7905ec15943fdaa03e663bf0769b5b870b5c6279df63b5aff0405c3a2bb0cb1f`. It predates the Astro workflow: restore its static files and explicitly return Pages to publishing `main` at `/`, or deploy its unpacked archive through a dedicated Pages artifact workflow. Do not dispatch the Astro verification workflow against that old commit.

To reverse the domain migration, first restore/remove web DNS pointing to GitHub, then remove the repository custom domain. Keep the verification TXT unless ownership is intentionally being relinquished. Original Namecheap web configuration was `www CNAME parkingpage.namecheap.com.` (30-minute TTL) and an unmasked apex URL redirect to `http://www.modelfieldnotes.com/`. That configuration returns the purchased domain to parking; the original GitHub URL can serve the restored homepage. Email Forwarding and SPF were already present and must stay intact.

A public rollback drill and physical-device/manual screen-reader checks are separate from automated browser verification.
