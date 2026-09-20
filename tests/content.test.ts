import { describe, expect, it } from 'vitest';
import { visible, formatDate, readingTime } from '../src/lib/content';
describe('publication boundary', () => {
  const now = new Date('2026-09-20T12:00:00Z');
  const item = (id: string, status: string, date: string) => ({
    id,
    data: { status, published: new Date(date) },
  });
  it('excludes drafts and future publications everywhere the shared selector is used', () => {
    expect(
      visible(
        [
          item('draft', 'draft', '2026-01-01'),
          item('scheduled', 'published', '2027-01-01'),
          item('live', 'published', '2026-09-20'),
        ],
        now,
      ).map((e) => e.id),
    ).toEqual(['live']);
  });
  it('orders equal publication dates deterministically without mutating input', () => {
    const entries = [
      item('b', 'published', '2026-09-19'),
      item('a', 'published', '2026-09-19'),
    ];
    expect(visible(entries, now).map((e) => e.id)).toEqual(['a', 'b']);
    expect(entries[0].id).toBe('b');
  });
  it('formats dates in UTC and provides a minimum reading duration', () => {
    expect(formatDate(new Date('2026-09-20T00:00:00Z'))).toBe('Sep 20, 2026');
    expect(readingTime('')).toBe(1);
  });
});
