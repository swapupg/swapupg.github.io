import { describe, expect, it } from 'vitest';
import {
  assessTaskCost,
  exampleA,
  exampleB,
  parseCostValue,
  formatCost,
} from '../src/lib/task-cost';
describe('outcome cost arithmetic', () => {
  it('reproduces the published illustrative comparison', () => {
    expect(assessTaskCost(exampleA)).toMatchObject({
      total: 3,
      perSuccess: 0.075,
      perAttempt: 0.03,
      completionRate: 0.4,
    });
    expect(assessTaskCost(exampleB).perSuccess).toBeCloseTo(5 / 90);
  });
  it('includes paid review across all attempts', () => {
    expect(
      assessTaskCost({ ...exampleA, reviewMinutes: 30, hourlyCost: 60 }),
    ).toMatchObject({ human: 30, total: 33, perSuccess: 0.825 });
  });
  it('keeps zero successes distinct from zero cost', () => {
    expect(assessTaskCost({ ...exampleA, succeeded: 0 }).perSuccess).toBeNull();
    expect(assessTaskCost({ ...exampleA, model: 0, tools: 0 }).perSuccess).toBe(
      0,
    );
  });
  it.each([
    { attempted: 0 },
    { attempted: 1.5 },
    { succeeded: 101 },
    { succeeded: -1 },
    { succeeded: 0.1 },
    { model: NaN },
    { tools: Infinity },
    { infrastructure: -1 },
    { reviewMinutes: 60, hourlyCost: 0 },
    { hourlyCost: 1e13 },
  ])('rejects invalid inputs %j', (change) => {
    expect(() => assessTaskCost({ ...exampleA, ...change })).toThrow();
  });
  it('does not treat blank fields as zero or tiny positive costs as free', () => {
    expect(parseCostValue(' ')).toBeNaN();
    expect(parseCostValue('0')).toBe(0);
    expect(formatCost(0.000001)).toBe('< $0.0001');
  });
});
