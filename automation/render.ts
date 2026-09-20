import { stringify } from 'yaml';
import type { Edition, Source } from './policy.ts';
export const md = (text: string) =>
  text.replace(/[\\`*_{}[\]()#+.!|>~-]/g, '\\$&').replace(/\r?\n/g, ' ');
export function renderEdition(
  edition: Edition,
  sources: Source[],
  date: string,
  kind: 'daily' | 'research',
  number: number,
) {
  const used = sources.filter((s) =>
    edition.stories.some(
      (st) =>
        st.sourceId === s.id || st.claims.some((c) => c.sourceId === s.id),
    ),
  );
  const metadata = {
    title: edition.title,
    description: edition.summary,
    published: date,
    status: 'published',
    author: 'Model Fieldnotes',
    authorship: 'automated',
    topics: edition.topics,
    sources: used.map((s) => ({ title: s.title, url: s.url })),
    ...(kind === 'daily'
      ? { kind: 'Daily brief', number, reviewed: date }
      : {
          issue: number,
          collection: 'Weekly selection',
          papers: edition.stories.map((st) => {
            const s = sources.find((s) => s.id === st.sourceId)!;
            return {
              title: s.title,
              url: s.url,
              published: s.published.slice(0, 10),
              finding: st.change,
            };
          }),
        }),
  };
  const stories = edition.stories.map((story, i) => {
    const s = sources.find((s) => s.id === story.sourceId)!;
    return `## ${md(story.title)}\n\n${kind === 'research' && i === 0 ? '**This week’s deeper reading.** ' : ''}${md(story.change)}\n\n**Why it matters.** ${md(story.relevance)}\n\n**Evidence.** ${story.claims.map((c) => `${md(c.text)} ([source](${sources.find((s) => s.id === c.sourceId)!.url}))`).join(' ')}\n\n**Limits.** ${md(story.limitation)}\n\n**Try this.** ${md(story.practical)}\n\n[Read the original](${s.url}) · Published ${s.published.slice(0, 10)} · Event ${story.eventDate}\n`;
  });
  return `---\n${stringify(metadata, { defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' })}---\n\nThis ${kind === 'daily' ? 'briefing' : 'selection'} was generated with AI from the linked sources. Automated evidence checks are not human review. Results are source-reported unless explicitly stated otherwise. [How this works](/editorial/).\n\n${stories.join('\n')}\n`;
}
export function evidenceRecord(sources: Source[], edition?: Edition) {
  return {
    sources: sources.map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      published: s.published,
      fetched: s.fetched,
      hash: s.hash,
      fullPaper: s.fullPaper,
    })),
    claims: edition?.stories.flatMap((s) => s.claims) || [],
  };
}
