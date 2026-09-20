# Model Fieldnotes

**Building with AI. Sharing what holds up.** An independent lab by Swapnil.

[Explore Model Fieldnotes →](https://modelfieldnotes.com) · [Try Agent Explainer](https://modelfieldnotes.com/agent-explainer/) · [RSS](https://modelfieldnotes.com/rss.xml)

Open-source tools, research notes, and practical experiments for people building with AI. Launch content includes four sourced essays on agents, costs, model evaluation, and governance; a five-paper foundational research collection; and the Agent Explainer project.

## Local setup

Requires **Node 24** and npm. With nvm installed:

```sh
nvm use
npm ci
npm run dev
```

Open the URL printed by Astro. To verify and preview the production build:

```sh
npm run check
npx playwright install chromium firefox webkit
npm run test:e2e
npm run preview
```

Astro can start a background server in agent environments. Use `npx astro preview stop` to stop it. Browser tests start a foreground preview automatically when one is not already running.

Agent Explainer is deployed independently and occupies `/agent-explainer/` on the public domain. This website's local server does not include that application; use its own repository to run its simulations locally. The browser suite checks the linking contract, and the release smoke checks verify the integrated public journey.

## Publish and contribute

[Publishing guide](docs/publishing.md) · [Content templates](docs/templates/) · [Editorial principles](https://modelfieldnotes.com/about/#editorial-principles)

Write Markdown/MDX in the notes, research, and projects content collections. Typed metadata generates archive pages, article URLs, RSS, and social images. Short notes and essays share the same system. Source-backed corrections, accessible explanations, and focused code improvements are welcome through issues or pull requests.

Drafts and future publications are excluded from the built website. **The repository is public, including draft files and history.** Keep private material elsewhere. Research and drafting may be AI-assisted; claims must remain traceable to original evidence. The website does not automatically research or publish on a schedule.

## Architecture and delivery

Astro static HTML, TypeScript, CSS, Markdown/MDX, self-hosted Inter and Space Grotesk, and small progressive enhancements. No reader accounts, database, email collection, analytics, or live model calls. The source screenshot is in `assets/`; build-generated optimized media and font licenses appear in `public/assets/`. Put new authored media in `public/images/`.

GitHub Actions runs checks and four-browser journeys before deploying the exact build to GitHub Pages. [Deployment and rollback](docs/deployment.md) describes domain configuration, legacy links, and recovery. The deployed `/build-info.json` identifies the source commit. [Release evidence](docs/release-evidence.md) distinguishes measured checks from outstanding manual verification.

Code and original site content are MIT licensed. Self-hosted fonts retain their included SIL Open Font License notices. Linked papers remain their authors' work and are summarized with attribution.
