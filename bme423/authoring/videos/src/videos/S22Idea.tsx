import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, rng, AxisX, Glow, Label, Arrow} from '../kit/plot';

// Session 22 pages 4, 6–10 and 12–13. SAT plots are an unscaled sketch (no score values on the slide).
// Food features are the slide's own values; case "s22-tomato-nearest" (tomato (6, 4), K = 1).
const tomato = [6, 4];
type Food = {name: string; s: number; c: number; cls: 0 | 1 | 2; side: 'r' | 'l' | 'b'};
const CLS = [{name: 'fruit', color: C.pink}, {name: 'vegetable', color: C.green}, {name: 'protein', color: C.blue}];
const foods: Food[] = [
  {name: 'apple', s: 10, c: 9, cls: 0, side: 'r'}, {name: 'bacon', s: 1, c: 4, cls: 2, side: 'r'}, {name: 'banana', s: 10, c: 1, cls: 0, side: 'r'},
  {name: 'carrot', s: 7, c: 10, cls: 1, side: 'r'}, {name: 'celery', s: 3, c: 10, cls: 1, side: 'r'}, {name: 'cheese', s: 1, c: 1, cls: 2, side: 'r'},
  {name: 'grape', s: 8, c: 5, cls: 0, side: 'r'}, {name: 'green bean', s: 3, c: 7, cls: 1, side: 'l'}, {name: 'nuts', s: 3, c: 6, cls: 2, side: 'l'},
  {name: 'orange', s: 7, c: 3, cls: 0, side: 'r'},
];
const dist = (f: Food) => Math.hypot(tomato[0] - f.s, tomato[1] - f.c);
const D = Object.fromEntries(foods.map(f => [f.name, dist(f)]));   // grape 2.23607, green bean 4.24264, nuts 3.60555, orange 1.41421
const f3 = (v: number) => v.toFixed(3);

// SAT sketch: three clouds placed like the slide's sketch (unitless).
const R = rng(2207);
const placed: {x: number; y: number; g: number}[] = [];
const cloud = (n: number, x0: number, x1: number, y0: number, y1: number, g: number) => {
  const out: {x: number; y: number; g: number}[] = [];
  for (let tries = 0; out.length < n && tries < 5000; tries++) {      // keep dots apart so none overlap
    const p = {x: lerp(x0, x1, R()), y: lerp(y0, y1, R()), g};
    if (placed.every(q => Math.hypot(q.x - p.x, q.y - p.y) > 0.62)) { out.push(p); placed.push(p); }
  }
  return out;
};
const sat = [...cloud(15, 0.8, 4.2, 5.3, 9.4, 0), ...cloud(6, 5.2, 6.8, 6.6, 9.0, 1), ...cloud(9, 5.3, 9.0, 0.9, 3.8, 2)];
const boxes = [{x0: 0.4, x1: 4.6, y0: 4.9, y1: 9.8, name: 'Humanities'}, {x0: 4.9, x1: 7.1, y0: 6.2, y1: 9.4, name: 'BME'}, {x0: 4.9, x1: 9.4, y0: 0.5, y1: 4.2, name: 'Math'}];

export const meta = {
  id: 's22-s22idea', session: 22, method: 's22idea',
  cases: {'s22-tomato-nearest': [6, 7, 8, 9]},
  title: 'Machine learning · clustering vs classification',
  steps: [
    {title: 'Two learning types', seconds: 7, card: [{label: 'types of learning', note: 'supervised · data with known results\nunsupervised · data with no results\nreinforcement · data with feedback'}],
      caption: 'Supervised learning trains on data with **known results**. Unsupervised learning trains on data with **no results**.'},
    {title: 'Feature space', seconds: 7, card: [{label: 'clustering is given', tex: 'x_i\\ \\text{only (feature vectors)}', note: 'unsupervised · a sketch, no score values'}],
      caption: 'Each applicant is one point with two features, SAT math and reading/writing. This sketch gives **no group names**.'},
    {title: 'Find clusters', seconds: 7, card: [{label: 'clustering approach', value: 'similar within a cluster', color: C.signal, note: 'dissimilar between clusters'}],
      caption: 'Clustering groups points that sit close together, so points are **similar within** a cluster and dissimilar between.'},
    {title: 'Name the clusters', seconds: 7, card: [{label: 'names from other information', note: 'accepted major · Humanities, BME, Math'}],
      caption: 'Outside information, the accepted major, gives each cluster a name. Now every point carries a **label**.'},
    {title: 'Labeled foods', seconds: 7, card: [{label: 'classification is given', tex: 'x_i\\ \\text{and}\\ y_i\\in\\{1,\\dots,L\\}', note: 'x = (sweetness, crunchiness) · L = 3 classes'}],
      caption: 'In classification every food already has a class. Foods of one class have **similar features**, so they sit together.'},
    {title: 'A new object', seconds: 7, card: [{label: 'tomato · no label', value: 'q = (6, 4) → classification', color: C.signal}],
      caption: 'The tomato is new and has no label. The foods have known classes, so this is **classification**, a supervised problem.'},
    {title: 'Grape, green bean', seconds: 7, card: [{label: 'Euclidean distance', tex: 'd(q,r)=\\sqrt{(q_1-r_1)^2+(q_2-r_2)^2}', note: `grape   √((6−8)² + (4−5)²) = √5 = ${f3(D.grape)}\ngreen bean  √((6−3)² + (4−7)²) = √18 = ${f3(D['green bean'])}`}],
      caption: `Similarity is measured with a **distance**. The tomato is ${f3(D.grape)} from grape and ${f3(D['green bean'])} from green bean.`},
    {title: 'Nuts, orange', seconds: 7, card: [{label: 'same formula', note: `nuts   √((6−3)² + (4−6)²) = √13 = ${f3(D.nuts)}\norange   √((6−7)² + (4−3)²) = √2 = ${f3(D.orange)}`}],
      caption: `Nuts are ${f3(D.nuts)} away and orange is only **${f3(D.orange)}** away, so orange is the closest labeled food.`},
    {title: 'Nearest food', seconds: 8, card: [{label: 'most similar food', tex: `\\min_r d(q,r)=${f3(D.orange)}`, value: 'orange → tomato is a fruit', color: C.pink}],
      caption: 'The tomato takes the class of its **nearest** food. Orange is a fruit, so the tomato is classified as a **fruit**.'},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; label?: string}> = ({y, x, ticks, label}) => (
  <g fontFamily={mono}>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x - 6} x2={x} y1={y(t)} y2={y(t)} stroke={C.muted} /><text x={x - 10} y={y(t) + 5} fill={C.muted} fontSize={14} textAnchor="end">{t}</text></g>)}
    {label && <text transform={`translate(${x - 38},${(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2}) rotate(-90)`} fill={C.muted} fontSize={15} textAnchor="middle">{label}</text>}
  </g>
);

const S22Idea: React.FC = () => (
  <Frame title={meta.title} session={22} steps={meta.steps}>
    {(f, i, tl) => {
      /* step 1 · the same points without and with labels */
      if (i === 0) {
        const panels = [{x0: 20, title: 'no labels → unsupervised', color: false}, {x0: 400, title: 'known labels → supervised', color: true}];
        return (<g>{panels.map((pn, k) => { const px = lin(0, 10, pn.x0 + 20, pn.x0 + 320), py = lin(0, 10, 370, 70); const pa = prog(tl, f, 0, 0.8 + k * 1.2);
          return (<g key={k} opacity={pa}>
            <rect x={pn.x0} y={50} width={340} height={340} rx={12} fill="none" stroke={C.line} strokeWidth={1.5} />
            <Label x={pn.x0 + 170} y={34} text={pn.title} color={pn.color ? C.signal : C.muted} anchor="middle" weight={700} />
            {sat.map((p, j) => <Glow key={j} cx={px(p.x)} cy={py(p.y)} r={5} color={pn.color ? GROUP[p.g] : C.muted} />)}
          </g>); })}</g>);
      }
      /* steps 2–4 · SAT sketch */
      if (i <= 3) {
        const x = lin(0, 10, 80, 720), y = lin(0, 10, 372, 22);
        return (<g>
          <Arrow x1={80} y1={372} x2={730} y2={372} color={C.muted} w={1.5} />
          <Arrow x1={80} y1={372} x2={80} y2={12} color={C.muted} w={1.5} />
          <Label x={405} y={400} text="SAT math score" color={C.muted} anchor="middle" />
          <text transform="translate(58,197) rotate(-90)" fill={C.muted} fontSize={15} fontFamily={mono} textAnchor="middle">SAT reading/writing score</text>
          {sat.map((p, j) => { const a = prog(tl, f, 1, 0.4 + j * 0.04); const col = after(tl, f, 2) ? GROUP[p.g] : C.ink;
            const ca = after(tl, f, 2) ? prog(tl, f, 2, 0.5 + p.g * 0.6) : 0;
            return <Glow key={j} cx={x(p.x)} cy={lerp(y(p.y) - 40, y(p.y), a)} r={6} color={ca > 0.5 ? col : C.ink} opacity={a * (ca > 0.5 ? 1 : 0.75)} />; })}
          {after(tl, f, 2) && boxes.map((b, k) => { const p = prog(tl, f, 2, 0.5 + k * 0.6); return (<g key={k} opacity={p}>
            <rect x={x(b.x0)} y={y(b.y1)} width={x(b.x1) - x(b.x0)} height={y(b.y0) - y(b.y1)} rx={14} fill="none" stroke={GROUP[k]} strokeWidth={2.5} strokeDasharray="8 6" />
            {after(tl, f, 3) && <Label x={k === 2 ? x(b.x1) + 6 : (x(b.x0) + x(b.x1)) / 2} y={k === 2 ? y(b.y1) + 4 : y(b.y1) - 8} text={b.name} color={GROUP[k]} anchor={k === 2 ? 'start' : 'middle'} weight={700} size={17} opacity={prog(tl, f, 3, 0.6 + k * 0.5)} />}
          </g>); })}
        </g>);
      }
      /* steps 5–9 · foods and the tomato */
      const x = lin(0, 11, 80, 700), y = lin(0, 11, 380, 20);
      const near = ['grape', 'green bean', 'nuts', 'orange'];
      const shownAt: Record<string, number> = {grape: 6, 'green bean': 6, nuts: 7, orange: 7};
      const lblPos: Record<string, [number, number, 'start' | 'middle' | 'end']> = {grape: [7.0, 4.95, 'middle'], 'green bean': [4.55, 6.15, 'start'], nuts: [4.35, 4.3, 'middle'], orange: [6.35, 2.55, 'middle']};
      const tx = x(tomato[0]), ty = y(tomato[1]);
      const fin = after(tl, f, 8) ? prog(tl, f, 8, 1.2) : 0;
      return (<g>
        <AxisX x={x} y={380} ticks={[0, 2, 4, 6, 8, 10]} label="sweetness" />
        <AxisY y={y} x={80} ticks={[0, 2, 4, 6, 8, 10]} label="crunchiness" />
        {CLS.map((c, k) => <g key={k} opacity={prog(tl, f, 4, 1)}><circle cx={598} cy={136 + k * 22} r={6} fill={c.color} /><Label x={612} y={141 + k * 22} text={c.name} color={c.color} size={14} /></g>)}
        {/* distance lines from the tomato */}
        {near.map(n => { const fd = foods.find(v => v.name === n)!; const at = shownAt[n]; if (!after(tl, f, at)) return null;
          const p = prog(tl, f, at, 1.0); const win = n === 'orange'; const dim = fin > 0 && !win ? 1 - 0.7 * fin : 1;
          const [lx, ly, la] = lblPos[n];
          return (<g key={n} opacity={dim}>
            <line x1={tx} y1={ty} x2={lerp(tx, x(fd.s), p)} y2={lerp(ty, y(fd.c), p)} stroke={win && fin > 0 ? C.signal : C.noise} strokeWidth={win && fin > 0 ? 4 : 2.5} strokeDasharray={win && fin > 0 ? undefined : '6 5'} />
            <Label x={x(lx)} y={y(ly)} text={f3(D[n])} color={win && fin > 0 ? C.signal : C.noise} anchor={la} size={14} weight={700} opacity={p} />
          </g>); })}
        {foods.map((fd, k) => { const p = prog(tl, f, 4, 0.5 + k * 0.08); const col = CLS[fd.cls].color; const px = x(fd.s), py = y(fd.c);
          const dimmed = after(tl, f, 5) && !near.includes(fd.name) ? 0.45 : 1;
          return (<g key={k} opacity={p * dimmed}><Glow cx={px} cy={lerp(py - 40, py, p)} r={7} color={col} />
            <Label x={fd.side === 'l' ? px - 13 : px + 13} y={py + 5} text={fd.name} color={col} anchor={fd.side === 'l' ? 'end' : 'start'} size={14} /></g>);
        })}
        {after(tl, f, 5) && (() => { const p = prog(tl, f, 5, 0.9); const col = fin > 0.5 ? C.pink : C.white; return (<g opacity={p}>
          <circle cx={tx} cy={ty} r={16 + 4 * Math.sin(f / 7)} fill="none" stroke={col} strokeWidth={1.5} opacity={0.5} />
          <Glow cx={tx} cy={ty} r={9} color={col} />
          <Label x={tx - 14} y={ty + 34} text={fin > 0.5 ? 'tomato → fruit' : 'tomato ?'} color={fin > 0.5 ? C.pink : C.white} anchor="end" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S22Idea;
