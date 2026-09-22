import { signed, visible } from './content.ts';

export function leadershipNotes<
  T extends {
    id: string;
    data: {
      status: string;
      published: Date;
      authorship: string;
      topics: string[];
    };
  },
>(entries: T[], now = new Date()): T[] {
  return signed(visible(entries, now)).filter((entry) =>
    entry.data.topics.includes('Leadership'),
  );
}

interface Reading {
  title: string;
  publisher: string;
  date: string;
  url: string;
  evidence: string;
  access: string;
}

// Access describes what was actually inspected, not a publisher endorsement.
export const leadershipReadings: readonly Reading[] = [
  {
    title: 'How AI Is Redefining Managerial Roles',
    publisher: 'Harvard Business Review',
    date: 'July–August 2025',
    url: 'https://hbr.org/2025/07/how-ai-is-redefining-managerial-roles',
    evidence: 'Reading suggestion',
    access:
      'Public preview reviewed. Full article not reviewed; no full-article summary is offered here.',
  },
  {
    title: 'Managers and effective AI use',
    publisher: 'Gartner',
    date: '4 March 2026',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2026-3-4-gartner-hr-survey-reveals-45-percent-of-managers-report-ai-has-lived-up-to-their-expectations',
    evidence: 'Survey reporting',
    access:
      'Public newsroom release reviewed. Underlying client-only research not reviewed.',
  },
  {
    title: 'Generative AI and software engineering leadership',
    publisher: 'Gartner',
    date: '8 May 2025',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-08-generative-ai-is-redefining-the-role-of-software-engineering-leaders',
    evidence: 'Analyst guidance and forecasts',
    access:
      'Public Q&A reviewed. Forecasts are distinguished from observed results.',
  },
  {
    title: 'Generative AI at Work',
    publisher: 'The Quarterly Journal of Economics',
    date: 'Published version · 2025',
    url: 'https://danielle-li.github.io/assets/docs/GenerativeAIatWork.pdf',
    evidence: 'Workplace rollout study',
    access:
      'Author-hosted published paper reviewed. Findings are author-reported, not reproduced here.',
  },
  {
    title: 'The Cybernetic Teammate',
    publisher: 'Organization Science',
    date: 'Published online · 12 June 2026',
    url: 'https://pubsonline.informs.org/doi/pdf/10.1287/orsc.2025.20702',
    evidence: 'Randomized field experiment',
    access:
      'Published open-access paper reviewed. Findings are author-reported, not reproduced here.',
  },
  {
    title: 'Strategic trends in software engineering',
    publisher: 'Gartner',
    date: '1 July 2025',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2025-07-01-gartner-identifies-the-top-strategic-trends-in-software-engineering-for-2025-and-beyond',
    evidence: 'Analyst guidance and forecasts',
    access:
      'Public newsroom release reviewed. Underlying client-only research not reviewed.',
  },
  {
    title: 'AI Risk Management Framework 1.0',
    publisher: 'NIST',
    date: 'January 2023',
    url: 'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf',
    evidence: 'Voluntary framework',
    access:
      'GOVERN responsibilities and oversight sections reviewed; not a study of team effectiveness.',
  },
];
