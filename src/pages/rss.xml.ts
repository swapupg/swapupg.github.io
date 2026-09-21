import rss from '@astrojs/rss';
import { writingItems } from '../lib/feeds';
import { identity } from '../lib/identity';
export async function GET() {
  return rss({
    title: 'Model Fieldnotes — all writing and briefings',
    description: identity.description,
    site: 'https://modelfieldnotes.com',
    items: await writingItems(),
    customData: '<language>en</language>',
  });
}
