import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, lin, ramp} from './_kit';
import {Head, XAxis, span, f6, wAt} from './_s24';

// Normality checks. Uses c.table (order i, sample 1, sample 2, plotting probability, z_i) and c.values
// (mean1, sd1, mean2, sd2, W1, P1, W2, P2). Dot plots with ±1 SD bands, the Q-Q plot, and P against 0.05.
const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const rows: any[][] = c.table.rows; const n = c.steps.length;
  const s1 = rows.map(r => +r[1]), s2 = rows.map(r => +r[2]), z = rows.map(r => +r[4]);
  const title = k >= 0 && k < n ? c.steps[k].title : '';
  if (/hypothes/i.test(title)) return null;
  const which = /sample 2/i.test(title) ? 2 : 1;
  const all = [...s1, ...s2]; const ticks = span(Math.min(...all), Math.max(...all), 5); const X = lin(ticks[0], ticks[ticks.length - 1], 40, 360);
  const stackOf = (a: number[]) => a.map((x, j) => a.slice(0, j).filter(y => y === x).length);
  const dots = (a: number[], y: number, col: string, hl?: (x: number) => boolean, p = 1) => { const st = stackOf(a);
    return a.map((x, j) => <circle key={j} cx={X(x)} cy={y - st[j] * 13} r={5.5} fill={hl && hl(x) ? P.hiSolid : col} stroke={hl && hl(x) ? '#b8900a' : 'none'} opacity={p} />); };

  // question: both samples
  if (k < 0) return (<g fontFamily={inter}><Head title="Two samples of ten" sub={c.unit} />
    <Txt x={20} y={130} size={15} weight={700} color={P.group[0]}>sample 1</Txt>{dots(s1, 180, P.group[0])}
    <Txt x={20} y={250} size={15} weight={700} color={P.group[1]}>sample 2</Txt>{dots(s2, 300, P.group[1])}
    <XAxis X={X} y={340} ticks={ticks} /></g>);

  // dot plot with mean and SD bands
  const band = (a: number[], m: number, s: number, mode: 'sd' | 'pct' | 'both') => {
    const pM = mode === 'sd' ? ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1) : 1;
    const pS = mode === 'sd' ? ramp(t, wAt(c, k, 2), wAt(c, k, 2) + 1.2) : 1;
    const pH = mode === 'sd' ? 0 : ramp(t, wAt(c, k, mode === 'both' ? 2 : 1), wAt(c, k, mode === 'both' ? 2 : 1) + 1);
    const p2 = mode === 'both' ? ramp(t, wAt(c, k, 3), wAt(c, k, 3) + 1) : 0;
    const inside = (x: number) => pH > 0.5 && Math.abs(x - m) < s; const y = 260;
    const nIn = a.filter(x => Math.abs(x - m) < s).length, n2 = a.filter(x => Math.abs(x - m) < 2 * s).length;
    return (<g fontFamily={inter}>
      <Head title={which === 1 ? 'Sample 1' : 'Sample 2'} sub={c.unit} />
      {p2 > 0 && <rect x={Math.max(20, X(m - 2 * s))} y={120} width={Math.min(380, X(m + 2 * s)) - Math.max(20, X(m - 2 * s))} height={160} fill="rgba(40,83,200,0.06)" opacity={p2} />}
      {p2 > 0 && [m - 2 * s, m + 2 * s].map(b => X(b) > 20 && X(b) < 380 && <line key={b} x1={X(b)} x2={X(b)} y1={120} y2={280} stroke={P.blue} strokeDasharray="4 4" opacity={p2} />)}
      <rect x={X(m - s * pS)} y={120} width={X(m + s * pS) - X(m - s * pS)} height={160} fill="rgba(40,83,200,0.13)" />
      <line x1={X(m)} x2={X(m)} y1={110} y2={280} stroke={P.blue} strokeWidth={3} opacity={pM} />
      <Txt x={X(m)} y={102} size={15} anchor="middle" weight={700} color={P.blue} opacity={pM}>{`x̄ = ${f6(m)}`}</Txt>
      {pS > 0.95 && <Txt x={Math.min(372, X(m + s) + 4)} y={300 + 0} size={14} anchor={X(m + s) > 330 ? 'end' : 'start'} color={P.blue}>{`s = ${f6(s)}`}</Txt>}
      {dots(a, y, which === 1 ? P.group[0] : P.group[1], inside)}
      <XAxis X={X} y={320} ticks={ticks} />
      {pH > 0 && <Txt x={200} y={400} size={16} anchor="middle" weight={700} opacity={pH}>{`${nIn} of ${a.length} within one SD = ${Math.round(100 * nIn / a.length)}%`}</Txt>}
      {mode === 'both' && p2 > 0 && <Txt x={200} y={426} size={16} anchor="middle" weight={700} color={P.blue} opacity={p2}>{`${n2} of ${a.length} within two SDs = ${Math.round(100 * n2 / a.length)}%`}</Txt>}
      {mode === 'pct' && pH > 0 && <Txt x={200} y={426} size={15} anchor="middle" color={P.soft} opacity={pH}>Normal 68.26%</Txt>}
    </g>);
  };
  if (/^Mean and SD of sample 1/i.test(title)) return band(s1, v.mean1, v.sd1, 'sd');
  if (/Percentage of sample 1/i.test(title)) return band(s1, v.mean1, v.sd1, 'pct');
  if (/range percentages of sample 2|Mean, SD/i.test(title)) return band(s2, v.mean2, v.sd2, 'both');

  // Q-Q plot (sorted values against z) with the line through the quartiles, plus P against 0.05
  const qq = (a: number[], x0: number, x1: number, y0: number, y1: number, p: number, col: string, small = false) => {
    const srt = [...a].sort((p1, p2) => p1 - p2); const XZ = lin(-2, 2, x0, x1); const Y = lin(ticks[0], ticks[ticks.length - 1], y0, y1);
    const qf = (pr: number) => { const h = (srt.length - 1) * pr; const j = Math.floor(h); return srt[j] + (h - j) * (srt[j + 1] - srt[j]); };
    const q1 = qf(0.25), q3 = qf(0.75), sl = (q3 - q1) / (2 * 0.6744898), mid = (q1 + q3) / 2; const L = (zz: number) => mid + sl * zz;
    return (<g>
      <line x1={x0} x2={x0} y1={y0} y2={y1} stroke={P.faint} strokeWidth={1.5} />
      {ticks.filter((_, j) => !small || j % 2 === 0).map(tk => <g key={tk}><line x1={x0 - 5} x2={x0} y1={Y(tk)} y2={Y(tk)} stroke={P.faint} /><text x={x0 - 8} y={Y(tk) + 4} fontSize={14} fill={P.soft} textAnchor="end">{tk}</text></g>)}
      <line x1={x0} x2={x1} y1={y0} y2={y0} stroke={P.faint} strokeWidth={1.5} />
      {[-2, -1, 0, 1, 2].map(tk => <g key={tk}><line x1={XZ(tk)} x2={XZ(tk)} y1={y0} y2={y0 + 5} stroke={P.faint} /><text x={XZ(tk)} y={y0 + 20} fontSize={14} fill={P.soft} textAnchor="middle">{tk < 0 ? '−' + -tk : tk}</text></g>)}
      <line x1={XZ(-2)} y1={Y(L(-2))} x2={XZ(-2) + (XZ(2) - XZ(-2)) * p} y2={Y(L(-2)) + (Y(L(2)) - Y(L(-2))) * p} stroke={P.red} strokeWidth={2} strokeDasharray="6 4" />
      {srt.map((x, j) => <circle key={j} cx={XZ(z[j])} cy={Y(x)} r={5} fill={col} opacity={Math.min(1, Math.max(0, p * 12 - j))} />)}
      <text x={(x0 + x1) / 2} y={y0 + 40} fontSize={14} fill={P.soft} textAnchor="middle">theoretical quantile z</text>
    </g>);
  };
  const pBar = (Pv: number, y: number, p: number) => { const XL = lin(-3, 0, 50, 350); const lg = Math.log10; const ok = Pv >= 0.05;
    return (<g fontFamily={inter}>
      <rect x={XL(-3)} y={y - 26} width={XL(lg(0.05)) - XL(-3)} height={30} fill="rgba(200,55,45,0.12)" />
      <line x1={XL(lg(0.05))} x2={XL(lg(0.05))} y1={y - 32} y2={y + 4} stroke={P.red} strokeWidth={2} strokeDasharray="4 3" />
      <rect x={XL(-3)} y={y - 18} width={(XL(lg(Pv)) - XL(-3)) * p} height={14} rx={4} fill={ok ? P.green : P.red} />
      <line x1={XL(-3)} x2={XL(0)} y1={y + 4} y2={y + 4} stroke={P.faint} strokeWidth={1.5} />
      {[0.001, 0.01, 0.05, 1].map(tk => <text key={tk} x={XL(lg(tk))} y={y + 22} fontSize={14} fill={P.soft} textAnchor="middle">{tk}</text>)}
      <Txt x={20} y={y - 6} size={15} weight={700}>P</Txt>
      {p > 0.95 && <Txt x={ok ? XL(lg(Pv)) : XL(lg(Pv)) + 10} y={y - 30} size={15} weight={700} anchor={ok ? 'end' : 'start'} color={ok ? P.green : P.red}>{`P = ${f6(Pv)}`}</Txt>}
    </g>);
  };
  if (/quantiles/i.test(title)) return (<g fontFamily={inter}><Head title="Normal Q-Q plot, sample 1" />
    {qq(s1, 80, 370, 370, 80, ramp(t, wAt(c, k, 0), wAt(c, k, 2) + 1), P.group[0])}</g>);
  if (/Shapiro/i.test(title)) { const a = which === 1 ? s1 : s2; const Pv = which === 1 ? v.P1 : v.P2; const Wv = which === 1 ? v.W1 : v.W2;
    return (<g fontFamily={inter}><Head title={`Shapiro-Wilk, sample ${which}`} sub={`W = ${f6(Wv)}`} />
      {qq(a, 80, 370, 290, 80, 1, which === 1 ? P.group[0] : P.group[1], true)}
      {pBar(Pv, 405, ramp(t, wAt(c, k, 0), wAt(c, k, 0) + 1.2))}</g>); }
  // conclusion: both Q-Q plots side by side
  return (<g fontFamily={inter}><Head title="Q-Q plots and Shapiro-Wilk" />
    <Txt x={130} y={70} size={15} anchor="middle" weight={700} color={P.group[0]}>sample 1</Txt>
    <Txt x={310} y={70} size={15} anchor="middle" weight={700} color={P.group[1]}>sample 2</Txt>
    {qq(s1, 60, 200, 300, 90, 1, P.group[0], true)}{qq(s2, 240, 380, 300, 90, 1, P.group[1], true)}
    <Txt x={130} y={380} size={15} anchor="middle" weight={700} color={P.green}>{`P = ${f6(v.P1)}`}</Txt>
    <Txt x={310} y={380} size={15} anchor="middle" weight={700} color={P.red}>{`P = ${f6(v.P2)}`}</Txt>
    <Txt x={130} y={406} size={15} anchor="middle" color={P.green}>Normal not rejected</Txt>
    <Txt x={310} y={406} size={15} anchor="middle" color={P.red}>Normal rejected</Txt>
  </g>);
};
export default Viz;
