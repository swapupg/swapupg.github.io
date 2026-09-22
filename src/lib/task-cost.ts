export interface TaskCostInput {
  attempted: number;
  succeeded: number;
  model: number;
  tools: number;
  infrastructure: number;
  reviewMinutes: number;
  hourlyCost: number;
}

export const exampleA: TaskCostInput = {
  attempted: 100,
  succeeded: 40,
  model: 2,
  tools: 1,
  infrastructure: 0,
  reviewMinutes: 0,
  hourlyCost: 0,
};
export const exampleB: TaskCostInput = {
  attempted: 100,
  succeeded: 90,
  model: 4,
  tools: 1,
  infrastructure: 0,
  reviewMinutes: 0,
  hourlyCost: 0,
};

export function assessTaskCost(input: TaskCostInput) {
  for (const [field, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0 || value > 1e12)
      throw new Error(
        `Enter a finite, non-negative value no greater than 1 trillion for ${field}.`,
      );
  }
  if (!Number.isSafeInteger(input.attempted) || input.attempted < 1)
    throw new Error('Attempted tasks must be a positive whole number.');
  if (
    !Number.isSafeInteger(input.succeeded) ||
    input.succeeded > input.attempted
  )
    throw new Error(
      'Successful tasks must be a whole number from zero to attempted tasks.',
    );
  if (input.reviewMinutes > 0 && input.hourlyCost === 0)
    throw new Error(
      'Enter a positive hourly cost when review time is included.',
    );
  const human = (input.reviewMinutes * input.hourlyCost) / 60;
  const total = input.model + input.tools + input.infrastructure + human;
  return {
    human,
    total,
    completionRate: input.succeeded / input.attempted,
    perAttempt: total / input.attempted,
    perSuccess: input.succeeded === 0 ? null : total / input.succeeded,
  };
}

export function parseCostValue(raw: string): number {
  return raw.trim() === '' ? Number.NaN : Number(raw);
}

export function formatCost(value: number): string {
  if (value > 0 && value < 0.0001) return '< $0.0001';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}
