import { describe, expect, it } from 'vitest';
import { signed } from '../src/lib/content';
import { attribution, socialCardPath } from '../src/lib/identity';
import { scenarioIds, simulationLink } from '../src/lib/fieldbook';

describe('publishing identity and scenario links', () => {
  it('uses authorship rather than format to select signed work', () => {
    const entries = [
      { id: 'personal', data: { authorship: 'human', kind: 'Fieldnote' } },
      { id: 'generated', data: { authorship: 'automated', kind: 'Essay' } },
      { id: 'brief', data: { authorship: 'automated', kind: 'Daily brief' } },
    ];
    expect(signed(entries).map((entry) => entry.id)).toEqual(['personal']);
    expect(entries).toHaveLength(3);
    expect(attribution(true)).not.toContain('Swapnil');
    expect(attribution()).toBe('By Swapnil Upganlawar');
  });
  it('keeps share-card names distinct across collections', () => {
    expect(socialCardPath('fieldbook', 'duplicate-action')).not.toBe(
      socialCardPath('notes', 'duplicate-action'),
    );
  });
  it('links every supported scenario and variant to revision one at step zero', () => {
    for (const id of scenarioIds)
      for (const variant of ['baseline', 'repaired'] as const)
        expect(simulationLink({ id, revision: 1 }, variant)).toBe(
          `/agent-explainer/#/experiment/${id}/1/${variant}/0`,
        );
  });
});
