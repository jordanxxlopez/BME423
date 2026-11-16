"""Independent check of authoring/module2/neuro/session20a.json.
Recomputes every answer and every `values` entry from the raw table of each case with
NumPy/SciPy, checks the printed critical values against SciPy, re-evaluates the simple
arithmetic shown in the work lines, and checks ids, topics, wording rules and questions.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session20a.py
"""
import json, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session20a.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session20.json'), encoding='utf-8'))
errors = []
def need(cond, msg):
    if not cond: errors.append(msg)
def close(a, b, rel=1e-9, ab=1e-9): return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))

METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {}
for c in REF['cases']:
    REFKEYS.setdefault(c['topic'], (set(c.keys()), set(c['values'].keys()), len(c['steps'])))
# the ref has two rmanova cases; the m = 3 one (9 steps) is the model
REFKEYS['s20rmanova'] = [(set(c.keys()), set(c['values'].keys()), len(c['steps'])) for c in REF['cases'] if c['id'] == 's20-breathing-rmanova'][0]
REFKEYS['s20pairedR'] = [(set(c.keys()), set(c['values'].keys()), len(c['steps'])) for c in REF['cases'] if c['id'] == 's20-hr-posture-r'][0]

def cmp_values(cid, got, exp):
    need(set(got) == set(exp), f'{cid}: values keys differ {set(got) ^ set(exp)}')
    for k, e in exp.items():
        g = got.get(k)
        if isinstance(e, list) and e and isinstance(e[0], str):
            need(g == e, f'{cid}: values.{k}')
        elif isinstance(e, (list, np.ndarray)):
            need(g is not None and len(g) == len(e) and all(close(float(x), float(y), 1e-9, 1e-9) for x, y in zip(g, e)), f'{cid}: values.{k} {g} != {list(e)}')
        elif isinstance(e, (bool, np.bool_)):
            need(g is bool(e), f'{cid}: values.{k} {g} != {e}')
        elif isinstance(e, str):
            need(g == e, f'{cid}: values.{k}')
        else:
            need(g is not None and close(float(g), float(e), 1e-9, 1e-9), f'{cid}: values.{k} {g} != {e}')

def tcrit(alpha, df): return stats.t.ppf(1 - alpha / 2, df)

def check_t_lines(cid, steps):
    """every t_{a}(df)=v in a work line must be the printed (3 dp) two-tailed value"""
    for s in steps:
        for w in s.get('work', []):
            for a, df, v in re.findall(r't_\{([0-9.]+)\}\((\d+)\)=([0-9.]+)', w):
                need(abs(tcrit(float(a), int(df)) - float(v)) <= 0.0011, f'{cid}: t_{a}({df})={v} vs SciPy {tcrit(float(a), int(df)):.4f}')

def check_fracs(cid, steps):
    """X=\\frac{a}{b}=c and \\frac{a}{\\sqrt{b}}=c lines: shown arithmetic must hold to rounding"""
    for s in steps:
        for w in s.get('work', []):
            for a, b, c in re.findall(r'=\\frac\{(-?[0-9.]+)\}\{(-?[0-9.]+)\}=(-?[0-9.]+)', w):
                need(close(float(a) / float(b), float(c), 2e-4, 2e-5), f'{cid}: {w}')
            for a, b, c in re.findall(r'=\\frac\{(-?[0-9.]+)\}\{\\sqrt\{(\d+)\}\}=(-?[0-9.]+)', w):
                need(close(float(a) / float(b) ** .5, float(c), 2e-4, 2e-5), f'{cid}: {w}')
            m = re.match(r'SS_\{res\}=([0-9.]+)-([0-9.]+)=([0-9.]+)$', w)
            if m: need(close(float(m[1]) - float(m[2]), float(m[3]), 2e-4, 2e-4), f'{cid}: {w}')
            m = re.match(r'SS_\{treat\}=(\d+)\[(.+)\]=([0-9.]+)$', w)
            if m:
                tot = sum((float(x) - float(y)) ** 2 for x, y in re.findall(r'\((-?[0-9.]+)-(-?[0-9.]+)\)\^2', m[2]))
                need(close(int(m[1]) * tot, float(m[3]), 2e-3, 1e-4), f'{cid}: {w}')
            m = re.match(r's\^2=\\frac\{(\d+)\(([0-9.]+)\)\+(\d+)\(([0-9.]+)\)\}\{(\d+)\}=([0-9.]+)$', w)
            if m: need(close((int(m[1]) * float(m[2]) + int(m[3]) * float(m[4])) / int(m[5]), float(m[6]), 2e-4, 1e-6), f'{cid}: {w}')
            m = re.match(r't=\\frac\{(-?[0-9.]+)-(-?[0-9.]+)\}\{([0-9.]+)\}=(-?[0-9.]+)$', w)
            if m: need(close((float(m[1]) - float(m[2])) / float(m[3]), float(m[4]), 2e-4, 1e-5), f'{cid}: {w}')
            m = re.match(r'\\sqrt\{\\frac\{([0-9.]+)\}\{(\d+)\}\+\\frac\{([0-9.]+)\}\{(\d+)\}\}=([0-9.]+)$', w)
            if m: need(close((float(m[1]) / int(m[2]) + float(m[3]) / int(m[4])) ** .5, float(m[5]), 2e-4, 1e-6), f'{cid}: {w}')
            m = re.match(r'd_i=\((.+)\)$', w)
            if m and '-' in m[1] and re.fullmatch(r'[0-9.,\-]+', m[1]) and all(re.fullmatch(r'[0-9.]+-[0-9.]+', p) for p in m[1].split(',')):
                pass  # the subtraction list itself is checked against the table below

def paired_stats(a, b):
    d = np.round(np.array(b, float) - np.array(a, float), 10); n = len(d)
    dbar = d.sum() / n; ss = float(((d - dbar) ** 2).sum()); var = ss / (n - 1); sd = var ** .5; se = sd / n ** .5; t = dbar / se
    return d, n, dbar, ss, var, sd, se, t

def check_paired(c, withR):
    cid = c['id']; rows = c['table']['rows']; a = [r[1] for r in rows]; b = [r[2] for r in rows]
    need(len(rows) in (10, 11), f'{cid}: n should be 10 or 11')
    d, n, dbar, ss, var, sd, se, t = paired_stats(a, b); df = n - 1
    sp = stats.ttest_rel(b, a)
    need(close(sp.statistic, t, 1e-9) , f'{cid}: t differs from scipy.ttest_rel')
    crit = c['values']['critical']
    need(abs(tcrit(0.05, df) - crit) <= 0.0006, f'{cid}: critical {crit} vs {tcrit(0.05, df)}')
    exp = dict(n=n, differences=d, dbar=dbar, sumSqDev=ss, varianceD=var, sd=sd, se=se, t=t, df=df, critical=crit, exactP=float(sp.pvalue), reject=abs(t) > crit)
    need((d > 0).any() and (d < 0).any(), f'{cid}: no difference of the opposite sign')
    # the subtraction list shown in step 2
    shown = c['steps'][1]['work'][0]
    pairs = re.findall(r'([0-9.]+)-([0-9.]+)', shown)
    need([(float(x), float(y)) for x, y in pairs] == [(float(y), float(x)) for x, y in zip(a, b)], f'{cid}: subtraction list does not match the table')
    lst = re.match(r'd_i=\((.+)\),', c['steps'][1]['work'][1])[1].split(',')
    need(np.allclose([float(x) for x in lst], d), f'{cid}: listed differences wrong')
    # decision line P bracket
    last = c['steps'][7]['work'][-1]
    p = float(sp.pvalue)
    m = re.fullmatch(r'([0-9.]+)<P<([0-9.]+)', last)
    if m: need(float(m[1]) < p < float(m[2]), f'{cid}: P bracket {last} vs exact {p}')
    elif last == 'P<0.001': need(p < 0.001, f'{cid}: P bracket')
    else: need(False, f'{cid}: unrecognised P line {last}')
    if withR:
        lo_p, hi_p = dbar - crit * se, dbar + crit * se; q = tcrit(0.05, df)
        exp.update(ciLowerPrinted=lo_p, ciUpperPrinted=hi_p, ciLowerR=dbar - q * se, ciUpperR=dbar + q * se,
                   rOutput=c['values']['rOutput'], rCode=c['values']['rCode'])
        out = '\n'.join(c['values']['rOutput'])
        m = re.search(r't = (\S+), df = (\d+), p-value = (\S+)', out)
        need(m is not None and close(float(m[1]), t, 0, 6e-5) and int(m[2]) == df and close(float(m[3]), p, 1e-3), f'{cid}: R t/df/p line does not match')
        ro = c['values']['rOutput']; ci = [float(x) for x in ro[ro.index('95 percent confidence interval:') + 1].split()]
        need(close(ci[0], dbar - q * se, 0, 6e-7 * max(1, abs(ci[0])) + 6e-6) and close(ci[1], dbar + q * se, 0, 6e-6), f'{cid}: R interval does not match')
        need(close(float(ro[-1]), dbar, 1e-6), f'{cid}: R mean difference')
        need(ro[0] == 'Paired t-test' and 'paired = TRUE' in c['values']['rCode'], f'{cid}: R header/code')
        w = c['steps'][9]['work'][-1]; m = re.search(r'\[(-?[0-9.]+),(-?[0-9.]+)\]$', w)
        need(m and close(float(m[1]), lo_p, 2e-5, 2e-6) and close(float(m[2]), hi_p, 2e-5, 2e-6), f'{cid}: hand interval in work line')
    cmp_values(cid, c['values'], exp)
    need(c['answerName'] == 't statistic' and close(c['answer'], t, 1e-9), f'{cid}: answer')
    need(c['lookup']['value'] == crit and c['lookup']['row'] == str(df) and c['lookup']['actualDf'] == df, f'{cid}: lookup')
    return dict(d=d, n=n, dbar=dbar, ss=ss, var=var, sd=sd, se=se, t=t, a=a, b=b)

def check_unpaired(c):
    cid = c['id']; rows = c['table']['rows']; a = np.array([r[1] for r in rows], float); b = np.array([r[2] for r in rows], float)
    n1, n2 = len(b), len(a); x1, x2 = b.mean(), a.mean(); s1, s2 = b.std(ddof=1), a.std(ddof=1)
    pv = ((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2); se = (pv / n1 + pv / n2) ** .5; t = (x1 - x2) / se; df = n1 + n2 - 2
    sp = stats.ttest_ind(b, a, equal_var=True)
    need(close(sp.statistic, t, 1e-9), f'{cid}: t differs from scipy.ttest_ind')
    crit = c['values']['critical']; need(abs(tcrit(0.05, df) - crit) <= 0.0006, f'{cid}: critical')
    cmp_values(cid, c['values'], dict(n1=n1, n2=n2, x1=x1, x2=x2, s1=s1, s2=s2, pooledVariance=pv, se=se, t=t, df=df, critical=crit, exactP=float(sp.pvalue), reject=abs(t) > crit))
    need(close(c['answer'], t, 1e-9), f'{cid}: answer')
    pt = stats.ttest_rel(b, a)
    # the paired t quoted in the task, words and conclusion
    for txt in (c['tasks'][1], c['steps'][-1]['words'], c['conclusion']):
        m = re.search(r't = (-?[0-9.]+) with 9 degrees of freedom', txt)
        need(m and close(float(m[1]), pt.statistic, 2e-5), f'{cid}: quoted paired t')
    need(abs(pt.statistic) > tcrit(0.05, 9) and abs(t) < crit, f'{cid}: design needs paired reject / unpaired not')
    need(pt.pvalue < 0.001 if 'P < 0.001' in c['conclusion'] else True, f'{cid}: paired P range')
    last = c['steps'][-1]['work'][-1]; m = re.fullmatch(r'([0-9.]+)<P<([0-9.]+)', last)
    need(m and float(m[1]) < sp.pvalue < float(m[2]), f'{cid}: P bracket')
    need(c['lookup']['value'] == crit and c['lookup']['row'] == str(df), f'{cid}: lookup')
    return dict(t=t, pt=float(pt.statistic), pv=pv, se=se, x1=x1, x2=x2)

def check_rm(c):
    cid = c['id']; x = np.array([r[1:] for r in c['table']['rows']], float); n, m = x.shape
    need(4 <= n <= 6 and m == 3, f'{cid}: design size')
    S = x.mean(1); T = x.mean(0); X = x.mean()
    tot = float(((x - X) ** 2).sum()); sb = float(m * ((S - X) ** 2).sum()); sw = float(((x - S[:, None]) ** 2).sum()); st = float(n * ((T - X) ** 2).sum())
    sr = sw - st; dt, dr = m - 1, (n - 1) * (m - 1); mt, mr = st / dt, sr / dr; F = mt / mr
    need(close(tot, sb + sw, 1e-9), f'{cid}: SS partition')
    # independent route: two-way layout residual
    res = x - S[:, None] - T[None, :] + X
    need(close(float((res ** 2).sum()), sr, 1e-8), f'{cid}: SSres by the residual route')
    try:
        import pandas as pd
        from statsmodels.stats.anova import AnovaRM
        long = pd.DataFrame([(i, j, x[i, j]) for i in range(n) for j in range(m)], columns=['s', 't', 'y'])
        Fsm = AnovaRM(long, 'y', 's', within=['t']).fit().anova_table['F Value'].iloc[0]
        need(close(Fsm, F, 1e-8), f'{cid}: F differs from statsmodels AnovaRM {Fsm}')
    except ImportError:
        pass
    c05, c01 = c['values']['critical05'], c['values']['critical01']
    need(abs(stats.f.ppf(.95, dt, dr) - c05) <= 0.011 and abs(stats.f.ppf(.99, dt, dr) - c01) <= 0.011, f'{cid}: F critical values {c05},{c01} vs {stats.f.ppf(.95, dt, dr):.3f},{stats.f.ppf(.99, dt, dr):.3f}')
    p = float(stats.f.sf(F, dt, dr))
    cmp_values(cid, c['values'], dict(n=n, m=m, subjectMeans=S, treatmentMeans=T, grandMean=X, SStotal=tot, SSbetweenSubjects=sb, SSwithinSubjects=sw, SStreat=st, SSres=sr,
                                      DFtreat=dt, DFres=dr, MStreat=mt, MSres=mr, F=F, critical05=c05, critical01=c01, exactP=p, reject=F > c05))
    need(c['answerName'] == 'F statistic' and close(c['answer'], F, 1e-9), f'{cid}: answer')
    need(c['lookup']['value'] == c05 and c['lookup']['actualDf'] == [dt, dr] and c['lookup']['row'] == str(dr), f'{cid}: lookup')
    last = ' '.join(c['steps'][-1]['work'])
    need(('P<0.01' in last and '0.01<P' not in last) == (p < 0.01) and ('0.01<P<0.05' in last) == (0.01 < p < 0.05) and ('P>0.05' in last) == (p > 0.05), f'{cid}: P range line vs exact {p}')
    w = c['steps'][7]['work'][0]; need(w == 'F_{0.05}(%d,%d)=%.2f' % (dt, dr, c05), f'{cid}: critical F work line')
    # listed means and SS in the work lines
    def nums(s): return [float(v) for v in re.findall(r'-?[0-9]+\.?[0-9]*', s.split('=', 1)[1])]
    need(np.allclose(nums(c['steps'][1]['work'][0]), S, rtol=2e-5), f'{cid}: subject means line')
    need(np.allclose(nums(c['steps'][2]['work'][0]), T, rtol=2e-5), f'{cid}: treatment means line')
    need(np.allclose(nums(c['steps'][3]['work'][0])[0:n], ((x - S[:, None]) ** 2).sum(1), rtol=2e-5), f'{cid}: SS_s line')
    return dict(F=F, mt=mt, mr=mr, st=st, sr=sr, sw=sw, tot=tot, n=n, m=m)

R = {}; ids = set()
for c in D['cases']:
    cid = c['id']
    need(cid.startswith('n20-') and cid not in ids, f'{cid}: id'); ids.add(cid)
    need(c['topic'] in METHODS, f'{cid}: topic'); need(c['module'] == 20, f'{cid}: module')
    need(c['source'] == 'Original neuroscience practice example', f'{cid}: source')
    rk, rv, rn = REFKEYS[c['topic']]
    need(set(c.keys()) == rk, f'{cid}: case keys differ from ref {set(c.keys()) ^ rk}')
    need(len(c['steps']) >= rn, f'{cid}: fewer steps than the ref case')
    need(close(c['tolerance'], max(0.005 * abs(c['answer']), 0.001), 1e-9), f'{cid}: tolerance')
    for s in c['steps']:
        need(s['general'] and s['work'] and s['words'], f'{cid}: empty step part in {s["title"]}')
    texts = [c['context'], c['conclusion']] + c['tasks'] + [s['words'] for s in c['steps']]
    question_text = [c['context']] + c['tasks']  # his own phrases keep their punctuation here, e.g. "(Note: If a difference exists, ...)"
    for tx in texts:
        need(tx in question_text or (':' not in tx and ';' not in tx), f'{cid}: colon or semicolon in "{tx[:60]}"')
        need(not re.search(r'\bpicture', tx, re.I) and not re.search(r'professor|lecture|slide|session \d', tx, re.I), f'{cid}: banned word in "{tx[:60]}"')
    need('Normally distributed' in c['context'] + ' '.join(c['tasks']), f'{cid}: Normality tag missing')
    check_t_lines(cid, c['steps']); check_fracs(cid, c['steps'])
    if c['topic'] == 's20paired': R[cid] = check_paired(c, False)
    elif c['topic'] == 's20pairedR': R[cid] = check_paired(c, True)
    elif c['topic'] == 's20unpaired': R[cid] = check_unpaired(c)
    else: R[cid] = check_rm(c)

from collections import Counter
cnt = Counter(c['topic'] for c in D['cases'])
need(cnt == Counter({'s20paired': 4, 's20unpaired': 1, 's20pairedR': 2, 's20rmanova': 3}), f'topic counts {cnt}')
need(len(D['cases']) == 10 and len(D['questions']) == 10, 'need 10 cases and 10 questions')
need(sum(1 for c in D['cases'] if not c['values']['reject']) >= 2, 'outcome mix')

# questions
def optval(q): return float(re.search(r'\\\((-?[0-9.]+)\\\)', q['options'][q['correct']])[1])
qids = set()
for i, q in enumerate(D['questions'], 1):
    qid = q['id']
    need(qid == 'm2-n20-qa%02d' % i and qid not in qids, f'{qid}: id'); qids.add(qid)
    need(q['module'] == 20 and q['topic'] in METHODS, f'{qid}: module/topic')
    need(len(q['options']) == 4 and len(set(q['options'])) == 4 and q['correct'] in (0, 1, 2, 3), f'{qid}: options')
    need(q['case'] is None or q['case'] in ids, f'{qid}: case')
    need(isinstance(q['equations'], list) and q['why'], f'{qid}: why/equations')
    if q['case']: need(q['topic'] == [c['topic'] for c in D['cases'] if c['id'] == q['case']][0], f'{qid}: topic does not match its case')
need(len({q['correct'] for q in D['questions']}) == 4, 'correct index should vary over 0-3')
Q = {q['id']: q for q in D['questions']}
expq = {
    'm2-n20-qa01': R['n20-alpha-eyes-closed']['dbar'],
    'm2-n20-qa02': R['n20-tens-pressure-pain']['sd'],
    'm2-n20-qa03': R['n20-p300-sleep-loss']['t'],
    'm2-n20-qa04': R['n20-amygdala-faces-unpaired']['t'],
    'm2-n20-qa05': R['n20-cold-pressor-music-r']['dbar'] - 2.262 * R['n20-cold-pressor-music-r']['se'],
    'm2-n20-qa06': R['n20-heat-pain-cream-rmanova']['F'],
}
for k, v in expq.items():
    need(close(optval(Q[k]), v, 2e-5, 2e-6), f'{k}: keyed option {optval(Q[k])} != {v}')
# qa09 and qa10 facts
need('14' in Q['m2-n20-qa09']['options'][Q['m2-n20-qa09']['correct']] and (8 - 1) * (3 - 1) == 14, 'qa09')
q9 = stats.t.ppf(.975, 9); tt = ((6.41 - 0.82) / 2) / (((6.41 + 0.82) / 2) / q9)
need(abs(2 * stats.t.sf(tt, 9) - 0.1142) < 5e-4, 'qa10: interval and p-value are not consistent for n = 10')

if errors:
    print('\n'.join(errors)); print(f'{len(errors)} PROBLEMS'); sys.exit(1)
print(f'session20a OK: {len(D["cases"])} cases, {len(D["questions"])} questions, all values recomputed')
