import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label, Arrow} from '../kit/plot';

// Session 23 pages 25–27 (artificial neuron, threshold and sigmoid activation), page 30 (sum of squared errors) and
// page 33 (the fitted one-hidden-neuron concrete model and its weights). Cases "s23-concrete-neuron" (a practice mix
// pushed through the page 33 weights) and "s23-neuron-sse" (a practice three-input sigmoid neuron).
const sig = (s: number) => 1 / (1 + Math.exp(-s));
const f5 = (v: number) => String(+v.toFixed(5));
const f6 = (v: number) => String(+v.toFixed(6));
const mi = (s: string) => s.replace(/^-/, '−');
// concrete model, page 33
const inputs = [
  {name: 'cement', w: 4.27674, x: 0.6}, {name: 'slag', w: 2.50472, x: 0.2}, {name: 'ash', w: 0.83143, x: 0},
  {name: 'water', w: -1.61849, x: 0.5}, {name: 'superplastic', w: 1.36199, x: 0.3}, {name: 'coarseagg', w: 0.12667, x: 0.5},
  {name: 'fineagg', w: 0.09672, x: 0.5}, {name: 'age', w: 10.72208, x: 0.1},
];
const w0 = -2.32599, v0 = -0.03395, v1 = 0.70671;
const prods = inputs.map(r => r.w * r.x);
const wsum = prods.reduce((a, b) => a + b, 0);            // 3.850243
const sNet = w0 + wsum;                                   // 1.524253
const h = sig(sNet);                                      // 0.82116
const yhat = v0 + v1 * h;                                 // 0.54637
// three-input neuron, practice data
const W3 = [1, -2, 0.5];
const obs = [{x: [1, 0, 1], y: 1}, {x: [0, 1, 1], y: 0}, {x: [1, 1, 0], y: 1}];
const sums = obs.map(o => o.x.reduce((a, v, j) => a + v * W3[j], 0));      // 1.5, −1.5, −1
const preds = sums.map(sig);                                                 // 0.81757, 0.18243, 0.26894
const errs = obs.map((o, k) => o.y - preds[k]);                              // 0.18243, −0.18243, 0.73106
const SS = errs.reduce((a, e) => a + e * e, 0);                              // 0.60100

export const meta = {
  id: 's23-s23neuron', session: 23, method: 's23neuron',
  cases: {'s23-concrete-neuron': [3, 4, 5, 6], 's23-neuron-sse': [7, 8, 9, 10]},
  title: 'Artificial neuron · weighted sum, activation, squared error',
  steps: [
    {title: 'One neuron', seconds: 7, card: [{label: 'artificial neuron', tex: 'y=f\\left(\\sum_{j=1}^{K}w_jx_j\\right)', note: 'x_j input · w_j weight · f activation function'}],
      caption: 'Each input is multiplied by its **weight**, the products are added, and the **activation function** turns the sum into the output.'},
    {title: 'Activation functions', seconds: 7, card: [{label: 'threshold', tex: 'f(x)=\\begin{cases}0 & x<0\\\\ 1 & x\\ge0\\end{cases}'}, {label: 'sigmoid', tex: 'f(x)=\\frac{1}{1+e^{-x}}'}],
      caption: 'The **threshold** jumps from 0 to 1 at a sum of 0. The **sigmoid** rises smoothly and equals 0.5 at a sum of 0.'},
    {title: 'Concrete inputs', seconds: 9, card: [{label: 'weighted sum, 8 inputs', tex: '\\sum_{j=1}^{8}w_jx_j', value: `= ${f6(wsum)}`, color: C.signal, note: 'practice mix, weights of the fitted model'}],
      caption: 'A practice concrete mix goes through the fitted weights. Each input times its weight is added, giving **3.850243**.'},
    {title: 'Add the bias', seconds: 7, card: [{label: 'net input', tex: 's=w_0+\\sum_{j=1}^{8}w_jx_j', value: `${mi(String(w0))} + ${f6(wsum)} = ${f6(sNet)}`, color: C.signal}],
      caption: 'The bias node 1 is a constant input, so its weight **−2.32599** is simply added. The net input is 1.524253.'},
    {title: 'Sigmoid', seconds: 8, card: [{label: 'hidden-neuron output', tex: 'h=\\frac{1}{1+e^{-s}}', value: `h = ${f5(h)}`, color: C.noise}],
      caption: `The net input is positive, so the sigmoid output is above 0.5. The hidden neuron sends **${f5(h)}**.`},
    {title: 'Output node', seconds: 8, card: [{label: 'linear output node', tex: '\\hat y=v_0+v_1h', value: `ŷ = ${f5(yhat)}`, color: C.green, note: `${mi(String(v0))} + ${v1}(${f5(h)}) = ${f5(yhat)}`}],
      caption: `The output node adds its bias to the weighted hidden output, so the predicted normalized strength is **${f5(yhat)}**.`},
    {title: 'Three observations', seconds: 8, card: [{label: 'w1 = 1 · w2 = −2 · w3 = 0.5', tex: 's_i=\\sum_{j=1}^{3}w_jx_{ij}', value: `s = ${sums.map(v => mi(String(v))).join(', ')}`, color: C.signal}],
      caption: 'A practice neuron uses the **same weights** for every observation, so each one gets its own weighted sum.'},
    {title: 'Predictions', seconds: 8, card: [{label: 'sigmoid predictions', tex: '\\hat y_i=\\frac{1}{1+e^{-s_i}}', value: preds.map(f5).join(', '), color: C.noise}],
      caption: 'A positive sum gives a prediction **above 0.5** and a negative sum gives one below 0.5.'},
    {title: 'Errors', seconds: 8, card: [{label: 'error = known − predicted', tex: 'e_i=y_i-\\hat y_i', value: errs.map(e => mi(f5(e))).join(', '), color: C.pink}],
      caption: 'Each error is the gap from the prediction up or down to the **known output**. Observation 3 is off by 0.73106.'},
    {title: 'Sum of squared errors', seconds: 8, card: [{label: 'what training minimizes', tex: 'SS=\\sum_{i=1}^{n}(y_i-\\hat y_i)^2', value: `SS = ${SS.toFixed(3)}`, color: C.signal, note: '0.03328 + 0.03328 + 0.53445'}],
      caption: 'Squaring and adding gives **SS = 0.601**. Backpropagation changes the weights to make this total smaller.'},
  ] as Step[],
};

const Node: React.FC<{x: number; y: number; r: number; text: string; color: string; opacity?: number; size?: number}> = ({x, y, r, text, color, opacity = 1, size = 16}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r} fill={C.bg2} stroke={color} strokeWidth={2.5} />
    <Label x={x} y={y + size / 3} text={text} color={color} anchor="middle" weight={700} size={size} />
  </g>
);

// Sigmoid curve in a box, with optional points.
const Sigmoid: React.FC<{x0: number; x1: number; y0: number; y1: number; lo: number; hi: number; ticks: number[]; p?: number; label?: string}> = ({x0, x1, y0, y1, lo, hi, ticks, p = 1, label = 'sum of input signals'}) => {
  const X = lin(lo, hi, x0, x1), Y = lin(0, 1, y1, y0);
  const n = 80; const pts = Array.from({length: n + 1}, (_, k) => lo + (hi - lo) * k / n * p);
  return (<g>
    <AxisX x={X} y={y1} ticks={ticks} label={label} fmt={v => (v < 0 ? '−' + Math.abs(v) : String(v))} />
    <line x1={x0} x2={x0} y1={y0} y2={y1} stroke={C.muted} strokeWidth={1.5} />
    {[0, 0.5, 1].map(v => <g key={v}><line x1={x0 - 6} x2={x0} y1={Y(v)} y2={Y(v)} stroke={C.muted} /><Label x={x0 - 10} y={Y(v) + 5} text={String(v)} color={C.muted} anchor="end" size={13} /></g>)}
    <line x1={x0} x2={x1} y1={Y(0.5)} y2={Y(0.5)} stroke={C.line} strokeDasharray="4 5" />
    <path d={pts.map((v, k) => `${k ? 'L' : 'M'}${X(v)},${Y(sig(v))}`).join(' ')} fill="none" stroke={C.noise} strokeWidth={3} />
  </g>);
};

const S23Neuron: React.FC = () => (
  <Frame title={meta.title} session={23} steps={meta.steps}>
    {(f, i, tl) => {
      /* step 1: generic neuron */
      if (i === 0) {
        const nx = 400, ny = 200; const ys = [90, 200, 310];
        return (<g>
          {ys.map((yy, j) => { const a = prog(tl, f, 0, 0.4 + j * 0.3); const pk = prog(tl, f, 0, 2.6 + j * 0.3);
            return (<g key={j} opacity={a}>
              <Node x={150} y={yy} r={24} text={`x${j + 1}`} color={C.blue} />
              <Arrow x1={176} y1={yy} x2={nx - 40} y2={ny + (yy - ny) * 0.12} color={C.muted} w={2} />
              <Label x={250} y={lerp(yy, ny, 0.4) - 10} text={`w${j + 1}`} color={C.signal} weight={700} size={16} />
              <Glow cx={lerp(176, nx - 40, pk)} cy={lerp(yy, ny + (yy - ny) * 0.12, pk)} r={6} color={C.signal} opacity={pk > 0 && pk < 1 ? 1 : 0} />
            </g>); })}
          <g opacity={prog(tl, f, 0, 1.6)}>
            <circle cx={nx} cy={ny} r={38} fill={C.bg2} stroke={C.signal} strokeWidth={2.5} />
            <line x1={nx} x2={nx} y1={ny - 38} y2={ny + 38} stroke={C.signal} strokeWidth={1.5} />
            <Label x={nx - 18} y={ny + 8} text="Σ" color={C.signal} anchor="middle" weight={700} size={22} />
            <Label x={nx + 18} y={ny + 8} text="f" color={C.noise} anchor="middle" weight={700} size={22} />
            <Arrow x1={nx + 40} y1={ny} x2={560} y2={ny} color={C.muted} w={2} />
            <Node x={590} y={ny} r={26} text="y" color={C.green} />
            <Label x={nx - 18} y={ny + 66} text="add" color={C.signal} anchor="middle" size={14} />
            <Label x={nx + 22} y={ny + 66} text="activate" color={C.noise} anchor="start" size={14} />
          </g>
        </g>);
      }
      /* step 2: threshold and sigmoid */
      if (i === 1) {
        const p = prog(tl, f, 1, 2); const X1 = lin(-10, 10, 60, 340), Y = lin(0, 1, 340, 80);
        return (<g>
          <Label x={200} y={40} text="threshold" color={C.pink} anchor="middle" weight={700} size={16} />
          <AxisX x={X1} y={340} ticks={[-10, -5, 0, 5, 10]} label="sum of input signals" fmt={v => (v < 0 ? '−' + Math.abs(v) : String(v))} />
          <line x1={60} x2={60} y1={80} y2={340} stroke={C.muted} strokeWidth={1.5} />
          {[0, 0.5, 1].map(v => <Label key={v} x={52} y={Y(v) + 5} text={String(v)} color={C.muted} anchor="end" size={13} />)}
          <path d={`M${X1(-10)},${Y(0)} L${X1(0)},${Y(0)} L${X1(0)},${Y(1)} L${X1(10)},${Y(1)}`} fill="none" stroke={C.pink} strokeWidth={3} strokeDasharray="1200" strokeDashoffset={1200 * (1 - p)} />
          <Label x={530} y={40} text="sigmoid" color={C.noise} anchor="middle" weight={700} size={16} />
          <Sigmoid x0={410} x1={700} y0={80} y1={340} lo={-10} hi={10} ticks={[-10, -5, 0, 5, 10]} p={prog(tl, f, 1, 3.4)} />
          <Glow cx={lin(-10, 10, 410, 700)(0)} cy={Y(0.5)} r={7} color={C.signal} opacity={prog(tl, f, 1, 4.2)} />
          <Label x={lin(-10, 10, 410, 700)(0) + 12} y={Y(0.5) + 22} text="0.5 at 0" color={C.signal} size={14} weight={700} opacity={prog(tl, f, 1, 4.2)} />
        </g>);
      }
      /* steps 3–6: concrete model */
      if (i >= 2 && i <= 5) {
        const sx = 470, sy = 200, fx = 580, ox = 690; const rowY = (j: number) => 46 + j * 42;
        const tableA = i <= 3 ? 1 : 1 - prog(tl, f, 4, 0.8);
        const pB = i === 3 ? prog(tl, f, 3, 1.4) : i > 3 ? 1 : 0;
        const pH = i === 4 ? prog(tl, f, 4, 2.6) : i > 4 ? 1 : 0;
        const pO = i === 5 ? prog(tl, f, 5, 2.2) : 0;
        const sumA = i === 2 ? prog(tl, f, 2, 5.4) : 1;
        return (<g>
          {tableA > 0 && <g opacity={tableA}>
            <Label x={160} y={18} text="x" color={C.muted} anchor="end" size={14} />
            <Label x={250} y={18} text="w" color={C.muted} anchor="end" size={14} />
            <Label x={345} y={18} text="w·x" color={C.muted} anchor="end" size={14} />
            {inputs.map((r, j) => { const a = i === 2 ? prog(tl, f, 2, 0.4 + j * 0.15) : 1; const pp = i === 2 ? prog(tl, f, 2, 1.4 + j * 0.45) : 1; const yy = rowY(j);
              return (<g key={j} opacity={a}>
                <Label x={16} y={yy + 5} text={r.name} color={C.ink} size={14} />
                <Label x={160} y={yy + 5} text={String(r.x)} color={C.blue} anchor="end" size={14} weight={700} />
                <Label x={250} y={yy + 5} text={mi(String(r.w))} color={C.muted} anchor="end" size={14} />
                <Label x={345} y={yy + 5} text={mi(f6(prods[j]))} color={C.signal} anchor="end" size={14} weight={700} opacity={pp} />
                <line x1={355} y1={yy} x2={sx - 30} y2={sy + (yy - sy) * 0.15} stroke={C.line} strokeWidth={1.5} />
                <Glow cx={lerp(355, sx - 30, sumA > 0 ? Math.min(1, pp) : 0)} cy={lerp(yy, sy + (yy - sy) * 0.15, Math.min(1, pp))} r={4} color={C.signal} opacity={pp > 0.05 && pp < 0.97 ? 1 : 0} />
              </g>); })}
          </g>}
          {i >= 4 && (() => { const X = lin(-6, 6, 70, 400), Y = lin(0, 1, 340, 70); const a = prog(tl, f, 4, 0.8);
            return (<g opacity={i === 4 ? a : 1}>
              <Sigmoid x0={70} x1={400} y0={70} y1={340} lo={-6} hi={6} ticks={[-6, -4, -2, 0, 2, 4, 6]} label="net input s" />
              <line x1={X(sNet)} x2={X(sNet)} y1={340} y2={lerp(340, Y(h), pH)} stroke={C.signal} strokeWidth={2} strokeDasharray="5 4" />
              {pH > 0.98 && <line x1={X(sNet)} x2={70} y1={Y(h)} y2={Y(h)} stroke={C.noise} strokeWidth={2} strokeDasharray="5 4" />}
              <Glow cx={X(sNet)} cy={lerp(340, Y(h), pH)} r={7} color={C.signal} />
              <Label x={X(sNet) + 10} y={322} text={`s = ${f6(sNet)}`} color={C.signal} size={14} weight={700} />
              <Label x={X(sNet) - 12} y={Y(h) - 12} text={`h = ${f5(h)}`} color={C.noise} anchor="end" size={15} weight={700} opacity={pH > 0.98 ? 1 : 0} />
            </g>); })()}
          {/* network on the right */}
          <g opacity={sumA}>
            <circle cx={sx} cy={sy} r={30} fill={C.bg2} stroke={C.signal} strokeWidth={2.5} />
            <Label x={sx} y={sy + 8} text="Σ" color={C.signal} anchor="middle" weight={700} size={22} />
            <Label x={sx} y={sy + 56} text={pB > 0.5 ? `s = ${f6(sNet)}` : f6(wsum)} color={C.signal} anchor="middle" weight={700} size={15} />
          </g>
          <g opacity={i >= 3 ? 1 : 0.25}>
            <Node x={sx} y={56} r={18} text="1" color={C.blue} />
            <line x1={sx} x2={sx} y1={74} y2={lerp(74, sy - 32, i === 3 ? pB : 1)} stroke={C.blue} strokeWidth={2} />
            <Label x={sx + 10} y={124} text={mi(String(w0))} color={C.blue} size={14} weight={700} />
          </g>
          <g opacity={i >= 4 ? 1 : 0.25}>
            <Arrow x1={sx + 32} y1={sy} x2={fx - 24} y2={sy} color={C.muted} w={2} />
            <Node x={fx} y={sy} r={22} text="f" color={C.noise} />
            <Label x={fx} y={sy + 56} text={i >= 4 ? `h ${f5(h)}` : 'h'} color={C.noise} anchor="middle" weight={700} size={15} opacity={i === 4 ? (pH > 0.98 ? 1 : 0.3) : 1} />
          </g>
          <g opacity={i >= 5 ? 1 : 0.25}>
            <Arrow x1={fx + 24} y1={sy} x2={ox - 22} y2={sy} color={C.muted} w={2} />
            <Label x={(fx + ox) / 2} y={sy - 12} text={String(v1)} color={C.green} anchor="middle" size={14} weight={700} />
            <Node x={ox} y={sy} r={20} text="ŷ" color={C.green} />
            <Node x={ox} y={56} r={18} text="1" color={C.blue} />
            <line x1={ox} x2={ox} y1={74} y2={sy - 22} stroke={C.blue} strokeWidth={2} />
            <Label x={ox - 8} y={124} text={mi(String(v0))} color={C.blue} anchor="end" size={14} weight={700} />
            <Label x={ox} y={sy + 56} text={f5(yhat)} color={C.green} anchor="middle" weight={700} size={16} opacity={pO} />
            <Label x={ox} y={sy + 80} text="strength (0 to 1)" color={C.muted} anchor="middle" size={13} opacity={pO} />
          </g>
        </g>);
      }
      /* steps 7–10: three observations, sigmoid predictions, errors, SS */
      const X = lin(-3, 3, 470, 740), Y = lin(0, 1, 320, 50);
      const pP = i === 7 ? prog(tl, f, 7, 2.4) : i > 7 ? 1 : 0, pE = i === 8 ? prog(tl, f, 8, 2.4) : i > 8 ? 1 : 0, pS = i === 9 ? prog(tl, f, 9, 2.4) : 0;
      const cols = [C.blue, C.pink, C.purple];
      const colX = {i: 18, x: 46, y: 168, s: 236, p: 318, e: 408};
      return (<g>
        {/* small neuron */}
        {[0, 1, 2].map(j => (<g key={j}>
          <Node x={40} y={30 + j * 52} r={17} text={`x${j + 1}`} color={C.blue} size={14} />
          <line x1={58} y1={30 + j * 52} x2={190} y2={82} stroke={C.line} strokeWidth={1.5} />
          <Label x={lerp(58, 190, 0.3)} y={lerp(30 + j * 52, 82, 0.3) - 7} text={mi(String(W3[j]))} color={C.signal} size={14} weight={700} anchor="middle" />
        </g>))}
        <circle cx={214} cy={82} r={24} fill={C.bg2} stroke={C.signal} strokeWidth={2} />
        <line x1={214} x2={214} y1={58} y2={106} stroke={C.signal} strokeWidth={1.5} />
        <Label x={203} y={88} text="Σ" color={C.signal} anchor="middle" weight={700} size={16} />
        <Label x={226} y={88} text="f" color={C.noise} anchor="middle" weight={700} size={16} />
        <Arrow x1={240} y1={82} x2={300} y2={82} color={C.muted} w={2} />
        <Label x={310} y={88} text="ŷ" color={C.noise} weight={700} size={17} />
        {/* table */}
        <g>
          {(['i', 'x', 'y', 's', 'ŷ', 'e'] as const).map((hd, k) => { const key = (['i', 'x', 'y', 's', 'p', 'e'] as const)[k]; const show = k < 3 || (k === 3) || (k === 4 && i >= 7) || (k === 5 && i >= 8);
            const xx = colX[key]; const an = key === 'x' || key === 'i' ? 'start' : 'end'; return show ? <Label key={hd} x={xx} y={200} text={hd} color={C.muted} anchor={an} size={14} /> : null; })}
          {obs.map((o, k) => { const yy = 236 + k * 40; const a6 = i === 6 ? prog(tl, f, 6, 0.8 + k * 0.7) : 1;
            return (<g key={k}>
              <Label x={colX.i} y={yy} text={String(k + 1)} color={cols[k]} weight={700} size={15} />
              <Label x={colX.x} y={yy} text={`(${o.x.join(', ')})`} color={C.ink} size={14} />
              <Label x={colX.y} y={yy} text={String(o.y)} color={C.green} anchor="end" weight={700} size={15} />
              <Label x={colX.s} y={yy} text={mi(String(sums[k]))} color={C.signal} anchor="end" weight={700} size={15} opacity={a6} />
              {i >= 7 && <Label x={colX.p} y={yy} text={f5(preds[k])} color={C.noise} anchor="end" weight={700} size={14} opacity={i === 7 ? prog(tl, f, 7, 1 + k * 0.6) : 1} />}
              {i >= 8 && <Label x={colX.e} y={yy} text={mi(f5(errs[k]))} color={C.pink} anchor="end" weight={700} size={14} opacity={i === 8 ? prog(tl, f, 8, 1 + k * 0.6) : 1} />}
            </g>); })}
        </g>
        {/* sigmoid with the three observations */}
        <Sigmoid x0={470} x1={740} y0={50} y1={320} lo={-3} hi={3} ticks={[-3, -2, -1, 0, 1, 2, 3]} label="weighted sum s" />
        {sums.map((s, k) => { const py = lerp(320, Y(preds[k]), pP); const known = Y(obs[k].y);
          return (<g key={k}>
            <Glow cx={X(s)} cy={py} r={7} color={cols[k]} opacity={i === 6 ? prog(tl, f, 6, 0.8 + k * 0.7) : 1} />
            {pE > 0 && <g>
              <line x1={X(s)} x2={X(s)} y1={Y(preds[k])} y2={lerp(Y(preds[k]), known, pE)} stroke={C.pink} strokeWidth={3} />
              <circle cx={X(s)} cy={known} r={6} fill="none" stroke={C.green} strokeWidth={2} opacity={pE} />
            </g>}
            {i >= 8 && <Label x={X(s) + (k === 1 ? 10 : -10)} y={(Y(preds[k]) + known) / 2 + 5} text={`e${k + 1}`} color={C.pink} anchor={k === 1 ? 'start' : 'end'} weight={700} size={14} opacity={pE} />}
            <Label x={X(s)} y={i >= 7 ? (k === 1 ? Y(preds[k]) + 24 : Y(preds[k]) - 14) : 300} text={String(k + 1)} color={cols[k]} anchor="middle" weight={700} size={14} opacity={i === 6 ? prog(tl, f, 6, 0.8 + k * 0.7) : (i >= 8 ? 0 : 1)} />
          </g>); })}
        {/* squared errors as a stacked bar */}
        {i === 9 && (() => { const bx = lin(0, 0.7, 18, 400); let acc = 0;
          return (<g>
            {errs.map((e, k) => { const a = prog(tl, f, 9, 0.8 + k * 0.7); const x0 = bx(acc); acc += e * e; const wd = (bx(acc) - x0) * a;
              return <rect key={k} x={x0} y={372} width={wd} height={26} fill={cols[k]} opacity={0.85} stroke={C.bg} strokeWidth={1} />; })}
            <Label x={bx(SS) + 10} y={391} text={`SS = ${SS.toFixed(3)}`} color={C.signal} weight={700} size={16} opacity={pS} />
            <Label x={18} y={364} text="e²" color={C.muted} size={14} />
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S23Neuron;
