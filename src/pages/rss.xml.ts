import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { visible } from '../lib/content';
export async function GET() {
  const notes = visible(await getCollection('notes')).map((e) => ({
    title: e.data.title,
    description: e.data.description,
    pubDate: e.data.published,
    link: `/notes/${e.id}/`,
  }));
  const research = visible(await getCollection('research')).map((e) => ({
    title: e.data.title,
    description: e.data.description,
    pubDate: e.data.published,
    link: `/research/${e.id}/`,
  }));
  return rss({
    title: 'Model Fieldnotes — By Swapnil',
    description:
      'Open-source tools, research notes, and practical experiments for people building with AI.',
    site: 'https://modelfieldnotes.com',
    items: [...notes, ...research].sort(
      (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
    ),
    customData: '<language>en</language>',
  });
}
