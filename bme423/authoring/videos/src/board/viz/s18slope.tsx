import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp, lin, nice} from './_kit';
import {CoefLine, TAxis, f, sub, HypSketch} from './_s18kit';

// t test of the slope and intervals for slope and intercept (case s18-martians-trend).
// Top: the slope on its own scale, measured in SE steps from 0. Bottom: the t axis with the printed cutoffs,
// then the intercept interval. The hypotheses step falls back to the hypotheses panel.
const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length;
  const title = (k >= 0 && k < n ? c.steps[k].title : '').toLowerCase();
  if (/hypothes/.test(title)) return <HypSketch c={c} t={t} two={false} />;
  const isT = /t statistic/.test(title), isDf = /degrees/.test(title), isDec = /decision/.test(title), isP = /p range/.test(title);
  const isCIb = /interval for the slope/.test(title), isCIa = /interval for the intercept/.test(title), isEnd = k === n, isQ = k < 0;
  // Top: slope scale with SE steps from 0 to b
  const lo = Math.min(0, v.slopeLower) - v.sb, hi = Math.max(v.b, v.slopeUpper) + v.sb;
  const X = lin(lo, hi, 36, 364); const y1 = 170;
  const nSE = Math.floor(v.t); const pSteps = isT ? ramp(t, 1.4, 3.6) : 1;
  const showSteps = isT || isDf || isDec || isP;
  const pCIb = isCIb ? ramp(t, 3.0, 4.6) : (isCIa || isEnd) ? 1 : 0;
  // Bottom: t axis or intercept interval
  const showIntercept = isCIa || isEnd;
  const pCut = isDec ? ramp(t, 1.0, 2.0) : (isP || isCIb) ? 1 : 0;
  const cuts = [{v: v.critical, label: `${f(v.critical, 3)}`}, ...(isP || isCIb ? [{v: v.critical001, label: `${f(v.critical001, 3)}`}] : [])];
  const ticks = nice(lo, hi, 5);
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{isQ ? 'The coefficients' : 'Slope b (g/cm)'}</Txt>
    {/* top: slope scale */}
    <line x1={X(0)} x2={X(0)} y1={y1 - 76} y2={y1 + 6} stroke={P.red} strokeWidth={2} strokeDasharray="4 4" />
    <Txt x={X(0)} y={y1 - 82} size={15} anchor="middle" color={P.red}>β = 0</Txt>
    {showSteps && Array.from({length: nSE}, (_, i) => <rect key={i} x={X(i * v.sb)} y={y1 - 30} width={(X(v.sb) - X(0)) - 2} height={14} rx={3}
      fill={i % 2 ? P.group[2] : P.blue} opacity={0.7 * ramp(pSteps * nSE, i, i + 0.6)} />)}
    {showSteps && <Txt x={X(v.b / 2)} y={y1 - 40} size={15} anchor="middle" color={P.blue} opacity={ramp(pSteps, 0.9, 1)}>{`${f(v.t, 3)} SEs`}</Txt>}
    {pCIb > 0 && <g opacity={pCIb}>
      <rect x={X(v.slopeLower)} width={X(v.slopeUpper) - X(v.slopeLower)} y={y1 - 22} height={12} rx={6} fill={P.hi} />
      <path d={`M${X(v.slopeLower) + 7},${y1 - 32} L${X(v.slopeLower)},${y1 - 32} L${X(v.slopeLower)},${y1} L${X(v.slopeLower) + 7},${y1}`} fill="none" stroke={P.green} strokeWidth={3} />
      <path d={`M${X(v.slopeUpper) - 7},${y1 - 32} L${X(v.slopeUpper)},${y1 - 32} L${X(v.slopeUpper)},${y1} L${X(v.slopeUpper) - 7},${y1}`} fill="none" stroke={P.green} strokeWidth={3} />
    </g>}
    <circle cx={X(v.b)} cy={y1 - 16} r={7} fill={P.ink} />
    <Txt x={X(v.b)} y={y1 - 58} size={16} anchor="middle" weight={700}>{`b = ${f(v.b)}`}</Txt>
    <Txt x={X(v.b) + 12} y={y1 - 34} size={14} color={P.soft} opacity={isQ || showSteps ? 1 : 0}>{sub('s', 'b', ` = ${f(v.sb)}`)}</Txt>
    <line x1={36} x2={364} y1={y1} y2={y1} stroke={P.faint} strokeWidth={1.5} />
    {ticks.map(z => <g key={z}><line x1={X(z)} x2={X(z)} y1={y1} y2={y1 + 5} stroke={P.faint} />
      <text x={X(z)} y={y1 + 20} fontSize={14} fill={P.soft} textAnchor="middle">{f(z, 2)}</text></g>)}
    {pCIb > 0 && <g opacity={pCIb}>
      <Txt x={X(v.slopeLower)} y={y1 + 42} size={15} anchor="middle" color={P.green} weight={700}>{f(v.slopeLower, 4)}</Txt>
      <Txt x={X(v.slopeUpper)} y={y1 + 42} size={15} anchor="middle" color={P.green} weight={700}>{f(v.slopeUpper, 4)}</Txt>
    </g>}
    {/* bottom */}
    {(showSteps || isCIb) && <g>
      <Txt x={20} y={290} size={17} weight={700} color={P.blue}>t on the t scale</Txt>
      <TAxis y={390} t={v.t} cuts={pCut > 0 ? cuts : []} pT={isT ? ramp(t, 3.0, 4.0) : 1} pC={pCut} df={`ν = ${v.df}`} pDf={isDf ? ramp(t, 1.4, 2.2) : (isDec || isP || isCIb) ? 1 : 0} />
    </g>}
    {isQ && <g>
      <Txt x={20} y={290} size={17} weight={700} color={P.blue}>Intercept a (g)</Txt>
      <CoefLine y={400} est={v.a} se={v.sa} pSE={ramp(t, 1.0, 2.0)} title="" color={P.ink} />
    </g>}
    {showIntercept && <g>
      <Txt x={20} y={290} size={17} weight={700} color={P.blue}>Intercept a (g)</Txt>
      <CoefLine y={400} est={v.a} lo={v.interceptLower} hi={v.interceptUpper} pCI={isCIa ? ramp(t, 3.4, 5.0) : 1} title="" color={P.ink} />
    </g>}
  </g>);
};
export default Viz;
