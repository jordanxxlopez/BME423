import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, GROUP, FPS} from '../kit/theme';
import {Frame, Step, Timeline, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label, curvePath, range, normPdf} from '../kit/plot';

// Session 24 pages 5, 7 and 8: two ten-value samples checked for Normality. Case "s24-shapiro-two-samples".
// Sample 2 equals sample 1 except 60 -> 50 and 68 -> 88. Shapiro-Wilk results are the R output printed with the data.
const s1 = [60, 62, 62, 63, 64, 64, 65, 65, 67, 68];
const s2 = [50, 62, 62, 63, 64, 64, 65, 65, 67, 88];
const n = 10;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sdv = (v: number[]) => { const m = mean(v); return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)); };
const m1 = mean(s1), sd1 = sdv(s1), m2 = mean(s2), sd2 = sdv(s2); // 64, 2.4037, 65, 9.32142
// plotting probabilities (i - 3/8)/(n + 1/4) and their Normal quantiles (from the case table)
const pp = Array.from({length: n}, (_, k) => (k + 1 - 0.375) / 10.25);
const zq = [-1.54664, -1.00049, -0.65542, -0.37546, -0.12258, 0.12258, 0.37546, 0.65542, 1.00049, 1.54664];
const W1 = 0.97577, P1 = 0.9386, W2 = 0.75726, P2 = 0.004374;
// reference line through the quartiles (as R's qqline): both samples have Q1 = 62.25 and Q3 = 65
const q = (v: number[], p: number) => { const s = [...v].sort((a, b) => a - b); const h = (s.length - 1) * p; const j = Math.floor(h); return s[j] + (h - j) * (s[j + 1] - s[j]); };
const zq3 = 0.6744898;
const qline = (v: number[]) => { const a = q(v, 0.25), b = q(v, 0.75); const slope = (b - a) / (2 * zq3); return (z: number) => (a + b) / 2 + slope * z; };
// vertical offset so equal values stack
const stackOf = (v: number[]) => v.map((x, k) => v.slice(0, k).filter(w => w === x).length);
const win = (tl: Timeline, f: number, i: number, a: number, b: number) =>
  interpolate(f, [tl.starts[i] + a * FPS, tl.starts[i] + b * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});

export const meta = {
  id: 's24-s24normal', session: 24, method: 's24normal',
  cases: {'s24-shapiro-two-samples': [2, 3, 4, 6, 9, 5, 10]},
  title: 'Checking Normality · range, Q-Q plot, Shapiro-Wilk',
  steps: [
    {title: 'Two samples', seconds: 7, caption: 'Two samples of ten values differ in only two numbers. Sample 2 has **50 and 88** where sample 1 has 60 and 68.',
      card: [{label: 'data', note: 'sample 1  60 62 62 63 64 64 65 65 67 68\nsample 2  50 62 62 63 64 64 65 65 67 88'}]},
    {title: 'Null hypothesis', seconds: 6, caption: 'The t and F tests assume Normal data, so Normality is checked first. The null hypothesis says the data are **Normal**.',
      card: [{label: 'hypotheses', tex: 'H_0:\\text{data are Normal}', note: 'HA  the data do not come from a Normal distribution'}]},
    {title: 'Mean and SD', seconds: 7, caption: 'Sample 1 has mean **64** and SD **2.4037**, so one SD around the mean runs from 61.5963 to 66.4037.',
      card: [{label: 'sample 1', tex: '\\bar x=\\tfrac{640}{10}=64,\\ s=\\sqrt{\\tfrac{52}{9}}', value: 's = 2.4037', color: C.noise}]},
    {title: 'Within one SD', seconds: 7, caption: 'Seven of ten values lie within one SD. That **70%** is close to the Normal 68.26%, and all ten lie within two SDs.',
      card: [{label: 'percent within one SD', tex: '\\bar x-s<x<\\bar x+s', value: '7 / 10 = 70% vs 68.26%', color: C.signal}]},
    {title: 'Sample 2 percentages', seconds: 8, caption: 'In sample 2 the extremes **inflate the SD** to 9.32142, so 80% crowd inside one SD and 88 lies beyond two SDs.',
      card: [{label: 'sample 2', value: 'mean 65 · s = 9.32142', color: C.noise, note: 'within one SD 8/10 = 80% vs 68.26%\nwithin two SDs 9/10 = 90% vs 95.44%'}]},
    {title: 'Theoretical quantiles', seconds: 8, caption: 'Each ordered value gets a plotting probability, and the Normal curve turns it into an **expected z value**.',
      card: [{label: 'quantiles for ten points', tex: 'p_i=\\frac{i-3/8}{n+1/4},\\ z_i=\\Phi^{-1}(p_i)', value: 'z from −1.54664 to +1.54664', color: C.noise, note: 'p1 = 0.625 / 10.25 = 0.0609756'}]},
    {title: 'Q-Q plot sample 1', seconds: 7, caption: 'Plotting each sorted value against its z value gives the Q-Q plot. Sample 1 stays **close to a straight line**.',
      card: [{label: 'Q-Q plot', value: 'sample value vs z', color: C.signal, note: 'the line runs through the middle half of the data'}]},
    {title: 'Q-Q plot sample 2', seconds: 7, caption: 'In sample 2 the middle points still follow the line, but **50 and 88 fall far off** at the two ends.'},
    {title: 'Shapiro-Wilk sample 1', seconds: 7, caption: 'The Shapiro-Wilk P value for sample 1 is 0.9386, far above 0.05, so Normality is **not rejected**.',
      card: [{label: 'sample 1', value: 'W = 0.97577, P = 0.9386 > 0.05', color: C.green, note: 'consistent with Normal, a parametric test is fine'}]},
    {title: 'Shapiro-Wilk sample 2', seconds: 8, caption: 'Sample 2 gives P = 0.004374, below 0.05, so Normality is **rejected** and a rank-based test is the better choice.',
      card: [{label: 'sample 2', value: 'W = 0.75726, P = 0.004374 < 0.05', color: C.red, note: 'reject H0, the data are not Normal'}]},
  ] as Step[],
};

const S24Normal: React.FC = () => (
  <Frame title={meta.title} session={24} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(45, 95, 70, SW - 40);
      const rows = [{y: 120, v: s1, m: m1, s: sd1, name: 'sample 1', c: GROUP[0]}, {y: 250, v: s2, m: m2, s: sd2, name: 'sample 2', c: GROUP[1]}];
      const dotsA = i <= 4 ? 1 : 0;
      return (<g>
        {/* ---- steps 1-5: dot plots on one value axis ---- */}
        {dotsA > 0 && <g>
          {rows.map((g, gi) => { const st = stackOf(g.v); const focus = i === 2 || i === 3 ? gi === 0 : i === 4 ? gi === 1 : true;
            const showBand = (gi === 0 && (i === 2 || i === 3)) || (gi === 1 && i === 4);
            const pb = gi === 0 ? (i === 2 ? win(tl, f, 2, 0.8, 2.4) : 1) : win(tl, f, 4, 0.6, 2.2);
            const p2 = gi === 1 && i === 4 ? win(tl, f, 4, 3.2, 4.6) : 0;
            const inside = (v: number) => Math.abs(v - g.m) < g.s;
            const hl = (gi === 0 && i === 3) || (gi === 1 && i === 4);
            const ph = gi === 0 ? win(tl, f, 3, 0.6, 2.4) : win(tl, f, 4, 2.0, 3.2);
            return (<g key={gi} opacity={focus ? 1 : 0.25}>
              <Label x={14} y={g.y + 5} text={g.name} color={g.c} size={14} weight={700} />
              {showBand && <g>
                {p2 > 0 && <rect x={x(g.m - 2 * g.s * p2)} width={x(g.m + 2 * g.s * p2) - x(g.m - 2 * g.s * p2)} y={g.y - 46} height={70} fill={C.noise} opacity={0.07} />}
                <rect x={x(g.m - g.s * pb)} width={x(g.m + g.s * pb) - x(g.m - g.s * pb)} y={g.y - 46} height={70} fill={C.noise} opacity={0.16} />
                <line x1={x(g.m - g.s * pb)} x2={x(g.m - g.s * pb)} y1={g.y - 46} y2={g.y + 24} stroke={C.noise} strokeWidth={2} />
                <line x1={x(g.m + g.s * pb)} x2={x(g.m + g.s * pb)} y1={g.y - 46} y2={g.y + 24} stroke={C.noise} strokeWidth={2} />
                <line x1={x(g.m)} x2={x(g.m)} y1={g.y - 52} y2={g.y + 24} stroke={C.white} strokeWidth={3} />
                <Label x={x(g.m)} y={g.y - 58} text={`mean ${g.m}`} color={C.white} size={13} anchor="middle" />
                {pb > 0.98 && <Label x={x(g.m + g.s) + 6} y={g.y + 40} text={gi === 0 ? '+1 SD' : '±1 SD'} color={C.noise} size={13} />}
                {p2 > 0.98 && <>
                  <line x1={x(g.m - 2 * g.s)} x2={x(g.m - 2 * g.s)} y1={g.y - 46} y2={g.y + 24} stroke={C.noise} strokeWidth={1.5} strokeDasharray="4 4" />
                  <line x1={x(g.m + 2 * g.s)} x2={x(g.m + 2 * g.s)} y1={g.y - 46} y2={g.y + 24} stroke={C.noise} strokeWidth={1.5} strokeDasharray="4 4" />
                  <Label x={x(g.m + 2 * g.s) - 6} y={g.y + 40} text="±2 SD" color={C.noise} size={13} anchor="end" /></>}
              </g>}
              {g.v.map((v, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.1 + gi * 0.5); const on = hl && inside(v);
                const out2 = gi === 1 && i === 4 && Math.abs(v - g.m) > 2 * g.s && p2 > 0.98;
                const col = on ? lerp(0, 1, ph) > 0.5 ? C.signal : g.c : out2 ? C.red : g.c;
                return <Glow key={k} cx={x(v)} cy={lerp(g.y - 70, g.y - st[k] * 15, p)} r={6} color={col} opacity={p} />; })}
              {hl && <Label x={SW - 40} y={g.y - 58} text={gi === 0 ? '7 of 10 inside' : '8 of 10 inside'} color={C.signal} size={14} weight={700} anchor="end" opacity={ph} />}
            </g>); })}
          <AxisX x={x} y={330} ticks={[45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]} label="value (data units)" />
        </g>}

        {/* ---- step 6: plotting probabilities become z values under the Normal curve ---- */}
        {i === 5 && (() => { const xz = lin(-2.6, 2.6, 80, SW - 60); const yc = (v: number) => 300 - 600 * v;
          const pc = win(tl, f, 5, 0.2, 1.2);
          return (<g>
            <path d={curvePath(range(-2.6, 2.6, 120), v => normPdf(v, 0, 1), xz, yc)} fill="none" stroke={C.muted} strokeWidth={2} opacity={pc} />
            <AxisX x={xz} y={300} ticks={[-2, -1, 0, 1, 2]} label="theoretical quantile z" />
            {zq.map((z, k) => { const p = win(tl, f, 5, 1.0 + k * 0.25, 1.6 + k * 0.25);
              return (<g key={k} opacity={p}>
                <line x1={xz(z)} x2={xz(z)} y1={300} y2={yc(normPdf(z, 0, 1))} stroke={C.noise} strokeWidth={1.5} opacity={0.5} />
                <Glow cx={xz(z)} cy={lerp(240, 300, p)} r={5.5} color={C.noise} />
              </g>); })}
            <g opacity={win(tl, f, 5, 3.8, 4.6)}>
              <Label x={xz(zq[0])} y={360} text={`p1 ${pp[0].toFixed(4)}`} color={C.muted} size={13} anchor="middle" />
              <Label x={xz(zq[0])} y={380} text="z1 −1.54664" color={C.noise} size={14} anchor="middle" weight={700} />
              <Label x={xz(zq[9])} y={360} text={`p10 ${pp[9].toFixed(4)}`} color={C.muted} size={13} anchor="middle" />
              <Label x={xz(zq[9])} y={380} text="z10 +1.54664" color={C.noise} size={14} anchor="middle" weight={700} />
            </g>
          </g>); })()}

        {/* ---- steps 7-10: the two Q-Q plots, then the Shapiro-Wilk P values ---- */}
        {i >= 6 && (() => { const yv = lin(45, 95, 240, 30);
          const panels = [{x0: 90, v: s1, c: GROUP[0], name: 'sample 1', step: 6}, {x0: 450, v: s2, c: GROUP[1], name: 'sample 2', step: 7}];
          return (<g>
            {panels.map((pn, pi) => { if (i < pn.step) return null; const xz = lin(-2, 2, pn.x0, pn.x0 + 250); const L = qline(pn.v);
              const pl = i === pn.step ? win(tl, f, pn.step, 2.2, 3.6) : 1; const sorted = [...pn.v].sort((a, b) => a - b);
              const dim = i >= 8 ? ((i === 8 && pi === 0) || (i === 9 && pi === 1) ? 1 : 0.35) : 1;
              return (<g key={pi} opacity={dim}>
                <line x1={pn.x0} x2={pn.x0} y1={yv(45)} y2={yv(95)} stroke={C.muted} strokeWidth={1.5} />
                {[50, 60, 70, 80, 90].map(t => <g key={t}><line x1={pn.x0 - 5} x2={pn.x0} y1={yv(t)} y2={yv(t)} stroke={C.muted} />
                  <Label x={pn.x0 - 9} y={yv(t) + 5} text={String(t)} color={C.muted} size={13} anchor="end" /></g>)}
                <line x1={pn.x0} x2={pn.x0 + 250} y1={yv(45)} y2={yv(45)} stroke={C.muted} strokeWidth={1.5} />
                {[-2, -1, 0, 1, 2].map(t => <g key={t}><line x1={xz(t)} x2={xz(t)} y1={yv(45)} y2={yv(45) + 5} stroke={C.muted} />
                  <Label x={xz(t)} y={yv(45) + 21} text={String(t)} color={C.muted} size={13} anchor="middle" /></g>)}
                <Label x={pn.x0 + 125} y={yv(45) + 42} text={`z · ${pn.name}`} color={pn.c} size={14} anchor="middle" weight={700} />
                <line x1={xz(-2)} y1={yv(L(-2))} x2={lerp(xz(-2), xz(2), pl)} y2={lerp(yv(L(-2)), yv(L(2)), pl)} stroke={C.signal} strokeWidth={2} strokeDasharray="6 5" />
                {sorted.map((v, k) => { const p = i === pn.step ? win(tl, f, pn.step, 0.3 + k * 0.15, 0.9 + k * 0.15) : 1;
                  const off = (k === 0 || k === 9) && pi === 1 && i === 7 && win(tl, f, 7, 3.6, 4.4) > 0.5;
                  return <Glow key={k} cx={xz(zq[k])} cy={lerp(yv(v) - 40, yv(v), p)} r={5.5} color={off ? C.red : pn.c} opacity={p} />; })}
                {pi === 1 && i === 7 && <g opacity={win(tl, f, 7, 3.6, 4.4)}>
                  <Label x={xz(zq[0]) + 12} y={yv(50) + 5} text="50" color={C.red} size={14} weight={700} />
                  <Label x={xz(zq[9]) - 12} y={yv(88) + 5} text="88" color={C.red} size={14} weight={700} anchor="end" />
                </g>}
              </g>); })}
            {i >= 8 && (() => { const xp = lin(-3, 0, 90, SW - 60); const lg = (p: number) => Math.log10(p);
              const ticks = [0.001, 0.01, 0.05, 0.1, 1]; const y0 = 380;
              const bars = [{P: P1, W: W1, c: GROUP[0], y: 330, step: 8, name: 'sample 1'}, {P: P2, W: W2, c: GROUP[1], y: 355, step: 9, name: 'sample 2'}];
              return (<g opacity={win(tl, f, 8, 0, 0.8)}>
                <rect x={xp(-3)} y={318} width={xp(lg(0.05)) - xp(-3)} height={62} fill={C.red} opacity={0.1} />
                <line x1={xp(lg(0.05))} x2={xp(lg(0.05))} y1={312} y2={y0} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
                <Label x={xp(lg(0.05)) - 6} y={308} text="reject below 0.05" color={C.red} size={13} anchor="end" />
                {bars.map((b, bi) => { if (i < b.step) return null; const p = i === b.step ? win(tl, f, b.step, 0.8, 2.4) : 1;
                  const xe = xp(-3 + (lg(b.P) + 3) * p);
                  return (<g key={bi}>
                    <line x1={xp(-3)} x2={xe} y1={b.y} y2={b.y} stroke={b.c} strokeWidth={8} strokeLinecap="round" />
                    <Glow cx={xe} cy={b.y} r={6} color={b.P < 0.05 ? C.red : C.green} opacity={p} />
                    {p > 0.98 && <Label x={b.P < 0.05 ? xe + 16 : xe} y={b.P < 0.05 ? b.y + 5 : b.y - 13} text={`P = ${b.P}`} color={b.P < 0.05 ? C.red : C.green} size={14} weight={700} anchor={b.P < 0.05 ? 'start' : 'end'} />}
                  </g>); })}
                <line x1={xp(-3)} x2={xp(0)} y1={y0} y2={y0} stroke={C.muted} strokeWidth={1.5} />
                {ticks.map(t => <g key={t}><line x1={xp(lg(t))} x2={xp(lg(t))} y1={y0} y2={y0 + 6} stroke={C.muted} />
                  <Label x={xp(lg(t))} y={y0 + 22} text={String(t)} color={C.muted} size={13} anchor="middle" /></g>)}
                <Label x={xp(-3) - 10} y={y0 + 22} text="P" color={C.muted} size={14} anchor="end" />
              </g>); })()}
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S24Normal;
