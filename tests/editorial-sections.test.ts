import { describe, it, expect } from 'vitest';
import {
  perspectiveNotes,
  automatedNotes,
  focusFor,
} from '../src/lib/editorial-sections';

describe('separate signed perspectives from automated developments', () => {
  const now = new Date('2026-09-22T12:00:00Z');
  const base = {
    id: 'signed',
    data: { authorship: 'human', status: 'published', published: now },
  };
  const auto = {
    ...base,
    id: 'automated-essay',
    data: { ...base.data, authorship: 'automated', kind: 'Essay' },
  };
  const entries = [
    base,
    auto,
    { ...base, id: 'draft', data: { ...base.data, status: 'draft' } },
    {
      ...base,
      id: 'future',
      data: { ...base.data, published: new Date('2999-01-01') },
    },
  ];
  it('uses authorship, not format, and preserves publication boundaries', () => {
    expect(perspectiveNotes(entries, now)).toEqual([base]);
    expect(automatedNotes(entries, now)).toEqual([auto]);
    expect(
      automatedNotes(
        entries.map((entry) => ({
          ...entry,
          data: { ...entry.data, authorship: 'automated' },
        })),
        now,
      ),
    ).toHaveLength(2);
  });
  it('allows cross-cutting writing to appear under each relevant focus', () => {
    expect(focusFor(['Leadership', 'Economics', 'Models'])).toEqual([
      'leadership',
      'strategy',
      'engineering',
    ]);
    expect(focusFor(['Governance'])).toEqual(['strategy']);
  });
});
