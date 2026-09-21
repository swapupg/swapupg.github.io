# Publish a fieldnote

Use Node 24 (`nvm use` if you use nvm), then `npm ci`. Start with `npm run dev`. For a production preview use `npm run build` and `npm run preview`.

1. Copy the corresponding template from `docs/templates/` into `src/content/notes/`, `src/content/research/`, `src/content/projects/`, or `src/content/fieldbook/`. Use a stable lowercase, hyphenated filename; it becomes the public URL.
2. Write a concise description. Cite original papers or official documents near the relevant claims. Include limitations. Record the source review date for notes. Use actual publication dates; never fabricate a publishing history.
3. For each five-paper issue, include original paper dates and source versions. Select one deeper treatment and four shorter ones. Say whether results are authors’ findings or independently reproduced. “Foundations” is different from newly published research.
4. Distinguish illustrations, simulations, recommendations, and measurements. Model evaluations need exact models, prompts, tools, dates, tasks, sample counts, cost definitions, and outcome checks. Regulatory writing needs jurisdiction and current official sources. Review any first-person claims for accuracy.
5. Preview and inspect the article, source links, mobile view, and share card. Run `npm run check
npm run test:publication` and `npm run test:e2e`.
6. Set `status: published`, use a publication date no later than the actual release, and commit to main (or merge a reviewed pull request). GitHub Actions validates and publishes the site. Confirm the live page, social preview, and RSS entry.

Dates in the future are excluded at build time. They become eligible on their publication date during the next build, including a build triggered by automated content. Keep unfinished work in draft status; use a reviewed release when ready. Drafts do not appear in generated pages, feeds, or search, but **all committed source files remain public**. Keep confidential drafts outside this repository.

Short daily notes use `kind: Fieldnote`; longer pieces use `kind: Essay`. Both appear in Notes. RSS readers receive a summary and permanent article link. The combined feed at `/rss.xml` includes signed content and automated briefings; `/writing/rss.xml` includes only signed notes, research, and Fieldbook entries; `/research/rss.xml` remains research-only. New content does not require editing a page template.

## Corrections

Preserve published slugs. For substantial corrections set `updated`, refresh `reviewed` if sources were rechecked, and add a visible correction paragraph explaining the change. Keep source history. Never silently relabel a research summary as a reproduced experiment.

## Asking Codex for help

“Draft a fieldnote about [question]. Read primary sources, cite claims, explain limits, and avoid invented experience or measurements. Use our note template and leave it in draft status. Show me the preview and verification results before publication.”

## Agent Reliability Fieldbook

Copy `docs/templates/fieldbook.md`. The launch contract supports only `duplicate-action`, `forgotten-instruction`, and `premature-done`, each at revision 1. Use `evidence: Simulation-based guide`, personal authorship, a positive order, sources, and a source-review date. A published guide must have a unique order and scenario/revision pair. Keep published slugs stable.

Use the common structure: question, initial conditions, baseline versus repair, mechanism, production considerations, limitations, and related reading. Inspect the actual source and outcome assertions. Cite a pinned scenario source. Never turn scripted results into model benchmarks or imply that retaining instructions enforces permissions. Links are generated centrally and always open paused at step zero.

`docs/templates/investigation.md` is for future measured work. Keep it in draft until methods, artifacts, results, and limitations exist and have been checked. The template itself does not establish that any experiment was run.

## Identity and automation

Keep stored `author: Swapnil` values compatible; shared presentation maps them to Swapnil Upganlawar. Automated briefings use organization attribution on pages, metadata, and social images. A personal byline does not imply independent experimental reproduction or human source verification; preserve the AI-assistance disclosure.

Daily briefings may publish automatically after evidence and release checks. Weekly research requires review. Weekly prototypes are candidates, with separate protected approval for repository publication; there is no weekly public-release quota. Scheduled generation does not modify Fieldbook entries. Current schedules and recovery instructions live in [automation operations](automation/README.md). There is no email newsletter service or reader-data collection.
