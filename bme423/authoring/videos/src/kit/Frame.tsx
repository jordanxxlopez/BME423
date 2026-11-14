import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {C, Z, FPS, mono, sans} from './theme';

export type Step = {
  title: string;            // short step name, shown in the numbered badge
  seconds: number;          // how long the step stays on screen
  caption: string;          // plain sentence(s); wrap key words in **double stars** to highlight
  card?: CardItem[];        // rows added to the right-hand card during this step
};
export type CardItem = {label?: string; tex?: string; value?: string; color?: string; note?: string};

export type Timeline = {starts: number[]; ends: number[]; total: number};
export const timeline = (steps: Step[]): Timeline => {
  const starts: number[] = [], ends: number[] = []; let t = 0;
  for (const s of steps) { starts.push(t); t += Math.round(s.seconds * FPS); ends.push(t); }
  return {starts, ends, total: t};
};
export const stepAt = (tl: Timeline, f: number) => Math.max(0, tl.starts.findIndex((s, i) => f >= s && f < tl.ends[i]) === -1 ? tl.starts.length - 1 : tl.starts.findIndex((s, i) => f >= s && f < tl.ends[i]));
// 0..1 progress of step i at frame f (eased), over its first `over` seconds.
export const prog = (tl: Timeline, f: number, i: number, over = 1.2) =>
  interpolate(f, [tl.starts[i], tl.starts[i] + over * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
export const after = (tl: Timeline, f: number, i: number) => f >= tl.starts[i];

export const Tex: React.FC<{tex: string; size?: number; color?: string; display?: boolean}> = ({tex, size = 22, color = C.ink, display = false}) => (
  <span style={{fontSize: size, color}} dangerouslySetInnerHTML={{__html: katex.renderToString(tex, {displayMode: display, throwOnError: true})}} />
);

const Highlight: React.FC<{text: string}> = ({text}) => (
  <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**')
    ? <span key={i} style={{color: C.signal, fontWeight: 700}}>{part.slice(2, -2)}</span>
    : <span key={i}>{part}</span>)}</>
);

export const Frame: React.FC<{title: string; session: number; steps: Step[]; children: (f: number, step: number, tl: Timeline) => React.ReactNode}> = ({title, session, steps, children}) => {
  const f = useCurrentFrame(); const tl = timeline(steps); const i = stepAt(tl, f);
  const fadeIn = interpolate(f, [tl.starts[i], tl.starts[i] + 10], [0, 1], {extrapolateRight: 'clamp'});
  const cardRows = steps.slice(0, i + 1).flatMap((s, k) => (s.card || []).map((row, r) => ({row, k, r})));
  return (
    <AbsoluteFill style={{background: `radial-gradient(1200px 700px at 30% 20%, ${C.bg2}, ${C.bg})`, fontFamily: mono, color: C.ink}}>
      {/* title band */}
      <div style={{position: 'absolute', left: Z.title.x, top: Z.title.y, width: Z.title.w, height: Z.title.h, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: C.signal, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>{title}</div>
        <div style={{fontSize: 14, color: C.muted, letterSpacing: 2}}>BME423 · SESSION {session}</div>
      </div>
      {/* step badge (top-left of stage) */}
      <div style={{position: 'absolute', left: Z.stage.x, top: Z.stage.y - 6, display: 'flex', alignItems: 'center', gap: 10, opacity: fadeIn, zIndex: 3}}>
        <div style={{width: 30, height: 30, borderRadius: 15, background: C.signal, color: C.bg, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
        <div style={{fontSize: 16, letterSpacing: 1.5, textTransform: 'uppercase', color: C.ink, background: C.bg, padding: '2px 8px', borderRadius: 6, border: `1px solid ${C.line}`}}>{steps[i].title}</div>
        <div style={{fontSize: 13, color: C.muted}}>step {i + 1} of {steps.length}</div>
      </div>
      {/* stage: only the plot draws here */}
      <div style={{position: 'absolute', left: Z.stage.x, top: Z.stage.y + 36, width: Z.stage.w, height: Z.stage.h - 36, overflow: 'hidden'}}>
        <svg width={Z.stage.w} height={Z.stage.h - 36} style={{overflow: 'hidden'}}>{children(f, i, tl)}</svg>
      </div>
      {/* idea card: accumulates rows, newest at the bottom, older rows dim */}
      <div style={{position: 'absolute', left: Z.card.x, top: Z.card.y, width: Z.card.w, height: Z.card.h, border: `1px solid ${C.line}`, borderRadius: 14, background: 'rgba(18,26,44,0.85)', padding: '14px 18px', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10}}>
        {cardRows.slice(-3).map(({row, k}, n, arr) => {
          const fresh = k === i; const a = fresh ? fadeIn : 0.55;
          return (
            <div key={`${k}-${n}`} style={{opacity: a, borderTop: n ? `1px solid ${C.line}` : 'none', paddingTop: n ? 8 : 0}}>
              {row.label && <div style={{fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: row.color || C.muted}}>{row.label}</div>}
              {row.tex && <div style={{marginTop: 4}}><Tex tex={row.tex} size={21} /></div>}
              {row.value && <div style={{fontSize: 19, color: row.color || C.ink, marginTop: 4, fontWeight: 700}}>{row.value}</div>}
              {row.note && <div style={{fontSize: 14, color: C.muted, marginTop: 4, lineHeight: 1.35, whiteSpace: 'pre-line'}}>{row.note}</div>}
            </div>);
        })}
      </div>
      {/* caption band */}
      <div style={{position: 'absolute', left: Z.caption.x, top: Z.caption.y, width: Z.caption.w, height: Z.caption.h, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 23, lineHeight: 1.4, opacity: fadeIn, borderTop: `1px solid ${C.line}`}}>
        <div style={{maxWidth: 1120}}><Highlight text={steps[i].caption} /></div>
      </div>
    </AbsoluteFill>
  );
};
