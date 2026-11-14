import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, normals, exact, AxisX, Glow, Arrow, Label} from '../kit/plot';

// Session 17 slide 6 (urine production, diuretic vs placebo, n = 10 each). Case "ci-urine".
const n = 10, m1 = 1400, s1 = 245, m2 = 1180, s2 = 144;
const d = m1 - m2;                                             // 220
const sp2 = ((n - 1) * s1 ** 2 + (n - 1) * s2 ** 2) / (2 * n - 2); // 40380.5
const se = Math.sqrt(sp2 * (1 / n + 1 / n));                     // 89.867
const tc = 2.101;                                                // class t table, row 18, column 0.05
const M = tc * se, lo = d - M, hi = d + M;                       // 188.81, 31.19, 408.81
const A = exact(normals(171, n), m1, s1), B = exact(normals(172, n), m2, s2);

export const meta = {
  id: 's17-twoMeans', session: 17, method: 'twoMeans',
  // For each worked case, the video step (1-based) that matches each case step, in order.
  cases: {'ci-urine': [1, 2, 3, 3, 4, 5, 6, 6, 7]},
  title: 'Confidence interval · difference of two means',
  steps: [
    {title: 'Two groups', seconds: 6, card: [{label: 'data (mL/day)', note: 'diuretic  n 10 · mean 1400 · SD 245\nplacebo   n 10 · mean 1180 · SD 144'}], caption: 'Ten people took a diuretic and ten took a placebo. The goal is the **population difference** in mean urine production.'},
    {title: 'Observed difference', seconds: 6, caption: 'The sample difference sits in the **middle** of the interval.',
      card: [{label: 'difference', tex: 'd=\\bar x_1-\\bar x_2', value: `1400 − 1180 = ${d} mL/day`, color: C.signal}]},
    {title: 'Pooled variance', seconds: 7, caption: 'Each group has its own spread. **Pooling** combines them into one variance, weighted by each group\'s degrees of freedom.',
      card: [{label: 'pooled variance', tex: 's^2=\\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}', value: `= ${sp2.toFixed(1)}`, color: C.noise}]},
    {title: 'Standard error', seconds: 6, caption: 'The standard error is how much the **difference** would wobble from sample to sample.',
      card: [{label: 'standard error', tex: 's_{\\bar x_1-\\bar x_2}=\\sqrt{s^2\\left(\\tfrac1{n_1}+\\tfrac1{n_2}\\right)}', value: `= ${se.toFixed(3)} mL/day`, color: C.noise}]},
    {title: 'Class t table', seconds: 7, caption: 'Use the **class t table** (two-tailed). Row 18 is the degrees of freedom and column 0.05 gives **2.101**.',
      card: [{label: 'class t table', tex: '\\nu=n_1+n_2-2=18', value: 'row 18 · column 0.05 → 2.101', color: C.signal}]},
    {title: 'Margin and interval', seconds: 7, caption: 'The margin is the cutoff times the standard error. Add and subtract it from the difference.',
      card: [{label: 'margin and interval', tex: 'd\\pm t_c\\,s_{\\bar x_1-\\bar x_2}', value: `${d} ± ${M.toFixed(2)} → (${lo.toFixed(2)}, ${hi.toFixed(2)})`, color: C.signal}]},
    {title: 'Is zero inside?', seconds: 6, caption: 'Zero means no difference. The interval **leaves zero out**, so the means differ with P < 0.05.',
      card: [{label: 'decision', value: '0 is outside → reject H0, P < 0.05', color: C.green}]},
    {title: 'What 95% means', seconds: 9, caption: 'Repeat the study many times. About **95 out of 100** intervals built this way catch the true difference. A few miss.'},
  ] as Step[],
};

// Repeated-sampling intervals for the last step (true difference fixed at 220 for the illustration).
const sims = Array.from({length: 20}, (_, k) => {
  const a = normals(3100 + k, n), b = normals(4100 + k, n), sd = Math.sqrt(sp2);
  const mean = (v: number[]) => v.reduce((p, q) => p + q, 0) / v.length;
  const vr = (v: number[]) => { const m = mean(v); return v.reduce((p, q) => p + (q - m) ** 2, 0) / (v.length - 1); };
  const dd = 220 + sd * (mean(a) - mean(b)); const e = tc * sd * Math.sqrt((vr(a) + vr(b)) / 2) * Math.sqrt(2 / n);
  return {lo: dd - e, hi: dd + e};
});

const S17TwoMeans: React.FC = () => (
  <Frame title={meta.title} session={17} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(700, 2000, 40, SW - 30);                 // mL/day for individual people
      const xd = lin(-200, 600, 40, SW - 30);                // mL/day for the difference
      const showTop = i <= 3 || i === 5 || i === 6; const topA = i === 4 || i === 7 ? 0 : 1;
      const rows = [{y: 70, v: A, m: m1, s: s1, name: 'diuretic', c: GROUP[0]}, {y: 165, v: B, m: m2, s: s2, name: 'placebo', c: GROUP[1]}];
      return (<g>
        {/* individual people */}
        <g opacity={topA}>
          {rows.map((g, gi) => (<g key={gi}>
            <Label x={40} y={g.y - 30} text={g.name} color={g.c} />
            {g.v.map((v, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.08); return <Glow key={k} cx={x(v)} cy={lerp(g.y - 60, g.y + ((k % 3) - 1) * 9, p)} r={6} color={g.c} opacity={p} />; })}
            {after(tl, f, 1) && <line x1={x(g.m)} x2={x(g.m)} y1={g.y - 24} y2={g.y + 24} stroke={C.white} strokeWidth={3} opacity={prog(tl, f, 1, 0.8)} />}
            {after(tl, f, 2) && <g opacity={prog(tl, f, 2)}>
              <line x1={x(g.m - g.s)} x2={x(g.m + g.s)} y1={g.y + 34} y2={g.y + 34} stroke={C.noise} strokeWidth={3} />
              <Label x={x(g.m + g.s) + 8} y={g.y + 39} text={`SD ${g.s}`} color={C.noise} size={13} /></g>}
          </g>))}
          {showTop && <AxisX x={x} y={225} ticks={[800, 1000, 1200, 1400, 1600, 1800, 2000]} label="urine production (mL/day)" />}
        </g>
        {/* difference scale */}
        {after(tl, f, 1) && i !== 4 && i !== 7 && <g opacity={prog(tl, f, 1)}>
          <AxisX x={xd} y={392} ticks={[-200, 0, 200, 400, 600]} />
          <Glow cx={xd(d)} cy={360} r={8} color={C.signal} />
          <Label x={xd(d)} y={336} text={`d = ${d}`} color={C.signal} anchor="middle" weight={700} />
          {after(tl, f, 3) && <g opacity={prog(tl, f, 3)}>
            <line x1={xd(d - se)} x2={xd(d + se)} y1={378} y2={378} stroke={C.noise} strokeWidth={4} />
            <Label x={xd(d + se) + 8} y={383} text={`± SE ${se.toFixed(1)}`} color={C.noise} size={13} /></g>}
          {after(tl, f, 5) && (() => { const p = prog(tl, f, 5, 1.6); return (<g>
            <line x1={xd(d - M * p)} x2={xd(d + M * p)} y1={360} y2={360} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
            {p > 0.98 && <><Label x={xd(lo)} y={350} text={lo.toFixed(1)} color={C.signal} anchor="middle" size={13} /><Label x={xd(hi)} y={350} text={hi.toFixed(1)} color={C.signal} anchor="middle" size={13} /></>}
          </g>); })()}
          {after(tl, f, 6) && <g opacity={prog(tl, f, 6)}>
            <line x1={xd(0)} x2={xd(0)} y1={318} y2={392} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xd(0)} y={312} text="0 = no difference" color={C.red} anchor="middle" size={13} />
            <Arrow x1={xd(0) + 4} y1={372} x2={xd(lo) - 4} y2={372} color={C.green} w={2} /></g>}
        </g>}
        {/* class t table excerpt */}
        {i === 4 && (() => { const p = prog(tl, f, 4); const cols = ['0.10', '0.05', '0.02', '0.01'], vals: Record<string, string[]> = {'17': ['1.740', '2.110', '2.567', '2.898'], '18': ['1.734', '2.101', '2.552', '2.878'], '19': ['1.729', '2.093', '2.539', '2.861']};
          const x0 = 150, y0 = 90, cw = 120, rh = 54; return (<g opacity={p}>
            <Label x={x0} y={y0 - 28} text="class t table · two-tailed α" color={C.muted} size={14} />
            {cols.map((c, ci) => <Label key={c} x={x0 + 90 + ci * cw} y={y0} text={c} color={c === '0.05' ? C.signal : C.muted} anchor="middle" weight={700} />)}
            {Object.entries(vals).map(([row, vs], ri) => (<g key={row}>
              <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${row}`} color={row === '18' ? C.signal : C.muted} weight={700} />
              {vs.map((v, ci) => { const hit = row === '18' && cols[ci] === '0.05'; return (<g key={ci}>
                {hit && <rect x={x0 + 90 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 4, 2.4)} />}
                <Label x={x0 + 90 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={hit ? 700 : 400} /></g>); })}
            </g>))}
          </g>); })()}
        {/* repeated sampling */}
        {i === 7 && (() => { const xs = lin(-300, 750, 60, SW - 40); const truth = xs(220); return (<g>
          <line x1={truth} x2={truth} y1={10} y2={400} stroke={C.signal} strokeWidth={2} />
          <Label x={truth + 6} y={22} text="true difference" color={C.signal} size={13} />
          {sims.map((s, k) => { const p = prog(tl, f, 7, 0.3 + k * 0.3); const hit = s.lo < 220 && s.hi > 220; const yy = 40 + k * 18;
            return <line key={k} x1={xs(s.lo)} x2={xs(lerp(s.lo, s.hi, p))} y1={yy} y2={yy} stroke={hit ? C.noise : C.pink} strokeWidth={5} strokeLinecap="round" opacity={p > 0 ? 1 : 0} />; })}
          <AxisX x={xs} y={412} ticks={[-200, 0, 200, 400, 600]} opacity={0.8} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S17TwoMeans;
