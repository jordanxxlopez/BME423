import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lerp, Glow, Arrow, Label} from '../kit/plot';

// Session 19 case "s19-sbp-least-squares" (Rosner, 20 families). Columns: child y, mother x1, father x2 (mm Hg).
const D: [number, number, number][] = [[90, 130, 140], [85, 125, 120], [120, 140, 180], [100, 110, 150], [105, 145, 175], [100, 160, 120], [110, 120, 145],
  [140, 180, 160], [115, 120, 190], [105, 130, 135], [100, 125, 150], [80, 110, 125], [70, 90, 140], [115, 120, 170], [90, 150, 150], [90, 145, 155],
  [115, 130, 160], [110, 155, 125], [90, 110, 140], [100, 125, 150]];
const n = D.length, k = 2;
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const yb = mean(D.map(r => r[0])), m1 = mean(D.map(r => r[1])), m2 = mean(D.map(r => r[2]));   // 101.5, 131, 149
const b0 = -15.689248230591591, b1 = 0.42254908356992227, b2 = 0.4150021361270601;          // (X'X)^-1 X'y
const fitAt = (t: number) => (x1: number, x2: number) => yb + t * (b1 * (x1 - m1) + b2 * (x2 - m2)); // t = 0 flat at y-bar, t = 1 least squares
const SS = (t: number) => D.reduce((s, [y, x1, x2]) => s + (y - fitAt(t)(x1, x2)) ** 2, 0);
const SSres = SS(1), SStot = SS(0);                                                          // 1934.92, 4805.0
const s2 = SSres / (n - k - 1), s = Math.sqrt(s2), R2 = 1 - SSres / SStot;                    // 113.82, 10.669, 0.5973

export const meta = {
  id: 's19-s19mlrfit', session: 19, method: 's19mlrfit',
  cases: {'s19-sbp-least-squares': [5, 5, 5, 6, 7, 8]},
  title: 'Multiple regression · fitting a plane',
  steps: [
    {title: 'Twenty families', seconds: 7, card: [{label: 'data · SBP (mm Hg)', note: 'child y · mother x1 · father x2\n20 families · family 1 → 90, 130, 140'}],
      caption: 'Each of 20 families gives three blood pressures, from the first-born **child**, the **mother** and the **father**.'},
    {title: 'The model', seconds: 7, caption: 'Each child\'s SBP is an intercept plus a slope times each parent\'s SBP, **plus random error**.',
      card: [{label: 'model of the data', tex: 'y_i=\\beta_0+\\beta_1x_{i1}+\\beta_2x_{i2}+e_i'}]},
    {title: 'A plane, not a line', seconds: 7, caption: 'With two predictors the fitted relationship is a **plane** above the mother and father floor, not a line.',
      card: [{label: 'fitted plane', tex: '\\hat y=b_0+b_1x_1+b_2x_2', color: C.signal}]},
    {title: 'Least squares', seconds: 8, caption: 'Least squares tilts the plane until the **sum of squared residuals** is as small as it can be.',
      card: [{label: 'least squares', tex: 'SS=\\sum(y_i-\\hat y_i)^2', value: `${SStot.toFixed(1)} (flat) → ${SSres.toFixed(2)}`, color: C.noise}]},
    {title: 'Matrix solution', seconds: 8, caption: 'Stacking the families into a matrix X with a **column of ones** gives every coefficient at once.',
      card: [{label: 'least-squares estimate', tex: 'b=(X^TX)^{-1}X^Ty', note: 'XᵀX = [20 2620 2980; 2620 351350 390825;\n       2980 390825 451350] · Xᵀy = [2030; 269550; 305700]', color: C.signal}]},
    {title: 'Coefficients', seconds: 8, caption: 'Each slope is the change in mean child SBP per mm Hg of one parent, **holding the other parent fixed**.',
      card: [{label: 'coefficients (match R)', value: `ŷ = ${b0.toFixed(2)} + ${b1.toFixed(4)}x1 + ${b2.toFixed(4)}x2`, color: C.signal}]},
    {title: 'Residual SD', seconds: 8, caption: 'Three coefficients use three df, so **17 remain**. The root of SS over 17 is **10.67 mm Hg**, R\'s residual standard error.',
      card: [{label: 'variability about the plane', tex: 's_{y|x}^2=\\frac{SS_{res}}{n-k-1}', value: `${SSres.toFixed(2)} / 17 = ${s2.toFixed(2)} → ${s.toFixed(2)}`, color: C.noise}]},
    {title: 'R squared', seconds: 7, caption: 'The plane leaves 1934.92 of the 4805.0 total, so it explains **R² = 0.5973**, about 60% of the variation.',
      card: [{label: 'coefficient of determination', tex: 'R^2=1-\\frac{SS_{res}}{SS_{tot}}', value: `1 − 1934.92 / 4805.0 = ${R2.toFixed(4)}`, color: C.signal}]},
  ] as Step[],
};

// Oblique 3-D projection: mother 90..180 to the right, father 120..190 into the page, child 60..150 up.
const P = (x1: number, x2: number, y: number): [number, number] => {
  const u = (x1 - 90) / 90, v = (x2 - 120) / 70, w = (y - 60) / 90;
  return [110 + 400 * u + 200 * v, 388 - 250 * w - 108 * v];
};
const pts = (a: [number, number][]) => a.map(p => p.map(q => q.toFixed(1)).join(',')).join(' ');

const S19Mlrfit: React.FC = () => (
  <Frame title={meta.title} session={19} steps={meta.steps}>
    {(f, i, tl) => {
      const dim = i === 4 ? 0.22 : i === 7 ? 0.1 : 1;
      const tFit = i < 3 ? 0 : i === 3 ? prog(tl, f, 3, 4) : 1;
      const fit = fitAt(tFit);
      const planeA = after(tl, f, 2) ? prog(tl, f, 2) : 0;
      const order = D.map((r, idx) => ({r, idx})).sort((a, b) => b.r[2] - a.r[2]);
      const corners: [number, number][] = [[90, 120], [180, 120], [180, 190], [90, 190]];
      return (<g>
        <g opacity={dim}>
          {/* floor and axes */}
          <polygon points={pts([P(90, 120, 60), P(180, 120, 60), P(180, 190, 60), P(90, 190, 60)])} fill={C.line} opacity={0.25} stroke={C.line} />
          {[120, 150, 180].map(v => <line key={`m${v}`} x1={P(v, 120, 60)[0]} y1={P(v, 120, 60)[1]} x2={P(v, 190, 60)[0]} y2={P(v, 190, 60)[1]} stroke={C.line} strokeWidth={1} />)}
          {[140, 160, 180].map(v => <line key={`f${v}`} x1={P(90, v, 60)[0]} y1={P(90, v, 60)[1]} x2={P(180, v, 60)[0]} y2={P(180, v, 60)[1]} stroke={C.line} strokeWidth={1} />)}
          <line x1={P(90, 120, 60)[0]} y1={P(90, 120, 60)[1]} x2={P(90, 120, 150)[0]} y2={P(90, 120, 150)[1]} stroke={C.muted} strokeWidth={1.5} />
          {[70, 100, 130].map(v => { const [px, py] = P(90, 120, v); return <g key={v}><line x1={px - 6} x2={px} y1={py} y2={py} stroke={C.muted} /><text x={px - 10} y={py + 5} fill={C.muted} fontSize={13} fontFamily={mono} textAnchor="end">{v}</text></g>; })}
          <Label x={P(90, 120, 150)[0] + 8} y={P(90, 120, 150)[1] + 4} text="child SBP" color={C.muted} size={13} />
          {[90, 135, 180].map(v => { const [px, py] = P(v, 120, 60); return <text key={v} x={px} y={py + 20} fill={C.muted} fontSize={13} fontFamily={mono} textAnchor="middle">{v}</text>; })}
          <Label x={P(135, 120, 60)[0]} y={P(135, 120, 60)[1] + 40} text="mother SBP (x1)" color={GROUP[1]} size={13} anchor="middle" />
          {[155, 190].map(v => { const [px, py] = P(180, v, 60); return <text key={v} x={px + 10} y={py + 12} fill={C.muted} fontSize={13} fontFamily={mono}>{v}</text>; })}
          <Label x={P(180, 150, 60)[0] + 28} y={P(180, 150, 60)[1] + 34} text="father SBP (x2)" color={GROUP[0]} size={13} />
          {/* drop lines to the floor */}
          {after(tl, f, 1) && i < 3 && D.map(([y, x1, x2], j) => { const a = P(x1, x2, y), b = P(x1, x2, 60); return <line key={j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.muted} strokeWidth={1} opacity={0.5 * prog(tl, f, 1)} />; })}
          {/* plane */}
          {planeA > 0 && <g opacity={planeA}>
            <polygon points={pts(corners.map(([a, b]) => P(a, b, fit(a, b))))} fill={C.signal} opacity={0.16} stroke={C.signal} strokeWidth={1.5} />
            {[120, 150].map(v => <line key={v} x1={P(v, 120, fit(v, 120))[0]} y1={P(v, 120, fit(v, 120))[1]} x2={P(v, 190, fit(v, 190))[0]} y2={P(v, 190, fit(v, 190))[1]} stroke={C.signal} strokeWidth={1} opacity={0.4} />)}
            {[143, 166].map(v => <line key={v} x1={P(90, v, fit(90, v))[0]} y1={P(90, v, fit(90, v))[1]} x2={P(180, v, fit(180, v))[0]} y2={P(180, v, fit(180, v))[1]} stroke={C.signal} strokeWidth={1} opacity={0.4} />)}
          </g>}
          {/* residual sticks */}
          {after(tl, f, 3) && D.map(([y, x1, x2], j) => { const a = P(x1, x2, y), b = P(x1, x2, fit(x1, x2)); return <line key={j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.noise} strokeWidth={i === 6 ? 3 : 2} opacity={i === 6 ? 1 : 0.75} />; })}
          {/* points */}
          {order.map(({r: [y, x1, x2], idx}) => { const p = prog(tl, f, 0, 0.5 + idx * 0.1); const [px, py] = P(x1, x2, y); return <Glow key={idx} cx={px} cy={lerp(py - 70, py, p)} r={5.5} color={C.purple} opacity={p} />; })}
          {i === 3 && <Label x={560} y={60} text={`SS = ${SS(tFit).toFixed(1)}`} color={C.noise} size={18} weight={700} />}
          {i === 5 && (() => { const q = prog(tl, f, 5, 1.2); const a = P(100, 125, fit(100, 125)), b = P(170, 125, fit(170, 125)); const c = P(95, 125, fit(95, 125)), d = P(95, 185, fit(95, 185)); return (<g opacity={q}>
            <Arrow x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} color={GROUP[1]} w={3} />
            <Label x={b[0] + 12} y={b[1] + 22} text="+0.4225 per mm Hg (mother)" color={GROUP[1]} size={13} />
            <Arrow x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} color={GROUP[0]} w={3} />
            <Label x={d[0] + 10} y={d[1] - 12} text="+0.4150 per mm Hg (father)" color={GROUP[0]} size={13} />
          </g>); })()}
          {i === 6 && <Label x={470} y={60} text={`s(y|x) = ${s.toFixed(2)} on 17 df`} color={C.noise} size={16} weight={700} opacity={prog(tl, f, 6)} />}
        </g>
        {/* matrix layout */}
        {i === 4 && (() => { const q = prog(tl, f, 4); const rows = D.slice(0, 4); const x0 = 120, y0 = 90, rh = 34;
          return (<g opacity={q}>
            <Label x={x0 - 40} y={y0 + 60} text="X =" color={C.signal} size={20} weight={700} />
            <Label x={x0 + 40} y={y0 - 10} text="1" color={C.muted} size={13} anchor="middle" />
            <Label x={x0 + 110} y={y0 - 10} text="x1" color={GROUP[1]} size={13} anchor="middle" />
            <Label x={x0 + 180} y={y0 - 10} text="x2" color={GROUP[0]} size={13} anchor="middle" />
            {rows.map(([y, x1, x2], r) => (<g key={r}>
              <Label x={x0 + 40} y={y0 + 20 + r * rh} text="1" color={C.signal} anchor="middle" size={16} weight={700} />
              <Label x={x0 + 110} y={y0 + 20 + r * rh} text={String(x1)} anchor="middle" size={16} />
              <Label x={x0 + 180} y={y0 + 20 + r * rh} text={String(x2)} anchor="middle" size={16} />
              <Label x={x0 + 380} y={y0 + 20 + r * rh} text={String(y)} anchor="middle" size={16} color={C.purple} />
            </g>))}
            <Label x={x0 + 110} y={y0 + 20 + 4 * rh} text="⋮ 20 rows" anchor="middle" color={C.muted} size={15} />
            <Label x={x0 + 380} y={y0 + 20 + 4 * rh} text="⋮" anchor="middle" color={C.muted} size={15} />
            <path d={`M${x0 + 12},${y0 - 4} h-8 v${5 * rh} h8 M${x0 + 208},${y0 - 4} h8 v${5 * rh} h-8`} fill="none" stroke={C.muted} strokeWidth={2} />
            <Label x={x0 + 300} y={y0 + 60} text="y =" color={C.purple} size={20} weight={700} />
            <path d={`M${x0 + 358},${y0 - 4} h-8 v${5 * rh} h8 M${x0 + 402},${y0 - 4} h8 v${5 * rh} h-8`} fill="none" stroke={C.muted} strokeWidth={2} />
            <Label x={x0 + 160} y={y0 + 250} text="b = (XᵀX)⁻¹Xᵀy → −15.6892, 0.4225, 0.4150" color={C.signal} size={16} anchor="middle" weight={700} opacity={prog(tl, f, 4, 2.6)} />
          </g>); })()}
        {/* R squared bars */}
        {i === 7 && (() => { const q = prog(tl, f, 7, 1.6); const W = 560, x0 = 100; const wr = W * SSres / SStot;
          return (<g>
            <Label x={x0} y={130} text={`SS_tot = ${SStot.toFixed(1)}  (spread about the mean)`} color={C.muted} size={14} />
            <rect x={x0} y={145} width={W * q} height={34} rx={6} fill={C.muted} opacity={0.6} />
            <Label x={x0} y={230} text={`SS_res = ${SSres.toFixed(2)}  (left about the plane)`} color={C.noise} size={14} />
            <rect x={x0} y={245} width={wr * q} height={34} rx={6} fill={C.noise} opacity={0.85} />
            <rect x={x0 + wr} y={245} width={(W - wr) * prog(tl, f, 7, 2.6)} height={34} rx={6} fill={C.signal} opacity={0.85} />
            {prog(tl, f, 7, 2.6) > 0.95 && <text x={x0 + wr + (W - wr) / 2} y={268} fill={C.bg} fontSize={15} fontFamily={mono} textAnchor="middle" fontWeight={700}>{`explained ${(R2 * 100).toFixed(1)}%`}</text>}
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S19Mlrfit;
