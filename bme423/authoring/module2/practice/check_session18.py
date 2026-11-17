#!/usr/bin/env python3
"""Independent check of authoring/module2/practice/session18.json.
Recomputes every answer and every `values` entry from the raw table data with NumPy/SciPy
(least-squares fits, scipy.stats.linregress and pearsonr), checks the summations printed in each
context, checks every printed critical value against SciPy within table rounding, re-evaluates the
arithmetic of every work line and checks that each number shown is a recomputed quantity, checks
the structure (ids, topics, keys versus the reference case of the same method) and scans words and
conclusions for colons, semicolons and banned words. Exits 0 only if everything agrees.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session18.py"""
import json, math, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session18.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, '..', 'neuro', 'ref', 'session18.json'), encoding='utf-8'))
METHODS = {m['id'] for m in REF['methods']}
SRC = 'Original practice example in the course style'
PRINTED_ROWS = set(range(1, 41)) | {42, 44, 46} | set(range(48, 81, 2)) | {90, 100, 120, 140, 160, 180, 200}
REFVALKEYS = {}; REFSTEPS = {}; REFKEYS = {}
for rc in REF['cases']:
    REFVALKEYS.setdefault(rc['topic'], []).append(set(rc['values']))
    REFSTEPS[rc['topic']] = min(REFSTEPS.get(rc['topic'], 99), len(rc['steps']))
    REFKEYS.setdefault(rc['topic'], set(rc.keys())); REFKEYS[rc['topic']] &= set(rc.keys())

# invented raw data behind the two lm() summaries of p18-bone-density-age-sex (BMD in mg/cm2)
BMD_AGES = [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 55, 65, 75, 61]
BMD_MEN = [987, 967, 950, 873, 946, 860, 942, 924, 921, 912, 887, 853, 850, 896, 824, 825, 925, 885, 846, 927]
BMD_WOMEN = [957, 889, 947, 940, 810, 822, 865, 833, 831, 783, 838, 820, 777, 805, 765, 698, 924, 800, 803, 865]

errors = []; nchecks = 0
def ok(cond, msg):
    global nchecks; nchecks += 1
    if not cond: errors.append(msg)
def close(a, b, rel=1e-9, ab=1e-12): return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))

def check_lookup(cid, lk, df, main=False):
    col = float(lk['column'])
    ok(lk['path'] == 'sources/tables/t_table.pdf', f'{cid} lookup path')
    row = int(lk['row']); ok(row in PRINTED_ROWS, f'{cid} row {row} not printed')
    ok(lk['page'] == (1 if row <= 46 else 2), f'{cid} page for row {row}')
    ok(abs(stats.t.ppf(1 - col / 2, row) - lk['value']) <= 0.0006, f'{cid} t_{lk["column"]}({row}) printed {lk["value"]}')
    ok(lk['actualDf'] == df, f'{cid} actualDf {lk["actualDf"]} vs df {df}')
    if df in PRINTED_ROWS: ok(row == df and lk['approximation'] is False, f'{cid} row {row} vs df {df}')
    else:
        below = max(r for r in PRINTED_ROWS if r < df); above = min(r for r in PRINTED_ROWS if r > df)
        ok(lk['approximation'] is True and row in (below, above), f'{cid} bracket row {row} for df {df}')
        if main: ok(row == below and lk['value'] >= stats.t.ppf(1 - col / 2, df), f'{cid} main cutoff is not the conservative row')

def p_range(t, row):
    cols = ['0.50', '0.20', '0.10', '0.05', '0.02', '0.01', '0.005', '0.002', '0.001']
    vals = [round(stats.t.ppf(1 - float(c) / 2, row), 3) for c in cols]
    a = abs(t)
    if a > vals[-1]: return 'P < 0.001'
    k = max([i for i, v in enumerate(vals) if a > v], default=-1)
    return 'P > 0.50' if k == -1 else f'{cols[k + 1]} < P < {cols[k]}'
def fmt_range(s): return s

# ---------------------------------------------------------------- work lines
def latex_to_py(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('\\%', '').replace('\\cdot', '*').replace('\\,', '').replace('\\Big', '')
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
                if a is not None and b is not None: ok(a[0] < b[0] if op == '<' else a[0] > b[0], f'{cid} comparison fails :: {line}')
            continue
        vals = [s for s in (numeric(x) for x in re.split(r'=|\\approx', part)) if s is not None]
        for a, b in zip(vals, vals[1:]):
            ok(abs(a[0] - b[0]) <= 1.05 * (mag(a[1]) + mag(b[1])) + 1e-12, f'{cid} work arithmetic {a[0]} vs {b[0]} :: {line}')
    if '\\pm' in line:  # y +- M => L < mu < U
        m = re.match(r'\s*(-?[\d.]+)\\pm(-?[\d.]+)\\Rightarrow\s*(-?[\d.]+)<.*<(-?[\d.]+)\s*$', line)
        ok(m is not None, f'{cid} cannot read the interval line :: {line}')
        if m:
            c, M, L, U = map(float, m.groups())
            ok(abs(c - M - L) <= 1e-6 * (abs(c) + abs(M)) and abs(c + M - U) <= 1e-6 * (abs(c) + abs(M)), f'{cid} interval arithmetic :: {line}')
def work_numbers(line):
    s = re.sub(r'_\{[^{}]*\}', '', line); s = re.sub(r'_[0-9A-Za-z]', '', s)
    s = re.sub(r'\\mathrm\{[^{}]*\}|\\text\{[^{}]*\}', '', s)
    return [float(t) for t in re.findall(r'\d+\.?\d*', s)]
def check_numbers(c, allowed):
    allowed = [abs(float(a)) for a in allowed] + [0.0, 1.0, 2.0, 4.0, 10.0]
    for i, st in enumerate(c['steps']):
        for w in st['work']:
            check_work(c['id'], w)
            for x in work_numbers(w):
                good = any(abs(x - a) <= 6e-7 * max(a, 1e-12) + 1e-12 or float('%.7g' % a) == x or float('%.4g' % a) == x for a in allowed)
                ok(good, f'{c["id"]} step {i + 1} number {x} is not a recomputed quantity :: {w}')

def cmp_values(c, exp):
    v = c['values']
    ok(set(v) == set(exp), f'{c["id"]} values keys differ {sorted(set(v) ^ set(exp))}')
    for k, e in exp.items():
        if k not in v: continue
        if isinstance(e, bool): ok(v[k] is e, f'{c["id"]} values.{k} {v[k]} vs {e}')
        else: ok(close(v[k], e, 1e-8, 1e-10), f'{c["id"]} values.{k} {v[k]} vs recomputed {e}')
    ok(any(rk <= set(v) for rk in REFVALKEYS[c['topic']]), f'{c["id"]} values lack every reference key set of {c["topic"]}')

# ---------------------------------------------------------------- data and fits
def raw(c):
    h = c['table']['headers']; rows = c['table']['rows']
    if len(h) == 6:
        x = [r[k] for k in (0, 2, 4) for r in rows]; y = [r[k] for k in (1, 3, 5) for r in rows]
        x = [r[0] for r in rows] + [r[2] for r in rows] + [r[4] for r in rows]; y = [r[1] for r in rows] + [r[3] for r in rows] + [r[5] for r in rows]
    else:
        ok([r[0] for r in rows] == list(range(1, len(rows) + 1)), f'{c["id"]} row labels')
        x = [r[1] for r in rows]; y = [r[2] for r in rows]
    return np.array(x, float), np.array(y, float)
def fit(x, y):
    n = len(x); X = np.column_stack([np.ones(n), x]); beta = np.linalg.lstsq(X, y, rcond=None)[0]
    res = y - X @ beta; s2 = float(res @ res) / (n - 2); cov = s2 * np.linalg.inv(X.T @ X)
    lr = stats.linregress(x, y)
    ok(close(lr.slope, beta[1], 1e-9) and close(lr.intercept, beta[0], 1e-9, 1e-9) and close(lr.stderr, math.sqrt(cov[1, 1]), 1e-8), 'linregress agrees with lstsq')
    xb = float(x.mean())
    return dict(n=n, a=float(beta[0]), b=float(beta[1]), var=s2, syx=math.sqrt(s2), sa=math.sqrt(cov[0, 0]), sb=math.sqrt(cov[1, 1]),
                xbar=xb, ybar=float(y.mean()), sx=float(x.std(ddof=1)), sy=float(y.std(ddof=1)), r=float(stats.pearsonr(x, y)[0]),
                Sxx=float(((x - xb) ** 2).sum()), Syy=float(((y - y.mean()) ** 2).sum()), Sxy=float(((x - xb) * (y - y.mean())).sum()),
                sumX=float(x.sum()), sumY=float(y.sum()), sumX2=float((x * x).sum()), sumY2=float((y * y).sum()), sumXY=float((x * y).sum()),
                p=lr.pvalue, df=n - 2)
def check_sums(c, F):
    ctx = c['context']
    want = {r'\\sum x_i=': F['sumX'], r'\\sum x_i\^2=': F['sumX2'], r'\\sum\(x_i-\\bar x\)\^2=': F['Sxx'], r'\\sum y_i=': F['sumY'],
            r'\\sum y_i\^2=': F['sumY2'], r'\\sum\(y_i-\\bar y\)\^2=': F['Syy'], r'\\sum x_iy_i=': F['sumXY'],
            r'\\sum\(x_i-\\bar x\)\(y_i-\\bar y\)=': F['Sxy']}
    for pat, val in want.items():
        m = re.search(pat + r'(-?[\d.]+)\\\)', ctx); ok(m is not None, f'{c["id"]} summation {pat} missing from context')
        if m: ok(abs(float(m.group(1)) - val) <= 6e-7 * max(abs(val), 1), f'{c["id"]} summation {pat} {m.group(1)} vs {val}')
    for z in (r'\\sum\(x_i-\\bar x\)=0', r'\\sum\(y_i-\\bar y\)=0'): ok(re.search(z, ctx) is not None, f'{c["id"]} zero summation missing')
    ok('Note: some useful summations have already been calculated for you below, which you can use.' in ctx and 'DO NOT use R.' in ctx, f'{c["id"]} homework sentences')
def base_allowed(F):
    n = F['n']; brk = 1 / n + F['xbar'] ** 2 / F['Sxx']
    return [n, n - 1, n - 2, F['sumX'], F['sumY'], F['sumX2'], F['sumY2'], F['sumXY'], F['Sxx'], F['Syy'], F['Sxy'], F['xbar'], F['ybar'],
            F['b'], F['a'], F['Sxx'] / (n - 1), F['Syy'] / (n - 1), F['sx'], F['b'] ** 2 * F['sx'] ** 2, F['var'], F['syx'], F['sb'], F['sa'], brk,
            n * F['sumX2'], F['sumX'] ** 2, n * F['sumX2'] - F['sumX'] ** 2, n * F['sumXY'], F['sumX'] * F['sumY'], n * F['sumXY'] - F['sumX'] * F['sumY'],
            F['b'] * F['xbar'], F['sumY'] * F['sumX2'] - F['sumX'] * F['sumXY']]

# ---------------------------------------------------------------- methods
def chk_line(c):
    x, y = raw(c); F = fit(x, y); check_sums(c, F); ok(c['lookup'] is None and c['hypotheses'] is None, f'{c["id"]} lookup and hypotheses null')
    exp = dict(n=F['n'], sumX=F['sumX'], sumY=F['sumY'], sumX2=F['sumX2'], sumXY=F['sumXY'], denominator=F['n'] * F['sumX2'] - F['sumX'] ** 2,
               xbar=F['xbar'], ybar=F['ybar'], slope=F['b'], intercept=F['a'])
    extra = []
    if 'change10' in c['values']: exp['change10'] = 10 * F['b']; extra = [10 * F['b']]
    if 'yhat' in c['values']:
        x0 = c['values']['x']; ok(x.min() < x0 < x.max(), f'{c["id"]} prediction inside data'); exp.update(x=x0, yhat=F['a'] + F['b'] * x0); extra = [x0, F['a'] + F['b'] * x0, 100 * F['b']]
    cmp_values(c, exp); check_numbers(c, base_allowed(F) + extra)
    return F['b'], [F['b']]
def chk_syx(c):
    x, y = raw(c); F = fit(x, y); check_sums(c, F); ok(c['lookup'] is None, f'{c["id"]} lookup null')
    exp = dict(n=F['n'], sx=F['sx'], sy=F['sy'], b=F['b'], xbar=F['xbar'], syx=F['syx'], sb=F['sb'], sa=F['sa'], syxRaw=F['syx'], sbRaw=F['sb'], saRaw=F['sa'],
               a=F['a'], varianceAboutLine=F['var'])
    cmp_values(c, exp); check_numbers(c, base_allowed(F))
    return F['syx'], [F['var'], F['syx'], F['sb'], F['sa']]
def chk_slope(c):
    x, y = raw(c); F = fit(x, y); check_sums(c, F); df = F['df']; t = F['b'] / F['sb']
    check_lookup(c['id'], c['lookup'], df, main=True); tc = c['lookup']['value']; ok(c['lookup']['column'] == '0.05', f'{c["id"]} main column')
    rej = abs(t) > tc; ok(rej == (F['p'] < 0.05), f'{c["id"]} decision vs exact P {F["p"]}')
    row = int(c['lookup']['row']); pr = fmt_range(p_range(t, row)); ok(pr in c['conclusion'], f'{c["id"]} P range {pr} not in conclusion')
    exp = dict(n=F['n'], b=F['b'], sb=F['sb'], a=F['a'], sa=F['sa'], df=df, t=t, critical=tc, critical001=round(stats.t.ppf(1 - 0.0005, row), 3),
               slopeLower=F['b'] - tc * F['sb'], slopeUpper=F['b'] + tc * F['sb'], interceptLower=F['a'] - tc * F['sa'], interceptUpper=F['a'] + tc * F['sa'],
               reject=bool(rej), tRaw=t, syx=F['syx'], varianceAboutLine=F['var'])
    for k in c['values']:
        if k.startswith('criticalP'):
            col = float('0.' + k[9:]); exp[k] = round(stats.t.ppf(1 - col / 2, row), 3)
    cmp_values(c, exp)
    for s in c['steps']:
        if 'classTable' in s: check_lookup(c['id'], s['classTable'], df)
    check_numbers(c, base_allowed(F) + [t, abs(t), tc, tc * F['sb'], tc * F['sa'], exp['slopeLower'], exp['slopeUpper'], exp['interceptLower'], exp['interceptUpper'], df, row]
                  + [v for k, v in exp.items() if k.startswith('critical')] + [0.05, 0.02, 0.01, 0.001, 0.005, 0.002, 0.1, 0.2, 0.5])
    return t, [t]
def chk_predict(c):
    x, y = raw(c); F = fit(x, y); check_sums(c, F); df = F['df']; v = c['values']; x0 = v['x']
    ok(x.min() < x0 < x.max() and x0 not in set(x), f'{c["id"]} x0 inside the data and not a data value')
    check_lookup(c['id'], c['lookup'], df, main=True); tc = c['lookup']['value']; row = int(c['lookup']['row'])
    yh = F['a'] + F['b'] * x0; dist = 1 / F['n'] + (x0 - F['xbar']) ** 2 / F['Sxx']; sm = F['syx'] * math.sqrt(dist); sn = math.sqrt(F['var'] + sm ** 2)
    # independent check of both standard errors with the design matrix
    X = np.column_stack([np.ones(F['n']), x]); x0v = np.array([1, x0]); cov = F['var'] * np.linalg.inv(X.T @ X)
    ok(close(math.sqrt(x0v @ cov @ x0v), sm, 1e-8), f'{c["id"]} s_yhat vs matrix form')
    exp = dict(x=x0, yhat=yh, seMean=sm, seNew=sn, critical=tc, meanLower=yh - tc * sm, meanUpper=yh + tc * sm, obsLower=yh - tc * sn, obsUpper=yh + tc * sn, confidence=0.95)
    allowed = base_allowed(F) + [x0, yh, dist, sm, sm ** 2, sn, F['var'] + sm ** 2, tc, tc * sm, tc * sn, exp['meanLower'], exp['meanUpper'], exp['obsLower'], exp['obsUpper'],
                                 x0 - F['xbar'], df, row, F['b'] * x0]
    if 'sumY2' in v:  # full homework form (key set of s18-original-caffeine)
        t = F['b'] / F['sb']; rr = F['r'] ** 2
        exp.update(n=F['n'], sumX=F['sumX'], sumY=F['sumY'], sumX2=F['sumX2'], sumY2=F['sumY2'], sumXY=F['sumXY'], b=F['b'], a=F['a'], varianceAboutLine=F['var'],
                   syx=F['syx'], sb=F['sb'], sa=F['sa'], t=t, df=df, r=F['r'], critical001=round(stats.t.ppf(1 - 0.0005, row), 3))
        ok(F['p'] < 0.001 and fmt_range(p_range(t, row)) in c['conclusion'], f'{c["id"]} slope P range')
        allowed += [t, abs(t), rr, math.sqrt(F['Sxx'] * F['Syy']), F['r'], exp['critical001'], 0.001]
        if 'alternativeCritical' in v:
            alt = v['alternativeCritical']; arow = min(r for r in PRINTED_ROWS if r > df)
            ok(abs(stats.t.ppf(0.975, arow) - alt) <= 0.0006, f'{c["id"]} alternative cutoff')
            ok(abs((yh - alt * sm) - exp['meanLower']) < 1, f'{c["id"]} row change moves the mean interval by 1 or more')
            exp['alternativeCritical'] = alt; allowed += [alt, yh - alt * sm]
    else:
        exp.update(a=F['a'], b=F['b'], syx=F['syx'], n=F['n'], xbar=F['xbar'], sx=F['sx'])
    cmp_values(c, exp)
    for s in c['steps']:
        if 'classTable' in s: check_lookup(c['id'], s['classTable'], df)
    check_numbers(c, allowed + [0.05, 0.001])
    ans = exp['obsLower'] if 'observation' in c['answerName'] else exp['meanLower']
    return ans, [exp['meanLower'], exp['meanUpper'], exp['obsLower'], exp['obsUpper']]
def chk_compare(c):
    x = np.array(BMD_AGES, float); FM = fit(x, np.array(BMD_MEN, float)); FW = fit(x, np.array(BMD_WOMEN, float))
    (gm, nm, aM, saM, bM, sbM, syM, R2M), (gw, nw, aW, saW, bW, sbW, syW, R2W) = c['table']['rows']
    for F, row in ((FM, (aM, saM, bM, sbM, syM, R2M)), (FW, (aW, saW, bW, sbW, syW, R2W))):
        for k, pv in zip(('a', 'sa', 'b', 'sb', 'syx', 'R2'), row):
            exact = F['r'] ** 2 if k == 'R2' else F[k]
            ok(float('%.4g' % exact) == pv, f'{c["id"]} printed {k} {pv} is not the 4-figure rounding of {exact}')
    ok(nm == nw == 20 and FM['p'] < 0.001 and FW['p'] < 0.001, f'{c["id"]} groups and single-slope significance')
    ok(f'{int(x.sum())} yr' in c['context'] and f'\\sum x_i^2={int((x * x).sum())}' in c['context'] and '%.7g' % x.std(ddof=1) in c['context'], f'{c["id"]} age summary in context')
    df = 36; check_lookup(c['id'], c['lookup'], df, main=True); tc = c['lookup']['value']
    diff = bM - bW; se = math.sqrt(sbM ** 2 + sbW ** 2); t = diff / se; rej = abs(t) > tc
    pv_ = ((nm - 2) * syM ** 2 + (nw - 2) * syW ** 2) / df; sx = float(x.std(ddof=1)); pse = math.sqrt(pv_ / ((nm - 1) * sx ** 2) + pv_ / ((nw - 1) * sx ** 2))
    # exact two-line comparison from the raw data (interaction model) for the decision
    xx = np.concatenate([x, x]); yy = np.array(BMD_MEN + BMD_WOMEN, float); g = np.r_[np.zeros(20), np.ones(20)]
    X = np.column_stack([np.ones(40), xx, g, g * xx]); beta = np.linalg.lstsq(X, yy, rcond=None)[0]; res = yy - X @ beta
    cov = (res @ res / 36) * np.linalg.inv(X.T @ X); ti = beta[3] / math.sqrt(cov[3, 3]); pint = 2 * stats.t.sf(abs(ti), 36)
    ok(abs(abs(ti) - abs(t)) < 0.01 and (pint < 0.05) == rej, f'{c["id"]} interaction t {ti} vs {t}')
    pr = fmt_range(p_range(t, 36)); ok(pr in c['conclusion'], f'{c["id"]} P range {pr}')
    exp = dict(nM=nm, nF=nw, bM=bM, sbM=sbM, bF=bW, sbF=sbW, difference=diff, se=se, t=t, df=df, critical=tc, critical002=round(stats.t.ppf(0.99, 36), 3),
               critical010=round(stats.t.ppf(0.95, 36), 3), reject=bool(rej), interceptT=(aM - aW) / math.sqrt(saM ** 2 + saW ** 2),
               femaleXbar=float(x.mean()), femaleSx=sx, pooledVariance=pv_, pooledSE=pse, pooledT=diff / pse)
    cmp_values(c, exp)
    for s in c['steps']:
        if 'classTable' in s: check_lookup(c['id'], s['classTable'], df)
    check_numbers(c, [aM, saM, bM, sbM, syM, aW, saW, bW, sbW, syW, diff, se, se ** 2, sbM ** 2, sbW ** 2, t, abs(t), tc, df, 20, 18, 19, pv_, sx, pse, diff / pse,
                      exp['interceptT'], exp['critical010'], 36, aM - aW, math.sqrt(saM ** 2 + saW ** 2)])
    return t, [t]
def chk_corr(c):
    x, y = raw(c); F = fit(x, y); check_sums(c, F); df = F['df']
    r, p = stats.pearsonr(x, y); rr = r * r; t = r * math.sqrt(df / (1 - rr))
    ok(close(t, F['b'] / F['sb'], 1e-8), f'{c["id"]} r test equals slope test')
    check_lookup(c['id'], c['lookup'], df, main=True); tc = c['lookup']['value']; row = int(c['lookup']['row'])
    rej = abs(t) > tc; ok(rej == (p < 0.05), f'{c["id"]} decision vs pearsonr P {p}')
    pr = fmt_range(p_range(t, row)); ok(pr in c['conclusion'], f'{c["id"]} P range {pr}')
    exp = dict(n=F['n'], sxy=F['Sxy'], sxx=F['Sxx'], syy=F['Syy'], r=r, r2=rr, t=t, df=df, critical=tc, reject=bool(rej), b=F['b'],
               critical001=round(stats.t.ppf(1 - 0.0005, row), 3))
    cmp_values(c, exp)
    pcols = []
    for s in c['steps']:
        if 'classTable' in s: check_lookup(c['id'], s['classTable'], df); pcols.append(s['classTable']['value'])
    check_numbers(c, base_allowed(F) + [r, rr, 1 - rr, t, abs(t), tc, math.sqrt(F['Sxx'] * F['Syy']), math.sqrt(F['Sxx'] / F['Syy']), df, row]
                  + [round(stats.t.ppf(1 - cc / 2, row), 3) for cc in (0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001)] + [0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001])
    return r, [r]
FUN = {'s18line': chk_line, 's18syx': chk_syx, 's18slope': chk_slope, 's18predict': chk_predict, 's18compare': chk_compare, 's18corr': chk_corr}

# ---------------------------------------------------------------- writing rules and structure
def text_rule(where, s, context=False):
    plain = re.sub(r'\\\(.+?\\\)', '', s)
    if context:
        for ph in ('Note: ', '(Note: ', '; there were '): plain = plain.replace(ph, ' ')  # his own homework phrases
    ok(not re.search(r'[:;]', plain), f'{where} has a colon or semicolon :: {s[:90]}')
    ok(not re.search(r'\bpictur', s, re.I), f'{where} uses picture')
    ok(not re.search(r'professor|lecture|slide|\bsession\b', s, re.I), f'{where} mentions a banned source word')

ids = [c['id'] for c in D['cases']]
ok(len(set(ids)) == len(ids) == 10, 'ten unique case ids')
ok(len({c['title'] for c in D['cases']}) == len(ids), 'unique titles')
counts = {}; no_reject = 0
for c in D['cases']:
    cid = c['id']
    ok(re.fullmatch(r'p18-[a-z0-9-]+', cid) is not None, f'{cid} id form')
    ok(c['topic'] in METHODS, f'{cid} topic'); counts[c['topic']] = counts.get(c['topic'], 0) + 1
    ok(not (REFKEYS[c['topic']] - set(c)), f'{cid} missing keys {REFKEYS[c["topic"]] - set(c)}')
    ok(c['module'] == 18 and c['source'] == SRC, f'{cid} module or source')
    ok(len(c['steps']) >= REFSTEPS[c['topic']], f'{cid} fewer steps than the reference case')
    ans, quoted = FUN[c['topic']](c)
    ok(close(c['answer'], ans, 1e-9), f'{cid} answer {c["answer"]} vs recomputed {ans}')
    ok(close(c['tolerance'], max(0.001, round(0.005 * abs(ans), 6)), 1e-6), f'{cid} tolerance')
    if c['values'].get('reject') is False: no_reject += 1
    concl = c['conclusion'].replace('−', '-')
    for q in quoted: ok(('%.7g' % q) in concl or ('%.7g' % abs(q)) in concl, f'{cid} conclusion does not quote {q:.7g}')
    if c['lookup'] is not None:
        ok(c['lookup'] in [s['classTable'] for s in c['steps'] if 'classTable' in s], f'{cid} case lookup is not shown in a step')
    text_rule(f'{cid} context', c['context'], True)
    for t in c['tasks']: text_rule(f'{cid} task', t, True)
    text_rule(f'{cid} conclusion', c['conclusion'])
    for s in c['steps']:
        text_rule(f'{cid} step words', s['words']); ok(bool(s['general']) and bool(s['work']), f'{cid} empty step')
        ok('tableLookup' not in s, f'{cid} step uses tableLookup instead of classTable')
    if c.get('hypotheses'):
        for k in ('nullWords', 'alternativeWords'): text_rule(f'{cid} {k}', c['hypotheses'][k])
ok(counts == {'s18line': 2, 's18syx': 1, 's18slope': 2, 's18predict': 2, 's18compare': 1, 's18corr': 2}, f'topic counts {counts}')
ok(2 <= no_reject <= 4, f'{no_reject} cases do not reject')
ok(D['questions'] == [] and isinstance(D.get('notes'), list), 'questions empty and notes present')

if errors:
    print('\n'.join(errors)); print(f'FAILED with {len(errors)} problems'); sys.exit(1)
print(f'OK: {len(D["cases"])} cases verified with {nchecks} checks, {no_reject} cases do not reject the null')
