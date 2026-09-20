import { z } from 'astro/zod';

export const kinds = ['daily', 'research', 'build'] as const;
export type Kind = (typeof kinds)[number];
export const limits = {
  month: 50,
  category: { daily: 25, research: 10, build: 15 },
  run: { daily: 0.75, research: 2, build: 3 },
};
export const model = 'gpt-5.6-terra';
// Standard service tier. Recheck against the linked pricing page before expiry.
export const pricing = {
  model,
  input: 2,
  output: 12,
  validUntil: '2026-10-20',
  source: 'https://developers.openai.com/api/docs/pricing',
};
export const domains = [
  'arxiv.org',
  'export.arxiv.org',
  'openai.com',
  'www.anthropic.com',
  'anthropic.com',
  'deepmind.google',
  'ai.meta.com',
  'www.microsoft.com',
  'huggingface.co',
  'digital-strategy.ec.europa.eu',
  'www.nist.gov',
];
export const feeds = [
  'https://openai.com/news/rss.xml',
  'https://huggingface.co/blog/feed.xml',
  'https://deepmind.google/blog/rss.xml',
  'https://www.microsoft.com/en-us/research/feed/',
  'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=12',
];
export const plain = z
  .string()
  .min(1)
  .max(6000)
  .refine(
    (s) => !/[<>]/.test(s) && ![...s].some((c) => c.charCodeAt(0) < 9),
    'HTML/control characters are not content',
  );
export const sourceSchema = z.object({
  id: z.string(),
  title: plain,
  url: z.url(),
  published: z.iso.datetime(),
  fetched: z.iso.datetime(),
  hash: z.string(),
  text: z.string(),
  fullPaper: z.boolean(),
});
export type Source = z.infer<typeof sourceSchema>;
const claimSchema = z
  .object({
    text: plain,
    sourceId: z.string(),
    evidence: z.string().min(10).max(200),
  })
  .strict();
const storySchema = z
  .object({
    title: plain,
    sourceId: z.string(),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    change: plain,
    relevance: plain,
    limitation: plain,
    practical: plain,
    claims: z.array(claimSchema).min(1).max(4),
  })
  .strict();
export const editionSchema = z
  .object({
    title: plain.max(140),
    summary: plain.max(280),
    disposition: z.enum(['publish', 'review', 'skip']),
    reason: plain,
    topics: z
      .array(
        z.enum(['Agents', 'Models', 'Economics', 'Governance', 'Research']),
      )
      .min(1),
    stories: z.array(storySchema).max(5),
  })
  .strict();
export type Edition = z.infer<typeof editionSchema>;
export const verificationSchema = z
  .object({ supported: z.boolean(), sensitive: z.boolean(), reason: plain })
  .strict();
export const projectSchema = z
  .object({
    name: z.string().regex(/^[a-z][a-z0-9-]{2,45}$/),
    title: plain.max(140),
    description: plain.max(300),
    format: z.enum(['CLI', 'Library', 'Browser app']),
    problem: plain,
    alternatives: z
      .array(
        z
          .object({
            name: plain,
            url: z
              .string()
              .regex(
                /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
              ),
            difference: plain,
          })
          .strict(),
      )
      .min(2)
      .max(5),
    files: z
      .array(
        z.object({ path: z.string(), content: z.string().max(30000) }).strict(),
      )
      .min(4)
      .max(20),
    limitations: plain,
  })
  .strict();
export type Project = z.infer<typeof projectSchema>;
export function safeURL(value: string): string {
  const u = new URL(value);
  if (
    u.protocol !== 'https:' ||
    u.username ||
    u.password ||
    u.port ||
    !domains.includes(u.hostname)
  )
    throw new Error('Unapproved source URL');
  u.hash = '';
  return u.href.replace(/\(/g, '%28').replace(/\)/g, '%29');
}
export function localDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function editionId(kind: Kind, date: string): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    throw new Error('Invalid edition date');
  return `${kind}-${date}`;
}
const normalize = (s: string) => {
  let text = s.replace(/\s+/g, ' ').trim();
  for (const [open, close] of [
    ['“', '”'],
    ['‘', '’'],
    ['"', '"'],
    ["'", "'"],
  ]) {
    if (text.startsWith(open) && text.endsWith(close)) {
      text = text.slice(1, -1).trim();
      break;
    }
  }
  return text.toLowerCase();
};
export function assess(
  edition: Edition,
  sources: Source[],
  kind: Kind,
  date: string,
) {
  if (edition.disposition === 'skip') return 'skip';
  if (!edition.stories.length) throw new Error('Empty edition');
  if (
    kind === 'research' &&
    (edition.stories.length !== 5 ||
      new Set(edition.stories.map((s) => s.sourceId)).size !== 5)
  )
    throw new Error('Five distinct full papers required');
  const quotes = new Map<string, number>();
  let missingEvidence = false;
  for (const story of edition.stories) {
    const source = sources.find((s) => s.id === story.sourceId);
    if (!source || (kind === 'research' && !source.fullPaper))
      throw new Error('Missing readable source');
    if (story.eventDate > date || Number.isNaN(Date.parse(story.eventDate)))
      throw new Error('Future or invalid event date');
    if (
      kind === 'daily' &&
      Date.parse(date) - Date.parse(story.eventDate) > 7 * 86400000
    )
      throw new Error('Stale event');
    for (const claim of story.claims) {
      const evidence = sources.find((s) => s.id === claim.sourceId);
      if (
        !evidence ||
        !normalize(evidence.text).includes(normalize(claim.evidence))
      )
        missingEvidence = true;
      quotes.set(
        claim.sourceId,
        (quotes.get(claim.sourceId) || 0) + claim.evidence.split(/\s+/).length,
      );
    }
  }
  if (missingEvidence) throw new Error('Evidence is not present in the source');
  if ([...quotes.values()].some((n) => n > 25))
    throw new Error('Evidence excerpts exceed 25 words per source');
  const sourceInstructions = sources.some((s) =>
    /ignore (?:all |previous |prior )?instructions|reveal (?:the |your )?system prompt|exfiltrat|send (?:the |your )?(?:api key|secret)/i.test(
      s.text,
    ),
  );
  const sensitive =
    /regulat|legislat|lawsuit|allegation|illegal|fraud|my opinion|i believe|legal advice|investment|medical/i.test(
      JSON.stringify(edition),
    );
  return kind === 'research' ||
    sourceInstructions ||
    sensitive ||
    edition.topics.includes('Governance') ||
    edition.disposition === 'review'
    ? 'review'
    : 'publish';
}
export function validateProject(project: Project) {
  const paths = new Set<string>();
  for (const file of project.files) {
    if (
      !/^(?:src\/|test\/|public\/|bin\/)?[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*\.(?:js|mjs|html|css|json|md)$/.test(
        file.path,
      ) &&
      !['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md'].includes(file.path)
    )
      throw new Error(`Disallowed project path: ${file.path}`);
    if (paths.has(file.path)) throw new Error('Duplicate project path');
    paths.add(file.path);
  }
  for (const p of [
    'README.md',
    'LICENSE',
    'THIRD_PARTY_NOTICES.md',
    'package.json',
  ])
    if (!paths.has(p)) throw new Error(`Missing ${p}`);
  const pkg = JSON.parse(
    project.files.find((f) => f.path === 'package.json')!.content,
  );
  if (
    Object.keys(pkg.dependencies || {}).length ||
    Object.keys(pkg.devDependencies || {}).length
  )
    throw new Error('Initial automated prototypes must be dependency-free');
  if (
    pkg.scripts?.test !== 'node --test' ||
    pkg.license !== 'MIT' ||
    pkg.name !== project.name
  )
    throw new Error('Expected matching package name, MIT, and node --test');
  if (
    Object.keys(pkg.scripts || {}).some(
      (key) => !['test', 'start'].includes(key),
    )
  )
    throw new Error('Package lifecycle scripts are forbidden');
  if (!project.files.some((f) => /^test\/.*\.m?js$/.test(f.path)))
    throw new Error('Missing tests');
  const license = project.files.find((f) => f.path === 'LICENSE')!.content;
  if (
    !license.includes('Permission is hereby granted, free of charge') ||
    !license.includes('THE SOFTWARE IS PROVIDED "AS IS"')
  )
    throw new Error('Missing MIT license terms');
}

export function publicationDisposition(
  edition: Edition,
  sources: Source[],
  kind: Kind,
  date: string,
) {
  try {
    return {
      disposition: assess(edition, sources, kind, date),
      issue: undefined,
    };
  } catch (error) {
    const issue = error instanceof Error ? error.message : '';
    if (
      [
        'Evidence is not present in the source',
        'Evidence excerpts exceed 25 words per source',
      ].includes(issue) &&
      edition.stories.every(
        (story) =>
          sources.some((source) => source.id === story.sourceId) &&
          story.claims.every((claim) =>
            sources.some((source) => source.id === claim.sourceId),
          ),
      )
    ) {
      return { disposition: 'review' as const, issue };
    }
    throw error;
  }
}
