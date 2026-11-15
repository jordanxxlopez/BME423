// Small helpers for board panel visuals (light theme). Files starting with "_" are not registered as visuals.
import React from 'react';
import {P, inter} from '../theme';

export const lin = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + (v - d0) / (d1 - d0) * (r1 - r0);
// 0..1 eased progress between a and b seconds into the step.
export const ramp = (t: number, a: number, b: number) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
// About n round tick values covering [lo, hi].
export const nice = (lo: number, hi: number, n = 5) => { const raw = (hi - lo) / n; const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw) || raw; const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10)); return out; };

export const Txt: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; opacity?: number}> =
  ({x, y, children, size = 14, color = P.ink, anchor = 'start', weight = 400, opacity = 1}) => (
  <text x={x} y={y} fontFamily={inter} fontSize={size} fill={color} textAnchor={anchor} fontWeight={weight} opacity={opacity}
    style={{paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 4, strokeLinejoin: 'round'}}>{children}</text>);

export const Dot: React.FC<{x: number; y: number; r?: number; color: string; opacity?: number; ring?: boolean}> = ({x, y, r = 6, color, opacity = 1, ring = false}) => (
  <g opacity={opacity}><circle cx={x} cy={y} r={r} fill={ring ? '#fff' : color} stroke={color} strokeWidth={ring ? 2.5 : 0} /></g>);

export const Axis: React.FC<{X: (v: number) => number; y: number; ticks: number[]; label?: string; fmt?: (v: number) => string}> = ({X, y, ticks, label, fmt = v => String(v)}) => (
  <g fontFamily={inter}>
    <line x1={X(ticks[0])} x2={X(ticks[ticks.length - 1])} y1={y} y2={y} stroke={P.faint} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={X(t)} x2={X(t)} y1={y} y2={y + 5} stroke={P.faint} /><text x={X(t)} y={y + 20} fontSize={14} fill={P.soft} textAnchor="middle">{fmt(t)}</text></g>)}
    {label && <text x={(X(ticks[0]) + X(ticks[ticks.length - 1])) / 2} y={y + 40} fontSize={13} fill={P.soft} textAnchor="middle">{label}</text>}
  </g>);

export const AxisY: React.FC<{Y: (v: number) => number; x: number; ticks: number[]; label?: string; fmt?: (v: number) => string}> = ({Y, x, ticks, label, fmt = v => String(v)}) => (
  <g fontFamily={inter}>
    <line x1={x} x2={x} y1={Y(ticks[0])} y2={Y(ticks[ticks.length - 1])} stroke={P.faint} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x - 5} x2={x} y1={Y(t)} y2={Y(t)} stroke={P.faint} /><text x={x - 8} y={Y(t) + 4} fontSize={14} fill={P.soft} textAnchor="end">{fmt(t)}</text></g>)}
    {label && <text x={x - 34} y={(Y(ticks[0]) + Y(ticks[ticks.length - 1])) / 2} fontSize={13} fill={P.soft} textAnchor="middle" transform={`rotate(-90 ${x - 34} ${(Y(ticks[0]) + Y(ticks[ticks.length - 1])) / 2})`}>{label}</text>}
  </g>);

// An interval end drawn as a bracket that drops in, with its value under it.
export const Bracket: React.FC<{x: number; y: number; p: number; color: string; label: string; side: 'left' | 'right'}> = ({x, y, p, color, label, side}) => {
  const d = side === 'left' ? 8 : -8;
  return (<g opacity={p} transform={`translate(0 ${(1 - p) * -20})`}>
    <path d={`M${x + d},${y - 16} L${x},${y - 16} L${x},${y + 16} L${x + d},${y + 16}`} fill="none" stroke={color} strokeWidth={3} />
    <Txt x={x} y={y + 40} size={15} anchor={side === 'left' ? 'end' : 'start'} color={color} weight={700}>{label}</Txt></g>);
};

// Grows a line from (x1,y1) to (x2,y2) as p goes 0..1.
export const Grow: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color: string; w?: number; dash?: string}> = ({x1, y1, x2, y2, p, color, w = 3, dash}) => (
  <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" />);
