"""Independent check of session20b.json. Recomputes every case from its raw inputs with NumPy/SciPy.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session20b.py   (exits 0 when all checks pass)"""
import json, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session20b.json')))
METHODS = {m['id'] for m in json.load(open(os.path.join(HERE, 'ref', 'session20.json')))['methods']}
REFKEYS = {}
for rc in json.load(open(os.path.join(HERE, 'ref', 'session20.json')))['cases']:
    REFKEYS.setdefault(rc['topic'], (set(rc), set(rc['values']), len(rc['steps'])))
    k = REFKEYS[rc['topic']]
    REFKEYS[rc['topic']] = (k[0], k[1], min(k[2], len(rc['steps'])))
bad = []


def ok(cond, msg):
    if not cond:
        bad.append(msg)


def close(a, b, tol=1e-9):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


def printed(value, exact, dec, who):
    # a printed table value must equal the exact quantile to within one unit of the last printed digit
    ok(abs(value - exact) <= 10 ** (-dec) + 1e-12, '%s printed %s vs SciPy %.5f' % (who, value, exact))


def paired(c):
    v = c['values']
    rows = np.array([r[1:] for r in c['table']['rows']], float)
    d = rows[:, 1] - rows[:, 0]
    n = len(d)
    ok(n in (10, 11), c['id'] + ' n')
    ok(np.any(d > 0) and np.any(d < 0), c['id'] + ' needs an opposite-sign difference')
    r = stats.ttest_rel(rows[:, 1], rows[:, 0])
    exp = {'n': n, 'dbar': d.mean(), 'sumSqDev': ((d - d.mean()) ** 2).sum(), 'varianceD': d.var(ddof=1), 'sd': d.std(ddof=1),
           'se': stats.sem(d), 't': float(r.statistic), 'df': n - 1, 'exactP': float(r.pvalue)}
    for k, e in exp.items():
        ok(close(v[k], e), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    ok(list(v['differences']) == [int(x) for x in d], c['id'] + ' differences')
    printed(v['critical'], stats.t.ppf(0.975, n - 1), 3, c['id'] + ' t crit')
    ok(v['reject'] == (abs(exp['t']) > v['critical']) == (exp['exactP'] < 0.05), c['id'] + ' reject flag')
    ok(c['lookup']['value'] == v['critical'] and c['lookup']['actualDf'] == n - 1 and c['lookup']['row'] == str(n - 1), c['id'] + ' lookup')
    ok(close(c['answer'], exp['t']), c['id'] + ' answer')
    if c['topic'] == 's20pairedR':
        q = stats.t.ppf(0.975, n - 1)
        for k, e in {'ciLowerR': exp['dbar'] - q * exp['se'], 'ciUpperR': exp['dbar'] + q * exp['se'],
                     'ciLowerPrinted': exp['dbar'] - v['critical'] * exp['se'], 'ciUpperPrinted': exp['dbar'] + v['critical'] * exp['se']}.items():
            ok(close(v[k], e), '%s values.%s' % (c['id'], k))
        out = '\n'.join(v['rOutput'])
        mt = re.search(r't = ([-\d.]+), df = (\d+), p-value = ([\d.e-]+)', out)
        ok(mt is not None, c['id'] + ' R t line')
        if mt:
            ok(abs(float(mt.group(1)) - exp['t']) < 6e-5 * max(1, abs(exp['t'])) and int(mt.group(2)) == n - 1
               and abs(float(mt.group(3)) - exp['exactP']) < 6e-4 * exp['exactP'] + 1e-7, c['id'] + ' R t/df/p')
        i = [j for j, l in enumerate(v['rOutput']) if 'confidence interval' in l][0]
        lo, hi = map(float, v['rOutput'][i + 1].split())
        ok(abs(lo - v['ciLowerR']) < 1e-6 and abs(hi - v['ciUpperR']) < 1e-6, c['id'] + ' R CI')
        ok(abs(float(v['rOutput'][-1]) - exp['dbar']) < 1e-6, c['id'] + ' R mean difference')
    return exp


def unpaired(c):
    v = c['values']
    a, b = np.array(v['raw1'], float), np.array(v['raw2'], float)
    r = stats.ttest_ind(a, b, equal_var=True)
    n1, n2 = len(a), len(b)
    pv = ((n1 - 1) * a.var(ddof=1) + (n2 - 1) * b.var(ddof=1)) / (n1 + n2 - 2)
    exp = {'n1': n1, 'n2': n2, 'x1': a.mean(), 'x2': b.mean(), 's1': a.std(ddof=1), 's2': b.std(ddof=1), 'pooledVariance': pv,
           'se': np.sqrt(pv / n1 + pv / n2), 't': float(r.statistic), 'df': n1 + n2 - 2, 'exactP': float(r.pvalue),
           'pairedT': float(stats.ttest_rel(a, b).statistic)}
    for k, e in exp.items():
        ok(close(v[k], e), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    printed(v['critical'], stats.t.ppf(0.975, exp['df']), 3, c['id'] + ' t crit')
    ok(v['reject'] == (abs(exp['t']) > v['critical']) == (exp['exactP'] < 0.05), c['id'] + ' reject flag')
    ok(stats.ttest_rel(a, b).pvalue < 0.05, c['id'] + ' paired analysis should reject')
    ok(c['lookup']['value'] == v['critical'] and c['lookup']['actualDf'] == exp['df'], c['id'] + ' lookup')
    rows = c['table']['rows']
    for row, (n_, m_, s_) in zip(rows, [(n1, exp['x1'], exp['s1']), (n2, exp['x2'], exp['s2'])]):
        ok(row[1] == n_ and abs(row[2] - m_) < 5e-5 * m_ and abs(row[3] - s_) < 5e-5 * s_, c['id'] + ' table row ' + row[0])
    ok(close(c['answer'], exp['t']), c['id'] + ' answer')
    return exp


def rmanova(c):
    v = c['values']
    x = np.array([r[1:] for r in c['table']['rows']], float)
    n, m = x.shape
    ok(4 <= n <= 6 and m == 3, c['id'] + ' shape')
    S, T, X = x.mean(1), x.mean(0), x.mean()
    SSw = ((x - S[:, None]) ** 2).sum()
    SSt = n * ((T - X) ** 2).sum()
    SSb = m * ((S - X) ** 2).sum()
    SStot = ((x - X) ** 2).sum()
    SSr = SStot - SSb - SSt          # independent route to the residual
    dft, dfr = m - 1, (n - 1) * (m - 1)
    F = (SSt / dft) / (SSr / dfr)
    exp = {'n': n, 'm': m, 'grandMean': X, 'SStotal': SStot, 'SSbetweenSubjects': SSb, 'SSwithinSubjects': SSw, 'SStreat': SSt,
           'SSres': SSr, 'DFtreat': dft, 'DFres': dfr, 'MStreat': SSt / dft, 'MSres': SSr / dfr, 'F': F,
           'exactP': float(stats.f.sf(F, dft, dfr))}
    for k, e in exp.items():
        ok(close(v[k], e, 1e-8), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    ok(np.allclose(v['subjectMeans'], S) and np.allclose(v['treatmentMeans'], T), c['id'] + ' means')
    # cross-check F with a two-way additive model (statsmodels)
    try:
        import pandas as pd
        from statsmodels.stats.anova import AnovaRM
        df = pd.DataFrame([{'s': i, 't': j, 'y': x[i, j]} for i in range(n) for j in range(m)])
        Fsm = float(AnovaRM(df, 'y', 's', within=['t']).fit().anova_table['F Value'].iloc[0])
        ok(close(Fsm, F, 1e-8), c['id'] + ' statsmodels F %s vs %s' % (Fsm, F))
    except ImportError:
        pass
    printed(v['critical05'], stats.f.ppf(0.95, dft, dfr), 2, c['id'] + ' F .05')
    printed(v['critical01'], stats.f.ppf(0.99, dft, dfr), 2, c['id'] + ' F .01')
    ok(v['reject'] == (F > v['critical05']) == (exp['exactP'] < 0.05), c['id'] + ' reject flag')
    ok(c['lookup']['value'] == v['critical05'] and c['lookup']['actualDf'] == [dft, dfr], c['id'] + ' lookup')
    ok(close(c['answer'], F, 1e-8), c['id'] + ' answer')
    return exp


FN = {'s20paired': paired, 's20pairedR': paired, 's20unpaired': unpaired, 's20rmanova': rmanova}
ids, titles, EXP = set(), set(), {}
NUM = r'(-?\d+(?:\.\d+)?)'
for c in D['cases']:
    cid = c['id']
    ok(cid.startswith('n20-b-') and cid not in ids, cid + ' id'); ids.add(cid)
    ok(c['title'] not in titles, cid + ' title'); titles.add(c['title'])
    ok(c['topic'] in METHODS and c['module'] == 20 and c['source'] == 'Original neuroscience practice example', cid + ' meta')
    rk, rv, rs = REFKEYS[c['topic']]
    ok(set(c) == rk, cid + ' key set %s' % (set(c) ^ rk))
    ok(rv <= set(c['values']), cid + ' values keys missing %s' % (rv - set(c['values'])))
    ok(len(c['steps']) >= rs, cid + ' steps')
    ok(abs(c['tolerance'] - max(0.001, 0.005 * abs(c['answer']))) < 1e-12, cid + ' tolerance')
    EXP[cid] = FN[c['topic']](c)
    texts = [c['context'], c['conclusion']] + c['tasks'] + [s['words'] for s in c['steps']]
    question_text = [c['context']] + c['tasks']  # his own phrases keep their punctuation here, e.g. "(Note: If a difference exists, ...)"
    for t in texts:
        plain = re.sub(r'\\\(.+?\\\)', '', t)
        ok(t in question_text or (':' not in plain and ';' not in plain), cid + ' colon/semicolon in: ' + t[:60])
        ok(not re.search(r'\bpicture', t, re.I) and not re.search(r'professor|lecture|slide|session \d|Session', t), cid + ' banned word: ' + t[:60])
    for i, s in enumerate(c['steps']):
        ok(s['general'] and s['work'] and s['words'], cid + ' step %d empty' % i)
        for w in s['work']:
            # every "\frac{a}{b}=c" and "a-b=c" with plain numbers must be true arithmetic (inputs are shown to 6 significant figures)
            for a, b, r in re.findall(r'(?<!sqrt\{)\\frac\{' + NUM + r'\}\{' + NUM + r'\}=' + NUM, w):
                ok(abs(float(a) / float(b) - float(r)) <= 2e-5 * max(1, abs(float(r))), '%s step %d arithmetic: %s' % (cid, i, w))
            for a, b, r in re.findall(r'\\sqrt\{\\frac\{' + NUM + r'\}\{' + NUM + r'\}\}=' + NUM, w):
                ok(abs((float(a) / float(b)) ** 0.5 - float(r)) <= 2e-5 * max(1, abs(float(r))), '%s step %d arithmetic: %s' % (cid, i, w))
            for a, b, r in re.findall(r'(?:^|[=(,])' + NUM + '-' + NUM + '=' + NUM + '$', w):
                ok(abs(float(a) - float(b) - float(r)) <= 1e-5 * (abs(float(a)) + abs(float(b)) + abs(float(r))), '%s step %d arithmetic: %s' % (cid, i, w))
            mm = re.search(r'\\frac\{' + NUM + r'\}\{\\sqrt\{(\d+)\}\}=' + NUM, w)
            if mm:
                ok(abs(float(mm.group(1)) / float(mm.group(2)) ** 0.5 - float(mm.group(3))) <= 2e-5 * float(mm.group(3)), '%s step %d arithmetic: %s' % (cid, i, w))
            mm = re.search(r'^s_d=\\sqrt\{' + NUM + r'\}=' + NUM, w)
            if mm:
                ok(abs(float(mm.group(1)) ** 0.5 - float(mm.group(2))) <= 2e-5 * float(mm.group(2)), '%s step %d arithmetic: %s' % (cid, i, w))
            # chains of inequalities with numbers must hold
            if re.fullmatch(r'[^<>]*' + NUM + r'(?:[<>][^<>]*?' + NUM + r')+(?:\\ \(.*\))?', w) and 'P' not in w.split('\\ (')[0]:
                core = w.split('\\ (')[0]
                parts = re.split(r'([<>])', core)
                vals = [float(re.findall(NUM, p.replace('0.05}', '').replace('0.50}', ''))[-1]) if True else 0 for p in parts[::2]]
                for j, op in enumerate(parts[1::2]):
                    ok((vals[j] < vals[j + 1]) if op == '<' else (vals[j] > vals[j + 1]), '%s step %d inequality: %s' % (cid, i, w))

topics = [c['topic'] for c in D['cases']]
ok(topics.count('s20paired') == 4 and topics.count('s20unpaired') == 2 and topics.count('s20pairedR') == 1 and topics.count('s20rmanova') == 3, 'topic counts')
ok(sum(1 for c in D['cases'] if c['topic'] == 's20paired' and not c['values']['reject']) >= 1, 'need a non-rejecting paired case')

# questions
qids = set()
ok(len(D['questions']) == 10, 'question count')
for i, q in enumerate(D['questions'], 1):
    ok(q['id'] == 'm2-n20-qb%02d' % i and q['id'] not in qids, q['id'] + ' id'); qids.add(q['id'])
    ok(q['module'] == 20 and q['topic'] in METHODS, q['id'] + ' topic')
    ok(len(q['options']) == 4 and len(set(q['options'])) == 4 and q['correct'] in (0, 1, 2, 3), q['id'] + ' options')
    ok(q['case'] is None or q['case'] in ids, q['id'] + ' case')
    ok(set(q) == {'id', 'module', 'topic', 'stem', 'options', 'correct', 'why', 'case', 'equations'}, q['id'] + ' keys')
ok(len({q['correct'] for q in D['questions']}) == 4, 'correct index should vary')


def opt_num(q):
    return float(re.search(NUM, q['options'][q['correct']]).group(1))


Qs = {q['id']: q for q in D['questions']}
E = EXP
numeric = {'m2-n20-qb01': E['n20-b-maze-lesion']['sd'], 'm2-n20-qb02': E['n20-b-light-therapy-mood']['t'],
           'm2-n20-qb04': E['n20-b-birdsong-deafening']['dbar'], 'm2-n20-qb05': E['n20-b-hearing-aid-unpaired']['t'],
           'm2-n20-qb06': E['n20-b-pigeon-schedules-rmanova']['F']}
for k, e in numeric.items():
    ok(abs(opt_num(Qs[k]) - e) <= 5e-6 * max(1, abs(e)) * 10, '%s keyed option %s vs %s' % (k, opt_num(Qs[k]), e))
ok('2.262' in Qs['m2-n20-qb03']['options'][Qs['m2-n20-qb03']['correct']] and 'do not reject' in Qs['m2-n20-qb03']['options'][Qs['m2-n20-qb03']['correct']]
   and abs(E['n20-b-ear-tone-threshold']['t']) < 2.262, 'qb03 key')

if bad:
    print('\n'.join(bad)); print('%d problems' % len(bad)); sys.exit(1)
print('session20b: %d cases and %d questions verified' % (len(D['cases']), len(D['questions'])))
