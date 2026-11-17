import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, GROUP, FPS} from '../kit/theme';
import {Frame, Step, Timeline, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 24 pages 9-12: diuretic experiment, 3 people on placebo and 4 different people on the drug (mL/day).
// Case "s24-diuretic-ranksum" (also maps "s24-orig-recovery-ranksum", same method with the T table).
const placebo = [1000, 1380, 1200], drug = [1400, 1600, 1180, 1220];
const all = [...placebo.map(v => ({v, g: 0})), ...drug.map(v => ({v, g: 1}))];
const sorted = [...all].sort((a, b) => a.v - b.v);
const rankOf = (v: number) => sorted.findIndex(o => o.v === v) + 1;       // no ties in these data
const N = 7, nS = 3, nB = 4;
const T = placebo.map(rankOf).reduce((a, b) => a + b, 0);                // 1 + 5 + 3 = 9
const muT = nS * (N + 1) / 2;                                             // 12
// all 35 sets of three ranks out of seven, in the order 1-2-3, 1-2-4, ...
const sets: number[][] = []; for (let a = 1; a <= 7; a++) for (let b = a + 1; b <= 7; b++) for (let c = b + 1; c <= 7; c++) sets.push([a, b, c]);
const sums = sets.map(s => s[0] + s[1] + s[2]);
const height = sums.map((s, k) => sums.slice(0, k).filter(x => x === s).length); // stack position of each set in its column
const tailCount = sums.filter(s => Math.abs(s - muT) >= Math.abs(T - muT)).length; // 14
const win = (tl: Timeline, f: number, i: number, a: number, b: number) =>
  interpolate(f, [tl.starts[i] + a * FPS, tl.starts[i] + b * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});

export const meta = {
  id: 's24-s24mwtable', session: 24, method: 's24mwtable',
  cases: {
    's24-diuretic-ranksum': [2, 3, 4, 5, 7, 8],
    's24-orig-recovery-ranksum': [2, 3, 4, 7, 8],
  },
  title: 'Mann-Whitney rank-sum test · T table',
  steps: [
    {title: 'Two groups', seconds: 7, caption: 'Three people took a placebo and **four different people** took the drug. Daily urine production is measured in each.',
      card: [{label: 'data (mL/day)', note: 'placebo  1000 1380 1200\ndrug     1400 1600 1180 1220'}]},
    {title: 'Null hypothesis', seconds: 7, caption: 'The rank-sum test does not assume Normal data. The null hypothesis says the two groups have the **same distribution**.',
      card: [{label: 'hypotheses', tex: 'H_0:\\text{same distribution}', note: 'HA  the distributions differ\nnS = 3 (placebo) · nB = 4 (drug) ≤ 8'}]},
    {title: 'Rank all together', seconds: 8, caption: 'All seven values go onto **one number line**, regardless of group. The smallest gets rank 1 and the largest rank 7.',
      card: [{label: 'ranks of all seven', value: '1000→1 1180→2 1200→3 1220→4', color: C.noise, note: '1380→5 · 1400→6 · 1600→7 · no ties'}]},
    {title: 'Compute T', seconds: 8, caption: 'T is the sum of the **smaller group\'s ranks**, here placebo. Both rank sums add to 28, which checks the ranking.',
      card: [{label: 'rank sum T', tex: 'T=\\sum(\\text{ranks in smaller group})', value: 'T = 1 + 5 + 3 = 9', color: C.signal, note: 'check 9 + (6 + 7 + 2 + 4) = 28 = 7(8)/2'}]},
    {title: 'All 35 rank sets', seconds: 10, caption: 'If the drug does nothing, **any three ranks** are equally likely to be placebo. All 35 sets give sums from 6 to 18.',
      card: [{label: 'null distribution of T', tex: '\\binom{7}{3}=35,\\quad \\mu_T=\\frac{n_S(n_S+n_B+1)}{2}', value: 'μT = 3(3 + 4 + 1)/2 = 12', color: C.noise}]},
    {title: 'Where T = 9 lands', seconds: 7, caption: 'The observed set of ranks 1, 3 and 5 gives T = 9. It lands **near the middle**, only 3 below the center 12.'},
    {title: 'Class T table', seconds: 8, caption: 'Use the **class Mann-Whitney T table**. Row nS = 3, nB = 4 under probability near .05 gives **6 and 18**, with P = .057.',
      card: [{label: 'class T table', value: 'nS 3 · nB 4 → 6, 18 (P = .057)', color: C.signal, note: 'no .01 entry is printed for this row'}]},
    {title: 'Decision', seconds: 9, caption: 'T = 9 lies **between 6 and 18**, so H0 is not rejected. Fourteen of 35 sets are as far from 12, so P = 0.4.',
      card: [{label: 'decision', value: '6 < 9 < 18 → do not reject H0', color: C.red, note: `P(T ≤ 9 or T ≥ 15) = ${tailCount}/35 = ${(tailCount / 35).toFixed(1)}`}]},
  ] as Step[],
};

const S24Mwtable: React.FC = () => (
  <Frame title={meta.title} session={24} steps={meta.steps}>
    {(f, i, tl) => {
      const x = lin(950, 1650, 110, SW - 40);
      const rowY = [70, 150]; const names = ['placebo', 'drug'];
      const xr = lin(1, 7, 120, SW - 80); const yRank = 300;
      const pm = i === 2 ? win(tl, f, 2, 0.6, 2.6) : i > 2 ? 1 : 0;   // move onto the rank line
      const topA = i <= 3 ? 1 : 0;
      // histogram geometry
      const xh = lin(5, 19, 70, SW - 50), yb = 330, dy = 21;
      return (<g>
        {topA > 0 && <g>
          {[0, 1].map(g => <Label key={g} x={14} y={rowY[g] + 5} text={names[g]} color={GROUP[g]} size={14} weight={700} opacity={1 - pm * 0.6} />)}
          <g opacity={1 - pm}><AxisX x={x} y={200} ticks={[1000, 1100, 1200, 1300, 1400, 1500, 1600]} label="daily urine production (mL/day)" /></g>
          {pm > 0 && <g opacity={pm}>
            <line x1={xr(1) - 30} x2={xr(7) + 30} y1={yRank} y2={yRank} stroke={C.muted} strokeWidth={1.5} />
            <Label x={xr(1) - 40} y={yRank + 5} text="rank" color={C.muted} size={14} anchor="end" />
          </g>}
          {all.map((o, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.12); const r = rankOf(o.v);
            const pk = i === 2 ? win(tl, f, 2, 0.6 + (r - 1) * 0.25, 1.6 + (r - 1) * 0.25) : pm;
            const cx = lerp(x(o.v), xr(r), pk), cy = lerp(lerp(rowY[o.g] - 50, rowY[o.g], p), yRank, pk);
            const lit = i === 3 && o.g === 0;
            return (<g key={k}>
              <Glow cx={cx} cy={cy} r={7} color={lit ? C.signal : GROUP[o.g]} opacity={p} />
              {pk > 0.95 && <Label x={xr(r)} y={yRank + 30} text={String(r)} color={lit ? C.signal : C.ink} size={16} anchor="middle" weight={700} />}
              {pk > 0.95 && i === 2 && <Label x={xr(r)} y={yRank - 18} text={String(o.v)} color={C.muted} size={12} anchor="middle" />}
            </g>); })}
          {/* rank tiles stack into the two rank sums */}
          {i === 3 && (() => { const u = 17, x0 = 120, yT = 395;
            const pr = placebo.map(rankOf), dr = drug.map(rankOf); let acc = 0;
            const tiles = [...pr.map(r => ({r, g: 0})), ...dr.map(r => ({r, g: 1}))];
            return (<g>
              {tiles.map((t, k) => { const p = win(tl, f, 3, 0.8 + k * 0.4, 1.4 + k * 0.4); const xs = x0 + acc * u; acc += t.r;
                return (<g key={k} opacity={p}>
                  <rect x={lerp(xr(t.r) - t.r * u / 2, xs, p)} y={lerp(yRank + 40, yT - 14, p)} width={t.r * u - 2} height={24} rx={4} fill={t.g === 0 ? C.signal : GROUP[1]} opacity={t.g === 0 ? 0.9 : 0.55} />
                  {p > 0.95 && <Label x={xs + t.r * u / 2} y={yT + 4} text={String(t.r)} color={C.bg} size={13} anchor="middle" weight={700} />}
                </g>); })}
              <g opacity={win(tl, f, 3, 2.2, 2.8)}><Label x={x0 + T * u / 2} y={yT - 22} text={`T = ${T}`} color={C.signal} size={16} anchor="middle" weight={700} /></g>
              <g opacity={win(tl, f, 3, 4.0, 4.6)}><Label x={x0 + (T + 28) * u / 2} y={yT - 22} text="drug 19" color={GROUP[1]} size={14} anchor="middle" />
                <Label x={x0 + 28 * u + 12} y={yT + 5} text="= 28" color={C.ink} size={15} weight={700} /></g>
            </g>); })()}
        </g>}

        {/* null distribution of T: every set of three ranks drops into its column */}
        {(i === 4 || i === 5 || i === 7) && (() => {
          const nShow = i === 4 ? Math.floor(win(tl, f, 4, 1.2, 7.0) * 35 + 1e-6) : 35; const cur = Math.min(nShow, 34);
          const showSet = i === 4 ? sets[cur] : i === 5 ? [1, 3, 5] : null;
          const slotX = (r: number) => 250 + (r - 1) * 44;
          const pr = i === 7 ? win(tl, f, 7, 0.6, 1.6) : 0, pt = i === 7 ? win(tl, f, 7, 3.4, 4.4) : 0;
          return (<g>
            {showSet && <g>
              {[1, 2, 3, 4, 5, 6, 7].map(r => { const on = showSet.includes(r); return (<g key={r}>
                <rect x={slotX(r) - 17} y={40} width={34} height={34} rx={7} fill={on ? (i === 5 ? C.signal : C.noise) : 'none'} opacity={on ? 0.85 : 1} stroke={C.line} strokeWidth={1.5} />
                <Label x={slotX(r)} y={63} text={String(r)} color={on ? C.bg : C.muted} size={16} anchor="middle" weight={700} /></g>); })}
              <Label x={slotX(7) + 36} y={63} text={`sum ${showSet.reduce((a, b) => a + b, 0)}`} color={i === 5 ? C.signal : C.noise} size={16} weight={700} />
              {i === 4 && <Label x={slotX(1) - 30} y={63} text={`set ${cur + 1} of 35`} color={C.muted} size={14} anchor="end" />}
            </g>}
            {/* reject regions from the class table, then the tails as extreme as T */}
            {i === 7 && <g opacity={pr}>
              {[6, 18].map(c => <g key={c}><rect x={xh(c) - 12} y={yb - 6 * dy} width={24} height={6 * dy + 4} fill={C.red} opacity={0.14} />
                <Label x={xh(c)} y={yb - 6 * dy - 8} text={c === 6 ? 'T ≤ 6' : 'T ≥ 18'} color={C.red} size={14} anchor="middle" weight={700} /></g>)}
            </g>}
            {sets.map((s, k) => { if (k >= nShow) return null; const sm = sums[k];
              const p = i === 4 ? Math.min(1, (win(tl, f, 4, 1.2, 7.0) * 35 - k) * 1.5) : 1;
              const tail = i === 7 && pt > 0.5 && Math.abs(sm - muT) >= Math.abs(T - muT);
              const obs = (i === 5 || i === 7) && s[0] === 1 && s[1] === 3 && s[2] === 5;
              return <Glow key={k} cx={xh(sm)} cy={lerp(110, yb - 12 - height[k] * dy, Math.max(0, p))} r={7} color={obs ? C.signal : tail ? C.pink : C.noise} opacity={obs ? 1 : tail ? 0.95 : 0.7} />; })}
            <AxisX x={xh} y={yb} ticks={[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]} label="rank sum T of the smaller group" />
            <g opacity={i === 4 ? win(tl, f, 4, 7.2, 8.0) : 1}>
              <line x1={xh(muT)} x2={xh(muT)} y1={yb - 6 * dy - 4} y2={yb} stroke={C.white} strokeWidth={2} strokeDasharray="5 5" />
              <Label x={xh(muT)} y={yb - 6 * dy - 10} text="μT = 12" color={C.white} size={14} anchor="middle" weight={700} />
            </g>
            {i === 5 && <g opacity={win(tl, f, 5, 1.0, 1.8)}>
              <line x1={xh(T)} x2={xh(T)} y1={140} y2={yb - 12 - 3 * dy} stroke={C.signal} strokeWidth={2} />
              <Label x={xh(T)} y={132} text={`T = ${T}`} color={C.signal} size={16} anchor="middle" weight={700} />
            </g>}
            {i === 7 && <g opacity={pt}>
              <Label x={SW - 50} y={120} text={`${tailCount} of 35 as far from 12`} color={C.pink} size={15} anchor="end" weight={700} />
              <Label x={SW - 50} y={142} text="P = 0.4" color={C.pink} size={15} anchor="end" weight={700} />
            </g>}
          </g>); })()}

        {/* class T table excerpt (rows nS = 3) */}
        {i === 6 && (() => { const p = prog(tl, f, 6); const rows = [['3', '4', '6, 18', '.057'], ['', '5', '6, 21', '.036'], ['', '5', '7, 20', '.071'], ['', '6', '7, 23', '.048']];
          const cx = [140, 250, 420, 560], y0 = 80, rh = 52;
          return (<g opacity={p}>
            <Label x={120} y={y0 - 34} text="class Mann-Whitney T table · two-tailed · probability near .05" color={C.muted} size={14} />
            {['nS', 'nB', 'critical values', 'P'].map((h, k) => <Label key={h} x={cx[k]} y={y0} text={h} color={k >= 2 ? C.signal : C.muted} size={15} anchor="middle" weight={700} />)}
            {rows.map((r, ri) => { const hit = ri === 0; return (<g key={ri}>
              {hit && <rect x={cx[0] - 40} y={y0 + 22} width={cx[3] - cx[0] + 90} height={36} rx={8} fill={C.signal} opacity={0.12 * prog(tl, f, 6, 2.2)} />}
              {r.map((v, k) => <Label key={k} x={cx[k]} y={y0 + 46 + ri * rh} text={v} color={hit ? (k === 2 ? C.signal : C.ink) : C.muted} size={hit && k === 2 ? 19 : 16} anchor="middle" weight={hit ? 700 : 400} />)}
              {hit && <rect x={cx[2] - 52} y={y0 + 20} width={104} height={40} rx={9} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 6, 3.0)} />}
            </g>); })}
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S24Mwtable;
