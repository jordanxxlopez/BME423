// K-NN classification (Session 23): distance lines from the new sample grow as each distance is written, the distances are
// ranked, the K nearest are ringed inside a circle, then the class vote as K-fractions. Works for any K from the case values.
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Dot, Txt, ramp} from './_kit';
import {Axes2, dist, frame2, placeLabels} from './_s22';
import {f5, textW} from './_s23';

const S23Knn: VizC = ({c, k, t}) => {
  const v = c.values || {}; const rows: any[][] = c.table.rows; const steps = c.steps; const n = steps.length;
  const q: number[] = v.newSample; const K = Number(v.K);
  const pts = rows.map(r => [Number(r[1]), Number(r[2])]); const names = rows.map(r => String(r[0])); const cls = rows.map(r => String(r[3]));
  const classes = [...new Set(cls)]; const col = (s: string) => (/benign/i.test(s) ? P.green : /malignant/i.test(s) ? P.red : P.group[classes.indexOf(s) % 4]);
  const d = pts.map(p => dist(q, p)); const order = d.map((_, i) => i).sort((a, b) => d[a] - d[b] || a - b);
  const rank = d.map((_, i) => order.indexOf(i) + 1); const nb = order.slice(0, K);
  const tally = classes.map(s => ({s, m: nb.filter(i => cls[i] === s).length})).sort((a, b) => b.m - a.m);
  const pred = tally[0].s;
  const at0 = (s: number) => workAt(steps[s].general.length, 0);
  const first = (re: RegExp) => { const i = steps.findIndex(s => re.test(s.title)); return i < 0 ? Infinity : i; };
  const prog = (idx: number, dt = 0.8, delay = 0) => (k > idx ? 1 : k === idx ? ramp(t, at0(idx) + delay, at0(idx) + delay + dt) : 0);
  // when each distance line is written: -1 earlier, a time in this step, Infinity not yet
  const isDist = (s: any) => /distance/i.test(s.title) && !/rank/i.test(s.title);
  const lineAt = names.map(nm => { let a = Infinity;
    for (let s = 0; s < Math.min(k + 1, n); s++) { if (!isDist(steps[s])) continue;
      const j = steps[s].work.findIndex(l => new RegExp(`d_\\{?${nm}\\b`).test(l)); if (j < 0) continue;
      a = s < k ? -1 : workAt(steps[s].general.length, j); }
    if (k >= n) a = -1; return a; });
  const rankIdx = first(/rank/i), nbIdx = first(/nearest|neighbou?rs/i), clsIdx = first(/classify/i);
  const pRank = prog(rankIdx), pNb = prog(nbIdx), pTally = prog(clsIdx), pCls = prog(clsIdx, 0.8, 1.0);
  // layout: feature space on top, distance list below, then the vote
  const F = frame2([...pts, q], {x0: 78, x1: 380, y0: 52, y1: 214}, 1, 4);
  const hx = (i: number) => String(c.table.headers[i]);
  const qx = F.X(q[0]), qy = F.Y(q[1]);
  // the label "new" sits up and to the left of the new sample, so it is an obstacle for the sample labels
  const labs = placeLabels(pts.map((p, i) => ({x: F.X(p[0]), y: F.Y(p[1]), text: names[i]})), [qx, qy],
    [...pts.map(p => ({x: F.X(p[0]), y: F.Y(p[1]), r: 11})), {x: qx, y: qy, r: 11}, {x: qx - 24, y: qy - 14, r: 13}], {x0: F.left + 4, y0: 44, x1: 392, y1: F.bottom - 4}, 14, 14);
  const R = d[order[K - 1]] * F.u; const listY = F.bottom + 64, rowH = 19;
  let lx = 20;
  return (<g fontFamily={inter}>
    <defs><clipPath id="s23plot"><rect x={F.left} y={F.top} width={F.right - F.left} height={F.bottom - F.top} /></clipPath></defs>
    <Txt x={20} y={28} size={17} weight={700} color={P.blue}>Feature space</Txt>
    {classes.map(s => { const x0 = lx; lx += 30 + textW(s, 14); return (<g key={s}>
      <Dot x={x0 + 170} y={23} r={6} color={col(s)} /><Txt x={x0 + 180} y={28} size={14} color={P.soft}>{s}</Txt></g>); })}
    <Axes2 F={F} xl={hx(1)} yl={hx(2)} />
    <g clipPath="url(#s23plot)">
      {pNb > 0 && <circle cx={qx} cy={qy} r={R} fill={P.hi} fillOpacity={0.25} stroke={P.ink} strokeWidth={1.5} strokeDasharray="5 5" opacity={pNb} />}
      {pts.map((p, i) => { const a = lineAt[i]; if (a === Infinity) return null; const gr = a < 0 ? 1 : ramp(t, a, a + 0.9);
        const fade = nb.includes(i) ? 1 : 1 - 0.7 * pNb;
        return <line key={i} x1={qx} y1={qy} x2={qx + (F.X(p[0]) - qx) * gr} y2={qy + (F.Y(p[1]) - qy) * gr} stroke={col(cls[i])} strokeWidth={2.5} strokeDasharray="6 4" opacity={fade} />; })}
    </g>
    {pts.map((p, i) => (<g key={i}>
      {nb.includes(i) && pNb > 0 && <circle cx={F.X(p[0])} cy={F.Y(p[1])} r={11} fill="none" stroke={P.ink} strokeWidth={2.5} opacity={pNb} />}
      <Dot x={F.X(p[0])} y={F.Y(p[1])} r={6.5} color={col(cls[i])} />
      <Txt x={labs[i].x} y={labs[i].y} size={14} anchor={labs[i].a} color={col(cls[i])} weight={700}>{names[i]}</Txt></g>))}
    <circle cx={qx} cy={qy} r={8} fill={pCls > 0 ? col(pred) : '#fff'} fillOpacity={Math.max(pCls, 1)} stroke={pCls > 0.5 ? col(pred) : P.ink} strokeWidth={3} />
    <Txt x={qx - 11} y={qy - 9} size={14} anchor="end" weight={700}>new</Txt>
    {/* distance list */}
    {pts.map((_, i) => { const a = lineAt[i]; const y = listY + i * rowH; const shown = a === -1 || (a !== Infinity && t >= a + 0.4);
      const hi = nb.includes(i) ? pNb : 0;
      return (<g key={'r' + i}>
        <rect x={16} y={y - 14} width={368} height={rowH - 1} rx={4} fill={P.hi} opacity={hi} />
        <Dot x={26} y={y - 5} r={5} color={col(cls[i])} />
        <Txt x={38} y={y} size={14} weight={600}>{names[i]}</Txt>
        <Txt x={60} y={y} size={14} color={col(cls[i])}>{cls[i]}</Txt>
        {shown && <g opacity={a < 0 ? 1 : ramp(t, a + 0.4, a + 0.9)}><Txt x={176} y={y} size={14} color={P.soft}>d =</Txt>
          <Txt x={272} y={y} size={14} anchor="end" weight={600}>{f5(d[i])}</Txt></g>}
        {pRank > 0 && <Txt x={300} y={y} size={14} color={P.soft} opacity={pRank}>{`rank ${rank[i]}`}</Txt>}
      </g>); })}
    {pTally > 0 && (() => { let tx = 20; const y = listY + pts.length * rowH + 14; return tally.filter(x => x.m > 0).map(({s, m}) => { const lbl = `${s} ${m}/${K}`; const x0 = tx; tx += textW(lbl, 16) + 26;
      const win = s === pred; return (<g key={s} opacity={pTally}>
        {win && <rect x={x0 - 4} y={y - 18} width={textW(lbl, 16) + 8} height={24} rx={4} fill={P.hi} opacity={pCls} />}
        <Txt x={x0} y={y} size={16} weight={700} color={col(s)}>{lbl}</Txt></g>); }); })()}
  </g>);
};

export default S23Knn;
