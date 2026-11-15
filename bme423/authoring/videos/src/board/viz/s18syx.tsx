import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp, lin} from './_kit';
import {f, sub} from './_s18kit';

// Scatter about the line and the coefficient SEs from summary values (case s18-martians-spread).
// Top: the variance of y split into the part the line explains (b²s_x²) and the leftover.
// Middle: SD of y next to s_y|x (and the raw-data s_y|x at the end). Bottom: what the current step builds.
const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length;
  const title = (k >= 0 && k < n ? c.steps[k].title : '').toLowerCase();
  const vy = v.sy * v.sy, ve = v.b * v.b * v.sx * v.sx, left = vy - ve;
  const brA = 1 / v.n, brB = v.xbar * v.xbar / ((v.n - 1) * v.sx * v.sx), br = brA + brB;
  const isSq = /square/.test(title), isSyx = /estimate/.test(title), isSb = /error of the slope/.test(title);
  const isBr = /bracket/.test(title), isSa = /error of the intercept/.test(title), isRaw = /raw/.test(title), isEnd = k === n;
  const step = isSq ? 0 : isSyx ? 1 : isSb ? 2 : isBr ? 3 : isSa ? 4 : isRaw ? 5 : isEnd ? 6 : -1;
  // A: variance bar
  const VA = lin(0, vy, 30, 370); const yA = 64;
  const pTot = step === 0 ? ramp(t, 1.0, 1.8) : step > 0 ? 1 : 0, pExp = step === 0 ? ramp(t, 2.4, 3.4) : step > 0 ? 1 : 0;
  // B: scatter bars on a common g axis
  const top = Math.max(v.sy, v.sa || 0) * 1.08; const VB = lin(0, top, 30, 370);
  const pSyx = step === 1 ? ramp(t, 2.0, 3.2) : step > 1 ? 1 : 0;
  const pRaw = step === 5 ? ramp(t, 2.0, 3.0) : step > 5 ? 1 : 0;
  const pSa = step === 4 ? ramp(t, 1.6, 3.0) : 0;
  const rowB = [{y: 168, val: v.sy, col: P.faint, lab: sub('s', 'y', ` ${f(v.sy, 3)}`), p: step >= 0 ? 1 : 0},
    {y: 198, val: v.syx, col: P.red, lab: sub('s', 'y|x', ` ${f(v.syx, 3)}`), p: pSyx},
    {y: 228, val: v.syxRaw, col: P.green, lab: sub('s', 'y|x', ` raw ${f(v.syxRaw, 3)}`), p: pRaw}];
  const yAx = 252;
  return (<g fontFamily={inter}>
    {k < 0 && <g>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>The summary values</Txt>
      {(c.table?.rows || []).map((r: any[], i: number) => <g key={i} opacity={ramp(t, 0.6 + i * 0.4, 1.1 + i * 0.4)}>
        <Txt x={30} y={90 + i * 52} size={16} color={P.soft}>{String(r[0])}</Txt>
        <Txt x={370} y={90 + i * 52} size={17} anchor="end" weight={700}>{f(r[2], 3)}</Txt></g>)}
    </g>}
    {k >= 0 && <g>
      <Txt x={20} y={30} size={16} weight={700} color={P.blue}>{'Variance of y (g²)'}</Txt>
      <g opacity={pTot}>
        <rect x={VA(0)} y={yA - 16} width={VA(vy) - VA(0)} height={26} rx={4} fill="#eef1f6" stroke={P.faint} />
        <Txt x={370} y={yA + 32} size={15} anchor="end" color={P.soft}>{sub('s', 'y', `² = ${f(vy)}`)}</Txt>
      </g>
      <g opacity={pExp}>
        <rect x={VA(0)} y={yA - 16} width={(VA(ve) - VA(0)) * pExp} height={26} rx={4} fill={P.blue} opacity={0.75} />
        <rect x={VA(ve)} y={yA - 16} width={VA(vy) - VA(ve)} height={26} rx={0} fill={P.red} opacity={0.75 * pExp} />
        <Txt x={30} y={yA + 32} size={15} color={P.blue}>{`b²s`}<tspan dy={4} fontSize="0.72em">x</tspan><tspan dy={-4}>{`² = ${f(ve)}`}</tspan></Txt>
        <Txt x={VA(ve) + (VA(vy) - VA(ve)) / 2} y={yA - 24} size={15} anchor="middle" color={P.red}>{f(left)}</Txt>
      </g>
      {/* B */}
      <Txt x={20} y={136} size={16} weight={700} color={P.blue}>Scatter (g)</Txt>
      {rowB.map((r, i) => r.p > 0 && <g key={i} opacity={r.p}>
        <rect x={VB(0)} y={r.y - 9} width={(VB(r.val) - VB(0)) * r.p} height={16} rx={3} fill={r.col} opacity={0.8} />
        <Txt x={VB(r.val) + 8} y={r.y + 5} size={15} color={i === 0 ? P.soft : r.col} weight={700}>{r.lab}</Txt>
      </g>)}
      {pSa > 0 && <g opacity={ramp(t, 1.0, 1.6)}>
        <rect x={VB(0)} y={228 - 9} width={(VB(v.syx + (v.sa - v.syx) * pSa) - VB(0))} height={16} rx={3} fill={P.ink} opacity={0.7} />
        <text x={VB(v.syx + (v.sa - v.syx) * pSa) - 6} y={228 + 4} fontSize={13} fontWeight={700} fill="#fff" textAnchor="end">{sub('s', 'a', ` ${f(v.sa * 1, 3)}`)}</text>
      </g>}
      <line x1={VB(0)} x2={370} y1={yAx} y2={yAx} stroke={P.faint} strokeWidth={1.5} />
      {[0, 0.5, 1, 1.5, 2, 2.5, 3].filter(z => z <= top).map(z => <g key={z}><line x1={VB(z)} x2={VB(z)} y1={yAx} y2={yAx + 5} stroke={P.faint} />
        <text x={VB(z)} y={yAx + 20} fontSize={14} fill={P.soft} textAnchor="middle">{z}</text></g>)}
      {/* C: what this step builds */}
      {step === 1 && <g opacity={ramp(t, 1.4, 2.4)}>
        <Txt x={20} y={318} size={16} weight={700} color={P.blue}>Leftover, rescaled</Txt>
        <Txt x={30} y={356} size={16}>{`${f(left)} × ${v.n - 1}/${v.n - 2} = ${f(left * (v.n - 1) / (v.n - 2))}`}</Txt>
        <Txt x={30} y={392} size={16} color={P.red} weight={700}>{sub('s', 'y|x', ` = √${f(left * (v.n - 1) / (v.n - 2))} = ${f(v.syx, 4)}`)}</Txt>
      </g>}
      {step === 2 && (() => { const X = lin(0, v.b * 1.6, 36, 364); const y = 400; return <g>
        <Txt x={20} y={318} size={16} weight={700} color={P.blue}>Slope b ± its SE (g/cm)</Txt>
        <line x1={X(v.b - v.sb * ramp(t, 1.6, 2.8))} x2={X(v.b + v.sb * ramp(t, 1.6, 2.8))} y1={y - 22} y2={y - 22} stroke={P.blue} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
        <circle cx={X(v.b)} cy={y - 22} r={6.5} fill={P.blue} />
        <Txt x={X(v.b)} y={y - 40} size={15} anchor="middle" weight={700} color={P.blue}>{`b = ${f(v.b)}`}</Txt>
        <Txt x={X(v.b + v.sb) + 10} y={y - 17} size={15} color={P.blue} opacity={ramp(t, 2.4, 3.0)}>{sub('s', 'b', ` = ${f(v.sb, 4)}`)}</Txt>
        <line x1={36} x2={364} y1={y} y2={y} stroke={P.faint} strokeWidth={1.5} />
        {[0, 0.2, 0.4, 0.6].filter(z => z <= v.b * 1.6).map(z => <g key={z}><line x1={X(z)} x2={X(z)} y1={y} y2={y + 5} stroke={P.faint} />
          <text x={X(z)} y={y + 20} fontSize={14} fill={P.soft} textAnchor="middle">{z}</text></g>)}
      </g>; })()}
      {(step === 3 || step === 4) && (() => { const X = lin(0, br, 30, 370); const y = 360; const p = step === 3 ? ramp(t, 1.6, 2.8) : 1; return <g>
        <Txt x={20} y={318} size={16} weight={700} color={P.blue}>The bracket</Txt>
        <rect x={X(0)} y={y - 14} width={X(brA) - X(0)} height={26} fill={P.group[2]} opacity={0.8} />
        <rect x={X(brA)} y={y - 14} width={(X(br) - X(brA)) * p} height={26} fill={P.group[1]} opacity={0.7} />
        <Txt x={30} y={y + 36} size={15} color={P.group[2]}>{`1/n = ${f(brA)}`}</Txt>
        <Txt x={370} y={y + 36} size={15} anchor="end" color={P.group[1]} opacity={p}>{`x̄² term = ${f(brB)}`}</Txt>
        {step === 4 && <Txt x={30} y={y + 72} size={16} weight={700} opacity={ramp(t, 1.6, 2.4)}>{sub('s', 'a', ` = ${f(v.syx, 4)} × √${f(br)} = ${f(v.sa, 3)}`)}</Txt>}
      </g>; })()}
      {(step === 5 || step === 6) && (() => { const rows = [
          {name: sub('s', 'b', ' (g/cm)'), r: v.sb, w: v.sbRaw, y: 318},
          {name: sub('s', 'a', ' (g)'), r: v.sa, w: v.saRaw, y: 384}];
        const p = step === 5 ? ramp(t, 3.0, 4.0) : 1; return <g opacity={p}>
        {rows.map((q, i) => { const S = lin(0, Math.max(q.r, q.w) * 1.05, 30, 290); return <g key={i}>
          <Txt x={20} y={q.y} size={16} weight={700} color={P.blue}>{q.name}</Txt>
          <rect x={S(0)} y={q.y + 10} width={S(q.r) - S(0)} height={14} rx={3} fill={P.red} opacity={0.8} />
          <Txt x={S(q.r) + 8} y={q.y + 22} size={15} color={P.red} weight={700}>{f(q.r, 4)}</Txt>
          <rect x={S(0)} y={q.y + 32} width={S(q.w) - S(0)} height={14} rx={3} fill={P.green} opacity={0.8} />
          <Txt x={S(q.w) + 8} y={q.y + 44} size={15} color={P.green} weight={700}>{f(q.w, 4)}</Txt>
        </g>; })}
        <rect x={30} y={438} width={12} height={12} fill={P.red} opacity={0.8} /><Txt x={48} y={449} size={14} color={P.soft}>rounded inputs</Txt>
        <rect x={190} y={438} width={12} height={12} fill={P.green} opacity={0.8} /><Txt x={208} y={449} size={14} color={P.soft}>raw data</Txt>
      </g>; })()}
    </g>}
  </g>);
};
export default Viz;
