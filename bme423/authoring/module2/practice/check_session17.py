#!/usr/bin/env python3
"""Independent check of authoring/module2/practice/session17.json.
Recomputes every answer and every `values` entry from the raw table inputs with NumPy/SciPy,
checks every printed critical value against SciPy within table rounding, re-evaluates the
arithmetic of every work line, checks the structure (ids, topics, keys versus the reference case
of the same method) and scans words and conclusions for colons, semicolons and banned words.
Exits 0 only if everything agrees.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session17.py"""
import json, math, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session17.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, '..', 'neuro', 'ref', 'session17.json'), encoding='utf-8'))
METHODS = {m['id'] for m in REF['methods']}
SRC = 'Original practice example in the course style'
# rows printed in sources/tables/t_table.pdf (page 1 up to 46, page 2 from 48)
PRINTED_ROWS = set(range(1, 41)) | {42, 44, 46} | set(range(48, 81, 2)) | {90, 100, 120, 140, 160, 180, 200}
REFKEYS, REFVALKEYS, REFSTEPS = {}, {}, {}
for rc in REF['cases']:
    REFKEYS.setdefault(rc['topic'], set(rc.keys())); REFKEYS[rc['topic']] &= set(rc.keys())
    REFVALKEYS.setdefault(rc['topic'], set(rc['values'])); REFVALKEYS[rc['topic']] &= set(rc['values'])
    REFSTEPS[rc['topic']] = min(REFSTEPS.get(rc['topic'], 99), len(rc['steps']))
REFKEYS['meaning'] = REFKEYS['oneMean']; REFVALKEYS['meaning'] = REFVALKEYS['oneMean']; REFSTEPS['meaning'] = REFSTEPS['oneMean']
REFKEYS['decision'] = REFKEYS['twoMeans'] - {'table'} | {'table'}; REFVALKEYS['decision'] = set(); REFSTEPS['decision'] = 7

errors = []; nchecks = 0
def ok(cond, msg):
    global nchecks; nchecks += 1
    if not cond: errors.append(msg)
def close(a, b, rel=1e-9, ab=1e-12): return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))

# ---------------------------------------------------------------- printed table values
def check_lookup(cid, lk, alpha):
    ok(lk['path'] == 'sources/tables/t_table.pdf', f'{cid} lookup path')
    ok(close(float(lk['column']), alpha), f'{cid} lookup column {lk["column"]} vs alpha {alpha}')
    if lk['row'] == 'infinity':
        ok(lk['page'] == 2, f'{cid} infinity row is on page 2')
        ok(abs(stats.norm.ppf(1 - alpha / 2) - lk['value']) <= 0.00006, f'{cid} z cutoff {lk["value"]}')
        return
    row = int(lk['row'])
    ok(row in PRINTED_ROWS, f'{cid} row {row} is not printed')
    ok(lk['page'] == (1 if row <= 46 else 2), f'{cid} wrong page for row {row}')
    ok(abs(stats.t.ppf(1 - alpha / 2, row) - lk['value']) <= 0.0006, f'{cid} t cutoff {lk["value"]} vs SciPy for row {row}')
    adf = lk['actualDf']
    if lk['approximation']:
        ok(adf not in PRINTED_ROWS and row == max(r for r in PRINTED_ROWS if r < adf), f'{cid} bracket row {row} for df {adf}')
        ok(lk['value'] >= stats.t.ppf(1 - alpha / 2, adf), f'{cid} bracketed cutoff is not conservative')
    else:
        ok(row == adf, f'{cid} row {row} differs from df {adf}')

# ---------------------------------------------------------------- work-line re-evaluation
def latex_to_py(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('\\%', '').replace('\\cdot', '*').replace('\\,', '')
    for _ in range(6):
        s = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s)
        s = re.sub(r'\\sqrt\{([^{}]*)\}', r'sqrt(\1)', s)
        s = re.sub(r'\{([^{}]*)\}', r'(\1)', s)
    s = s.replace('^', '**')
    s = re.sub(r'(\d|\))\s*\(', r'\1*(', s)
    s = re.sub(r'\)\s*(\d)', r')*\1', s)
    return s
def numeric(seg):
    py = latex_to_py(seg.strip())
    if not py or re.search(r'[A-Za-z\\]', py.replace('sqrt', '')): return None
    try: return float(eval(py, {'sqrt': math.sqrt, '__builtins__': {}})), py
    except Exception: return None
NUMTOK = re.compile(r'\d+\.?\d*')
def half_unit(tok):  # numbers are shown to 7 significant figures (trailing zeros dropped), or to 3 decimals from one million up
    v = abs(float(tok))
    if v == 0 or ('.' not in tok and len(tok) < 7): return 0.0
    h = 0.5 * 10 ** (math.floor(math.log10(v)) - 6)
    return min(h, 0.0005) if v >= 1e6 else h
def mag(py):  # bound on the effect of the display rounding of every number in the expression
    ev = lambda q: eval(q, {'sqrt': math.sqrt, '__builtins__': {}})
    base = ev(py); err = 0.0
    for m in NUMTOK.finditer(py):
        h = half_unit(m.group(0))
        if h == 0: continue
        v = float(m.group(0))
        err += max(abs(ev(py[:m.start()] + repr(v + h) + py[m.end():]) - base), abs(ev(py[:m.start()] + repr(v - h) + py[m.end():]) - base))
    return err
def check_work(cid, line):
    for part in re.split(r'\\Rightarrow|,\\quad|,\\ |\\qquad', line):
        if '\\pm' in part: continue
        if '<' in part or '>' in part:
            segs = re.split(r'(<|>)', part); vals = [numeric(s) for s in segs[0::2]]
            for i, op in enumerate(segs[1::2]):
                a, b = vals[i], vals[i + 1]
                if a is not None and b is not None:
                    ok(a[0] < b[0] if op == '<' else a[0] > b[0], f'{cid} comparison fails :: {line}')
            continue
        segs = [numeric(s) for s in re.split(r'=|\\approx', part)]
        vals = [s for s in segs if s is not None]
        for a, b in zip(vals, vals[1:]):
            tol = 1.05 * (mag(a[1]) + mag(b[1])) + 1e-12
            ok(abs(a[0] - b[0]) <= tol, f'{cid} work arithmetic {a[0]} vs {b[0]} :: {line}')

def shown(x, allowed):  # every number displayed in a work line must be a recomputed quantity
    return any(abs(abs(x) - abs(a)) <= 6e-7 * max(abs(a), 1e-12) + 1e-12 or float('%.7g' % a) == abs(x) for a in allowed)
def work_numbers(line):
    s = re.sub(r'_\{[^{}]*\}', '', line); s = re.sub(r'_[0-9A-Za-z]', '', s)
    s = re.sub(r'\\mathrm\{[^{}]*\}|\\text\{[^{}]*\}', '', s)
    return [float(t) for t in re.findall(r'\d+\.?\d*', s)]
def check_numbers(c, allowed):
    allowed = [float(a) for a in allowed] + [0.0, 1.0, 2.0, 100.0, 99.0, 95.0]
    for i, st in enumerate(c['steps']):
        for w in st['work']:
            check_work(c['id'], w)
            for x in work_numbers(w):
                ok(shown(x, allowed), f'{c["id"]} step {i + 1} number {x} is not a recomputed quantity :: {w}')

def cmp_values(c, exp):
    v = c['values']
    ok(set(v) == set(exp), f'{c["id"]} values keys differ {sorted(set(v) ^ set(exp))}')
    for k, e in exp.items():
        if k not in v: continue
        if isinstance(e, bool): ok(v[k] is e, f'{c["id"]} values.{k} {v[k]} vs {e}')
        else: ok(close(v[k], e), f'{c["id"]} values.{k} {v[k]} vs recomputed {e}')

# ---------------------------------------------------------------- methods
def one_mean(c):
    n, x, s = c['table']['rows'][0]
    conf = c['values']['confidence']; alpha = round(1 - conf, 10); df = n - 1
    lk = c['lookup']; check_lookup(c['id'], lk, alpha); ok(lk['actualDf'] == df, f'{c["id"]} df')
    tc = lk['value']; se = s / np.sqrt(n); M = tc * se; L = x - M; U = x + M
    ex = stats.t.interval(conf, df, loc=x, scale=se)
    ok(abs(ex[0] - L) < 0.002 * se and abs(ex[1] - U) < 0.002 * se, f'{c["id"]} interval far from SciPy {ex}')
    exp = {'n': n, 'x': x, 'sd': s, 'confidence': conf, 'df': df, 'se': se, 'critical': tc, 'margin': M, 'lower': L, 'upper': U}
    allowed = [n, x, s, conf, alpha, df, np.sqrt(n), se, tc, M, L, U, U - L]
    rej = None
    if 'reference' in c['values']:
        mu0 = c['values']['reference']; rej = not (L <= mu0 <= U)
        p = 2 * stats.t.sf(abs(x - mu0) / se, df)
        ok(rej == (p < alpha), f'{c["id"]} decision disagrees with the one-sample t test P {p}')
        exp.update({'reference': mu0, 'reject': bool(rej)}); allowed.append(mu0)
        ok(c['hypotheses']['null'].endswith('%g' % mu0), f'{c["id"]} null value')
    cmp_values(c, exp); check_numbers(c, allowed)
    return L, [L, U], rej

def two_means(c):
    (g1, n1, x1, s1), (g2, n2, x2, s2) = c['table']['rows']
    conf = c['values']['confidence']; alpha = round(1 - conf, 10); df = n1 + n2 - 2
    lk = c['lookup']; check_lookup(c['id'], lk, alpha); ok(lk['actualDf'] == df, f'{c["id"]} df')
    tc = lk['value']; d = x1 - x2; v1 = s1 ** 2; v2 = s2 ** 2; A = (n1 - 1) * v1; B = (n2 - 1) * v2
    sp2 = (A + B) / df; inner = sp2 / n1 + sp2 / n2; se = np.sqrt(inner); M = tc * se; L = d - M; U = d + M
    tt = stats.ttest_ind_from_stats(x1, s1, n1, x2, s2, n2, equal_var=True)
    ok(close(tt.statistic, d / se, 1e-9), f'{c["id"]} pooled SE disagrees with SciPy')
    rej = not (L <= 0 <= U)
    ok(rej == (tt.pvalue < alpha), f'{c["id"]} decision disagrees with SciPy P {tt.pvalue}')
    cmp_values(c, {'n1': n1, 'n2': n2, 'x1': x1, 'x2': x2, 's1': s1, 's2': s2, 'confidence': conf, 'df': df, 'variance': sp2,
                   'se': se, 'critical': tc, 'difference': d, 'margin': M, 'lower': L, 'upper': U, 'reject': bool(rej)})
    allowed = [n1, n2, x1, x2, s1, s2, conf, alpha, df, d, v1, v2, A, B, A + B, sp2, inner, se, tc, M, L, U, int(lk['row'])]
    if 'alternativeTableAnswer' in c:
        alt = c['alternativeTableAnswer']; row = int(alt['row'])
        ok(row in PRINTED_ROWS and row > df and abs(stats.t.ppf(1 - alpha / 2, row) - alt['critical']) <= 0.0006, f'{c["id"]} alternative cutoff')
        ok(close(alt['lower'], d - alt['critical'] * se), f'{c["id"]} alternative lower')
        ok((not (d - alt['critical'] * se <= 0 <= d + alt['critical'] * se)) == rej, f'{c["id"]} alternative row changes the decision')
        allowed.append(row)
    check_numbers(c, allowed)
    return L, [L, U], rej

def one_prop(c):
    m, n, p0 = c['table']['rows'][0]
    lk = c['lookup']; check_lookup(c['id'], lk, 0.05); ok(lk['row'] == 'infinity', f'{c["id"]} needs the infinity row')
    z = lk['value']; p = m / n; var = p * (1 - p); se = np.sqrt(var / n); M = z * se; L = p - M; U = p + M; rej = not (L <= p0 <= U)
    ok(rej == (2 * stats.norm.sf(abs(p - p0) / se) < 0.05) or abs(abs(p - p0) / se - 1.96) < 0.0001, f'{c["id"]} decision vs z test')
    cmp_values(c, {'m': m, 'n': n, 'p': p, 'reference': p0, 'confidence': 0.95, 'variance': var, 'se': se, 'critical': z,
                   'margin': M, 'lower': L, 'upper': U, 'reject': bool(rej)})
    check_numbers(c, [m, n, p0, 0.95, 0.05, p, var, var / n, se, z, M, L, U])
    return L, [L, U], rej

def two_prop(c):
    (g1, a1, b1), (g2, a2, b2) = c['table']['rows']
    m1, m2, n1, n2 = a1, a2, a1 + b1, a2 + b2
    lk = c['lookup']; check_lookup(c['id'], lk, 0.05); ok(lk['row'] == 'infinity', f'{c["id"]} needs the infinity row')
    z = lk['value']; p1 = m1 / n1; p2 = m2 / n2; pp = (m1 + m2) / (n1 + n2); var = pp * (1 - pp)
    inner = var / n1 + var / n2; se = np.sqrt(inner); d = p1 - p2; M = z * se; L = d - M; U = d + M; rej = not (L <= 0 <= U)
    pz = 2 * stats.norm.sf(abs(d / se))
    # same pooled z statistic as the chi-square test of the 2x2 table without continuity correction
    chi = stats.chi2_contingency(np.array([[a1, b1], [a2, b2]]), correction=False)[0]
    ok(close(chi, (d / se) ** 2, 1e-9), f'{c["id"]} pooled z does not match the 2x2 chi-square')
    ok(rej == (pz < 0.05), f'{c["id"]} 95% decision vs pooled z P {pz}')
    z9 = c['values']['critical99']; ok(abs(stats.norm.ppf(0.995) - z9) <= 0.00006, f'{c["id"]} 99% cutoff')
    look99 = [s['tableLookup'] for s in c['steps'] if s.get('tableLookup', {}).get('column') == '0.01']
    ok(len(look99) == 1, f'{c["id"]} needs one 0.01 step lookup')
    if look99: check_lookup(c['id'], look99[0], 0.01)
    M9 = z9 * se; L9 = d - M9; U9 = d + M9; rej9 = not (L9 <= 0 <= U9)
    ok(rej9 == (pz < 0.01), f'{c["id"]} 99% decision vs P {pz}')
    prange = 'P < 0.01' if rej9 else ('0.01 < P < 0.05' if rej else 'P > 0.05')
    ok(prange in c['conclusion'], f'{c["id"]} conclusion lacks the P range {prange}')
    cmp_values(c, {'m1': m1, 'n1': n1, 'm2': m2, 'n2': n2, 'p1': p1, 'p2': p2, 'pooled': pp, 'variance': var, 'se': se, 'rawSE': se,
                   'difference': d, 'critical': z, 'confidence': 0.95, 'margin': M, 'lower': L, 'upper': U, 'reject': bool(rej),
                   'critical99': z9, 'margin99': M9, 'lower99': L9, 'upper99': U9, 'reject99': bool(rej9)})
    check_numbers(c, [a1, b1, a2, b2, m1 + m2, n1, n2, n1 + n2, p1, p2, pp, var, inner, se, d, z, M, L, U, 0.05, 0.95, z9, M9, L9, U9, 0.01, 0.99])
    return L, [L, U, L9, U9], rej

def decision(c):
    (_, lo, hi), = c['table']['rows']
    v = c['values']; z = 1.96; z9 = 2.5758
    check_lookup(c['id'], c['lookup'], 0.01)
    for s in c['steps']:
        if 'tableLookup' in s: check_lookup(c['id'], s['tableLookup'], float(s['tableLookup']['column']))
    ok(v['n1'] + v['n2'] - 2 > 200, f'{c["id"]} df must be past the last printed row to use the infinity row')
    d = (lo + hi) / 2; M = (hi - lo) / 2; se = M / z; M9 = z9 * se; L9 = d - M9; U9 = d + M9
    # SciPy check, the reported interval and the rebuilt 99% interval come from the same Normal model
    ex95 = stats.norm.interval(0.95, loc=d, scale=se); ex99 = stats.norm.interval(0.99, loc=d, scale=se)
    ok(abs(ex95[0] - lo) < 1e-4 * M and abs(ex99[0] - L9) < 1e-4 * M9 and abs(ex99[1] - U9) < 1e-4 * M9, f'{c["id"]} intervals vs SciPy')
    rej = not (lo <= 0 <= hi); rej9 = not (L9 <= 0 <= U9); p = 2 * stats.norm.sf(abs(d) / se)
    ok(rej == (p < 0.05) and rej9 == (p < 0.01), f'{c["id"]} decisions vs P {p}')
    ok(('P < 0.01' in c['conclusion']) == rej9, f'{c["id"]} P range text')
    cmp_values(c, {'reportedLower': lo, 'reportedUpper': hi, 'reference': 0, 'confidence': 0.95, 'difference': d, 'margin': M, 'se': se,
                   'critical': z, 'critical99': z9, 'margin99': M9, 'lower99': L9, 'upper99': U9, 'reject': bool(rej), 'reject99': bool(rej9),
                   'n1': v['n1'], 'n2': v['n2']})
    check_numbers(c, [lo, hi, d, M, se, z, z9, M9, L9, U9, 0.01, 0.99])
    return L9, [L9, U9], rej9

FUN = {'oneMean': one_mean, 'meaning': one_mean, 'twoMeans': two_means, 'oneProportion': one_prop, 'twoProportions': two_prop, 'decision': decision}

# ---------------------------------------------------------------- writing rules
ALLOWED_CONTEXT_PHRASES = ['Note: ', '(Note: ']
def text_rule(where, s, context=False):
    plain = re.sub(r'\\\(.+?\\\)', '', s)
    if context:
        for ph in ALLOWED_CONTEXT_PHRASES: plain = plain.replace(ph, '')
    ok(not re.search(r'[:;]', plain), f'{where} has a colon or semicolon :: {s[:90]}')
    ok(not re.search(r'\bpictur', s, re.I), f'{where} uses picture')
    ok(not re.search(r'professor|lecture|slide|session \d|\bsession\b', s, re.I), f'{where} mentions a banned source word')

ids = [c['id'] for c in D['cases']]
ok(len(set(ids)) == len(ids) == 10, 'ten unique case ids')
ok(len({c['title'] for c in D['cases']}) == len(ids), 'unique titles')
counts = {}; contains_null = 0
for c in D['cases']:
    cid = c['id']
    ok(re.fullmatch(r'p17-[a-z0-9-]+', cid) is not None, f'{cid} id form')
    ok(c['topic'] in METHODS, f'{cid} topic'); counts[c['topic']] = counts.get(c['topic'], 0) + 1
    missing = REFKEYS[c['topic']] - set(c.keys()); ok(not missing, f'{cid} missing keys {missing}')
    ok(REFVALKEYS[c['topic']] <= set(c['values']), f'{cid} values lack reference keys {REFVALKEYS[c["topic"]] - set(c["values"])}')
    ok(c['module'] == 17 and c['source'] == SRC, f'{cid} module or source')
    ok(len(c['steps']) >= REFSTEPS[c['topic']], f'{cid} has fewer steps than the reference case')
    L, ends, rej = FUN[c['topic']](c)
    ok(close(c['answer'], L), f'{cid} answer {c["answer"]} vs recomputed {L}')
    ok(c['tolerance'] >= 0.001 and c['tolerance'] <= max(0.001, 0.0051 * abs(L)) + 1e-12, f'{cid} tolerance {c["tolerance"]}')
    if rej is False: contains_null += 1
    step_looks = [s['tableLookup'] for s in c['steps'] if 'tableLookup' in s]
    ok(c['lookup'] in step_looks, f'{cid} case lookup is not shown in a step')
    text_rule(f'{cid} context', c['context'], context=True)
    for t in c['tasks']: text_rule(f'{cid} task', t, context=True)
    text_rule(f'{cid} conclusion', c['conclusion'])
    for s in c['steps']:
        text_rule(f'{cid} step words', s['words'])
        ok(bool(s['general']) and bool(s['work']), f'{cid} step without general or work')
    if c.get('hypotheses'):
        for k in ('nullWords', 'alternativeWords'): text_rule(f'{cid} {k}', c['hypotheses'][k])
    concl = c['conclusion'].replace('−', '-')
    for e in ends: ok(('%.7g' % e) in concl, f'{cid} conclusion does not quote endpoint {e:.7g}')
ok(counts == {'oneMean': 2, 'twoMeans': 2, 'oneProportion': 2, 'twoProportions': 2, 'decision': 1, 'meaning': 1}, f'topic counts {counts}')
ok(2 <= contains_null <= 4, f'{contains_null} cases do not reject')
ok(D['questions'] == [] and isinstance(D.get('notes'), list), 'questions empty and notes present')

if errors:
    print('\n'.join(errors)); print(f'FAILED with {len(errors)} problems'); sys.exit(1)
print(f'OK: {len(D["cases"])} cases verified with {nchecks} checks, {contains_null} cases do not reject the null')
