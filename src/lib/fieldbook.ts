export const scenarioIds = [
  'duplicate-action',
  'forgotten-instruction',
  'premature-done',
] as const;
export type FieldbookScenario = {
  id: (typeof scenarioIds)[number];
  revision: 1;
};

export function simulationLink(
  scenario: FieldbookScenario,
  variant: 'baseline' | 'repaired',
) {
  return `/agent-explainer/#/experiment/${scenario.id}/${scenario.revision}/${variant}/0`;
}
