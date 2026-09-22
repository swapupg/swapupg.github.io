import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { visible } from '../../lib/content';
import { automatedNotes } from '../../lib/editorial-sections';
export async function GET() {
  const entries = visible([
    ...(await getCollection('developments')),
    ...automatedNotes(await getCollection('notes')),
  ]);
  return rss({
    title: 'Model Fieldnotes — Developments',
    description:
      'Source-based release analysis and automated briefings, with evidence and limitations made explicit.',
    site: 'https://modelfieldnotes.com',
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.published,
      link: `/${entry.collection}/${entry.id}/`,
    })),
    customData: '<language>en</language>',
  });
}
