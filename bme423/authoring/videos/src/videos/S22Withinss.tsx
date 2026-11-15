import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label, Arrow} from '../kit/plot';

// Session 22 pages 28–32. Case "s22-ages-withinss": kmeans(age, c(21, 30)); k = 3 and k = 4 values are the R output.
const ages = [20, 21, 22, 28, 35, 40, 41, 42, 43, 44];
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
const avg = (v: number[]) => sum(v) / v.length;
const ss = (v: number[]) => { const m = avg(v); return sum(v.map(a => (a - m) ** 2)); };
// final clusterings for k = 1..4 (k = 2 from c(21, 30); k = 3 and 4 as R returns them)
const parts: number[][][] = [
  [ages],
  [[20, 21, 22, 28], [35, 40, 41, 42, 43, 44]],
  [[20, 21, 22], [28, 35], [40, 41, 42, 43, 44]],
  [[20, 21, 22], [28], [35], [40, 41, 42, 43, 44]],
];
const tot = parts.map(p => sum(p.map(ss)));          // 874.4, 89.58333, 36.5, 12
const [g1, g2] = parts[1];
const c1 = avg(g1), c2 = avg(g2);                     // 22.75, 40.83333
const ss1 = ss(g1), ss2 = ss(g2);                     // 38.75, 50.83333
const mAll = avg(ages), totalSS = ss(ages);           // 33.6, 874.4
const between = totalSS - ss1 - ss2;                  // 784.81667
const f3 = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(+v.toFixed(3)));
const f2 = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(+v.toFixed(2)));

export const meta = {
  id: 's22-s22withinss', session: 22, method: 's22withinss',
  cases: {'s22-ages-withinss': [2, 3, 4, 5, 6, 7]},
  title: 'kmeans() output · within-cluster sum of squares',
  steps: [
    {title: 'R output', seconds: 7, card: [{label: 'R call', value: 'kmeans(age, c(21, 30))', note: `size 4 6 · centers ${f3(c1)}, ${f3(c2)}`}],
      caption: 'kmeans() in R clusters the ten ages. Its output lists **size**, **withinss**, tot.withinss and betweenss.'},
    {title: 'Cluster 1 SS', seconds: 8, card: [{label: `cluster 1 · centroid ${f3(c1)}`, tex: 'SS_1=\\sum_{i:y_i=1}(x_i-c_1)^2', value: `SS1 = ${f3(ss1)}`, color: GROUP[0], note: g1.map(a => f3((a - c1) ** 2)).join(' + ')}],
      caption: 'Square each age\'s distance from its centroid and add. Age 28 sits farthest out, so it gives the **biggest square**.'},
    {title: 'Cluster 2 SS', seconds: 8, card: [{label: 'cluster 2 · centroid 245/6', tex: 'SS_2=\\sum_{i:y_i=2}(x_i-c_2)^2', value: `SS2 = ${f3(ss2)}`, color: GROUP[1], note: g2.map(a => f3((a - c2) ** 2)).join(' + ')}],
      caption: 'Cluster 2 uses the unrounded centroid 245/6. Age 35 is farthest from it, so its square **dominates**.'},
    {title: 'tot.withinss', seconds: 7, card: [{label: 'tot.withinss', tex: 'SS_{\\text{within total}}=\\textstyle\\sum_{j=1}^{k}SS_j', value: `${f3(ss1)} + ${f3(ss2)} = ${f3(ss1 + ss2)}`, color: C.noise}],
      caption: 'Adding both clusters gives **tot.withinss**, the spread that is left inside the clusters.'},
    {title: 'betweenss', seconds: 8, card: [{label: 'betweenss', tex: `\\textstyle\\sum_i(x_i-\\bar x)^2-SS_{\\text{within total}}`, value: `${f3(totalSS)} − ${f3(ss1 + ss2)} = ${f3(between)}`, color: C.signal}],
      caption: `The total spread about the mean age ${f3(mAll)} is ${f3(totalSS)}. The part the clusters explain is **betweenss**, ${f3(between)}.`},
    {title: 'Compare k = 1 to 4', seconds: 9, card: [{label: 'tot.withinss by k', value: tot.map(f3).join(' → '), note: 'k = 3 and k = 4 from the R output'}],
      caption: `More clusters always lower tot.withinss. It drops about **785** from k = 1 to 2, then only about ${Math.round(tot[1] - tot[2])} and ${f3(tot[2] - tot[3])}.`},
    {title: 'Choose k', seconds: 7, card: [{label: 'number of clusters', value: 'k = 2', color: C.green, note: 'only modest improvement for k > 2'}],
      caption: 'After k = 2 the gains are **modest**, so two clusters are chosen. More clusters only split off a few ages.'},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; label?: string}> = ({y, x, ticks, label}) => (
  <g fontFamily={mono}>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x - 6} x2={x} y1={y(t)} y2={y(t)} stroke={C.muted} /><text x={x - 10} y={y(t) + 5} fill={C.muted} fontSize={14} textAnchor="end">{t}</text></g>)}
    {label && <text transform={`translate(${x - 44},${(y(ticks[0]) + y(ticks[ticks.length - 1])) / 2}) rotate(-90)`} fill={C.muted} fontSize={15} textAnchor="middle">{label}</text>}
  </g>
);

// squares laid out in a row under each cluster; side = |deviation| × 14 px, so area ∝ squared deviation
const SIDE = 14, GAP = 34, BASE = 330;
const layout = (g: number[], c: number, x0: number) => { let xx = x0; return g.map(a => { const s = Math.abs(a - c) * SIDE; const r = {a, s, x: xx, sq: (a - c) ** 2}; xx += s + GAP; return r; }); };
const sq1 = layout(g1, c1, 60), sq2 = layout(g2, c2, 372);

const S22Withinss: React.FC = () => (
  <Frame title={meta.title} session={22} steps={meta.steps}>
    {(f, i, tl) => {
      if (i <= 4) {
        const x = lin(18, 46, 60, 720); const yN = 92;
        const colorOf = (a: number) => (g1.includes(a) ? GROUP[0] : GROUP[1]);
        // which age is being squared right now (for a highlight ring)
        const active = (k: number, step: number, n: number) => k >= 0 && i === step && prog(tl, f, step, 0.6 + k * 0.9) > 0.05 && prog(tl, f, step, 0.6 + (k + 1) * 0.9) < 1 && k < n;
        return (<g>
          <AxisX x={x} y={122} ticks={[20, 25, 30, 35, 40, 45]} label="age (years)" />
          {[c1, c2].map((c, j) => <g key={j} opacity={prog(tl, f, 0, 1.6)}>
            <line x1={x(c)} x2={x(c)} y1={yN - 30} y2={yN + 16} stroke={GROUP[j]} strokeWidth={3} />
            <Label x={x(c)} y={yN - 38} text={f3(c)} color={GROUP[j]} anchor="middle" weight={700} />
          </g>)}
          {after(tl, f, 4) && <g opacity={prog(tl, f, 4)}>
            <line x1={x(mAll)} x2={x(mAll)} y1={yN - 30} y2={yN + 16} stroke={C.signal} strokeWidth={2} strokeDasharray="5 4" />
            <Label x={x(mAll)} y={yN - 38} text={`mean ${f3(mAll)}`} color={C.signal} anchor="middle" weight={700} />
          </g>}
          {ages.map((a, k) => { const p = prog(tl, f, 0, 0.4 + k * 0.08); const ring = (i === 1 && active(g1.indexOf(a), 1, 4) && g1.includes(a)) || (i === 2 && g2.includes(a) && active(g2.indexOf(a), 2, 6));
            return (<g key={k}>{ring && <circle cx={x(a)} cy={yN} r={15} fill="none" stroke={C.signal} strokeWidth={2} />}
              <Glow cx={x(a)} cy={lerp(yN - 40, yN, p)} r={6} color={colorOf(a)} opacity={p} /></g>); })}
          {/* squares of the deviations */}
          {(i === 1 || i === 2) && [{sq: sq1, step: 1, c: GROUP[0], tot: ss1, name: 'SS1'}, {sq: sq2, step: 2, c: GROUP[1], tot: ss2, name: 'SS2'}].map((grp, gi) => {
            if (!after(tl, f, grp.step)) return null;
            return (<g key={gi}>{grp.sq.map((s, k) => { const p = prog(tl, f, grp.step, 0.6 + (k + 1) * 0.9); const pk = i === grp.step ? Math.min(1, p * 1.0) : 1; const side = Math.max(2, s.s * pk);
              return (<g key={k} opacity={pk > 0 ? 1 : 0}>
                <rect x={s.x + (s.s - side) / 2} y={BASE - side} width={side} height={side} fill={grp.c} opacity={0.35} stroke={grp.c} strokeWidth={2} />
                <Label x={s.x + s.s / 2} y={BASE - s.s - 8} text={String(s.a)} color={C.muted} anchor="middle" size={13} opacity={pk} />
                <Label x={s.x + s.s / 2} y={BASE + 20} text={f2(s.sq)} color={grp.c} anchor="middle" size={13} opacity={pk} weight={700} />
              </g>); })}
              <Label x={(grp.sq[0].x + grp.sq[grp.sq.length - 1].x + grp.sq[grp.sq.length - 1].s) / 2} y={BASE + 56} text={`${grp.name} = ${f3(grp.tot)}`} color={grp.c} anchor="middle" weight={700} size={17} opacity={prog(tl, f, grp.step, 0.6 + (grp.sq.length + 1) * 0.9)} />
            </g>);
          })}
          {/* stacked bar of the total sum of squares */}
          {i >= 3 && (() => { const bx = lin(0, totalSS, 60, 700); const p = prog(tl, f, 3, 1.2); const q = i >= 4 ? prog(tl, f, 4, 1.6) : 0; const y0 = 250, h = 44; return (<g>
            {i >= 4 && <rect x={bx(0)} y={y0} width={bx(totalSS) - bx(0)} height={h} rx={6} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={q} />}
            <rect x={bx(0)} y={y0} width={(bx(ss1) - bx(0)) * p} height={h} fill={GROUP[0]} opacity={0.8} />
            <rect x={bx(ss1)} y={y0} width={(bx(ss1 + ss2) - bx(ss1)) * p} height={h} fill={GROUP[1]} opacity={p > 0.05 ? 0.8 : 0} />
            <Label x={bx(ss1 + ss2) + 12} y={y0 + 28} text={`tot.withinss ${f3(ss1 + ss2)}`} color={C.noise} weight={700} opacity={p * (1 - q)} />
            <Label x={bx(0)} y={y0 - 14} text={`${f3(ss1)} + ${f3(ss2)}`} color={C.muted} size={13} opacity={p * (1 - q)} />
            {i >= 4 && <>
              <rect x={bx(ss1 + ss2)} y={y0} width={(bx(totalSS) - bx(ss1 + ss2)) * q} height={h} fill={C.signal} opacity={0.85} />
              <Label x={bx(0)} y={y0 + h + 26} text={`within ${f3(ss1 + ss2)}`} color={C.noise} size={14} weight={700} opacity={q} />
              <Label x={(bx(ss1 + ss2) + bx(totalSS)) / 2} y={y0 + h + 26} text={`betweenss ${f3(between)}`} color={C.signal} anchor="middle" size={15} weight={700} opacity={q} />
              <Label x={(bx(0) + bx(totalSS)) / 2} y={y0 - 14} text={`total about the mean = ${f3(totalSS)}`} color={C.ink} anchor="middle" size={15} weight={700} opacity={q} />
            </>}
          </g>); })()}
        </g>);
      }
      /* compare k = 1..4 and the elbow */
      const x = lin(18, 46, 80, 360); const rows = [62, 142, 222, 302];
      const xk = lin(1, 4, 490, 720), yk = lin(0, 900, 360, 50);
      const choose = i === 6 ? prog(tl, f, 6, 1.2) : 0;
      const shown = (k: number) => (i === 5 ? prog(tl, f, 5, 0.8 + k * 1.3) : 1);
      return (<g>
        {parts.map((pp, k) => { const a = shown(k); const dim = choose > 0 && k !== 1 ? 1 - 0.6 * choose : 1; const yy = rows[k]; return (<g key={k} opacity={a * dim}>
          <Label x={8} y={yy + 5} text={`k = ${k + 1}`} color={k === 1 && choose > 0 ? C.green : C.ink} weight={700} />
          <line x1={x(18)} x2={x(46)} y1={yy + 18} y2={yy + 18} stroke={C.line} strokeWidth={1.5} />
          {[20, 30, 40].map(t => <text key={t} x={x(t)} y={yy + 36} fill={C.muted} fontSize={12} fontFamily={mono} textAnchor="middle">{t}</text>)}
          {pp.map((g, j) => <g key={j}>
            <line x1={x(avg(g))} x2={x(avg(g))} y1={yy - 12} y2={yy + 12} stroke={GROUP[j]} strokeWidth={2.5} />
            {g.map(v => <Glow key={v} cx={x(v)} cy={yy} r={4} color={GROUP[j]} />)}
          </g>)}
        </g>); })}
        <AxisX x={xk} y={360} ticks={[1, 2, 3, 4]} label="number of clusters k" />
        <AxisY y={yk} x={470} ticks={[0, 200, 400, 600, 800]} label="tot.withinss" />
        {(() => { const n = i === 5 ? Math.max(0, Math.min(3, (f - tl.starts[5]) / 30 / 1.3 - 0.2)) : 3;
          const pts = tot.map((v, k) => [xk(k + 1), yk(v)]);
          const k0 = Math.floor(n), fr = n - k0;
          const path = pts.slice(0, k0 + 1).map((p, k) => `${k ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ') + (k0 < 3 ? ` L${lerp(pts[k0][0], pts[k0 + 1][0], fr)},${lerp(pts[k0][1], pts[k0 + 1][1], fr)}` : '');
          return (<g>
            <path d={path} fill="none" stroke={C.noise} strokeWidth={3} />
            {pts.map((p, k) => { const a = shown(k); const lpos = [[14, 5, 'start'], [-14, 4, 'end'], [0, -14, 'middle'], [0, -14, 'middle']][k] as [number, number, 'start' | 'middle' | 'end'];
              return (<g key={k} opacity={a}><Glow cx={p[0]} cy={p[1]} r={7} color={k === 1 && choose > 0 ? C.green : C.noise} />
                <Label x={p[0] + lpos[0]} y={p[1] + lpos[1]} text={f2(tot[k])} color={C.ink} anchor={lpos[2]} size={14} weight={700} /></g>); })}
          </g>); })()}
        {choose > 0 && <g opacity={choose}>
          <circle cx={xk(2)} cy={yk(tot[1])} r={20} fill="none" stroke={C.green} strokeWidth={2.5} />
          <Arrow x1={xk(2) + 90} y1={yk(tot[1]) - 120} x2={xk(2) + 18} y2={yk(tot[1]) - 18} color={C.green} w={3} />
          <Label x={xk(2) + 90} y={yk(tot[1]) - 128} text="elbow · k = 2" color={C.green} weight={700} anchor="middle" />
        </g>}
      </g>);
    }}
  </Frame>
);

export default S22Withinss;
