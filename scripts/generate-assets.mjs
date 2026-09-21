import { parse } from 'yaml';
import { Buffer } from 'node:buffer';
import {
  copyFile,
  unlink,
  mkdir,
  readFile,
  writeFile,
  readdir,
} from 'node:fs/promises';
import sharp from 'sharp';
import { identity, attribution, socialCardPath } from '../src/lib/identity.ts';
const out = new URL('../public/assets/', import.meta.url);
await mkdir(out, { recursive: true });
for (const file of await readdir(out))
  if (/^social-.*\.(svg|png)$/.test(file)) await unlink(new URL(file, out));
for (const [pkg, file] of [
  ['inter', 'inter'],
  ['space-grotesk', 'space-grotesk'],
]) {
  await copyFile(
    new URL(
      `../node_modules/@fontsource-variable/${pkg}/files/${file}-latin-wght-normal.woff2`,
      import.meta.url,
    ),
    new URL(`${file}-latin.woff2`, out),
  );
  await copyFile(
    new URL(
      `../node_modules/@fontsource-variable/${pkg}/LICENSE`,
      import.meta.url,
    ),
    new URL(`${file}-LICENSE.txt`, out),
  );
}
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#142f2b"/><g fill="none" stroke="#d5e8ce" stroke-width="2.5" stroke-linejoin="round"><path d="M15 49V16l17 11 17-11v33M15 16l17 25 17-25M32 27v14"/></g><circle cx="32" cy="41" r="3.5" fill="#d5e8ce"/></svg>`;
await writeFile(new URL('favicon.svg', out), icon);
const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="90" viewBox="0 0 360 90" role="img" aria-label="Model Fieldnotes"><g fill="none" stroke="#326456" stroke-width="2.5" stroke-linejoin="round"><path d="M16 68V20l24 16 24-16v48M16 20l24 36 24-36M40 36v20"/></g><circle cx="40" cy="56" r="3.5" fill="#326456"/><g fill="#1d2c28" font-family="Space Grotesk,Arial,sans-serif" font-size="29"><text x="86" y="40">Model</text><text x="86" y="72" font-weight="600">Fieldnotes</text></g></svg>`;
await writeFile(new URL('wordmark.svg', out), wordmark);
await sharp(new URL('../assets/agent-explainer.png', import.meta.url).pathname)
  .resize({ width: 1200 })
  .webp({ quality: 84 })
  .toFile(new URL('agent-explainer.webp', out).pathname);
const escape = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const lines = (text, max) => {
  const result = [''];
  for (const word of text.split(' ')) {
    const index = result.length - 1;
    if ((result[index] + ' ' + word).trim().length > max && result[index])
      result.push(word);
    else result[index] = (result[index] + ' ' + word).trim();
  }
  return result;
};
async function makeCard(title, label, name, automated = false) {
  const titleLines = lines(title, 29);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#d5e8ce" stroke-opacity=".08"/></pattern></defs><rect width="1200" height="630" fill="#142f2b"/><rect x="860" width="340" height="630" fill="url(#grid)"/><path d="M920 440V190l95 61 95-61v250M920 190l95 145 95-145M1015 251v84" fill="none" stroke="#a6cfad" stroke-width="4"/><circle cx="1015" cy="335" r="14" fill="#a6cfad"/><text x="70" y="82" fill="#b8d6bf" font-family="Arial,sans-serif" font-size="25">MODEL FIELDNOTES</text><text x="70" y="153" fill="#b8d6bf" font-family="monospace" font-size="16">${escape(label.toUpperCase())}</text>${titleLines.map((line, i) => `<text x="67" y="${235 + i * 66}" fill="#f4f7ed" font-family="Arial,sans-serif" font-size="56" font-weight="500">${escape(line)}</text>`).join('')}<path d="M70 510h1060" stroke="#456254"/><text x="70" y="562" fill="#b8d6bf" font-family="Arial,sans-serif" font-size="21">${escape(attribution(automated))}</text><text x="1130" y="562" text-anchor="end" fill="#b8d6bf" font-family="monospace" font-size="18">modelfieldnotes.com</text></svg>`;
  await writeFile(new URL(`${name}.svg`, out), svg);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(new URL(`${name}.png`, out).pathname);
}
await makeCard(
  identity.headline,
  'Reliability / Economics / Engineering judgment',
  'social-preview',
);
for (const collection of ['notes', 'research', 'fieldbook']) {
  const dir = new URL(`../src/content/${collection}/`, import.meta.url);
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const raw = await readFile(new URL(file, dir), 'utf8');
    const metadata = parse(raw.split('---')[1]);
    if (
      metadata.status !== 'published' ||
      new Date(metadata.published) > new Date()
    )
      continue;
    const title = metadata.title;
    await makeCard(
      title,
      metadata.authorship === 'automated'
        ? 'Automated briefing / Source-backed summary'
        : collection === 'fieldbook'
          ? 'Fieldbook / Simulation-based guide'
          : collection === 'notes'
            ? 'Signed notes / Practical analysis'
            : `Research / Issue ${String(metadata.issue || '').padStart(3, '0')}`,
      socialCardPath(collection, file.replace(/\.mdx?$/, ''))
        .split('/')
        .at(-1)
        .replace(/\.png$/, ''),
      metadata.authorship === 'automated',
    );
    // Keep previously published image URLs working after namespacing new cards.
    if (collection !== 'fieldbook') {
      const id = file.replace(/\.mdx?$/, '');
      for (const extension of ['svg', 'png']) {
        await copyFile(
          new URL(`social-${collection}-${id}.${extension}`, out),
          new URL(`social-${id}.${extension}`, out),
        );
      }
    }
  }
}
console.log('Generated project image, identity, and social cards.');
