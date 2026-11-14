import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 20 slides 14-18 method on the original practice case "s20-breathing-rmanova":
// heart rate (beats/min) of 4 volunteers under slow paced, normal and rapid paced breathing.
const X = [[70, 74, 81], [62, 67, 70], [80, 79, 90], [66, 72, 73]];
const n = X.length, m = X[0].length;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const S = X.map(mean);                                               // 75, 66.33, 83, 70.33
const T = [0, 1, 2].map(j => mean(X.map(r => r[j])));                // 69.5, 73, 78.5
const G = mean(T);                                                   // 73.667
const ssS = X.map((r, s) => r.reduce((a, v) => a + (v - S[s]) ** 2, 0)); // 62, 32.67, 74, 28.67
const ssWit = ssS.reduce((a, b) => a + b, 0);                        // 197.333
const ssTreat = n * T.reduce((a, v) => a + (v - G) ** 2, 0);         // 164.667
const ssRes = ssWit - ssTreat;                                       // 32.667
const ssTot = X.flat().reduce((a, v) => a + (v - G) ** 2, 0);        // 658.667
const ssBet = ssTot - ssWit;                                         // 461.333
const msT = ssTreat / (m - 1), msR = ssRes / ((n - 1) * (m - 1));     // 82.333, 5.444
const F = msT / msR;                                                 // 15.1224
const f2 = (v: number) => v.toFixed(2);

export const meta = {
  id: 's20-s20rmanova', session: 20, method: 's20rmanova',
  cases: {
    's20-breathing-rmanova': [1, 2, 3, 5, 6, 7, 8, 9, 10],
    's20-oc-rmanova': [1, 2, 3, 5, 6, 7, 8, 9, 10, 10],
  },
  title: 'Repeated measures ANOVA · splitting the variation',
  steps: [
    {title: 'Same people, three treatments', seconds: 7, caption: 'In a practice example, four volunteers each did slow, normal and rapid breathing while **heart rate** was recorded.',
      card: [{label: 'hypotheses', tex: 'H_0:\\mu_{\\mathrm{slow}}=\\mu_{\\mathrm{normal}}=\\mu_{\\mathrm{rapid}}', note: 'H_A: at least one mean differs\nm = 3 treatments · n = 4 subjects'}]},
    {title: 'Subject means', seconds: 6, caption: 'Each person has their own **subject mean**. People differ a lot, from about 66 to 83 beats/min.',
      card: [{label: 'subject means', tex: '\\bar S_s=\\tfrac1m\\textstyle\\sum_t x_{ts}', value: `${S.map(v => +v.toFixed(2)).join(', ')}`, color: C.ink}]},
    {title: 'Treatment means', seconds: 7, caption: 'The **treatment means** average each kind of breathing over the four people. The grand mean is 73.67.',
      card: [{label: 'treatment and grand means', tex: '\\bar T_t=\\tfrac1n\\textstyle\\sum_s x_{ts},\\quad \\bar X=\\tfrac{884}{12}', value: `${T.join(', ')} · X̄ = ${f2(G)}`, color: C.signal}]},
    {title: 'Split the total', seconds: 8, caption: 'Total variation splits into **between subjects**, how people differ, and **within subjects**, how each person moves.',
      card: [{label: 'first split', tex: 'SS_{tot}=SS_{bet\\,subjs}+SS_{wit\\,subjs}', value: `${f2(ssTot)} = ${f2(ssBet)} + ${f2(ssWit)}`, color: C.noise}]},
    {title: 'Within subjects', seconds: 7, caption: 'Within subjects measures how far each reading sits from **that person\'s own mean**, added over everyone.',
      card: [{label: 'within subjects', tex: 'SS_{wit\\,subjs}=\\textstyle\\sum_s\\sum_t(x_{ts}-\\bar S_s)^2', value: `62 + 32.67 + 74 + 28.67 = ${f2(ssWit)}`, color: C.noise, note: 'DF = n(m − 1) = 8'}]},
    {title: 'Treatment part', seconds: 7, caption: 'Part of that movement follows the kind of breathing. That part is the **treatment** sum of squares.',
      card: [{label: 'treatment', tex: 'SS_{treat}=n\\textstyle\\sum_t(\\bar T_t-\\bar X)^2', value: `= ${ssTreat.toFixed(3)}`, color: C.signal, note: '4[(69.5 − 73.667)² + (73 − 73.667)² + (78.5 − 73.667)²]\nDF = m − 1 = 2'}]},
    {title: 'Residual', seconds: 6, caption: 'What is left over is the **residual**, random wobble that the treatments do not explain.',
      card: [{label: 'residual', tex: 'SS_{res}=SS_{wit\\,subjs}-SS_{treat}', value: `${ssWit.toFixed(3)} − ${ssTreat.toFixed(3)} = ${ssRes.toFixed(3)}`, color: C.pink, note: 'DF = (n − 1)(m − 1) = 6'}]},
    {title: 'F ratio', seconds: 8, caption: 'F compares treatment with residual. The **between-subjects** part never enters F, so differences between people drop out.',
      card: [{label: 'F statistic', tex: 'F=\\frac{SS_{treat}/(m-1)}{SS_{res}/[(n-1)(m-1)]}', value: `${msT.toFixed(3)} / ${msR.toFixed(3)} = ${F.toFixed(4)}`, color: C.signal}]},
    {title: 'Class F table', seconds: 8, caption: 'Use the **class F table**, numerator 2 across the top, denominator 6 down the side. Lightface 0.05 gives **5.14**.',
      card: [{label: 'class F table', value: '(2, 6) lightface 0.05 → 5.14', color: C.signal, note: 'boldface 0.01 → 10.92'}]},
    {title: 'Decision', seconds: 7, caption: 'F passes 5.14 and also the boldface **10.92**, so heart rate differs among the kinds of breathing, P < 0.01.',
      card: [{label: 'decision', value: '15.12 > 10.92 → reject H0, P < 0.01', color: C.green, note: 'with only m = 2 treatments, F equals the paired t squared'}]},
  ] as Step[],
};

const S20Rmanova: React.FC = () => (
  <Frame title={meta.title} session={20} steps={meta.steps}>
    {(f, i, tl) => {
      const xs = [130, 280, 430], y = lin(58, 94, 360, 24);
      const names = ['slow', 'normal', 'rapid'];
      const showPlot = i <= 7;
      // partition column on the right
      const bx = 560, bw = 46, top = 30, k = 340 / ssTot;
      const yBet = top + ssWit * k;            // bottom of within part
      const yTreat = top + ssRes * k;          // within part = residual (top) + treatment (below)
      return (<g>
        {showPlot && <g opacity={i === 3 ? 0.35 : 1}>
          <line x1={70} x2={70} y1={y(60)} y2={y(90)} stroke={C.muted} strokeWidth={1.5} />
          {[60, 70, 80, 90].map(v => <g key={v}><line x1={64} x2={70} y1={y(v)} y2={y(v)} stroke={C.muted} />
            <Label x={58} y={y(v) + 5} text={String(v)} color={C.muted} size={13} anchor="end" /></g>)}
          {names.map((nm, j) => <Label key={j} x={xs[j]} y={392} text={nm} color={C.muted} anchor="middle" size={14} />)}
          <Label x={xs[1]} y={414} text="heart rate (beats/min) by breathing" color={C.muted} anchor="middle" size={13} />
          {X.map((r, s) => { const p = prog(tl, f, 0, 0.5 + s * 0.35); return (<g key={s}>
            <polyline points={r.map((v, j) => `${xs[j]},${y(v)}`).join(' ')} fill="none" stroke={GROUP[s]} strokeWidth={2.2} opacity={p * (i >= 2 && i !== 4 ? 0.35 : 0.9)} />
            {/* subject mean */}
            {after(tl, f, 1) && <g opacity={prog(tl, f, 1) * (i === 1 || i === 4 ? 1 : 0.3)}>
              <line x1={xs[0] - 30} x2={xs[2] + 30} y1={y(S[s])} y2={y(S[s])} stroke={GROUP[s]} strokeWidth={1.5} strokeDasharray="6 5" />
              {(i === 1 || i === 4) && <Label x={xs[2] + 38} y={y(S[s]) + 5} text={`S̄${s + 1} ${+S[s].toFixed(2)}`} color={GROUP[s]} size={13} />}
            </g>}
            {/* deviations from the subject mean */}
            {i === 4 && r.map((v, j) => <line key={j} x1={xs[j] + (s - 1.5) * 5} x2={xs[j] + (s - 1.5) * 5} y1={y(S[s])} y2={lerp(y(S[s]), y(v), prog(tl, f, 4, 1.4))} stroke={C.noise} strokeWidth={3} />)}
            {r.map((v, j) => <Glow key={j} cx={xs[j]} cy={y(v)} r={5} color={GROUP[s]} opacity={p * (i >= 2 && i !== 4 ? 0.45 : 1)} />)}
          </g>); })}
          {/* treatment means and grand mean */}
          {after(tl, f, 2) && i !== 4 && <g opacity={prog(tl, f, 2)}>
            <line x1={xs[0] - 40} x2={xs[2] + 40} y1={y(G)} y2={y(G)} stroke={C.signal} strokeWidth={1.5} strokeDasharray="3 5" />
            {i === 2 && <Label x={xs[2] + 48} y={y(G) + 5} text={`X̄ ${f2(G)}`} color={C.signal} size={13} />}
            {T.map((v, j) => (<g key={j}>
              {i === 5 && <line x1={xs[j]} x2={xs[j]} y1={y(G)} y2={lerp(y(G), y(v), prog(tl, f, 5, 1.4))} stroke={C.signal} strokeWidth={5} />}
              <rect x={xs[j] - 22} y={y(v) - 3} width={44} height={6} rx={3} fill={C.white} />
              {(i === 2 || i === 5) && <Label x={xs[j] - 28} y={y(v) + 5} text={String(v)} color={C.white} size={13} anchor="end" weight={700} />}
            </g>))}
          </g>}
        </g>}
        {/* partition column */}
        {after(tl, f, 3) && showPlot && (() => { const p = prog(tl, f, 3, 1.2); const p2 = prog(tl, f, 5, 1.2); const p3 = prog(tl, f, 6, 1.2);
          const fadeBet = i >= 7 ? 0.25 : 1; return (<g opacity={p}>
            <Label x={bx - 4} y={top - 10} text={`total ${f2(ssTot)}`} color={C.ink} size={13} />
            <rect x={bx} y={yBet} width={bw} height={(top + 340 - yBet) * p} fill={C.blue} opacity={0.55 * fadeBet} />
            <rect x={bx} y={top} width={bw} height={(yBet - top)} fill={C.noise} opacity={after(tl, f, 5) ? 0.15 : 0.7} />
            {after(tl, f, 5) && <rect x={bx} y={yTreat} width={bw} height={(yBet - yTreat) * p2} fill={C.signal} opacity={0.85} />}
            {after(tl, f, 6) && <rect x={bx} y={top} width={bw} height={(yTreat - top) * p3} fill={C.pink} opacity={0.85} />}
            <Label x={bx + bw + 10} y={(yBet + top + 340) / 2} text="between" color={C.blue} size={13} opacity={fadeBet} />
            <Label x={bx + bw + 10} y={(yBet + top + 340) / 2 + 18} text={f2(ssBet)} color={C.blue} size={13} opacity={fadeBet} />
            {i >= 7 && <Label x={bx + bw + 10} y={(yBet + top + 340) / 2 + 38} text="not in F" color={C.red} size={13} opacity={prog(tl, f, 7)} />}
            {!after(tl, f, 5) && <><Label x={bx + bw + 10} y={(yBet + top) / 2 + 2} text="within" color={C.noise} size={13} />
              <Label x={bx + bw + 10} y={(yBet + top) / 2 + 20} text={f2(ssWit)} color={C.noise} size={13} /></>}
            {after(tl, f, 5) && <><Label x={bx + bw + 10} y={(yBet + yTreat) / 2 + 2} text="treatment" color={C.signal} size={13} opacity={p2} />
              <Label x={bx + bw + 10} y={(yBet + yTreat) / 2 + 20} text={f2(ssTreat)} color={C.signal} size={13} opacity={p2} /></>}
            {after(tl, f, 6) && <Label x={bx + bw + 10} y={yTreat - 2} text={`residual ${f2(ssRes)}`} color={C.pink} size={13} opacity={p3} />}
          </g>); })()}
        {/* class F table excerpt: numerator across the top, denominator down the side */}
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
        {i === 9 && (() => { const xf = lin(0, 20, 60, SW - 50); const p = prog(tl, f, 9, 2); return (<g opacity={prog(tl, f, 9, 0.6)}>
          <AxisX x={xf} y={300} ticks={[0, 5, 10, 15, 20]} label="F with 2 and 6 df" />
          {[[5.14, '5.14 (0.05)', C.red], [10.92, '10.92 (0.01)', C.red]].map(([v, txt, c], kk) => (<g key={kk}>
            <line x1={xf(v as number)} x2={xf(v as number)} y1={kk ? 150 : 180} y2={300} stroke={c as string} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xf(v as number)} y={kk ? 142 : 172} text={txt as string} color={c as string} anchor="middle" size={13} weight={700} /></g>))}
          <rect x={xf(10.92)} y={150} width={xf(20) - xf(10.92)} height={150} fill={C.red} opacity={0.08} />
          <Glow cx={xf(F * p)} cy={262} r={9} color={C.signal} />
          <Label x={xf(F * p)} y={240} text={`F = ${(F * p).toFixed(2)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S20Rmanova;
