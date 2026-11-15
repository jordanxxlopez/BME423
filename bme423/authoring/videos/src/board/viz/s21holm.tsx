import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Axis, Dot, Txt, ramp, lin, nice} from './_kit';

// Holm-corrected pairwise t tests after a repeated-measures ANOVA. Top: the treatment means on one scale, with the
// shared SE of a difference. Bottom: one |t| bar per pair, ordered from largest |t|, each with its Holm level
// alpha_T/(k-j+1); at the conclusion each bar meets its printed cutoff (from the case's table lookups).
// Steps: 0 procedure, 1 hypotheses, 2 SE, 3 every t, 4 order + Holm levels, 5..k+4 comparisons (class table shown).
const f3 = (z: number) => z.toFixed(3);
const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length; const kk = k < 0 ? -1 : k === n ? 99 : k;
  const idx = (re: RegExp) => c.steps.findIndex(s => re.test(s.title));
  const kSE = idx(/standard error/i), kT = idx(/pairwise t/i), kO = idx(/order/i);
  const at = (G: number, i: number) => 0.9 + 0.7 * G + 1.4 * i;
  const names = Object.keys(v.means), means: number[] = names.map(s => v.means[s]);
  const pairs = Object.keys(v.tValues); const tv: number[] = pairs.map(p => v.tValues[p]);
  const order = pairs.map((_, i) => i).sort((a, b) => Math.abs(tv[b]) - Math.abs(tv[a]));
  const rank = pairs.map((_, i) => order.indexOf(i)); const K = pairs.length;
  // printed cutoffs from the comparison steps, in Holm order
  const comp = c.steps.filter(s => /^comparison/i.test(s.title));
  const crit = (j: number) => comp[j]?.lookup?.value as number | undefined;
  // top: means on a common scale
  const lo = Math.min(...means), hi = Math.max(...means), pad = Math.max((hi - lo) * 0.15, v.se);
  const X = lin(lo - pad, hi + pad, 200, 370); const ticks = nice(lo - pad, hi + pad, 3).filter(z => z >= lo - pad && z <= hi + pad);
  const yM = (i: number) => 74 + i * 36;
  const pSE = kk < kSE ? 0 : kk === kSE ? ramp(t, at(1, 0), at(1, 0) + 0.8) : 1;
  // bottom: |t| bars
  const showBars = kk >= kT; const pOrd = kk < kO ? 0 : kk === kO ? ramp(t, 0.6, 1.6) : 1;
  const pLev = kk < kO ? 0 : kk === kO ? ramp(t, at(1, 0), at(1, 0) + 0.8) : 1;
  const end = kk === 99;
  const tmax = Math.max(...tv.map(Math.abs), ...(end ? comp.map(s => s.lookup?.value || 0) : [])) * 1.08;
  const TX = lin(0, tmax, 20, 330);
  const yRow = (i: number) => { const r0 = 262 + i * 62, r1 = 262 + rank[i] * 62; return r0 + (r1 - r0) * pOrd; };
  const yAx = yM(names.length - 1) + 30;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{showBars ? 'Pairwise |t| with Holm levels' : 'Treatment means'}</Txt>
    <Txt x={380} y={34} size={14} anchor="end" color={P.soft}>{c.unit}</Txt>
    {names.map((nm, i) => <g key={nm}>
      <Txt x={20} y={yM(i) + 5} size={14} color={P.ink}>{nm}</Txt>
      <line x1={200} x2={370} y1={yM(i)} y2={yM(i)} stroke={P.grid} />
      <Dot x={X(means[i])} y={yM(i)} r={6} color={P.group[i % 4]} />
      <Txt x={X(means[i])} y={yM(i) - 10} size={14} anchor="middle" color={P.group[i % 4]} weight={700}>{String(+means[i].toFixed(4))}</Txt>
    </g>)}
    <g transform={`translate(0 ${yAx - 400})`}><Axis X={X} y={400} ticks={ticks} fmt={z => String(+z.toFixed(2))} /></g>
    {pSE > 0 && <g opacity={pSE}>
      <line x1={X(lo)} x2={X(lo) + (X(lo + v.se) - X(lo)) * pSE} y1={yAx + 34} y2={yAx + 34} stroke={P.red} strokeWidth={5} strokeLinecap="round" />
      <Txt x={20} y={yAx + 39} size={15} color={P.red} weight={700}>{`√(2 MS res / n) = ${String(+v.se.toFixed(6))}`}</Txt>
    </g>}
    {showBars && pairs.map((p, i) => {
      const y = yRow(i); const j = rank[i]; const pa = kk === kT ? ramp(t, at(1, i), at(1, i) + 0.7) : 1;
      const cv = crit(j); const ok = v.outcomes[p]; const col = end ? (ok ? P.green : P.faint) : P.blue;
      return (<g key={p} opacity={pa}>
        <Txt x={20} y={y} size={14} color={P.ink}>{p}</Txt>
        <rect x={20} y={y + 8} width={TX(Math.abs(tv[i])) - 20} height={20} fill={col} opacity={0.85} />
        <Txt x={Math.max(TX(Math.abs(tv[i])), end && cv !== undefined ? TX(cv) : 0) + 6} y={y + 24} size={15} color={col} weight={700}>{f3(Math.abs(tv[i]))}</Txt>
        {pLev > 0 && !end && <Txt x={380} y={y} size={14} anchor="end" color={P.red} opacity={pLev}>{`α${'₁₂₃₄₅₆'[j]} = ${String(+(v.holmAlphas[j]).toFixed(4))}`}</Txt>}
        {end && cv !== undefined && <g>
          <line x1={TX(cv)} x2={TX(cv)} y1={y + 2} y2={y + 34} stroke={P.red} strokeWidth={3} />
          <Txt x={380} y={y} size={14} anchor="end" color={P.red}>{`cutoff ${cv}`}</Txt>
        </g>}
      </g>);
    })}
    {showBars && <Txt x={20} y={452} size={14} color={P.soft}>{`|t| on ν = ${v.dfRes}`}</Txt>}
  </g>);
};
export default Viz;
