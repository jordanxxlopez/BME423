import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Dot, Txt, ramp} from './_kit';
import {Axes, f, frame} from './_s18kit';

// Least-squares line from column totals (case s18-martians-line). Plots the raw rows of c.table, then the slope,
// the point of means, the fitted line with its residuals, and the population line of means read from the last work line.
const Viz: VizC = ({c, k, t}) => {
  const v = c.values; const n = c.steps.length;
  const rows = (c.table?.rows || []).filter((r: any[]) => typeof r[0] === 'number' && typeof r[1] === 'number');
  const pts = rows.map((r: any[]) => ({x: r[0] as number, y: r[1] as number}));
  const b = v.slope, a = v.intercept, xb = v.xbar, yb = v.ybar;
  const title = (k >= 0 && k < n ? c.steps[k].title : '').toLowerCase();
  // population line of means, as written in the case's own comparison step (mu_{y|x}=alpha+beta x)
  let lom: {al: number; be: number} | null = null;
  for (const s of c.steps) for (const w of s.work) { const m = w.match(/\\mu_\{y\|x\}=(-?[\d.]+)\+([\d.]+)x/); if (m) lom = {al: +m[1], be: +m[2]}; }
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const xlo = Math.min(...xs) - 3, xhi = Math.max(...xs) + 2;
  const lineYs = [a + b * xlo, a + b * xhi, ...(lom ? [lom.al + lom.be * xlo, lom.al + lom.be * xhi] : [])];
  const F = frame(xlo, xhi, Math.min(...ys, ...lineYs) - 0.5, Math.max(...ys, ...lineYs) + 0.5);
  const {X, Y, box} = F;
  const [yu, xu] = String(c.unit || '/').split('/');
  const xl = String(c.table?.headers?.[0] || 'x'), yl = String(c.table?.headers?.[1] || 'y');
  const isQ = k < 0, isSums = /sums/.test(title), isDen = /denominator/.test(title), isSlope = /slope/.test(title);
  const isMeans = /sample means|both means/.test(title), isInt = /intercept/.test(title), isLom = /line of means/.test(title);
  const isEnd = k === n;
  const showMean = isMeans || isInt || isLom || isEnd;
  const showLine = isInt || isLom || isEnd;
  const pLine = /intercept from/.test(title) ? ramp(t, 1.6, 3.0) : 1;
  const pRes = /intercept from/.test(title) ? ramp(t, 3.0, 4.2) : (isInt || isEnd ? 1 : 0);
  const pLom = isLom ? ramp(t, 2.0, 3.4) : isEnd ? 1 : 0;
  const lx0 = F.x0, lx1 = F.x1; const cut = (x: number) => lx0 + (x - lx0) * pLine;
  const head = isQ ? 'The 10 Martians' : isSums ? 'Totals of the columns' : isDen ? 'Spread of the heights' : isSlope ? 'The slope' :
    isMeans ? 'The point of means' : isLom ? 'Sample line and line of means' : isEnd ? 'The least-squares line' : 'The intercept';
  // slope triangle: a 10-unit run along the fitted line, anchored at the point of means
  const run = 10; const tx0 = xb - run / 2, tx1 = xb + run / 2;
  const pTri = isSlope ? ramp(t, 1.2, 2.4) : 0;
  return (<g fontFamily={inter}>
    <Txt x={20} y={32} size={17} weight={700} color={P.blue}>{head}</Txt>
    {isSums && <Txt x={20} y={56} size={15} color={P.soft}>{`n = ${v.n}   Σx = ${f(v.sumX)}   Σy = ${f(v.sumY)}`}</Txt>}
    {isDen && <Txt x={20} y={56} size={15} color={P.soft} opacity={ramp(t, 1.2, 2.0)}>{`denominator = ${f(v.denominator)}`}</Txt>}
    {isSlope && <Txt x={20} y={56} size={15} color={P.soft} opacity={ramp(t, 2.0, 2.8)}>{`b = ${f(b, 7)}`}</Txt>}
    {isMeans && <Txt x={20} y={56} size={15} color={P.soft} opacity={ramp(t, 2.0, 2.8)}>{`(x̄, ȳ) = (${f(xb)}, ${f(yb)})`}</Txt>}
    {(isInt || isEnd) && <Txt x={20} y={56} size={15} color={P.blue} opacity={isInt && !/check/.test(title) ? ramp(t, 2.6, 3.4) : 1}>{`ŷ = ${f(a, 3)} + ${f(b, 4)}x`}</Txt>}
    {isLom && <Txt x={20} y={56} size={15} color={P.blue}>{`ŷ = ${f(a, 2)} + ${f(b, 3)}x`}</Txt>}
    {lom && pLom > 0 && <Txt x={380} y={56} size={15} anchor="end" color={P.ink} opacity={pLom}>{`μ = ${f(lom.al)} + ${f(lom.be)}x`}</Txt>}
    {lom && pLom > 0 && <line x1={240} x2={266} y1={51} y2={51} stroke={P.ink} strokeWidth={2.5} strokeDasharray="6 4" opacity={pLom} />}
    <Axes F={F} xl={xl} yl={yl} />
    {/* spread of x: rug marks under the points */}
    {(isSums || isDen) && pts.map((p, i) => <line key={'r' + i} x1={X(p.x)} x2={X(p.x)} y1={box.b - 12} y2={box.b} stroke={isDen ? P.blue : P.faint} strokeWidth={isDen ? 3 : 2} opacity={isDen ? ramp(t, 0.5, 1.2) : 0.8} />)}
    {isDen && <g opacity={ramp(t, 0.8, 1.6)}>
      <line x1={X(Math.min(...xs))} x2={X(Math.max(...xs))} y1={box.b - 22} y2={box.b - 22} stroke={P.blue} strokeWidth={2} />
      <line x1={X(Math.min(...xs))} x2={X(Math.min(...xs))} y1={box.b - 28} y2={box.b - 16} stroke={P.blue} strokeWidth={2} />
      <line x1={X(Math.max(...xs))} x2={X(Math.max(...xs))} y1={box.b - 28} y2={box.b - 16} stroke={P.blue} strokeWidth={2} />
    </g>}
    {/* point of means crosshair */}
    {showMean && <g opacity={isMeans ? ramp(t, 1.0, 2.0) : 1}>
      <line x1={X(xb)} x2={X(xb)} y1={box.b} y2={Y(yb)} stroke={P.green} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={box.l} x2={X(xb)} y1={Y(yb)} y2={Y(yb)} stroke={P.green} strokeWidth={1.5} strokeDasharray="5 4" />
    </g>}
    {/* population line of means */}
    {lom && pLom > 0 && <g opacity={pLom}>
      <line x1={X(lx0)} x2={X(lx1)} y1={Y(lom.al + lom.be * lx0)} y2={Y(lom.al + lom.be * lx1)} stroke={P.ink} strokeWidth={2.5} strokeDasharray="8 6" />
    </g>}
    {/* residuals */}
    {showLine && pRes > 0 && pts.map((p, i) => <line key={'e' + i} x1={X(p.x)} x2={X(p.x)} y1={Y(p.y)} y2={Y(p.y + (a + b * p.x - p.y) * pRes)} stroke={P.red} strokeWidth={2} />)}
    {/* fitted line */}
    {showLine && <line x1={X(lx0)} x2={X(cut(lx1))} y1={Y(a + b * lx0)} y2={Y(a + b * cut(lx1))} stroke={P.blue} strokeWidth={3} strokeLinecap="round" />}
    {/* slope triangle */}
    {pTri > 0 && <g opacity={pTri}>
      <line x1={X(tx0)} x2={X(tx1)} y1={Y(yb - b * run / 2)} y2={Y(yb + b * run / 2)} stroke={P.blue} strokeWidth={3} strokeLinecap="round" />
      <line x1={X(tx0)} x2={X(tx1)} y1={Y(yb - b * run / 2)} y2={Y(yb - b * run / 2)} stroke={P.green} strokeWidth={2.5} />
      <line x1={X(tx1)} x2={X(tx1)} y1={Y(yb - b * run / 2)} y2={Y(yb + b * run / 2)} stroke={P.red} strokeWidth={2.5} />
      <Txt x={X(xb)} y={Y(yb - b * run / 2) + 22} size={15} anchor="middle" color={P.green}>{`+${run} ${xu}`}</Txt>
      <Txt x={X(tx1) + 8} y={Y(yb) + 5} size={15} color={P.red}>{`+${f(b * run, 2)} ${yu}`}</Txt>
    </g>}
    {pts.map((p, i) => <Dot key={i} x={X(p.x)} y={Y(p.y)} r={5.5} color={P.ink} opacity={isQ ? ramp(t, 0.6 + i * 0.35, 1.0 + i * 0.35) : 1} />)}
    {showMean && <Dot x={X(xb)} y={Y(yb)} r={7} color={P.green} ring opacity={isMeans ? ramp(t, 1.0, 2.0) : 1} />}
  </g>);
};
export default Viz;
