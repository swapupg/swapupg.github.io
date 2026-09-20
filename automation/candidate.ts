import { readFile, readdir } from 'node:fs/promises';
import { projectSchema, validateProject, type Project } from './policy.ts';
import { hash } from './sources.ts';
export function candidateDigest(project: Project) {
  return hash(
    JSON.stringify({
      ...project,
      files: [...project.files].sort((a, b) => a.path.localeCompare(b.path)),
    }),
  );
}
export async function verifyCandidate(directory = '.automation-output') {
  const manifest = JSON.parse(
    await readFile(`${directory}/release.json`, 'utf8'),
  );
  const project = projectSchema.parse(
    JSON.parse(await readFile(`${directory}/project.json`, 'utf8')),
  );
  validateProject(project);
  if (
    manifest.name !== project.name ||
    manifest.version !== 1 ||
    !/^\d+$/.test(manifest.run)
  )
    throw new Error('Invalid release manifest');
  const digest = candidateDigest(project);
  if (digest !== manifest.digest) throw new Error('Candidate hash mismatch');
  const walk = async (path: string): Promise<string[]> =>
    (
      await Promise.all(
        (await readdir(path, { withFileTypes: true })).map(async (item) =>
          item.isDirectory()
            ? (await walk(`${path}/${item.name}`)).map(
                (n) => `${item.name}/${n}`,
              )
            : [item.name],
        ),
      )
    ).flat();
  const disk = await walk(`${directory}/project`);
  if (disk.length !== project.files.length)
    throw new Error('Unexpected candidate files');
  for (const file of project.files)
    if (
      (await readFile(`${directory}/project/${file.path}`, 'utf8')) !==
      file.content
    )
      throw new Error('Candidate bytes changed');
  return { manifest, project };
}
if (process.argv.includes('--check')) {
  const { manifest } = await verifyCandidate();
  console.log(manifest.digest);
}
