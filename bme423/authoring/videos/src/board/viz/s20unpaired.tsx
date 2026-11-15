import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Txt, lin, nice, ramp} from './_kit';
import {TDecision, HypHead, f6, sub, niceSpan} from './_s20';

// Unpaired (pooled) t test. Two groups on the measurement scale with their SD bars (the wide spread between people),
// the variances pooled, then the 4.8 difference between means set against its standard error, and the two-sided
// decision. Uses c.values (x1, x2, s1, s2, n1, n2, pooledVariance, se, t, critical, reject) and the group names in c.table.
const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const steps = c.steps; const n = steps.length;
  const name = (i: number) => c.table?.rows?.[i]?.[0] ?? `group ${i + 1}`;
  if (k === n) return <TDecision t={t} stat={v.t} crit={v.critical} reject={v.reject} w={w} p={1} title="Decision" />;
  const title = k >= 0 ? steps[k].title : '';
  const hyp = /hypothes/i.test(title);
  if (/decision/i.test(title)) return <TDecision t={t} stat={v.t} crit={v.critical} reject={v.reject} w={w} />;
  const G = k >= 0 ? steps[k].general.length : 0; const wAt = (j: number) => 0.9 + 0.7 * G + 1.4 * j;

  if (/pool/i.test(title)) {
    // variance bars: each group's variance and the pooled value between them
    const a = v.s1 ** 2, b = v.s2 ** 2, s2 = v.pooledVariance; const X = lin(0, Math.max(a, b) * 1.12, 40, w - 40);
    const ticks = nice(0, Math.max(a, b) * 1.12, 4); const pP = ramp(t, wAt(0), wAt(0) + 1.2);
    const bar = (y: number, val: number, color: string, label: React.ReactNode, p = 1) => (<g>
      <Txt x={40} y={y - 10} size={15} color={color} weight={700}>{label}</Txt>
      <rect x={X(0)} y={y} width={(X(val) - X(0)) * p} height={22} rx={4} fill={color} opacity={0.85} /></g>);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Pooled variance</Txt>
      <Txt x={20} y={58} size={14} color={P.soft}>mmHg² scale</Txt>
      {bar(110, a, P.group[0], <>{sub('s', '1')}<tspan dy={-5}>{`²  ${f6(a)}`}</tspan></>)}
      {bar(190, b, P.group[1], <>{sub('s', '2')}<tspan dy={-5}>{`²  ${f6(b)}`}</tspan></>)}
      {bar(290, s2, P.ink, `s²  ${f6(s2)}`, pP)}
      <line x1={X(s2)} x2={X(s2)} y1={96} y2={312} stroke={P.ink} strokeDasharray="4 4" opacity={pP} />
      <Axis X={X} y={360} ticks={ticks} />
    </g>);
  }
  // measurement-scale view of the two groups
  const lo = Math.min(v.x1 - v.s1, v.x2 - v.s2), hi = Math.max(v.x1 + v.s1, v.x2 + v.s2); const pad = (hi - lo) * 0.08;
  const ticks = niceSpan(lo, hi, 5); const X = lin(ticks[0], ticks[ticks.length - 1], 40, w - 40);
  const se = /standard error/i.test(title);
  const pSD = /means and SD/i.test(title) ? ramp(t, wAt(0), wAt(1) + 0.8) : 1;
  const dimG = se ? 1 - 0.55 * ramp(t, 0.6, 1.4) : 1;
  const yr = [140, 230]; const xs = [v.x1, v.x2], ss = [v.s1, v.s2];
  const pDiff = se ? ramp(t, 1.0, 2.0) : 0, pSE = se ? ramp(t, wAt(0), wAt(0) + 1) : 0, pT = se ? ramp(t, wAt(1), wAt(1) + 0.8) : 0;
  const yD = 300, ySE = 340; const left = Math.min(v.x1, v.x2), right = Math.max(v.x1, v.x2);
  return (<g fontFamily={inter}>
    {hyp ? <HypHead h0="μ₁ = μ₂" ha="μ₁ ≠ μ₂" /> : <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{se ? 'Difference against its SE' : 'Two separate groups'}</Txt>}
    <Txt x={20} y={58} size={14} color={P.soft}>{c.unit}</Txt>
    <g opacity={dimG}>
      {[0, 1].map(i => <g key={i}>
        <Txt x={30} y={yr[i] - 34} size={15} weight={700} color={P.group[i]}>{name(i)}</Txt>
        <line x1={X(xs[i] - ss[i] * pSD)} x2={X(xs[i] + ss[i] * pSD)} y1={yr[i]} y2={yr[i]} stroke={P.group[i]} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
        <circle cx={X(xs[i])} cy={yr[i]} r={7} fill={P.group[i]} />
        <Txt x={X(xs[i])} y={yr[i] - 14} size={15} anchor="middle" weight={700}>{sub('x̄', String(i + 1), f6(xs[i]))}</Txt>
        {pSD > 0.05 && <Txt x={X(xs[i] - ss[i])} y={yr[i] + 26} size={15} anchor="start" color={P.group[i]} opacity={pSD}>{sub('s', String(i + 1), f6(ss[i]))}</Txt>}
      </g>)}
    </g>
    {se && <g>
      {[v.x1, v.x2].map((m, i) => <line key={i} x1={X(m)} x2={X(m)} y1={yr[1] + 32} y2={yD + 8} stroke={P.group[i]} strokeDasharray="4 4" opacity={pDiff} />)}
      <g opacity={pDiff}>
        <path d={`M${X(left)},${yD - 8} L${X(left)},${yD} L${X(right)},${yD} L${X(right)},${yD - 8}`} fill="none" stroke={P.ink} strokeWidth={3} />
        <Txt x={X(right) + 8} y={yD + 5} size={15} weight={700}>{`difference ${f6(Math.abs(v.x1 - v.x2))}`}</Txt>
      </g>
      <g opacity={pSE}>
        <rect x={X(left)} y={ySE - 6} width={X(left + v.se) - X(left)} height={12} rx={6} fill={P.red} opacity={0.85} />
        <Txt x={X(left + v.se) + 8} y={ySE + 5} size={15} weight={700} color={P.red}>{`SE ${f6(v.se)}`}</Txt>
      </g>
      <Txt x={w / 2} y={446} size={16} anchor="middle" weight={700} color={P.blue} opacity={pT}>{`t = ${f6(v.t)}`}</Txt>
    </g>}
    <Axis X={X} y={380} ticks={ticks} />
  </g>);
};
export default Viz;
