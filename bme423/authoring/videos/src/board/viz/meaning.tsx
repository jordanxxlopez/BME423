import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice} from './_kit';
import {f7, sub, up, stepIdx, End, RefLine, Bell} from './_s17';

// What the confidence level means. Real numbers (x̄, M, L, U) only for this one interval. The repeated intervals around a
// fixed μ are a schematic illustration with fixed made-up offsets and no axis numbers.
// Offsets of the sample mean from μ and half-widths, both in units of one typical half-width. Exactly one misses μ.
const REP: [number, number][] = [[0.32, 1.05], [-0.55, 0.92], [0.12, 1.1], [0.78, 0.97], [-0.21, 1.02], [0.47, 0.9], [-0.86, 1.08],
  [0.05, 0.95], [1.18, 0.94], [-0.38, 1.12], [0.61, 1.0], [-0.07, 0.88], [-0.69, 1.04], [0.26, 0.96], [-1.02, 1.1], [0.9, 1.06],
  [-0.3, 0.93], [0.15, 1.01], [-0.5, 0.99], [0.4, 1.07]];

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const S = c.steps; const n = S.length; const end = k >= n;
  const iLev = stepIdx(S, /confidence level/i), iFix = stepIdx(S, /fixed/i), iB = stepIdx(S, /build/i), iRun = stepIdx(S, /long-run/i);
  const M = v.tc * v.se;
  // the one real interval
  const lo = v.L - M * 0.6, hi = v.U + M * 0.6; const X = lin(lo, hi, 30, w - 30); const ticks = nice(lo, hi, 5);
  const SP = X(v.U) - X(v.L);
  const one = (pM: number, pL: number, pU: number, label?: string) => (<g>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{label || 'This one interval'}</Txt>
    {pM > 0 && <rect x={X(v.xbar - M * pM)} width={X(v.xbar + M * pM) - X(v.xbar - M * pM)} y={244} height={12} rx={6} fill={P.hi} />}
    <Dot x={X(v.xbar)} y={250} r={7} color={P.ink} />
    <Txt x={X(v.xbar)} y={226} size={16} anchor="middle" weight={700}>{`x̄ = ${f7(v.xbar)}`}</Txt>
    {pL > 0 && <End x={X(v.L)} y={250} p={pL} color={P.red} label={`L ${f7(v.L)}`} side="left" w={w} span={SP} />}
    {pU > 0 && <End x={X(v.U)} y={250} p={pU} color={P.red} label={`U ${f7(v.U)}`} side="right" w={w} span={SP} />}
    <Axis X={X} y={360} ticks={ticks} />
  </g>);
  if (k < 0) return <g fontFamily={inter}>{one(1, 1, 1)}</g>;
  if (k === iB) return (<g fontFamily={inter}>{one(ramp(t, 2.0, 3.2), ramp(t, 3.4, 4.0), ramp(t, 3.4, 4.0), 'Build the interval')}
    <Txt x={w / 2} y={320} size={15} anchor="middle" color={P.soft} opacity={ramp(t, 2.0, 3.2)}>{`${f7(v.tc)} × ${f7(v.se)} = ${f7(M)}`}</Txt></g>);

  if (k === iLev) { const p = ramp(t, 1.4, 2.6);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Confidence level</Txt>
      <Bell cx={w / 2} y={300} hw={170} ht={190} z={1.96} p={p} />
      <Txt x={w / 2} y={240} size={18} anchor="middle" weight={700} color={P.blue} opacity={p}>1 − α</Txt>
      <Txt x={48} y={270} size={16} anchor="middle" weight={700} color={P.red} opacity={p}>α/2</Txt>
      <Txt x={w - 48} y={270} size={16} anchor="middle" weight={700} color={P.red} opacity={p}>α/2</Txt>
      <Txt x={w / 2 - 170 * 1.96 / 3.6} y={326} size={15} anchor="middle" color={P.ink}>−t{sub('α')}{up('(ν)')}</Txt>
      <Txt x={w / 2 + 170 * 1.96 / 3.6} y={326} size={15} anchor="middle" color={P.ink}>t{sub('α')}{up('(ν)')}</Txt>
      <Txt x={w / 2} y={392} size={14} anchor="middle" color={P.soft}>schematic</Txt>
    </g>); }

  // schematic repeated intervals around a fixed μ
  const mx = w / 2, unit = 62; const SX = (u: number) => mx + u * unit;
  const shown = k === iFix ? 5 : REP.length;
  const reveal = (i: number) => k === iFix ? ramp(t, 1.6 + i * 1.3, 2.1 + i * 1.3) : (k === iRun ? ramp(t, 1.0 + i * 0.28, 1.3 + i * 0.28) : 1);
  const y0 = 92, dy = k === iFix ? 46 : 15.5;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{k === iFix ? 'μ stays, x̄ moves' : 'Repeated samples'}</Txt>
    <Txt x={w - 20} y={34} size={14} anchor="end" color={P.soft}>illustration</Txt>
    <RefLine x={mx} y1={60} y2={y0 + dy * (shown - 1) + 24} color={P.ink} w={2} />
    <Txt x={mx} y={56} size={16} anchor="middle" weight={700}>μ</Txt>
    {REP.slice(0, shown).map(([o, hw], i) => { const hit = Math.abs(o) <= hw; const col = hit ? P.blue : P.red; const y = y0 + dy * i; const p = reveal(i);
      return (<g key={i} opacity={p}>
        <line x1={SX(o - hw)} x2={SX(o + hw)} y1={y} y2={y} stroke={col} strokeWidth={k === iFix ? 4 : 3} strokeLinecap="round" />
        <circle cx={SX(o)} cy={y} r={k === iFix ? 5 : 3.5} fill={col} />
      </g>); })}
    {k !== iFix && <g opacity={k === iRun ? ramp(t, 7.0, 7.8) : 1}>
      <line x1={70} x2={96} y1={420} y2={420} stroke={P.blue} strokeWidth={3} /><Txt x={102} y={425} size={14} color={P.blue}>contains μ</Txt>
      <line x1={220} x2={246} y1={420} y2={420} stroke={P.red} strokeWidth={3} /><Txt x={252} y={425} size={14} color={P.red}>misses μ</Txt>
    </g>}
    {k === iFix && <Txt x={w / 2} y={y0 + dy * shown + 20} size={14} anchor="middle" color={P.soft}>one row per sample</Txt>}
  </g>);
};
export default Viz;
