// Shared pieces for the Session 24 board visuals (rank tests). Not registered (leading "_").
import React from 'react';
import {P, inter} from '../theme';
import {Txt, lin, nice, ramp} from './_kit';

export const f6 = (x: number) => String(+Number(x).toPrecision(6));
export const mn = (x: number) => (x < 0 ? '−' : '') + f6(Math.abs(x));
// Board line timing: work line j appears at 0.9 + 0.7·G + 1.4·j seconds.
export const wAt = (c: any, k: number, j: number) => 0.9 + 0.7 * (k >= 0 && k < c.steps.length ? c.steps[k].general.length : 0) + 1.4 * j;
// Round ticks whose ends cover [lo, hi].
export const span = (lo: number, hi: number, n = 5) => { const tk = nice(lo, hi, n); const s = tk.length > 1 ? tk[1] - tk[0] : 1;
  while (tk[0] > lo + 1e-9) tk.unshift(+(tk[0] - s).toFixed(10)); while (tk[tk.length - 1] < hi - 1e-9) tk.push(+(tk[tk.length - 1] + s).toFixed(10)); return tk; };
// Average ranks (ties share the mean of the ranks they occupy).
export const avgRanks = (v: number[]) => { const s = [...v].sort((a, b) => a - b);
  return v.map(x => (s.indexOf(x) + 1 + s.lastIndexOf(x) + 1) / 2); };
export const Head: React.FC<{title: string; sub?: string}> = ({title, sub}) => (<g>
  <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{title}</Txt>
  {sub && <Txt x={20} y={58} size={14} color={P.soft}>{sub}</Txt>}</g>);
export const XAxis: React.FC<{X: (v: number) => number; y: number; ticks: number[]; label?: string; fmt?: (v: number) => string}> = ({X, y, ticks, label, fmt = mn}) => (
  <g fontFamily={inter}>
    <line x1={X(ticks[0])} x2={X(ticks[ticks.length - 1])} y1={y} y2={y} stroke={P.faint} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={X(t)} x2={X(t)} y1={y} y2={y + 5} stroke={P.faint} /><text x={X(t)} y={y + 20} fontSize={14} fill={P.soft} textAnchor="middle">{fmt(t)}</text></g>)}
    {label && <text x={(X(ticks[0]) + X(ticks[ticks.length - 1])) / 2} y={y + 40} fontSize={14} fill={P.soft} textAnchor="middle">{label}</text>}
  </g>);

// Null distribution drawn as stacked dots: one dot per equally likely arrangement, placed at its statistic.
// `rej(v)` marks values in the reject region, `obs` is the observed statistic.
export const DotHist: React.FC<{vals: number[]; t: number; grow?: [number, number]; rej?: (v: number) => boolean; obs?: number; mu?: number;
  label: string; name: string; y0?: number; top?: number; reject?: boolean; showDecision?: boolean}> =
  ({vals, t, grow, rej, obs, mu, label, name, y0 = 330, top = 110, reject, showDecision}) => {
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const allInt = vals.every(x => Math.abs(x - Math.round(x)) < 1e-9);
  const stp = allInt ? [1, 2, 4, 5, 10, 20, 50, 100].find(s => (hi - lo) / s <= 7) || 100 : 0;
  const ticks = allInt ? (() => { const out: number[] = []; for (let x = Math.floor(lo / stp) * stp; x <= hi + 1e-9 || out.length < 2; x += stp) out.push(x); if (out[out.length - 1] < hi) out.push(out[out.length - 1] + stp); return out; })() : span(lo, hi, 5);
  const X = lin(ticks[0], ticks[ticks.length - 1], 40, 360);
  const keys = vals.map(v => +v.toFixed(6)); const cnt: Record<string, number> = {}; const hgt = keys.map(k => (cnt[k] = (cnt[k] ?? -1) + 1));
  const maxC = Math.max(...Object.values(cnt)) + 1; const step = Math.min((X(hi) - X(lo)) / Math.max(1, new Set(keys).size - 1), 20);
  const dy = Math.min(22, (y0 - 10 - top) / maxC); const r = Math.max(1.6, Math.min(step, dy) / 2 - 0.6);
  const n = vals.length; const pg = grow ? ramp(t, grow[0], grow[1]) : 1; const shown = Math.floor(pg * n + 1e-6);
  return (<g fontFamily={inter}>
    {rej && <g>{Array.from(new Set<number>(keys)).filter(x => rej(x)).map(v => <rect key={v} x={X(v) - Math.max(r + 2, step / 2)} y={y0 - maxC * dy - 6} width={Math.max(2 * r + 4, step)} height={maxC * dy + 6} fill="rgba(200,55,45,0.13)" />)}</g>}
    {keys.map((v, j) => j < shown && <circle key={j} cx={X(v)} cy={y0 - 6 - hgt[j] * dy - r + 4} r={r}
      fill={obs !== undefined && Math.abs(v - obs) < 1e-6 ? P.hiSolid : rej && rej(v) ? P.red : P.blue} stroke={obs !== undefined && Math.abs(v - obs) < 1e-6 ? '#b8900a' : 'none'} opacity={0.85} />)}
    <XAxis X={X} y={y0} ticks={ticks} label={label} />
    {mu !== undefined && pg >= 1 && <g><line x1={X(mu)} x2={X(mu)} y1={y0} y2={y0 - maxC * dy - 14} stroke={P.soft} strokeDasharray="4 4" strokeWidth={1.5} />
      <Txt x={X(mu)} y={y0 - maxC * dy - 20} size={14} anchor="middle" color={P.soft}>{`center ${f6(mu)}`}</Txt></g>}
    {obs !== undefined && pg >= 1 && <g><path d={`M${X(obs)},${y0 + 46} l-7,10 l14,0 z`} fill="#b8900a" />
      <Txt x={X(obs)} y={y0 + 74} size={16} anchor="middle" weight={700} color={P.ink}>{`${name} = ${mn(obs)}`}</Txt></g>}
    {showDecision && <Txt x={200} y={y0 + 98} size={16} anchor="middle" weight={700} color={reject ? P.red : P.green}>{reject ? 'reject H₀' : 'do not reject H₀'}</Txt>}
    <Txt x={360} y={top - 24} size={14} anchor="end" color={P.soft}>{`${n} equally likely`}</Txt>
  </g>);
};

// Two-sided Normal decision: schematic curve (unlabeled), reject tails beyond ±crit, the statistic on the z axis.
export const ZDecision: React.FC<{t: number; z: number; crit: number; reject: boolean; name: string; w: number; p?: number}> = ({t, z, crit, reject, name, w, p}) => {
  const R = Math.ceil(Math.max(Math.abs(z), crit) * 1.25); const X = lin(-R, R, 30, w - 30); const y0 = 300;
  const curve = (x: number) => y0 - 150 * Math.exp(-x * x / 2);
  const pts = (a: number, b: number) => Array.from({length: 60}, (_, i) => a + (b - a) * i / 59);
  const path = pts(-R, R).map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${curve(x).toFixed(1)}`).join(' ');
  const tail = (a: number, b: number) => `M${X(a)},${y0} ` + pts(a, b).map(x => `L${X(x).toFixed(1)},${curve(x).toFixed(1)}`).join(' ') + ` L${X(b)},${y0} Z`;
  const pc = p ?? ramp(t, 0.6, 1.6), ps = p ?? ramp(t, 1.4, 3.0), pd = p ?? ramp(t, 3.0, 3.8); const zs = z * ps;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Compare with the cutoff</Txt>
    <path d={path} fill="none" stroke={P.faint} strokeWidth={2} />
    <g opacity={pc}>
      <path d={tail(crit, R)} fill="rgba(200,55,45,0.18)" /><path d={tail(-R, -crit)} fill="rgba(200,55,45,0.18)" />
      {[-crit, crit].map(c => <g key={c}><line x1={X(c)} x2={X(c)} y1={y0} y2={118} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" />
        <Txt x={X(c)} y={108} size={15} anchor="middle" color={P.red} weight={700}>{mn(c)}</Txt></g>)}
    </g>
    <XAxis X={X} y={y0} ticks={nice(-R, R, 6)} />
    <g opacity={ps > 0 ? 1 : 0}>
      <line x1={X(zs)} x2={X(zs)} y1={y0} y2={y0 - 40} stroke={P.blue} strokeWidth={3} />
      <circle cx={X(zs)} cy={y0} r={7} fill={P.blue} />
      <Txt x={Math.max(70, Math.min(w - 70, X(zs)))} y={y0 + 50} size={16} anchor="middle" color={P.blue} weight={700}>{`${name} = ${f6(Math.abs(zs))}`}</Txt>
    </g>
    <g opacity={pd}><Txt x={w / 2} y={410} size={17} anchor="middle" weight={700} color={reject ? P.red : P.green}>{reject ? 'reject H₀' : 'do not reject H₀'}</Txt></g>
  </g>);
};

// Distance from the mean less one half, laid against one standard deviation: z = (|S − μ| − ½)/σ.
export const ZBuild: React.FC<{t: number; t0: number; S: number; mu: number; sd: number; z: number; name: string; zname: string}> = ({t, t0, S, mu, sd, z, name, zname}) => {
  const dist = Math.abs(S - mu); const L = Math.max(dist, sd) * 1.08; const X = lin(0, L, 40, 360);
  const p1 = ramp(t, t0, t0 + 1), p2 = ramp(t, t0 + 1.2, t0 + 2), p3 = ramp(t, t0 + 2.2, t0 + 3.2), p4 = ramp(t, t0 + 3.4, t0 + 4.2);
  return (<g fontFamily={inter}>
    <Head title="Distance in standard deviations" />
    <g opacity={p1}>
      <rect x={X(0)} y={120} width={(X(dist - 0.5 * p2) - X(0)) * p1} height={22} rx={4} fill={P.hiSolid} />
      {p2 > 0.5 && <rect x={X(dist - 0.5)} y={120} width={Math.max(2, X(dist) - X(dist - 0.5))} height={22} fill={P.red} />}
      <Txt x={X(0)} y={110} size={15} weight={700}>{p2 > 0.5 ? `|${name} − μ| − ½ = ${f6(dist - 0.5)}` : `|${name} − μ| = ${f6(dist)}`}</Txt>
    </g>
    <g opacity={p3}>
      <rect x={X(0)} y={210} width={(X(sd) - X(0)) * p3} height={22} rx={4} fill={P.blue} opacity={0.75} />
      <Txt x={X(0)} y={200} size={15} weight={700} color={P.blue}>{`σ = ${f6(sd)}`}</Txt>
    </g>
    <XAxis X={X} y={290} ticks={span(0, L, 4).filter(v => v <= L + 1e-9)} label="distance from the mean" />
    <g opacity={p4}><Txt x={200} y={390} size={17} anchor="middle" weight={700} color={P.blue}>{`${zname} = ${f6(dist - 0.5)} / ${f6(sd)}`}</Txt>
      <Txt x={200} y={418} size={17} anchor="middle" weight={700} color={P.blue}>{`= ${f6(z)}`}</Txt></g>
  </g>);
};
