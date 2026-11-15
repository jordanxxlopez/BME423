import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {AxisY, Txt, lin, nice, ramp} from './_kit';
import {TDecision, HypHead, f6, bare, sub, niceSpan} from './_s20';

// Paired t test. Two-measurement cases start as a slopegraph (one line per subject) that collapses into one difference
// per subject; then the mean difference, the spread of the differences (s_d), the much smaller standard error (s_d̄), t
// as a count of standard errors between 0 and d̄, and the two-sided decision. Uses c.values (differences, dbar, sd, se,
// t, critical, reject) and c.table (subject, measurement 1, measurement 2) when it has two measurement columns.
export const stageOf = (title: string) =>
  /hypothes/i.test(title) ? 'hyp' : /standard error/i.test(title) ? 'se' : /\bSD\b/.test(title) ? 'sd'
  : /mean difference/i.test(title) ? 'mean' : /^(List|Form)/i.test(title) ? 'diff' : /t statistic/i.test(title) ? 't'
  : /decision/i.test(title) ? 'decide' : 'other';
const ORDER = ['diff', 'mean', 'sd', 'se', 't'];

// Spread tied values sideways so dots never sit on top of each other.
const dodge = (vals: number[], gap: number) => { const seen: Record<string, number> = {};
  return vals.map(v => { const key = String(v); const j = seen[key] = (seen[key] ?? -1) + 1; return (j % 2 ? -1 : 1) * Math.ceil(j / 2) * gap; }); };

export const PairedViz: VizC = ({c, k, t, w}) => {
  const v = c.values; const d: number[] = v.differences; const n = d.length; const steps = c.steps;
  const twoCol = c.table && c.table.headers.length === 3;
  if (k === steps.length) return <TDecision t={t} stat={v.t} crit={v.critical} reject={v.reject} w={w} p={1} title="Decision" />;
  const st = k < 0 ? 'question' : stageOf(steps[k].title);
  if (st === 'other') return null;
  const pre = st === 'question' || st === 'hyp';
  if (st === 'decide') return <TDecision t={t} stat={v.t} crit={v.critical} reject={v.reject} w={w} />;

  // ---- slopegraph (question, and the left half of the difference step) ----
  const rows: any[][] = twoCol ? c.table.rows : [];
  const a = rows.map(r => r[1] as number), b = rows.map(r => r[2] as number);
  const slope = (opacity: number, xA: number, xB: number) => {
    const all = [...a, ...b]; const lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.08;
    const ticks = niceSpan(lo, hi, 5); const Y = lin(ticks[0], ticks[ticks.length - 1], 400, 100);
    return {Y, el: (<g opacity={opacity}>
      <AxisY Y={Y} x={xA - 40} ticks={ticks} />
      {a.map((_, i) => <line key={i} x1={xA} x2={xB} y1={Y(a[i])} y2={Y(b[i])} stroke={b[i] >= a[i] ? P.blue : P.red} strokeWidth={2} opacity={0.75} />)}
      {a.map((_, i) => <g key={'d' + i}><circle cx={xA} cy={Y(a[i])} r={5} fill={P.group[1]} /><circle cx={xB} cy={Y(b[i])} r={5} fill={P.group[0]} /></g>)}
      <Txt x={xA} y={428} size={14} anchor="middle" color={P.group[1]} weight={700}>{bare(c.table.headers[1])}</Txt>
      <Txt x={xB} y={448} size={14} anchor="middle" color={P.group[0]} weight={700}>{bare(c.table.headers[2])}</Txt>
    </g>)};
  };
  const head = st === 'hyp' ? <HypHead h0="δ = 0" ha="δ ≠ 0" /> : null;
  if (pre && twoCol) {
    const s = slope(1, 130, 270);
    return (<g fontFamily={inter}>
      {head || <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Each subject measured twice</Txt>}
      <Txt x={20} y={58} size={14} color={P.soft}>{c.unit}</Txt>{s.el}</g>);
  }

  // ---- difference view ----
  const lo0 = Math.min(0, ...d, v.dbar - v.sd), hi0 = Math.max(0, ...d, v.dbar + v.sd); const pad = (hi0 - lo0) * 0.08;
  const ticks = niceSpan(lo0, hi0, 6); const Y = lin(ticks[0], ticks[ticks.length - 1], 400, 100);
  const stage = ORDER.indexOf(st);
  if (st === 'diff' && twoCol) {
    // slopegraph on the left, each subject's difference flies to a single column on the right
    const s = slope(1, 95, 185); const xc = 315; const dx = dodge(d, 9);
    const dTicks = ticks;
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>One difference per subject</Txt>
      <Txt x={20} y={58} size={14} color={P.soft}>{c.unit}</Txt>
      {s.el}
      <line x1={xc - 30} x2={xc + 30} y1={Y(0)} y2={Y(0)} stroke={P.faint} strokeDasharray="4 4" strokeWidth={1.5} />
      <line x1={xc + 38} x2={xc + 38} y1={Y(dTicks[0])} y2={Y(dTicks[dTicks.length - 1])} stroke={P.faint} strokeWidth={1.5} />
      {dTicks.map(x => <g key={x}><line x1={xc + 38} x2={xc + 43} y1={Y(x)} y2={Y(x)} stroke={P.faint} /><text x={xc + 47} y={Y(x) + 5} fontSize={14} fill={P.soft}>{x < 0 ? '−' + Math.abs(x) : x}</text></g>)}
      {d.map((di, i) => { const p = ramp(t, 1.6 + i * 1.6 / n, 2.4 + i * 1.6 / n);
        const x = 185 + (xc + dx[i] - 185) * p, y = s.Y(b[i]) + (Y(di) - s.Y(b[i])) * p;
        return <circle key={i} cx={x} cy={y} r={5.5} fill={P.ink} opacity={p > 0 ? 1 : 0} />; })}
      <Txt x={xc} y={448} size={14} anchor="middle" weight={700}>d</Txt>
    </g>);
  }
  const x0 = 90, x1 = 262; const X = (i: number) => n === 1 ? (x0 + x1) / 2 : x0 + 8 + i * (x1 - x0 - 16) / (n - 1);
  const lab = st === 't' ? 292 : 284; // right label column
  // timings follow the board lines: work line j appears at 0.9 + 0.7·G + 1.4·j seconds
  const G = k >= 0 ? steps[k].general.length : 0; const wAt = (j: number) => 0.9 + 0.7 * G + 1.4 * j;
  const pDots = st === 'diff' ? 1 : 1;
  const pMean = st === 'mean' ? ramp(t, wAt(0), wAt(0) + 1) : stage > 1 ? 1 : 0;
  const pStick = st === 'sd' ? ramp(t, wAt(0), wAt(0) + 1.2) * (1 - ramp(t, wAt(2) + 0.6, wAt(2) + 1.4)) : 0;
  const pSD = st === 'sd' ? ramp(t, wAt(2), wAt(2) + 1) : 0;
  const pSE = st === 'se' ? ramp(t, wAt(0), wAt(0) + 1.4) : stage > 3 ? 1 : 0;
  const band = st === 'se' ? v.sd + (v.se - v.sd) * pSE : st === 'sd' ? v.sd * pSD : v.se;
  const showBand = (st === 'sd' && pSD > 0) || stage >= 3;
  const pT = st === 't' ? ramp(t, wAt(0), wAt(0) + 2) : 0;
  const dim = st === 't' ? 1 - 0.65 * ramp(t, 0.6, 1.4) : 1;
  const title = pre ? 'The differences' : st === 'diff' ? 'The differences' : st === 'mean' ? 'Mean difference' : st === 'sd' ? 'Spread of the differences'
    : st === 'se' ? 'Uncertainty of the mean' : 'How many SEs from zero';
  const nSeg = Math.ceil(Math.abs(v.t) - 1e-9); const xs = 272;
  return (<g fontFamily={inter}>
    {head || <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{title}</Txt>}
    <Txt x={20} y={58} size={14} color={P.soft}>{`d, ${c.unit}`}</Txt>
    <AxisY Y={Y} x={70} ticks={ticks} fmt={x => x < 0 ? '−' + Math.abs(x) : String(x)} />
    <line x1={x0} x2={x1} y1={Y(0)} y2={Y(0)} stroke={P.faint} strokeDasharray="4 4" strokeWidth={1.5} />
    {showBand && <rect x={x0} width={x1 - x0} y={Y(v.dbar + band)} height={Math.max(0, Y(v.dbar - band) - Y(v.dbar + band))} fill={st === 'sd' ? 'rgba(208,71,110,0.13)' : P.hi} />}
    <g opacity={dim}>
      {d.map((di, i) => <g key={i}>
        {pStick > 0 && <line x1={X(i)} x2={X(i)} y1={Y(v.dbar)} y2={Y(v.dbar) + (Y(di) - Y(v.dbar)) * pStick} stroke={P.red} strokeWidth={2.5} />}
        <circle cx={X(i)} cy={Y(di)} r={5.5} fill={P.ink} opacity={st === 'diff' ? ramp(t, 1.6 + i * 1.6 / n, 2.2 + i * 1.6 / n) * pDots : 1} />
      </g>)}
    </g>
    {pMean > 0 && <g>
      <line x1={x0} x2={x0 + (x1 - x0) * pMean} y1={Y(v.dbar)} y2={Y(v.dbar)} stroke={P.blue} strokeWidth={3.5} strokeLinecap="round" />
      <Txt x={lab} y={Y(v.dbar) + 5} size={15} color={P.blue} weight={700} opacity={pMean}>{`d̄ = ${f6(v.dbar)}`}</Txt>
    </g>}
    {st === 'sd' && pSD > 0 && <Txt x={lab} y={Y(v.dbar + v.sd) + 5} size={15} color={P.group[1]} weight={700} opacity={pSD}>{sub('s', 'd', f6(v.sd))}</Txt>}
    {st === 'se' && <g>
      <Txt x={lab} y={Y(v.dbar + v.sd) + 5} size={15} color={P.group[1]} weight={700} opacity={1 - pSE}>{sub('s', 'd', f6(v.sd))}</Txt>
      <Txt x={lab} y={Math.max(Y(v.dbar) + 27, Y(v.dbar - v.se) + 5)} size={15} color={P.ink} weight={700} opacity={pSE}>{sub('s', 'd̄', f6(v.se))}</Txt>
    </g>}
    {st === 't' && <g>
      <Txt x={lab} y={Y(0) + 5} size={15} color={P.soft}>δ = 0</Txt>
      {Array.from({length: nSeg}, (_, j) => { const from = Math.sign(v.dbar) * v.se * j, to = Math.sign(v.dbar) * Math.min(v.se * (j + 1), Math.abs(v.dbar));
        const p = ramp(t, wAt(0) + j * 2 / nSeg, wAt(0) + (j + 0.8) * 2 / nSeg);
        return <line key={j} x1={xs} x2={xs} y1={Y(from)} y2={Y(from) + (Y(to) - Y(from)) * p} stroke={j % 2 ? P.group[2] : P.blue} strokeWidth={9} />; })}
      {Array.from({length: nSeg + 1}, (_, j) => Math.min(v.se * j, Math.abs(v.dbar))).map((m, j) =>
        <line key={'tk' + j} x1={xs - 9} x2={xs + 9} y1={Y(Math.sign(v.dbar) * m)} y2={Y(Math.sign(v.dbar) * m)} stroke={P.ink} strokeWidth={1.5} opacity={ramp(t, wAt(0) + j * 2 / nSeg, wAt(0) + j * 2 / nSeg + 0.3)} />)}
      <Txt x={160} y={446} size={16} anchor="middle" color={P.blue} weight={700} opacity={ramp(t, wAt(0) + 2, wAt(0) + 2.6)}>{`t = ${f6(v.t)}`}</Txt>
    </g>}
  </g>);
};
export default PairedViz;
