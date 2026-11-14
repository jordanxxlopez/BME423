import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 20 slides 4-5 (unpaired t test) run on the slide 11 oral contraceptive data. Case "s20-oc-unpaired".
const without = [115, 112, 107, 119, 115, 138, 126, 105, 104, 115];
const withOC = [128, 115, 106, 128, 122, 145, 132, 109, 102, 117];
const n = 10;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sdv = (v: number[]) => { const m = mean(v); return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)); };
const m1 = mean(withOC), s1 = sdv(withOC), m2 = mean(without), s2 = sdv(without); // 120.4, 13.2262, 115.6, 10.3086
const d = m1 - m2;                                        // 4.8
const sp2 = ((n - 1) * s1 ** 2 + (n - 1) * s2 ** 2) / (2 * n - 2); // 140.6
const se = Math.sqrt(sp2 / n + sp2 / n);                 // 5.30283
const t = d / se;                                         // 0.905177
const tc = 2.101;                                         // class t table, row 18, column 0.05
// vertical offset per woman so dots at equal values sit apart and lines can join the same woman
const off = [-12, -4, 4, 12, -8, 0, 8, -12, 12, 4];

export const meta = {
  id: 's20-s20unpaired', session: 20, method: 's20unpaired',
  cases: {'s20-oc-unpaired': [2, 3, 4, 5, 6, 7]},
  title: 'Unpaired t test on paired data',
  steps: [
    {title: 'Two columns', seconds: 7, caption: 'Ten women had blood pressure measured without and then with oral contraceptives. Here they count as **two groups**.',
      card: [{label: 'data (systolic BP, mmHg)', note: 'without OC\n115 112 107 119 115 138 126 105 104 115\nwith OC\n128 115 106 128 122 145 132 109 102 117'}]},
    {title: 'Unpaired t test', seconds: 6, caption: 'The unpaired t test asks whether two **group means** differ. Its null hypothesis says the two means are equal.',
      card: [{label: 'null hypothesis', tex: 'H_0:\\mu_{\\mathrm{with}}=\\mu_{\\mathrm{without}}', note: 'both groups have the same mean blood pressure'}]},
    {title: 'Means and SDs', seconds: 7, caption: 'The means differ by only **4.8 mmHg**, but each group spreads over more than 30 mmHg because women differ.',
      card: [{label: 'group means and SDs', value: `${m1.toFixed(1)} vs ${m2.toFixed(1)} mmHg`, note: `SD with ${s1.toFixed(4)} · SD without ${s2.toFixed(4)}`}]},
    {title: 'Pooled variance', seconds: 7, caption: 'Pooling combines the two spreads into one variance. That spread is mostly **differences between women**.',
      card: [{label: 'pooled variance', tex: 's^2=\\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}', value: `= ${sp2.toFixed(1)}`, color: C.noise, note: '[9(174.933) + 9(106.267)] / 18'}]},
    {title: 'Standard error and t', seconds: 8, caption: 'The standard error is **5.30 mmHg**, bigger than the 4.8 mmHg shift, so t is only **0.905**.',
      card: [{label: 'standard error and t', tex: 't=\\frac{\\bar x_1-\\bar x_2}{\\sqrt{s^2/n_1+s^2/n_2}}', value: `4.8 / ${se.toFixed(5)} = ${t.toFixed(6)}`, color: C.signal}]},
    {title: 'Class t table', seconds: 7, caption: 'Use the **class t table** (two-tailed). Row 18 is the degrees of freedom and column 0.05 gives **2.101**.',
      card: [{label: 'class t table', tex: '\\nu=n_1+n_2-2=18', value: 'row 18 · column 0.05 → 2.101', color: C.signal}]},
    {title: 'Decision', seconds: 7, caption: 'The t value falls **short of 2.101**, so the unpaired test finds no difference, with 0.20 < P < 0.50.',
      card: [{label: 'decision', value: '0.905 < 2.101 → do not reject H0', color: C.red, note: 'row 18 · 0.50 → 0.688, 0.20 → 1.330\nso 0.20 < P < 0.50'}]},
    {title: 'Why it misses', seconds: 9, caption: 'Each line joins one woman\'s two readings. Most lines **tilt toward higher pressure**, but spread between women hides it.',
      card: [{label: 'same data, paired t test', value: 't = 3.325, P < 0.01', color: C.green, note: '8 of 10 women rise with oral contraceptives'}]},
  ] as Step[],
};

const S20Unpaired: React.FC = () => (
  <Frame title={meta.title} session={20} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(95, 150, 50, SW - 40);
      const rows = [{y: 70, v: without, m: m2, s: s2, name: 'without OC', c: GROUP[0]}, {y: 175, v: withOC, m: m1, s: s1, name: 'with OC', c: GROUP[1]}];
      const topA = i === 5 ? 0 : 1;
      return (<g>
        <g opacity={topA}>
          {rows.map((g, gi) => (<g key={gi}>
            <Label x={50} y={g.y - 30} text={g.name} color={g.c} />
            {after(tl, f, 2) && i < 7 && <g opacity={prog(tl, f, 2)}>
              <line x1={x(g.m)} x2={x(g.m)} y1={g.y - 24} y2={g.y + 24} stroke={C.white} strokeWidth={3} />
              <line x1={x(g.m - g.s)} x2={x(g.m + g.s)} y1={g.y + 32} y2={g.y + 32} stroke={C.noise} strokeWidth={after(tl, f, 3) && i === 3 ? 5 : 3} />
              <Label x={x(g.m + g.s) + 8} y={g.y + 37} text={`SD ${g.s.toFixed(1)}`} color={C.noise} size={13} />
            </g>}
          </g>))}
          {/* lines joining each woman's two readings */}
          {i === 7 && without.map((v, k) => { const p = prog(tl, f, 7, 0.4 + k * 0.15); const up = withOC[k] > v;
            return <line key={k} x1={x(v)} y1={rows[0].y + off[k]} x2={lerp(x(v), x(withOC[k]), p)} y2={lerp(rows[0].y + off[k], rows[1].y + off[k], p)}
              stroke={up ? C.signal : C.muted} strokeWidth={2.5} opacity={0.9} />; })}
          {rows.map((g, gi) => g.v.map((v, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.08 + gi * 0.4);
            return <Glow key={`${gi}-${k}`} cx={x(v)} cy={lerp(g.y - 60, g.y + off[k], p)} r={6} color={g.c} opacity={p} />; }))}
          <AxisX x={x} y={230} ticks={[100, 110, 120, 130, 140, 150]} label="systolic blood pressure (mmHg)" />
        </g>
        {/* difference scale with the standard error */}
        {(i === 3 || i === 4) && (() => { const xd = lin(-10, 20, 60, SW - 60); return (<g opacity={prog(tl, f, 3)}>
          <AxisX x={xd} y={392} ticks={[-10, -5, 0, 5, 10, 15, 20]} />
          <line x1={xd(0)} x2={xd(0)} y1={318} y2={392} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xd(0)} y={312} text="0" color={C.red} anchor="middle" size={13} />
          <Glow cx={xd(d)} cy={360} r={8} color={C.signal} />
          <Label x={xd(d) + 12} y={340} text={`difference ${d.toFixed(1)}`} color={C.signal} weight={700} />
          {i === 4 && (() => { const p = prog(tl, f, 4, 1.4); return (<g>
            <line x1={xd(d - se * p)} x2={xd(d + se * p)} y1={378} y2={378} stroke={C.noise} strokeWidth={5} strokeLinecap="round" />
            {p > 0.98 && <Label x={xd(d + se) + 8} y={383} text={`± SE ${se.toFixed(2)}`} color={C.noise} size={13} />}
          </g>); })()}
        </g>); })()}
        {/* class t table excerpt */}
        {i === 5 && (() => { const p = prog(tl, f, 5); const cols = ['0.50', '0.20', '0.10', '0.05'];
          const vals: Record<string, string[]> = {'17': ['0.689', '1.333', '1.740', '2.110'], '18': ['0.688', '1.330', '1.734', '2.101'], '19': ['0.688', '1.328', '1.729', '2.093']};
          const x0 = 150, y0 = 90, cw = 120, rh = 54; return (<g opacity={p}>
            <Label x={x0} y={y0 - 28} text="class t table · two-tailed P" color={C.muted} size={14} />
            {cols.map((c, ci) => <Label key={c} x={x0 + 90 + ci * cw} y={y0} text={c} color={c === '0.05' ? C.signal : C.muted} anchor="middle" weight={700} />)}
            {Object.entries(vals).map(([row, vs], ri) => (<g key={row}>
              <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${row}`} color={row === '18' ? C.signal : C.muted} weight={700} />
              {vs.map((v, ci) => { const hit = row === '18' && cols[ci] === '0.05'; return (<g key={ci}>
                {hit && <rect x={x0 + 90 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 5, 2.4)} />}
                <Label x={x0 + 90 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={hit ? 700 : 400} /></g>); })}
            </g>))}
          </g>); })()}
        {/* t scale with the cutoff */}
        {i === 6 && (() => { const xt = lin(0, 3, 60, SW - 60); const p = prog(tl, f, 6, 1.6); return (<g opacity={prog(tl, f, 6, 0.6)}>
          <AxisX x={xt} y={372} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} label="t statistic" />
          <rect x={xt(tc)} y={300} width={xt(3) - xt(tc)} height={72} fill={C.red} opacity={0.12} />
          <line x1={xt(tc)} x2={xt(tc)} y1={296} y2={372} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xt(tc)} y={290} text="cutoff 2.101" color={C.red} anchor="middle" size={13} />
          <Glow cx={xt(t * p)} cy={345} r={8} color={C.signal} />
          <Label x={xt(t * p)} y={325} text={`t = ${(t * p).toFixed(3)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S20Unpaired;
