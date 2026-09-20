import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { feeds, safeURL, type Source, type Kind } from './policy.ts';
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export async function download(url: string, redirects = 0): Promise<string> {
  safeURL(url);
  const response = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(25000),
    headers: {
      'User-Agent':
        'ModelFieldnotes/1.0 (+https://modelfieldnotes.com/editorial/)',
    },
  });
  if (response.status >= 300 && response.status < 400) {
    if (redirects >= 3) throw new Error('Too many source redirects');
    return download(
      new URL(response.headers.get('location') || '', url).href,
      redirects + 1,
    );
  }
  if (!response.ok) throw new Error(`Source unavailable (${response.status})`);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = '',
    bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 2_000_000) {
      await reader.cancel();
      throw new Error('Source exceeds download limit');
    }
    result += decoder.decode(value, { stream: true });
  }
  return result + decoder.decode();
}
export function candidates(xml: string) {
  const $ = load(xml, { xml: true });
  return $('item,entry')
    .toArray()
    .map((el) => {
      const entry = $(el);
      const raw =
        entry.find('link[rel="alternate"]').attr('href') ||
        entry.find('link').first().attr('href') ||
        entry.find('link').first().text();
      const url = raw
        .trim()
        .replace(/^http:\/\/(?:export\.)?arxiv.org/, 'https://arxiv.org');
      const date = new Date(entry.find('pubDate,published').first().text());
      return {
        url,
        title: entry.find('title').first().text().trim(),
        published: Number.isNaN(date.valueOf()) ? '' : date.toISOString(),
      };
    })
    .filter((s) => s.published && s.title && s.url);
}
export function extract(html: string): string {
  const $ = load(html);
  $('script,style,nav,header,footer,form,svg,noscript').remove();
  return (
    $('article').first().text() ||
    $('main').first().text() ||
    $('body').text()
  )
    .replace(/\s+/g, ' ')
    .trim();
}
export async function discover(
  kind: Kind,
  since: string,
  now: string,
  used: Set<string>,
) {
  const sources: Source[] = [],
    errors: string[] = [];
  for (const feed of feeds.filter(
    (f) => kind !== 'research' || f.includes('arxiv'),
  )) {
    try {
      const entries = candidates(await download(feed)).filter(
        (s) => s.published >= since && s.published <= now && !used.has(s.url),
      );
      for (const entry of entries.slice(0, kind === 'research' ? 10 : 3)) {
        try {
          const fullPaper = entry.url.includes('arxiv.org/abs/');
          const readURL = fullPaper
            ? entry.url.replace('/abs/', '/html/')
            : entry.url;
          const html = await download(readURL);
          if (fullPaper && !load(html)('.ltx_document .ltx_section').length)
            throw new Error('Not a full arXiv HTML paper');
          const text = extract(html);
          // No truncated papers advertised as full reading. Keep source text in memory only.
          if (text.length < 600 || text.length > 90000)
            throw new Error('Full source outside reading envelope');
          sources.push({
            id: `s${sources.length + 1}`,
            title: entry.title,
            url: safeURL(entry.url),
            published: entry.published,
            fetched: now,
            hash: hash(text),
            text,
            fullPaper,
          });
          if (sources.length >= (kind === 'research' ? 5 : 5))
            return { sources, errors };
        } catch {
          errors.push(`Unavailable full source: ${entry.url}`);
        }
      }
    } catch {
      errors.push(`Feed unavailable: ${feed}`);
    }
  }
  return { sources, errors };
}
