# Publish a fieldnote

Use Node 24 (`nvm use` if you use nvm), then `npm ci`. Start with `npm run dev`. For a production preview use `npm run build` and `npm run preview`.

1. Copy the corresponding template from `docs/templates/` into `src/content/notes/`, `src/content/research/`, or `src/content/projects/`. Use a stable lowercase, hyphenated filename; it becomes the public URL.
2. Write a concise description. Cite original papers or official documents near the relevant claims. Include limitations. Record the source review date for notes. Use actual publication dates; never fabricate a publishing history.
3. For each five-paper issue, include original paper dates and source versions. Select one deeper treatment and four shorter ones. Say whether results are authors’ findings or independently reproduced. “Foundations” is different from newly published research.
4. Distinguish illustrations, simulations, recommendations, and measurements. Model evaluations need exact models, prompts, tools, dates, tasks, sample counts, cost definitions, and outcome checks. Regulatory writing needs jurisdiction and current official sources. Review any first-person claims for accuracy.
5. Preview and inspect the article, source links, mobile view, and share card. Run `npm run check
npm run test:publication` and `npm run test:e2e`.
6. Set `status: published`, use a publication date no later than the actual release, and commit to main (or merge a reviewed pull request). GitHub Actions validates and publishes the site. Confirm the live page, social preview, and RSS entry.

Dates in the future are excluded at build time. There is no scheduled build to publish them automatically. Trigger a normal reviewed release when ready. Drafts do not appear in generated pages, feeds, or search, but **all committed source files remain public**. Keep confidential drafts outside this repository.

Short daily notes use `kind: Fieldnote`; longer pieces use `kind: Essay`. Both appear in Notes. RSS readers receive a summary and permanent article link. There is a combined feed at `/rss.xml` and research-only feed at `/research/rss.xml`. New content does not require editing a page template.

## Corrections

Preserve published slugs. For substantial corrections set `updated`, refresh `reviewed` if sources were rechecked, and add a visible correction paragraph explaining the change. Keep source history. Never silently relabel a research summary as a reproduced experiment.

## Asking Codex for help

“Draft a fieldnote about [question]. Read primary sources, cite claims, explain limits, and avoid invented experience or measurements. Use our note template and leave it in draft status. Show me the preview and verification results before publication.”

The website does not schedule research, send newsletters, or publish automatically. Those would be separate authoring decisions.
