import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, AxisX, Glow, Arrow, Label} from '../kit/plot';

// Session 19 case "s19-plutonian-slopes" (pages 11-13). Lines and SEs from the two R outputs.
// The raw Plutonian points are not in the pack, so only the fitted lines are drawn.
const male = {a: -4.2329, b: 3.2833, sb: 0.2041, s: 2.711, x0: 62, x1: 73, n: 18};
const fem = {a: 6.8349, b: 2.029, sb: 0.4708, s: 7.491, x0: 56, x1: 71, n: 18};
const diff = male.b - fem.b;                                   // 1.2543
const seD = Math.sqrt(male.sb ** 2 + fem.sb ** 2);              // 0.51314
const t = diff / seD;                                          // 2.444
const nu = male.n + fem.n - 4;                                 // 32
const tc = 2.037, t02 = 2.449;                                 // class t table row 32, columns 0.05 and 0.02

export const meta = {
  id: 's19-s19slopes', session: 19, method: 's19slopes',
  cases: {'s19-plutonian-slopes': [3, 4, 5, 6, 7, 8]},
  title: 'Comparing two regression slopes',
  steps: [
    {title: 'Two lines', seconds: 7, card: [{label: 'fitted lines (R) · weight on height', note: 'males    ŷ = −4.2329 + 3.2833x\nfemales  ŷ = 6.8349 + 2.0290x'}],
      caption: 'Each sex gets its own regression of weight on height. Males sit close to their line, and females **scatter more**.'},
    {title: 'Same slope?', seconds: 7, caption: 'The question is not which group is heavier. It is whether weight rises with height at the **same rate**.',
      card: [{label: 'null hypothesis', tex: 'H_0:\\beta_1=\\beta_2', value: 'same lbs gained per inch', color: C.signal}]},
    {title: 'Slopes and SEs', seconds: 7, caption: 'Each slope has a **standard error** from R. The female slope is less certain because female weights scatter more.',
      card: [{label: 'R output · Height.in row', note: 'males (1)    b 3.2833 · SE 0.2041 · n 18\nfemales (2)  b 2.0290 · SE 0.4708 · n 18'}]},
    {title: 'Slope difference', seconds: 6, caption: 'Males gain about **1.25 lbs more per inch** of height than females in these samples.',
      card: [{label: 'difference', tex: 'b_1-b_2', value: `3.2833 − 2.029 = ${diff.toFixed(4)}`, color: C.signal}]},
    {title: 'SE of the difference', seconds: 7, caption: 'The two samples are independent, so the slope **variances add**. The root of their sum is 0.51314.',
      card: [{label: 'standard error', tex: 's_{b_1-b_2}=\\sqrt{s_{b_1}^2+s_{b_2}^2}', value: `√(0.2041² + 0.4708²) = ${seD.toFixed(5)}`, color: C.noise}]},
    {title: 't statistic', seconds: 7, caption: 'The t statistic counts how many standard errors fit inside the difference. Here that is **2.444**.',
      card: [{label: 't statistic', tex: 't=\\frac{b_1-b_2}{s_{b_1-b_2}}', value: `${diff.toFixed(4)} / ${seD.toFixed(5)} = ${t.toFixed(3)}`, color: C.signal}]},
    {title: 'Class t table', seconds: 8, caption: 'Use the **class t table** (two-tailed). Each line uses 2 df, so ν = 18 + 18 − 4 = 32, and column 0.05 gives **2.037**.',
      card: [{label: 'class t table', tex: '\\nu=n_1+n_2-4=32', value: 'row 32 · column 0.05 → 2.037', color: C.signal}]},
    {title: 'Decision', seconds: 7, caption: '2.444 passes 2.037 but not 2.449, so **0.02 < P < 0.05**. Weight rises faster with height in males.',
      card: [{label: 'decision', value: '2.037 < 2.444 < 2.449', note: 'reject H0 · 0.02 < P < 0.05', color: C.green}]},
  ] as Step[],
};

const AxisY: React.FC<{y: (v: number) => number; x: number; ticks: number[]; label?: string}> = ({y, x, ticks, label}) => (
  <g fontFamily={mono}>
    <line x1={x} x2={x} y1={y(ticks[0])} y2={y(ticks[ticks.length - 1])} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(v => <g key={v}><line x1={x - 6} x2={x} y1={y(v)} y2={y(v)} stroke={C.muted} /><text x={x - 10} y={y(v) + 5} fill={C.muted} fontSize={14} textAnchor="end">{v}</text></g>)}
    {label && <text x={x + 10} y={y(ticks[ticks.length - 1]) + 4} fill={C.muted} fontSize={14}>{label}</text>}
  </g>
);

const S19Slopes: React.FC = () => (
  <Frame title={meta.title} session={19} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(54, 76, 80, 740), y = lin(100, 250, 362, 20);
      const lines = [{...male, c: GROUP[0], name: 'males'}, {...fem, c: GROUP[1], name: 'females'}];
      const xs = lin(1, 4.5, 110, 720);                       // slope scale
      const xd = lin(0, 2.6, 110, 700);                       // difference scale
      return (<g>
        {/* fitted lines with residual bands */}
        {i <= 1 && <g>
          <AxisY y={y} x={80} ticks={[100, 150, 200, 250]} label="weight (lbs)" />
          <AxisX x={x} y={362} ticks={[55, 60, 65, 70, 75]} label="height (inches)" />
          {lines.map((L, k) => { const g = prog(tl, f, 0, 1.2 + k * 0.4); const xe = lerp(L.x0, L.x1, g); const yy = (v: number) => L.a + L.b * v; return (<g key={k}>
            <polygon points={`${x(L.x0)},${y(yy(L.x0) + L.s)} ${x(xe)},${y(yy(xe) + L.s)} ${x(xe)},${y(yy(xe) - L.s)} ${x(L.x0)},${y(yy(L.x0) - L.s)}`} fill={C.noise} opacity={0.16} />
            <line x1={x(L.x0)} x2={x(xe)} y1={y(yy(L.x0))} y2={y(yy(xe))} stroke={L.c} strokeWidth={4} strokeLinecap="round" />
            {g > 0.95 && <Label x={x(L.x1) + 10} y={y(yy(L.x1)) + 5} text={L.name} color={L.c} size={14} />}
            {g > 0.95 && i === 0 && <Label x={x(L.x0) - 8} y={y(yy(L.x0)) + (k ? 28 : -14)} text={`± ${L.s}`} color={C.noise} size={13} anchor="middle" />}
          </g>); })}
          {i === 1 && lines.map((L, k) => { const q = prog(tl, f, 1, 1.2 + k * 0.3); const xa = k ? 60 : 64, xb = xa + 5; const ya = L.a + L.b * xa, yb = L.a + L.b * xb; return (<g key={k} opacity={q}>
            <line x1={x(xa)} x2={x(xb)} y1={y(ya)} y2={y(ya)} stroke={C.signal} strokeWidth={2} strokeDasharray="4 4" />
            <line x1={x(xb)} x2={x(xb)} y1={y(ya)} y2={y(yb)} stroke={C.signal} strokeWidth={3} />
            <Label x={x(xb) + 8} y={(y(ya) + y(yb)) / 2 + 5} text={`+${(L.b * 5).toFixed(1)} lbs per 5 in`} color={C.signal} size={13} />
          </g>); })}
        </g>}
        {/* slope scale with SE bars */}
        {i >= 2 && i !== 6 && <g opacity={prog(tl, f, 2, 0.8)}>
          {lines.map((L, k) => { const yy = 50 + k * 60; const g = prog(tl, f, 2, 1 + k * 0.3); return (<g key={k}>
            <Label x={10} y={yy + 5} text={L.name} color={L.c} size={14} />
            <line x1={xs(L.b - L.sb * g)} x2={xs(L.b + L.sb * g)} y1={yy + 16} y2={yy + 16} stroke={C.noise} strokeWidth={4} />
            <Glow cx={xs(L.b)} cy={yy} r={8} color={L.c} />
            <Label x={xs(L.b + L.sb) + 10} y={yy + 21} text={`± ${L.sb}`} color={C.noise} size={13} />
            <Label x={xs(L.b)} y={yy - 16} text={L.b.toFixed(4)} color={L.c} size={13} anchor="middle" />
          </g>); })}
          <AxisX x={xs} y={190} ticks={[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]} fmt={v => v.toFixed(1)} label="slope b (lbs per inch)" />
        </g>}
        {/* difference bar, SE triangle, SE ruler */}
        {i >= 3 && i <= 5 && <g opacity={prog(tl, f, 3, 0.8)}>
          <line x1={xd(0)} x2={xd(2.6)} y1={392} y2={392} stroke={C.muted} strokeWidth={1.5} />
          {[0, 0.5, 1, 1.5, 2, 2.5].map(v => <g key={v}><line x1={xd(v)} x2={xd(v)} y1={392} y2={398} stroke={C.muted} /><text x={xd(v)} y={414} fill={C.muted} fontSize={14} fontFamily={mono} textAnchor="middle">{v.toFixed(1)}</text></g>)}
          <rect x={xd(0)} y={340} width={(xd(diff) - xd(0)) * prog(tl, f, 3, 1.4)} height={18} rx={4} fill={C.signal} opacity={0.85} />
          <Label x={xd(0)} y={328} text={`b₁ − b₂ = ${diff.toFixed(4)}`} color={C.signal} size={14} weight={700} />
          {i === 4 && (() => { const q = prog(tl, f, 4, 1.4); const s = 230; const ox = 470, oy = 360; const ax = ox + male.sb * s, ay = oy - fem.sb * s; return (<g opacity={q}>
            <line x1={ox} x2={ax} y1={oy} y2={oy} stroke={GROUP[0]} strokeWidth={4} />
            <line x1={ax} x2={ax} y1={oy} y2={ay} stroke={GROUP[1]} strokeWidth={4} />
            <line x1={ox} x2={ax} y1={oy} y2={ay} stroke={C.noise} strokeWidth={4} />
            <Label x={(ox + ax) / 2} y={oy + 22} text="0.2041" color={GROUP[0]} size={13} anchor="middle" />
            <Label x={ax + 10} y={(oy + ay) / 2 + 5} text="0.4708" color={GROUP[1]} size={13} />
            <Label x={(ox + ax) / 2 - 12} y={(oy + ay) / 2 - 4} text={seD.toFixed(4)} color={C.noise} size={13} anchor="end" />
          </g>); })()}
          {i === 5 && (() => { const nT = Math.floor(t); return (<g>
            {Array.from({length: nT + 1}, (_, k) => { const a = prog(tl, f, 5, 0.6 + k * 0.6); const x0 = xd(k * seD), x1 = xd(Math.min((k + 1) * seD, diff)); return (<g key={k} opacity={a}>
              <rect x={x0} y={364} width={x1 - x0 - 2} height={12} rx={3} fill={C.noise} opacity={k < nT ? 0.9 : 0.5} />
              <line x1={x0} x2={x0} y1={336} y2={380} stroke={C.noise} strokeWidth={1.5} /></g>); })}
            <Label x={xd(diff) + 12} y={376} text={`${t.toFixed(3)} SE`} color={C.noise} size={15} weight={700} opacity={prog(tl, f, 5, 2.4)} />
          </g>); })()}
        </g>}
        {/* class t table */}
        {i === 6 && (() => { const p = prog(tl, f, 6), pb = prog(tl, f, 6, 2.4); const cols = ['0.10', '0.05', '0.02', '0.01'];
          const rows: [string, string[]][] = [['31', ['1.696', '2.040', '2.453', '2.744']], ['32', ['1.694', '2.037', '2.449', '2.738']], ['33', ['1.692', '2.035', '2.445', '2.733']]];
          const x0 = 130, y0 = 100, cw = 120, rh = 54; return (<g opacity={p}>
            <Label x={x0} y={y0 - 28} text="class t table · two-tailed α" color={C.muted} size={14} />
            {cols.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === '0.05' ? C.signal : C.muted} anchor="middle" weight={700} />)}
            {rows.map(([r, vs], ri) => (<g key={r}>
              <Label x={x0} y={y0 + 46 + ri * rh} text={`ν = ${r}`} color={r === '32' ? C.signal : C.muted} weight={700} />
              {vs.map((v, ci) => { const h = r === '32' && ci === 1; return (<g key={ci}>
                {h && <rect x={x0 + 110 + ci * cw - 46} y={y0 + 24 + ri * rh} width={92} height={32} rx={8} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={pb} />}
                <Label x={x0 + 110 + ci * cw} y={y0 + 46 + ri * rh} text={v} color={h ? C.signal : C.ink} anchor="middle" size={h ? 18 : 15} weight={h ? 700 : 400} /></g>); })}
            </g>))}
          </g>); })()}
        {/* decision on the t scale */}
        {i === 7 && (() => { const xt = lin(0, 3.2, 110, 700); const q = prog(tl, f, 7, 1.8); return (<g>
          <AxisX x={xt} y={392} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} fmt={v => v.toFixed(1)} />
          <rect x={xt(tc)} y={250} width={xt(3.2) - xt(tc)} height={142} fill={C.signal} opacity={0.08} />
          <line x1={xt(tc)} x2={xt(tc)} y1={262} y2={392} stroke={C.signal} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xt(tc) - 6} y={284} text="2.037 (0.05)" color={C.signal} size={13} anchor="end" />
          <line x1={xt(t02)} x2={xt(t02)} y1={240} y2={392} stroke={C.muted} strokeWidth={2} strokeDasharray="3 5" />
          <Label x={xt(t02) + 6} y={252} text="2.449 (0.02)" color={C.muted} size={13} />
          <Glow cx={xt(t * q)} cy={350} r={9} color={C.green} />
          {q > 0.98 && <Label x={xt(t) + 18} y={356} text="t = 2.444" color={C.green} size={15} weight={700} />}
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S19Slopes;
