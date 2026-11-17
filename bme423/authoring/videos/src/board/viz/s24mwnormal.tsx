import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, lin, ramp} from './_kit';
import {Head, XAxis, ZDecision, ZBuild, span, f6, wAt, avgRanks} from './_s24';

// Mann-Whitney with the Normal approximation. Uses c.values (two data arrays, nS, nB, T, muT, sigmaT, zT, critical,
// reject) and the first data array as the group whose ranks give T (as in the case). The ranked values, then the
// exact distribution of T with its Normal curve, its mean and SD, z_T, and the two-sided decision.
const CACHE: Record<string, number[]> = {};
const exactT = (N: number, nS: number) => { const key = `${N}|${nS}`; if (CACHE[key]) return CACHE[key]; const maxS = N * (N + 1) / 2;
  const dp: number[][] = Array.from({length: nS + 1}, () => new Array(maxS + 1).fill(0)); dp[0][0] = 1;
  for (let r = 1; r <= N; r++) for (let q = Math.min(r, nS); q >= 1; q--) for (let s = maxS; s >= r; s--) dp[q][s] += dp[q - 1][s - r];
  const tot = dp[nS].reduce((a, b) => a + b, 0); return (CACHE[key] = dp[nS].map(x => x / tot)); };
const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length; const title = k >= 0 && k < n ? c.steps[k].title : '';
  if (/hypothes/i.test(title)) return null;
  const arrays = Object.entries(v).filter(([, a]) => Array.isArray(a) && (a as any[]).length > 2) as [string, number[]][];
  const [gA, A] = arrays[0], [gB, B] = arrays[1];
  const all = [...A, ...B]; const R = avgRanks(all); const N = all.length; const rA = R.slice(0, A.length);
  const T = v.T, mu = v.muT, sd = v.sigmaT;
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

  if (k < 0) { const tk = span(Math.min(...all), Math.max(...all), 5); const X = lin(tk[0], tk[tk.length - 1], 40, 360);
    return (<g fontFamily={inter}><Head title="Two groups of different infants" sub={c.unit} />
      {[A, B].map((a, gi) => <g key={gi}><Txt x={20} y={120 + gi * 110} size={15} weight={700} color={P.group[gi]}>{cap(gi ? gB : gA)}</Txt>
        {a.map((x, j) => <circle key={j} cx={X(x)} cy={160 + gi * 110} r={5} fill={P.group[gi]} opacity={0.75} />)}</g>)}
      <XAxis X={X} y={320} ticks={tk} /></g>); }

  if (/^Rank/i.test(title)) { const X = lin(1, N, 30, 370); const pd = ramp(t, 0.8, 2.6), pT = ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1);
    const tk = span(Math.min(...all), Math.max(...all), 4); const XV = lin(tk[0], tk[tk.length - 1], 40, 360);
    return (<g fontFamily={inter}><Head title={`All ${N} ranked together`} />
      {all.map((x, j) => { const gi = j < A.length ? 0 : 1; const x0 = XV(x), y0 = 110 + gi * 50, x1 = X(R[j]), y1 = 230 + (gi ? 12 : -12);
        return <circle key={j} cx={x0 + (x1 - x0) * pd} cy={y0 + (y1 - y0) * pd} r={4.5} fill={gi === 0 && pT > 0.5 ? P.hiSolid : P.group[gi]} stroke={gi === 0 && pT > 0.5 ? '#b8900a' : 'none'} />; })}
      <line x1={30} x2={370} y1={230} y2={230} stroke={P.faint} strokeWidth={1.5} opacity={pd} />
      {[1, Math.round(N / 4), Math.round(N / 2), Math.round(3 * N / 4), N].map(r => <Txt key={r} x={X(r)} y={268} size={14} anchor="middle" color={P.soft} opacity={pd}>{r}</Txt>)}
      <Txt x={200} y={290} size={14} anchor="middle" color={P.soft} opacity={pd}>rank</Txt>
      <Txt x={20} y={80} size={14} weight={700} color={P.group[0]}>{`● ${cap(gA)}`}</Txt><Txt x={200} y={80} size={14} weight={700} color={P.group[1]}>{`● ${cap(gB)}`}</Txt>
      <g opacity={pT}><Txt x={200} y={350} size={17} anchor="middle" weight={700}>{`T = ${f6(rA.reduce((a, b) => a + b, 0))}`}</Txt>
        <Txt x={200} y={378} size={15} anchor="middle" color={P.soft}>{`${cap(gB)} ${f6(N * (N + 1) / 2 - T)}, total ${N * (N + 1) / 2}`}</Txt></g>
    </g>); }

  if (/Compute z/i.test(title)) return <ZBuild t={t} t0={wAt(c, k, 0)} S={T} mu={mu} sd={sd} z={v.zT} name="T" zname="zT" />;
  if (k === n || /decision/i.test(title)) return <ZDecision t={t} z={v.zT} crit={v.critical} reject={v.reject} name="|zT|" w={w} p={k === n ? 1 : undefined} />;

  // exact distribution of T (counting subsets), the Normal curve, its mean and SD
  const pr = exactT(N, v.nS);
  const lo = mu - 4 * sd, hi = mu + 4 * sd; const tk = span(lo, hi, 5); const X = lin(tk[0], tk[tk.length - 1], 30, 370);
  const peak = Math.max(...pr); const Y = (p: number) => 330 - 200 * p / peak;
  const nd = (x: number) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
  const stage = /Normal approx/i.test(title) ? 0 : /^Mean/i.test(title) ? 1 : /Standard deviation/i.test(title) ? 2 : 3;
  const pb = stage === 0 ? ramp(t, 0.6, 2.4) : 1, pc = stage === 0 ? ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.2) : 1;
  const pm = stage === 1 ? ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1) : stage > 1 ? 1 : 0;
  const ps = stage === 2 ? ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.2) : stage > 2 ? 1 : 0;
  const curve = Array.from({length: 120}, (_, j) => tk[0] + (tk[tk.length - 1] - tk[0]) * j / 119).map((x, j) => `${j ? 'L' : 'M'}${X(x).toFixed(1)},${Y(nd(x)).toFixed(1)}`).join(' ');
  return (<g fontFamily={inter}>
    <Head title={stage === 0 ? 'Exact distribution of T is nearly Normal' : stage === 1 ? 'Center of T' : 'Spread of T'} />
    {ps > 0 && <rect x={X(mu - sd * ps)} y={110} width={X(mu + sd * ps) - X(mu - sd * ps)} height={220} fill="rgba(40,83,200,0.10)" />}
    {pr.map((p, s) => s >= tk[0] && s <= tk[tk.length - 1] && p > 0 && <rect key={s} x={X(s) - 0.5} y={330 - (330 - Y(p)) * pb} width={1} height={(330 - Y(p)) * pb} fill={P.faint} />)}
    <path d={curve} fill="none" stroke={P.blue} strokeWidth={2.5} opacity={pc} />
    <XAxis X={X} y={330} ticks={tk} label="rank sum T" />
    {pm > 0 && <g opacity={pm}><line x1={X(mu)} x2={X(mu)} y1={100} y2={330} stroke={P.blue} strokeWidth={2} />
      <Txt x={X(mu)} y={92} size={15} anchor="middle" weight={700} color={P.blue}>{`μ = ${f6(mu)}`}</Txt>
      <circle cx={X(T)} cy={330} r={7} fill={P.hiSolid} stroke="#b8900a" strokeWidth={1.5} />
      <Txt x={X(T)} y={400} size={15} anchor="middle" weight={700}>{`T = ${f6(T)}`}</Txt></g>}
    {ps > 0.95 && <Txt x={X(mu + sd) + 4} y={130} size={15} weight={700} color={P.blue}>{`σ = ${f6(sd)}`}</Txt>}
  </g>);
};
export default Viz;
