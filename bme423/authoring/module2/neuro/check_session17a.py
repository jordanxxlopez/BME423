#!/usr/bin/env python3
"""Independent check of authoring/module2/neuro/session17a.json.
Recomputes every answer and every entry of `values` from the raw table inputs with NumPy/SciPy,
checks the printed critical values against SciPy, checks the numbers shown in every work line,
and checks ids, topics, question links and the writing rules. Exits 0 only if everything agrees."""
import json, math, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session17a.json')))
REF = json.load(open(os.path.join(HERE, 'ref', 'session17.json')))
METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {}
for rc in REF['cases']:
    REFKEYS.setdefault(rc['topic'], set(rc.keys()))
    REFKEYS[rc['topic']] &= set(rc.keys())
PRINTED_ROWS = set(range(1, 41)) | {42, 44, 46} | set(range(48, 81, 2)) | {90, 100, 120, 140, 160, 180, 200}
errors = []
def bad(msg): errors.append(msg)
def close(a, b, tol=1e-9): return abs(a - b) <= tol * max(1.0, abs(a), abs(b))

def check_lookup(cid, lk, conf_alpha):
    if lk['path'] != 'sources/tables/t_table.pdf': bad(f'{cid} lookup path')
    alpha = float(lk['column'])
    if conf_alpha is not None and not close(alpha, conf_alpha): bad(f'{cid} lookup column {alpha} vs alpha {conf_alpha}')
    if lk['row'] == 'infinity':
        exact = stats.norm.ppf(1 - alpha / 2)
        if lk['page'] != 2: bad(f'{cid} infinity row is on page 2')
        if abs(exact - lk['value']) > 0.00006: bad(f'{cid} z cutoff {lk["value"]} vs {exact}')
    else:
        row = int(lk['row'])
        if row not in PRINTED_ROWS: bad(f'{cid} row {row} is not printed')
        if lk['page'] != (1 if row <= 46 else 2): bad(f'{cid} wrong page for row {row}')
        exact = stats.t.ppf(1 - alpha / 2, row)
        if abs(exact - lk['value']) > 0.0006: bad(f'{cid} t cutoff {lk["value"]} vs SciPy {exact} for row {row}')
        adf = lk['actualDf']
        if lk['approximation']:
            lower_rows = [r for r in PRINTED_ROWS if r < adf]
            if adf in PRINTED_ROWS or row != max(lower_rows): bad(f'{cid} bracket row {row} is not the nearest printed row below df {adf}')
            if lk['value'] < stats.t.ppf(1 - alpha / 2, adf): bad(f'{cid} bracketed cutoff is not conservative')
        elif row != adf: bad(f'{cid} row {row} differs from df {adf} without approximation flag')

NUM = re.compile(r'(?<![A-Za-z_\\{^])-?\d+\.?\d*')
def work_numbers(line):
    s = re.sub(r'_\{[^{}]*\}', '', line)            # subscripts such as _{0.05}, _{99}
    s = re.sub(r'_[0-9A-Za-z]', '', s)
    s = re.sub(r'\\mathrm\{[^{}]*\}|\\text\{[^{}]*\}', '', s)
    s = s.replace('\\frac1', '\\frac{1}')
    out = []
    for m in re.finditer(r'-?\d+\.?\d*', s):
        tok = m.group(0)
        if tok.startswith('-') and m.start() > 0 and (s[m.start() - 1].isdigit() or s[m.start() - 1] in ')}'):
            tok = tok[1:]                           # a subtraction sign, not a negative number
        out.append(float(tok))
    return out
def check_work(c, allowed):
    allowed = [float(a) for a in allowed] + [1.0, 2.0, 0.0]
    for i, st in enumerate(c['steps']):
        for w in st['work']:
            for x in work_numbers(w):
                if not any(abs(abs(x) - abs(a)) <= 6e-7 * max(abs(a), 1e-12) + 1e-12 or float('%.7g' % a) == x or float('%.7g' % a) == -x for a in allowed):
                    bad(f'{c["id"]} step {i + 1} work number {x} is not a recomputed quantity :: {w}')

def cmp_values(c, exp):
    v = c['values']
    if set(v) != set(exp): bad(f'{c["id"]} values keys differ: {sorted(set(v) ^ set(exp))}')
    for k, e in exp.items():
        if k not in v: continue
        if isinstance(e, bool):
            if v[k] is not e: bad(f'{c["id"]} values.{k} {v[k]} vs {e}')
        elif not close(v[k], e): bad(f'{c["id"]} values.{k} {v[k]} vs recomputed {e}')

def one_mean(c):
    n, x, s = c['table']['rows'][0]
    conf = c['values']['confidence']; alpha = 1 - conf; df = n - 1
    lk = c['lookup']; check_lookup(c['id'], lk, alpha)
    if lk['actualDf'] != df: bad(f'{c["id"]} df')
    tc = lk['value']; se = s / np.sqrt(n); M = tc * se; L = x - M; U = x + M
    exact = stats.t.interval(conf, df, loc=x, scale=se)
    if abs(exact[0] - L) > 0.001 * se * 2 or abs(exact[1] - U) > 0.001 * se * 2: bad(f'{c["id"]} interval far from SciPy {exact}')
    cmp_values(c, {'n': n, 'x': x, 'sd': s, 'confidence': conf, 'df': df, 'se': se, 'critical': tc, 'margin': M, 'lower': L, 'upper': U})
    check_work(c, [n, x, s, conf, alpha, df, np.sqrt(n), se, tc, M, L, U])
    return L, [L, U]

def two_means(c):
    (g1, n1, x1, s1), (g2, n2, x2, s2) = c['table']['rows']
    conf = c['values']['confidence']; alpha = 1 - conf; df = n1 + n2 - 2
    lk = c['lookup']; check_lookup(c['id'], lk, alpha)
    if lk['actualDf'] != df: bad(f'{c["id"]} df')
    tc = lk['value']; d = x1 - x2; v1 = s1 ** 2; v2 = s2 ** 2; a = (n1 - 1) * v1; b = (n2 - 1) * v2
    sp2 = (a + b) / df; inner = sp2 / n1 + sp2 / n2; se = np.sqrt(inner); M = tc * se; L = d - M; U = d + M
    tt = stats.ttest_ind_from_stats(x1, s1, n1, x2, s2, n2, equal_var=True)
    if not close(tt.statistic, d / se, 1e-9): bad(f'{c["id"]} pooled SE disagrees with SciPy')
    rej = not (L <= 0 <= U)
    if not lk['approximation'] and rej != (tt.pvalue < alpha): bad(f'{c["id"]} decision disagrees with SciPy P {tt.pvalue}')
    if lk['approximation'] and rej and not tt.pvalue < alpha: bad(f'{c["id"]} conservative decision rejects but exact P does not')
    cmp_values(c, {'n1': n1, 'n2': n2, 'x1': x1, 'x2': x2, 's1': s1, 's2': s2, 'confidence': conf, 'df': df, 'variance': sp2,
                   'se': se, 'critical': tc, 'difference': d, 'margin': M, 'lower': L, 'upper': U, 'reject': bool(rej)})
    allowed = [n1, n2, x1, x2, s1, s2, conf, alpha, df, d, v1, v2, a, b, a + b, sp2, inner, se, tc, M, L, U]
    if lk['approximation']: allowed.append(int(lk['row']))
    check_work(c, allowed)
    if 'alternativeTableAnswer' in c:
        alt = c['alternativeTableAnswer']; row = int(alt['row'])
        if row not in PRINTED_ROWS or abs(stats.t.ppf(1 - alpha / 2, row) - alt['critical']) > 0.0006: bad(f'{c["id"]} alternative cutoff')
        if not close(alt['lower'], d - alt['critical'] * se): bad(f'{c["id"]} alternative lower')
    return L, [L, U], rej

def one_prop(c):
    m, n, p0 = c['table']['rows'][0]
    conf = c['values']['confidence']; alpha = 1 - conf
    lk = c['lookup']; check_lookup(c['id'], lk, alpha)
    if lk['row'] != 'infinity': bad(f'{c["id"]} proportion needs the infinity row')
    z = lk['value']; p = m / n; var = p * (1 - p); se = np.sqrt(var / n); M = z * se; L = p - M; U = p + M
    rej = not (L <= p0 <= U)
    cmp_values(c, {'m': m, 'n': n, 'p': p, 'reference': p0, 'confidence': conf, 'variance': var, 'se': se, 'critical': z,
                   'margin': M, 'lower': L, 'upper': U, 'reject': bool(rej)})
    check_work(c, [m, n, p0, conf, alpha, p, var, var / n, se, z, M, L, U])
    return L, [L, U], rej

def two_prop(c):
    (g1, m1, n1), (g2, m2, n2) = c['table']['rows']
    lk = c['lookup']; check_lookup(c['id'], lk, 0.05)
    if lk['row'] != 'infinity': bad(f'{c["id"]} proportion needs the infinity row')
    z = lk['value']; p1 = m1 / n1; p2 = m2 / n2; pp = (m1 + m2) / (n1 + n2); var = pp * (1 - pp)
    inner = var / n1 + var / n2; se = np.sqrt(inner); d = p1 - p2; M = z * se; L = d - M; U = d + M; rej = not (L <= 0 <= U)
    pz = 2 * stats.norm.sf(abs(d / se))
    if rej != (pz < 0.05): bad(f'{c["id"]} decision disagrees with pooled z P {pz}')
    exp = {'m1': m1, 'n1': n1, 'm2': m2, 'n2': n2, 'p1': p1, 'p2': p2, 'pooled': pp, 'variance': var, 'se': se, 'rawSE': se,
           'difference': d, 'critical': z, 'confidence': 0.95, 'margin': M, 'lower': L, 'upper': U, 'reject': bool(rej)}
    allowed = [m1, n1, m2, n2, m1 + m2, n1 + n2, p1, p2, pp, var, inner, se, d, z, M, L, U, 0.05, 0.95]
    if 'critical99' in c['values']:
        z9 = c['values']['critical99']
        if abs(stats.norm.ppf(0.995) - z9) > 0.00006: bad(f'{c["id"]} 99% cutoff')
        look99 = [s['tableLookup'] for s in c['steps'] if s.get('tableLookup', {}).get('column') == '0.01']
        if len(look99) != 1: bad(f'{c["id"]} needs one 0.01 step lookup')
        else: check_lookup(c['id'], look99[0], 0.01)
        M9 = z9 * se; L9 = d - M9; U9 = d + M9; rej9 = not (L9 <= 0 <= U9)
        if rej9 != (pz < 0.01): bad(f'{c["id"]} 99% decision disagrees with P {pz}')
        exp.update({'critical99': z9, 'margin99': M9, 'lower99': L9, 'upper99': U9, 'reject99': bool(rej9)})
        allowed += [z9, M9, L9, U9, 0.01, 0.99]
    cmp_values(c, exp)
    check_work(c, allowed)
    return L, [L, U], rej

FUN = {'oneMean': one_mean, 'twoMeans': two_means, 'oneProportion': one_prop, 'twoProportions': two_prop}
ids = [c['id'] for c in D['cases']]
if len(set(ids)) != len(ids): bad('duplicate case ids')
titles = [c['title'] for c in D['cases']]
if len(set(titles)) != len(titles): bad('duplicate titles')
counts = {}
contains_null = 0
TEXT_BAN = re.compile(r'[:;]')
def text_rule(where, s):
    plain = re.sub(r'\\\(.+?\\\)', '', s)
    if TEXT_BAN.search(plain): bad(f'{where} has a colon or semicolon :: {s[:80]}')
    if re.search(r'\bpictur', s, re.I): bad(f'{where} uses picture')
    if re.search(r'professor|lecture|slide|session \d', s, re.I): bad(f'{where} mentions a banned source word')
for c in D['cases']:
    cid = c['id']
    if not cid.startswith('n17-'): bad(f'{cid} prefix')
    if c['topic'] not in FUN: bad(f'{cid} topic'); continue
    counts[c['topic']] = counts.get(c['topic'], 0) + 1
    missing = REFKEYS[c['topic']] - set(c.keys())
    if missing: bad(f'{cid} missing keys {missing}')
    if c['module'] != 17 or c['source'] != 'Original neuroscience practice example': bad(f'{cid} module or source')
    nref = min(len(rc['steps']) for rc in REF['cases'] if rc['topic'] == c['topic'])
    if len(c['steps']) < nref: bad(f'{cid} has fewer steps than the ref case')
    res = FUN[c['topic']](c)
    L, (lo, hi) = res[0], res[1]
    if not close(c['answer'], L): bad(f'{cid} answer {c["answer"]} vs recomputed {L}')
    if c['answerName'] != 'Lower endpoint': bad(f'{cid} answerName')
    if c['tolerance'] < 0.001 or c['tolerance'] > max(0.002, 0.0051 * abs(L)): bad(f'{cid} tolerance {c["tolerance"]}')
    if len(res) == 3 and not res[2]: contains_null += 1
    step_looks = [s['tableLookup'] for s in c['steps'] if 'tableLookup' in s]
    if c['lookup'] not in step_looks: bad(f'{cid} case lookup is not shown in a step')
    for k in ('context', 'conclusion'): text_rule(f'{cid} {k}', c[k])
    for t in c['tasks']: text_rule(f'{cid} task', t)
    for s in c['steps']:
        text_rule(f'{cid} step words', s['words'])
        if not s['general'] or not s['work']: bad(f'{cid} step without general or work')
    if c.get('hypotheses'):
        for k in ('nullWords', 'alternativeWords'): text_rule(f'{cid} {k}', c['hypotheses'][k])
    # every endpoint quoted in the conclusion must be a recomputed endpoint
    ends = [lo, hi] + [c['values'][k] for k in ('lower99', 'upper99') if k in c['values']]
    for e in ends:
        if ('%.7g' % e) not in c['conclusion']: bad(f'{cid} conclusion does not quote endpoint {e:.7g}')
if counts != {'oneMean': 3, 'twoMeans': 3, 'oneProportion': 2, 'twoProportions': 2}: bad(f'topic counts {counts}')
if not 2 <= contains_null <= 4: bad(f'{contains_null} intervals contain the null value')

qids = [q['id'] for q in D['questions']]
if qids != ['m2-n17-qa%02d' % i for i in range(1, 11)]: bad('question ids')
by = {c['id']: c for c in D['cases']}
def optnum(o):
    m = re.search(r'\\\((-?\d+\.?\d*)\\\)', o); return float(m.group(1)) if m else None
QEXPECT = {  # question id -> independently recomputed correct value
 'm2-n17-qa01': 5.68 - 2.131 * 0.26 / np.sqrt(16),
 'm2-n17-qa02': 2.831 * 18.3 / np.sqrt(22),
 'm2-n17-qa03': np.sqrt(((11 * 11.2 ** 2 + 13 * 13.6 ** 2) / 24) * (1 / 12 + 1 / 14)),
 'm2-n17-qa04': 2.013,
 'm2-n17-qa05': 78 / 240 - 2.5758 * np.sqrt((78 / 240) * (1 - 78 / 240) / 240),
 'm2-n17-qa06': np.sqrt((68 / 173) * (1 - 68 / 173) * (1 / 85 + 1 / 88)),
}
for q in D['questions']:
    if q['module'] != 17 or q['topic'] not in METHODS: bad(f'{q["id"]} module or topic')
    if q['case'] is not None and q['case'] not in by: bad(f'{q["id"]} case link')
    if len(q['options']) != 4 or len(set(q['options'])) != 4 or q['correct'] not in (0, 1, 2, 3): bad(f'{q["id"]} options')
    if q['id'] in QEXPECT:
        got = optnum(q['options'][q['correct']])
        if got is None or abs(got - QEXPECT[q['id']]) > 6e-7 * abs(QEXPECT[q['id']]) + 5e-8: bad(f'{q["id"]} correct option {got} vs {QEXPECT[q["id"]]}')
        if q['case'] is None: bad(f'{q["id"]} numeric question needs a case')
    for s in [q['stem'], q['why']] + q['options']:
        if re.search(r'\bpictur|professor|lecture|slide', s, re.I): bad(f'{q["id"]} banned word')
if len({q['correct'] for q in D['questions']}) < 3: bad('correct index does not vary')
if not isinstance(D.get('notes'), list): bad('notes missing')

if errors:
    print('\n'.join(errors)); print(f'FAILED with {len(errors)} problems'); sys.exit(1)
print(f'OK: {len(D["cases"])} cases and {len(D["questions"])} questions verified, {contains_null} intervals contain the null value')
