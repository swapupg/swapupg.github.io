import { it, expect, vi, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { projectSchema } from '../../automation/policy';
import { download } from '../../automation/sources';
import { verifyCandidate, candidateDigest } from '../../automation/candidate';
afterEach(() => vi.unstubAllGlobals());
it('does not follow redirects to unapproved destinations', async () => {
  const fetch = vi.fn(
    async () =>
      new Response('', {
        status: 302,
        headers: { location: 'https://attacker.invalid/steal' },
      }),
  );
  vi.stubGlobal('fetch', fetch);
  await expect(download('https://openai.com/news')).rejects.toThrow(
    'Unapproved',
  );
  expect(fetch).toHaveBeenCalledOnce();
});
it('fails unavailable and oversized sources without returning partial text', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('missing', { status: 404 })),
  );
  await expect(download('https://openai.com/news')).rejects.toThrow(
    'unavailable',
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('x'.repeat(2_000_001))),
  );
  await expect(download('https://openai.com/news')).rejects.toThrow(
    'download limit',
  );
});
it('binds release approval to exact files and rejects mutations or extras', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mfn-candidate-'));
  try {
    const project = {
      name: 'test-tool',
      title: 'Test tool',
      description: 'A test',
      format: 'CLI',
      problem: 'A problem',
      limitations: 'Not real',
      alternatives: [
        { name: 'One', url: 'https://github.com/one/one', difference: 'One' },
        { name: 'Two', url: 'https://github.com/two/two', difference: 'Two' },
      ],
      files: [
        { path: 'README.md', content: 'Example' },
        {
          path: 'LICENSE',
          content:
            'Permission is hereby granted, free of charge THE SOFTWARE IS PROVIDED "AS IS"',
        },
        { path: 'THIRD_PARTY_NOTICES.md', content: 'None' },
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'test-tool',
            license: 'MIT',
            scripts: { test: 'node --test' },
          }),
        },
        { path: 'test/main.test.mjs', content: 'Example test' },
      ],
    };
    await mkdir(join(dir, 'project/test'), { recursive: true });
    for (const file of project.files)
      await writeFile(join(dir, 'project', file.path), file.content);
    await writeFile(join(dir, 'project.json'), JSON.stringify(project));
    await writeFile(
      join(dir, 'release.json'),
      JSON.stringify({
        version: 1,
        name: project.name,
        run: '123',
        digest: candidateDigest(projectSchema.parse(project)),
      }),
    );
    await expect(verifyCandidate(dir)).resolves.toHaveProperty(
      'project.name',
      'test-tool',
    );
    await writeFile(join(dir, 'project/README.md'), 'Mutated');
    await expect(verifyCandidate(dir)).rejects.toThrow('bytes changed');
    await writeFile(join(dir, 'project/README.md'), 'Example');
    await writeFile(join(dir, 'project/extra.js'), 'bad');
    await expect(verifyCandidate(dir)).rejects.toThrow('Unexpected');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
it('workflows separate secrets from generated execution and require explicit release approval', async () => {
  const build = parse(
    await readFile('.github/workflows/weekly-build.yml', 'utf8'),
  );
  const release = parse(
    await readFile('.github/workflows/project-release.yml', 'utf8'),
  );
  const editorial = parse(
    await readFile('.github/workflows/editorial.yml', 'utf8'),
  );
  expect(build.concurrency.group).toBe(editorial.concurrency.group);
  const testJob = JSON.stringify(build.jobs.test);
  expect(testJob).not.toContain('OPENAI_API_KEY');
  expect(testJob).not.toContain('PROJECT_PUBLISH_TOKEN');
  expect(testJob).toContain('--network none');
  expect(testJob).toContain('--read-only');
  expect(release.jobs.release.environment).toBe('project-release');
  expect(release.on.workflow_dispatch.inputs.digest.required).toBe(true);
  expect(release.jobs.provenance.steps[0].run).toContain('weekly-build.yml');
  expect(
    editorial.on.schedule.every(
      (s: { timezone: string }) => s.timezone === 'America/New_York',
    ),
  ).toBe(true);
});
