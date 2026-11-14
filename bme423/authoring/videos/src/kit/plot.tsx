import React from 'react';
import {C, Z, mono} from './theme';

export const SW = Z.stage.w, SH = Z.stage.h - 36; // stage drawing size
export const lin = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + (v - d0) / (d1 - d0) * (r1 - r0);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Seeded random numbers so every render is identical.
export const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
export const normals = (seed: number, n: number) => { const r = rng(seed); const out: number[] = [];
  while (out.length < n) { const u = Math.max(r(), 1e-9), v = r(); out.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)); } return out; };
// Rescale draws to an exact sample mean and SD, so plotted data match the worked numbers.
export const exact = (z: number[], mean: number, sd: number) => { const m = z.reduce((a, b) => a + b, 0) / z.length;
  const s = Math.sqrt(z.reduce((a, b) => a + (b - m) ** 2, 0) / (z.length - 1)); return z.map(v => mean + sd * (v - m) / s); };

export const AxisX: React.FC<{x: (v: number) => number; y: number; ticks: number[]; label?: string; fmt?: (v: number) => string; opacity?: number}> = ({x, y, ticks, label, fmt = v => String(v), opacity = 1}) => (
  <g opacity={opacity} fontFamily={mono}>
    <line x1={x(ticks[0])} x2={x(ticks[ticks.length - 1])} y1={y} y2={y} stroke={C.muted} strokeWidth={1.5} />
    {ticks.map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={y} y2={y + 6} stroke={C.muted} /><text x={x(t)} y={y + 22} fill={C.muted} fontSize={14} textAnchor="middle">{fmt(t)}</text></g>)}
    {label && <text x={(x(ticks[0]) + x(ticks[ticks.length - 1])) / 2} y={y + 44} fill={C.muted} fontSize={15} textAnchor="middle">{label}</text>}
  </g>
);

export const Glow: React.FC<{cx: number; cy: number; r?: number; color: string; opacity?: number}> = ({cx, cy, r = 6, color, opacity = 1}) => (
  <g opacity={opacity}><circle cx={cx} cy={cy} r={r * 2.2} fill={color} opacity={0.18} /><circle cx={cx} cy={cy} r={r} fill={color} /></g>
);

export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; color: string; w?: number; opacity?: number}> = ({x1, y1, x2, y2, color, w = 3, opacity = 1}) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 11; const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return null;
  return (<g opacity={opacity}><line x1={x1} y1={y1} x2={x2 - Math.cos(a) * h * 0.6} y2={y2 - Math.sin(a) * h * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" />
    <polygon points={`${x2},${y2} ${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} ${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`} fill={color} /></g>);
};

// A text label inside the stage. Keep these short (numbers, group names); sentences go in the caption.
export const Label: React.FC<{x: number; y: number; text: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number; weight?: number}> = ({x, y, text, color = C.ink, size = 15, anchor = 'start', opacity = 1, weight = 400}) => (
  <text x={x} y={y} fill={color} fontSize={size} fontFamily={mono} textAnchor={anchor} opacity={opacity} fontWeight={weight} style={{paintOrder: 'stroke', stroke: C.bg, strokeWidth: 4}}>{text}</text>
);

export const curvePath = (xs: number[], fx: (v: number) => number, x: (v: number) => number, y: (v: number) => number) =>
  xs.map((v, i) => `${i ? 'L' : 'M'}${x(v).toFixed(1)},${y(fx(v)).toFixed(1)}`).join(' ');
export const range = (a: number, b: number, n: number) => Array.from({length: n}, (_, i) => a + (b - a) * i / (n - 1));
export const normPdf = (v: number, m: number, s: number) => Math.exp(-0.5 * ((v - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
