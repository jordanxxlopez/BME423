import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, GROUP, FPS} from '../kit/theme';
import {Frame, Step, Timeline, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label, curvePath, range, normPdf} from '../kit/plot';

// Session 24 pages 26-27: platelet aggregation before and after one cigarette, 11 people (lecture exercise).
// Case "s24-platelet-signedrank". Differences are after minus before.
const before = [25, 25, 27, 44, 30, 67, 53, 53, 52, 60, 28];
const after_ = [27, 29, 37, 56, 46, 82, 57, 80, 61, 59, 43];
const d = after_.map((a, k) => a - before[k]);                  // 2 4 10 12 16 15 4 27 9 -1 15
const n = d.length;
const mags = d.map(Math.abs); const sortedM = [...mags].sort((a, b) => a - b);
const avgRank = (m: number) => { const a = sortedM.indexOf(m) + 1, b = sortedM.lastIndexOf(m) + 1; return (a + b) / 2; };
const rk = mags.map(avgRank);
const sr = d.map((v, k) => Math.sign(v) * rk[k]);
const W = sr.reduce((a, b) => a + b, 0);                         // 64
const pos = sr.filter(v => v > 0).reduce((a, b) => a + b, 0);    // 65
const tieSum = 12, v0 = n * (n + 1) * (2 * n + 1) / 6;           // 506
const sW = Math.sqrt(v0 - tieSum / 12);                          // 22.4722
const zW = (Math.abs(W) - 0.5) / sW;                             // 2.82571
const zc = 1.96;
const win = (tl: Timeline, f: number, i: number, a: number, b: number) =>
  interpolate(f, [tl.starts[i] + a * FPS, tl.starts[i] + b * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
const fmt = (v: number) => (v < 0 ? '−' : '') + String(Math.abs(v));

export const meta = {
  id: 's24-s24wnormal', session: 24, method: 's24wnormal',
  cases: {'s24-platelet-signedrank': [2, 1, 3, 4, 6, 6, 7, 8, 9]},
  title: 'Signed-rank test · Normal approximation with ties',
  steps: [
    {title: 'Eleven changes', seconds: 7, caption: 'Eleven people had platelet aggregation measured before and after one cigarette. Each dot is **one person\'s change**.',
      card: [{label: 'change after − before (points)', note: '2, 4, 10, 12, 16, 15, 4, 27, 9, −1, 15\nn = 11, none is zero'}]},
    {title: 'Null hypothesis', seconds: 7, caption: 'The same people are measured twice, so the **signed-rank test** is used. The null hypothesis says smoking changes nothing.',
      card: [{label: 'hypotheses', tex: 'H_0:\\text{differences centered on }0', note: 'HA  aggregation differs before and after\nn = 11 > 8, so the Normal approximation'}]},
    {title: 'Rank sizes with ties', seconds: 9, caption: 'The sizes are ranked from smallest to largest. Equal sizes **share the average** of the ranks they occupy, 3.5 and 8.5.',
      card: [{label: 'tied ranks', value: '4, 4 → 3.5 · 15, 15 → 8.5', color: C.noise, note: '|d| sorted 1 2 4 4 9 10 12 15 15 16 27\n(3 + 4)/2 = 3.5 · (8 + 9)/2 = 8.5'}]},
    {title: 'Signed ranks into W', seconds: 9, caption: 'Every change but one is positive. The positive ranks add to 65 and the −1 change takes 1 off, so **W = 64**.',
      card: [{label: 'sum of signed ranks', tex: 'W=\\sum\\operatorname{sign}(d_i)\\operatorname{rank}|d_i|', value: 'W = 65 − 1 = 64', color: C.signal, note: 'check 11(12)/2 − 2(1) = 64'}]},
    {title: 'Normal approximation', seconds: 7, caption: 'With more than 8 differences, W is close to Normal with **mean 0**. Without ties its variance is 506.',
      card: [{label: 'W without ties', tex: '\\mu_W=0,\\ \\ \\frac{n(n+1)(2n+1)}{6}', value: '11(12)(23)/6 = 506', color: C.noise}]},
    {title: 'Tie correction', seconds: 9, caption: 'Each tied pair adds 1·2·3 = 6 to the tie sum, so two pairs give **12**. That takes 12/12 = 1 off the variance.',
      card: [{label: 'tie-corrected SD of W', tex: '\\sigma_W^2=\\tfrac{n(n+1)(2n+1)}{6}-\\sum\\tfrac{(\\tau_i-1)\\tau_i(\\tau_i+1)}{12}', value: 'σW = √(506 − 12/12) = 22.4722', color: C.noise}]},
    {title: 'Compute z_W', seconds: 8, caption: 'W is 64 above its mean of 0. Taking off one half and dividing by σW gives **zW = 2.82571** standard deviations.',
      card: [{label: 'z for W', tex: 'z_W=\\frac{|W|-1/2}{\\sigma_W}', value: '63.5 / 22.4722 = 2.82571', color: C.signal}]},
    {title: 'Class t table', seconds: 7, caption: 'Use the **class t table** (two-tailed), infinity row. Column 0.05 gives **1.9600**, and columns 0.005 and 0.002 bracket P.',
      card: [{label: 'class t table', value: 'row ∞ · column 0.05 → 1.9600', color: C.signal, note: 'column 0.005 → 2.8070\ncolumn 0.002 → 3.0902'}]},
    {title: 'Decision', seconds: 9, caption: 'zW passes **1.96**, so smoking raises platelet aggregation. It lies between 2.8070 and 3.0902, so **0.002 < P < 0.005**.',
      card: [{label: 'decision', value: '2.826 > 1.960 → reject H0', color: C.green, note: '2.8070 < 2.82571 < 3.0902\nthe paired t test agrees, t = 4.27'}]},
  ] as Step[],
};

const S24Wnormal: React.FC = () => (
  <Frame title={meta.title} session={24} steps={meta.steps}>
    {(f, i, tl) => {
      const xd = lin(-5, 30, 70, SW - 40); const yDot = 200;
      const stack = d.map((v, k) => d.slice(0, k).filter(w => w === v).length);
      return (<g>
        {/* ---- changes on one axis ---- */}
        {i <= 1 && <g>
          <line x1={xd(0)} x2={xd(0)} y1={80} y2={250} stroke={C.red} strokeWidth={1.5} strokeDasharray="5 5" />
          <Label x={xd(0)} y={72} text="no change" color={C.red} size={13} anchor="middle" />
          {d.map((v, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.15);
            return <Glow key={k} cx={xd(v)} cy={lerp(60, yDot - stack[k] * 16, p)} r={7} color={v < 0 ? C.pink : C.signal} opacity={p} />; })}
          <AxisX x={xd} y={250} ticks={[-5, 0, 5, 10, 15, 20, 25, 30]} label="change in platelet aggregation (percentage points)" />
        </g>}

        {/* ---- sizes sorted into a row of tiles, ties merge to the average rank ---- */}
        {i === 2 && (() => { const sorted = mags.map((m, k) => ({m, k, s: d[k] < 0})).sort((a, b) => a.m - b.m);
          const xs = (j: number) => 90 + j * 60; const pm = win(tl, f, 2, 0.4, 2.0), pa = win(tl, f, 2, 3.4, 5.0);
          return (<g>
            <Label x={30} y={120} text="|d|" color={C.muted} size={14} anchor="middle" />
            <Label x={30} y={225} text="rank" color={C.muted} size={14} anchor="middle" />
            {sorted.map((o, j) => { const r0 = j + 1, r = avgRank(o.m); const tied = r0 !== r;
              const xo = lerp(xd(d[o.k]), xs(j), pm);
              return (<g key={j}>
                <rect x={xo - 24} y={100} width={48} height={32} rx={7} fill={o.s ? C.pink : C.noise} opacity={0.85 * pm + 0.15} />
                <Label x={xo} y={122} text={String(o.m)} color={C.bg} size={16} anchor="middle" weight={700} />
                <g opacity={pm}>
                  <Label x={xs(j)} y={225} text={String(r0)} color={C.muted} size={15} anchor="middle" opacity={tied ? 1 - pa : 1} />
                  {tied && <Label x={xs(j)} y={225} text={String(r)} color={C.signal} size={17} anchor="middle" weight={700} opacity={pa} />}
                </g>
              </g>); })}
            {[[2, 3], [7, 8]].map(([a, b]) => <g key={a} opacity={pa}>
              <path d={`M${xs(a) - 10},${245} L${xs(a) - 10},${255} L${xs(b) + 10},${255} L${xs(b) + 10},${245}`} fill="none" stroke={C.signal} strokeWidth={2} />
              <Label x={(xs(a) + xs(b)) / 2} y={280} text={`(${a + 1} + ${b + 1})/2`} color={C.signal} size={14} anchor="middle" />
            </g>)}
            <g opacity={win(tl, f, 2, 6.0, 6.8)}><Label x={xs(0)} y={330} text="the −1 change has the smallest size, rank 1" color={C.pink} size={14} /></g>
          </g>); })()}

        {/* ---- signed ranks stack into W ---- */}
        {i === 3 && (() => { const xw = lin(-5, 70, 60, SW - 40); const y0 = 320; let acc = 0;
          const order = sr.map((v, k) => ({v, k})).sort((a, b) => b.v - a.v);
          return (<g>
            <AxisX x={xw} y={y0} ticks={[0, 10, 20, 30, 40, 50, 60, 70]} label="sum of signed ranks W" />
            {order.map((o, j) => { const p = win(tl, f, 3, 0.6 + j * 0.4, 1.0 + j * 0.4); const a = acc; acc += o.v; const neg = o.v < 0;
              const yy = neg ? 200 : 250;
              return (<g key={j} opacity={p > 0 ? 1 : 0}>
                <rect x={Math.min(xw(a), xw(a + o.v * p))} y={yy - 12} width={Math.abs(xw(a + o.v * p) - xw(a))} height={24} rx={3} fill={neg ? C.pink : (j % 2 ? C.signal : '#d99a1e')} opacity={0.9} />
                {p > 0.9 && Math.abs(xw(a + o.v) - xw(a)) > 40 && <Label x={(xw(a) + xw(a + o.v)) / 2} y={yy + 5} text={fmt(o.v)} color={C.bg} size={13} anchor="middle" weight={700} />}
                {neg && p > 0.9 && <Label x={xw(a + o.v) - 6} y={yy - 18} text="−1" color={C.pink} size={14} weight={700} anchor="end" />}
              </g>); })}
            <g opacity={win(tl, f, 3, 4.4, 5.0)}><Label x={xw(pos)} y={286} text={`${pos}`} color={C.signal} size={14} anchor="middle" weight={700} /></g>
            <g opacity={win(tl, f, 3, 6.0, 6.8)}>
              <line x1={xw(W)} x2={xw(W)} y1={140} y2={y0} stroke={C.signal} strokeWidth={2} />
              <Glow cx={xw(W)} cy={y0} r={8} color={C.signal} />
              <Label x={xw(W)} y={130} text={`W = ${W}`} color={C.signal} size={18} anchor="middle" weight={700} />
            </g>
          </g>); })()}

        {/* ---- Normal approximation for W ---- */}
        {i === 4 && (() => { const xw = lin(-80, 80, 60, SW - 40); const yb = 320; const s0 = Math.sqrt(v0); const yc = (v: number) => yb - 220 * v / normPdf(0, 0, s0);
          const pc = win(tl, f, 4, 0.4, 1.8);
          return (<g>
            <path d={curvePath(range(-80, 80, 160), v => normPdf(v, 0, s0), xw, yc)} fill="none" stroke={C.noise} strokeWidth={2.5} opacity={pc} />
            <AxisX x={xw} y={yb} ticks={[-80, -60, -40, -20, 0, 20, 40, 60, 80]} label="W" />
            <line x1={xw(0)} x2={xw(0)} y1={yb - 236} y2={yb} stroke={C.white} strokeWidth={2} strokeDasharray="5 5" opacity={pc} />
            <Label x={xw(0)} y={yb - 244} text="μW = 0" color={C.white} size={15} anchor="middle" weight={700} opacity={pc} />
            <g opacity={win(tl, f, 4, 2.4, 3.2)}>
              <Glow cx={xw(W)} cy={yb} r={8} color={C.signal} />
              <Label x={xw(W)} y={yb - 18} text={`W = ${W}`} color={C.signal} size={15} anchor="middle" weight={700} />
            </g>
            <g opacity={win(tl, f, 4, 3.6, 4.4)}><Label x={xw(-75)} y={80} text="variance 506" color={C.noise} size={15} weight={700} /></g>
          </g>); })()}

        {/* ---- tie correction: two tied pairs, each (2−1)·2·3 = 6 ---- */}
        {i === 5 && (() => { const u = 22; const p1 = win(tl, f, 5, 0.6, 1.8), p2 = win(tl, f, 5, 2.0, 3.2), p3 = win(tl, f, 5, 4.2, 5.2), p4 = win(tl, f, 5, 5.8, 6.8);
          const block = (x0: number, p: number, label: string) => (<g opacity={p}>
            {Array.from({length: 6}, (_, q) => <rect key={q} x={x0 + (q % 3) * u} y={90 + Math.floor(q / 3) * u} width={u - 3} height={u - 3} rx={3} fill={C.noise} opacity={0.8} />)}
            <Label x={x0 + 1.5 * u} y={80} text={label} color={C.noise} size={14} anchor="middle" weight={700} />
            <Label x={x0 + 1.5 * u} y={160} text="1·2·3 = 6" color={C.ink} size={14} anchor="middle" />
          </g>);
          return (<g>
            {block(110, p1, '4, 4  τ = 2')}
            {block(280, p2, '15, 15  τ = 2')}
            <g opacity={p3}>
              <Label x={470} y={122} text="6 + 6 = 12" color={C.ink} size={18} weight={700} />
              <Label x={470} y={150} text="12 / 12 = 1" color={C.noise} size={18} weight={700} />
            </g>
            <g opacity={p4}>
              {(() => { const xv = lin(0, 520, 110, SW - 60); return (<g>
                <rect x={xv(0)} y={230} width={xv(506) - xv(0)} height={26} rx={4} fill={C.muted} opacity={0.5} />
                <Label x={xv(506) + 8} y={249} text="506" color={C.muted} size={14} />
                <rect x={xv(0)} y={270} width={xv(505) - xv(0)} height={26} rx={4} fill={C.noise} opacity={0.8} />
                <Label x={xv(505) + 8} y={289} text="505" color={C.noise} size={14} weight={700} />
                <Label x={xv(0) - 8} y={249} text="no ties" color={C.muted} size={13} anchor="end" />
                <Label x={xv(0) - 8} y={289} text="ties" color={C.noise} size={13} anchor="end" />
                <Label x={SW / 2} y={350} text={`σW = √505 = ${sW.toFixed(4)}`} color={C.noise} size={18} anchor="middle" weight={700} />
              </g>); })()}
            </g>
          </g>); })()}

        {/* ---- z: the distance 63.5 counted in standard deviations ---- */}
        {i === 6 && (() => { const xw = lin(0, 70, 70, SW - 50); const y0 = 300; const p1 = win(tl, f, 6, 0.6, 1.6), p2 = win(tl, f, 6, 2.0, 5.0), p3 = win(tl, f, 6, 5.4, 6.2);
          const nSeg = Math.ceil(zW); return (<g>
            <AxisX x={xw} y={y0} ticks={[0, 10, 20, 30, 40, 50, 60, 70]} label="W" />
            <Glow cx={xw(W)} cy={y0} r={7} color={C.signal} /><Label x={xw(W)} y={y0 - 14} text="64" color={C.signal} size={14} anchor="middle" weight={700} />
            <g opacity={p1}>
              <line x1={xw(0)} x2={xw(W - 0.5)} y1={150} y2={150} stroke={C.signal} strokeWidth={10} />
              <rect x={xw(W - 0.5)} y={145} width={xw(W) - xw(W - 0.5)} height={10} fill={C.red} />
              <Label x={xw(0)} y={132} text="|W| − ½ = 63.5" color={C.signal} size={15} weight={700} />
            </g>
            {Array.from({length: nSeg}, (_, j) => { const a = j * sW, b = Math.min((j + 1) * sW, W - 0.5); const p = Math.max(0, Math.min(1, p2 * nSeg - j));
              return (<g key={j} opacity={p > 0 ? 1 : 0}>
                <rect x={xw(a) + 1} y={205} width={Math.max(0, xw(a + (b - a) * p) - xw(a) - 2)} height={22} rx={4} fill={C.noise} opacity={j % 2 ? 0.55 : 0.85} />
                {p > 0.95 && <Label x={(xw(a) + xw(b)) / 2} y={250} text={j < nSeg - 1 ? `σW ${j + 1}` : `${(zW - j).toFixed(2)}`} color={C.noise} size={13} anchor="middle" />}
              </g>); })}
            <g opacity={p3}><Label x={SW / 2} y={70} text={`zW = 63.5 / 22.4722 = ${zW.toFixed(5)}`} color={C.signal} size={18} anchor="middle" weight={700} /></g>
          </g>); })()}

        {/* ---- class t table, infinity row ---- */}
        {i === 7 && (() => { const p = prog(tl, f, 7); const cols = ['0.05', '0.01', '0.005', '0.002'], vals = ['1.9600', '2.5758', '2.8070', '3.0902'];
          const x0 = 120, y0 = 130, cw = 130; return (<g opacity={p}>
            <Label x={x0} y={y0 - 50} text="class t table · two-tailed P · infinity row" color={C.muted} size={14} />
            {cols.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={ci === 0 ? C.signal : ci >= 2 ? C.noise : C.muted} anchor="middle" weight={700} />)}
            <Label x={x0} y={y0 + 56} text="ν = ∞" color={C.signal} weight={700} />
            {vals.map((v, ci) => { const hit = ci === 0, br = ci >= 2; return (<g key={ci}>
              {(hit || br) && <rect x={x0 + 110 + ci * cw - 50} y={y0 + 32} width={100} height={36} rx={8} fill="none" stroke={hit ? C.signal : C.noise} strokeWidth={2.5} opacity={prog(tl, f, 7, hit ? 2.2 : 3.4)} />}
              <Label x={x0 + 110 + ci * cw} y={y0 + 56} text={v} color={hit ? C.signal : br ? C.noise : C.ink} anchor="middle" size={hit ? 19 : 16} weight={hit || br ? 700 : 400} /></g>); })}
          </g>); })()}

        {/* ---- decision ---- */}
        {i === 8 && (() => { const xz = lin(0, 3.5, 70, SW - 50); const p = win(tl, f, 8, 1.0, 3.2); return (<g opacity={prog(tl, f, 8, 0.6)}>
          <AxisX x={xz} y={300} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]} label="zW" />
          <rect x={xz(zc)} y={160} width={xz(3.5) - xz(zc)} height={140} fill={C.red} opacity={0.12} />
          <line x1={xz(zc)} x2={xz(zc)} y1={150} y2={300} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xz(zc)} y={142} text="1.9600" color={C.red} anchor="middle" size={15} weight={700} />
          {[2.807, 3.0902].map(v => <line key={v} x1={xz(v)} x2={xz(v)} y1={200} y2={300} stroke={C.noise} strokeWidth={1.5} strokeDasharray="3 4" />)}
          <Label x={xz(2.807) - 6} y={192} text="2.8070" color={C.noise} anchor="end" size={13} />
          <Label x={xz(3.0902) + 6} y={192} text="3.0902" color={C.noise} size={13} />
          <line x1={xz(zW * p)} x2={xz(zW * p)} y1={120} y2={262} stroke={C.signal} strokeWidth={1.5} opacity={0.6} />
          <Glow cx={xz(zW * p)} cy={262} r={9} color={C.signal} />
          <Label x={xz(zW * p)} y={112} text={`zW = ${(zW * p).toFixed(3)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S24Wnormal;
