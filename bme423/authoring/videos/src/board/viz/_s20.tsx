// Shared pieces for the Session 20 visuals (paired t, unpaired t, repeated measures ANOVA). Not registered (leading "_").
import React from 'react';
import {P, inter} from '../theme';
import {Txt, lin, nice, ramp} from './_kit';

// Six significant figures, trailing zeros dropped (matches how the board writes the work lines).
export const f6 = (x: number) => String(+x.toPrecision(6));
export const f2 = (x: number) => String(+x.toFixed(2));

// Two-sided t decision: schematic t curve (unlabeled), reject tails beyond ±critical, the statistic marked on the axis.
export const TDecision: React.FC<{t: number; stat: number; crit: number; reject: boolean; w: number; title?: string; p?: number}> = ({t, stat, crit, reject, w, title = 'Compare with the cutoff', p}) => {
  const R = Math.ceil(Math.max(Math.abs(stat), crit) * 1.25); const X = lin(-R, R, 30, w - 30); const y0 = 300;
  const curve = (x: number) => y0 - 150 * Math.exp(-x * x / 2);
  const pts = (a: number, b: number) => Array.from({length: 60}, (_, i) => a + (b - a) * i / 59);
  const path = pts(-R, R).map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${curve(x).toFixed(1)}`).join(' ');
  const tail = (a: number, b: number) => `M${X(a)},${y0} ` + pts(a, b).map(x => `L${X(x).toFixed(1)},${curve(x).toFixed(1)}`).join(' ') + ` L${X(b)},${y0} Z`;
  const pc = p ?? ramp(t, 0.6, 1.6), ps = p ?? ramp(t, 1.4, 2.4), pd = p ?? ramp(t, 2.4, 3.2);
  const ticks = nice(-R, R, 6);
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{title}</Txt>
    <path d={path} fill="none" stroke={P.faint} strokeWidth={2} />
    <g opacity={pc}>
      <path d={tail(crit, R)} fill="rgba(200,55,45,0.18)" /><path d={tail(-R, -crit)} fill="rgba(200,55,45,0.18)" />
      <rect x={X(crit)} y={y0 - 3} width={X(R) - X(crit)} height={6} fill={P.red} opacity={0.55} /><rect x={X(-R)} y={y0 - 3} width={X(-crit) - X(-R)} height={6} fill={P.red} opacity={0.55} />
      {[-crit, crit].map(c => <g key={c}><line x1={X(c)} x2={X(c)} y1={y0} y2={118} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" />
        <Txt x={X(c)} y={108} size={15} anchor="middle" color={P.red} weight={700}>{(c < 0 ? '−' : '') + f6(Math.abs(c))}</Txt></g>)}
    </g>
    <line x1={X(ticks[0])} x2={X(ticks[ticks.length - 1])} y1={y0} y2={y0} stroke={P.faint} strokeWidth={1.5} />
    {ticks.map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={y0} y2={y0 + 5} stroke={P.faint} /><text x={X(v)} y={y0 + 20} fontSize={14} fill={P.soft} textAnchor="middle">{v < 0 ? '−' + Math.abs(v) : v}</text></g>)}
    <g opacity={ps}>
      <line x1={X(stat)} x2={X(stat)} y1={y0} y2={y0 - 40} stroke={P.blue} strokeWidth={3} />
      <circle cx={X(stat)} cy={y0} r={7} fill={P.blue} />
      <Txt x={X(stat)} y={y0 + 50} size={16} anchor="middle" color={P.blue} weight={700}>{`t = ${f6(stat)}`}</Txt>
    </g>
    <g opacity={pd}><Txt x={w / 2} y={410} size={17} anchor="middle" weight={700} color={reject ? P.red : P.green}>{reject ? 'reject ' : 'do not reject '}{sub('H', '0')}</Txt></g>
  </g>);
};

// One-sided F decision with the lightface (0.05) and boldface (0.01) cutoffs.
export const FDecision: React.FC<{t: number; F: number; c05: number; c01: number; reject: boolean; w: number; p?: number}> = ({t, F, c05, c01, reject, w, p}) => {
  const R = Math.ceil(Math.max(F, c01) * 1.2); const X = lin(0, R, 30, w - 30); const y0 = 300;
  const shape = (x: number) => x <= 0 ? 0 : Math.sqrt(x) * Math.exp(-x / 1.4);
  const peak = shape(0.7); const curve = (x: number) => y0 - 150 * shape(x * 8 / R) / peak;
  const pts = (a: number, b: number) => Array.from({length: 80}, (_, i) => a + (b - a) * i / 79);
  const path = pts(0, R).map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${curve(x).toFixed(1)}`).join(' ');
  const tail = `M${X(c05)},${y0} ` + pts(c05, R).map(x => `L${X(x).toFixed(1)},${curve(x).toFixed(1)}`).join(' ') + ` L${X(R)},${y0} Z`;
  const pc = p ?? ramp(t, 0.6, 1.6), ps = p ?? ramp(t, 1.4, 2.4), pd = p ?? ramp(t, 2.4, 3.2);
  const ticks = nice(0, R, 5);
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Compare with the cutoffs</Txt>
    <path d={path} fill="none" stroke={P.faint} strokeWidth={2} />
    <g opacity={pc}>
      <path d={tail} fill="rgba(200,55,45,0.18)" />
      <rect x={X(c05)} y={y0 - 3} width={X(R) - X(c05)} height={6} fill={P.red} opacity={0.55} />
      <line x1={X(c05)} x2={X(c05)} y1={y0} y2={118} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" />
      <Txt x={X(c05)} y={108} size={15} anchor="middle" color={P.red}>{f6(c05)}</Txt>
      <line x1={X(c01)} x2={X(c01)} y1={y0} y2={148} stroke={P.red} strokeWidth={3} />
      <Txt x={X(c01)} y={138} size={15} anchor="middle" color={P.red} weight={700}>{f6(c01)}</Txt>
      <Txt x={X(c05)} y={84} size={14} anchor="middle" color={P.soft}>0.05</Txt>
      <Txt x={X(c01)} y={84} size={14} anchor="middle" color={P.soft}>0.01</Txt>
    </g>
    <line x1={X(0)} x2={X(ticks[ticks.length - 1])} y1={y0} y2={y0} stroke={P.faint} strokeWidth={1.5} />
    {ticks.map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={y0} y2={y0 + 5} stroke={P.faint} /><text x={X(v)} y={y0 + 20} fontSize={14} fill={P.soft} textAnchor="middle">{v}</text></g>)}
    <g opacity={ps}>
      <line x1={X(F)} x2={X(F)} y1={y0} y2={y0 - 40} stroke={P.blue} strokeWidth={3} />
      <circle cx={X(F)} cy={y0} r={7} fill={P.blue} />
      <Txt x={Math.min(X(F), w - 70)} y={y0 + 50} size={16} anchor="middle" color={P.blue} weight={700}>{`F = ${f6(F)}`}</Txt>
    </g>
    <g opacity={pd}><Txt x={w / 2} y={410} size={17} anchor="middle" weight={700} color={reject ? P.red : P.green}>{reject ? 'reject ' : 'do not reject '}{sub('H', '0')}</Txt></g>
  </g>);
};

// Splits text into lines of at most `max` characters at spaces.
export const wrap = (s: string, max: number) => { const out: string[] = []; let cur = '';
  for (const word of s.split(/(?<=\s)/)) { if ((cur + word).length > max && cur.trim()) { out.push(cur.trimEnd()); cur = word; } else cur += word; }
  if (cur.trim()) out.push(cur.trimEnd()); return out.length ? out : ['']; };
// Header text without the unit in brackets.
export const bare = (h: string) => String(h).replace(/\s*\(.*?\)\s*/g, ' ').trim();
// "s_d = 7.9761" written with a real subscript inside a <text>.
export const sub = (main: string, low: string, val?: string) => (<>{main}<tspan dy={5} fontSize="0.75em">{low}</tspan>{val !== undefined && <tspan dy={-5}>{` = ${val}`}</tspan>}</>);
// Hypotheses written as the panel heading (symbols only): H0 in blue, HA in red.
export const HypHead: React.FC<{h0: string; ha: string}> = ({h0, ha}) => (<g>
  <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{sub('H', '0')}<tspan dy={-5}>{`: ${h0}`}</tspan></Txt>
  <Txt x={380} y={34} size={17} weight={700} color={P.red} anchor="end">{sub('H', 'A')}<tspan dy={-5}>{`: ${ha}`}</tspan></Txt></g>);
// Round tick values whose first and last tick cover [lo, hi]; the axis domain is then [ticks[0], last tick].
export const niceSpan = (lo: number, hi: number, n = 5) => { const tk = nice(lo, hi, n); const step = tk.length > 1 ? tk[1] - tk[0] : 1;
  while (tk[0] > lo + 1e-9) tk.unshift(+(tk[0] - step).toFixed(10)); while (tk[tk.length - 1] < hi - 1e-9) tk.push(+(tk[tk.length - 1] + step).toFixed(10)); return tk; };
