import { limits, pricing, type Kind } from './policy.ts';
export interface Charge {
  id: string;
  run: string;
  kind: Kind;
  month: string;
  reserved: number;
  actual?: number;
  status: 'reserved' | 'settled';
}
export interface EditionRecord {
  status:
    'running' | 'skipped' | 'review' | 'published' | 'failed' | 'candidate';
  at: string;
  sourceIds?: string[];
  url?: string;
  commit?: string;
  reason?: string;
}
export interface State {
  version: 1;
  charges: Charge[];
  editions: Record<string, EditionRecord>;
}
export const emptyState = (): State => ({
  version: 1,
  charges: [],
  editions: {},
});
const ceil = (n: number) => Math.ceil(n * 1e6) / 1e6;
export function estimate(
  inputBytes: number,
  maxOutput: number,
  date: string,
): number {
  if (date > pricing.validUntil)
    throw new Error('Pricing verification expired; paid calls paused');
  if (inputBytes > 180000 || maxOutput > 12000)
    throw new Error('Context exceeds verified standard-tier envelope');
  // UTF-8 bytes bound text tokens conservatively; fixed overhead covers instructions/schema framing.
  return ceil(
    ((inputBytes + 8192) * pricing.input + maxOutput * pricing.output) / 1e6,
  );
}
export function reserve(state: State, charge: Omit<Charge, 'status'>): Charge {
  if (state.charges.some((c) => c.id === charge.id))
    throw new Error('Call already reserved; do not retry uncertain charges');
  const cost = (c: Charge) => c.actual ?? c.reserved;
  const total = (filter: (c: Charge) => boolean) =>
    state.charges.filter(filter).reduce((n, c) => n + cost(c), 0) +
    charge.reserved;
  if (charge.reserved <= 0 || !Number.isFinite(charge.reserved))
    throw new Error('Invalid reservation');
  if (
    total((c) => c.month === charge.month) > limits.month ||
    total((c) => c.month === charge.month && c.kind === charge.kind) >
      limits.category[charge.kind] ||
    total((c) => c.run === charge.run) > limits.run[charge.kind]
  )
    throw new Error('Budget stop: no paid call was made');
  const entry: Charge = { ...charge, status: 'reserved' };
  state.charges.push(entry);
  return entry;
}
export function settle(
  charge: Charge,
  usage: { input_tokens: number; output_tokens: number },
) {
  if (
    ![usage.input_tokens, usage.output_tokens].every(
      (n) => Number.isSafeInteger(n) && n >= 0,
    )
  )
    throw new Error('Unknown usage; reservation retained');
  const actual = ceil(
    (usage.input_tokens * pricing.input +
      usage.output_tokens * pricing.output) /
      1e6,
  );
  if (actual > charge.reserved)
    throw new Error('Usage exceeds reservation; stop and reconcile manually');
  charge.actual = actual;
  charge.status = 'settled';
}

export function validateState(state: State) {
  if (state.version !== 1 || !Array.isArray(state.charges) || !state.editions)
    throw new Error('Unknown state version');
  const ids = new Set<string>();
  for (const c of state.charges) {
    if (
      !c.id ||
      ids.has(c.id) ||
      !c.run ||
      !['daily', 'research', 'build'].includes(c.kind) ||
      !/^\d{4}-\d{2}$/.test(c.month) ||
      !Number.isFinite(c.reserved) ||
      c.reserved < 0 ||
      (c.actual !== undefined &&
        (!Number.isFinite(c.actual) ||
          c.actual < 0 ||
          c.actual > c.reserved)) ||
      !['reserved', 'settled'].includes(c.status) ||
      (c.status === 'settled' && c.actual === undefined)
    )
      throw new Error('Invalid spending ledger; paid calls blocked');
    ids.add(c.id);
  }
}
