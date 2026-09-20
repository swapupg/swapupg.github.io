export function visible<
  T extends { data: { status: string; published: Date }; id: string },
>(entries: T[], now = new Date()): T[] {
  return entries
    .filter(
      (entry) =>
        entry.data.status === 'published' && entry.data.published <= now,
    )
    .sort(
      (a, b) =>
        b.data.published.getTime() - a.data.published.getTime() ||
        a.id.localeCompare(b.id),
    );
}
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
export const readingTime = (body = '') =>
  Math.max(1, Math.ceil(body.split(/\s+/).length / 210));
export const pad = (n: number) => String(n).padStart(3, '0');
