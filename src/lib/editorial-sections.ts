import { signed, visible } from './content.ts';

export const focusAreas = [
  {
    id: 'leadership',
    label: 'Leadership & Organizations',
    topics: ['Leadership'],
  },
  {
    id: 'strategy',
    label: 'AI Strategy & Economics',
    topics: ['Economics', 'Governance'],
  },
  {
    id: 'engineering',
    label: 'Engineering Judgment',
    topics: ['Agents', 'Models', 'Research'],
  },
] as const;

export function focusFor(topics: readonly string[]) {
  return focusAreas
    .filter((area) => area.topics.some((topic) => topics.includes(topic)))
    .map((area) => area.id);
}

interface Entry {
  id: string;
  data: { status: string; published: Date; authorship: string };
}

export const perspectiveNotes = <T extends Entry>(
  notes: T[],
  now = new Date(),
) => signed(visible(notes, now));
export const automatedNotes = <T extends Entry>(notes: T[], now = new Date()) =>
  visible(notes, now).filter((note) => note.data.authorship === 'automated');
