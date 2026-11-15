import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Dot, Txt, ramp, lin} from './_kit';
import {Axes, CoefLine, f, frame, sub, TablePanel} from './_s18kit';

// Regression line, its bands and the two intervals at a chosen x (cases s18-martians-at40, s18-plutonian-males,
// s18-original-caffeine). The case gives no raw points, so only the fitted line, the point of means and the bands
// computed from the case values are drawn. Each step is matched by its title.
const LABELS: [RegExp, string, string][] = [
  [/martian/, 'Height x (cm)', 'Weight y (g)'], [/plutonian/, 'Height x (in)', 'Weight y (lb)'], [/caffeine/, 'Caffeine dose x (mg)', 'Taps per 10 s']];

const modeOf = (s: string) => {
  const m: [RegExp, string][] = [[/interval for the slope/, 'slopeCI'], [/interval for the intercept/, 'intCI'], [/correlation/, 'corr'],
    [/interval for the mean|ci for the mean/, 'ciMean'], [/interval for one|ci for one/, 'ciObs'], [/error for one new/, 'seNew'],
    [/error of the mean prediction/, 'seMean'], [/compare the two widths/, 'compare'], [/distance term/, 'distance'], [/predict/, 'predict'],
    [/mean and sd/, 'meanSD'], [/both means/, 'means'], [/deviation sums/, 'devsums'], [/calculate the slope/, 'slopeLine'],
    [/calculate the intercept/, 'intercept'], [/sample variances/, 'sdBars'], [/variance about the line/, 'syxBand'],
    [/coefficient standard errors/, 'coefSE'], [/read the coefficients/, 'coef']];
  for (const [r, name] of m) if (r.test(s)) return name; return 'other';
};

const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length; const N = v.n;
  const title = (k >= 0 && k < n ? c.steps[k].title : '').toLowerCase();
  const mode = k < 0 ? 'question' : k === n ? 'end' : modeOf(title);
  // when the last work line of this step is written (seconds into the step)
  const st = k >= 0 && k < n ? c.steps[k] : null;
  const tl = st ? 0.9 + 0.7 * st.general.length + 1.4 * Math.max(0, st.work.length - 1) : 1;
  const pMain = ramp(t, tl, tl + 1.4);
  const a = v.a, b = v.b, syx = v.syx, tc = v.critical, x0 = v.x;
  const xb = v.xbar ?? v.sumX / N;
  const Sxx = v.sumX2 !== undefined ? v.sumX2 - v.sumX * v.sumX / N : (N - 1) * v.sx * v.sx;
  const sx = v.sx ?? Math.sqrt(Sxx / (N - 1));
  const yb = v.sumY !== undefined ? v.sumY / N : a + b * xb;
  const sy = v.sumY2 !== undefined ? Math.sqrt((v.sumY2 - v.sumY * v.sumY / N) / (N - 1)) : undefined;
  const Sxy = v.sumXY !== undefined ? v.sumXY - v.sumX * v.sumY / N : undefined;
  const Syy = v.sumY2 !== undefined ? v.sumY2 - v.sumY * v.sumY / N : undefined;
  const yAt = (x: number) => a + b * x;
  const seM = (x: number) => syx * Math.sqrt(1 / N + (x - xb) ** 2 / Sxx);
  const seO = (x: number) => Math.sqrt(syx * syx + seM(x) ** 2);
  // ranges
  let xlo = Math.min(x0, xb - 2.2 * sx), xhi = Math.max(x0, xb + 2.2 * sx);
  const hasIntStep = c.steps.some(s => /calculate the intercept|coefficient standard errors/i.test(s.title));
  if (xlo < 0 && xb > 0) xlo = 0;
  if (hasIntStep) xlo = Math.min(xlo, 0);
  const ys: number[] = [];
  for (const x of [xlo, xhi, x0]) ys.push(yAt(x) - tc * seO(x), yAt(x) + tc * seO(x));
  if (sy !== undefined) ys.push(yb - sy, yb + sy);
  if (hasIntStep) ys.push(a - v.sa, a + v.sa);
  const F = frame(xlo, xhi, Math.min(...ys), Math.max(...ys));
  const {X, Y, box} = F; const L0 = F.x0, L1 = F.x1;
  const lab = LABELS.find(([r]) => r.test(c.id)) || [null, 'x', 'y'];
  // what is visible in this mode
  const M = mode;
  const lineModes = ['question', 'end', 'predict', 'distance', 'seMean', 'ciMean', 'seNew', 'ciObs', 'compare', 'coef', 'slopeLine', 'intercept',
    'sdBars', 'syxBand', 'coefSE', 'slopeCI', 'meanSD'];
  const showLine = lineModes.includes(M);
  const pLine = M === 'coef' || M === 'slopeLine' ? ramp(t, 1.4, 2.8) : 1;
  const showMeanPt = ['means', 'devsums', 'slopeLine', 'intercept', 'sdBars', 'coefSE', 'slopeCI', 'meanSD', 'distance'].includes(M);
  const atX0 = ['question', 'end', 'predict', 'distance', 'seMean', 'ciMean', 'seNew', 'ciObs', 'compare'].includes(M);
  const showYhat = atX0 && M !== 'question';
  const pMeanBand = M === 'ciMean' ? pMain : ['ciObs', 'compare', 'end'].includes(M) ? 1 : 0;
  const pObsBand = M === 'ciObs' ? pMain : ['compare', 'end'].includes(M) ? 1 : 0;
  const mlo = yAt(x0) - tc * seM(x0), mhi = yAt(x0) + tc * seM(x0), olo = yAt(x0) - tc * seO(x0), ohi = yAt(x0) + tc * seO(x0);
  const xs = Array.from({length: 41}, (_, i) => L0 + (L1 - L0) * i / 40);
  const band = (g: (x: number) => number) => 'M' + xs.map(x => `${X(x)},${Y(yAt(x) + tc * g(x))}`).join(' L') + ' L' + [...xs].reverse().map(x => `${X(x)},${Y(yAt(x) - tc * g(x))}`).join(' L') + 'Z';
  const xu = (lab[1] as string).match(/\((.+)\)/)?.[1] || '';

  // the question shows the given values (data table)
  if (M === 'question') return <TablePanel c={c} t={t} />;
  // alternate full-panel views
  if (M === 'intCI') return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Intercept (value at x = 0)</Txt>
    <CoefLine y={230} est={a} lo={v.interceptLower} hi={v.interceptUpper} pCI={pMain} title="" color={P.ink} />
  </g>);
  if (M === 'corr') { const R = lin(-1, 1, 40, 360); const r2 = v.R2 ?? v.r * v.r; const B = lin(0, 1, 40, 360); const p = ramp(t, 1.0, 2.4);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{`r = ${f(v.r * p, 4)}`}</Txt>
      <line x1={R(-1)} x2={R(1)} y1={150} y2={150} stroke={P.faint} strokeWidth={1.5} />
      {[-1, -0.5, 0, 0.5, 1].map(z => <g key={z}><line x1={R(z)} x2={R(z)} y1={150} y2={155} stroke={P.faint} />
        <text x={R(z)} y={170} fontSize={14} fill={P.soft} textAnchor="middle">{z === 1 ? '+1' : z === -1 ? '−1' : f(z)}</text></g>)}
      <line x1={R(0)} x2={R(v.r * p)} y1={140} y2={140} stroke={P.blue} strokeWidth={4} strokeLinecap="round" />
      <circle cx={R(v.r * p)} cy={140} r={7} fill={P.blue} />
      <Txt x={20} y={250} size={16} weight={700} color={P.blue}>Share of the y variation</Txt>
      <rect x={B(0)} y={272} width={B(1) - B(0)} height={26} rx={4} fill={P.red} opacity={0.7} />
      <rect x={B(0)} y={272} width={(B(r2) - B(0)) * p} height={26} rx={4} fill={P.blue} opacity={0.8} />
      <Txt x={B(0)} y={324} size={15} color={P.blue} weight={700} opacity={p}>{`r² = ${f(r2, 4)}`}</Txt>
      {v.t !== undefined && <Txt x={20} y={390} size={16} weight={700} opacity={pMain}>{`t = r√((n − 2)/(1 − r²)) = ${f(v.t, 3)}`}</Txt>}
    </g>); }

  const head: Record<string, string> = {question: 'The fitted line', end: 'Two intervals at x = ' + f(x0), predict: 'Predicted mean at x = ' + f(x0),
    distance: 'Distance from the mean x', seMean: 'Uncertainty of the line', ciMean: 'Interval for the mean', seNew: 'Uncertainty for one new value',
    ciObs: 'Interval for one value', compare: 'The two widths', coef: 'The fitted line', slopeLine: 'The slope', intercept: 'The intercept',
    sdBars: 'SDs of x and y', syxBand: 'Scatter about the line', coefSE: 'SEs of slope and intercept', slopeCI: 'Interval for the slope',
    meanSD: 'Mean and SD of x', means: 'The point of means', devsums: 'Deviation sums'};
  let subl: React.ReactNode = `ŷ = ${f(a, 4)} + ${f(b, 5)}x`;
  if (M === 'means' || M === 'devsums') subl = `(x̄, ȳ) = (${f(xb, 2)}, ${f(yb, 4)})`;
  if (M === 'predict' || M === 'distance') subl = `ŷ = ${f(yAt(x0), 4)} at x = ${f(x0)}`;
  if (M === 'seMean') subl = sub('s', 'ŷ', ` = ${f(seM(x0), 4)}`);
  if (M === 'seNew') subl = <>{sub('s', 'Y new', ` = ${f(seO(x0), 4)}`)}</>;
  if (M === 'ciMean') subl = `${f(mlo, 4)} to ${f(mhi, 4)}`;
  if (M === 'ciObs') subl = `${f(olo, 4)} to ${f(ohi, 4)}`;
  if (M === 'compare') subl = `${f(seO(x0), 4)} / ${f(seM(x0), 4)} = ${f(seO(x0) / seM(x0), 2)}`;
  if (M === 'syxBand' || M === 'coef') subl = sub('s', 'y|x', ` = ${f(syx, 4)}`);
  if (M === 'sdBars') subl = <>{sub('s', 'x', ` = ${f(sx, 4)}   `)}{sy !== undefined ? sub('s', 'y', ` = ${f(sy, 4)}`) : null}</>;
  if (M === 'coefSE') subl = <>{sub('s', 'b', ` = ${f(v.sb, 6)}   `)}{sub('s', 'a', ` = ${f(v.sa, 4)}`)}</>;
  if (M === 'slopeCI') subl = `${f(v.slopeLower, 4)} < β < ${f(v.slopeUpper, 4)}`;
  if (M === 'meanSD') subl = <>{`x̄ = ${f(xb, 2)}   `}{sub('s', 'x', ` = ${f(sx, 4)}`)}</>;
  if (M === 'slopeLine') subl = `b = ${f(b, 6)}`;
  if (M === 'intercept') subl = `a = ${f(a, 4)}`;
  const pSub = ['question', 'end', 'coef', 'means', 'devsums'].includes(M) ? 1 : ramp(t, tl - 0.4, tl + 0.6);

  const xm = X(x0);
  const pSEm = M === 'seMean' ? pMain : M === 'seNew' || M === 'compare' ? 1 : 0;
  const pSEo = M === 'seNew' ? pMain : M === 'compare' ? 1 : 0;
  const pCIm = M === 'ciMean' ? pMain : (M === 'ciObs' || M === 'end') ? 1 : 0;
  const pCIo = M === 'ciObs' ? pMain : M === 'end' ? 1 : 0;
  const pFan = M === 'slopeCI' ? pMain : 0;
  const pCoefSE = M === 'coefSE' ? ramp(t, 1.6, tl + 1) : 0;
  const pSyx = M === 'syxBand' ? ramp(t, 2.0, 3.2) : M === 'coef' ? ramp(t, 3.0, 4.2) : 0;
  const lineX1 = L0 + (L1 - L0) * pLine;
  // slope line in the caffeine sequence grows out from the point of means both ways
  const sl = M === 'slopeLine';
  const lx0 = sl ? xb - (xb - L0) * pLine : L0, lx1 = sl ? xb + (L1 - xb) * pLine : lineX1;
  const fanL = (bb: number) => <line x1={X(L0)} x2={X(L1)} y1={Y(yb + bb * (L0 - xb))} y2={Y(yb + bb * (L1 - xb))} />;
  return (<g fontFamily={inter}>
    <Txt x={20} y={32} size={17} weight={700} color={P.blue}>{head[M] || ''}</Txt>
    <Txt x={20} y={56} size={15} color={P.ink} opacity={pSub}>{subl}</Txt>
    <defs><clipPath id={`clip-${c.id}`}><rect x={box.l} y={box.t - 6} width={box.r - box.l} height={box.b - box.t + 6} /></clipPath></defs>
    <Axes F={F} xl={lab[1] as string} yl={lab[2] as string} />
    <g clipPath={`url(#clip-${c.id})`}>
      {pObsBand > 0 && <path d={band(seO)} fill={P.group[1]} opacity={0.12 * pObsBand} />}
      {pMeanBand > 0 && <path d={band(seM)} fill={P.blue} opacity={0.16 * pMeanBand} />}
      {pSyx > 0 && <g opacity={pSyx} stroke={P.red} strokeWidth={2} strokeDasharray="6 5">
        <line x1={X(L0)} x2={X(L1)} y1={Y(yAt(L0) + syx)} y2={Y(yAt(L1) + syx)} />
        <line x1={X(L0)} x2={X(L1)} y1={Y(yAt(L0) - syx)} y2={Y(yAt(L1) - syx)} /></g>}
      {pFan > 0 && <g opacity={pFan}>
        <path d={`M${X(L0)},${Y(yb + v.slopeLower * (L0 - xb))} L${X(xb)},${Y(yb)} L${X(L0)},${Y(yb + v.slopeUpper * (L0 - xb))}Z`} fill={P.hiSolid} opacity={0.45} />
        <path d={`M${X(L1)},${Y(yb + v.slopeLower * (L1 - xb))} L${X(xb)},${Y(yb)} L${X(L1)},${Y(yb + v.slopeUpper * (L1 - xb))}Z`} fill={P.hiSolid} opacity={0.45} />
        <g stroke={P.green} strokeWidth={2}>{fanL(v.slopeLower)}{fanL(v.slopeUpper)}</g></g>}
      {pCoefSE > 0 && <g opacity={pCoefSE} stroke={P.group[2]} strokeWidth={2} strokeDasharray="6 5">{fanL(b - v.sb)}{fanL(b + v.sb)}</g>}
      {showLine && <line x1={X(lx0)} x2={X(lx1)} y1={Y(yAt(lx0))} y2={Y(yAt(lx1))} stroke={P.blue} strokeWidth={3} strokeLinecap="round" />}
    </g>
    {/* point of means */}
    {showMeanPt && <g opacity={M === 'means' ? ramp(t, 1.4, 2.4) : 1}>
      <line x1={X(xb)} x2={X(xb)} y1={box.b} y2={Y(yb)} stroke={P.green} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={box.l} x2={X(xb)} y1={Y(yb)} y2={Y(yb)} stroke={P.green} strokeWidth={1.5} strokeDasharray="5 4" />
      <Dot x={X(xb)} y={Y(yb)} r={7} color={P.green} ring />
    </g>}
    {M === 'devsums' && Sxy !== undefined && <g>
      {[['Σ(x − x̄)²', Sxx], ['Σ(x − x̄)(y − ȳ)', Sxy], ['Σ(y − ȳ)²', Syy as number]].map(([s, val], i) => <Txt key={i} x={box.l + 14} y={box.t + 22 + i * 26} size={15} opacity={ramp(t, 1.8 + i * 1.4, 2.6 + i * 1.4)}>
        {`${s} = ${f(val as number, 3)}`}</Txt>)}
    </g>}
    {/* SDs of x and y about the point of means */}
    {M === 'sdBars' && <g opacity={ramp(t, 1.6, 2.6)}>
      <line x1={X(xb - sx)} x2={X(xb + sx)} y1={Y(yb)} y2={Y(yb)} stroke={P.group[2]} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      {sy !== undefined && <line x1={X(xb)} x2={X(xb)} y1={Y(yb - sy)} y2={Y(yb + sy)} stroke={P.group[1]} strokeWidth={5} strokeLinecap="round" opacity={0.7} />}
    </g>}
    {/* intercept at x = 0 */}
    {(M === 'intercept' || M === 'coefSE') && X(0) >= box.l - 1 && <g opacity={M === 'intercept' ? ramp(t, 1.8, 2.6) : 1}>
      {M === 'coefSE' && <line x1={X(0) + 8} x2={X(0) + 8} y1={Y(a - v.sa * pCoefSE)} y2={Y(a + v.sa * pCoefSE)} stroke={P.group[2]} strokeWidth={5} strokeLinecap="round" />}
      <Dot x={X(0)} y={Y(a)} r={7} color={P.red} />
      <Txt x={X(0) + 18} y={Y(a) + 22} size={15} color={P.red} weight={700}>{`a = ${f(a, 3)}`}</Txt>
    </g>}
    {/* mean and SD of x on the x axis */}
    {M === 'meanSD' && <g opacity={ramp(t, 1.8, 3.0)}>
      <line x1={X(xb - sx)} x2={X(xb + sx)} y1={box.b - 14} y2={box.b - 14} stroke={P.group[2]} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <circle cx={X(xb)} cy={box.b - 14} r={5} fill={P.group[2]} />
    </g>}
    {/* distance from the mean x */}
    {M === 'distance' && <g opacity={ramp(t, 1.8, 2.8)}>
      <line x1={X(xb)} x2={xm} y1={box.b - 14} y2={box.b - 14} stroke={P.red} strokeWidth={4} />
      <line x1={X(xb)} x2={X(xb)} y1={box.b - 22} y2={box.b - 6} stroke={P.red} strokeWidth={2.5} />
      <line x1={xm} x2={xm} y1={box.b - 22} y2={box.b - 6} stroke={P.red} strokeWidth={2.5} />
      <Txt x={(X(xb) + xm) / 2} y={box.b - 28} size={15} anchor="middle" color={P.red} weight={700}>{f(x0 - xb, 4)}</Txt>
    </g>}
    {/* the chosen x */}
    {atX0 && <line x1={xm} x2={xm} y1={box.b} y2={box.t} stroke={P.soft} strokeWidth={1.5} strokeDasharray="4 5" />}
    {/* SE bars */}
    {pSEm > 0 && <line x1={xm - 7} x2={xm - 7} y1={Y(yAt(x0) - seM(x0) * pSEm)} y2={Y(yAt(x0) + seM(x0) * pSEm)} stroke={P.blue} strokeWidth={6} strokeLinecap="round" />}
    {pSEo > 0 && <line x1={xm + 7} x2={xm + 7} y1={Y(yAt(x0) - seO(x0) * pSEo)} y2={Y(yAt(x0) + seO(x0) * pSEo)} stroke={P.group[1]} strokeWidth={6} strokeLinecap="round" />}
    {M === 'compare' && <g>
      <Txt x={xm - 18} y={Y(yAt(x0) + seM(x0)) - 6} size={15} anchor="end" color={P.blue} weight={700}>{f(seM(x0), 4)}</Txt>
      <Txt x={xm + 18} y={Y(yAt(x0) + seO(x0)) - 6} size={15} color={P.group[1]} weight={700}>{f(seO(x0), 4)}</Txt>
    </g>}
    {/* CI bars with bounds */}
    {pCIm > 0 && <g>
      <line x1={xm - 7} x2={xm - 7} y1={Y(yAt(x0) - (yAt(x0) - mlo) * pCIm)} y2={Y(yAt(x0) + (mhi - yAt(x0)) * pCIm)} stroke={P.blue} strokeWidth={6} strokeLinecap="round" />
      {M !== 'end' && <g opacity={pCIm}>
        <Txt x={xm - 18} y={Math.min(Y(mhi), Y(yAt(x0)) - 20) - 2} size={15} anchor="end" color={P.blue} weight={700}>{f(mhi, 4)}</Txt>
        <Txt x={xm - 18} y={Math.max(Y(mlo), Y(yAt(x0)) + 20) + 14} size={15} anchor="end" color={P.blue} weight={700}>{f(mlo, 4)}</Txt></g>}
    </g>}
    {pCIo > 0 && <g>
      <line x1={xm + 7} x2={xm + 7} y1={Y(yAt(x0) - (yAt(x0) - olo) * pCIo)} y2={Y(yAt(x0) + (ohi - yAt(x0)) * pCIo)} stroke={P.group[1]} strokeWidth={6} strokeLinecap="round" />
      <g opacity={pCIo}>
        <Txt x={xm + 18} y={Math.min(Y(ohi), Y(yAt(x0)) - 24) + 5} size={15} color={P.group[1]} weight={700}>{f(ohi, 4)}</Txt>
        <Txt x={xm + 18} y={Math.max(Y(olo), Y(yAt(x0)) + 24) + 5} size={15} color={P.group[1]} weight={700}>{f(olo, 4)}</Txt></g>
    </g>}
    {showYhat && <Dot x={xm} y={Y(yAt(x0))} r={6.5} color={P.ink} opacity={M === 'predict' ? ramp(t, 1.8, 2.6) : 1} />}
    {M === 'end' && <g>
      <rect x={box.l + 10} y={box.t + 6} width={12} height={12} fill={P.blue} opacity={0.6} /><Txt x={box.l + 28} y={box.t + 17} size={14} color={P.blue}>mean</Txt>
      <rect x={box.l + 80} y={box.t + 6} width={12} height={12} fill={P.group[1]} opacity={0.6} /><Txt x={box.l + 98} y={box.t + 17} size={14} color={P.group[1]}>one value</Txt>
    </g>}
  </g>);
};
export default Viz;
