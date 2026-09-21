export const identity = {
  name: 'Swapnil Upganlawar',
  headline: 'AI agents, beyond the demo.',
  description:
    'Open-source experiments and practical analysis on agent reliability, evaluation, and the cost of getting useful work done.',
  philosophy: 'Building with AI. Sharing what holds up.',
};

export function attribution(automated = false) {
  return automated
    ? 'Model Fieldnotes · Automated briefing'
    : `By ${identity.name}`;
}

// Include the collection so future notes cannot overwrite a Fieldbook share card.
export function socialCardPath(collection: string, id: string) {
  return `/assets/social-${collection}-${id}.png`;
}
