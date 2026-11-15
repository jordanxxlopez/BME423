import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, AxisX, Glow, Label} from '../kit/plot';

// Session 21 slides 14-15: p7 antigen in tumor cells of 30 women before and after chemotherapy. Case "s21-p7-mcnemar".
// Rows = before, columns = after. a = (+,+), b = (+ → −), c = (− → +), d = (−,−).
const a = 4, b = 0, c = 12, d = 14, N = a + b + c + d;
const E = (b + c) / 2;                                                       // 6
const chi = ((Math.abs(b - E) - 0.5) ** 2 + (Math.abs(c - E) - 0.5) ** 2) / E; // 10.0833
// ordinary (independent) chi-square with Yates, for comparison
const R = [a + b, c + d], K = [a + c, b + d], O = [[a, b], [c, d]];
const Ex = [[R[0] * K[0] / N, R[0] * K[1] / N], [R[1] * K[0] / N, R[1] * K[1] / N]]; // 2.133 1.867 13.867 12.133
const chiInd = O.flat().reduce((s, o, k) => s + (Math.abs(o - Ex[Math.floor(k / 2)][k % 2]) - 0.5) ** 2 / Ex[Math.floor(k / 2)][k % 2], 0); // 2.165

export const meta = {
  id: 's21-s21mcnemar', session: 21, method: 's21mcnemar',
  cases: {'s21-p7-mcnemar': [1, 2, 3, 4, 5, 6, 7, 8]},
  title: "McNemar's test · p7 antigen before and after",
  steps: [
    {title: 'Thirty women', seconds: 7, caption: 'Tumor cells from 30 women were tested for the **p7 antigen** before and after chemotherapy. Each dot is one woman.',
      card: [{label: 'before (rows) by after (columns)', note: 'before +   4 stay +   0 become −\nbefore −  12 become +  14 stay −'}]},
    {title: 'Null hypothesis', seconds: 6, caption: 'If chemotherapy does nothing, a change from positive to negative is **as likely** as one from negative to positive.',
      card: [{label: 'null hypothesis', tex: 'H_0:P(+\\to-)=P(-\\to+)', note: 'the treatment has no effect on p7'}]},
    {title: 'The wrong test', seconds: 8, caption: 'An ordinary chi-square gives only **2.165**. It is wrong here because the rows and columns are the **same women**.',
      card: [{label: 'independent chi-square (wrong)', value: `χ² = ${chiInd.toFixed(3)} < 3.841`, color: C.red, note: 'E = 2.13, 1.87, 13.87, 12.13\nrows and columns are not independent'}]},
    {title: 'Who changed', seconds: 7, caption: 'Women who stayed the same say nothing about the treatment, so focus only on the **12 who changed**.',
      card: [{label: 'change cells', value: 'b = 0, c = 12, b + c = 12', color: C.signal}]},
    {title: 'Expected count', seconds: 6, caption: 'With no effect, the 12 changes would split **6 and 6** between the two directions.',
      card: [{label: 'expected per change cell', tex: 'E=\\frac{b+c}{2}', value: '(0 + 12) / 2 = 6', color: C.noise}]},
    {title: 'McNemar chi-square', seconds: 8, caption: 'Compare 0 and 12 with 6, subtracting **1/2** for the Yates correction. The statistic is **10.083** with 1 df.',
      card: [{label: 'McNemar χ² (Yates, ν = 1)', tex: '\\chi^2=\\frac{(|b-E|-1/2)^2}{E}+\\frac{(|c-E|-1/2)^2}{E}', value: `5.5²/6 + 5.5²/6 = ${chi.toFixed(3)}`, color: C.signal}]},
    {title: 'Class chi-square table', seconds: 7, caption: 'Use the **class chi-square table**, 1 df. Column 0.05 gives **3.841** and column 0.005 gives 7.879.',
      card: [{label: 'class chi-square table', value: '1 df · 0.05 → 3.841', color: C.signal, note: '0.005 → 7.879 (the last printed column)'}]},
    {title: 'Decision', seconds: 8, caption: 'McNemar passes **7.879**, so p7 changes after chemotherapy, P < 0.005. All 12 changes went negative to positive.',
      card: [{label: 'decision', value: '10.083 > 7.879 → reject H0', color: C.green, note: 'P < 0.005 · the wrong test (2.165) missed it'}]},
  ] as Step[],
};

const PER = 6, SP = 26;  // dots per row and spacing inside a cell
const S21Mcnemar: React.FC = () => (
  <Frame title={meta.title} session={21} steps={meta.steps}>
    {(f, i, tl) => {
      const cw = 190, chh = 140, gx = 230, gy = 66;
      const cell = (r: number, k: number) => ({x: gx + k * (cw + 14), y: gy + r * (chh + 14)});
      const cells = [{r: 0, k: 0, v: a, name: 'a', col: C.green}, {r: 0, k: 1, v: b, name: 'b', col: C.pink}, {r: 1, k: 0, v: c, name: 'c', col: C.signal}, {r: 1, k: 1, v: d, name: 'd', col: C.blue}];
      const change = (nm: string) => nm === 'b' || nm === 'c';
      return (<g>
        {i <= 5 && <g>
          <Label x={cell(0, 0).x + cw / 2} y={44} text="after +" color={C.muted} anchor="middle" size={15} weight={700} />
          <Label x={cell(0, 1).x + cw / 2} y={44} text="after −" color={C.muted} anchor="middle" size={15} weight={700} />
          <Label x={gx - 20} y={cell(0, 0).y + chh / 2 + 5} text="before +" color={C.muted} anchor="end" size={15} weight={700} />
          <Label x={gx - 20} y={cell(1, 0).y + chh / 2 + 5} text="before −" color={C.muted} anchor="end" size={15} weight={700} />
          {cells.map((cl, ci) => { const {x, y} = cell(cl.r, cl.k); const dim = after(tl, f, 3) && !change(cl.name) ? 0.2 : 1; const hl = after(tl, f, 3) && change(cl.name);
            return (<g key={ci} opacity={dim}>
              <rect x={x} y={y} width={cw} height={chh} rx={10} fill="rgba(255,255,255,0.03)" stroke={hl ? C.signal : C.line} strokeWidth={hl ? 2.5 : 1.5} />
              {/* expected count E = 6 fills exactly one row of slots */}
              {after(tl, f, 4) && change(cl.name) && <g opacity={prog(tl, f, 4)}>
                <rect x={x + 10} y={y + 14} width={PER * SP} height={28} rx={8} fill="none" stroke={C.noise} strokeWidth={2} strokeDasharray="5 4" />
                {cl.v === 0 && Array.from({length: PER}, (_, j) => <circle key={j} cx={x + 23 + j * SP} cy={y + 28} r={6} fill="none" stroke={C.noise} strokeWidth={1.5} />)}
              </g>}
              {Array.from({length: cl.v}, (_, j) => { const p = prog(tl, f, 0, 0.4 + ci * 0.3 + j * 0.04); const extra = i === 5 && cl.name === 'c' && j >= PER;
                return <Glow key={j} cx={x + 23 + (j % PER) * SP} cy={y + 28 + Math.floor(j / PER) * SP - (1 - p) * 30} r={6} color={extra ? C.pink : cl.col} opacity={p} />; })}
              <Label x={x + 12} y={y + chh - 14} text={`${cl.name} = ${cl.v}`} color={cl.col} size={15} weight={700} />
              {i === 2 && <Label x={x + cw - 12} y={y + chh - 14} text={`E ${Ex[cl.r][cl.k].toFixed(2)}`} color={C.noise} size={14} anchor="end" opacity={prog(tl, f, 2, 1.2)} />}
              {i === 4 && change(cl.name) && <Label x={x + cw - 12} y={y + chh - 14} text="E = 6" color={C.noise} size={14} anchor="end" weight={700} />}
              {i === 5 && change(cl.name) && <Label x={x + cw - 12} y={y + chh - 14} text={`|${cl.v} − 6| − ½`} color={C.pink} size={14} anchor="end" weight={700} />}
            </g>); })}
          {i === 2 && <g opacity={prog(tl, f, 2, 1.6)}>
            <Label x={SW - 12} y={gy + chh + 8} text="same women" color={C.red} anchor="end" size={14} weight={700} />
            <Label x={SW - 12} y={gy + chh + 26} text="in rows and" color={C.red} anchor="end" size={14} weight={700} />
            <Label x={SW - 12} y={gy + chh + 44} text="columns" color={C.red} anchor="end" size={14} weight={700} />
          </g>}
          {i === 1 && <g opacity={prog(tl, f, 1, 1.2)}>
            <Label x={cell(0, 1).x + cw + 12} y={cell(0, 1).y + chh / 2 + 5} text="+ → −" color={C.pink} size={15} weight={700} />
            <Label x={cell(1, 0).x + cw / 2} y={cell(1, 0).y + chh + 24} text="− → +" color={C.signal} anchor="middle" size={15} weight={700} />
          </g>}
        </g>}
        {/* class chi-square table, df row 1 */}
        {i === 6 && (() => { const p = prog(tl, f, 6); const cols = ['0.100', '0.050', '0.025', '0.010', '0.005'];
          const vals: Record<string, string[]> = {'1': ['2.706', '3.841', '5.024', '6.635', '7.879'], '2': ['4.605', '5.991', '7.378', '9.210', '10.597']};
          const x0 = 90, y0 = 110, cw = 118, rh = 58; return (<g opacity={p}>
            <Label x={x0} y={y0 - 40} text="class chi-square table · upper-tail α" color={C.muted} size={14} />
            {cols.map((cc, ci) => <Label key={cc} x={x0 + 120 + ci * cw} y={y0} text={cc} color={cc === '0.050' ? C.signal : cc === '0.005' ? C.noise : C.muted} anchor="middle" weight={700} />)}
            {Object.entries(vals).map(([row, vs], ri) => (<g key={row}>
              <Label x={x0} y={y0 + 48 + ri * rh} text={`df ${row}`} color={row === '1' ? C.signal : C.muted} weight={700} />
              {vs.map((v, ci) => { const hit = row === '1' && ci === 1; const hit2 = row === '1' && ci === 4; return (<g key={ci}>
                {(hit || hit2) && <rect x={x0 + 120 + ci * cw - 46} y={y0 + 26 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={hit ? C.signal : C.noise} strokeWidth={2.5} opacity={prog(tl, f, 6, hit ? 2.2 : 3.2)} />}
                <Label x={x0 + 120 + ci * cw} y={y0 + 48 + ri * rh} text={v} color={hit ? C.signal : hit2 ? C.noise : row === '1' ? C.ink : C.muted} anchor="middle" size={hit ? 18 : 15} weight={hit || hit2 ? 700 : 400} /></g>); })}
            </g>))}
          </g>); })()}
        {/* decision on the chi-square scale */}
        {i === 7 && (() => { const xc = lin(0, 12, 60, SW - 50); const p = prog(tl, f, 7, 2); return (<g opacity={prog(tl, f, 7, 0.6)}>
          <AxisX x={xc} y={320} ticks={[0, 2, 4, 6, 8, 10, 12]} label="chi-square with 1 df" />
          {[[3.841, '3.841 (0.05)', 150], [7.879, '7.879 (0.005)', 120]].map(([v, txt, yy], k) => (<g key={k}>
            <line x1={xc(v as number)} x2={xc(v as number)} y1={yy as number} y2={320} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xc(v as number)} y={(yy as number) - 8} text={txt as string} color={C.red} anchor="middle" size={13} weight={700} /></g>))}
          <Glow cx={xc(chiInd)} cy={282} r={7} color={C.muted} opacity={0.8} />
          <Label x={xc(chiInd)} y={260} text={`wrong test ${chiInd.toFixed(3)}`} color={C.muted} anchor="middle" size={13} />
          <Glow cx={xc(chi * p)} cy={206} r={9} color={C.signal} />
          <Label x={xc(chi * p)} y={186} text={`McNemar ${(chi * p).toFixed(3)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S21Mcnemar;
