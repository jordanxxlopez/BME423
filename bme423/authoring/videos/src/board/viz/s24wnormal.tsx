import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, lin, ramp} from './_kit';
import {Head, XAxis, ZDecision, ZBuild, span, f6, mn, wAt, avgRanks} from './_s24';

// Wilcoxon signed-rank with the Normal approximation and ties. Uses c.values (differences, W, tieSum, varianceNoTies,
// sigmaW, zW, critical, reject). The differences, sorted sizes sharing averaged ranks, signed ranks stacking into W,
// the tie blocks (τ−1)τ(τ+1), the variance with and without ties, z_W, and the decision.
const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length; const title = k >= 0 && k < n ? c.steps[k].title : '';
  if (/hypothes/i.test(title)) return null;
  const d: number[] = v.differences.filter((x: number) => x !== 0); const m = d.length;
  const mags = d.map(Math.abs); const rk = avgRanks(mags); const sr = d.map((x, j) => Math.sign(x) * rk[j]);
  const ties = Array.from(new Set(mags)).map(x => mags.filter(y => y === x).length).filter(tau => tau > 1);

  if (k < 0 || /Compute the differences/i.test(title)) { const tk = span(Math.min(0, ...d), Math.max(0, ...d), 5); const X = lin(tk[0], tk[tk.length - 1], 30, 370);
    const pd = k < 0 ? 1 : ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.4);
    return (<g fontFamily={inter}><Head title="One change per person" sub={`after − before, ${c.unit}`} />
      <line x1={X(0)} x2={X(0)} y1={110} y2={300} stroke={P.soft} strokeDasharray="4 3" strokeWidth={1.5} />
      <Txt x={X(0)} y={100} size={14} anchor="middle" color={P.soft}>no change</Txt>
      {d.map((x, j) => { const st = d.slice(0, j).filter(y => y === x).length; const p = Math.min(1, Math.max(0, pd * 1.5 - j * 0.05));
        return <circle key={j} cx={X(x)} cy={120 + (280 - st * 15 - 120) * p} r={6} fill={x > 0 ? P.blue : P.red} opacity={p} />; })}
      <XAxis X={X} y={300} ticks={tk} /></g>); }

  if (/Rank/i.test(title)) { const srt = mags.map((x, j) => ({x, j})).sort((p, q) => p.x - q.x); const cw = 340 / m; const XS = (i: number) => 30 + (i + 0.5) * cw;
    const pa = ramp(t, wAt(c, k, 1), wAt(c, k, 1) + 1.2);
    return (<g fontFamily={inter}><Head title="Sizes sorted, ties share ranks" />
      <Txt x={20} y={110} size={14} color={P.soft}>|d|</Txt><Txt x={20} y={250} size={14} color={P.soft}>rank</Txt>
      {srt.map((o, i) => { const tied = rk[o.j] !== i + 1 || mags.filter(y => y === o.x).length > 1;
        return (<g key={i}><rect x={XS(i) - cw / 2 + 2} y={130} width={cw - 4} height={30} rx={5} fill={d[o.j] < 0 ? P.red : P.blue} opacity={0.8} />
          <Txt x={XS(i)} y={151} size={14} anchor="middle" weight={700} color="#fff">{f6(o.x)}</Txt>
          <Txt x={XS(i)} y={200} size={14} anchor="middle" color={P.soft} opacity={tied ? 1 - pa : 1}>{i + 1}</Txt>
          {tied && <Txt x={XS(i)} y={tied ? 200 + 30 * pa : 200} size={14} anchor="middle" weight={700} color="#b8900a" opacity={pa}>{f6(rk[o.j])}</Txt>}</g>); })}
      {ties.length > 0 && <Txt x={200} y={300} size={15} anchor="middle" weight={700} color="#b8900a" opacity={pa}>tied sizes get the average rank</Txt>}
    </g>); }

  if (/Compute W/i.test(title)) { const tot = m * (m + 1) / 2; const X = lin(-tot * 0.15, tot, 30, 370); let acc = 0;
    const order = sr.map(x => x).sort((p, q) => q - p); const pw = ramp(t, wAt(c, k, 0) + 0.8, wAt(c, k, 0) + 1.4);
    return (<g fontFamily={inter}><Head title="Signed ranks add up to W" />
      {order.map((x, j) => { const p = ramp(t, 0.6 + j * 0.2, 0.9 + j * 0.2); const a0 = acc; acc += x;
        return <rect key={j} x={Math.min(X(a0), X(a0 + x * p))} y={x < 0 ? 170 : 220} width={Math.abs(X(a0 + x * p) - X(a0))} height={24} rx={3}
          fill={x < 0 ? P.red : j % 2 ? P.blue : '#5f80db'} opacity={p > 0 ? 0.9 : 0} />; })}
      <Txt x={X(sr.filter(x => x > 0).reduce((p, q) => p + q, 0))} y={268} size={14} anchor="middle" color={P.blue} weight={700}>{f6(sr.filter(x => x > 0).reduce((p, q) => p + q, 0))}</Txt>
      <XAxis X={X} y={330} ticks={span(0, tot, 4).filter(x => x <= tot)} label="W" />
      <g opacity={pw}><circle cx={X(v.W)} cy={330} r={7} fill={P.hiSolid} stroke="#b8900a" /><Txt x={X(v.W)} y={400} size={17} anchor="middle" weight={700}>{`W = ${mn(v.W)}`}</Txt></g>
    </g>); }

  if (/Tie sum/i.test(title)) { const u = 16; let x0 = 40;
    return (<g fontFamily={inter}><Head title="Each tied set adds (τ − 1)τ(τ + 1)" />
      {ties.map((tau, i) => { const cnt = (tau - 1) * tau * (tau + 1); const cols = tau + 1; const x = x0; x0 += cols * u + 50; const p = ramp(t, wAt(c, k, 0) - 0.4 + i * 0.6, wAt(c, k, 0) + i * 0.6);
        return (<g key={i} opacity={p}>
          {Array.from({length: cnt}, (_, q) => <rect key={q} x={x + (q % cols) * u} y={150 + Math.floor(q / cols) * u} width={u - 3} height={u - 3} rx={2} fill={P.blue} opacity={0.75} />)}
          <Txt x={x} y={135} size={14} weight={700}>{`τ = ${tau}`}</Txt>
          <Txt x={x} y={150 + Math.ceil(cnt / cols) * u + 22} size={14} color={P.soft}>{`${tau - 1}·${tau}·${tau + 1} = ${cnt}`}</Txt></g>); })}
      <Txt x={200} y={360} size={18} anchor="middle" weight={700} color={P.blue} opacity={ramp(t, wAt(c, k, 0) + 1, wAt(c, k, 0) + 1.6)}>{`sum = ${f6(v.tieSum)}`}</Txt>
    </g>); }

  if (/standard deviation/i.test(title)) { const V0 = v.varianceNoTies, V1 = V0 - v.tieSum / 12; const X = lin(0, V0, 40, 330);
    const p0 = ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1), p1 = ramp(t, wAt(c, k, 1), wAt(c, k, 1) + 1);
    return (<g fontFamily={inter}><Head title="Ties make the variance smaller" />
      <g opacity={p0}><rect x={X(0)} y={140} width={X(V0) - X(0)} height={30} rx={4} fill={P.faint} />
        <Txt x={X(0)} y={130} size={14} color={P.soft}>no ties</Txt><Txt x={X(V0) + 6} y={161} size={15}>{f6(V0)}</Txt></g>
      <g opacity={p1}><rect x={X(0)} y={230} width={X(V1) - X(0)} height={30} rx={4} fill={P.blue} opacity={0.8} />
        <Txt x={X(0)} y={220} size={14} color={P.blue}>{`with ties, − ${f6(v.tieSum)}/12`}</Txt><Txt x={X(V1) + 6} y={251} size={15} weight={700} color={P.blue}>{f6(V1)}</Txt>
        <Txt x={200} y={340} size={18} anchor="middle" weight={700} color={P.blue}>{`σW = √${f6(V1)} = ${f6(v.sigmaW)}`}</Txt></g>
    </g>); }

  if (/Compute z/i.test(title)) return <ZBuild t={t} t0={wAt(c, k, 0)} S={v.W} mu={0} sd={v.sigmaW} z={v.zW} name="W" zname="zW" />;
  return <ZDecision t={t} z={v.zW} crit={v.critical} reject={v.reject} name="|zW|" w={w} p={k === n ? 1 : undefined} />;
};
export default Viz;
