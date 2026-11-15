import React from 'react';
import {C, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label, Arrow} from '../kit/plot';

// Session 22 pages 36–42. Cases "s22-mesh-knn" (new mesh (7, 3), K = 3) and "s22-tomato-knn" (tomato (6, 4), K = 3).
// Scaling (page 39) is shown on the four vendors' flexibility values.
type Item = {name: string; p: number[]; cls: string; color: string; side: 'l' | 'r'};
const PASS = C.green, FAIL = C.red;
const mesh: Item[] = [
  {name: 'A', p: [7, 7], cls: 'Pass', color: PASS, side: 'r'}, {name: 'B', p: [4, 7], cls: 'Pass', color: PASS, side: 'l'},
  {name: 'C', p: [4, 3], cls: 'Fail', color: FAIL, side: 'l'}, {name: 'D', p: [4, 1], cls: 'Fail', color: FAIL, side: 'l'},
];
const q = [7, 3], K = 3;
const food: Item[] = [
  {name: 'grape', p: [8, 5], cls: 'fruit', color: C.pink, side: 'r'}, {name: 'green bean', p: [3, 7], cls: 'vegetable', color: C.green, side: 'l'},
  {name: 'nuts', p: [3, 6], cls: 'protein', color: C.blue, side: 'l'}, {name: 'orange', p: [7, 3], cls: 'fruit', color: C.pink, side: 'r'},
];
const tomato = [6, 4];
const d = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const rankOf = (items: Item[], from: number[]) => { const ds = items.map(it => d(it.p, from)); const order = ds.map((_, k) => k).sort((a, b) => ds[a] - ds[b]); return {ds, order, rank: items.map((_, k) => order.indexOf(k))}; };
const M = rankOf(mesh, q);          // A 4, B 5, C 3, D 3.60555 → order C, D, A, B
const T = rankOf(food, tomato);     // orange, grape, nuts, green bean
const pFail = M.order.slice(0, K).filter(k => mesh[k].cls === 'Fail').length / K;          // 2/3
const pFruit = T.order.slice(0, K).filter(k => food[k].cls === 'fruit').length / K;        // 2/3
const f3 = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(3));
// scaling of flexibility (x2) for A–D
const w = mesh.map(m => m.p[1]);                                        // 7, 7, 3, 1
const wmin = Math.min(...w), wmax = Math.max(...w);
const mm = w.map(v => (v - wmin) / (wmax - wmin));                      // 1, 1, 0.333, 0
const wbar = w.reduce((a, b) => a + b, 0) / w.length;                   // 4.5
const sw = Math.sqrt(w.reduce((a, b) => a + (b - wbar) ** 2, 0) / (w.length - 1));   // 3
const zs = w.map(v => (v - wbar) / sw);                                 // 0.833, 0.833, -0.5, -1.167
const fz = (v: number) => (v < 0 ? '−' : '') + f3(Math.abs(v));

export const meta = {
  id: 's22-s22knn', session: 22, method: 's22knn',
  cases: {'s22-mesh-knn': [1, 2, 3, 4, 5], 's22-tomato-knn': [6, 6, 6, 6]},
  title: 'K-nearest neighbors · classify by the K closest',
  steps: [
    {title: 'Training set', seconds: 7, card: [{label: 'x1 strength · x2 flexibility', note: 'A (7, 7) Pass · B (4, 7) Pass\nC (4, 3) Fail · D (4, 1) Fail'}, {label: 'new mesh', value: `q = (${q.join(', ')}) · K = ${K}`, color: C.signal}],
      caption: 'Four vendors have known grades, **Pass** or **Fail**. A new mesh at (7, 3) needs a class without a surgeon test.'},
    {title: 'Distances', seconds: 8, card: [{label: 'distance to each vendor', tex: 'd(q,r)=\\sqrt{(q_1-r_1)^2+(q_2-r_2)^2}', note: `A √(0² + 4²) = ${f3(M.ds[0])} · B √(3² + 4²) = ${f3(M.ds[1])}\nC √(3² + 0²) = ${f3(M.ds[2])} · D √(3² + 2²) = ${f3(M.ds[3])}`}],
      caption: 'Measure the Euclidean distance from the new mesh to **every vendor**. C is closest at 3 and B is farthest at 5.'},
    {title: 'Rank', seconds: 7, card: [{label: 'rank from smallest', value: M.order.map(k => `${mesh[k].name} ${f3(M.ds[k])}`).join(' < '), color: C.signal}],
      caption: 'Rank the distances from smallest. C is 1, D is 2, A is 3 and B is **4**.'},
    {title: 'K = 3 nearest', seconds: 7, card: [{label: 'K = 3 nearest neighbors', value: M.order.slice(0, K).map(k => `${mesh[k].name} ${mesh[k].cls}`).join(' · '), note: 'B is 4th, so its class is not used'}],
      caption: 'Keep the **K = 3** nearest vendors, C, D and A. B falls outside the circle, so its class is not used.'},
    {title: 'Vote', seconds: 8, card: [{label: 'plurality vote', tex: `\\text{Prob}(\\text{Fail})=\\tfrac{2}{3}=${pFail.toFixed(3)}`, value: 'new mesh → Fail', color: FAIL}],
      caption: 'Two of the three neighbors failed, so the new mesh is classified **Fail**, with probability 2/3 of failing.'},
    {title: 'Tomato, K = 3', seconds: 9, card: [{label: 'tomato (6, 4) · K = 3', note: T.order.map(k => `${food[k].name} ${f3(T.ds[k])}`).join(' · ').replace(' · green', '\ngreen') + ' (4th)', value: `Prob(T = fruit) = 2/3 → fruit`, color: C.pink}],
      caption: 'The tomato works the same way. Orange, grape and nuts are nearest, so it is a **fruit** with probability 2/3.'},
    {title: 'Choosing K', seconds: 8, card: [{label: 'choosing K (a priori)', note: 'K = 1 follows one point, so noise matters\nK = n gives the most common class\nguideline K = √n'}],
      caption: 'K is chosen in advance. **K = 1** follows a single point, so noise matters, and K = n gives the most common class.'},
    {title: 'Min-max scaling', seconds: 8, card: [{label: 'min-max scaling', tex: 'w_{scaled}=\\frac{w-\\min(w)}{\\max(w)-\\min(w)}', value: `(${w.join(', ')}) → (${mm.map(f3).join(', ')})`, color: C.noise}],
      caption: 'Scaling keeps one feature from dominating. **Min-max** maps a feature onto 0 to 1, here the flexibility values.'},
    {title: 'z-score scaling', seconds: 8, card: [{label: 'z-score scaling', tex: 'w_{scaled}=\\frac{w-\\bar w}{s_w}', value: `→ (${zs.map(fz).join(', ')})`, color: C.purple, note: `mean ${wbar} · SD ${f3(sw)}`}],
      caption: `The **z-score** subtracts the mean and divides by the SD. Flexibility has mean ${wbar} and SD ${f3(sw)}, so 7 becomes ${f3(zs[0])}.`},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; label?: string}> = ({y, x, ticks, label}) => (
  <g fontFamily={mono}>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x - 6} x2={x} y1={y(t)} y2={y(t)} stroke={C.muted} /><text x={x - 10} y={y(t) + 5} fill={C.muted} fontSize={14} textAnchor="end">{t}</text></g>)}
    {label && <text transform={`translate(${x - 38},${(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2}) rotate(-90)`} fill={C.muted} fontSize={15} textAnchor="middle">{label}</text>}
  </g>
);

// Ranked distance bars at the right of the stage. `sortP` moves rows from data order into rank order.
const RankPanel: React.FC<{items: Item[]; R: ReturnType<typeof rankOf>; title: string; sortP: number; keep: number; keepP: number; opacity: number; fmtName?: (s: string) => string}> = ({items, R, title, sortP, keep, keepP, opacity}) => {
  const bx = lin(0, 5, 0, 120);
  return (<g opacity={opacity}>
    <Label x={620} y={24} text={title} color={C.muted} anchor="middle" size={14} />
    {items.map((it, k) => { const yy = lerp(64 + k * 46, 64 + R.rank[k] * 46, sortP); const out = R.rank[k] >= keep; const dim = out ? 1 - 0.65 * keepP : 1;
      return (<g key={k} opacity={dim}>
        {sortP > 0.98 && <Label x={494} y={yy + 5} text={String(R.rank[k] + 1)} color={C.muted} size={13} />}
        <Label x={590} y={yy + 5} text={it.name} color={it.color} anchor="end" weight={700} size={14} />
        <rect x={600} y={yy - 10} width={bx(R.ds[k])} height={20} rx={4} fill={it.color} opacity={0.75} />
        <Label x={606 + bx(R.ds[k])} y={yy + 5} text={f3(R.ds[k])} color={C.ink} size={13} />
      </g>); })}
    {keepP > 0 && <g opacity={keepP}>
      <rect x={486} y={64 - 24} width={272} height={keep * 46 + 2} rx={10} fill="none" stroke={C.signal} strokeWidth={2} />
      <Label x={752} y={64 + keep * 46 - 26} text={`K = ${keep}`} color={C.signal} anchor="end" weight={700} size={14} />
    </g>}
  </g>);
};

const Vote: React.FC<{counts: {name: string; n: number; color: string}[]; result: string; opacity: number; grow: number}> = ({counts, result, opacity, grow}) => (
  <g opacity={opacity}>
    {counts.map((c, k) => <g key={k}>
      <Label x={590} y={270 + k * 34} text={c.name} color={c.color} anchor="end" weight={700} />
      {Array.from({length: c.n}, (_, j) => <Glow key={j} cx={612 + j * 28} cy={265 + k * 34} r={8} color={c.color} opacity={Math.min(1, Math.max(0, grow * 3 - j - k))} />)}
    </g>)}
    <Label x={620} y={350} text={result} color={C.signal} anchor="middle" weight={700} size={17} opacity={Math.min(1, Math.max(0, grow * 3 - 2))} />
  </g>
);

const S22Knn: React.FC = () => (
  <Frame title={meta.title} session={22} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(0, 10, 70, 450), y = lin(0, 8, 380, 76); const P = (a: number[]) => [x(a[0]), y(a[1])];
      const ux = (x(1) - x(0));
      const grid = (<g>
        {[0, 2, 4, 6, 8, 10].map(v => <line key={`gx${v}`} x1={x(v)} x2={x(v)} y1={y(0)} y2={y(8)} stroke={C.line} opacity={0.45} />)}
        {[0, 2, 4, 6, 8].map(v => <line key={`gy${v}`} x1={x(0)} x2={x(10)} y1={y(v)} y2={y(v)} stroke={C.line} opacity={0.45} />)}
      </g>);
      const clip = <defs><clipPath id="plotClip"><rect x={x(0)} y={y(8)} width={x(10) - x(0)} height={y(0) - y(8)} /></clipPath></defs>;
      /* surgical mesh, steps 1–5 and 7 */
      if (i <= 4 || i === 6) {
        const [qx, qy] = P(q);
        const lineP = i === 1 ? prog(tl, f, 1, 1.6) : i >= 1 ? 1 : 0;
        const keepK = i === 6 ? 1 : K;
        const keepP = i === 3 ? prog(tl, f, 3, 1.4) : i === 4 ? 1 : i === 6 ? prog(tl, f, 6, 1.4) : 0;
        const radius = i === 6 ? lerp(M.ds[M.order[K - 1]], M.ds[M.order[0]], prog(tl, f, 6, 1.4)) : M.ds[M.order[K - 1]];
        const vote = i === 4 ? prog(tl, f, 4, 2.4) : 0;
        const newCol = vote > 0.9 || i === 6 ? FAIL : C.white;
        const dLbl: Record<string, [number, number, 'start' | 'middle' | 'end']> = {A: [10, 0, 'start'], B: [-10, -8, 'end'], C: [0, -10, 'middle'], D: [10, 22, 'start']};
        return (<g>
          {clip}{grid}
          <AxisX x={x} y={380} ticks={[0, 2, 4, 6, 8, 10]} label="x1 strength (kg/m²)" />
          <AxisY y={y} x={70} ticks={[0, 2, 4, 6, 8]} label="x2 flexibility" />
          {keepP > 0 && <circle cx={qx} cy={qy} r={radius * ux} fill={C.signal} fillOpacity={0.06} stroke={C.signal} strokeWidth={2} strokeDasharray="7 6" opacity={keepP} clipPath="url(#plotClip)" />}
          {lineP > 0 && mesh.map((m, k) => { const [mx, my] = P(m.p); const isK = M.rank[k] < keepK; const dim = keepP > 0 && !isK ? 1 - 0.7 * keepP : 1;
            const mid = [(mx + qx) / 2, (my + qy) / 2]; const [ox, oy, an] = dLbl[m.name];
            return (<g key={k} opacity={dim}>
              <line x1={qx} y1={qy} x2={lerp(qx, mx, lineP)} y2={lerp(qy, my, lineP)} stroke={C.noise} strokeWidth={2.5} strokeDasharray="6 5" />
              <Label x={mid[0] + ox} y={mid[1] + oy + 5} text={f3(M.ds[k])} color={C.noise} anchor={an} weight={700} size={14} opacity={lineP} />
            </g>); })}
          {mesh.map((m, k) => { const a = prog(tl, f, 0, 0.5 + k * 0.2); const [mx, my] = P(m.p); const isK = M.rank[k] < keepK; const dim = keepP > 0 && !isK ? 1 - 0.6 * keepP : 1;
            return (<g key={k} opacity={a * dim}><Glow cx={mx} cy={lerp(my - 40, my, a)} r={8} color={m.color} />
              <Label x={m.side === 'r' ? mx + 15 : mx - 15} y={my + 5} text={`${m.name} ${m.cls}`} color={m.color} anchor={m.side === 'r' ? 'start' : 'end'} weight={700} size={14} /></g>); })}
          {(() => { const a = prog(tl, f, 0, 1.8); return (<g opacity={a}>
            <circle cx={qx} cy={qy} r={17 + 3 * Math.sin(f / 7)} fill="none" stroke={newCol} strokeWidth={1.5} opacity={0.6} />
            <Glow cx={qx} cy={qy} r={9} color={newCol} />
            <Label x={qx + 16} y={qy + 26} text={vote > 0.9 || i === 6 ? 'new → Fail' : 'new (7, 3) ?'} color={newCol} weight={700} size={14} />
          </g>); })()}
          {i >= 1 && <RankPanel items={mesh} R={M} title="distance to (7, 3)" sortP={i === 1 ? 0 : i === 2 ? prog(tl, f, 2, 1.6) : 1} keep={keepK} keepP={keepP} opacity={i === 1 ? prog(tl, f, 1, 1.6) : 1} />}
          {(i === 4 || i === 6) && <Vote counts={i === 6 ? [{name: 'Fail', n: 1, color: FAIL}] : [{name: 'Fail', n: 2, color: FAIL}, {name: 'Pass', n: 1, color: PASS}]}
            result={i === 6 ? 'K = 1 → C → Fail' : `Prob(Fail) = 2/3 → Fail`} opacity={1} grow={i === 6 ? prog(tl, f, 6, 2.4) : vote} />}
        </g>);
      }
      /* tomato, step 6 */
      if (i === 5) {
        const [tx, ty] = P(tomato); const lp = prog(tl, f, 5, 1.6); const kp = prog(tl, f, 5, 3.4) > 0.6 ? (prog(tl, f, 5, 3.4) - 0.6) / 0.4 : 0;
        const vote = Math.max(0, (f - tl.starts[5]) / 30 - 3.6) / 2.4;
        const r3 = T.ds[T.order[K - 1]];
        const lbl: Record<string, [number, number, 'start' | 'middle' | 'end']> = {grape: [0, -12, 'middle'], 'green bean': [10, -4, 'start'], nuts: [-4, 22, 'middle'], orange: [-12, 12, 'end']};
        return (<g>
          {clip}{grid}
          <AxisX x={x} y={380} ticks={[0, 2, 4, 6, 8, 10]} label="sweetness" />
          <AxisY y={y} x={70} ticks={[0, 2, 4, 6, 8]} label="crunchiness" />
          {kp > 0 && <circle cx={tx} cy={ty} r={r3 * ux} fill={C.signal} fillOpacity={0.06} stroke={C.signal} strokeWidth={2} strokeDasharray="7 6" opacity={kp} clipPath="url(#plotClip)" />}
          {food.map((fd, k) => { const [fx, fy] = P(fd.p); const out = T.rank[k] >= K; const dim = out ? 1 - 0.65 * kp : 1; const [ox, oy, an] = lbl[fd.name];
            return (<g key={k} opacity={dim}>
              <line x1={tx} y1={ty} x2={lerp(tx, fx, lp)} y2={lerp(ty, fy, lp)} stroke={C.noise} strokeWidth={2.5} strokeDasharray="6 5" />
              <Label x={(tx + fx) / 2 + ox} y={(ty + fy) / 2 + oy + 5} text={f3(T.ds[k])} color={C.noise} anchor={an} size={13} weight={700} opacity={lp} />
              <Glow cx={fx} cy={fy} r={8} color={fd.color} />
              <Label x={fd.side === 'r' ? fx + 15 : fx - 15} y={fy + 5} text={fd.name} color={fd.color} anchor={fd.side === 'r' ? 'start' : 'end'} weight={700} size={14} />
            </g>); })}
          <Glow cx={tx} cy={ty} r={9} color={vote > 0.9 ? C.pink : C.white} />
          <Label x={tx - 14} y={ty + 48} text={vote > 0.9 ? 'tomato → fruit' : 'tomato ?'} color={vote > 0.9 ? C.pink : C.white} anchor="end" weight={700} size={14} />
          <RankPanel items={food} R={T} title="distance to (6, 4)" sortP={1} keep={K} keepP={kp} opacity={lp} />
          <Vote counts={[{name: 'fruit', n: 2, color: C.pink}, {name: 'protein', n: 1, color: C.blue}]} result="Prob(T=fruit) = 2/3 → fruit" opacity={1} grow={Math.min(1, vote)} />
        </g>);
      }
      /* scaling, steps 8–9 */
      const xr = lin(0, 10, 80, 700); const z = i === 8; const p = prog(tl, f, i, 1.6);
      const xs = z ? lin(-1.5, 1.5, 80, 700) : lin(0, 1, 80, 700);
      const sc = z ? zs : mm; const yr = 90, ys = 300;
      const groups = [{name: 'A, B', k: 0}, {name: 'C', k: 2}, {name: 'D', k: 3}];   // A and B share flexibility 7
      return (<g>
        <AxisX x={xr} y={yr + 20} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
        <Label x={4} y={yr + 5} text="raw" color={C.muted} size={14} />
        <Label x={4} y={ys + 5} text="scaled" color={C.muted} size={14} />
        <AxisX x={xs} y={ys + 20} ticks={z ? [-1.5, -1, -0.5, 0, 0.5, 1, 1.5] : [0, 0.25, 0.5, 0.75, 1]} fmt={v => (v < 0 ? '−' + Math.abs(v) : String(v))} label={z ? 'z-score (SD units)' : 'min-max scaled (0 to 1)'} />
        {z && <g opacity={p}>
          <line x1={xr(wbar)} x2={xr(wbar)} y1={yr - 50} y2={yr + 20} stroke={C.signal} strokeWidth={2} strokeDasharray="5 4" />
          <Label x={xr(wbar) - 8} y={yr - 44} text={`mean ${wbar}`} color={C.signal} anchor="end" size={13} weight={700} />
          <line x1={xr(wbar)} x2={xr(wbar + sw)} y1={yr - 40} y2={yr - 40} stroke={C.purple} strokeWidth={3} />
          <Label x={xr(wbar + sw) + 6} y={yr - 35} text={`SD ${f3(sw)}`} color={C.purple} size={13} weight={700} />
        </g>}
        {groups.map((g, n) => { const raw = w[g.k], s = sc[g.k]; const col = mesh[g.k].color; const ax = xr(raw), bx = xs(s); const t = Math.min(1, Math.max(0, p * 1.4 - n * 0.2));
          return (<g key={n}>
            <Glow cx={ax} cy={yr} r={8} color={col} />
            <Label x={ax} y={yr - 16} text={g.name} color={col} anchor="middle" weight={700} size={14} />
            <path d={`M${ax},${yr + 46} C${ax},${(yr + ys) / 2} ${bx},${(yr + ys) / 2} ${bx},${ys - 18}`} fill="none" stroke={col} strokeWidth={2} strokeDasharray="5 5" opacity={0.7 * t} />
            {t > 0.98 && <Arrow x1={bx} y1={ys - 30} x2={bx} y2={ys - 12} color={col} w={2} />}
            <Glow cx={lerp(ax, bx, t)} cy={lerp(yr + 46, ys, t)} r={8} color={col} opacity={t > 0 ? 1 : 0} />
            <Label x={bx + 14} y={ys - 12} text={z ? fz(s) : f3(s)} color={col} weight={700} size={15} opacity={t > 0.98 ? 1 : 0} />
          </g>); })}
      </g>);
    }}
  </Frame>
);

export default S22Knn;
