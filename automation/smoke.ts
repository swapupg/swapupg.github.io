import { setTimeout } from 'node:timers/promises';
import { StateStore, repo, report } from './github.ts';
const {
  EXPECTED_COMMIT: commit,
  ARTICLE_URL: url,
  EDITION_ID: id,
} = process.env;
if (
  !commit ||
  !url?.startsWith('https://modelfieldnotes.com/notes/') ||
  !id?.startsWith('daily-')
)
  throw new Error('Invalid deployment check');
let passed = false;
for (let attempt = 0; attempt < 40; attempt++) {
  try {
    const info: { commit: string } = await fetch(
      `https://modelfieldnotes.com/build-info.json?commit=${commit}`,
      { cache: 'no-store' },
    ).then((r) => r.json());
    if (info.commit === commit) {
      const [page, rss]: [Response, Response] = await Promise.all([
        fetch(url),
        fetch('https://modelfieldnotes.com/rss.xml'),
      ]);
      if (
        page.ok &&
        (await page.text()).includes('Automated briefing') &&
        (await rss.text()).includes(url)
      ) {
        passed = true;
        break;
      }
    }
  } catch {
    /* Retry CDN/certificate/network transients; no paid calls. */
  }
  await setTimeout(30000);
}
const store = await new StateStore().open();
const current = store.state.editions[id];
if (!current || current.commit !== commit)
  throw new Error('State changed during deployment');
if (passed) {
  current.status = 'published';
  current.reason = 'Exact commit, article and RSS verified';
  await store.save();
} else {
  await report(
    `Automation needs attention: ${id}`,
    `Deployment was not verified for ${commit}. Inspect [workflow runs](https://github.com/${repo}/actions). Candidate remains pending; do not regenerate this edition.`,
  );
  throw new Error('Deployment smoke test did not pass');
}
