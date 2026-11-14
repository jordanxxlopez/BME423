import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Arrow, Label} from '../kit/plot';

// Session 17 slides 11-12 (thrombosis, placebo vs aspirin). Case "ci-aspirin" (rounded as displayed).
const m1 = 18, n1 = 25, m2 = 6, n2 = 19;
const p1 = m1 / n1, p2raw = m2 / n2, p2 = 0.32;            // 0.72, 0.3157895 → 0.32
const pool = (m1 + m2) / (n1 + n2);                        // 0.5454545
const v = pool * (1 - pool);                               // 0.2479339
const seRaw = Math.sqrt(v / n1 + v / n2), se = 0.15;       // 0.151547 → 0.15
const d = 0.4, zc = 1.96, M = zc * se, lo = d - M, hi = d + M; // 0.294, 0.106, 0.694
const dRaw = p1 - p2raw, Mraw = zc * seRaw;                // unrounded: 0.10718 to 0.70124

// Class t table excerpt (two-tailed), copied from the printed table.
type TRow = {name: string; vals: string[]};
const TTable: React.FC<{cols: string[]; rows: TRow[]; hit: [string, string]; p: number; box: number}> = ({cols, rows, hit, p, box}) => {
  const x0 = 150, y0 = 60, cw = 120, rh = 54;
  return (<g opacity={p}>
    <Label x={x0} y={y0 - 28} text="class t table · two-tailed α" color={C.muted} size={14} />
    {cols.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === hit[1] ? C.signal : C.muted} anchor="middle" weight={700} />)}
    {rows.map((r, ri) => (<g key={r.name}>
      <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${r.name}`} color={r.name === hit[0] ? C.signal : C.muted} weight={700} />
      {r.vals.map((val, ci) => { const on = r.name === hit[0] && cols[ci] === hit[1]; return (<g key={ci}>
        {on && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={box} />}
        <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={val} color={on ? C.signal : C.ink} anchor="middle" size={on ? 18 : 15} weight={on ? 700 : 400} /></g>); })}
    </g>))}
  </g>);
};

const CASE = [2, 3, 4, 5, 5, 7, 7, 8];
export const meta = {
  id: 's17-twoProportions', session: 17, method: 'twoProportions',
  // Case steps: define, proportions, pooled, variance, SE, difference and margin, endpoints, decision.
  // All two-proportion cases use the same eight steps, so they map the same way.
  cases: {'ci-aspirin': CASE, 'ci-aspirin-precision': CASE, 'ci-event': CASE, 'ci-adverse': CASE, 'ci-improvement': CASE, 'ci-completion': CASE},
  title: 'Confidence interval · difference of two proportions',
  steps: [
    {title: 'Two groups', seconds: 7, card: [{label: 'data (thrombosis)', note: 'placebo  18 of 25 patients\naspirin   6 of 19 patients'}],
      caption: 'Thrombosis hit 18 of 25 patients on placebo and 6 of 19 on aspirin. The goal is the **difference in event probability**.'},
    {title: 'Null hypothesis', seconds: 7, card: [{label: 'null hypothesis', tex: 'H_0:\\ p_1-p_2=0', note: 'equal event probabilities\ndifference = placebo − aspirin'}],
      caption: 'The null says both groups share **one event probability**, so placebo minus aspirin would be zero.'},
    {title: 'Group proportions', seconds: 7, card: [{label: 'group proportions', tex: '\\hat p_i=m_i/n_i', value: '18/25 = 0.72 · 6/19 ≈ 0.32', color: C.signal, note: 'd = 0.72 − 0.32 = 0.40'}],
      caption: 'Each count is divided by its own group size. Placebo gives **0.72** and aspirin gives **0.32**, so d is 0.40.'},
    {title: 'Pooled proportion', seconds: 7, card: [{label: 'pooled proportion', tex: '\\hat p=\\frac{m_1+m_2}{n_1+n_2}', value: `24 / 44 = ${pool.toFixed(4)}`, color: C.noise}],
      caption: 'The standard error **pools** both groups, 24 events in 44 patients, because the null says they share one probability.'},
    {title: 'Standard error', seconds: 8, card: [
      {label: 'pooled variance', tex: 's^2=\\hat p(1-\\hat p)', value: `= ${v.toFixed(4)}`, color: C.noise},
      {label: 'standard error', tex: 's_d=\\sqrt{\\frac{s^2}{n_1}+\\frac{s^2}{n_2}}', value: `= ${seRaw.toFixed(4)} ≈ 0.15`, color: C.noise}],
      caption: 'The pooled variance goes over each group size. The square root of the sum is the **standard error**, rounded to 0.15.'},
    {title: 'Class t table', seconds: 7, card: [{label: 'class t table', tex: 'z_{0.05}=t_{0.05}(\\infty)', value: 'row ∞ · column 0.05 → 1.96', color: C.signal}],
      caption: 'Proportions use the Normal cutoff. In the **class t table**, the infinity row and column 0.05 give **1.96**.'},
    {title: 'Margin and interval', seconds: 8, card: [{label: 'margin and interval', tex: 'd\\pm z_{0.05}\\,s_d', value: `0.40 ± ${M.toFixed(3)} → (${lo.toFixed(3)}, ${hi.toFixed(3)})`, color: C.signal,
      note: `unrounded digits give (${(dRaw - Mraw).toFixed(3)}, ${(dRaw + Mraw).toFixed(3)})`}],
      caption: 'The margin is 1.96 times 0.15, which is 0.294. Add and subtract it from 0.40 to get **0.106 to 0.694**.'},
    {title: 'Is zero inside?', seconds: 8, card: [{label: 'decision', value: '0 is outside → reject H0', color: C.green, note: '10.6 to 69.4 percentage points, placebo\nhigher. This is not a relative risk.'}],
      caption: 'Zero is **outside** the interval, so the event probabilities differ. Placebo is 11 to 69 percentage points higher.'},
  ] as Step[],
};

const groups = [
  {name: 'placebo', m: m1, n: n1, p: p1, y0: 40, c: GROUP[0], shown: '0.72'},
  {name: 'aspirin', m: m2, n: n2, p: p2raw, y0: 160, c: GROUP[1], shown: '0.32'},
];

const S17TwoProportions: React.FC = () => (
  <Frame title={meta.title} session={17} steps={meta.steps}>
    {(f, i, tl) => {
      const xb = lin(0, 1, 300, SW - 40);                  // proportion scale for the bars
      const xd = lin(-0.2, 1.0, 40, SW - 30);              // difference scale
      const topA = i === 5 ? 0 : 1;
      return (<g>
        <g opacity={topA}>
          {groups.map((g, gi) => (<g key={gi}>
            <Label x={40} y={g.y0 - 16} text={`${g.name}  ${g.m}/${g.n}`} color={g.c} />
            {Array.from({length: g.n}, (_, k) => { const cx = 52 + (k % 5) * 24, cy = g.y0 + Math.floor(k / 5) * 22; const ev = k < g.m;
              const p = prog(tl, f, 0, 0.5 + k * 0.04 + gi * 0.4);
              return ev ? <Glow key={k} cx={cx} cy={lerp(cy - 30, cy, p)} r={6} color={g.c} opacity={p} />
                : <circle key={k} cx={cx} cy={lerp(cy - 30, cy, p)} r={5.5} fill="none" stroke={C.muted} strokeWidth={1.5} opacity={p} />; })}
            {/* proportion bar */}
            {after(tl, f, 2) && (() => { const p = prog(tl, f, 2, 1.4); const yb = g.y0 + 30; return (<g>
              <rect x={xb(0)} y={yb - 14} width={xb(1) - xb(0)} height={28} rx={6} fill="none" stroke={C.line} />
              <rect x={xb(0)} y={yb - 14} width={(xb(g.p) - xb(0)) * p} height={28} rx={6} fill={g.c} opacity={0.85} />
              {p > 0.95 && <Label x={xb(g.p) + 8} y={yb + 5} text={g.shown} color={g.c} weight={700} />}
            </g>); })()}
          </g>))}
          {after(tl, f, 3) && <g opacity={prog(tl, f, 3)}>
            <line x1={xb(pool)} x2={xb(pool)} y1={42} y2={222} stroke={C.noise} strokeWidth={2.5} strokeDasharray="6 5" />
            <Label x={xb(pool) + 8} y={36} text={`pooled ${pool.toFixed(3)}`} color={C.noise} size={14} weight={700} />
          </g>}
          {after(tl, f, 2) && <AxisX x={xb} y={238} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} fmt={t => t.toFixed(1)} opacity={prog(tl, f, 2)} />}
        </g>
        {/* difference scale */}
        {after(tl, f, 1) && <g opacity={prog(tl, f, 1)}>
          <AxisX x={xd} y={392} ticks={[-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0]} fmt={t => t.toFixed(1)} />
          <Label x={SW - 30} y={300} text="placebo − aspirin" color={C.muted} size={13} anchor="end" />
          <line x1={xd(0)} x2={xd(0)} y1={318} y2={392} stroke={i >= 7 ? C.red : C.muted} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xd(0)} y={312} text="0 = equal" color={i >= 7 ? C.red : C.muted} anchor="middle" size={13} />
          {after(tl, f, 2) && <g opacity={prog(tl, f, 2)}>
            <Glow cx={xd(d)} cy={360} r={8} color={C.signal} />
            <Label x={xd(d)} y={336} text="d = 0.40" color={C.signal} anchor="middle" weight={700} /></g>}
          {after(tl, f, 4) && <g opacity={prog(tl, f, 4)}>
            <line x1={xd(d - se)} x2={xd(d + se)} y1={378} y2={378} stroke={C.noise} strokeWidth={4} />
            <Label x={xd(d + se) + 8} y={383} text="± SE 0.15" color={C.noise} size={13} /></g>}
          {after(tl, f, 6) && (() => { const p = prog(tl, f, 6, 1.6); return (<g>
            <line x1={xd(d - M * p)} x2={xd(d + M * p)} y1={360} y2={360} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
            {p > 0.98 && <><Label x={xd(lo)} y={350} text={lo.toFixed(3)} color={C.signal} anchor="middle" size={13} /><Label x={xd(hi)} y={350} text={hi.toFixed(3)} color={C.signal} anchor="middle" size={13} /></>}
          </g>); })()}
          {after(tl, f, 7) && <Arrow x1={xd(0) + 4} y1={372} x2={xd(lo) - 4} y2={372} color={C.green} w={2} opacity={prog(tl, f, 7)} />}
        </g>}
        {i === 5 && <TTable p={prog(tl, f, 5)} box={prog(tl, f, 5, 2.4)} hit={['∞', '0.05']} cols={['0.10', '0.05', '0.02', '0.01']}
          rows={[{name: '180', vals: ['1.653', '1.973', '2.347', '2.603']}, {name: '200', vals: ['1.653', '1.972', '2.345', '2.601']}, {name: '∞', vals: ['1.6449', '1.9600', '2.3263', '2.5758']}]} />}
      </g>);
    }}
  </Frame>
);

export default S17TwoProportions;
