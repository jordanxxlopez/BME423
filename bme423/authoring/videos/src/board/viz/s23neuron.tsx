// Artificial neuron (Session 23). Two layouts chosen from the case values:
// - weights given per named input (one-hidden-neuron model): each input times its weight flows into the sum, the bias joins,
//   the net input is pushed through the sigmoid, then the linear output node;
// - weights given as a list with several observations: each weighted sum sits on the sigmoid, the error is the gap to the
//   known output, and the squared errors stack into SS.
import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {workAt} from '../timing';
import {Axis, AxisY, Dot, Txt, lin, ramp} from './_kit';
import {f5, mi, sig} from './_s23';

const f6 = (v: number) => String(+v.toFixed(6));
const sigPath = (X: (v: number) => number, Y: (v: number) => number, lo: number, hi: number) =>
  Array.from({length: 61}, (_, i) => lo + (hi - lo) * i / 60).map((s, i) => `${i ? 'L' : 'M'}${X(s)},${Y(sig(s))}`).join(' ');

const S23Neuron: VizC = ({c, k, t}) => {
  const v = c.values || {}; const steps = c.steps; const n = steps.length;
  const at0 = (s: number, j = 0) => workAt(steps[s].general.length, j);
  const first = (re: RegExp) => { const i = steps.findIndex(s => re.test(s.title)); return i < 0 ? Infinity : i; };
  const prog = (idx: number, j = 0, dt = 0.9) => (k > idx ? 1 : k === idx ? ramp(t, at0(idx, j), at0(idx, j) + dt) : 0);
  const fmtT = (v: number) => (v < 0 ? '−' + Math.abs(v) : String(v));

  /* one hidden neuron with named inputs */
  if (!Array.isArray(v.weights)) {
    const names = Object.keys(v.weights); const ws = names.map(nm => Number(v.weights[nm])); const xs = names.map(nm => Number(v.inputs[nm]));
    const prods = ws.map((w, j) => w * xs[j]); const wsum = prods.reduce((a, b) => a + b, 0); const w0 = Number(v.biasHidden);
    const s = w0 + wsum; const h = sig(s); const v0 = Number(v.biasOutput), v1 = Number(v.hiddenToOutput); const yh = v0 + v1 * h;
    const sumIdx = first(/weighted sum/i), biasIdx = first(/bias/i), sigIdx = first(/sigmoid|activation/i), outIdx = first(/output/i);
    const half = Math.ceil(names.length / 2); const nL = steps[sumIdx]?.work.length || 1;
    const pRow = (j: number) => (k > sumIdx ? 1 : k === sumIdx ? ramp(t, at0(sumIdx, Math.min(nL - 1, j < half ? 0 : 1)) + 0.15 * (j % half), at0(sumIdx, Math.min(nL - 1, j < half ? 0 : 1)) + 0.15 * (j % half) + 0.6) : 0);
    const pSum = prog(sumIdx, nL - 1), pB = prog(biasIdx), pH = prog(sigIdx, 0, 1.2), pO = prog(outIdx);
    const rowY = (j: number) => 52 + j * 24; const sx = 352, sy = rowY(names.length / 2) - 6;
    const cx = {x: 132, w: 204, p: 288};
    const all = [...names.map((nm, j) => ({nm, x: xs[j], w: ws[j], p: prods[j], a: pRow(j), show: 1})), {nm: 'bias', x: 1, w: w0, p: w0, a: pB, show: k >= biasIdx || k >= n ? 1 : 0}];
    const X = lin(-6, 6, 60, 232), Y = lin(0, 1, 428, 330);
    return (<g fontFamily={inter}>
      <Txt x={20} y={28} size={17} weight={700} color={P.blue}>Hidden neuron</Txt>
      <Txt x={cx.x} y={44} size={13} anchor="end" color={P.soft}>x</Txt>
      <Txt x={cx.w} y={44} size={13} anchor="end" color={P.soft}>w</Txt>
      <Txt x={cx.p} y={44} size={13} anchor="end" color={P.soft}>w·x</Txt>
      {all.map((r, j) => { const y = rowY(j) + 14 + (j === names.length ? 6 : 0); if (!r.show) return null; const bias = j === names.length;
        return (<g key={j}>
          {bias && <line x1={20} x2={300} y1={y - 16} y2={y - 16} stroke={P.line} />}
          <Txt x={20} y={y} size={13} color={bias ? P.blue : P.ink} weight={bias ? 700 : 400}>{r.nm}</Txt>
          <Txt x={cx.x} y={y} size={13} anchor="end" color={P.soft}>{String(r.x)}</Txt>
          <Txt x={cx.w} y={y} size={13} anchor="end" color={P.soft}>{mi(String(r.w))}</Txt>
          <Txt x={cx.p} y={y} size={13} anchor="end" weight={700} color={bias ? P.blue : P.ink} opacity={r.a}>{mi(f6(r.p))}</Txt>
          <line x1={296} y1={y - 4} x2={296 + (sx - 22 - 296) * r.a} y2={y - 4 + (sy - (y - 4)) * r.a} stroke={bias ? P.blue : P.faint} strokeWidth={1.3} opacity={r.a} />
        </g>); })}
      <circle cx={sx} cy={sy} r={20} fill="#fff" stroke={P.ink} strokeWidth={2} />
      <Txt x={sx} y={sy + 6} size={18} weight={700} anchor="middle">Σ</Txt>
      {pSum > 0 && <Txt x={sx} y={sy + 40} size={14} weight={700} anchor="middle" color={pB > 0.5 ? P.blue : P.ink} opacity={pSum}>{pB > 0.5 ? `s ${f6(s)}` : f6(wsum)}</Txt>}
      {/* sigmoid and output */}
      {(pH > 0 || k >= n) && <g>
        <Axis X={X} y={428} ticks={[-6, -3, 0, 3, 6]} fmt={fmtT} />
        <AxisY Y={Y} x={60} ticks={[0, 0.5, 1]} />
        <path d={sigPath(X, Y, -6, 6)} fill="none" stroke={P.blue} strokeWidth={2.5} />
        <line x1={X(s)} x2={X(s)} y1={428} y2={428 + (Y(h) - 428) * pH} stroke={P.red} strokeWidth={2} strokeDasharray="4 4" />
        {pH > 0.98 && <line x1={X(s)} x2={60} y1={Y(h)} y2={Y(h)} stroke={P.green} strokeWidth={2} strokeDasharray="4 4" />}
        <Dot x={X(s)} y={428 + (Y(h) - 428) * pH} r={5} color={P.red} />
        <Txt x={76} y={Y(h) - 8} size={14} weight={700} color={P.green} opacity={pH > 0.98 ? 1 : 0}>{`h ${f5(h)}`}</Txt>
      </g>}
      {(pO > 0 || k >= n) && <g opacity={k >= n ? 1 : pO}>
        <Txt x={260} y={346} size={14} color={P.soft}>{`v1 ${v1}`}</Txt>
        <Txt x={260} y={370} size={14} color={P.soft}>{`v0 ${mi(String(v0))}`}</Txt>
        <rect x={252} y={384} width={136} height={30} rx={5} fill={P.hi} />
        <Txt x={260} y={405} size={16} weight={700} color={P.ink}>{`ŷ ${f5(yh)}`}</Txt>
      </g>}
    </g>);
  }

  /* one neuron, several observations: predictions on the sigmoid, errors, SS */
  const W: number[] = v.weights; const rows: any[][] = c.table.rows; const nObs = rows.length;
  const xs = rows.map(r => W.map((_, j) => Number(r[1 + j]))); const ys = rows.map(r => Number(r[1 + W.length]));
  const sums = xs.map(x => x.reduce((a, b, j) => a + b * W[j], 0)); const preds = sums.map(sig); const errs = ys.map((y, i) => y - preds[i]);
  const SS = errs.reduce((a, e) => a + e * e, 0);
  const sumIdx = first(/weighted sum/i), predIdx = first(/sigmoid|prediction/i), errIdx = first(/^errors?$/i), ssIdx = first(/squared/i);
  const lineP = (idx: number, i: number) => { if (k > idx || k >= n) return 1; if (k !== idx) return 0; const L = steps[idx].work.length; return ramp(t, at0(idx, Math.min(i, L - 1)), at0(idx, Math.min(i, L - 1)) + 0.8); };
  const cols = [P.group[0], P.group[1], P.group[2], P.green];
  const lo = Math.min(-3, Math.floor(Math.min(...sums))), hi = Math.max(3, Math.ceil(Math.max(...sums)));
  const X = lin(lo, hi, 66, 370), Y = lin(0, 1, 330, 170);
  const nodeY = (j: number) => 36 + j * (100 / Math.max(1, W.length - 1));
  return (<g fontFamily={inter}>
    <Txt x={20} y={24} size={17} weight={700} color={P.blue}>Neuron</Txt>
    {W.map((w, j) => (<g key={j}>
      <circle cx={130} cy={nodeY(j)} r={13} fill="#fff" stroke={P.blue} strokeWidth={2} />
      <Txt x={130} y={nodeY(j) + 5} size={13} anchor="middle" weight={700} color={P.blue}>{`x${j + 1}`}</Txt>
      <line x1={143} y1={nodeY(j)} x2={232} y2={86} stroke={P.faint} strokeWidth={1.5} />
      <Txt x={172} y={nodeY(j) + (86 - nodeY(j)) * 0.33 - 6} size={14} weight={700} anchor="middle" color={P.red}>{mi(String(w))}</Txt>
    </g>))}
    <circle cx={254} cy={86} r={22} fill="#fff" stroke={P.ink} strokeWidth={2} />
    <line x1={254} x2={254} y1={64} y2={108} stroke={P.ink} strokeWidth={1.2} />
    <Txt x={244} y={92} size={15} weight={700} anchor="middle">Σ</Txt>
    <Txt x={265} y={92} size={15} weight={700} anchor="middle" color={P.blue}>f</Txt>
    <line x1={276} y1={86} x2={330} y2={86} stroke={P.ink} strokeWidth={1.5} />
    <Txt x={338} y={92} size={16} weight={700}>ŷ</Txt>
    <Axis X={X} y={330} ticks={Array.from({length: hi - lo + 1}, (_, i) => lo + i)} fmt={fmtT} label="weighted sum s" />
    <AxisY Y={Y} x={66} ticks={[0, 0.5, 1]} />
    <path d={sigPath(X, Y, lo, hi)} fill="none" stroke={P.blue} strokeWidth={2.5} opacity={k >= predIdx ? 1 : 0.35} />
    {sums.map((s, i) => { const pS = lineP(sumIdx, i); const pP = lineP(predIdx, i); const pE = lineP(errIdx, i); if (pS <= 0) return null;
      const yP = 330 + (Y(preds[i]) - 330) * pP; const yK = Y(ys[i]);
      return (<g key={i}>
        {pE > 0 && <circle cx={X(s)} cy={yK} r={6} fill="#fff" stroke={P.green} strokeWidth={2} opacity={pE} />}
        {pE > 0 && <line x1={X(s)} x2={X(s)} y1={Y(preds[i])} y2={Y(preds[i]) + (yK - Y(preds[i])) * pE} stroke={P.red} strokeWidth={3} />}
        <Dot x={X(s)} y={yP} r={6} color={cols[i % 4]} opacity={pS} />
        <Txt x={X(s) + (i % 2 ? -9 : 9)} y={pE > 0 ? (Y(preds[i]) + yK) / 2 + 5 : yP - 10} size={14} weight={700} anchor={i % 2 ? 'end' : 'start'} color={pE > 0 ? P.red : cols[i % 4]}>{pE > 0 ? `e${i + 1}` : String(i + 1)}</Txt>
      </g>); })}
    {/* squared errors stacked into SS */}
    {(k >= ssIdx) && (() => { const bx = lin(0, Math.max(0.7, SS * 1.15), 20, 290); let acc = 0; const pB = k > ssIdx || k >= n ? 1 : ramp(t, at0(ssIdx, 0), at0(ssIdx, 0) + 1.2);
      const pT = k > ssIdx || k >= n ? 1 : ramp(t, at0(ssIdx, 1), at0(ssIdx, 1) + 0.8);
      return (<g>
        <Txt x={20} y={386} size={13} color={P.soft}>squared errors</Txt>
        {errs.map((e, i) => { const x0 = bx(acc); acc += e * e; return <rect key={i} x={x0} y={398} width={(bx(acc) - x0) * pB} height={24} fill={cols[i % 4]} opacity={0.75} stroke="#fff" />; })}
        <Txt x={bx(SS) + 8} y={416} size={15} weight={700} opacity={pT}>{`SS ${SS.toFixed(3)}`}</Txt>
      </g>); })()}
  </g>);
};

export default S23Neuron;
