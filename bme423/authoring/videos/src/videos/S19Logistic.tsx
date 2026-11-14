import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Label, range, normPdf} from '../kit/plot';

// Session 19 cases "s19-chd-age" (Hosmer and Lemeshow, pages 28-36) and "s19-oring-temperature" (Devore, pages 37-38).
// Group proportions from Table 1.2 (page 28) at the age-group midpoints of page 29.
const ages = [24.5, 32, 37, 42, 47, 52, 57, 64.5];
const props = [0.10, 0.13, 0.25, 0.33, 0.46, 0.63, 0.76, 0.80];
// Least-squares straight line through the eight group points (illustration of why a line fails).
const lineFit = (() => { const mx = ages.reduce((a, b) => a + b) / 8, my = props.reduce((a, b) => a + b) / 8;
  const sxy = ages.reduce((s, x, j) => s + (x - mx) * (props[j] - my), 0), sxx = ages.reduce((s, x) => s + (x - mx) ** 2, 0);
  const b = sxy / sxx; return {a: my - b * mx, b}; })();                      // p = -0.4683 + 0.02024 age
const b0 = -5.30945, b1 = 0.11092, sb1 = 0.02406;                              // glm(CHD ~ AGE, binomial)
const logistic = (eta: number) => 1 / (1 + Math.exp(-eta));
const pChd = (x: number) => logistic(b0 + b1 * x);
const eta60 = b0 + b1 * 60, p60 = logistic(eta60);                             // 1.34575, 0.7934
const oddsSlide = 0.79 / (1 - 0.79), oddsExact = Math.exp(eta60);              // 3.76 (rounded p), 3.84
const zAge = b1 / sb1;                                                         // 4.610
// O-ring data (page 37): launch temperature (F) and failure (1) or not (0).
const oring: [number, number][] = [[53, 1], [56, 1], [57, 1], [63, 0], [66, 0], [67, 0], [67, 0], [67, 0], [68, 0], [69, 0], [70, 0], [70, 1], [70, 1], [70, 1],
  [72, 0], [73, 0], [75, 0], [75, 1], [76, 0], [76, 0], [78, 0], [79, 0], [80, 0], [81, 0]];
const c0 = 9.83198, c1 = -0.155, sc1 = 0.07883;                                // glm(Failure ~ Temp, binomial), page 38
const pRing = (x: number) => logistic(c0 + c1 * x);
const zT = c1 / sc1, perDeg = Math.exp(c1);                                    // -1.966, 0.8564

export const meta = {
  id: 's19-s19logistic', session: 19, method: 's19logistic',
  cases: {'s19-chd-age': [5, 6, 6, 7], 's19-oring-temperature': [9, 8, 8, 9]},
  title: 'Logistic regression · probability, logit and odds',
  steps: [
    {title: 'Yes or no outcome', seconds: 7, caption: 'Each person has CHD (1) or not (0). Grouping 100 people by age gives a **proportion with CHD** for each group.',
      card: [{label: 'Table 1.2 · CHD by age group', note: '20–29: 1 of 10 = 0.10 … 60–69: 8 of 10 = 0.80\n43 of 100 have CHD overall'}]},
    {title: 'Straight line fails', seconds: 7, caption: 'A straight line through these points falls **below 0** for the young and rises **above 1** for the old. No probability can.',
      card: [{label: 'straight line (illustration)', value: `p = ${lineFit.a.toFixed(3)} + ${lineFit.b.toFixed(4)}·age`, note: 'least squares on the 8 group points', color: C.red}]},
    {title: 'S-shaped curve', seconds: 8, caption: 'The **logistic curve** stays between 0 and 1. R\'s glm() fits it to all 100 outcomes by maximum likelihood.',
      card: [{label: 'logistic function', tex: 'p=\\frac{1}{1+e^{-(b_0+b_1x)}}', note: 'glm: b0 = −5.30945 · b1 = 0.11092', color: C.signal}]},
    {title: 'Logit is a line', seconds: 8, caption: 'The natural log of the odds is the **logit**. It is a straight line in age, with b0 as intercept and b1 as slope.',
      card: [{label: 'logit (natural log)', tex: '\\ln\\left(\\frac{p}{1-p}\\right)=b_0+b_1x', note: 'group point: ln(0.10 / 0.90) = −2.197', color: C.noise}]},
    {title: 'Test the age slope', seconds: 7, caption: 'The slope over its SE gives **z = 4.610**. The class t table infinity row gives 1.960 at 0.05, so P < 0.001.',
      card: [{label: 'z test (Normal cutoff)', tex: 'z=\\frac{b_1}{s_{b_1}}', value: `0.11092 / 0.02406 = ${zAge.toFixed(3)}`, note: 'row ∞: 1.960 (0.05) · 3.2905 (0.001) → P < 0.001', color: C.signal}]},
    {title: 'Probability at 60', seconds: 8, caption: 'At age 60 the linear part is 1.34575. The logistic curve turns it into a probability of **0.7934**, or 0.79 rounded.',
      card: [{label: 'age 60', tex: 'b_0+b_1(60)=1.34575', value: `p = 1/(1 + e^−1.34575) = ${p60.toFixed(4)}`, color: C.signal}]},
    {title: 'Odds at 60', seconds: 8, caption: 'The odds are p over 1 − p. The rounded 0.79 gives **3.76 to 1**, and the unrounded p gives 3.84.',
      card: [{label: 'odds', tex: '\\text{odds}=\\frac{p}{1-p}=e^{b_0+b_1x}', value: `0.79 / 0.21 = ${oddsSlide.toFixed(2)} (rounded p)`, note: `unrounded: e^1.34575 = ${oddsExact.toFixed(2)}`, color: C.signal}]},
    {title: 'O-ring failures', seconds: 8, caption: 'Failures in 24 launches cluster in the cold. The fitted curve **falls** from 0.83 at 53 °F to 0.14 at 75 °F.',
      card: [{label: 'O-rings · glm', note: 'b0 = 9.83198 · b1 = −0.15500', value: `p(53) = ${pRing(53).toFixed(4)} · p(75) = ${pRing(75).toFixed(4)}`, color: C.signal}]},
    {title: 'Odds per degree', seconds: 8, caption: 'The slope is negative with **z = −1.966**, just past 1.960. Each extra degree multiplies the failure odds by **0.856**.',
      card: [{label: 'temperature slope', tex: 'z=\\frac{b_1}{s_{b_1}},\\quad e^{b_1}', value: `z = ${zT.toFixed(3)} · e^−0.155 = ${perDeg.toFixed(3)}`, note: '1.960 < 1.966 < 2.3263 → 0.02 < P < 0.05', color: C.green}]},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; fmt?: (v: number) => string; label?: string}> = ({y, x, ticks, fmt = v => String(v), label}) => (
  <g fontFamily={mono}>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(v => <g key={v}><line x1={x - 6} x2={x} y1={y(v)} y2={y(v)} stroke={C.muted} /><text x={x - 10} y={y(v) + 5} fill={C.muted} fontSize={14} textAnchor="end">{fmt(v)}</text></g>)}
    {label && <text x={x + 10} y={y(ticks[ticks.length - 1]) + 4} fill={C.muted} fontSize={14}>{label}</text>}
  </g>
);

const S19Logistic: React.FC = () => (
  <Frame title={meta.title} session={19} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(15, 80, 80, 730), y = lin(-0.3, 1.3, 362, 16);
      const ageXs = range(15, 80, 160);
      const probAxes = i <= 2 || i === 5 || i === 6;
      return (<g>
        {/* probability scale for CHD */}
        {probAxes && <g opacity={i === 6 ? 0.1 : 1}>
          {[0, 1].map(v => <line key={v} x1={x(15)} x2={x(80)} y1={y(v)} y2={y(v)} stroke={C.muted} strokeWidth={1} strokeDasharray="4 6" />)}
          <AxisY y={y} x={80} ticks={[0, 0.5, 1]} fmt={v => v.toFixed(1)} label="probability of CHD" />
          <AxisX x={x} y={362} ticks={[20, 30, 40, 50, 60, 70, 80]} label="age (years)" />
          {i === 1 && (() => { const q = prog(tl, f, 1, 1.6); const xe = lerp(15, 80, q); const L = (v: number) => lineFit.a + lineFit.b * v; return (<g>
              <rect x={x(15)} y={y(0)} width={x(80) - x(15)} height={y(-0.3) - y(0)} fill={C.red} opacity={0.08} />
              <rect x={x(15)} y={y(1.3)} width={x(80) - x(15)} height={y(1) - y(1.3)} fill={C.red} opacity={0.08} />
              <line x1={x(15)} x2={x(xe)} y1={y(L(15))} y2={y(L(xe))} stroke={C.red} strokeWidth={3} />
              {q > 0.98 && <><Glow cx={x(15)} cy={y(L(15))} r={6} color={C.red} /><Label x={x(15) + 10} y={y(L(15)) + 20} text={`${L(15).toFixed(2)} at 15`} color={C.red} size={13} />
                <Glow cx={x(80)} cy={y(L(80))} r={6} color={C.red} /><Label x={x(80) - 10} y={y(L(80)) - 12} text={`${L(80).toFixed(2)} at 80`} color={C.red} size={13} anchor="end" /></>}
            </g>); })()}
          {after(tl, f, 2) && <path d={ageXs.filter(v => v <= lerp(15, 80, i === 2 ? prog(tl, f, 2, 2) : 1)).map((v, j) => `${j ? 'L' : 'M'}${x(v).toFixed(1)},${y(pChd(v)).toFixed(1)}`).join(' ')} fill="none" stroke={C.signal} strokeWidth={4} />}
          {ages.map((a, j) => { const q = prog(tl, f, 0, 0.5 + j * 0.15); return <Glow key={j} cx={x(a)} cy={lerp(y(0.5), y(props[j]), q)} r={7} color={GROUP[0]} opacity={q} />; })}
          {i === 0 && prog(tl, f, 0, 2) > 0.98 && <><Label x={x(24.5)} y={y(0.1) + 26} text="0.10" color={GROUP[0]} size={13} anchor="middle" /><Label x={x(64.5)} y={y(0.8) - 16} text="0.80" color={GROUP[0]} size={13} anchor="middle" /></>}
          {i === 5 && (() => { const q = prog(tl, f, 5, 1.4); return (<g opacity={i === 5 ? 1 : 1}>
            <line x1={x(60)} x2={x(60)} y1={y(-0.3)} y2={lerp(y(-0.3), y(p60), q)} stroke={C.signal} strokeWidth={2} strokeDasharray="5 5" />
            {q > 0.98 && <><line x1={x(15)} x2={x(60)} y1={y(p60)} y2={y(p60)} stroke={C.signal} strokeWidth={2} strokeDasharray="5 5" />
              <Glow cx={x(60)} cy={y(p60)} r={9} color={C.signal} />
              <Label x={x(60) + 14} y={y(p60) + 26} text={`p = ${p60.toFixed(4)}`} color={C.signal} size={16} weight={700} /></>}
          </g>); })()}
        </g>}
        {/* logit scale */}
        {i === 3 && (() => { const yl = lin(-3.5, 3.5, 362, 16); const q = prog(tl, f, 3, 1.8); const xe = Math.min(lerp(15, 80, q), (3.4 - b0) / b1); return (<g>
          <line x1={x(15)} x2={x(80)} y1={yl(0)} y2={yl(0)} stroke={C.muted} strokeWidth={1} strokeDasharray="4 6" />
          <AxisY y={yl} x={80} ticks={[-3, -2, -1, 0, 1, 2, 3]} label="logit = ln(p / (1 − p))" />
          <AxisX x={x} y={362} ticks={[20, 30, 40, 50, 60, 70, 80]} label="age (years)" />
          <line x1={x(15)} x2={x(xe)} y1={yl(b0 + b1 * 15)} y2={yl(b0 + b1 * xe)} stroke={C.signal} strokeWidth={4} />
          {ages.map((a, j) => { const lg = Math.log(props[j] / (1 - props[j])); const p = prog(tl, f, 3, 0.6 + j * 0.15); return <Glow key={j} cx={x(a)} cy={lerp(yl(0), yl(lg), p)} r={7} color={C.noise} opacity={p} />; })}
          {q > 0.98 && <><Label x={x(24.5) + 12} y={yl(-2.197) + 24} text="−2.197" color={C.noise} size={13} /><Label x={x(70)} y={yl(b0 + b1 * 70) + 30} text="b0 + b1·age" color={C.signal} size={14} /></>}
        </g>); })()}
        {/* z test on the Normal curve */}
        {i === 4 && (() => { const xz = lin(-5, 5, 70, 720), yz = lin(0, 0.42, 340, 60); const zs = range(-5, 5, 200); const q = prog(tl, f, 4, 1.8); return (<g>
          {[-1, 1].map(sg => <path key={sg} d={`M${xz(1.96 * sg)},${yz(0)} ` + range(1.96, 5, 60).map(v => `L${xz(v * sg).toFixed(1)},${yz(normPdf(v, 0, 1)).toFixed(1)}`).join(' ') + ` L${xz(5 * sg)},${yz(0)} Z`} fill={C.signal} opacity={0.2} />)}
          <path d={zs.map((v, j) => `${j ? 'L' : 'M'}${xz(v).toFixed(1)},${yz(normPdf(v, 0, 1)).toFixed(1)}`).join(' ')} fill="none" stroke={C.noise} strokeWidth={3} />
          {[-1.96, 1.96].map(v => <g key={v}><line x1={xz(v)} x2={xz(v)} y1={150} y2={340} stroke={C.signal} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xz(v)} y={140} text={v.toFixed(2)} color={C.signal} size={13} anchor="middle" /></g>)}
          <line x1={xz(3.2905)} x2={xz(3.2905)} y1={190} y2={340} stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 5" />
          <Label x={xz(3.2905)} y={180} text="3.2905" color={C.muted} size={13} anchor="middle" />
          <Glow cx={xz(zAge * q)} cy={310} r={9} color={C.green} />
          {q > 0.98 && <Label x={xz(zAge)} y={286} text="z = 4.610" color={C.green} size={16} weight={700} anchor="middle" />}
          <AxisX x={xz} y={340} ticks={[-4, -2, 0, 2, 4]} label="z (standard Normal)" />
        </g>); })()}
        {/* odds bar */}
        {i === 6 && (() => { const q = prog(tl, f, 6, 1.4), q2 = prog(tl, f, 6, 2.6); const x0 = 100, W = 560; return (<g>
          <rect x={x0} y={150} width={W * 0.79 * q} height={46} rx={6} fill={C.signal} opacity={0.9} />
          <rect x={x0 + W * 0.79} y={150} width={W * 0.21 * q} height={46} rx={6} fill={C.noise} opacity={0.85} />
          <text x={x0 + W * 0.395} y={180} fill={C.bg} fontSize={16} fontFamily={mono} textAnchor="middle" fontWeight={700} opacity={q}>p = 0.79</text>
          <text x={x0 + W * 0.895} y={180} fill={C.bg} fontSize={15} fontFamily={mono} textAnchor="middle" fontWeight={700} opacity={q}>0.21</text>
          <Label x={x0 + W * 0.895} y={226} text="1 − p" color={C.noise} size={14} anchor="middle" opacity={q} />
          <g opacity={q2}>
            <Label x={x0 + W / 2} y={290} text={`odds = 0.79 / 0.21 = ${oddsSlide.toFixed(2)} : 1`} color={C.signal} size={22} anchor="middle" weight={700} />
            <Label x={x0 + W / 2} y={326} text={`unrounded p ${p60.toFixed(4)} → odds ${oddsExact.toFixed(2)}`} color={C.muted} size={15} anchor="middle" />
          </g>
        </g>); })()}
        {/* O-rings */}
        {i >= 7 && (() => { const xt = lin(50, 85, 80, 730), yt = lin(-0.15, 1.3, 362, 30); const q = prog(tl, f, 7, 2); const temps = range(50, 85, 140);
          const seen: Record<string, number> = {};
          return (<g>
            {[0, 1].map(v => <line key={v} x1={xt(50)} x2={xt(85)} y1={yt(v)} y2={yt(v)} stroke={C.muted} strokeWidth={1} strokeDasharray="4 6" />)}
            <AxisY y={yt} x={80} ticks={[0, 0.5, 1]} fmt={v => v.toFixed(1)} />
            <Label x={90} y={yt(1.24)} text="probability of failure (1 = failed)" color={C.muted} size={14} />
            <AxisX x={xt} y={362} ticks={[50, 55, 60, 65, 70, 75, 80, 85]} label="launch temperature (°F)" />
            {oring.map(([tp, fl], j) => { const key = `${tp}-${fl}`; const n = seen[key] = (seen[key] || 0) + 1; const off = (n - 1) * 12 * (fl ? -1 : 1);
              const a = prog(tl, f, 7, 0.4 + j * 0.04); return <Glow key={j} cx={xt(tp)} cy={yt(fl) + off} r={5.5} color={fl ? C.pink : C.blue} opacity={i === 7 ? a : 1} />; })}
            <path d={temps.filter(v => v <= lerp(50, 85, i === 7 ? q : 1)).map((v, j) => `${j ? 'L' : 'M'}${xt(v).toFixed(1)},${yt(pRing(v)).toFixed(1)}`).join(' ')} fill="none" stroke={C.signal} strokeWidth={4} />
            {(i === 7 ? q > 0.98 : true) && [53, 75].map(tp => <g key={tp} opacity={i === 7 ? prog(tl, f, 7, 3) : 0.6}>
              <Glow cx={xt(tp)} cy={yt(pRing(tp))} r={8} color={C.signal} />
              <Label x={xt(tp) + 12} y={yt(pRing(tp)) + (tp === 53 ? -16 : -14)} text={`${tp} °F → ${pRing(tp).toFixed(3)}`} color={C.signal} size={14} weight={700} />
            </g>)}
            {i === 8 && (() => { const a = prog(tl, f, 8, 1.2); return (<g opacity={a}>
              <Label x={xt(77)} y={yt(0.62)} text="b1 = −0.155 < 0" color={C.green} size={15} weight={700} anchor="middle" />
              <Label x={xt(77)} y={yt(0.62) + 24} text="odds × 0.856 per °F" color={C.green} size={14} anchor="middle" />
            </g>); })()}
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S19Logistic;
