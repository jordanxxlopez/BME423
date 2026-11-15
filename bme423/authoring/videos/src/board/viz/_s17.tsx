// Session 17 helpers (confidence intervals). Files starting with "_" are not registered as visuals.
import React from 'react';
import {P, inter} from '../theme';
import {Txt} from './_kit';

// Seven significant digits, the precision the board's work lines use.
export const f7 = (z: number) => { const s = String(+(+z).toPrecision(7)); return s === '-0' ? '0' : s.replace('-', '−'); };
// Rough text width (Inter) so labels can be kept inside the panel.
export const tw = (s: string, size: number) => s.length * size * 0.56;
// Subscript inside a Txt: base{sub('d')}{up(' = 3')}.
export const sub = (s: string) => <tspan dy={4} fontSize="0.72em">{s}</tspan>;
export const up = (s: string) => <tspan dy={-4}>{s}</tspan>;
// Index of the first step whose title matches.
export const stepIdx = (steps: {title: string}[], re: RegExp) => steps.findIndex(s => re.test(s.title));

// An interval end drawn as a bracket that drops in; the value label is kept inside 20..w-20.
// span = pixel width of the interval: when both labels fit under it they sit inside, clear of a null line just outside.
export const End: React.FC<{x: number; y: number; p: number; color: string; label: string; side: 'left' | 'right'; w: number; dy?: number; span?: number}> =
  ({x, y, p, color, label, side, w, dy = 40, span = 0}) => {
  const d = side === 'left' ? 8 : -8; const wid = tw(label, 15);
  const inward = span > 2 * wid + 24;
  if (inward) return (<g opacity={p} transform={`translate(0 ${(1 - p) * -20})`}>
    <path d={`M${x + d},${y - 16} L${x},${y - 16} L${x},${y + 16} L${x + d},${y + 16}`} fill="none" stroke={color} strokeWidth={3} />
    <Txt x={side === 'left' ? x : x} y={y + dy} size={15} anchor={side === 'left' ? 'start' : 'end'} color={color} weight={700}>{label}</Txt></g>);
  let lx = side === 'left' ? x - 2 : x + 2;
  if (side === 'left' && lx - wid < 20) lx = 20 + wid;
  if (side === 'right' && lx + wid > w - 20) lx = w - 20 - wid;
  return (<g opacity={p} transform={`translate(0 ${(1 - p) * -20})`}>
    <path d={`M${x + d},${y - 16} L${x},${y - 16} L${x},${y + 16} L${x + d},${y + 16}`} fill="none" stroke={color} strokeWidth={3} />
    <Txt x={lx} y={y + dy} size={15} anchor={side === 'left' ? 'end' : 'start'} color={color} weight={700}>{label}</Txt></g>);
};

// Vertical reference line (null value) on a scale.
export const RefLine: React.FC<{x: number; y1: number; y2: number; color: string; p?: number; w?: number}> = ({x, y1, y2, color, p = 1, w = 2}) => (
  <line x1={x} x2={x} y1={y1} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={w} strokeDasharray="6 5" />);

// A schematic bell curve (no numbers): middle shaded, both tails marked. cx, base y, half width hw, height ht, cut at +-z.
export const Bell: React.FC<{cx: number; y: number; hw: number; ht: number; z: number; p: number}> = ({cx, y, hw, ht, z, p}) => {
  const xs = Array.from({length: 121}, (_, i) => -3.6 + i * 0.06);
  const X = (u: number) => cx + u / 3.6 * hw, Y = (u: number) => y - ht * Math.exp(-u * u / 2);
  const path = (a: number, b: number) => { const pts = xs.filter(u => u >= a - 1e-9 && u <= b + 1e-9);
    return `M${X(pts[0])},${y} ` + pts.map(u => `L${X(u)},${Y(u)}`).join(' ') + ` L${X(pts[pts.length - 1])},${y} Z`; };
  return (<g fontFamily={inter}>
    <path d={path(-z, z)} fill={P.blue} opacity={0.18 * p} />
    <path d={path(-3.6, -z)} fill={P.red} opacity={0.55 * p} />
    <path d={path(z, 3.6)} fill={P.red} opacity={0.55 * p} />
    <path d={'M' + xs.map(u => `${X(u)},${Y(u)}`).join(' L')} fill="none" stroke={P.ink} strokeWidth={2.5} />
    <line x1={cx - hw} x2={cx + hw} y1={y} y2={y} stroke={P.faint} strokeWidth={1.5} />
  </g>);
};

// The board shows a visual whenever viz/<method>.tsx exists (a null return leaves the panel blank), so these
// redraw the data table and the hypotheses inside the panel for the question and hypotheses steps.
import katex from 'katex';
const tex = (s: string) => katex.renderToString(s, {throwOnError: false, strict: false});
export const DataTable: React.FC<{c: any; w: number; h: number}> = ({c, w, h}) => {
  if (!c.table) return null;
  const cell = {border: `1px solid ${P.line}`, padding: '6px 10px', whiteSpace: 'nowrap' as const};
  return (<foreignObject x={12} y={12} width={w - 24} height={h - 24}>
    <table style={{borderCollapse: 'collapse', fontFamily: inter, fontSize: 16, color: P.ink, background: P.panel}}>
      <thead><tr>{c.table.headers.map((x: string, i: number) => <th key={i} style={{...cell, background: '#eef2fb', fontWeight: 600, whiteSpace: 'normal'}}>{x}</th>)}</tr></thead>
      <tbody>{c.table.rows.map((r: any[], i: number) => <tr key={i}>{r.map((x, j) => <td key={j} style={{...cell, textAlign: typeof x === 'number' ? 'right' : 'left', fontVariantNumeric: 'tabular-nums'}}>{String(x)}</td>)}</tr>)}</tbody>
    </table></foreignObject>);
};
export const Hyps: React.FC<{c: any; w: number; h: number}> = ({c, w, h}) => {
  const hy = c.hypotheses; if (!hy) return null;
  const row = (sym: string, words: string, color: string) => (<div style={{marginBottom: 20}}>
    <div style={{fontSize: 24, color}} dangerouslySetInnerHTML={{__html: tex(sym)}} />
    <div style={{fontSize: 16, color: P.soft, marginTop: 6, lineHeight: 1.4}}>{words}</div></div>);
  return (<foreignObject x={16} y={16} width={w - 32} height={h - 32}>
    <div style={{fontFamily: inter}}>{row(hy.null, hy.nullWords, P.blue)}{row(hy.alternative, hy.alternativeWords, P.red)}</div></foreignObject>);
};
