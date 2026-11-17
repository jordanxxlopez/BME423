// Min-max scaling (Session 23): the feature's summary values on its raw axis, the range as a bracket, then each value
// dropped onto a 0-to-1 axis drawn under the raw one (0 under the minimum, 1 under the maximum).
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Axis, Dot, Txt, lin, nice, ramp} from './_kit';
import {f5} from './_s23';

const S23Scaling: VizC = ({c, k, t}) => {
  const v = c.values || {}; const steps = c.steps; const n = steps.length;
  const mn = Number(v.min), mx = Number(v.max), R = mx - mn; const sc = (x: number) => (x - mn) / R;
  const rows: any[][] = (c.table?.rows || []).filter(r => Number.isFinite(Number(r[1])));
  const feat = String(c.table?.headers?.[1] || 'x');
  const at0 = (s: number, j = 0) => workAt(steps[s].general.length, j);
  const first = (re: RegExp) => { const i = steps.findIndex(s => re.test(s.title)); return i < 0 ? Infinity : i; };
  const prog = (idx: number, j = 0, dt = 0.9) => (k > idx ? 1 : k === idx ? ramp(t, at0(idx, j), at0(idx, j) + dt) : 0);
  const mmIdx = first(/minimum and maximum/i), rIdx = first(/range/i), meanIdx = first(/normalize the mean/i), medIdx = first(/median/i);
  const pMM = k < 0 ? 0 : prog(mmIdx), pR = prog(rIdx), pMean = prog(meanIdx), pMed = prog(medIdx, 0), pMax = prog(medIdx, Math.min(1, (steps[medIdx]?.work.length || 1) - 1));
  const lo = Math.floor(mn / 5) * 5; const ticks = nice(lo, mx, 5); const hi = ticks[ticks.length - 1] < mx ? ticks[ticks.length - 1] + (ticks[1] - ticks[0]) : ticks[ticks.length - 1];
  const X = lin(lo, hi, 36, 364); const S = (s: number) => X(mn) + s * (X(mx) - X(mn));
  const yr = 140, ys = 360;
  const lab = (r: any[]) => String(r[0]).replace(/\.$/, '').toLowerCase();
  const tier: Record<string, {y: number; a: 'start' | 'middle' | 'end'; dx: number}> = {
    min: {y: yr - 30, a: 'middle', dx: 0}, max: {y: yr - 30, a: 'middle', dx: 0}, median: {y: yr - 74, a: 'end', dx: 3}, mean: {y: yr - 52, a: 'start', dx: -3}};
  const mapped: {x: number; s: number; p: number; col: string; side: 'start' | 'end' | null}[] = [
    {x: Number(v.mean), s: Number(v.scaledMean ?? sc(v.mean)), p: pMean, col: P.blue, side: 'start' as const},
    {x: Number(v.median), s: Number(v.scaledMedian ?? sc(v.median)), p: pMed, col: P.group[1], side: 'end' as const},
    {x: mx, s: 1, p: pMax, col: P.green, side: null},
    {x: mn, s: 0, p: pMax, col: P.green, side: null},
  ];
  return (<g fontFamily={inter}>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>{feat}</Txt>
    <Axis X={X} y={yr} ticks={[lo, ...ticks.filter(x => x > lo), ...(hi > ticks[ticks.length - 1] ? [hi] : [])]} label="raw value" />
    {rows.map((r, i) => { const x = Number(r[1]); const name = lab(r); const tr = tier[name]; const key = name === 'min' || name === 'max';
      return (<g key={i}>
        <Dot x={X(x)} y={yr - 10} r={key ? 6 : 4} color={key && pMM > 0 ? P.red : P.soft} />
        {tr && <Txt x={X(x) + tr.dx} y={tr.y} size={14} anchor={tr.a} weight={key ? 700 : 400} color={key ? (pMM > 0 ? P.red : P.ink) : P.soft}>{`${name} ${x}`}</Txt>}
      </g>); })}
    {pMM > 0 && <circle cx={X(mn)} cy={yr - 10} r={11} fill="none" stroke={P.red} strokeWidth={2} opacity={pMM} />}
    {pMM > 0 && <circle cx={X(mx)} cy={yr - 10} r={11} fill="none" stroke={P.red} strokeWidth={2} opacity={pMM} />}
    {pR > 0 && <g opacity={pR}>
      <path d={`M${X(mn)},${yr + 50} L${X(mn)},${yr + 60} L${X(mn) + (X(mx) - X(mn)) * pR},${yr + 60} L${X(mn) + (X(mx) - X(mn)) * pR},${yr + 50}`} fill="none" stroke={P.red} strokeWidth={3} />
      <Txt x={(X(mn) + X(mx)) / 2} y={yr + 82} size={15} weight={700} anchor="middle" color={P.red}>{`range ${f5(R)}`}</Txt>
    </g>}
    {(pMean > 0 || k >= n) && <g>
      <Axis X={S} y={ys} ticks={[0, 0.25, 0.5, 0.75, 1]} label="scaled (0 to 1)" />
      {/* x − min for the mean, as a bar from the minimum */}
      <rect x={X(mn)} y={yr + 100} width={(X(Number(v.mean)) - X(mn)) * pMean} height={12} rx={3} fill={P.blue} opacity={0.6} />
      <Txt x={X(Number(v.mean)) + 8} y={yr + 111} size={14} weight={700} color={P.blue} opacity={pMean}>{`${f5(Number(v.mean) - mn)}`}</Txt>
    </g>}
    {mapped.map((m, i) => { if (m.p <= 0) return null; const x = X(m.x), y1 = yr + 46, y2 = ys - 8;
      return (<g key={i}>
        <line x1={x} x2={x} y1={y1} y2={y1 + (y2 - y1) * m.p} stroke={m.col} strokeWidth={2} strokeDasharray="5 4" />
        {m.p > 0.98 && <Dot x={S(m.s)} y={ys - 8} r={6} color={m.col} />}
        {m.p > 0.98 && m.side && <Txt x={S(m.s) + (m.side === 'start' ? 8 : -8)} y={ys - 18} size={14} weight={700} anchor={m.side} color={m.col}>{f5(m.s)}</Txt>}
      </g>); })}
    {k >= 0 && k < n && /normalize/i.test(steps[k].title) && <Txt x={200} y={ys + 76} size={15} anchor="middle" color={P.soft}>{`(x − ${mn}) / ${f5(R)}`}</Txt>}
  </g>);
};

export default S23Scaling;
