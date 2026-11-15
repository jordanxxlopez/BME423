import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp} from './_kit';
import {PairedViz} from './s20paired';
import {wrap} from './_s20';

// Paired t test by hand and in R. The hand steps reuse the paired visual; the R steps show the console output from
// c.values.rOutput, and the last step highlights each output line as the board pairs it with the hand result.
const mono = 'Menlo, Consolas, "DejaVu Sans Mono", monospace';
const Viz: VizC = (props) => {
  const {c, k, t} = props; const st = k >= 0 && k < c.steps.length ? c.steps[k].title : '';
  if (!/\bR\b/.test(st)) return <PairedViz {...props} />;
  const v = c.values; const out: string[] = v.rOutput || [];
  const marking = /Mark/i.test(st);
  // which output line each board line points to (by its content), in board order
  const G = c.steps[k].general.length; const wAt = (j: number) => 0.9 + 0.7 * G + 1.4 * j;
  const find = (re: RegExp) => out.findIndex(l => re.test(l));
  const targets = marking ? c.steps[k].work.map(wl =>
    /Paired/.test(wl) ? [find(/Paired t-test/)] : /alternative/.test(wl) ? [find(/^alternative/)] : /\\text\{t =/.test(wl) || /df =/.test(wl) || /p-value/.test(wl) ? [find(/^t = /)]
    : /mean difference \d/.test(wl) ? [find(/^mean difference/), find(/^mean difference/) + 1] : /CI/.test(wl) ? [find(/confidence interval/), find(/confidence interval/) + 1] : []) : [];
  // lay out wrapped output lines
  const lines: {text: string; src: number}[] = [];
  out.forEach((l, i) => wrap(l.trim() === '' ? ' ' : l.replace(/\s+$/, ''), 38).forEach(s => lines.push({text: s, src: i})));
  const lh = 21, top = 128;
  const pOut = marking ? 1 : ramp(t, wAt(c.steps[k].work.length - 1) + 0.6, wAt(c.steps[k].work.length - 1) + 1.6);
  const cur = marking ? targets.findIndex((_, j) => t < wAt(j + 1)) : -1;
  const curJ = marking ? (cur < 0 ? targets.length - 1 : cur) : -1;
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>R console</Txt>
    <rect x={20} y={56} width={360} height={392} rx={8} fill="#f3f5f9" stroke={P.line} />
    {wrap('> ' + (v.rCode || ''), 38).map((s, i) => <text key={'c' + i} x={32} y={82 + i * lh} fontFamily={mono} fontSize={14} fill={P.blue}>{s}</text>)}
    <g opacity={pOut}>
      {lines.map((l, i) => {
        const hit = targets.map((ts, j) => ts.includes(l.src) ? j : -1).filter(j => j >= 0);
        const on = hit.some(j => j === curJ && t >= wAt(j)); const done = hit.some(j => j < curJ || (j === curJ && false));
        const pOn = on ? ramp(t, wAt(curJ), wAt(curJ) + 0.5) : 0;
        return (<g key={i}>
          {(on || done) && <rect x={26} y={top + i * lh - 15} width={348} height={20} rx={4} fill={on ? P.hi : 'rgba(40,83,200,0.08)'} opacity={on ? pOn : 1} />}
          <text x={32} y={top + i * lh} fontFamily={mono} fontSize={14} fill={P.ink} xmlSpace="preserve" style={{whiteSpace: 'pre'}}>{l.text}</text>
        </g>);
      })}
    </g>
  </g>);
};
export default Viz;
