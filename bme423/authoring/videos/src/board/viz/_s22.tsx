// Session 22 helpers: feature-space frames, label placement and the K-NN panel shared by s22idea and s22knn.
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Axis, AxisY, Dot, Txt, ramp} from './_kit';

export const f5 = (v: number) => String(+v.toFixed(5));
export const dist = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));
export const niceStep = (span: number, n = 5) => { const raw = span / n; const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw) || raw; };
export const range = (lo: number, hi: number, st: number) => { const o: number[] = []; for (let v = lo; v <= hi + 1e-9; v += st) o.push(+v.toFixed(10)); return o; };
export const textW = (s: string, size = 14) => s.length * size * 0.58;

// Text with a subscript, e.g. <Sub b="d" s="1" rest=" = 7" /> inside a <Txt>.
export const Sub = (b: string, sub: string, rest = '', size = 15) => (<>{b}<tspan dy={4} fontSize={size * 0.72}>{sub}</tspan><tspan dy={-4}>{rest}</tspan></>);

export type Frame = {X: (v: number) => number; Y: (v: number) => number; xt: number[]; yt: number[]; u: number; left: number; right: number; top: number; bottom: number};
// Equal-aspect frame (one unit is the same length on both axes, so distances look right).
export const frame2 = (pts: number[][], box: {x0: number; x1: number; y0: number; y1: number}, pad = 1, nTicks = 5): Frame => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  let xl = Math.min(...xs) - pad, xh = Math.max(...xs) + pad, yl = Math.min(...ys) - pad, yh = Math.max(...ys) + pad;
  const st = niceStep(Math.max(xh - xl, yh - yl), nTicks);
  xl = Math.floor(xl / st) * st; xh = Math.ceil(xh / st) * st; yl = Math.floor(yl / st) * st; yh = Math.ceil(yh / st) * st;
  const u = Math.min((box.x1 - box.x0) / (xh - xl), (box.y1 - box.y0) / (yh - yl));
  const left = box.x0 + ((box.x1 - box.x0) - u * (xh - xl)) / 2, top = box.y0;
  const X = (v: number) => left + (v - xl) * u, Y = (v: number) => top + (yh - v) * u;
  return {X, Y, xt: range(xl, xh, st), yt: range(yl, yh, st), u, left, right: X(xh), top, bottom: Y(yl)};
};
export const Axes2: React.FC<{F: Frame; xl: string; yl: string}> = ({F, xl, yl}) => (<g>
  <Axis X={F.X} y={F.bottom} ticks={F.xt} label={xl} />
  <AxisY Y={F.Y} x={F.left} ticks={F.yt} label={yl} />
</g>);

// Puts each label next to its point on the first free side (preferring the side away from `away`).
type Box = {x0: number; y0: number; x1: number; y1: number};
export const placeLabels = (items: {x: number; y: number; text: string}[], away: [number, number] | null, obst: {x: number; y: number; r: number}[], bound: Box, size = 14, g = 11) => {
  const placed: Box[] = []; const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  return items.map(it => {
    const wd = textW(it.text, size);
    const c = {R: {x: it.x + g, y: it.y + 5, a: 'start' as const}, L: {x: it.x - g, y: it.y + 5, a: 'end' as const},
      U: {x: it.x, y: it.y - g - 2, a: 'middle' as const}, D: {x: it.x, y: it.y + g + size, a: 'middle' as const}};
    let order: (keyof typeof c)[] = ['R', 'L', 'U', 'D'];
    if (away) { const dx = it.x - away[0], dy = it.y - away[1];
      order = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? ['R', 'U', 'D', 'L'] : ['L', 'U', 'D', 'R']) : (dy >= 0 ? ['D', 'R', 'L', 'U'] : ['U', 'R', 'L', 'D']); }
    const bx = (o: {x: number; y: number; a: string}): Box => { const x0 = o.a === 'start' ? o.x : o.a === 'end' ? o.x - wd : o.x - wd / 2;
      return {x0, x1: x0 + wd, y0: o.y - size + 2, y1: o.y + 3}; };
    let best = c[order[0]];
    for (const key of order) { const o = c[key]; const b = bx(o);
      const inside = b.x0 >= bound.x0 && b.x1 <= bound.x1 && b.y0 >= bound.y0 && b.y1 <= bound.y1;
      const free = !placed.some(p => hit(p, b)) && !obst.some(q => hit({x0: q.x - q.r, x1: q.x + q.r, y0: q.y - q.r, y1: q.y + q.r}, b));
      if (inside && free) { best = o; break; } }
    placed.push(bx(best)); return best;
  });
};

export const Diamond: React.FC<{x: number; y: number; color: string; s?: number; opacity?: number}> = ({x, y, color, s = 9, opacity = 1}) => (
  <rect x={x - s} y={y - s} width={2 * s} height={2 * s} transform={`rotate(45 ${x} ${y})`} fill="#fff" fillOpacity={0.6} stroke={color} strokeWidth={3} opacity={opacity} />);

// K-NN on a feature-space scatter: the query, distance lines growing as each is computed, the K nearest ringed, then the vote.
export const KnnViz: VizC = ({c, k, t}) => {
  const v = c.values || {}; const rows: any[][] = c.table.rows; const steps = c.steps; const n = steps.length;
  const qKey = ['tomato', 'newMesh', 'q'].find(key => Array.isArray(v[key])) || 'q'; const q: number[] = v[qKey];
  const qName = qKey === 'newMesh' ? 'new mesh' : qKey;
  const pts = rows.map(r => [Number(r[1]), Number(r[2])]); const names = rows.map(r => String(r[0])); const cls = rows.map(r => String(r[3]));
  const classes = [...new Set(cls)]; const col = (s: string) => P.group[classes.indexOf(s) % P.group.length];
  const d = pts.map(p => dist(q, p)); const order = d.map((_, i) => i).sort((a, b) => d[a] - d[b]);
  const rank = d.map((_, i) => order.indexOf(i) + 1); const K = Number(v.K ?? 1); const nb = order.slice(0, K);
  const tally = classes.map(s => ({s, m: nb.filter(i => cls[i] === s).length})).filter(x => x.m > 0).sort((a, b) => b.m - a.m);
  const pred = tally[0].s;
  // when each distance line appears: -1 already drawn, a time in this step, Infinity not yet
  const isDist = (s: any) => /distance/i.test(s.title) && !/rank/i.test(s.title);
  const mentions = (line: string, i: number) => { const nm = names[i];
    return line.toLowerCase().includes(`\\text{${nm.toLowerCase()}}`) || new RegExp(`d_\\{?${nm}\\b`).test(line); };
  const lineAt = names.map((_, i) => { let at = Infinity;
    for (let s = 0; s < Math.min(k + 1, n); s++) { if (!isDist(steps[s])) continue;
      const j = steps[s].work.findIndex(l => mentions(l, i)); if (j < 0) continue;
      at = s < k ? -1 : workAt(steps[s].general.length, j); }
    if (k >= n && at === Infinity && steps.some(isDist)) at = -1; return at; });
  const firstIdx = (re: RegExp) => { const i = steps.findIndex(s => re.test(s.title)); return i < 0 ? Infinity : i; };
  const at0 = (s: number) => (s < 0 || s >= n ? 0.9 : workAt(steps[s].general.length, 0));
  const rankIdx = firstIdx(/rank|pick|most similar/i), clsIdx = firstIdx(/classify|pick/i);
  const typeIdx = firstIdx(/problem type/i); const pType = k === typeIdx ? ramp(t, at0(typeIdx), at0(typeIdx) + 0.6) : 0;
  const tallyIdx = Math.min(firstIdx(/count|neighbou?r classes/i), K > 1 ? clsIdx : Infinity);
  const prog = (idx: number, dt = 0.8) => (k > idx ? 1 : k === idx ? ramp(t, at0(idx), at0(idx) + dt) : 0);
  const pRank = prog(rankIdx), pTally = prog(tallyIdx), pCls = k === clsIdx ? ramp(t, at0(clsIdx) + 1.0, at0(clsIdx) + 1.8) : k > clsIdx ? 1 : 0;
  // layout
  const F = frame2([...pts, q], {x0: 78, x1: 380, y0: 76, y1: 262}, 1, 4);
  const hx = (i: number) => String(c.table.headers[i]).replace(/^.*?:\s*/, '');
  const qx = F.X(q[0]), qy = F.Y(q[1]);
  const labs = placeLabels([...pts.map((p, i) => ({x: F.X(p[0]), y: F.Y(p[1]), text: names[i]})), {x: qx, y: qy, text: qName}], [qx, qy],
    [...pts.map(p => ({x: F.X(p[0]), y: F.Y(p[1]), r: 13})), {x: qx, y: qy, r: 12}], {x0: F.left + 4, y0: 64, x1: 392, y1: F.bottom - 4}, 14, 20);
  const R = d[order[K - 1]] * F.u; const listY = F.bottom + 66, rowH = 22;
  let lx = 20; const lx0 = (cs: string[]) => cs.reduce((a, s) => a + 26 + textW(s, 14), 0) - 20;
  return (<g fontFamily={inter}>
    <defs><clipPath id="s22plot"><rect x={F.left} y={F.top} width={F.right - F.left} height={F.bottom - F.top} /></clipPath></defs>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Feature space</Txt>
    {pType > 0 && <rect x={14} y={38} width={lx0(classes) + 6} height={24} rx={4} fill={P.hi} opacity={pType} />}
    {classes.map(s => { const x0 = lx; lx += 26 + textW(s, 14); return (<g key={s}>
      <Dot x={x0 + 6} y={49} r={6} color={col(s)} /><Txt x={x0 + 16} y={54} size={14} color={P.soft}>{s}</Txt></g>); })}
    <Axes2 F={F} xl={hx(1)} yl={hx(2)} />
    <g clipPath="url(#s22plot)">
      {pRank > 0 && K > 1 && <circle cx={qx} cy={qy} r={R} fill="none" stroke={P.ink} strokeWidth={1.5} strokeDasharray="5 5" opacity={0.6 * pRank} />}
      {pts.map((p, i) => { const a = lineAt[i]; if (a === Infinity) return null; const g = a < 0 ? 1 : ramp(t, a, a + 0.9);
        const fade = nb.includes(i) ? 1 : 1 - 0.7 * pRank;
        return <line key={i} x1={qx} y1={qy} x2={qx + (F.X(p[0]) - qx) * g} y2={qy + (F.Y(p[1]) - qy) * g} stroke={col(cls[i])} strokeWidth={2.5} strokeDasharray="6 4" opacity={fade} />; })}
    </g>
    {pts.map((p, i) => (<g key={i}>
      {nb.includes(i) && pRank > 0 && <circle cx={F.X(p[0])} cy={F.Y(p[1])} r={13} fill="none" stroke={P.ink} strokeWidth={2.5} opacity={pRank} />}
      <Dot x={F.X(p[0])} y={F.Y(p[1])} r={7} color={col(cls[i])} />
      <Txt x={labs[i].x} y={labs[i].y} size={14} anchor={labs[i].a} color={col(cls[i])} weight={600}>{names[i]}</Txt></g>))}
    <circle cx={qx} cy={qy} r={9} fill={pCls > 0 ? col(pred) : '#fff'} fillOpacity={pCls} stroke={pCls > 0.5 ? col(pred) : P.ink} strokeWidth={3} />
    <Txt x={labs[pts.length].x} y={labs[pts.length].y} size={14} anchor={labs[pts.length].a} weight={700}>{qName}</Txt>
    {/* distance list */}
    {pts.map((_, i) => { const a = lineAt[i]; const y = listY + i * rowH; const shown = a === -1 || (a !== Infinity && t >= a + 0.4);
      const hi = nb.includes(i) ? pRank : 0;
      return (<g key={'r' + i}>
        <rect x={20} y={y - 16} width={360} height={rowH - 1} rx={4} fill={P.hi} opacity={hi} />
        <Dot x={30} y={y - 5} r={5} color={col(cls[i])} />
        <Txt x={42} y={y} size={15}>{names[i]}</Txt>
        {shown && <g opacity={a < 0 ? 1 : ramp(t, a + 0.4, a + 0.9)}><Txt x={160} y={y} size={15} color={P.soft}>d =</Txt>
          <Txt x={262} y={y} size={15} anchor="end" weight={600}>{f5(d[i])}</Txt></g>}
        {pRank > 0 && <Txt x={300} y={y} size={15} color={P.soft} opacity={pRank}>{`rank ${rank[i]}`}</Txt>}
      </g>); })}
    {pTally > 0 && (() => { let tx = 20; return tally.map(({s, m}) => { const lbl = `${s} ${m}/${K}`; const x0 = tx; tx += textW(lbl, 16) + 30;
      const win = s === pred && pCls > 0; return (<g key={s} opacity={pTally}>
        {win && <rect x={x0 - 4} y={listY + names.length * rowH + 6} width={textW(lbl, 16) + 8} height={24} rx={4} fill={P.hi} opacity={pCls} />}
        <Txt x={x0} y={listY + names.length * rowH + 24} size={16} weight={700} color={col(s)}>{lbl}</Txt></g>); }); })()}
  </g>);
};
