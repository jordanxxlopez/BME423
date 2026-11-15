// Within-cluster sum of squares (Session 22). First the ages on a number line with each deviation from its centroid
// and a bar of each squared deviation (the bars add to SS_j); then tot.withinss against k, with the k = 1 total split
// into within and between, the drops between k values, and the chosen k.
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Axis, AxisY, Dot, Txt, lin, ramp} from './_kit';
import {Diamond, f5, niceStep, range, textW} from './_s22';

const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const steps = c.steps; const n = steps.length; const rows: any[][] = c.table.rows;
  const ages: number[] = [...v.ages].sort((a, b) => a - b);
  const r2 = rows.find(r => Number(r[0]) === 2)!; const sizes = String(r2[1]).split(/\s+/).map(Number);
  const groups: number[][] = []; let o = 0; for (const s of sizes) { groups.push(ages.slice(o, o + s)); o += s; }
  const cents = groups.map(g => g.reduce((s, x) => s + x, 0) / g.length);
  const sq = groups.map((g, j) => g.map(x => (x - cents[j]) ** 2)); const SS = sq.map(a => a.reduce((s, x) => s + x, 0));
  const tot = SS.reduce((s, x) => s + x, 0);
  const idx = (re: RegExp) => { const i = steps.findIndex(s => re.test(s.title)); return i < 0 ? Infinity : i; };
  const sBetween = idx(/between/i), sCompare = idx(/compare/i), sChoose = idx(/choose/i), sTotal = idx(/total/i);
  const sClu = groups.map((_, j) => idx(new RegExp(`cluster ${j + 1}`, 'i')));
  const at = (s: number, j = 0) => workAt(steps[s].general.length, Math.min(j, steps[s].work.length - 1));
  const col = (j: number) => P.group[j % P.group.length];

  if (k < sBetween || k < 0) {
    // ---------- mode A: deviations and squared deviations ----------
    const lo = Math.floor((ages[0] - 3) / 10) * 10, hi = Math.ceil((ages[ages.length - 1] + 3) / 10) * 10;
    const X = lin(lo, hi, 60, 370); const yP = 100, yAx = 172, yB0 = 362, yB1 = 250;
    const top = Math.max(...sq.flat()); const bst = niceStep(top, 4); const yt = range(0, Math.ceil(top / bst) * bst, bst); const Yb = lin(0, yt[yt.length - 1], yB0, yB1);
    // when cluster j's deviations, bars and SS appear
    const pDev = groups.map((_, j) => (k > sClu[j] ? 1 : k === sClu[j] ? ramp(t, at(sClu[j], 0), at(sClu[j], 0) + 0.8) : 0));
    const pBar = groups.map((_, j) => (k > sClu[j] ? 1 : k === sClu[j] ? ramp(t, at(sClu[j], 1) - 0.4, at(sClu[j], 1) + 0.8) : 0));
    const pSS = groups.map((_, j) => (k > sClu[j] ? 1 : k === sClu[j] ? ramp(t, at(sClu[j], 1) + 0.6, at(sClu[j], 1) + 1.2) : 0));
    const pTot = k > sTotal ? 1 : k === sTotal ? ramp(t, at(sTotal, 0), at(sTotal, 0) + 0.8) : 0;
    return (<g fontFamily={inter}>
      <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Squared deviations from each centroid</Txt>
      {cents.map((cc, j) => (<g key={j}><Diamond x={X(cc)} y={yP - 26} color={col(j)} s={7} />
        <Txt x={Math.max(20 + textW(`c${j + 1} = ${f5(cc)}`, 15) / 2, Math.min(385 - textW(`c${j + 1} = ${f5(cc)}`, 15) / 2, X(cc)))} y={yP - 42} size={15} anchor="middle" weight={700} color={col(j)}>{`c${j + 1} = ${f5(cc)}`}</Txt></g>))}
      {groups.map((g, j) => g.map((x, i) => { const y = yP + 12 + 6 * i;
        return pDev[j] > 0 ? <line key={`${j}-${i}`} x1={X(x)} y1={y} x2={X(x) + (X(cents[j]) - X(x)) * pDev[j]} y2={y} stroke={col(j)} strokeWidth={2.5} strokeLinecap="round" /> : null; }))}
      {groups.map((g, j) => g.map((x, i) => <Dot key={`p${j}-${i}`} x={X(x)} y={yP} r={4.5} color={col(j)} />))}
      <Axis X={X} y={yAx} ticks={range(lo, hi, 10)} label={`age (${String(c.unit).replace(/²$/, '')})`} />
      {/* squared deviations as bars at each age */}
      <AxisY Y={Yb} x={60} ticks={yt} />
      <Txt x={20} y={yB1 - 14} size={14} color={P.soft}>(x − c)²</Txt>
      <line x1={60} x2={370} y1={yB0} y2={yB0} stroke={P.faint} strokeWidth={1.5} />
      {groups.map((g, j) => g.map((x, i) => <rect key={`b${j}-${i}`} x={X(x) - 3} width={6} y={yB0 - (yB0 - Yb(sq[j][i])) * pBar[j]} height={(yB0 - Yb(sq[j][i])) * pBar[j]} fill={col(j)} opacity={0.85} />))}
      {SS.map((s, j) => <Txt key={'ss' + j} x={20 + 190 * j} y={404} size={16} weight={700} color={col(j)} opacity={pSS[j]}>{`SS${j + 1} = ${f5(s)}`}</Txt>)}
      {pTot > 0 && <g opacity={pTot}><rect x={16} y={418} width={250} height={28} rx={4} fill={P.hi} />
        <Txt x={20} y={438} size={16} weight={700}>{`within total = ${f5(tot)}`}</Txt></g>}
    </g>);
  }
  // ---------- mode B: tot.withinss against k ----------
  const ks = rows.map(r => Number(r[0])), tw = rows.map(r => Number(r[3]));
  const total = Number(v.totalSS ?? tw[0]); const between = total - tot; const chosen = Number(v.chosenK);
  const X = lin(ks[0] - 0.5, ks[ks.length - 1] + 0.5, 90, 370); const yst = niceStep(Math.max(...tw), 5); const yt = range(0, Math.ceil(Math.max(...tw) / yst) * yst, yst); const Y = lin(0, yt[yt.length - 1], 380, 70);
  const pB = k === sBetween ? ramp(t, at(sBetween, 1), at(sBetween, 1) + 0.9) : k > sBetween ? 1 : 0;
  const showAll = k >= sCompare; const pAll = k === sCompare ? ramp(t, at(sCompare, 0), at(sCompare, 0) + 1.0) : showAll ? 1 : 0;
  const pCh = k === sChoose ? ramp(t, at(sChoose, 0), at(sChoose, 0) + 0.8) : k > sChoose ? 1 : 0;
  const vis = (i: number) => (i < 2 ? 1 : pAll);
  const bw = 22, x2 = X(2);
  const drops = tw.slice(1).map((y, i) => tw[i] - y);
  return (<g fontFamily={inter}>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Within total against k</Txt>
    <AxisY Y={Y} x={90} ticks={yt} />
    <text x={30} y={225} fontSize={13} fill={P.soft} textAnchor="middle" fontFamily={inter} transform="rotate(-90 30 225)">tot.withinss</text>
    <Axis X={X} y={380} ticks={ks} label="number of clusters k" />
    {/* the k = 2 bar split into within and between */}
    {k === sBetween && <g opacity={pB}>
      <rect x={x2 - bw / 2} y={Y(tot)} width={bw} height={380 - Y(tot)} fill={col(0)} opacity={0.75} />
      <rect x={x2 - bw / 2} y={Y(total)} width={bw} height={Y(tot) - Y(total)} fill={P.green} opacity={0.35} stroke={P.green} strokeWidth={1.5} />
      <line x1={X(1)} x2={x2 + bw / 2} y1={Y(total)} y2={Y(total)} stroke={P.faint} strokeDasharray="4 4" />
      <Txt x={x2 + bw / 2 + 8} y={(Y(total) + Y(tot)) / 2} size={15} weight={700} color={P.green}>{`between ${f5(between)}`}</Txt>
      <Txt x={x2 + bw / 2 + 8} y={Y(tot) - 6} size={15} weight={700} color={col(0)}>{`within ${f5(tot)}`}</Txt>
    </g>}
    {showAll && <polyline points={ks.map((kk, i) => `${X(kk)},${Y(tw[i])}`).join(' ')} fill="none" stroke={P.soft} strokeWidth={2} opacity={pAll} />}
    {k > sBetween && !showAll && <line x1={X(ks[0])} y1={Y(tw[0])} x2={X(ks[1])} y2={Y(tw[1])} stroke={P.soft} strokeWidth={2} />}
    {ks.map((kk, i) => <g key={kk} opacity={vis(i)}><Dot x={X(kk)} y={Y(tw[i])} r={6} color={P.ink} /></g>)}
    {/* values table: k, tot.withinss, drop */}
    {k > sBetween && <g>
      {['k', 'tot.withinss', 'drop'].map((h, i) => <Txt key={h} x={[200, 300, 382][i]} y={112} size={14} anchor={i === 0 ? 'middle' : 'end'} weight={700} color={P.soft} opacity={i === 2 ? pAll : 1}>{h}</Txt>)}
      {ks.map((kk, i) => { const y = 136 + 22 * i; const hiOn = kk === chosen ? pCh : 0; return (<g key={'t' + kk} opacity={vis(i)}>
        <rect x={180} y={y - 16} width={206} height={21} rx={3} fill={P.hi} opacity={hiOn} />
        <Txt x={200} y={y} size={15} anchor="middle">{String(kk)}</Txt>
        <Txt x={300} y={y} size={15} anchor="end" weight={600}>{f5(tw[i])}</Txt>
        {i > 0 && <Txt x={382} y={y} size={15} anchor="end" opacity={pAll}>{f5(drops[i - 1])}</Txt>}</g>); })}
    </g>}
    {pCh > 0 && <g opacity={pCh}>
      <circle cx={X(chosen)} cy={Y(tw[ks.indexOf(chosen)])} r={14} fill="none" stroke={P.green} strokeWidth={3} />
      <Txt x={X(chosen) + 20} y={Y(tw[ks.indexOf(chosen)]) - 14} size={16} weight={700} color={P.green}>{`k = ${chosen}`}</Txt></g>}
  </g>);
};
export default Viz;
