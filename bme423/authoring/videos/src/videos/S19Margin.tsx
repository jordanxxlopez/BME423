import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, AxisX, Glow, Arrow, Label} from '../kit/plot';

// Session 19 case "s19-survey-margin" (practice survey, two proportions) and, for means,
// the Session 17 urine example (d = 220, SE 89.867, t 2.101).
const m1 = 300, n1 = 500, m2 = 240, n2 = 480;
const p1 = m1 / n1, p2 = m2 / n2, d = p1 - p2;                 // 0.6000, 0.5000, 0.1000
const pp = (m1 + m2) / (n1 + n2);                                // 0.55102
const se = Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2));         // 0.031784
const z = 1.96;                                                  // class t table, infinity row, column 0.05
const M = z * se, lo = d - M, hi = d + M;                        // 0.062296, 0.037704, 0.162296
// Means (Session 17 urine): margin = 2.101 x 89.867
const dU = 220, seU = 89.867, tU = 2.101, MU = tU * seU;          // 188.81
// Illustration: four times as many respondents, same proportions.
const se4 = Math.sqrt(pp * (1 - pp) * (1 / (4 * n1) + 1 / (4 * n2))), M4 = z * se4; // 0.015892, 0.031148

export const meta = {
  id: 's19-s19margin', session: 19, method: 's19margin',
  cases: {'s19-survey-margin': [2, 2, 3, 3, 4, 5, 7]},
  title: 'Margin of error · cutoff × standard error',
  steps: [
    {title: 'Survey result', seconds: 6, card: [{label: 'practice survey · weekly use', note: `first-year  ${m1} yes of ${n1}\nsenior      ${m2} yes of ${n2}`}],
      caption: 'A practice survey asks first-years and seniors about weekly gym use. The report gives the gap **plus or minus** a margin.'},
    {title: 'Observed difference', seconds: 6, caption: 'First-years say yes 60% of the time and seniors 50%, so the **observed difference** is 0.10, or 10 points.',
      card: [{label: 'difference', tex: 'd=\\hat p_1-\\hat p_2', value: `0.6000 − 0.5000 = ${d.toFixed(4)}`, color: C.signal}]},
    {title: 'Standard error', seconds: 7, caption: 'Pooling both groups gives one common proportion. The **standard error** is how much the gap wobbles between samples.',
      card: [{label: 'pooled proportion', value: `540 / 980 = ${pp.toFixed(5)}`, color: C.noise},
        {label: 'standard error', tex: 's_{\\hat p_1-\\hat p_2}=\\sqrt{\\hat p(1-\\hat p)\\left(\\tfrac1{n_1}+\\tfrac1{n_2}\\right)}', value: `= ${se.toFixed(5)}`, color: C.noise}]},
    {title: 'Normal cutoff', seconds: 7, caption: 'Proportions use the Normal cutoff. In the **class t table**, the infinity row and column 0.05 give **1.960**.',
      card: [{label: 'class t table (two-tailed)', value: 'row ∞ · column 0.05 → 1.960', color: C.signal}]},
    {title: 'Margin of error', seconds: 7, caption: 'The **margin of error** is the cutoff times the standard error. It is the number a report prints after plus or minus.',
      card: [{label: 'margin of error', tex: 'M=z_{0.05}\\,s_{\\hat p_1-\\hat p_2}', value: `1.960 × ${se.toFixed(5)} = ${M.toFixed(4)}`, color: C.signal}]},
    {title: 'Survey style', seconds: 7, caption: 'The report reads **10 points plus or minus 6.2**. The 95% interval runs from about 3.8 to 16.2 points.',
      card: [{label: '95% interval', tex: 'd\\pm M', value: `${d.toFixed(4)} ± ${M.toFixed(4)}`, note: `(${lo.toFixed(4)}, ${hi.toFixed(4)}) · 10.0 ± 6.2 points`, color: C.signal}]},
    {title: 'Is zero inside?', seconds: 7, caption: 'The gap is **larger than its margin**, so zero falls outside the interval and two-sided P < 0.05.',
      card: [{label: 'decision', value: '0.1000 > 0.0623 → reject H0', note: 'first-years use the facility weekly more often', color: C.green}]},
    {title: 'Two means use t', seconds: 8, caption: 'For two means the cutoff comes from the t table instead. The diuretic example gives a margin of **188.81 mL/day**.',
      card: [{label: 'margin · two means', tex: 'M=t_{0.05}(\\nu)\\,s_{\\bar x_1-\\bar x_2}', value: `2.101 × 89.867 = ${MU.toFixed(2)}`, note: 'urine example, ν = 18 → d = 220 ± 188.81 mL/day', color: C.signal}]},
    {title: 'Bigger samples', seconds: 8, caption: 'As an illustration, four times as many students **halves the standard error**, so the margin falls to 3.1 points.',
      card: [{label: 'illustration · 4× respondents', value: `SE ${se4.toFixed(5)} → M = ${M4.toFixed(4)}`, note: 'same proportions, n 2000 and 1920', color: C.noise}]},
  ] as Step[],
};

const TableEx: React.FC<{x0: number; y0: number; title: string; cols: string[]; rows: [string, string[]][]; hit: [string, string]; p: number; pb: number; cw?: number; rh?: number}> = ({x0, y0, title, cols, rows, hit, p, pb, cw = 120, rh = 54}) => (
  <g opacity={p}>
    <Label x={x0} y={y0 - 28} text={title} color={C.muted} size={14} />
    {cols.map(c => <Label key={c} x={x0 + 110 + cols.indexOf(c) * cw} y={y0} text={c} color={c === hit[1] ? C.signal : C.muted} anchor="middle" weight={700} />)}
    {rows.map(([row, vs], ri) => (<g key={row}>
      <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${row}`} color={row === hit[0] ? C.signal : C.muted} weight={700} />
      {vs.map((v, ci) => { const h = row === hit[0] && cols[ci] === hit[1]; return (<g key={ci}>
        {h && <rect x={x0 + 110 + ci * cw - 50} y={y0 + 24 + ri * rh} width={100} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={pb} />}
        <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={h ? C.signal : C.ink} anchor="middle" size={h ? 18 : 15} weight={h ? 700 : 400} /></g>); })}
    </g>))}
  </g>
);

const S19Margin: React.FC = () => (
  <Frame title={meta.title} session={19} steps={meta.steps}>
    {(f, i, tl) => {
      const xp = lin(0, 1, 150, 720);                     // proportion scale
      const xd = lin(-0.05, 0.25, 70, 720);                // difference scale
      const showTop = i !== 3 && i !== 7;
      const showDiff = after(tl, f, 1) && i !== 3 && i !== 7;
      const bars = [{y: 40, p: p1, name: 'first-year', c: GROUP[0], txt: `${m1}/${n1} = 0.60`}, {y: 96, p: p2, name: 'senior', c: GROUP[1], txt: `${m2}/${n2} = 0.50`}];
      return (<g>
        {showTop && <g>
          {bars.map((b, k) => { const g = prog(tl, f, 0, 1 + k * 0.3); return (<g key={k}>
            <Label x={20} y={b.y + 19} text={b.name} color={b.c} />
            <rect x={xp(0)} y={b.y} width={(xp(b.p) - xp(0)) * g} height={26} rx={5} fill={b.c} opacity={0.85} />
            {g > 0.95 && <Label x={xp(b.p) + 10} y={b.y + 19} text={b.txt} color={b.c} size={14} />}
          </g>); })}
          <AxisX x={xp} y={146} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} fmt={v => v.toFixed(1)} label="proportion using the facility weekly" />
        </g>}
        {showDiff && i !== 8 && <g opacity={prog(tl, f, 1)}>
          <AxisX x={xd} y={372} ticks={[-0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25]} fmt={v => v.toFixed(2)} label="difference in proportion (first-year − senior)" />
          {after(tl, f, 2) && <g opacity={prog(tl, f, 2)}>
            <line x1={xd(d - se)} x2={xd(d + se)} y1={354} y2={354} stroke={C.noise} strokeWidth={4} />
            {i < 4 && <Label x={xd(d + se) + 8} y={359} text={`± SE ${se.toFixed(4)}`} color={C.noise} size={13} />}</g>}
          {after(tl, f, 4) && (() => { const q = prog(tl, f, 4, 1.6); return (<g>
            <line x1={xd(d - M * q)} x2={xd(d + M * q)} y1={330} y2={330} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
            {q > 0.98 && i === 4 && <><Arrow x1={xd(d)} y1={312} x2={xd(hi)} y2={312} color={C.signal} w={2} /><Label x={(xd(d) + xd(hi)) / 2} y={304} text={`M = ${M.toFixed(4)}`} color={C.signal} anchor="middle" size={13} /></>}
            {after(tl, f, 5) && <g opacity={prog(tl, f, 5)}>
              <Label x={xd(lo)} y={318} text={lo.toFixed(4)} color={C.signal} anchor="middle" size={13} />
              <Label x={xd(hi)} y={318} text={hi.toFixed(4)} color={C.signal} anchor="middle" size={13} /></g>}
          </g>); })()}
          <Glow cx={xd(d)} cy={330} r={8} color={C.signal} />
          {i < 4 && <Label x={xd(d)} y={306} text={`d = ${d.toFixed(2)}`} color={C.signal} anchor="middle" weight={700} />}
          {i === 5 && <Label x={xd(d)} y={290} text="10 ± 6.2 points" color={C.signal} anchor="middle" weight={700} size={17} opacity={prog(tl, f, 5)} />}
          {after(tl, f, 6) && <g opacity={prog(tl, f, 6)}>
            <line x1={xd(0)} x2={xd(0)} y1={250} y2={372} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xd(0)} y={243} text="0 = no difference" color={C.red} anchor="middle" size={13} />
            <Arrow x1={xd(0) + 4} y1={344} x2={xd(lo) - 4} y2={344} color={C.green} w={2} /></g>}
        </g>}
        {/* class t table, infinity row */}
        {i === 3 && <TableEx x0={110} y0={110} title="class t table · two-tailed α (page 2)" cols={['0.10', '0.05', '0.02', '0.01']}
          rows={[['200', ['1.653', '1.972', '2.345', '2.601']], ['∞', ['1.6449', '1.9600', '2.3263', '2.5758']]]} hit={['∞', '0.05']} p={prog(tl, f, 3)} pb={prog(tl, f, 3, 2.4)} />}
        {/* two means: Session 17 urine interval */}
        {i === 7 && (() => { const xu = lin(-200, 600, 70, 720); const q = prog(tl, f, 7, 1.8); return (<g opacity={prog(tl, f, 7, 0.6)}>
          <Label x={70} y={60} text="two means · diuretic − placebo urine (mL/day)" color={C.muted} size={14} />
          <line x1={xu(dU - MU * q)} x2={xu(dU + MU * q)} y1={230} y2={230} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
          <line x1={xu(dU - seU)} x2={xu(dU + seU)} y1={256} y2={256} stroke={C.noise} strokeWidth={4} />
          <Label x={xu(dU + seU) + 8} y={261} text="± SE 89.867" color={C.noise} size={13} />
          <Glow cx={xu(dU)} cy={230} r={8} color={C.signal} />
          <Label x={xu(dU)} y={206} text="d = 220" color={C.signal} anchor="middle" weight={700} />
          {q > 0.98 && <><Label x={xu(dU - MU)} y={206} text={(dU - MU).toFixed(2)} color={C.signal} anchor="middle" size={13} /><Label x={xu(dU + MU)} y={206} text={(dU + MU).toFixed(2)} color={C.signal} anchor="middle" size={13} />
            <Label x={(xu(dU) + xu(dU + MU)) / 2} y={160} text="M = 2.101 × 89.867 = 188.81" color={C.signal} anchor="middle" size={14} /></>}
          <AxisX x={xu} y={330} ticks={[-200, 0, 200, 400, 600]} label="difference in urine production (mL/day)" />
        </g>); })()}
        {/* bigger samples (illustration) */}
        {i === 8 && (() => { const q = prog(tl, f, 8, 1.8); const m = M + (M4 - M) * q; return (<g>
          <AxisX x={xd} y={372} ticks={[-0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25]} fmt={v => v.toFixed(2)} label="difference in proportion (first-year − senior)" />
          <line x1={xd(lo)} x2={xd(hi)} y1={250} y2={250} stroke={C.signal} strokeWidth={5} strokeLinecap="round" opacity={0.45} />
          <Label x={xd(hi) + 10} y={255} text="as surveyed ± 0.0623" color={C.muted} size={13} />
          <line x1={xd(d - m)} x2={xd(d + m)} y1={320} y2={320} stroke={C.noise} strokeWidth={5} strokeLinecap="round" />
          <Label x={xd(hi) + 10} y={325} text={`4× students ± ${m.toFixed(4)}`} color={C.noise} size={13} />
          <Glow cx={xd(d)} cy={250} r={7} color={C.signal} opacity={0.5} /><Glow cx={xd(d)} cy={320} r={8} color={C.signal} />
          <line x1={xd(0)} x2={xd(0)} y1={220} y2={372} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S19Margin;
