import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp} from './_kit';
import {FDecision, HypHead, f2, f6, sub, wrap, bare} from './_s20';

// Repeated measures ANOVA. A subject-by-treatment grid (c.table) gains the subject means S̄ (right column), then the
// treatment means T̄ and grand mean X̄ (bottom row). Removing each subject's mean leaves x − S̄ in the cells and each
// subject's SS_s; the SS bars then show between subjects set aside and SS within split into treatment and residual,
// then the mean squares and F, then the F decision. Every number comes from c.table or c.values.
const stageOf = (title: string) =>
  /hypothes/i.test(title) ? 'hyp' : /subject means/i.test(title) ? 'smean' : /treatment means/i.test(title) ? 'tmean'
  : /within subjects/i.test(title) ? 'within' : /treatment sum/i.test(title) ? 'treat' : /residual/i.test(title) ? 'res'
  : /mean squares/i.test(title) ? 'F' : /decision/i.test(title) ? 'decide' : /paired t/i.test(title) ? 'tsq' : 'other';
const ORDER = ['question', 'smean', 'tmean', 'within', 'treat', 'res', 'F'];

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const steps = c.steps; const nS = steps.length;
  if (k === nS) return <FDecision t={t} F={v.F} c05={v.critical05} c01={v.critical01} reject={v.reject} w={w} p={1} />;
  const st = k < 0 ? 'question' : stageOf(steps[k].title);
  if (st === 'other') return null;
  if (st === 'decide') return <FDecision t={t} F={v.F} c05={v.critical05} c01={v.critical01} reject={v.reject} w={w} />;
  const G = k >= 0 ? steps[k].general.length : 0; const wAt = (j: number) => 0.9 + 0.7 * G + 1.4 * j;

  if (st === 'tsq') {
    // with two treatments F is the square of the paired t: a square of side √F has area F
    const r = Math.sqrt(v.F); const side = 230; const x0 = 85, y0 = 110; const p = ramp(t, wAt(0), wAt(0) + 1.4);
    const cells = Math.floor(r);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>F is t squared</Txt>
      <rect x={x0} y={y0} width={side} height={side} fill="rgba(40,83,200,0.10)" stroke={P.blue} strokeWidth={2.5} opacity={p} />
      {Array.from({length: cells}, (_, i) => <g key={i} opacity={p * 0.5}>
        <line x1={x0 + side * (i + 1) / r} x2={x0 + side * (i + 1) / r} y1={y0} y2={y0 + side} stroke={P.blue} strokeDasharray="3 4" />
        <line y1={y0 + side * (i + 1) / r} y2={y0 + side * (i + 1) / r} x1={x0} x2={x0 + side} stroke={P.blue} strokeDasharray="3 4" /></g>)}
      <Txt x={x0 + side / 2} y={y0 + side + 30} size={16} anchor="middle" weight={700} color={P.blue}>{`t = √F = ${f6(r)}`}</Txt>
      <Txt x={x0 + side / 2} y={y0 + side / 2 + 6} size={17} anchor="middle" weight={700} opacity={p}>{`F = ${f6(v.F)}`}</Txt>
    </g>);
  }

  // ---- grid ----
  const rows: number[][] = c.table.rows.map((r: any[]) => r.slice(1) as number[]); const n = rows.length, m = rows[0].length;
  const heads: string[] = c.table.headers.slice(1).map(bare);
  const S: number[] = v.subjectMeans, T: number[] = v.treatmentMeans, X = v.grandMean;
  const SSs = rows.map((r, s) => r.reduce((a, x) => a + (x - S[s]) ** 2, 0));
  const si = ORDER.indexOf(st);
  const gx0 = 20, labW = 34; const colW = Math.min(90, (w - 40 - labW) / (m + 1));
  const cx = (j: number) => gx0 + labW + colW * (j + 0.5);
  const headY = 66; const top = 104; const rowH = Math.min(26, (316 - top) / (n + 1)); const fs = rowH < 22 ? 14 : 15;
  const ry = (s: number) => top + rowH * (s + 0.5) + 5;
  const ty = top + rowH * (n + 0.5) + 9; // T̄ row
  const pS = st === 'smean' ? (s: number) => ramp(t, wAt(0) + s * 0.9 / n, wAt(0) + 0.4 + s * 0.9 / n) : () => (si >= 1 ? 1 : 0);
  const pT = st === 'tmean' ? ramp(t, wAt(0), wAt(0) + 0.8) : si >= 2 ? 1 : 0;
  const pX = st === 'tmean' ? ramp(t, wAt(1), wAt(1) + 0.8) : si >= 2 ? 1 : 0;
  const pDev = st === 'within' ? ramp(t, 1.0, 2.0) : si >= 3 ? 1 : 0; // cells become x − S̄
  const lastCol = pDev > 0.5 ? 'SS_s' : 'S̄';
  const hiT = st === 'treat';
  const title = st === 'question' ? 'Subject by treatment' : st === 'smean' ? 'Subject means' : st === 'tmean' ? 'Treatment and grand means'
    : st === 'within' ? 'Remove each subject mean' : st === 'treat' ? 'Treatment part' : st === 'res' ? 'Residual part' : 'Mean squares and F';
  const head = (s: string, x: number, color: string) => wrap(s, 10).map((l, i, a) => <Txt key={i} x={x} y={headY + (i - a.length + 2) * 16} size={14} anchor="middle" weight={700} color={color}>{l}</Txt>);
  const grid = (<g>
    {heads.map((h, j) => <g key={j}>{head(h, cx(j), P.group[j % 4])}</g>)}
    <g opacity={si >= 1 ? 1 : 0}>{lastCol === 'S̄' ? <Txt x={cx(m)} y={headY + 16} size={15} anchor="middle" weight={700} color={P.green}>S̄</Txt>
      : <Txt x={cx(m)} y={headY + 16} size={15} anchor="middle" weight={700} color={P.green}>{sub('SS', 's')}</Txt>}</g>
    <line x1={gx0} x2={w - 20} y1={top - 4} y2={top - 4} stroke={P.line} strokeWidth={1.5} />
    {rows.map((r, s) => <g key={s}>
      <Txt x={gx0 + 6} y={ry(s)} size={fs} color={P.soft}>{String(c.table.rows[s][0])}</Txt>
      {r.map((x, j) => <g key={j}>
        <Txt x={cx(j)} y={ry(s)} size={fs} anchor="middle" opacity={1 - pDev}>{String(x)}</Txt>
        <Txt x={cx(j)} y={ry(s)} size={fs} anchor="middle" opacity={pDev} color={x - S[s] > 0 ? P.blue : x - S[s] < 0 ? P.red : P.ink}>{(x - S[s] < 0 ? '−' : x - S[s] > 0 ? '+' : '') + f2(Math.abs(x - S[s]))}</Txt>
      </g>)}
      <Txt x={cx(m)} y={ry(s)} size={fs} anchor="middle" color={P.green} weight={600} opacity={pS(s) * (1 - pDev)}>{f2(S[s])}</Txt>
      <Txt x={cx(m)} y={ry(s)} size={fs} anchor="middle" color={P.green} weight={600} opacity={pDev}>{f2(SSs[s])}</Txt>
    </g>)}
    <line x1={gx0} x2={w - 20} y1={top + rowH * n + 2} y2={top + rowH * n + 2} stroke={P.line} strokeWidth={1.5} opacity={pT} />
    {hiT && <rect x={gx0 + labW} y={ty - fs - 2} width={colW * m} height={fs + 10} rx={4} fill={P.hi} opacity={ramp(t, 0.8, 1.6)} />}
    <g opacity={pT}>
      <Txt x={gx0 + 6} y={ty} size={fs} color={P.blue} weight={700}>T̄</Txt>
      {T.map((x, j) => <Txt key={j} x={cx(j)} y={ty} size={fs} anchor="middle" color={P.blue} weight={700}>{f2(x)}</Txt>)}
    </g>
    <Txt x={cx(m)} y={ty} size={fs} anchor="middle" color={P.ink} weight={700} opacity={pX * (1 - pDev)}>{`X̄ ${f2(X)}`}</Txt>
    {si >= 3 && <Txt x={cx(m)} y={ty} size={fs} anchor="middle" color={P.ink} weight={700} opacity={pDev}>{`X̄ ${f2(X)}`}</Txt>}
  </g>);

  // ---- bars under the grid ----
  const bx = 20, bw = w - 40; const W = v.SSwithinSubjects, B = v.SSbetweenSubjects;
  let bars: React.ReactNode = null;
  if (st === 'within') {
    const sc = bw / Math.max(W, B); const pW = ramp(t, wAt(1), wAt(1) + 1), pB = ramp(t, 2.0, 3.0);
    bars = (<g>
      <g opacity={pB * 0.45}><Txt x={bx} y={350} size={14} color={P.soft}>{`SS between subjects ${f6(B)}`}</Txt>
        <rect x={bx} y={357} width={B * sc} height={14} rx={3} fill={P.faint} /></g>
      <Txt x={bx} y={398} size={15} weight={700} color={P.green} opacity={pW}>{`SS within subjects ${f6(W)}`}</Txt>
      <rect x={bx} y={405} width={W * sc * pW} height={20} rx={3} fill={P.green} opacity={0.8} />
    </g>);
  } else if (st === 'treat' || st === 'res') {
    // SS within on its own scale, split into the treatment part and the residual remainder
    const sc = bw / W; const pTr = st === 'treat' ? ramp(t, wAt(0), wAt(0) + 1.2) : 1; const pR = st === 'res' ? ramp(t, wAt(0), wAt(0) + 1) : 0;
    const wT = v.SStreat * sc;
    bars = (<g>
      <Txt x={bx} y={352} size={15} weight={700} color={P.green}>{`SS within subjects ${f6(W)}`}</Txt>
      <rect x={bx} y={360} width={bw} height={24} rx={3} fill="none" stroke={P.green} strokeWidth={2} />
      <rect x={bx} y={360} width={wT * pTr} height={24} rx={3} fill={P.blue} opacity={0.85} />
      <rect x={bx + wT} y={360} width={(bw - wT) * pR} height={24} rx={3} fill={P.red} opacity={0.8} />
      <Txt x={bx} y={406} size={15} weight={700} color={P.blue} opacity={pTr}>{`treat ${f6(v.SStreat)}`}</Txt>
      <Txt x={bx} y={426} size={14} color={P.blue} opacity={pTr}>{`df ${v.DFtreat}`}</Txt>
      <Txt x={bx + bw} y={406} size={15} weight={700} anchor="end" color={P.red} opacity={pR}>{`res ${f6(v.SSres)}`}</Txt>
      <Txt x={bx + bw} y={426} size={14} anchor="end" color={P.red} opacity={pR}>{`df ${v.DFres}`}</Txt>
    </g>);
  } else if (st === 'F') {
    const sc = bw / Math.max(v.MStreat, v.MSres); const p1 = ramp(t, wAt(0), wAt(0) + 1), p2 = ramp(t, wAt(1), wAt(1) + 1), p3 = ramp(t, wAt(2), wAt(2) + 0.8);
    bars = (<g>
      <Txt x={bx} y={346} size={15} weight={700} color={P.blue} opacity={p1}>{sub('MS', 'treat', f6(v.MStreat))}</Txt>
      <rect x={bx} y={354} width={v.MStreat * sc * p1} height={16} rx={3} fill={P.blue} opacity={0.85} />
      <Txt x={bx} y={394} size={15} weight={700} color={P.red} opacity={p2}>{sub('MS', 'res', f6(v.MSres))}</Txt>
      <rect x={bx} y={402} width={Math.max(2, v.MSres * sc) * p2} height={16} rx={3} fill={P.red} opacity={0.8} />
      <Txt x={bx + bw} y={444} size={16} anchor="end" weight={700} opacity={p3}>{`F = ${f6(v.F)}`}</Txt>
    </g>);
  }
  return (<g fontFamily={inter}>
    {st === 'hyp' ? <HypHead h0={Array.from({length: m}, (_, j) => 'μ' + '₁₂₃₄₅₆₇₈₉'[j]).join(' = ')} ha="one or more differ" />
      : <Txt x={20} y={30} size={17} weight={700} color={P.blue}>{title}</Txt>}
    {grid}{bars}
  </g>);
};
export default Viz;
