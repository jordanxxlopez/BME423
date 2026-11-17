import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog} from '../kit/Frame';
import {lerp, Glow, Label} from '../kit/plot';

// Session 23 pages 17 (K = 21, min-max), 20 (K = 1 and K = 27), 21–22 (confusion matrix, accuracy, error rate,
// rare-variant limitation). Cases "s23-wbcd-k21-accuracy" and "s23-rare-variant". Malignant / defect is the positive class.
type M4 = {TN: number; FP: number; FN: number; TP: number};
const k21: M4 = {TN: 61, FP: 0, FN: 2, TP: 37};
const k1: M4 = {TN: 58, FP: 3, FN: 1, TP: 38};
const k27: M4 = {TN: 61, FP: 0, FN: 4, TP: 35};
const rare: M4 = {TN: 99990, FP: 0, FN: 10, TP: 0};
const tot = (m: M4) => m.TN + m.FP + m.FN + m.TP;
const acc = (m: M4) => (m.TP + m.TN) / tot(m);
const sens = (m: M4) => m.TP / (m.TP + m.FN);
const spec = (m: M4) => m.TN / (m.TN + m.FP);
const f5 = (v: number) => String(+v.toFixed(5));
const n0 = (v: number) => v.toLocaleString('en-US');
const GOOD = C.green, BAD = C.red;

export const meta = {
  id: 's23-s23confusion', session: 23, method: 's23confusion',
  cases: {'s23-wbcd-k21-accuracy': [2, 3, 4, 5], 's23-rare-variant': [7, 8, 9, 10]},
  title: 'Confusion matrix · accuracy and error rate',
  steps: [
    {title: 'Four cells', seconds: 7, card: [{label: 'rows actual · columns predicted', note: 'no / no → TN · no / yes → FP\nyes / no → FN · yes / yes → TP'}],
      caption: 'Rows are the **actual** classes and columns the **predicted** ones, so correct predictions sit on the diagonal.'},
    {title: 'K = 21 test set', seconds: 8, card: [{label: 'positive = Malignant', value: `TN ${k21.TN} · FP ${k21.FP} · FN ${k21.FN} · TP ${k21.TP}`, color: C.signal}],
      caption: 'The 100 test samples fall into the four cells. Two malignant samples were predicted benign, so **FN = 2**.'},
    {title: 'Accuracy', seconds: 7, card: [{label: 'accuracy', tex: '\\text{accuracy}=\\frac{TP+TN}{TP+TN+FP+FN}', value: `(37 + 61) / 100 = ${acc(k21)}`, color: GOOD}],
      caption: `The two diagonal cells are the correct predictions, so the accuracy is 98 of 100, or **${acc(k21)}**.`},
    {title: 'Error rate', seconds: 7, card: [{label: 'error rate', tex: '\\text{error rate}=\\frac{FP+FN}{TP+TN+FP+FN}', value: `(0 + 2) / 100 = ${+(1 - acc(k21)).toFixed(2)}`, color: BAD}],
      caption: 'The two off-diagonal cells are the errors, so the error rate is **0.02**. Accuracy and error rate add to 1.'},
    {title: 'Each row', seconds: 8, card: [{label: 'row by row', value: `sens 37/39 = ${f5(sens(k21))}`, color: C.signal, note: 'spec 61/61 = 1'}],
      caption: 'Within the malignant row 37 of 39 are caught, a sensitivity of **0.94872**. All 61 benign are correct, so specificity is 1.'},
    {title: 'Other values of K', seconds: 9, card: [{label: 'min-max scaling, three K', note: `K = 1  accuracy ${acc(k1)} (3 FP, 1 FN)\nK = 21 accuracy ${acc(k21)} (0 FP, 2 FN)\nK = 27 accuracy ${acc(k27)} (0 FP, 4 FN)`}],
      caption: 'K = 1 and K = 27 both reach **0.96**, but with different errors. Changing K moves the errors between the classes.'},
    {title: 'Rare variant', seconds: 8, card: [{label: 'correct in 99,990 of 100,000', value: 'accuracy 0.9999 · error 0.0001', color: GOOD}],
      caption: 'A newborn classifier is correct in 99,990 of 100,000 cases, so its accuracy is **99.99%** and its error rate 0.01%.'},
    {title: 'Always say no', seconds: 7, card: [{label: 'defect in 10 of 100,000', value: `TN ${n0(rare.TN)} · FN ${rare.FN} · TP 0`, color: C.signal}],
      caption: 'A test that always predicts **no defect** puts every baby in the left column, so the 10 defects become false negatives.'},
    {title: 'Same accuracy', seconds: 7, card: [{label: 'accuracy of the always-no test', value: `(0 + 99,990) / 100,000 = ${acc(rare)}`, color: GOOD}],
      caption: 'The useless test still scores **99.99%** accuracy, because nearly every baby truly has no defect.'},
    {title: 'Misses every defect', seconds: 8, card: [{label: 'sensitivity', tex: '\\text{sensitivity}=\\frac{TP}{TP+FN}', value: '0 / (0 + 10) = 0', color: BAD}],
      caption: 'It finds **none of the 10** defects, so its sensitivity is 0. Accuracy alone is misleading when one class is rare.'},
  ] as Step[],
};

// One 2x2 matrix. dots: draw one dot per case (small counts) or the number (large counts).
const Matrix: React.FC<{m: M4; x: number; y: number; cw: number; ch: number; neg: string; pos: string; show: number; hi: (cell: keyof M4) => number; names: number; dots: boolean; fly?: number}> =
  ({m, x, y, cw, ch, neg, pos, show, hi, names, dots, fly = 1}) => {
  const cells: {key: keyof M4; r: number; c: number}[] = [{key: 'TN', r: 0, c: 0}, {key: 'FP', r: 0, c: 1}, {key: 'FN', r: 1, c: 0}, {key: 'TP', r: 1, c: 1}];
  const g = 12;
  return (<g>
    <Label x={x + cw + g / 2} y={y - 44} text="predicted" color={C.muted} anchor="middle" size={14} />
    <Label x={x + cw / 2} y={y - 16} text={neg} color={C.ink} anchor="middle" weight={700} size={15} />
    <Label x={x + cw * 1.5 + g} y={y - 16} text={pos} color={C.ink} anchor="middle" weight={700} size={15} />
    <text transform={`translate(${x - 150},${y + ch + g / 2}) rotate(-90)`} fill={C.muted} fontSize={14} textAnchor="middle">actual</text>
    <Label x={x - 14} y={y + ch / 2 + 5} text={neg} color={C.ink} anchor="end" weight={700} size={15} />
    <Label x={x - 14} y={y + ch * 1.5 + g + 5} text={pos} color={C.ink} anchor="end" weight={700} size={15} />
    {cells.map(({key, r, c}) => { const cx = x + c * (cw + g), cy = y + r * (ch + g); const ok = key === 'TN' || key === 'TP'; const col = ok ? GOOD : BAD; const h = hi(key);
      const n = m[key];
      return (<g key={key} opacity={1 - 0.7 * (1 - h)}>
        <rect x={cx} y={cy} width={cw} height={ch} rx={10} fill="rgba(255,255,255,0.03)" stroke={h > 0.5 && h < 1.5 ? C.line : C.line} strokeWidth={1.5} />
        {dots ? Array.from({length: n}, (_, j) => { const per = 11, sp = Math.min(15, (cw - 24) / per);
          const tx = cx + 16 + (j % per) * sp, ty = cy + 16 + Math.floor(j / per) * sp; const a = Math.min(1, Math.max(0, fly * 2.5 - j / 66));
          return <circle key={j} cx={lerp(cx + cw / 2, tx, a)} cy={lerp(y - 70, ty, a)} r={4.5} fill={col} opacity={show * a} />; })
          : <Label x={cx + cw / 2} y={cy + ch / 2 + 6} text={n0(n)} color={col} anchor="middle" weight={700} size={22} opacity={show} />}
        <Label x={cx + cw - 12} y={cy + ch - 12} text={dots ? `${key} = ${n}` : key} color={col} anchor="end" weight={700} size={15} opacity={names} />
      </g>); })}
  </g>);
};

const S23Confusion: React.FC = () => (
  <Frame title={meta.title} session={23} steps={meta.steps}>
    {(f, i, tl) => {
      const x = 210, y = 70, cw = 200, ch = 140;
      const all = () => 1;
      /* step 1: the four named cells */
      if (i === 0) {
        const p = prog(tl, f, 0, 1.4);
        const names: [string, string, number, number, string][] = [['TN', 'true negative', 0, 0, GOOD], ['FP', 'false positive', 0, 1, BAD], ['FN', 'false negative', 1, 0, BAD], ['TP', 'true positive', 1, 1, GOOD]];
        return (<g opacity={p}>
          <Matrix m={{TN: 0, FP: 0, FN: 0, TP: 0}} x={x} y={y} cw={cw} ch={ch} neg="no" pos="yes" show={0} hi={all} names={0} dots={false} />
          {names.map(([k, full, r, c, col], j) => { const cx = x + c * (cw + 12) + cw / 2, cy = y + r * (ch + 12) + ch / 2; const a = prog(tl, f, 0, 1.4 + j * 0.5);
            return (<g key={k} opacity={a}>
              <circle cx={cx} cy={cy - 12} r={30} fill="none" stroke={col} strokeWidth={2.5} />
              <Label x={cx} y={cy - 5} text={k} color={col} anchor="middle" weight={700} size={20} />
              <Label x={cx} y={cy + 44} text={full} color={C.muted} anchor="middle" size={14} />
            </g>); })}
        </g>);
      }
      /* steps 2–5: K = 21 test set */
      if (i >= 1 && i <= 4) {
        const fly = i === 1 ? prog(tl, f, 1, 2.6) : 1; const names = i === 1 ? prog(tl, f, 1, 4) : 1;
        const pA = i === 2 ? prog(tl, f, 2, 1.2) : 0, pE = i === 3 ? prog(tl, f, 3, 1.2) : 0, pR = i === 4 ? prog(tl, f, 4, 1.2) : 0, pR2 = i === 4 ? prog(tl, f, 4, 3) : 0;
        const hi = (k: keyof M4) => { if (i === 2) return k === 'TN' || k === 'TP' ? 1 : 1 - pA; if (i === 3) return k === 'FP' || k === 'FN' ? 1 : 1 - pE;
          if (i === 4) return k === 'FN' || k === 'TP' ? 1 : 1 - pR + pR2; return 1; };
        const rx = x + 2 * cw + 12 + 18;
        return (<g>
          <Matrix m={k21} x={x} y={y} cw={cw} ch={ch} neg="Benign" pos="Malignant" show={1} hi={hi} names={names} dots fly={fly} />
          {i === 2 && <g opacity={pA}><Label x={rx} y={y + ch + 6} text="98 / 100" color={GOOD} weight={700} size={16} /><Label x={rx} y={y + ch + 32} text="= 0.98" color={GOOD} weight={700} size={16} /></g>}
          {i === 3 && <g opacity={pE}><Label x={rx} y={y + ch + 6} text="2 / 100" color={BAD} weight={700} size={16} /><Label x={rx} y={y + ch + 32} text="= 0.02" color={BAD} weight={700} size={16} /></g>}
          {i === 4 && <g>
            <g opacity={pR}><Label x={rx} y={y + ch * 1.5 + 6} text="37 / 39" color={C.signal} weight={700} size={16} /><Label x={rx} y={y + ch * 1.5 + 30} text={`= ${f5(sens(k21))}`} color={C.signal} weight={700} size={15} /></g>
            <g opacity={pR2}><Label x={rx} y={y + ch / 2 + 6} text="61 / 61" color={C.signal} weight={700} size={16} /><Label x={rx} y={y + ch / 2 + 30} text="= 1" color={C.signal} weight={700} size={15} /></g>
          </g>}
        </g>);
      }
      /* step 6: K = 1, 21, 27 side by side (page 20) */
      if (i === 5) {
        const ms: [string, M4][] = [['K = 1', k1], ['K = 21', k21], ['K = 27', k27]];
        return (<g>
          {ms.map(([lab, m], j) => { const a = prog(tl, f, 5, 0.8 + j * 0.8); const mx = 110 + j * 238, my = 110, w = 84, h = 70;
            const cells: [keyof M4, number, number][] = [['TN', 0, 0], ['FP', 0, 1], ['FN', 1, 0], ['TP', 1, 1]];
            return (<g key={j} opacity={a}>
              <Label x={mx + w + 4} y={60} text={lab} color={j === 1 ? C.signal : C.ink} anchor="middle" weight={700} size={17} />
              {j === 0 && <><Label x={mx - 10} y={my + h / 2 + 5} text="B" color={C.muted} anchor="end" size={14} /><Label x={mx - 10} y={my + h * 1.5 + 13} text="M" color={C.muted} anchor="end" size={14} /></>}
              <Label x={mx + w / 2} y={my - 10} text="B" color={C.muted} anchor="middle" size={14} /><Label x={mx + w * 1.5 + 8} y={my - 10} text="M" color={C.muted} anchor="middle" size={14} />
              {cells.map(([k, r, c]) => { const ok = k === 'TN' || k === 'TP'; return (<g key={k}>
                <rect x={mx + c * (w + 8)} y={my + r * (h + 8)} width={w} height={h} rx={8} fill="rgba(255,255,255,0.03)" stroke={C.line} strokeWidth={1.5} />
                <Label x={mx + c * (w + 8) + w / 2} y={my + r * (h + 8) + h / 2 + 7} text={String(m[k])} color={ok ? GOOD : m[k] ? BAD : C.muted} anchor="middle" weight={700} size={20} /></g>); })}
              <Label x={mx + w + 4} y={my + 2 * h + 50} text={`accuracy ${acc(m)}`} color={j === 1 ? C.signal : C.ink} anchor="middle" weight={700} size={15} />
              <Label x={mx + w + 4} y={my + 2 * h + 76} text={`${m.FP} FP · ${m.FN} FN`} color={BAD} anchor="middle" size={14} />
            </g>); })}
        </g>);
      }
      /* step 7: 99,990 of 100,000 correct */
      if (i === 6) {
        const p = prog(tl, f, 6, 1.6), z = prog(tl, f, 6, 3.4); const bx0 = 60, bx1 = 700, by = 110;
        const wrongW = (bx1 - bx0) * 10 / 100000;
        return (<g>
          <Label x={bx0} y={by - 20} text="100,000 newborns" color={C.muted} size={15} />
          <rect x={bx0} y={by} width={(bx1 - bx0) * p} height={40} rx={4} fill={GOOD} opacity={0.8} />
          <rect x={bx1 - Math.max(wrongW, 2)} y={by} width={Math.max(wrongW, 2)} height={40} fill={BAD} opacity={p} />
          <Label x={bx0} y={by + 66} text="99,990 correct" color={GOOD} weight={700} size={16} opacity={p} />
          <Label x={bx1} y={by + 66} text="10 wrong" color={BAD} anchor="end" weight={700} size={16} opacity={p} />
          <g opacity={z}>
            <line x1={bx1 - 1} y1={by + 42} x2={560} y2={230} stroke={BAD} strokeWidth={1.5} strokeDasharray="4 4" />
            <rect x={460} y={230} width={240} height={110} rx={10} fill="none" stroke={BAD} strokeWidth={2} />
            {Array.from({length: 10}, (_, j) => <Glow key={j} cx={490 + (j % 5) * 45} cy={265 + Math.floor(j / 5) * 40} r={8} color={BAD} />)}
            <Label x={580} y={365} text="10 wrong" color={BAD} anchor="middle" weight={700} size={15} />
          </g>
          <Label x={60} y={260} text="accuracy 0.9999" color={GOOD} weight={700} size={18} opacity={z} />
          <Label x={60} y={295} text="error rate 0.0001" color={BAD} weight={700} size={18} opacity={z} />
        </g>);
      }
      /* steps 8–10: the always-no test */
      const fill = i === 7 ? prog(tl, f, 7, 1.6) : 1; const names = i === 7 ? prog(tl, f, 7, 3) : 1;
      const pA = i === 8 ? prog(tl, f, 8, 1.2) : 0, pS = i === 9 ? prog(tl, f, 9, 1.2) : 0;
      const hi = (k: keyof M4) => { if (i === 8) return k === 'TN' || k === 'TP' ? 1 : 1 - pA; if (i === 9) return k === 'FN' || k === 'TP' ? 1 : 1 - pS; return 1; };
      const rx = x + 2 * cw + 30;
      return (<g>
        <Matrix m={rare} x={x} y={y} cw={cw} ch={ch} neg="no defect" pos="defect" show={fill} hi={hi} names={names} dots={false} />
        {i === 7 && <rect x={x + cw + 12} y={y} width={cw} height={2 * ch + 12} rx={10} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" opacity={prog(tl, f, 7, 3.6)} />}
        {i === 7 && <Label x={x + cw * 1.5 + 12} y={y + 2 * ch + 44} text="never predicted" color={C.muted} anchor="middle" size={14} opacity={prog(tl, f, 7, 3.6)} />}
        {i === 8 && <g opacity={pA}><Label x={rx} y={y + ch + 6} text="99,990 /" color={GOOD} weight={700} size={15} /><Label x={rx} y={y + ch + 28} text="100,000" color={GOOD} weight={700} size={15} /><Label x={rx} y={y + ch + 54} text="= 0.9999" color={GOOD} weight={700} size={16} /></g>}
        {i === 9 && <g opacity={pS}><Label x={rx} y={y + ch * 1.5 + 6} text="0 / 10" color={BAD} weight={700} size={16} /><Label x={rx} y={y + ch * 1.5 + 32} text="= 0" color={BAD} weight={700} size={16} /></g>}
      </g>);
    }}
  </Frame>
);

export default S23Confusion;
