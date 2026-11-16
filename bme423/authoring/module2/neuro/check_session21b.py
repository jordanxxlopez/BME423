"""Independent check of session21b.json. Recomputes every answer and every entry of `values`
from the raw table of each case (not from the work lines), checks printed critical values
against SciPy, re-evaluates the arithmetic of the work lines, and checks structure.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session21b.py"""
import json, math, os, re, sys
import numpy as np
from scipy import stats
from scipy.stats import chi2_contingency

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session21b.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session21.json'), encoding='utf-8'))
errors = []
def ok(cond, msg):
    if not cond: errors.append(msg)
def close(a, b, tol=1e-9, rel=1e-9):
    return abs(a - b) <= max(tol, rel * abs(b))

METHODS = {m['id'] for m in REF['methods']}
REFCASE = {}
for c in REF['cases']: REFCASE.setdefault(c['topic'], c)
cases = D['cases']; byid = {c['id']: c for c in cases}
ok(len(cases) == 10, 'need 10 cases'); ok(len(D['questions']) == 10, 'need 10 questions')
ok(len(byid) == len(cases), 'duplicate case ids')
from collections import Counter
cnt = Counter(c['topic'] for c in cases)
ok(cnt == Counter({'s21rmAnova': 3, 's21holm': 2, 's21mcnemar': 3, 's21diagnostic': 2}), f'topic counts {cnt}')

def table_matrix(c):
    return np.array([[float(x) for x in r[1:]] for r in c['table']['rows']], float)

def check_lookup_F(lk, dfr):
    ok(lk['actualDf'] == [2, dfr] and lk['row'] == str(dfr), 'F lookup df')
    ok(abs(lk['value'] - stats.f.ppf(0.95, 2, dfr)) < 0.006, f'F crit {lk}')

def check_rm(c):
    X = table_matrix(c); n, m = X.shape; v = c['values']; w = c['id']
    ok(4 <= n <= 6 and m == 3, w + ' shape')
    S = X.mean(axis=1); T = X.mean(axis=0); G = X.mean()
    SSs = np.array([((X[s] - S[s]) ** 2).sum() for s in range(n)])
    ssw = SSs.sum(); sst = n * ((T - G) ** 2).sum(); ssr = ssw - sst
    ssb = m * ((S - G) ** 2).sum(); sstot = ((X - G) ** 2).sum()
    ok(close(ssb + ssw, sstot, 1e-8), w + ' partition')
    dfr = (n - 1) * (m - 1); mst = sst / (m - 1); msr = ssr / dfr; F = mst / msr
    # second, independent route: two-way ANOVA without replication via statsmodels
    import pandas as pd
    from statsmodels.stats.anova import AnovaRM
    df = pd.DataFrame([(s, t, X[s, t]) for s in range(n) for t in range(m)], columns=['s', 't', 'y'])
    res = AnovaRM(df, 'y', 's', within=['t']).fit().anova_table
    ok(close(F, float(res['F Value'].iloc[0]), 1e-6, 1e-6), w + ' F vs statsmodels')
    exp = dict(n=n, m=m, grandMean=G, ssWithin=ssw, ssTreat=sst, ssRes=ssr, ssBetween=ssb, ssTotal=sstot,
               dfTreat=m - 1, dfRes=dfr, msTreat=mst, msRes=msr, F=F, exactP=stats.f.sf(F, m - 1, dfr))
    for k, e in exp.items(): ok(close(v[k], e, 1e-8, 1e-8), f'{w} values.{k} {v[k]} vs {e}')
    for k, e in (('subjectMeans', S), ('treatmentMeans', T), ('subjectSS', SSs)):
        ok(np.allclose(v[k], e, atol=1e-8), f'{w} values.{k}')
    c05 = stats.f.ppf(0.95, 2, dfr); c01 = stats.f.ppf(0.99, 2, dfr)
    ok(abs(v['critical'] - c05) < 0.006, w + ' critical'); ok(abs(v['critical01'] - c01) < 0.006, w + ' critical01')
    check_lookup_F(c['lookup'], dfr); ok(c['steps'][9]['classTable'] == c['lookup'], w + ' classTable')
    rej = F > v['critical']; ok(v['reject'] == rej, w + ' reject')
    pr = 'P<0.01' if F > v['critical01'] else ('0.01<P<0.05' if rej else 'P>0.05')
    ok(v['pRange'] == pr, w + ' pRange')
    ok((stats.f.sf(F, 2, dfr) < 0.05) == rej, w + ' table decision agrees with exact P')
    ok(close(c['answer'], F, 1e-8, 1e-8) and c['answerName'] == 'F statistic', w + ' answer')
    ok(('Reject H0' in c['conclusion']) == rej and ('Do not reject' in c['conclusion']) == (not rej), w + ' conclusion decision')
    return dict(n=n, T=T, msr=msr, dfr=dfr, rej=rej)

TCOLS = {'0.05': 0.05, '0.02': 0.02, '0.01': 0.01}
def check_holm(c, parent):
    p = check_rm(parent); v = c['values']; w = c['id']
    ok(p['rej'], w + ' parent must reject')
    n, T, msr, dfr = p['n'], p['T'], p['msr'], p['dfr']
    labels = [r[0] for r in c['table']['rows']]
    ok(v['n'] == n and v['dfRes'] == dfr and close(v['msRes'], msr, 1e-9), w + ' n/df/ms')
    for i, l in enumerate(labels):
        ok(close(v['means'][l], T[i], 1e-9), w + ' mean ' + l); ok(abs(c['table']['rows'][i][1] - T[i]) < 5e-5, w + ' table mean')
    se = math.sqrt(2 * msr / n); ok(close(v['se'], se, 1e-10), w + ' se')
    exp = {f'{labels[i]} vs {labels[j]}': (T[i] - T[j]) / se for i, j in ((0, 1), (0, 2), (1, 2))}
    ok(set(exp) == set(v['tValues']), w + ' pair names')
    for k, e in exp.items(): ok(close(v['tValues'][k], e, 1e-9, 1e-9), f'{w} t {k}')
    order = list(v['tValues']); ok(order == sorted(exp, key=lambda k: -abs(exp[k])), w + ' order by |t|')
    ok(np.allclose(v['holmAlphas'], [0.05 / 3, 0.05 / 2, 0.05]), w + ' holm alphas')
    stopped = False; alphas = [0.05 / 3, 0.025, 0.05]
    for j, k in enumerate(order):
        st = c['steps'][5 + j]; ct = st['classTable']; ok(st['title'] == f'Comparison {j + 1}: {k}', w + ' step title')
        ok(ct['row'] == str(dfr) and ct['actualDf'] == dfr, w + ' t row')
        colp = TCOLS[ct['column']]; ok(colp <= alphas[j] + 1e-12, w + ' column not stricter')
        ok(abs(ct['value'] - stats.t.ppf(1 - colp / 2, dfr)) < 0.0006, f'{w} t crit {ct}')
        if 'bracket' in ct:
            for bc, bv in zip(ct['bracket'], ct['bracketValues']):
                ok(abs(bv - stats.t.ppf(1 - float(bc) / 2, dfr)) < 0.0006, w + ' bracket value')
            ok(float(ct['bracket'][0]) > alphas[j] > float(ct['bracket'][1]), w + ' bracket order')
        sig_table = abs(exp[k]) > ct['value'] and not stopped
        # exact Holm decision with the true alpha_j must agree with the printed-column decision
        exact = (2 * stats.t.sf(abs(exp[k]), dfr) < alphas[j]) and not stopped
        ok(sig_table == exact, f'{w} {k} printed-column decision differs from exact Holm')
        ok(v['outcomes'][k] == sig_table, f'{w} outcome {k}')
        if not sig_table: stopped = True
    ok(c['lookup'] == c['steps'][5]['classTable'], w + ' lookup')
    ok(close(c['answer'], exp[order[0]], 1e-9, 1e-9), w + ' answer')
    ok(len(c['steps']) >= 8, w + ' steps')

def chi_range(x):
    cuts = [(0.005, 'P<0.005'), (0.01, '0.005<P<0.01'), (0.025, '0.01<P<0.025'), (0.05, '0.025<P<0.05'), (0.10, '0.05<P<0.10')]
    for a, lab in cuts:
        if x > round(stats.chi2.ppf(1 - a, 1), 3): return lab
    return 'P>0.10'
def check_mc(c):
    v = c['values']; w = c['id']; rows = c['table']['rows']
    a, b = rows[0][1:]; cc, d = rows[1][1:]
    ok((v['a'], v['b'], v['c'], v['d']) == (a, b, cc, d), w + ' cells'); N = a + b + cc + d
    ok(v['N'] == N and 20 <= N <= 40, w + ' N'); E = (b + cc) / 2; ok(close(v['E'], E), w + ' E')
    chi = (abs(b - cc) - 1) ** 2 / (b + cc)   # algebraically equal closed form, independent of the two-term formula
    two = ((abs(b - E) - 0.5) ** 2 + (abs(cc - E) - 0.5) ** 2) / E
    ok(close(chi, two, 1e-10), w + ' two forms'); ok(close(v['chi2'], chi, 1e-10), w + ' chi2')
    from statsmodels.stats.contingency_tables import mcnemar
    sm = mcnemar([[a, b], [cc, d]], exact=False, correction=True)
    ok(close(sm.statistic, chi, 1e-9), w + ' vs statsmodels'); ok(close(v['exactP'], stats.chi2.sf(chi, 1), 1e-12), w + ' exactP')
    ok(v['df'] == 1 and v['critical'] == 3.841 and abs(stats.chi2.ppf(0.95, 1) - 3.841) < 0.0006, w + ' critical')
    ok(c['lookup']['value'] == 3.841 and c['lookup']['actualDf'] == 1, w + ' lookup')
    ok(v['reject'] == (chi > 3.841), w + ' reject'); ok(v['pRange'] == chi_range(chi), w + ' pRange ' + chi_range(chi))
    ok(close(c['answer'], chi, 1e-10) and c['answerName'] == 'Chi-square', w + ' answer')
    ok(('Reject H0' in c['conclusion']) == v['reject'], w + ' conclusion decision')
    if c['topic'] == 's21mcnemar':
        ic, _, _, ex = chi2_contingency([[a, b], [cc, d]], correction=True)
        ok(close(v['independentChi2'], ic, 1e-9), w + ' independentChi2'); ok(np.allclose(v['independentExpected'], ex), w + ' independentExpected')
    ok(len(c['steps']) >= len(REFCASE[c['topic']]['steps']), w + ' steps')

for c in cases:
    ref = REFCASE[c['topic']]
    ok(c['id'].startswith('n21-b-'), c['id'] + ' id prefix'); ok(c['module'] == 21, c['id'] + ' module')
    ok(c['source'] == 'Original neuroscience practice example', c['id'] + ' source')
    ok(list(c.keys()) == list(ref.keys()), c['id'] + ' key set'); ok(set(c['values']) == set(ref['values']), f"{c['id']} values keys {set(c['values']) ^ set(ref['values'])}")
    ok(abs(c['tolerance'] - max(0.001, abs(c['answer']) * 0.005)) < 1e-5, c['id'] + ' tolerance')
    if c['topic'] == 's21rmAnova': check_rm(c); ok(len(c['steps']) >= 11, c['id'] + ' steps')
    elif c['topic'] == 's21holm':
        parent = {'n21-b-recall-holm': 'n21-b-recall-three-delays', 'n21-b-reach-holm': 'n21-b-reach-error-blocks'}[c['id']]
        check_holm(c, byid[parent])
    else: check_mc(c)
    # wording rules
    texts = [('context', c['context']), ('conclusion', c['conclusion'])] + [(f'task{i}', t) for i, t in enumerate(c['tasks'])] + [(f'step{i} words', s['words']) for i, s in enumerate(c['steps'])]
    for where, t in texts:
        tt = t.replace('(Note: ', '(Note ') if where == 'context' or where.startswith('task') else t  # his own "(Note: ...)" tag keeps its colon in the question text only
        ok(':' not in tt and ';' not in tt, f"{c['id']} {where} has colon/semicolon")
    blob = json.dumps(c).lower()
    for bad in ('picture', 'professor', 'lecture', 'the slide', 'session 2'): ok(bad not in blob, f"{c['id']} contains '{bad}'")

# arithmetic of work lines: evaluate simple "expr=number" chains
def tex_eval(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('[', '(').replace(']', ')')
    s = re.sub(r'\\frac12', '(1/2)', s)
    for _ in range(6):
        s = re.sub(r'\\sqrt\{([^{}]*)\}', r'sqrt(\1)', s); s = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s)
    s = re.sub(r'\|([^|]*)\|', r'abs(\1)', s); s = s.replace('^2', '**2').replace('{', '(').replace('}', ')')
    s = re.sub(r'(\d|\))\(', r'\1*(', s)
    return eval(s, {'sqrt': math.sqrt, 'abs': abs})
nwork = 0
for c in cases:
    for i, st in enumerate(c['steps']):
        for line in st['work']:
            for part in re.split(r',\\quad |,\\ ', line):
                mm = re.match(r'^[^=<>]*=(.+)=(-?[\d.]+)$', part)
                if not mm or '\\text' in mm.group(1) or '\\mu' in mm.group(1) or 'P(' in mm.group(1): continue
                try: val = tex_eval(mm.group(1))
                except Exception: continue
                shown = float(mm.group(2)); nwork += 1
                dec = len(mm.group(2).split('.')[1]) if '.' in mm.group(2) else 0
                ok(abs(val - shown) <= max(1.5 * 10 ** (-dec), 6e-4 * abs(shown)), f"{c['id']} step{i} arithmetic: {part} -> {val}")
ok(nwork >= 60, f'only {nwork} work lines evaluated')

# settings differ (titles unique), ids unique, questions
ok(len({c['title'] for c in cases}) == 10, 'titles not unique')
qids = set()
for i, q in enumerate(D['questions']):
    ok(q['id'] == f'm2-n21-qb{i + 1:02d}', 'question id ' + q['id']); qids.add(q['id'])
    ok(q['module'] == 21 and q['topic'] in METHODS, q['id'] + ' module/topic')
    ok(len(q['options']) == 4 and len(set(q['options'])) == 4 and q['correct'] in range(4), q['id'] + ' options')
    ok(q['case'] is None or q['case'] in byid, q['id'] + ' case'); ok(q['case'] is None or byid[q['case']]['topic'] == q['topic'], q['id'] + ' case topic')
    ok(isinstance(q['equations'], list) and q['equations'], q['id'] + ' equations')
ok(len(qids) == 10, 'question ids'); ok(len({q['correct'] for q in D['questions']}) == 4, 'correct index not varied')
ok(sum(q['case'] is not None for q in D['questions']) == 6, 'numeric/conceptual split')
# numeric question keys recomputed from raw tables
def rmvals(cid):
    X = table_matrix(byid[cid]); n, m = X.shape; S = X.mean(1); T = X.mean(0); G = X.mean()
    ssw = ((X - S[:, None]) ** 2).sum(); sst = n * ((T - G) ** 2).sum(); ssr = ssw - sst
    return n, sst, ssr, (sst / 2) / (ssr / ((n - 1) * 2)), ssr / ((n - 1) * 2)
def num(s): return float(re.search(r'(-?\d+\.?\d*)', s.replace('\\(', '').replace('\\chi^2=', '')).group(1))
Q = {q['id'][-2:]: q for q in D['questions']}
n, sst, ssr, F, msr = rmvals('n21-b-recall-three-delays'); ok(abs(num(Q['01']['options'][Q['01']['correct']]) - sst) < 1e-3, 'q01 key')
n, sst, ssr, F, msr = rmvals('n21-b-reach-error-blocks'); ok(abs(num(Q['02']['options'][Q['02']['correct']]) - F) < 1e-3, 'q02 key')
ok(abs(num(Q['04']['options'][Q['04']['correct']]) - math.sqrt(2 * msr / n)) < 1e-4, 'q04 key')
ok(abs(num(Q['06']['options'][Q['06']['correct']]) - (15 - 3 - 1) ** 2 / 18) < 1e-3, 'q06 key')
ok(num(Q['07']['options'][Q['07']['correct']]) == 10, 'q07 key')
k9 = Q['09']['options'][Q['09']['correct']]; ok(abs(num(k9) - (13 - 4 - 1) ** 2 / 17) < 1e-3 and 'do not reject' in k9, 'q09 key')
for cid, qn in (('n21-b-tremor-dbs', '06'), ('n21-b-phantom-pain-mirror', '07'), ('n21-b-memory-screen-neuropsych', '09')):
    r = byid[cid]['table']['rows']; ok(Q[qn]['case'] == cid, qn + ' case link')
ok(byid['n21-b-tremor-dbs']['table']['rows'] == [['Before therapy: stuttering present', 12, 15], ['Before therapy: stuttering absent', 3, 8]], 'stuttering table used in q06')
ok(byid['n21-b-phantom-pain-mirror']['table']['rows'][0][1:] == [6, 15] and byid['n21-b-phantom-pain-mirror']['table']['rows'][1][1:] == [5, 2], 'phantom table used in q07')
ok(byid['n21-b-memory-screen-neuropsych']['table']['rows'][0][2] == 13 and byid['n21-b-memory-screen-neuropsych']['table']['rows'][1][1] == 4, 'memory table used in q09')

if errors:
    print('\n'.join('FAIL ' + e for e in errors)); print(f'{len(errors)} problems'); sys.exit(1)
print(f'session21b OK: {len(cases)} cases, {len(D["questions"])} questions, {nwork} work-line equalities re-evaluated'); sys.exit(0)
