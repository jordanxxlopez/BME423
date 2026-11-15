import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice} from './_kit';
import {f7, sub, up, stepIdx, End, RefLine, DataTable} from './_s17';

// Course pooled interval for p1 - p2. Top: each group's event proportion as a bar on 0..1, then the pooled proportion.
// Variance step: a unit square with sides p̂ and 1 - p̂, so its area is the pooled binary variance.
// Bottom: the difference scale with zero (equal proportions), the SE as a length, d with its margin, both ends, zero checked.
const Viz: VizC = ({c, k, t, w, h}) => {
  if (k < 0) return <DataTable c={c} w={w} h={h} />;
  const v = c.values; const S = c.steps; const n = S.length; const end = k >= n;
  const iP = stepIdx(S, /sample proportions/i), iPool = stepIdx(S, /pooled proportion/i), iVar = stepIdx(S, /variance/i),
    iSE = stepIdx(S, /difference SE/i), iDM = stepIdx(S, /difference and margin/i), iE = stepIdx(S, /endpoints/i), iI = stepIdx(S, /interpret/i);
  const at = (i: number, a: number, b: number) => (k > i || end ? 1 : k === i ? ramp(t, a, b) : 0);
  const rows = (c.table?.rows || []) as any[][]; const g1 = String(rows[0]?.[0] ?? 'group 1'), g2 = String(rows[1]?.[0] ?? 'group 2');
  const c1 = P.group[1], c2 = P.group[2];
  const B = lin(0, 1, 30, w - 30);
  const frac = (m: number, nn: number, p: number) => `${m}/${nn} ${Math.abs(m / nn - p) > 1e-9 ? '≈' : '='} ${f7(p)}`;
  const pooled = (v.m1 + v.m2) / (v.n1 + v.n2);
  const p1 = at(iP, 1.4, 2.4), p2 = at(iP, 2.8, 3.8), pp = at(iPool, 1.4, 2.6);
  const bars: [string, string, number, string, number, React.ReactNode][] = [
    [g1, c1, v.p1, frac(v.m1, v.n1, v.p1), p1, <>p̂{sub('1')}</>], [g2, c2, v.p2, frac(v.m2, v.n2, v.p2), p2, <>p̂{sub('2')}</>]];
  const yb = [62, 104, 146];

  // difference scale
  const lo = Math.min(0, v.lower), hi = Math.max(0, v.upper, v.se), dp = (hi - lo) * 0.14;
  const X = lin(lo - dp, hi + dp, 30, w - 30); const ticks = nice(lo - dp, hi + dp, 5);
  const SP = X(v.upper) - X(v.lower);
  const yL = 330, yAx = 404;
  const pSE = at(iSE, 2.0, 3.0);
  // d and its margin were computed on the lookup step, so they come in at the start of the endpoints step
  const pd = at(iE, 0.2, 1.0), pM = at(iE, 0.8, 1.8), pL = at(iE, 2.1, 2.9), pU = at(iE, 3.5, 4.3), pZ = at(iI, 1.2, 2.2);
  const inside = 0 >= v.lower && 0 <= v.upper;
  const rounded = Math.abs(v.se - v.rawSE) > 1e-9;
  const pV = k === iVar ? ramp(t, 1.4, 2.6) : 1, sq = 150, sx = 30, sy = 236;

  return (<g fontFamily={inter}>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Event proportions</Txt>
    {bars.map(([nm, col, p, lab, pr, sym], i) => (<g key={i}>
      <Txt x={30} y={yb[i] - 8} size={14} color={col} weight={600}>{nm}</Txt>
      <rect x={B(0)} y={yb[i]} width={B(1) - B(0)} height={14} fill="none" stroke={P.line} strokeWidth={1.5} />
      <rect x={B(0)} y={yb[i]} width={(B(p) - B(0)) * pr} height={14} fill={col} fillOpacity={0.75} />
      <Txt x={w - 30} y={yb[i] - 8} size={15} anchor="end" color={col} weight={700} opacity={pr}>{sym}{up(` = ${lab}`)}</Txt>
    </g>))}
    {pp > 0 && <g opacity={pp}>
      <Txt x={30} y={yb[2] - 8} size={14} color={P.blue} weight={600}>pooled</Txt>
      <rect x={B(0)} y={yb[2]} width={(B(pooled) - B(0)) * pp} height={14} fill={P.blue} fillOpacity={0.35} stroke={P.blue} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={B(pooled)} x2={B(pooled)} y1={yb[0] - 2} y2={yb[2] + 16} stroke={P.blue} strokeWidth={1.5} strokeDasharray="4 4" />
      <Txt x={w - 30} y={yb[2] - 8} size={15} anchor="end" color={P.blue} weight={700}>{`p̂ = ${v.m1 + v.m2}/${v.n1 + v.n2} = ${f7(pooled)}`}</Txt>
    </g>}
    <Axis X={B} y={172} ticks={[0, 0.25, 0.5, 0.75, 1]} />

    {k === iVar ? <g>
      <Txt x={20} y={222} size={16} weight={700} color={P.blue}>Pooled binary variance</Txt>
      <rect x={sx} y={sy} width={sq} height={sq} fill="none" stroke={P.faint} strokeWidth={1.5} />
      <rect x={sx} y={sy + sq * pooled} width={sq * pooled} height={sq * (1 - pooled) * pV} fill={P.blue} fillOpacity={0.25} stroke={P.blue} strokeWidth={2}
        transform={`translate(0 ${sq * (1 - pooled) * (1 - pV)})`} />
      <Txt x={sx + sq * pooled / 2} y={sy + sq + 20} size={15} anchor="middle" color={P.blue}>p̂</Txt>
      <Txt x={sx + sq + 8} y={sy + sq * (1 + pooled) / 2 + 5} size={15} color={P.blue}>1 − p̂</Txt>
      <Txt x={sx + sq + 8} y={sy + sq * pooled / 2 + 5} size={14} color={P.soft}>p̂</Txt>
      <Txt x={sx + sq / 2} y={sy + sq + 40} size={14} anchor="middle" color={P.soft}>unit square</Txt>
      <Txt x={w - 20} y={sy + 40} size={16} anchor="end" weight={700} color={P.blue} opacity={pV}>{`s² = ${f7(v.variance)}`}</Txt>
      <Txt x={w - 20} y={sy + 64} size={14} anchor="end" color={P.soft} opacity={pV}>shaded area</Txt>
    </g> : <g>
      <Txt x={20} y={222} size={16} weight={700} color={P.blue}>Difference of proportions</Txt>
      <Txt x={20} y={244} size={14} color={P.soft}>{`${g1} − ${g2}`}</Txt>
      <RefLine x={X(0)} y1={268} y2={yAx} color={k === iI || end ? (inside ? P.green : P.red) : P.faint} w={k === iI || end ? 2.5 : 1.5} />
      {k <= iPool && <Txt x={X(0)} y={yL + 6} size={14} anchor={X(0) > w / 2 ? 'end' : 'start'} color={P.soft}>{X(0) > w / 2 ? 'equal at 0  ' : '  equal at 0'}</Txt>}
      {k === iSE && <g opacity={pSE}>
        <line x1={X(0)} x2={X(0) + (X(v.rawSE) - X(0)) * pSE} y1={yL} y2={yL} stroke={P.blue} strokeWidth={5} strokeLinecap="round" />
        <Txt x={X(0)} y={yL - 16} size={15} anchor={X(v.rawSE) > w - 120 ? 'end' : 'start'} color={P.blue} weight={700}>
          s{sub('(p̂₁−p̂₂)')}{up(` = ${f7(v.rawSE)}${rounded ? ` ≈ ${f7(v.se)}` : ''}`)}</Txt>
        <Txt x={(X(0) + X(v.rawSE)) / 2} y={yL + 24} size={14} anchor="middle" color={P.soft}>one SE</Txt>
      </g>}
      {k >= iE && <g>
        {pM > 0 && <rect x={X(v.difference - v.margin * pM)} width={X(v.difference + v.margin * pM) - X(v.difference - v.margin * pM)} y={yL - 6} height={12} rx={6} fill={P.hi} />}
        <line x1={X(v.difference - v.se)} x2={X(v.difference + v.se)} y1={yL + 24} y2={yL + 24} stroke={P.blue} strokeWidth={4} strokeLinecap="round" opacity={0.6 * pd * (1 - pL)} />
        <g opacity={pd}><Dot x={X(v.difference)} y={yL} r={7} color={P.ink} />
          <Txt x={X(v.difference)} y={yL - 24} size={16} anchor="middle" weight={700}>{`p̂₁ − p̂₂ = ${f7(v.difference)}`}</Txt></g>
        {k === iE && <Txt x={w / 2} y={yL + 56} size={14} anchor="middle" color={P.soft} opacity={pM * (1 - pL)}>{`${f7(v.critical)} × ${f7(v.se)} = ${f7(v.margin)}`}</Txt>}
        {pL > 0 && <End x={X(v.lower)} y={yL} p={pL} color={P.red} label={`L ${f7(v.lower)}`} side="left" w={w} span={SP} />}
        {pU > 0 && <End x={X(v.upper)} y={yL} p={pU} color={P.red} label={`U ${f7(v.upper)}`} side="right" w={w} span={SP} />}
      </g>}
      {pZ > 0 && <Txt x={w / 2} y={276} size={16} anchor="middle" weight={700} color={inside ? P.green : P.red} opacity={pZ}>
        {inside ? '0 inside → do not reject' : '0 outside → reject'}</Txt>}
      <Axis X={X} y={yAx} ticks={ticks} />
    </g>}
  </g>);
};
export default Viz;
