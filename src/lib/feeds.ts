import { getCollection } from 'astro:content';
import { visible, signed } from './content';

export async function writingItems(signedOnly = false) {
  const entries = [
    ...visible(await getCollection('notes')),
    ...visible(await getCollection('research')),
    ...visible(await getCollection('fieldbook')),
  ];
  return (signedOnly ? signed(entries) : entries)
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.published,
      link: `/${entry.collection}/${entry.id}/`,
    }))
    .sort(
      (a, b) =>
        b.pubDate.getTime() - a.pubDate.getTime() ||
        a.link.localeCompare(b.link),
    );
}
