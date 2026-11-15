// Distance measures (Session 22): two points, the coordinate differences as the legs of a right triangle,
// the Euclidean hypotenuse, the Manhattan path along the legs, and the three distances compared as bars.
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Dot, Txt, ramp} from './_kit';
import {Axes2, f5, frame2} from './_s22';

const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const q: number[] = v.q, r: number[] = v.r; const steps = c.steps;
  const D = q.map((x, i) => Math.abs(x - r[i]));
  const d1 = D.reduce((s, x) => s + x, 0), d2 = Math.sqrt(D.reduce((s, x) => s + x * x, 0)), d3 = Math.cbrt(D.reduce((s, x) => s + x ** 3, 0));
  const big = Math.max(...D);
  const idx = (re: RegExp) => { const i = steps.findIndex(s => re.test(s.title)); return i < 0 ? Infinity : i; };
  const at = (s: number, j = 0) => workAt(steps[s].general.length, j);
  const prog = (s: number, a = 0, b = 0.9) => (k > s ? 1 : k === s ? ramp(t, at(s) + a, at(s) + b) : 0);
  const sDiff = idx(/difference/i), sEu = idx(/euclid/i), sMan = idx(/manhattan/i), sMin = idx(/minkowski/i), sCmp = idx(/compare/i);
  const pLeg = prog(sDiff), pLeg2 = k > sDiff ? 1 : k === sDiff ? ramp(t, at(sDiff, 1), at(sDiff, 1) + 0.9) : 0;
  const pEu = prog(sEu), pMan = prog(sMan), pMin = prog(sMin, 0.3, 1.2), pCmp = prog(sCmp);
  const F = frame2([q, r], {x0: 90, x1: 370, y0: 58, y1: 250}, 1, 4);
  const hx = (i: number) => String(c.table.headers[i]);
  const [qx, qy, rx, ry] = [F.X(q[0]), F.Y(q[1]), F.X(r[0]), F.Y(r[1])];
  const cx = rx, cy = qy; // corner of the right triangle
  const manOn = k === sMan; const euOn = k === sEu;
  // bars
  const bx = 84, bs = 216 / d1, by = F.bottom + 70, bh = 22, gap = 32;
  const bars = [{lab: '1', val: d1, p: pMan, col: P.red}, {lab: '2', val: d2, p: pEu, col: P.blue}, {lab: '3', val: d3, p: pMin, col: P.green}];
  return (<g fontFamily={inter}>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Two medicines in feature space</Txt>
    <Axes2 F={F} xl={hx(1)} yl={hx(2)} />
    {/* legs: the coordinate differences */}
    <line x1={qx} y1={qy} x2={qx + (cx - qx) * pLeg} y2={qy} stroke={manOn ? P.red : P.soft} strokeWidth={manOn ? 5 : 2.5} strokeDasharray={manOn ? undefined : '6 4'} />
    <line x1={cx} y1={cy} x2={cx} y2={cy + (ry - cy) * pLeg2} stroke={manOn ? P.red : P.soft} strokeWidth={manOn ? 5 : 2.5} strokeDasharray={manOn ? undefined : '6 4'} />
    {pLeg > 0 && <Txt x={qx + (cx - qx) * 0.62} y={qy - 9} size={15} anchor="middle" weight={600} opacity={pLeg} color={P.soft}>{`|q₁ − r₁| = ${D[0]}`}</Txt>}
    {pLeg2 > 0 && <Txt x={cx + 10} y={(cy + ry) / 2 + 5} size={15} weight={600} opacity={pLeg2} color={P.soft}>{`|q₂ − r₂| = ${D[1]}`}</Txt>}
    {/* Euclidean: the straight line */}
    {pEu > 0 && <line x1={qx} y1={qy} x2={qx + (rx - qx) * pEu} y2={qy + (ry - qy) * pEu} stroke={P.blue} strokeWidth={euOn ? 5 : 3} strokeLinecap="round" />}
    {pEu > 0 && <Txt x={(qx + rx) / 2 - 12} y={(qy + ry) / 2 - 10} size={15} anchor="end" weight={700} color={P.blue} opacity={pEu}>{`‖q − r‖₂ = ${f5(d2)}`}</Txt>}
    <Dot x={qx} y={qy} r={7} color={P.ink} /><Dot x={rx} y={ry} r={7} color={P.ink} />
    <Txt x={qx - 12} y={qy - 8} size={16} anchor="end" weight={700}>q</Txt>
    <Txt x={rx} y={ry - 14} size={16} anchor="middle" weight={700}>r</Txt>
    {/* the three distances as bars */}
    {bars.map((b, i) => { const y = by + i * gap; if (b.p <= 0) return null; return (<g key={i}>
      <Txt x={20} y={y + 16} size={15} weight={700} color={b.col}>{`‖q−r‖${'₀₁₂₃'[+b.lab]}`}</Txt>
      <rect x={bx} y={y} width={b.val * bs * b.p} height={bh} rx={3} fill={b.col} opacity={0.8} />
      <Txt x={bx + b.val * bs * b.p + 8} y={y + 16} size={15} weight={600} opacity={b.p}>{f5(b.val)}</Txt></g>); })}
    {pCmp > 0 && <g opacity={pCmp}>
      <line x1={bx + big * bs} x2={bx + big * bs} y1={by - 10} y2={by + 2 * gap + bh + 8} stroke={P.ink} strokeWidth={2} strokeDasharray="5 4" />
      <Txt x={bx + big * bs} y={by + 2 * gap + bh + 28} size={14} anchor="middle" color={P.soft}>{`largest |qᵢ − rᵢ| = ${big}`}</Txt></g>}
  </g>);
};
export default Viz;
