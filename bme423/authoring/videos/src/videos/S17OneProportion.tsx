import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Arrow, Label} from '../kit/plot';

// Session 17 slides 13-16 (non-prescribed stimulant survey). Case "ci-survey".
const m = 177, n = 500, p0 = 0.5;
const ph = m / n;                                   // 0.354
const v = ph * (1 - ph);                            // 0.228684
const se = Math.sqrt(v / n);                        // 0.02138616
const zc = 1.96, M = zc * se, lo = ph - M, hi = ph + M; // 0.04191688, 0.3120831, 0.3959169

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

const CASE = [2, 3, 4, 5, 6, 6, 6, 7];
export const meta = {
  id: 's17-oneProportion', session: 17, method: 'oneProportion',
  // Case steps: hypotheses, proportion, SE, cutoff, margin, lower, upper, compare with p0.
  // All one-proportion cases use the same eight steps, so they map the same way.
  cases: {'ci-survey': CASE, 'ci-screen': CASE, 'ci-recall': CASE, 'ci-symptom': CASE, 'ci-response': CASE},
  title: 'Confidence interval · one proportion',
  steps: [
    {title: '500 students', seconds: 7, card: [{label: 'data', note: '177 of 500 students said yes\nreference p0 = 0.5'}],
      caption: '177 of 500 students said yes to a non-prescribed stimulant last year. Is the population proportion **one half**?'},
    {title: 'Hypotheses', seconds: 7, card: [{label: 'hypotheses', tex: 'H_0:\\ p=0.5\\qquad H_A:\\ p\\ne0.5', note: 'null: half the population says yes'}],
      caption: 'The null says exactly **half** the population says yes. The alternative says the proportion is not one half.'},
    {title: 'Sample proportion', seconds: 6, card: [{label: 'sample proportion', tex: '\\hat p=\\frac{m}{n}', value: '177 / 500 = 0.354', color: C.signal}],
      caption: 'Divide the yes count by the total. The **sample proportion** is 0.354, so 35.4% of these students said yes.'},
    {title: 'Standard error', seconds: 8, card: [{label: 'standard error', tex: 's_{\\hat p}=\\sqrt{\\frac{\\hat p(1-\\hat p)}{n}}', value: `= ${se.toFixed(6)}`, color: C.noise,
      note: '0.354 × 0.646 = 0.228684\n÷ 500 = 0.000457368, then the root'}],
      caption: 'Multiply 0.354 by 0.646, divide by 500 and take the **square root**. The standard error is about 0.0214.'},
    {title: 'Class t table', seconds: 7, card: [{label: 'class t table', tex: 'z_{0.05}=t_{0.05}(\\infty)', value: 'row ∞ · column 0.05 → 1.96', color: C.signal}],
      caption: 'A proportion uses the Normal cutoff. In the **class t table**, the infinity row and column 0.05 give **1.96**.'},
    {title: 'Margin and interval', seconds: 8, card: [{label: 'margin and interval', tex: '\\hat p\\pm z_{0.05}\\cdot s_{\\hat p}', value: `0.354 ± ${M.toFixed(5)}`, color: C.signal,
      note: `1.96 × ${se.toFixed(6)}\n→ (${lo.toFixed(4)}, ${hi.toFixed(4)})`}],
      caption: 'The margin is 1.96 times the standard error, 0.0419. Subtract and add it to get **0.312 to 0.396**.'},
    {title: 'Is one half inside?', seconds: 7, card: [{label: 'decision', value: '0.5 is outside → reject H0', color: C.green, note: '31.2% to 39.6%, all below one half'}],
      caption: 'The interval stops at 0.396, **below 0.5**, so reject the null. The population proportion is less than one half.'},
    {title: 'Its own reference', seconds: 8, card: [{label: 'rule', tex: 'p_0\\notin[L,U]\\Rightarrow\\text{reject }H_0', note: 'compare with p0 from the question,\nnot with zero'}],
      caption: 'A one-proportion interval is compared with its **own reference**, here 0.5. Zero is not the null value here.'},
  ] as Step[],
};

const S17OneProportion: React.FC = () => (
  <Frame title={meta.title} session={17} steps={meta.steps}>
    {(f, i, tl) => {
      // proportion scale: zoomed in, then zooms out to 0..1 in the last step
      const z = prog(tl, f, 7, 1.6);
      const x = lin(lerp(0.25, 0, z), lerp(0.55, 1, z), 40, SW - 30);
      const ticks = i < 7 ? [0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55] : [0, 0.2, 0.4, 0.6, 0.8, 1];
      const gridA = i === 4 ? 0 : 1;
      const cols = 25, gap = 12, gx = 48, gy = 18;
      const fill = prog(tl, f, 0, 2.4);
      return (<g>
        {/* 500 respondents, filled row by row */}
        <g opacity={gridA}>
          {Array.from({length: n}, (_, k) => { const cx = gx + (k % cols) * gap, cy = gy + Math.floor(k / cols) * gap;
            const shown = k < fill * n; const yes = k < m;
            return <circle key={k} cx={cx} cy={cy} r={yes ? 4 : 3.2} fill={yes ? GROUP[2] : 'none'} stroke={yes ? 'none' : C.muted} strokeWidth={1} opacity={shown ? (yes ? 1 : 0.6) : 0} />; })}
          {fill > 0.99 && <g opacity={prog(tl, f, 0, 3)}>
            <Label x={gx + cols * gap + 16} y={gy + 40} text="yes 177" color={GROUP[2]} weight={700} />
            <Label x={gx + cols * gap + 16} y={gy + 160} text="no 323" color={C.muted} weight={700} />
          </g>}
        </g>
        {/* proportion scale */}
        {after(tl, f, 1) && <g opacity={prog(tl, f, 1)}>
          <AxisX x={x} y={392} ticks={ticks} fmt={t => t.toFixed(2)} />
          <Label x={SW - 30} y={300} text="population proportion p" color={C.muted} size={13} anchor="end" />
          <line x1={x(p0)} x2={x(p0)} y1={318} y2={392} stroke={i >= 6 ? C.red : C.muted} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={x(p0)} y={312} text="p0 = 0.5" color={i >= 6 ? C.red : C.muted} anchor="middle" size={13} />
          {i === 7 && <g opacity={z}>
            <line x1={x(0)} x2={x(0)} y1={340} y2={392} stroke={C.muted} strokeWidth={2} />
            <Label x={x(0) + 6} y={334} text="0 is not the null" color={C.muted} size={13} /></g>}
          {after(tl, f, 2) && (() => { const p = prog(tl, f, 2, 1.2); return (<g>
            <Glow cx={lerp(gx + 12 * gap, x(ph), p)} cy={lerp(gy + 7 * gap, 360, p)} r={8} color={C.signal} />
            {p > 0.98 && i < 7 && <Label x={x(ph)} y={336} text="sample 0.354" color={C.signal} anchor="middle" weight={700} />}
          </g>); })()}
          {after(tl, f, 3) && i < 7 && <g opacity={prog(tl, f, 3)}>
            <line x1={x(ph - se)} x2={x(ph + se)} y1={378} y2={378} stroke={C.noise} strokeWidth={4} />
            <Label x={x(ph + se) + 8} y={383} text="± SE 0.0214" color={C.noise} size={13} /></g>}
          {after(tl, f, 5) && (() => { const p = prog(tl, f, 5, 1.6); return (<g>
            <line x1={x(ph - M * p)} x2={x(ph + M * p)} y1={360} y2={360} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
            {p > 0.98 && i < 7 && <><Label x={x(lo) - 8} y={365} text={lo.toFixed(3)} color={C.signal} anchor="end" size={13} /><Label x={x(hi) + 8} y={355} text={hi.toFixed(3)} color={C.signal} size={13} /></>}
          </g>); })()}
          {i === 6 && <Arrow x1={x(hi) + 4} y1={372} x2={x(p0) - 4} y2={372} color={C.green} w={2} opacity={prog(tl, f, 6)} />}
        </g>}
        {i === 4 && <TTable p={prog(tl, f, 4)} box={prog(tl, f, 4, 2.4)} hit={['∞', '0.05']} cols={['0.10', '0.05', '0.02', '0.01']}
          rows={[{name: '180', vals: ['1.653', '1.973', '2.347', '2.603']}, {name: '200', vals: ['1.653', '1.972', '2.345', '2.601']}, {name: '∞', vals: ['1.6449', '1.9600', '2.3263', '2.5758']}]} />}
      </g>);
    }}
  </Frame>
);

export default S17OneProportion;
