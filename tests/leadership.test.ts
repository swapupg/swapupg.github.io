import { describe, expect, it } from 'vitest';
import { leadershipNotes } from '../src/lib/leadership';

describe('leadership editorial boundary', () => {
  it('selects only published, eligible, signed leadership writing', () => {
    const now = new Date('2026-09-21T12:00:00Z');
    const entry = {
      id: 'eligible',
      data: {
        status: 'published',
        authorship: 'human',
        topics: ['Leadership'],
        published: now,
      },
    };
    const entries = [
      entry,
      {
        ...entry,
        id: 'automated',
        data: { ...entry.data, authorship: 'automated' },
      },
      { ...entry, id: 'draft', data: { ...entry.data, status: 'draft' } },
      {
        ...entry,
        id: 'future',
        data: { ...entry.data, published: new Date(now.getTime() + 1) },
      },
      {
        ...entry,
        id: 'different-topic',
        data: { ...entry.data, topics: ['Agents'] },
      },
    ];
    expect(leadershipNotes(entries, now)).toEqual([entry]);
    expect(entries).toHaveLength(5);
  });
});
