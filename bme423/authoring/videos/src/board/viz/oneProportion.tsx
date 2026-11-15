import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice} from './_kit';
import {f7, sub, up, stepIdx, End, RefLine, DataTable, Hyps} from './_s17';

// Normal interval for one proportion. Top: p̂ as a bar on the full 0..1 scale with the null reference p0.
// SE step: a unit square with sides p̂ and 1 - p̂ (area = p̂(1 - p̂)). Bottom: a zoomed scale around the interval where
// the SE, the margin and both ends appear, and p0 is checked against the interval.
const Viz: VizC = ({c, k, t, w, h}) => {
  if (k < 0) return <DataTable c={c} w={w} h={h} />;
  if (k === 0) return <Hyps c={c} w={w} h={h} />;
  const v = c.values; const S = c.steps; const n = S.length; const end = k >= n;
  const iP = stepIdx(S, /sample proportion/i), iSE = stepIdx(S, /SE/), iM = stepIdx(S, /margin/i), iL = stepIdx(S, /lower/i),
    iU = stepIdx(S, /upper/i), iC = stepIdx(S, /compare/i);
  const at = (i: number, a: number, b: number) => (k > i || end ? 1 : k === i ? ramp(t, a, b) : 0);
  const B = lin(0, 1, 30, w - 30);
  const pP = at(iP, 1.4, 2.4);
  const lo = Math.min(v.lower, v.reference), hi = Math.max(v.upper, v.reference), zp = (hi - lo) * 0.22;
  const zlo = lo - zp, zhi = hi + zp; const X = lin(zlo, zhi, 30, w - 30); const ticks = nice(zlo, zhi, 4);
  const SP = X(v.upper) - X(v.lower);
  const yTop = 64, yAxTop = 96, yL = 334, yAx = 406;
  const pV = k === iSE ? ramp(t, 1.4, 2.6) : 1, pS = at(iSE, 2.8, 3.8);
  const pM = at(iM, 1.4, 2.8), pLo = at(iL, 1.4, 2.2), pUp = at(iU, 1.4, 2.2), pZ = at(iC, 1.2, 2.2);
  const inside = v.reference >= v.lower && v.reference <= v.upper;
  const sq = 110, sx = 30, sy = 140;
  const frac = `${v.m}/${v.n} = ${f7(v.p)}`;
  return (<g fontFamily={inter}>
    <Txt x={20} y={28} size={17} weight={700} color={P.blue}>Proportion scale</Txt>
    <Txt x={20} y={54} size={15} weight={700} color={P.blue} opacity={pP}>{`p̂ = ${frac}`}</Txt>
    <Txt x={w - 20} y={54} size={15} anchor="end" weight={700} color={P.red}>p{sub('0')}{up(` = ${f7(v.reference)}`)}</Txt>
    <rect x={B(0)} y={yTop} width={B(1) - B(0)} height={14} fill="none" stroke={P.line} strokeWidth={1.5} />
    <rect x={B(0)} y={yTop} width={(B(v.p) - B(0)) * pP} height={14} fill={P.blue} fillOpacity={0.6} />
    <RefLine x={B(v.reference)} y1={yTop - 6} y2={yTop + 22} color={P.red} />
    <Axis X={B} y={yAxTop} ticks={[0, 0.25, 0.5, 0.75, 1]} />

    {k === iSE ? <g>
      <rect x={sx} y={sy} width={sq} height={sq} fill="none" stroke={P.faint} strokeWidth={1.5} />
      <rect x={sx} y={sy + sq * v.p + sq * (1 - v.p) * (1 - pV)} width={sq * v.p} height={sq * (1 - v.p) * pV} fill={P.blue} fillOpacity={0.25} stroke={P.blue} strokeWidth={2} />
      <Txt x={sx + sq * v.p / 2} y={sy + sq + 18} size={15} anchor="middle" color={P.blue}>p̂</Txt>
      <Txt x={sx + sq + 8} y={sy + sq * (1 + v.p) / 2 + 5} size={15} color={P.blue}>1 − p̂</Txt>
      <Txt x={w - 20} y={sy + 34} size={15} anchor="end" weight={700} color={P.blue} opacity={pV}>{`p̂(1 − p̂) = ${f7(v.variance)}`}</Txt>
      <Txt x={w - 20} y={sy + 64} size={15} anchor="end" weight={700} color={P.blue} opacity={pS}>s{sub('p̂')}{up(` = ${f7(v.se)}`)}</Txt>
    </g> : <g opacity={pP}>
      {/* zoom: the bottom scale is this slice of the top scale */}
      <path d={`M${B(zlo)},${yAxTop + 26} L${B(zhi)},${yAxTop + 26} L${w - 30},${yL - 64} L30,${yL - 64} Z`} fill={P.blue} opacity={0.06} />
      <line x1={B(zlo)} x2={B(zhi)} y1={yAxTop + 26} y2={yAxTop + 26} stroke={P.blue} strokeWidth={3} opacity={0.5} />
      <Txt x={w / 2} y={yL - 80} size={14} anchor="middle" color={P.soft} opacity={1 - pZ}>zoomed in</Txt>
    </g>}
    {pP > 0 && <g opacity={pP}>
      <RefLine x={X(v.reference)} y1={yL - 58} y2={yAx} color={k === iC || end ? (inside ? P.green : P.red) : P.red} w={k === iC || end ? 2.5 : 1.5} />
      {k >= iSE && <line x1={X(v.p - v.se * pS)} x2={X(v.p + v.se * pS)} y1={yL + 24} y2={yL + 24} stroke={P.blue} strokeWidth={5} strokeLinecap="round" opacity={pS * (1 - pLo)} />}
      {k === iSE && <Txt x={X(v.p)} y={yL + 48} size={15} anchor="middle" color={P.blue} opacity={pS}>s{sub('p̂')}</Txt>}
      {pM > 0 && <rect x={X(v.p - v.margin * pM)} width={X(v.p + v.margin * pM) - X(v.p - v.margin * pM)} y={yL - 6} height={12} rx={6} fill={P.hi} />}
      {k === iM && <Txt x={w / 2} y={yL + 54} size={14} anchor="middle" color={P.soft} opacity={pM}>{`${f7(v.critical)} × ${f7(v.se)} = ${f7(v.margin)}`}</Txt>}
      <Dot x={X(v.p)} y={yL} r={7} color={P.ink} />
      <Txt x={X(v.p)} y={yL - 24} size={16} anchor="middle" weight={700}>{`p̂ = ${f7(v.p)}`}</Txt>
      {pLo > 0 && <End x={X(v.lower)} y={yL} p={pLo} color={P.red} label={`L ${f7(v.lower)}`} side="left" w={w} span={SP} />}
      {pUp > 0 && <End x={X(v.upper)} y={yL} p={pUp} color={P.red} label={`U ${f7(v.upper)}`} side="right" w={w} span={SP} />}
      {pZ > 0 && <Txt x={w / 2} y={yL - 62} size={16} anchor="middle" weight={700} color={inside ? P.green : P.red} opacity={pZ}>
        {inside ? 'p₀ inside → do not reject' : 'p₀ outside → reject'}</Txt>}
      <Axis X={X} y={yAx} ticks={ticks} />
    </g>}
  </g>);
};
export default Viz;
