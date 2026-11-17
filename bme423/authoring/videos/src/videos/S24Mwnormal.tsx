import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, GROUP, FPS} from '../kit/theme';
import {Frame, Step, Timeline, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label, curvePath, range, normPdf} from '../kit/plot';

// Session 24 pages 17-19: minutes of alert behavior in the first hour, 20 control and 20 Leboyer deliveries.
// Case "s24-leboyer-ranksum". Tie example in step 7 is the small ranking example printed with the tie rule (pages 14-16).
const control = [5.0, 10.1, 17.7, 20.3, 22.0, 24.9, 26.5, 30.8, 34.2, 35.0, 36.6, 37.9, 40.4, 45.5, 49.3, 51.1, 53.1, 55.0, 56.7, 58.0];
const leboyer = [2.0, 19.0, 29.7, 32.1, 35.4, 36.7, 38.5, 40.2, 42.1, 43.0, 44.4, 45.6, 46.7, 47.1, 48.0, 49.0, 50.9, 51.2, 52.5, 53.3];
const nS = 20, nB = 20, N = 40;
const allV = [...control, ...leboyer].sort((a, b) => a - b);
const rankOf = (v: number) => allV.indexOf(v) + 1;                      // all 40 times differ
const T = control.map(rankOf).reduce((a, b) => a + b, 0);              // 374
const TL = leboyer.map(rankOf).reduce((a, b) => a + b, 0);             // 446
const muT = nS * (nS + nB + 1) / 2;                                     // 410
const sT = Math.sqrt(nS * nB * (nS + nB + 1) / 12);                     // 36.9685
const zT = (Math.abs(T - muT) - 0.5) / sT;                              // 0.960278
const zc = 1.96;                                                        // class t table, infinity row, 0.05 column
// exact null distribution of T: number of 20-rank subsets of 1..40 with each sum (dynamic programming)
const dist = (() => { const maxS = N * (N + 1) / 2; let dp: number[][] = Array.from({length: nS + 1}, () => new Array(maxS + 1).fill(0)); dp[0][0] = 1;
  for (let r = 1; r <= N; r++) for (let k = Math.min(r, nS); k >= 1; k--) for (let s = maxS; s >= r; s--) dp[k][s] += dp[k - 1][s - r];
  const tot = dp[nS].reduce((a, b) => a + b, 0); return dp[nS].map(c => c / tot); })();
const win = (tl: Timeline, f: number, i: number, a: number, b: number) =>
  interpolate(f, [tl.starts[i] + a * FPS, tl.starts[i] + b * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
// tie example values and their ranks
const tieEx = [{v: 1100, g: 0, r: 1}, {v: 1200, g: 0, r: 2.5}, {v: 1200, g: 0, r: 2.5}, {v: 1400, g: 0, r: 4}, {v: 1500, g: 1, r: 6}, {v: 1500, g: 1, r: 6}, {v: 1500, g: 1, r: 6}, {v: 1600, g: 1, r: 8}];

export const meta = {
  id: 's24-s24mwnormal', session: 24, method: 's24mwnormal',
  cases: {'s24-leboyer-ranksum': [2, 3, 4, 5, 6, 8, 9, 10]},
  title: 'Mann-Whitney test · Normal approximation',
  steps: [
    {title: 'Two delivery methods', seconds: 8, caption: 'Twenty infants had control deliveries and twenty others Leboyer deliveries. The times are **skewed** toward high values.',
      card: [{label: 'minutes of alert behavior', note: 'first hour of life\n20 control · 20 Leboyer'}]},
    {title: 'Null hypothesis', seconds: 7, caption: 'The groups hold different infants and the data are skewed, so the **rank-sum test** is used instead of a t test.',
      card: [{label: 'hypotheses', tex: 'H_0:\\text{same distribution}', note: 'HA  the distributions of minutes awake differ\nnS = nB = 20'}]},
    {title: 'Rank all 40 and T', seconds: 9, caption: 'All 40 times are ranked together. The control ranks add to **T = 374** and the Leboyer ranks to 446.',
      card: [{label: 'rank sum T (control)', tex: 'T=\\sum(\\text{ranks in smaller group})', value: 'T = 2 + 3 + 4 + … + 40 = 374', color: C.signal, note: 'groups are equal, control is used\nLeboyer 820 − 374 = 446'}]},
    {title: 'Normal approximation', seconds: 8, caption: 'The bigger group has **more than 8**, so the T table stops. The exact distribution of T is then close to a Normal curve.',
      card: [{label: 'Normal approximation', tex: 'n_B>8\\Rightarrow T\\sim N(\\mu_T,\\sigma_T^2)', value: 'nB = 20 > 8', color: C.noise}]},
    {title: 'Mean of T', seconds: 7, caption: 'The center of T is the rank sum expected for control if the method has no effect, **410**. T = 374 sits below it.',
      card: [{label: 'mean of T', tex: '\\mu_T=\\frac{n_S(n_S+n_B+1)}{2}', value: '20(20 + 20 + 1)/2 = 410', color: C.white}]},
    {title: 'SD of T', seconds: 7, caption: 'The standard deviation of T measures how far rank sums usually fall from 410. With no ties it is **36.9685**.',
      card: [{label: 'SD of T (no ties)', tex: '\\sigma_T=\\sqrt{\\frac{n_Sn_B(n_S+n_B+1)}{12}}', value: '√(20·20·41/12) = 36.9685', color: C.noise}]},
    {title: 'When there are ties', seconds: 10, caption: 'Tied values share the **average of their ranks**. Each tied set shrinks σT, and the Leboyer times have no ties.',
      card: [{label: 'SD of T with ties', tex: '\\sigma_T=\\sqrt{\\tfrac{n_Sn_B(N+1)}{12}-\\tfrac{n_Sn_B\\,S}{12N(N-1)}}', color: C.noise},
        {tex: 'S=\\sum(\\tau_i-1)\\tau_i(\\tau_i+1)', note: 'τ = 2 → 1·2·3 = 6 · τ = 3 → 2·3·4 = 24\nLeboyer has every τ = 1, so S = 0'}]},
    {title: 'Compute z_T', seconds: 8, caption: 'T is 36 below its mean. The continuity correction takes off **one half**, and dividing by σT gives **zT = 0.960278**.',
      card: [{label: 'z for the rank sum', tex: 'z_T=\\frac{|T-\\mu_T|-\\frac12}{\\sigma_T}', value: '35.5 / 36.9685 = 0.960278', color: C.signal}]},
    {title: 'Class t table', seconds: 7, caption: 'Use the **class t table** (two-tailed), infinity row. Column 0.05 gives **1.9600**, the Normal cutoff.',
      card: [{label: 'class t table', value: 'row ∞ · column 0.05 → 1.9600', color: C.signal, note: 'column 0.50 → 0.6745 · column 0.20 → 1.2816'}]},
    {title: 'Decision', seconds: 8, caption: 'zT falls **short of 1.96**, so H0 is not rejected. It lies between 0.6745 and 1.2816, so 0.20 < P < 0.50.',
      card: [{label: 'decision', value: '0.960 < 1.960 → do not reject H0', color: C.red, note: '0.6745 < 0.960278 < 1.2816\nso 0.20 < P < 0.50'}]},
  ] as Step[],
};

const S24Mwnormal: React.FC = () => (
  <Frame title={meta.title} session={24} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(0, 60, 110, SW - 40);
      const rows = [{y: 70, v: control, c: GROUP[0], name: 'control'}, {y: 150, v: leboyer, c: GROUP[1], name: 'Leboyer'}];
      const xr = lin(1, 40, 70, SW - 40), yRank = 300;
      const pm = i === 2 ? win(tl, f, 2, 0.4, 2.4) : 0;
      // T scale used in steps 4-8
      const xt = lin(260, 560, 60, SW - 40); const yb = 330; const peak = Math.max(...dist);
      const yd = (p: number) => yb - 210 * p / peak;
      return (<g>
        {/* ---- steps 1-3: the times, then one rank line ---- */}
        {i <= 2 && <g>
          {rows.map((g, gi) => <Label key={gi} x={14} y={g.y + 5} text={g.name} color={g.c} size={14} weight={700} opacity={1 - pm * 0.7} />)}
          <g opacity={1 - pm}><AxisX x={x} y={200} ticks={[0, 10, 20, 30, 40, 50, 60]} label="minutes of alert behavior" /></g>
          {pm > 0 && <g opacity={pm}>
            <line x1={xr(1) - 10} x2={xr(40) + 10} y1={yRank} y2={yRank} stroke={C.muted} strokeWidth={1.5} />
            {[1, 10, 20, 30, 40].map(r => <Label key={r} x={xr(r)} y={yRank + 50} text={String(r)} color={C.muted} size={13} anchor="middle" />)}
            <Label x={xr(20.5)} y={yRank + 72} text="rank" color={C.muted} size={14} anchor="middle" />
          </g>}
          {rows.map((g, gi) => g.v.map((v, k) => { const p = prog(tl, f, 0, 0.5 + k * 0.08 + gi * 0.6); const r = rankOf(v);
            const pk = i === 2 ? win(tl, f, 2, 0.4 + r * 0.04, 1.4 + r * 0.04) : 0;
            return <Glow key={`${gi}-${k}`} cx={lerp(x(v), xr(r), pk)} cy={lerp(lerp(g.y - 50, g.y, p), yRank + (gi === 0 ? -9 : 9), pk)} r={5} color={g.c} opacity={p} />; }))}
          {i === 2 && <g opacity={win(tl, f, 2, 3.4, 4.2)}>
            {control.map((v, k) => <line key={k} x1={xr(rankOf(v))} x2={xr(rankOf(v))} y1={yRank - 16} y2={yRank - 30} stroke={GROUP[0]} strokeWidth={2} />)}
            <Label x={SW / 2} y={yRank - 70} text={`control ranks T = ${T}`} color={C.signal} size={17} anchor="middle" weight={700} />
            <Label x={SW / 2} y={yRank + 100} text={`Leboyer ranks ${TL}`} color={GROUP[1]} size={15} anchor="middle" />
            <Label x={SW / 2} y={yRank + 122} text={`${T} + ${TL} = 820 = 40·41/2`} color={C.muted} size={14} anchor="middle" />
          </g>}
        </g>}

        {/* ---- steps 4-8: distribution of T and its Normal approximation ---- */}
        {i >= 3 && i <= 5 && (() => {
          const pb = i === 3 ? win(tl, f, 3, 0.4, 3.0) : 1; const pc = i === 3 ? win(tl, f, 3, 3.4, 4.6) : 1;
          const ps = i === 5 ? win(tl, f, 5, 0.8, 2.4) : i > 5 ? 1 : 0;
          const ticks = [260, 310, 360, 410, 460, 510, 560];
          return (<g>
            {i >= 5 && ps > 0 && <rect x={xt(muT - sT * ps)} width={xt(muT + sT * ps) - xt(muT - sT * ps)} y={yb - 220} height={220} fill={C.noise} opacity={0.12} />}
            {dist.map((p, s) => { if (s < 260 || s > 560 || s % 2) return null; const h = (yb - yd(p)) * Math.min(1, Math.max(0, pb * 1.6 - Math.abs(s - 410) / 300));
              return <rect key={s} x={xt(s) - 0.9} y={yb - h} width={1.8} height={h} fill={C.noise} opacity={0.6} />; })}
            <path d={curvePath(range(260, 560, 150), v => normPdf(v, muT, sT), xt, (v: number) => yd(v))} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={pc} />
            <AxisX x={xt} y={yb} ticks={ticks} label="rank sum T of the control group" />
            {i >= 4 && <g opacity={i === 4 ? win(tl, f, 4, 0.6, 1.4) : 1}>
              <line x1={xt(muT)} x2={xt(muT)} y1={yb - 236} y2={yb} stroke={C.white} strokeWidth={2.5} />
              <Label x={xt(muT)} y={yb - 244} text="μT = 410" color={C.white} size={15} anchor="middle" weight={700} />
              <line x1={xt(T)} x2={xt(T)} y1={yb - 150} y2={yb} stroke={C.signal} strokeWidth={2.5} />
              <Glow cx={xt(T)} cy={yb} r={7} color={C.signal} />
              <Label x={xt(T) - 8} y={yb - 156} text={`T = ${T}`} color={C.signal} size={15} anchor="end" weight={700} />
            </g>}
            {i >= 5 && ps > 0.98 && <g>
              <Label x={xt(muT + sT) + 6} y={yb - 200} text="+1 σT" color={C.noise} size={14} />
              <Label x={xt(muT - sT) - 6} y={yb - 200} text="−1 σT" color={C.noise} size={14} anchor="end" />
              {i === 5 && <Label x={xt(muT + sT) + 6} y={yb - 180} text="36.9685" color={C.noise} size={14} />}
            </g>}
          </g>); })()}

        {/* ---- step 7: ties share an averaged rank ---- */}
        {i === 6 && (() => { const xv = lin(1050, 1650, 120, SW - 60); const xq = lin(1, 8, 120, SW - 60); const yV = 70, yR = 210;
          const pm2 = win(tl, f, 6, 0.8, 2.4), pa = win(tl, f, 6, 3.0, 4.4);
          const pos = (o: typeof tieEx[0], k: number) => { const raw = k + 1; return lerp(raw, o.r, pa); };
          return (<g>
            <Label x={20} y={yV + 5} text="value" color={C.muted} size={14} />
            <Label x={20} y={yR + 5} text="rank" color={C.muted} size={14} />
            <line x1={xq(1) - 20} x2={xq(8) + 20} y1={yR} y2={yR} stroke={C.muted} strokeWidth={1.5} opacity={pm2} />
            {[1, 2, 3, 4, 5, 6, 7, 8].map(r => <Label key={r} x={xq(r)} y={yR + 50} text={String(r)} color={C.muted} size={13} anchor="middle" opacity={pm2 * (1 - pa * 0.6)} />)}
            {tieEx.map((o, k) => { const same = tieEx.filter((q2, j) => q2.v === o.v && j < k).length;
              const cx = lerp(xv(o.v), xq(pos(o, k)), pm2); const cy = lerp(yV - same * 16, yR - (o.r !== Math.round(o.r) || o.v === 1500 ? (k - tieEx.findIndex(q2 => q2.v === o.v)) * 16 * pa : 0), pm2);
              return <Glow key={k} cx={cx} cy={cy} r={7} color={GROUP[o.g]} />; })}
            {tieEx.filter((o, k) => k === 0 || tieEx[k - 1].v !== o.v).map(o => <Label key={o.v} x={xv(o.v)} y={yV + 30} text={String(o.v)} color={C.muted} size={13} anchor="middle" opacity={1 - pm2 * 0.5} />)}
            <g opacity={pa}>
              <Label x={xq(2.5)} y={yR + 30} text="2.5" color={C.signal} size={16} anchor="middle" weight={700} />
              <Label x={xq(6)} y={yR + 30} text="6" color={C.signal} size={16} anchor="middle" weight={700} />
              {[1, 4, 8].map(r => <Label key={r} x={xq(r)} y={yR + 30} text={String(r)} color={C.ink} size={16} anchor="middle" weight={700} />)}
              <Label x={xq(2.5)} y={yR - 52} text="τ = 2" color={C.noise} size={14} anchor="middle" weight={700} />
              <Label x={xq(6)} y={yR - 68} text="τ = 3" color={C.noise} size={14} anchor="middle" weight={700} />
            </g>
            <g opacity={win(tl, f, 6, 5.2, 6.2)}>
              <Label x={xq(2.5)} y={330} text="(2−1)·2·3 = 6" color={C.noise} size={15} anchor="middle" weight={700} />
              <Label x={xq(6)} y={330} text="(3−1)·3·4 = 24" color={C.noise} size={15} anchor="middle" weight={700} />
            </g>
            <g opacity={win(tl, f, 6, 7.0, 7.8)}>
              <Label x={SW / 2} y={385} text="Leboyer times · no ties · tie term 0 · σT = 36.9685" color={C.signal} size={15} anchor="middle" weight={700} />
            </g>
          </g>); })()}

        {/* ---- step 8: the distance from the mean, less one half, measured in SDs ---- */}
        {i === 7 && (() => { const xs = lin(355, 425, 80, SW - 60); const p1 = win(tl, f, 7, 0.5, 1.5), p2 = win(tl, f, 7, 2.0, 2.8), p3 = win(tl, f, 7, 3.4, 4.6), p4 = win(tl, f, 7, 5.0, 5.8);
          const yA = 150, yB = 225;
          return (<g>
            <AxisX x={xs} y={300} ticks={[360, 370, 380, 390, 400, 410, 420]} label="rank sum T" />
            <Glow cx={xs(T)} cy={300} r={7} color={C.signal} /><Label x={xs(T)} y={284} text="T = 374" color={C.signal} size={14} anchor="middle" weight={700} />
            <line x1={xs(muT)} x2={xs(muT)} y1={100} y2={300} stroke={C.white} strokeWidth={2} strokeDasharray="5 5" />
            <Label x={xs(muT)} y={92} text="μT = 410" color={C.white} size={14} anchor="middle" weight={700} />
            <g opacity={p1}>
              <line x1={xs(T)} x2={lerp(xs(T), xs(muT - 0.5 * p2), p1)} y1={yA} y2={yA} stroke={C.signal} strokeWidth={10} strokeLinecap="butt" />
              <rect x={xs(muT - 0.5)} y={yA - 5} width={xs(muT) - xs(muT - 0.5)} height={10} fill={p2 > 0.5 ? C.red : C.signal} />
              <Label x={xs(T)} y={yA - 16} text={p2 > 0.5 ? '|T − μT| − ½ = 35.5' : '|T − μT| = 36'} color={C.signal} size={15} weight={700} />
              {p2 > 0.5 && <Label x={xs(muT) + 8} y={yA + 5} text="½" color={C.red} size={15} weight={700} />}
            </g>
            <g opacity={p3}>
              <line x1={xs(muT)} x2={lerp(xs(muT), xs(muT - sT), p3)} y1={yB} y2={yB} stroke={C.noise} strokeWidth={10} />
              <Label x={xs(muT - sT)} y={yB - 16} text="σT = 36.9685" color={C.noise} size={15} weight={700} />
            </g>
            <g opacity={p4}><Label x={SW / 2} y={40} text={`zT = 35.5 / 36.9685 = ${zT.toFixed(6)}`} color={C.signal} size={18} anchor="middle" weight={700} /></g>
          </g>); })()}

        {/* ---- step 9: class t table, infinity row ---- */}
        {i === 8 && (() => { const p = prog(tl, f, 8); const cols = ['0.50', '0.20', '0.10', '0.05'], vals = ['0.6745', '1.2816', '1.6449', '1.9600'];
          const x0 = 120, y0 = 130, cw = 130; return (<g opacity={p}>
            <Label x={x0} y={y0 - 50} text="class t table · two-tailed P · infinity row" color={C.muted} size={14} />
            {cols.map((c, ci) => <Label key={c} x={x0 + 110 + ci * cw} y={y0} text={c} color={c === '0.05' ? C.signal : ci < 2 ? C.noise : C.muted} anchor="middle" weight={700} />)}
            <Label x={x0} y={y0 + 56} text="ν = ∞" color={C.signal} weight={700} />
            {vals.map((v, ci) => { const hit = ci === 3, br = ci < 2; return (<g key={ci}>
              {(hit || br) && <rect x={x0 + 110 + ci * cw - 50} y={y0 + 32} width={100} height={36} rx={8} fill="none" stroke={hit ? C.signal : C.noise} strokeWidth={2.5} opacity={prog(tl, f, 8, hit ? 2.2 : 3.4)} />}
              <Label x={x0 + 110 + ci * cw} y={y0 + 56} text={v} color={hit ? C.signal : br ? C.noise : C.ink} anchor="middle" size={hit ? 19 : 16} weight={hit || br ? 700 : 400} /></g>); })}
          </g>); })()}

        {/* ---- step 10: z slides along and stops short of 1.96 ---- */}
        {i === 9 && (() => { const xz = lin(0, 3, 70, SW - 50); const p = win(tl, f, 9, 1.0, 3.0); return (<g opacity={prog(tl, f, 9, 0.6)}>
          <AxisX x={xz} y={300} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} label="zT" />
          <rect x={xz(zc)} y={160} width={xz(3) - xz(zc)} height={140} fill={C.red} opacity={0.12} />
          <line x1={xz(zc)} x2={xz(zc)} y1={150} y2={300} stroke={C.red} strokeWidth={2} strokeDasharray="5 5" />
          <Label x={xz(zc)} y={142} text="1.9600" color={C.red} anchor="middle" size={15} weight={700} />
          {[0.6745, 1.2816].map(v => <line key={v} x1={xz(v)} x2={xz(v)} y1={200} y2={300} stroke={C.noise} strokeWidth={1.5} strokeDasharray="3 4" />)}
          <Label x={xz(0.6745) - 6} y={192} text="0.6745" color={C.noise} anchor="end" size={13} />
          <Label x={xz(1.2816) + 6} y={192} text="1.2816" color={C.noise} size={13} />
          <Glow cx={xz(zT * p)} cy={262} r={9} color={C.signal} />
          <Label x={xz(zT * p)} y={240} text={`zT = ${(zT * p).toFixed(3)}`} color={C.signal} anchor="middle" weight={700} />
        </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S24Mwnormal;
