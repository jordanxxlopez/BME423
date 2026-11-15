import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Arrow, Label, range, normPdf} from '../kit/plot';

// Session 17 slides 8 and 17 (decision with an interval; glucose exercise). Case "ci-glucose".
const n = 850, m1 = 112.4, s1 = 4.7, m2 = 109.1, s2 = 3.9;   // placebo, drug (mg/dL)
const d = +(m1 - m2).toFixed(4);                                // 3.3
const nu = 2 * n - 2;                                           // 1698
const sp2 = ((n - 1) * s1 ** 2 + (n - 1) * s2 ** 2) / nu;       // 18.65
const se = Math.sqrt(sp2 / n + sp2 / n);                        // 0.2094812
const t95 = 1.96, t200 = 1.972, t99 = 2.5758;                   // class t table: row ∞ col 0.05, row 200 col 0.05, row ∞ col 0.01
const M = t95 * se, lo = d - M, hi = d + M;                     // 0.4105831, 2.889417, 3.710583
const M2 = t200 * se;                                           // 0.4130968 → 2.886903, 3.713097
const M99 = t99 * se, lo99 = d - M99, hi99 = d + M99;           // 0.5395816 → 2.760418, 3.839582

// Class t table excerpt (two-tailed), copied from the printed table. `ghost` gets a dashed box.
type TRow = {name: string; vals: string[]};
const TTable: React.FC<{cols: string[]; rows: TRow[]; hit: [string, string]; ghost?: [string, string]; p: number; box: number}> = ({cols, rows, hit, ghost, p, box}) => {
  const x0 = 150, y0 = 60, cw = 120, rh = 54;
  return (<g opacity={p}>
    <Label x={x0} y={y0 - 28} text="class t table · two-tailed α" color={C.muted} size={14} />
    {cols.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === hit[1] ? C.signal : C.muted} anchor="middle" weight={700} />)}
    {rows.map((r, ri) => (<g key={r.name}>
      <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${r.name}`} color={r.name === hit[0] ? C.signal : C.muted} weight={700} />
      {r.vals.map((val, ci) => { const on = r.name === hit[0] && cols[ci] === hit[1]; const gh = !!ghost && r.name === ghost[0] && cols[ci] === ghost[1]; return (<g key={ci}>
        {on && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={box} />}
        {gh && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.noise} strokeWidth={2} strokeDasharray="5 4" opacity={box} />}
        <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={val} color={on ? C.signal : gh ? C.noise : C.ink} anchor="middle" size={on ? 18 : 15} weight={on || gh ? 700 : 400} /></g>); })}
    </g>))}
  </g>);
};

export const meta = {
  id: 's17-decision', session: 17, method: 'decision',
  // ci-glucose steps: contrast and hypotheses, difference, square SDs, pool, SE, df and cutoff, margin, bounds, decision.
  cases: {'ci-glucose': [2, 3, 4, 4, 4, 5, 6, 6, 7]},
  title: 'Using a confidence interval to decide',
  steps: [
    {title: 'The rule', seconds: 8, card: [{label: 'two-sided decision', tex: '0\\in[L,U]\\Rightarrow\\text{do not reject }H_0', note: '0 outside [L, U] → reject H0\none mean or proportion: use μ0 or p0'}],
      caption: 'For a difference the null value is **zero**. If the interval holds zero, do not reject. If it leaves zero out, reject.'},
    {title: 'Glucose trial', seconds: 8, card: [
      {label: 'data (mg/dL)', note: 'placebo  n 850 · mean 112.4 · SD 4.7\ndrug     n 850 · mean 109.1 · SD 3.9'},
      {label: 'null hypothesis', tex: 'H_0:\\ \\mu_1=\\mu_2', note: 'equal mean glucose · order placebo − drug'}],
      caption: '850 patients took placebo and 850 took the drug. The null says both populations have **equal mean glucose**.'},
    {title: 'Observed difference', seconds: 6, card: [{label: 'difference', tex: '(\\bar x_1-\\bar x_2)', value: '112.4 − 109.1 = 3.3 mg/dL', color: C.signal}],
      caption: 'Placebo minus drug is **3.3 mg/dL**. This sample difference sits in the middle of the interval.'},
    {title: 'Pooled SE', seconds: 8, card: [
      {label: 'pooled variance', tex: 's^2=\\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}', value: '31667.7 / 1698 = 18.65', color: C.noise},
      {label: 'standard error', tex: 's_{(\\bar x_1-\\bar x_2)}=\\sqrt{\\tfrac{s^2}{n_1}+\\tfrac{s^2}{n_2}}', value: `= ${se.toFixed(7)} mg/dL`, color: C.noise}],
      caption: 'Pooling the two variances gives 18.65. With 850 patients per group the **standard error** is only 0.209 mg/dL.'},
    {title: 'No row 1698', seconds: 9, card: [{label: 'class t table', tex: '\\nu=850+850-2=1698', value: 'row ∞ · column 0.05 → 1.9600', color: C.signal, note: 'row 1698 is not printed (large-df\napproximation) · row 200 → 1.972'}],
      caption: 'Row 1698 is **not printed**. The infinity row gives **1.9600** for large df, and row 200 gives a slightly wider 1.972.'},
    {title: '95% interval', seconds: 8, card: [{label: 'margin and interval', tex: '(\\bar x_1-\\bar x_2)\\pm t_{0.05}(\\infty)\\cdot s_{(\\bar x_1-\\bar x_2)}', value: `3.3 ± ${M.toFixed(4)} → (${lo.toFixed(3)}, ${hi.toFixed(3)})`, color: C.signal,
      note: `with row 200: (${(d - M2).toFixed(3)}, ${(d + M2).toFixed(3)})`}],
      caption: 'The margin is 1.96 times the standard error, 0.411 mg/dL. The 95% interval runs from **2.889 to 3.711** mg/dL.'},
    {title: 'Is zero inside?', seconds: 7, card: [{label: 'decision', value: '0 outside → reject H0', color: C.green, note: 'P < 0.05 · placebo is higher,\nso the drug lowers mean glucose'}],
      caption: 'Zero is far **outside** the interval, so reject equal means at 0.05. Placebo glucose is higher, so the drug lowers it.'},
    {title: '99% interval', seconds: 8, card: [{label: '99% interval', tex: '(\\bar x_1-\\bar x_2)\\pm t_{0.01}(\\infty)\\cdot s_{(\\bar x_1-\\bar x_2)}', value: `3.3 ± ${M99.toFixed(4)} → (${lo99.toFixed(3)}, ${hi99.toFixed(3)})`, color: C.purple, note: 'row ∞ · column 0.01 → 2.5758'}],
      caption: 'A **99%** interval uses column 0.01, so it is wider. It still leaves zero out, so reject at the 0.01 level too.'},
    {title: 'Match the levels', seconds: 9, card: [{label: 'match the levels', tex: '95\\%\\leftrightarrow\\alpha=0.05', note: '99% ↔ α = 0.01\nillustration, not study data'}],
      caption: 'In this illustration the 95% interval leaves out zero but the 99% one holds it, so **0.01 < P < 0.05**.'},
  ] as Step[],
};

const S17Decision: React.FC = () => (
  <Frame title={meta.title} session={17} steps={meta.steps}>
    {(f, i, tl) => {
      // Step 1 and step 9: schematic intervals (no study data)
      if (i === 0 || i === 8) {
        const x = lin(-3, 3, 40, SW - 30);
        const rows = i === 0
          ? [{lo: -0.8, hi: 1.4, y: 110, c: C.muted, t: 'holds 0 → do not reject'}, {lo: 0.6, hi: 2.4, y: 200, c: C.green, t: 'all above 0 → reject'}, {lo: -2.6, hi: -0.7, y: 290, c: C.green, t: 'all below 0 → reject'}]
          : [{lo: 0.25, hi: 2.35, y: 150, c: C.signal, t: '95% leaves 0 out'}, {lo: -0.2, hi: 2.8, y: 250, c: C.purple, t: '99% holds 0'}];
        const st = i === 0 ? 0 : 8;
        return (<g>
          <line x1={x(0)} x2={x(0)} y1={40} y2={392} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" opacity={prog(tl, f, st)} />
          <Label x={x(0)} y={30} text="0 = null value" color={C.red} anchor="middle" size={13} opacity={prog(tl, f, st)} />
          {rows.map((r, k) => { const p = prog(tl, f, st, 0.8 + k * 0.6); const mid = (r.lo + r.hi) / 2; return (<g key={k} opacity={p > 0 ? 1 : 0}>
            {i === 8 && <Glow cx={x(mid)} cy={r.y} r={7} color={C.signal} opacity={p} />}
            <line x1={x(lerp(mid, r.lo, p))} x2={x(lerp(mid, r.hi, p))} y1={r.y} y2={r.y} stroke={r.c} strokeWidth={6} strokeLinecap="round" />
            <Label x={x(mid)} y={r.y - 18} text={r.t} color={r.c} anchor="middle" size={14} weight={700} opacity={p} />
          </g>); })}
          <AxisX x={x} y={392} ticks={[-3, -2, -1, 0, 1, 2, 3]} fmt={t => t === 0 ? '0' : ''} label="" />
          <Label x={SW - 30} y={376} text="difference" color={C.muted} size={13} anchor="end" />
        </g>);
      }
      const xg = lin(95, 128, 40, SW - 30);                 // glucose for the two groups (Normal model)
      const xd = lin(-0.5, 4.5, 40, SW - 30);               // difference scale
      const topA = i === 4 ? 0 : 1; const pc = prog(tl, f, 1, 1.6);
      const groups = [{m: m1, s: s1, c: GROUP[0], name: 'placebo'}, {m: m2, s: s2, c: GROUP[1], name: 'drug'}];
      const yb = 210, peak = normPdf(m2, m2, s2);
      const xs = range(95, 128, 160);
      return (<g>
        <g opacity={topA}>
          {groups.map((g, gi) => { const yc = (v: number) => yb - 165 * normPdf(v, g.m, g.s) / peak * pc;
            return (<g key={gi}>
              <path d={xs.map((v, k) => `${k ? 'L' : 'M'}${xg(v).toFixed(1)},${yc(v).toFixed(1)}`).join(' ')} fill="none" stroke={g.c} strokeWidth={3} />
              <Label x={gi === 0 ? xg(g.m + g.s * 1.3) + 6 : xg(g.m - g.s * 1.3) - 6} y={yb - 105} text={g.name} color={g.c} anchor={gi === 0 ? 'start' : 'end'} weight={700} opacity={pc} />
              {after(tl, f, 2) && <line x1={xg(g.m)} x2={xg(g.m)} y1={yc(g.m) - 6} y2={yb} stroke={C.white} strokeWidth={2.5} opacity={prog(tl, f, 2)} />}
            </g>); })}
          {after(tl, f, 2) && <Label x={xg((m1 + m2) / 2)} y={18} text="3.3 apart" color={C.signal} anchor="middle" size={14} weight={700} opacity={prog(tl, f, 2)} />}
          <AxisX x={xg} y={yb} ticks={[95, 100, 105, 110, 115, 120, 125]} label="fasting glucose (mg/dL)" opacity={pc} />
        </g>
        {after(tl, f, 2) && i !== 4 && <g opacity={prog(tl, f, 2)}>
          <AxisX x={xd} y={392} ticks={[0, 1, 2, 3, 4]} />
          <Label x={SW - 30} y={300} text="placebo − drug (mg/dL)" color={C.muted} size={13} anchor="end" />
          <Glow cx={xd(d)} cy={360} r={8} color={C.signal} />
          {i < 5 && <Label x={xd(d)} y={336} text="difference = 3.3" color={C.signal} anchor="middle" weight={700} />}
          {after(tl, f, 3) && i < 7 && <g opacity={prog(tl, f, 3)}>
            <line x1={xd(d - se)} x2={xd(d + se)} y1={378} y2={378} stroke={C.noise} strokeWidth={4} />
            <Label x={xd(d + se) + 8} y={383} text={`± SE ${se.toFixed(3)}`} color={C.noise} size={13} /></g>}
          {after(tl, f, 5) && (() => { const p = prog(tl, f, 5, 1.6); return (<g>
            <line x1={xd(d - M * p)} x2={xd(d + M * p)} y1={360} y2={360} stroke={C.signal} strokeWidth={5} strokeLinecap="round" />
            {p > 0.98 && i < 7 && <><Label x={xd(lo) - 6} y={340} text={lo.toFixed(3)} color={C.signal} anchor="end" size={13} /><Label x={xd(hi) + 6} y={340} text={hi.toFixed(3)} color={C.signal} size={13} /></>}
            {i >= 7 && <Label x={xd(hi99) + 10} y={365} text="95%" color={C.signal} size={13} weight={700} />}
          </g>); })()}
          {after(tl, f, 6) && <g opacity={prog(tl, f, 6)}>
            <line x1={xd(0)} x2={xd(0)} y1={318} y2={392} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xd(0)} y={312} text="0 = no difference" color={C.red} anchor="middle" size={13} />
            <Arrow x1={xd(0) + 4} y1={372} x2={xd(i >= 7 ? lo99 : lo) - 4} y2={372} color={C.green} w={2} /></g>}
          {after(tl, f, 7) && (() => { const p = prog(tl, f, 7, 1.6); return (<g>
            <line x1={xd(d - M99 * p)} x2={xd(d + M99 * p)} y1={334} y2={334} stroke={C.purple} strokeWidth={5} strokeLinecap="round" />
            {p > 0.98 && <><Label x={xd(lo99) - 6} y={322} text={lo99.toFixed(3)} color={C.purple} anchor="end" size={13} /><Label x={xd(hi99) + 6} y={322} text={hi99.toFixed(3)} color={C.purple} size={13} />
              <Label x={xd(hi99) + 70} y={339} text="99%" color={C.purple} size={13} weight={700} /></>}
          </g>); })()}
        </g>}
        {i === 4 && <TTable p={prog(tl, f, 4)} box={prog(tl, f, 4, 2.4)} hit={['∞', '0.05']} ghost={['200', '0.05']} cols={['0.10', '0.05', '0.02', '0.01']}
          rows={[{name: '180', vals: ['1.653', '1.973', '2.347', '2.603']}, {name: '200', vals: ['1.653', '1.972', '2.345', '2.601']}, {name: '∞', vals: ['1.6449', '1.9600', '2.3263', '2.5758']}]} />}
        {i === 4 && <Label x={150} y={300} text="ν = 1698 falls between 200 and ∞" color={C.muted} size={15} opacity={prog(tl, f, 4, 2)} />}
      </g>);
    }}
  </Frame>
);

export default S17Decision;
