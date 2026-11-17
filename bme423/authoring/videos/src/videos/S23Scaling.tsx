import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 23 page 13 (summary() of the Wisconsin features), page 16 (normalize() = min-max), page 19 (scale() = z-score)
// and pages 17/19 (test accuracy 0.98 with min-max, 0.95 with z-scores, K = 21). Case "s23-radius-minmax".
const feats = [
  {name: 'area_mean', lo: 143.5, hi: 2501.0, c: C.pink},
  {name: 'radius_mean', lo: 6.981, hi: 28.110, c: C.signal},
  {name: 'smoothness_mean', lo: 0.05263, hi: 0.16340, c: C.noise},
];
const mn = 6.981, q1 = 11.7, med = 13.37, mean = 14.127, q3 = 15.78, mx = 28.11;
const R = mx - mn;                                      // 21.129
const sc = (v: number) => (v - mn) / R;                 // 0.33821 (mean), 0.30238 (median), 1 (max)
const f5 = (v: number) => String(+v.toFixed(5));
const f3 = (v: number) => v.toFixed(3);

export const meta = {
  id: 's23-s23scaling', session: 23, method: 's23scaling',
  cases: {'s23-radius-minmax': [2, 3, 4, 5]},
  title: 'Scaling before K-NN · min-max and z-score',
  steps: [
    {title: 'Different ranges', seconds: 8, card: [{label: 'summary() ranges', note: 'area_mean 143.5 to 2501.0\nradius_mean 6.981 to 28.110\nsmoothness_mean 0.05263 to 0.16340'}],
      caption: 'The features have very different ranges, so without scaling **area** would decide almost every distance.'},
    {title: 'Min and max', seconds: 7, card: [{label: 'radius_mean', tex: '\\min(x)=6.981,\\ \\max(x)=28.110', note: `median ${med.toFixed(3)} · mean ${mean}`}],
      caption: 'The summary of radius_mean gives a **minimum of 6.981** and a **maximum of 28.110**.'},
    {title: 'Range', seconds: 7, card: [{label: 'range', tex: 'R=\\max(x)-\\min(x)', value: `28.110 − 6.981 = ${f3(R)}`, color: C.noise}],
      caption: `The range is **${f3(R)}**. It is the denominator of every normalized radius value.`},
    {title: 'Normalize the mean', seconds: 8, card: [{label: 'min-max normalization', tex: 'x_{\\text{scaled}}=\\frac{x-\\min(x)}{\\max(x)-\\min(x)}', value: `${(mean - mn).toFixed(3)} / ${f3(R)} = ${f5(sc(mean))}`, color: C.signal, note: `14.127 − 6.981 = ${(mean - mn).toFixed(3)}`}],
      caption: `Subtract the minimum first, then divide by the range. The mean radius 14.127 becomes **${f5(sc(mean))}**.`},
    {title: 'Median and max', seconds: 8, card: [{label: 'median and maximum', value: `13.370 → ${f5(sc(med))} · 28.110 → 1`, color: C.signal, note: `(13.370 − 6.981) / ${f3(R)} = ${(med - mn).toFixed(3)} / ${f3(R)}`}],
      caption: `The median becomes **${f5(sc(med))}**. The maximum always maps to 1 and the minimum to 0, so every value lies between.`},
    {title: 'Every feature 0 to 1', seconds: 7, card: [{label: 'normalize() on all 30 columns', note: 'lapply(wbcd[2:31], normalize)\nevery feature now runs from 0 to 1'}],
      caption: 'Applied to every column, normalization puts **all features on 0 to 1**, so each one counts in the distance.'},
    {title: 'z-score instead', seconds: 8, card: [{label: 'z-score standardization', tex: 'z=\\frac{x-\\bar x}{s_x}', value: 'K = 21 · 95 of 100 correct', color: C.purple, note: 'min-max gave 98 of 100 correct'}],
      caption: 'The **z-score** subtracts the mean and divides by the SD, with no fixed limits. Here it got 95 right instead of 98.'},
  ] as Step[],
};

const S23Scaling: React.FC = () => (
  <Frame title={meta.title} session={23} steps={meta.steps}>
    {(f, i, tl) => {
      /* steps 1 and 6: three features on raw, then on scaled axes */
      if (i === 0 || i === 5) {
        const m = i === 5 ? prog(tl, f, 5, 1.8) : 0; const xr = lin(0, 2600, 190, 720), xs = lin(0, 1, 190, 720);
        return (<g>
          <g opacity={1 - m}><AxisX x={xr} y={360} ticks={[0, 500, 1000, 1500, 2000, 2500]} label="raw value" /></g>
          <g opacity={m}><AxisX x={xs} y={360} ticks={[0, 0.25, 0.5, 0.75, 1]} label="min-max scaled (0 to 1)" /></g>
          {feats.map((ft, k) => { const yy = 90 + k * 95; const a = prog(tl, f, i, 0.6 + k * 0.4);
            const x0 = lerp(xr(ft.lo), xs(0), m), x1 = lerp(xr(ft.hi), xs(1), m); const w = Math.max(3, (x1 - x0) * a);
            return (<g key={k}>
              <Label x={178} y={yy + 5} text={ft.name} color={ft.c} anchor="end" weight={700} size={14} />
              <rect x={x0} y={yy - 14} width={w} height={28} rx={5} fill={ft.c} opacity={0.8} />
              <Label x={x0} y={yy + 36} text={m > 0.5 ? '0 to 1' : `${ft.lo} to ${ft.hi.toFixed(ft.hi < 1 ? 5 : ft.hi > 100 ? 1 : 3)}`} color={C.muted} size={13} opacity={a} />
            </g>); })}
        </g>);
      }
      /* steps 2–5: radius_mean on its raw axis, then mapped onto 0..1 */
      if (i >= 1 && i <= 4) {
        const X = lin(0, 30, 60, 720); const S = (s: number) => lerp(X(mn), X(mx), s); const yr = 150, ys = 340;
        const pts = [{v: mn, lab: `min ${mn}`, tier: 1, an: 'middle' as const}, {v: q1, lab: '', tier: 0, an: 'middle' as const}, {v: med, lab: `median ${med.toFixed(3)}`, tier: 2, an: 'end' as const},
          {v: mean, lab: `mean ${mean}`, tier: 0, an: 'start' as const}, {v: q3, lab: '', tier: 0, an: 'middle' as const}, {v: mx, lab: `max ${mx.toFixed(3)}`, tier: 1, an: 'middle' as const}];
        const pR = i === 2 ? prog(tl, f, 2, 1.6) : i > 2 ? 1 : 0;
        const pShift = i === 3 ? prog(tl, f, 3, 1.6) : i > 3 ? 1 : 0, pDiv = i === 3 ? prog(tl, f, 3, 3.6) : i > 3 ? 1 : 0;
        const pMed = i === 4 ? prog(tl, f, 4, 1.8) : 0, pMax = i === 4 ? prog(tl, f, 4, 3.4) : 0;
        const showScaled = i >= 3;
        return (<g>
          <Label x={10} y={yr - 30} text="raw" color={C.muted} size={14} />
          <AxisX x={X} y={yr} ticks={[0, 5, 10, 15, 20, 25, 30]} label="radius_mean" />
          {pts.map((p, k) => { const a = prog(tl, f, 1, 0.5 + k * 0.2); const key = p.v === mn || p.v === mx; const xx = X(p.v) + (p.an === 'end' ? 4 : p.an === 'start' ? -4 : 0);
            return (<g key={k} opacity={a}>
              <Glow cx={X(p.v)} cy={yr - 14} r={key ? 8 : 5} color={key ? C.signal : C.muted} />
              {p.lab && <Label x={xx} y={p.tier === 1 ? yr - 34 : p.tier === 2 ? yr - 84 : yr - 60} text={p.lab} color={key ? C.signal : C.muted} anchor={p.an} size={14} weight={key ? 700 : 400} />}
            </g>); })}
          {pR > 0 && <g opacity={pR}>
            <path d={`M${X(mn)},${yr + 58} L${X(mn)},${yr + 68} L${lerp(X(mn), X(mx), pR)},${yr + 68} L${lerp(X(mn), X(mx), pR)},${yr + 58}`} fill="none" stroke={C.noise} strokeWidth={3} />
            <Label x={(X(mn) + X(mx)) / 2} y={yr + 92} text={`range ${f3(R)}`} color={C.noise} anchor="middle" weight={700} size={15} opacity={pR} />
          </g>}
          {showScaled && <g>
            <Label x={10} y={ys - 30} text="scaled" color={C.muted} size={14} />
            <AxisX x={S} y={ys} ticks={[0, 0.25, 0.5, 0.75, 1]} label="min-max scaled radius" />
          </g>}
          {i >= 3 && <g>
            {/* x − min as a bar, then dropped onto the scaled axis */}
            <rect x={X(mn)} y={yr + 104} width={(X(mean) - X(mn)) * pShift} height={14} rx={4} fill={C.signal} opacity={0.7} />
            {i === 3 && <Label x={X(mean) + 10} y={yr + 116} text={`14.127 − 6.981 = ${(mean - mn).toFixed(3)}`} color={C.signal} size={14} weight={700} opacity={pShift} />}
            <line x1={X(mean)} x2={X(mean)} y1={yr - 6} y2={lerp(yr - 6, ys - 14, pDiv)} stroke={C.signal} strokeWidth={2} strokeDasharray="5 5" />
            {pDiv > 0.98 && <Glow cx={S(sc(mean))} cy={ys - 14} r={8} color={C.signal} />}
            <Label x={S(sc(mean)) + 6} y={ys - 34} text={f5(sc(mean))} color={C.signal} weight={700} size={15} opacity={pDiv > 0.98 ? 1 : 0} />
          </g>}
          {i >= 4 && <g>
            <line x1={X(med)} x2={X(med)} y1={yr - 6} y2={lerp(yr - 6, ys - 14, pMed)} stroke={C.pink} strokeWidth={2} strokeDasharray="5 5" />
            {pMed > 0.98 && <Glow cx={S(sc(med))} cy={ys - 14} r={8} color={C.pink} />}
            <Label x={S(sc(med)) - 6} y={ys - 34} text={f5(sc(med))} color={C.pink} anchor="end" weight={700} size={15} opacity={pMed > 0.98 ? 1 : 0} />
            <line x1={X(mx)} x2={X(mx)} y1={yr - 6} y2={lerp(yr - 6, ys - 14, pMax)} stroke={C.green} strokeWidth={2} strokeDasharray="5 5" />
            <line x1={X(mn)} x2={X(mn)} y1={yr - 6} y2={lerp(yr - 6, ys - 14, pMax)} stroke={C.green} strokeWidth={2} strokeDasharray="5 5" />
            {pMax > 0.98 && <g><Glow cx={S(1)} cy={ys - 14} r={8} color={C.green} /><Glow cx={S(0)} cy={ys - 14} r={8} color={C.green} /></g>}
            <Label x={S(1) + 12} y={ys - 9} text="1" color={C.green} weight={700} size={15} opacity={pMax > 0.98 ? 1 : 0} />
            <Label x={S(0) - 12} y={ys - 9} text="0" color={C.green} anchor="end" weight={700} size={15} opacity={pMax > 0.98 ? 1 : 0} />
          </g>}
        </g>);
      }
      /* step 7: accuracy with min-max versus z-score, K = 21 (pages 17 and 19) */
      const xb = lin(0, 100, 210, 690); const rows = [{name: 'min-max', n: 98, c: C.signal}, {name: 'z-score', n: 95, c: C.purple}];
      return (<g>
        <Label x={380} y={50} text="test samples classified correctly (K = 21, n = 100)" color={C.muted} anchor="middle" size={15} />
        <AxisX x={xb} y={330} ticks={[0, 20, 40, 60, 80, 100]} label="correct of 100" />
        {rows.map((r, k) => { const a = prog(tl, f, 6, 1 + k * 0.8); const yy = 140 + k * 100;
          return (<g key={k}>
            <Label x={196} y={yy + 6} text={r.name} color={r.c} anchor="end" weight={700} size={16} />
            <rect x={xb(0)} y={yy - 18} width={(xb(r.n) - xb(0)) * a} height={36} rx={6} fill={r.c} opacity={0.8} />
            <Label x={xb(r.n) - 10} y={yy + 6} text={String(Math.round(r.n * a))} color={C.bg} anchor="end" weight={700} size={16} opacity={a > 0.3 ? 1 : 0} />
          </g>); })}
        <Label x={xb(100)} y={288} text="5 false negatives instead of 2" color={C.red} anchor="end" size={14} weight={700} opacity={prog(tl, f, 6, 3.2)} />
      </g>);
    }}
  </Frame>
);

export default S23Scaling;
