import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 21 slide 17: hypertension status of 20 subjects by an automated BP machine (rows) and an experienced person (columns).
// By the gold standard none of the 20 has hypertension. Case "s21-bp-machine".
const a = 3, b = 7, c = 1, d = 9;
const E = (b + c) / 2;                                                       // 4
const chi = ((Math.abs(b - E) - 0.5) ** 2 + (Math.abs(c - E) - 0.5) ** 2) / E; // 3.125

export const meta = {
  id: 's21-s21diagnostic', session: 21, method: 's21diagnostic',
  cases: {
    's21-bp-machine': [2, 3, 4, 5, 6, 7, 8],
    's21-orig-strep-mcnemar': [2, 3, 4, 5, 6, 7, 8],
  },
  title: "McNemar's test · two diagnostic procedures",
  steps: [
    {title: 'Twenty subjects', seconds: 7, caption: 'Twenty people were judged for hypertension by a BP machine and by an experienced person. **None** truly has it.',
      card: [{label: 'gold standard', value: '0 of 20 have hypertension', color: C.green, note: 'so every positive call is a false positive'}]},
    {title: 'Paired table', seconds: 7, caption: 'Both procedures judged the **same 20 people**, so the results are paired and McNemar\'s test applies.',
      card: [{label: 'machine (rows) by person (columns)', note: 'machine +   person + 3 · person − 7\nmachine −   person + 1 · person − 9'}]},
    {title: 'Null hypothesis', seconds: 7, caption: 'Every positive call is false, so the test compares **specificity**, the ability to call true negatives negative.',
      card: [{label: 'null hypothesis', tex: 'H_0:P(M{+},P{-})=P(M{-},P{+})', note: 'no difference in specificity between\nthe machine and the person'}]},
    {title: 'Disagreements', seconds: 6, caption: 'Where machine and person agree there is no information about a difference. Only the **8 disagreements** count.',
      card: [{label: 'disagreement cells', value: 'b = 7, c = 1, b + c = 8', color: C.signal}]},
    {title: 'Expected count', seconds: 6, caption: 'With no difference, the 8 disagreements would split **4 and 4** between the two directions.',
      card: [{label: 'expected per disagreement cell', tex: 'E=\\frac{b+c}{2}', value: '(7 + 1) / 2 = 4', color: C.noise}]},
    {title: 'McNemar chi-square', seconds: 7, caption: 'Compare 7 and 1 with 4, subtracting **1/2** for the Yates correction. The statistic is **3.125** with 1 df.',
      card: [{label: 'McNemar χ² (Yates, ν = 1)', tex: '\\chi^2=\\frac{(|b-E|-\\frac12)^2}{E}+\\frac{(|c-E|-\\frac12)^2}{E}', value: `2.5²/4 + 2.5²/4 = ${chi.toFixed(3)}`, color: C.signal}]},
    {title: 'Class chi-square table', seconds: 7, caption: 'Use the **class chi-square table**, 1 df. Column 0.05 gives **3.841** and column 0.10 gives 2.706.',
      card: [{label: 'class chi-square table', value: '1 df · 0.05 → 3.841', color: C.signal, note: '0.10 → 2.706'}]},
    {title: 'Decision', seconds: 8, caption: '3.125 falls **short of 3.841**, so 7 false positives versus 1 is not a significant difference in specificity.',
      card: [{label: 'decision', value: '3.125 < 3.841 → do not reject H0', color: C.red, note: '2.706 < 3.125 < 3.841 → 0.05 < P < 0.10'}]},
  ] as Step[],
};

const PER = 4, SP = 34;  // dots per row and spacing inside a cell
const S21Diagnostic: React.FC = () => (
  <Frame title={meta.title} session={21} steps={meta.steps}>
    {(f, i, tl) => {
      const cw = 170, chh = 140, gx = 250, gy = 66;
      const cell = (r: number, k: number) => ({x: gx + k * (cw + 14), y: gy + r * (chh + 14)});
      const cells = [{r: 0, k: 0, v: a, name: 'a', col: C.green}, {r: 0, k: 1, v: b, name: 'b', col: C.signal}, {r: 1, k: 0, v: c, name: 'c', col: C.pink}, {r: 1, k: 1, v: d, name: 'd', col: C.blue}];
      const change = (nm: string) => nm === 'b' || nm === 'c';
      // every subject, with its starting spot (a row of 20) and its cell slot
      const people = cells.flatMap((cl, ci) => Array.from({length: cl.v}, (_, j) => ({ci, j})));
      const move = prog(tl, f, 1, 1.6);
      return (<g>
        {i <= 5 && <g>
          {after(tl, f, 1) && <g opacity={move}>
            <Label x={cell(0, 0).x + cw / 2} y={44} text="person +" color={C.muted} anchor="middle" size={15} weight={700} />
            <Label x={cell(0, 1).x + cw / 2} y={44} text="person −" color={C.muted} anchor="middle" size={15} weight={700} />
            <Label x={gx - 20} y={cell(0, 0).y + chh / 2 + 5} text="machine +" color={C.muted} anchor="end" size={15} weight={700} />
            <Label x={gx - 20} y={cell(1, 0).y + chh / 2 + 5} text="machine −" color={C.muted} anchor="end" size={15} weight={700} />
            {cells.map((cl, ci) => { const {x, y} = cell(cl.r, cl.k); const dim = after(tl, f, 3) && !change(cl.name) ? 0.2 : 1; const hl = after(tl, f, 3) && change(cl.name);
              return (<g key={ci} opacity={dim}>
                <rect x={x} y={y} width={cw} height={chh} rx={10} fill="rgba(255,255,255,0.03)" stroke={hl ? C.signal : C.line} strokeWidth={hl ? 2.5 : 1.5} />
                {after(tl, f, 4) && change(cl.name) && <g opacity={prog(tl, f, 4)}>
                  <rect x={x + 10} y={y + 12} width={PER * SP} height={32} rx={8} fill="none" stroke={C.noise} strokeWidth={2} strokeDasharray="5 4" />
                  {Array.from({length: PER}, (_, j) => j >= cl.v && <circle key={j} cx={x + 27 + j * SP} cy={y + 28} r={6} fill="none" stroke={C.noise} strokeWidth={1.5} />)}
                </g>}
                <Label x={x + 12} y={y + chh - 14} text={`${cl.name} = ${cl.v}`} color={cl.col} size={15} weight={700} />
                {i === 4 && change(cl.name) && <Label x={x + cw - 12} y={y + chh - 14} text="E = 4" color={C.noise} size={14} anchor="end" weight={700} />}
                {i === 5 && change(cl.name) && <Label x={x + cw - 12} y={y + chh - 14} text={`|${cl.v} − 4| − ½`} color={C.pink} size={14} anchor="end" weight={700} />}
              </g>); })}
            {i === 1 && <g opacity={prog(tl, f, 1, 2)}>
              <Label x={cell(0, 1).x + cw + 12} y={cell(0, 1).y + chh / 2 + 5} text="machine only" color={C.signal} size={13} />
              <Label x={cell(1, 0).x + cw / 2} y={cell(1, 0).y + chh + 24} text="person only" color={C.pink} anchor="middle" size={13} />
            </g>}
          </g>}
          {/* the 20 people: a row first, then into the table */}
          {people.map(({ci, j}, k) => { const cl = cells[ci]; const {x, y} = cell(cl.r, cl.k);
            const sx = 70 + (k % 10) * 62, sy = 170 + Math.floor(k / 10) * 70;
            const tx = x + 27 + (j % PER) * SP, ty = y + 28 + Math.floor(j / PER) * SP;
            const p0 = prog(tl, f, 0, 0.4 + k * 0.05); const dim = after(tl, f, 3) && !change(cl.name) ? 0.2 : 1;
            const extra = i === 5 && cl.name === 'b' && j >= PER;
            return <Glow key={k} cx={lerp(sx, tx, move)} cy={lerp(sy, ty, move)} r={7} color={after(tl, f, 1) ? (extra ? C.pink : cl.col) : C.green} opacity={p0 * dim} />; })}
          {i === 0 && <Label x={SW / 2} y={300} text="all 20 normal by the gold standard" color={C.green} anchor="middle" size={15} opacity={prog(tl, f, 0, 1.6)} />}
        </g>}
        {/* class chi-square table, df row 1 */}
        {i === 6 && (() => { const p = prog(tl, f, 6); const cols = ['0.100', '0.050', '0.025', '0.010', '0.005'];
          const vals: Record<string, string[]> = {'1': ['2.706', '3.841', '5.024', '6.635', '7.879'], '2': ['4.605', '5.991', '7.378', '9.210', '10.597']};
          const x0 = 90, y0 = 110, cw = 118, rh = 58; return (<g opacity={p}>
            <Label x={x0} y={y0 - 40} text="class chi-square table · upper-tail α" color={C.muted} size={14} />
            {cols.map((cc, ci) => <Label key={cc} x={x0 + 120 + ci * cw} y={y0} text={cc} color={cc === '0.050' ? C.signal : cc === '0.100' ? C.noise : C.muted} anchor="middle" weight={700} />)}
            {Object.entries(vals).map(([row, vs], ri) => (<g key={row}>
              <Label x={x0} y={y0 + 48 + ri * rh} text={`df ${row}`} color={row === '1' ? C.signal : C.muted} weight={700} />
              {vs.map((v, ci) => { const hit = row === '1' && ci === 1; const hit2 = row === '1' && ci === 0; return (<g key={ci}>
                {(hit || hit2) && <rect x={x0 + 120 + ci * cw - 46} y={y0 + 26 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={hit ? C.signal : C.noise} strokeWidth={2.5} opacity={prog(tl, f, 6, hit ? 2.2 : 3.2)} />}
                <Label x={x0 + 120 + ci * cw} y={y0 + 48 + ri * rh} text={v} color={hit ? C.signal : hit2 ? C.noise : row === '1' ? C.ink : C.muted} anchor="middle" size={hit ? 18 : 15} weight={hit || hit2 ? 700 : 400} /></g>); })}
            </g>))}
          </g>); })()}
        {/* decision on the chi-square scale */}
        {i === 7 && (() => { const xc = lin(0, 6, 60, SW - 50); const p = prog(tl, f, 7, 2); return (<g opacity={prog(tl, f, 7, 0.6)}>
          <AxisX x={xc} y={320} ticks={[0, 1, 2, 3, 4, 5, 6]} label="chi-square with 1 df" />
          <rect x={xc(3.841)} y={150} width={xc(6) - xc(3.841)} height={170} fill={C.red} opacity={0.08} />
          <line x1={xc(3.841)} x2={xc(3.841)} y1={150} y2={320} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xc(3.841)} y={142} text="3.841 (0.05)" color={C.red} anchor="middle" size={13} weight={700} />
          <line x1={xc(2.706)} x2={xc(2.706)} y1={180} y2={320} stroke={C.noise} strokeWidth={1.5} strokeDasharray="3 4" />
          <Label x={xc(2.706)} y={172} text="2.706 (0.10)" color={C.noise} anchor="middle" size={13} />
          <Glow cx={xc(chi * p)} cy={262} r={9} color={C.signal} />
          <Label x={xc(chi * p)} y={240} text={`χ² = ${(chi * p).toFixed(3)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S21Diagnostic;
