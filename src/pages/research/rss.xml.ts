import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { visible } from '../../lib/content';
export async function GET() {
  return rss({
    title: 'Model Fieldnotes — Research',
    description:
      'Five papers at a time: evidence, limitations, and practical implications.',
    site: 'https://modelfieldnotes.com',
    items: visible(await getCollection('research')).map((e) => ({
      title: e.data.title,
      description: e.data.description,
      pubDate: e.data.published,
      link: `/research/${e.id}/`,
    })),
    customData: '<language>en</language>',
  });
}
