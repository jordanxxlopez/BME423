import React from 'react';
import {C, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Arrow, Label} from '../kit/plot';

// Session 18: the same 10 Martians (Table 8-1). Case "s18-martians-spread".
const X = [31, 32, 33, 34, 35, 35, 40, 41, 42, 46];
const Y = [7.8, 8.3, 7.6, 9.1, 9.6, 9.8, 11.8, 12.1, 14.7, 13.0];
const n = X.length;
const xbar = X.reduce((p, q) => p + q, 0) / n, ybar = Y.reduce((p, q) => p + q, 0) / n;
const Sxx = X.reduce((p, q) => p + (q - xbar) ** 2, 0), Sxy = X.reduce((p, q, k) => p + (q - xbar) * (Y[k] - ybar), 0);
const b = Sxy / Sxx, a = ybar - b * xbar;                          // 0.4441, -6.0076 (unrounded line through the data)
const res = X.map((v, k) => Y[k] - (a + b * v));
const SSE = res.reduce((p, q) => p + q * q, 0);                    // 7.4384
const syxRaw = Math.sqrt(SSE / (n - 2));                           // 0.9643
// Slide's rounded inputs: s_x = 5.0, s_y = 2.4, b = 0.44.
const sxR = 5.0, syR = 2.4, bR = 0.44;
const syx = Math.sqrt((n - 1) / (n - 2) * (syR ** 2 - bR ** 2 * sxR ** 2)); // 1.017349
const sb = syx / (Math.sqrt(n - 1) * sxR);                                   // 0.0678233
const bracket = 1 / n + xbar ** 2 / ((n - 1) * sxR ** 2);                    // 6.1516
const sa = syx * Math.sqrt(bracket);                                         // 2.523273
const sbRaw = syxRaw / Math.sqrt(Sxx), saRaw = syxRaw * Math.sqrt(1 / n + xbar ** 2 / Sxx); // 0.0643, 2.392

export const meta = {
  id: 's18-s18syx', session: 18, method: 's18syx',
  title: 'Scatter about the line · s_y|x, s_b and s_a',
  cases: {'s18-martians-spread': [4, 4, 5, 6, 7, 3]},
  steps: [
    {title: 'Line and scatter', seconds: 6, caption: 'The fitted line gives the mean weight at each height. Real Martians **scatter** above and below it.',
      card: [{label: 'fitted line', value: 'ŷ = −6.0 + 0.44x', color: C.signal}]},
    {title: 'Residuals', seconds: 7, caption: 'Each **residual** is the vertical gap from a Martian to the line. They add to zero, so square them before adding.',
      card: [{label: 'residual', tex: 'e_i=y_i-\\hat y_i', value: 'Σ eᵢ = 0 g', color: C.noise}]},
    {title: 'Divide by n − 2', seconds: 8, caption: 'Add the squares and divide by **n − 2**, because a and b were estimated from the same points first.',
      card: [{label: 'standard error of the estimate', tex: 's_{y|x}=\\sqrt{\\frac{1}{n-2}\\sum(y_i-\\hat y_i)^2}', value: `√(${SSE.toFixed(3)} / 8) = ${syxRaw.toFixed(3)} g`, color: C.noise, note: 'from the ten measured points'}]},
    {title: 'Shortcut with SDs', seconds: 8, caption: 'The shortcut uses the SDs of x and y. With rounded inputs it gives about **1.02 g**, close to the true 1 g.',
      card: [{label: 'shortcut', tex: 's_{y|x}=\\sqrt{\\tfrac{n-1}{n-2}\\left(s_y^2-b^2s_x^2\\right)}', value: `√(9/8 · (5.76 − 4.84)) = ${syx.toFixed(3)} g`, color: C.noise,
        note: 's_x = 5.0 cm · s_y = 2.4 g · b = 0.44 g/cm\nrounding pushes it above the raw 0.964 g'}]},
    {title: 'Standard error of b', seconds: 8, caption: 'The slope would **wobble** from sample to sample. Less scatter, more points and wider x values all shrink s_b.',
      card: [{label: 'slope standard error', tex: 's_b=\\frac{1}{\\sqrt{n-1}}\\frac{s_{y|x}}{s_x}', value: `${syx.toFixed(3)} / (3 · 5.0) = ${sb.toFixed(4)} g/cm`, color: C.signal,
        note: `raw data give ${sbRaw.toFixed(4)} g/cm`}]},
    {title: 'Far from x = 0', seconds: 8, caption: 'The intercept is the height of the line at x = 0, far from the **mean height 36.9 cm**, so this term is large.',
      card: [{label: 'bracket for the intercept', tex: '\\frac1n+\\frac{\\bar x^2}{(n-1)s_x^2}', value: `0.1 + 1361.61/225 = ${bracket.toFixed(4)}`}]},
    {title: 'Standard error of a', seconds: 8, caption: 'A small wobble in slope swings the line a lot at x = 0, so **s_a** is far larger than s_b.',
      card: [{label: 'intercept standard error', tex: 's_a=s_{y|x}\\sqrt{\\frac1n+\\frac{\\bar x^2}{(n-1)s_x^2}}', value: `${syx.toFixed(3)} · √${bracket.toFixed(4)} = ${sa.toFixed(2)} g`, color: C.signal,
        note: `raw data give ${saRaw.toFixed(2)} g`}]},
  ] as Step[],
};

const L = (v: number) => a + b * v;

const S18Syx: React.FC = () => (
  <Frame title={meta.title} session={18} steps={meta.steps}>
    {(f, i, tl) => {
      const z = i < 5 ? 0 : prog(tl, f, 5, 2);                          // zoom out to show x = 0
      const x = lin(lerp(30, -2, z), 48, 70, 735), y = lin(lerp(6, -14, z), lerp(16, 18, z), 360, 20);
      const zoomed = z > 0.5;
      const xt = zoomed ? [0, 8, 16, 24, 32, 40, 48] : [30, 33, 36, 39, 42, 45, 48];
      const yt = zoomed ? [-12, -6, 0, 6, 12, 18] : [6, 8, 10, 12, 14, 16];
      const xl = lerp(30, -2, z);
      const resA = i === 1 || i === 2 ? (i === 1 ? prog(tl, f, 1, 1.6) : 1) : i === 3 ? 1 - prog(tl, f, 3, 0.8) : 0;
      const sqA = i === 2 ? prog(tl, f, 2, 1) : i === 3 ? 1 - prog(tl, f, 3, 0.8) : 0;
      const bandA = i === 3 ? prog(tl, f, 3, 1.4) : i === 4 ? 1 - prog(tl, f, 4, 0.8) : 0;
      const fanA = i >= 4 ? prog(tl, f, 4, 1.4) : 0;
      return (<g>
        <defs><clipPath id="plotclip"><rect x={60} y={0} width={700} height={370} /></clipPath></defs>
        <AxisX x={x} y={370} ticks={xt} label="height x (cm)" />
        <g fontFamily={mono}>
          <line x1={60} x2={60} y1={y(yt[0])} y2={y(yt[yt.length - 1])} stroke={C.muted} strokeWidth={1.5} />
          {yt.map(t => <g key={t}><line x1={54} x2={60} y1={y(t)} y2={y(t)} stroke={C.muted} /><text x={50} y={y(t) + 5} fill={C.muted} fontSize={14} textAnchor="end">{t}</text></g>)}
          <text x={14} y={190} fill={C.muted} fontSize={15} textAnchor="middle" transform="rotate(-90 14 190)">weight y (g)</text>
        </g>
        <g clipPath="url(#plotclip)">
          {/* zero line once zoomed */}
          {zoomed && <line x1={60} x2={735} y1={y(0)} y2={y(0)} stroke={C.line} strokeWidth={1} />}
          {/* scatter band ± s_y|x */}
          {bandA > 0 && <g opacity={bandA}>
            <polygon points={`${x(30)},${y(L(30) + syx)} ${x(48)},${y(L(48) + syx)} ${x(48)},${y(L(48) - syx)} ${x(30)},${y(L(30) - syx)}`} fill={C.noise} fillOpacity={0.15} stroke={C.noise} strokeOpacity={0.5} />
          </g>}
          {/* squares */}
          {sqA > 0 && X.map((v, k) => { const side = Math.abs(y(Y[k]) - y(L(v))); const px = x(v); const left = px + side > 740;
            return <rect key={k} x={left ? px - side : px} y={Math.min(y(Y[k]), y(L(v)))} width={side} height={side} fill={C.noise} fillOpacity={0.13} stroke={C.noise} strokeOpacity={0.6} strokeWidth={1.2} opacity={sqA} />; })}
          {/* residuals */}
          {resA > 0 && X.map((v, k) => <line key={k} x1={x(v)} x2={x(v)} y1={y(Y[k])} y2={lerp(y(Y[k]), y(L(v)), resA)} stroke={C.noise} strokeWidth={2.5} />)}
          {/* slope fan b ± s_b and b ± 2 s_b through the point of means (illustration of the wobble) */}
          {fanA > 0 && [-2, -1, 1, 2].map(k => { const s = b + k * sb; const f0 = (v: number) => ybar + s * (v - xbar);
            return <line key={k} x1={x(xl)} x2={x(48)} y1={y(f0(xl))} y2={y(f0(48))} stroke={C.noise} strokeWidth={Math.abs(k) === 1 ? 2 : 1.2} strokeOpacity={Math.abs(k) === 1 ? 0.85 : 0.4} opacity={fanA} />; })}
          {/* the line */}
          <line x1={x(xl)} x2={x(48)} y1={y(L(xl))} y2={y(L(48))} stroke={C.signal} strokeWidth={3} opacity={prog(tl, f, 0, 1.2)} />
          {/* points */}
          {X.map((v, k) => { const p = prog(tl, f, 0, 0.4 + k * 0.08); return <Glow key={k} cx={x(v)} cy={lerp(y(Y[k]) - 50, y(Y[k]), p)} r={zoomed ? 5 : 6} color={C.blue} opacity={p} />; })}
        </g>
        {/* labels per step */}
        {i === 1 && <g opacity={prog(tl, f, 1, 2)}>
          <Label x={x(42) - 8} y={102} text="+2.06" color={C.noise} size={14} anchor="end" />
          <Label x={x(46) + 8} y={102} text="−1.42" color={C.noise} size={14} />
        </g>}
        {i === 2 && <Label x={90} y={40} text={`Σe² = ${SSE.toFixed(3)} g²`} color={C.noise} size={18} weight={700} opacity={prog(tl, f, 2)} />}
        {i === 3 && <g opacity={bandA}>
          <Label x={78} y={352} text={`band ± ${syx.toFixed(2)} g`} color={C.noise} size={14} />
        </g>}
        {i === 4 && <g opacity={fanA}>
          <Label x={90} y={40} text={`b ± s_b = 0.44 ± ${sb.toFixed(3)}`} color={C.noise} size={15} />
          <Label x={90} y={62} text="faint lines b ± 2 s_b" color={C.muted} size={13} />
        </g>}
        {i >= 5 && z > 0.9 && <g opacity={prog(tl, f, 5, 3)}>
          <Arrow x1={x(0) + 4} y1={36} x2={x(xbar) - 4} y2={36} color={C.ink} w={2} />
          <Arrow x1={x(xbar) - 4} y1={36} x2={x(0) + 4} y2={36} color={C.ink} w={2} />
          <Label x={x(xbar / 2)} y={26} text="mean height 36.9 cm" color={C.ink} size={14} anchor="middle" />
          <line x1={x(xbar)} x2={x(xbar)} y1={36} y2={370} stroke={C.muted} strokeDasharray="4 5" />
        </g>}
        {i === 6 && (() => { const p = prog(tl, f, 6, 1.4); return (<g>
          <line x1={x(0)} x2={x(0)} y1={y(a - sa * p)} y2={y(a + sa * p)} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
          <Glow cx={x(0)} cy={y(a)} r={7} color={C.signal} />
          <Label x={x(0) + 16} y={340} text={`a ± s_a = −6.0 ± ${sa.toFixed(2)}`} color={C.signal} size={14} weight={700} opacity={p} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S18Syx;
