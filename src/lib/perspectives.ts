import { signed, visible } from './content.ts';

export const featuredEssay = {
  id: 'what-changes-when-ai-can-do-the-work',
  href: '/notes/what-changes-when-ai-can-do-the-work/',
} as const;

interface Perspective {
  title: string;
  section: string;
  thesis: string;
  implication: string;
  reading: { label: string; href: string; noteId?: string };
}

export const perspectives: readonly Perspective[] = [
  {
    title: 'From answers to outcomes',
    section: 'from-answers-to-outcomes',
    thesis:
      'Completed work, errors, retries, and human intervention belong in the same evaluation.',
    implication:
      'Measure cost per successful task and decide which failures are acceptable.',
    reading: {
      label: 'The cost of a completed task',
      href: '/notes/cost-of-a-completed-task/',
      noteId: 'cost-of-a-completed-task',
    },
  },
  {
    title: 'From demos to dependable systems',
    section: 'from-demos-to-dependable-systems',
    thesis:
      'Reliability depends on the surrounding software, controls, and verification as well as the model.',
    implication:
      'Design permissions, recovery, and evaluation into the product from the start.',
    reading: { label: 'Agent Reliability Fieldbook', href: '/fieldbook/' },
  },
  {
    title: 'From model selection to organizational design',
    section: 'from-model-selection-to-organizational-design',
    thesis:
      'Delegating work to AI changes workflows, ownership, and escalation.',
    implication:
      'Decide what to delegate, who remains accountable, and when people intervene.',
    reading: {
      label: 'Leadership & Organizations',
      href: '/leadership/',
    },
  },
];

// Fail the build rather than promoting unpublished or organizational content.
export function requireSignedNote<
  T extends {
    id: string;
    data: { status: string; published: Date; authorship: string };
  },
>(entries: T[], id: string, now = new Date()): T {
  const entry = signed(visible(entries, now)).find((entry) => entry.id === id);
  if (!entry)
    throw new Error(`Featured note must be published and signed: ${id}`);
  return entry;
}
