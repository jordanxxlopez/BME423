import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, lin, ramp} from './_kit';
import {Head, XAxis, DotHist, span, f6, wAt} from './_s24';

// Mann-Whitney rank-sum test with the T table. Uses c.table (group, value, rank) and c.values (nS, nB, T, critical).
// Values fall onto one rank line, the smaller group's ranks build T, every set of nS ranks out of N builds the null
// distribution of T, and the decision marks the class-table critical values.
const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const rows: any[][] = c.table.rows; const n = c.steps.length;
  const title = k >= 0 && k < n ? c.steps[k].title : '';
  if (/hypothes/i.test(title)) return null;
  const names: string[] = Array.from(new Set(rows.map(r => String(r[0]))));
  const small = names.find(g => rows.filter(r => r[0] === g).length === v.nS) || names[0];
  const items = rows.map(r => ({g: String(r[0]), x: +r[1], r: +r[2]})); const N = items.length;
  const col = (g: string) => g === small ? P.group[1] : P.group[0];
  const T = v.T, lo = v.critical[0], hi = v.critical[1];

  // all sets of nS ranks out of 1..N (the table is built from untied ranks)
  const sums: number[] = []; const rec = (start: number, left: number, s: number) => { if (!left) { sums.push(s); return; } for (let r = start; r <= N - left + 1; r++) rec(r + 1, left - 1, s + r); };
  rec(1, v.nS, 0); const mu = v.nS * (N + 1) / 2;

  if (k < 0) { const vals = items.map(o => o.x); const tk = span(Math.min(...vals), Math.max(...vals), 4); const X = lin(tk[0], tk[tk.length - 1], 40, 360);
    return (<g fontFamily={inter}><Head title="Two groups of different people" sub={c.unit} />
      {names.map((g, gi) => { const y = 150 + gi * 110; const its = items.filter(o => o.g === g);
        return (<g key={g}><Txt x={20} y={y - 30} size={15} weight={700} color={col(g)}>{g}</Txt>
          {its.map((o, j) => { const st = its.slice(0, j).filter(q => q.x === o.x).length; return <circle key={j} cx={X(o.x)} cy={y - st * 13} r={6} fill={col(g)} />; })}</g>); })}
      <XAxis X={X} y={330} ticks={tk} /></g>);
  }
  const XR = lin(1, N, 50, 350);
  const rankLine = (pDrop: number, hiSmall: number) => {
    const vals = items.map(o => o.x); const tk = span(Math.min(...vals), Math.max(...vals), 4); const X = lin(tk[0], tk[tk.length - 1], 40, 360);
    return (<g>
      {items.map((o, j) => { const st = items.slice(0, j).filter(q => q.r === o.r).length; const p = Math.min(1, Math.max(0, pDrop * 1.6 - j * 0.06));
        const x0 = X(o.x), y0 = 110 + names.indexOf(o.g) * 40; const x1 = XR(o.r), y1 = 230 - st * 14;
        const lit = hiSmall > 0.5 && o.g === small;
        return <circle key={j} cx={x0 + (x1 - x0) * p} cy={y0 + (y1 - y0) * p} r={6.5} fill={lit ? P.hiSolid : col(o.g)} stroke={lit ? '#b8900a' : 'none'} strokeWidth={1.5} />; })}
      <line x1={XR(1) - 15} x2={XR(N) + 15} y1={244} y2={244} stroke={P.faint} strokeWidth={1.5} opacity={pDrop} />
      {Array.from(new Set(items.map(o => o.r))).map(r => { const tied = r !== Math.round(r);
        return <Txt key={r} x={XR(r)} y={266} size={tied ? 15 : 14} anchor="middle" weight={tied ? 700 : 400} color={tied ? P.red : P.soft} opacity={pDrop}>{f6(r)}</Txt>; })}
      <Txt x={200} y={292} size={14} anchor="middle" color={P.soft} opacity={pDrop}>rank, all groups together</Txt>
      {names.map((g, gi) => <Txt key={g} x={20 + gi * 150} y={76} size={14} weight={700} color={col(g)}>{`● ${g}`}</Txt>)}
    </g>);
  };
  if (/^Rank/i.test(title)) { const pd = ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.6);
    return (<g fontFamily={inter}><Head title="One rank line" />{rankLine(pd, 0)}
      {items.some(o => o.r !== Math.round(o.r)) && <Txt x={200} y={350} size={15} anchor="middle" color={P.red} weight={700} opacity={ramp(t, wAt(c, k, 1), wAt(c, k, 1) + 1)}>ties share the average rank</Txt>}</g>); }
  if (/Compute T/i.test(title)) { const pr = ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.6); const u = 260 / (N * (N + 1) / 2);
    const sm = items.filter(o => o.g === small), other = items.filter(o => o.g !== small); let acc = 0;
    const tiles = [...sm.map(o => ({...o, s: true})), ...other.map(o => ({...o, s: false}))];
    const pO = ramp(t, wAt(c, k, 1), wAt(c, k, 1) + 1);
    return (<g fontFamily={inter}><Head title="T = sum of the smaller group's ranks" />{rankLine(1, 1)}
      {tiles.map((o, j) => { const x = 50 + acc * u; acc += o.r; const p = o.s ? pr : pO;
        return <g key={j} opacity={p}><rect x={x} y={340} width={o.r * u - 2} height={26} rx={3} fill={o.s ? P.hiSolid : P.group[0]} opacity={o.s ? 1 : 0.35} />
          {o.r * u > 18 && <Txt x={x + o.r * u / 2} y={358} size={13} anchor="middle">{f6(o.r)}</Txt>}</g>; })}
      <Txt x={50} y={330} size={16} weight={700} opacity={pr}>{`T = ${f6(T)}`}</Txt>
      <Txt x={350} y={392} size={14} anchor="end" color={P.soft} opacity={pO}>{`total ${N * (N + 1) / 2} = ${N}(${N + 1})/2`}</Txt>
    </g>); }
  if (/null distribution/i.test(title)) return (<g fontFamily={inter}><Head title={`All ${sums.length} sets of ${v.nS} ranks`} />
    <DotHist vals={sums} t={t} grow={[wAt(c, k, 0), wAt(c, k, 0) + 3]} mu={mu} obs={ramp(t, wAt(c, k, 1) + 1, wAt(c, k, 1) + 1.5) > 0.5 ? T : undefined} label="T" name="T" /></g>);
  // decision and conclusion
  const pr = k === n ? 1 : ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1);
  return (<g fontFamily={inter}><Head title={`Critical values ${f6(lo)} and ${f6(hi)}`} />
    <DotHist vals={sums} t={t} rej={pr > 0.5 ? (x => x <= lo || x >= hi) : undefined} obs={T} label="T" name="T" mu={mu} reject={v.reject} showDecision={k === n || ramp(t, wAt(c, k, 1), wAt(c, k, 1) + 0.5) > 0.5} /></g>);
};
export default Viz;
