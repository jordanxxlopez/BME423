import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice, Grow} from './_kit';
import {f7, sub, up, stepIdx, End, RefLine, DataTable, Hyps} from './_s17';

// Pooled two-sample t interval for mu1 - mu2. Top: both groups on the measurement scale (mean, +-1 SD).
// Variance steps: each SD drawn as the side of a square whose area is the variance, then the pooled square.
// Bottom: the difference scale, where d appears, the SE and margin grow around it, and zero is checked.
// Question -> data table, contrast/hypotheses step -> hypotheses panel (return null).
const Viz: VizC = ({c, k, t, w, h}) => {
  if (k < 0) return <DataTable c={c} w={w} h={h} />;
  if (k === 0) return <Hyps c={c} w={w} h={h} />;
  const v = c.values; const S = c.steps; const n = S.length; const end = k >= n;
  const iD = stepIdx(S, /observed difference/i), iSq = stepIdx(S, /square/i), iPool = stepIdx(S, /pool/i),
    iSE = stepIdx(S, /SE of the difference/i), iM = stepIdx(S, /margin/i), iB = stepIdx(S, /bounds/i), iDec = stepIdx(S, /decision/i);
  const at = (i: number, a: number, b: number) => (k > i || end ? 1 : k === i ? ramp(t, a, b) : 0);
  const rows = (c.table?.rows || []) as any[][]; const g1 = String(rows[0]?.[0] ?? 'group 1'), g2 = String(rows[1]?.[0] ?? 'group 2');
  const c1 = P.group[1], c2 = P.group[2];
  const varStep = k === iSq || k === iPool;

  // top: the two groups
  const glo = Math.min(v.x1 - v.s1, v.x2 - v.s2), ghi = Math.max(v.x1 + v.s1, v.x2 + v.s2), gp = (ghi - glo) * 0.1;
  const G = lin(glo - gp, ghi + gp, 30, w - 30); const gt = nice(glo - gp, ghi + gp, 4);
  const y1 = 78, y2 = 122;
  const pd = at(iD, 1.4, 2.6);

  // bottom: the difference scale
  const lo = Math.min(0, v.lower), hi = Math.max(0, v.upper), dp = (hi - lo) * 0.14;
  const X = lin(lo - dp, hi + dp, 30, w - 30); const ticks = nice(lo - dp, hi + dp, 5);
  const SP = X(v.upper) - X(v.lower);
  const yL = 322, yAx = 404;
  const pSE = at(iSE, 1.4, 2.6), pM = at(iM, 1.4, 2.8), pL = at(iB, 2.1, 2.9), pU = at(iB, 3.5, 4.3), pZ = at(iDec, 1.2, 2.2);
  const inside = 0 >= v.lower && 0 <= v.upper;
  const dir = v.lower > 0 ? `${g1} higher` : v.upper < 0 ? `${g2} higher` : '';

  // variance squares
  const sp = Math.sqrt(v.variance); const side = (s: number) => 100 * s / Math.max(v.s1, v.s2, sp);
  const sqBase = 372;
  const pS1 = k === iSq ? ramp(t, 1.4, 2.4) : 1, pS2 = k === iSq ? ramp(t, 2.8, 3.8) : 1;
  const pW = k === iPool ? ramp(t, 1.4, 2.6) : 0, pP = k === iPool ? ramp(t, 4.2, 5.4) : 0;
  const Sq: React.FC<{cx: number; s: number; color: string; p: number; top: string; lab: React.ReactNode; lab2?: React.ReactNode; p2?: number}> = ({cx, s, color, p, top, lab, lab2, p2 = 0}) => {
    const a = side(s); const hgt = a * p;
    return (<g>
      <line x1={cx - a / 2} x2={cx + a / 2} y1={sqBase} y2={sqBase} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <rect x={cx - a / 2} y={sqBase - hgt} width={a} height={hgt} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
      <Txt x={cx} y={sqBase - a - 10} size={14} anchor="middle" color={color} opacity={p}>{top}</Txt>
      <Txt x={cx} y={sqBase + 24} size={15} anchor="middle" color={color} weight={700} opacity={p}>{lab}</Txt>
      {lab2 && <Txt x={cx} y={sqBase + 46} size={14} anchor="middle" color={P.soft} opacity={p2}>{lab2}</Txt>}
    </g>);
  };

  return (<g fontFamily={inter}>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>The two groups</Txt>
    <Txt x={w - 20} y={30} size={14} anchor="end" color={P.soft}>{c.unit}</Txt>
    {/* groups: mean with a bar of +-1 SD */}
    {[[v.x1, v.s1, y1, c1, g1], [v.x2, v.s2, y2, c2, g2]].map(([x, s, y, col, nm]: any, i) => (
      <g key={i} opacity={k >= iSE && !end ? 0.55 : 1}>
        <line x1={G(x - s)} x2={G(x + s)} y1={y} y2={y} stroke={col} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
        <Dot x={G(x)} y={y} r={7} color={col} />
        <Txt x={G(x)} y={y - 14} size={15} anchor="middle" color={col} weight={700}>{`${nm} ${f7(x)}`}</Txt>
      </g>))}
    {k === iD && <g opacity={pd}>
      <RefLine x={G(v.x1)} y1={y1} y2={146} color={c1} w={1.5} /><RefLine x={G(v.x2)} y1={y2} y2={146} color={c2} w={1.5} />
    </g>}
    <Axis X={G} y={150} ticks={gt} />

    {varStep ? <g>
      <Txt x={20} y={204} size={16} weight={700} color={P.blue}>{k === iSq ? 'SD squared = variance' : 'Pooled variance'}</Txt>
      <Sq cx={75} s={v.s1} color={c1} p={pS1} top={g1} lab={<>s{sub('1')}{up(`² = ${f7(v.s1 ** 2)}`)}</>}
        lab2={<>n{sub('1')}{up(` − 1 = ${v.n1 - 1}`)}</>} p2={pW} />
      <Sq cx={w - 75} s={v.s2} color={c2} p={pS2} top={g2} lab={<>s{sub('2')}{up(`² = ${f7(v.s2 ** 2)}`)}</>}
        lab2={<>n{sub('2')}{up(` − 1 = ${v.n2 - 1}`)}</>} p2={pW} />
      {k === iPool && <Sq cx={w / 2} s={sp} color={P.blue} p={pP} top="pooled" lab={`s² = ${f7(v.variance)}`} />}
    </g> : <g>
      <Txt x={20} y={212} size={16} weight={700} color={P.blue}>Difference of means</Txt>
      <Txt x={20} y={234} size={14} color={P.soft}>{`${g1} − ${g2}`}</Txt>
      <RefLine x={X(0)} y1={262} y2={yAx} color={k === iDec || end ? (inside ? P.green : P.red) : P.faint} w={k === iDec || end ? 2.5 : 1.5} />
      {/* d grows out of zero */}
      {k === iD && <Grow x1={X(0)} y1={yL} x2={X(v.difference)} y2={yL} p={pd} color={P.ink} w={2.5} />}
      {pSE > 0 && <g opacity={pSE * (1 - pL)}>
        <line x1={X(v.difference - v.se * pSE)} x2={X(v.difference + v.se * pSE)} y1={yL + 24} y2={yL + 24} stroke={P.blue} strokeWidth={5} strokeLinecap="round" />
        {k === iSE && <Txt x={X(v.difference)} y={yL + 50} size={15} anchor="middle" color={P.blue}>s{sub('(x̄₁−x̄₂)')}{up(` = ${f7(v.se)}`)}</Txt>}
      </g>}
      {pM > 0 && <rect x={X(v.difference - v.margin * pM)} width={X(v.difference + v.margin * pM) - X(v.difference - v.margin * pM)} y={yL - 6} height={12} rx={6} fill={P.hi} />}
      {k === iM && <Txt x={w / 2} y={yL + 54} size={15} anchor="middle" color={P.soft} opacity={pM}>{`${f7(v.critical)} × ${f7(v.se)} = ${f7(v.margin)}`}</Txt>}
      {pd > 0 && <g opacity={k === iD ? ramp(t, 2.2, 2.7) : 1}>
        <Dot x={X(v.difference)} y={yL} r={7} color={P.ink} />
        <Txt x={X(v.difference)} y={yL - 24} size={16} anchor="middle" weight={700}>{`x̄₁ − x̄₂ = ${f7(v.difference)}`}</Txt>
      </g>}
      {pL > 0 && <End x={X(v.lower)} y={yL} p={pL} color={P.red} label={`L ${f7(v.lower)}`} side="left" w={w} span={SP} />}
      {pU > 0 && <End x={X(v.upper)} y={yL} p={pU} color={P.red} label={`U ${f7(v.upper)}`} side="right" w={w} span={SP} />}
      {pZ > 0 && <g opacity={pZ}>
        <Txt x={w / 2} y={270} size={16} anchor="middle" weight={700} color={inside ? P.green : P.red}>
          {inside ? '0 inside → do not reject H₀' : '0 outside → reject H₀'}</Txt>
      </g>}
      {end && dir && <Txt x={w / 2} y={yL + 64} size={15} anchor="middle" color={P.ink} weight={600}>{dir}</Txt>}
      <Axis X={X} y={yAx} ticks={ticks} />
    </g>}
  </g>);
};
export default Viz;
