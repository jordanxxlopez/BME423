import {BFPS as FPS} from './theme';
export type BStep = {title: string; general: string[]; work: string[]; words: string; lookup: any};
export type BCase = {id: string; title: string; topic: string; session: number; context: string; unit?: string; table?: any; tasks?: string[];
  hypotheses?: any; symbols?: string; conclusion: string; values?: any; steps: BStep[]};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
// Seconds per video step: the question, every worked step, then the conclusion.
export const stepSeconds = (c: BCase, cap: (k: string) => string) => [
  clamp(4 + cap('intro').length / 16, 8, 16),
  ...c.steps.map((s, k) => clamp(3 + 1.0 * s.general.length + 1.5 * s.work.length + cap(String(k)).length / 17 + (s.lookup ? 2.5 : 0), 7, 24)),
  clamp(4 + cap('end').length / 16, 8, 16),
];
export const frames = (secs: number[]) => { const starts: number[] = []; let t = 0; for (const s of secs) { starts.push(t); t += Math.round(s * FPS); } return {starts, total: t}; };
// Line reveal times inside a step (seconds from the step start).
export const generalAt = (i: number) => 0.5 + 0.7 * i;
export const workAt = (G: number, i: number) => 0.9 + 0.7 * G + 1.4 * i;
