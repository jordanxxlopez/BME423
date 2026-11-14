import React from 'react';
import {interpolate} from 'remotion';
import {C, GROUP, FPS} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {SW, lin, lerp, normals, AxisX, Glow, Label, curvePath, range, normPdf} from '../kit/plot';

// Session 17 slides 1, 3 and 7 (meaning of the confidence level). The t curve uses 9 df and the
// class t table row 9 (0.05 → 2.262, 0.01 → 3.250). The repeated sampling is an ILLUSTRATION:
// samples of 10 from a Normal population with SD 9 and a true mean set to 67 beats/min.
// The last step uses the real heart-rate case (n 10, mean 67, SD 9 → 60.56 to 73.44).
const nu = 9, t95 = 2.262, t99 = 3.250;
const tRaw = (t: number) => Math.pow(1 + t * t / nu, -(nu + 1) / 2);
const tNorm = (() => { let s = 0; const h = 0.01; for (let t = -60; t < 60; t += h) s += tRaw(t) * h; return s; })();
const tPdf = (t: number) => tRaw(t) / tNorm;

const mu = 67, sigma = 9, n = 10, N = 40;
const sims = Array.from({length: N}, (_, k) => {
  const z = normals(13400 + k, n).map(v => mu + sigma * v);
  const m = z.reduce((a, b) => a + b, 0) / n; const s = Math.sqrt(z.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
  const e = t95 * s / Math.sqrt(n); return {z, m, lo: m - e, hi: m + e, hit: m - e < mu && m + e > mu};
});
const hits = sims.filter(s => s.hit).length;          // 38 of 40 with these seeds
const missK = sims.findIndex(s => !s.hit);            // first miss (sample 5)
const heartM = t95 * 9 / Math.sqrt(10), hLo = 67 - heartM, hHi = 67 + heartM; // 60.56, 73.44

export const meta = {
  id: 's17-meaning', session: 17, method: 'meaning',
  cases: {},
  title: 'What a 95% confidence interval means',
  steps: [
    {title: 'Middle 95%', seconds: 7, card: [{label: 't curve, 9 df', tex: 'P\\!\\left(-t_{0.05}<T_\\nu<t_{0.05}\\right)=0.95'}],
      caption: 'The middle **95%** of the t curve lies between the two cutoffs. The other 5% splits into 2.5% in each tail.'},
    {title: 'Column 0.05', seconds: 7, card: [{label: 'class t table', tex: 't_{0.05}(9)=2.262', value: 'row 9 · column 0.05 → 2.262', color: C.signal, note: 'both tails combined · cumulative 0.975'}],
      caption: 'Column 0.05 of the class t table already counts **both tails**, so do not halve it. Row 9 gives **2.262**.'},
    {title: 'Confidence level', seconds: 8, card: [{label: 'confidence level', tex: '\\text{confidence}=100(1-\\alpha)\\%', value: 'α 0.05 → 95% · α 0.01 → 99%', color: C.signal, note: 'row 9 · column 0.01 → 3.250'}],
      caption: 'Confidence is 100(1 − α)%. Column 0.01 gives a **99%** interval, so its cutoff 3.250 is wider than 2.262.'},
    {title: 'One sample', seconds: 7, card: [{label: 'illustration', note: 'samples of 10 · SD 9 · beats/min\ntrue mean set to 67'}],
      caption: 'In this illustration the **true mean** is fixed. One sample of ten gives one mean and one interval.'},
    {title: 'New samples', seconds: 7, caption: 'Each new sample gives a **different** mean, SE and interval. The true mean stays fixed while the intervals move.'},
    {title: 'About 95% catch it', seconds: 8, card: [{label: 'coverage', value: `${hits} of ${N} intervals catch it`, color: C.noise, note: 'over many repeats the rate settles near 95%'}],
      caption: `Here **${hits} of ${N}** intervals catch the true mean and ${N - hits} miss it. Over many repeats the rate settles near 95%.`},
    {title: 'One interval', seconds: 8, card: [{label: 'meaning', value: '95% describes the method', color: C.signal, note: 'not the chance that one finished\ninterval holds the true mean'}],
      caption: 'One finished interval either holds the true mean or misses it. The **95%** describes the method over many samples.'},
    {title: 'Mean, not people', seconds: 9, card: [{label: 'heart rate, 10 students', tex: `${hLo.toFixed(2)}<\\mu<${hHi.toFixed(2)}`, note: 'curve = Normal with mean 67 and SD 9\nfor single students'}],
      caption: 'The interval estimates a **mean**, not where 95% of people fall. Single heart rates spread much wider.'},
  ] as Step[],
};

const S17Meaning: React.FC = () => (
  <Frame title={meta.title} session={17} steps={meta.steps}>
    {(f, i, tl) => {
      if (i <= 2) {
        const x = lin(-4.2, 4.2, 40, SW - 30), y = lin(0, 0.42, 392, 40);
        const draw = prog(tl, f, 0, 1.6);
        const w = (i === 2 ? lerp(t95, t99, prog(tl, f, 2, 1.8)) : t95) * prog(tl, f, 0, 2.2);
        const xs = range(-4.2, 4.2, 241).filter((_, k) => k <= draw * 240);
        const mid = range(-w, w, 120); const leftT = range(-4.2, -w, 60), rightT = range(w, 4.2, 60);
        const area = (pts: number[]) => pts.length < 2 ? '' : `M${x(pts[0])},${y(0)} ` + pts.map(v => `L${x(v).toFixed(1)},${y(tPdf(v)).toFixed(1)}`).join(' ') + ` L${x(pts[pts.length - 1])},${y(0)} Z`;
        const is99 = i === 2 && prog(tl, f, 2, 1.8) > 0.5; const cut = is99 ? '3.250' : '2.262';
        const lab = after(tl, f, 0) && draw > 0.99;
        return (<g>
          {lab && <><path d={area(mid)} fill={C.signal} opacity={0.22} />
            <path d={area(leftT)} fill={C.pink} opacity={0.45} /><path d={area(rightT)} fill={C.pink} opacity={0.45} /></>}
          <path d={curvePath(xs, tPdf, x, y)} fill="none" stroke={C.ink} strokeWidth={3} />
          <AxisX x={x} y={392} ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} label="" />
          {lab && <g opacity={prog(tl, f, 0, 2.6)}>
            <Label x={x(0)} y={300} text={is99 ? '99%' : '95%'} color={C.signal} anchor="middle" size={26} weight={700} />
            {[-1, 1].map(sg => (<g key={sg}>
              <line x1={x(sg * w)} x2={x(sg * w)} y1={140} y2={392} stroke={C.signal} strokeWidth={2} strokeDasharray="6 5" />
              <Label x={x(sg * w)} y={130} text={`${sg < 0 ? '−' : ''}${cut}`} color={C.signal} anchor="middle" weight={700} />
              <Label x={x(sg * 3.75)} y={340} text={is99 ? '0.5%' : '2.5%'} color={C.pink} anchor="middle" weight={700} />
            </g>))}
            {i === 2 && is99 && [-1, 1].map(sg => <line key={sg} x1={x(sg * t95)} x2={x(sg * t95)} y1={200} y2={392} stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 5" />)}
          </g>}
          {i === 1 && <Label x={SW - 30} y={70} text="0.025 + 0.025 = 0.05" color={C.pink} anchor="end" size={15} weight={700} opacity={prog(tl, f, 1)} />}
        </g>);
      }
      if (i <= 6) {
        const x = lin(40, 95, 40, SW - 30);
        // which sample is current, and how many intervals are drawn
        const t3 = f - tl.starts[3], t4 = f - tl.starts[4], t5 = f - tl.starts[5];
        let cur = 0, shownN = 1;
        if (i === 4) { cur = Math.min(11, 1 + Math.floor(t4 / (0.45 * FPS))); shownN = cur + 1; }
        if (i === 5) { cur = Math.min(N - 1, 12 + Math.floor(t5 / (0.1 * FPS))); shownN = cur + 1; }
        if (i === 6) { cur = 0; shownN = N; }
        const s = sims[cur]; const colorOn = i >= 5;
        const pickA = (k: number) => i === 6 ? (k === 0 || k === missK ? 1 : 0.2) : 1;
        return (<g>
          <line x1={x(mu)} x2={x(mu)} y1={22} y2={392} stroke={C.signal} strokeWidth={2} />
          <Label x={x(mu) + 6} y={16} text="true mean" color={C.signal} size={13} />
          {/* current sample */}
          {i !== 6 && s.z.map((v, k) => { const p = i === 3 ? prog(tl, f, 3, 0.5 + k * 0.08) : 1;
            return <Glow key={`${cur}-${k}`} cx={x(Math.max(41, Math.min(94, v)))} cy={lerp(0, 40 + ((k % 3) - 1) * 6, p)} r={5} color={GROUP[0]} opacity={p} />; })}
          {i !== 6 && <line x1={x(s.m)} x2={x(s.m)} y1={28} y2={54} stroke={C.white} strokeWidth={3} opacity={i === 3 ? prog(tl, f, 3, 1.6) : 1} />}
          {sims.slice(0, shownN).map((q, k) => { const yy = 74 + k * 8;
            const p = k === 0 && i === 3 ? interpolate(t3, [1.6 * FPS, 2.8 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
            const col = colorOn && !q.hit ? C.pink : C.noise;
            return <line key={k} x1={x(lerp(q.m, q.lo, p))} x2={x(lerp(q.m, q.hi, p))} y1={yy} y2={yy} stroke={col} strokeWidth={4} strokeLinecap="round" opacity={pickA(k)} />; })}
          {i === 6 && <g opacity={prog(tl, f, 6)}>
            <Label x={x(sims[0].hi) + 10} y={79} text="caught" color={C.noise} size={14} weight={700} />
            <Label x={x(sims[missK].hi) + 10} y={74 + missK * 8 + 5} text="missed" color={C.pink} size={14} weight={700} />
          </g>}
          <AxisX x={x} y={400} ticks={[40, 50, 60, 70, 80, 90]} opacity={0.8} />
        </g>);
      }
      // last step: interval for the mean versus spread of single students (Normal model, mean 67, SD 9)
      const x = lin(30, 104, 40, SW - 30), yb = 392; const p = prog(tl, f, 7, 1.6);
      const xs = range(30, 104, 200); const yc = (v: number) => yb - 230 * normPdf(v, 67, 9) / normPdf(67, 67, 9) * p;
      const area = `M${x(30)},${yb} ` + xs.map(v => `L${x(v).toFixed(1)},${yc(v).toFixed(1)}`).join(' ') + ` L${x(104)},${yb} Z`;
      const q = prog(tl, f, 7, 3);
      return (<g>
        <path d={area} fill={C.noise} opacity={0.14} />
        <path d={xs.map((v, k) => `${k ? 'L' : 'M'}${x(v).toFixed(1)},${yc(v).toFixed(1)}`).join(' ')} fill="none" stroke={C.noise} strokeWidth={3} />
        <Label x={x(80)} y={150} text="single students (SD 9)" color={C.noise} size={14} weight={700} opacity={p} />
        <g opacity={q}>
          <rect x={x(hLo)} y={92} width={x(hHi) - x(hLo)} height={300} fill={C.signal} opacity={0.08} />
          <line x1={x(hLo)} x2={x(hHi)} y1={92} y2={92} stroke={C.signal} strokeWidth={6} strokeLinecap="round" />
          <Label x={x(hHi) + 12} y={97} text="95% CI for the mean" color={C.signal} size={14} weight={700} />
        </g>
        <AxisX x={x} y={yb} ticks={[30, 40, 50, 60, 70, 80, 90, 100]} />
      </g>);
    }}
  </Frame>
);

export default S17Meaning;
