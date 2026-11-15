import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, AxisY, Dot, Txt, ramp, lin, nice} from './_kit';
import {OnBar} from './_s19';

// Multiple regression by matrix least squares (case s19-sbp-least-squares).
// Steps 0-2 (building and inverting the matrices): the data, y against each x. Step "solve": the fitted plane cut at the
// mean of the other x, drawn on each plot. Step "residual": observed against fitted with the residuals. Step "R squared":
// SS_tot split into the part the plane explains and SS_res. Uses c.table (y, x1, x2 columns) and c.values (b0, b1, b2, SSres, SStot, s, R2).
const f = (z: number, d = 4) => z.toFixed(d);
// A y-axis name set further out than the kit's, so it clears three-digit tick labels.
const YLab: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
  <text x={x} y={y} fontFamily={inter} fontSize={13} fill={P.soft} textAnchor="middle" transform={`rotate(-90 ${x} ${y})`}>{children}</text>);

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length;
  if (!c.table) return null;
  const at = (re: RegExp) => c.steps.findIndex(s => re.test(s.title.toLowerCase()));
  const kSolve = at(/solve|coefficient/), kRes = at(/residual/), kR2 = at(/r squared|r²/);
  const K = k === n ? 99 : k; // k = -1 (the question) shows the data plots
  const H = c.table.headers.map((h: string) => String(h));
  const rows: number[][] = c.table.rows.map((r: any[]) => [Number(r[1]), Number(r[2]), Number(r[3])]);
  const ys = rows.map(r => r[0]), x1 = rows.map(r => r[1]), x2 = rows.map(r => r[2]);
  const mean = (a: number[]) => a.reduce((s, z) => s + z, 0) / a.length;
  const fit = rows.map(r => v.b0 + v.b1 * r[1] + v.b2 * r[2]);
  const short = (h: string) => h.replace(/^SBP\s*/i, '').replace(/\s+[xy]\d?$/i, '');
  const range = (a: number[]) => { const lo = Math.min(...a), hi = Math.max(...a), pad = (hi - lo) * 0.08; return [lo - pad, hi + pad]; };

  const Scatter: React.FC<{xs: number[]; xi: 1 | 2; top: number; bot: number; p: number}> = ({xs, xi, top, bot, p}) => {
    const [xl, xh] = range(xs), [yl, yh] = range(ys); const X = lin(xl, xh, 80, w - 30), Y = lin(yl, yh, bot, top);
    const other = xi === 1 ? mean(x2) : mean(x1); const b = xi === 1 ? v.b1 : v.b2; const bo = xi === 1 ? v.b2 : v.b1;
    const line = (x: number) => v.b0 + b * x + bo * other; const pL = K === kSolve ? ramp(t, 2.0, 3.2) : K > kSolve ? 1 : 0;
    const xt = nice(xl, xh, 4), yt = nice(yl, yh, 4);
    return (<g>
      <AxisY Y={Y} x={80} ticks={yt} />
      <YLab x={30} y={(top + bot) / 2}>{short(H[1])}</YLab>
      <Axis X={X} y={bot + 6} ticks={xt} label={short(H[xi + 1])} />
      {xs.map((x, i) => <Dot key={i} x={X(x)} y={Y(ys[i])} r={4.5} color={P.group[xi - 1]} opacity={0.75 * Math.max(0, Math.min(1, p * 20 - i * 0.6))} />)}
      {pL > 0 && <g>
        <line x1={X(xl)} y1={Y(line(xl))} x2={X(xl) + (X(xh) - X(xl)) * pL} y2={Y(line(xl + (xh - xl) * pL))} stroke={P.ink} strokeWidth={3} strokeLinecap="round" />
        <Txt x={w - 30} y={top + 4} size={15} anchor="end" weight={700} color={P.ink} opacity={pL}>{`b${xi} = ${f(b)}`}</Txt>
      </g>}
    </g>);
  };

  if (K < kRes) {
    const pIn = K === 0 ? ramp(t, 0.6, 2.4) : 1; // dots appear on the first step; the question shows them already
    return (<g fontFamily={inter}>
      <Scatter xs={x1} xi={1} top={30} bot={168} p={pIn} />
      <Scatter xs={x2} xi={2} top={262} bot={392} p={pIn} />
    </g>);
  }
  if (K === kRes) {
    const [lo, hi] = range([...ys, ...fit]); const X = lin(lo, hi, 80, w - 30), Y = lin(lo, hi, 380, 60); const tk = nice(lo, hi, 4);
    const pS = ramp(t, 1.4, 3.2); const pT = ramp(t, 3.3, 4.2);
    return (<g fontFamily={inter}>
      <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Observed against fitted</Txt>
      <AxisY Y={Y} x={80} ticks={tk} />
      <YLab x={30} y={(60 + 380) / 2}>observed y</YLab>
      <Axis X={X} y={386} ticks={tk} label="fitted ŷ" />
      <line x1={X(lo)} y1={Y(lo)} x2={X(hi)} y2={Y(hi)} stroke={P.faint} strokeWidth={1.5} strokeDasharray="5 4" />
      {ys.map((y, i) => <g key={i}>
        <line x1={X(fit[i])} x2={X(fit[i])} y1={Y(fit[i])} y2={Y(fit[i]) + (Y(y) - Y(fit[i])) * pS} stroke={P.red} strokeWidth={2} />
        <Dot x={X(fit[i])} y={Y(y)} r={4.5} color={P.ink} opacity={0.8} />
      </g>)}
      <g opacity={pT}>
        <Txt x={96} y={80} size={15} color={P.red} weight={700}>{`SSres = ${v.SSres.toFixed(2)}`}</Txt>
        <Txt x={96} y={102} size={15} color={P.ink} weight={700}>{`s = ${v.s.toFixed(2)}`}</Txt>
      </g>
    </g>);
  }
  // R squared (and the conclusion): SS_tot split into the explained part and SS_res
  const SSmod = v.SStot - v.SSres; const X = lin(0, v.SStot, 30, w - 30);
  const p1 = K === kR2 ? ramp(t, 1.4, 2.4) : 1, p2 = K === kR2 ? ramp(t, 2.6, 3.6) : 1;
  const coefs = [{lab: 'b1', b: v.b1, col: P.group[0], nm: short(H[2])}, {lab: 'b2', b: v.b2, col: P.group[1], nm: short(H[3])}];
  const XB = lin(0, Math.max(v.b1, v.b2) * 1.3, 140, w - 40);
  return (<g fontFamily={inter}>
    <Txt x={20} y={30} size={17} weight={700} color={P.blue}>Sums of squares</Txt>
    <rect x={X(0)} y={86} width={X(v.SStot) - X(0)} height={40} rx={4} fill="#f1efe9" stroke={P.line} />
    <Txt x={X(0)} y={74} size={15} color={P.soft}>{`SStot = ${f(v.SStot, 2)}`}</Txt>
    <rect x={X(0)} y={86} width={(X(SSmod) - X(0)) * p1} height={40} rx={4} fill={P.green} opacity={0.8} />
    <rect x={X(SSmod)} y={86} width={(X(v.SStot) - X(SSmod)) * p2} height={40} rx={4} fill={P.red} opacity={0.75} />
    <OnBar x={(X(0) + X(SSmod)) / 2} y={112} size={15} anchor="middle" opacity={p1}>{f(SSmod, 2)}</OnBar>
    <OnBar x={(X(SSmod) + X(v.SStot)) / 2} y={112} size={15} anchor="middle" opacity={p2}>{f(v.SSres, 2)}</OnBar>
    <Txt x={(X(0) + X(SSmod)) / 2} y={148} size={14} anchor="middle" color={P.green} opacity={p1}>explained</Txt>
    <Txt x={(X(SSmod) + X(v.SStot)) / 2} y={148} size={14} anchor="middle" color={P.red} opacity={p2}>SSres</Txt>
    <Txt x={w / 2} y={190} size={18} anchor="middle" weight={700} color={P.ink} opacity={p2}>{`R² = ${f(v.R2)}`}</Txt>
    <line x1={20} x2={w - 20} y1={226} y2={226} stroke={P.line} />
    <Txt x={20} y={260} size={15} weight={700} color={P.blue}>Fitted coefficients</Txt>
    {coefs.map((q, i) => { const y = 300 + i * 50; return (<g key={i}>
      <Txt x={130} y={y + 5} size={15} anchor="end" color={q.col} weight={600}>{`${q.lab} ${q.nm}`}</Txt>
      <rect x={140} y={y - 13} width={XB(q.b) - 140} height={26} rx={4} fill={q.col} opacity={0.85} />
      <Txt x={XB(q.b) + 8} y={y + 5} size={15} weight={700} color={q.col}>{f(q.b)}</Txt>
    </g>); })}
    <Txt x={20} y={418} size={15} color={P.soft}>{`b0 = ${f(v.b0)}`}</Txt>
  </g>);
};
export default Viz;
