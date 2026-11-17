"""Independent check of authoring/module2/practice/session19.json.

Refits every regression and logistic model from the raw invented data in DATA with NumPy/SciPy and
compares every number of the real R printouts (rOutput) and of the tables. Recomputes every answer
and every `values` entry from the raw inputs (from the printed R numbers where the solution works
from them, as the reference cases do). Checks every printed critical value against SciPy within
table rounding, re-evaluates every arithmetic chain and inequality in the `work` lines, checks the
structure against the reference cases of the same method, and scans words and conclusions for
colons, semicolons and banned words.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session19.py
"""
import json, math, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session19.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, '..', 'neuro', 'ref', 'session19.json'), encoding='utf-8'))

# raw invented data behind the tables and the R printouts (the R code in rCode uses the same vectors)
DATA = {
    'slA': {
        'ageH': [60, 54, 45, 45, 47, 56, 68, 56, 51, 68, 48, 57, 50, 40, 42, 61, 55, 57, 58, 62, 70, 47],
        'idxH': [2.0, 2.62, 2.31, 3.22, 2.97, 2.87, 1.84, 2.6, 2.39, 1.66, 2.68, 1.87, 2.48, 2.88, 3.17, 2.33, 2.4, 2.36, 2.14, 2.27, 1.49, 2.65],
        'ageN': [46, 40, 61, 48, 55, 43, 50, 45, 48, 53, 47, 55, 52, 53, 55, 45, 58, 48, 62, 47, 52, 68, 45],
        'idxN': [3.45, 3.74, 2.86, 3.13, 3.21, 3.56, 3.64, 3.61, 3.43, 3.03, 3.65, 3.3, 3.56, 3.0, 3.29, 3.38, 3.46, 3.63, 2.91, 3.38, 3.69, 3.31, 3.66],
    },
    'slB': {
        'saoA': [97, 74, 89, 96, 97, 70, 75, 92, 82, 98, 84, 77, 79, 92, 72],
        'spoA': [99, 78, 88, 95, 95, 70, 76, 91, 82, 99, 84, 78, 81, 93, 72],
        'saoB': [78, 84, 100, 78, 85, 100, 71, 97, 78, 75, 71, 100, 96, 83],
        'spoB': [80, 89, 100, 81, 87, 99, 73, 97, 81, 74, 74, 96, 97, 82],
    },
    'mA': {
        'Ferritin': [167, 154, 151, 152, 141, 127, 127, 136, 118, 114, 142, 158, 167, 136, 146, 139, 138, 149, 141, 127, 122, 120, 141, 147, 124, 143, 155, 150, 139, 136],
        'Age': [71, 48, 60, 57, 68, 31, 44, 55, 37, 32, 53, 69, 51, 37, 55, 41, 49, 69, 60, 44, 35, 45, 51, 50, 33, 40, 67, 55, 52, 31],
        'BMI': [32.4, 33.3, 26.8, 32.6, 25.5, 31.9, 26.4, 34.4, 24.4, 20.4, 32.9, 34.3, 35.4, 28.7, 31.2, 32.2, 29.7, 31.3, 25.6, 21.8, 22.2, 25.7, 23.7, 22.3, 27.6, 32.0, 30.8, 28.2, 30.2, 27.0],
        'HR': [79, 65, 78, 60, 87, 58, 71, 63, 83, 71, 73, 84, 65, 85, 77, 61, 59, 68, 73, 88, 72, 88, 66, 87, 89, 63, 64, 64, 77, 69],
    },
    'mB': {
        'ALT': [82, 93, 92, 66, 76, 88, 106, 90, 99, 106, 104, 98, 86, 89, 91, 93, 88, 94, 88, 75, 87, 92, 98, 89, 96, 81, 92, 69, 78, 99, 72, 77, 118, 96, 91, 98, 96, 78, 83, 97],
        'Waist': [100, 84, 80, 72, 86, 110, 100, 92, 111, 117, 115, 117, 89, 96, 108, 83, 110, 101, 97, 75, 103, 99, 108, 86, 97, 99, 102, 111, 102, 93, 72, 75, 113, 106, 116, 116, 93, 72, 91, 94],
        'Activity': [4.7, 6.4, 3.2, 6.4, 6.4, 3.1, 2.3, 0.8, 2.2, 4.4, 2.6, 5.4, 7.6, 5.7, 3.6, 2.7, 8.4, 3.5, 6.2, 8.4, 3.5, 5.0, 2.8, 6.8, 3.6, 7.0, 6.4, 8.7, 5.0, 5.5, 4.8, 2.0, 1.4, 0.8, 7.9, 2.3, 3.9, 0.6, 0.7, 5.2],
        'Sleep': [8.7, 6.7, 7.1, 7.7, 7.6, 7.7, 5.2, 8.8, 5.2, 8.0, 6.3, 8.7, 5.4, 8.1, 6.8, 7.3, 7.3, 7.4, 8.9, 8.5, 5.9, 8.7, 7.7, 5.6, 7.1, 8.6, 5.3, 8.1, 6.5, 5.4, 8.5, 8.7, 8.1, 8.2, 7.4, 6.7, 5.7, 7.0, 7.8, 6.4],
    },
    'lA': {
        'AKI': [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0],
        'CPB': [122, 110, 53, 97, 145, 50, 117, 50, 116, 142, 169, 96, 129, 74, 131, 52, 120, 45, 69, 49, 127, 98, 93, 195, 192, 107, 163, 78, 191, 62, 112, 124, 120, 126, 100, 78, 205, 133, 204, 57, 60, 73, 61, 143, 177, 66, 202, 157, 109, 177, 107, 64, 173, 164, 95, 173, 162, 49, 89, 206, 121, 86, 185, 170, 109, 62, 166, 157, 185, 176, 107, 194, 133, 136, 182, 132, 201, 146, 163, 108],
    },
    'lB': {
        'Restenosis': [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
        'Pressure': [13, 11, 20, 13, 20, 15, 18, 16, 20, 18, 10, 9, 16, 17, 18, 17, 13, 20, 20, 12, 11, 10, 12, 18, 10, 16, 12, 12, 16, 19, 9, 12, 13, 12, 13, 17, 15, 12, 19, 12, 14, 10, 16, 14, 10, 18, 19, 12, 19, 12],
    },
    'fit': {
        'Fluid': [3680, 2950, 3440, 3240, 3300, 3020, 3810, 3100, 3500, 3110, 3950, 3860],
        'Temp': [40, 36, 38, 37, 38, 38, 41, 36, 38, 36, 40, 41],
        'Years': [17, 11, 9, 8, 8, 12, 14, 14, 13, 9, 17, 14],
    },
}

# ---------------------------------------------------------------- shared helpers
errors = []
def need(cond, msg):
    if not cond:
        errors.append(msg)
def close(a, b, rel=1e-9, ab=1e-9):
    return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))
def decimals(s):
    s = s.strip()
    return len(s.split('.')[1]) if '.' in s else 0

def _braced(s, i):
    """s[i] == '{' -> (content, index after the closing brace)"""
    depth = 0
    for j in range(i, len(s)):
        if s[j] == '{': depth += 1
        elif s[j] == '}':
            depth -= 1
            if depth == 0: return s[i + 1:j], j + 1
    raise ValueError(s)

def to_py(seg):
    """LaTeX arithmetic -> Python expression, or None when the segment holds symbols."""
    s = seg.strip()
    for a, b in [('\\left', ''), ('\\right', ''), ('\\,', ''), ('\\ ', ''), ('\\quad', ''), ('\\cdot', '*'), ('\\times', '*'), ('−', '-')]:
        s = s.replace(a, b)
    if not s: return None
    out = ''
    i = 0
    while i < len(s):
        if s.startswith('\\frac', i) or s.startswith('\\tfrac', i):
            i = s.index('{', i)
            a, i = _braced(s, i); b, i = _braced(s, i)
            pa, pb = to_py(a), to_py(b)
            if pa is None or pb is None: return None
            out += f'(({pa})/({pb}))'
        elif s.startswith('\\sqrt', i):
            a, i = _braced(s, i + 5)
            pa = to_py(a)
            if pa is None: return None
            out += f'sqrt({pa})'
        elif s.startswith('e^{', i):
            a, i = _braced(s, i + 2)
            pa = to_py(a)
            if pa is None: return None
            out += f'exp({pa})'
        elif s[i] == '^':
            if s[i + 1] == '{':
                a, i = _braced(s, i + 1)
                pa = to_py(a)
                if pa is None: return None
                out += f'**({pa})'
            else:
                out += '**' + s[i + 1]; i += 2
        elif s[i] in '[]':
            out += '(' if s[i] == '[' else ')'; i += 1
        elif s[i] in '0123456789.+-*/() ':
            out += s[i]; i += 1
        else:
            return None
    out = re.sub(r'(\d|\))\s*\(', r'\1*(', out)
    out = re.sub(r'\)\s*(\d)', r')*\1', out)
    out = re.sub(r'\)\s*(sqrt|exp)', r')*\1', out)
    out = re.sub(r'(\d)\s*(sqrt|exp)', r'\1*\2', out)
    if not re.search(r'\d', out): return None
    return out

def ev(seg):
    p = to_py(seg)
    if p is None: return None
    try:
        return float(eval(p, {'__builtins__': {}}, {'sqrt': math.sqrt, 'exp': math.exp}))
    except Exception:
        return None

def seg_tol(seg):
    m = re.fullmatch(r'\s*-?(\d+)(?:\.(\d+))?\s*', seg)
    if m:
        d = len(m.group(2) or '')
        return 10 ** (-d)
    return None

def check_pm(cid, a_str, rest_lo, rest_hi):
    m = re.fullmatch(r'(-?[0-9.]+)\\pm([0-9.]+)\(([0-9.]+)\)', a_str.strip())
    if m:
        c, t, s = float(m[1]), float(m[2]), float(m[3])
        lo, hi = c - t * s, c + t * s
    else:
        m = re.fullmatch(r'(-?[0-9.]+)\\pm([0-9.]+)', a_str.strip())
        if not m:
            need(False, f'{cid}: cannot parse +- line {a_str}'); return
        lo, hi = float(m[1]) - float(m[2]), float(m[1]) + float(m[2])
    for got, exp in [(rest_lo, lo), (rest_hi, hi)]:
        need(abs(float(got) - exp) <= max(1.01 * 10 ** (-decimals(got)), 2e-3 * abs(exp)), f'{cid}: interval end {got} vs {exp:.6f} in {a_str}')

def check_work_line(cid, w, nxt=None):
    """re-evaluates every numeric equality and inequality chain in one work line"""
    if 'begin{bmatrix}' in w or '\\texttt' in w: return 0
    n_checked = 0
    if '\\leftrightarrow' in w:
        w = w.split('\\leftrightarrow')[-1]
        if '\\pm' not in w: return 0
    if '\\pm' in w:
        m = re.search(r'([^=:]*\\pm[^=]*)=\[(-?[0-9.]+),\\?\s*(-?[0-9.]+)\]', w)
        if m:
            check_pm(cid, m[1].replace('\\ ', '').split(':')[-1], m[2], m[3]); return 1
        if nxt is not None:
            m2 = re.fullmatch(r'\[(-?[0-9.]+),\\ (-?[0-9.]+)\]', nxt.strip())
            if m2:
                check_pm(cid, w, m2[1], m2[2]); return 1
        need(False, f'{cid}: unchecked +- line {w}'); return 0
    w = re.sub(r'\\ \((?:P|0\.\d+)[<>].*\)$', '', w)
    parts = [p for p in re.split(r',\\ (?=[^,]*=)', w)] if w.count('=') > 1 and ',\\ ' in w else [w]
    for part in parts:
        if ',' in part and not re.search(r'\\frac|\\sqrt', part):
            continue
        toks = re.split(r'(=|<|>)', part)
        segs, ops = toks[0::2], toks[1::2]
        groups = [[segs[0]]]
        rel = []
        for op, sg in zip(ops, segs[1:]):
            if op == '=':
                groups[-1].append(sg)
            else:
                rel.append(op); groups.append([sg])
        gvals = []
        for g in groups:
            vals = [(s, ev(s)) for s in g]
            nums = [(s, v) for s, v in vals if v is not None]
            if len(nums) >= 2:
                last_s, last_v = nums[-1]
                t = seg_tol(last_s)
                for s, v in nums[:-1]:
                    tl = max(5e-4 * abs(last_v), 1.01 * t if t is not None else 1e-9, 1e-9)
                    need(abs(v - last_v) <= tl, f'{cid}: {s} = {v:.6g} but line says {last_s} in  {w}')
                    n_checked += 1
            gvals.append(nums[-1][1] if nums else None)
        for (op, a, b) in zip(rel, gvals[:-1], gvals[1:]):
            if a is None or b is None: continue
            need(a > b if op == '>' else a < b, f'{cid}: inequality fails in {w}')
            n_checked += 1
    return n_checked

def check_all_work(case):
    n = 0
    for s in case['steps']:
        ws = s.get('work', [])
        for i, w in enumerate(ws):
            n += check_work_line(case['id'], w, ws[i + 1] if i + 1 < len(ws) else None)
    return n

T_ROWS_PRINTED = set(range(1, 41)) | {42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 90, 100, 120, 140, 160, 180, 200}
F_ROWS_PRINTED = set(range(1, 31)) | {32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 60, 70, 80, 100, 120}
NORMAL = {1.96: 0.05, 1.960: 0.05, 3.2905: 0.001, 2.3263: 0.02, 1.2816: 0.20, 1.6449: 0.10, 2.5758: 0.01}

def tcrit(a, df): return stats.t.ppf(1 - a / 2, df)

def check_crit_lines(cid, case):
    """every printed critical value written in work lines is checked against SciPy within table rounding"""
    n = 0
    for s in case['steps']:
        for w in s.get('work', []):
            for a, df, v in re.findall(r't_\{([0-9.]+)\}\((\d+)\)=([0-9.]+)', w):
                need(int(df) in T_ROWS_PRINTED, f'{cid}: t row {df} is not printed')
                need(abs(tcrit(float(a), int(df)) - float(v)) <= 0.0011, f'{cid}: t_{a}({df})={v} vs SciPy {tcrit(float(a), int(df)):.4f}')
                n += 1
            for a, n1, n2, v in re.findall(r'F_\{([0-9.]+)\}\((\d+),(\d+)\)=([0-9.]+)', w):
                need(int(n2) in F_ROWS_PRINTED, f'{cid}: F row {n2} is not printed')
                need(abs(stats.f.ppf(1 - float(a), int(n1), int(n2)) - float(v)) <= 0.011, f'{cid}: F_{a}({n1},{n2})={v} vs SciPy')
                n += 1
            for v in re.findall(r'(?<![0-9.])(1\.960|3\.2905|2\.3263|1\.2816|1\.6449)(?![0-9])', w):
                a = NORMAL[float(v)]
                need(abs(stats.norm.ppf(1 - a / 2) - float(v)) <= 0.0006, f'{cid}: Normal cutoff {v}')
                n += 1
    return n

def check_lookup(cid, lk):
    if lk is None: return
    path, v = lk['path'], lk['value']
    if path.endswith('t_table.pdf'):
        col = float(lk['column'])
        if lk['row'] == '∞':
            need(abs(stats.norm.ppf(1 - col / 2) - v) <= 0.0006, f'{cid}: lookup inf row')
            need(lk['page'] == 2, f'{cid}: inf row is on page 2')
        else:
            row = int(lk['row'])
            need(row in T_ROWS_PRINTED, f'{cid}: lookup row {row} not printed')
            need(abs(tcrit(col, row) - v) <= 0.0011, f'{cid}: lookup t {row} {v}')
            need(lk['page'] == (1 if row <= 46 else 2), f'{cid}: lookup page')
            if lk['actualDf'] != row:
                need(lk['approximation'] is True and row < lk['actualDf'], f'{cid}: bracketed row must be the lower printed row and flagged')
            else:
                need(lk['approximation'] is False, f'{cid}: approximation flag')
    elif path.endswith('F_table.pdf'):
        nn = int(re.search(r'(\d+)', lk['column'])[1]); dd = int(re.search(r'(\d+)', lk['row'])[1])
        need(dd in F_ROWS_PRINTED, f'{cid}: F row')
        need(abs(stats.f.ppf(0.95, nn, dd) - v) <= 0.011, f'{cid}: lookup F {nn},{dd} {v}')
        need(lk['page'] == (1 if dd <= 34 else 2), f'{cid}: F page')
    elif 'Chi_Squared' in path:
        need(abs(stats.chi2.ppf(1 - float(lk['column']), int(lk['row'])) - v) <= 0.0011, f'{cid}: lookup chi')
    else:
        need(False, f'{cid}: unknown table {path}')

BANNED = re.compile(r'\b(picture|pictured|professor|lecture|slide|slides|session)\b', re.I)
def check_style(case):
    cid = case['id']
    texts = [('conclusion', case['conclusion'])] + [(f'step {i+1} words', s['words']) for i, s in enumerate(case['steps'])]
    if case.get('hypotheses'):
        texts += [('nullWords', case['hypotheses']['nullWords']), ('alternativeWords', case['hypotheses']['alternativeWords'])]
    for name, t in texts:
        plain = re.sub(r'\\\(.*?\\\)', '', t)
        need(':' not in plain and ';' not in plain, f'{cid}: colon or semicolon in {name}')
        need(not BANNED.search(t), f'{cid}: banned word in {name}')
    for name, t in [('context', case['context']), ('title', case['title'])] + [('task', x) for x in case['tasks']]:
        need(not BANNED.search(t), f'{cid}: banned word in {name}')
        need('Session' not in t, f'{cid}: session in {name}')

# ---------------------------------------------------------------- model fits from the raw data
def ols(y, *xs):
    y = np.asarray(y, float); X = np.column_stack([np.ones(len(y))] + [np.asarray(x, float) for x in xs])
    n, p = X.shape
    XtXi = np.linalg.inv(X.T @ X); b = XtXi @ X.T @ y
    r = y - X @ b; SSres = float(r @ r); SStot = float(((y - y.mean()) ** 2).sum())
    s2 = SSres / (n - p); se = np.sqrt(np.diag(XtXi) * s2); t = b / se
    pv = 2 * stats.t.sf(np.abs(t), n - p)
    R2 = 1 - SSres / SStot; k = p - 1
    F = (R2 / k) / ((1 - R2) / (n - p))
    q = stats.t.ppf(0.975, n - p)
    return dict(b=b, se=se, t=t, p=pv, s=math.sqrt(s2), R2=R2, adjR2=1 - (1 - R2) * (n - 1) / (n - p), F=F, Fp=stats.f.sf(F, k, n - p),
                df=n - p, ci=np.column_stack([b - q * se, b + q * se]), SSres=SSres, SStot=SStot)

def logit_fit(y, x):
    y = np.asarray(y, float); X = np.column_stack([np.ones(len(y)), np.asarray(x, float)])
    b = np.zeros(2)
    for _ in range(100):
        mu = 1 / (1 + np.exp(-X @ b)); W = mu * (1 - mu)
        b_new = b + np.linalg.solve(X.T @ (W[:, None] * X), X.T @ (y - mu))
        if np.max(np.abs(b_new - b)) < 1e-12: b = b_new; break
        b = b_new
    mu = 1 / (1 + np.exp(-X @ b)); W = mu * (1 - mu)
    se = np.sqrt(np.diag(np.linalg.inv(X.T @ (W[:, None] * X))))
    z = b / se
    dev = -2 * float((y * np.log(mu) + (1 - y) * np.log(1 - mu)).sum())
    p0 = y.mean(); null = -2 * float(len(y) * (p0 * math.log(p0) + (1 - p0) * math.log(1 - p0)))
    return dict(b=b, se=se, z=z, p=2 * stats.norm.sf(np.abs(z)), dev=dev, null=null)

def rnum(s):
    return float(s)

def coef_lines(rout):
    """coefficient rows of every summary() printout in an R output: list of (name, [numbers as strings])"""
    rows = []
    take = False
    for line in rout:
        if line.startswith('            Estimate') or line.startswith('             Estimate'):
            take = True; continue
        if take:
            if line.startswith('---') or line == '':
                take = False; continue
            parts = line.split()
            rows.append((parts[0], parts[1:5]))
    return rows

def same_printed(cid, printed, exact, what):
    """a number as R printed it must equal the refit rounded to the printed digits"""
    printed = str(printed)
    if 'e' in printed:
        m, e = printed.split('e')
        sig = len(m.replace('-', '').replace('.', '').lstrip('0'))
        need(abs(float(printed) - exact) <= 0.51 * 10 ** (int(e) - (len(m.split('.')[1]) if '.' in m else 0)), f'{cid}: {what} printed {printed} vs refit {exact:.6g}')
    else:
        d = decimals(printed)
        need(abs(float(printed) - exact) <= 0.51 * 10 ** (-d) + 1e-12, f'{cid}: {what} printed {printed} vs refit {exact:.8g}')

def check_r_summary(cid, rout, fit, names):
    rows = coef_lines(rout)
    need(len(rows) == len(names), f'{cid}: coefficient rows {len(rows)}')
    for (nm, vals), j in zip(rows, range(len(names))):
        need(nm == names[j], f'{cid}: row name {nm}')
        same_printed(cid, vals[0], fit['b'][j], f'{nm} estimate')
        same_printed(cid, vals[1], fit['se'][j], f'{nm} SE')
        same_printed(cid, vals[2], fit['t'][j] if 't' in fit else fit['z'][j], f'{nm} t/z')
        pv = vals[3].replace('<', '')
        need(close(float(pv), fit['p'][j], 0.01, 1e-15) or float(pv) >= fit['p'][j] * 0.99, f'{cid}: {nm} P printed {pv} vs {fit["p"][j]:.4g}')

def check_r_footer(cid, rout, fit, start=0):
    txt = '\n'.join(rout)
    m = re.findall(r'Residual standard error: ([0-9.]+) on (\d+) degrees of freedom', txt)[start]
    same_printed(cid, m[0], fit['s'], 'residual SE'); need(int(m[1]) == fit['df'], f'{cid}: df')
    m = re.findall(r'Multiple R-squared:\s+([0-9.]+),\tAdjusted R-squared:\s+([0-9.]+)', txt)[start]
    same_printed(cid, m[0], fit['R2'], 'R2'); same_printed(cid, m[1], fit['adjR2'], 'adj R2')
    m = re.findall(r'F-statistic:\s+([0-9.]+) on (\d+) and (\d+) DF,\s+p-value: ([0-9.e\-]+)', txt)[start]
    need(abs(float(m[0]) - fit['F']) <= 0.505 * 10 ** (math.floor(math.log10(fit['F'])) - 3), f'{cid}: F printed {m[0]} vs {fit["F"]:.5g}')
    need(close(float(m[3]), fit['Fp'], 1e-3, 1e-300), f'{cid}: F p-value {m[3]} vs {fit["Fp"]:.5g}')

def check_confint(cid, rout, fit, names):
    i = [k for k, l in enumerate(rout) if '2.5 %' in l][0]
    for j, nm in enumerate(names):
        parts = rout[i + 1 + j].split()
        need(parts[0] == nm, f'{cid}: confint row {parts[0]}')
        same_printed(cid, parts[1], fit['ci'][j, 0], f'confint {nm} low'); same_printed(cid, parts[2], fit['ci'][j, 1], f'confint {nm} high')
    return i

def table_matches_r(cid, case_rows, rout_rows):
    """the coefficient rows of `table` carry the R numbers"""
    for crow, (nm, vals) in zip(case_rows, rout_rows):
        need(crow[0] == nm, f'{cid}: table row name {crow[0]} vs {nm}')
        for got, want in zip(crow[1:5], vals):
            need(close(float(got), float(want.replace('<', '')), 1e-9, 1e-12), f'{cid}: table value {got} vs R {want}')

def r_quotes(case):
    """numbers quoted as 'R prints X' or 'R gives P = X' must appear in the printout"""
    txt = '\n'.join(case.get('rOutput', []))
    for s in [case['conclusion']] + [st['words'] for st in case['steps']]:
        for q in re.findall(r'R (?:prints|gives) (?:P = |Multiple R-squared |)?(-?[0-9][0-9.e\-]*[0-9])', s):
            need(q in txt, f'{case["id"]}: quoted R number {q} not in the printout')

# ---------------------------------------------------------------- checks per method
def chk_margin(c):
    rows = c['table']['rows']; (_, m1, n1), (_, m2, n2) = rows
    p1, p2 = m1 / n1, m2 / n2; pooled = (m1 + m2) / (n1 + n2)
    se = math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2)); M = 1.96 * se; d = p1 - p2
    exp = dict(m1=m1, n1=n1, m2=m2, n2=n2, p1=p1, p2=p2, pooled=pooled, se=se, critical=1.96, difference=d, margin=M, lower=d - M, upper=d + M, reject=not (d - M <= 0 <= d + M))
    cmp_values(c, exp); need(close(c['answer'], M), f'{c["id"]}: answer')
    # the two-proportion z test agrees with the interval
    z = d / se
    need((abs(z) > 1.96) == exp['reject'], f'{c["id"]}: z test disagrees with interval')

def chk_design(c):
    (_, a, b, nT), (_, cc, dd, nC) = c['table']['rows']
    need(a + b == nT and cc + dd == nC, f'{c["id"]}: totals')
    chi, p, dof, E = stats.chi2_contingency([[a, b], [cc, dd]], correction=True)
    rT, rC = a / nT, cc / nC
    exp = dict(nTD=a, nTA=b, nCD=cc, nCA=dd, nT=nT, nC=nC, riskT=rT, riskC=rC, RR=rT / rC, chiSquare=chi, df=dof, critical=3.841, reject=chi > 3.841)
    cmp_values(c, exp); need(close(c['answer'], rT / rC), f'{c["id"]}: answer')
    need(stats.chi2.ppf(0.995, 1) < chi < stats.chi2.ppf(0.999, 1), f'{c["id"]}: P bracket 0.001-0.005')

def chk_slopes(c, key):
    d = DATA[key]
    xs = [v for k, v in d.items()]
    f1 = ols(xs[1], xs[0]); f2 = ols(xs[3], xs[2])
    rr = coef_lines(c['rOutput'])
    need(len(rr) == 4, f'{c["id"]}: two summaries expected')
    calls = [i for i, l in enumerate(c['rOutput']) if l.startswith('Call:')]
    check_r_summary(c['id'], c['rOutput'][calls[0]:calls[1]], f1, ['(Intercept)', rr[1][0]])
    check_r_summary(c['id'], c['rOutput'][calls[1]:], f2, ['(Intercept)', rr[3][0]])
    check_r_footer(c['id'], c['rOutput'], f1, 0); check_r_footer(c['id'], c['rOutput'], f2, 1)
    (_, n1, b1, s1, r1), (_, n2, b2, s2, r2) = c['table']['rows']
    need(n1 == len(xs[0]) and n2 == len(xs[2]), f'{c["id"]}: n')
    need(float(rr[1][1][0]) == b1 and float(rr[1][1][1]) == s1 and float(rr[3][1][0]) == b2 and float(rr[3][1][1]) == s2, f'{c["id"]}: table slopes differ from R')
    se = math.sqrt(s1 ** 2 + s2 ** 2); t = (b1 - b2) / se; df = n1 + n2 - 4
    crit = c['values']['critical']
    need(abs(crit - tcrit(0.05, int(c['lookup']['row']))) < 0.0011, f'{c["id"]}: critical')
    exp = dict(bM=b1, sbM=s1, bF=b2, sbF=s2, nM=n1, nF=n2, difference=b1 - b2, seDiff=se, t=t, df=df, critical=crit, reject=abs(t) > crit)
    cmp_values(c, exp); need(close(c['answer'], t), f'{c["id"]}: answer')
    # the exact-df decision agrees with the bracketed one
    need((abs(t) > tcrit(0.05, df)) == exp['reject'], f'{c["id"]}: exact df decision differs')
    texact = (f1['b'][1] - f2['b'][1]) / math.sqrt(f1['se'][1] ** 2 + f2['se'][1] ** 2)
    need(abs(texact - t) < 0.01, f'{c["id"]}: unrounded t {texact:.4f}')

def chk_fit(c):
    d = DATA['fit']
    rows = c['table']['rows']
    need([r[1] for r in rows] == d['Fluid'] and [r[2] for r in rows] == d['Temp'] and [r[3] for r in rows] == d['Years'], f'{c["id"]}: table data')
    y = np.array(d['Fluid'], float); X = np.column_stack([np.ones(len(y)), d['Temp'], d['Years']])
    f = ols(y, d['Temp'], d['Years'])
    n, k = len(y), 2
    exp = dict(n=n, k=k, b0=f['b'][0], b1=f['b'][1], b2=f['b'][2], SSres=f['SSres'], SStot=f['SStot'], s2=f['SSres'] / (n - k - 1), s=f['s'], R2=f['R2'])
    cmp_values(c, exp); need(close(c['answer'], f['b'][1]), f'{c["id"]}: answer')
    # matrix entries shown in the work lines
    XtX = X.T @ X; Xty = X.T @ y; inv = np.linalg.inv(XtX)
    w = c['steps'][0]['work'][0]
    nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', w.split('=')[1])]
    need(np.allclose(nums, XtX.flatten()), f'{c["id"]}: XtX shown')
    nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', c['steps'][1]['work'][0].split('=')[1])]
    need(np.allclose(nums, Xty), f'{c["id"]}: Xty shown')
    nums = [float(v) for v in re.findall(r'-?\d+\.\d+', c['steps'][2]['work'][0].split('=')[1])]
    need(np.allclose(nums, inv.flatten(), atol=6e-7), f'{c["id"]}: inverse shown')
    # what R prints for this model (R 4.6.1 run on the same data), quoted in the words
    need(abs(f['b'][0] - (-2710.89)) < 0.006 and abs(f['b'][1] - 156.09) < 0.006 and abs(f['b'][2] - 12.65) < 0.006, f'{c["id"]}: R estimates')
    need(abs(f['s'] - 156.6) < 0.06 and abs(f['R2'] - 0.8337) < 0.00006, f'{c["id"]}: R footer')

def chk_mlr_refit(c):
    d = DATA['mA']
    full = ols(d['Ferritin'], d['Age'], d['BMI'], d['HR']); ref = ols(d['Ferritin'], d['Age'], d['BMI'])
    ro = c['rOutput']
    calls = [i for i, l in enumerate(ro) if l.startswith('Call:')]
    check_r_summary(c['id'], ro[calls[0]:calls[1]], full, ['(Intercept)', 'Age', 'BMI', 'HR'])
    check_r_summary(c['id'], ro[calls[1]:], ref, ['(Intercept)', 'Age', 'BMI'])
    check_r_footer(c['id'], ro, full, 0); check_r_footer(c['id'], ro, ref, 1)
    check_confint(c['id'], ro, full, ['(Intercept)', 'Age', 'BMI', 'HR'])
    rows = c['table']['rows']; rr = coef_lines(ro)
    table_matches_r(c['id'], [r[1:] for r in rows[0:4]], rr[0:4])
    table_matches_r(c['id'], [r[1:] for r in rows[9:12]], rr[4:7])
    ci_rows = rows[5:9]
    for j, r in enumerate(ci_rows):
        need(abs(r[2] - full['ci'][j, 0]) < 6e-8 and abs(r[3] - full['ci'][j, 1]) < 6e-8, f'{c["id"]}: confint in table')
    # values from the printed numbers
    bH, sH = rows[3][2], rows[3][3]; tc = 2.056
    need(abs(tcrit(0.05, 26) - tc) < 0.0011, f'{c["id"]}: tc')
    pred = rows[9][2] + rows[10][2] * 58 + rows[11][2] * 29.5
    exp = dict(n=30, k=3, F=19.69, tHR=bH / sH, ciHR=[bH - tc * sH, bH + tc * sH], refitB0=rows[9][2], refitAge=rows[10][2], refitBMI=rows[11][2], age=58, bmi=29.5, prediction=pred)
    cmp_values(c, exp); need(close(c['answer'], pred), f'{c["id"]}: answer')
    need(full['p'][3] > 0.05 and all(full['p'][1:3] < 0.05) and all(ref['p'][1:] < 0.001), f'{c["id"]}: significance pattern')
    need(abs(pred - (ref['b'][0] + ref['b'][1] * 58 + ref['b'][2] * 29.5)) < 0.01, f'{c["id"]}: prediction vs unrounded refit')

def chk_mlr_summary(c):
    d = DATA['mB']
    f = ols(d['ALT'], d['Waist'], d['Activity'], d['Sleep'])
    ro = c['rOutput']
    names = ['(Intercept)', 'Waist', 'Activity', 'Sleep']
    check_r_summary(c['id'], ro, f, names); check_r_footer(c['id'], ro, f, 0); check_confint(c['id'], ro, f, names)
    rows = c['table']['rows']
    table_matches_r(c['id'], rows[0:4], coef_lines(ro))
    R2 = 0.5396; n, k = 40, 3; tc = 2.028
    need(abs(tcrit(0.05, 36) - tc) < 0.0011, f'{c["id"]}: tc')
    b = [r[1] for r in rows[0:4]]; s = [r[2] for r in rows[0:4]]
    ci = lambda j: [b[j] - tc * s[j], b[j] + tc * s[j]]
    pred = b[0] + b[1] * 98 + b[2] * 3 + b[3] * 6.5
    F = (R2 / k) / ((1 - R2) / (n - k - 1))
    exp = dict(n=n, k=k, R2=R2, F=F, dfMod=3, dfRes=36, Fcritical=2.86, tWaist=b[1] / s[1], tActivity=b[2] / s[2], tSleep=b[3] / s[3], tcritical=tc,
               ciWaist=ci(1), ciActivity=ci(2), ciSleep=ci(3), prediction=pred, reject=True)
    cmp_values(c, exp); need(close(c['answer'], F), f'{c["id"]}: answer')
    for j in (1, 2, 3):
        cj = ci(j)
        need(abs(cj[0] - f['ci'][j, 0]) < 2e-4 and abs(cj[1] - f['ci'][j, 1]) < 2e-4, f'{c["id"]}: hand CI vs confint {j}')
    need(0.02 < f['p'][3] < 0.05 and 0.002 < f['p'][2] < 0.005 and f['p'][1] < 0.001, f'{c["id"]}: P ranges')

def chk_logistic(c, key, kind):
    d = DATA[key]; ys, xs = list(d.values())
    f = logit_fit(ys, xs)
    ro = c['rOutput']
    rr = coef_lines(ro)
    for (nm, vals), j in zip(rr, range(2)):
        # glm() stops its Fisher scoring at a deviance tolerance of 1e-8, so allow a relative 2e-5 on top of print rounding
        for v, e, what in [(vals[0], f['b'][j], 'estimate'), (vals[1], f['se'][j], 'SE'), (vals[2], f['z'][j], 'z')]:
            need(abs(float(v) - e) <= 0.51 * 10 ** (-decimals(v)) + 2e-5 * abs(e), f'{c["id"]}: {nm} {what} printed {v} vs refit {e:.8g}')
        need(close(float(vals[3]), f['p'][j], 0.01, 1e-15), f'{c["id"]}: {nm} P {vals[3]} vs {f["p"][j]:.4g}')
    txt = '\n'.join(ro)
    nd = re.search(r'Null deviance: ([0-9.]+)\s+on (\d+)', txt); rd = re.search(r'Residual deviance: ([0-9.]+)\s+on (\d+)', txt)
    same_printed(c['id'], nd[1], f['null'], 'null deviance'); same_printed(c['id'], rd[1], f['dev'], 'residual deviance')
    need(int(nd[2]) == len(ys) - 1 and int(rd[2]) == len(ys) - 2, f'{c["id"]}: deviance df')
    table_matches_r(c['id'], c['table']['rows'], rr)
    b0, b1 = c['table']['rows'][0][1], c['table']['rows'][1][1]; s1 = c['table']['rows'][1][2]
    z = b1 / s1
    P = lambda x: 1 / (1 + math.exp(-(b0 + b1 * x)))
    if kind == 'one':
        x = 150; eta = b0 + b1 * x; p = P(x); pr = round(p, 2)
        exp = dict(b0=b0, b1=b1, age=x, eta=eta, probability=p, oddsSlide=pr / (1 - pr), oddsExact=math.exp(eta), z=z)
        ans = p
        need(abs(z) > 3.2905, f'{c["id"]}: z bracket')
    else:
        exp = dict(b0=b0, b1=b1, p53=P(10), p75=P(18), oddsPerDegree=math.exp(b1), z=z, halfwayTemp=-b0 / b1)
        ans = P(10)
        need(1.2816 < abs(z) < 1.6449, f'{c["id"]}: z bracket')
    cmp_values(c, exp); need(close(c['answer'], ans), f'{c["id"]}: answer')

def cmp_values(c, exp):
    got = c['values']
    need(set(got) == set(exp), f'{c["id"]}: values keys differ {set(got) ^ set(exp)}')
    for k, e in exp.items():
        g = got.get(k)
        if isinstance(e, (bool, np.bool_)):
            need(g is bool(e), f'{c["id"]}: values.{k} {g} != {e}')
        elif isinstance(e, (list, tuple, np.ndarray)):
            need(g is not None and len(g) == len(e) and all(close(float(a), float(b), 1e-9, 1e-12) for a, b in zip(g, e)), f'{c["id"]}: values.{k} {g} != {list(e)}')
        else:
            need(g is not None and close(float(g), float(e), 1e-9, 1e-12), f'{c["id"]}: values.{k} {g} != {e}')

# ---------------------------------------------------------------- structure
REFC = {c['id']: c for c in REF['cases']}
METHODS = {m['id'] for m in REF['methods']}
MODEL = {'s19margin': ['s19-survey-margin'], 's19design': ['s19-hrt-relative-risk'], 's19slopes': ['s19-plutonian-slopes'],
         's19mlrfit': ['s19-sbp-least-squares'], 's19mlrtest': ['s19-sbp-summary', 's19-walk-refit'], 's19logistic': ['s19-chd-age', 's19-oring-temperature']}
ids = [c['id'] for c in D['cases']]
need(len(ids) == 10, 'expected 10 cases')
need(len(set(ids)) == len(ids), 'duplicate ids')
need(D['questions'] == [], 'questions must be empty')
need(set(D) == {'cases', 'questions', 'notes'}, 'top-level keys')
from collections import Counter
cnt = Counter(c['topic'] for c in D['cases'])
need(set(cnt) == METHODS, f'every method covered {cnt}')
need(max(cnt.values()) - min(cnt.values()) <= 1, f'cases spread evenly {cnt}')
titles = [c['title'] for c in D['cases']]
need(len(set(titles)) == len(titles), 'titles unique')
for c in D['cases']:
    cid = c['id']
    need(re.fullmatch(r'p19-[a-z0-9-]+', cid) is not None, f'{cid}: id form')
    need(c['topic'] in METHODS, f'{cid}: topic')
    need(c['module'] == 19, f'{cid}: module')
    need(c['source'] == 'Original practice example in the course style', f'{cid}: source')
    refs = [REFC[r] for r in MODEL[c['topic']]]
    extra = {'rOutput', 'rCode'}
    need(set(c) - extra == set(refs[0]), f'{cid}: case keys differ {set(c) ^ set(refs[0])}')
    need(len(c['steps']) >= min(len(r['steps']) for r in refs), f'{cid}: fewer steps than the reference case')
    lks = [s['classTable'] for s in c['steps'] if 'classTable' in s]
    need((c['lookup'] is None and not lks) or c['lookup'] in lks, f'{cid}: lookup must be one of the step classTables')
    for s in c['steps']:
        need(set(s) <= {'title', 'general', 'work', 'words', 'classTable'}, f'{cid}: step keys')
        if 'classTable' in s: check_lookup(cid, s['classTable'])
    check_lookup(cid, c['lookup'])
    need(abs(c['tolerance'] - max(0.001, round(abs(c['answer']) * 0.005, 6))) < 1e-9, f'{cid}: tolerance')
    if c['topic'] in ('s19mlrtest',):
        pass  # value keys follow the reference pattern with this case's variable names, checked by the recompute
    elif c['topic'] == 's19logistic':
        need(set(c['values']) in [set(r['values']) for r in refs], f'{cid}: values keys differ from the reference case')
    else:
        need(set(c['values']) == set(refs[0]['values']), f'{cid}: values keys differ from the reference case')
    if 'rOutput' in c:
        need(isinstance(c['rOutput'], list) and all(isinstance(x, str) for x in c['rOutput']) and c['rOutput'][0] == 'Call:', f'{cid}: rOutput form')
        need(isinstance(c['rCode'], str) and c['rCode'], f'{cid}: rCode')
        r_quotes(c)
    check_style(c)

# ---------------------------------------------------------------- recompute every case
by = {c['id']: c for c in D['cases']}
chk_margin(by['p19-telemonitoring-bp-margin']); chk_margin(by['p19-mattress-pressure-ulcer-margin'])
chk_design(by['p19-tai-chi-relative-risk'])
chk_slopes(by['p19-cardiac-index-age-slopes'], 'slA'); chk_slopes(by['p19-oximeter-sensor-slopes'], 'slB')
chk_fit(by['p19-heat-fluid-intake-least-squares'])
chk_mlr_refit(by['p19-ferritin-screening-refit']); chk_mlr_summary(by['p19-fatty-liver-alt-summary'])
chk_logistic(by['p19-bypass-time-kidney-injury'], 'lA', 'one'); chk_logistic(by['p19-stent-pressure-restenosis'], 'lB', 'two')
need(by['p19-telemonitoring-bp-margin']['values']['reject'] and not by['p19-mattress-pressure-ulcer-margin']['values']['reject'], 'margin outcomes')
need(by['p19-cardiac-index-age-slopes']['lookup']['approximation'] is True and by['p19-cardiac-index-age-slopes']['lookup']['actualDf'] == 41, 'df 41 bracket')

nwork = sum(check_all_work(c) for c in D['cases'])
ncrit = sum(check_crit_lines(c['id'], c) for c in D['cases'])

if errors:
    print(f'{len(errors)} problem(s)')
    for e in errors: print(' -', e)
    sys.exit(1)
print(f'session19.json OK: {len(D["cases"])} cases, {nwork} work-line equalities and inequalities and {ncrit} printed critical values re-checked')
