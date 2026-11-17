"""Independent check of session24b.json. Recomputes every case from its raw inputs with NumPy/SciPy.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session24b.py   (exits 0 when all checks pass)"""
import itertools, json, os, re, sys
from math import comb
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session24b.json')))
REF = json.load(open(os.path.join(HERE, 'ref', 'session24.json')))
METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {}
for rc in REF['cases']:
    k = REFKEYS.get(rc['topic'])
    REFKEYS[rc['topic']] = (set(rc), len(rc['steps']) if k is None else min(k[1], len(rc['steps'])))
# method-generic values keys of the ref cases (the ref names raw-data keys after its own groups, so those are excluded)
VALKEYS = {'s24normal': {'n', 'mean1', 'sd1', 'within1SD_1', 'mean2', 'sd2', 'within1SD_2', 'within2SD_2', 'W1', 'P1', 'W2', 'P2', 'reject2'},
           's24mwtable': {'nS', 'nB', 'T', 'muT', 'critical', 'exactP', 'reject', 'combinations', 'tableP', 'critical01'},
           's24mwnormal': {'nS', 'nB', 'T', 'muT', 'sigmaT', 'zT', 'critical', 'exactP', 'reject'},
           's24wtable': {'before', 'after', 'differences', 'n', 'W', 'patterns', 'critical', 'exactP', 'reject'},
           's24wnormal': {'before', 'after', 'differences', 'n', 'W', 'tieSum', 'varianceNoTies', 'sigmaW', 'zW', 'critical', 'exactNormalP', 'pairedT', 'reject'}}
for rc in REF['cases']:
    assert VALKEYS[rc['topic']] <= set(rc['values']) | {'combinations', 'tableP', 'critical01', 'patterns'}, rc['id']

# printed tables, transcribed from the PDFs (row: (.05 critical values, P), (.01 critical values, P))
MW_PRINTED = {(5, 7): ((20, 45), .048, (17, 48), .010), (4, 7): ((13, 35), .042, (10, 38), .012)}
W_PRINTED = {7: [(28, .016), (24, .046)], 8: [(32, .024), (28, .054)]}
INF = {'0.50': 0.6745, '0.20': 1.2816, '0.10': 1.6449, '0.05': 1.9600, '0.02': 2.3263, '0.01': 2.5758, '0.005': 2.8070, '0.002': 3.0902, '0.001': 3.2905}
bad = []


def ok(cond, msg):
    if not cond:
        bad.append(msg)


def close(a, b, tol=1e-9):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


for col, v in INF.items():  # infinity row of t_table.pdf page 2 against the Normal quantile
    ok(abs(v - stats.norm.ppf(1 - float(col) / 2)) <= 1e-4 + 1e-12, 'infinity row ' + col)


def ties(x):
    _, c = np.unique(np.round(np.asarray(x, float), 6), return_counts=True)
    return int(((c - 1) * c * (c + 1)).sum())


def bracket_ok(c, z, reject):
    last = c['steps'][-1]['work']
    m = re.search(r't_\{([\d.]+)\}\(\\infty\)=([\d.]+)<([\d.]+)<t_\{([\d.]+)\}\(\\infty\)=([\d.]+)', last[1])
    ok(m is not None, c['id'] + ' bracket line')
    if m:
        lo, hi = m.group(1), m.group(4)
        ok(INF[lo] == float(m.group(2)) and INF[hi] == float(m.group(5)) and INF[lo] < z < INF[hi], c['id'] + ' bracket values')
        cols = list(INF)
        ok(cols.index(hi) == cols.index(lo) + 1, c['id'] + ' bracket adjacent')
        p = 2 * stats.norm.sf(z)
        ok(float(hi) < p < float(lo), c['id'] + ' P inside bracket')
        ok(last[2] == '%s<P<%s' % (hi, lo), c['id'] + ' P range line')
    ok(reject == (z > 1.96), c['id'] + ' reject vs 1.96')


def normal_case(c):
    v = c['values']
    exp = {}
    for k, key in ((1, 'sample1'), (2, 'sample2')):
        x = np.array(v[key], float)
        ok(list(x) == sorted(x) and len(x) == 10, c['id'] + ' sorted sample')
        m, s = x.mean(), x.std(ddof=1)
        exp['mean%d' % k], exp['sd%d' % k] = m, s
        exp['within1SD_%d' % k] = int(((x > m - s) & (x < m + s)).sum())
        exp['within2SD_%d' % k] = int(((x > m - 2 * s) & (x < m + 2 * s)).sum())
        W, P = stats.shapiro(x)
        ok(abs(W - v['W%d' % k]) < 6e-6 and abs(P - v['P%d' % k]) <= 6e-4 * P + 1e-7, '%s Shapiro %d SciPy %s %s' % (c['id'], k, W, P))
        out = v['rOutput%d' % k]
        ok(out[0] == '\tShapiro-Wilk normality test' and out[2] == 'data:  x' and out[3] == 'W = %s, p-value = %s' % (('%.5g' % v['W%d' % k]), ('%.4g' % v['P%d' % k])),
           c['id'] + ' R output %d format' % k)
        ok(out[3] in c['tasks'][2], c['id'] + ' R line quoted in task')
        exp['reject%d' % k] = bool(P < 0.05)
    exp['n'] = 10
    for k, e in exp.items():
        ok((v[k] == e) if isinstance(e, (bool, int)) else close(v[k], e), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    p = (np.arange(1, 11) - 3 / 8) / 10.25
    for i, r in enumerate(c['table']['rows']):
        ok(r[0] == i + 1 and r[1] == v['sample1'][i] and r[2] == v['sample2'][i] and abs(r[3] - p[i]) < 6e-6 and abs(r[4] - stats.norm.ppf(p[i])) < 6e-6, c['id'] + ' table row %d' % i)
    ok(close(c['answer'], v['W2']), c['id'] + ' answer')
    ok(not exp['reject1'] and exp['reject2'], c['id'] + ' design (group 1 consistent with Normal, group 2 rejected)')
    return exp


def groups(c):
    v = c['values']
    S, B = np.array(v[v['groups'][0]], float), np.array(v[v['groups'][1]], float)
    ok(len(S) <= len(B), c['id'] + ' smaller group first')
    allv = np.r_[S, B]
    r = stats.rankdata(allv)
    rows = c['table']['rows']
    ok([x[1] for x in rows] == list(allv) and np.allclose([x[2] for x in rows], r), c['id'] + ' table values and ranks')
    return S, B, allv, r


def mwtable_case(c):
    v = c['values']
    S, B, allv, r = groups(c)
    nS, nB, N = len(S), len(B), len(S) + len(B)
    ok(nB <= 8, c['id'] + ' n_B <= 8')
    T = r[:nS].sum(); mu = nS * (N + 1) / 2
    hits = sum(abs(r[list(cc)].sum() - mu) >= abs(T - mu) - 1e-9 for cc in itertools.combinations(range(N), nS))
    exactP = hits / comb(N, nS)
    (lo, hi), p05, (lo1, hi1), p01 = MW_PRINTED[(nS, nB)]
    # printed P against the exact no-ties null distribution of T
    sums = np.array([sum(cc) for cc in itertools.combinations(range(1, N + 1), nS)])
    for (a, b), pp in (((lo, hi), p05), ((lo1, hi1), p01)):
        if (nS, nB, a, b) == (4, 7, 10, 38):
            # known misprint in MannWhitney_RankSumT_Table.pdf: the printed .01 entry 10,38 has exact P = 2/330 = .006,
            # while the printed P = .012 belongs to 11,37 (4/330). The case records the printed values and the notes flag it.
            ok(abs(((sums <= 10) | (sums >= 38)).mean() - 2 / 330) < 1e-12 and abs(((sums <= 11) | (sums >= 37)).mean() - 0.012) <= 0.0015, c['id'] + ' known misprint')
            continue
        ok(abs(((sums <= a) | (sums >= b)).mean() - pp) <= 0.0015, '%s printed T table %s,%s P %.3f vs exact %.4f' % (c['id'], a, b, pp, ((sums <= a) | (sums >= b)).mean()))
    exp = {'nS': nS, 'nB': nB, 'T': T, 'muT': mu, 'combinations': comb(N, nS), 'exactP': exactP, 'tableP': p05, 'tableP01': p01, 'reject': bool(T <= lo or T >= hi)}
    for k, e in exp.items():
        ok((v[k] == e) if isinstance(e, bool) else close(v[k], e), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    ok(v['critical'] == [lo, hi] and v['critical01'] == [lo1, hi1], c['id'] + ' critical values')
    ok(c['lookup']['value'] == '%d, %d' % (lo, hi) and c['lookup']['row'] == 'n_S = %d, n_B = %d' % (nS, nB) and ('P = .%03d' % round(p05 * 1000)) in c['lookup']['column'], c['id'] + ' lookup')
    ok(close(c['answer'], T), c['id'] + ' answer')
    return exp


def mwnormal_case(c):
    v = c['values']
    S, B, allv, r = groups(c)
    nS, nB, N = len(S), len(B), len(S) + len(B)
    ok(nB > 8, c['id'] + ' n_B > 8')
    T = r[:nS].sum(); mu = nS * (N + 1) / 2; ts = ties(allv)
    sig = np.sqrt(nS * nB * (N + 1) / 12 - nS * nB / (12 * N * (N - 1)) * ts)    # N - 1 form
    z = (abs(T - mu) - 0.5) / sig
    P = 2 * stats.norm.sf(z)
    sp = stats.mannwhitneyu(S, B, use_continuity=True, method='asymptotic')     # SciPy uses the same tie correction
    ok(close(sp.pvalue, P, 1e-9), '%s SciPy P %s vs %s' % (c['id'], sp.pvalue, P))
    ok(close(abs(sp.statistic - nS * nB / 2), abs(T - mu)), c['id'] + ' U vs T')
    # exact permutation P over the average ranks (all C(N, n_S) splits), as values.exactP of the ref Leboyer case
    combos = np.array(list(itertools.combinations(range(N), nS)))
    exactP = float((np.abs(r[combos].sum(1) - mu) >= abs(T - mu) - 1e-9).mean())
    exp = {'nS': nS, 'nB': nB, 'N': N, 'T': T, 'muT': mu, 'tieSum': ts, 'varianceNoTies': nS * nB * (N + 1) / 12, 'sigmaTNoTies': np.sqrt(nS * nB * (N + 1) / 12),
           'sigmaT': sig, 'zT': z, 'exactP': exactP, 'reject': bool(z > 1.96)}
    for k, e in exp.items():
        ok((v[k] == e) if isinstance(e, bool) else close(v[k], e), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    ok(ts > 0, c['id'] + ' needs ties')
    ok(v['critical'] == 1.96 and c['lookup'] == {"path": "sources/tables/t_table.pdf", "page": 2, "row": "∞", "column": "0.05", "value": 1.96, "actualDf": None, "approximation": False}, c['id'] + ' lookup')
    bracket_ok(c, z, exp['reject'])
    ok(close(c['answer'], z), c['id'] + ' answer')
    return exp


def diffs(c, dec):
    v = c['values']
    d = np.round(np.array(v['after'], float) - np.array(v['before'], float), dec)
    ok(np.allclose(d, v['differences']), c['id'] + ' differences')
    rows = c['table']['rows']
    nz = d[d != 0]
    r = stats.rankdata(np.abs(nz)); k = 0
    for row, x in zip(rows, d):
        if x == 0:
            ok(row[4] == 'dropped' and row[5] == 'dropped', c['id'] + ' dropped row')
        else:
            ok(abs(row[3] - x) < 1e-9 and abs(row[4] - r[k]) < 1e-9 and abs(row[5] - np.sign(x) * r[k]) < 1e-9, c['id'] + ' table row'); k += 1
    return d, nz, r


def wtable_case(c):
    v = c['values']
    d, nz, r = diffs(c, 0)
    n = len(nz)
    ok(n <= 8 and (d == 0).any(), c['id'] + ' n <= 8 with a dropped zero')
    W = (np.sign(nz) * r).sum()
    hits = sum(abs((np.array(s) * r).sum()) >= abs(W) - 1e-9 for s in itertools.product([-1, 1], repeat=n))
    row = W_PRINTED[n]
    allW = np.array([sum(s * i for s, i in zip(sg, range(1, n + 1))) for sg in itertools.product([-1, 1], repeat=n)])
    for cv, pp in row:
        ok(abs((np.abs(allW) >= cv).mean() - pp) <= 0.0015, '%s printed W %d P %.3f vs exact %.4f' % (c['id'], cv, pp, (np.abs(allW) >= cv).mean()))
    c05 = min(cv for cv, pp in row if pp <= 0.05)
    exp = {'n': n, 'W': W, 'patterns': 2 ** n, 'critical': c05, 'exactP': hits / 2 ** n, 'reject': bool(abs(W) >= c05)}
    for k, e in exp.items():
        ok((v[k] == e) if isinstance(e, bool) else close(v[k], e), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    # SciPy exact signed-rank P on the nonzero differences, for cross-check of the decision
    sp = stats.wilcoxon(nz, zero_method='wilcox', method='approx', correction=False)
    ok((sp.pvalue < 0.05) == exp['reject'] or abs(sp.pvalue - 0.05) < 0.02, c['id'] + ' SciPy agrees on decision')
    ok(c['lookup']['value'] == c05 and c['lookup']['row'] == 'n = %d' % n, c['id'] + ' lookup')
    ok(close(c['answer'], W), c['id'] + ' answer')
    return exp


def wnormal_case(c, dec):
    v = c['values']
    d, nz, r = diffs(c, dec)
    n = len(nz)
    ok(n > 8, c['id'] + ' n > 8')
    W = (np.sign(nz) * r).sum(); ts = ties(np.abs(nz))
    v0 = n * (n + 1) * (2 * n + 1) / 6
    sig = np.sqrt(v0 - ts / 12); z = (abs(W) - 0.5) / sig
    sp = stats.wilcoxon(nz, zero_method='wilcox', method='approx', correction=False)
    ok(close(abs(W) / abs(sp.zstatistic), sig, 1e-9), '%s SciPy sigma_W %s vs %s' % (c['id'], abs(W) / abs(sp.zstatistic), sig))
    exp = {'n': n, 'W': W, 'tieSum': ts, 'varianceNoTies': v0, 'sigmaW': sig, 'zW': z, 'exactNormalP': 2 * stats.norm.sf(z),
           'pairedT': float(stats.ttest_rel(np.array(v['after'], float), np.array(v['before'], float)).statistic), 'reject': bool(z > 1.96)}
    for k, e in exp.items():
        ok((v[k] == e) if isinstance(e, bool) else close(v[k], e), '%s values.%s %s vs %s' % (c['id'], k, v[k], e))
    ok(ts > 0, c['id'] + ' needs ties')
    bracket_ok(c, z, exp['reject'])
    ok(close(c['answer'], z), c['id'] + ' answer')
    return exp


NUM = r'(-?\d+(?:\.\d+)?)'
EXP, ids, titles = {}, set(), set()
for c in D['cases']:
    cid = c['id']
    ok(cid.startswith('n24-b-') and cid not in ids, cid + ' id'); ids.add(cid)
    ok(c['title'] not in titles, cid + ' title'); titles.add(c['title'])
    ok(c['topic'] in METHODS and c['module'] == 24 and c['source'] == 'Original neuroscience practice example', cid + ' meta')
    rk, rs = REFKEYS[c['topic']]
    ok(set(c) == rk, cid + ' key set %s' % (set(c) ^ rk))
    ok(VALKEYS[c['topic']] <= set(c['values']), cid + ' values keys missing %s' % (VALKEYS[c['topic']] - set(c['values'])))
    ok(len(c['steps']) >= rs, cid + ' steps')
    ok(abs(c['tolerance'] - max(0.001, 0.005 * abs(c['answer']))) < 1e-12, cid + ' tolerance')
    t = c['topic']
    EXP[cid] = {'s24normal': normal_case, 's24mwtable': mwtable_case, 's24mwnormal': mwnormal_case, 's24wtable': wtable_case}[t](c) if t != 's24wnormal' else \
        wnormal_case(c, 1 if any(not float(x).is_integer() for x in c['values']['before']) else 0)
    look_steps = [s['tableLookup'] for s in c['steps'] if 'tableLookup' in s]
    ok((c['lookup'] is None and not look_steps) or (len(look_steps) == 1 and look_steps[0] == c['lookup']), cid + ' step tableLookup vs lookup')
    # wording rule: colons and semicolons are allowed only in context and tasks (the course's exact phrases)
    strict = [c['conclusion'], c['hypotheses']['nullWords'], c['hypotheses']['alternativeWords']] + [s['words'] for s in c['steps']]
    for txt in strict:
        plain = re.sub(r'\\\(.+?\\\)', '', txt)
        ok(':' not in plain and ';' not in plain, cid + ' colon/semicolon in: ' + txt[:60])
    ok(c['hypotheses']['nullWords'].startswith('There is no difference'), cid + ' null in words')
    if c['topic'] != 's24normal':
        ok('no difference in the distributions of' in c['hypotheses']['nullWords'], cid + ' null wording')
    for txt in strict + [c['context']] + c['tasks'] + [c['title']]:
        ok(not re.search(r'\bpictur', txt, re.I) and not re.search(r'professor|lecture|slide|session \d|Session', txt), cid + ' banned word: ' + txt[:60])
    for i, s in enumerate(c['steps']):
        ok(s['general'] and s['work'] and s['words'], cid + ' step %d empty' % i)
        for w in s['work']:
            for a, b, r_, pct in re.findall(r'(?<!sqrt\{)\\frac\{' + NUM + r'\}\{' + NUM + r'\}=' + NUM + r'(\\%)?', w):
                q = float(a) / float(b) * (100 if pct else 1)
                ok(abs(q - float(r_)) <= 2e-5 * max(1, abs(float(r_))), '%s step %d arithmetic: %s' % (cid, i, w))
            for a, b, r_ in re.findall(r'\\sqrt\{\\frac\{' + NUM + r'\}\{' + NUM + r'\}\}=' + NUM, w):
                ok(abs((float(a) / float(b)) ** 0.5 - float(r_)) <= 2e-5 * max(1, float(r_)), '%s step %d arithmetic: %s' % (cid, i, w))
            for a, r_ in re.findall(r'\\sqrt\{' + NUM + r'\}=' + NUM + '$', w):
                ok(abs(float(a) ** 0.5 - float(r_)) <= 2e-5 * max(1, float(r_)), '%s step %d arithmetic: %s' % (cid, i, w))
            mm = re.fullmatch(r'([WT])=([\d.+-]+)=' + NUM, w)
            if mm:
                ok(abs(eval(mm.group(2)) - float(mm.group(3))) < 1e-9, '%s step %d sum: %s' % (cid, i, w))
            mm = re.search(r'\\frac\{(\d+)\((\d+)\)\((\d+)\)\}\{(6|12)\}=' + NUM, w)
            if mm:
                ok(abs(int(mm.group(1)) * int(mm.group(2)) * int(mm.group(3)) / int(mm.group(4)) - float(mm.group(5))) <= 1e-4, '%s step %d product: %s' % (cid, i, w))
            mm = re.search(r'\\frac\{(\d+)\((\d+)\)\}\{12\((\d+)\)\((\d+)\)\}\((\d+)\)=' + NUM, w)
            if mm:
                a, b, N_, N1, ts_, r_ = (float(x) for x in mm.groups())
                ok(abs(a * b / (12 * N_ * N1) * ts_ - r_) <= 2e-5 * max(1, r_) and N1 == N_ - 1, '%s step %d tie term (N - 1 form): %s' % (cid, i, w))
            mm = re.search(r'\\sqrt\{' + NUM + '-' + NUM + r'\}=\\sqrt\{' + NUM + r'\}=' + NUM, w)
            if mm:
                a, b, d_, r_ = (float(x) for x in mm.groups())
                ok(abs(a - b - d_) <= 1e-4 * max(1, d_) and abs(d_ ** 0.5 - r_) <= 2e-5 * r_, '%s step %d sqrt: %s' % (cid, i, w))
            mm = re.search(r'\\sqrt\{' + NUM + r'-\\frac\{(\d+)\}\{12\}\}=\\sqrt\{' + NUM + r'\}=' + NUM, w)
            if mm:
                a, b, d_, r_ = (float(x) for x in mm.groups())
                ok(abs(a - b / 12 - d_) <= 1e-4 * max(1, d_) and abs(d_ ** 0.5 - r_) <= 2e-5 * r_, '%s step %d sqrt: %s' % (cid, i, w))
            mm = re.search(r'\\frac\{\|' + NUM + '-' + NUM + r'\|-0\.5\}\{' + NUM + r'\}=\\frac\{' + NUM + r'\}\{' + NUM + r'\}=' + NUM, w)
            if mm:
                a, b, s_, num, s2, r_ = (float(x) for x in mm.groups())
                ok(abs(abs(a - b) - 0.5 - num) < 1e-9 and s_ == s2 and abs(num / s_ - r_) <= 2e-5 * r_, '%s step %d z: %s' % (cid, i, w))
            mm = re.search(r'z_W=\\frac\{' + NUM + r'-0\.5\}\{' + NUM + r'\}=' + NUM, w)
            if mm:
                a, s_, r_ = (float(x) for x in mm.groups())
                ok(abs((a - 0.5) / s_ - r_) <= 2e-5 * r_, '%s step %d z: %s' % (cid, i, w))
            for a, b, r_ in re.findall(r'(?:^|[=(,\s])' + NUM + '-' + NUM + '=' + NUM + '$', w):
                ok(abs(float(a) - float(b) - float(r_)) <= 1e-5 * (abs(float(a)) + abs(float(b)) + abs(float(r_))), '%s step %d arithmetic: %s' % (cid, i, w))
            # chains of plain-number inequalities must hold
            core = re.sub(r't_\{[\d.]+\}\(\\infty\)=', '', w)
            if re.fullmatch(r'(?:\|[zW]_?[TW]?\|=|[TW]=|\|W\|=)?' + NUM + r'(?:(?:<|>|\\le|\\ge)' + NUM + ')+', core):
                nums = [float(x) for x in re.findall(NUM, core)]
                ops = re.findall(r'<|>|\\le|\\ge', core)
                for j, op in enumerate(ops):
                    a, b = nums[j], nums[j + 1]
                    ok({'<': a < b, '>': a > b, '\\le': a <= b, '\\ge': a >= b}[op], '%s step %d inequality: %s' % (cid, i, w))

topics = [c['topic'] for c in D['cases']]
ok(len(D['cases']) == 10 and all(topics.count(m) == 2 for m in METHODS), 'two cases per method')
rej = [c['values']['reject'] for c in D['cases'] if c['topic'] != 's24normal']
ok(2 <= rej.count(False) <= 4, 'about 1 in 4 rank cases do not reject')
ok(sum(1 for c in D['cases'] if c['topic'] in ('s24wtable', 's24wnormal') and 0 in c['values']['differences']) >= 1, 'a dropped zero difference')

# questions
qids = set()
ok(len(D['questions']) == 10, 'question count')
for i, q in enumerate(D['questions'], 1):
    ok(q['id'] == 'm2-n24-qb%02d' % i and q['id'] not in qids, q['id'] + ' id'); qids.add(q['id'])
    ok(q['module'] == 24 and q['topic'] in METHODS, q['id'] + ' topic')
    ok(len(q['options']) == 4 and len(set(q['options'])) == 4 and q['correct'] in (0, 1, 2, 3), q['id'] + ' options')
    ok(q['case'] is None or q['case'] in ids, q['id'] + ' case')
    ok(q['case'] is None or D['cases'][[c['id'] for c in D['cases']].index(q['case'])]['topic'] == q['topic'], q['id'] + ' topic matches case')
    ok(set(q) == {'id', 'module', 'topic', 'stem', 'options', 'correct', 'why', 'case', 'equations'}, q['id'] + ' keys')
    ok(1 <= len(re.findall(r'[.!?](?:\s|$)', q['why'])) <= 3, q['id'] + ' why length')
ok(len({q['correct'] for q in D['questions']}) == 4, 'correct index should vary')
ok(sum(q['case'] is not None for q in D['questions']) == 6, '60% numeric')
ok(sorted(q['topic'] for q in D['questions']) == sorted(list(METHODS) * 2), 'two questions per method')


def opt_num(q):
    return float(re.search(NUM, q['options'][q['correct']]).group(1))


Qs = {q['id']: q for q in D['questions']}
numeric = {'m2-n24-qb01': EXP['n24-b-pitch-matching-normality']['sd1'], 'm2-n24-qb02': EXP['n24-b-lever-extinction']['T'],
           'm2-n24-qb03': EXP['n24-b-dizziness-vestibular-rehab']['sigmaT'], 'm2-n24-qb04': EXP['n24-b-freezing-extinction']['zT'],
           'm2-n24-qb05': EXP['n24-b-tic-habit-reversal']['W'], 'm2-n24-qb06': EXP['n24-b-sung-spoken-recall']['zW']}
for k, e in numeric.items():
    ok(abs(opt_num(Qs[k]) - e) <= 5e-6 * max(1, abs(e)) * 10, '%s keyed option %s vs %s' % (k, opt_num(Qs[k]), e))
    others = [float(re.search(NUM, o).group(1)) for j, o in enumerate(Qs[k]['options']) if j != Qs[k]['correct']]
    ok(all(abs(x - e) > 1e-3 * max(1, abs(e)) for x in others), k + ' distractor equals the answer')
ok('0.0001167' in Qs['m2-n24-qb07']['stem'] and 'rejected' in Qs['m2-n24-qb07']['options'][Qs['m2-n24-qb07']['correct']], 'qb07 key')
ok('n_B = 11 > 8' in Qs['m2-n24-qb08']['options'][Qs['m2-n24-qb08']['correct']], 'qb08 key')
ok('n = 8' in Qs['m2-n24-qb09']['options'][Qs['m2-n24-qb09']['correct']], 'qb09 key')
ok('reduces' in Qs['m2-n24-qb10']['options'][Qs['m2-n24-qb10']['correct']], 'qb10 key')

if bad:
    print('\n'.join(bad)); print('%d problems' % len(bad)); sys.exit(1)
print('session24b: %d cases and %d questions verified' % (len(D['cases']), len(D['questions'])))
