import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 20 slide 10: platelet aggregation before and after one cigarette, n = 11. Case "s20-platelet-paired".
// The slide prints only each person's change (after minus before), so each line starts at that person's own before value (0).
const dd = [2, 4, 10, 12, 16, 15, 4, 27, 9, -1, 15];
const n = dd.length;
const dbar = dd.reduce((a, b) => a + b, 0) / n;                       // 10.2727
const ss = dd.reduce((a, b) => a + (b - dbar) ** 2, 0);                // 636.182
const sd = Math.sqrt(ss / (n - 1));                                    // 7.9761
const se = sd / Math.sqrt(n);                                          // 2.40488
const t = dbar / se;                                                   // 4.27161
const tc = 2.228;                                                      // class t table, row 10, column 0.05
// stack equal differences so tied values sit on top of each other
const stack = dd.map((v, k) => dd.slice(0, k).filter(w => w === v).length);

export const meta = {
  id: 's20-s20paired', session: 20, method: 's20paired',
  cases: {
    's20-platelet-paired': [2, 3, 4, 5, 6, 7, 8, 9],
    's20-oc-paired': [2, 3, 4, 5, 6, 7, 8, 9],
    's20-grip-paired': [2, 3, 4, 5, 6, 7, 8, 9],
  },
  title: 'Paired t test · before and after',
  steps: [
    {title: 'Same person twice', seconds: 7, caption: 'Eleven people had platelet aggregation measured before and after one cigarette. Each line is **one person\'s change**.',
      card: [{label: 'change after − before (points)', note: '2, 4, 10, 12, 16, 15, 4, 27, 9, −1, 15\nn = 11 people'}]},
    {title: 'Null hypothesis', seconds: 6, caption: 'The paired t test asks whether the **true mean change** is zero. Zero would mean smoking changes nothing.',
      card: [{label: 'hypotheses', tex: 'H_0:\\delta=0\\qquad H_A:\\delta\\ne0', note: 'δ = true mean of after − before'}]},
    {title: 'One column of d', seconds: 7, caption: 'Subtracting each person\'s own before value leaves **one number per person**, so two columns become one.',
      card: [{label: 'differences', tex: 'd_i=x1_i-x2_i', value: 'n = 11 values of d', color: C.signal, note: 'x1 = after, x2 = before'}]},
    {title: 'Mean difference', seconds: 6, caption: 'The **mean difference** estimates how much smoking changes aggregation, about 10.3 percentage points.',
      card: [{label: 'mean difference', tex: '\\bar d=\\frac{1}{n}\\sum d_i', value: `113 / 11 = ${dbar.toFixed(4)}`, color: C.signal}]},
    {title: 'SD of the differences', seconds: 7, caption: 'The **SD of the differences** measures how much the change itself varies from person to person.',
      card: [{label: 'SD of the differences', tex: 's_d=\\sqrt{\\frac{1}{n-1}\\sum(d_i-\\bar d)^2}', value: `√(636.182 / 10) = ${sd.toFixed(4)}`, color: C.noise}]},
    {title: 'Standard error', seconds: 6, caption: 'Dividing by √n gives the **standard error**, how much the mean change would wobble from sample to sample.',
      card: [{label: 'standard error', tex: 's_{\\bar d}=\\frac{s_d}{\\sqrt n}', value: `7.9761 / √11 = ${se.toFixed(5)}`, color: C.noise}]},
    {title: 't and degrees of freedom', seconds: 7, caption: 't counts how many standard errors the mean change sits above zero. Here t is **4.27** with **ν = 10**.',
      card: [{label: 't statistic', tex: 't=\\frac{\\bar d}{s_{\\bar d}},\\quad \\nu=n-1', value: `10.2727 / 2.40488 = ${t.toFixed(5)}`, color: C.signal, note: 'ν = 11 − 1 = 10'}]},
    {title: 'Class t table', seconds: 7, caption: 'Use the **class t table** (two-tailed). Row 10 and column 0.05 give **2.228**. Columns 0.002 and 0.001 bracket P.',
      card: [{label: 'class t table', value: 'row 10 · column 0.05 → 2.228', color: C.signal, note: 'column 0.002 → 4.144 · column 0.001 → 4.587'}]},
    {title: 'Decision', seconds: 8, caption: 't passes **2.228**, so smoking raises platelet aggregation. It also passes 4.144, so **P < 0.002**.',
      card: [{label: 'decision', value: '4.272 > 2.228 → reject H0', color: C.green, note: '4.144 < 4.272 < 4.587 → 0.001 < P < 0.002\nrounded 10.3 / 2.41 also gives 4.27'}]},
  ] as Step[],
};

const S20Paired: React.FC = () => (
  <Frame title={meta.title} session={20} steps={meta.steps}>
    {(f, i, tl) => {
      // change plot (top-left): each line runs from the person's own before value (0) to after (d)
      const xb = 150, xa = 360, yc = lin(-5, 30, 196, 20);
      const xd = lin(-5, 30, 60, SW - 40), yDot = 336;          // dot plot of the differences
      const lineA = i <= 2 ? 1 : 0.12; const lab = i <= 2 ? 1 : 0;
      const drop = prog(tl, f, 2, 1.6);
      return (<g>
        {i <= 7 && <g>
          {/* change plot */}
          <g opacity={i === 7 ? 0 : 1}>
            <line x1={100} x2={100} y1={yc(-5)} y2={yc(30)} stroke={C.muted} strokeWidth={1.5} opacity={lab} />
            {[0, 10, 20, 30].map(v => <g key={v} opacity={lab}><line x1={94} x2={100} y1={yc(v)} y2={yc(v)} stroke={C.muted} />
              <Label x={88} y={yc(v) + 5} text={String(v)} color={C.muted} size={13} anchor="end" /></g>)}
            <line x1={100} x2={420} y1={yc(0)} y2={yc(0)} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" opacity={lineA} />
            <Label x={xb} y={216} text="before" color={C.muted} anchor="middle" size={14} opacity={lab} />
            <Label x={xa} y={216} text="after" color={C.muted} anchor="middle" size={14} opacity={lab} />
            <Label x={440} y={yc(28)} text="change from own" color={C.muted} size={13} opacity={lab} />
            <Label x={440} y={yc(28) + 18} text="before value" color={C.muted} size={13} opacity={lab} />
            {dd.map((v, k) => { const p = prog(tl, f, 0, 0.5 + k * 0.22); const ye = yc(v * p);
              return (<g key={k} opacity={lineA}>
                <line x1={xb} y1={yc(0)} x2={lerp(xb, xa, p)} y2={ye} stroke={v >= 0 ? C.signal : C.pink} strokeWidth={2.2} opacity={p > 0 ? 0.85 : 0} />
                <Glow cx={xb} cy={yc(0)} r={4} color={C.blue} opacity={p > 0 ? 1 : 0} />
              </g>); })}
          </g>
          {/* the change points: at the end of each line, then dropping onto the d axis */}
          {dd.map((v, k) => { const p0 = prog(tl, f, 0, 0.5 + k * 0.22); const pk = i >= 2 ? Math.min(1, Math.max(0, drop * 1.6 - k * 0.06)) : 0;
            const cx = lerp(xa, xd(v), pk), cy = lerp(yc(v), yDot - stack[k] * 16, pk);
            return <Glow key={k} cx={cx} cy={cy} r={6} color={v >= 0 ? C.signal : C.pink} opacity={i === 7 ? 0 : p0} />; })}
          {after(tl, f, 2) && i !== 7 && <g opacity={drop}>
            <AxisX x={xd} y={366} ticks={[-5, 0, 5, 10, 15, 20, 25, 30]} label="d = after − before (percentage points)" />
          </g>}
          {/* mean, SD and SE of the differences */}
          {after(tl, f, 3) && i !== 7 && <g opacity={prog(tl, f, 3)}>
            <line x1={xd(dbar)} x2={xd(dbar)} y1={286} y2={356} stroke={C.white} strokeWidth={3} />
            <Label x={xd(dbar) + 8} y={298} text={`mean d ${dbar.toFixed(2)}`} color={C.white} weight={700} />
          </g>}
          {after(tl, f, 4) && i !== 7 && (() => { const p = prog(tl, f, 4, 1.4); return (<g opacity={i >= 5 ? 0.35 : 1}>
            <line x1={xd(dbar - sd * p)} x2={xd(dbar + sd * p)} y1={272} y2={272} stroke={C.noise} strokeWidth={4} strokeLinecap="round" />
            {p > 0.98 && <Label x={xd(dbar + sd) + 8} y={277} text={`± s_d ${sd.toFixed(2)}`} color={C.noise} size={13} />}
          </g>); })()}
          {after(tl, f, 5) && i !== 7 && (() => { const p = prog(tl, f, 5, 1.4); return (<g>
            <line x1={xd(dbar - se * p)} x2={xd(dbar + se * p)} y1={252} y2={252} stroke={C.noise} strokeWidth={6} strokeLinecap="round" />
            {p > 0.98 && <Label x={xd(dbar + se) + 8} y={257} text={`± SE ${se.toFixed(2)}`} color={C.noise} size={13} />}
          </g>); })()}
          {/* t = number of standard errors between 0 and the mean change */}
          {i === 6 && (() => { const p = prog(tl, f, 6, 2.2); const k = Math.floor(t * p); return (<g>
            <line x1={xd(0)} x2={xd(0)} y1={210} y2={366} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            {Array.from({length: k}, (_, j) => <rect key={j} x={xd(j * se) + 1} y={222} width={xd(se) - xd(0) - 2} height={16} rx={4} fill={C.noise} opacity={0.75} />)}
            <rect x={xd(k * se) + 1} y={222} width={Math.max(0, xd(Math.min(t * p - k, 1) * se) - xd(0) - 2)} height={16} rx={4} fill={C.noise} opacity={0.4} />
            <Label x={xd(dbar) + 8} y={200} text={`t = ${(t * p).toFixed(2)} SEs`} color={C.signal} weight={700} />
          </g>); })()}
        </g>}
        {/* class t table excerpt */}
        {i === 7 && (() => { const p = prog(tl, f, 7); const cols = ['0.05', '0.01', '0.002', '0.001'];
          const vals: Record<string, string[]> = {'9': ['2.262', '3.250', '4.297', '4.781'], '10': ['2.228', '3.169', '4.144', '4.587'], '11': ['2.201', '3.106', '4.025', '4.437']};
          const x0 = 110, y0 = 90, cw = 120, rh = 54; return (<g opacity={p}>
            <Label x={x0} y={y0 - 28} text="class t table · two-tailed P" color={C.muted} size={14} />
            {cols.map((c, ci) => <Label key={c} x={x0 + 130 + ci * cw} y={y0} text={c} color={c === '0.05' ? C.signal : c === '0.01' ? C.muted : C.noise} anchor="middle" weight={700} />)}
            {Object.entries(vals).map(([row, vs], ri) => (<g key={row}>
              <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${row}`} color={row === '10' ? C.signal : C.muted} weight={700} />
              {vs.map((v, ci) => { const hit = row === '10' && ci === 0; const br = row === '10' && ci >= 2; return (<g key={ci}>
                {(hit || br) && <rect x={x0 + 130 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={hit ? C.signal : C.noise} strokeWidth={2.5} opacity={prog(tl, f, 7, hit ? 2.2 : 3.4)} />}
                <Label x={x0 + 130 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={hit ? C.signal : br ? C.noise : C.ink} anchor="middle" size={hit ? 18 : 15} weight={hit || br ? 700 : 400} /></g>); })}
            </g>))}
          </g>); })()}
        {/* decision on the t scale */}
        {i === 8 && (() => { const xt = lin(0, 5, 60, SW - 50); const p = prog(tl, f, 8, 2); return (<g opacity={prog(tl, f, 8, 0.6)}>
          <AxisX x={xt} y={300} ticks={[0, 1, 2, 3, 4, 5]} label="t" />
          <rect x={xt(tc)} y={170} width={xt(5) - xt(tc)} height={130} fill={C.red} opacity={0.1} />
          <line x1={xt(tc)} x2={xt(tc)} y1={160} y2={300} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xt(tc)} y={152} text="2.228" color={C.red} anchor="middle" size={14} weight={700} />
          {[4.144, 4.587].map(v => <g key={v}><line x1={xt(v)} x2={xt(v)} y1={200} y2={300} stroke={C.noise} strokeWidth={1.5} strokeDasharray="3 4" /></g>)}
          <Label x={xt(4.144) - 6} y={192} text="4.144" color={C.noise} anchor="end" size={13} />
          <Label x={xt(4.587) + 6} y={192} text="4.587" color={C.noise} size={13} />
          <Glow cx={xt(t * p)} cy={262} r={9} color={C.signal} />
          <Label x={xt(t * p)} y={240} text={`t = ${(t * p).toFixed(2)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S20Paired;
