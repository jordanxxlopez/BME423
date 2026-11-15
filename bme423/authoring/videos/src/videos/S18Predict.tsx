import React from 'react';
import {C, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Arrow, Label, range} from '../kit/plot';

// Session 18 pages 24-25, case "s18-martians-at40": ŷ = -6.0 + 0.44x, s_y|x = 1.02 g, n = 10, x̄ = 36.9 cm, s_x = 5.0 cm.
const X = [31, 32, 33, 34, 35, 35, 40, 41, 42, 46];
const Y = [7.8, 8.3, 7.6, 9.1, 9.6, 9.8, 11.8, 12.1, 14.7, 13.0];
const a = -6.0, b = 0.44, syx = 1.02, n = 10, xbar = 36.9, sx = 5.0, x0 = 40;
const tc = 2.306;                                                     // class t table, row 8, column 0.05
const B = (v: number) => 1 / n + (v - xbar) ** 2 / ((n - 1) * sx ** 2);
const yhat = (v: number) => a + b * v;
const seMean = (v: number) => syx * Math.sqrt(B(v));
const seNew = (v: number) => syx * Math.sqrt(1 + B(v));
const y0 = yhat(x0);                                                  // 11.6
const B0 = B(x0);                                                     // 0.1427111
const sm = seMean(x0), sn = seNew(x0);                                // 0.3853267, 1.090356
const Mm = tc * sm, Mn = tc * sn;                                     // 0.8885633, 2.514361

export const meta = {
  id: 's18-s18predict', session: 18, method: 's18predict',
  title: 'Prediction · CI for the mean vs one observation',
  cases: {
    's18-martians-at40': [1, 2, 3, 4, 5, 6, 7, 8],
    's18-plutonian-males': [null, 4, null, null, null, 1, 2, 5, 7],
    's18-original-caffeine': [null, null, null, null, null, null, null, null, null, null, 5, 7],
  },
  steps: [
    {title: 'Predict at 40 cm', seconds: 7, caption: 'Put x = 40 cm into the line. The predicted **mean weight** of all 40 cm Martians is 11.6 g.',
      card: [{label: 'predicted mean', tex: '\\hat y=a+bx', value: `−6.0 + 0.44(40) = ${y0.toFixed(1)} g`, color: C.signal}]},
    {title: 'Distance from the mean', seconds: 7, caption: 'The farther x is from the mean height **36.9 cm**, the less certain the height of the line is there.',
      card: [{label: 'distance term', tex: '\\frac1n+\\frac{(x-\\bar x)^2}{(n-1)s_x^2}', value: `0.1 + 9.61/225 = ${B0.toFixed(5)}`}]},
    {title: 'SE of the mean', seconds: 7, caption: 'This standard error measures how uncertain the **line itself** is. The band of ± 1 SE is thinnest at 36.9 cm.',
      card: [{label: 'SE of the predicted mean', tex: 's_{\\hat y}=s_{y|x}\\sqrt{\\tfrac1n+\\tfrac{(x-\\bar x)^2}{(n-1)s_x^2}}', value: `1.02 · √${B0.toFixed(5)} = ${sm.toFixed(4)} g`, color: C.signal}]},
    {title: 'Class t table', seconds: 7, caption: 'Both intervals use ν = n − 2 = 8. In the **class t table** (two-tailed), row 8 and column 0.05 give **2.306**.',
      card: [{label: 'class t table', tex: '\\nu=n-2=8', value: 'row 8 · column 0.05 → 2.306', color: C.signal}]},
    {title: 'CI for the mean', seconds: 8, caption: 'The 95% band for the **line of means** is narrowest at 36.9 cm and flares out toward both ends.',
      card: [{label: '95% CI for the mean at 40 cm', tex: '\\hat y\\pm t_\\alpha(\\nu)\\cdot s_{\\hat y}', value: `11.6 ± ${Mm.toFixed(4)} → (${(y0 - Mm).toFixed(2)}, ${(y0 + Mm).toFixed(2)})`, color: C.signal}]},
    {title: 'One new Martian', seconds: 8, caption: 'One Martian also scatters about the mean, so **add its own variance** to the uncertainty of the line.',
      card: [{label: 'SE for one observation', tex: 's_{Y_{new}}=\\sqrt{s_{y|x}^2+s_{\\hat y}^2}', value: `√(1.0404 + ${(sm * sm).toFixed(4)}) = ${sn.toFixed(4)} g`, color: C.noise}]},
    {title: 'CI for one Martian', seconds: 8, caption: 'The band for **one Martian** is much wider, and even with huge samples it never shrinks below about ± t·s_y|x.',
      card: [{label: '95% CI for one Martian at 40 cm', tex: '\\hat y\\pm t_\\alpha(\\nu)\\cdot s_{Y_{new}}', value: `11.6 ± ${Mn.toFixed(4)} → (${(y0 - Mn).toFixed(2)}, ${(y0 + Mn).toFixed(2)})`, color: C.noise}]},
    {title: 'Compare the widths', seconds: 7, caption: 'At 40 cm the interval for one Martian is about **2.8 times** as wide as the interval for the mean.',
      card: [{label: 'ratio of standard errors', value: `${sn.toFixed(4)} / ${sm.toFixed(4)} ≈ ${(sn / sm).toFixed(1)}`, color: C.green}]},
  ] as Step[],
};

const x = lin(30, 48, 70, 500), y = lin(4, 18.5, 360, 20);
const PM = 590, PN = 680;                       // panel columns: mean, one Martian
const xs = range(30, 48, 73);
const band = (half: (v: number) => number, upto: number) => { const v = xs.filter(q => q <= upto + 1e-9); if (v.length < 2) return '';
  return v.map((q, k) => `${k ? 'L' : 'M'}${x(q).toFixed(1)},${y(yhat(q) + half(q)).toFixed(1)}`).join(' ') + ' ' +
    v.slice().reverse().map(q => `L${x(q).toFixed(1)},${y(yhat(q) - half(q)).toFixed(1)}`).join(' ') + ' Z'; };
const TABLE: Record<string, string[]> = {'7': ['1.895', '2.365', '2.998', '3.499'], '8': ['1.860', '2.306', '2.896', '3.355'], '9': ['1.833', '2.262', '2.821', '3.250']};
const COLS = ['0.10', '0.05', '0.02', '0.01'];

const S18Predict: React.FC = () => (
  <Frame title={meta.title} session={18} steps={meta.steps}>
    {(f, i, tl) => {
      const plotA = i === 3 ? 1 - prog(tl, f, 3, 0.6) : i === 4 ? prog(tl, f, 4, 0.6) : 1;
      // half-width of the mean band: 1 SE in step 3, grows to t·SE in step 5
      const kMean = i < 2 ? 0 : i === 2 ? prog(tl, f, 2, 1.4) : i === 3 ? 1 : i === 4 ? lerp(1, tc, prog(tl, f, 4, 2)) : tc;
      const meanUpto = i === 2 ? lerp(30, 48, prog(tl, f, 2, 2)) : 48;
      const newP = i === 6 ? prog(tl, f, 6, 2.2) : i > 6 ? 1 : 0;
      const yl = i < 2 ? 'ŷ = 11.6 g' : i === 2 || i === 3 ? `11.6 ± ${sm.toFixed(3)}` : '11.6';
      return (<g>
        <g opacity={plotA}>
          <defs><clipPath id="pclip"><rect x={60} y={0} width={450} height={368} /></clipPath></defs>
          <AxisX x={x} y={370} ticks={[30, 33, 36, 39, 42, 45, 48]} label="height x (cm)" />
          <g fontFamily={mono}><line x1={60} x2={60} y1={y(4)} y2={y(18)} stroke={C.muted} strokeWidth={1.5} />
            {[4, 6, 8, 10, 12, 14, 16, 18].map(v => <g key={v}><line x1={54} x2={60} y1={y(v)} y2={y(v)} stroke={C.muted} /><text x={50} y={y(v) + 5} fill={C.muted} fontSize={14} textAnchor="end">{v}</text></g>)}
            <text x={14} y={190} fill={C.muted} fontSize={15} textAnchor="middle" transform="rotate(-90 14 190)">weight y (g)</text></g>
          <g clipPath="url(#pclip)">
            {newP > 0 && <path d={band(v => tc * seNew(v), lerp(30, 48, newP))} fill={C.noise} fillOpacity={0.14} stroke={C.noise} strokeOpacity={0.7} strokeWidth={1.5} />}
            {kMean > 0 && <path d={band(v => kMean * seMean(v), meanUpto)} fill={C.signal} fillOpacity={0.22} stroke={C.signal} strokeOpacity={0.8} strokeWidth={1.5} />}
            <line x1={x(30)} x2={x(48)} y1={y(yhat(30))} y2={y(yhat(48))} stroke={C.signal} strokeWidth={3} opacity={prog(tl, f, 0, 1)} />
            {X.map((v, k) => { const p = prog(tl, f, 0, 0.3 + k * 0.06); return <Glow key={k} cx={x(v)} cy={y(Y[k])} r={5} color={C.blue} opacity={p * 0.9} />; })}
          </g>
          {/* x = 40 slice */}
          <line x1={x(x0)} x2={x(x0)} y1={26} y2={370} stroke={C.ink} strokeDasharray="5 5" strokeOpacity={0.7} opacity={prog(tl, f, 0, 1.4)} />
          <Label x={x(x0)} y={16} text="40 cm" color={C.ink} size={14} anchor="middle" opacity={prog(tl, f, 0, 1.4)} />
          <line x1={x(x0)} x2={PM} y1={y(y0)} y2={y(y0)} stroke={C.signal} strokeDasharray="3 5" strokeOpacity={0.5} opacity={prog(tl, f, 0, 2)} />
          <Glow cx={x(x0)} cy={y(y0)} r={7} color={C.signal} opacity={prog(tl, f, 0, 2)} />
          {/* mean height */}
          {after(tl, f, 1) && <g opacity={prog(tl, f, 1)}>
            <line x1={x(xbar)} x2={x(xbar)} y1={26} y2={370} stroke={C.muted} strokeDasharray="3 5" />
            <Label x={x(xbar)} y={16} text="36.9" color={C.muted} size={14} anchor="end" />
            {i === 1 && <><Arrow x1={x(xbar) + 2} y1={40} x2={x(x0) - 2} y2={40} color={C.ink} w={2} />
              <Label x={(x(xbar) + x(x0)) / 2} y={60} text="3.1 cm" color={C.ink} size={13} anchor="middle" /></>}
          </g>}
        </g>
        {/* right panel: the two intervals at 40 cm on the same weight scale */}
        {i !== 3 && <g opacity={i === 4 ? prog(tl, f, 4, 0.6) : prog(tl, f, 0, 2)}>
          <line x1={540} x2={540} y1={20} y2={360} stroke={C.line} />
          <Label x={PM} y={16} text="mean" color={C.signal} size={14} anchor="middle" />
          {i >= 5 && <Label x={PN} y={16} text="one Martian" color={C.noise} size={14} anchor="middle" opacity={prog(tl, f, 5)} />}
          {kMean > 0 && <line x1={PM} x2={PM} y1={y(y0 - kMean * sm)} y2={y(y0 + kMean * sm)} stroke={C.signal} strokeWidth={6} strokeLinecap="round" />}
          <Glow cx={PM} cy={y(y0)} r={7} color={C.signal} />
          <Label x={PM - 14} y={y(y0) + 5} text={yl} color={C.signal} size={14} anchor="end" weight={700} />
          {i >= 4 && kMean > tc - 0.01 && <g>
            <Label x={PM - 14} y={y(y0 + Mm) + 4} text={(y0 + Mm).toFixed(2)} color={C.signal} size={13} anchor="end" />
            <Label x={PM - 14} y={y(y0 - Mm) + 8} text={(y0 - Mm).toFixed(2)} color={C.signal} size={13} anchor="end" /></g>}
          {/* individual scatter at 40 cm (Normal, SD = s_y|x) */}
          {i === 5 && (() => { const p = prog(tl, f, 5, 1.6); const vs = range(y0 - 3 * syx, y0 + 3 * syx, 61);
            const pdf = (v: number) => Math.exp(-0.5 * ((v - y0) / syx) ** 2) / (syx * Math.sqrt(2 * Math.PI));
            return (<g opacity={p}>
              <path d={vs.map((v, k) => `${k ? 'L' : 'M'}${(PN + pdf(v) * 150 * p).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} fill={C.noise} fillOpacity={0.18} stroke={C.noise} strokeWidth={2} />
              <line x1={PN} x2={PN} y1={y(y0 - 3 * syx)} y2={y(y0 + 3 * syx)} stroke={C.noise} strokeOpacity={0.6} />
              <Label x={PN} y={y(y0 - 3 * syx) + 22} text="SD 1.02 g" color={C.noise} size={13} anchor="middle" />
            </g>); })()}
          {newP > 0 && <g>
            <line x1={PN} x2={PN} y1={y(y0 - Mn * newP)} y2={y(y0 + Mn * newP)} stroke={C.noise} strokeWidth={6} strokeLinecap="round" />
            <Glow cx={PN} cy={y(y0)} r={7} color={C.noise} />
            {newP > 0.98 && <><Label x={PN + 12} y={y(y0 + Mn) + 5} text={(y0 + Mn).toFixed(2)} color={C.noise} size={13} />
              <Label x={PN + 12} y={y(y0 - Mn) + 5} text={(y0 - Mn).toFixed(2)} color={C.noise} size={13} /></>}
          </g>}
          {i === 7 && <g opacity={prog(tl, f, 7)}>
            <Label x={PM} y={300} text={`${(2 * Mm).toFixed(2)} g`} color={C.signal} size={15} anchor="middle" weight={700} />
            <Label x={PN} y={300} text={`${(2 * Mn).toFixed(2)} g`} color={C.noise} size={15} anchor="middle" weight={700} />
            <Label x={(PM + PN) / 2} y={326} text="total width" color={C.muted} size={13} anchor="middle" />
          </g>}
        </g>}
        {/* class t table excerpt */}
        {i === 3 && (() => { const p = prog(tl, f, 3), x0t = 120, y0t = 100, cw = 130, rh = 54; return (<g opacity={p}>
          <Label x={x0t} y={y0t - 34} text="class t table · two-tailed α" color={C.muted} size={14} />
          {COLS.map((c, ci) => <Label key={c} x={x0t + 110 + ci * cw} y={y0t} text={c} color={c === '0.05' ? C.signal : C.muted} anchor="middle" weight={700} />)}
          {Object.entries(TABLE).map(([row, vs], ri) => (<g key={row}>
            <Label x={x0t} y={y0t + 46 + ri * rh} text={`ν = ${row}`} color={row === '8' ? C.signal : C.muted} weight={700} />
            {vs.map((v, ci) => { const hit = row === '8' && COLS[ci] === '0.05'; return (<g key={ci}>
              {hit && <rect x={x0t + 110 + ci * cw - 46} y={y0t + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 3, 2.4)} />}
              <Label x={x0t + 110 + ci * cw} y={y0t + 46 + ri * rh} text={v} color={hit ? C.signal : C.ink} anchor="middle" size={hit ? 18 : 15} weight={hit ? 700 : 400} /></g>); })}
          </g>))}
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S18Predict;
