import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stableId = ({ entry }: { entry: string }) => {
  const id = entry.replace(/\.mdx?$/, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
    throw new Error(`Use a stable, lowercase, hyphenated filename: ${entry}`);
  return id;
};

const source = z.object({ title: z.string().min(1), url: z.url() });
const shared = {
  title: z.string().min(1),
  description: z.string().min(1),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  status: z.enum(['draft', 'published']),
  author: z.literal('Swapnil'),
  topics: z
    .array(z.enum(['Agents', 'Models', 'Economics', 'Governance', 'Research']))
    .min(1),
  sources: z.array(source).min(1),
};
const notes = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/notes',
    generateId: stableId,
  }),
  schema: z.object({
    ...shared,
    kind: z.enum(['Essay', 'Fieldnote']),
    number: z.number().int().positive(),
    reviewed: z.coerce.date(),
  }),
});
const research = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/research',
    generateId: stableId,
  }),
  schema: z.object({
    ...shared,
    issue: z.number().int().positive(),
    collection: z.enum(['Foundations', 'Weekly selection']),
    papers: z
      .array(
        z.object({
          title: z.string(),
          url: z.url(),
          published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          finding: z.string(),
        }),
      )
      .length(5),
  }),
});
const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
    generateId: stableId,
  }),
  schema: z.object({
    ...shared,
    stage: z.enum(['Public beta', 'Stable']),
    demo: z.string().startsWith('/agent-explainer/').or(z.url()),
    repository: z.url(),
    image: z.string(),
    imageAlt: z.string().min(1),
  }),
});
export const collections = { notes, research, projects };
