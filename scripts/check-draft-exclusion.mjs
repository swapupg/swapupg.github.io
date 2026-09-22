import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
const fixtures = [];
const marker = 'unpublished-contract-fixture';
try {
  for (const collection of [
    'notes',
    'research',
    'projects',
    'fieldbook',
    'developments',
  ]) {
    const dir = `src/content/${collection}`;
    const original = (await readdir(dir)).find((name) => name.endsWith('.md'));
    const body = await readFile(join(dir, original), 'utf8');
    for (const variant of ['draft', 'future']) {
      const file = join(dir, `${marker}-${variant}.md`);
      let fixture = body
        .replace(/^title: .*$/m, `title: ${marker}`)
        .replace(
          /^status: .*$/m,
          `status: ${variant === 'draft' ? 'draft' : 'published'}`,
        )
        .replace(
          /^published: .*$/m,
          `published: ${variant === 'future' ? '2999-01-01' : '2020-01-01'}`,
        );
      if (collection === 'developments')
        fixture = fixture.replace(/^eventDate: .*$/m, 'eventDate: 2020-01-01');
      if (collection === 'notes')
        fixture = fixture.replace(/^topics: .*$/m, 'topics: [Leadership]');
      await writeFile(file, fixture, { flag: 'wx' });
      fixtures.push(file);
    }
  }
  execFileSync('npm', ['run', 'build'], { stdio: 'pipe' });
  const files = await readdir('dist', { recursive: true });
  for (const file of files) {
    if (file.includes(marker))
      throw new Error(`Unpublished route or asset leaked: ${file}`);
    if (
      /\.(html|xml|json|js)$/.test(file) &&
      (await readFile(join('dist', file), 'utf8')).includes(marker)
    )
      throw new Error(`Unpublished content leaked: ${file}`);
  }
  console.log(
    'Draft and future entries excluded from pages, archives, search, feeds, sitemap and social assets in all five collections.',
  );
} finally {
  for (const file of fixtures) await unlink(file);
  execFileSync('npm', ['run', 'build'], { stdio: 'pipe' });
}
