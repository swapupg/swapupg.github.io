export const identity = {
  name: 'Swapnil Upganlawar',
  headline: 'AI agents, beyond the demo.',
  description:
    'Open-source experiments and practical analysis on agent reliability, evaluation, and the cost of getting useful work done.',
  thesis:
    'The next phase of AI will be judged by the useful work it can reliably complete—and the economics of delivering it.',
  introduction:
    'I explore what this means for products, engineering teams, and business decisions, drawing on two decades across research, entrepreneurship, and enterprise AI.',
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
