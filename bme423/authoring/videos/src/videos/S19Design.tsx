import React from 'react';
import {C, GROUP, mono} from '../kit/theme';
import {Frame, Step, prog, after} from '../kit/Frame';
import {lin, lerp, Glow, Arrow, Label} from '../kit/plot';

// Session 19 case "s19-hrt-relative-risk" (Glantz 5-13, Grodstein 1997) and the follow-up pages 5-7.
const O = [[574, 8483], [2051, 17520]];
const rowT = O.map(r => r[0] + r[1]);                           // 9057, 19571
const colT = [O[0][0] + O[1][0], O[0][1] + O[1][1]];             // 2625, 26003
const N = rowT[0] + rowT[1];                                     // 28628
const E = O.map((r, i) => r.map((_, j) => rowT[i] * colT[j] / N)); // 830.47, 8226.53, 1794.53, 17776.47
const parts = O.flatMap((r, i) => r.map((o, j) => (Math.abs(o - E[i][j]) - 0.5) ** 2 / E[i][j])); // 78.895, 7.964, 36.511, 3.686
const chi = parts.reduce((a, b) => a + b, 0);                    // 127.06
const rT = O[0][0] / rowT[0], rC = O[1][0] / rowT[1];            // 0.06338, 0.10480
const RR = rT / rC;                                              // 0.6047
const rE = colT[0] / N;                                          // 0.09169

export const meta = {
  id: 's19-s19design', session: 19, method: 's19design',
  cases: {'s19-hrt-relative-risk': [1, 3, 4, 5, 6, 6, 7]},
  title: 'Hormone therapy · relative risk and study design',
  steps: [
    {title: 'Two groups by use', seconds: 7, card: [{label: 'deaths (Grodstein 1997)', note: `current users  574 died · 8483 alive\nnever used    2051 died · 17520 alive`}],
      caption: 'Current hormone users are compared with never-users. The groups were formed by **use**, not by random assignment.'},
    {title: 'Null hypothesis', seconds: 7, caption: 'The null hypothesis says the **death rate is the same** in both groups. The sample rates are 6.3% and 10.5%.',
      card: [{label: 'null hypothesis', tex: 'H_0:p_{\\mathrm{HRT}}=p_{\\mathrm{never}}', value: `${(rT * 100).toFixed(2)}% vs ${(rC * 100).toFixed(2)}% died`, color: C.signal}]},
    {title: 'Expected counts', seconds: 7, caption: 'With equal rates, 9.17% of each group would die. Each **expected count** is row total times column total over N.',
      card: [{label: 'expected counts', tex: 'E=\\frac{(\\text{row total})(\\text{column total})}{N}', value: `E(user, died) = ${E[0][0].toFixed(2)}`, note: `others ${E[0][1].toFixed(2)} · ${E[1][0].toFixed(2)} · ${E[1][1].toFixed(2)}`, color: C.noise}]},
    {title: 'Yates chi-square', seconds: 7, caption: 'Each cell adds its Yates-corrected gap between observed and expected. The four pieces sum to **chi-square = 127.06**.',
      card: [{label: 'chi-square (Yates)', tex: '\\chi^2=\\sum\\frac{(|O-E|-\\tfrac12)^2}{E}', value: `= ${chi.toFixed(2)}`, note: parts.map(v => v.toFixed(3)).join(' + '), color: C.signal}]},
    {title: 'Class chi-square table', seconds: 7, caption: 'In the **class chi-square table**, row 1 gives 3.841 at 0.05. The statistic passes even 10.828, so P < 0.001.',
      card: [{label: 'class chi-square table', tex: '\\nu=(2-1)(2-1)=1', value: 'row 1 · column 0.05 → 3.841', note: '127.06 > 10.828 (0.001) → reject H0, P < 0.001', color: C.signal}]},
    {title: 'Relative risk', seconds: 7, caption: 'The **relative risk** divides the two death rates. 0.0634 over 0.1048 is 0.60, so users had about 60% of the risk.',
      card: [{label: 'relative risk', tex: 'RR=\\frac{n_{TD}/n_T}{n_{CD}/n_C}', value: `${rT.toFixed(5)} / ${rC.toFixed(5)} = ${RR.toFixed(4)}`, color: C.signal}]},
    {title: 'What the design allows', seconds: 7, caption: 'The women chose whether to use hormones, so the lower risk is an **association**, not proof that hormones caused it.',
      card: [{label: 'study design', value: 'grouped by use → association', color: C.green}]},
    {title: 'Randomized follow-up', seconds: 8, caption: 'The 2002 WHI trial was **randomized**. It found the overall risks of estrogen plus progestin exceeded the benefits.',
      card: [{label: 'WHI trial (JAMA 2002)', value: 'randomized → risks > benefits', note: 'estrogen + progestin · average 5.2-year follow-up\nhormone use fell 46% within six months', color: C.pink}]},
    {title: 'Timing of therapy', seconds: 8, caption: 'A 2026 FDA release ties the benefits to **when therapy starts**, within ten years of menopause or before age 60.',
      card: [{label: 'FDA · HHS fact sheet', value: 'benefit tied to start timing', note: 'start within 10 years of menopause onset or before 60\nwho was studied shapes what a result means', color: C.green}]},
  ] as Step[],
};

const S19Design: React.FC = () => (
  <Frame title={meta.title} session={19} steps={meta.steps}>
    {(f, i, tl) => {
      // Death-rate bars on the right
      const yr = lin(0, 0.12, 380, 70);
      const bx = [540, 660];
      const showMain = i <= 6;
      // Count table on the left
      const tx = [150, 255, 350], ty = [70, 125];
      return (<g>
        {showMain && <g>
          {/* count table */}
          <g opacity={prog(tl, f, 0, 0.8)} fontFamily={mono}>
            {['died', 'alive', 'total'].map((h, k) => <Label key={h} x={tx[k]} y={30} text={h} color={C.muted} anchor="middle" size={14} weight={700} />)}
            {['users', 'never'].map((r, k) => <Label key={r} x={10} y={ty[k]} text={r} color={GROUP[k]} weight={700} />)}
            {O.map((r, a) => r.map((o, b) => <Label key={`${a}${b}`} x={tx[b]} y={ty[a]} text={String(o)} anchor="middle" size={16} />))}
            {rowT.map((t, a) => <Label key={a} x={tx[2]} y={ty[a]} text={String(t)} anchor="middle" color={C.muted} size={15} />)}
            {after(tl, f, 2) && O.map((r, a) => r.map((_, b) => <Label key={`e${a}${b}`} x={tx[b]} y={ty[a] + 22} text={E[a][b].toFixed(1)} anchor="middle" size={13} color={C.noise} opacity={prog(tl, f, 2)} />))}
            {after(tl, f, 2) && <Label x={10} y={175} text="cyan = expected if rates equal" color={C.noise} size={12} opacity={prog(tl, f, 2)} />}
          </g>
          {/* death-rate bars */}
          {after(tl, f, 1) && <g opacity={prog(tl, f, 1, 0.8)}>
            <line x1={470} x2={470} y1={yr(0.12)} y2={yr(0)} stroke={C.muted} strokeWidth={1.5} />
            {[0, 0.04, 0.08, 0.12].map(v => <g key={v}><line x1={464} x2={470} y1={yr(v)} y2={yr(v)} stroke={C.muted} /><Label x={458} y={yr(v) + 5} text={`${Math.round(v * 100)}%`} color={C.muted} size={13} anchor="end" /></g>)}
            <line x1={470} x2={740} y1={yr(0)} y2={yr(0)} stroke={C.muted} strokeWidth={1.5} />
            {[rT, rC].map((r, k) => { const g = prog(tl, f, 1, 1 + k * 0.3); return (<g key={k}>
              <rect x={bx[k] - 40} y={yr(r * g)} width={80} height={yr(0) - yr(r * g)} rx={5} fill={GROUP[k]} opacity={0.85} />
              <Label x={bx[k]} y={yr(0) + 22} text={k ? 'never' : 'users'} color={GROUP[k]} anchor="middle" size={14} />
              {g > 0.95 && <Label x={bx[k]} y={yr(r) - 10} text={`${(r * 100).toFixed(2)}%`} color={C.ink} anchor="middle" size={14} />}</g>); })}
            {after(tl, f, 2) && i < 5 && <g opacity={prog(tl, f, 2)}>
              <line x1={480} x2={740} y1={yr(rE)} y2={yr(rE)} stroke={C.noise} strokeWidth={2.5} strokeDasharray="7 5" />
              <Label x={478} y={yr(rE) - 10} text={`equal ${(rE * 100).toFixed(2)}%`} color={C.noise} size={13} /></g>}
            {after(tl, f, 5) && (() => { const q = prog(tl, f, 5, 1.4); return (<g opacity={q}>
              <Arrow x1={bx[1] - 46} y1={yr(rC)} x2={bx[0] + 46} y2={lerp(yr(rC), yr(rT), q)} color={C.signal} w={2.5} />
              <Label x={600} y={yr(0.118)} text={`RR = ${RR.toFixed(2)}`} color={C.signal} anchor="middle" size={18} weight={700} /></g>); })()}
          </g>}
          {/* chi-square pieces */}
          {i === 3 && (() => { const xc = lin(0, 80, 170, 430); const names = ['users · died', 'users · alive', 'never · died', 'never · alive']; return (<g>
            <Label x={10} y={215} text="(|O − E| − ½)² / E" color={C.muted} size={14} />
            {parts.map((v, k) => { const g = prog(tl, f, 3, 0.8 + k * 0.4); const y = 240 + k * 38; return (<g key={k}>
              <Label x={10} y={y + 15} text={names[k]} color={GROUP[k >> 1]} size={13} />
              <rect x={xc(0)} y={y} width={(xc(v) - xc(0)) * g} height={20} rx={4} fill={C.signal} opacity={0.85} />
              {g > 0.95 && <Label x={xc(v) + 8} y={y + 15} text={v.toFixed(2)} size={13} />}</g>); })}
          </g>); })()}
          {/* class chi-square table */}
          {i === 4 && (() => { const p = prog(tl, f, 4), pb = prog(tl, f, 4, 2.4); const cols = ['0.10', '0.05', '0.01', '0.001'];
            const rows: [string, string[]][] = [['1', ['2.706', '3.841', '6.635', '10.828']], ['2', ['4.605', '5.991', '9.210', '13.816']]];
            const x0 = 10, y0 = 250, cw = 92; return (<g opacity={p}>
              <Label x={x0} y={y0 - 30} text="class chi-square table" color={C.muted} size={14} />
              {cols.map((c, ci) => <Label key={c} x={x0 + 80 + ci * cw} y={y0} text={c} color={c === '0.05' ? C.signal : C.muted} anchor="middle" weight={700} size={14} />)}
              {rows.map(([r, vs], ri) => (<g key={r}>
                <Label x={x0} y={y0 + 42 + ri * 48} text={`ν = ${r}`} color={r === '1' ? C.signal : C.muted} weight={700} size={14} />
                {vs.map((v, ci) => { const h = r === '1' && ci === 1, h2 = r === '1' && ci === 3; return (<g key={ci}>
                  {(h || h2) && <rect x={x0 + 80 + ci * cw - 40} y={y0 + 20 + ri * 48} width={80} height={30} rx={7} fill="none" stroke={h ? C.signal : C.green} strokeWidth={2.2} opacity={pb} />}
                  <Label x={x0 + 80 + ci * cw} y={y0 + 42 + ri * 48} text={v} color={h ? C.signal : h2 ? C.green : C.ink} anchor="middle" size={h ? 16 : 14} weight={h ? 700 : 400} /></g>); })}
              </g>))}
            </g>); })()}
          {/* design */}
          {i === 6 && (() => { const p = prog(tl, f, 6); return (<g opacity={p}>
            <rect x={20} y={230} width={170} height={60} rx={10} fill="none" stroke={C.muted} strokeWidth={1.5} />
            <Label x={105} y={256} text="women chose" anchor="middle" size={14} /><Label x={105} y={276} text="to use or not" anchor="middle" size={14} />
            <Arrow x1={196} y1={260} x2={248} y2={260} color={C.green} w={2.5} />
            <rect x={254} y={230} width={170} height={60} rx={10} fill="none" stroke={C.green} strokeWidth={2} />
            <Label x={339} y={266} text="association" anchor="middle" color={C.green} size={16} weight={700} />
            <Label x={20} y={330} text="groups formed by use," color={C.muted} size={13} />
            <Label x={20} y={350} text="not by random assignment" color={C.muted} size={13} />
          </g>); })()}
        </g>}
        {/* timeline */}
        {i >= 7 && (() => { const ev = [
          {x: 90, yr: '1997', a: 'users vs never', b: 'RR 0.60', c: C.blue, k: 7},
          {x: 285, yr: '2002', a: 'WHI randomized', b: 'risks > benefits', c: C.pink, k: 7},
          {x: 475, yr: '2003', a: 'FDA black box', b: 'warnings added', c: C.red, k: 7},
          {x: 665, yr: '2026', a: 'FDA: start within', b: '10 yr / before 60', c: C.green, k: 8}];
          const q = prog(tl, f, 7, 1.6); return (<g>
            <line x1={40} x2={40 + (720 - 40) * q} y1={210} y2={210} stroke={C.muted} strokeWidth={2} />
            {ev.map((e, n) => { const a = e.k === 7 ? prog(tl, f, 7, 0.6 + n * 0.5) : prog(tl, f, 8, 1); const up = n % 2 === 0; return (<g key={n} opacity={a}>
              <Glow cx={e.x} cy={210} r={8} color={e.c} />
              <Label x={e.x} y={up ? 110 : 270} text={e.yr} color={e.c} anchor="middle" size={18} weight={700} />
              <Label x={e.x} y={up ? 140 : 300} text={e.a} anchor="middle" size={14} />
              <Label x={e.x} y={up ? 162 : 322} text={e.b} anchor="middle" size={14} color={C.muted} />
              <line x1={e.x} x2={e.x} y1={up ? 172 : 222} y2={up ? 198 : 252} stroke={e.c} strokeWidth={1.5} opacity={0.6} />
            </g>); })}
          </g>); })()}
      </g>);
    }}
  </Frame>
);

export default S19Design;
