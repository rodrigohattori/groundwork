import { useEffect } from 'react';
import { useLocalState } from './kit';
import { aiThemes, type AITheme } from './data';

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
  kind: 'review' | 'priority' | 'flag' | 'run';
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

export interface RealRunTheme {
  id: string;
  title: string;
  summary: string;
  citations: string[];
  suggestion: { impact: 'high' | 'medium' | 'low'; effort: 'high' | 'medium' | 'low'; rationale: string };
}

export interface RealRun {
  id: string; // R3, R4, ... assigned by the client
  provider: string;
  model: string;
  promptVersion: string;
  params: Record<string, unknown>;
  ranAt: string;
  usage: unknown;
  validation: { themes: number; droppedCitations: number; droppedThemes: number };
  themes: RealRunTheme[];
}

export interface GWState {
  reviews: Record<string, ThemeReview>;
  decisions: Decision[];
  customThemes: CustomTheme[];
  realRuns: RealRun[];
}

export const emptyState: GWState = { reviews: {}, decisions: [], customThemes: [], realRuns: [] };

// States persisted before realRuns existed need the field backfilled.
function normalize(s: GWState): GWState {
  return Array.isArray(s?.realRuns) ? s : { ...emptyState, ...s, realRuns: [] };
}

export interface ListedTheme {
  theme: AITheme;
  provenance: 'ai' | 'human' | 'real';
  runLabel: string;
}

// The queue, badge, priorities and merge candidates all read this one list:
// run R1 (simulated), real runs, then reviewer-added themes.
export function listAllThemes(state: GWState): ListedTheme[] {
  return [
    ...aiThemes.map((t) => ({ theme: t, provenance: 'ai' as const, runLabel: 'Simulated run R1' })),
    ...(state.realRuns ?? []).flatMap((r) =>
      r.themes.map((t) => ({
        theme: { ...t, goldMatch: null, suggestion: t.suggestion },
        provenance: 'real' as const,
        runLabel: `Real run ${r.id} · ${r.model}`,
      }))),
    ...state.customThemes.map((t) => ({
      theme: { ...t, goldMatch: null, suggestion: { impact: 'medium' as const, effort: 'medium' as const, rationale: 'Added by the reviewer from uncited feedback; no AI suggestion.' } },
      provenance: 'human' as const,
      runLabel: 'Added by reviewer',
    })),
  ];
}

// Module-level mini-store: every mutation computes from the latest state and
// re-renders every mounted consumer, so rapid consecutive actions never lose
// updates. useLocalState underneath persists the same value on this device.
let cache: GWState | null = null;
const setters = new Set<(s: GWState) => void>();

export function useGW() {
  const [stored, setStored, saved] = useLocalState('groundwork-review.v1', emptyState);
  if (cache === null) cache = normalize(stored);
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
