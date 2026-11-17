import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, lin, ramp} from './_kit';
import {Head, XAxis, DotHist, span, f6, mn, wAt, avgRanks} from './_s24';

// Wilcoxon signed-rank test with the W table. Uses c.values (before, after, differences, n, W, critical, reject).
// Before-after lines, one bar per person for the difference (a zero difference is dropped), bars turning into signed
// ranks, the signed ranks laid end to end into W, and the decision on the distribution of W over all 2^n sign patterns.
const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length; const title = k >= 0 && k < n ? c.steps[k].title : '';
  if (/hypothes/i.test(title)) return null;
  const b: number[] = v.before, a: number[] = v.after, d: number[] = v.differences; const m = d.length;
  const keep = d.map(x => x !== 0); const nz = d.filter(x => x !== 0);
  const rk0 = avgRanks(nz.map(Math.abs)); const rk: (number | null)[] = []; let q = 0; d.forEach(x => rk.push(x !== 0 ? rk0[q++] : null));
  const sr = d.map((x, j) => rk[j] === null ? 0 : Math.sign(x) * (rk[j] as number));
  const W = v.W, crit = v.critical;

  if (k < 0) { const all = [...b, ...a]; const tk = span(Math.min(...all), Math.max(...all), 5); const Y = lin(tk[0], tk[tk.length - 1], 390, 90);
    return (<g fontFamily={inter}><Head title="Each person measured twice" sub={c.unit} />
      <line x1={90} x2={90} y1={Y(tk[0])} y2={Y(tk[tk.length - 1])} stroke={P.faint} strokeWidth={1.5} />
      {tk.map(x => <g key={x}><line x1={85} x2={90} y1={Y(x)} y2={Y(x)} stroke={P.faint} /><text x={82} y={Y(x) + 4} fontSize={14} fill={P.soft} textAnchor="end">{x}</text></g>)}
      {b.map((x, j) => <g key={j}><line x1={150} x2={310} y1={Y(x)} y2={Y(a[j])} stroke={a[j] > x ? P.blue : a[j] < x ? P.red : P.faint} strokeWidth={2} />
        <circle cx={150} cy={Y(x)} r={5} fill={P.group[1]} /><circle cx={310} cy={Y(a[j])} r={5} fill={P.group[0]} /></g>)}
      <Txt x={150} y={420} size={15} anchor="middle" weight={700} color={P.group[1]}>before</Txt>
      <Txt x={310} y={420} size={15} anchor="middle" weight={700} color={P.group[0]}>after</Txt></g>); }

  const XP = (j: number) => 40 + (j + 0.5) * 320 / m; const bw = Math.min(30, 320 / m - 8);
  if (/difference/i.test(title)) { const tk = span(Math.min(0, ...d), Math.max(0, ...d), 4); const Y = lin(tk[0], tk[tk.length - 1], 380, 100);
    const pd = ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.4), px = ramp(t, wAt(c, k, 1), wAt(c, k, 1) + 0.8);
    return (<g fontFamily={inter}><Head title="One difference per person" sub={`after − before, ${c.unit}`} />
      <line x1={40} x2={40} y1={Y(tk[0])} y2={Y(tk[tk.length - 1])} stroke={P.faint} strokeWidth={1.5} />
      {tk.map(x => <g key={x}><line x1={35} x2={40} y1={Y(x)} y2={Y(x)} stroke={P.faint} /><text x={32} y={Y(x) + 4} fontSize={14} fill={P.soft} textAnchor="end">{mn(x)}</text></g>)}
      <line x1={40} x2={370} y1={Y(0)} y2={Y(0)} stroke={P.soft} strokeWidth={1.5} strokeDasharray="4 3" />
      {d.map((x, j) => { const y1 = Y(x * pd); return (<g key={j}>
        <rect x={XP(j) - bw / 2} y={Math.min(Y(0), y1)} width={bw} height={Math.abs(Y(0) - y1)} rx={3} fill={x > 0 ? P.blue : P.red} opacity={0.8} />
        {x === 0 && <g opacity={px}><Txt x={XP(j)} y={Y(0) + 6} size={16} anchor="middle" weight={700} color={P.red}>✕</Txt>
          <Txt x={XP(j)} y={Y(0) - 16} size={13} anchor="middle" color={P.red}>dropped</Txt></g>}
        {x !== 0 && pd > 0.95 && <Txt x={XP(j)} y={x > 0 ? y1 - 6 : y1 + 18} size={14} anchor="middle" weight={700}>{(x > 0 ? '+' : '') + mn(x)}</Txt>}
      </g>); })}
      <Txt x={200} y={440} size={14} anchor="middle" color={P.soft}>person 1 to {m}</Txt></g>); }

  if (/Rank/i.test(title)) { const maxR = Math.max(...rk0); const Y = lin(-maxR, maxR, 390, 90);
    const pa = ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.2), ps = ramp(t, wAt(c, k, c.steps[k].work.length - 1), wAt(c, k, c.steps[k].work.length - 1) + 1.2);
    return (<g fontFamily={inter}><Head title={ps > 0.5 ? 'Signed ranks' : 'Rank of each size'} />
      <line x1={40} x2={370} y1={Y(0)} y2={Y(0)} stroke={P.soft} strokeWidth={1.5} strokeDasharray="4 3" />
      {d.map((x, j) => { if (rk[j] === null) return <Txt key={j} x={XP(j)} y={Y(0) + 5} size={15} anchor="middle" color={P.red}>✕</Txt>;
        const r = rk[j] as number; const h = r * pa * (ps > 0 ? (1 - ps) + ps * Math.sign(x) : 1); const y1 = Y(h); const neg = h < 0;
        const tied = r !== Math.round(r);
        return (<g key={j}><rect x={XP(j) - bw / 2} y={Math.min(Y(0), y1)} width={bw} height={Math.abs(Y(0) - y1)} rx={3} fill={ps > 0.5 ? (x > 0 ? P.blue : P.red) : P.faint} opacity={0.85} />
          {pa > 0.95 && <Txt x={XP(j)} y={neg ? y1 + 18 : y1 - 6} size={14} anchor="middle" weight={700} color={tied ? '#b8900a' : P.ink}>{ps > 0.5 ? (x > 0 ? '+' : '−') + f6(r) : f6(r)}</Txt>}
          <Txt x={XP(j)} y={Y(-maxR) + 36} size={13} anchor="middle" color={P.soft}>{`|${Math.abs(x)}|`}</Txt></g>); })}
    </g>); }

  // all 2^n sign patterns of the untied ranks 1..n (the table is built from them)
  const nn = nz.length; const pats: number[] = []; const tot = nn * (nn + 1) / 2;
  for (let mask = 0; mask < 2 ** nn; mask++) { let s = 0; for (let r = 1; r <= nn; r++) s += (mask >> (r - 1)) & 1 ? r : -r; pats.push(s); }
  if (/Compute W/i.test(title)) { const X = lin(-tot, tot, 30, 370); let acc = 0; const order = sr.filter(x => x !== 0);
    const pw = ramp(t, wAt(c, k, 0) + 1, wAt(c, k, 0) + 1.6);
    return (<g fontFamily={inter}><Head title="Signed ranks add up to W" />
      {order.map((x, j) => { const p = ramp(t, wAt(c, k, 0) - 0.6 + j * 0.25, wAt(c, k, 0) - 0.3 + j * 0.25); const a0 = acc; acc += x; const y = 90 + j * (230 / order.length);
        return (<g key={j} opacity={p > 0 ? 1 : 0}><line x1={X(a0)} x2={X(a0 + x * p)} y1={y} y2={y} stroke={x > 0 ? P.blue : P.red} strokeWidth={9} strokeLinecap="round" />
          {p > 0.95 && <Txt x={x > 0 ? X(a0 + x) + 8 : X(a0 + x) - 8} y={y + 5} size={14} anchor={x > 0 ? 'start' : 'end'} weight={700} color={x > 0 ? P.blue : P.red}>{(x > 0 ? '+' : '−') + f6(Math.abs(x))}</Txt>}</g>); })}
      <XAxis X={X} y={350} ticks={span(-tot, tot, 4).filter(x => Math.abs(x) <= tot)} label="W" />
      <g opacity={pw}><line x1={X(W)} x2={X(W)} y1={330} y2={350} stroke={'#b8900a'} strokeWidth={3} /><circle cx={X(W)} cy={350} r={7} fill={P.hiSolid} stroke="#b8900a" />
        <Txt x={X(W)} y={412} size={17} anchor="middle" weight={700}>{`W = ${mn(W)}`}</Txt></g></g>); }
  // decision and conclusion
  const pr = k === n ? 1 : ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1);
  return (<g fontFamily={inter}><Head title={`Critical value |W| ≥ ${f6(crit)}`} />
    <DotHist vals={pats} t={t} rej={pr > 0.5 ? (x => Math.abs(x) >= crit) : undefined} obs={W} label="W" name="W" reject={v.reject} showDecision={k === n || ramp(t, wAt(c, k, 1), wAt(c, k, 1) + 0.5) > 0.5} /></g>);
};
export default Viz;
