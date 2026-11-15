import React from 'react';
import {C, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label, range} from '../kit/plot';

// Session 18 pages 21-23, case "s18-martians-trend": b = 0.44, s_b = 0.064, a = -6.0, s_a = 2.6, n = 10.
const X = [31, 32, 33, 34, 35, 35, 40, 41, 42, 46];
const Y = [7.8, 8.3, 7.6, 9.1, 9.6, 9.8, 11.8, 12.1, 14.7, 13.0];
const n = 10, b = 0.44, sb = 0.064, a = -6.0, sa = 2.6;
const t = b / sb;                       // 6.875
const nu = n - 2;                       // 8
const tc = 2.306;                       // class t table, row 8, column 0.05
const t001 = 5.041;                     // class t table, row 8, column 0.001
const Mb = tc * sb, Ma = tc * sa;       // 0.147584, 5.9956
const xbar = 36.9, ybar = 10.38;

// t density with nu degrees of freedom
const lgamma = (z: number): number => { const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z); z -= 1; let s = c[0]; for (let k = 1; k < g + 2; k++) s += c[k] / (z + k); const w = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(w) - w + Math.log(s); };
const tPdf = (v: number, df: number) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2)) / Math.sqrt(df * Math.PI) * (1 + v * v / df) ** (-(df + 1) / 2);

export const meta = {
  id: 's18-s18slope', session: 18, method: 's18slope',
  title: 'Slope t test · CIs for β and α',
  cases: {'s18-martians-trend': [1, 2, 3, 4, 5, 6, 7, 8]},
  steps: [
    {title: 'Is there a trend?', seconds: 7, caption: 'This is the **t test for the slope**. The null hypothesis says the line of means is flat, so its slope β is zero.',
      card: [{label: 'hypotheses', tex: 'H_0:\\beta=0\\qquad H_1:\\beta\\ne0', note: 'Martians  b = 0.44 g/cm · s_b = 0.064 g/cm'}]},
    {title: 't statistic', seconds: 8, caption: 'Divide the slope by its standard error. The slope b sits about **6.9 standard errors** away from zero.',
      card: [{label: 't statistic', tex: 't=\\frac{b-\\beta}{s_b}=\\frac{b}{s_b}', value: `0.44 / 0.064 = ${t.toFixed(3)}`, color: C.signal}]},
    {title: 'Degrees of freedom', seconds: 6, caption: 'Two numbers, a and b, were estimated from the ten points, so ν = 10 − 2 = **8**.',
      card: [{label: 'degrees of freedom', tex: '\\nu=n-2=10-2=8'}]},
    {title: 'Class t table', seconds: 7, caption: 'Use the **class t table** (two-tailed). Row 8 and column 0.05 give **2.306**.',
      card: [{label: 'class t table', value: 'row 8 · column 0.05 → 2.306', color: C.signal}]},
    {title: 'Decision', seconds: 8, caption: 'The statistic 6.875 lands far beyond the cutoff 2.306, so **reject H0**. Martian weight rises with height.',
      card: [{label: 'decision', value: '6.875 > 2.306 → reject H0', color: C.green}]},
    {title: 'P range', seconds: 7, caption: 'Row 8, column 0.001 gives **5.041**. The statistic passes even that cutoff, so **P < 0.001**.',
      card: [{label: 'P range', value: '6.875 > 5.041 → P < 0.001', color: C.green, note: 'class t table, row 8, column 0.001'}]},
    {title: 'CI for the slope', seconds: 8, caption: 'The same cutoff builds the 95% interval for β. It **leaves out zero**, which agrees with the test.',
      card: [{label: '95% CI for the slope', tex: 'b-t_\\alpha(\\nu)\\cdot s_b<\\beta<b+t_\\alpha(\\nu)\\cdot s_b', value: `0.44 ± ${Mb.toFixed(4)} → (0.2924, 0.5876)`, color: C.signal}]},
    {title: 'CI for the intercept', seconds: 8, caption: 'The intercept interval is **much wider** because x = 0 is far from the data. It holds the true −8 g.',
      card: [{label: '95% CI for the intercept', tex: '\\begin{aligned}a-t_\\alpha(\\nu)\\cdot s_a&<\\alpha_{LOM}\\\\&<a+t_\\alpha(\\nu)\\cdot s_a\\end{aligned}', value: `−6.0 ± ${Ma.toFixed(4)} → (−12.00, −0.004)`, color: C.signal}]},
  ] as Step[],
};

const TABLE: Record<string, string[]> = {'7': ['1.895', '2.365', '2.998', '3.499', '5.408'], '8': ['1.860', '2.306', '2.896', '3.355', '5.041'], '9': ['1.833', '2.262', '2.821', '3.250', '4.781']};
const COLS = ['0.10', '0.05', '0.02', '0.01', '0.001'];

const S18Slope: React.FC = () => (
  <Frame title={meta.title} session={18} steps={meta.steps}>
    {(f, i, tl) => {
      const out: React.ReactNode[] = [];
      // 1. scatter with the fitted line and the flat null line
      if (i === 0) { const x = lin(30, 48, 70, 735), y = lin(6, 16, 360, 20); const p = prog(tl, f, 0, 1.6);
        out.push(<g key="sc">
          <AxisX x={x} y={370} ticks={[30, 33, 36, 39, 42, 45, 48]} label="height x (cm)" />
          <g fontFamily={mono}><line x1={60} x2={60} y1={y(6)} y2={y(16)} stroke={C.muted} strokeWidth={1.5} />
            {[6, 8, 10, 12, 14, 16].map(v => <g key={v}><line x1={54} x2={60} y1={y(v)} y2={y(v)} stroke={C.muted} /><text x={50} y={y(v) + 5} fill={C.muted} fontSize={14} textAnchor="end">{v}</text></g>)}
            <text x={14} y={190} fill={C.muted} fontSize={15} textAnchor="middle" transform="rotate(-90 14 190)">weight y (g)</text></g>
          <line x1={x(30)} x2={x(48)} y1={y(ybar)} y2={y(ybar)} stroke={C.red} strokeWidth={2} strokeDasharray="7 6" opacity={p} />
          <Label x={x(47.6)} y={y(ybar) + 24} text="H0  β = 0" color={C.red} size={14} anchor="end" opacity={p} />
          <line x1={x(30)} x2={x(48)} y1={y(a + b * 30)} y2={y(a + b * 48)} stroke={C.signal} strokeWidth={3} opacity={prog(tl, f, 0, 2.4)} />
          <Label x={x(39)} y={y(a + b * 39) - 70} text="b = 0.44 g/cm" color={C.signal} size={14} anchor="middle" opacity={prog(tl, f, 0, 2.4)} />
          {X.map((v, k) => { const q = prog(tl, f, 0, 0.4 + k * 0.08); return <Glow key={k} cx={x(v)} cy={lerp(y(Y[k]) - 50, y(Y[k]), q)} r={6} color={C.blue} opacity={q} />; })}
        </g>); }
      // 2. slope scale over t scale: count standard errors from 0 to b
      if (i === 1) { const xs = lin(-0.1, 0.6, 60, 720), xt = lin(-0.1 / sb, 0.6 / sb, 60, 720); const p = prog(tl, f, 1, 0.8);
        const nBlocks = Math.min(t, prog(tl, f, 1, 4.5) * t);
        out.push(<g key="t" opacity={p}>
          <AxisX x={xs} y={140} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]} label="slope (g/cm)" />
          {Array.from({length: 7}, (_, k) => { const w = Math.max(0, Math.min(1, nBlocks - k)); return w > 0 ? <rect key={k} x={xs(k * sb) + 1} y={104} width={Math.max(0, (xs(sb) - xs(0)) * w - 2)} height={28} rx={4} fill={C.noise} fillOpacity={0.25} stroke={C.noise} strokeWidth={1.5} /> : null; })}
          <Label x={xs(sb / 2)} y={96} text="s_b" color={C.noise} size={13} anchor="middle" />
          <line x1={xs(0)} x2={xs(0)} y1={60} y2={330} stroke={C.red} strokeDasharray="5 5" />
          <Label x={xs(0)} y={52} text="β = 0" color={C.red} size={14} anchor="middle" />
          <Glow cx={xs(b)} cy={140} r={8} color={C.signal} />
          <Label x={xs(b)} y={52} text="b = 0.44" color={C.signal} size={14} anchor="middle" weight={700} />
          <line x1={xs(b)} x2={xs(b)} y1={62} y2={310} stroke={C.signal} strokeDasharray="5 5" strokeOpacity={0.6} />
          <AxisX x={xt} y={310} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} label="t = slope ÷ s_b" />
          {nBlocks >= t - 0.01 && <g opacity={prog(tl, f, 1, 5.5)}><Glow cx={xt(t)} cy={310} r={8} color={C.signal} />
            <Label x={xt(t)} y={286} text={`t = ${t.toFixed(3)}`} color={C.signal} size={15} anchor="middle" weight={700} /></g>}
        </g>); }
      // 3. degrees of freedom: ten points, two used for a and b
      if (i === 2) { const p = prog(tl, f, 2, 0.6), q = prog(tl, f, 2, 2.4);
        out.push(<g key="df" opacity={p}>
          {Array.from({length: 10}, (_, k) => { const used = k >= 8; const cx = 110 + k * 60;
            return <g key={k}><Glow cx={cx} cy={170} r={11} color={used ? lerpColor(q) : C.blue} opacity={used ? 1 - 0.6 * q : 1} />
              {used && <Label x={cx} y={215} text={k === 8 ? 'a' : 'b'} color={C.muted} size={16} anchor="middle" opacity={q} />}</g>; })}
          <Label x={110 + 3.5 * 60} y={260} text="ν = 8" color={C.signal} size={22} anchor="middle" weight={700} opacity={q} />
          <line x1={95} x2={110 + 7 * 60 + 15} y1={232} y2={232} stroke={C.signal} strokeWidth={2} opacity={q} />
        </g>); }
      // 4. class t table excerpt
      if (i === 3) { const p = prog(tl, f, 3), x0 = 90, y0 = 90, cw = 120, rh = 54;
        out.push(<g key="tab" opacity={p}>
          <Label x={x0} y={y0 - 34} text="class t table · two-tailed α" color={C.muted} size={14} />
          {COLS.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === '0.05' ? C.signal : C.muted} anchor="middle" weight={700} />)}
          {Object.entries(TABLE).map(([row, vs], ri) => (<g key={row}>
            <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${row}`} color={row === '8' ? C.signal : C.muted} weight={700} />
            {vs.map((v, ci) => { const hit = row === '8' && COLS[ci] === '0.05'; return (<g key={ci}>
              {hit && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 3, 2.4)} />}
              <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={hit ? 700 : 400} /></g>); })}
          </g>))}
        </g>); }
      // 5-6. t distribution, cutoff, statistic sliding past
      if (i === 4 || i === 5) { const xt = lin(-4, 8, 50, 730), base = 330, yk = (v: number) => base - v * 620; const p = prog(tl, f, 4, 0.8);
        const pts = range(-4, 8, 241); const path = pts.map((v, k) => `${k ? 'L' : 'M'}${xt(v).toFixed(1)},${yk(tPdf(v, nu)).toFixed(1)}`).join(' ');
        const tail = (lo: number, hi: number) => { const r = range(lo, hi, 60); return `M${xt(lo)},${base} ` + r.map(v => `L${xt(v).toFixed(1)},${yk(tPdf(v, nu)).toFixed(1)}`).join(' ') + ` L${xt(hi)},${base} Z`; };
        const tv = i === 4 ? lerp(0, t, prog(tl, f, 4, 3)) : t;
        out.push(<g key="curve" opacity={i === 4 ? p : 1}>
          <path d={tail(-4, -tc)} fill={C.signal} fillOpacity={0.3} /><path d={tail(tc, 8)} fill={C.signal} fillOpacity={0.3} />
          <path d={path} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <AxisX x={xt} y={base} ticks={[-4, -2, 0, 2, 4, 6, 8]} label={`t with ν = ${nu}`} />
          {[-tc, tc].map(c => <line key={c} x1={xt(c)} x2={xt(c)} y1={base} y2={110} stroke={C.signal} strokeWidth={2} strokeDasharray="5 4" />)}
          <Label x={xt(-tc)} y={100} text="−2.306" color={C.signal} size={14} anchor="middle" />
          <Label x={xt(tc)} y={100} text="2.306" color={C.signal} size={14} anchor="middle" />
          {i === 5 && <g opacity={prog(tl, f, 5)}>
            <line x1={xt(t001)} x2={xt(t001)} y1={base} y2={110} stroke={C.pink} strokeWidth={2} strokeDasharray="5 4" />
            <Label x={xt(t001)} y={100} text="5.041" color={C.pink} size={14} anchor="middle" weight={700} />
            <Label x={xt(t001)} y={78} text="P = 0.001" color={C.pink} size={13} anchor="middle" />
            <Label x={xt(tc)} y={78} text="P = 0.05" color={C.signal} size={13} anchor="middle" />
          </g>}
          <Glow cx={xt(tv)} cy={base} r={9} color={C.green} />
          <Label x={xt(tv)} y={base - 22} text={`t = ${tv.toFixed(3)}`} color={C.green} size={15} anchor="middle" weight={700} />
        </g>); }
      // 7-8. intervals for beta and alpha
      if (i >= 6) { const xs = lin(-0.1, 0.7, 60, 720); const p = prog(tl, f, 6, 1.8); const dim = i === 7 ? 0.45 : 1;
        out.push(<g key="cib" opacity={dim}>
          <Label x={60} y={40} text="slope β (g/cm)" color={C.muted} size={14} />
          <AxisX x={xs} y={150} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]} />
          <line x1={xs(b - Mb * p)} x2={xs(b + Mb * p)} y1={115} y2={115} stroke={C.signal} strokeWidth={6} strokeLinecap="round" />
          <Glow cx={xs(b)} cy={115} r={7} color={C.signal} />
          {p > 0.98 && <><Label x={xs(b - Mb)} y={100} text="0.292" color={C.signal} size={13} anchor="middle" /><Label x={xs(b + Mb)} y={100} text="0.588" color={C.signal} size={13} anchor="middle" /></>}
          <line x1={xs(0)} x2={xs(0)} y1={70} y2={150} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xs(0)} y={64} text="0" color={C.red} size={14} anchor="middle" />
          <line x1={xs(0.5)} x2={xs(0.5)} y1={128} y2={150} stroke={C.ink} strokeWidth={3} opacity={prog(tl, f, 6, 2.6)} />
          <Label x={xs(0.5) + 6} y={143} text="true 0.5" color={C.ink} size={12} opacity={prog(tl, f, 6, 2.6)} />
        </g>);
        if (i === 7) { const xa = lin(-14, 2, 60, 720); const q = prog(tl, f, 7, 1.8);
          out.push(<g key="cia">
            <Label x={60} y={230} text="intercept α (g)" color={C.muted} size={14} />
            <AxisX x={xa} y={340} ticks={[-14, -12, -10, -8, -6, -4, -2, 0, 2]} />
            <line x1={xa(a - Ma * q)} x2={xa(a + Ma * q)} y1={300} y2={300} stroke={C.signal} strokeWidth={6} strokeLinecap="round" />
            <Glow cx={xa(a)} cy={300} r={7} color={C.signal} />
            {q > 0.98 && <><Label x={xa(a - Ma)} y={284} text="−12.00" color={C.signal} size={13} anchor="middle" /><Label x={xa(a + Ma) - 8} y={284} text="−0.004" color={C.signal} size={13} anchor="end" /></>}
            <line x1={xa(0)} x2={xa(0)} y1={262} y2={340} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xa(0) + 6} y={262} text="0" color={C.red} size={14} />
            <line x1={xa(-8)} x2={xa(-8)} y1={316} y2={340} stroke={C.ink} strokeWidth={3} opacity={prog(tl, f, 7, 2.6)} />
            <Label x={xa(-8) + 6} y={333} text="true −8" color={C.ink} size={12} opacity={prog(tl, f, 7, 2.6)} />
          </g>); }
      }
      return <g>{out}</g>;
    }}
  </Frame>
);

// blue -> grey for the two points "used up" by a and b
const lerpColor = (q: number) => q < 0.5 ? C.blue : C.muted;

export default S18Slope;
