import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, AxisY, Dot, Txt, ramp, lin, nice} from './_kit';
import {OnBar} from './_s19';

// Logistic regression (cases s19-chd-age, s19-oring-temperature). Top: the S curve drawn only from the case's fitted
// b0 and b1, with the probability read off at the case's x values as the steps reach them. Bottom strip by step:
// the linear predictor on the log-odds line, the odds as p over 1 - p, or the odds shrinking by e^b1 per unit of x.
// Uses c.values (b0, b1; age, eta, probability, oddsSlide, oddsExact; or p<x> keys and oddsPerDegree) and the term name in c.table.
const f = (z: number, d = 4) => String(+z.toFixed(d));
const logistic = (e: number) => 1 / (1 + Math.exp(-e));

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length; const K = k < 0 ? -1 : k === n ? 99 : k;
  const title = K >= 0 && K < n ? c.steps[k].title.toLowerCase() : '';
  const xName = c.table && c.table.rows[1] ? String(c.table.rows[1][0]) : 'x';
  // the x values the case reads the curve at
  const pts: {x: number; p: number; step: number}[] = [];
  if (v.age !== undefined && v.probability !== undefined) pts.push({x: v.age, p: v.probability, step: c.steps.findIndex(s => /probability/i.test(s.title))});
  Object.keys(v).forEach(key => { const m = key.match(/^p(\d+)$/); if (m) { const x = Number(m[1]);
    pts.push({x, p: v[key], step: c.steps.findIndex(s => s.title.includes(String(x)))}); } });
  const kEta = c.steps.findIndex(s => /linear predictor|logit/i.test(s.title)), kOdds = c.steps.findIndex(s => /odds/i.test(s.title));
  // curve range: about the middle of the S, widened to include every read-off x
  const mid = -v.b0 / v.b1, L = 2.6 / Math.abs(v.b1); const xsAll = pts.map(q => q.x);
  const lo = Math.min(mid - L, ...xsAll.map(x => x - 0.1 * L)), hi = Math.max(mid + L, ...xsAll.map(x => x + 0.1 * L));
  const X = lin(lo, hi, 70, w - 30), Y = lin(0, 1, 280, 60);
  const pC = K < 0 ? ramp(t, 0.6, 2.4) : 1;
  const N = 80; const xEnd = lo + (hi - lo) * pC;
  const d = Array.from({length: N + 1}, (_, i) => { const x = lo + (xEnd - lo) * i / N; return `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(logistic(v.b0 + v.b1 * x)).toFixed(1)}`; }).join(' ');
  const shownPts = pts.filter(q => K === 99 || (q.step >= 0 && K >= q.step));
  const pRead = (q: {step: number}) => (K === q.step ? ramp(t, 1.8, 3.2) : 1);
  const etaX = pts.length ? pts[0].x : mid;

  // bottom strip
  let strip: React.ReactNode = null;
  const lastStripK = K === 99 ? kOdds : K;
  if (lastStripK === kEta && kEta >= 0 && v.eta !== undefined) {
    const E = lin(-4, 4, 50, w - 50); const p = K === 99 ? 1 : ramp(t, 1.4, 2.6);
    strip = (<g>
      <Txt x={20} y={360} size={15} weight={700} color={P.blue}>log odds</Txt>
      <Axis X={E} y={402} ticks={[-4, -2, 0, 2, 4]} />
      <g opacity={p}><Dot x={E(v.eta)} y={402} r={7} color={P.red} />
        <Txt x={E(v.eta)} y={388} size={15} anchor="middle" weight={700} color={P.red}>{`logit(p) = ${f(v.eta, 5)}`}</Txt></g>
    </g>);
  } else if (lastStripK === kOdds && kOdds >= 0 && v.probability !== undefined) {
    const pr = Math.round(v.probability * 100) / 100; const B = lin(0, 1, 40, w - 40); const p = K === 99 ? 1 : ramp(t, 1.2, 2.2);
    strip = (<g opacity={p}>
      <Txt x={20} y={358} size={15} weight={700} color={P.blue}>p against 1 − p</Txt>
      <rect x={B(0)} y={368} width={B(pr) - B(0)} height={28} rx={4} fill={P.red} opacity={0.85} />
      <rect x={B(pr)} y={368} width={B(1) - B(pr)} height={28} rx={4} fill={P.faint} opacity={0.7} />
      <OnBar x={(B(0) + B(pr)) / 2} y={388} size={15} anchor="middle">{f(pr, 2)}</OnBar>
      <OnBar x={(B(pr) + B(1)) / 2} y={388} size={15} anchor="middle">{f(1 - pr, 2)}</OnBar>
      {v.oddsSlide !== undefined && <Txt x={w / 2} y={420} size={16} anchor="middle" weight={700} color={P.ink}>{`odds ${f(v.oddsSlide, 2)} : 1`}</Txt>}
      {v.oddsExact !== undefined && <Txt x={w / 2} y={440} size={14} anchor="middle" color={P.soft}>{`unrounded ${f(v.oddsExact, 2)} : 1`}</Txt>}
    </g>);
  } else if (lastStripK === kOdds && kOdds >= 0 && v.oddsPerDegree !== undefined) {
    // odds at the first read-off x and the next four units: each bar is e^b1 times the one before
    const x0 = pts.length ? Math.min(...pts.map(q => q.x)) : Math.round(mid); const xs = [0, 1, 2, 3, 4].map(i => x0 + i);
    const odds = xs.map(x => Math.exp(v.b0 + v.b1 * x)); const top = Math.max(...odds); const bw = 44, gap = 26, x1 = (w - (5 * bw + 4 * gap)) / 2;
    const hgt = (o: number) => 40 * o / top;
    strip = (<g>
      <Txt x={20} y={360} size={15} weight={700} color={P.blue}>odds of failure</Txt>
      <Txt x={w - 20} y={360} size={15} anchor="end" weight={700} color={P.ink}>{`× ${f(v.oddsPerDegree, 4)} per unit`}</Txt>
      {xs.map((x, i) => { const p = K === 99 ? 1 : ramp(t, 1.2 + i * 0.5, 1.8 + i * 0.5); const bx = x1 + i * (bw + gap);
        return (<g key={i} opacity={p}>
          <rect x={bx} y={424 - hgt(odds[i])} width={bw} height={hgt(odds[i])} rx={3} fill={P.red} opacity={0.85 - i * 0.1} />
          <Txt x={bx + bw / 2} y={442} size={14} anchor="middle" color={P.soft}>{String(x)}</Txt>
          <Txt x={bx + bw / 2} y={418 - hgt(odds[i])} size={14} anchor="middle" weight={700} color={P.red}>{f(odds[i], 2)}</Txt>
        </g>); })}
    </g>);
  }

  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Fitted probability</Txt>
    <AxisY Y={Y} x={70} ticks={[0, 0.25, 0.5, 0.75, 1]} />
    <Axis X={X} y={286} ticks={nice(lo, hi, 5)} label={xName} />
    <line x1={X(lo)} x2={X(hi)} y1={Y(0.5)} y2={Y(0.5)} stroke={P.line} strokeDasharray="3 4" />
    <path d={d} fill="none" stroke={P.blue} strokeWidth={3.5} strokeLinecap="round" />
    {K === kEta && kEta >= 0 && <line x1={X(etaX)} x2={X(etaX)} y1={Y(0)} y2={Y(1)} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" opacity={ramp(t, 0.9, 1.6)} />}
    {shownPts.map((q, i) => { const p = pRead(q); const yq = Y(q.p);
      return (<g key={i}>
        <line x1={X(q.x)} x2={X(q.x)} y1={Y(0)} y2={Y(0) + (yq - Y(0)) * Math.min(1, p * 2)} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" />
        <line x1={X(q.x)} x2={X(q.x) + (X(lo) - X(q.x)) * Math.max(0, p * 2 - 1)} y1={yq} y2={yq} stroke={P.red} strokeWidth={2} strokeDasharray="5 4" opacity={p > 0.5 ? 1 : 0} />
        <Dot x={X(q.x)} y={yq} r={7} color={P.red} opacity={Math.min(1, p * 2)} />
        <Txt x={X(q.x) + (X(q.x) > w / 2 ? -10 : 10)} y={yq + (q.p > 0.5 ? -12 : 22)} anchor={X(q.x) > w / 2 ? 'end' : 'start'} size={15} weight={700} color={P.red} opacity={p}>{`p = ${f(q.p, 4)}`}</Txt>
      </g>); })}
    <line x1={20} x2={w - 20} y1={336} y2={336} stroke={P.line} />
    {strip}
  </g>);
};
export default Viz;
