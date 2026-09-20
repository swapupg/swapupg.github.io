import { afterEach, expect, it, vi } from 'vitest';
import { z } from 'astro/zod';
import { generate } from '../../automation/provider';
import { emptyState } from '../../automation/budget';
import { localDate, model } from '../../automation/policy';
import type { StateStore } from '../../automation/github';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
function setup(save = vi.fn(async () => {})) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-20T12:00:00Z'));
  vi.stubEnv('OPENAI_API_KEY', 'unit-test-placeholder');
  return { state: emptyState(), save } as unknown as StateStore;
}
it('persists the reservation before the API and settles before parsing', async () => {
  const store = setup(),
    events: string[] = [];
  vi.spyOn(store, 'save').mockImplementation(async () => {
    events.push('save');
  });
  const fetch = vi.fn(async () => {
    events.push('paid-call');
    expect(store.state.charges[0].status).toBe('reserved');
    return new Response(
      JSON.stringify({
        model,
        status: 'completed',
        usage: { input_tokens: 100, output_tokens: 10 },
        output: [{ content: [{ type: 'output_text', text: '{"ok":true}' }] }],
      }),
    );
  });
  vi.stubGlobal('fetch', fetch);
  expect(
    await generate(
      store,
      'daily',
      localDate(),
      z.object({ ok: z.boolean() }),
      'Check',
      { text: 'source' },
      100,
    ),
  ).toEqual({ ok: true });
  expect(events).toEqual(['save', 'paid-call', 'save']);
  expect(store.state.charges[0].status).toBe('settled');
});
it('never makes a paid call when durable reservation fails', async () => {
  const store = setup(
      vi.fn(async () => {
        throw new Error('state conflict');
      }),
    ),
    fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  await expect(
    generate(
      store,
      'daily',
      localDate(),
      z.object({ ok: z.boolean() }),
      'Check',
      {},
      100,
    ),
  ).rejects.toThrow('state conflict');
  expect(fetch).not.toHaveBeenCalled();
});
it('retains unknown charges and does not retry network errors', async () => {
  const store = setup(),
    fetch = vi.fn(async () => {
      throw new Error('connection lost');
    });
  vi.stubGlobal('fetch', fetch);
  await expect(
    generate(
      store,
      'daily',
      localDate(),
      z.object({ ok: z.boolean() }),
      'Check',
      {},
      100,
    ),
  ).rejects.toThrow('connection lost');
  expect(fetch).toHaveBeenCalledOnce();
  expect(store.state.charges[0].status).toBe('reserved');
});
it('rejects incomplete responses even with known billing', async () => {
  const store = setup();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            model,
            status: 'incomplete',
            usage: { input_tokens: 1, output_tokens: 1 },
            output: [],
          }),
        ),
    ),
  );
  await expect(
    generate(
      store,
      'daily',
      localDate(),
      z.object({ ok: z.boolean() }),
      'Check',
      {},
      100,
    ),
  ).rejects.toThrow('Incomplete');
  expect(store.state.charges[0].status).toBe('settled');
});

it('reports an authentication failure without exposing credential fragments', async () => {
  const store = setup();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            error: {
              code: 'invalid_api_key',
              message: 'secret-fragment-must-not-appear',
            },
          }),
          { status: 401 },
        ),
    ),
  );
  try {
    await generate(
      store,
      'daily',
      localDate(),
      z.object({ ok: z.boolean() }),
      'Check',
      {},
      100,
    );
    throw new Error('Expected authentication failure');
  } catch (error) {
    expect(String(error)).toContain('401 (invalid_api_key)');
    expect(String(error)).not.toContain('secret-fragment');
  }
  expect(store.state.charges[0].status).toBe('reserved');
});
