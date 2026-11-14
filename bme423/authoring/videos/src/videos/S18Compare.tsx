import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label, range} from '../kit/plot';

// Session 18 pages 27-36: Plutonian heights (in) and weights (lb), 18 males and 18 females. Case "s18-plutonian-slopes".
const MX = [62, 64, 71, 73, 68, 65, 64, 64, 71, 67, 66, 65, 68, 69, 68, 73, 70, 67];
const MY = [198, 207, 228, 233, 217, 212, 204, 201, 228, 218, 210, 212, 219, 226, 222, 237, 222, 219];
const FX = [61, 56, 64, 61, 63, 71, 63, 58, 63, 59, 66, 67, 63, 70, 65, 65, 63, 60];
const FY = [119, 128, 128, 143, 125, 153, 142, 126, 136, 128, 151, 141, 133, 154, 127, 142, 133, 123];
// lm() output (pages 31 and 34)
const aM = -4.2329, bM = 3.2833, sbM = 0.2041, saM = 13.7901;
const aF = 6.8349, bF = 2.0290, sbF = 0.4708, saF = 29.8197;
const nM = 18, nF = 18;
const diff = bM - bF;                              // 1.2543
const se = Math.sqrt(sbM ** 2 + sbF ** 2);         // 0.5131369
const t = diff / se;                               // 2.444377
const nu = nM + nF - 4;                            // 32
const t05 = 2.037, t02 = 2.449;                    // class t table, row 32, columns 0.05 and 0.02
const tA = (aM - aF) / Math.sqrt(saM ** 2 + saF ** 2); // -0.3368789

const lgamma = (z: number): number => { const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z); z -= 1; let s = c[0]; for (let k = 1; k < g + 2; k++) s += c[k] / (z + k); const w = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(w) - w + Math.log(s); };
const tPdf = (v: number, df: number) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2)) / Math.sqrt(df * Math.PI) * (1 + v * v / df) ** (-(df + 1) / 2);

export const meta = {
  id: 's18-s18compare', session: 18, method: 's18compare',
  title: 'Comparing two regression slopes',
  cases: {'s18-plutonian-slopes': [3, 4, 5, 6, 6, 7, 8, 9]},
  steps: [
    {title: 'Two groups', seconds: 7, caption: 'Eighteen male and eighteen female Plutonians. Each sex gets its **own regression line** of weight on height.',
      card: [{label: 'lm() fits', note: 'males    ŷ = −4.2329 + 3.2833x\nfemales  ŷ = 6.8349 + 2.0290x'}]},
    {title: 'Each slope first', seconds: 7, caption: 'First check that each slope differs from zero. Both do, so comparing the two slopes **makes sense**.',
      card: [{label: 'each slope against 0', note: 'males    t = 16.088 · P = 2.66e−11\nfemales  t = 4.309 · P = 0.00054'}]},
    {title: 'Hypotheses', seconds: 7, caption: 'This is the **t test for two slopes**. The null hypothesis says weight rises with height at the same rate in each sex.',
      card: [{label: 'hypotheses', tex: 'H_0:\\beta_M=\\beta_F\\qquad H_A:\\beta_M\\ne\\beta_F'}]},
    {title: 'Slope difference', seconds: 6, caption: 'With both lines started at one point, only the angles differ. Males gain about **1.25 lb more per inch**.',
      card: [{label: 'difference (males − females)', tex: 'b_M-b_F', value: `3.2833 − 2.0290 = ${diff.toFixed(4)} lb/in`, color: C.signal}]},
    {title: 'SE of the difference', seconds: 8, caption: 'With equal group sizes, add the two slope **variances** and take the root. The female slope is much less certain.',
      card: [{label: 'SE of the difference', tex: 's_{b_M-b_F}=\\sqrt{s_{b_M}^2+s_{b_F}^2}', value: `√(0.2041² + 0.4708²) = ${se.toFixed(4)}`, color: C.noise}]},
    {title: 't and df', seconds: 8, caption: 'The difference is about **2.44 standard errors**. Each line uses two degrees of freedom, so ν = 18 + 18 − 4 = 32.',
      card: [{label: 't statistic', tex: 't=\\frac{b_M-b_F}{s_{b_M-b_F}},\\quad\\nu=n_1+n_2-4', value: `${diff.toFixed(4)} / ${se.toFixed(4)} = ${t.toFixed(3)} · ν = ${nu}`, color: C.signal}]},
    {title: 'Class t table', seconds: 8, caption: 'Use the **class t table** (two-tailed). Row 32 gives **2.037** at 0.05 and **2.449** at 0.02.',
      card: [{label: 'class t table, row 32', value: '0.05 → 2.037 · 0.02 → 2.449', color: C.signal}]},
    {title: 'Decision', seconds: 8, caption: 'The statistic passes 2.037 but not 2.449, so **reject equal slopes** with 0.02 < P < 0.05. Males gain weight faster.',
      card: [{label: 'decision', value: '0.02 < P < 0.05 → slopes differ', color: C.green, note: `2.037 < ${t.toFixed(3)} < 2.449`}]},
    {title: 'Intercepts', seconds: 7, caption: 'The same formula with intercepts gives |t| = 0.337, below 2.037, so the **intercepts do not differ**.',
      card: [{label: 'intercept test', tex: 't=\\frac{a_M-a_F}{\\sqrt{s_{a_M}^2+s_{a_F}^2}}', value: `−11.0678 / 32.854 = ${tA.toFixed(3)}`, color: C.green, note: '|t| < 2.037 → no difference in intercepts'}]},
  ] as Step[],
};

const x = lin(54, 76, 70, 735), y = lin(110, 245, 360, 20);
const PX = 56, PY = 130, PX2 = 74;                 // common starting point for the slope comparison
const TABLE: Record<string, string[]> = {'31': ['1.696', '2.040', '2.453', '2.744'], '32': ['1.694', '2.037', '2.449', '2.738'], '33': ['1.692', '2.035', '2.445', '2.733']};
const COLS = ['0.10', '0.05', '0.02', '0.01'];

const S18Compare: React.FC = () => (
  <Frame title={meta.title} session={18} steps={meta.steps}>
    {(f, i, tl) => {
      const out: React.ReactNode[] = [];
      if (i <= 4) {
        const piv = i < 2 ? 0 : i === 2 ? prog(tl, f, 2, 2.2) : 1;            // 0 = fitted place, 1 = common start
        const ptsA = i < 2 ? 1 : 1 - 0.8 * piv;
        const seg = (aa: number, bb: number, x1: number, x2: number) => {
          const sx1 = lerp(x1, PX, piv), sx2 = lerp(x2, PX2, piv);
          const f0 = (v: number) => lerp(aa + bb * v, PY + bb * (v - PX), piv);
          return {x1: sx1, x2: sx2, y1: f0(sx1), y2: f0(sx2)}; };
        const m = seg(aM, bM, 61, 74), fm = seg(aF, bF, 55, 72);
        out.push(<g key="plot">
          <AxisX x={x} y={370} ticks={[54, 58, 62, 66, 70, 74]} label="height (in)" />
          <g fontFamily={mono}><line x1={60} x2={60} y1={y(110)} y2={y(240)} stroke={C.muted} strokeWidth={1.5} />
            {[120, 140, 160, 180, 200, 220, 240].map(v => <g key={v}><line x1={54} x2={60} y1={y(v)} y2={y(v)} stroke={C.muted} /><text x={50} y={y(v) + 5} fill={C.muted} fontSize={14} textAnchor="end">{v}</text></g>)}
            <text x={14} y={190} fill={C.muted} fontSize={15} textAnchor="middle" transform="rotate(-90 14 190)">weight (lb)</text></g>
          {MX.map((v, k) => { const p = prog(tl, f, 0, 0.4 + k * 0.05); return <Glow key={'m' + k} cx={x(v)} cy={lerp(y(MY[k]) - 40, y(MY[k]), p)} r={5} color={GROUP[0]} opacity={p * ptsA} />; })}
          {FX.map((v, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.05); return <Glow key={'f' + k} cx={x(v)} cy={lerp(y(FY[k]) - 40, y(FY[k]), p)} r={5} color={GROUP[1]} opacity={p * ptsA} />; })}
          {/* SE wedges around each slope */}
          {i === 4 && (() => { const p = prog(tl, f, 4, 1.6); const wedge = (bb: number, s: number) =>
            `${x(PX)},${y(PY)} ${x(PX2)},${y(PY + (bb + s * p) * (PX2 - PX))} ${x(PX2)},${y(PY + (bb - s * p) * (PX2 - PX))}`;
            return (<g>
              <polygon points={wedge(bM, sbM)} fill={GROUP[0]} fillOpacity={0.25} stroke={GROUP[0]} strokeOpacity={0.6} />
              <polygon points={wedge(bF, sbF)} fill={GROUP[1]} fillOpacity={0.25} stroke={GROUP[1]} strokeOpacity={0.6} />
              <Label x={x(PX2) + 8} y={y(PY + bM * 18) + 5} text={`± ${sbM}`} color={GROUP[0]} size={13} opacity={p} />
              <Label x={x(PX2) + 8} y={y(PY + bF * 18) + 5} text={`± ${sbF}`} color={GROUP[1]} size={13} opacity={p} />
            </g>); })()}
          <line x1={x(m.x1)} x2={x(m.x2)} y1={y(m.y1)} y2={y(m.y2)} stroke={GROUP[0]} strokeWidth={3} opacity={prog(tl, f, 0, 2.4)} />
          <line x1={x(fm.x1)} x2={x(fm.x2)} y1={y(fm.y1)} y2={y(fm.y2)} stroke={GROUP[1]} strokeWidth={3} opacity={prog(tl, f, 0, 2.6)} />
          {i < 2 && <g opacity={prog(tl, f, 0, 2.6)}>
            <Label x={80} y={40} text="males  n = 18" color={GROUP[0]} size={15} weight={700} />
            <Label x={735} y={345} text="females  n = 18" color={GROUP[1]} size={15} weight={700} anchor="end" />
          </g>}
          {i >= 2 && <g opacity={piv}>
            <Label x={x(PX2) - 4} y={y(m.y2) - 14} text="males" color={GROUP[0]} size={14} anchor="end" />
            <Label x={x(PX2) - 4} y={y(fm.y2) + 26} text="females" color={GROUP[1]} size={14} anchor="end" />
          </g>}
          {/* slope triangles */}
          {i === 1 && (() => { const p = prog(tl, f, 1, 1.6); const tri = (aa: number, bb: number, x1: number, c: string) => { const x2 = x1 + 6; return (<g>
            <line x1={x(x1)} x2={x(x2)} y1={y(aa + bb * x1)} y2={y(aa + bb * x1)} stroke={C.ink} strokeWidth={2} opacity={p} />
            <line x1={x(x2)} x2={x(x2)} y1={y(aa + bb * x1)} y2={y(lerp(aa + bb * x1, aa + bb * x2, p))} stroke={c} strokeWidth={3} /></g>); };
            return (<g>{tri(aM, bM, 64, GROUP[0])}{tri(aF, bF, 60, GROUP[1])}
              <Label x={x(70) + 8} y={y(213)} text="3.28 lb/in" color={GROUP[0]} size={14} weight={700} opacity={p} />
              <Label x={x(66) + 10} y={345} text="2.03 lb/in" color={GROUP[1]} size={14} weight={700} opacity={p} /></g>); })()}
          {/* slope difference bracket */}
          {i === 3 && (() => { const p = prog(tl, f, 3, 1.2); const yTop = PY + bM * 18, yBot = PY + bF * 18; return (<g opacity={p}>
            <line x1={x(PX2) + 10} x2={x(PX2) + 10} y1={y(yBot)} y2={y(lerp(yBot, yTop, p))} stroke={C.signal} strokeWidth={4} />
            <Label x={735} y={292} text="gap over 18 in" color={C.signal} size={13} anchor="end" />
            <Label x={735} y={310} text={`1.2543 × 18 = ${(diff * 18).toFixed(1)} lb`} color={C.signal} size={13} anchor="end" />
          </g>); })()}
        </g>);
      }
      // t and nu: count standard errors in the slope difference
      if (i === 5) { const xs = lin(-0.2, 1.6, 80, 700), xt = lin(-0.2 / se, 1.6 / se, 80, 700); const p = prog(tl, f, 5, 0.8); const nb = Math.min(t, prog(tl, f, 5, 3.5) * t);
        out.push(<g key="t" opacity={p}>
          <AxisX x={xs} y={150} ticks={[0, 0.4, 0.8, 1.2, 1.6]} label="slope difference (lb/in)" />
          {[0, 1, 2].map(k => { const w = Math.max(0, Math.min(1, nb - k)); return w > 0 ? <rect key={k} x={xs(k * se) + 1} y={114} width={Math.max(0, (xs(se) - xs(0)) * w - 2)} height={28} rx={4} fill={C.noise} fillOpacity={0.25} stroke={C.noise} strokeWidth={1.5} /> : null; })}
          <Label x={xs(se / 2)} y={106} text="SE 0.513" color={C.noise} size={13} anchor="middle" />
          <line x1={xs(0)} x2={xs(0)} y1={70} y2={320} stroke={C.red} strokeDasharray="5 5" />
          <Label x={xs(0)} y={62} text="0 = equal slopes" color={C.red} size={13} anchor="middle" />
          <Glow cx={xs(diff)} cy={150} r={8} color={C.signal} />
          <Label x={xs(diff)} y={62} text="1.2543" color={C.signal} size={14} anchor="middle" weight={700} />
          <line x1={xs(diff)} x2={xs(diff)} y1={72} y2={320} stroke={C.signal} strokeDasharray="5 5" strokeOpacity={0.6} />
          <AxisX x={xt} y={320} ticks={[0, 1, 2, 3]} label="t = difference ÷ SE" />
          {nb >= t - 0.01 && <g opacity={prog(tl, f, 5, 4.4)}><Glow cx={xt(t)} cy={320} r={8} color={C.signal} />
            <Label x={xt(t) + 14} y={300} text={`t = ${t.toFixed(3)}`} color={C.signal} size={15} weight={700} /></g>}
        </g>); }
      // class t table
      if (i === 6) { const p = prog(tl, f, 6), x0 = 120, y0 = 100, cw = 130, rh = 54;
        out.push(<g key="tab" opacity={p}>
          <Label x={x0} y={y0 - 34} text="class t table · two-tailed α" color={C.muted} size={14} />
          {COLS.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === '0.05' || c === '0.02' ? C.signal : C.muted} anchor="middle" weight={700} />)}
          {Object.entries(TABLE).map(([row, vs], ri) => (<g key={row}>
            <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${row}`} color={row === '32' ? C.signal : C.muted} weight={700} />
            {vs.map((v, ci) => { const hit = row === '32' && (COLS[ci] === '0.05' || COLS[ci] === '0.02'); return (<g key={ci}>
              {hit && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 6, 2.4)} />}
              <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={hit ? 700 : 400} /></g>); })}
          </g>))}
        </g>); }
      // t curve with cutoffs (decision) and the intercept test
      if (i >= 7) { const xt = lin(-4, 4, 60, 720), base = 230, yk = (v: number) => base - v * 420; const p = prog(tl, f, 7, 0.8);
        const pts = range(-4, 4, 161); const path = pts.map((v, k) => `${k ? 'L' : 'M'}${xt(v).toFixed(1)},${yk(tPdf(v, nu)).toFixed(1)}`).join(' ');
        const tail = (lo: number, hi: number) => { const r = range(lo, hi, 50); return `M${xt(lo)},${base} ` + r.map(v => `L${xt(v).toFixed(1)},${yk(tPdf(v, nu)).toFixed(1)}`).join(' ') + ` L${xt(hi)},${base} Z`; };
        const tv = i === 7 ? lerp(0, t, prog(tl, f, 7, 2.6)) : lerp(t, tA, prog(tl, f, 8, 2));
        const zoomA = i === 7 ? prog(tl, f, 7, 3.4) : 1 - prog(tl, f, 8, 0.8);
        const xz = lin(2.40, 2.47, 160, 700);
        out.push(<g key="curve" opacity={p}>
          <path d={tail(-4, -t05)} fill={C.signal} fillOpacity={0.3} /><path d={tail(t05, 4)} fill={C.signal} fillOpacity={0.3} />
          <path d={path} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <AxisX x={xt} y={base} ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} />
          <Label x={720} y={base + 44} text={`t with ν = ${nu}`} color={C.muted} size={14} anchor="end" />
          {[-t05, t05].map(c => <line key={c} x1={xt(c)} x2={xt(c)} y1={base} y2={60} stroke={C.signal} strokeWidth={2} strokeDasharray="5 4" />)}
          <Label x={xt(-t05)} y={50} text="−2.037" color={C.signal} size={14} anchor="middle" />
          <Label x={xt(t05) - 6} y={50} text="2.037" color={C.signal} size={14} anchor="end" />
          <line x1={xt(t02)} x2={xt(t02)} y1={base} y2={60} stroke={C.pink} strokeWidth={2} strokeDasharray="2 4" />
          <Label x={xt(t02) + 6} y={50} text="2.449" color={C.pink} size={14} />
          <Glow cx={xt(tv)} cy={base} r={9} color={C.green} />
          <Label x={xt(tv)} y={base - 34} text={`t = ${tv.toFixed(3)}`} color={C.green} size={15} anchor="middle" weight={700} />
          {zoomA > 0 && <g opacity={zoomA}>
            <line x1={xt(2.40)} x2={xz(2.40)} y1={base + 4} y2={330} stroke={C.muted} strokeOpacity={0.5} />
            <line x1={xt(2.47)} x2={xz(2.47)} y1={base + 4} y2={330} stroke={C.muted} strokeOpacity={0.5} />
            <line x1={xz(2.40)} x2={xz(2.47)} y1={340} y2={340} stroke={C.muted} strokeWidth={1.5} />
            {[2.40, 2.42, 2.44, 2.46].map(v => <g key={v}><line x1={xz(v)} x2={xz(v)} y1={340} y2={346} stroke={C.muted} /><text x={xz(v)} y={362} fill={C.muted} fontSize={13} fontFamily={mono} textAnchor="middle">{v.toFixed(2)}</text></g>)}
            <line x1={xz(t02)} x2={xz(t02)} y1={300} y2={340} stroke={C.pink} strokeWidth={2} />
            <Label x={xz(t02) + 6} y={306} text="2.449" color={C.pink} size={13} />
            <Glow cx={xz(t)} cy={340} r={8} color={C.green} />
            <Label x={xz(t) - 8} y={318} text="2.444" color={C.green} size={13} anchor="end" weight={700} />
            <Label x={xz(2.40) - 8} y={345} text="zoom" color={C.muted} size={12} anchor="end" />
          </g>}
        </g>); }
      return <g>{out}</g>;
    }}
  </Frame>
);

export default S18Compare;
