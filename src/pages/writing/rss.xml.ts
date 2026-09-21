import rss from '@astrojs/rss';
import { writingItems } from '../../lib/feeds';
import { identity } from '../../lib/identity';

export async function GET() {
  return rss({
    title: `Model Fieldnotes — writing by ${identity.name}`,
    description:
      'Signed notes, research collections, and simulation-based guides. Automated briefings are available in the combined feed.',
    site: 'https://modelfieldnotes.com',
    items: await writingItems(true),
    customData: '<language>en</language>',
  });
}
