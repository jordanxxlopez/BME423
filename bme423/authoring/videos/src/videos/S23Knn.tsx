import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 23 page 35 (lecture exercise): seven tumor samples A–G, new sample (4, 4), K = 3 and K = 5.
// Page 18: knn() with prob=TRUE and K = 21, test sample 32 predicted Benign with probability 0.7619048 = 16/21.
type Item = {name: string; p: number[]; cls: 'Benign' | 'Malignant'; side: 'l' | 'r'};
const BEN = C.green, MAL = C.red;
const colOf = (s: string) => (s === 'Benign' ? BEN : MAL);
const train: Item[] = [
  {name: 'A', p: [4, 3], cls: 'Benign', side: 'r'}, {name: 'B', p: [3, 3], cls: 'Benign', side: 'l'},
  {name: 'C', p: [4, 5], cls: 'Malignant', side: 'r'}, {name: 'D', p: [6, 4], cls: 'Malignant', side: 'r'},
  {name: 'E', p: [5, 6], cls: 'Malignant', side: 'r'}, {name: 'F', p: [1, 3], cls: 'Benign', side: 'l'},
  {name: 'G', p: [7, 7], cls: 'Malignant', side: 'r'},
];
const q = [4, 4];
const d = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const ds = train.map(it => d(it.p, q));                                         // 1, 1.41421, 1, 2, 2.23607, 3.16228, 4.24264
const order = ds.map((_, k) => k).sort((a, b) => ds[a] - ds[b] || a - b);        // A, C, B, D, E, F, G (stable tie A before C)
const rank = train.map((_, k) => order.indexOf(k));
const f5 = (v: number) => String(+v.toFixed(5));
const votes = (K: number) => { const nb = order.slice(0, K); const b = nb.filter(k => train[k].cls === 'Benign').length; return {b, m: K - b}; };
const V3 = votes(3), V5 = votes(5);                                               // 2 B 1 M · 2 B 3 M
const sgn = (v: number) => (v < 0 ? `(−${-v})` : String(v));
const sq = (it: Item) => `${sgn(q[0] - it.p[0])}² + ${sgn(q[1] - it.p[1])}²`;
// page 18, test sample 32: 21 neighbors, 16 vote Benign
const K21 = 21, nB21 = 16, p21 = nB21 / K21;

export const meta = {
  id: 's23-s23knn', session: 23, method: 's23knn',
  cases: {'s23-exercise-k3': [1, 2, 3, 4, 5, 6], 's23-exercise-k5': [1, 2, 3, 4, 7, 8]},
  title: 'K-NN in practice · classify a new tumor sample',
  steps: [
    {title: 'Training set', seconds: 7, card: [{label: 'size score · irregularity score', note: 'Benign A (4, 3) · B (3, 3) · F (1, 3)\nMalignant C (4, 5) · D (6, 4) · E (5, 6) · G (7, 7)'}, {label: 'new sample', value: 'q = (4, 4)', color: C.signal}],
      caption: 'Seven tumor samples have known diagnoses, **Benign** or **Malignant**. A new sample with scores (4, 4) needs a class.'},
    {title: 'Distances A to D', seconds: 8, card: [{label: 'Euclidean distance', tex: 'd(q,r)=\\sqrt{(q_1-r_1)^2+(q_2-r_2)^2}', note: train.slice(0, 4).map((it, k) => `${it.name} √(${sq(it)}) = ${f5(ds[k])}`).join('\n')}],
      caption: 'Subtract matching scores, square, add and take the square root. **A and C** are both 1 away from the new sample.'},
    {title: 'Distances E to G', seconds: 7, card: [{label: 'same formula', note: train.slice(4).map((it, k) => `${it.name} √(${sq(it)}) = ${f5(ds[k + 4])}`).join('\n')}],
      caption: 'The same formula is applied to **every** training sample. G is farthest at 4.24264.'},
    {title: 'Rank', seconds: 7, card: [{label: 'rank from smallest', note: order.map(k => `${train[k].name} ${f5(ds[k])}`).join(' < ').replace(' < D', '\n< D')}],
      caption: 'Rank the distances from smallest. A and C **tie at 1**, then B is third, D fourth and E fifth.'},
    {title: 'K = 3 nearest', seconds: 7, card: [{label: 'K = 3 nearest neighbors', value: order.slice(0, 3).map(k => `${train[k].name} ${train[k].cls}`).join(' · '), note: 'D, E, F and G do not vote'}],
      caption: 'With **K = 3** only A, C and B vote, because D, E, F and G lie outside the circle through the third neighbor.'},
    {title: 'Vote, K = 3', seconds: 8, card: [{label: 'plurality vote', tex: `P(\\text{Benign})=\\tfrac{${V3.b}}{3}=${(V3.b / 3).toFixed(5)}`, value: 'new sample → Benign', color: BEN}],
      caption: `Benign has **${V3.b} of the 3** votes, so the new sample is classified benign with probability 2/3.`},
    {title: 'K = 5 nearest', seconds: 7, card: [{label: 'K = 5 nearest neighbors', value: order.slice(0, 5).map(k => train[k].name).join(', '), note: 'D and E join, both Malignant'}],
      caption: 'With **K = 5** the circle grows to E at 2.23607, so D and E join the vote. Both are malignant.'},
    {title: 'Vote, K = 5', seconds: 8, card: [{label: 'plurality vote', tex: `P(\\text{Malignant})=\\tfrac{${V5.m}}{5}=${V5.m / 5}`, value: 'new sample → Malignant', color: MAL}],
      caption: `Malignant now has **${V5.m} of the 5** votes, so the class flips to malignant with probability 0.6. The choice of K matters.`},
    {title: 'knn() probability', seconds: 8, card: [{label: 'knn(train, test, cl, k = 21, prob = TRUE)', tex: `P=\\tfrac{${nB21}}{${K21}}=${p21.toFixed(7)}`, value: 'test sample 32 → Benign', color: BEN, note: 'its true class is Malignant'}],
      caption: `In R, prob is the share of the K votes the winner gets. Test sample 32 had **${nB21} of 21** benign votes yet was malignant.`},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; label?: string}> = ({y, x, ticks, label}) => (
  <g>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x - 6} x2={x} y1={y(t)} y2={y(t)} stroke={C.muted} /><Label x={x - 10} y={y(t) + 5} text={String(t)} color={C.muted} size={14} anchor="end" /></g>)}
    {label && <text transform={`translate(${x - 36},${(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2}) rotate(-90)`} fill={C.muted} fontSize={15} textAnchor="middle">{label}</text>}
  </g>
);

// Distance bars on the right. `sortP` moves rows from data order into rank order.
const RankPanel: React.FC<{shown: number[]; sortP: number; keep: number; keepP: number; opacity: number; grow: number[]}> = ({shown, sortP, keep, keepP, opacity, grow}) => {
  const bx = lin(0, 5, 0, 140); const row = 33, y0 = 50;
  return (<g opacity={opacity}>
    <Label x={620} y={18} text="distance to (4, 4)" color={C.muted} anchor="middle" size={14} />
    {train.map((it, k) => { if (!shown.includes(k)) return null; const yy = lerp(y0 + k * row, y0 + rank[k] * row, sortP); const out = rank[k] >= keep; const dim = out ? 1 - 0.65 * keepP : 1;
      const g = grow[k];
      return (<g key={k} opacity={dim}>
        {sortP > 0.98 && <Label x={500} y={yy + 5} text={String(rank[k] + 1)} color={C.muted} size={13} />}
        <Label x={548} y={yy + 5} text={it.name} color={colOf(it.cls)} anchor="end" weight={700} size={15} />
        <rect x={558} y={yy - 10} width={bx(ds[k]) * g} height={20} rx={4} fill={colOf(it.cls)} opacity={0.75} />
        <Label x={564 + bx(ds[k]) * g} y={yy + 5} text={f5(ds[k])} color={C.ink} size={13} opacity={g} />
      </g>); })}
    {keepP > 0 && <g opacity={keepP}>
      <rect x={490} y={y0 - 18} width={266} height={keep * row + 3} rx={10} fill="none" stroke={C.signal} strokeWidth={2} />
      <Label x={750} y={y0 + keep * row - 21} text={`K = ${keep}`} color={C.signal} anchor="end" weight={700} size={14} />
    </g>}
  </g>);
};

const Vote: React.FC<{b: number; m: number; result: string; color: string; grow: number}> = ({b, m, result, color, grow}) => {
  const rows = [{name: 'Benign', n: b, c: BEN}, {name: 'Malignant', n: m, c: MAL}];
  return (<g>
    {rows.map((r, k) => <g key={k}>
      <Label x={600} y={308 + k * 32} text={r.name} color={r.c} anchor="end" weight={700} size={15} />
      {Array.from({length: r.n}, (_, j) => <Glow key={j} cx={622 + j * 26} cy={303 + k * 32} r={8} color={r.c} opacity={Math.min(1, Math.max(0, grow * 4 - j - k * 2))} />)}
    </g>)}
    {result.split('|').map((ln, j) => <Label key={j} x={620} y={380 + j * 24} text={ln} color={color} anchor="middle" weight={700} size={16} opacity={Math.min(1, Math.max(0, grow * 3 - 2))} />)}
  </g>);
};

const S23Knn: React.FC = () => (
  <Frame title={meta.title} session={23} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(0, 8, 70, 422), y = lin(0, 8, 382, 30); const P = (a: number[]) => [x(a[0]), y(a[1])]; const ux = x(1) - x(0);
      if (i <= 7) {
        const [qx, qy] = P(q);
        // which distance lines are drawn, and how far
        const grow = train.map((_, k) => { if (k < 4) return i === 1 ? prog(tl, f, 1, 0.6 + k * 0.4) : i >= 1 ? 1 : 0; return i === 2 ? prog(tl, f, 2, 0.6 + (k - 4) * 0.4) : i >= 2 ? 1 : 0; });
        const K = i >= 6 ? 5 : 3;
        const keepP = i === 4 ? prog(tl, f, 4, 1.4) : i === 5 ? 1 : i >= 6 ? 1 : 0;
        const radius = i === 6 ? lerp(ds[order[2]], ds[order[4]], prog(tl, f, 6, 1.6)) : ds[order[K - 1]];
        const keepN = i === 6 ? (prog(tl, f, 6, 1.6) > 0.5 ? 5 : 3) : K;
        const vote = i === 5 ? prog(tl, f, 5, 2.4) : i === 7 ? prog(tl, f, 7, 2.4) : 0;
        const done = (i === 5 || i === 7) && vote > 0.9;
        const newCol = done ? (i === 5 ? BEN : MAL) : C.white;
        const isNb = (k: number) => rank[k] < keepN;
        return (<g>
          <defs><clipPath id="s23clip"><rect x={x(0)} y={y(8)} width={x(8) - x(0)} height={y(0) - y(8)} /></clipPath></defs>
          {[0, 2, 4, 6, 8].map(v => <line key={`gx${v}`} x1={x(v)} x2={x(v)} y1={y(0)} y2={y(8)} stroke={C.line} opacity={0.45} />)}
          {[0, 2, 4, 6, 8].map(v => <line key={`gy${v}`} x1={x(0)} x2={x(8)} y1={y(v)} y2={y(v)} stroke={C.line} opacity={0.45} />)}
          <AxisX x={x} y={382} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8]} label="size score" />
          <AxisY y={y} x={70} ticks={[0, 2, 4, 6, 8]} label="irregularity score" />
          {keepP > 0 && <circle cx={qx} cy={qy} r={radius * ux} fill={C.signal} fillOpacity={0.06} stroke={C.signal} strokeWidth={2} strokeDasharray="7 6" opacity={keepP} clipPath="url(#s23clip)" />}
          {train.map((it, k) => { const [mx, my] = P(it.p); const dim = keepP > 0 && !isNb(k) ? 1 - 0.7 * keepP : 1; if (grow[k] <= 0) return null;
            return <line key={k} x1={qx} y1={qy} x2={lerp(qx, mx, grow[k])} y2={lerp(qy, my, grow[k])} stroke={C.noise} strokeWidth={2.5} strokeDasharray="6 5" opacity={dim} />; })}
          {train.map((it, k) => { const a = prog(tl, f, 0, 0.5 + k * 0.18); const [mx, my] = P(it.p); const dim = keepP > 0 && !isNb(k) ? 1 - 0.6 * keepP : 1;
            return (<g key={k} opacity={a * dim}>
              {keepP > 0 && isNb(k) && <circle cx={mx} cy={my} r={14} fill="none" stroke={C.signal} strokeWidth={2} opacity={keepP} />}
              <Glow cx={mx} cy={lerp(my - 40, my, a)} r={8} color={colOf(it.cls)} />
              <Label x={it.side === 'r' ? mx + 17 : mx - 17} y={my + 5} text={it.name} color={colOf(it.cls)} anchor={it.side === 'r' ? 'start' : 'end'} weight={700} size={15} /></g>); })}
          {(() => { const a = prog(tl, f, 0, 1.8); return (<g opacity={a}>
            <circle cx={qx} cy={qy} r={16 + 3 * Math.sin(f / 7)} fill="none" stroke={newCol} strokeWidth={1.5} opacity={0.6} />
            <Glow cx={qx} cy={qy} r={9} color={newCol} />
            <Label x={qx - 18} y={qy - 12} text={done ? (i === 5 ? 'Benign' : 'Malignant') : 'new (4, 4)'} color={newCol} anchor="end" weight={700} size={14} />
          </g>); })()}
          {i === 0 && <g opacity={prog(tl, f, 0, 2.2)}>
            <Glow cx={520} cy={60} r={8} color={BEN} /><Label x={536} y={65} text="Benign" color={BEN} weight={700} />
            <Glow cx={520} cy={92} r={8} color={MAL} /><Label x={536} y={97} text="Malignant" color={MAL} weight={700} />
          </g>}
          {i >= 1 && <RankPanel shown={i === 1 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6]} sortP={i <= 2 ? 0 : i === 3 ? prog(tl, f, 3, 1.6) : 1} keep={keepN} keepP={keepP}
            opacity={i === 1 ? prog(tl, f, 1, 1.0) : 1} grow={grow} />}
          {i === 5 && <Vote b={V3.b} m={V3.m} result="P(Benign) = 2/3|→ Benign" color={BEN} grow={vote} />}
          {i === 7 && <Vote b={V5.b} m={V5.m} result="P(Malignant) = 3/5|→ Malignant" color={MAL} grow={vote} />}
          {i === 6 && <Label x={620} y={360} text={`radius ${f5(ds[order[2]])} → ${f5(ds[order[4]])}`} color={C.signal} anchor="middle" size={14} weight={700} opacity={prog(tl, f, 6, 1.6)} />}
        </g>);
      }
      /* step 9: knn() prob with K = 21 (page 18, test sample 32) */
      const p = prog(tl, f, 8, 2.4); const cx0 = 150, cy0 = 120, gap = 46;
      return (<g>
        <Label x={380} y={40} text="21 nearest training samples of test sample 32" color={C.muted} anchor="middle" size={15} />
        {Array.from({length: K21}, (_, j) => { const col = j < nB21 ? BEN : MAL; const r = Math.floor(j / 7), c = j % 7;
          const a = Math.min(1, Math.max(0, p * 22 - j)); return <Glow key={j} cx={cx0 + c * gap + (r === 2 ? 0 : 0)} cy={cy0 + r * gap} r={10} color={col} opacity={a} />; })}
        <g opacity={prog(tl, f, 8, 3.2)}>
          <Label x={cx0 + 7 * gap + 6} y={cy0 + 5} text="Benign 16" color={BEN} weight={700} size={15} />
          <Label x={cx0 + 7 * gap + 6} y={cy0 + 2 * gap + 5} text="Malignant 5" color={MAL} weight={700} size={15} />
        </g>
        <g opacity={prog(tl, f, 8, 4)}>
          <Label x={380} y={300} text={`prob = 16 / 21 = ${p21.toFixed(7)} → Benign`} color={C.signal} anchor="middle" weight={700} size={20} />
          <Label x={380} y={340} text="true class Malignant" color={MAL} anchor="middle" weight={700} size={16} />
        </g>
      </g>);
    }}
  </Frame>
);

export default S23Knn;
