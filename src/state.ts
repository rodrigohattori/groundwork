import { useEffect } from 'react';
import { useLocalState } from './kit';

export type ThemeStatus = 'pending' | 'approved' | 'rejected';

export interface ThemeReview {
  status: ThemeStatus;
  reason?: string;
  mergedInto?: string;
  title?: string;
  summary?: string;
  flagged: string[]; // citation item ids the reviewer marked as misplaced
}

export interface Decision {
  ts: string;
  kind: 'review' | 'priority' | 'flag';
  target: string;
  action: string;
  reason: string;
}

export interface CustomTheme {
  id: string;
  title: string;
  summary: string;
  citations: string[];
}

export interface GWState {
  reviews: Record<string, ThemeReview>;
  decisions: Decision[];
  customThemes: CustomTheme[];
}

export const emptyState: GWState = { reviews: {}, decisions: [], customThemes: [] };

// Module-level mini-store: every mutation computes from the latest state and
// re-renders every mounted consumer, so rapid consecutive actions never lose
// updates. useLocalState underneath persists the same value on this device.
let cache: GWState | null = null;
const setters = new Set<(s: GWState) => void>();

export function useGW() {
  const [stored, setStored, saved] = useLocalState('groundwork-review.v1', emptyState);
  if (cache === null) cache = stored;
  useEffect(() => {
    setters.add(setStored);
    return () => { setters.delete(setStored); };
  }, [setStored]);

  const state = cache as GWState;

  const mutate = (fn: (s: GWState) => GWState) => {
    cache = fn(cache as GWState);
    setters.forEach((set) => set(cache as GWState));
  };

  const reviewFor = (id: string): ThemeReview => state.reviews[id] ?? { status: 'pending', flagged: [] };

  const log = (d: Omit<Decision, 'ts'>, s: GWState): GWState => ({
    ...s,
    decisions: [...s.decisions, { ...d, ts: new Date().toISOString() }],
  });

  return { state, mutate, saved, reviewFor, log };
}
