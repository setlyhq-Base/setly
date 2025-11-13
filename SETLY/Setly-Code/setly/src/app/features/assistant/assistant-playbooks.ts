export interface PlaybookConfig {
  key: string;
  icon: string; // tailwind-compatible icon name or emoji for MVP
  title: string;
  benefit: string;
}

export const PLAYBOOKS: PlaybookConfig[] = [
  { key: 'housing', icon: '🏠', title: 'Find housing', benefit: 'Curated rooms by students' },
  { key: 'airport', icon: '✈️', title: 'Airport pickup', benefit: 'Peer or Uber in 2 taps' },
  { key: 'sim', icon: '📶', title: 'Get a US SIM', benefit: 'Plans that work day 1' },
  { key: 'bank', icon: '🏦', title: 'Open a bank account', benefit: 'Docs & branches nearby' },
  { key: 'ssn', icon: '🆔', title: 'Documents for SSN', benefit: 'Step-by-step checklist' }
];
