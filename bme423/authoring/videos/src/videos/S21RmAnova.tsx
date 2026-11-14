import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 21 slides 9-10: FEV1 (L) in 4 people at baseline, 1 h after endotoxin, 2 h after endotoxin + salbutamol.
// Case "s21-fev1-rmanova". F uses the raw-data MS_res = 0.02833/6; the slide prints 64.053.
const X = [[3.7, 3.4, 4.0], [4.0, 3.7, 4.4], [3.0, 2.8, 3.2], [3.2, 2.9, 3.4]];
const n = X.length, m = X[0].length;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const S = X.map(mean);                                               // 3.7, 4.0333, 3, 3.1667
const T = [0, 1, 2].map(j => mean(X.map(r => r[j])));                // 3.475, 3.2, 3.75
const G = mean(T);                                                   // 3.475
const ssS = X.map((r, s) => r.reduce((a, v) => a + (v - S[s]) ** 2, 0)); // 0.18, 0.2467, 0.08, 0.1267
const ssWit = ssS.reduce((a, b) => a + b, 0);                        // 0.6333
const ssTreat = n * T.reduce((a, v) => a + (v - G) ** 2, 0);         // 0.605
const ssRes = ssWit - ssTreat;                                       // 0.02833
const dfT = m - 1, dfR = (n - 1) * (m - 1);                          // 2, 6
const msT = ssTreat / dfT, msR = ssRes / dfR;                        // 0.3025, 0.004722
const F = msT / msR;                                                 // 64.0588

export const meta = {
  id: 's21-s21rmAnova', session: 21, method: 's21rmAnova',
  cases: {
    's21-fev1-rmanova': [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    's21-sbp-rmanova': [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    's21-orig-hr-rmanova': [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  title: 'Repeated measures ANOVA · FEV1 example',
  steps: [
    {title: 'Design and H0', seconds: 8, caption: 'Four people had **FEV1** measured at baseline, 1 hour after endotoxin, and 2 hours after endotoxin plus salbutamol.',
      card: [{label: 'design', value: 'm = 3 treatments · n = 4 people', note: 'each person gets every treatment'},
        {label: 'null hypothesis', tex: 'H_0:\\mu_{base}=\\mu_{endo}=\\mu_{endo+salb}', note: 'no difference in FEV1 under the 3 conditions'}]},
    {title: 'Subject means', seconds: 6, caption: 'Average each person over the three conditions. People differ, so the **subject means** range from 3.0 to 4.03 L.',
      card: [{label: 'subject means (L)', tex: '\\bar S_s=\\tfrac1m\\textstyle\\sum_t x_{ts}', value: '3.7, 4.0333, 3, 3.1667', color: C.ink}]},
    {title: 'Treatment means', seconds: 7, caption: 'Average each condition over the four people. FEV1 **dips after endotoxin** and rises after salbutamol.',
      card: [{label: 'treatment and grand means (L)', tex: '\\bar T_t=\\tfrac1n\\textstyle\\sum_s x_{ts},\\quad \\bar X=\\tfrac1m\\textstyle\\sum_t\\bar T_t', value: '3.475, 3.2, 3.75 · X̄ = 3.475', color: C.signal}]},
    {title: 'SS within subjects', seconds: 7, caption: 'Each reading\'s distance from **its own person\'s mean** is squared and added. Differences between people are left out.',
      card: [{label: 'within subjects', tex: 'SS_{wit\\,subjs}=\\textstyle\\sum_s\\sum_t(x_{ts}-\\bar S_s)^2', value: '0.18+0.2467+0.08+0.1267 = 0.6333', color: C.noise, note: 'DF = n(m − 1) = 8'}]},
    {title: 'SS treatment', seconds: 7, caption: 'The part of that movement that follows the condition is the **treatment** sum of squares.',
      card: [{label: 'treatment', tex: 'SS_{treat}=n\\textstyle\\sum_t(\\bar T_t-\\bar X)^2', value: '4[0² + 0.275² + 0.275²] = 0.605', color: C.signal}]},
    {title: 'SS residual', seconds: 6, caption: 'What is left is the **residual**, the wobble that the conditions do not explain. It is tiny here.',
      card: [{label: 'residual', tex: 'SS_{res}=SS_{wit\\,subjs}-SS_{treat}', value: '0.6333 − 0.605 = 0.0283', color: C.pink}]},
    {title: 'DF and mean squares', seconds: 7, caption: 'Divide each sum of squares by its **degrees of freedom**, m − 1 = 2 for treatment and (n − 1)(m − 1) = 6 for residual.',
      card: [{label: 'mean squares', tex: 'MS_{treat}=\\tfrac{SS_{treat}}{m-1},\\ MS_{res}=\\tfrac{SS_{res}}{(n-1)(m-1)}', value: '0.3025 and 0.004722', color: C.noise, note: 'MS_treat = 0.605 / 2 = 0.3025\nMS_res = 0.02833 / 6 = 0.004722'}]},
    {title: 'F statistic', seconds: 7, caption: 'F divides the treatment mean square by the residual one. Treatment is about **64 times** larger.',
      card: [{label: 'F with (m − 1, (n − 1)(m − 1)) df', tex: 'F=\\frac{MS_{treat}}{MS_{res}}', value: `0.3025 / 0.004722 = ${F.toFixed(2)}`, color: C.signal, note: 'exact from the data 64.059 · printed 64.053\nF has 2 and 6 df'}]},
    {title: 'Class F table', seconds: 8, caption: 'Use the **class F table**, numerator 2 across the top, denominator 6 down the side. Lightface 0.05 gives **5.14**.',
      card: [{label: 'class F table', value: '(2, 6) lightface 0.05 → 5.14', color: C.signal, note: 'boldface 0.01 → 10.92'}]},
    {title: 'Decision', seconds: 7, caption: 'F lands far past the boldface **10.92**, so mean FEV1 differs among the three conditions, P < 0.01.',
      card: [{label: 'decision', value: '64.06 > 10.92 → reject H0, P < 0.01', color: C.green, note: 'pairwise Holm t tests then find which conditions differ'}]},
  ] as Step[],
};

const S21RmAnova: React.FC = () => (
  <Frame title={meta.title} session={21} steps={meta.steps}>
    {(f, i, tl) => {
      const xs = [130, 290, 450], y = lin(2.6, 4.6, 360, 24);
      const names = ['baseline', 'endotoxin', 'endo + salb'];
      const showPlot = i <= 5;
      // partition of the within-subjects part (treatment + residual), scaled to the within total
      const bx = 600, bw = 46, top = 40, k = 300 / ssWit;
      const yRes = top + ssRes * k;
      return (<g>
        {showPlot && <g>
          <line x1={70} x2={70} y1={y(2.6)} y2={y(4.6)} stroke={C.muted} strokeWidth={1.5} />
          {[2.6, 3.0, 3.4, 3.8, 4.2, 4.6].map(v => <g key={v}><line x1={64} x2={70} y1={y(v)} y2={y(v)} stroke={C.muted} />
            <Label x={58} y={y(v) + 5} text={v.toFixed(1)} color={C.muted} size={13} anchor="end" /></g>)}
          {names.map((nm, j) => <Label key={j} x={xs[j]} y={392} text={nm} color={C.muted} anchor="middle" size={14} />)}
          <Label x={xs[1]} y={414} text="FEV1 (L)" color={C.muted} anchor="middle" size={13} />
          {X.map((r, s) => { const p = prog(tl, f, 0, 0.5 + s * 0.35); const dimL = i >= 2 && i !== 3 ? 0.3 : 0.9; return (<g key={s}>
            <polyline points={r.map((v, j) => `${xs[j]},${y(v)}`).join(' ')} fill="none" stroke={GROUP[s]} strokeWidth={2.2} opacity={p * dimL} />
            {after(tl, f, 1) && <g opacity={prog(tl, f, 1) * (i === 1 || i === 3 ? 1 : 0.25)}>
              <line x1={xs[0] - 30} x2={xs[2] + 30} y1={y(S[s])} y2={y(S[s])} stroke={GROUP[s]} strokeWidth={1.5} strokeDasharray="6 5" />
              {(i === 1 || i === 3) && <Label x={xs[2] + 38} y={y(S[s]) + 5} text={`S̄${s + 1} ${+S[s].toFixed(4)}`} color={GROUP[s]} size={13} />}
            </g>}
            {i === 3 && r.map((v, j) => <line key={j} x1={xs[j] + (s - 1.5) * 5} x2={xs[j] + (s - 1.5) * 5} y1={y(S[s])} y2={lerp(y(S[s]), y(v), prog(tl, f, 3, 1.4))} stroke={C.noise} strokeWidth={3} />)}
            {r.map((v, j) => <Glow key={j} cx={xs[j]} cy={y(v)} r={5} color={GROUP[s]} opacity={p * (i >= 2 && i !== 3 ? 0.45 : 1)} />)}
          </g>); })}
          {after(tl, f, 2) && i !== 3 && <g opacity={prog(tl, f, 2)}>
            <line x1={xs[0] - 40} x2={xs[2] + 40} y1={y(G)} y2={y(G)} stroke={C.signal} strokeWidth={1.5} strokeDasharray="3 5" />
            {i === 2 && <Label x={xs[2] + 48} y={y(G) + 5} text={`X̄ ${G.toFixed(3)}`} color={C.signal} size={13} />}
            {T.map((v, j) => (<g key={j}>
              {i === 4 && <line x1={xs[j]} x2={xs[j]} y1={y(G)} y2={lerp(y(G), y(v), prog(tl, f, 4, 1.4))} stroke={C.signal} strokeWidth={5} />}
              <rect x={xs[j] - 22} y={y(v) - 3} width={44} height={6} rx={3} fill={C.white} />
              {(i === 2 || i === 4) && <Label x={xs[j] - 28} y={y(v) + 5} text={String(+v.toFixed(3))} color={C.white} size={13} anchor="end" weight={700} />}
            </g>))}
          </g>}
          {/* within-subjects column split into treatment and residual */}
          {after(tl, f, 3) && (() => { const p = prog(tl, f, 3); const p2 = prog(tl, f, 4); const p3 = prog(tl, f, 5); return (<g opacity={p}>
            <Label x={bx + bw / 2} y={top - 12} text="within 0.6333" color={C.noise} size={13} anchor="middle" />
            <rect x={bx} y={top} width={bw} height={300} fill={C.noise} opacity={after(tl, f, 4) ? 0.15 : 0.7} />
            {after(tl, f, 4) && <rect x={bx} y={yRes} width={bw} height={(top + 300 - yRes) * p2} fill={C.signal} opacity={0.85} />}
            {after(tl, f, 4) && <Label x={bx + bw + 8} y={(yRes + top + 300) / 2} text="treat" color={C.signal} size={13} opacity={p2} />}
            {after(tl, f, 4) && <Label x={bx + bw + 8} y={(yRes + top + 300) / 2 + 18} text="0.605" color={C.signal} size={13} opacity={p2} />}
            {after(tl, f, 5) && <><rect x={bx} y={top} width={bw} height={(yRes - top) * p3} fill={C.pink} opacity={0.9} />
              <Label x={bx + bw + 8} y={top + 12} text="res" color={C.pink} size={13} opacity={p3} />
              <Label x={bx + bw + 8} y={top + 30} text="0.0283" color={C.pink} size={13} opacity={p3} /></>}
          </g>); })()}
        </g>}
        {/* degrees of freedom and mean squares */}
        {(i === 6 || i === 7) && (() => { const p = prog(tl, f, 6, 1.4); const base = 360, kk = 300 / msT; const pF = prog(tl, f, 7, 2.4);
          return (<g>
            <Label x={160} y={base + 30} text="MS treat" color={C.signal} anchor="middle" size={14} />
            <Label x={160} y={base + 50} text="0.605 / 2" color={C.muted} anchor="middle" size={13} />
            <rect x={120} y={base - msT * kk * p} width={80} height={msT * kk * p} fill={C.signal} opacity={0.85} rx={4} />
            <Label x={160} y={base - msT * kk * p - 10} text="0.3025" color={C.signal} anchor="middle" weight={700} opacity={p} />
            <Label x={340} y={base + 30} text="MS res" color={C.pink} anchor="middle" size={14} />
            <Label x={340} y={base + 50} text="0.02833 / 6" color={C.muted} anchor="middle" size={13} />
            <rect x={300} y={base - Math.max(2, msR * kk * p)} width={80} height={Math.max(2, msR * kk * p)} fill={C.pink} opacity={0.95} rx={1} />
            <Label x={340} y={base - 14} text="0.004722" color={C.pink} anchor="middle" weight={700} opacity={p} />
            <line x1={90} x2={420} y1={base} y2={base} stroke={C.muted} strokeWidth={1.5} />
            {/* F: stack residual-sized blocks up to the treatment bar */}
            {i === 7 && <g>
              {Array.from({length: Math.floor(F * pF)}, (_, j) => <rect key={j} x={480} y={base - (j + 1) * msR * kk} width={60} height={msR * kk - 0.8} fill={C.pink} opacity={0.75} />)}
              <line x1={200} x2={480} y1={base - msT * kk} y2={base - msT * kk} stroke={C.signal} strokeWidth={1.5} strokeDasharray="4 4" />
              <Label x={560} y={base - Math.floor(F * pF) * msR * kk + 4} text={`${(F * pF).toFixed(1)} × MS res`} color={C.signal} weight={700} />
            </g>}
          </g>); })()}
        {/* class F table excerpt */}
        {i === 8 && (() => { const p = prog(tl, f, 8); const cols = ['1', '2', '3'];
          const vals: Record<string, [string, string][]> = {'5': [['6.61', '16.26'], ['5.79', '13.27'], ['5.41', '12.06']], '6': [['5.99', '13.74'], ['5.14', '10.92'], ['4.76', '9.78']], '7': [['5.59', '12.25'], ['4.74', '9.55'], ['4.35', '8.45']]};
          const x0 = 150, y0 = 70, cw = 140, rh = 92; return (<g opacity={p}>
            <Label x={x0} y={y0 - 30} text="class F table · lightface 0.05, boldface 0.01" color={C.muted} size={14} />
            <Label x={x0 + 100 + cw} y={y0 - 8} text="ν_n (numerator) →" color={C.muted} size={12} anchor="middle" />
            {cols.map((c, ci) => <Label key={c} x={x0 + 100 + ci * cw} y={y0 + 14} text={c} color={c === '2' ? C.signal : C.muted} anchor="middle" weight={700} />)}
            <Label x={x0 - 60} y={y0 + 14} text="ν_d ↓" color={C.muted} size={12} />
            {Object.entries(vals).map(([row, vs], ri) => (<g key={row}>
              <Label x={x0} y={y0 + 66 + ri * rh} text={row} color={row === '6' ? C.signal : C.muted} weight={700} />
              {vs.map(([a, b], ci) => { const hit = row === '6' && ci === 1; return (<g key={ci}>
                {hit && <rect x={x0 + 100 + ci * cw - 48} y={y0 + 36 + ri * rh} width={96} height={62} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 8, 2.4)} />}
                <Label x={x0 + 100 + ci * cw} y={y0 + 60 + ri * rh} text={a} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={400} />
                <Label x={x0 + 100 + ci * cw} y={y0 + 86 + ri * rh} text={b} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={700} />
              </g>); })}
            </g>))}
          </g>); })()}
        {/* decision on the F scale */}
        {i === 9 && (() => { const xf = lin(0, 70, 60, SW - 50); const p = prog(tl, f, 9, 2.4); return (<g opacity={prog(tl, f, 9, 0.6)}>
          <AxisX x={xf} y={300} ticks={[0, 10, 20, 30, 40, 50, 60, 70]} label="F with 2 and 6 df" />
          <line x1={xf(5.14)} x2={xf(5.14)} y1={180} y2={300} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xf(5.14) - 4} y={172} text="5.14" color={C.red} anchor="end" size={13} weight={700} />
          <line x1={xf(10.92)} x2={xf(10.92)} y1={150} y2={300} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xf(10.92) + 4} y={142} text="10.92 (0.01)" color={C.red} size={13} weight={700} />
          <rect x={xf(10.92)} y={150} width={xf(70) - xf(10.92)} height={150} fill={C.red} opacity={0.08} />
          <Glow cx={xf(F * p)} cy={262} r={9} color={C.signal} />
          <Label x={xf(F * p)} y={240} text={`F = ${(F * p).toFixed(2)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S21RmAnova;
