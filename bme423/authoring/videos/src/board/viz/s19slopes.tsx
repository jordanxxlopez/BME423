import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, AxisY, Txt, ramp, lin, nice} from './_kit';

// Comparing two regression slopes (case s19-plutonian-slopes).
// Top: each slope as the rise over one unit of x, with a fan of plus or minus one SE; the gap between them is b_M - b_F.
// Bottom: the SE of the difference as the long side of a right triangle (variances add), then t as a count of SEs
// against the class cutoff. Uses c.values (bM, sbM, bF, sbF, difference, seDiff, t, critical) and c.unit.
const f = (z: number, d = 4) => String(+z.toFixed(d));

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length;
  const at = (re: RegExp) => c.steps.findIndex(s => re.test(s.title.toLowerCase()));
  const kRead = at(/read/), kDiff = at(/slope difference/), kSE = at(/se of the difference|standard error of the difference/), kT = at(/t statistic/), kDec = at(/decide/);
  const K = k < 0 ? -1 : k === n ? 99 : k;
  const groups = c.table ? c.table.rows.map((r: any[]) => String(r[0])) : ['group 1', 'group 2'];
  // ---- slopes over one unit of x
  const yTop = Math.max(v.bM + v.sbM, v.bF + v.sbF) * 1.08;
  const X = lin(0, 1, 70, 250), Y = lin(0, yTop, 214, 64);
  const lines = [{b: v.bM, s: v.sbM, col: P.group[0], nm: groups[0]}, {b: v.bF, s: v.sbF, col: P.group[1], nm: groups[1]}];
  const pLine = (i: number) => K === kRead ? ramp(t, 0.9 + i * 1.4, 1.9 + i * 1.4) : K < 0 ? 1 : 1;
  const pFan = K === kRead ? ramp(t, 3.4, 4.2) : 1;
  const pD = K === kDiff ? ramp(t, 1.4, 2.4) : K > kDiff ? 1 : 0;
  const hiB = Math.max(v.bM, v.bF), loB = Math.min(v.bM, v.bF);
  const slopes = (<g>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Rise per unit of x</Txt>
    <AxisY Y={Y} x={X(0)} ticks={nice(0, yTop, 4)} />
    <line x1={X(0)} x2={X(1)} y1={Y(0)} y2={Y(0)} stroke={P.faint} strokeWidth={1.5} />
    <Txt x={X(0)} y={Y(0) + 20} size={14} anchor="middle" color={P.soft}>0</Txt>
    <Txt x={X(1)} y={Y(0) + 20} size={14} anchor="middle" color={P.soft}>+1</Txt>
    {lines.map((l, i) => <g key={i} opacity={Math.min(1, pLine(i) * 2)}>
      {K >= kRead && <polygon points={`${X(0)},${Y(0)} ${X(1)},${Y(l.b + l.s)} ${X(1)},${Y(l.b - l.s)}`} fill={l.col} opacity={0.16 * pFan} />}
      <line x1={X(0)} y1={Y(0)} x2={X(0) + (X(1) - X(0)) * pLine(i)} y2={Y(0) + (Y(l.b) - Y(0)) * pLine(i)} stroke={l.col} strokeWidth={3.5} strokeLinecap="round" />
      <Txt x={X(1) + 8} y={Y(l.b) + (l.b === hiB ? -2 : 14)} size={15} weight={700} color={l.col} opacity={pLine(i)}>{f(l.b)}</Txt>
      <Txt x={X(1) + 8} y={Y(l.b) + (l.b === hiB ? -20 : 32)} size={14} color={l.col} opacity={pLine(i)}>{l.nm}</Txt>
    </g>)}
    {pD > 0 && <g opacity={pD}>
      <line x1={X(1) + 72} x2={X(1) + 72} y1={Y(hiB)} y2={Y(loB)} stroke={P.red} strokeWidth={3} />
      <line x1={X(1) + 3} x2={X(1) + 76} y1={Y(hiB)} y2={Y(hiB)} stroke={P.red} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={X(1) + 3} x2={X(1) + 76} y1={Y(loB)} y2={Y(loB)} stroke={P.red} strokeWidth={1} strokeDasharray="3 3" />
      <Txt x={X(1) + 80} y={(Y(hiB) + Y(loB)) / 2 + 5} size={15} weight={700} color={P.red}>{f(v.difference)}</Txt>
    </g>}
  </g>);

  // ---- bottom: SE triangle or the t ruler
  let bottom: React.ReactNode = null;
  if (K === kSE || (K > kDiff && K < kT)) {
    const S = 230 / Math.max(v.sbM, v.sbF, v.seDiff); const ox = 70, oy = 410; const a = v.sbM * S, b = v.sbF * S;
    const pA = ramp(t, 1.4, 2.2), pB = ramp(t, 2.2, 3.0), pH = ramp(t, 3.0, 4.0);
    // legs along x (male SE) and up (female SE); the hypotenuse is the SE of the difference
    const horiz = a >= b ? {len: a, s: v.sbM, col: P.group[0]} : {len: b, s: v.sbF, col: P.group[1]};
    const vert = a >= b ? {len: b, s: v.sbF, col: P.group[1]} : {len: a, s: v.sbM, col: P.group[0]};
    const L = Math.min(horiz.len, 300), H = Math.min(vert.len, 160);
    bottom = (<g>
      <Txt x={20} y={262} size={15} weight={700} color={P.blue}>SEs add as squares</Txt>
      {/* the larger SE along x, the smaller one up */}
      <line x1={ox} y1={oy} x2={ox + L * pA} y2={oy} stroke={horiz.col} strokeWidth={4} strokeLinecap="round" />
      <Txt x={ox + L / 2} y={oy + 22} size={15} anchor="middle" color={horiz.col} weight={600} opacity={pA}>{f(horiz.s)}</Txt>
      <line x1={ox + L} y1={oy} x2={ox + L} y2={oy - H * pB} stroke={vert.col} strokeWidth={4} strokeLinecap="round" />
      <Txt x={ox + L + 10} y={oy - H / 2 + 5} size={15} color={vert.col} weight={600} opacity={pB}>{f(vert.s)}</Txt>
      <line x1={ox} y1={oy} x2={ox + L * pH} y2={oy - H * pH} stroke={P.ink} strokeWidth={4} strokeLinecap="round" />
      <Txt x={ox + L / 2 - 14} y={oy - H / 2 - 8} size={16} anchor="end" weight={700} color={P.ink} opacity={pH}>{f(v.seDiff)}</Txt>
      <path d={`M${ox + L - 12},${oy} L${ox + L - 12},${oy - 12} L${ox + L},${oy - 12}`} fill="none" stroke={P.faint} strokeWidth={1.5} opacity={pB} />
    </g>);
  } else if (K >= kT) {
    const tMax = Math.max(v.t, v.critical) * 1.25; const XT = lin(0, tMax, 40, w - 40); const yb = 350;
    const pT = K === kT ? ramp(t, 1.6, 3.0) : 1; const whole = Math.floor(v.t);
    const pC = K >= kDec ? (K === kDec ? ramp(t, 0.9, 1.8) : 1) : 0;
    bottom = (<g>
      <Txt x={20} y={262} size={15} weight={700} color={P.blue}>Difference in SE units</Txt>
      {/* one block per whole SE, then the leftover fraction */}
      {Array.from({length: whole + 1}, (_, i) => { const a0 = i, a1 = Math.min(i + 1, v.t); const p = Math.max(0, Math.min(1, pT * v.t - i));
        return a1 > a0 && <rect key={i} x={XT(a0) + 1} y={yb - 16} width={Math.max(0, (XT(a1) - XT(a0) - 2) * Math.min(1, p))} height={32} rx={3} fill={P.red} opacity={0.75 - i * 0.12} />; })}
      <Txt x={XT(v.t * pT)} y={yb - 26} size={16} anchor="middle" weight={700} color={P.red}>{`t = ${f(v.t, 3)}`}</Txt>
      {pC > 0 && <g opacity={pC}>
        <line x1={XT(v.critical)} x2={XT(v.critical)} y1={yb - 30} y2={yb + 30} stroke={P.green} strokeWidth={3} strokeDasharray="6 4" />
        <Txt x={XT(v.critical)} y={yb + 50} size={15} anchor="middle" weight={700} color={P.green}>{`cutoff ${f(v.critical, 3)}`}</Txt>
      </g>}
      <Axis X={XT} y={yb + 66} ticks={nice(0, tMax, 4)} />
    </g>);
  }
  return (<g fontFamily={inter}>{slopes}<line x1={20} x2={w - 20} y1={240} y2={240} stroke={P.line} />{bottom}</g>);
};
export default Viz;
