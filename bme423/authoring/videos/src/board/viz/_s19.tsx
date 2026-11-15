// Session 19 helpers (not a visual: files starting with "_" are not registered).
import React from 'react';
import {inter} from '../theme';
// White label drawn on a colored bar (no white halo, so it stays crisp).
export const OnBar: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number}> =
  ({x, y, children, size = 15, anchor = 'middle', opacity = 1}) => (
  <text x={x} y={y} fontFamily={inter} fontSize={size} fill="#ffffff" textAnchor={anchor} fontWeight={700} opacity={opacity}>{children}</text>);
