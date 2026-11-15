import React from 'react';
import {C, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label, range} from '../kit/plot';

// Session 18 pages 37-41, Table 8-3: the 10 Martians. Case "s18-martians-r".
const X = [31, 32, 33, 34, 35, 35, 40, 41, 42, 46];
const Y = [7.8, 8.3, 7.6, 9.1, 9.6, 9.8, 11.8, 12.1, 14.7, 13.0];
const n = 10, xbar = 36.9, ybar = 10.38;
// Table 8-3 totals (rounded as printed): Σ(x−x̄)(y−ȳ) = 99.9, Σ(x−x̄)² = 224.9, Σ(y−ȳ)² = 51.8
const sxy = 99.9, sxx = 224.9, syy = 51.8;
const r = sxy / Math.sqrt(sxx * syy);          // 0.9255628
const bDev = sxy / sxx;                        // 0.4441974
const ratio = Math.sqrt(sxx / syy);            // 2.083674
const r2 = r * r;                              // 0.8566665
const t = r * Math.sqrt((n - 2) / (1 - r2));   // 6.914757
const nu = n - 2, tc = 2.306, t001 = 5.041;    // class t table, row 8, columns 0.05 and 0.001

const lgamma = (z: number): number => { const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z); z -= 1; let s = c[0]; for (let k = 1; k < g + 2; k++) s += c[k] / (z + k); const w = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(w) - w + Math.log(s); };
const tPdf = (v: number, df: number) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2)) / Math.sqrt(df * Math.PI) * (1 + v * v / df) ** (-(df + 1) / 2);
const corr = (p: number[][]) => { const mx = p.reduce((s, q) => s + q[0], 0) / p.length, my = p.reduce((s, q) => s + q[1], 0) / p.length;
  const a = p.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0), bx = p.reduce((s, q) => s + (q[0] - mx) ** 2, 0), by = p.reduce((s, q) => s + (q[1] - my) ** 2, 0); return a / Math.sqrt(bx * by); };

// Illustration panels (made-up points, not study data).
const P_UP = [1, 2, 3, 4, 5, 6, 7, 8].map(v => [v, v]);
const P_DOWN = [1, 2, 3, 4, 5, 6, 7, 8].map(v => [v, 9 - v]);
const P_NONE = [[1, 3], [2, 7], [3, 2], [4, 6], [5, 4], [6, 8], [7, 1], [8, 5], [2.5, 4.5], [6.5, 3.5]];

export const meta = {
  id: 's18-s18corr', session: 18, method: 's18corr',
  title: 'Pearson correlation r and its t test',
  cases: {'s18-martians-r': [4, 5, 6, 6, 7, 8, 5]},
  steps: [
    {title: 'Two variables', seconds: 6, caption: 'The **Pearson correlation** r measures how tightly two variables move together along a straight line.',
      card: [{label: 'ten sampled Martians', note: 'mean height 36.9 cm · mean weight 10.38 g'}]},
    {title: 'Split at the means', seconds: 7, caption: 'Draw lines at the two means. Points up and right, or down and left, have deviations with the **same sign**.',
      card: [{label: 'deviations', tex: '(x_i-\\bar x),\\ (y_i-\\bar y)'}]},
    {title: 'Deviation products', seconds: 8, caption: 'Each rectangle is one product of deviations. All ten are **positive**, so they add to 99.9 g·cm.',
      card: [{label: 'sum of products', tex: '\\sum(x-\\bar x)(y-\\bar y)', value: '= 99.9 g·cm', color: C.signal}]},
    {title: 'Scale to r', seconds: 8, caption: 'Divide by the root of the two sums of squares. The units cancel, so **r has no units** and stays between −1 and +1.',
      card: [{label: 'Pearson r', tex: 'r=\\frac{\\sum(x-\\bar x)(y-\\bar y)}{\\sqrt{\\sum(x-\\bar x)^2\\sum(y-\\bar y)^2}}', value: `99.9 / √(224.9 · 51.8) = ${r.toFixed(4)}`, color: C.signal}]},
    {title: 'Sign and strength', seconds: 8, caption: 'In these illustrations a rising line gives r = +1, a falling line −1, and no linear trend about **0**.',
      card: [{label: 'same sign as the slope', tex: 'r=\\frac{\\sqrt{\\sum(x-\\bar x)^2}}{\\sqrt{\\sum(y-\\bar y)^2}}\\,b', value: `${ratio.toFixed(4)} × ${bDev.toFixed(4)} = ${r.toFixed(4)}`, color: C.signal,
        note: 'Martians r = 0.926 → strong and positive'}]},
    {title: 'Test of no correlation', seconds: 8, caption: 'The null hypothesis says the **population correlation is zero**. Turn r into t with ν = n − 2 = 8.',
      card: [{label: 'hypotheses', tex: 'H_0:r=0\\qquad H_1:r\\ne0'},
        {label: 't statistic', tex: 't=r\\sqrt{\\frac{n-2}{1-r^2}}', value: `${r.toFixed(4)} · √(8 / ${(1 - r2).toFixed(4)}) = ${t.toFixed(3)}`, color: C.signal}]},
    {title: 'Class t table', seconds: 7, caption: 'Use the **class t table** (two-tailed). Row 8 gives **2.306** at 0.05 and **5.041** at 0.001.',
      card: [{label: 'class t table, row 8', value: '0.05 → 2.306 · 0.001 → 5.041', color: C.signal}]},
    {title: 'Decision', seconds: 8, caption: 'The statistic 6.915 passes even 5.041, so **P < 0.001**. Taller Martians tend to be heavier.',
      card: [{label: 'decision', value: '6.915 > 5.041 → P < 0.001', color: C.green, note: 'reject H0 · same decision as the slope t test'}]},
  ] as Step[],
};

const x = lin(30, 48, 70, 520), y = lin(6, 16, 360, 20);
const GX = 650, gy = lin(-1, 1, 340, 40);
const TABLE: Record<string, string[]> = {'7': ['1.895', '2.365', '2.998', '3.499', '5.408'], '8': ['1.860', '2.306', '2.896', '3.355', '5.041'], '9': ['1.833', '2.262', '2.821', '3.250', '4.781']};
const COLS = ['0.10', '0.05', '0.02', '0.01', '0.001'];

const Mini: React.FC<{pts: number[][]; x0: number; label: string; color: string; p: number}> = ({pts, x0, label, color, p}) => {
  const mx = lin(0, 9, x0 + 10, x0 + 160), my = lin(0, 9, 230, 80);
  return (<g opacity={p}>
    <rect x={x0} y={70} width={170} height={170} rx={10} fill="none" stroke={C.line} />
    {pts.map((q, k) => <Glow key={k} cx={mx(q[0])} cy={my(q[1])} r={4.5} color={color} />)}
    <Label x={x0 + 85} y={270} text={label} color={color} size={15} anchor="middle" weight={700} />
  </g>);
};

const S18Corr: React.FC = () => (
  <Frame title={meta.title} session={18} steps={meta.steps}>
    {(f, i, tl) => {
      const out: React.ReactNode[] = [];
      if (i <= 3) {
        out.push(<g key="plot">
          <AxisX x={x} y={370} ticks={[30, 33, 36, 39, 42, 45, 48]} label="height x (cm)" />
          <g fontFamily={mono}><line x1={60} x2={60} y1={y(6)} y2={y(16)} stroke={C.muted} strokeWidth={1.5} />
            {[6, 8, 10, 12, 14, 16].map(v => <g key={v}><line x1={54} x2={60} y1={y(v)} y2={y(v)} stroke={C.muted} /><text x={50} y={y(v) + 5} fill={C.muted} fontSize={14} textAnchor="end">{v}</text></g>)}
            <text x={14} y={190} fill={C.muted} fontSize={15} textAnchor="middle" transform="rotate(-90 14 190)">weight y (g)</text></g>
          {/* deviation-product rectangles */}
          {i >= 2 && X.map((v, k) => { const p = prog(tl, f, 2, 0.6 + k * 0.25);
            const xa = x(xbar), ya = y(ybar), xb = x(lerp(xbar, v, p)), yb = y(lerp(ybar, Y[k], p));
            return <rect key={k} x={Math.min(xa, xb)} y={Math.min(ya, yb)} width={Math.abs(xb - xa)} height={Math.abs(yb - ya)} fill={C.signal} fillOpacity={0.12} stroke={C.signal} strokeOpacity={0.55} strokeWidth={1.2} opacity={p > 0 ? 1 : 0} />; })}
          {/* mean lines and quadrant signs */}
          {i >= 1 && <g opacity={prog(tl, f, 1)}>
            <line x1={x(xbar)} x2={x(xbar)} y1={y(16)} y2={370} stroke={C.ink} strokeDasharray="5 5" strokeOpacity={0.7} />
            <line x1={60} x2={x(48)} y1={y(ybar)} y2={y(ybar)} stroke={C.ink} strokeDasharray="5 5" strokeOpacity={0.7} />
            <Label x={x(xbar) + 6} y={y(16) + 4} text="mean x" color={C.muted} size={12} />
            <Label x={x(48)} y={y(ybar) - 8} text="mean y" color={C.muted} size={12} anchor="end" />
            <Label x={x(46)} y={y(15.3)} text="(+)(+)" color={C.green} size={15} anchor="middle" weight={700} />
            <Label x={x(31.5)} y={y(6.6)} text="(−)(−)" color={C.green} size={15} anchor="middle" weight={700} />
            <Label x={x(31.5)} y={y(15.3)} text="(−)(+)" color={C.red} size={15} anchor="middle" opacity={0.7} />
            <Label x={x(46)} y={y(6.6)} text="(+)(−)" color={C.red} size={15} anchor="middle" opacity={0.7} />
          </g>}
          {X.map((v, k) => { const p = prog(tl, f, 0, 0.4 + k * 0.08); return <Glow key={k} cx={x(v)} cy={lerp(y(Y[k]) - 50, y(Y[k]), p)} r={6} color={C.blue} opacity={p} />; })}
          {i >= 2 && <Label x={x(31)} y={y(13.6)} text="Σ = 99.9 g·cm" color={C.signal} size={16} weight={700} opacity={prog(tl, f, 2, 3.2)} />}
          {/* r gauge */}
          {i === 3 && (() => { const p = prog(tl, f, 3, 0.8), q = prog(tl, f, 3, 2.6); return (<g opacity={p}>
            <line x1={GX} x2={GX} y1={gy(-1)} y2={gy(1)} stroke={C.muted} strokeWidth={3} strokeLinecap="round" />
            {[-1, -0.5, 0, 0.5, 1].map(v => <g key={v}><line x1={GX - 8} x2={GX + 8} y1={gy(v)} y2={gy(v)} stroke={C.muted} />
              <text x={GX - 14} y={gy(v) + 5} fill={C.muted} fontSize={14} fontFamily={mono} textAnchor="end">{v > 0 ? `+${v}` : v}</text></g>)}
            <line x1={GX} x2={GX} y1={gy(0)} y2={gy(r * q)} stroke={C.signal} strokeWidth={6} strokeLinecap="round" />
            <Glow cx={GX} cy={gy(r * q)} r={8} color={C.signal} />
            <Label x={GX + 16} y={gy(r * q) + 5} text={`r = ${(r * q).toFixed(3)}`} color={C.signal} size={16} weight={700} />
          </g>); })()}
        </g>);
      }
      if (i === 4) {
        out.push(<g key="mini">
          <Label x={15} y={52} text="illustrations" color={C.muted} size={13} />
          <Label x={570} y={52} text="Martian data" color={C.muted} size={13} />
          <Mini pts={P_UP} x0={15} label="r = +1" color={C.purple} p={prog(tl, f, 4, 0.8)} />
          <Mini pts={P_DOWN} x0={200} label="r = −1" color={C.purple} p={prog(tl, f, 4, 1.4)} />
          <Mini pts={P_NONE} x0={385} label={`r = ${corr(P_NONE).toFixed(2)}`} color={C.purple} p={prog(tl, f, 4, 2.0)} />
          {(() => { const p = prog(tl, f, 4, 2.6); const mx = lin(30, 47, 580, 730), my = lin(7, 15, 230, 80); return (<g opacity={p}>
            <rect x={570} y={70} width={170} height={170} rx={10} fill="none" stroke={C.signal} strokeOpacity={0.7} />
            {X.map((v, k) => <Glow key={k} cx={mx(v)} cy={my(Y[k])} r={4.5} color={C.blue} />)}
            <Label x={655} y={270} text={`r = ${r.toFixed(3)}`} color={C.signal} size={15} anchor="middle" weight={700} />
          </g>); })()}
          {/* strength scale */}
          {(() => { const p = prog(tl, f, 4, 3.4); const sx = lin(-1, 1, 60, 700); return (<g opacity={p}>
            <AxisX x={sx} y={330} ticks={[-1, -0.5, 0, 0.5, 1]} fmt={v => (v > 0 ? `+${v}` : String(v))} />
            <Label x={sx(-1)} y={316} text="perfect falling" color={C.muted} size={12} anchor="start" />
            <Label x={sx(0)} y={316} text="none" color={C.muted} size={12} anchor="middle" />
            <Glow cx={sx(r)} cy={330} r={8} color={C.signal} />
            <Label x={sx(r)} y={312} text="0.926" color={C.signal} size={14} anchor="middle" weight={700} />
          </g>); })()}
        </g>);
      }
      if (i === 6) { const p = prog(tl, f, 6), x0 = 90, y0 = 90, cw = 120, rh = 54;
        out.push(<g key="tab" opacity={p}>
          <Label x={x0} y={y0 - 34} text="class t table · two-tailed α" color={C.muted} size={14} />
          {COLS.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === '0.05' || c === '0.001' ? C.signal : C.muted} anchor="middle" weight={700} />)}
          {Object.entries(TABLE).map(([row, vs], ri) => (<g key={row}>
            <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${row}`} color={row === '8' ? C.signal : C.muted} weight={700} />
            {vs.map((v, ci) => { const hit = row === '8' && (COLS[ci] === '0.05' || COLS[ci] === '0.001'); return (<g key={ci}>
              {hit && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 6, 2.4)} />}
              <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={hit ? 700 : 400} /></g>); })}
          </g>))}
        </g>); }
      if (i === 5 || i === 7) { const xt = lin(-4, 8, 50, 730), base = 330, yk = (v: number) => base - v * 620; const p = prog(tl, f, i, 0.8);
        const pts = range(-4, 8, 241); const path = pts.map((v, k) => `${k ? 'L' : 'M'}${xt(v).toFixed(1)},${yk(tPdf(v, nu)).toFixed(1)}`).join(' ');
        const tail = (lo: number, hi: number) => { const rr = range(lo, hi, 60); return `M${xt(lo)},${base} ` + rr.map(v => `L${xt(v).toFixed(1)},${yk(tPdf(v, nu)).toFixed(1)}`).join(' ') + ` L${xt(hi)},${base} Z`; };
        const tv = i === 5 ? lerp(0, t, prog(tl, f, 5, 3)) : t;
        out.push(<g key="curve" opacity={p}>
          {i === 7 && <><path d={tail(-4, -tc)} fill={C.signal} fillOpacity={0.3} /><path d={tail(tc, 8)} fill={C.signal} fillOpacity={0.3} /></>}
          <path d={path} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <AxisX x={xt} y={base} ticks={[-4, -2, 0, 2, 4, 6, 8]} label={`t with ν = ${nu}  (if r = 0)`} />
          {i === 7 && <g>
            {[-tc, tc].map(c => <line key={c} x1={xt(c)} x2={xt(c)} y1={base} y2={110} stroke={C.signal} strokeWidth={2} strokeDasharray="5 4" />)}
            <Label x={xt(-tc)} y={100} text="−2.306" color={C.signal} size={14} anchor="middle" />
            <Label x={xt(tc)} y={100} text="2.306" color={C.signal} size={14} anchor="middle" />
            <line x1={xt(t001)} x2={xt(t001)} y1={base} y2={110} stroke={C.pink} strokeWidth={2} strokeDasharray="5 4" />
            <Label x={xt(t001)} y={100} text="5.041" color={C.pink} size={14} anchor="middle" weight={700} />
          </g>}
          <Glow cx={xt(tv)} cy={base} r={9} color={C.green} />
          <Label x={xt(tv)} y={base - 22} text={`t = ${tv.toFixed(3)}`} color={C.green} size={15} anchor="middle" weight={700} />
        </g>); }
      return <g>{out}</g>;
    }}
  </Frame>
);

export default S18Corr;
