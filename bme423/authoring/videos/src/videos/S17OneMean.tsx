import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, normals, exact, AxisX, Glow, Label} from '../kit/plot';

// Session 17 slides 9-10 (heart rate of ten BME423 students). Case "ci-heart".
const n = 10, xbar = 67, sd = 9;
const se = sd / Math.sqrt(n);                 // 2.846050
const tc = 2.262;                             // class t table, row 9, column 0.05
const M = tc * se, lo = xbar - M, hi = xbar + M; // 6.437765, 60.56224, 73.43776
const people = exact(normals(910, n), xbar, sd);

// Class t table excerpt (two-tailed), copied from the printed table.
type TRow = {name: string; vals: string[]};
const TTable: React.FC<{cols: string[]; rows: TRow[]; hit: [string, string]; p: number; box: number}> = ({cols, rows, hit, p, box}) => {
  const x0 = 150, y0 = 90, cw = 120, rh = 54;
  return (<g opacity={p}>
    <Label x={x0} y={y0 - 28} text="class t table · two-tailed α" color={C.muted} size={14} />
    {cols.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === hit[1] ? C.signal : C.muted} anchor="middle" weight={700} />)}
    {rows.map((r, ri) => (<g key={r.name}>
      <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${r.name}`} color={r.name === hit[0] ? C.signal : C.muted} weight={700} />
      {r.vals.map((v, ci) => { const on = r.name === hit[0] && cols[ci] === hit[1]; return (<g key={ci}>
        {on && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={box} />}
        <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={on ? C.signal : C.ink} anchor="middle" size={on ? 18 : 15} weight={on ? 700 : 400} /></g>); })}
    </g>))}
  </g>);
};

export const meta = {
  id: 's17-oneMean', session: 17, method: 'oneMean',
  // ci-heart steps: identify, SE, df and cutoff, margin, lower, upper, state interval.
  // The other one-mean cases use the same seven steps, so they map the same way.
  cases: {
    'ci-heart': [2, 3, 4, 5, 6, 6, 7], 'ci-heart-practice': [2, 3, 4, 5, 6, 6, 7], 'ci-reaction': [2, 3, 4, 5, 6, 6, 7],
    'ci-pressure': [2, 3, 4, 5, 6, 6, 7], 'ci-respiration': [2, 3, 4, 5, 6, 6, 7],
  },
  title: 'Confidence interval · one population mean',
  steps: [
    {title: 'Ten students', seconds: 6, card: [{label: 'data (beats/min)', note: 'BME423 students\nn 10 · mean 67 · SD 9\ndots drawn to match the mean and SD'}],
      caption: 'Ten BME423 students had their heart rate measured. The goal is the **population mean**, not the rate of one student.'},
    {title: 'Mean and SD', seconds: 7, card: [{label: 'estimate', tex: '\\bar x\\ \\text{estimates}\\ \\mu', value: 'mean 67 · s 9 · n 10', color: C.signal}],
      caption: 'The sample mean, **67 beats/min**, estimates the population mean. The SD of 9 describes how single students vary.'},
    {title: 'Standard error', seconds: 7, card: [{label: 'standard error', tex: 's_{\\bar x}=\\frac{s}{\\sqrt n}', value: `9 / √10 = ${se.toFixed(3)} beats/min`, color: C.noise}],
      caption: 'The **standard error** is the SD divided by the square root of n. It measures how much the mean moves between samples.'},
    {title: 'Class t table', seconds: 7, card: [{label: 'class t table', tex: '\\nu=n-1=9', value: 'row 9 · column 0.05 → 2.262', color: C.signal}],
      caption: 'Use the **class t table** (two-tailed). Row 9 is the degrees of freedom and column 0.05 gives **2.262**.'},
    {title: 'Margin', seconds: 7, card: [{label: 'margin', tex: 'M=t_c\\,s_{\\bar x}', value: `2.262 × ${se.toFixed(3)} = ${M.toFixed(3)}`, color: C.signal}],
      caption: 'The **margin** is the cutoff times the standard error. It is 6.44 beats/min, in the same units as the mean.'},
    {title: 'Both endpoints', seconds: 7, card: [{label: 'interval', tex: '\\bar x\\pm M', value: `67 ± ${M.toFixed(3)} → (${lo.toFixed(2)}, ${hi.toFixed(2)})`, color: C.signal}],
      caption: 'Subtract the margin for the **lower end** and add it for the **upper end**, so the interval is centered on 67.'},
    {title: 'Mean, not people', seconds: 8, card: [{label: '95% interval (beats/min)', tex: `${lo.toFixed(2)}<\\mu<${hi.toFixed(2)}`, note: 'mean ± SD runs 58 to 76 for single students.\nThe interval is far narrower.'}],
      caption: 'The interval is for the **population mean**, so it is far narrower than the spread of single students.'},
  ] as Step[],
};

const S17OneMean: React.FC = () => (
  <Frame title={meta.title} session={17} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(40, 100, 40, SW - 30);
      const topA = i === 3 ? 0 : 1; const rowY = 78;
      return (<g>
        <g opacity={topA}>
          <Label x={40} y={rowY - 42} text="students" color={GROUP[0]} />
          {/* interval band reaching up through the students (last step) */}
          {after(tl, f, 6) && <rect x={x(lo)} y={rowY - 34} width={x(hi) - x(lo)} height={300} fill={C.signal} opacity={0.1 * prog(tl, f, 6)} />}
          {people.map((v, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.08);
            return <Glow key={k} cx={x(v)} cy={lerp(rowY - 60, rowY + ((k % 3) - 1) * 10, p)} r={6} color={GROUP[0]} opacity={p} />; })}
          {after(tl, f, 1) && <g opacity={prog(tl, f, 1)}>
            <line x1={x(xbar)} x2={x(xbar)} y1={rowY - 26} y2={rowY + 26} stroke={C.white} strokeWidth={3} />
            <line x1={x(xbar - sd)} x2={x(xbar + sd)} y1={rowY + 40} y2={rowY + 40} stroke={C.noise} strokeWidth={3} />
            <Label x={x(xbar + sd) + 8} y={rowY + 45} text="SD 9" color={C.noise} size={13} />
          </g>}
          <AxisX x={x} y={150} ticks={[40, 50, 60, 70, 80, 90, 100]} label="heart rate (beats/min)" />
        </g>
        {/* mean scale */}
        {after(tl, f, 1) && i !== 3 && <g opacity={prog(tl, f, 1)}>
          <AxisX x={x} y={392} ticks={[40, 50, 60, 70, 80, 90, 100]} />
          <Label x={SW - 30} y={300} text="mean (beats/min)" color={C.muted} size={13} anchor="end" />
          <Glow cx={x(xbar)} cy={350} r={8} color={C.signal} />
          <Label x={x(xbar)} y={322} text="mean 67" color={C.signal} anchor="middle" weight={700} />
          {after(tl, f, 2) && <g opacity={prog(tl, f, 2)}>
            <line x1={x(xbar - se)} x2={x(xbar + se)} y1={372} y2={372} stroke={C.noise} strokeWidth={4} />
            <Label x={x(xbar + se) + 8} y={377} text={`± SE ${se.toFixed(2)}`} color={C.noise} size={13} /></g>}
          {after(tl, f, 4) && (() => { const p = prog(tl, f, 4, 1.6); return (<g>
            <line x1={x(xbar - M * p)} x2={x(xbar + M * p)} y1={350} y2={350} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
            {i === 4 && p > 0.98 && <Label x={x(hi) + 10} y={355} text="± 6.44" color={C.signal} size={13} />}
          </g>); })()}
          {after(tl, f, 5) && <g opacity={prog(tl, f, 5)}>
            <Label x={x(lo) - 8} y={355} text={lo.toFixed(2)} color={C.signal} anchor="end" size={14} weight={700} />
            <Label x={x(hi) + 8} y={355} text={hi.toFixed(2)} color={C.signal} anchor="start" size={14} weight={700} /></g>}
        </g>}
        {i === 3 && <TTable p={prog(tl, f, 3)} box={prog(tl, f, 3, 2.4)} hit={['9', '0.05']} cols={['0.10', '0.05', '0.02', '0.01']}
          rows={[{name: '8', vals: ['1.860', '2.306', '2.896', '3.355']}, {name: '9', vals: ['1.833', '2.262', '2.821', '3.250']}, {name: '10', vals: ['1.812', '2.228', '2.764', '3.169']}]} />}
      </g>);
    }}
  </Frame>
);

export default S17OneMean;
