import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Arrow, Label, range} from '../kit/plot';

// Session 19 case "s19-sbp-summary" (R summary of lm(SBPchild ~ SBPmother + SBPfather), pages 24-25)
// and case "s19-walk-refit" (practice example) for an interval that holds zero.
const n = 20, k = 2, R2 = 0.5973;
const F = (R2 / k) / ((1 - R2) / (n - k - 1));                  // 12.608
const Fc = 3.59, Fc01 = 6.11;                                  // class F table, num 2, den 17
const tc = 2.11;                                               // class t table row 17, column 0.05
const coef = [{name: 'SBPmother', b: 0.4225, se: 0.1185, c: GROUP[1]}, {name: 'SBPfather', b: 0.415, se: 0.1248, c: GROUP[0]}];
const tv = coef.map(c => c.b / c.se);                           // 3.565, 3.325
const ci = coef.map(c => [c.b - tc * c.se, c.b + tc * c.se]);  // [0.1725, 0.6725], [0.1517, 0.6783]
const b0 = -15.6892, pred = b0 + 0.4225 * 130 + 0.415 * 150;   // 101.49
const walk = [{name: 'Age', lo: -4.4264, hi: -1.8976}, {name: 'BMI', lo: -2.2378, hi: 4.0852}, {name: 'Exercise', lo: 9.1648, hi: 21.2267}];

export const meta = {
  id: 's19-s19mlrtest', session: 19, method: 's19mlrtest',
  cases: {'s19-sbp-summary': [3, 3, 4, 7, 7, 8, 10], 's19-walk-refit': [1, 5, 7, 9, 9, 10]},
  title: 'Multiple regression · reading summary()',
  steps: [
    {title: 'The R summary', seconds: 7, caption: 'R fits child SBP on both parents with lm(). The **Estimate** column gives the coefficients of the fitted plane.',
      card: [{label: 'fitted plane', value: 'ŷ = −15.6892 + 0.4225x1 + 0.4150x2', color: C.signal}]},
    {title: 'Whole-model null', seconds: 6, caption: 'The F test asks whether **both slopes are zero together**, which would mean neither parent predicts the child.',
      card: [{label: 'null hypothesis', tex: 'H_0:\\beta_1=\\beta_2=0', note: 'alternative: β1 ≠ 0 and/or β2 ≠ 0', color: C.signal}]},
    {title: 'F from R squared', seconds: 8, caption: 'F compares explained variation per model df with leftover variation per residual df. Here **F = 12.61 on 2 and 17 df**.',
      card: [{label: 'F statistic', tex: 'F=\\frac{MS_{mod}}{MS_{res}}=\\frac{R^2/k}{(1-R^2)/(n-k-1)}', value: `0.29865 / 0.023688 = ${F.toFixed(2)}`, note: 'df: k = 2 and n − k − 1 = 20 − 2 − 1 = 17', color: C.signal}]},
    {title: 'Class F table', seconds: 7, caption: 'In the **class F table**, column 2 and row 17 give **3.59** in lightface for 0.05 and 6.11 in boldface for 0.01.',
      card: [{label: 'class F table', value: 'num 2 · den 17 → 3.59 (0.05)', note: 'boldface 6.11 (0.01)', color: C.signal}]},
    {title: 'F decision', seconds: 7, caption: 'F = 12.61 passes both cutoffs, so **reject H0**. The table supports P < 0.01, and R\'s exact P is 0.0004388.',
      card: [{label: 'decision', value: '12.61 > 6.11 → reject H0', note: 'table: P < 0.01 · R: P = 0.0004388 (< 0.001)', color: C.green}]},
    {title: 'Class t table', seconds: 7, caption: 'Each coefficient gets its own t test on 17 df. The **class t table** (two-tailed), row 17, column 0.05 gives **2.110**.',
      card: [{label: 'class t table', tex: '\\nu=n-k-1=17', value: 'row 17 · column 0.05 → 2.110', color: C.signal}]},
    {title: 't per coefficient', seconds: 8, caption: 'Both t values pass 2.110, so **each parent matters** with the other held fixed, with 0.002 < P < 0.005.',
      card: [{label: 't = estimate / SE', tex: 't=\\frac{b_j}{s_{b_j}}', value: `mother 0.4225 / 0.1185 = ${tv[0].toFixed(3)}`, note: `father 0.4150 / 0.1248 = ${tv[1].toFixed(3)}\nboth between 3.222 and 3.646 → 0.002 < P < 0.005`, color: C.signal}]},
    {title: 'Intervals and zero', seconds: 7, caption: 'Each 95% interval is the estimate ± 2.110 standard errors. **Neither holds zero**, which matches the t tests.',
      card: [{label: '95% intervals (confint)', tex: 'b_j\\pm t_{0.05}(17)\\,s_{b_j}', value: `mother (${ci[0][0].toFixed(4)}, ${ci[0][1].toFixed(4)})`, note: `father (${ci[1][0].toFixed(4)}, ${ci[1][1].toFixed(4)})`, color: C.signal}]},
    {title: 'When zero is inside', seconds: 8, caption: 'In a practice walk-distance example the BMI interval **holds zero**, so BMI is dropped and the model is refit.',
      card: [{label: 'practice example · confint()', value: 'BMI (−2.2378, 4.0852) holds 0', note: 'refit: ŷ = 606.1512 − 3.2801·Age + 14.58·Exercise', color: C.pink}]},
    {title: 'Predict', seconds: 7, caption: 'Put the parents\' values into the plane. Parents at 130 and 150 mm Hg give a mean child SBP of **101.5 mm Hg**.',
      card: [{label: 'prediction', tex: '\\hat y=b_0+b_1x_1+b_2x_2', value: '−15.6892 + 0.4225·130 + 0.4150·150', note: `= ${pred.toFixed(2)} mm Hg`, color: C.signal}]},
  ] as Step[],
};

// The summary() output, drawn as aligned columns.
const ROWS = [
  ['(Intercept)', '-15.6892', '23.6503', '-0.663', '0.51598', ''],
  ['SBPmother', '0.4225', '0.1185', '3.565', '0.00238', '**'],
  ['SBPfather', '0.4150', '0.1248', '3.325', '0.00401', '**'],
];
const COLX = [20, 250, 360, 450, 545, 560];   // right edges for numeric columns
const Summary: React.FC<{boxCol?: number; boxF?: boolean; boxR?: boolean; pb: number}> = ({boxCol, boxF, boxR, pb}) => {
  const y0 = 30, rh = 24;
  return (<g fontFamily={mono} fontSize={15}>
    <text x={20} y={y0} fill={C.muted}>Coefficients:</text>
    {['Estimate', 'Std. Error', 't value', 'Pr(>|t|)'].map((h, c) => <text key={h} x={COLX[c + 1]} y={y0 + rh} fill={C.muted} textAnchor="end">{h}</text>)}
    {ROWS.map((r, ri) => (<g key={ri}>
      <text x={COLX[0]} y={y0 + rh * (ri + 2)} fill={ri ? coef[ri - 1].c : C.ink}>{r[0]}</text>
      {r.slice(1, 5).map((v, c) => <text key={c} x={COLX[c + 1]} y={y0 + rh * (ri + 2)} fill={C.ink} textAnchor="end">{v}</text>)}
      <text x={COLX[5]} y={y0 + rh * (ri + 2)} fill={C.muted}>{r[5]}</text>
    </g>))}
    <text x={20} y={y0 + rh * 5.6} fill={C.ink}>Residual standard error: 10.67 on 17 degrees of freedom</text>
    <text x={20} y={y0 + rh * 6.6} fill={C.ink}>Multiple R-squared: 0.5973, Adjusted R-squared: 0.5499</text>
    <text x={20} y={y0 + rh * 7.6} fill={C.ink}>F-statistic: 12.61 on 2 and 17 DF, p-value: 0.0004388</text>
    {boxCol !== undefined && <rect x={COLX[boxCol] - (boxCol === 3 ? 66 : 92)} y={y0 + rh + 6} width={boxCol === 3 ? 74 : 100} height={rh * 3 + 4} rx={6} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={pb} />}
    {boxF && <rect x={12} y={y0 + rh * 6.85} width={545} height={rh} rx={6} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={pb} />}
    {boxR && <rect x={12} y={y0 + rh * 5.85} width={256} height={rh} rx={6} fill="none" stroke={C.noise} strokeWidth={2.5} opacity={pb} />}
  </g>);
};

const Table: React.FC<{title: string; cols: string[]; rows: [string, string[]][]; hit: [string, number]; alt?: [string, number][]; p: number; pb: number; cw?: number; rowLabel?: string; bw?: number}> = ({title, cols, rows, hit, alt = [], p, pb, cw = 120, rowLabel = 'ν', bw = 104}) => {
  const x0 = 120, y0 = 100, rh = 64;
  return (<g opacity={p}>
    <Label x={x0} y={y0 - 34} text={title} color={C.muted} size={14} />
    {cols.map((c, ci) => <Label key={c} x={x0 + 120 + ci * cw} y={y0} text={c} color={ci === hit[1] ? C.signal : C.muted} anchor="middle" weight={700} />)}
    {rows.map(([r, vs], ri) => (<g key={r}>
      <Label x={x0} y={y0 + 50 + ri * rh} text={`${rowLabel} = ${r}`} color={r === hit[0] ? C.signal : C.muted} weight={700} />
      {vs.map((v, ci) => { const h = r === hit[0] && ci === hit[1]; const a = alt.some(([ar, ac]) => ar === r && ac === ci); return (<g key={ci}>
        {(h || a) && <rect x={x0 + 120 + ci * cw - bw / 2} y={y0 + 26 + ri * rh} width={bw} height={34} rx={8} fill="none" stroke={h ? C.signal : C.green} strokeWidth={2.5} opacity={pb} />}
        <Label x={x0 + 120 + ci * cw} y={y0 + 50 + ri * rh} text={v} color={h ? C.signal : a ? C.green : C.ink} anchor="middle" size={h ? 18 : 15} weight={h ? 700 : 400} /></g>); })}
    </g>))}
  </g>);
};

const S19Mlrtest: React.FC = () => (
  <Frame title={meta.title} session={19} steps={meta.steps}>
    {(f, i, tl) => {
      const showSum = i <= 2 || i === 6;
      return (<g>
        {showSum && <g opacity={i === 0 ? prog(tl, f, 0, 0.8) : 1}>
          <Summary pb={prog(tl, f, i, 1.6)} boxCol={i === 0 ? 1 : i === 6 ? 3 : undefined} boxF={i === 1 || i === 2} boxR={i === 2} />
        </g>}
        {/* R squared split for F */}
        {i === 2 && (() => { const x0 = 40, W = 520, q = prog(tl, f, 2, 1.4), q2 = prog(tl, f, 2, 3); const wr = W * R2; return (<g>
          <rect x={x0} y={262} width={wr * q} height={30} rx={5} fill={C.signal} opacity={0.85} />
          <rect x={x0 + wr} y={262} width={(W - wr) * q} height={30} rx={5} fill={C.noise} opacity={0.75} />
          <text x={x0 + wr / 2} y={282} fill={C.bg} fontSize={14} fontFamily={mono} textAnchor="middle" fontWeight={700} opacity={q}>R² 0.5973</text>
          <text x={x0 + wr + (W - wr) / 2} y={282} fill={C.bg} fontSize={14} fontFamily={mono} textAnchor="middle" fontWeight={700} opacity={q}>1 − R² 0.4027</text>
          <g opacity={q2}>
            <Label x={x0 + wr / 2} y={326} text="÷ k = 2 → 0.29865" color={C.signal} size={14} anchor="middle" />
            <Label x={x0 + wr + (W - wr) / 2} y={326} text="÷ 17 → 0.023688" color={C.noise} size={14} anchor="middle" />
            <Label x={x0 + W / 2} y={376} text={`F = 0.29865 / 0.023688 = ${F.toFixed(2)}`} color={C.signal} size={18} anchor="middle" weight={700} />
          </g>
        </g>); })()}
        {i === 3 && <Table title="class F table · lightface 0.05 / boldface 0.01" cols={['νn = 1', 'νn = 2', 'νn = 3']} rowLabel="νd"
          rows={[['16', ['4.49 / 8.53', '3.63 / 6.23', '3.24 / 5.29']], ['17', ['4.45 / 8.40', '3.59 / 6.11', '3.20 / 5.18']], ['18', ['4.41 / 8.28', '3.55 / 6.01', '3.16 / 5.09']]]}
          hit={['17', 1]} p={prog(tl, f, 3)} pb={prog(tl, f, 3, 2.4)} cw={150} bw={140} />}
        {/* F distribution with 2 and 17 df: f(x) = (1 + 2x/17)^-9.5 */}
        {i === 4 && (() => { const x = lin(0, 14, 60, 730), y = lin(0, 1, 360, 60); const fx = (v: number) => (1 + 2 * v / 17) ** -9.5; const q = prog(tl, f, 4, 2);
          const xs = range(0, 14, 200); const tail = range(Fc, 14, 120);
          return (<g>
            <path d={`M${x(Fc)},${y(0)} ` + tail.map(v => `L${x(v).toFixed(1)},${y(fx(v)).toFixed(1)}`).join(' ') + ` L${x(14)},${y(0)} Z`} fill={C.signal} opacity={0.18} />
            <path d={xs.map((v, j) => `${j ? 'L' : 'M'}${x(v).toFixed(1)},${y(fx(v)).toFixed(1)}`).join(' ')} fill="none" stroke={C.noise} strokeWidth={3} />
            <line x1={x(Fc)} x2={x(Fc)} y1={140} y2={360} stroke={C.signal} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={x(Fc) + 6} y={150} text="3.59 (0.05)" color={C.signal} size={13} />
            <line x1={x(Fc01)} x2={x(Fc01)} y1={200} y2={360} stroke={C.muted} strokeWidth={2} strokeDasharray="3 5" />
            <Label x={x(Fc01) + 6} y={210} text="6.11 (0.01)" color={C.muted} size={13} />
            <Glow cx={x(F * q)} cy={330} r={9} color={C.green} />
            {q > 0.98 && <Label x={x(F)} y={306} text="F = 12.61" color={C.green} size={16} weight={700} anchor="middle" />}
            <AxisX x={x} y={360} ticks={[0, 2, 4, 6, 8, 10, 12, 14]} label="F with 2 and 17 df" />
          </g>); })()}
        {i === 5 && <Table title="class t table · two-tailed α" cols={['0.05', '0.01', '0.005', '0.002']}
          rows={[['16', ['2.120', '2.921', '3.252', '3.686']], ['17', ['2.110', '2.898', '3.222', '3.646']], ['18', ['2.101', '2.878', '3.197', '3.610']]]}
          hit={['17', 0]} alt={[['17', 2], ['17', 3]]} p={prog(tl, f, 5)} pb={prog(tl, f, 5, 2.4)} />}
        {/* t values on the t scale */}
        {i === 6 && (() => { const x = lin(0, 4, 60, 720); return (<g>
          <rect x={x(tc)} y={250} width={x(4) - x(tc)} height={110} fill={C.signal} opacity={0.08} />
          <line x1={x(tc)} x2={x(tc)} y1={248} y2={360} stroke={C.signal} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={x(tc) - 6} y={262} text="2.110" color={C.signal} size={13} anchor="end" />
          {[3.222, 3.646].map(v => <line key={v} x1={x(v)} x2={x(v)} y1={262} y2={360} stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 5" />)}
          {coef.map((c, j) => { const q = prog(tl, f, 6, 1.4 + j * 0.5); const yy = 290 + j * 40; return (<g key={j}>
            <Glow cx={x(tv[j] * q)} cy={yy} r={8} color={c.c} />
            {q > 0.98 && <Label x={Math.min(x(tv[j]) - 14, x(3.222) - 8)} y={yy + 5} text={`${c.name.replace('SBP', '')} ${tv[j].toFixed(3)}`} color={c.c} size={13} anchor="end" />}</g>); })}
          <AxisX x={x} y={360} ticks={[0, 1, 2, 3, 4]} label="t with 17 df" />
        </g>); })()}
        {/* confidence intervals vs zero */}
        {i === 7 && (() => { const x = lin(-0.2, 0.8, 80, 720); return (<g>
          <line x1={x(0)} x2={x(0)} y1={90} y2={330} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={x(0)} y={80} text="0 = no effect" color={C.red} size={13} anchor="middle" />
          {coef.map((c, j) => { const q = prog(tl, f, 7, 1.2 + j * 0.5); const yy = 160 + j * 90; return (<g key={j}>
            <Label x={x(-0.2)} y={yy - 22} text={c.name} color={c.c} size={14} />
            <line x1={x(c.b - (c.b - ci[j][0]) * q)} x2={x(c.b + (ci[j][1] - c.b) * q)} y1={yy} y2={yy} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
            <Glow cx={x(c.b)} cy={yy} r={7} color={c.c} />
            {q > 0.98 && <><Label x={x(ci[j][0])} y={yy + 26} text={ci[j][0].toFixed(4)} color={C.signal} size={13} anchor="middle" /><Label x={x(ci[j][1])} y={yy + 26} text={ci[j][1].toFixed(4)} color={C.signal} size={13} anchor="middle" /></>}
          </g>); })}
          <AxisX x={x} y={350} ticks={[-0.2, 0, 0.2, 0.4, 0.6, 0.8]} fmt={v => v.toFixed(1)} label="coefficient (mm Hg per mm Hg)" />
        </g>); })()}
        {/* practice example: each row on its own scale */}
        {i === 8 && (() => { return (<g>
          <Label x={20} y={40} text="practice example · walk distance (m) · confint()" color={C.muted} size={14} />
          {walk.map((w, j) => { const lo = Math.min(w.lo, 0), hi = Math.max(w.hi, 0); const pad = (hi - lo) * 0.12; const x = lin(lo - pad, hi + pad, 200, 720); const yy = 110 + j * 105; const q = prog(tl, f, 8, 1 + j * 0.5); const has0 = w.lo < 0 && w.hi > 0; return (<g key={j} opacity={q}>
            <Label x={20} y={yy + 5} text={w.name} color={has0 ? C.pink : C.ink} size={16} weight={700} />
            <line x1={200} x2={720} y1={yy + 30} y2={yy + 30} stroke={C.line} strokeWidth={1.5} />
            <line x1={x(0)} x2={x(0)} y1={yy - 22} y2={yy + 36} stroke={C.red} strokeWidth={2} strokeDasharray="4 4" />
            <Label x={x(0)} y={yy + 52} text="0" color={C.red} size={13} anchor="middle" />
            <line x1={x(w.lo)} x2={x(w.hi)} y1={yy} y2={yy} stroke={has0 ? C.pink : C.signal} strokeWidth={6} strokeLinecap="round" />
            <Label x={x(w.lo)} y={yy - 12} text={w.lo.toFixed(4)} color={C.muted} size={13} anchor="middle" />
            <Label x={x(w.hi)} y={yy - 12} text={w.hi.toFixed(4)} color={C.muted} size={13} anchor="middle" />
          </g>); })}
        </g>); })()}
        {/* prediction waterfall */}
        {i === 9 && (() => { const x = lin(-20, 110, 80, 720); const steps = [{a: 0, b: b0, t: 'b0 = −15.69', c: C.muted}, {a: b0, b: b0 + 54.925, t: '0.4225 × 130 = 54.93', c: GROUP[1]}, {a: b0 + 54.925, b: pred, t: '0.4150 × 150 = 62.25', c: GROUP[0]}];
          return (<g>
            {steps.map((s, j) => { const q = prog(tl, f, 9, 0.8 + j * 0.8); const yy = 70 + j * 80; const l = Math.min(s.a, s.b), r = Math.max(s.a, s.b); return (<g key={j} opacity={q > 0 ? 1 : 0}>
              <rect x={x(s.b < s.a ? lerp(s.a, l, q) : l)} y={yy} width={(x(r) - x(l)) * q} height={30} rx={5} fill={s.c} opacity={0.85} />
              <Label x={j ? x(s.a) : x(0) + 8} y={yy - 8} text={s.t} color={s.c} size={14} />
              {j < 2 && q > 0.98 && <line x1={x(s.b)} x2={x(s.b)} y1={yy + 30} y2={yy + 80} stroke={C.muted} strokeDasharray="3 4" />}
            </g>); })}
            {after(tl, f, 9) && prog(tl, f, 9, 3) > 0.98 && <><Glow cx={x(pred)} cy={318} r={9} color={C.signal} /><Label x={x(pred)} y={296} text={`ŷ = ${pred.toFixed(2)}`} color={C.signal} size={17} weight={700} anchor="middle" /></>}
            <line x1={x(0)} x2={x(0)} y1={50} y2={350} stroke={C.line} strokeWidth={1.5} />
            <AxisX x={x} y={350} ticks={[-20, 0, 20, 40, 60, 80, 100]} label="child SBP (mm Hg)" />
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S19Mlrtest;
