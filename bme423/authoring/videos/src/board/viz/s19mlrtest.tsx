import React from 'react';
import {VizC} from '../Board';
import {P, inter} from '../theme';
import {Txt, ramp, lin, nice} from './_kit';
import {OnBar} from './_s19';

// Testing a multiple regression from R output (cases s19-sbp-summary, s19-walk-refit). The step title picks the visual:
//  degrees of freedom -> the n observations split into intercept, model and residual df
//  F from R squared   -> R² and 1 - R² per df, and F as how many residual pieces fit in the model piece
//  full equation      -> each coefficient with its sign
//  coefficient tests  -> t of every coefficient against the plus-or-minus cutoff band (also the conclusion)
//  intervals          -> each 95% interval on its own scale with zero marked
//  refit              -> full against refit coefficients and R²
//  predict            -> the prediction built term by term from the step's own work line
// Numbers come from c.table (Estimate, Std. Error, t value; R² strings), c.values and the class t lookup value.
const f = (z: number, d = 4) => z.toFixed(d);
const sig = (z: number) => z.toPrecision(3);
const num = (s: any) => { const m = String(s).match(/-?\d+(\.\d+)?(e-?\d+)?/i); return m ? Number(m[0]) : NaN; };

type Coef = {term: string; est: number; se: number; tv: number};

const Viz: VizC = ({c, k, t, w}) => {
  const v = c.values; const n = c.steps.length;
  if (!c.table) return null;
  const K = k === n ? 99 : k; const title = K === 99 ? 'conclusion' : k < 0 ? 'full equation' : c.steps[k].title.toLowerCase();
  const H: string[] = c.table.headers.map((h: any) => String(h)); const rows: any[][] = c.table.rows;
  const hasOut = H[0] === 'Output'; const iT = H.indexOf('Term') >= 0 ? H.indexOf('Term') : 0;
  const iE = H.indexOf('Estimate'), iS = H.indexOf('Std. Error'), iV = H.indexOf('t value');
  const coefs = (re: RegExp): Coef[] => rows.filter(r => (!hasOut || re.test(String(r[0]))) && typeof r[iE] === 'number' && !/intercept/i.test(String(r[iT])))
    .map(r => ({term: String(r[iT]), est: r[iE], se: r[iS], tv: r[iV]}));
  const intercept = (re: RegExp) => { const r = rows.find(r => (!hasOut || re.test(String(r[0]))) && /intercept/i.test(String(r[iT]))); return r ? Number(r[iE]) : NaN; };
  const full = coefs(/summary \(full\)/), refit = coefs(/summary \(refit\)/);
  const r2Of = (re: RegExp) => { const r = rows.find(r => (!hasOut || re.test(String(r[0]))) && r.some(x => /^(Multiple )?R² /.test(String(x))));
    const cell = r ? r.find(x => /^(Multiple )?R² /.test(String(x))) : undefined; return cell ? num(String(cell).replace(/^.*R² /, '')) : NaN; };
  const tLook = c.steps.map(s => s.lookup).find((l: any) => l && /t_table/.test(String(l.path)));
  const tcrit: number = v.tcritical ?? (tLook ? tLook.value : NaN);
  const dfRes = v.dfRes ?? (v.n - v.k - 1);
  const nm = (term: string) => term.replace(/^SBP/, '');

  // ---- degrees of freedom: one square per observation
  if (/degrees of freedom/.test(title)) {
    const per = 10, sz = 30, gap = 6, x0 = (w - (per * sz + (per - 1) * gap)) / 2, y0 = 90;
    const cls = (i: number) => (i === 0 ? 0 : i <= v.k ? 1 : 2); const cols = ['#c9c3b6', P.blue, P.red];
    const pK = ramp(t, 1.4, 2.3), pR = ramp(t, 2.8, 3.8);
    const rowsN = Math.ceil(v.n / per);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>{`${v.n} observations`}</Txt>
      {Array.from({length: v.n}, (_, i) => { const cl = cls(i); const op = cl === 0 ? 1 : cl === 1 ? 0.3 + 0.7 * pK : 0.3 + 0.7 * pR;
        return <rect key={i} x={x0 + (i % per) * (sz + gap)} y={y0 + Math.floor(i / per) * (sz + gap)} width={sz} height={sz} rx={5} fill={cols[cl]} opacity={op} />; })}
      {[{lab: 'intercept', d: 1, col: '#9a9384', p: 1}, {lab: 'df mod = k', d: v.k, col: P.blue, p: pK}, {lab: 'df res = n − k − 1', d: dfRes, col: P.red, p: pR}].map((q, i) => (
        <g key={i} opacity={q.p}>
          <rect x={60} y={y0 + rowsN * (sz + gap) + 30 + i * 40} width={18} height={18} rx={4} fill={q.col} />
          <Txt x={90} y={y0 + rowsN * (sz + gap) + 44 + i * 40} size={15} color={P.ink}>{q.lab}</Txt>
          <Txt x={w - 60} y={y0 + rowsN * (sz + gap) + 44 + i * 40} size={16} anchor="end" weight={700} color={q.col}>{String(q.d)}</Txt>
        </g>))}
    </g>);
  }

  // ---- F from R squared
  if (/from r squared|from r²/.test(title)) {
    const R2: number = v.R2 ?? (v.F * v.k / (v.F * v.k + dfRes)); const mod = R2 / v.k, res = (1 - R2) / dfRes; const F = mod / res;
    const X = lin(0, 1, 40, w - 40); const XM = lin(0, mod, 40, w - 40);
    const p1 = ramp(t, 1.0, 2.0), p2 = ramp(t, 2.2, 3.2), p3 = ramp(t, 3.6, 5.2);
    const whole = Math.floor(F);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Share of SS tot</Txt>
      <rect x={X(0)} y={60} width={(X(R2) - X(0)) * p1} height={34} rx={4} fill={P.blue} opacity={0.85} />
      <rect x={X(R2)} y={60} width={(X(1) - X(R2)) * p1} height={34} rx={4} fill={P.red} opacity={0.7} />
      <OnBar x={(X(0) + X(R2)) / 2} y={83} size={15} anchor="middle" opacity={p1}>{`R² ${f(R2)}`}</OnBar>
      <OnBar x={(X(R2) + X(1)) / 2} y={83} size={15} anchor="middle" opacity={p1}>{f(1 - R2)}</OnBar>
      <line x1={20} x2={w - 20} y1={130} y2={130} stroke={P.line} />
      <Txt x={20} y={160} size={17} weight={700} color={P.blue}>Per degree of freedom</Txt>
      <g opacity={p2}>
        <Txt x={40} y={192} size={15} color={P.blue}>{`R² / ${v.k} = ${f(mod, 5)}`}</Txt>
        <rect x={XM(0)} y={202} width={XM(mod) - XM(0)} height={30} rx={4} fill={P.blue} opacity={0.85} />
        <Txt x={40} y={266} size={15} color={P.red}>{`(1 − R²) / ${dfRes} = ${f(res, 6)}`}</Txt>
        <rect x={XM(0)} y={276} width={XM(res) - XM(0)} height={30} rx={4} fill={P.red} opacity={0.75} />
      </g>
      <g opacity={p3}>
        {Array.from({length: whole}, (_, i) => <line key={i} x1={XM(res * (i + 1))} x2={XM(res * (i + 1))} y1={202} y2={232} stroke="#fff" strokeWidth={2} />)}
        <Txt x={w / 2} y={360} size={20} anchor="middle" weight={700} color={P.ink}>{`F = ${f(F, 2)}`}</Txt>
        <Txt x={w / 2} y={386} size={14} anchor="middle" color={P.soft}>red pieces in the blue bar</Txt>
      </g>
    </g>);
  }

  // ---- the full equation: each coefficient with its sign
  if (/full equation/.test(title)) {
    const b0 = intercept(/summary \(full\)/); const p = (i: number) => (k < 0 ? 1 : ramp(t, 1.0 + i * 0.6, 1.8 + i * 0.6));
    const list = [{term: 'intercept', est: b0}, ...(full.length ? full : coefs(/./))];
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Full model estimates</Txt>
      {list.map((q, i) => { const y = 90 + i * 64; const up = q.est >= 0; return (<g key={i} opacity={p(i)}>
        <Txt x={40} y={y} size={16} weight={600} color={P.ink}>{q.term}</Txt>
        <Txt x={w - 90} y={y} size={17} anchor="end" weight={700} color={up ? P.green : P.red}>{f(q.est)}</Txt>
        <path d={up ? `M${w - 60},${y + 2} L${w - 50},${y - 16} L${w - 40},${y + 2} Z` : `M${w - 60},${y - 16} L${w - 50},${y + 2} L${w - 40},${y - 16} Z`} fill={up ? P.green : P.red} />
        <line x1={40} x2={w - 40} y1={y + 18} y2={y + 18} stroke={P.line} />
      </g>); })}
    </g>);
  }

  // ---- 95% intervals, each on its own scale
  if (/interval/.test(title)) {
    const list = full.length ? full : coefs(/./);
    const p = (i: number) => ramp(t, 1.4 + i * 1.4, 2.4 + i * 1.4);
    const rh = Math.min(120, 380 / list.length);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>95% intervals</Txt>
      {list.map((q, i) => { const lo = q.est - tcrit * q.se, hi = q.est + tcrit * q.se;
        const a = Math.min(0, lo), b = Math.max(0, hi), pad = (b - a) * 0.12; const X = lin(a - pad, b + pad, 50, w - 50);
        const y = 100 + i * rh; const hits0 = lo <= 0 && hi >= 0; const col = hits0 ? P.red : P.green;
        return (<g key={i}>
          <Txt x={20} y={y - 34} size={15} weight={600} color={P.ink}>{nm(q.term)}</Txt>
          <line x1={X(0)} x2={X(0)} y1={y - 20} y2={y + 20} stroke={P.faint} strokeWidth={1.5} strokeDasharray="4 3" />
          <Txt x={X(0)} y={y + 36} size={14} anchor="middle" color={P.soft}>0</Txt>
          <g opacity={p(i)}>
            <line x1={X(lo)} x2={X(hi)} y1={y} y2={y} stroke={col} strokeWidth={6} strokeLinecap="round" />
            <circle cx={X(q.est)} cy={y} r={6} fill={P.ink} />
            <Txt x={X(lo)} y={y - 12} size={14} anchor="middle" color={col} weight={700}>{sig(lo)}</Txt>
            <Txt x={X(hi)} y={y - 12} size={14} anchor="middle" color={col} weight={700}>{sig(hi)}</Txt>
          </g>
        </g>); })}
    </g>);
  }

  // ---- refit: full against refit estimates and R²
  if (/refit/.test(title)) {
    const p1 = ramp(t, 1.0, 2.0), p2 = ramp(t, 2.0, 3.0);
    const r2f = r2Of(/summary \(full\)/), r2r = r2Of(/summary \(refit\)/); const X = lin(0, 1, 120, w - 50);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Full and refit</Txt>
      <Txt x={210} y={66} size={14} anchor="end" color={P.soft}>full</Txt>
      <Txt x={w - 30} y={66} size={14} anchor="end" color={P.soft}>refit</Txt>
      {full.map((q, i) => { const r = refit.find(z => z.term === q.term); const y = 104 + i * 46;
        return (<g key={i}>
          <Txt x={20} y={y} size={16} weight={600} color={r ? P.ink : P.faint}>{q.term}</Txt>
          <Txt x={210} y={y} size={16} anchor="end" color={r ? P.ink : P.faint}>{f(q.est)}</Txt>
          {!r && <line x1={16} x2={214} y1={y - 5} y2={y - 5} stroke={P.red} strokeWidth={2.5} opacity={p1} />}
          <Txt x={w - 30} y={y} size={16} anchor="end" weight={700} color={r ? P.blue : P.red} opacity={p1}>{r ? f(r.est) : 'dropped'}</Txt>
        </g>); })}
      {!isNaN(r2f) && !isNaN(r2r) && <g opacity={p2}>
        <line x1={20} x2={w - 20} y1={260} y2={260} stroke={P.line} />
        <Txt x={20} y={292} size={17} weight={700} color={P.blue}>R²</Txt>
        {[{lab: 'full', r: r2f, col: P.faint}, {lab: 'refit', r: r2r, col: P.blue}].map((q, i) => { const y = 330 + i * 44; return (<g key={i}>
          <Txt x={110} y={y + 5} size={15} anchor="end" color={P.soft}>{q.lab}</Txt>
          <rect x={120} y={y - 13} width={X(q.r) - 120} height={26} rx={4} fill={q.col} opacity={0.85} />
          <Txt x={X(q.r) + 8} y={y + 5} size={15} weight={700} color={P.ink}>{f(q.r)}</Txt>
        </g>); })}
      </g>}
    </g>);
  }

  // ---- prediction built term by term from the step's work line, e.g. b0 + b1(x1) + b2(x2)
  if (/predict/.test(title)) {
    const line = c.steps[k].work[0] || ''; const rhs = line.split('=')[1] || '';
    const b0 = num(rhs); const pairs = Array.from(rhs.matchAll(/([+-]\d+\.?\d*)\(([\d.]+)\)/g)).map(m => ({b: Number(m[1]), x: Number(m[2])}));
    const pool = [...refit, ...full];
    const terms = [{lab: 'b0', val: b0}, ...pairs.map(q => { const hit = pool.find(z => Math.abs(z.est - q.b) < 5e-4);
      return {lab: `${hit ? nm(hit.term) : 'b'} ${q.x}`, val: q.b * q.x}; })];
    let run = 0; const steps = terms.map(q => { const a = run; run += q.val; return {...q, a, b: run}; });
    const yhat: number = v.prediction ?? run; const all = [0, ...steps.map(s => s.b), ...steps.map(s => s.a), yhat];
    const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.12; const Y = lin(lo - (lo < 0 ? pad : 0), hi + pad, 400, 80);
    const cols = steps.length + 1; const cw = (w - 60) / cols; const cx = (i: number) => 40 + cw * i + cw / 2;
    const p = (i: number) => ramp(t, 1.0 + i * 0.9, 1.8 + i * 0.9);
    return (<g fontFamily={inter}>
      <Txt x={20} y={34} size={17} weight={700} color={P.blue}>Building ŷ</Txt>
      <line x1={30} x2={w - 20} y1={Y(0)} y2={Y(0)} stroke={P.faint} strokeWidth={1.5} />
      {steps.map((s, i) => { const top = Math.min(Y(s.a), Y(s.b)), ht = Math.abs(Y(s.b) - Y(s.a)); const col = s.val >= 0 ? P.green : P.red;
        return (<g key={i} opacity={p(i)}>
          <rect x={cx(i) - cw * 0.36} y={top} width={cw * 0.72} height={Math.max(2, ht)} rx={3} fill={i === 0 ? '#9a9384' : col} opacity={0.85} />
          {i < steps.length - 1 && <line x1={cx(i) + cw * 0.36} x2={cx(i + 1) - cw * 0.36} y1={Y(s.b)} y2={Y(s.b)} stroke={P.faint} strokeDasharray="3 3" />}
          <Txt x={cx(i)} y={s.val >= 0 ? top - 8 : top + ht + 18} size={14} anchor="middle" weight={700} color={i === 0 ? P.ink : col}>{`${s.val >= 0 && i > 0 ? '+' : ''}${f(s.val, 2)}`}</Txt>
          <Txt x={cx(i)} y={428} size={14} anchor="middle" color={P.soft}>{s.lab}</Txt>
        </g>); })}
      <g opacity={p(steps.length)}>
        <line x1={cx(steps.length - 1) + cw * 0.36} x2={cx(steps.length) - cw * 0.36} y1={Y(yhat)} y2={Y(yhat)} stroke={P.faint} strokeDasharray="3 3" />
        <rect x={cx(steps.length) - cw * 0.36} y={Math.min(Y(0), Y(yhat))} width={cw * 0.72} height={Math.abs(Y(0) - Y(yhat))} rx={3} fill={P.blue} opacity={0.9} />
        <Txt x={cx(steps.length)} y={Math.min(Y(0), Y(yhat)) - 8} size={15} anchor="middle" weight={700} color={P.blue}>{f(yhat, 2)}</Txt>
        <Txt x={cx(steps.length)} y={428} size={14} anchor="middle" color={P.blue} weight={700}>ŷ</Txt>
      </g>
    </g>);
  }

  // ---- coefficient tests (and the conclusion): every t against the plus-or-minus cutoff
  const list = full.length ? full : coefs(/./);
  const focus = list.find(q => title.includes(nm(q.term).toLowerCase()));
  const m = Math.max(tcrit, ...list.map(q => Math.abs(q.tv))) * 1.3; const X = lin(-m, m, 40, w - 40);
  const pB = K === 99 ? 1 : ramp(t, 0.9, 1.8); const rh = Math.min(90, 300 / list.length);
  return (<g fontFamily={inter}>
    <Txt x={20} y={34} size={17} weight={700} color={P.blue}>t for each coefficient</Txt>
    <rect x={X(-tcrit)} y={70} width={X(tcrit) - X(-tcrit)} height={rh * list.length + 10} fill="#f1efe9" />
    <line x1={X(0)} x2={X(0)} y1={66} y2={84 + rh * list.length} stroke={P.faint} strokeWidth={1.5} />
    {[-tcrit, tcrit].map((z, i) => <g key={i}>
      <line x1={X(z)} x2={X(z)} y1={66} y2={84 + rh * list.length} stroke={P.green} strokeWidth={2} strokeDasharray="5 4" />
      <Txt x={X(z)} y={104 + rh * list.length} size={14} anchor="middle" weight={700} color={P.green}>{f(z, 3)}</Txt>
    </g>)}
    {list.map((q, i) => { const y = 70 + rh * i + rh / 2 + 5; const sigT = Math.abs(q.tv) > tcrit; const col = sigT ? P.blue : P.red;
      const dim = focus && focus !== q ? 0.45 : 1; const p = focus === q || !focus ? pB : 1;
      return (<g key={i} opacity={dim}>
        <rect x={Math.min(X(0), X(q.tv * p))} y={y - 12} width={Math.abs(X(q.tv * p) - X(0))} height={24} rx={4} fill={col} opacity={0.8} />
        <Txt x={q.tv >= 0 ? X(0) - 8 : X(0) + 8} y={y + 5} size={15} anchor={q.tv >= 0 ? 'end' : 'start'} weight={600} color={P.ink}>{nm(q.term)}</Txt>
        <Txt x={q.tv >= 0 ? X(q.tv) + 6 : X(q.tv) - 6} y={y + 5} size={15} anchor={q.tv >= 0 ? 'start' : 'end'} weight={700} color={col} opacity={p}>{f(q.tv, 3)}</Txt>
      </g>); })}
    <Txt x={w / 2} y={150 + rh * list.length} size={14} anchor="middle" color={P.soft}>{`t on ${dfRes} df`}</Txt>
  </g>);
};
export default Viz;
