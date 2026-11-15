import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp, lin, nice} from './_kit';
import {TAxis, f, sub, HypSketch} from './_s18kit';

// Comparing two regression slopes (case s18-plutonian-slopes). Top: each group's slope ± SE and the difference.
// Bottom: the SE of the difference as the hypotenuse of the two SEs, then t on the t axis with the printed cutoffs.
// The last step swaps in the intercepts and their t.
const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length;
  const title = (k >= 0 && k < n ? c.steps[k].title : '').toLowerCase();
  if (/hypothes/.test(title)) return <HypSketch c={c} t={t} two={true} />;
  const rows = (c.table?.rows || []) as any[][];
  const names = [String(rows[0]?.[0] ?? '1'), String(rows[1]?.[0] ?? '2')];
  const isQ = k < 0, isDiff = /slope difference/.test(title), isSE = /standard error of the difference/.test(title);
  const isT = /t statistic/.test(title), isDf = /degrees/.test(title), isCut = /cutoff/.test(title), isP = /p range/.test(title);
  const isInt = /intercept/.test(title), isEnd = k === n;
  // top rows: slopes or intercepts
  const est = isInt ? [rows[0][2], rows[1][2]] as number[] : [v.bM, v.bF];
  const se = isInt ? [rows[0][3], rows[1][3]] as number[] : [v.sbM, v.sbF];
  const lo0 = Math.min(est[0] - 2 * se[0], est[1] - 2 * se[1]), hi0 = Math.max(est[0] + 2 * se[0], est[1] + 2 * se[1]);
  const lo = lo0, hi = hi0 + (hi0 - lo0) * 0.3;
  const X = lin(lo, hi, 36, 364); const yR = [112, 162], yAx = 196;
  const pSE = isQ ? ramp(t, 1.0, 2.2) : 1;
  const pDiff = isDiff ? ramp(t, 1.4, 2.6) : (isInt ? ramp(t, 1.4, 2.6) : (k > 1 || isEnd) ? 1 : 0);
  const d = est[0] - est[1];
  // bottom
  const showTri = isSE; const H = se[0] >= se[1] ? 0 : 1, V = 1 - H;
  const S = Math.min(250 / se[H], 110 / se[V]);
  const ox = 60, oy = 428; const lx = se[H] * S, ly = se[V] * S;
  const pTri = ramp(t, 1.4, 3.6);
  const showT = isT || isDf || isEnd || isInt;
  const tStat = isInt ? v.interceptT : v.t;
  const cuts = isInt ? [{v: v.critical, label: f(v.critical, 3)}] : isEnd ? [{v: v.critical, label: f(v.critical, 3)}, {v: v.critical002, label: f(v.critical002, 3)}] : [];
  const pC = isInt ? ramp(t, 3.0, 4.0) : isEnd ? 1 : 0;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{isInt ? 'Intercepts a ± SE (lb)' : 'Slopes b ± SE (lb/in)'}</Txt>
    {[0, 1].map(i => <g key={i}>
      <Txt x={20} y={yR[i] - 18} size={15} color={P.group[i]} weight={700}>{names[i]}</Txt>
      <line x1={X(est[i] - se[i] * pSE)} x2={X(est[i] + se[i] * pSE)} y1={yR[i]} y2={yR[i]} stroke={P.group[i]} strokeWidth={8} strokeLinecap="round" opacity={0.35} />
      <circle cx={X(est[i])} cy={yR[i]} r={7} fill={P.group[i]} />
      <Txt x={X(est[i])} y={yR[i] - 14} size={15} anchor="middle" color={P.group[i]} weight={700}>{f(est[i])}</Txt>
      <Txt x={X(est[i] + se[i]) + 10} y={yR[i] + 5} size={14} color={P.soft} opacity={pSE}>{`± ${f(se[i])}`}</Txt>
    </g>)}
    {pDiff > 0 && <g opacity={pDiff}>
      <line x1={X(est[1])} x2={X(est[1])} y1={yR[1]} y2={yAx} stroke={P.group[1]} strokeWidth={1.5} strokeDasharray="4 4" />
      <line x1={X(est[0])} x2={X(est[0])} y1={yR[0]} y2={yAx} stroke={P.group[0]} strokeWidth={1.5} strokeDasharray="4 4" />
    </g>}
    <line x1={36} x2={364} y1={yAx} y2={yAx} stroke={P.faint} strokeWidth={1.5} />
    {nice(lo, hi, 5).map(z => <g key={z}><line x1={X(z)} x2={X(z)} y1={yAx} y2={yAx + 5} stroke={P.faint} />
      <text x={X(z)} y={yAx + 20} fontSize={14} fill={P.soft} textAnchor="middle">{f(z, 2)}</text></g>)}
    {pDiff > 0 && <g opacity={pDiff}>
      <line x1={X(est[1])} x2={X(est[1]) + (X(est[0]) - X(est[1])) * pDiff} y1={yAx + 34} y2={yAx + 34} stroke={P.ink} strokeWidth={3} />
      <line x1={X(est[1])} x2={X(est[1])} y1={yAx + 27} y2={yAx + 41} stroke={P.ink} strokeWidth={2.5} />
      <line x1={X(est[0])} x2={X(est[0])} y1={yAx + 27} y2={yAx + 41} stroke={P.ink} strokeWidth={2.5} opacity={pDiff} />
      <Txt x={(X(est[0]) + X(est[1])) / 2} y={yAx + 58} size={15} anchor="middle" weight={700}>{`${f(d)}`}</Txt>
    </g>}
    {showTri && <g>
      <Txt x={20} y={292} size={16} weight={700} color={P.blue}>SE of the difference</Txt>
      <line x1={ox} x2={ox + lx * ramp(pTri, 0, 0.3)} y1={oy} y2={oy} stroke={P.group[H]} strokeWidth={5} strokeLinecap="round" />
      <line x1={ox + lx} x2={ox + lx} y1={oy} y2={oy - ly * ramp(pTri, 0.3, 0.6)} stroke={P.group[V]} strokeWidth={5} strokeLinecap="round" opacity={pTri > 0.3 ? 1 : 0} />
      <line x1={ox} x2={ox + lx * ramp(pTri, 0.6, 1)} y1={oy} y2={oy - ly * ramp(pTri, 0.6, 1)} stroke={P.ink} strokeWidth={4} strokeLinecap="round" opacity={pTri > 0.6 ? 1 : 0} />
      <Txt x={ox + lx / 2} y={oy + 24} size={15} anchor="middle" color={P.group[H]} weight={700}>{f(se[H])}</Txt>
      <Txt x={ox + lx + 10} y={oy - ly / 2 + 5} size={15} color={P.group[V]} weight={700} opacity={ramp(pTri, 0.3, 0.6)}>{f(se[V])}</Txt>
      <Txt x={ox + lx / 2 - 10} y={oy - ly / 2 - 10} size={16} anchor="end" weight={700} opacity={ramp(pTri, 0.8, 1)}>{f(v.se)}</Txt>
    </g>}
    {showT && <TAxis y={390} t={tStat} cuts={cuts} pT={isT ? ramp(t, 1.8, 2.8) : isInt ? ramp(t, 2.0, 3.0) : 1} pC={pC} df={`ν = ${v.df}`} pDf={isDf ? ramp(t, 1.6, 2.4) : (isEnd || isInt) ? 1 : 0} />}
    {showT && <Txt x={20} y={300} size={16} weight={700} color={P.blue}>t on the t scale</Txt>}
  </g>);
};
export default Viz;
