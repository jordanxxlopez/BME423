import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label} from '../kit/plot';
import {mono} from '../kit/theme';

// Session 18 Table 8-1: the 10 sampled Martians (height x in cm, weight y in g). Case "s18-martians-line".
const X = [31, 32, 33, 34, 35, 35, 40, 41, 42, 46];
const Y = [7.8, 8.3, 7.6, 9.1, 9.6, 9.8, 11.8, 12.1, 14.7, 13.0];
const n = X.length;
const sx = X.reduce((p, q) => p + q, 0), sy = Y.reduce((p, q) => p + q, 0);             // 369, 103.8
const sx2 = X.reduce((p, q) => p + q * q, 0), sxy = X.reduce((p, q, k) => p + q * Y[k], 0); // 13841, 3930.1
const D = n * sx2 - sx ** 2;                                                               // 2249
const b = (n * sxy - sx * sy) / D;                                                         // 0.4441085
const xbar = sx / n, ybar = sy / n;                                                        // 36.9, 10.38
const a = ybar - b * xbar;                                                                 // -6.007603
const Sxx = sx2 - sx ** 2 / n, Sxy = sxy - sx * sy / n;                                    // 224.9, 99.88
const Syy = Y.reduce((p, q) => p + (q - ybar) ** 2, 0);                                    // 51.796
const SS = (s: number) => Syy - 2 * s * Sxy + s * s * Sxx;                                 // SS of a line through the means
const SSmin = SS(b);                                                                       // 7.438

// Slope of the trial line during the "squares shrink" step: starts flat, overshoots, settles on b.
const slopeAt = (p: number) => b * (1 - Math.cos(2.5 * Math.PI * p) * Math.exp(-3.2 * p));

export const meta = {
  id: 's18-s18line', session: 18, method: 's18line',
  title: 'Least-squares regression line',
  // case step -> video step
  cases: {'s18-martians-line': [5, 5, 6, 7, 7, 7, 8]},
  steps: [
    {title: 'Ten Martians', seconds: 6, caption: 'Ten Martians were measured for height x and weight y. Taller Martians tend to be **heavier**, but the points scatter.',
      card: [{label: 'ten sampled Martians', note: 'height x  31 to 46 cm\nweight y  7.6 to 14.7 g'}]},
    {title: 'Residuals', seconds: 7, caption: 'Any line leaves a **residual** for each point, the vertical distance from the point down or up to the line.',
      card: [{label: 'residual', tex: 'e_i=y_i-\\hat y_i', color: C.noise, note: 'start with a flat line at the mean weight'}]},
    {title: 'Squares shrink', seconds: 9, caption: 'Square each residual and add the squares. Turning the line toward the points makes the **squares shrink**.',
      card: [{label: 'sum of squared residuals', tex: 'SS=\\sum(y_i-\\hat y_i)^2', value: `flat line SS = ${Syy.toFixed(2)} g²`, color: C.noise}]},
    {title: 'Least squares', seconds: 7, caption: 'The **least-squares line** is the one line with the smallest sum of squares. Any other slope gives a bigger SS.',
      card: [{label: 'best line', value: `smallest SS = ${SSmin.toFixed(2)} g²`, color: C.signal, note: 'at the bottom of the SS curve'}]},
    {title: 'Five sums', seconds: 8, caption: 'The formulas need only **five numbers** from the table. Both a and b divide by the same denominator D.',
      card: [{label: 'sums', note: `n = 10 · Σx = 369 · Σy = 103.8\nΣx² = 13841 · Σxy = 3930.1`},
        {label: 'shared denominator', tex: 'D=n\\sum x_i^2-\\Big(\\sum x_i\\Big)^2', value: `10(13841) − 369² = ${D}`}]},
    {title: 'Slope b', seconds: 8, caption: 'The slope is the rise in mean weight for each extra centimeter of height, about **0.44 g per cm**.',
      card: [{label: 'slope', tex: 'b=\\frac{n\\sum x_iy_i-\\sum x_i\\sum y_i}{D}', value: `998.8 / 2249 = ${b.toFixed(4)} g/cm`, color: C.signal}]},
    {title: 'Intercept a', seconds: 8, caption: 'The line passes through the **point of means** (36.9, 10.38), so a = 10.38 − b(36.9) with b kept unrounded.',
      card: [{label: 'intercept', tex: 'a=\\bar y-b\\bar x', value: `10.38 − ${b.toFixed(4)}(36.9) = ${a.toFixed(2)} g`, color: C.signal,
        note: 'same as (Σy·Σx² − Σx·Σxy) / D = −13511.1 / 2249'}]},
    {title: 'The fitted line', seconds: 8, caption: 'The sample line **ŷ = −6.0 + 0.44x** estimates the line of means −8 + 0.5x. Another sample would give another line.',
      card: [{label: 'regression line', value: 'ŷ = −6.0 + 0.44x', color: C.signal, note: 'line of means  μ = −8 + 0.5x'}]},
  ] as Step[],
};

// Plot scales (stage pixels).
const x = lin(30, 48, 70, 735), y = lin(6, 16, 360, 20);
const AxisY: React.FC<{ticks: number[]; label: string}> = ({ticks, label}) => (
  <g fontFamily={mono}>
    <line x1={60} x2={60} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={54} x2={60} y1={y(t)} y2={y(t)} stroke={C.muted} /><text x={50} y={y(t) + 5} fill={C.muted} fontSize={14} textAnchor="end">{t}</text></g>)}
    <text x={14} y={(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2} fill={C.muted} fontSize={15} textAnchor="middle" transform={`rotate(-90 14 ${(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2})`}>{label}</text>
  </g>
);
const lineAt = (s: number) => (v: number) => ybar + s * (v - xbar);

// Inset: SS against the slope of a line through the point of means.
const sx_ = lin(0, 0.9, 500, 720), sy_ = lin(0, 60, 330, 235);

const S18Line: React.FC = () => (
  <Frame title={meta.title} session={18} steps={meta.steps}>
    {(f, i, tl) => {
      // current slope of the drawn line
      const s = i < 2 ? 0 : i === 2 ? slopeAt(prog(tl, f, 2, 7)) : b;
      const L = lineAt(s);
      const lineA = i === 0 ? 0 : prog(tl, f, 1, 0.8);
      const resA = i >= 1 && i <= 3 ? (i === 1 ? prog(tl, f, 1, 1.6) : 1) : (i === 4 ? 1 - prog(tl, f, 4, 0.8) : 0);
      const sqA = i === 2 || i === 3 ? prog(tl, f, 2, 0.8) : (i === 4 ? 1 - prog(tl, f, 4, 0.8) : 0);
      return (<g>
        <AxisX x={x} y={370} ticks={[30, 33, 36, 39, 42, 45, 48]} label="height x (cm)" />
        <AxisY ticks={[6, 8, 10, 12, 14, 16]} label="weight y (g)" />
        {/* squares on the residuals */}
        {sqA > 0 && X.map((v, k) => { const r = Y[k] - L(v); const side = Math.abs(y(Y[k]) - y(L(v))); const px = x(v);
          const left = px + side > 740; const top = Math.min(y(Y[k]), y(L(v)));
          return <rect key={k} x={left ? px - side : px} y={top} width={side} height={side} fill={C.noise} fillOpacity={0.13} stroke={C.noise} strokeOpacity={0.6} strokeWidth={1.2} opacity={sqA * (Math.abs(r) > 0.02 ? 1 : 0)} />; })}
        {/* residual segments */}
        {resA > 0 && X.map((v, k) => <line key={k} x1={x(v)} x2={x(v)} y1={y(Y[k])} y2={lerp(y(Y[k]), y(L(v)), resA)} stroke={C.noise} strokeWidth={2.5} />)}
        {/* true line of means (last step) */}
        {after(tl, f, 7) && <g opacity={prog(tl, f, 7)}>
          <line x1={x(30)} x2={x(48)} y1={y(-8 + 0.5 * 30)} y2={y(-8 + 0.5 * 48)} stroke={C.ink} strokeWidth={2} strokeDasharray="7 6" />
          <Label x={600} y={40} text="μ = −8 + 0.5x" color={C.ink} size={14} anchor="end" />
          <Label x={560} y={165} text="ŷ = −6.0 + 0.44x" color={C.signal} size={14} />
        </g>}
        {/* the line */}
        {lineA > 0 && <line x1={x(30)} x2={x(48)} y1={y(L(30))} y2={y(L(48))} stroke={i >= 3 ? C.signal : C.ink} strokeWidth={3} opacity={lineA} />}
        {/* drop lines for the five sums */}
        {i === 4 && <g opacity={prog(tl, f, 4, 1)}>
          {X.map((v, k) => <g key={k}><line x1={x(v)} x2={x(v)} y1={y(Y[k])} y2={370} stroke={C.blue} strokeOpacity={0.35} strokeDasharray="3 4" />
            <line x1={60} x2={x(v)} y1={y(Y[k])} y2={y(Y[k])} stroke={C.blue} strokeOpacity={0.35} strokeDasharray="3 4" /></g>)}
          <Label x={110} y={40} text="Σx = 369   Σy = 103.8" color={C.blue} size={14} />
        </g>}
        {/* points */}
        {X.map((v, k) => { const p = prog(tl, f, 0, 0.5 + k * 0.1); return <Glow key={k} cx={x(v)} cy={lerp(y(Y[k]) - 50, y(Y[k]), p)} r={6} color={C.blue} opacity={p} />; })}
        {/* SS counter + SS curve inset */}
        {(i === 2 || i === 3) && (() => { const p = prog(tl, f, 2, 0.8); const ss = SS(s); const curve = Array.from({length: 46}, (_, k) => k * 0.02);
          return (<g opacity={p}>
            <Label x={90} y={40} text={`SS = ${ss.toFixed(2)} g²`} color={C.noise} size={18} weight={700} />
            <Label x={90} y={64} text={`slope = ${s.toFixed(3)} g/cm`} color={C.muted} size={14} />
            <line x1={sx_(0)} x2={sx_(0.9)} y1={sy_(0)} y2={sy_(0)} stroke={C.muted} />
            <line x1={sx_(0)} x2={sx_(0)} y1={sy_(0)} y2={sy_(60)} stroke={C.muted} />
            <path d={curve.map((v, k) => `${k ? 'L' : 'M'}${sx_(v).toFixed(1)},${sy_(SS(v)).toFixed(1)}`).join(' ')} fill="none" stroke={C.noise} strokeWidth={2} />
            <Glow cx={sx_(s)} cy={sy_(ss)} r={5} color={i === 3 ? C.signal : C.noise} />
            <Label x={sx_(0.45)} y={sy_(0) + 18} text="slope of the line" color={C.muted} size={12} anchor="middle" />
            <Label x={sx_(0) - 6} y={sy_(60) + 4} text="SS" color={C.muted} size={12} anchor="end" />
            {i === 3 && <Label x={sx_(b)} y={sy_(SSmin) - 12} text={`b = ${b.toFixed(3)}`} color={C.signal} size={13} anchor="middle" opacity={prog(tl, f, 3)} />}
          </g>); })()}
        {/* slope triangle */}
        {i === 5 && (() => { const p = prog(tl, f, 5, 1.4); const x0 = xbar, x1 = xbar + 10; return (<g>
          <line x1={x(x0)} x2={x(lerp(x0, x1, p))} y1={y(L(x0))} y2={y(L(x0))} stroke={C.ink} strokeWidth={2.5} />
          {p > 0.95 && <line x1={x(x1)} x2={x(x1)} y1={y(L(x0))} y2={y(lerp(L(x0), L(x1), prog(tl, f, 5, 2.4)))} stroke={C.signal} strokeWidth={3} />}
          <Label x={x(x0 + 5)} y={y(L(x0)) + 22} text="+10 cm" color={C.ink} size={14} anchor="middle" opacity={p} />
          <Label x={x(x1) - 10} y={170} text={`+${(10 * b).toFixed(2)} g`} color={C.signal} size={15} weight={700} anchor="end" opacity={prog(tl, f, 5, 2.4)} />
        </g>); })()}
        {/* point of means */}
        {i === 6 && (() => { const p = prog(tl, f, 6); return (<g opacity={p}>
          <line x1={x(xbar)} x2={x(xbar)} y1={y(ybar)} y2={370} stroke={C.signal} strokeDasharray="4 5" />
          <line x1={60} x2={x(xbar)} y1={y(ybar)} y2={y(ybar)} stroke={C.signal} strokeDasharray="4 5" />
          <Glow cx={x(xbar)} cy={y(ybar)} r={8} color={C.signal} />
          <Label x={x(xbar) + 12} y={y(ybar) + 26} text="(36.9, 10.38)" color={C.signal} size={14} weight={700} />
          <Label x={80} y={345} text="a = −6.01 g at x = 0" color={C.ink} size={13} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S18Line;
