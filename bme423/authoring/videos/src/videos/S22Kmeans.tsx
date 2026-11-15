import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 22 pages 22–26 (case "s22-medicines-kmeans") and page 27 (case "s22-exercise-sbp-crp").
type P2 = number[];
const dist = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const mean = (ps: P2[]) => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
const assign = (xs: P2[], cs: P2[]) => xs.map(p => (dist(p, cs[0]) <= dist(p, cs[1]) ? 0 : 1));
const update = (xs: P2[], lab: number[]) => [0, 1].map(j => mean(xs.filter((_, i) => lab[i] === j)));

// medicines (MW, pH)
const X: P2[] = [[1, 1], [2, 1], [4, 3], [5, 4]];
const C0: P2[] = [[1, 1], [2, 1]];
const L1 = assign(X, C0);            // 1,2,2,2 (0-based 0,1,1,1)
const C1 = update(X, L1);            // (1,1), (3.66667, 2.66667)
const L2 = assign(X, C1);            // 1,1,2,2
const C2 = update(X, L2);            // (1.5,1), (4.5,3.5)
const L3 = assign(X, C2);            // unchanged
// exercise (SBP, CRP), scaled
const E: P2[] = [[1, 3], [7, 2], [8, 7]];
const E0: P2[] = [[2, 2], [5, 5]];
const EL = assign(E, E0);            // 1,2,2
const E1 = update(E, EL);            // (1,3), (7.5,4.5)

const f2 = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2));
const f3 = (v: number) => String(+v.toFixed(3));
const pt = (p: P2) => `(${f3(p[0])}, ${f3(p[1])})`;

export const meta = {
  id: 's22-s22kmeans', session: 22, method: 's22kmeans',
  cases: {'s22-medicines-kmeans': [1, 2, 3, 4, 5, 6, 7], 's22-exercise-sbp-crp': [8, 8, 9, 9, 10]},
  title: 'k-means clustering · assign, update, repeat',
  steps: [
    {title: 'Set up', seconds: 6, card: [{label: 'k = 2 · starting centroids', tex: 'c_1=(1,1),\\ c_2=(2,1)', note: 'medicines (MW, pH)\n(1, 1) · (2, 1) · (4, 3) · (5, 4)'}],
      caption: 'Four medicines have MW and pH but no labels. Choose **k = 2** and start the centroids at medicines 1 and 2.'},
    {title: 'Iteration 1 distances', seconds: 8, card: [{label: 'distance to each centroid', tex: 'd_{ij}=\\lVert x_i-c_j\\rVert_2', note: `d31 = √(3² + 2²) = ${f3(dist(X[2], C0[0]))}\nd32 = √(2² + 2²) = ${f3(dist(X[2], C0[1]))}\nd41 = √(4² + 3²) = ${f3(dist(X[3], C0[0]))}\nd42 = √(3² + 3²) = ${f3(dist(X[3], C0[1]))}`}],
      caption: 'Measure the Euclidean distance from **every medicine** to **both centroids**. The table keeps all eight.'},
    {title: 'Assign labels', seconds: 7, card: [{label: 'nearest centroid', tex: 'y_i=\\arg\\min_j\\lVert x_i-c_j\\rVert_2', value: `y = (${L1.map(v => v + 1).join(', ')})`, color: C.signal}],
      caption: 'Each medicine joins its **nearest centroid**. Only medicine 1 is closer to c1, so the labels are 1, 2, 2, 2.'},
    {title: 'Move centroids', seconds: 7, card: [{label: 'centroid = mean of members', tex: 'c_j=\\frac{1}{n_j}\\sum_{i:y_i=j}x_i', value: `c2 = ${pt(C1[1])}`, color: GROUP[1], note: 'c2 = ((2+4+5)/3, (1+3+4)/3)\nc1 = (1, 1), only medicine 1'}],
      caption: 'Each centroid moves to the **mean** of its members. Two of c2\'s three members are high, so c2 slides up.'},
    {title: 'Iteration 2', seconds: 8, card: [{label: 'iteration 2 · medicine 2', value: `d21 = 1 < d22 = ${f3(dist(X[1], C1[1]))}`, color: GROUP[0], note: `y = (${L2.map(v => v + 1).join(', ')}) · medicine 2 switches to cluster 1`}],
      caption: `Recompute every distance. Medicine 2 is now closer to c1, 1 versus ${f3(dist(X[1], C1[1]))}, so its **label switches** to 1.`},
    {title: 'New centroids', seconds: 7, card: [{label: 'new centroids', value: `c1 = ${pt(C2[0])} · c2 = ${pt(C2[1])}`, color: C.signal, note: 'c1 = ((1+2)/2, (1+1)/2)\nc2 = ((4+5)/2, (3+4)/2)'}],
      caption: 'A label changed, so the centroids move again. Each one lands **midway** between its two members.'},
    {title: 'Converged', seconds: 6, card: [{label: 'iteration 3 check', value: `y = (${L3.map(v => v + 1).join(', ')}) → stop`, color: C.green, note: `d21 = ${f3(dist(X[1], C2[0]))} · d22 = ${f3(dist(X[1], C2[1]))}, no label changes`}],
      caption: 'A third pass gives the same labels, so the centroids stop moving and **k-means stops**.'},
    {title: 'Exercise distances', seconds: 8, card: [
      {label: 'patient 1 (1, 3)', note: `d11 = √((1−2)² + (3−2)²) = √2 = ${f3(dist(E[0], E0[0]))}\nd12 = √((1−5)² + (3−5)²) = √20 = ${f3(dist(E[0], E0[1]))}`},
      {label: 'patient 2 (7, 2)', note: `d21 = √((7−2)² + (2−2)²) = √25 = ${f3(dist(E[1], E0[0]))}\nd22 = √((7−5)² + (2−5)²) = √13 = ${f3(dist(E[1], E0[1]))}`}],
      caption: 'Three patients have scaled SBP and CRP. One iteration starts from **C1 (2, 2)** and **C2 (5, 5)**.'},
    {title: 'Exercise labels', seconds: 8, card: [
      {label: 'patient 3 (8, 7)', note: `d31 = √((8−2)² + (7−2)²) = √61 = ${f3(dist(E[2], E0[0]))}\nd32 = √((8−5)² + (7−5)²) = √13 = ${f3(dist(E[2], E0[1]))}`},
      {label: 'labels', value: `y = (${EL.map(v => v + 1).join(', ')})`, color: C.signal}],
      caption: 'Patient 1 is closer to C1. Patients 2 and 3 are both 3.606 from C2, so the labels are **1, 2, 2**.'},
    {title: 'Exercise centroids', seconds: 7, card: [{label: 'new centroids', value: `C1 = ${pt(E1[0])} · C2 = ${pt(E1[1])}`, color: C.signal, note: 'C1 = patient 1 alone\nC2 = ((7+8)/2, (2+7)/2)'}],
      caption: 'After one iteration C1 sits on patient 1 at **(1, 3)** and C2 moves to the midpoint **(7.5, 4.5)**.'},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; label?: string}> = ({y, x, ticks, label}) => (
  <g fontFamily={mono}>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x - 6} x2={x} y1={y(t)} y2={y(t)} stroke={C.muted} /><text x={x - 10} y={y(t) + 5} fill={C.muted} fontSize={14} textAnchor="end">{t}</text></g>)}
    {label && <text transform={`translate(${x - 38},${(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2}) rotate(-90)`} fill={C.muted} fontSize={15} textAnchor="middle">{label}</text>}
  </g>
);
const Star: React.FC<{cx: number; cy: number; r?: number; color: string; opacity?: number}> = ({cx, cy, r = 13, color, opacity = 1}) => {
  const pts = Array.from({length: 10}, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5; const rr = k % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`; }).join(' ');
  return <g opacity={opacity}><circle cx={cx} cy={cy} r={r * 1.5} fill={color} opacity={0.15} /><polygon points={pts} fill={color} stroke={C.white} strokeWidth={1.5} /></g>;
};
const lerp2 = (a: P2, b: P2, t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// Distance table at the right of the stage.
const Table: React.FC<{x0: number; title: string; rows: {name: string; d: number[]; y?: number; flash?: boolean}[]; cnames: string[]; opacity?: number}> = ({x0, title, rows, cnames, opacity = 1}) => (
  <g opacity={opacity}>
    <Label x={x0 + 120} y={22} text={title} color={C.muted} anchor="middle" size={14} />
    {['', ...cnames, 'y'].map((h, k) => <Label key={k} x={x0 + [12, 92, 170, 232][k]} y={58} text={h} color={k === 1 ? GROUP[0] : k === 2 ? GROUP[1] : C.muted} anchor="middle" weight={700} />)}
    <line x1={x0} x2={x0 + 252} y1={68} y2={68} stroke={C.line} strokeWidth={1.5} />
    {rows.map((r, k) => { const yy = 100 + k * 42; const min = r.d[0] <= r.d[1] ? 0 : 1; return (<g key={k}>
      {r.flash && <rect x={x0 - 4} y={yy - 24} width={262} height={34} rx={8} fill="none" stroke={C.signal} strokeWidth={2} />}
      <Label x={x0 + 12} y={yy} text={r.name} color={C.ink} anchor="middle" weight={700} />
      {r.d.map((v, j) => <Label key={j} x={x0 + [92, 170][j]} y={yy} text={f2(v)} color={j === min ? GROUP[j] : C.muted} anchor="middle" weight={j === min ? 700 : 400} size={j === min ? 17 : 15} />)}
      {r.y !== undefined && <Label x={x0 + 232} y={yy} text={String(r.y + 1)} color={GROUP[r.y]} anchor="middle" weight={700} size={18} />}
    </g>); })}
  </g>
);

const S22Kmeans: React.FC = () => (
  <Frame title={meta.title} session={22} steps={meta.steps}>
    {(f, i, tl) => {
      if (i <= 6) {
        const x = lin(0, 6, 70, 470), y = lin(0, 5, 380, 380 - 5 * 400 / 6); const P = (a: P2) => [x(a[0]), y(a[1])];
        // centroid positions over time
        const c1 = i < 5 ? C0[0] : lerp2(C0[0], C2[0], prog(tl, f, 5, 1.6));
        const c2 = i < 3 ? C0[1] : i < 5 ? lerp2(C0[1], C1[1], prog(tl, f, 3, 1.8)) : lerp2(C1[1], C2[1], prog(tl, f, 5, 1.6));
        const cs = [c1, c2];
        // labels shown on points
        const lab = (k: number): number | undefined => (i < 2 ? undefined : i < 4 ? L1[k] : L2[k]);
        const switchP = i === 4 ? prog(tl, f, 4, 2.6) : i > 4 ? 1 : 0;
        const colorOf = (k: number) => { const l = lab(k); if (l === undefined) return C.ink; if (k === 1 && i === 4) return switchP > 0.7 ? GROUP[0] : GROUP[1]; return GROUP[l]; };
        const linesOn = i === 1 || i === 2 || i === 4 || i === 6; const lineA = i === 2 ? 1 : prog(tl, f, i, 1.4); const lineO = i === 2 ? 0.2 : 0.75;
        const tc = i <= 3 ? C0 : i <= 5 ? C1 : C2;                     // centroids used for the table
        const tl1 = i <= 3 ? L1 : L2;
        const it = i <= 3 ? 1 : i <= 5 ? 2 : 3;
        return (<g>
          {[0, 1, 2, 3, 4, 5, 6].map(v => <line key={`gx${v}`} x1={x(v)} x2={x(v)} y1={y(0)} y2={y(5)} stroke={C.line} opacity={0.45} />)}
          {[0, 1, 2, 3, 4, 5].map(v => <line key={`gy${v}`} x1={x(0)} x2={x(6)} y1={y(v)} y2={y(v)} stroke={C.line} opacity={0.45} />)}
          <AxisX x={x} y={380} ticks={[0, 1, 2, 3, 4, 5, 6]} label="MW" />
          <AxisY y={y} x={70} ticks={[0, 1, 2, 3, 4, 5]} label="pH" />
          {/* distance lines */}
          {linesOn && X.map((p, k) => cs.map((c, j) => <line key={`${k}${j}`} x1={P(p)[0]} y1={P(p)[1]} x2={lerp(P(p)[0], P(c)[0], lineA > 0.99 ? 1 : lineA)} y2={lerp(P(p)[1], P(c)[1], lineA > 0.99 ? 1 : lineA)} stroke={GROUP[j]} strokeWidth={2} strokeDasharray="5 5" opacity={lineO} />))}
          {/* centroid trails */}
          {i >= 3 && <line x1={P(C0[1])[0]} y1={P(C0[1])[1]} x2={P(i >= 5 ? C1[1] : c2)[0]} y2={P(i >= 5 ? C1[1] : c2)[1]} stroke={GROUP[1]} strokeWidth={1.5} strokeDasharray="2 5" opacity={0.6} />}
          {i >= 5 && <><line x1={P(C1[1])[0]} y1={P(C1[1])[1]} x2={P(c2)[0]} y2={P(c2)[1]} stroke={GROUP[1]} strokeWidth={1.5} strokeDasharray="2 5" opacity={0.6} />
            <line x1={P(C0[0])[0]} y1={P(C0[0])[1]} x2={P(c1)[0]} y2={P(c1)[1]} stroke={GROUP[0]} strokeWidth={1.5} strokeDasharray="2 5" opacity={0.6} /></>}
          {/* medicines */}
          {X.map((p, k) => { const a = prog(tl, f, 0, 0.5 + k * 0.15); const [px, py] = P(p); const ca = i === 2 ? prog(tl, f, 2, 0.6 + k * 0.3) : 1;
            const col = i === 2 && ca < 0.5 ? C.ink : colorOf(k);
            return (<g key={k}>
              {k === 1 && i === 4 && switchP > 0.2 && <circle cx={px} cy={py} r={20} fill="none" stroke={C.signal} strokeWidth={2} opacity={Math.sin(Math.PI * Math.min(1, (switchP - 0.2) / 0.8))} />}
              <Glow cx={px} cy={lerp(py - 40, py, a)} r={8} color={col} opacity={a} />
              <Label x={k < 2 ? px : px + 16} y={k < 2 ? py + 30 : py + 5} text={String(k + 1)} color={C.ink} anchor={k < 2 ? 'middle' : 'start'} opacity={a} weight={700} size={14} />
            </g>); })}
          {/* centroids */}
          {cs.map((c, j) => { const [cx, cy] = P(c); const a = prog(tl, f, 0, 1.8 + j * 0.4); const left = j === 1 && i >= 3 && i < 5;
            return (<g key={j}><Star cx={cx} cy={cy} color={GROUP[j]} opacity={a} />
              <Label x={left ? cx - 18 : cx} y={left ? cy + 5 : cy - 20} text={`c${j + 1}`} color={GROUP[j]} anchor={left ? 'end' : 'middle'} weight={700} opacity={a} /></g>); })}
          {/* table */}
          {i >= 1 && <Table x0={492} title={`iteration ${it} · distances`} cnames={['c1', 'c2']} opacity={prog(tl, f, 1, 0.8)}
            rows={X.map((p, k) => ({name: String(k + 1), d: [dist(p, tc[0]), dist(p, tc[1])], y: i >= 2 && !(i === 4 && switchP < 0.7 && k === 1) ? (i === 4 && k === 1 ? L2[1] : tl1[k]) : (i === 4 && k === 1 ? L1[1] : undefined), flash: i === 4 && k === 1}))} />}
          {i >= 3 && <g opacity={i === 3 || i === 5 ? prog(tl, f, i, 1.8) : 1}>
            <Label x={618} y={300} text="centroids" color={C.muted} anchor="middle" size={14} />
            <Label x={618} y={330} text={`c1 = ${pt(i >= 5 ? C2[0] : C1[0])}`} color={GROUP[0]} anchor="middle" weight={700} />
            <Label x={618} y={358} text={`c2 = ${pt(i >= 5 ? C2[1] : C1[1])}`} color={GROUP[1]} anchor="middle" weight={700} />
          </g>}
        </g>);
      }
      /* exercise: three patients */
      const x = lin(0, 9, 70, 430), y = lin(0, 8, 380, 60); const P = (a: P2) => [x(a[0]), y(a[1])];
      const mv = i === 9 ? prog(tl, f, 9, 1.6) : 0;
      const cs = [lerp2(E0[0], E1[0], mv), lerp2(E0[1], E1[1], mv)];
      const shownRows = i === 7 ? 2 : 3; const labelsOn = i >= 8 ? (i === 8 ? prog(tl, f, 8, 3) : 1) : 0;
      return (<g>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => <line key={`gx${v}`} x1={x(v)} x2={x(v)} y1={y(0)} y2={y(8)} stroke={C.line} opacity={0.45} />)}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => <line key={`gy${v}`} x1={x(0)} x2={x(9)} y1={y(v)} y2={y(v)} stroke={C.line} opacity={0.45} />)}
        <AxisX x={x} y={380} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} label="SBP (scaled)" />
        <AxisY y={y} x={70} ticks={[0, 2, 4, 6, 8]} label="CRP (scaled)" />
        {i < 9 && E.map((p, k) => { if (k >= shownRows) return null; const at = k === 2 ? 8 : 7; const a = prog(tl, f, at, 1.2 + (k % 2) * 0.8);
          return E0.map((c, j) => <line key={`${k}${j}`} x1={P(p)[0]} y1={P(p)[1]} x2={lerp(P(p)[0], P(c)[0], a)} y2={lerp(P(p)[1], P(c)[1], a)} stroke={GROUP[j]} strokeWidth={2} strokeDasharray="5 5" opacity={EL[k] === j || labelsOn < 0.5 ? 0.8 : 0.25} />); })}
        {i === 9 && E.map((p, k) => <line key={k} x1={P(p)[0]} y1={P(p)[1]} x2={P(cs[EL[k]])[0]} y2={P(cs[EL[k]])[1]} stroke={GROUP[EL[k]]} strokeWidth={1.5} strokeDasharray="2 5" opacity={0.6} />)}
        {E.map((p, k) => { const a = prog(tl, f, 7, 0.5 + k * 0.15); const [px, py] = P(p); const col = labelsOn > 0.3 + k * 0.2 ? GROUP[EL[k]] : C.ink;
          return (<g key={k}><Glow cx={px} cy={lerp(py - 40, py, a)} r={8} color={col} opacity={a} />
            <Label x={px + 16} y={py + 5} text={`${k + 1}`} color={C.ink} weight={700} size={14} opacity={a} /></g>); })}
        {cs.map((c, j) => { const [cx, cy] = P(c); const a = prog(tl, f, 7, 1.0 + j * 0.3);
          return (<g key={j}><Star cx={cx} cy={cy} color={GROUP[j]} opacity={a} />
            <Label x={cx} y={cy - 20} text={`C${j + 1}`} color={GROUP[j]} anchor="middle" weight={700} opacity={a} /></g>); })}
        <Table x0={492} title={i === 9 ? 'one iteration done' : 'distances'} cnames={['C1', 'C2']} opacity={prog(tl, f, 7, 1)}
          rows={E.slice(0, shownRows).map((p, k) => ({name: String(k + 1), d: [dist(p, E0[0]), dist(p, E0[1])], y: labelsOn > 0.3 + k * 0.2 ? EL[k] : undefined}))} />
        {i === 9 && <g opacity={prog(tl, f, 9, 1.8)}>
          <Label x={618} y={300} text="new centroids" color={C.muted} anchor="middle" size={14} />
          <Label x={618} y={330} text={`C1 = ${pt(E1[0])}`} color={GROUP[0]} anchor="middle" weight={700} />
          <Label x={618} y={358} text={`C2 = ${pt(E1[1])}`} color={GROUP[1]} anchor="middle" weight={700} />
        </g>}
      </g>);
    }}
  </Frame>
);

export default S22Kmeans;
