import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice, Bracket} from './_kit';
import {DataTable} from './_s17';

// One-mean confidence interval. Steps (case ci-heart style): 0 quantity, 1 SE, 2 df + cutoff (class table shown instead),
// 3 margin, 4 lower, 5 upper, 6 interval. Uses only c.values (x, sd, n, se, critical, margin, lower, upper).
const Viz: VizC = ({c, k, t, w, h}) => {
  // The question refers to the summary table (n is only there), so show it instead of the scale.
  if (k < 0) return <DataTable c={c} w={w} h={h} />;
  const v = c.values; const n = c.steps.length;
  const lo = v.x - 1.35 * Math.max(v.margin, v.sd), hi = v.x + 1.35 * Math.max(v.margin, v.sd);
  const X = lin(lo, hi, 30, w - 30); const ticks = nice(lo, hi, 5);
  const yPop = 120, yMean = 300;
  const fmt = (z: number) => String(+z.toFixed(2));
  // individual spread (SD) shown above, the uncertainty of the mean (SE) below: the key contrast of this method
  const showSD = k <= 1 || k === n; const showSE = k >= 1; const showM = k >= 3 && k !== 2;
  const pM = k === 3 ? ramp(t, 0.8, 2.2) : 1;
  const pL = k === 4 ? ramp(t, 0.8, 1.6) : k > 4 ? 1 : 0, pU = k === 5 ? ramp(t, 0.8, 1.6) : k > 5 ? 1 : 0;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{k < 0 ? 'The data' : 'On the measurement scale'}</Txt>
    <Txt x={20} y={58} size={14} color={P.soft}>{c.unit}</Txt>
    {showSD && <g opacity={k === 1 ? 1 - ramp(t, 0.5, 1.5) * 0.65 : 1}>
      <Txt x={20} y={yPop - 38} size={15} color={P.soft}>one person varies by about 1 SD</Txt>
      <line x1={X(v.x - v.sd)} x2={X(v.x + v.sd)} y1={yPop} y2={yPop} stroke={P.group[1]} strokeWidth={5} strokeLinecap="round" />
      <Txt x={X(v.x + v.sd)} y={yPop - 12} size={15} anchor="middle" color={P.group[1]}>{`SD ${fmt(v.sd)}`}</Txt>
    </g>}
    <Dot x={X(v.x)} y={yMean} r={7} color={P.ink} />
    <Txt x={X(v.x)} y={yMean - 18} size={16} anchor="middle" weight={700}>{`x̄ = ${fmt(v.x)}`}</Txt>
    {showSE && <g opacity={k === 1 ? ramp(t, 1.0, 2.0) : 1}>
      <line x1={X(v.x - v.se)} x2={X(v.x + v.se)} y1={yMean + 22} y2={yMean + 22} stroke={P.blue} strokeWidth={5} strokeLinecap="round" />
      <Txt x={X(v.x)} y={yMean + 48} size={15} anchor="middle" color={P.blue}>{`SE ${fmt(v.se)}`}</Txt>
    </g>}
    {showM && <g>
      <rect x={X(v.x - v.margin * pM)} width={X(v.x + v.margin * pM) - X(v.x - v.margin * pM)} y={yMean - 6} height={12} rx={6} fill={P.hi} />
      {k === 3 && <Txt x={X(v.x)} y={yMean + 76} size={15} anchor="middle" color={P.soft}>{`${fmt(v.critical)} × ${fmt(v.se)} = ${fmt(v.margin)}`}</Txt>}
    </g>}
    {pL > 0 && <Bracket x={X(v.lower)} y={yMean} p={pL} color={P.red} label={`L ${fmt(v.lower)}`} side="left" />}
    {pU > 0 && <Bracket x={X(v.upper)} y={yMean} p={pU} color={P.red} label={`U ${fmt(v.upper)}`} side="right" />}
    {(k >= 6 || k === n) && <Txt x={w / 2} y={yMean + 76} size={16} anchor="middle" color={P.green} weight={700}>{`${Math.round(v.confidence * 100)}% interval for μ`}</Txt>}
    <Axis X={X} y={400} ticks={ticks} />
  </g>);
};
export default Viz;
