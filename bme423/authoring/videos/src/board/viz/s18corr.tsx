import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp, lin} from './_kit';
import {TAxis, f, TablePanel} from './_s18kit';

// Pearson r and its t test (case s18-martians-r). The case gives only deviation totals, so the cloud is a schematic
// ellipse (no data points) whose shape follows r: a circle at r = 0 tightening toward the line as r grows.
// Below it: r on the −1..+1 scale, then the split of Σ(y−ȳ)² by r², then t on the t axis.
const Ellipse: React.FC<{r: number; cx: number; cy: number; R: number}> = ({r, cx, cy, R}) => {
  const a = R * Math.sqrt(1 + Math.abs(r)) / Math.SQRT2, b = R * Math.sqrt(Math.max(0.0001, 1 - Math.abs(r))) / Math.SQRT2;
  const ang = r >= 0 ? -45 : 45;
  return (<g>
    <ellipse cx={cx} cy={cy} rx={a} ry={b} transform={`rotate(${ang} ${cx} ${cy})`} fill={P.blue} opacity={0.14} stroke={P.blue} strokeWidth={2} />
    <line x1={cx - R * 0.8} x2={cx + R * 0.8} y1={cy + (r >= 0 ? R * 0.8 : -R * 0.8)} y2={cy - (r >= 0 ? R * 0.8 : -R * 0.8)} stroke={P.blue} strokeWidth={2} strokeDasharray="6 5" opacity={0.6} />
  </g>);
};

const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length;
  const title = (k >= 0 && k < n ? c.steps[k].title : '').toLowerCase();
  if (k < 0) return <TablePanel c={c} t={t} />;
  const isR = /calculate r/.test(title), isChk = /slope relation/.test(title), isSq = /square r/.test(title);
  const isT = /t statistic/.test(title), isDec = /decide/.test(title), isInt = /interpret/.test(title), isEnd = k === n, isQ = k < 0;
  const b = v.sxy / v.sxx, fac = Math.sqrt(v.sxx / v.syy);
  const rNow = isQ ? 0 : isR ? v.r * ramp(t, 1.6, 3.4) : v.r;
  // r scale
  const R = lin(-1, 1, 40, 360); const yR = 236;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{isQ ? 'Shape of the cloud' : `r = ${f(rNow, 4)}`}</Txt>
    <Ellipse r={rNow} cx={200} cy={120} R={88} />
    {/* r scale */}
    <line x1={R(-1)} x2={R(1)} y1={yR} y2={yR} stroke={P.faint} strokeWidth={1.5} />
    {[-1, -0.5, 0, 0.5, 1].map(z => <g key={z}><line x1={R(z)} x2={R(z)} y1={yR} y2={yR + 5} stroke={P.faint} />
      <text x={R(z)} y={yR + 20} fontSize={14} fill={P.soft} textAnchor="middle">{z === 1 ? '+1' : z === -1 ? '−1' : f(z)}</text></g>)}
    {!isQ && <g>
      <line x1={R(0)} x2={R(rNow)} y1={yR - 10} y2={yR - 10} stroke={P.blue} strokeWidth={4} strokeLinecap="round" />
      <circle cx={R(rNow)} cy={yR - 10} r={7} fill={P.blue} />
    </g>}
    {(isInt || isEnd) && <Txt x={R(-1)} y={yR - 26} size={15} anchor="start" color={P.green} weight={700} opacity={isInt ? ramp(t, 1.6, 2.4) : 1}>strong positive</Txt>}
    {/* slope relation: b scaled by √(Σ(x−x̄)²/Σ(y−ȳ)²) lands on r */}
    {isChk && (() => { const B = lin(0, 1, 40, 360); const p = ramp(t, 3.4, 4.8); const y = 340; return <g>
      <Txt x={20} y={292} size={16} weight={700} color={P.blue}>b times the SD ratio</Txt>
      <rect x={B(0)} y={y - 10} width={B(b) - B(0)} height={16} rx={3} fill={P.group[2]} opacity={0.75 * ramp(t, 2.0, 2.8)} />
      <Txt x={B(b) + 8} y={y + 5} size={15} color={P.group[2]} weight={700} opacity={ramp(t, 2.0, 2.8)}>{`b = ${f(b)}`}</Txt>
      <rect x={B(0)} y={y + 22} width={(B(b + (v.r - b) * p) - B(0))} height={16} rx={3} fill={P.blue} opacity={0.75 * ramp(t, 3.2, 3.6)} />
      <Txt x={B(0)} y={y + 64} size={15} color={P.blue} weight={700} opacity={p}>{`${f(b)} × ${f(fac)} = ${f(v.r)}`}</Txt>
      <line x1={B(0)} x2={B(1)} y1={y + 82} y2={y + 82} stroke={P.faint} strokeWidth={1.5} />
      {[0, 0.5, 1].map(z => <g key={z}><line x1={B(z)} x2={B(z)} y1={y + 82} y2={y + 87} stroke={P.faint} />
        <text x={B(z)} y={y + 102} fontSize={14} fill={P.soft} textAnchor="middle">{z}</text></g>)}
    </g>; })()}
    {/* r²: share of Σ(y−ȳ)² that the line accounts for */}
    {(isSq || isInt) && (() => { const B = lin(0, v.syy, 40, 360); const p = isSq ? ramp(t, 1.8, 3.2) : 1; const y = 336; return <g>
      <Txt x={20} y={292} size={16} weight={700} color={P.blue}>{`Σ(y − ȳ)² = ${f(v.syy)}`}</Txt>
      <rect x={B(0)} y={y - 14} width={B(v.syy) - B(0)} height={26} rx={4} fill={P.red} opacity={0.7} />
      <rect x={B(0)} y={y - 14} width={(B(v.syy * v.r2) - B(0)) * p} height={26} rx={4} fill={P.blue} opacity={0.8} />
      <Txt x={B(0)} y={y + 36} size={15} color={P.blue} weight={700} opacity={p}>{`r² = ${f(v.r2)} → ${f(v.syy * v.r2, 2)}`}</Txt>
      <Txt x={B(v.syy)} y={y + 36} size={15} anchor="end" color={P.red} weight={700} opacity={p}>{f(v.syy * (1 - v.r2), 2)}</Txt>
    </g>; })()}
    {isEnd && (() => { const seen = new Map<number, string>();
      for (const st of c.steps) if (st.lookup && typeof st.lookup.value === 'number') seen.set(st.lookup.value, f(st.lookup.value, 3));
      const cuts = [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([val, label]) => ({v: val, label}));
      return <g><Txt x={20} y={292} size={16} weight={700} color={P.blue}>t on the t scale</Txt>
        <TAxis y={390} t={v.t} cuts={cuts} pT={1} pC={1} df={`ν = ${v.df}`} pDf={1} /></g>; })()}
    {isT && <g>
      <Txt x={20} y={292} size={16} weight={700} color={P.blue}>t on the t scale</Txt>
      <TAxis y={390} t={v.t} cuts={[]} pT={ramp(t, 2.0, 3.0)} pC={0} />
    </g>}
    {isQ && <Txt x={200} y={300} size={15} anchor="middle" color={P.soft} opacity={ramp(t, 1.0, 2.0)}>{`n = ${v.n}`}</Txt>}
  </g>);
};
export default Viz;
