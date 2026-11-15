import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice} from './_kit';

// McNemar's test on a paired 2 x 2 table (also used for two diagnostic procedures on the same people).
// Top: the 2 x 2 table, a b / c d, with row and column totals. On the change step the concordant cells a, d fade and
// the discordant cells b, c light up. Bottom: b and c as bars against E = (b+c)/2, then the two Yates terms adding to
// chi-square, then chi-square against the 0.05 cutoff. The p7 case also shows the (wrong) independent-samples
// expected counts and chi-square. Steps are found by title, so the cases with and without that extra step both work.
const f = (z: number, d = 4) => String(+z.toFixed(d));
export const McNemarViz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length; const kk = k < 0 ? -1 : k === n ? 99 : k;
  const idx = (re: RegExp) => c.steps.findIndex(s => re.test(s.title));
  const kI = idx(/independent/i), kC = idx(/who change/i), kE = idx(/expected/i), kX = idx(/McNemar chi/i), kD = idx(/decision/i);
  const at = (G: number, i: number) => 0.9 + 0.7 * G + 1.4 * i;
  const rowVar = String(c.table.rows[0][0]).split(':')[0], colVar = String(c.table.headers[1]).split(':')[0];
  const sign = (s: string) => /neg/i.test(s) ? '−' : '+';
  const rl = c.table.rows.map((r: any[]) => sign(String(r[0]).split(':')[1] || '')), cl = c.table.headers.slice(1).map((h: string) => sign(h.split(':')[1] || ''));
  const cells = [[v.a, v.b], [v.c, v.d]], names = [['a', 'b'], ['c', 'd']];
  const disc = (i: number, j: number) => i !== j;
  const pC = kC < 0 || kk < kC ? 0 : kk === kC ? ramp(t, 1.0, 2.0) : 1; // concordant fade / discordant highlight
  const pInd = kI >= 0 && kk === kI ? ramp(t, at(1, 0), at(1, 0) + 0.8) : 0;
  // table geometry
  const x0 = 150, cw = 92, y0 = 104, ch = 56;
  const rowT = [v.a + v.b, v.c + v.d], colT = [v.a + v.c, v.b + v.d];
  const table = (<g>
    <Txt x={x0 + cw} y={66} size={15} anchor="middle" weight={700} color={P.ink}>{colVar}</Txt>
    <Txt x={20} y={y0 - 12} size={15} weight={700} color={P.ink}>{rowVar}</Txt>
    {cl.map((s: string, j: number) => <Txt key={j} x={x0 + cw * (j + 0.5)} y={y0 - 12} size={17} anchor="middle" weight={700}>{s}</Txt>)}
    <Txt x={x0 + 2 * cw + 30} y={y0 - 12} size={14} anchor="middle" color={P.soft}>total</Txt>
    {rl.map((s: string, i: number) => <g key={i}>
      <Txt x={x0 - 20} y={y0 + ch * (i + 0.5) + 6} size={17} anchor="middle" weight={700}>{s}</Txt>
      {cells[i].map((val: number, j: number) => {
        const d = disc(i, j); const fill = d ? `rgba(255, 214, 51, ${0.6 * pC})` : '#ffffff';
        return (<g key={j} opacity={d ? 1 : 1 - 0.6 * pC}>
          <rect x={x0 + cw * j} y={y0 + ch * i} width={cw} height={ch} fill={fill} stroke={P.line} strokeWidth={1.5} />
          <Txt x={x0 + cw * j + 8} y={y0 + ch * i + 18} size={14} color={P.soft}>{names[i][j]}</Txt>
          <Txt x={x0 + cw * (j + 0.5)} y={y0 + ch * i + (pInd > 0 ? 32 : 36)} size={20} anchor="middle" weight={700}>{String(val)}</Txt>
          {pInd > 0 && v.independentExpected && <Txt x={x0 + cw * (j + 0.5)} y={y0 + ch * i + 50} size={14} anchor="middle" color={P.red} opacity={pInd}>{`E ${f(v.independentExpected[i][j], 2)}`}</Txt>}
        </g>);
      })}
      <Txt x={x0 + 2 * cw + 30} y={y0 + ch * (i + 0.5) + 6} size={16} anchor="middle" color={P.soft}>{String(rowT[i])}</Txt>
    </g>)}
    {colT.map((s, j) => <Txt key={j} x={x0 + cw * (j + 0.5)} y={y0 + 2 * ch + 22} size={16} anchor="middle" color={P.soft}>{String(s)}</Txt>)}
    <Txt x={x0 + 2 * cw + 30} y={y0 + 2 * ch + 22} size={16} anchor="middle" color={P.soft}>{String(v.N)}</Txt>
  </g>);
  // bottom area
  const yTop = 270, yBase = 430; let bottom: React.ReactNode = null;
  const chiLine = (val: number, crit: number, col: string, label: string, p: number) => {
    const top = Math.max(val, crit) * 1.25; const CX = lin(0, top, 30, 370); const ticks = nice(0, top, 4);
    return (<g>
      <line x1={CX(crit)} x2={CX(crit)} y1={yBase - 70} y2={yBase - 40} stroke={P.red} strokeWidth={2.5} />
      <Txt x={CX(crit)} y={yBase - 76} size={14} anchor="middle" color={P.red}>{`${crit} (0.05)`}</Txt>
      <g opacity={p}><Dot x={CX(val)} y={yBase - 52} r={7} color={col} />
        <Txt x={Math.min(Math.max(CX(val), 80), 320)} y={yBase - 110} size={16} anchor="middle" color={col} weight={700}>{label}</Txt></g>
      <g transform={`translate(0 ${yBase - 40 - 400})`}><Axis X={CX} y={400} ticks={ticks} /></g>
    </g>);
  };
  if (kI >= 0 && kk === kI && v.independentChi2 !== undefined)
    bottom = <g>{chiLine(v.independentChi2, v.critical, P.soft, `independent χ² = ${f(v.independentChi2, 3)}`, ramp(t, at(1, 1), at(1, 1) + 0.8))}</g>;
  if (kk === kC) bottom = <g opacity={pC}>
    <Txt x={20} y={yTop + 20} size={16} color={P.soft}>{`agree a + d = ${v.a + v.d}`}</Txt>
    <Txt x={20} y={yTop + 50} size={16} weight={700}>{`change b + c = ${v.b + v.c}`}</Txt>
    <Txt x={20} y={yTop + 88} size={15} color={P.soft}>{`${rowVar} positives ${rowT[0]}`}</Txt>
    <Txt x={20} y={yTop + 112} size={15} color={P.soft}>{`${colVar} positives ${colT[0]}`}</Txt>
    <Txt x={20} y={yTop + 140} size={15} weight={700}>{`${rowT[0]} − ${colT[0]} = b − c = ${v.b - v.c}`}</Txt>
  </g>;
  if (kk === kE || kk === kX) {
    const mx = Math.max(v.b, v.c, v.E) * 1.15; const H = lin(0, mx, yBase, yTop + 40);
    const pE = kk === kE ? ramp(t, at(1, 0), at(1, 0) + 0.8) : 1; const pX = kk === kX ? ramp(t, at(1, 0), at(1, 0) + 0.8) : 0;
    const bars = [['b', v.b, 110], ['c', v.c, 230]] as [string, number, number][];
    const term = (o: number) => (Math.abs(o - v.E) - 0.5) ** 2 / v.E;
    bottom = <g>
      {bars.map(([nm, val, x]) => <g key={nm}>
        <rect x={x - 30} y={H(val)} width={60} height={yBase - H(val)} fill={P.hiSolid} opacity={0.8} stroke="#c9a400" />
        <Txt x={x} y={H(val) - 8} size={16} anchor="middle" weight={700}>{String(val)}</Txt>
        <Txt x={x} y={yBase + 20} size={15} anchor="middle" color={P.soft}>{nm}</Txt>
        {pX > 0 && <g opacity={pX}>
          <line x1={x + 38} x2={x + 38} y1={H(val)} y2={H(v.E)} stroke={P.red} strokeWidth={3} />
          <Txt x={x + 44} y={(H(val) + H(v.E)) / 2 + 5} size={14} color={P.red}>{f(term(val))}</Txt></g>}
      </g>)}
      <g opacity={pE}>
        <line x1={60} x2={300} y1={H(v.E)} y2={H(v.E)} stroke={P.blue} strokeWidth={2.5} strokeDasharray="6 4" />
        <Txt x={306} y={H(v.E) + 5} size={15} color={P.blue} weight={700}>{`E = ${f(v.E)}`}</Txt></g>
      <line x1={50} x2={310} y1={yBase} y2={yBase} stroke={P.faint} strokeWidth={1.5} />
      {pX > 0 && <Txt x={20} y={yTop} size={16} weight={700} opacity={ramp(t, at(1, 0) + 0.6, at(1, 0) + 1.4)}>{`χ² = ${f(term(v.b))} + ${f(term(v.c))} = ${f(v.chi2)}`}</Txt>}
    </g>;
  }
  if (kk === kD || kk === 99) {
    const p = kk === kD ? ramp(t, 0.8, 1.8) : 1;
    bottom = <g>{chiLine(v.chi2, v.critical, P.blue, `χ² = ${f(v.chi2)}`, p)}
      <Txt x={200} y={yBase + 22} size={16} anchor="middle" weight={700} color={v.reject ? P.green : P.soft} opacity={p}>{`${v.reject ? 'reject H₀' : 'do not reject H₀'}, ${v.pRange}`}</Txt></g>;
  }
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{kk >= kC && kC >= 0 ? 'Only the changes count' : 'Paired 2 × 2 table'}</Txt>
    <Txt x={380} y={34} size={14} anchor="end" color={P.soft}>{c.unit}</Txt>
    {table}{bottom}
  </g>);
};
export default McNemarViz;
