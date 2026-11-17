import React from 'react';
import {C} from '../kit/theme';
import {Frame, Step, prog} from '../kit/Frame';
import {lin, lerp, AxisX, Label} from '../kit/plot';

// Session 23 pages 19 and 23 (z-score scaling, K = 21: TN 61, FP 0, FN 5, TP 34), page 17 (min-max, K = 21),
// page 20 (min-max, K = 1 and K = 27) and page 22 (always-no test, 10 defects in 100,000). Case "s23-wbcd-zscore-sens".
type M4 = {TN: number; FP: number; FN: number; TP: number};
const zs: M4 = {TN: 61, FP: 0, FN: 5, TP: 34};
const mm: M4 = {TN: 61, FP: 0, FN: 2, TP: 37};
const k1: M4 = {TN: 58, FP: 3, FN: 1, TP: 38};
const k27: M4 = {TN: 61, FP: 0, FN: 4, TP: 35};
const sens = (m: M4) => m.TP / (m.TP + m.FN);
const spec = (m: M4) => m.TN / (m.TN + m.FP);
const acc = (m: M4) => (m.TP + m.TN) / (m.TN + m.FP + m.FN + m.TP);
const f5 = (v: number) => String(+v.toFixed(5));
const GOOD = C.green, BAD = C.red, SEN = C.signal, SPE = C.noise;

export const meta = {
  id: 's23-s23sensspec', session: 23, method: 's23sensspec',
  cases: {'s23-wbcd-zscore-sens': [2, 3, 4, 5]},
  title: 'Sensitivity and specificity · one row at a time',
  steps: [
    {title: 'Two rates', seconds: 7, card: [{label: 'true positive rate', tex: '\\text{sensitivity}=\\frac{TP}{TP+FN}'}, {label: 'true negative rate', tex: '\\text{specificity}=\\frac{TN}{TN+FP}'}],
      caption: '**Sensitivity** uses only the actual-positive row and **specificity** uses only the actual-negative row.'},
    {title: 'z-score model', seconds: 8, card: [{label: 'z-score scaling, K = 21 · positive = Malignant', value: `TN ${zs.TN} · FP ${zs.FP} · FN ${zs.FN} · TP ${zs.TP}`, color: C.signal}],
      caption: 'With z-score scaling the 100 test samples give TN 61, FP 0, **FN 5** and TP 34.'},
    {title: 'Accuracy', seconds: 7, card: [{label: 'accuracy', tex: '\\text{accuracy}=\\frac{TP+TN}{TP+TN+FP+FN}', value: `(34 + 61) / 100 = ${acc(zs)}`, color: GOOD}],
      caption: 'The accuracy is **0.95**. Min-max scaling gave 0.98, so z-scores do slightly worse on this data set.'},
    {title: 'Sensitivity', seconds: 8, card: [{label: 'malignant row only', value: `34 / (34 + 5) = ${f5(sens(zs))}`, color: SEN}],
      caption: 'Of the 39 malignant samples, 34 are caught, so the sensitivity is **0.87179**. Five cancers are called benign.'},
    {title: 'Specificity', seconds: 7, card: [{label: 'benign row only', value: '61 / (61 + 0) = 1', color: SPE}],
      caption: 'All 61 benign samples are called benign, so the specificity is **1**. No benign sample is called malignant.'},
    {title: 'Min-max versus z-score', seconds: 8, card: [{label: 'K = 21', note: `min-max  sens ${f5(sens(mm))} · spec 1 · FN 2\nz-score  sens ${f5(sens(zs))} · spec 1 · FN 5`}],
      caption: 'Specificity is 1 for both, but sensitivity drops from **0.94872** to 0.87179, so min-max scaling is better here.'},
    {title: 'Always say no', seconds: 8, card: [{label: 'defect in 10 of 100,000', value: 'sens 0/10 = 0 · spec 1', color: BAD, note: 'accuracy 0.9999'}],
      caption: 'A test that always says no has **specificity 1 but sensitivity 0**. Each rate uses one row, so the rare class cannot hide.'},
    {title: 'Trade-off', seconds: 8, card: [{label: 'min-max, changing K', note: `K = 1   sens ${f5(sens(k1))} · spec ${f5(spec(k1))}\nK = 27  sens ${f5(sens(k27))} · spec 1`}],
      caption: 'Raising sensitivity usually lowers specificity. K = 1 catches more cancers but calls **3 benign** samples malignant.'},
  ] as Step[],
};

const Matrix: React.FC<{m: M4; x: number; y: number; cw: number; ch: number; neg: string; pos: string; hi: (k: keyof M4) => number; names: number; fly: number; empty?: boolean}> =
  ({m, x, y, cw, ch, neg, pos, hi, names, fly, empty}) => {
  const cells: {key: keyof M4; r: number; c: number}[] = [{key: 'TN', r: 0, c: 0}, {key: 'FP', r: 0, c: 1}, {key: 'FN', r: 1, c: 0}, {key: 'TP', r: 1, c: 1}];
  const g = 12;
  return (<g>
    <Label x={x + cw + g / 2} y={y - 44} text="predicted" color={C.muted} anchor="middle" size={14} />
    <Label x={x + cw / 2} y={y - 16} text={neg} color={C.ink} anchor="middle" weight={700} size={15} />
    <Label x={x + cw * 1.5 + g} y={y - 16} text={pos} color={C.ink} anchor="middle" weight={700} size={15} />
    <text transform={`translate(${x - 140},${y + ch + g / 2}) rotate(-90)`} fill={C.muted} fontSize={14} textAnchor="middle">actual</text>
    <Label x={x - 14} y={y + ch / 2 + 5} text={neg} color={C.ink} anchor="end" weight={700} size={15} />
    <Label x={x - 14} y={y + ch * 1.5 + g + 5} text={pos} color={C.ink} anchor="end" weight={700} size={15} />
    {cells.map(({key, r, c}) => { const cx = x + c * (cw + g), cy = y + r * (ch + g); const ok = key === 'TN' || key === 'TP'; const col = ok ? GOOD : BAD; const h = hi(key);
      return (<g key={key} opacity={1 - 0.7 * (1 - h)}>
        <rect x={cx} y={cy} width={cw} height={ch} rx={10} fill="rgba(255,255,255,0.03)" stroke={C.line} strokeWidth={1.5} />
        {!empty && Array.from({length: m[key]}, (_, j) => { const per = 11, sp = 15;
          const tx = cx + 16 + (j % per) * sp, ty = cy + 16 + Math.floor(j / per) * sp; const a = Math.min(1, Math.max(0, fly * 2.5 - j / 66));
          return <circle key={j} cx={lerp(cx + cw / 2, tx, a)} cy={lerp(y - 70, ty, a)} r={4.5} fill={col} opacity={a} />; })}
        <Label x={empty ? cx + cw / 2 : cx + cw - 12} y={empty ? cy + ch / 2 + 7 : cy + ch - 12} text={empty ? key : `${key} = ${m[key]}`} color={col} anchor={empty ? 'middle' : 'end'} weight={700} size={empty ? 22 : 15} opacity={names} />
      </g>); })}
  </g>);
};

// Row bracket at the right of a matrix row, with a fraction under the name.
const RowTag: React.FC<{x: number; y: number; h: number; name: string; lines: string[]; color: string; p: number}> = ({x, y, h, name, lines, color, p}) => (
  <g opacity={p}>
    <path d={`M${x},${y + 6} L${x + 10},${y + 6} L${x + 10},${y + h - 6} L${x},${y + h - 6}`} fill="none" stroke={color} strokeWidth={3} />
    <Label x={x + 20} y={y + h / 2 - 12} text={name} color={color} weight={700} size={15} />
    {lines.map((l, k) => <Label key={k} x={x + 20} y={y + h / 2 + 12 + k * 22} text={l} color={color} weight={700} size={15} />)}
  </g>
);

const S23Sensspec: React.FC = () => (
  <Frame title={meta.title} session={23} steps={meta.steps}>
    {(f, i, tl) => {
      const x = 190, y = 70, cw = 200, ch = 140, rx = x + 2 * cw + 12 + 10;
      if (i <= 4) {
        const empty = i === 0; const fly = i === 1 ? prog(tl, f, 1, 2.6) : 1; const names = i === 0 ? prog(tl, f, 0, 1.2) : i === 1 ? prog(tl, f, 1, 4) : 1;
        const pA = i === 2 ? prog(tl, f, 2, 1.2) : 0, pS = i === 3 ? prog(tl, f, 3, 1.2) : 0, pP = i === 4 ? prog(tl, f, 4, 1.2) : 0;
        const hi = (k: keyof M4) => { if (i === 2) return k === 'TN' || k === 'TP' ? 1 : 1 - pA; if (i === 3) return k === 'FN' || k === 'TP' ? 1 : 1 - pS;
          if (i === 4) return k === 'TN' || k === 'FP' ? 1 : 1 - pP; return 1; };
        return (<g>
          <Matrix m={zs} x={x} y={y} cw={cw} ch={ch} neg="Benign" pos="Malignant" hi={hi} names={names} fly={fly} empty={empty} />
          {i === 0 && <g>
            <RowTag x={rx} y={y} h={ch} name="specificity" lines={['TN / (TN + FP)']} color={SPE} p={prog(tl, f, 0, 3.4)} />
            <RowTag x={rx} y={y + ch + 12} h={ch} name="sensitivity" lines={['TP / (TP + FN)']} color={SEN} p={prog(tl, f, 0, 2.4)} />
          </g>}
          {i === 2 && <g opacity={pA}><Label x={rx + 10} y={y + ch + 6} text="95 / 100" color={GOOD} weight={700} size={16} /><Label x={rx + 10} y={y + ch + 32} text="= 0.95" color={GOOD} weight={700} size={16} /></g>}
          {i === 3 && <RowTag x={rx} y={y + ch + 12} h={ch} name="sensitivity" lines={['34 / 39', `= ${f5(sens(zs))}`]} color={SEN} p={pS} />}
          {i === 4 && <RowTag x={rx} y={y} h={ch} name="specificity" lines={['61 / 61', '= 1']} color={SPE} p={pP} />}
        </g>);
      }
      /* steps 6–8: grouped bars of sensitivity and specificity */
      const groups: {name: string; s: number; p: number; hl?: boolean}[] = i === 5 ? [{name: 'min-max', s: sens(mm), p: spec(mm)}, {name: 'z-score', s: sens(zs), p: spec(zs), hl: true}]
        : i === 6 ? [{name: 'always no', s: 0, p: 1}] : [{name: 'K = 1', s: sens(k1), p: spec(k1)}, {name: 'K = 21', s: sens(mm), p: spec(mm)}, {name: 'K = 27', s: sens(k27), p: spec(k27)}];
      const Y = lin(0, 1, 360, 70); const gw = 760 / (groups.length + 1); const bw = 56;
      return (<g>
        <line x1={70} x2={720} y1={Y(0)} y2={Y(0)} stroke={C.muted} strokeWidth={1.5} />
        {[0, 0.25, 0.5, 0.75, 1].map(v => <g key={v}><line x1={64} x2={70} y1={Y(v)} y2={Y(v)} stroke={C.muted} /><Label x={58} y={Y(v) + 5} text={String(v)} color={C.muted} anchor="end" size={13} />
          <line x1={70} x2={720} y1={Y(v)} y2={Y(v)} stroke={C.line} opacity={0.4} /></g>)}
        <rect x={470} y={8} width={14} height={14} fill={SEN} rx={3} /><Label x={490} y={20} text="sensitivity" color={SEN} size={14} weight={700} />
        <rect x={610} y={8} width={14} height={14} fill={SPE} rx={3} /><Label x={630} y={20} text="specificity" color={SPE} size={14} weight={700} />
        {groups.map((g, k) => { const cx = 70 + gw * (k + 1) * 650 / 760; const a = prog(tl, f, i, 0.8 + k * 0.6);
          const bars = [{v: g.s, c: SEN, dx: -bw - 4}, {v: g.p, c: SPE, dx: 4}];
          return (<g key={k}>
            {bars.map((b, j) => <g key={j}>
              <rect x={cx + b.dx} y={Y(b.v * a)} width={bw} height={Math.max(0, Y(0) - Y(b.v * a))} rx={4} fill={b.c} opacity={0.85} />
              <Label x={cx + b.dx + bw / 2} y={Y(b.v * a) - 8} text={f5(b.v)} color={b.c} anchor="middle" size={13} weight={700} opacity={a > 0.95 ? 1 : 0} />
            </g>)}
            <Label x={cx} y={Y(0) + 24} text={g.name} color={g.hl ? C.signal : C.ink} anchor="middle" weight={700} size={15} />
          </g>); })}
      </g>);
    }}
  </Frame>
);

export default S23Sensspec;
