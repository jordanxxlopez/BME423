#!/usr/bin/env python3
"""Checks authoring/module2/neuro/exam1.json (30 Exam 1 format questions).

For every question the answer and every entry of `values` are recomputed from the raw inputs that
the student sees (the story text, the table, the figure and the R output) with NumPy / SciPy and
exact fractions. The solution's own work lines are never used as inputs. Every printed critical
value that appears in `values` or in a work line is compared with the class table (transcribed
below from sources/tables/*.pdf) and with SciPy, within the rounding of the printed table.
The script also checks that each question is well formed (valid step d.f., density that
integrates to 1, z values on printed z-table rows, internally consistent R output, P ranges that
are the tightest the printed table supports).

Run with /Users/jordanlopez/fsl/bin/python3. Exits 0 only when everything agrees.
"""
import json, math, re, sys
from fractions import Fraction as Fr
from pathlib import Path
import numpy as np
from scipy import stats, integrate, optimize

HERE = Path(__file__).resolve().parent
FILE = HERE / 'exam1.json'

# ------------------------------------------------------------------ printed class tables
T_COLS = [0.05, 0.02, 0.01, 0.005, 0.002, 0.001]                     # two-tailed t table
T_TABLE = {17: [2.110, 2.567, 2.898, 3.222, 3.646, 3.965],
           30: [2.042, 2.457, 2.750, 3.030, 3.385, 3.646],
           33: [2.035, 2.445, 2.733, 3.008, 3.356, 3.611],
           40: [2.021, 2.423, 2.704, 2.971, 3.307, 3.551],
           42: [2.018, 2.418, 2.698, 2.963, 3.296, 3.538],
           44: [2.015, 2.414, 2.692, 2.956, 3.286, 3.526],
           46: [2.013, 2.410, 2.687, 2.949, 3.277, 3.515],
           60: [2.000, 2.390, 2.660, 2.915, 3.232, 3.460],
           120: [1.980, 2.358, 2.617, 2.860, 3.160, 3.373],
           'inf': [1.9600, 2.3263, 2.5758, 2.8070, 3.0902, 3.2905]}
T_ROWS = list(range(1, 41)) + list(range(42, 81, 2)) + [90, 100, 120, 140, 160, 180, 200]
F_ROWS = list(range(1, 31)) + list(range(32, 51, 2)) + [60, 70, 80, 100, 120]
F_TABLE = {(2, 24): (3.40, 5.61), (2, 27): (3.35, 5.49), (2, 32): (3.30, 5.34),
           (2, 34): (3.28, 5.29), (2, 42): (3.22, 5.15)}               # (0.05 lightface, 0.01 boldface)
CHI_COLS = [0.05, 0.025, 0.01, 0.005, 0.001]
CHI_TABLE = {1: [3.841, 5.024, 6.635, 7.879, 10.828], 2: [5.991, 7.378, 9.210, 10.597, 13.816]}
Z_TABLE = {0.50: 0.6915, 1.00: 0.8413, 1.25: 0.8944, 1.50: 0.9332, 2.00: 0.9773, 2.40: 0.9918}


def z_printed(z):
    """z values printed in the Normal table: 0.01 steps to 2.50, 0.02 to 3.00, 0.05 to 4.00."""
    h = round(abs(z) * 100, 6)
    if abs(h - round(h)) > 1e-6: return False
    h = int(round(h))
    return h <= 250 or (h <= 300 and h % 2 == 0) or (h <= 400 and h % 5 == 0)


problems = []
count = {'values': 0, 'critical': 0, 'questions': 0}


def bad(qid, msg): problems.append(f'{qid}: {msg}')


def close(a, b, rel=2e-4, ab=1e-9):
    return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))


def same(qid, key, stored, calc, rel=2e-4):
    """Compare a stored value with the recomputed one (numbers, strings, lists, dicts, None)."""
    count['values'] += 1
    def eq(s, c):
        if isinstance(c, bool) or isinstance(s, bool) or c is None or s is None or isinstance(c, str): return s == c
        if isinstance(c, dict): return isinstance(s, dict) and list(s) == list(c) and all(eq(s[k], c[k]) for k in c)
        if isinstance(c, (list, tuple)): return isinstance(s, list) and len(s) == len(c) and all(eq(x, y) for x, y in zip(s, c))
        return isinstance(s, (int, float)) and close(float(s), float(c), rel)
    if not eq(stored, calc): bad(qid, f'values[{key}] stored {stored!r} but recomputed {calc!r}')


def check_values(q, calc):
    v = q['values']
    for k in v:
        if k not in calc: bad(q['id'], f'values[{k}] is not recomputed by the check')
    for k, c in calc.items():
        if k not in v: bad(q['id'], f'values[{k}] missing'); continue
        same(q['id'], k, v[k], c)


def check_answer(q, calc):
    a = q['answer']
    if not close(a['value'], calc) or abs(a['value'] - calc) > a['tolerance']:
        bad(q['id'], f"answer {a['value']} but recomputed {calc}")
    if not (a['tolerance'] >= 0.001 and a['tolerance'] <= 0.011 * max(abs(a['value']), 0.1)):
        bad(q['id'], f"tolerance {a['tolerance']} is out of range for {a['value']}")


def num(s): return float(s) if re.search(r'[.]', s) else int(s)


def text(q): return ' '.join(q['paragraphs'])


def find(qid, pattern, s, n=1):
    m = re.search(pattern, s)
    if not m: bad(qid, f'pattern not found: {pattern}'); raise KeyError(pattern)
    g = [num(x) for x in m.groups()]
    return g[0] if n == 1 else g


# ------------------------------------------------------------------ critical value checks
def t_scipy(alpha, nu): return stats.norm.isf(alpha / 2) if nu == 'inf' else stats.t.isf(alpha / 2, nu)


def t_print(qid, alpha, nu):
    count['critical'] += 1
    if nu not in T_TABLE or alpha not in T_COLS: bad(qid, f't table entry ({alpha}, {nu}) is not transcribed / printed'); return float('nan')
    v = T_TABLE[nu][T_COLS.index(alpha)]
    if abs(v - t_scipy(alpha, nu)) > 0.0011: bad(qid, f'printed t_{alpha}({nu})={v} disagrees with SciPy {t_scipy(alpha, nu):.4f}')
    return v


def f_print(qid, alpha, nn, nd):
    count['critical'] += 1
    if (nn, nd) not in F_TABLE: bad(qid, f'F table entry ({nn}, {nd}) is not transcribed / printed'); return float('nan')
    v = F_TABLE[(nn, nd)][[0.05, 0.01].index(alpha)]
    if abs(v - stats.f.isf(alpha, nn, nd)) > 0.011: bad(qid, f'printed F_{alpha}({nn},{nd})={v} disagrees with SciPy {stats.f.isf(alpha, nn, nd):.4f}')
    return v


def chi_print(qid, alpha, df):
    count['critical'] += 1
    v = CHI_TABLE[df][CHI_COLS.index(alpha)]
    if abs(v - stats.chi2.isf(alpha, df)) > 0.0011: bad(qid, f'printed chi2_{alpha}({df})={v} disagrees with SciPy {stats.chi2.isf(alpha, df):.4f}')
    return v


def z_print(qid, z):
    count['critical'] += 1
    if not z_printed(z) or round(abs(z), 2) not in Z_TABLE: bad(qid, f'z = {z} is not a transcribed printed z-table entry'); return float('nan')
    v = Z_TABLE[round(abs(z), 2)]
    if abs(v - stats.norm.cdf(abs(z))) > 1.01e-4: bad(qid, f'printed F({abs(z)})={v} disagrees with SciPy {stats.norm.cdf(abs(z)):.5f}')
    return v


def rows_around(nu, rows):
    """Printed rows that bracket nu: (row at or below, row at or above)."""
    if nu in rows: return nu, nu
    return max(r for r in rows if r < nu), min(r for r in rows if r > nu)


def p_range(stat, cutoffs):
    """Tightest printed P range: cutoffs is [(alpha, critical value)] from 0.05 downwards."""
    hit = [a for a, c in cutoffs if abs(stat) > c]
    return (f'P < {min(hit):g}' if hit else None)


def scan_work(q):
    """Every critical value written as symbol = number in a work line must be the printed one."""
    qid = q['id']
    for s in q['solution']:
        for w in s['work']:
            for a, nu, v in re.findall(r't_\{(0\.\d+)\}\((\d+|\\nu\\to\\infty)\)=(\d+\.\d+)', w):
                a, v = float(a), float(v); nu = 'inf' if 'infty' in nu else int(nu)
                if a == 0.0167:                                      # supplied by R, not a printed column
                    count['critical'] += 1
                    if abs(v - stats.t.isf(0.05 / 2 / 3, nu)) > 1e-6: bad(qid, f'work line t_0.0167({nu})={v} disagrees with SciPy')
                elif t_print(qid, a, nu) != v: bad(qid, f'work line t_{a}({nu})={v} is not the printed value')
            for a, nn, nd, v in re.findall(r'F_\{(0\.\d+)\}\((\d+),(\d+)\)=(\d+\.\d+)', w):
                if f_print(qid, float(a), int(nn), int(nd)) != float(v): bad(qid, f'work line F_{a}({nn},{nd})={v} is not the printed value')
            for a, df, v in re.findall(r'\\chi\^\{2\}_\{(0\.\d+)\}\((\d+)\)=(\d+\.\d+)', w):
                if chi_print(qid, float(a), int(df)) != float(v): bad(qid, f'work line chi2_{a}({df})={v} is not the printed value')
            for z, v in re.findall(r'P\(Z<(\d+\.\d+)\)=(0\.\d+)', w) + re.findall(r'F\((\d+\.\d+)\)=(0\.\d+)', s['words']):
                if z_print(qid, float(z)) != float(v): bad(qid, f'z table value F({z})={v} is not the printed value')
    pr = q['values'].get('pRange')
    if pr and pr.replace(' ', '') not in q['conclusion'].replace(' ', ''): bad(qid, f'conclusion does not state {pr}')
    if 'pRange' in q['values'] and pr is None and re.search(r'P\s*<', q['conclusion']): bad(qid, 'conclusion gives a P range without rejecting')


# ------------------------------------------------------------------ T1 discrete random variable
def frac_str(f): return str(f.numerator) if f.denominator == 1 else f'{f.numerator}/{f.denominator}'


def check_t1(q):
    qid, fig = q['id'], q['figure']
    ys = [p[0] for p in fig['points']]; Fs = [Fr(p[1]).limit_denominator(1000) for p in fig['points']]
    if ys != sorted(set(ys)): bad(qid, 'jump locations are not strictly increasing')
    if any(b <= a for a, b in zip([Fr(0)] + Fs, Fs)) or Fs[-1] != 1: bad(qid, 'not a valid distribution function (must rise from 0 to exactly 1)')
    if fig['ticks']['F'] != [frac_str(F) for F in Fs]: bad(qid, 'F tick labels do not match the plotted heights')
    if any(y not in fig['ticks']['y'] for y in ys): bad(qid, 'a jump is not on a labelled y tick')
    f = [b - a for a, b in zip([Fr(0)] + Fs, Fs)]
    if sum(f) != 1 or min(f) <= 0: bad(qid, 'p.f. does not sum to 1')
    a2 = find(qid, r'Y > (-?[\d.]+)', q['parts'][1]); a3, b3 = find(qid, r'(-?[\d.]+) < Y < (-?[\d.]+)', q['parts'][2], 2)
    if a3 in ys or b3 in ys: bad(qid, 'part iii bounds should not sit on a jump')
    pg = sum(p for y, p in zip(ys, f) if y > a2); pb = sum(p for y, p in zip(ys, f) if a3 < y < b3)
    Fd = lambda x: max([Fr(0)] + [F for y, F in zip(ys, Fs) if y <= x])        # the d.f. route
    if 1 - Fd(a2) != pg or Fd(b3) - Fd(a3) != pb: bad(qid, 'd.f. route and p.f. route disagree')
    if not (0 < pb < 1 and 0 < pg < 1): bad(qid, 'degenerate probability')
    check_values(q, {'y': ys, 'F': [float(F) for F in Fs], 'f': [float(x) for x in f], 'pf': [frac_str(x) for x in f],
                     'a2': a2, 'pGreater': float(pg), 'a3': a3, 'b3': b3, 'pBetween': float(pb)})
    check_answer(q, float(pb))
    for x in f:                                                                  # the solution must show each probability
        if f'\\frac{{{x.numerator}}}{{{x.denominator}}}' not in q['conclusion']: bad(qid, f'conclusion does not show {x}')


# ------------------------------------------------------------------ T2 continuous random variable
def parse_linear(s):
    """'4-x', 'x', '1' -> (constant, slope) as Fractions."""
    c0 = c1 = Fr(0)
    for sign, coef, x in re.findall(r'([+-]?)(\d*)(x?)', s.replace(' ', '')):
        if not coef and not x: continue
        val = Fr(int(coef) if coef else 1) * (-1 if sign == '-' else 1)
        if x: c1 += val
        else: c0 += val
    return c0, c1


def parse_density(qid, latex):
    """Middle piece of the three-piece density: a sum of \\dfrac{linear}{integer} terms on lo < x <= hi."""
    pieces = re.search(r'\\begin\{cases\}(.*)\\end\{cases\}', latex).group(1).split('\\\\[4pt]')
    if len(pieces) != 3: bad(qid, 'density is not in three pieces')
    lo = find(qid, r'^\s*0, & x\\le (-?\d+)', pieces[0]); hi = find(qid, r'^\s*0, & x>(-?\d+)', pieces[2])
    expr, cond = pieces[1].split('&')
    m = re.fullmatch(r'\s*(-?\d+)<x\\le (-?\d+)\s*', cond)
    if not m or (int(m.group(1)), int(m.group(2))) != (lo, hi): bad(qid, 'the three pieces do not cover every x exactly once')
    c0 = c1 = Fr(0); rest = expr.strip()
    for a, b in re.findall(r'\\dfrac\{([^{}]+)\}\{(\d+)\}', rest):
        k0, k1 = parse_linear(a); c0 += k0 / int(b); c1 += k1 / int(b)
    if re.sub(r'\\dfrac\{[^{}]+\}\{\d+\}', '', rest).replace('+', '').replace(',', '').strip(): bad(qid, f'density term not understood: {rest}')
    return c0, c1, lo, hi


def check_t2(q):
    qid = q['id']
    c0, c1, lo, hi = parse_density(qid, q['figure']['latex'])
    f = lambda x: float(c0 + c1 * Fr(x).limit_denominator(10 ** 6))
    area = c0 * (hi - lo) + c1 * Fr(hi ** 2 - lo ** 2, 2)
    if area != 1: bad(qid, f'density integrates to {area}, not 1')
    if c0 + c1 * lo < 0 or c0 + c1 * hi < 0: bad(qid, 'density is negative somewhere')
    EX = c0 * Fr(hi ** 2 - lo ** 2, 2) + c1 * Fr(hi ** 3 - lo ** 3, 3)
    if not close(integrate.quad(lambda x: x * f(x), lo, hi)[0], float(EX), 1e-8): bad(qid, 'E[X] disagrees with numerical integration')
    p = Fr(find(qid, r'What is the (\d+)th percentile', q['parts'][2]), 100)
    Fx = lambda x: float(c0) * (x - lo) + float(c1) * (x * x - lo * lo) / 2
    c = optimize.brentq(lambda x: Fx(x) - float(p), lo, hi, xtol=1e-14)
    if not close(integrate.quad(f, lo, c)[0], float(p), 1e-8): bad(qid, 'percentile fails the integral check')
    shape = 'increasing line' if (c1 > 0 and c0 == 0) else 'decreasing line' if c1 < 0 else 'constant plus slope' if c1 > 0 else 'constant'
    check_values(q, {'shape': shape, 'upper': hi, 'expected': float(EX), 'p': float(p), 'percentile': c})
    check_answer(q, c)
    # the d.f. written in the solution must equal the integral of the density at test points
    piece = [w for s in q['solution'] if s['title'].startswith('Part ii. Complete') for w in s['work']][0]
    mid = re.search(r'\\\\\[4pt\](.*?), & ', piece).group(1)
    terms = re.findall(r'(-?)\s*\\dfrac\{(x(?:\^\{2\})?)\}\{(\d+)\}', mid)
    Fsol = lambda x: sum((-1 if s == '-' else 1) * (x * x if '^' in v else x) / int(d) for s, v, d in terms)
    if not terms or any(not close(Fsol(x), Fx(x), 1e-9) for x in np.linspace(lo + 0.1, hi, 7)): bad(qid, f'solution d.f. {mid} is not the integral of the density')
    if '0, & x\\le %d' % lo not in piece or '1, & x>%d' % hi not in piece: bad(qid, 'solution d.f. is not defined for all x')


# ------------------------------------------------------------------ T3 sampling distribution of the mean
def check_t3(q):
    qid, s, part = q['id'], text(q), q['parts'][0]
    mu = find(qid, r'with mean of ([\d.]+)', s); sigma = find(qid, r'standard deviation of ([\d.]+)', s)
    n = find(qid, r'in a sample of (\d+)', part); a, b = find(qid, r'is between ([\d.]+) and ([\d.]+)', part, 2)
    if math.isqrt(n) ** 2 != n: bad(qid, 'n is not a perfect square')
    se = sigma / math.sqrt(n); z1 = (a - mu) / se; z2 = (b - mu) / se
    z1, z2 = round(z1, 10), round(z2, 10)
    tab = lambda z: z_print(qid, z) if z >= 0 else round(1 - z_print(qid, z), 4)
    F1, F2 = tab(z1), tab(z2); prob = round(F2 - F1, 4)
    if abs(prob - (stats.norm.cdf(z2) - stats.norm.cdf(z1))) > 2.1e-4: bad(qid, 'table probability is far from the exact probability')
    check_values(q, {'mu': mu, 'sigma': sigma, 'n': n, 'a': a, 'b': b, 'se': se, 'z1': z1, 'z2': z2, 'Fz1': F1, 'Fz2': F2, 'probability': prob})
    check_answer(q, prob)
    if f'{prob:.4f}' not in q['conclusion']: bad(qid, 'conclusion does not state the probability')


# ------------------------------------------------------------------ T4 one-way ANOVA from summary statistics
def check_t4(q):
    qid = q['id']
    ns = [int(x) for x in re.findall(r'n = (\d+)', text(q))]
    if len(ns) != 3 or len(set(ns)) != 1: bad(qid, 'three equal group sizes expected in the story')
    n, m = ns[0], len(q['table']['rows'])
    means = [num(r[1]) for r in q['table']['rows']]; sds = [num(r[2]) for r in q['table']['rows']]
    s2wit = float(np.mean(np.square(sds))); gm = float(np.mean(means)); s2x = float(np.var(means, ddof=1)); s2bet = n * s2x
    F = s2bet / s2wit; nn, nd = m - 1, m * (n - 1)
    lo, hi = rows_around(nd, F_ROWS)                       # lo row has the larger (conservative) critical value
    c05, c01 = f_print(qid, 0.05, nn, lo), f_print(qid, 0.01, nn, lo)
    if lo != hi:
        if not (f_print(qid, 0.05, nn, hi) <= stats.f.isf(0.05, nn, nd) + 0.006 <= c05 + 0.012): bad(qid, 'bracket does not contain the exact F critical value')
        if not any('no row' in s['words'] and 'conservative' in s['words'] for s in q['solution']): bad(qid, 'missing F row is not explained as a conservative bracket')
        for a in (0.05, 0.01):                                # decision must not depend on the bracket
            if (F > f_print(qid, a, nn, lo)) != (F > f_print(qid, a, nn, hi)): bad(qid, f'F falls inside the bracket at {a}')
    reject = F > c05
    if reject != (stats.f.sf(F, nn, nd) < 0.05): bad(qid, 'table decision disagrees with the exact P value')
    pr = p_range(F, [(0.05, c05), (0.01, c01)])
    check_values(q, {'m': m, 'n': n, 'means': means, 'sds': sds, 's2wit': s2wit, 'grandMean': gm, 's2xbar': s2x, 's2bet': s2bet, 'F': F,
                     'nuN': nn, 'nuD': nd, 'tableRowUsed': lo, 'critical05': c05, 'critical01': c01, 'reject': bool(reject), 'pRange': pr})
    check_answer(q, F)
    if reject != q['conclusion'].startswith('Reject'): bad(qid, 'conclusion direction is wrong')


# ------------------------------------------------------------------ T5 Holm pairwise t tests with R output
def r_sig(x, digits):
    return float(f'%.{digits}g' % x)


def parse_aov(qid, r):
    lines = r.split('\n')
    t = lines[1].split(); res = lines[2].split()
    if t[0] != 'Treatment' or res[0] != 'Residuals' or not lines[0].split() == ['Df', 'Sum', 'Sq', 'Mean', 'Sq', 'F', 'value', 'Pr(>F)']: bad(qid, 'R table layout')
    if lines[3] != '---' or lines[4] != 'Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1': bad(qid, 'R Signif. codes line')
    return {'dfT': int(t[1]), 'ssT': float(t[2]), 'msT': float(t[3]), 'F': float(t[4]), 'p': float(t[5]), 'stars': t[6] if len(t) > 6 else '',
            'dfR': int(res[1]), 'ssR': float(res[2]), 'msR': float(res[3]), 'raw': (t, res)}


def decimals(s): return len(s.split('.')[1]) if '.' in s else 0


def check_t5(q):
    qid, rows = q['id'], {r[0]: r[1:] for r in q['table']['rows']}
    names = q['table']['headers'][1:]
    means = [num(x) for x in rows['Mean']]; var = [float(x) for x in rows['Variance']]; ns = [int(x) for x in rows['n']]
    if len(set(ns)) != 1: bad(qid, 'equal n expected')
    n, m = ns[0], 3
    R = parse_aov(qid, q['rOutput']); traw, rraw = R['raw']
    # exact ANOVA from the data table
    ssT = n * float(np.sum((np.array(means) - np.mean(means)) ** 2)); msT = ssT / (m - 1)
    msR = float(np.mean(var)); dfR = m * (n - 1); ssR = msR * dfR; F = msT / msR; p = float(stats.f.sf(F, m - 1, dfR))
    # R output must be internally consistent and agree with the data table within its printed rounding
    def printed(label, shown, exact):
        d = decimals(shown)
        if abs(float(shown) - exact) > 0.5 * 10 ** (-d) + 1e-9: bad(qid, f'R output {label} {shown} is not {exact:.6g} rounded')
    if R['dfT'] != m - 1 or R['dfR'] != dfR: bad(qid, 'R output Df')
    printed('Treatment Sum Sq', traw[2], ssT); printed('Treatment Mean Sq', traw[3], msT); printed('F value', traw[4], F)
    printed('Residuals Sum Sq', rraw[2], ssR); printed('Residuals Mean Sq', rraw[3], msR)
    for label, ms, ss, df in (('Treatment', R['msT'], R['ssT'], R['dfT']), ('Residuals', R['msR'], R['ssR'], R['dfR'])):
        if not close(ms, ss / df, 2e-3): bad(qid, f'R output {label} Mean Sq is not Sum Sq / Df')
    if not close(R['F'], R['msT'] / R['msR'], 2e-3): bad(qid, 'R output F value is not the ratio of the Mean Sq')
    if not close(R['p'], p, 6e-3) or not close(R['p'], float(stats.f.sf(R['F'], R['dfT'], R['dfR'])), 6e-3): bad(qid, f"R output Pr(>F) {R['p']} but SciPy {p:.4g}")
    stars = '***' if p < 0.001 else '**' if p < 0.01 else '*' if p < 0.05 else '.' if p < 0.1 else ''
    if R['stars'] != stars: bad(qid, f"R output Signif. code {R['stars']!r} should be {stars!r}")
    if p >= 0.05: bad(qid, 'story says the ANOVA found a difference but P >= 0.05')
    # pairwise t tests with the printed Residuals Mean Sq, as the exam solution does
    s2, nu = R['msR'], R['dfR']; se = math.sqrt(s2 * 2 / n)
    keys = list(q['values']['t']); pairs = [(0, 1), (0, 2), (1, 2)]
    t = {k: (means[i] - means[j]) / se for k, (i, j) in zip(keys, pairs)}
    order = sorted(keys, key=lambda k: -abs(t[k])); alpha = [0.05 / (3 - j) for j in range(3)]
    lo, hi = rows_around(nu, T_ROWS)                        # lo row has the larger critical values
    looser = {0: 0.02, 1: 0.05, 2: 0.05}; stricter = {0: 0.01, 1: 0.02, 2: 0.05}
    brackets = [[t_print(qid, looser[j], hi), t_print(qid, stricter[j], lo)] for j in range(3)]
    reject, stopped = {}, False
    for j, k in enumerate(order):
        exact = stats.t.isf(alpha[j] / 2, nu)
        if not (brackets[j][0] <= exact + 0.0006 and exact - 0.0006 <= brackets[j][1]): bad(qid, f'Holm bracket {j + 1} does not contain the exact cutoff')
        if brackets[j][0] < abs(t[k]) < brackets[j][1] and not stopped: bad(qid, f'|t| for {k} falls inside the printed bracket')
        r = (not stopped) and abs(t[k]) > brackets[j][1]
        if r != ((not stopped) and abs(t[k]) > exact): bad(qid, f'table decision for {k} disagrees with the exact cutoff')
        reject[k] = bool(r); stopped = stopped or not r
    reject = {k: reject[k] for k in keys}
    check_values(q, {'n': n, 'means': means, 'variances': var, 's2wit': s2, 'nu': nu, 'se': se, 't': t, 'order': order,
                     'alpha': alpha, 'brackets': brackets, 'reject': reject,
                     'anova': {'ssTreat': ssT, 'ssRes': ssR, 'msTreat': msT, 'msResExact': msR, 'F': F, 'p': p, 'dfRes': dfR}})
    check_answer(q, abs(t[order[0]]))
    # the conclusion must state the right direction for every pair
    for k, (i, j) in zip(keys, pairs):
        want = ('there is a difference' if reject[k] else 'there is not a difference')
        ok = any(re.search(want + r'[^,]*between groups (%s and %s|%s and %s)' % (re.escape(names[i]), re.escape(names[j]), re.escape(names[j]), re.escape(names[i])), c, re.I)
                 for c in q['conclusion'].split(', AND '))
        if not ok: bad(qid, f'conclusion is wrong or missing for {names[i]} vs {names[j]}')


# ------------------------------------------------------------------ T6 chi-square on a contingency table
def body(q):
    rows = [r for r in q['table']['rows'] if r[0] != 'Totals']
    hdr = q['table']['headers']
    cols = [i for i, h in enumerate(hdr) if i > 0 and h != 'Totals']
    return np.array([[int(r[i]) for i in cols] for r in rows])


def check_t6(q):
    qid, O = q['id'], body(q)
    hdr = q['table']['headers']; rows = q['table']['rows']
    rt, ct, n = O.sum(1), O.sum(0), int(O.sum())
    if [int(r[hdr.index('Totals')]) for r in rows[:-1]] != rt.tolist(): bad(qid, 'printed row totals are wrong')
    if [int(x) for x in rows[-1][1:]] != ct.tolist() + [n]: bad(qid, 'printed column totals are wrong')
    E = np.outer(rt, ct) / n
    if E.min() < 5: bad(qid, 'an expected count is below 5')
    chi = float(((O - E) ** 2 / E).sum()); df = (O.shape[0] - 1) * (O.shape[1] - 1)
    if not close(chi, stats.chi2_contingency(O, correction=False)[0], 1e-10): bad(qid, 'chi-square disagrees with SciPy')
    cut = [(a, chi_print(qid, a, df)) for a in CHI_COLS]; reject = chi > cut[0][1]
    check_values(q, {'observed': O.tolist(), 'rowTotals': rt.tolist(), 'columnTotals': ct.tolist(), 'n': n, 'expected': E.tolist(),
                     'chiSquare': chi, 'df': df, 'critical05': cut[0][1], 'reject': bool(reject), 'pRange': p_range(chi, cut)})
    check_answer(q, chi)
    if reject != q['conclusion'].startswith('Reject'): bad(qid, 'conclusion direction is wrong')


# ------------------------------------------------------------------ T7 odds ratio
def yates(O):
    E = np.outer(O.sum(1), O.sum(0)) / O.sum()
    v = float(((np.abs(O - E) - 0.5) ** 2 / E).sum())
    if not close(v, stats.chi2_contingency(O, correction=True)[0], 1e-10): raise AssertionError('Yates')
    return v, E


def check_t7(q):
    qid, O = q['id'], body(q)
    (ed, en), (ud, un) = O.tolist()
    OR = ed * un / (ud * en); chi, _ = yates(O)
    stated = find(qid, r'\(p<(0\.\d+)\)', ' '.join(q['paragraphs'] + q['parts']))
    if chi <= chi_print(qid, stated, 1): bad(qid, f'stated p<{stated} is not supported by the table')
    check_values(q, {'nED': ed, 'nEN': en, 'nUD': ud, 'nUN': un, 'oddsRatio': OR, 'chiSquareYates': chi, 'statedP': stated})
    check_answer(q, OR)
    c = q['conclusion']
    if not c.startswith('The odds of') or 'risk' in c.lower() or c.count('.') - len(re.findall(r'\d\.\d', c)) != 1: bad(qid, 'sentence must be one sentence about odds')
    if OR > 1 and not (f'about {OR:.1f} times greater' in c): bad(qid, 'sentence states the wrong size or direction')
    if OR < 1 and not (f'about {OR:.1f} times' in c and re.search(r'half as large|smaller|lower', c)): bad(qid, 'sentence states the wrong size or direction')


# ------------------------------------------------------------------ R1 two-sample t test
def t_decision(qid, t, nu):
    lo, hi = rows_around(nu, T_ROWS)
    cut = [(a, t_print(qid, a, lo)) for a in T_COLS]
    if lo != hi:
        for a in T_COLS:
            if (abs(t) > t_print(qid, a, lo)) != (abs(t) > t_print(qid, a, hi)): bad(qid, f'|t| falls inside the row bracket at {a}')
    reject = abs(t) > cut[0][1]
    if reject != (2 * stats.t.sf(abs(t), nu) < 0.05): bad(qid, 'table decision disagrees with the exact P value')
    return cut[0][1], bool(reject), p_range(t, cut)


def check_r1(q):
    qid, s = q['id'], text(q)
    n1, n2 = find(qid, r'two groups: (\d+) \w+ .*? and (\d+) \w+ ', s, 2)
    m1, s1 = find(qid, r'\\bar\{x\}_1 = ([\d.]+)\\\) and \\\(s_1 = ([\d.]+)', s, 2)
    m2, s2 = find(qid, r'\\bar\{x\}_2 = ([\d.]+)\\\) and \\\(s_2 = ([\d.]+)', s, 2)
    nu = n1 + n2 - 2; sp2 = ((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / nu; se = math.sqrt(sp2 * (1 / n1 + 1 / n2)); t = (m1 - m2) / se
    ref = stats.ttest_ind_from_stats(m1, s1, n1, m2, s2, n2)
    if not close(t, ref.statistic, 1e-10): bad(qid, 't disagrees with SciPy')
    c05, reject, pr = t_decision(qid, t, nu)
    check_values(q, {'n1': n1, 'mean1': m1, 'sd1': s1, 'n2': n2, 'mean2': m2, 'sd2': s2, 'pooledVariance': sp2, 'se': se, 't': t,
                     'nu': nu, 'critical05': c05, 'reject': reject, 'pRange': pr})
    check_answer(q, t)
    if reject != q['conclusion'].startswith('Reject'): bad(qid, 'conclusion direction is wrong')


def check_r2(q):
    qid, s = q['id'], text(q)
    mu0 = find(qid, r'healthy adults is ([\d.]+) digits', s); n = find(qid, r'randomly selected (\d+)', s)
    mean, sd = find(qid, r'found to be ([\d.]+) digits with a standard deviation of ([\d.]+)', s, 2)
    se = sd / math.sqrt(n); t = (mean - mu0) / se; nu = n - 1
    c05, reject, pr = t_decision(qid, t, nu)
    check_values(q, {'n': n, 'mean': mean, 'sd': sd, 'mu0': mu0, 'se': se, 't': t, 'nu': nu, 'critical05': c05, 'reject': reject, 'pRange': pr})
    check_answer(q, t)
    if reject != (not q['conclusion'].startswith('Do not reject')): bad(qid, 'conclusion direction is wrong')


def check_r3(q):
    qid, P = q['id'], q['paragraphs']
    p1, n1 = find(qid, r'was (0\.\d+)\. The total number of children in this group was (\d+)', P[1], 2)
    p2, n2 = find(qid, r'was (0\.\d+)\. The total number of children in this group was (\d+)', P[2], 2)
    N, M = find(qid, r'tested was (\d+), of which (\d+) passed', P[3], 2)
    m1, m2 = round(p1 * n1), round(p2 * n2)
    if N != n1 + n2 or M != m1 + m2 or round(m1 / n1, 3) != p1 or round(m2 / n2, 3) != p2: bad(qid, 'story counts and proportions are inconsistent')
    pooled = M / N; inv = 1 / n1 + 1 / n2
    numer = abs(p1 - p2) - 0.5 * inv; den = math.sqrt(pooled * (1 - pooled) * inv); z = numer / den
    cut = [(a, t_print(qid, a, 'inf')) for a in T_COLS]; reject = z > cut[0][1]
    check_values(q, {'n1': n1, 'n2': n2, 'm1': m1, 'm2': m2, 'p1': p1, 'p2': p2, 'pooled': pooled, 'sumInverseN': inv, 'numerator': numer,
                     'denominator': den, 'z': z, 'critical05': cut[0][1], 'critical02': cut[1][1], 'reject': bool(reject), 'pRange': p_range(z, cut)})
    check_answer(q, z)
    if reject != ('There is a significant difference' in q['conclusion']): bad(qid, 'conclusion direction is wrong')


def check_r4(q):
    qid, s = q['id'], text(q)
    n = find(qid, r'n = (\d+)\\\) for each group', s); F_story, s2 = find(qid, r'F = ([\d.]+)\\\).*?s\^\{2\}_\{wit\} = ([\d.]+)', s, 2)
    means = [num(r[1]) for r in q['table']['rows']]; sds = [num(r[2]) for r in q['table']['rows']]; m = 3
    s2exact = float(np.mean(np.square(sds))); F = n * float(np.var(means, ddof=1)) / s2exact; nu = m * (n - 1)
    if round(s2exact, 4) != s2 or round(F, 4) != F_story: bad(qid, 'stated F or s2_wit does not follow from the table')
    if not (F > f_print(qid, 0.05, 2, 32) and F < f_print(qid, 0.01, 2, 34)): bad(qid, 'stated P < 0.05 for the ANOVA is not what the F table gives')
    if find(qid, r't_\{0\.0167\}\((\d+)\)', s) != nu: bad(qid, 'story asks for the wrong degrees of freedom')
    cmd, out = q['rOutput'].split('\n')
    crit = float(stats.t.isf((0.05 / 2) / 3, nu)); count['critical'] += 1
    if cmd != f'> qt((0.05/2)/3, {nu}, lower.tail=FALSE)' or out != f'[1] {crit:.6f}': bad(qid, f'R qt() output should be {crit:.6f}')
    if not (t_print(qid, 0.02, nu) < crit < t_print(qid, 0.01, nu)): bad(qid, 'qt() value is outside the printed bracket')
    se = math.sqrt(s2 * 2 / n); keys = list(q['values']['t']); pairs = [(0, 1), (0, 2), (1, 2)]
    t = {k: (means[i] - means[j]) / se for k, (i, j) in zip(keys, pairs)}; reject = {k: bool(abs(v) > crit) for k, v in t.items()}
    check_values(q, {'n': n, 'means': means, 'sds': sds, 's2witExact': s2exact, 's2wit': s2, 'F': F, 'nu': nu, 'se': se, 'alpha': 0.05 / 3,
                     'critical': crit, 't': t, 'reject': reject})
    check_answer(q, max(abs(v) for v in t.values()))
    c = q['conclusion']
    if list(reject.values()) != [False, True, False] or not re.search(r'no difference .*Group 1 .* and Group 2 .*, or between Group 2 .* and Group 3 .*, but there is a difference .*Group 1 .* and Group 3', c): bad(qid, 'conclusion does not match the three decisions')


def check_r5(q):
    qid, O = q['id'], body(q)
    if int(find(qid, r'prospective study of (\d+)', text(q))) != O.sum(): bad(qid, 'story total does not match the table')
    chi, E = yates(O); df = 1
    cut = [(a, chi_print(qid, a, df)) for a in CHI_COLS]; reject = chi > cut[0][1]
    labels = [r[0] for r in q['table']['rows']]; hdr = q['table']['headers']
    ex, un = labels.index('Prior concussion'), labels.index('No prior concussion'); ev = hdr.index('Yes New Concussion') - 1
    nTD, nT, nCD, nC = int(O[ex, ev]), int(O[ex].sum()), int(O[un, ev]), int(O[un].sum())
    RR = (nTD / nT) / (nCD / nC)
    check_values(q, {'observed': O.tolist(), 'rowTotals': O.sum(1).tolist(), 'columnTotals': O.sum(0).tolist(), 'n': int(O.sum()), 'expected': E.tolist(),
                     'chiSquareYates': chi, 'df': df, 'critical05': cut[0][1], 'reject': bool(reject), 'pRange': p_range(chi, cut),
                     'nTD': nTD, 'nT': nT, 'nCD': nCD, 'nC': nC, 'relativeRisk': RR})
    check_answer(q, RR)
    c = q['conclusion']
    if not (c.startswith('Reject') and f'risk of a new concussion during the season is about {RR:.1f} times greater for players who have had a prior concussion' in c): bad(qid, 'relative risk sentence states the wrong size or direction')


CHECK = {'T1': check_t1, 'T2': check_t2, 'T3': check_t3, 'T4': check_t4, 'T5': check_t5, 'T6': check_t6, 'T7': check_t7,
         'R1': check_r1, 'R2': check_r2, 'R3': check_r3, 'R4': check_r4, 'R5': check_r5}
WANT = {'T1': (3, 15), 'T2': (3, 15), 'T3': (4, 10), 'T4': (4, 20), 'T5': (3, 15), 'T6': (4, 20), 'T7': (3, 5),
        'R1': (2, 15), 'R2': (1, 10), 'R3': (1, 15), 'R4': (1, 15), 'R5': (1, 20)}
KEYS = {'id', 'type', 'points', 'topic', 'title', 'paragraphs', 'figure', 'table', 'rOutput', 'parts', 'solution', 'conclusion', 'answer', 'values'}


def main():
    d = json.loads(FILE.read_text())
    exam = d['exam']
    if [q['id'] for q in exam] != [f'nx1-{i:02d}' for i in range(1, 31)]: bad('file', 'ids must be nx1-01 .. nx1-30 in order')
    for q in exam:
        qid = q['id']; count['questions'] += 1
        if set(q) != KEYS: bad(qid, f'keys differ from the spec: {sorted(set(q) ^ KEYS)}')
        if q['points'] != WANT[q['type']][1]: bad(qid, 'points do not match the type')
        for s in q['solution']:
            if set(s) != {'title', 'general', 'work', 'words'}: bad(qid, 'solution step keys')
        # writing rules for the solution text
        for label, s in [('conclusion', q['conclusion'])] + [(f"words of '{st['title']}'", st['words']) for st in q['solution']]:
            plain = re.sub(r'\\\(.+?\\\)', '', s)
            if re.search(r'[:;]', plain): bad(qid, f'colon or semicolon in {label}')
            if re.search(r'\bpicture|professor|lecture|\bslide', s, re.I): bad(qid, f'banned word in {label}')
        try:
            CHECK[q['type']](q)
            scan_work(q)
        except Exception as e:                                # a parse failure is a failure
            bad(qid, f'check crashed: {type(e).__name__}: {e}')
    for t, (k, _) in WANT.items():
        if sum(q['type'] == t for q in exam) != k: bad('file', f'expected {k} questions of type {t}')
    if len({q['title'] for q in exam}) != 30: bad('file', 'titles (settings) must all differ')
    if problems:
        print('\n'.join(problems)); print(f'\nFAILED: {len(problems)} problems'); sys.exit(1)
    print(f"exam1.json OK: {count['questions']} questions, {count['values']} values and 30 answers recomputed from raw inputs, "
          f"{count['critical']} printed critical values checked against SciPy")


if __name__ == '__main__':
    main()
