import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, GROUP, FPS} from '../kit/theme';
import {Frame, Step, Timeline, prog, after} from '../kit/Frame';
import {SW, lin, lerp, AxisX, Glow, Label} from '../kit/plot';

// Session 24 pages 20-21: potential diuretic in six people, urine production before and after (mL/day).
// Case "s24-diuretic-signedrank" (also maps "s24-orig-grip-signedrank", same method with the W table).
const before = [1600, 1850, 1300, 1500, 1400, 1010];
const after_ = [1490, 1300, 1400, 1410, 1350, 1000];
const d = after_.map((a, k) => a - before[k]);                     // -110 -550 100 -90 -50 -10
const n = d.length;
const mags = d.map(Math.abs); const order = [...mags].sort((a, b) => a - b);
const rk = mags.map(m => order.indexOf(m) + 1);                    // 5 6 4 3 2 1 (no ties)
const sr = d.map((v, k) => Math.sign(v) * rk[k]);                  // -5 -6 4 -3 -2 -1
const W = sr.reduce((a, b) => a + b, 0);                           // -13
// all 64 sign patterns of the ranks 1..6
const pats = Array.from({length: 64}, (_, m) => [1, 2, 3, 4, 5, 6].map((r, j) => (m >> j) & 1 ? r : -r));
const wOf = pats.map(p => p.reduce((a, b) => a + b, 0));
const hOf = wOf.map((w, k) => wOf.slice(0, k).filter(x => x === w).length);
const tail = wOf.filter(w => Math.abs(w) >= Math.abs(W)).length;  // 14
const win = (tl: Timeline, f: number, i: number, a: number, b: number) =>
  interpolate(f, [tl.starts[i] + a * FPS, tl.starts[i] + b * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});

export const meta = {
  id: 's24-s24wtable', session: 24, method: 's24wtable',
  cases: {
    's24-diuretic-signedrank': [2, 3, 5, 6, 8, 9],
    's24-orig-grip-signedrank': [2, 3, 5, 6, 8, 9],
  },
  title: 'Wilcoxon signed-rank test · W table',
  steps: [
    {title: 'Same six people', seconds: 7, caption: 'Six people had daily urine production measured **before and after** a potential diuretic. Each line is one person.',
      card: [{label: 'data (mL/day)', note: 'before 1600 1850 1300 1500 1400 1010\nafter  1490 1300 1400 1410 1350 1000'}]},
    {title: 'Null hypothesis', seconds: 7, caption: 'Each person is measured twice, so the **signed-rank test** is used. The null hypothesis says the drug changes nothing.',
      card: [{label: 'hypotheses', tex: 'H_0:\\text{differences centered on }0', note: 'HA  urine production differs before and after\nn = 6 nonzero differences ≤ 8'}]},
    {title: 'Differences', seconds: 7, caption: 'Each person\'s change is after minus before. **No difference is zero**, so all six people are kept.',
      card: [{label: 'differences', tex: 'd_i=\\text{after}_i-\\text{before}_i', value: '−110 −550 +100 −90 −50 −10', color: C.ink}]},
    {title: 'Rank the sizes', seconds: 8, caption: 'Signs are set aside and the **sizes** are ranked. The smallest change, 10, gets rank 1 and the largest, 550, gets rank 6.',
      card: [{label: 'ranks of |d|', value: 'ranks 5 6 4 3 2 1', color: C.noise, note: '|d| = 110 550 100 90 50 10'}]},
    {title: 'Signed ranks', seconds: 8, caption: 'Each rank then takes back the **sign of its change**. Only person 3 went up, so only rank 4 is positive.',
      card: [{label: 'signed ranks', tex: '\\operatorname{sign}(d_i)\\operatorname{rank}|d_i|', value: '−5 −6 +4 −3 −2 −1', color: C.signal}]},
    {title: 'Add up W', seconds: 8, caption: 'The signed ranks add up to **W = −13**. The single positive rank 4 cancels only part of the negative 17.',
      card: [{label: 'sum of signed ranks', tex: 'W=\\sum\\operatorname{sign}(d_i)\\operatorname{rank}|d_i|', value: 'W = −5 − 6 + 4 − 3 − 2 − 1 = −13', color: C.signal, note: 'check 21 − 2(17) = −13'}]},
    {title: 'All 64 sign patterns', seconds: 10, caption: 'If the drug does nothing, each rank is **equally likely to be + or −**. The 64 sign patterns give W from −21 to +21.',
      card: [{label: 'null distribution of W', tex: '2^n=2^6=64', value: 'centered on 0', color: C.noise}]},
    {title: 'Class W table', seconds: 8, caption: 'Use the **class Wilcoxon W table**, row n = 6. It prints 21 with P = .032 and 19 with P = .062, so **21** is used.',
      card: [{label: 'class W table', value: 'n = 6 → 21 (P = .032)', color: C.signal, note: '19 (P = .062) is also printed\n21 is the value whose P does not exceed 0.05'}]},
    {title: 'Decision', seconds: 9, caption: '|W| = 13 is **below 19 and 21**, so H0 is not rejected. Fourteen of the 64 patterns give |W| of 13 or more.',
      card: [{label: 'decision', value: '13 < 19 < 21 → do not reject H0', color: C.red, note: `P(|W| ≥ 13) = ${tail}/64 = ${(tail / 64).toFixed(5)}`}]},
  ] as Step[],
};

const S24Wtable: React.FC = () => (
  <Frame title={meta.title} session={24} steps={meta.steps}>
    {(f, i, tl) => {
      const yv = lin(950, 1900, 330, 30);  // slopegraph
      const xB = 120, xA = 300;
      const px = (k: number) => 420 + k * 62;  // one column per person (right side)
      const slopeA = i <= 1 ? 1 : i === 2 ? 1 - win(tl, f, 2, 0, 0.6) : 0;
      return (<g>
        {/* ---- slopegraph ---- */}
        {slopeA > 0 && <g opacity={slopeA}>
          <line x1={70} x2={70} y1={yv(1000)} y2={yv(1900)} stroke={C.muted} strokeWidth={1.5} />
          {[1000, 1200, 1400, 1600, 1800].map(v => <g key={v}><line x1={64} x2={70} y1={yv(v)} y2={yv(v)} stroke={C.muted} />
            <Label x={60} y={yv(v) + 5} text={String(v)} color={C.muted} size={13} anchor="end" /></g>)}
          <Label x={xB} y={366} text="before" color={GROUP[0]} size={14} anchor="middle" weight={700} />
          <Label x={xA} y={366} text="after" color={GROUP[1]} size={14} anchor="middle" weight={700} />
          {before.map((b, k) => { const p = prog(tl, f, 0, 0.6 + k * 0.2); const up = after_[k] > b;
            return (<g key={k} opacity={p}>
              <line x1={xB} y1={yv(b)} x2={lerp(xB, xA, p)} y2={lerp(yv(b), yv(after_[k]), p)} stroke={up ? C.signal : C.pink} strokeWidth={2.5} />
              <Glow cx={xB} cy={yv(b)} r={5} color={GROUP[0]} /><Glow cx={lerp(xB, xA, p)} cy={lerp(yv(b), yv(after_[k]), p)} r={5} color={GROUP[1]} />
            </g>); })}
        </g>}

        {/* ---- differences as bars, one column per person; then sizes, ranks, signed ranks ---- */}
        {(i >= 2 && i <= 4) && (() => {
          const y0 = 170; const yd = (v: number) => y0 - v * 0.3;      // mL/day bars
          const yr = (v: number) => y0 - v * 22;                         // rank bars
          const pAbs = i === 3 ? win(tl, f, 3, 0.6, 2.0) : i > 3 ? 1 : 0;
          const pRank = i === 3 ? win(tl, f, 3, 3.0, 4.4) : i > 3 ? 1 : 0;
          const pSign = i === 4 ? win(tl, f, 4, 0.8, 2.8) : 0;
          const shift = 1;
          const xc = (k: number) => lerp(px(k), 150 + k * 95, shift);
          return (<g>
            <line x1={xc(0) - 34} x2={xc(5) + 34} y1={y0} y2={y0} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
            <Label x={xc(0) - 40} y={y0 + 5} text="0" color={C.muted} size={13} anchor="end" />
            {d.map((v, k) => { const p = i === 2 ? win(tl, f, 2, 0.6 + k * 0.4, 1.4 + k * 0.4) : 1;
              const mag = Math.abs(v); const signed = lerp(v, mag, pAbs);
              const hd = lerp(signed, 0, 0); const top = lerp(yd(hd), yr(rk[k]), pRank);
              const signedRank = lerp(rk[k], sr[k], pSign); const topR = yr(signedRank);
              const yTop = pRank > 0 ? (pSign > 0 ? topR : top) : yd(signed * p);
              const neg = pAbs < 0.5 ? v < 0 : pSign > 0.5 ? sr[k] < 0 : false;
              const col = pSign > 0.5 ? (sr[k] < 0 ? C.pink : C.signal) : pAbs > 0.5 ? C.noise : (v < 0 ? C.pink : C.signal);
              const h = y0 - yTop; const bw = 34;
              return (<g key={k}>
                <rect x={xc(k) - bw / 2} y={Math.min(y0, yTop)} width={bw} height={Math.abs(h)} rx={4} fill={col} opacity={0.85} />
                {i === 2 && p > 0.9 && <Label x={xc(k)} y={v < 0 ? yd(v) + 20 : yd(v) - 8} text={(v > 0 ? '+' : '−') + Math.abs(v)} color={v < 0 ? C.pink : C.signal} size={14} anchor="middle" weight={700} />}
                {i === 3 && pRank < 0.1 && pAbs > 0.9 && <Label x={xc(k)} y={yd(mag) - 8} text={String(mag)} color={C.noise} size={14} anchor="middle" weight={700} />}
                {i >= 3 && pRank > 0.9 && <Label x={xc(k)} y={h >= 0 ? yTop - 8 : yTop + 20} text={pSign > 0.5 ? (sr[k] > 0 ? '+' : '−') + rk[k] : String(rk[k])} color={col} size={16} anchor="middle" weight={700} />}
                <Label x={xc(k)} y={392} text={`person ${k + 1}`} color={C.muted} size={12} anchor="middle" opacity={shift} />
              </g>); })}
          </g>); })()}

        {/* ---- W: signed ranks laid end to end ---- */}
        {i === 5 && (() => { const xw = lin(-22, 22, 50, SW - 30); const y0 = 300; let acc = 0;
          return (<g>
            <AxisX x={xw} y={y0} ticks={[-21, -14, -7, 0, 7, 14, 21]} label="sum of signed ranks W" />
            <line x1={xw(0)} x2={xw(0)} y1={60} y2={y0} stroke={C.muted} strokeWidth={1} strokeDasharray="3 5" />
            {sr.map((v, k) => { const p = win(tl, f, 5, 0.6 + k * 0.6, 1.2 + k * 0.6); const a = acc; acc += v; const yy = 70 + k * 30;
              return (<g key={k} opacity={p > 0 ? 1 : 0}>
                <line x1={xw(a)} x2={xw(a + v * p)} y1={yy} y2={yy} stroke={v < 0 ? C.pink : C.signal} strokeWidth={10} strokeLinecap="round" />
                {p > 0.9 && <Label x={v < 0 ? xw(a + v) - 10 : xw(a + v) + 10} y={yy + 5} text={(v > 0 ? '+' : '−') + Math.abs(v)} color={v < 0 ? C.pink : C.signal} size={14} anchor={v < 0 ? 'end' : 'start'} weight={700} />}
                {k < n - 1 && p > 0.9 && <line x1={xw(a + v)} x2={xw(a + v)} y1={yy} y2={yy + 30} stroke={C.line} strokeWidth={1.5} strokeDasharray="2 3" />}
              </g>); })}
            <g opacity={win(tl, f, 5, 4.6, 5.4)}>
              <line x1={xw(W)} x2={xw(W)} y1={70 + 5 * 30} y2={y0} stroke={C.signal} strokeWidth={2} />
              <Glow cx={xw(W)} cy={y0} r={8} color={C.signal} />
              <Label x={xw(W)} y={y0 + 66} text={`W = ${W}`} color={C.signal} size={17} anchor="middle" weight={700} />
            </g>
          </g>); })()}

        {/* ---- null distribution of W over the 64 sign patterns ---- */}
        {(i === 6 || i === 8) && (() => { const xw = lin(-22, 22, 50, SW - 30); const yb = 330, dy = 20;
          const nShow = i === 6 ? Math.floor(win(tl, f, 6, 1.2, 7.4) * 64 + 1e-6) : 64; const cur = Math.min(nShow, 63);
          const pr = i === 8 ? win(tl, f, 8, 0.6, 1.6) : 0, pt = i === 8 ? win(tl, f, 8, 3.4, 4.4) : 0;
          return (<g>
            {i === 6 && <g>
              {pats[cur].map((v, j) => <g key={j}>
                <rect x={270 + j * 44 - 17} y={30} width={34} height={34} rx={7} fill={v > 0 ? C.signal : C.pink} opacity={0.85} />
                <Label x={270 + j * 44} y={53} text={(v > 0 ? '+' : '−') + Math.abs(v)} color={C.bg} size={15} anchor="middle" weight={700} /></g>)}
              <Label x={270 + 6 * 44 + 10} y={53} text={`W = ${wOf[cur]}`} color={C.noise} size={16} weight={700} />
              <Label x={240} y={53} text={`pattern ${cur + 1} of 64`} color={C.muted} size={14} anchor="end" />
            </g>}
            {i === 8 && <g opacity={pr}>
              {[-21, 21].map(c => <g key={c}><rect x={xw(c) - 10} y={yb - 6 * dy} width={20} height={6 * dy + 4} fill={C.red} opacity={0.16} /></g>)}
              {[-19, 19].map(c => <line key={c} x1={xw(c)} x2={xw(c)} y1={yb - 6 * dy} y2={yb} stroke={C.red} strokeWidth={1.5} strokeDasharray="4 4" />)}
              <Label x={xw(21)} y={yb - 6 * dy - 10} text="21" color={C.red} size={14} anchor="middle" weight={700} />
              <Label x={xw(-21)} y={yb - 6 * dy - 10} text="−21" color={C.red} size={14} anchor="middle" weight={700} />
              <Label x={xw(19) - 4} y={yb - 6 * dy - 10} text="19" color={C.red} size={13} anchor="end" />
              <Label x={xw(-19) + 4} y={yb - 6 * dy - 10} text="−19" color={C.red} size={13} />
            </g>}
            {pats.map((p, k) => { if (k >= nShow) return null; const w = wOf[k];
              const pk = i === 6 ? Math.min(1, (win(tl, f, 6, 1.2, 7.4) * 64 - k) * 1.5) : 1;
              const obs = (i === 8) && p.every((v, j) => v === [-1, -2, -3, 4, -5, -6][j]);
              const tl2 = i === 8 && pt > 0.5 && Math.abs(w) >= Math.abs(W);
              return <Glow key={k} cx={xw(w)} cy={lerp(100, yb - 11 - hOf[k] * dy, Math.max(0, pk))} r={6} color={obs ? C.signal : tl2 ? C.pink : C.noise} opacity={obs ? 1 : tl2 ? 0.95 : 0.7} />; })}
            <AxisX x={xw} y={yb} ticks={[-21, -14, -7, 0, 7, 14, 21]} label="W" />
            {i === 8 && <g opacity={pt}>
              <Label x={xw(W)} y={yb + 62} text={`W = ${W}`} color={C.signal} size={15} anchor="middle" weight={700} />
              <Label x={SW - 40} y={110} text={`${tail} of 64 with |W| ≥ 13`} color={C.pink} size={15} anchor="end" weight={700} />
              <Label x={SW - 40} y={132} text={`P = ${(tail / 64).toFixed(5)}`} color={C.pink} size={15} anchor="end" weight={700} />
            </g>}
          </g>); })()}

        {/* ---- class W table excerpt ---- */}
        {i === 7 && (() => { const p = prog(tl, f, 7); const rows = [['5', '15', '.062'], ['6', '21', '.032'], ['', '19', '.062'], ['7', '28', '.016'], ['', '24', '.046'], ['8', '32', '.024'], ['', '28', '.054']];
          const cx = [200, 380, 540], y0 = 50, rh = 44;
          return (<g opacity={p}>
            <Label x={130} y={y0 - 22} text="class Wilcoxon W table · two-tailed" color={C.muted} size={14} />
            {['n', 'critical value', 'P'].map((h, k) => <Label key={h} x={cx[k]} y={y0 + 10} text={h} color={k === 1 ? C.signal : C.muted} size={15} anchor="middle" weight={700} />)}
            {rows.map((r, ri) => { const hit = ri === 1, alt = ri === 2; return (<g key={ri}>
              {(hit || alt) && <rect x={cx[0] - 40} y={y0 + 22 + ri * rh} width={cx[2] - cx[0] + 80} height={34} rx={8} fill={hit ? C.signal : C.noise} opacity={(hit ? 0.14 : 0.08) * prog(tl, f, 7, 2.2)} />}
              {r.map((v, k) => <Label key={k} x={cx[k]} y={y0 + 46 + ri * rh} text={v} color={hit ? (k >= 1 ? C.signal : C.ink) : alt ? C.noise : C.muted} size={hit && k === 1 ? 19 : 16} anchor="middle" weight={hit || alt ? 700 : 400} />)}
              {hit && <rect x={cx[1] - 34} y={y0 + 20 + ri * rh} width={68} height={38} rx={9} fill="none" stroke={C.signal} strokeWidth={2.5} opacity={prog(tl, f, 7, 3.0)} />}
            </g>); })}
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S24Wtable;
