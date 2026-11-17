"""Check script for authoring/memorize_examples/session21.json (run with NumPy/SciPy). Exits 0 when every number checks."""
# ---- shared LaTeX arithmetic checker (copied into each check_session{N}.py) ----
import json, math, re, sys, pathlib

FAILS = []
NCHECK = [0]

def fail(msg):
    FAILS.append(msg)

def _match_brace(s, i):
    """s[i] == '{'; return index of matching '}'."""
    depth = 0
    for j in range(i, len(s)):
        if s[j] == '{':
            depth += 1
        elif s[j] == '}':
            depth -= 1
            if depth == 0:
                return j
    raise ValueError('unbalanced braces')

def _arg(s, i):
    """Read one TeX argument starting at s[i]: {...} or one character. Return (text, next index)."""
    while i < len(s) and s[i] == ' ':
        i += 1
    if s[i] == '{':
        j = _match_brace(s, i)
        return s[i + 1:j], j + 1
    return s[i], i + 1

def tex_to_py(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('\\big', '').replace('\\Big', '')
    s = s.replace('\\,', '').replace('\\ ', '').replace('\\!', '').replace('~', '')
    s = s.replace('\\cdot', '*').replace('\\times', '*')
    out, i = '', 0
    while i < len(s):
        if s.startswith('\\frac', i) or s.startswith('\\dfrac', i):
            i += 5 if s.startswith('\\frac', i) else 6
            a, i = _arg(s, i)
            b, i = _arg(s, i)
            out += '((' + tex_to_py(a) + ')/(' + tex_to_py(b) + '))'
        elif s.startswith('\\sqrt', i):
            i += 5
            a, i = _arg(s, i)
            out += 'sqrt(' + tex_to_py(a) + ')'
        elif s[i] == '^':
            a, i = _arg(s, i + 1)
            out += '**(' + tex_to_py(a) + ')'
        elif s[i] == '{':
            j = _match_brace(s, i)
            out += '(' + tex_to_py(s[i + 1:j]) + ')'
            i = j + 1
        else:
            out += s[i]
            i += 1
    out = out.replace('[', '(').replace(']', ')')
    for _ in range(3):
        out = re.sub(r'\|([^|]+)\|', r'abs(\1)', out)
    out = re.sub(r'(\d|\))\s*\(', r'\1*(', out)
    out = out.replace('abs*(', 'abs(').replace('sqrt*(', 'sqrt(')
    return out

ALLOWED = re.compile(r'^(?:[\d\.\+\-\*/\(\)\s]|abs|sqrt)+$')
LIT = re.compile(r'^\s*-?\d+(?:\.\d+)?\s*$')

def value(seg):
    seg = seg.strip()
    if not seg:
        return None
    try:
        py = tex_to_py(seg)
    except Exception:
        return None
    if not ALLOWED.match(py) or not re.search(r'\d', py):
        return None
    try:
        return float(eval(py, {'__builtins__': {}}, {'sqrt': math.sqrt, 'abs': abs}))
    except Exception:
        return None

def ulp(seg):
    seg = seg.strip()
    if LIT.match(seg):
        return 10 ** -(len(seg.split('.')[1]) if '.' in seg else 0)
    return 0.0

REL = re.compile(r'(\\approx|\\le|\\ge|\\ne|=|<|>)')

def split_top(s, seps):
    """Split s on any of seps that sit outside braces."""
    parts, depth, cur, i = [], 0, '', 0
    while i < len(s):
        c = s[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
        hit = next((p for p in seps if depth == 0 and s.startswith(p, i)), None)
        if hit:
            parts.append(cur); cur = ''; i += len(hit); continue
        cur += c; i += 1
    parts.append(cur)
    return parts

def check_chain(line, where):
    toks = []  # alternating segment, relation
    depth, cur, i = 0, '', 0
    while i < len(line):
        c = line[i]
        if c == '{': depth += 1
        elif c == '}': depth -= 1
        m = REL.match(line, i) if depth == 0 else None
        if m and not line.startswith('\\left', i):
            toks.append(cur); toks.append(m.group(1)); cur = ''; i = m.end(); continue
        cur += c; i += 1
    toks.append(cur)
    segs, rels = toks[0::2], toks[1::2]
    vals = [value(s) for s in segs]
    ulps = [ulp(s) for s in segs]
    # symbols joined by '=' to a number take that number
    for _ in range(2):
        for k, r in enumerate(rels):
            if r == '=':
                if vals[k] is None and vals[k + 1] is not None: vals[k] = vals[k + 1]; ulps[k] = ulps[k + 1]
                if vals[k + 1] is None and vals[k] is not None: vals[k + 1] = vals[k]; ulps[k + 1] = ulps[k]
    for k, r in enumerate(rels):
        a, b = vals[k], vals[k + 1]
        if a is None or b is None:
            continue
        NCHECK[0] += 1
        tol = max(ulps[k], ulps[k + 1], 2e-4 * max(abs(a), abs(b)), 1e-9)
        ok = {'=': abs(a - b) <= tol, '\\approx': abs(a - b) <= max(tol, 0.01 * abs(b)),
              '<': a < b, '>': a > b, '\\le': a <= b + 1e-12, '\\ge': a >= b - 1e-12, '\\ne': a != b}[r]
        if not ok:
            fail(f'{where}: "{segs[k].strip()}" {r} "{segs[k + 1].strip()}" is false ({a} vs {b}) in {line}')

def check_work_line(line, where):
    if '\\texttt' in line:
        return
    for part in line.split('\\Rightarrow'):
        for item in split_top(part, [',\\quad', ',\\qquad', '\\qquad', '\\quad', ',\\ ']):
            check_chain(item, where)

def load(path):
    return json.loads(pathlib.Path(path).read_text())

def all_work(ex):
    return [w for st in ex['steps'] for w in st.get('work', [])]

def check_example_arithmetic(ex):
    for k, st in enumerate(ex['steps']):
        for w in st.get('work', []):
            check_work_line(w, f'{ex["title"]} step {k + 1}')

def shows(ex, x, dec, label=''):
    """Assert the number x, rounded to dec places, is written in this example's work lines."""
    txt = ' '.join(all_work(ex)) + ' ' + ex.get('prompt', '')
    s = f'{x:.{dec}f}'
    if s.startswith('-0.') and float(s) == 0:
        s = s[1:]
    if s not in txt:
        fail(f'{ex["title"]}: expected {label or "value"} {s} in the work')

def printed(name, printed_value, exact, decimals):
    """A printed table value must equal the exact SciPy value within table rounding."""
    NCHECK[0] += 1
    if abs(printed_value - exact) > 0.5 * 10 ** -decimals + 1e-9:
        fail(f'table value {name}: printed {printed_value}, exact {exact:.6f}')

def finish(N):
    if FAILS:
        print('\n'.join(FAILS)); print(f'Session {N}: {len(FAILS)} problems'); sys.exit(1)
    print(f'Session {N}: all {NCHECK[0]} checks pass')
    sys.exit(0)
# ---- end shared checker ----


# ---- Session 21 specific checks: every number from the raw inputs ----
import numpy as np
from scipy import stats
HERE = pathlib.Path(__file__).resolve().parent
exs = {e['title']: e for e in load(HERE / 'session21.json')['examples']}
for e in exs.values():
    check_example_arithmetic(e)

# Repeated measures ANOVA, FEV1 (Session 21 pages 9 to 11)
ex = exs['Repeated measures ANOVA by hand']
X = np.array([[float(v) for v in r[1:]] for r in ex['table']['rows']])   # rows subjects, cols treatments
if X.tolist() != [[3.7, 3.4, 4.0], [4.0, 3.7, 4.4], [3.0, 2.8, 3.2], [3.2, 2.9, 3.4]]: fail('FEV1 table changed')
n, m = X.shape
S = X.mean(1); T = X.mean(0); G = X.mean()
for v in S: shows(ex, v, 4, 'subject mean')
for v in T: shows(ex, v, 3, 'treatment mean')
shows(ex, G, 3, 'grand mean'); shows(ex, X.sum(), 1, 'grand total')
SSs = ((X - S[:, None]) ** 2).sum(1)
for v in SSs: shows(ex, v, 4, 'subject SS')
ssw = SSs.sum(); sst = n * ((T - G) ** 2).sum(); ssr = ssw - sst
shows(ex, ssw, 4, 'SS within'); shows(ex, sst, 4, 'SS treat'); shows(ex, ssr, 5, 'SS res')
dft, dfr = m - 1, (n - 1) * (m - 1)
mst, msr = sst / dft, ssr / dfr; F = mst / msr
shows(ex, mst, 4, 'MS treat'); shows(ex, msr, 6, 'MS res'); shows(ex, F, 2, 'F')
# cross-check against a statsmodels-free direct formula: F from two-way decomposition
ss_subj = m * ((S - G) ** 2).sum(); ss_tot = ((X - G) ** 2).sum()
if abs(ss_tot - ss_subj - ssw) > 1e-9: fail('SS partition does not add up')
printed('F 0.05 (2,6)', 5.14, stats.f.ppf(0.95, 2, 6), 2)
printed('F 0.01 (2,6)', 10.92, stats.f.ppf(0.99, 2, 6), 2)
if not stats.f.sf(F, dft, dfr) < 0.01: fail('exact P not below 0.01')

# Holm after repeated measures ANOVA (Session 21 pages 11 and 12), rounded course values
ex = exs['Holm pairwise t tests after repeated measures ANOVA']
means = {'base': 3.48, 'endo': 3.20, 'salb': 3.75}; ms_res = 0.0047
se = np.sqrt(2 * ms_res / n); shows(ex, se, 6, 'SE')
ts = {('base', 'endo'): (means['base'] - means['endo']) / se, ('endo', 'salb'): (means['endo'] - means['salb']) / se,
      ('base', 'salb'): (means['base'] - means['salb']) / se}
for v in ts.values(): shows(ex, v, 3, 't')
order = sorted(ts.values(), key=lambda v: -abs(v))
if [round(abs(v), 3) for v in order] != [11.346, 5.776, 5.570]: fail('Holm order wrong')
alphas = [0.05 / (3 - j) for j in range(3)]
shows(ex, alphas[0], 4, 'alpha1')
cuts = [3.707, 3.143, 2.447]
printed('t 0.01 (6)', 3.707, stats.t.ppf(1 - 0.005, 6), 3)
printed('t 0.02 (6)', 3.143, stats.t.ppf(1 - 0.01, 6), 3)
printed('t 0.05 (6)', 2.447, stats.t.ppf(1 - 0.025, 6), 3)
for a, c, v in zip(alphas, cuts, order):
    if not stats.t.ppf(1 - a / 2, 6) <= c: fail('used column is not stricter than the Holm level')
    if not abs(v) > c: fail('Holm comparison does not reject')
if not all(2 * stats.t.sf(abs(v), 6) < a for a, v in zip(alphas, order)): fail('exact Holm decisions differ')

# McNemar, BP machine (Session 21 page 17)
ex = exs["McNemar's test"]
a, b, c, d = 3, 7, 1, 9
if [r[1:] for r in ex['table']['rows']] != [['3', '7'], ['1', '9']]: fail('BP table changed')
E = (b + c) / 2; chi = (abs(b - E) - .5) ** 2 / E + (abs(c - E) - .5) ** 2 / E
shows(ex, E, 0, 'E'); shows(ex, chi, 3, 'chi-square'); shows(ex, (abs(b - E) - .5) ** 2, 2, 'numerator')
printed('chi2 0.05 (1)', 3.841, stats.chi2.ppf(0.95, 1), 3)
printed('chi2 0.10 (1)', 2.706, stats.chi2.ppf(0.90, 1), 3)
p = stats.chi2.sf(chi, 1)
if not (0.05 < p < 0.10): fail('exact P not in 0.05 to 0.10')
finish(21)
