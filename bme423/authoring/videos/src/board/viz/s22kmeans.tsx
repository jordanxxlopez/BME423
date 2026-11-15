// k-means (Session 22): the entries in feature space (a number line for one feature), the centroids as diamonds,
// distance lines to both centroids, points recolored to the nearest centroid, and centroids sliding to the cluster means.
// Only the iterations in the case are drawn; centroids are the means of the case's own labels.
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Axis, Dot, Txt, lin, ramp} from './_kit';
import {Axes2, Diamond, dist, f5, frame2, placeLabels, range, textW} from './_s22';

type Ph = {ph: 'setup' | 'dist' | 'lab' | 'distlab' | 'cent' | 'check' | 'final'; it: number};

const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const steps = c.steps; const n = steps.length;
  const one = Array.isArray(v.ages);
  const pts: number[][] = one ? v.ages.map((a: number) => [a]) : v.points;
  const init: number[][] = one ? v.initial.map((a: number) => [a]) : v.initial;
  const Ls: number[][] = v.iter1Labels ? [v.iter1Labels, v.iter2Labels].filter(Boolean) : [v.labels];
  const kk = init.length;
  const CL = steps.some(s => s.work.some(l => /C_\{?\d/.test(l))) ? 'C' : 'c'; // the case writes C1, C2 (uppercase) or c1, c2
  const mean = (L: number[], j: number) => { const m = pts.filter((_, i) => L[i] === j + 1); return pts[0].map((_, d) => m.reduce((s, p) => s + p[d], 0) / m.length); };
  const Cs = [init, ...Ls.map(L => init.map((_, j) => mean(L, j)))];
  const last = Ls.length;
  const info = (s: any): Ph => { const T = s.title; const m = T.match(/iteration (\d)/i); const it = m ? +m[1] : 1;
    if (/set up/i.test(T)) return {ph: 'setup', it: 0};
    if (/check|convergence/i.test(T)) return {ph: 'check', it: m ? it : last + 1};
    if (/name/i.test(T)) return {ph: 'final', it: last + 1};
    if (/centroid/i.test(T)) return {ph: 'cent', it};
    if (/label/i.test(T) && /distance/i.test(T)) return {ph: 'distlab', it};
    if (/label/i.test(T)) return {ph: 'lab', it};
    if (/distance/i.test(T)) return {ph: 'dist', it};
    return {ph: 'final', it: last + 1}; };
  const S: Ph = k < 0 ? {ph: 'setup', it: 0} : k >= n ? {ph: 'final', it: last + 1} : info(steps[k]);
  const st = k >= 0 && k < n ? steps[k] : null; const G = st ? st.general.length : 0;
  const cIdx = Math.min(last, Math.max(0, S.it - 1));
  // centroids now (animated in a centroid step)
  const pc = S.ph === 'cent' ? ramp(t, workAt(G, 0), workAt(G, Math.max(0, (st?.work.length || 1) - 1)) + 0.8) : 0;
  const Cnow = S.ph === 'setup' ? Cs[0] : S.ph === 'final' ? Cs[last] : S.ph === 'cent' ? Cs[S.it - 1].map((a, j) => a.map((x, d) => x + (Cs[S.it][j][d] - x) * pc)) : Cs[cIdx];
  const Cdist = S.ph === 'cent' || S.ph === 'final' || S.ph === 'setup' ? null : Cs[cIdx]; // centroids the distances are measured to
  // cells mentioned in each work line: [point index, centroid index]
  const cellsOf = (line: string): [number, number][] => {
    const out: [number, number][] = [];
    if (one) { for (const m of line.matchAll(/d\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/g)) { const i = pts.findIndex(p => p[0] === +m[1]);
      const j = (Cdist || Cnow).findIndex(cc => Math.abs(cc[0] - +m[2]) < 1e-3); if (i >= 0) out.push([i, j < 0 ? 0 : j]); } }
    // d_{ij} as on the class slides (point i, centroid j), in one or two dimensions
    for (const m of line.matchAll(/d_\{?(\d)(\d)/g)) out.push([+m[1] - 1, +m[2] - 1]);
    return out; };
  // labels: before / after this step, and when each point switches
  const prevL = S.ph === 'setup' ? null : S.ph === 'dist' ? (S.it >= 2 ? Ls[S.it - 2] : null) : (S.ph === 'lab' || S.ph === 'distlab') ? (S.it >= 2 ? Ls[S.it - 2] : null) : S.ph === 'cent' ? Ls[S.it - 1] : Ls[last - 1];
  const newL = (S.ph === 'lab' || S.ph === 'distlab') ? Ls[S.it - 1] : prevL;
  const swAt = pts.map(() => Infinity);
  if (st && newL !== prevL) st.work.forEach((l, j) => { const at = workAt(G, j);
    if (/y=\(/.test(l)) pts.forEach((_, i) => { swAt[i] = Math.min(swAt[i], at); });
    for (const m of l.matchAll(/y_\{?(\d+)\}?=/g)) swAt[+m[1] - 1] = Math.min(swAt[+m[1] - 1], at); });
  pts.forEach((_, i) => { if (!isFinite(swAt[i])) swAt[i] = 0.9; });
  const labNow = (i: number) => (newL && t >= swAt[i] ? newL[i] : prevL ? prevL[i] : 0);
  const pSw = (i: number) => (newL && newL !== prevL ? ramp(t, swAt[i], swAt[i] + 0.6) : 1);
  const colOf = (lab: number) => (lab ? P.group[(lab - 1) % P.group.length] : P.ink);
  // distance table rows: time each row (and its cells) appears in this step; -1 = already there
  const showTable = Cdist !== null;
  const rowAt = pts.map(() => -1), focusAt = pts.map(() => Infinity), cellAt = pts.map(() => [Infinity, Infinity]);
  if (st && (S.ph === 'dist' || S.ph === 'distlab' || S.ph === 'check')) {
    st.work.forEach((l, j) => cellsOf(l).forEach(([i, cj]) => { if (i < pts.length) { focusAt[i] = Math.min(focusAt[i], workAt(G, j)); cellAt[i][cj] = Math.min(cellAt[i][cj], workAt(G, j)); } }));
    if (S.ph !== 'check') {
      if (one) pts.forEach((_, i) => { rowAt[i] = 0.9 + 0.12 * i; });
      else { // 2D: rows appear when computed; rows computed in earlier steps of the same iteration are already there
        const earlier = new Set<number>();
        for (let s = 0; s < k; s++) { const I = info(steps[s]); if (I.it === S.it && (I.ph === 'dist' || I.ph === 'distlab')) steps[s].work.forEach(l => cellsOf(l).forEach(([i]) => earlier.add(i))); }
        pts.forEach((_, i) => { rowAt[i] = earlier.has(i) ? -1 : focusAt[i]; });
      }
    }
  }
  const showY = S.ph === 'lab' || S.ph === 'distlab' || S.ph === 'check';
  const fmtP = (p: number[]) => (one ? f5(p[0]) : `(${p.map(f5).join(', ')})`);
  // cluster names written in a naming step (e.g. young, old)
  const nameStep = steps.find(s => /name/i.test(s.title));
  const cname = nameStep ? [...nameStep.work.join(' ').matchAll(/\\text\{(\w+)\}/g)].map(m => m[1]) : [];
  const showNames = cname.length === kk && (k >= n || (st === nameStep && t > workAt(G, 0)));

  // ---------- plot ----------
  let plot: React.ReactNode; let tableTop: number;
  if (one) {
    const xs = pts.map(p => p[0]); const lo = Math.floor((Math.min(...xs) - 3) / 10) * 10, hi = Math.ceil((Math.max(...xs) + 3) / 10) * 10;
    const X = lin(lo, hi, 40, 370); const yP = 106, yC = 80, yAx = 168;
    const focus = pts.map((_, i) => i).filter(i => isFinite(focusAt[i]) && S.ph !== 'check' || (S.ph === 'check' && isFinite(focusAt[i])));
    let lane = 0;
    plot = (<g>
      <Txt x={20} y={30} size={17} weight={700} color={P.blue}>{`k-means with k = ${kk}`}</Txt>
      {Cnow.map((cc, j) => (<g key={j}><line x1={X(cc[0])} x2={X(cc[0])} y1={yC + 10} y2={yAx} stroke={colOf(j + 1)} strokeWidth={1.5} strokeDasharray="3 4" opacity={0.6} />
        <Diamond x={X(cc[0])} y={yC} color={colOf(j + 1)} s={7} />
        {(() => { const lbl = showNames ? `${cname[j]} ${f5(cc[0])}` : `${CL}${j + 1} = ${f5(cc[0])}`; const wd = textW(lbl, 15);
          const other = Cnow.length > 1 ? X(Cnow[1 - j][0]) : X(cc[0]); const side = Math.abs(other - X(cc[0])) < wd + 10 ? (j === 0 ? -1 : 1) : 0;
          let cx = X(cc[0]) + side * (wd / 2 + 4); cx = Math.max(20 + wd / 2, Math.min(385 - wd / 2, cx));
          return <Txt x={cx} y={yC - 16} size={15} anchor="middle" weight={700} color={colOf(j + 1)}>{lbl}</Txt>; })()}</g>))}
      {focus.map(i => Cdist!.map((cc, j) => { const a = cellAt[i][j] < Infinity ? cellAt[i][j] : focusAt[i]; const y = yP + 14 + 8 * lane++;
        const g = ramp(t, a, a + 0.8); return <line key={`${i}-${j}`} x1={X(pts[i][0])} y1={y} x2={X(pts[i][0]) + (X(cc[0]) - X(pts[i][0])) * g} y2={y} stroke={colOf(j + 1)} strokeWidth={3} strokeLinecap="round" />; }))}
      {pts.map((p, i) => <Dot key={i} x={X(p[0])} y={yP} r={4.5} color={colOf(labNow(i))} opacity={0.4 + 0.6 * pSw(i)} />)}
      <Axis X={X} y={yAx} ticks={range(lo, hi, 10)} label={`${String(c.table.headers[0]).replace(/\s*x_i$/, '')} (${c.unit})`} />
    </g>);
    tableTop = 236;
  } else {
    const all = [...pts, ...Cs.flat()];
    const F = frame2(all, {x0: 90, x1: 370, y0: 56, y1: 236}, 1, 5);
    const hx = (i: number) => String(c.table.headers[i]);
    const focus = pts.map((_, i) => i).filter(i => isFinite(focusAt[i]));
    const obst = [...pts.map(p => ({x: F.X(p[0]), y: F.Y(p[1]), r: 9})), ...Cnow.map(cc => ({x: F.X(cc[0]), y: F.Y(cc[1]), r: 12}))];
    const labs = placeLabels([...Cnow.map((cc, j) => ({x: F.X(cc[0]), y: F.Y(cc[1]), text: `${CL}${j + 1}`})), ...pts.map((p, i) => ({x: F.X(p[0]), y: F.Y(p[1]), text: String(i + 1)}))],
      null, obst, {x0: F.left + 4, y0: 44, x1: 392, y1: F.bottom - 4}, 15, 13);
    plot = (<g>
      <Txt x={20} y={30} size={17} weight={700} color={P.blue}>{`k-means with k = ${kk}`}</Txt>
      <Axes2 F={F} xl={hx(1)} yl={hx(2)} />
      {S.ph === 'cent' && pts.map((p, i) => { const j = (Ls[S.it - 1][i]) - 1; return <line key={'s' + i} x1={F.X(p[0])} y1={F.Y(p[1])} x2={F.X(Cnow[j][0])} y2={F.Y(Cnow[j][1])} stroke={colOf(j + 1)} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7} />; })}
      {focus.map(i => Cdist!.map((cc, j) => { const a = cellAt[i][j] < Infinity ? cellAt[i][j] : focusAt[i]; const g = ramp(t, a, a + 0.8);
        return <line key={`${i}-${j}`} x1={F.X(pts[i][0])} y1={F.Y(pts[i][1])} x2={F.X(pts[i][0]) + (F.X(cc[0]) - F.X(pts[i][0])) * g} y2={F.Y(pts[i][1]) + (F.Y(cc[1]) - F.Y(pts[i][1])) * g} stroke={colOf(j + 1)} strokeWidth={2.5} strokeDasharray="6 4" />; }))}
      {pts.map((p, i) => (<g key={i}><Dot x={F.X(p[0])} y={F.Y(p[1])} r={7} color={colOf(labNow(i))} opacity={0.4 + 0.6 * pSw(i)} />
        <Txt x={labs[kk + i].x} y={labs[kk + i].y} size={14} anchor={labs[kk + i].a} color={P.soft}>{String(i + 1)}</Txt></g>))}
      {Cnow.map((cc, j) => (<g key={'c' + j}><Diamond x={F.X(cc[0])} y={F.Y(cc[1])} color={colOf(j + 1)} s={8} />
        <Txt x={labs[j].x} y={labs[j].y} size={15} anchor={labs[j].a} weight={700} color={colOf(j + 1)}>{`${CL}${j + 1}`}</Txt></g>))}
    </g>);
    tableTop = F.bottom + 70;
  }

  // ---------- below the plot ----------
  let below: React.ReactNode = null;
  if (showTable) {
    const rh = one ? 20 : 24; const xc = one ? [60, 190, 300, 360] : [70, 200, 300, 360];
    const sz = one ? 14 : 15;
    below = (<g>
      {['x', `d to ${CL}1`, `d to ${CL}2`, 'y'].map((h, i) => <Txt key={h} x={xc[i]} y={tableTop} size={sz} anchor={i === 0 ? 'middle' : i === 3 ? 'middle' : 'end'} weight={700} color={i === 1 ? colOf(1) : i === 2 ? colOf(2) : P.soft}>{h}</Txt>)}
      {pts.map((p, i) => { const a = rowAt[i]; if (a === Infinity) return null; const op = a < 0 ? 1 : ramp(t, a, a + 0.4); const y = tableTop + rh * (i + 1);
        const ds = Cdist!.map(cc => dist(p, cc)); const lab = labNow(i); const hiOn = isFinite(focusAt[i]) ? ramp(t, focusAt[i], focusAt[i] + 0.4) : 0;
        return (<g key={i} opacity={op}>
          <rect x={20} y={y - rh + 5} width={360} height={rh - 1} rx={3} fill={P.hi} opacity={hiOn} />
          <Txt x={xc[0]} y={y} size={sz} anchor="middle">{fmtP(p)}</Txt>
          {ds.slice(0, 2).map((dd, j) => <Txt key={j} x={xc[j + 1]} y={y} size={sz} anchor="end" weight={newL && newL[i] === j + 1 && showY ? 700 : 400}>{f5(dd)}</Txt>)}
          {showY && lab > 0 && <Txt x={xc[3]} y={y} size={sz} anchor="middle" weight={700} color={colOf(lab)} opacity={pSw(i)}>{String(lab)}</Txt>}
        </g>); })}
    </g>);
  } else {
    const prev = S.ph === 'cent' ? Cs[S.it - 1] : null; const cur = S.ph === 'cent' ? Cs[S.it] : Cnow;
    const y0 = one ? 250 : tableTop;
    const vx = Math.max(90, 60 + Math.max(...cur.map((_, j) => textW(showNames ? cname[j] : 'c1', 16))) + 14);
    below = (<g>
      {S.ph === 'cent' && <Txt x={20} y={y0} size={15} weight={700} color={P.soft}>{`iteration ${S.it}`}</Txt>}
      {cur.map((cc, j) => { const y = y0 + 32 + 32 * j; const show = S.ph === 'cent' ? ramp(t, workAt(G, j), workAt(G, j) + 0.6) : 1;
        return (<g key={j}>
          <Diamond x={30} y={y - 5} color={colOf(j + 1)} s={6} />
          <Txt x={46} y={y} size={16} weight={700} color={colOf(j + 1)}>{showNames ? `${cname[j]}` : `${CL}${j + 1}`}</Txt>
          {prev ? <><Txt x={vx} y={y} size={15}>{fmtP(prev[j])}</Txt>
            <Txt x={vx + Math.max(60, textW(fmtP(prev[j]), 15) + 4)} y={y} size={15} opacity={show}>{`→ ${fmtP(cc)}`}</Txt></>
            : <Txt x={vx} y={y} size={15}>{fmtP(cc)}</Txt>}
        </g>); })}
      {(S.ph === 'final' && k >= 0) && Ls.length > 0 && <Txt x={20} y={y0 + 32 + 32 * kk + 10} size={15} color={P.soft}>{`sizes ${init.map((_, j) => Ls[last - 1].filter(l => l === j + 1).length).join(' and ')}`}</Txt>}
    </g>);
  }
  return (<g fontFamily={inter}>{plot}{below}</g>);
};
export default Viz;
