import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing, delayRender, continueRender} from 'remotion';
import {P, BZ, inter, hand, BFPS as FPS} from './theme';
import {BCase, stepSeconds, frames, generalAt, workAt} from './timing';
import TABLES from './tables.json';

declare const require: any;
// Caption rewrites (plain wording, no file or lecture references) live in captions/s<session>.json.
const capCtx = require.context('./captions', false, /\.json$/);
const CAPS: Record<string, Record<string, string>> = Object.assign({}, ...capCtx.keys().map((k: string) => capCtx(k)));
// Optional method visuals: viz/<methodId>.tsx exporting default Viz.
const vizCtx = require.context('./viz', false, /^\.\/[A-Za-z]\w*\.tsx$/);
export const VIZ: Record<string, VizC> = Object.fromEntries(vizCtx.keys().map((k: string) => [k.replace(/^\.\/|\.tsx$/g, ''), vizCtx(k).default]));
// k = -1 for the question, 0..n-1 for worked steps, n for the conclusion. t = seconds into the step.
export type VizC = React.FC<{c: BCase; k: number; t: number; w: number; h: number}>;

const TABLE_NAMES: Record<string, string> = {
  't_table.pdf': 'Class t table (two-tailed)', 'F_table.pdf': 'Class F table (lightface 0.05)',
  'Chi_Squared_Table1.pdf': 'Class chi-square table 1', 'Chi_Squared_Table2.pdf': 'Class chi-square table 2'};
export const lookupKey = (l: any) => [String(l.path).split('/').pop(), l.page, l.row, l.column].join('|');
export const capFor = (c: BCase) => (k: string) => {
  const o = CAPS[c.id] || {};
  if (o[k] !== undefined) return o[k];
  if (k === 'intro') return c.context;
  if (k === 'end') return c.conclusion;
  return c.steps[Number(k)].words;
};
export const boardMeta = (c: BCase) => {
  const cap = capFor(c); const secs = stepSeconds(c, cap);
  const titles = ['The question', ...c.steps.map(s => s.title), 'Conclusion'];
  return {id: `b-${c.id}`, session: c.session, method: c.topic, title: c.title, case: c.id,
    cases: {[c.id]: c.steps.map((_, k) => k + 2)},
    steps: titles.map((title, k) => ({title, seconds: secs[k]}))};
};

const tex = (s: string, display = false) => katex.renderToString(s, {displayMode: display, throwOnError: false, strict: false});
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});

// Scales its content down (never up) so it always fits the box.
export const Fit: React.FC<{w: number; h: number; children: React.ReactNode; max?: number; center?: boolean}> = ({w, h, children, max = 1, center = false}) => {
  const ref = useRef<HTMLDivElement>(null); const [s, setS] = useState(1);
  useLayoutEffect(() => { const el = ref.current; if (!el) return; const k = Math.min(max, w / el.scrollWidth, h / el.scrollHeight); if (Math.abs(k - s) > 0.004) setS(k); });
  return (<div style={{width: w, height: h, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: center ? 'center' : 'flex-start', justifyContent: center ? 'center' : 'flex-start'}}>
    <div ref={ref} style={{transform: `scale(${s})`, transformOrigin: center ? 'center center' : 'top left', width: 'max-content', flex: 'none'}}>{children}</div></div>);
};

const Highlight: React.FC<{text: string}> = ({text}) => (
  <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**')
    ? <span key={i} style={{background: P.hi, fontWeight: 600, padding: '0 3px', borderRadius: 3}}>{part.slice(2, -2)}</span> : <span key={i}>{part}</span>)}</>
);

// The real class table, cropped around the cell, with the row and column traced to the printed value.
const LookupPanel: React.FC<{l: any; t: number}> = ({l, t}) => {
  const d = (TABLES as any)[lookupKey(l)]; const file = String(l.path).split('/').pop() || '';
  const name = TABLE_NAMES[file] || file; const W = BZ.panel.w - 24, Hmax = 300;
  const row = String(l.row).replace(/ν_d=/, '').replace('infinity', '∞'), col = String(l.column).replace(/ν_n=/, '').replace(/ \(.*\)/, '');
  if (!d) return <div style={{color: P.red}}>missing table crop {lookupKey(l)}</div>;
  const sc = Math.min(W / d.w, Hmax / d.h, 1.15); const iw = d.w * sc, ih = d.h * sc;
  const pc = ease(t * FPS, 0.6 * FPS, 1.6 * FPS), pr = ease(t * FPS, 1.4 * FPS, 2.4 * FPS), po = ease(t * FPS, 2.3 * FPS, 3.0 * FPS);
  const [cx, cy] = d.cell, [lx] = d.label, [, hy] = d.head; const rh = d.rowH * sc, cw = Math.min(d.colW * 0.9, 120) * sc;
  return (<div style={{fontFamily: inter, color: P.ink}}>
    <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 0.4, color: P.blue}}>{name}</div>
    <div style={{fontSize: 14, color: P.soft, marginTop: 2}}>{file.includes('F_') ? `numerator ${col} across the top · denominator ${row} down the side` : `row ${row} · column ${col}`}</div>
    <div style={{position: 'relative', width: iw, height: ih, marginTop: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.12)', border: `1px solid ${P.line}`}}>
      <Img src={staticFile(d.img)} style={{width: iw, height: ih, display: 'block'}} />
      <svg width={iw} height={ih} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={(cx * sc) - cw / 2} y={hy * sc - rh / 2} width={cw} height={Math.max(0, (cy - hy) * sc) * pc + rh} fill="rgba(40,83,200,0.13)" />
        <rect x={lx * sc - 18} y={cy * sc - rh / 2} width={Math.max(0, (cx - lx) * sc) * pr + cw / 2} height={rh} fill="rgba(255,214,51,0.35)" />
        <ellipse cx={cx * sc} cy={cy * sc} rx={cw / 2 + 4} ry={rh / 2 + 3} fill="none" stroke={P.red} strokeWidth={3}
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - po} />
      </svg>
    </div>
    <div style={{marginTop: 12, fontSize: 22, opacity: po}}>
      <span dangerouslySetInnerHTML={{__html: tex(`\\text{printed value}=${l.value}`)}} />
      {l.approximation && <div style={{fontSize: 14, color: P.red, marginTop: 4}}>This row is not printed, so the nearest printed row is used.</div>}
    </div>
  </div>);
};

const DataPanel: React.FC<{c: BCase}> = ({c}) => {
  if (!c.table) return null;
  return (<Fit w={BZ.panel.w - 24} h={BZ.panel.h - 24}>
    <table style={{borderCollapse: 'collapse', fontFamily: inter, fontSize: 17, color: P.ink, background: P.panel}}>
      <thead><tr>{c.table.headers.map((h: string, i: number) => <th key={i} style={{border: `1px solid ${P.line}`, padding: '6px 10px', background: '#eef2fb', fontWeight: 600, whiteSpace: 'nowrap'}}>{h}</th>)}</tr></thead>
      <tbody>{c.table.rows.map((r: any[], i: number) => <tr key={i}>{r.map((v, j) => <td key={j} style={{border: `1px solid ${P.line}`, padding: '5px 10px', textAlign: typeof v === 'number' ? 'right' : 'left', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{String(v)}</td>)}</tr>)}</tbody>
    </table></Fit>);
};

const HypPanel: React.FC<{c: BCase}> = ({c}) => {
  const h = c.hypotheses; if (!h) return null;
  const row = (sym: string, words: string, color: string) => (<div style={{marginBottom: 18}}>
    <div style={{fontSize: 24, color}} dangerouslySetInnerHTML={{__html: tex(sym)}} />
    <div style={{fontSize: 16, color: P.soft, marginTop: 6, lineHeight: 1.4, whiteSpace: 'normal', width: BZ.panel.w - 60}}>{words}</div></div>);
  return (<Fit w={BZ.panel.w - 24} h={BZ.panel.h - 24}><div style={{fontFamily: inter, width: BZ.panel.w - 40}}>
    {row(h.null, h.nullWords, P.blue)}{row(h.alternative, h.alternativeWords, P.red)}</div></Fit>);
};

// KaTeX fonts come from CSS, so wait for them before any frame is captured; otherwise Fit measures fallback glyphs.
const KATEX_FONTS = ['KaTeX_Main', 'KaTeX_Math', 'KaTeX_Size1', 'KaTeX_Size2', 'KaTeX_AMS'].flatMap(f => [`400 20px ${f}`, `italic 400 20px ${f}`, `700 20px ${f}`]);
const useKatexFonts = () => {
  const [handle] = useState(() => delayRender('KaTeX fonts')); const [ready, setReady] = useState(false);
  useEffect(() => { Promise.all(KATEX_FONTS.map(f => document.fonts.load(f).catch(() => null))).then(() => document.fonts.ready)
    .then(() => { setReady(true); continueRender(handle); }); }, [handle]);
  return ready;
};
export const BoardVideo: React.FC<{c: BCase}> = ({c}) => {
  const fontsReady = useKatexFonts();
  const f = useCurrentFrame(); const cap = capFor(c); const secs = stepSeconds(c, cap); const tl = frames(secs);
  const n = c.steps.length; let i = tl.starts.findIndex((s, k) => f >= s && (k === tl.starts.length - 1 || f < tl.starts[k + 1])); if (i < 0) i = 0;
  const t = (f - tl.starts[i]) / FPS; const k = i - 1; const st = k >= 0 && k < n ? c.steps[k] : null;
  const fade = ease(f, tl.starts[i], tl.starts[i] + 10);
  const capText = cap(i === 0 ? 'intro' : i === n + 1 ? 'end' : String(k));
  const capSize = capText.length <= 170 ? 23 : capText.length <= 250 ? 21 : capText.length <= 330 ? 19 : 17;
  const Viz = VIZ[c.topic];
  const vizNode = Viz ? (Viz as any)({c, k, t, w: BZ.panel.w, h: BZ.panel.h}) : null; // called directly so a null result falls back to the table
  let panel: React.ReactNode;
  if (st?.lookup) panel = <LookupPanel l={st.lookup} t={t} />;
  else if (vizNode) panel = <svg width={BZ.panel.w} height={BZ.panel.h} style={{overflow: 'hidden'}}>{vizNode}</svg>;
  else if (st && /hypothes/i.test(st.title) && c.hypotheses) panel = <HypPanel c={c} />;
  else panel = <DataPanel c={c} />;
  const titles = ['The question', ...c.steps.map(s => s.title), 'Conclusion'];
  return (
    <AbsoluteFill style={{background: P.paper, fontFamily: inter, color: P.ink}}>
      <style>{'.katex-display{margin:0!important;text-align:left!important}.katex-display>.katex{text-align:left!important}'}</style>
      {/* notebook grid and margin rule */}
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 33}, (_, x) => <line key={'x' + x} x1={x * 40} x2={x * 40} y1={0} y2={720} stroke={P.grid} strokeWidth={1} />)}
        {Array.from({length: 19}, (_, y) => <line key={'y' + y} x1={0} x2={1280} y1={y * 40} y2={y * 40} stroke={P.grid} strokeWidth={1} />)}
        <line x1={56} x2={56} y1={0} y2={720} stroke={P.margin} strokeWidth={2} />
      </svg>
      {/* header: case title and step dots */}
      <div style={{position: 'absolute', left: BZ.head.x + 30, top: BZ.head.y, width: BZ.head.w - 30, height: BZ.head.h}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <div style={{fontWeight: 700, fontSize: 25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>{c.title}</div>
          <div style={{fontSize: 13, letterSpacing: 2, color: P.soft, whiteSpace: 'nowrap'}}>SESSION {c.session} · WORKED ON THE BOARD</div>
        </div>
        <div style={{display: 'flex', gap: 6, marginTop: 8}}>{titles.map((_, j) => (
          <div key={j} style={{height: 6, flex: 1, borderRadius: 3, background: j < i ? P.blue : j === i ? P.hiSolid : P.line}} />))}</div>
      </div>
      {/* board */}
      <div style={{position: 'absolute', left: BZ.board.x, top: BZ.board.y, width: BZ.board.w, height: BZ.board.h, opacity: fade}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
          <div style={{width: 34, height: 34, borderRadius: 17, border: `2.5px solid ${P.blue}`, color: P.blue, fontFamily: hand, fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          <div style={{fontFamily: hand, fontSize: 30, color: P.blue, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: BZ.board.w - 60}}>{titles[i]}</div>
        </div>
        <Fit key={fontsReady ? 'ready' : 'wait'} w={BZ.board.w} h={BZ.board.h - 60}>
          {i === 0 && <div style={{width: BZ.board.w - 10}}>
            {(c.tasks || []).map((q, j) => <div key={j} style={{display: 'flex', gap: 10, fontSize: 21, lineHeight: 1.45, marginBottom: 14, opacity: ease(f, tl.starts[0] + (0.8 + j * 1.2) * FPS, tl.starts[0] + (1.4 + j * 1.2) * FPS)}}>
              <span style={{fontFamily: hand, color: P.red, fontSize: 24}}>{j + 1}.</span><span dangerouslySetInnerHTML={{__html: q.replace(/\\\((.+?)\\\)/g, (_m, s) => tex(s))}} /></div>)}
          </div>}
          {st && <div style={{fontSize: 27}}>
            <div style={{fontFamily: inter, fontSize: 13, letterSpacing: 2, color: P.faint, marginBottom: 6}}>THE EQUATION</div>
            {st.general.map((g, j) => { const p = ease(t * FPS, generalAt(j) * FPS, (generalAt(j) + 0.8) * FPS);
              return <div key={'g' + j} style={{color: P.soft, margin: '4px 0 8px', clipPath: `inset(-20px ${100 - 100 * p}% -20px -20px)`}} dangerouslySetInnerHTML={{__html: tex(g, true)}} />; })}
            {st.work.length > 0 && <div style={{fontFamily: inter, fontSize: 13, letterSpacing: 2, color: P.faint, margin: '14px 0 6px'}}>WITH THE NUMBERS</div>}
            {st.work.map((w, j) => { const a = workAt(st.general.length, j); const p = ease(t * FPS, a * FPS, (a + 0.9) * FPS);
              const last = j === st.work.length - 1; const hp = last ? ease(t * FPS, (a + 1.0) * FPS, (a + 1.6) * FPS) : 0;
              return <div key={'w' + j} style={{position: 'relative', margin: '4px 0 8px', color: P.ink, clipPath: `inset(-20px ${100 - 100 * p}% -20px -20px)`}}>
                {last && <div style={{position: 'absolute', left: -6, top: 2, bottom: 2, width: `calc(${hp * 100}% + 12px)`, background: P.hi, borderRadius: 4, zIndex: 0}} />}
                <span style={{position: 'relative', zIndex: 1}} dangerouslySetInnerHTML={{__html: tex(w, true)}} /></div>; })}
          </div>}
          {i === n + 1 && <div style={{width: BZ.board.w - 10, fontSize: 24, lineHeight: 1.5}}>
            {c.hypotheses && <div style={{fontSize: 26, marginBottom: 12, color: P.soft}} dangerouslySetInnerHTML={{__html: tex(c.hypotheses.null) + '&nbsp;&nbsp;&nbsp;' + tex(c.hypotheses.alternative)}} />}
            <div style={{position: 'relative', padding: '10px 14px', border: `2.5px solid ${P.green}`, borderRadius: 10, background: 'rgba(31,138,76,0.06)'}} dangerouslySetInnerHTML={{__html: c.conclusion.replace(/\\\((.+?)\\\)/g, (_m, s) => tex(s))}} />
          </div>}
        </Fit>
      </div>
      {/* side panel */}
      <div style={{position: 'absolute', left: BZ.panel.x, top: BZ.panel.y, width: BZ.panel.w, height: BZ.panel.h, background: P.panel, border: `1px solid ${P.line}`, borderRadius: 14, boxShadow: '0 4px 18px rgba(30,30,60,0.08)', padding: 12, boxSizing: 'border-box', overflow: 'hidden', opacity: fade}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', padding: st?.lookup || !vizNode ? 12 : 0, boxSizing: 'border-box'}}>{panel}</div>
      </div>
      {/* caption */}
      <div style={{position: 'absolute', left: BZ.cap.x, top: BZ.cap.y, width: BZ.cap.w, height: BZ.cap.h, display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: `2px solid ${P.line}`, opacity: fade}}>
        <div style={{maxWidth: 1150, textAlign: 'center', fontSize: capSize, lineHeight: 1.4}}><Highlight text={capText} /></div>
      </div>
    </AbsoluteFill>);
};
