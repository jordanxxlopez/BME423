"""Independent check of authoring/module2/neuro/session18b.json.
Recomputes every answer and every `values` entry from the raw table data with NumPy/SciPy,
checks each printed critical value against SciPy, re-evaluates the arithmetic of the work lines,
and checks ids, topics, keys and wording rules. Exits 0 only if everything agrees.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session18b.py"""
import json, math, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session18b.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session18.json'), encoding='utf-8'))
errors = []; nchecks = 0
def ok(cond, msg):
    global nchecks; nchecks += 1
    if not cond: errors.append(msg)
def close(a, b, rel=1e-9, ab=1e-9): return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))

# invented raw data behind the two summary(lm()) tables of n18-b-mental-rotation-age
ANG = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 60, 120]
OLD = [676, 706, 888, 933, 1059, 1033, 1156, 1270, 1329, 1415, 844, 1165]
YOUNG = [501, 521, 654, 626, 819, 822, 816, 910, 1009, 1116, 634, 880]

def raw(c):
    rows = c['table']['rows']; ok(rows[-1][0] == 'Total', c['id'] + ' last row is Total')
    x = np.array([r[1] for r in rows[:-1]], float); y = np.array([r[2] for r in rows[:-1]], float)
    h = c['table']['headers']; cols = {'x²': x * x, 'y²': y * y, 'xy': x * y}
    ok(close(rows[-1][1], x.sum(), 1e-12, 1e-9) and close(rows[-1][2], y.sum(), 1e-12, 1e-9), c['id'] + ' totals of x, y')
    for j, name in enumerate(h[3:], start=3):
        for i, r in enumerate(rows[:-1]): ok(close(r[j], cols[name][i], 1e-12, 1e-9), f"{c['id']} cell {i},{name}")
        ok(close(rows[-1][j], cols[name].sum(), 1e-12, 1e-9), f"{c['id']} total {name}")
    return x, y
def fit(x, y):
    n = len(x); X = np.column_stack([np.ones(n), x]); beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    res = y - X @ beta; s2 = float(res @ res) / (n - 2); cov = s2 * np.linalg.inv(X.T @ X)
    return dict(n=n, a=float(beta[0]), b=float(beta[1]), syx=math.sqrt(s2), sa=math.sqrt(cov[0, 0]), sb=math.sqrt(cov[1, 1]),
                xbar=float(x.mean()), ybar=float(y.mean()), sx=float(x.std(ddof=1)), sy=float(y.std(ddof=1)),
                r=float(np.corrcoef(x, y)[0, 1]), X=X, s2=s2, cov=cov)
def table_value(df, col, printed, where):
    exact = stats.t.ppf(1 - float(col) / 2, df)
    ok(abs(exact - printed) <= 0.0015, f"{where} t_{col}({df}) printed {printed} vs SciPy {exact:.4f}")
def cmpvals(c, exp):
    v = c['values']
    ok(set(v) == set(exp), f"{c['id']} values keys differ: {sorted(set(v) ^ set(exp))}")
    for k, e in exp.items():
        if k not in v: continue
        if isinstance(e, bool): ok(v[k] is e, f"{c['id']} values.{k} {v[k]} != {e}")
        else: ok(close(v[k], e, 1e-8, 1e-9), f"{c['id']} values.{k} {v[k]} != {e}")
def answer(c, e):
    ok(abs(c['answer'] - e) <= c['tolerance'], f"{c['id']} answer {c['answer']} vs {e}")
    ok(c['tolerance'] >= 0.001 and close(c['tolerance'], max(0.001, 0.005 * abs(e)), 1e-6), f"{c['id']} tolerance")

def chk_line(c):
    x, y = raw(c); f = fit(x, y); n = f['n']; p = np.polyfit(x, y, 1)
    ok(close(p[0], f['b'], 1e-9) and close(p[1], f['a'], 1e-9), c['id'] + ' polyfit')
    cmpvals(c, dict(n=n, sumX=x.sum(), sumY=y.sum(), sumX2=(x * x).sum(), sumXY=(x * y).sum(),
                    denominator=n * (x * x).sum() - x.sum() ** 2, xbar=f['xbar'], ybar=f['ybar'], slope=f['b'], intercept=f['a']))
    answer(c, f['b'])
def chk_syx(c):
    x, y = raw(c); f = fit(x, y)
    cmpvals(c, dict(n=f['n'], sx=f['sx'], sy=f['sy'], b=f['b'], xbar=f['xbar'], syx=f['syx'], sb=f['sb'], sa=f['sa'],
                    syxRaw=f['syx'], sbRaw=f['sb'], saRaw=f['sa']))
    answer(c, f['sb'] if 'slope' in c['answerName'] else f['syx'])
def chk_slope(c):
    x, y = raw(c); f = fit(x, y); n = f['n']; df = n - 2; t = f['b'] / f['sb']; lr = stats.linregress(x, y)
    ok(close(lr.slope / lr.stderr, t, 1e-9), c['id'] + ' linregress t')
    crit = c['values']['critical']; table_value(df, '0.05', crit, c['id'])
    exp = dict(n=n, b=f['b'], sb=f['sb'], a=f['a'], sa=f['sa'], df=df, t=t, critical=crit, critical001=c['values']['critical001'],
               slopeLower=f['b'] - crit * f['sb'], slopeUpper=f['b'] + crit * f['sb'],
               interceptLower=f['a'] - crit * f['sa'], interceptUpper=f['a'] + crit * f['sa'], reject=bool(abs(t) > crit), tRaw=t)
    table_value(df, '0.001', c['values']['critical001'], c['id'])
    if 'critical002' in c['values']:
        exp['critical002'] = c['values']['critical002']; table_value(df, '0.02', exp['critical002'], c['id'])
        ok(crit < abs(t) < exp['critical002'], c['id'] + ' t between 0.05 and 0.02 cutoffs')
        ok(0.02 < lr.pvalue < 0.05, c['id'] + ' exact P inside stated range'); ok('0.02 < P < 0.05' in c['conclusion'], c['id'] + ' P range text')
    else:
        ok(abs(t) > c['values']['critical001'] and lr.pvalue < 0.001 and 'P < 0.001' in c['conclusion'], c['id'] + ' P < 0.001')
    cmpvals(c, exp); answer(c, t)
def chk_predict(c):
    x, y = raw(c); f = fit(x, y); n = f['n']; df = n - 2; x0 = c['values']['x']
    ok(x0 not in set(x.tolist()) and x.min() < x0 < x.max(), c['id'] + ' x0 is not a data value and is inside the range')
    v0 = np.array([1.0, x0]); yhat = float(v0 @ np.array([f['a'], f['b']])); sm = math.sqrt(float(v0 @ f['cov'] @ v0)); sn = math.sqrt(f['s2'] + sm ** 2)
    crit = c['values']['critical']; table_value(df, '0.05', crit, c['id'])
    exp = dict(a=f['a'], b=f['b'], syx=f['syx'], n=n, xbar=f['xbar'], sx=f['sx'], x=x0, yhat=yhat, seMean=sm, seNew=sn, critical=crit,
               meanLower=yhat - crit * sm, meanUpper=yhat + crit * sm, obsLower=yhat - crit * sn, obsUpper=yhat + crit * sn, confidence=0.95)
    cmpvals(c, exp); answer(c, exp['obsLower'] if 'observation' in c['answerName'] else exp['meanLower'])
def chk_compare(c):
    rows = {r[0]: r for r in c['table']['rows']}
    for name, yy in (('Older', OLD), ('Younger', YOUNG)):
        f = fit(np.array(ANG, float), np.array(yy, float))
        ri, rs = rows[name + ' (Intercept)'], rows[name + ' Angle.deg']
        ok(abs(ri[1] - f['a']) <= 0.00051 and abs(ri[2] - f['sa']) <= 0.00051 and abs(ri[3] - f['a'] / f['sa']) <= 0.0051, c['id'] + ' R intercept row ' + name)
        ok(abs(rs[1] - f['b']) <= 0.000051 and abs(rs[2] - f['sb']) <= 0.000051 and abs(rs[3] - f['b'] / f['sb']) <= 0.0051, c['id'] + ' R slope row ' + name)
        for r, tv in ((ri, f['a'] / f['sa']), (rs, f['b'] / f['sb'])):
            p = 2 * stats.t.sf(abs(tv), 10); ok(abs(float(r[4]) - p) <= 0.006 * p, c['id'] + ' R p value ' + r[0])
        ok(f"{f['syx']:.2f} ms on 10 degrees of freedom" in c['context'] and f"{f['r'] ** 2:.4f}" in c['context'], c['id'] + ' residual SE and R2 in context ' + name)
    bO, sbO, aO, saO = rows['Older Angle.deg'][1], rows['Older Angle.deg'][2], rows['Older (Intercept)'][1], rows['Older (Intercept)'][2]
    bY, sbY, aY, saY = rows['Younger Angle.deg'][1], rows['Younger Angle.deg'][2], rows['Younger (Intercept)'][1], rows['Younger (Intercept)'][2]
    syx = [float(m) for m in re.findall(r'was ([0-9.]+) ms on 10 degrees', c['context'])]
    ok(len(syx) == 1, c['id'] + ' first residual SE parse'); syx += [float(m) for m in re.findall(r'and ([0-9.]+) ms on 10 degrees', c['context'])]
    n1 = n2 = 12; df = n1 + n2 - 4; se = math.hypot(sbO, sbY); t = (bO - bY) / se
    xa = np.array(ANG, float); pv = ((n1 - 2) * syx[0] ** 2 + (n2 - 2) * syx[1] ** 2) / df
    pse = math.sqrt(pv / ((n1 - 1) * xa.var(ddof=1)) + pv / ((n2 - 1) * xa.var(ddof=1)))
    v = c['values']
    for col, key in (('0.05', 'critical'), ('0.02', 'critical002'), ('0.01', 'critical01')): table_value(df, col, v[key], c['id'])
    ok(v['critical002'] < abs(t) < v['critical01'] and '0.01 < P < 0.02' in c['conclusion'], c['id'] + ' P range')
    ok(0.01 < 2 * stats.t.sf(abs(t), df) < 0.02, c['id'] + ' exact P inside stated range')
    cmpvals(c, dict(nM=n1, nF=n2, bM=bO, sbM=sbO, bF=bY, sbF=sbY, difference=bO - bY, se=se, t=t, df=df, critical=v['critical'],
                    critical002=v['critical002'], critical01=v['critical01'], reject=bool(abs(t) > v['critical']),
                    interceptT=(aO - aY) / math.hypot(saO, saY), femaleXbar=float(xa.mean()), femaleSx=float(xa.std(ddof=1)),
                    pooledVariance=pv, pooledSE=pse, pooledT=(bO - bY) / pse))
    answer(c, t)
def chk_corr(c):
    x, y = raw(c); n = len(x); df = n - 2; r, p = stats.pearsonr(x, y); t = r * math.sqrt(df / (1 - r * r))
    crit = c['values']['critical']; table_value(df, '0.05', crit, c['id']); rej = bool(abs(t) > crit)
    ok(rej == (p < 0.05), c['id'] + ' decision agrees with exact P')
    ok(('P < 0.001' in c['conclusion'] and p < 0.001) if rej else ('P > 0.05' in c['conclusion']), c['id'] + ' P range text')
    cmpvals(c, dict(n=n, sxy=float(((x - x.mean()) * (y - y.mean())).sum()), sxx=float(((x - x.mean()) ** 2).sum()),
                    syy=float(((y - y.mean()) ** 2).sum()), r=float(r), r2=float(r * r), t=t, df=df, critical=crit, reject=rej))
    answer(c, float(r))
CHK = {'s18line': chk_line, 's18syx': chk_syx, 's18slope': chk_slope, 's18predict': chk_predict, 's18compare': chk_compare, 's18corr': chk_corr}

# ---------- arithmetic of the work lines
def to_py(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('\\cdot', '*').replace('\\tfrac', '\\frac').replace('\\Big', '')
    for _ in range(20):
        s2 = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s); s2 = re.sub(r'\\sqrt\{([^{}]*)\}', r'sqrt(\1)', s2)
        if s2 == s: break
        s = s2
    s = s.replace('^2', '**2').replace('{', '(').replace('}', ')')
    s = re.sub(r'(?<=[0-9)])\s*(?=\()', '*', s); s = re.sub(r'\)\s*(?=[0-9s])', ')*', s); s = re.sub(r'(?<=[0-9])(?=sqrt)', '*', s)
    return s
def numeric(expr):
    e = to_py(expr.strip())
    if not e or re.search(r'[A-Za-z\\_|]', e.replace('sqrt', '')): return None
    try: return float(eval(e, {'__builtins__': {}}, {'sqrt': math.sqrt}))
    except Exception: return None
nwork = nwork_eval = 0
def chk_work(c):
    global nwork, nwork_eval
    for si, s in enumerate(c['steps']):
        for line in s['work']:
            nwork += 1
            for chunk in re.split(r',\\ |\\Rightarrow|\\quad', line):
                chunk = chunk.replace('|t|=', '')
                if '\\pm' in chunk:
                    m = re.match(r'\s*(-?[0-9.]+)\\pm(-?[0-9.]+)\s*$', chunk)
                    if m: pm = (float(m.group(1)), float(m.group(2)))
                    continue
                if '<' in chunk or '>' in chunk:
                    parts = re.split(r'([<>])', chunk); vals = [numeric(p) for p in parts[0::2]]; ops = parts[1::2]
                    for i, op in enumerate(ops):
                        if vals[i] is not None and vals[i + 1] is not None:
                            nwork_eval += 1; ok(vals[i] < vals[i + 1] if op == '<' else vals[i] > vals[i + 1], f"{c['id']} step {si + 1} inequality false: {chunk}")
                    if len(vals) == 3 and 'pm' in locals() and vals[0] is not None and vals[2] is not None:
                        ok(close(vals[0], pm[0] - pm[1], 2e-6, 2e-6) and close(vals[2], pm[0] + pm[1], 2e-6, 2e-6), f"{c['id']} step {si + 1} interval ends: {line}")
                    continue
                vals = [v for v in (numeric(p) for p in chunk.split('=')) if v is not None]
                if len(vals) >= 2:
                    nwork_eval += 1; big = max(abs(float(m)) for m in re.findall(r'[0-9]+\.?[0-9]*', chunk))
                    for v in vals[1:]:
                        ok(abs(v - vals[0]) <= max(3e-6 * big, 3e-6 * abs(v), 5e-7), f"{c['id']} step {si + 1} arithmetic: {chunk} -> {vals}")

# ---------- structure and wording
methods = {m['id'] for m in REF['methods']}
refkeys = {}
for rc in REF['cases']: refkeys.setdefault(rc['topic'], set(rc.keys()))
refsteps = {'s18line': 7, 's18syx': 6, 's18slope': 8, 's18predict': 8, 's18compare': 8, 's18corr': 7}
ids = [c['id'] for c in D['cases']]
ok(len(ids) == 10 and len(set(ids)) == 10 and all(i.startswith('n18-b-') for i in ids), 'case ids')
ok(not set(ids) & {c['id'] for c in REF['cases']}, 'case id collides with a ref case')
from collections import Counter
ok(Counter(c['topic'] for c in D['cases']) == Counter({'s18line': 1, 's18syx': 2, 's18slope': 2, 's18predict': 2, 's18compare': 1, 's18corr': 2}), 'topic counts')
BAN = re.compile(r'\b(picture|professor|lecture|slide|session)\b', re.I)
def text_ok(s, where):
    ok(':' not in s and ';' not in s, f'{where} has a colon or semicolon: {s[:70]}'); ok(not BAN.search(s), f'{where} banned word: {s[:70]}')
for c in D['cases']:
    ok(c['topic'] in methods and c['module'] == 18 and c['source'] == 'Original neuroscience practice example', c['id'] + ' topic/module/source')
    ok(set(c.keys()) == refkeys[c['topic']], f"{c['id']} keys differ from ref: {sorted(set(c.keys()) ^ refkeys[c['topic']])}")
    ok(len(c['steps']) >= refsteps[c['topic']], c['id'] + ' step count')
    ok((c['hypotheses'] is None) == (c['topic'] in ('s18line', 's18syx', 's18predict')), c['id'] + ' hypotheses presence')
    ok((c['lookup'] is None) == (c['topic'] in ('s18line', 's18syx')), c['id'] + ' lookup presence')
    for s in c['steps']:
        ok(set(s.keys()) - {'classTable'} == {'title', 'general', 'work', 'words'} and s['general'] and s['work'], c['id'] + ' step keys')
        text_ok(s['words'], c['id'] + ' words')
        if 'classTable' in s:
            t = s['classTable']; table_value(t['actualDf'], t['column'], t['value'], c['id'] + ' step'); ok(t['row'] == str(t['actualDf']) and t['approximation'] is False, c['id'] + ' classTable row')
            ok(f"{t['value']:g}" in ' '.join(s['work']) or f"{t['value']:.3f}" in ' '.join(s['work']), c['id'] + ' classTable value appears in work')
    if c['lookup']: table_value(c['lookup']['actualDf'], c['lookup']['column'], c['lookup']['value'], c['id'] + ' lookup'); ok(c['lookup']['value'] == c['values']['critical'], c['id'] + ' lookup = critical')
    # his own homework sentence keeps its colon in the question text (context and tasks only)
    HIS = 'Note: some useful summations have already been calculated for you below, which you can use.'
    for t in c['tasks']: text_ok(t.replace(HIS, ''), c['id'] + ' task')
    text_ok(c['context'].replace(HIS, ''), c['id'] + ' context'); text_ok(c['conclusion'], c['id'] + ' conclusion')
    if c['hypotheses']: text_ok(c['hypotheses']['nullWords'], c['id'] + ' nullWords'); text_ok(c['hypotheses']['alternativeWords'], c['id'] + ' altWords')
    CHK[c['topic']](c); chk_work(c)
qids = [q['id'] for q in D['questions']]
ok(qids == ['m2-n18-qb%02d' % i for i in range(1, 11)], 'question ids')
ok(sum(q['case'] is not None for q in D['questions']) >= 6 and sum(q['case'] is None for q in D['questions']) >= 2, 'numeric/conceptual mix')
ok(len({q['correct'] for q in D['questions']}) == 4, 'correct index varies')
for q in D['questions']:
    ok(q['module'] == 18 and q['topic'] in methods and (q['case'] is None or q['case'] in ids), q['id'] + ' module/topic/case')
    ok(len(q['options']) == 4 and len(set(q['options'])) == 4 and q['correct'] in range(4), q['id'] + ' options')
    ok(not BAN.search(q['stem'] + q['why'] + ' '.join(q['options'])), q['id'] + ' banned word')
    if q['case']: ok(next(c for c in D['cases'] if c['id'] == q['case'])['topic'] == q['topic'], q['id'] + ' topic matches case')
# numeric keys of the quiz, recomputed from the cases' raw data
C = {c['id']: c for c in D['cases']}
def first_num(s): return float(re.search(r'\\\((-?[0-9.]+)\\\)', s).group(1))
def qkey(qid, value):
    q = next(q for q in D['questions'] if q['id'] == qid); got = first_num(q['options'][q['correct']])
    ok(abs(got - value) <= 6e-4 * abs(value), f'{qid} keyed option {got} vs {value}')
    for i, o in enumerate(q['options']):
        if i != q['correct']: ok(abs(first_num(o) - value) > 2e-3 * abs(value), f'{qid} distractor too close')
f = fit(*raw(C['n18-b-dopamine-reward'])); qkey('m2-n18-qb01', f['b'])
f = fit(*raw(C['n18-b-cortisol-sleep'])); qkey('m2-n18-qb02', f['syx'])
f = fit(*raw(C['n18-b-noise-hearing'])); qkey('m2-n18-qb04', f['b'] / f['sb'])
qkey('m2-n18-qb06', C['n18-b-delay-discounting']['values']['meanLower']); qkey('m2-n18-qb08', C['n18-b-mental-rotation-age']['values']['t'])
qkey('m2-n18-qb09', stats.pearsonr(*raw(C['n18-b-amygdala-anxiety']))[0])
q5 = next(q for q in D['questions'] if q['id'] == 'm2-n18-qb05'); ok('2.228' in q5['options'][q5['correct']], 'qb05 key')
ok(isinstance(D.get('notes'), list) and D['notes'], 'notes present')
print(f'{nchecks} checks, {nwork} work lines ({nwork_eval} arithmetic/inequality chunks evaluated)')
if errors:
    print(f'{len(errors)} FAILED'); [print(' -', e) for e in errors]; sys.exit(1)
print('session18b: all checks passed'); sys.exit(0)
