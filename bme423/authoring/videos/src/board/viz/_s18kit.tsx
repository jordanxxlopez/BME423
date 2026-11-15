// Session 18 helpers (regression and correlation). Files starting with "_" are not registered as visuals.
import React from 'react';
import {P, inter} from '../theme';
import {Txt, lin, nice, ramp} from './_kit';

// Number to a short label: up to d decimals, true minus sign.
export const f = (z: number, d = 4) => String(+(+z).toFixed(d)).replace('-', '−');

// Subscript inside an SVG text: sub('s', 'y|x') then any trailing text.
export const sub = (base: string, s: string, rest = '') => (<>
  <tspan>{base}</tspan><tspan dy={4} fontSize="0.72em">{s}</tspan><tspan dy={-4}>{rest}</tspan></>);

// A plain horizontal number line with ticks.
export const NumLine: React.FC<{X: (v: number) => number; y: number; lo: number; hi: number; n?: number; label?: string}> = ({X, y, lo, hi, n = 5, label}) => {
  const ticks = nice(lo, hi, n);
  return (<g fontFamily={inter}>
    <line x1={X(lo)} x2={X(hi)} y1={y} y2={y} stroke={P.faint} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={X(t)} x2={X(t)} y1={y} y2={y + 5} stroke={P.faint} />
      <text x={X(t)} y={y + 20} fontSize={14} fill={P.soft} textAnchor="middle">{f(t, 3)}</text></g>)}
    {label && <text x={(X(lo) + X(hi)) / 2} y={y + 40} fontSize={13} fill={P.soft} textAnchor="middle">{label}</text>}
  </g>);
};

// Scatter-plot frame: returns scales and draws the axes.
export const frame = (xlo: number, xhi: number, ylo: number, yhi: number, box = {l: 66, r: 380, t: 76, b: 380}) => {
  const xt = nice(xlo, xhi, 5), yt = nice(ylo, yhi, 5);
  const x0 = Math.min(xlo, xt[0]), x1 = Math.max(xhi, xt[xt.length - 1]);
  const y0 = Math.min(ylo, yt[0]), y1 = Math.max(yhi, yt[yt.length - 1]);
  return {X: lin(x0, x1, box.l, box.r), Y: lin(y0, y1, box.b, box.t), xt, yt, x0, x1, y0, y1, box};
};

export const Axes: React.FC<{F: ReturnType<typeof frame>; xl: string; yl: string}> = ({F, xl, yl}) => {
  const {X, Y, xt, yt, box} = F;
  return (<g fontFamily={inter}>
    <line x1={box.l} x2={box.r} y1={box.b} y2={box.b} stroke={P.faint} strokeWidth={1.5} />
    <line x1={box.l} x2={box.l} y1={box.t} y2={box.b} stroke={P.faint} strokeWidth={1.5} />
    {xt.map(t => <g key={'x' + t}><line x1={X(t)} x2={X(t)} y1={box.b} y2={box.b + 5} stroke={P.faint} />
      <text x={X(t)} y={box.b + 20} fontSize={14} fill={P.soft} textAnchor="middle">{f(t, 2)}</text></g>)}
    {yt.map(t => <g key={'y' + t}><line x1={box.l - 5} x2={box.l} y1={Y(t)} y2={Y(t)} stroke={P.faint} />
      <text x={box.l - 8} y={Y(t) + 5} fontSize={14} fill={P.soft} textAnchor="end">{f(t, 2)}</text></g>)}
    <text x={(box.l + box.r) / 2} y={box.b + 40} fontSize={14} fill={P.soft} textAnchor="middle">{xl}</text>
    <text x={18} y={(box.t + box.b) / 2} fontSize={14} fill={P.soft} textAnchor="middle" transform={`rotate(-90 18 ${(box.t + box.b) / 2})`}>{yl}</text>
  </g>);
};

// A t axis with the observed statistic and the printed cutoffs (two-tailed: shaded beyond ±cutoff).
export const TAxis: React.FC<{y: number; t: number; cuts: {v: number; label: string}[]; pT: number; pC: number; l?: number; r?: number; df?: string; pDf?: number}> =
  ({y, t, cuts, pT, pC, l = 30, r = 370, df, pDf = 0}) => {
  const top = Math.max(Math.abs(t), ...cuts.map(c => c.v)) * 1.15;
  const sym = t < 0; const lo = sym ? -top : 0; const X = lin(lo, top, l, r);
  const c0 = cuts.length ? cuts[0].v : top;
  return (<g fontFamily={inter}>
    <g opacity={pC}>
      <rect x={X(c0)} y={y - 30} width={X(top) - X(c0)} height={30} fill={P.red} opacity={0.1} />
      {sym && <rect x={X(-top)} y={y - 30} width={X(-c0) - X(-top)} height={30} fill={P.red} opacity={0.1} />}
      {cuts.map((c, i) => <g key={i}>
        <line x1={X(c.v)} x2={X(c.v)} y1={y - 34} y2={y} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" />
        {sym && <line x1={X(-c.v)} x2={X(-c.v)} y1={y - 34} y2={y} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" />}
        <Txt x={X(c.v) + (i % 2 ? 4 : -4)} y={y - 40 - (cuts.length > 1 && i === 0 ? 0 : 0)} size={14} anchor={i % 2 ? 'start' : 'end'} color={P.red}>{c.label}</Txt>
      </g>)}
    </g>
    <line x1={l} x2={r} y1={y} y2={y} stroke={P.faint} strokeWidth={1.5} />
    {nice(lo, top, 5).map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={y} y2={y + 5} stroke={P.faint} />
      <text x={X(v)} y={y + 20} fontSize={14} fill={P.soft} textAnchor="middle">{f(v, 2)}</text></g>)}
    <g opacity={pT}>
      <line x1={X(0)} x2={X(0) + (X(t) - X(0)) * pT} y1={y - 10} y2={y - 10} stroke={P.blue} strokeWidth={4} strokeLinecap="round" />
      <circle cx={X(0) + (X(t) - X(0)) * pT} cy={y - 10} r={7} fill={P.blue} />
      <Txt x={X(t)} y={y + 42} size={16} anchor="middle" weight={700} color={P.blue}>{`t = ${f(t, 3)}`}</Txt>
    </g>
    {df && <Txt x={l} y={y + 42} size={15} color={P.soft} opacity={pDf}>{df}</Txt>}
  </g>);
};

// One coefficient on its own number line: estimate, optional ±SE bar, optional interval brackets, zero marked.
export const CoefLine: React.FC<{y: number; est: number; lo?: number; hi?: number; se?: number; pSE?: number; pCI?: number; title: string; color?: string; extra?: number[]}> =
  ({y, est, lo, hi, se, pSE = 0, pCI = 0, title, color = P.blue, extra = []}) => {
  const vals = [0, est, ...(lo !== undefined ? [lo, hi as number] : []), ...(se ? [est - 2 * se, est + 2 * se] : []), ...extra];
  const a = Math.min(...vals), b = Math.max(...vals); const pad = (b - a) * 0.12;
  const X = lin(a - pad, b + pad, 36, 364);
  return (<g fontFamily={inter}>
    <Txt x={20} y={y - 58} size={15} weight={700} color={P.ink}>{title}</Txt>
    <line x1={X(0)} x2={X(0)} y1={y - 40} y2={y + 6} stroke={P.red} strokeWidth={2} strokeDasharray="4 4" />
    {Math.abs(X(0) - X(est)) > 44 && <Txt x={X(0)} y={y - 44} size={14} anchor="middle" color={P.red}>0</Txt>}
    {se !== undefined && pSE > 0 && <line x1={X(est - se * pSE)} x2={X(est + se * pSE)} y1={y - 16} y2={y - 16} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.45} />}
    {lo !== undefined && pCI > 0 && <g opacity={pCI}>
      <rect x={X(est - (est - lo) * pCI)} width={(X(hi as number) - X(lo)) * pCI} y={y - 22} height={12} rx={6} fill={P.hi} />
      <path d={`M${X(lo) + 7},${y - 32} L${X(lo)},${y - 32} L${X(lo)},${y} L${X(lo) + 7},${y}`} fill="none" stroke={P.green} strokeWidth={3} />
      <path d={`M${X(hi as number) - 7},${y - 32} L${X(hi as number)},${y - 32} L${X(hi as number)},${y} L${X(hi as number) - 7},${y}`} fill="none" stroke={P.green} strokeWidth={3} />
    </g>}
    <circle cx={X(est)} cy={y - 16} r={6.5} fill={color} />
    <Txt x={X(est)} y={y - 30} size={15} anchor="middle" weight={700} color={color}>{f(est, 4)}</Txt>
    <line x1={36} x2={364} y1={y} y2={y} stroke={P.faint} strokeWidth={1.5} />
    {nice(a - pad, b + pad, 5).map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={y} y2={y + 5} stroke={P.faint} />
      <text x={X(v)} y={y + 20} fontSize={14} fill={P.soft} textAnchor="middle">{f(v, 3)}</text></g>)}
    {lo !== undefined && pCI > 0 && <g opacity={pCI}>
      <Txt x={X(lo)} y={y + 42} size={15} anchor="middle" color={P.green} weight={700}>{f(lo, 4)}</Txt>
      <Txt x={X(hi as number)} y={y + 42} size={15} anchor="middle" color={P.green} weight={700}>{f(hi as number, 4)}</Txt>
    </g>}
  </g>);
};

// Simple TeX (H_0:\beta=0, \beta_M\ne\beta_F) as SVG text with subscripts.
export const texLite = (s: string) => {
  const t = s.replace(/\\beta/g, 'β').replace(/\\rho/g, 'ρ').replace(/\\ne/g, ' ≠ ').replace(/=/g, ' = ').replace(/:/g, ': ').replace(/\s+/g, ' ');
  const parts = t.split(/_(\{[^}]*\}|\w)/);
  return <>{parts.map((p, i) => i % 2 ? <tspan key={i} dy={4} fontSize="0.72em">{p.replace(/[{}]/g, '')}</tspan> : <tspan key={i} dy={i ? -4 : 0}>{p}</tspan>)}</>;
};

// The case's given values as a table (for the question step).
export const TablePanel: React.FC<{c: any; t: number}> = ({c, t}) => {
  const hd: string[] = (c.table?.headers || []).map(String); const rows: any[][] = c.table?.rows || [];
  const nc = hd.length; const two = nc === 2; const rh = Math.min(44, 360 / Math.max(1, rows.length + 1));
  const colX = (j: number) => two ? (j === 0 ? 24 : 376) : j === 0 ? 24 : 170 + (j - 1) * (206 / (nc - 2)) + 0;
  const anc = (j: number) => two ? (j === 0 ? 'start' : 'end') : (j === 0 ? 'start' : 'end');
  const cell = (v: any) => typeof v === 'number' ? f(v, 4) : String(v);
  const size = nc > 3 ? 14 : 16;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>The given values</Txt>
    {hd.map((h, j) => <Txt key={j} x={colX(j)} y={76} size={14} color={P.soft} anchor={anc(j) as any} weight={600}>{h}</Txt>)}
    <line x1={20} x2={380} y1={88} y2={88} stroke={P.line} strokeWidth={1.5} />
    {rows.map((r, i) => <g key={i} opacity={ramp(t, 0.5 + i * 0.3, 1.0 + i * 0.3)}>
      {r.map((v, j) => <Txt key={j} x={colX(j)} y={88 + rh * (i + 0.75)} size={size} anchor={anc(j) as any} weight={j === 0 ? 400 : 700} color={j === 0 ? P.ink : P.ink}>{cell(v)}</Txt>)}
    </g>)}
  </g>);
};

// Hypotheses: the symbols and a small sketch of each (flat versus sloped line, or parallel versus crossing lines).
export const HypSketch: React.FC<{c: any; t: number; two?: boolean}> = ({c, t, two = false}) => {
  const h = c.hypotheses || {}; const box = (x: number, y: number, flat: boolean, p: number) => (<g opacity={p}>
    <rect x={x} y={y} width={160} height={120} rx={8} fill="#fafbfd" stroke={P.line} />
    <line x1={x + 14} x2={x + 14} y1={y + 12} y2={y + 108} stroke={P.faint} strokeWidth={1.5} />
    <line x1={x + 14} x2={x + 150} y1={y + 108} y2={y + 108} stroke={P.faint} strokeWidth={1.5} />
    {!two && <line x1={x + 22} x2={x + 146} y1={flat ? y + 60 : y + 96} y2={flat ? y + 60 : y + 24} stroke={P.blue} strokeWidth={3} />}
    {two && <g>
      <line x1={x + 22} x2={x + 146} y1={y + 84} y2={y + 30} stroke={P.group[0]} strokeWidth={3} />
      <line x1={x + 22} x2={x + 146} y1={flat ? y + 100 : y + 80} y2={flat ? y + 46 : y + 58} stroke={P.group[1]} strokeWidth={3} />
    </g>}
  </g>);
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>The hypotheses</Txt>
    <Txt x={30} y={100} size={18} weight={700} opacity={ramp(t, 0.6, 1.2)}>{texLite(h.null || '')}</Txt>
    <Txt x={210} y={100} size={18} weight={700} color={P.red} opacity={ramp(t, 1.2, 1.8)}>{texLite(h.alternative || '')}</Txt>
    {box(20, 130, true, ramp(t, 0.8, 1.4))}
    {box(220, 130, false, ramp(t, 1.4, 2.0))}
  </g>);
};
