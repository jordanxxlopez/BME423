// Session 23 helpers: the two-class confusion matrix panel shared by s23confusion and s23sensspec.
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Txt, ramp} from './_kit';

export const f5 = (v: number) => String(+(+v).toFixed(5));
export const n0 = (v: number) => Number(v).toLocaleString('en-US');
export const textW = (s: string, size = 14) => s.length * size * 0.58;
export const sig = (s: number) => 1 / (1 + Math.exp(-s));
export const mi = (s: string) => s.replace(/^-/, '−');

type Cell = 'TN' | 'FP' | 'FN' | 'TP';
type Metric = {key: string; label: string; v: number; cells: Cell[]};
// What each worked step computes, from its title. Steps that compute nothing return [].
const metricsOf = (title: string, v: any): Metric[] => {
  const t = title.toLowerCase(); const pre = /always-no/.test(t) ? 'always-no ' : '';
  if (/from the counts/.test(t)) return [{key: 'acc0', label: 'accuracy', v: v.accuracy, cells: []}, {key: 'err0', label: 'error rate', v: v.errorRate, cells: []}];
  const out: Metric[] = [];
  if (/accuracy/.test(t)) out.push({key: pre + 'acc', label: pre + 'accuracy', v: (v.TP + v.TN) / v.n, cells: ['TN', 'TP']});
  if (/error rate/.test(t)) out.push({key: 'err', label: 'error rate', v: (v.FP + v.FN) / v.n, cells: ['FP', 'FN']});
  if (/sensitivity/.test(t)) out.push({key: pre + 'sens', label: pre + 'sensitivity', v: v.TP / (v.TP + v.FN), cells: ['FN', 'TP']});
  if (/specificity/.test(t)) out.push({key: 'spec', label: 'specificity', v: v.TN / (v.TN + v.FP), cells: ['TN', 'FP']});
  return out;
};

// Confusion matrix from the case table (rows actual, columns predicted; row 0 negative, row 1 positive),
// cells named once a "cells" step is reached, the cells a step uses highlighted, and every rate so far as a bar.
export const ConfusionViz: VizC = ({c, k, t}) => {
  if (k < 0) return null;
  const v = c.values || {}; const rows: any[][] = c.table.rows; const hd: string[] = c.table.headers; const steps = c.steps; const n = steps.length;
  const cnt: Record<Cell, number> = {TN: Number(rows[0][1]), FP: Number(rows[0][2]), FN: Number(rows[1][1]), TP: Number(rows[1][2])};
  const negName = String(rows[0][0]), posName = String(rows[1][0]);
  const at = (s: number, j = 0) => workAt(steps[s].general.length, j);
  const st = k < n ? steps[k] : null;
  // all rates up to this step, each with the time it appears
  const shown: {m: Metric; a: number; s: number}[] = [];
  for (let s = 0; s <= Math.min(k, n - 1); s++) metricsOf(steps[s].title, v).forEach((m, j) => {
    const lines = steps[s].work.length; const jj = Math.min(j, lines - 1);
    shown.push({m, s, a: s < k ? 1 : ramp(t, at(s, jj), at(s, jj) + 0.8)}); });
  const cellsIdx = steps.findIndex(s => /cells/i.test(s.title));
  const named = cellsIdx < 0 ? 1 : k > cellsIdx ? 1 : k === cellsIdx ? ramp(t, at(k), at(k) + 0.8) : 0;
  const now = st ? metricsOf(st.title, v) : [];
  // the "from the counts" step is about a different classifier, so it shows a strip of n cases instead of the matrix
  if (st && /from the counts/i.test(st.title)) {
    const ok = Math.round(v.accuracy * v.n), bad = Math.round(v.errorRate * v.n); const p = ramp(t, 0.6, 1.8);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>All cases</Txt>
      <Txt x={20} y={64} size={15} color={P.soft}>{`n = ${n0(v.n)}`}</Txt>
      <rect x={20} y={84} width={360 * p} height={34} rx={4} fill={P.green} opacity={0.75} />
      <rect x={376} y={84} width={4} height={34} fill={P.red} opacity={p} />
      <Txt x={20} y={146} size={15} weight={700} color={P.green} opacity={p}>{`${n0(ok)} correct`}</Txt>
      <Txt x={380} y={146} size={15} weight={700} color={P.red} anchor="end" opacity={p}>{`${n0(bad)} wrong`}</Txt>
      <Bars shown={shown} y0={200} />
    </g>);
  }
  const x0 = 140, y0 = 74, cw = 116, ch = 92, g = 8;
  const pos: Record<Cell, [number, number]> = {TN: [0, 0], FP: [0, 1], FN: [1, 0], TP: [1, 1]};
  const hiCells = new Set(now.flatMap(m => m.cells)); const hiA = now.length ? ramp(t, at(k), at(k) + 0.8) : 0;
  const colName = (i: number) => String(hd[i]);
  return (<g fontFamily={inter}>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Confusion matrix</Txt>
    <Txt x={x0 + cw + g / 2} y={52} size={13} color={P.soft} anchor="middle">predicted</Txt>
    <Txt x={x0 + cw / 2} y={y0 - 8} size={14} weight={700} anchor="middle">{colName(1)}</Txt>
    <Txt x={x0 + cw * 1.5 + g} y={y0 - 8} size={14} weight={700} anchor="middle">{colName(2)}</Txt>
    <text x={24} y={y0 + ch + g / 2} fontSize={13} fill={P.soft} textAnchor="middle" fontFamily={inter} transform={`rotate(-90 24 ${y0 + ch + g / 2})`}>actual</text>
    <Txt x={x0 - 8} y={y0 + ch / 2 + 5} size={14} weight={700} anchor="end">{negName}</Txt>
    <Txt x={x0 - 8} y={y0 + ch * 1.5 + g + 5} size={14} weight={700} anchor="end">{posName}</Txt>
    {(Object.keys(pos) as Cell[]).map(key => { const [r, cc] = pos[key]; const x = x0 + cc * (cw + g), y = y0 + r * (ch + g); const ok = key === 'TN' || key === 'TP';
      const col = ok ? P.green : P.red; const hi = hiCells.has(key) ? hiA : 0; const dim = now.length && !hiCells.has(key) ? 1 - 0.55 * hiA : 1;
      return (<g key={key} opacity={dim}>
        <rect x={x} y={y} width={cw} height={ch} rx={8} fill={ok ? 'rgba(31,138,76,0.07)' : 'rgba(200,55,45,0.06)'} stroke={P.line} strokeWidth={1.5} />
        {hi > 0 && <rect x={x + 2} y={y + 2} width={cw - 4} height={ch - 4} rx={7} fill={P.hi} opacity={hi} />}
        <Txt x={x + cw / 2} y={y + ch / 2 + 6} size={20} weight={700} anchor="middle" color={cnt[key] ? col : P.faint}>{n0(cnt[key])}</Txt>
        <Txt x={x + cw - 8} y={y + ch - 9} size={14} weight={700} anchor="end" color={col} opacity={named}>{key}</Txt>
      </g>); })}
    <Bars shown={shown} y0={y0 + 2 * ch + g + 46} />
  </g>);
};

// Each rate as a bar from 0 to 1 with its value, newest at the bottom.
const Bars: React.FC<{shown: {m: Metric; a: number}[]; y0: number}> = ({shown, y0}) => {
  const bx0 = 190, bw = 120; const list = shown.slice(-4);
  return (<g>
    {list.length > 0 && <Txt x={bx0} y={y0 - 12} size={12} color={P.faint}>0</Txt>}
    {list.length > 0 && <Txt x={bx0 + bw} y={y0 - 12} size={12} color={P.faint} anchor="middle">1</Txt>}
    {list.map(({m, a}, j) => { const y = y0 + j * 34; const col = /error/.test(m.key) ? P.red : /sens/.test(m.key) ? P.blue : /spec/.test(m.key) ? P.group[2] : P.green;
      return (<g key={m.key + j} opacity={a}>
        <Txt x={20} y={y + 5} size={14} weight={600} color={col}>{m.label}</Txt>
        <rect x={bx0} y={y - 9} width={bw} height={18} rx={4} fill="none" stroke={P.line} />
        <rect x={bx0} y={y - 9} width={Math.max(m.v > 0 ? 2 : 0, bw * m.v * a)} height={18} rx={4} fill={col} opacity={0.75} />
        <Txt x={bx0 + bw + 8} y={y + 5} size={15} weight={700} color={col}>{f5(m.v)}</Txt>
      </g>); })}
  </g>);
};
