import { describe, expect, it } from 'vitest';
import { requireSignedNote } from '../src/lib/perspectives';

describe('featured writing publication boundary', () => {
  const now = new Date('2026-09-21T12:00:00Z');
  const note = {
    id: 'featured',
    data: {
      status: 'published',
      authorship: 'human',
      published: new Date('2026-09-21T12:00:00Z'),
    },
  };
  it('accepts signed writing on its publication date', () => {
    expect(requireSignedNote([note], note.id, now)).toBe(note);
  });
  it.each([
    { status: 'draft' },
    { authorship: 'automated' },
    { published: new Date('2026-09-21T12:00:01Z') },
  ])('rejects ineligible featured content: %j', (data) => {
    expect(() =>
      requireSignedNote(
        [{ ...note, data: { ...note.data, ...data } }],
        note.id,
        now,
      ),
    ).toThrow('Featured note must be published and signed');
  });
  it('rejects missing destinations instead of showing a broken call to action', () => {
    expect(() => requireSignedNote([note], 'missing', now)).toThrow(
      'Featured note',
    );
  });
});
