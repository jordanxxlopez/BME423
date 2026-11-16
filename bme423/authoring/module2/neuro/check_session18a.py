#!/usr/bin/env python3
"""Independent check of session18a.json (neuroscience pack, Session 18, file a).

Recomputes every case answer and every entry of `values` from the raw inputs
(the (x, y) rows of each case table, or the invented raw data embedded below for
the two R-output cases), checks every printed critical value against SciPy,
re-evaluates the arithmetic of every `work` line, and runs the structural checks.
Run with /Users/jordanlopez/fsl/bin/python3. Exits 0 only if everything agrees.
"""
import json, math, os, re, sys
import numpy as np
from scipy import stats
import statsmodels.api as sm

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session18a.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session18.json'), encoding='utf-8'))
errors = []


def err(*a):
    errors.append(' '.join(str(v) for v in a))


def close(got, want, where, rel=1e-9, ab=1e-9):
    if isinstance(want, bool) or isinstance(got, bool):
        if bool(got) != bool(want):
            err('MISMATCH', where, got, want)
        return
    if not math.isclose(float(got), float(want), rel_tol=rel, abs_tol=ab):
        err('MISMATCH', where, got, want)


# ---------------------------------------------------------------- raw inputs
# Invented raw data behind the two R-output cases (not stored in the JSON).
SWS = [110, 88, 75, 102, 122, 92, 64, 122, 63, 60, 70, 61, 96, 103, 85, 62, 112, 105]
RET = [81, 77, 69, 71, 69, 67, 59, 82, 70, 71, 63, 63, 80, 73, 70, 68, 72, 70]
DOSE = [0.5, 0.5, 1.0, 1.0, 1.5, 1.5, 2.0, 2.0, 2.5, 2.5, 3.0, 3.0, 3.5, 3.5, 4.0, 4.0]
MALE = [236, 204, 256, 165, 403, 374, 355, 405, 430, 393, 509, 451, 498, 477, 580, 556]
FEMALE = [265, 213, 316, 270, 418, 388, 465, 468, 475, 555, 683, 516, 582, 592, 768, 736]


def xy(case):
    r = case['table']['rows']
    return np.array([v[1] for v in r], float), np.array([v[2] for v in r], float)


def fit(x, y):
    """Least squares from deviations (independent of the sums route used in the solutions)."""
    n = len(x)
    dx, dy = x - x.mean(), y - y.mean()
    sxx, syy, sxy = (dx * dx).sum(), (dy * dy).sum(), (dx * dy).sum()
    b = sxy / sxx
    a = y.mean() - b * x.mean()
    res = y - (a + b * x)
    syx = math.sqrt((res ** 2).sum() / (n - 2))
    return dict(n=n, b=b, a=a, sxx=sxx, syy=syy, sxy=sxy, syx=syx, sb=syx / math.sqrt(sxx),
                sa=syx * math.sqrt(1 / n + x.mean() ** 2 / sxx), xbar=x.mean(), ybar=y.mean(),
                sx=x.std(ddof=1), sy=y.std(ddof=1), r=sxy / math.sqrt(sxx * syy))


def tcrit(df, alpha):
    return stats.t.ppf(1 - alpha / 2, df)


def check_lookup(lk, where):
    """A printed table value must equal the SciPy quantile to the 3 printed decimals."""
    if lk is None:
        return
    for k in ('path', 'page', 'row', 'column', 'value', 'actualDf', 'approximation'):
        if k not in lk:
            err('LOOKUP KEY', where, k)
    if lk['path'] != 'sources/tables/t_table.pdf' or lk['page'] != 1:
        err('LOOKUP PATH', where)
    exact = tcrit(int(lk['row']), float(lk['column']))
    if abs(exact - lk['value']) > 0.00051:
        err('CRITICAL VALUE', where, lk, exact)
    if int(lk['row']) != lk['actualDf'] or lk['approximation']:
        err('LOOKUP ROW', where, lk)


def compare(case, want):
    v = case['values']
    if set(v) != set(want):
        err('VALUE KEYS', case['id'], sorted(set(v) ^ set(want)))
    for k, w in want.items():
        if k in v:
            close(v[k], w, case['id'] + ' values.' + k, rel=1e-8)


def same_sums(case, x, y):
    """The summations printed in the context must be the true ones."""
    n = len(x)
    want = [x.sum(), (x * x).sum(), ((x - x.mean()) ** 2).sum(), y.sum(), (y * y).sum(),
            ((y - y.mean()) ** 2).sum(), (x * y).sum(), ((x - x.mean()) * (y - y.mean())).sum()]
    m = re.search(r'The summations are (.*)$', case['context'].replace('\u2212', '-'))
    if not m:
        err('NO SUMMATIONS', case['id'])
        return
    got = [float(s) for s in re.findall(r'= (-?[0-9.]+?)(?:,| and|\.$)', m.group(1))]
    if len(got) != 8:
        err('SUMMATION COUNT', case['id'], got)
        return
    for g_, w_ in zip(got, want):
        close(g_, w_, case['id'] + ' context summation', rel=5e-7)


C = {c['id']: c for c in D['cases']}

# ---------------------------------------------------------------- s18line
for cid in ('n18-toddler-vocabulary', 'n18-vot-speaking-rate'):
    c = C[cid]
    x, y = xy(c)
    f = fit(x, y)
    same_sums(c, x, y)
    pf = np.polyfit(x, y, 1)
    close(f['b'], pf[0], cid + ' polyfit slope', rel=1e-9)
    compare(c, dict(n=f['n'], sumX=x.sum(), sumY=y.sum(), sumX2=(x * x).sum(), sumXY=(x * y).sum(),
                    denominator=f['n'] * (x * x).sum() - x.sum() ** 2, xbar=f['xbar'], ybar=f['ybar'],
                    slope=pf[0], intercept=pf[1]))
    close(c['answer'], pf[0], cid + ' answer', rel=1e-9)

# ---------------------------------------------------------------- s18syx
c = C['n18-reading-speed-age']
x, y = xy(c)
f = fit(x, y)
same_sums(c, x, y)
lr = stats.linregress(x, y)
close(f['sb'], lr.stderr, 'reading sb vs linregress', rel=1e-9)
close(f['sa'], lr.intercept_stderr, 'reading sa vs linregress', rel=1e-9)
compare(c, dict(n=12, sx=f['sx'], sy=f['sy'], b=lr.slope, xbar=f['xbar'], syx=f['syx'], sb=lr.stderr,
                sa=lr.intercept_stderr, syxRaw=f['syx'], sbRaw=lr.stderr, saRaw=lr.intercept_stderr))
close(c['answer'], f['syx'], 'reading answer')

# ---------------------------------------------------------------- s18slope
for cid, df, expect_reject in (('n18-p300-latency-development', 9, True), ('n18-cortisol-digit-span', 8, False)):
    c = C[cid]
    x, y = xy(c)
    f = fit(x, y)
    same_sums(c, x, y)
    lr = stats.linregress(x, y)
    t = lr.slope / lr.stderr
    crit = c['values']['critical']
    if abs(crit - tcrit(df, 0.05)) > 0.00051 or abs(c['values']['critical001'] - tcrit(df, 0.001)) > 0.00051:
        err('CRITICAL', cid)
    rej = abs(t) > crit
    if rej != expect_reject or (lr.pvalue < 0.05) != rej:
        err('DECISION', cid, t, lr.pvalue)
    compare(c, dict(n=len(x), b=lr.slope, sb=lr.stderr, a=lr.intercept, sa=lr.intercept_stderr, df=df, t=t,
                    critical=crit, critical001=c['values']['critical001'],
                    slopeLower=lr.slope - crit * lr.stderr, slopeUpper=lr.slope + crit * lr.stderr,
                    interceptLower=lr.intercept - crit * lr.intercept_stderr,
                    interceptUpper=lr.intercept + crit * lr.intercept_stderr, reject=rej, tRaw=t))
    close(c['answer'], t, cid + ' answer')
    c['_p'] = lr.pvalue

# ---------------------------------------------------------------- s18predict (by hand)
for cid, x0, key in (('n18-age-hearing-threshold', 65, 'meanLower'), ('n18-speech-rate-recognition', 6.8, 'obsLower')):
    c = C[cid]
    x, y = xy(c)
    f = fit(x, y)
    same_sums(c, x, y)
    if x0 in x.tolist():
        err('X0 IS A DATA VALUE', cid)
    n = len(x)
    crit = c['values']['critical']
    if abs(crit - tcrit(n - 2, 0.05)) > 0.00051:
        err('CRITICAL', cid)
    # statsmodels gives the same standard errors
    res = sm.OLS(y, sm.add_constant(x)).fit()
    pr = res.get_prediction(np.array([[1.0, x0]]))
    se_mean = float(pr.se_mean[0])
    se_new = float(np.sqrt(pr.var_pred_mean[0] + res.mse_resid))
    yhat = float(pr.predicted_mean[0])
    compare(c, dict(a=res.params[0], b=res.params[1], syx=math.sqrt(res.mse_resid), n=n, xbar=x.mean(),
                    sx=x.std(ddof=1), x=x0, yhat=yhat, seMean=se_mean, seNew=se_new, critical=crit,
                    meanLower=yhat - crit * se_mean, meanUpper=yhat + crit * se_mean,
                    obsLower=yhat - crit * se_new, obsUpper=yhat + crit * se_new, confidence=0.95))
    close(c['answer'], c['values'][key], cid + ' answer')
    close(c['answer'], yhat - crit * (se_mean if key == 'meanLower' else se_new), cid + ' answer recomputed', rel=1e-8)


# ---------------------------------------------------------------- R output helpers
def r_rows(lines):
    """Parse the coefficient rows of an R summary(lm()) printout."""
    out = {}
    for ln in lines:
        m = re.match(r'^(\(Intercept\)|[A-Za-z.]+)\s+(-?[\d.]+)\s+([\d.]+)\s+(-?[\d.]+)\s+(<?[\d.e-]+)', ln)
        if m:
            out.setdefault(m.group(1), []).append(tuple(m.group(i) for i in (2, 3, 4, 5)))
    return out


def printed_ok(txt, true, where):
    """A printed number must be the true value rounded to the printed digits."""
    if txt.startswith('<'):
        return
    if 'e' in txt:
        mant = txt.split('e')[0]
        dec = len(mant.split('.')[1]) if '.' in mant else 0
        if f'{true:.{dec}e}'.replace('e-0', 'e-') != txt.replace('e-0', 'e-'):
            err('R PRINT', where, txt, true)
        return
    dec = len(txt.split('.')[1]) if '.' in txt else 0
    if abs(float(txt) - true) > 0.5000001 * 10 ** (-dec):
        err('R PRINT', where, txt, true)


def check_r_block(lines, x, y, where):
    res = sm.OLS(np.array(y, float), sm.add_constant(np.array(x, float))).fit()
    rows = r_rows(lines)
    names = [k for k in rows if k != '(Intercept)']
    if len(rows) != 2 or len(names) != 1:
        err('R ROWS', where, rows)
        return None
    for i, nm in enumerate(('(Intercept)', names[0])):
        est, se, tv, pv = rows[nm][0]
        printed_ok(est, res.params[i], where + ' est')
        printed_ok(se, res.bse[i], where + ' se')
        printed_ok(tv, res.tvalues[i], where + ' t')
        printed_ok(pv, res.pvalues[i], where + ' p')
    txt = '\n'.join(lines)
    m = re.search(r'Residual standard error: ([\d.]+) on (\d+) degrees', txt)
    printed_ok(m.group(1), math.sqrt(res.mse_resid), where + ' rse')
    if int(m.group(2)) != int(res.df_resid):
        err('R DF', where)
    m = re.search(r'Multiple R-squared:\s+([\d.]+),\tAdjusted R-squared:\s+([\d.]+)', txt)
    printed_ok(m.group(1), res.rsquared, where + ' R2')
    printed_ok(m.group(2), res.rsquared_adj, where + ' adjR2')
    m = re.search(r'F-statistic: ([\d.]+) on 1 and (\d+) DF,  p-value: ([\d.e-]+)', txt)
    printed_ok(m.group(1), res.fvalue, where + ' F')
    printed_ok(m.group(3), res.f_pvalue, where + ' Fp')
    q = np.percentile(res.resid, [0, 25, 50, 75, 100])
    i = lines.index('Residuals:')
    for s_, t_ in zip(lines[i + 2].split(), q):
        printed_ok(s_, t_, where + ' residual quantile')
    return dict(a=float(rows['(Intercept)'][0][0]), sa=float(rows['(Intercept)'][0][1]),
                ta=float(rows['(Intercept)'][0][2]), b=float(rows[names[0]][0][0]), sb=float(rows[names[0]][0][1]),
                tb=float(rows[names[0]][0][2]), syx=float(re.search(r'error: ([\d.]+)', txt).group(1)),
                R2=float(re.search(r'Multiple R-squared:\s+([\d.]+)', txt).group(1)), fit=res)


# ---------------------------------------------------------------- s18predict (R output)
c = C['n18-slow-wave-sleep-retention']
R = check_r_block(c['rOutput'], SWS, RET, 'sws')
x = np.array(SWS, float)
n, x0 = 18, 90
if x0 in SWS:
    err('X0 IS A DATA VALUE sws')
rows = c['table']['rows']
for row, (e_, s_, t_) in zip(rows, ((R['a'], R['sa'], R['ta']), (R['b'], R['sb'], R['tb']))):
    close(row[1], e_, 'sws table est')
    close(row[2], s_, 'sws table se')
    close(row[3], t_, 'sws table t')
if f"{int(x.sum())} min" not in c['context'] or f"Σx² = {int((x * x).sum())}" not in c['context']:
    err('SWS CONTEXT SUMS')
if f"residual standard error of {R['syx']:g} " not in c['context'] or f"R-squared {R['R2']:g}." not in c['context']:
    err('SWS CONTEXT RSE/R2')
crit = c['values']['critical']
if abs(crit - tcrit(16, 0.05)) > 0.00051:
    err('CRITICAL sws')
sxx = ((x - x.mean()) ** 2).sum()
yhat = R['a'] + R['b'] * x0
se_mean = R['syx'] * math.sqrt(1 / n + (x0 - x.mean()) ** 2 / sxx)
se_new = math.sqrt(R['syx'] ** 2 + se_mean ** 2)
compare(c, dict(n=18, a=R['a'], sa=R['sa'], b=R['b'], sb=R['sb'], syx=R['syx'], R2=R['R2'], xbar=x.mean(),
                sx=x.std(ddof=1), x=x0, critical=crit, slopeLower=R['b'] - crit * R['sb'],
                slopeUpper=R['b'] + crit * R['sb'], interceptLower=R['a'] - crit * R['sa'],
                interceptUpper=R['a'] + crit * R['sa'], r=math.sqrt(R['R2']), yhat=yhat, seMean=se_mean,
                meanLower=yhat - crit * se_mean, meanUpper=yhat + crit * se_mean, seNew=se_new,
                obsLower=yhat - crit * se_new, obsUpper=yhat + crit * se_new, confidence=0.95))
close(c['answer'], yhat - crit * se_mean, 'sws answer')
# the rounded-output route must agree closely with the full-precision fit
pr = R['fit'].get_prediction(np.array([[1.0, x0]]))
ci = pr.conf_int(alpha=0.05)[0]
if abs(ci[0] - c['values']['meanLower']) > 0.02 or abs(np.corrcoef(SWS, RET)[0, 1] - c['values']['r']) > 0.0005:
    err('SWS FULL PRECISION', ci, c['values']['meanLower'])

# ---------------------------------------------------------------- s18compare
c = C['n18-amphetamine-locomotion-sex']
blocks = '\n'.join(c['rOutput']).split('> summary(')
RM = check_r_block(blocks[1].split('\n'), DOSE, MALE, 'males')
RF = check_r_block(blocks[2].split('\n'), DOSE, FEMALE, 'females')
for row, R_ in zip(c['table']['rows'], (RM, RF)):
    for got, want in zip(row[1:], (16, R_['a'], R_['sa'], R_['b'], R_['sb'], R_['syx'], R_['R2'])):
        close(got, want, 'compare table')
d = np.array(DOSE)
sxx = ((d - d.mean()) ** 2).sum()
diff = RM['b'] - RF['b']
se = math.sqrt(RM['sb'] ** 2 + RF['sb'] ** 2)
t = diff / se
pv = (14 * RM['syx'] ** 2 + 14 * RF['syx'] ** 2) / 28
pse = math.sqrt(pv / sxx + pv / sxx)
v = c['values']
for key, alpha in (('critical', 0.05), ('critical002', 0.02), ('critical01', 0.01)):
    if abs(v[key] - tcrit(28, alpha)) > 0.00051:
        err('CRITICAL compare', key)
compare(c, dict(nM=16, nF=16, bM=RM['b'], sbM=RM['sb'], bF=RF['b'], sbF=RF['sb'], difference=diff, se=se, t=t,
                df=28, critical=v['critical'], critical002=v['critical002'], critical01=v['critical01'],
                reject=abs(t) > v['critical'],
                interceptT=(RM['a'] - RF['a']) / math.sqrt(RM['sa'] ** 2 + RF['sa'] ** 2), femaleXbar=d.mean(),
                femaleSx=d.std(ddof=1), pooledVariance=pv, pooledSE=pse, pooledT=diff / pse))
close(c['answer'], t, 'compare answer')
if not (v['critical002'] < abs(t) < v['critical01']):
    err('COMPARE P RANGE', t)
p_exact = 2 * stats.t.sf(abs(t), 28)
if not (0.01 < p_exact < 0.02):
    err('COMPARE P', p_exact)
# full-precision interaction model gives the same test (equal n, shared doses)
X = np.column_stack([np.ones(32), np.r_[d, d], np.r_[np.zeros(16), np.ones(16)], np.r_[np.zeros(16), d]])
inter = sm.OLS(np.r_[MALE, FEMALE].astype(float), X).fit()
if abs(-inter.tvalues[3] - t) > 0.01:
    err('COMPARE INTERACTION', inter.tvalues[3], t)
if f"total {d.sum():g} mg/kg with Σx² = {(d * d).sum():g}" not in c['context']:
    err('COMPARE CONTEXT SUMS')

# ---------------------------------------------------------------- s18corr
c = C['n18-music-training-pitch']
x, y = xy(c)
f = fit(x, y)
same_sums(c, x, y)
r, p = stats.pearsonr(x, y)
t = r * math.sqrt(8 / (1 - r * r))
close(t, stats.linregress(x, y).slope / stats.linregress(x, y).stderr, 'corr t equals slope t', rel=1e-9)
if abs(c['values']['critical'] - tcrit(8, 0.05)) > 0.00051:
    err('CRITICAL corr')
compare(c, dict(n=10, sxy=f['sxy'], sxx=f['sxx'], syy=f['syy'], r=r, r2=r * r, t=t, df=8,
                critical=c['values']['critical'], reject=abs(t) > c['values']['critical']))
close(c['answer'], r, 'corr answer')
if not (p < 0.001 and abs(t) > 5.041):
    err('CORR P RANGE')

# ---------------------------------------------------------------- lookups and stated P ranges
for c in D['cases']:
    check_lookup(c['lookup'], c['id'])
    for i, s in enumerate(c['steps']):
        check_lookup(s.get('classTable'), f"{c['id']} step{i}")
        for w in s['work']:  # every t_{alpha}(df)=value printed in a work line
            for a_, df_, val in re.findall(r't_\{([\d.]+)\}\((\d+)\)=([\d.]+)', w):
                if abs(tcrit(int(df_), float(a_)) - float(val)) > 0.00051:
                    err('WORK CRITICAL', c['id'], w)
    for txt in [c['conclusion']] + [s['words'] for s in c['steps']]:
        for df_, val in re.findall(r't_\{0\.05\}\((\d+)\)=([\d.]+)', txt):
            if abs(tcrit(int(df_), 0.05) - float(val)) > 0.00051:
                err('TEXT CRITICAL', c['id'], txt)
if not (C['n18-p300-latency-development']['_p'] < 0.001 and 'P < 0.001' in C['n18-p300-latency-development']['conclusion']):
    err('P300 P RANGE')
if not (C['n18-cortisol-digit-span']['_p'] > 0.2 and 'P > 0.05' in C['n18-cortisol-digit-span']['conclusion']):
    err('CORTISOL P RANGE')
if '0.01 < P < 0.02' not in C['n18-amphetamine-locomotion-sex']['conclusion']:
    err('COMPARE CONCLUSION P')


# ---------------------------------------------------------------- arithmetic of every work line
def split_top(s, seps):
    """Split on any of `seps` at brace/paren depth 0."""
    out, depth, cur, i = [], 0, '', 0
    while i < len(s):
        ch = s[i]
        if ch in '{(':
            depth += 1
        elif ch in '})':
            depth -= 1
        hit = None
        if depth == 0:
            for sp in seps:
                if s.startswith(sp, i):
                    hit = sp
                    break
        if hit:
            out.append(cur)
            cur = ''
            i += len(hit)
        else:
            cur += ch
            i += 1
    out.append(cur)
    return out


def grab(s, i):
    """Return the {...} group starting at s[i] and the index after it."""
    assert s[i] == '{', s
    depth, j = 0, i
    while True:
        if s[j] == '{':
            depth += 1
        elif s[j] == '}':
            depth -= 1
            if depth == 0:
                return s[i + 1:j], j + 1
        j += 1


def to_py(s):
    out, i = '', 0
    while i < len(s):
        if s.startswith('\\frac', i):
            a, j = grab(s, i + 5)
            b, j = grab(s, j)
            out += f'(({to_py(a)})/({to_py(b)}))'
            i = j
        elif s.startswith('\\sqrt', i):
            a, j = grab(s, i + 5)
            out += f'sqrt({to_py(a)})'
            i = j
        elif s.startswith('\\cdot', i):
            out += '*'
            i += 5
        elif s.startswith('\\left', i):
            i += 5
        elif s.startswith('\\right', i):
            i += 6
        elif s[i] == '^':
            if s[i + 1] == '{':
                a, j = grab(s, i + 1)
                out += f'**({to_py(a)})'
                i = j
            else:
                out += '**' + s[i + 1]
                i += 2
        elif s[i] in '{}':
            out += '(' if s[i] == '{' else ')'
            i += 1
        else:
            out += s[i]
            i += 1
    out = out.replace(' ', '')
    out = re.sub(r'(?<=[\d)])(?=\()', '*', out)        # 10(3.2) -> 10*(3.2)
    out = re.sub(r'(?<=\))(?=[\d(])', '*', out)        # (a)(b), (a)2
    out = re.sub(r'(?<=[\d)])(?=sqrt)', '*', out)      # 3sqrt(..)
    return out


def value(side):
    side = side.strip()
    if not side or re.search(r'[A-Za-z\\]', re.sub(r'\\(frac|sqrt|cdot|left|right)', '', side)):
        return None
    try:
        return float(eval(to_py(side), {'__builtins__': {}}, {'sqrt': math.sqrt}))
    except Exception as e:  # a numeric-looking side that cannot be evaluated is an error
        err('CANNOT EVALUATE', side, e)
        return None


n_checked = 0
for c in D['cases']:
    for si, s in enumerate(c['steps']):
        for w in s['work']:
            for piece in split_top(w, ['\\Rightarrow', ',\\ ', ',\\quad', '\\quad']):
                if '\\pm' in piece:
                    continue
                for chain in split_top(piece, ['<', '>']):
                    vals = [v for v in (value(x_) for x_ in split_top(chain, ['='])) if v is not None]
                    for u, v_ in zip(vals, vals[1:]):
                        n_checked += 1
                        if not math.isclose(u, v_, rel_tol=2e-5, abs_tol=2e-6):
                            err('ARITHMETIC', c['id'], f'step{si}', w, u, v_)
                # inequalities between plain numbers must be true
                m = re.fullmatch(r'\s*(-?[\d.]+)\s*([<>])\s*(-?[\d.]+)(?:\s*([<>])\s*(-?[\d.]+))?\s*', piece)
                if m:
                    nums = [float(m.group(1)), float(m.group(3))] + ([float(m.group(5))] if m.group(5) else [])
                    ops = [m.group(2)] + ([m.group(4)] if m.group(4) else [])
                    for (u, v_), op in zip(zip(nums, nums[1:]), ops):
                        n_checked += 1
                        if not (u < v_ if op == '<' else u > v_):
                            err('INEQUALITY', c['id'], w)
            # "A \pm M \Rightarrow lo < sym < hi"
            m = re.search(r'(-?[\d.]+)\\pm([\d.]+)\\Rightarrow\s*(-?[\d.]+)<[^<]+<(-?[\d.]+)', w)
            if m:
                A, M, lo, hi = (float(m.group(i)) for i in range(1, 5))
                n_checked += 1
                if not (math.isclose(A - M, lo, rel_tol=2e-5, abs_tol=2e-5) and math.isclose(A + M, hi, rel_tol=2e-5, abs_tol=2e-5)):
                    err('INTERVAL', c['id'], w)
            m = re.fullmatch(r'(-?[\d.]+)-([\d.]+)<[^<]+<(-?[\d.]+)\+([\d.]+)', w)
            if m and (m.group(1) != m.group(3) or m.group(2) != m.group(4)):
                err('INTERVAL FORM', c['id'], w)
if n_checked < 150:
    err('TOO FEW ARITHMETIC CHECKS', n_checked)

# ---------------------------------------------------------------- structure
METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {}
for rc in REF['cases']:
    REFKEYS.setdefault(rc['topic'], set(rc.keys()))
REFSTEPS = {}
for rc in REF['cases']:
    REFSTEPS[rc['topic']] = min(REFSTEPS.get(rc['topic'], 99), len(rc['steps']))
REFSTEPS['s18predict'] = 8  # the hand case s18-martians-at40
ids = [c['id'] for c in D['cases']]
if len(ids) != 10 or len(set(ids)) != 10 or any(not i.startswith('n18-') for i in ids):
    err('CASE IDS', ids)
want_topics = {'s18line': 2, 's18syx': 1, 's18slope': 2, 's18predict': 3, 's18compare': 1, 's18corr': 1}
got_topics = {}
for c in D['cases']:
    got_topics[c['topic']] = got_topics.get(c['topic'], 0) + 1
if got_topics != want_topics:
    err('TOPIC COUNTS', got_topics)
BAD = re.compile(r'[:;]')
for c in D['cases']:
    cid = c['id']
    keys = set(c.keys()) - {'_p'}
    extra = keys - REFKEYS[c['topic']]
    if REFKEYS[c['topic']] - keys or extra - {'rOutput', 'rCode'}:
        err('CASE KEYS', cid, REFKEYS[c['topic']] ^ keys)
    if c['topic'] not in METHODS or c['module'] != 18 or c['source'] != 'Original neuroscience practice example':
        err('META', cid)
    if len(c['steps']) < REFSTEPS[c['topic']]:
        err('STEP COUNT', cid, len(c['steps']))
    if not math.isclose(c['tolerance'], max(0.005 * abs(c['answer']), 0.001), rel_tol=1e-9):
        err('TOLERANCE', cid)
    if (c['hypotheses'] is None) != (c['topic'] in ('s18line', 's18syx', 's18predict')):
        err('HYPOTHESES', cid)
    if (c['lookup'] is None) != (c['topic'] in ('s18line', 's18syx')):
        err('LOOKUP NULL', cid)
    texts = [('context', c['context']), ('conclusion', c['conclusion'])] + [('task', t_) for t_ in c['tasks']] + \
            [('words', s['words']) for s in c['steps']]
    if c['hypotheses']:
        texts += [('nullWords', c['hypotheses']['nullWords']), ('altWords', c['hypotheses']['alternativeWords'])]
    for name, t_ in texts:
        # his own homework sentence keeps its colon in the question text (context and tasks only)
        if BAD.search(t_.replace('Note: some useful summations have already been calculated for you below, which you can use.', '') if name in ('context', 'task') else t_):
            err('COLON OR SEMICOLON', cid, name, t_[:80])
        if re.search(r'\bpictur', t_, re.I) or re.search(r'professor|lecture|slide|session', t_, re.I):
            err('BANNED WORD', cid, name)
    for s in c['steps']:
        if not (s['title'] and s['general'] and s['work'] and s['words']):
            err('EMPTY STEP', cid, s['title'])
        if set(s) - {'title', 'general', 'work', 'words', 'classTable'}:
            err('STEP KEYS', cid, s['title'])
    for row in c['table']['rows']:
        if len(row) != len(c['table']['headers']):
            err('TABLE SHAPE', cid)
if len({c['title'] for c in D['cases']}) != 10:
    err('TITLES NOT UNIQUE')

# ---------------------------------------------------------------- questions
qs = D['questions']
if [q['id'] for q in qs] != [f'm2-n18-qa{i:02d}' for i in range(1, 11)]:
    err('QUESTION IDS')


def num(opt):
    return float(re.search(r'\\\((-?[\d.]+)\\\)', opt).group(1))


V = {k: C[k]['values'] for k in C}
truth = {'m2-n18-qa01': V['n18-toddler-vocabulary']['slope'], 'm2-n18-qa02': V['n18-vot-speaking-rate']['intercept'],
         'm2-n18-qa03': V['n18-reading-speed-age']['sb'], 'm2-n18-qa05': V['n18-speech-rate-recognition']['obsLower'],
         'm2-n18-qa06': V['n18-amphetamine-locomotion-sex']['t'], 'm2-n18-qa07': V['n18-music-training-pitch']['r']}
for q in qs:
    if set(q) != {'id', 'module', 'topic', 'stem', 'options', 'correct', 'why', 'case', 'equations'}:
        err('QUESTION KEYS', q['id'])
    if q['module'] != 18 or q['topic'] not in METHODS:
        err('QUESTION META', q['id'])
    if len(q['options']) != 4 or len(set(q['options'])) != 4 or q['correct'] not in (0, 1, 2, 3):
        err('QUESTION OPTIONS', q['id'])
    if q['case'] is not None and (q['case'] not in C or C[q['case']]['topic'] != q['topic']):
        err('QUESTION CASE', q['id'])
    if (q['id'] in truth) != (q['case'] is not None):
        err('QUESTION NUMERIC/CONCEPT', q['id'])
    if q['id'] in truth:
        vals = [num(o) for o in q['options']]
        w = truth[q['id']]
        if not math.isclose(vals[q['correct']], w, rel_tol=6e-4):
            err('QUESTION ANSWER', q['id'], vals, w)
        for i, v_ in enumerate(vals):
            if i != q['correct'] and math.isclose(v_, w, rel_tol=5e-3):
                err('QUESTION DISTRACTOR TOO CLOSE', q['id'], v_)
    if not q['equations'] or not (1 <= len(re.findall(r'[.?!](?:\s|$)', q['why'])) <= 3):
        err('QUESTION WHY/EQUATIONS', q['id'])
if len({q['correct'] for q in qs}) < 4:
    err('CORRECT INDEX NOT VARIED')
if sum(q['case'] is not None for q in qs) != 6:
    err('NUMERIC SHARE')
if not isinstance(D.get('notes'), list) or set(D) != {'cases', 'questions', 'notes'}:
    err('TOP LEVEL')

if errors:
    print('\n'.join(errors))
    print(f'{len(errors)} problem(s)')
    sys.exit(1)
print(f'session18a.json OK: {len(D["cases"])} cases, {len(qs)} questions, {n_checked} arithmetic comparisons in work lines')
