import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 22 pages 15–16 and 22. Case "s22-medicine-distance": medicine 1 (1, 1) and medicine 4 (5, 4).
const q = [1, 1], r = [5, 4];
const dx = Math.abs(q[0] - r[0]), dy = Math.abs(q[1] - r[1]);        // 4, 3
const eu = Math.sqrt(dx ** 2 + dy ** 2);                              // 5
const man = dx + dy;                                                  // 7
const mk3 = Math.cbrt(dx ** 3 + dy ** 3);                             // 91^(1/3) = 4.49794

export const meta = {
  id: 's22-s22distance', session: 22, method: 's22distance',
  cases: {'s22-medicine-distance': [2, 3, 4, 6, 7]},
  title: 'Distance · Euclidean, Manhattan, Minkowski',
  steps: [
    {title: 'Two medicines', seconds: 6, card: [{label: 'features (arbitrary units)', note: 'medicine 1   MW 1 · pH 1\nmedicine 4   MW 5 · pH 4'}],
      caption: 'Medicine 1 is (1, 1) and medicine 4 is (5, 4) in MW and pH. A **distance** measures how different they are.'},
    {title: 'Differences', seconds: 7, card: [{label: 'coordinate differences', tex: '|q_i-r_i|,\\ i=1,\\dots,m', value: `|q₁ − r₁| = ${dx} · |q₂ − r₂| = ${dy}`, color: C.noise, note: '|q₁ − r₁| = |1 − 5| = 4\n|q₂ − r₂| = |1 − 4| = 3'}],
      caption: 'Subtract matching coordinates first. The differences are **4** in MW and **3** in pH, and every distance reuses them.'},
    {title: 'Euclidean', seconds: 7, card: [{label: 'Euclidean · ℓ2 norm', tex: 'd(q,r)=\\sqrt{\\textstyle\\sum_{i=1}^{m}(q_i-r_i)^2}', value: `√(4² + 3²) = √25 = ${eu}`, color: C.signal}],
      caption: 'Euclidean distance is the **straight line** between the points. Square the differences, add them and take the root.'},
    {title: 'Manhattan', seconds: 7, card: [{label: 'Manhattan · ℓ1 norm', tex: 'd(q,r)=\\textstyle\\sum_{i=1}^{m}|q_i-r_i|', value: `4 + 3 = ${man}`, color: C.green}],
      caption: 'Manhattan distance walks the **grid** like city blocks, so it adds the differences, 4\u00a0+\u00a03\u00a0=\u00a07.'},
    {title: 'Minkowski', seconds: 7, card: [{label: 'Minkowski · ℓp norm', tex: 'd(q,r)=\\left(\\textstyle\\sum_{i=1}^{m}|q_i-r_i|^p\\right)^{1/p}', note: 'p = 1 gives Manhattan · p = 2 gives Euclidean'}],
      caption: 'Minkowski uses a power p and a root 1/p. So **p = 1 is Manhattan** and **p = 2 is Euclidean**.'},
    {title: 'Minkowski p = 3', seconds: 7, card: [{label: 'Minkowski, p = 3', tex: '\\lVert q-r\\rVert_3=(4^3+3^3)^{1/3}', value: `91^(1/3) = ${mk3.toFixed(3)}`, color: C.purple}],
      caption: 'With p = 3, cube the differences, add them and take the cube root. So 91 to the power 1/3 gives **4.498**.'},
    {title: 'Compare', seconds: 8, card: [{label: 'compare', tex: '\\lVert q-r\\rVert_1\\ge\\lVert q-r\\rVert_2\\ge\\lVert q-r\\rVert_3', value: `7 ≥ 5 ≥ ${mk3.toFixed(3)}`, color: C.signal}],
      caption: 'Larger p puts more weight on the largest difference, so the distance **shrinks toward 4**. Small d means similar.'},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; label?: string}> = ({y, x, ticks, label}) => (
  <g fontFamily={mono}>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x - 6} x2={x} y1={y(t)} y2={y(t)} stroke={C.muted} /><text x={x - 10} y={y(t) + 5} fill={C.muted} fontSize={14} textAnchor="end">{t}</text></g>)}
    {label && <text transform={`translate(${x - 38},${(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2}) rotate(-90)`} fill={C.muted} fontSize={15} textAnchor="middle">{label}</text>}
  </g>
);

// Draw a polyline only up to fraction p of its length.
const partial = (pts: number[][], p: number) => {
  const segs = pts.slice(1).map((b, k) => Math.hypot(b[0] - pts[k][0], b[1] - pts[k][1]));
  let left = p * segs.reduce((a, b) => a + b, 0); const out = [pts[0]];
  for (let k = 0; k < segs.length; k++) {
    if (left >= segs[k]) { out.push(pts[k + 1]); left -= segs[k]; continue; }
    const t = left / segs[k]; out.push([lerp(pts[k][0], pts[k + 1][0], t), lerp(pts[k][1], pts[k + 1][1], t)]); break;
  }
  return out.map((v, k) => `${k ? 'L' : 'M'}${v[0].toFixed(1)},${v[1].toFixed(1)}`).join(' ');
};

const S22Distance: React.FC = () => (
  <Frame title={meta.title} session={22} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(0, 6, 70, 470), y = lin(0, 5, 380, 380 - 5 * 400 / 6);  // equal scale on both axes
      const P = (a: number[]) => [x(a[0]), y(a[1])];
      const [qx, qy] = P(q), [rx, ry] = P(r);
      const stairs = [[1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [5, 4]].map(P);
      const yb = lin(0, 8, 380, 100);
      const bars = [{p: 1, v: man, c: C.green, name: 'Manhattan', at: 3}, {p: 2, v: eu, c: C.signal, name: 'Euclidean', at: 2}, {p: 3, v: mk3, c: C.purple, name: 'p = 3', at: 5}];
      return (<g>
        {/* grid */}
        {[0, 1, 2, 3, 4, 5, 6].map(v => <line key={`gx${v}`} x1={x(v)} x2={x(v)} y1={y(0)} y2={y(5)} stroke={C.line} strokeWidth={1} opacity={i === 3 ? 1 : 0.5} />)}
        {[0, 1, 2, 3, 4, 5].map(v => <line key={`gy${v}`} x1={x(0)} x2={x(6)} y1={y(v)} y2={y(v)} stroke={C.line} strokeWidth={1} opacity={i === 3 ? 1 : 0.5} />)}
        <AxisX x={x} y={380} ticks={[0, 1, 2, 3, 4, 5, 6]} label="MW" />
        <AxisY y={y} x={70} ticks={[0, 1, 2, 3, 4, 5]} label="pH" />
        {/* differences as legs of a right triangle */}
        {after(tl, f, 1) && (() => { const p = prog(tl, f, 1, 1.4); return (<g>
          <line x1={qx} x2={lerp(qx, rx, Math.min(1, p * 2))} y1={qy} y2={qy} stroke={C.noise} strokeWidth={4} strokeLinecap="round" />
          {p > 0.5 && <line x1={rx} x2={rx} y1={qy} y2={lerp(qy, ry, (p - 0.5) * 2)} stroke={C.noise} strokeWidth={4} strokeLinecap="round" />}
          <Label x={x(3.3)} y={qy + 28} text={`|q₁ − r₁| = ${dx}`} color={C.noise} anchor="middle" opacity={Math.min(1, p * 2)} weight={700} />
          <Label x={rx + 12} y={y(2.5) + 5} text={`|q₂ − r₂| = ${dy}`} color={C.noise} opacity={Math.max(0, (p - 0.5) * 2)} weight={700} />
        </g>); })()}
        {/* Euclidean: straight line */}
        {after(tl, f, 2) && (() => { const p = prog(tl, f, 2, 1.4); return (<g>
          <line x1={qx} y1={qy} x2={lerp(qx, rx, p)} y2={lerp(qy, ry, p)} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
          <Label x={x(3.2)} y={y(2.15) + 6} text={`‖q − r‖₂ = ${eu}`} color={C.signal} opacity={p} weight={700} />
        </g>); })()}
        {/* Manhattan: a grid path */}
        {after(tl, f, 3) && (() => { const p = prog(tl, f, 3, 2.2); return (<g>
          <path d={partial(stairs, p)} fill="none" stroke={C.green} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
          <Label x={x(1.15)} y={y(3.55)} text={`‖q − r‖₁ = ${man}`} color={C.green} opacity={p} weight={700} />
        </g>); })()}
        {/* the two medicines */}
        {[{a: q, name: 'medicine 1', c: GROUP[0], dyl: 30}, {a: r, name: 'medicine 4', c: GROUP[1], dyl: -18}].map((m, k) => {
          const p = prog(tl, f, 0, 0.8 + k * 0.4); const [px, py] = P(m.a);
          return (<g key={k}><Glow cx={px} cy={lerp(py - 50, py, p)} r={9} color={m.c} opacity={p} />
            <Label x={px} y={py + m.dyl} text={`${m.name} (${m.a[0]}, ${m.a[1]})`} color={m.c} anchor="middle" opacity={p} /></g>);
        })}
        {/* bar panel comparing the three distances */}
        {after(tl, f, 2) && <g>
          <line x1={525} x2={740} y1={380} y2={380} stroke={C.muted} strokeWidth={1.5} />
          <Label x={632} y={86} text="distance" color={C.muted} anchor="middle" size={14} />
          {bars.map((b, k) => { if (!after(tl, f, b.at)) return null; const p = prog(tl, f, b.at, 1.2); const cx = 562 + k * 70;
            return (<g key={k}>
              <rect x={cx - 22} y={lerp(380, yb(b.v), p)} width={44} height={380 - lerp(380, yb(b.v), p)} rx={4} fill={b.c} opacity={0.9} />
              <Label x={cx} y={yb(b.v) - 10} text={b.v === mk3 ? mk3.toFixed(3) : String(b.v)} color={b.c} anchor="middle" opacity={p} weight={700} />
              <Label x={cx} y={401} text={`p = ${b.p}`} color={C.ink} anchor="middle" size={13} opacity={p} />
              {after(tl, f, 4) && b.p < 3 && <Label x={cx} y={421} text={b.name} color={b.c} anchor="middle" size={12} opacity={prog(tl, f, 4)} />}
            </g>); })}
          {after(tl, f, 6) && <g opacity={prog(tl, f, 6)}>
            <line x1={528} x2={740} y1={yb(4)} y2={yb(4)} stroke={C.noise} strokeWidth={2} strokeDasharray="6 5" />
            <Label x={522} y={yb(4) + 24} text="|q₁ − r₁| = 4" color={C.noise} anchor="end" size={13} weight={700} />
          </g>}
        </g>}
      </g>);
    }}
  </Frame>
);

export default S22Distance;
