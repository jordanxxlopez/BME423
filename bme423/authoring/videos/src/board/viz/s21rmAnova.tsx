import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {AxisY, Axis, Dot, Txt, ramp, lin, nice} from './_kit';

// Repeated-measures ANOVA. Top: every subject's profile across the m conditions. From the within-subjects step on,
// each profile is shifted so its subject mean sits on the grand mean (subject differences removed).
// Bottom: the ledger for the current step (subject means, treatment means, SS bar split into treatment + residual,
// MS, F against the F cutoffs). Steps: 0 design, 1 hypotheses, 2 subject means, 3 treatment + grand mean,
// 4 SS within, 5 SS treat, 6 SS res, 7 DF + MS, 8 F, 9 cutoff (class table shown), 10 decision.
export const fmt = (z: number) => String(+z.toFixed(Math.abs(z) < 1 ? 4 : 2));
// mean squares and F to 4 significant digits, so a small MS_res (0.004722) is not cut to 0.0047
const sig = (z: number) => String(+z.toPrecision(4));
export const sub = (i: number) => String(i).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length; const rows: number[][] = c.table.rows.map((r: any[]) => r.slice(1).map(Number));
  const m = v.m, ns = v.n, S: number[] = v.subjectMeans, T: number[] = v.treatmentMeans, X = v.grandMean;
  const idx = (re: RegExp) => c.steps.findIndex(s => re.test(s.title));
  const kS = idx(/subject mean/i), kT = idx(/treatment means/i), kW = idx(/within-subjects/i), kTr = idx(/treatment sum/i),
    kR = idx(/residual sum/i), kMS = idx(/mean squares/i), kF = idx(/F statistic/i), kD = idx(/decision/i);
  const at = (G: number, i: number) => 0.9 + 0.7 * G + 1.4 * i; // when work line i of a step appears
  const kk = k < 0 ? -1 : k === n ? 99 : k;
  // centering progress: 0 raw, 1 subject mean moved onto the grand mean
  const pc = kk < kW ? 0 : kk === kW ? ramp(t, 0.6, 2.0) : 1;
  const yv = (s: number, ti: number, p: number) => rows[s][ti] - p * (S[s] - X);
  const all = rows.flat().concat(rows.flatMap((r, s) => r.map((_, ti) => yv(s, ti, 1))));
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.08;
  const Y = lin(lo - pad, hi + pad, 250, 70); const ticks = nice(lo - pad, hi + pad, 4).filter(z => z >= lo - pad && z <= hi + pad);
  const heads: string[] = c.table.headers.slice(1); const short = heads.every(h => h.length <= 13);
  const xs = Array.from({length: m}, (_, i) => 110 + i * (220 / Math.max(1, m - 1)));
  const title = kk < kW ? 'Each subject across conditions' : 'Subject means removed';
  const showS = kk >= kS && kk < kW, pS = (s: number) => kk === kS ? ramp(t, at(1, s), at(1, s) + 0.6) : 1;
  const showT = kk >= kT, pT = (i: number) => kk === kT ? ramp(t, at(2, i), at(2, i) + 0.6) : 1, pX = kk === kT ? ramp(t, at(2, m), at(2, m) + 0.6) : 1;
  const pTr = kk < kTr ? 0 : kk === kTr ? ramp(t, 1.6, 2.6) : 1, pR = kk < kR ? 0 : kk === kR ? ramp(t, 1.6, 2.6) : 1;
  const yB = 300; // top of the ledger
  // ledger row of numbers with small labels
  const Row: React.FC<{labels: string[]; vals: string[]; ps: number[]; color: string; y: number}> = ({labels, vals, ps, color, y}) => {
    const cw = 360 / labels.length;
    return (<g>{labels.map((l, i) => <g key={i} opacity={ps[i]}>
      <Txt x={20 + cw * (i + 0.5)} y={y} size={14} anchor="middle" color={P.soft}>{l}</Txt>
      <Txt x={20 + cw * (i + 0.5)} y={y + 22} size={16} anchor="middle" color={color} weight={700}>{vals[i]}</Txt></g>)}</g>);
  };
  let ledger: React.ReactNode = null;
  if (kk === 0 || kk === 1) ledger = <g><Txt x={20} y={yB + 20} size={16} weight={700}>{`m = ${m} conditions`}</Txt><Txt x={20} y={yB + 46} size={16} weight={700}>{`n = ${ns} subjects`}</Txt></g>;
  if (kk === kS) ledger = <Row labels={S.map((_, s) => `S̄${sub(s + 1)}`)} vals={S.map(fmt)} ps={S.map((_, s) => pS(s))} color={P.ink} y={yB + 20} />;
  if (kk === kT) ledger = <Row labels={[...T.map((_, i) => `T̄${sub(i + 1)}`), 'X̄']} vals={[...T.map(fmt), fmt(X)]} ps={[...T.map((_, i) => pT(i)), pX]} color={P.blue} y={yB + 20} />;
  // SS bar: within subjects = treatment + residual
  const barW = 360, bx = 20, by = yB + 64, bh = 26;
  const ssBar = (kk >= kW && kk < kMS) && (() => {
    const pW = kk === kW ? ramp(t, at(1, ns), at(1, ns) + 0.8) : 1; const wT = barW * v.ssTreat / v.ssWithin;
    return (<g>
      {kk === kW && <Row labels={v.subjectSS.map((_: number, s: number) => `SS${sub(s + 1)}`)} vals={v.subjectSS.map(fmt)} ps={v.subjectSS.map((_: number, s: number) => ramp(t, at(1, s), at(1, s) + 0.6))} color={P.ink} y={yB} />}
      <g opacity={pW}>
        <Txt x={bx} y={by - 10} size={15} weight={700}>{`SS wit subjs ${fmt(v.ssWithin)}`}</Txt>
        <rect x={bx} y={by} width={barW * pW} height={bh} rx={4} fill="#eceae4" stroke={P.faint} />
        {pTr > 0 && <rect x={bx} y={by} width={Math.max(2, wT) * pTr} height={bh} fill={P.blue} />}
        {pR > 0 && <rect x={bx + wT} y={by} width={(barW - wT) * pR} height={bh} fill={P.red} opacity={0.75} />}
        {pTr > 0 && <Txt x={bx} y={by + bh + 22} size={15} color={P.blue} weight={700} opacity={pTr}>{`treat ${fmt(v.ssTreat)}`}</Txt>}
        {pR > 0 && <Txt x={bx + barW} y={by + bh + 22} size={15} anchor="end" color={P.red} weight={700} opacity={pR}>{`res ${fmt(v.ssRes)}`}</Txt>}
      </g></g>);
  })();
  if (kk === kMS) {
    const p1 = ramp(t, at(2, 0), at(2, 0) + 0.6), p2 = ramp(t, at(2, 1), at(2, 1) + 0.6);
    ledger = <g fontFamily={inter}>
      <Txt x={20} y={yB + 10} size={14} color={P.soft}>SS</Txt><Txt x={150} y={yB + 10} size={14} color={P.soft}>DF</Txt><Txt x={250} y={yB + 10} size={14} color={P.soft}>MS</Txt>
      {[[v.ssTreat, v.dfTreat, v.msTreat, P.blue, 'treat'], [v.ssRes, v.dfRes, v.msRes, P.red, 'res']].map(([ss, df, ms, col, nm], i) => (
        <g key={i} opacity={p1}>
          <Txt x={20} y={yB + 44 + i * 40} size={16} color={col as string} weight={700}>{`${nm} ${fmt(ss as number)}`}</Txt>
          <Txt x={150} y={yB + 44 + i * 40} size={16}>{`÷ ${df}`}</Txt>
          <Txt x={250} y={yB + 44 + i * 40} size={16} color={col as string} weight={700} opacity={p2}>{`= ${sig(ms as number)}`}</Txt>
        </g>))}
    </g>;
  }
  if (kk === kF) {
    const mx = Math.max(v.msTreat, v.msRes); const p = ramp(t, at(1, 0), at(1, 0) + 0.8);
    const bar = (val: number, y: number, col: string, nm: string) => (<g>
      <Txt x={20} y={y + 17} size={15} color={col} weight={700}>{nm}</Txt>
      <rect x={110} y={y} width={Math.max(2, 220 * val / mx)} height={24} fill={col} opacity={0.8} />
      <Txt x={110 + Math.max(2, 220 * val / mx) + 6} y={y + 17} size={15} color={col}>{sig(val)}</Txt></g>);
    ledger = <g>{bar(v.msTreat, yB, P.blue, 'MS treat')}{bar(v.msRes, yB + 36, P.red, 'MS res')}
      <Txt x={20} y={yB + 100} size={17} weight={700} opacity={p}>{`F = ${sig(v.msTreat)} / ${sig(v.msRes)} = ${fmt(v.F)}`}</Txt></g>;
  }
  if (kk === kD || kk === 99) {
    const top = Math.max(v.F, v.critical01) * 1.18; const FX = lin(0, top, 30, 370); const fx = nice(0, top, 4);
    const p = kk === kD ? ramp(t, 0.8, 1.8) : 1; const yL = yB + 70;
    const cl = FX(v.critical01) - FX(v.critical) < 50; // cutoffs close: put the 0.01 label below the line
    ledger = <g>
      <line x1={FX(v.critical)} x2={FX(v.critical)} y1={yL - 26} y2={yL} stroke={P.red} strokeWidth={2.5} />
      <Txt x={FX(v.critical)} y={yL - 32} size={14} anchor="middle" color={P.red}>{`${v.critical} (0.05)`}</Txt>
      <line x1={FX(v.critical01)} x2={FX(v.critical01)} y1={yL - (cl ? 0 : 26)} y2={yL + (cl ? 26 : 0)} stroke={P.red} strokeWidth={2.5} strokeDasharray="4 3" />
      <Txt x={FX(v.critical01) + (cl ? 4 : 0)} y={cl ? yL + 40 : yL - 32} size={14} anchor={cl ? 'start' : 'middle'} color={P.red}>{`${v.critical01} (0.01)`}</Txt>
      <g opacity={p}><Dot x={FX(v.F)} y={yL - 12} r={7} color={P.blue} />
        <Txt x={Math.max(Math.min(FX(v.F), 330), 70)} y={yL - 58} size={16} anchor="middle" color={P.blue} weight={700}>{`F = ${fmt(v.F)}`}</Txt></g>
      <Txt x={200} y={yL + 76} size={16} anchor="middle" weight={700} color={v.reject ? P.green : P.soft} opacity={p}>{`${v.reject ? 'reject H₀' : 'do not reject H₀'}, ${v.pRange}`}</Txt>
      <g transform={`translate(0 ${yL - 400})`}><Axis X={FX} y={400} ticks={fx} /></g>
    </g>;
  }
  // residual segments (step res): each centered point to its treatment mean
  const showRes = kk === kR;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{title}</Txt>
    <Txt x={380} y={34} size={14} anchor="end" color={P.soft}>{c.unit}</Txt>
    <AxisY Y={Y} x={58} ticks={ticks} fmt={z => String(+z.toFixed(2))} />
    {xs.map((x, i) => <Txt key={i} x={x} y={274} size={14} anchor="middle" color={P.soft}>{short ? heads[i] : `t = ${i + 1}`}</Txt>)}
    {rows.map((r, s) => <g key={s}>
      <polyline points={r.map((_, ti) => `${xs[ti]},${Y(yv(s, ti, pc))}`).join(' ')} fill="none" stroke={P.faint} strokeWidth={2} />
      {r.map((_, ti) => <circle key={ti} cx={xs[ti]} cy={Y(yv(s, ti, pc))} r={4} fill={P.soft} />)}
      {showS && <line x1={xs[0] - 14} x2={xs[m - 1] + 14} y1={Y(S[s])} y2={Y(S[s])} stroke={P.ink} strokeWidth={2} strokeDasharray="5 4" opacity={pS(s)} />}
      {showRes && r.map((_, ti) => <line key={'r' + ti} x1={xs[ti] + 3} x2={xs[ti] + 3} y1={Y(yv(s, ti, 1))} y2={Y(T[ti])} stroke={P.red} strokeWidth={2} opacity={ramp(t, 1.0, 1.8)} />)}
    </g>)}
    {showT && <g>
      <line x1={xs[0] - 24} x2={xs[m - 1] + 24} y1={Y(X)} y2={Y(X)} stroke={P.green} strokeWidth={2} strokeDasharray="6 4" opacity={pX} />
      {kk >= kTr && kk <= kTr && T.map((tm, i) => <line key={i} x1={xs[i] - 10} x2={xs[i] - 10} y1={Y(X)} y2={Y(tm)} stroke={P.blue} strokeWidth={4} opacity={pTr} />)}
      {T.map((tm, i) => <rect key={i} x={xs[i] - 7} y={Y(tm) - 7} width={14} height={14} transform={`rotate(45 ${xs[i]} ${Y(tm)})`} fill={P.blue} opacity={pT(i)} />)}
    </g>}
    {ledger}{ssBar}
  </g>);
};
export default Viz;
