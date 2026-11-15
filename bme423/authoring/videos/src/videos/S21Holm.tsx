import React from 'react';
import {C, GROUP} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, AxisX, Glow, Label} from '../kit/plot';

// Session 21 slides 11-12: Holm-corrected pairwise t tests after the FEV1 repeated measures ANOVA. Case "s21-fev1-holm".
// Uses the rounded inputs printed with the example (means 3.48, 3.20, 3.75 and MS_res = 0.0047), which reproduce its t values.
const n = 4, msRes = 0.0047, df = 6;
const mB = 3.48, mE = 3.20, mS = 3.75;
const se = Math.sqrt(2 * msRes / n);                       // 0.048477
const tES = (mE - mS) / se, tBE = (mB - mE) / se, tBS = (mB - mS) / se; // -11.346, 5.776, -5.570
const ordered = [
  {pair: 'endotoxin vs salb + endo', t: tES, alpha: '0.05/3 = 0.0167', cut: 3.707, col: '0.01'},
  {pair: 'baseline vs endotoxin', t: tBE, alpha: '0.05/2 = 0.025', cut: 3.143, col: '0.02'},
  {pair: 'baseline vs salb + endo', t: tBS, alpha: '0.05/1 = 0.05', cut: 2.447, col: '0.05'},
];

export const meta = {
  id: 's21-s21holm', session: 21, method: 's21holm',
  cases: {
    's21-fev1-holm': [1, 2, 3, 4, 5, 7, 8, 9],
    's21-orig-hr-holm': [1, 2, 3, 4, 5, 7, 8, 9],
  },
  title: 'Holm-corrected t tests · which treatments differ',
  steps: [
    {title: 'After a significant F', seconds: 7, caption: 'The F test said **some FEV1 means differ** but not which ones. Pairwise t tests find the pairs that differ.',
      card: [{label: 'printed ANOVA result', value: 'F = 64.053, P < 0.01', color: C.green, note: 'MS_res = 0.0047 · n = 4 · DF_res = 6\nmeans 3.48, 3.20, 3.75 L'}]},
    {title: 'One H0 per pair', seconds: 6, caption: 'Each pair gets its own null hypothesis, that the two treatments have the **same population mean**.',
      card: [{label: 'pairwise null hypothesis', tex: 'H_0:\\mu_i=\\mu_j', note: 'k = 3 pairs from m = 3 treatments'}]},
    {title: 'Standard error', seconds: 6, caption: 'Every comparison uses the same **standard error**, built from the residual mean square of the ANOVA.',
      card: [{label: 'standard error of a difference', tex: '\\sqrt{2MS_{res}/n}', value: `√(2(0.0047)/4) = ${se.toFixed(6)}`, color: C.noise}]},
    {title: 'Three t values', seconds: 8, caption: 'Each t is a difference of two means divided by that standard error. Endotoxin vs salbutamol is the **largest**.',
      card: [{label: 'pairwise t', tex: 't=\\frac{\\bar T_i-\\bar T_j}{\\sqrt{2MS_{res}/n}}', value: `${tES.toFixed(3)}, ${tBE.toFixed(3)}, ${tBS.toFixed(3)}`, color: C.signal, note: 'from the rounded means and MS_res\nunrounded data give −11.319, 5.659, −5.659'}]},
    {title: 'Order and Holm levels', seconds: 8, caption: 'Sort by |t|, largest first. The first test uses the **strictest level** 0.05/3, and the last uses the full 0.05.',
      card: [{label: 'Holm levels', tex: '\\alpha_j=\\frac{\\alpha_T}{k-j+1}', value: '0.0167, 0.025, 0.05', color: C.signal}]},
    {title: 'Class t table', seconds: 9, caption: 'The **class t table**, row 6, has no 0.0167 or 0.025 column. Use the stricter printed neighbors, 0.01 and 0.02.',
      card: [{label: 'class t table, row DF_res', tex: '\\nu=DF_{res}=(n-1)(m-1)=6', value: '0.01 → 3.707 · 0.02 → 3.143', color: C.signal, note: 'column 0.05 → 2.447 for the last test'}]},
    {title: 'Comparison 1', seconds: 6, caption: 'Endotoxin vs salbutamol plus endotoxin has |t| = 11.346, beyond **3.707**, so these two differ.',
      card: [{label: 'j = 1, α = 0.0167', value: '11.346 > 3.707 → differ', color: C.green}]},
    {title: 'Comparison 2', seconds: 6, caption: 'Baseline vs endotoxin has |t| = 5.776, beyond **3.143**, so FEV1 falls after endotoxin.',
      card: [{label: 'j = 2, α = 0.025', value: '5.776 > 3.143 → differ', color: C.green}]},
    {title: 'Comparison 3', seconds: 8, caption: 'Baseline vs salbutamol plus endotoxin has |t| = 5.570, beyond **2.447**. All **three pairs differ**.',
      card: [{label: 'j = 3, α = 0.05', value: '5.570 > 2.447 → differ', color: C.green, note: 'FEV1 is lowest after endotoxin and highest\nafter endotoxin plus salbutamol'}]},
  ] as Step[],
};

const S21Holm: React.FC = () => (
  <Frame title={meta.title} session={21} steps={meta.steps}>
    {(f, i, tl) => {
      const xm = lin(3.1, 3.85, 90, 690), yA = 330;
      const pts = [{name: 'endotoxin', v: mE, c: GROUP[1]}, {name: 'baseline', v: mB, c: GROUP[0]}, {name: 'salb + endo', v: mS, c: GROUP[3]}];
      const brackets = [
        {a: mE, b: mB, h: 250, t: tBE, k: 1},
        {a: mB, b: mS, h: 250, t: tBS, k: 2},
        {a: mE, b: mS, h: 170, t: tES, k: 0},
      ];
      return (<g>
        {i <= 3 && <g>
          <AxisX x={xm} y={yA + 34} ticks={[3.1, 3.3, 3.5, 3.7]} fmt={v => v.toFixed(1)} label="treatment mean FEV1 (L)" />
          {pts.map((p, k) => { const a = prog(tl, f, 0, 0.5 + k * 0.3); return (<g key={k} opacity={a}>
            <Glow cx={xm(p.v)} cy={yA} r={9} color={p.c} />
            <Label x={xm(p.v)} y={yA - 22} text={`${p.name} ${p.v.toFixed(2)}`} color={p.c} anchor="middle" size={14} weight={700} />
          </g>); })}
          {after(tl, f, 1) && brackets.map((b, k) => { const p = prog(tl, f, 1, 0.6 + k * 0.4); const x1 = xm(b.a) + 4, x2 = xm(b.b) - 4;
            return (<g key={k} opacity={p}>
              <path d={`M${x1},${yA - 44} L${x1},${b.h} L${x2},${b.h} L${x2},${yA - 44}`} fill="none" stroke={b.k === 0 && i >= 3 ? C.signal : C.muted} strokeWidth={b.k === 0 && i >= 3 ? 3 : 2} />
              {after(tl, f, 3) && <Label x={(x1 + x2) / 2} y={b.h - 10} text={`t = ${b.t.toFixed(3)}`} color={b.k === 0 ? C.signal : C.ink} anchor="middle" size={15} weight={700} opacity={prog(tl, f, 3, 0.6 + k * 0.4)} />}
            </g>); })}
          {after(tl, f, 2) && <g opacity={prog(tl, f, 2)}>
            <line x1={xm(3.1)} x2={xm(3.1 + se)} y1={84} y2={84} stroke={C.noise} strokeWidth={6} strokeLinecap="round" />
            <Label x={xm(3.1 + se) + 10} y={89} text={`one SE = ${se.toFixed(4)} L`} color={C.noise} size={14} />
          </g>}
        </g>}
        {/* ordered comparisons with Holm levels */}
        {i === 4 && (() => { const x0 = 40, y0 = 70, rh = 80; return (<g>
          {['j', 'comparison', '|t|', 'Holm level'].map((h, k) => <Label key={h} x={[x0, x0 + 50, x0 + 380, x0 + 500][k]} y={y0} text={h} color={C.muted} size={14} weight={700} />)}
          {ordered.map((o, k) => { const p = prog(tl, f, 4, 0.6 + k * 0.6); return (<g key={k} opacity={p}>
            <Label x={x0} y={y0 + 60 + k * rh} text={String(k + 1)} color={C.signal} weight={700} size={18} />
            <Label x={x0 + 50} y={y0 + 60 + k * rh} text={o.pair} color={C.ink} size={16} />
            <Label x={x0 + 380} y={y0 + 60 + k * rh} text={Math.abs(o.t).toFixed(3)} color={C.signal} size={16} weight={700} />
            <Label x={x0 + 500} y={y0 + 60 + k * rh} text={o.alpha} color={C.noise} size={16} />
          </g>); })}
          <Label x={x0} y={y0 + 300} text="strictest first →  full 0.05 last" color={C.muted} size={14} opacity={prog(tl, f, 4, 2.6)} />
        </g>); })()}
        {/* class t table row 6 with the missing Holm columns bracketed */}
        {i === 5 && (() => { const p = prog(tl, f, 5); const cols = [
            {h: '0.05', v: ['2.571', '2.447', '2.365']}, {h: '0.025', v: null}, {h: '0.02', v: ['3.365', '3.143', '2.998']},
            {h: '0.0167', v: null}, {h: '0.01', v: ['4.032', '3.707', '3.499']}];
          const x0 = 120, y0 = 80, cw = 118, rh = 54; const rows = ['5', '6', '7']; return (<g opacity={p}>
            <Label x={x0 - 60} y={y0 - 34} text="class t table · two-tailed P" color={C.muted} size={14} />
            {cols.map((c, ci) => <Label key={c.h} x={x0 + 40 + ci * cw} y={y0} text={c.h} color={c.v ? (c.h === '0.05' ? C.ink : C.signal) : C.red} anchor="middle" weight={700} size={c.v ? 15 : 14} />)}
            {rows.map((r, ri) => <Label key={r} x={x0 - 60} y={y0 + 46 + ri * rh} text={`ν = ${r}`} color={r === '6' ? C.signal : C.muted} weight={700} />)}
            {cols.map((c, ci) => c.v ? c.v.map((v, ri) => { const hit = rows[ri] === '6'; return (<g key={`${ci}-${ri}`}>
              {hit && <rect x={x0 + 40 + ci * cw - 44} y={y0 + 24 + ri * rh} width={88} height={32} rx={8} fill="none" stroke={c.h === '0.05' ? C.ink : C.signal} strokeWidth={2.5} opacity={prog(tl, f, 5, 2.2)} />}
              <Label x={x0 + 40 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={hit ? (c.h === '0.05' ? C.ink : C.signal) : C.muted} anchor="middle" size={hit ? 17 : 15} weight={hit ? 700 : 400} /></g>); })
              : (<g key={ci} opacity={prog(tl, f, 5, 1.8)}>
                <rect x={x0 + 40 + ci * cw - 40} y={y0 + 18} width={80} height={rh * 3 - 4} rx={8} fill="none" stroke={C.red} strokeDasharray="5 5" strokeWidth={1.5} />
                <Label x={x0 + 40 + ci * cw} y={y0 + 46 + rh} text="—" color={C.red} anchor="middle" />
                <Label x={x0 + 40 + ci * cw} y={y0 + 18 + rh * 3 + 18} text="not printed" color={C.red} anchor="middle" size={12} />
              </g>))}
            <Label x={x0 - 60} y={y0 + 270} text="0.0167 → use 0.01 (3.707)   0.025 → use 0.02 (3.143)" color={C.signal} size={14} opacity={prog(tl, f, 5, 3)} />
          </g>); })()}
        {/* the three Holm comparisons on t scales */}
        {i >= 6 && (() => { const xt = lin(0, 12, 60, SW - 40); return (<g>
          {ordered.map((o, k) => { if (i < 6 + k) return null; const y0 = 80 + k * 118; const p = prog(tl, f, 6 + k, 1.8); const done = i > 6 + k;
            const tv = Math.abs(o.t) * (done ? 1 : p); return (<g key={k} opacity={done ? 0.55 : 1}>
              <Label x={60} y={y0 - 34} text={`${k + 1}. ${o.pair} · α ${o.alpha.split(' = ')[1]}`} color={C.ink} size={14} weight={700} />
              <line x1={xt(0)} x2={xt(12)} y1={y0 + 20} y2={y0 + 20} stroke={C.muted} strokeWidth={1.5} />
              {[0, 2, 4, 6, 8, 10, 12].map(v => <g key={v}><line x1={xt(v)} x2={xt(v)} y1={y0 + 20} y2={y0 + 26} stroke={C.muted} />
                <text x={xt(v)} y={y0 + 42} fill={C.muted} fontSize={12} textAnchor="middle">{v}</text></g>)}
              <rect x={xt(o.cut)} y={y0 - 18} width={xt(12) - xt(o.cut)} height={38} fill={C.red} opacity={0.08} />
              <line x1={xt(o.cut)} x2={xt(o.cut)} y1={y0 - 18} y2={y0 + 20} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
              <Label x={xt(o.cut) - 6} y={y0 - 4} text={`${o.cut}`} color={C.red} size={13} anchor="end" weight={700} />
              <Glow cx={xt(tv)} cy={y0 + 4} r={8} color={C.signal} />
              <Label x={tv > 9 ? xt(tv) - 16 : xt(tv) + 14} y={y0 + 9} text={`|t| ${tv.toFixed(3)}`} color={C.signal} size={14} weight={700} anchor={tv > 9 ? 'end' : 'start'} />
              {(done || p > 0.98) && <Label x={SW - 40} y={y0 - 34} text="differ" color={C.green} anchor="end" size={14} weight={700} />}
            </g>); })}
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S21Holm;
