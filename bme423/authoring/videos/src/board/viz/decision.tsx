import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Txt, ramp, lin, nice} from './_kit';
import {f7, sub, up, stepIdx, End, RefLine, Bell, Hyps} from './_s17';

// Deciding with an interval: the interval on a number line, the null value dropped onto it and checked.
// Uses only c.values (L, U, theta0). The level-matching step is a schematic curve without numbers.
const Viz: VizC = ({c, k, t, w, h}) => {
  const v = c.values; const S = c.steps; const n = S.length; const end = k >= n;
  const iH = stepIdx(S, /hypothes/i), iLev = stepIdx(S, /levels/i), iChk = stepIdx(S, /null value/i), iDec = stepIdx(S, /decide/i);
  if (k === iH) return <Hyps c={c} w={w} h={h} />;
  if (k === iLev) { const p = ramp(t, 1.4, 2.6);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Matching levels</Txt>
      <Bell cx={w / 2} y={280} hw={170} ht={180} z={1.96} p={p} />
      <Txt x={w / 2} y={230} size={18} anchor="middle" weight={700} color={P.blue} opacity={p}>1 − α</Txt>
      <Txt x={48} y={250} size={16} anchor="middle" weight={700} color={P.red} opacity={p}>α/2</Txt>
      <Txt x={w - 48} y={250} size={16} anchor="middle" weight={700} color={P.red} opacity={p}>α/2</Txt>
      <Txt x={w / 2} y={330} size={15} anchor="middle" color={P.blue} opacity={p}>interval level 1 − α</Txt>
      <Txt x={w / 2} y={356} size={15} anchor="middle" color={P.red} opacity={p}>two-sided test at α</Txt>
      <Txt x={w / 2} y={400} size={14} anchor="middle" color={P.soft}>schematic</Txt>
    </g>); }
  const th = v.theta0, lo = Math.min(th, v.L), hi = Math.max(th, v.U), pad = (hi - lo) * 0.16;
  const X = lin(lo - pad, hi + pad, 30, w - 30); const ticks = nice(lo - pad, hi + pad, 5);
  const SP = X(v.U) - X(v.L);
  const yL = 250;
  const pZ = k === iChk ? ramp(t, 1.6, 2.6) : (k > iChk || end ? 1 : 0);
  const pV = k === iChk ? ramp(t, 2.8, 3.6) : (k > iChk || end ? 1 : 0);
  const pD = k === iDec ? ramp(t, 1.6, 2.6) : (end ? 1 : 0);
  const inside = th >= v.L && th <= v.U; const col = inside ? P.green : P.red;
  const dir = v.L > th ? 'μ₁ > μ₂' : v.U < th ? 'μ₁ < μ₂' : '';
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>The interval</Txt>
    <Txt x={20} y={58} size={15} color={P.ink}>μ₁ − μ₂</Txt>
    <rect x={X(v.L)} width={X(v.U) - X(v.L)} y={yL - 6} height={12} rx={6} fill={P.hi} />
    <End x={X(v.L)} y={yL} p={1} color={P.red} label={`L ${f7(v.L)}`} side="left" w={w} span={SP} />
    <End x={X(v.U)} y={yL} p={1} color={P.red} label={`U ${f7(v.U)}`} side="right" w={w} span={SP} />
    {pZ > 0 && <g>
      <RefLine x={X(th)} y1={150} y2={340} p={pZ} color={pV > 0 ? col : P.ink} w={2.5} />
      <Txt x={X(th)} y={140} size={16} anchor="middle" weight={700} opacity={pZ}>{`μ₁ − μ₂ = ${f7(th)}`}</Txt>
    </g>}
    {pV > 0 && <Txt x={w / 2} y={110} size={16} anchor="middle" weight={700} color={col} opacity={pV}>
      {inside ? `${f7(th)} inside → do not reject H₀` : `${f7(th)} outside → reject H₀`}</Txt>}
    {pD > 0 && dir && <g opacity={pD}>
      <Txt x={(X(v.L) + X(v.U)) / 2} y={yL - 30} size={16} anchor="middle" weight={700} color={P.ink}>{dir}</Txt>
      <Txt x={w / 2} y={yL + 84} size={15} anchor="middle" color={P.soft}>{v.L > th ? `both bounds above ${f7(th)}` : `both bounds below ${f7(th)}`}</Txt>
    </g>}
    <Axis X={X} y={360} ticks={ticks} />
  </g>);
};
export default Viz;
