import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';
import {mono} from '../kit/theme';

// Original practice example (Session 20 case "s20-hr-posture-r"): heart rate seated then standing, n = 8.
// R output produced with R 4.6.1 t.test(standing, seated, paired = TRUE), copied from the case data.
const seated = [64, 72, 58, 80, 69, 75, 61, 70];
const standing = [75, 70, 66, 83, 74, 87, 60, 77];
const dd = standing.map((v, k) => v - seated[k]);                 // 11 -2 8 3 5 12 -1 7
const n = dd.length;
const dbar = dd.reduce((a, b) => a + b, 0) / n;                   // 5.375
const sd = Math.sqrt(dd.reduce((a, b) => a + (b - dbar) ** 2, 0) / (n - 1)); // 5.15302
const se = sd / Math.sqrt(n);                                     // 1.82187
const t = dbar / se;                                              // 2.95027
const tc = 2.365;                                                 // class t table, row 7, column 0.05
const lo = dbar - tc * se, hi = dbar + tc * se;                   // 1.06629, 9.68371
const code = ['seated   <- c(64,72,58,80,69,75,61,70)', 'standing <- c(75,70,66,83,74,87,60,77)', 't.test(standing, seated, paired = TRUE)'];
const out = ['Paired t-test', 'data:  standing and seated', 't = 2.9503, df = 7, p-value = 0.0214',
  'alternative hypothesis: true mean difference is not equal to 0', '95 percent confidence interval:', ' 1.066971 9.683029',
  'sample estimates:', 'mean difference', '          5.375'];

export const meta = {
  id: 's20-s20pairedR', session: 20, method: 's20pairedR',
  cases: {'s20-hr-posture-r': [1, 2, 3, 3, 3, 4, 4, 4, 5, 7]},
  title: 'Paired t test in R · matching the output',
  steps: [
    {title: 'Seated then standing', seconds: 7, caption: 'In a practice example, eight volunteers had heart rate measured **seated and then standing**. Each line is one person.',
      card: [{label: 'data (beats/min)', note: 'seated    64 72 58 80 69 75 61 70\nstanding  75 70 66 83 74 87 60 77'},
        {label: 'hypotheses', tex: 'H_0:\\delta=0\\qquad H_A:\\delta\\ne0', note: 'δ = true mean of standing − seated'}]},
    {title: 'Differences', seconds: 6, caption: 'Subtract seated from standing for each person. That gives **one difference per person**, n = 8.',
      card: [{label: 'differences', tex: 'd_i=x1_i-x2_i', value: '11, −2, 8, 3, 5, 12, −1, 7', color: C.signal, note: 'x1 = standing, x2 = seated'}]},
    {title: 'Hand calculation', seconds: 8, caption: 'By hand, the **mean difference** is 5.375 and the standard error is 1.822 beats/min.',
      card: [{label: 'mean and spread', tex: '\\bar d=\\tfrac{43}{8},\\quad s_d=\\sqrt{\\tfrac{185.875}{7}},\\quad s_{\\bar d}=\\tfrac{s_d}{\\sqrt8}', value: `${dbar} · ${sd.toFixed(5)} · ${se.toFixed(5)}`, color: C.noise}]},
    {title: 't by hand', seconds: 8, caption: 'So t = **2.950** with 7 df. The **class t table** row 7 gives 2.365 at 0.05 and 2.998 at 0.02, so 0.02 < P < 0.05.',
      card: [{label: 't statistic', tex: 't=\\frac{\\bar d}{s_{\\bar d}},\\quad \\nu=n-1=7', value: `5.375 / 1.82187 = ${t.toFixed(5)}`, color: C.signal},
        {label: 'class t table', value: 'row 7 · column 0.05 → 2.365', color: C.signal, note: 'column 0.02 → 2.998, so 0.02 < P < 0.05'}]},
    {title: 'The R call', seconds: 6, caption: 'In R, **paired = TRUE** asks for the paired test. Listing standing first gives standing minus seated.',
      card: [{label: 'R', value: 't.test(x1, x2, paired = TRUE)', note: 'R subtracts the second vector from the first'}]},
    {title: 'R output', seconds: 6, caption: 'R prints the test name, t, df and an exact P value, the alternative, a 95% interval and the **mean difference**.'},
    {title: 't, df and P', seconds: 8, caption: 't and df match the hand values. The **exact P = 0.0214** sits inside the table bracket 0.02 to 0.05.',
      card: [{label: 'line 3 ↔ hand work', value: 't 2.9503 ↔ 2.95027 · df 7 ↔ n − 1', color: C.signal, note: 'p-value 0.0214 ↔ 0.02 < P < 0.05'}]},
    {title: 'Alternative', seconds: 6, caption: 'The alternative line is the **two-sided** H_A, which says the true mean difference is not zero.',
      card: [{label: 'line 4 ↔ hand work', tex: 'H_A:\\delta\\ne0', color: C.signal}]},
    {title: 'Interval and mean', seconds: 9, caption: 'The mean difference equals **d̄ = 5.375**. The interval differs slightly because R uses an exact t value, not 2.365.',
      card: [{label: 'interval by hand', tex: '\\bar d\\pm t_{0.05}(7)\\,s_{\\bar d}', value: `(${lo.toFixed(5)}, ${hi.toFixed(5)})`, color: C.noise, note: 'R prints 1.066971 to 9.683029'},
        {label: 'mean difference', value: '5.375 ↔ d̄ = 5.375', color: C.signal}]},
    {title: 'Not printed', seconds: 6, caption: 'R never prints the **SD of the differences** or the standard error of d̄, so those numbers come only from the hand work.',
      card: [{label: 'hand only', value: 's_d = 5.15302 · SE = 1.82187', color: C.muted}]},
  ] as Step[],
};

const Mono: React.FC<{x: number; y: number; text: string; color?: string; size?: number; opacity?: number; weight?: number}> = ({x, y, text, color = C.ink, size = 15, opacity = 1, weight = 400}) => (
  <text x={x} y={y} fill={color} fontSize={size} fontFamily={mono} opacity={opacity} fontWeight={weight} style={{whiteSpace: 'pre'}}>{text}</text>
);

const S20PairedR: React.FC = () => (
  <Frame title={meta.title} session={20} steps={meta.steps}>
    {(f, i, tl) => {
      const xs = 130, xt = 330, y = lin(55, 90, 250, 20);
      const xd = lin(-5, 15, 60, SW - 40);
      const showData = i <= 3;
      // which R output lines are matched in each step
      const hiLines: Record<number, number[]> = {6: [2], 7: [3], 8: [5, 8]};
      return (<g>
        {showData && <g>
          {/* seated -> standing lines */}
          <g opacity={i <= 1 ? 1 : 0.2}>
            <line x1={80} x2={80} y1={y(55)} y2={y(90)} stroke={C.muted} strokeWidth={1.5} />
            {[60, 70, 80, 90].map(v => <g key={v}><line x1={74} x2={80} y1={y(v)} y2={y(v)} stroke={C.muted} />
              <Label x={68} y={y(v) + 5} text={String(v)} color={C.muted} size={13} anchor="end" /></g>)}
            <Label x={xs} y={272} text="seated" color={GROUP[0]} anchor="middle" size={14} />
            <Label x={xt} y={272} text="standing" color={GROUP[1]} anchor="middle" size={14} />
            {seated.map((v, k) => { const p = prog(tl, f, 0, 0.5 + k * 0.25); return (<g key={k}>
              <line x1={xs} y1={y(v)} x2={lerp(xs, xt, p)} y2={lerp(y(v), y(standing[k]), p)} stroke={dd[k] > 0 ? C.signal : C.muted} strokeWidth={2.2} opacity={p > 0 ? 0.85 : 0} />
              <Glow cx={xs} cy={y(v)} r={5} color={GROUP[0]} opacity={p > 0 ? 1 : 0} />
              <Glow cx={xt} cy={y(standing[k])} r={5} color={GROUP[1]} opacity={p > 0.98 ? 1 : 0} />
            </g>); })}
            <Label x={400} y={y(88)} text="heart rate" color={C.muted} size={13} />
            <Label x={400} y={y(88) + 18} text="(beats/min)" color={C.muted} size={13} />
          </g>
          {/* differences on one axis */}
          {after(tl, f, 1) && <g opacity={prog(tl, f, 1)}>
            <AxisX x={xd} y={366} ticks={[-5, 0, 5, 10, 15]} label="d = standing − seated (beats/min)" />
            <line x1={xd(0)} x2={xd(0)} y1={296} y2={366} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            {dd.map((v, k) => { const p = prog(tl, f, 1, 0.4 + k * 0.12); return <Glow key={k} cx={xd(v)} cy={lerp(290, 340, p)} r={6} color={v > 0 ? C.signal : C.pink} opacity={p} />; })}
          </g>}
          {after(tl, f, 2) && <g opacity={prog(tl, f, 2)}>
            <line x1={xd(dbar)} x2={xd(dbar)} y1={312} y2={356} stroke={C.white} strokeWidth={3} />
            <Label x={xd(dbar) + 8} y={300} text={`mean d ${dbar}`} color={C.white} weight={700} />
            <line x1={xd(dbar - se)} x2={xd(dbar + se)} y1={318} y2={318} stroke={C.noise} strokeWidth={5} strokeLinecap="round" />
            <Label x={xd(dbar + se) + 8} y={323} text={`± SE ${se.toFixed(2)}`} color={C.noise} size={13} />
          </g>}
          {/* t on its own scale with the class-table cutoffs */}
          {i === 3 && (() => { const xx = lin(0, 4, 470, SW - 30); const p = prog(tl, f, 3, 1.8); return (<g opacity={prog(tl, f, 3, 0.6)}>
            <AxisX x={xx} y={230} ticks={[0, 1, 2, 3, 4]} label="t" />
            <line x1={xx(tc)} x2={xx(tc)} y1={120} y2={230} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xx(tc) - 6} y={114} text="2.365" color={C.red} anchor="end" size={13} weight={700} />
            <line x1={xx(2.998)} x2={xx(2.998)} y1={140} y2={230} stroke={C.noise} strokeWidth={1.5} strokeDasharray="3 4" />
            <Label x={xx(2.998) + 6} y={134} text="2.998" color={C.noise} size={13} />
            <Glow cx={xx(t * p)} cy={198} r={8} color={C.signal} />
            <Label x={xx(t * p)} y={178} text={`t = ${(t * p).toFixed(2)}`} color={C.signal} anchor="middle" weight={700} />
          </g>); })()}
        </g>}
        {/* R console */}
        {i >= 4 && <g>
          <rect x={10} y={8} width={SW - 20} height={92} rx={10} fill="#0a0f1a" stroke={C.line} />
          {code.map((c, k) => <Mono key={k} x={26} y={36 + k * 26} text={(k === 2 ? '> ' : '> ') + c} color={k === 2 ? C.signal : C.ink} opacity={prog(tl, f, 4, 0.4 + k * 0.5)} />)}
          {after(tl, f, 5) && <g>
            <rect x={10} y={112} width={SW - 20} height={308} rx={10} fill="#0a0f1a" stroke={C.line} />
            {out.map((c, k) => { const y0 = 140 + k * 31; const hit = (hiLines[i] || []).includes(k);
              const dim = i >= 6 && !hit && !(i === 9);
              return (<g key={k}>
                {hit && <rect x={18} y={y0 - 21} width={Math.min(SW - 36, c.length * 9.1 + 20)} height={29} rx={6} fill={C.signal} opacity={0.14 * prog(tl, f, i, 0.6)} stroke={C.signal} strokeWidth={1.5} />}
                <Mono x={28} y={y0} text={c} color={hit ? C.signal : C.ink} opacity={prog(tl, f, 5, 0.3 + k * 0.4) * (dim ? 0.45 : 1)} weight={hit ? 700 : 400} />
              </g>); })}
            {/* short tags beside matched lines where there is room */}
            {i === 6 && <Label x={400} y={202} text="= hand t, n − 1, bracket" color={C.green} size={14} opacity={prog(tl, f, 6, 1.4)} />}
            {i === 8 && <><Label x={300} y={295} text="≈ hand (1.06629, 9.68371)" color={C.noise} size={14} opacity={prog(tl, f, 8, 1.4)} />
              <Label x={300} y={388} text="= d̄ by hand" color={C.green} size={14} opacity={prog(tl, f, 8, 1.4)} /></>}
            {i === 9 && <g opacity={prog(tl, f, 9)}>
              <rect x={470} y={190} width={262} height={92} rx={10} fill={C.bg} stroke={C.red} strokeDasharray="5 5" />
              <Label x={490} y={222} text="not in the output" color={C.red} size={14} />
              <Label x={490} y={250} text={`s_d   ${sd.toFixed(5)}`} color={C.muted} size={15} />
              <Label x={490} y={272} text={`SE    ${se.toFixed(5)}`} color={C.muted} size={15} />
            </g>}
          </g>}
        </g>}
      </g>);
    }}
  </Frame>
);

export default S20PairedR;
