import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice, Bracket} from './_kit';
import {OnBar} from './_s19';

// Margin of error for a difference in two proportions (case s19-survey-margin).
// Steps by title: proportions, difference, pool, standard error, cutoff (class table), margin, interval and decision.
// Uses c.values (m1, n1, m2, n2, p1, p2, pooled, se, critical, difference, margin, lower, upper) and the group names in c.table.
const f = (z: number, d = 4) => z.toFixed(d);

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length;
  const title = k >= 0 && k < n ? c.steps[k].title.toLowerCase() : '';
  const at = (re: RegExp) => c.steps.findIndex(s => re.test(s.title.toLowerCase()));
  const kDiff = at(/difference/), kPool = at(/pool/), kSE = at(/standard error/), kM = at(/margin/), kInt = at(/interval/);
  const K = k < 0 ? -1 : k === n ? 99 : k; // conclusion counts as after every step
  const names: string[] = c.table ? c.table.rows.map((r: any[]) => String(r[0])) : ['group 1', 'group 2'];

  // ---- top: the two sample proportions (or, on the margin step, the margin for other sample sizes)
  const X = lin(0, 1, 120, w - 40); const yA = 92, yB = 140, yAx = 168;
  const pA = K === 0 ? ramp(t, 0.9, 1.9) : K < 0 ? 1 : 1, pB = K === 0 ? ramp(t, 2.3, 3.3) : 1;
  const showPool = K >= kPool; const pPool = K === kPool ? ramp(t, 1.0, 2.0) : 1;
  const top = K === kM ? (() => {
    // the same margin at a quarter, the same and four times the sample sizes: M scales with 1/sqrt(n)
    const rows = [{lab: '¼ × n', m: v.margin * 2}, {lab: 'n', m: v.margin}, {lab: '4 × n', m: v.margin / 2}];
    const XM = lin(0, v.margin * 2, 120, w - 90); const p = ramp(t, 2.4, 3.6);
    return (<g>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Margin and sample size</Txt>
      {rows.map((r, i) => { const y = 74 + i * 40; const on = i === 1 ? 1 : p;
        return (<g key={i} opacity={on}>
          <Txt x={110} y={y + 5} size={15} anchor="end" color={P.soft}>{r.lab}</Txt>
          <rect x={120} y={y - 9} width={(XM(r.m) - 120) * (i === 1 ? ramp(t, 0.9, 2.0) : 1)} height={18} rx={4} fill={i === 1 ? P.hiSolid : P.line} />
          <Txt x={XM(r.m) + 8} y={y + 5} size={15} color={i === 1 ? P.ink : P.soft} weight={i === 1 ? 700 : 400}>{f(r.m)}</Txt>
        </g>); })}
      <Txt x={120} y={186} size={14} color={P.soft} opacity={p}>margin ∝ 1 / √n</Txt>
    </g>);
  })() : (<g>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Proportion answering yes</Txt>
    {[{y: yA, p: v.p1, m: v.m1, nn: v.n1, pr: pA, col: P.group[0], nm: names[0]}, {y: yB, p: v.p2, m: v.m2, nn: v.n2, pr: pB, col: P.group[1], nm: names[1]}].map((g, i) => (
      <g key={i}>
        <Txt x={110} y={g.y + 5} size={15} anchor="end" color={g.col} weight={600}>{g.nm}</Txt>
        <rect x={120} y={g.y - 11} width={X(1) - 120} height={22} rx={4} fill="#f1efe9" />
        <rect x={120} y={g.y - 11} width={(X(g.p) - 120) * g.pr} height={22} rx={4} fill={g.col} opacity={0.85} />
        <OnBar x={128} y={g.y + 5} size={15} anchor="start" opacity={g.pr}>{f(g.p)}</OnBar>
        {K <= 0 && <Txt x={X(1) + 4} y={g.y + 5} size={14} anchor="end" color={P.soft} opacity={g.pr}>{`${g.m}/${g.nn}`}</Txt>}
      </g>))}
    {showPool && <g opacity={pPool}>
      <line x1={X(v.pooled)} x2={X(v.pooled)} y1={yA - 22} y2={yB + 18} stroke={P.ink} strokeWidth={2} strokeDasharray="5 4" />
      <Txt x={X(v.pooled) + 6} y={yA - 24} size={14} color={P.ink}>{`p̂ = ${f(v.pooled)}`}</Txt>
    </g>}
    {K >= kDiff && <g opacity={K === kDiff ? ramp(t, 1.0, 2.0) : 1}>
      <line x1={X(v.p2)} x2={X(v.p1)} y1={yB + 20} y2={yB + 20} stroke={P.red} strokeWidth={3} />
      <line x1={X(v.p2)} x2={X(v.p2)} y1={yB + 14} y2={yB + 26} stroke={P.red} strokeWidth={2} />
      <line x1={X(v.p1)} x2={X(v.p1)} y1={yB + 14} y2={yB + 26} stroke={P.red} strokeWidth={2} />
    </g>}
    <Axis X={X} y={yAx + 10} ticks={[0, 0.5, 1]} />
  </g>);

  // ---- bottom: the difference on its own scale, its SE, the margin and the interval
  const lo = Math.min(0, v.lower) - 0.04, hi = v.upper + 0.04; const XD = lin(lo, hi, 30, w - 30);
  const yD = 330; const showD = K >= kDiff;
  const pSE = K === kSE ? ramp(t, 1.8, 2.8) : 1; const showSE = K >= kSE && K < kM;
  const pM = K === kM ? ramp(t, 0.9, 2.2) : 1; const showM = K >= kM;
  const pL = K === kInt ? ramp(t, 0.9, 1.7) : K > kInt ? 1 : 0, pU = K === kInt ? ramp(t, 2.3, 3.1) : K > kInt ? 1 : 0;
  return (<g fontFamily={inter}>
    {top}
    <line x1={20} x2={w - 20} y1={226} y2={226} stroke={P.line} />
    <Txt x={20} y={254} size={15} weight={700} color={P.blue}>{`Difference ${names[0]} − ${names[1]}`}</Txt>
    <line x1={XD(0)} x2={XD(0)} y1={yD - 46} y2={yD + 30} stroke={P.faint} strokeWidth={1.5} strokeDasharray="4 4" />
    {showD && <g opacity={K === kDiff ? ramp(t, 1.0, 2.0) : 1}>
      {showM && <rect x={XD(v.difference - v.margin * pM)} width={XD(v.difference + v.margin * pM) - XD(v.difference - v.margin * pM)} y={yD - 7} height={14} rx={7} fill={P.hi} />}
      <Dot x={XD(v.difference)} y={yD} r={7} color={P.red} />
      <Txt x={XD(v.difference)} y={yD - 20} size={16} anchor="middle" weight={700} color={P.red}>{`p̂₁ − p̂₂ = ${f(v.difference)}`}</Txt>
    </g>}
    {showSE && <g opacity={pSE}>
      <line x1={XD(v.difference - v.se)} x2={XD(v.difference + v.se)} y1={yD + 24} y2={yD + 24} stroke={P.blue} strokeWidth={5} strokeLinecap="round" />
      <Txt x={XD(v.difference)} y={yD + 50} size={15} anchor="middle" color={P.blue}>{`SE ${f(v.se)}`}</Txt>
    </g>}
    {K === kM && <Txt x={XD(v.difference)} y={yD + 50} size={15} anchor="middle" color={P.ink} opacity={ramp(t, 1.6, 2.4)}>{`${f(v.critical, 3)} × ${f(v.se)} = ${f(v.margin)}`}</Txt>}
    {pL > 0 && <Bracket x={XD(v.lower)} y={yD} p={pL} color={P.green} label={f(v.lower)} side="left" />}
    {pU > 0 && <Bracket x={XD(v.upper)} y={yD} p={pU} color={P.green} label={f(v.upper)} side="right" />}
    <Axis X={XD} y={410} ticks={nice(lo, hi, 4)} />
  </g>);
};
export default Viz;
