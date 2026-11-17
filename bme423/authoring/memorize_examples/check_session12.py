"""Check script for authoring/memorize_examples/session12.json. Recomputes every number in the work lines
from the raw problem inputs, re-evaluates each arithmetic chain, and checks printed critical values against SciPy.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/memorize_examples/check_session12.py"""
# ---- shared checker (copied into each check_session{N}.py) ----
import json, re, sys, math, pathlib
import numpy as np
from scipy import stats

HERE = pathlib.Path(__file__).resolve().parent
fails = []
def fail(msg): fails.append(msg)

def _match_brace(s, i):
    depth = 0
    for j in range(i, len(s)):
        if s[j] == '{': depth += 1
        elif s[j] == '}':
            depth -= 1
            if depth == 0: return j
    raise ValueError('unbalanced braces in ' + s)

def latex_to_py(seg):
    """Turn a numeric LaTeX segment into a Python expression, or None if it holds symbols."""
    s = seg.strip().strip(',').strip()
    s = s.replace('\\left', '').replace('\\right', '').replace('\\,', '').replace('\\ ', '')
    s = s.replace('\\tfrac12', '(1/2)')
    while '\\frac' in s:
        i = s.index('\\frac'); a0 = i + 5; a1 = _match_brace(s, a0); b0 = a1 + 1; b1 = _match_brace(s, b0)
        s = s[:i] + '((' + s[a0 + 1:a1] + ')/(' + s[b0 + 1:b1] + '))' + s[b1 + 1:]
    while '\\sqrt' in s:
        i = s.index('\\sqrt'); a0 = i + 5; a1 = _match_brace(s, a0)
        s = s[:i] + 'math.sqrt(' + s[a0 + 1:a1] + ')' + s[a1 + 1:]
    s = s.replace('\\cdot', '*').replace('\\times', '*').replace('^', '**').replace('{', '(').replace('}', ')')
    out, opened = '', False
    for ch in s:
        if ch == '|': out += ')' if opened else 'abs('; opened = not opened
        else: out += ch
    s = out
    s = re.sub(r'\)\s*\(', ')*(', s); s = re.sub(r'(\d)\s*\(', r'\1*(', s)   # implicit products like (9-1)(1.05)
    if re.search(r'[A-Za-z\\]', s.replace('math.sqrt', '').replace('abs', '')): return None
    if not re.search(r'\d', s): return None
    return s

def decimals(lit):
    lit = lit.strip().strip(',').strip()
    if not re.fullmatch(r'-?\d+(\.\d+)?', lit): return None
    return len(lit.split('.')[1]) if '.' in lit else 0

REL = re.compile(r'(\\approx|=|<|>)')
def check_line(line, where):
    """Re-evaluate every arithmetic chain in a work line."""
    for sub in re.split(r'\\quad', line):
        parts = REL.split(sub)
        segs, ops = parts[0::2], parts[1::2]
        for k, op in enumerate(ops):
            a, b = segs[k], segs[k + 1]
            pa, pb = latex_to_py(a), latex_to_py(b)
            if pa is None or pb is None: continue
            va, vb = eval(pa), eval(pb)
            if op in ('=', '\\approx'):
                ds = [d for d in (decimals(a), decimals(b)) if d is not None]
                d = min(ds) if ds else 6
                tol = max(0.6 * 10 ** -d, 3e-4 * abs(vb))
                if op == '\\approx': tol = max(tol, 0.03 * abs(vb))
                if abs(va - vb) > tol: fail(f'{where}: {a.strip()} gives {va:.6g}, not {b.strip()}')
            elif op == '<' and not va < vb: fail(f'{where}: {va} < {vb} is false')
            elif op == '>' and not va > vb: fail(f'{where}: {va} > {vb} is false')

def literals(line):
    s = re.sub(r'_\{[A-Za-z0-9,]*[A-Za-z][A-Za-z0-9,]*\}', '', line)   # symbolic subscripts like _{C,3}, _{TD}
    s = re.sub(r'_\{\d+\}|_\d', '', s)                                  # index subscripts like E_{11}, alpha_1
    s = re.sub(r'\\[A-Za-z]+', ' ', s)
    return re.findall(r'\d+(?:\.\d+)?', s)

def check_literals(line, known, where):
    for lit in literals(line):
        v = float(lit); d = decimals(lit)
        if d == 0 and v <= 3: continue                      # exponents, indices, degrees of freedom
        tol = max(0.6 * 10 ** -d, 3e-4 * abs(v))
        if not any(abs(v - k) <= tol for k in known):
            fail(f'{where}: number {lit} is not a recomputed value')

def run(session, examples_inputs):
    data = json.loads((HERE / f'session{session}.json').read_text())
    titles = [e['title'] for e in data['examples']]
    for title, (known, crit, extra) in examples_inputs.items():
        if title not in titles: fail(f'missing example "{title}"'); continue
        ex = data['examples'][titles.index(title)]
        for (alpha, df), printed in crit.items():
            exact = stats.chi2.isf(alpha, df) if df else None
            if exact is not None and abs(exact - printed) > 0.0015:
                fail(f'{title}: printed chi-square {printed} vs SciPy {exact:.4f} for alpha {alpha}, df {df}')
        known = list(known) + list(crit.values()) + [a for a, _ in crit]   # printed values and their alpha columns
        for j, st in enumerate(ex['steps']):
            for line in st['work']:
                where = f'{title} step {j + 1}'
                check_line(line, where); check_literals(line, known, where)
        for msg, ok in extra:
            if not ok: fail(f'{title}: {msg}')
    if fails:
        print('\n'.join(fails)); print(f'{len(fails)} problems'); sys.exit(1)
    print(f'session {session}: every work line re-evaluated and every number recomputed, all good')
# ---- end shared checker ----

# ---- Session 12 inputs, recomputed from the raw counts ----
# Exam 1 Question 6
O = np.array([[134, 107, 122], [94, 105, 99]]); R = O.sum(1); C = O.sum(0); n = O.sum()
E = np.outer(R, C) / n
E3 = np.round(E, 3)                                   # the expected counts as written (3 decimals)
contrib = (O - E3) ** 2 / E3
chi_tab = ((O - E) ** 2 / E).sum()
q6_known = [*O.ravel(), *R, *C, n, *E.ravel(), *contrib.ravel(), chi_tab, contrib.sum(), 0.05]
q6_crit = {(0.05, 2): 5.991}
q6_extra = [('chi-square below the 0.05 cutoff', chi_tab < stats.chi2.isf(0.05, 2)),
            ('chi-square rounds to 3.068', round(chi_tab, 3) == 3.068),
            ('degrees of freedom', (O.shape[0] - 1) * (O.shape[1] - 1) == 2)]

# Homework 2 Problem 3(b): R output values and the Holm levels
r_out = {'C1': 9.4944, 'C2': 4.6895, 'C3': 18.234, '12': 0.64312, '13': 1.4982, '23': 4.2807}
asked = sorted(['C1', 'C2', 'C3'], key=lambda k: -r_out[k]); k = len(asked)
levels = [0.05 / (k - j + 1) for j in range(1, k + 1)]
holm_reject = []
for key, a in zip(asked, levels):
    if r_out[key] > stats.chi2.isf(a, 1): holm_reject.append(key)
    else: break
hw_known = [*r_out.values(), *levels, 0.05, k]
hw_crit = {(0.05, 1): 3.841, (0.025, 1): 5.024, (0.01, 1): 6.635}
hw_extra = [('order is C3, C1, C2', asked == ['C3', 'C1', 'C2']),
            ('0.0167 cutoff lies between printed 0.025 and 0.01 values', 5.024 < stats.chi2.isf(0.05 / 3, 1) < 6.635),
            ('Holm rejects all three', holm_reject == ['C3', 'C1', 'C2'])]

# Session 12 goodness-of-fit example (pages 23 and 24)
obs = np.array([255, 125, 90]); p = np.array([0.60, 0.25, 0.15]); N = obs.sum()
e = p * N; parts = (obs - e) ** 2 / e; gof = parts.sum()
gof_known = [*obs, *p, N, *e, *parts, gof, 0.025, 0.05]
gof_crit = {(0.05, 2): 5.991, (0.025, 2): 7.378, (0.01, 2): 9.210}
gof_extra = [('P between 0.01 and 0.025', 0.01 < stats.chi2.sf(gof, 2) < 0.025), ('N is 470', N == 470)]

run(12, {'Chi-square test for a table': (q6_known, q6_crit, q6_extra),
         'Pairwise chi-square with Holm from R output': (hw_known, hw_crit, hw_extra),
         'Goodness of fit': (gof_known, gof_crit, gof_extra)})
