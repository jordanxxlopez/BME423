import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp, lin} from './_kit';

// Study design and relative risk from a 2x2 table (case s19-hrt-relative-risk).
// Top: the 2x2 table with totals, expected counts and the Yates terms as the steps reach them.
// Bottom: the two risks as bars, then their ratio.
// Uses c.values (nTD, nTA, nCD, nCA, nT, nC, riskT, riskC, RR, chiSquare) and the row names in c.table.
const f = (z: number, d = 4) => String(+z.toFixed(d));

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length;
  const at = (re: RegExp) => c.steps.findIndex(s => re.test(s.title.toLowerCase()));
  const kTot = at(/total/), kExp = at(/expected/), kChi = at(/yates|chi-square$/), kProp = at(/proportion/), kRR = at(/relative risk/), kDes = at(/design/);
  const K = k < 0 ? -1 : k === n ? 99 : k;
  const N = v.nT + v.nC, D = v.nTD + v.nCD, A = v.nTA + v.nCA;
  const obs = [[v.nTD, v.nTA], [v.nCD, v.nCA]], rowT = [v.nT, v.nC], colT = [D, A];
  const E = obs.map((r, i) => r.map((_, j) => rowT[i] * colT[j] / N));
  const yates = obs.map((r, i) => r.map((o, j) => (Math.abs(o - E[i][j]) - 0.5) ** 2 / E[i][j]));
  const rowNames = ['hormone', 'never'];
  // table geometry
  const x0 = 20, cw = [92, 96, 96, 96];
  const colX = [x0, x0 + cw[0], x0 + cw[0] + cw[1], x0 + cw[0] + cw[1] + cw[2]]; const colMid = (j: number) => colX[j] + cw[j] / 2;
  const compact = K >= kProp; // once the risks are drawn the table shrinks to the observed counts
  const rh = compact ? 34 : 54, yH = 58, yR = (i: number) => yH + 14 + i * rh;
  const pTot = K === kTot ? ramp(t, 1.4, 2.6) : K > kTot ? 1 : 0;
  const pExp = K === kExp ? ramp(t, 1.6, 2.6) : 0, pChi = K === kChi ? ramp(t, 1.4, 2.4) : 0;
  const totalW = colX[3] + cw[3] - x0;
  const table = (<g>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{K >= kProp ? 'Risk of dying' : 'Deaths by group'}</Txt>
    {['', 'died', 'alive', 'total'].map((h, j) => <Txt key={j} x={colMid(j)} y={yH} size={14} anchor="middle" color={P.soft} weight={600}>{h}</Txt>)}
    <line x1={x0} x2={x0 + totalW} y1={yH + 8} y2={yH + 8} stroke={P.line} />
    {obs.map((r, i) => <g key={i}>
      <Txt x={x0} y={yR(i) + 18} size={15} color={P.group[i]} weight={600}>{rowNames[i]}</Txt>
      {r.map((o, j) => <g key={j}>
        <Txt x={colMid(j + 1)} y={yR(i) + 18} size={16} anchor="middle" weight={j === 0 && K >= kProp ? 700 : 400} color={j === 0 && K >= kProp ? P.red : P.ink}>{String(o)}</Txt>
        {!compact && pExp > 0 && <Txt x={colMid(j + 1)} y={yR(i) + 38} size={14} anchor="middle" color={P.blue} opacity={pExp}>{`E ${E[i][j].toFixed(2)}`}</Txt>}
        {!compact && pChi > 0 && <Txt x={colMid(j + 1)} y={yR(i) + 38} size={14} anchor="middle" color={P.red} opacity={pChi}>{`+ ${yates[i][j].toFixed(3)}`}</Txt>}
      </g>)}
      <Txt x={colMid(3)} y={yR(i) + 18} size={16} anchor="middle" weight={K >= kProp ? 700 : 400} color={K >= kProp ? P.blue : P.ink} opacity={K >= kTot ? (K === kTot ? ramp(t, 0.9 + i * 1.4, 1.9 + i * 1.4) : 1) : 0}>{String(rowT[i])}</Txt>
    </g>)}
    <line x1={x0} x2={x0 + totalW} y1={yR(2) + 2} y2={yR(2) + 2} stroke={P.line} />
    <g opacity={pTot}>
      {[D, A, N].map((s, j) => <Txt key={j} x={colMid(j + 1)} y={yR(2) + 22} size={15} anchor="middle" color={P.soft}>{String(s)}</Txt>)}
    </g>
    {!compact && K >= kChi && K < kProp && <Txt x={20} y={yR(2) + 56} size={16} weight={700} color={P.red} opacity={K === kChi ? ramp(t, 1.8, 2.8) : 1}>{`χ² = ${v.chiSquare.toFixed(2)}`}</Txt>}
  </g>);

  // risk bars
  const top = 210; const X = lin(0, Math.max(v.riskT, v.riskC) * 1.18, 110, w - 30);
  const pR = (i: number) => K === kProp ? ramp(t, 1.6 + i * 1.4, 2.6 + i * 1.4) : K > kProp ? 1 : 0;
  const risks = [v.riskT, v.riskC]; const yb = (i: number) => top + 52 + i * 56;
  const pRR = K === kRR ? ramp(t, 1.2, 2.4) : K > kRR ? 1 : 0;
  const bars = K >= kProp && (<g>
    <line x1={20} x2={w - 20} y1={top} y2={top} stroke={P.line} />
    {risks.map((r, i) => <g key={i} opacity={Math.min(1, pR(i) * 3)}>
      <Txt x={100} y={yb(i) + 5} size={15} anchor="end" color={P.group[i]} weight={600}>{rowNames[i]}</Txt>
      <rect x={110} y={yb(i) - 14} width={(X(r) - 110) * pR(i)} height={28} rx={4} fill={P.group[i]} opacity={0.85} />
      <Txt x={X(r) + 8} y={yb(i) + 5} size={15} weight={700} color={P.group[i]} opacity={pR(i)}>{f(r, 5)}</Txt>
    </g>)}
    {pRR > 0 && <g opacity={pRR}>
      {/* the hormone bar laid against the never-used bar: it reaches RR of the way */}
      <line x1={X(v.riskT)} x2={X(v.riskT)} y1={yb(0) - 18} y2={yb(1) + 18} stroke={P.ink} strokeWidth={2} strokeDasharray="5 4" />
      <line x1={110} x2={110} y1={yb(0) - 18} y2={yb(1) + 18} stroke={P.ink} strokeWidth={1.5} />
      <Txt x={(110 + X(v.riskC)) / 2} y={yb(1) + 52} size={17} anchor="middle" weight={700} color={P.ink}>{`RR = ${f(v.riskT, 5)} / ${f(v.riskC, 5)} = ${f(v.RR)}`}</Txt>
    </g>}
    {K >= kDes && <g opacity={K === kDes ? ramp(t, 1.0, 2.0) : 1}>
      <rect x={60} y={yb(1) + 72} width={w - 120} height={34} rx={17} fill="rgba(31,138,76,0.08)" stroke={P.green} strokeWidth={2} />
      <Txt x={w / 2} y={yb(1) + 95} size={16} anchor="middle" weight={700} color={P.green}>association, not cause</Txt>
    </g>}
  </g>);
  return (<g fontFamily={inter}>{table}{bars}</g>);
};
export default Viz;
