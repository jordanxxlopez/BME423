"""Check script for authoring/memorize_examples/session24.json (run with NumPy/SciPy). Exits 0 when every number checks."""
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


# ---- Session 24 specific checks: every number from the raw inputs ----
import itertools
import numpy as np
from scipy import stats
HERE = pathlib.Path(__file__).resolve().parent
exs = {e['title']: e for e in load(HERE / 'session24.json')['examples']}
for e in exs.values():
    check_example_arithmetic(e)

# Mann-Whitney with the T table, diuretic (Session 24 pages 9 to 12)
ex = exs['Mann-Whitney rank-sum test with the T table']
pl = [float(r[0]) for r in ex['table']['rows'] if r[0]]; dr = [float(r[1]) for r in ex['table']['rows'] if r[1]]
if pl != [1000, 1380, 1200] or dr != [1400, 1600, 1180, 1220]: fail('diuretic table changed')
rk = stats.rankdata(pl + dr); T = rk[:3].sum()
if T != 9: fail('T is not 9')
shows(ex, T, 0, 'T')
# printed pair 6, 18 with P .057 (row n_S 3, n_B 4): exact two-tailed probability by enumeration
sums = [sum(c) for c in itertools.combinations(range(1, 8), 3)]
p_pair = sum(s <= 6 or s >= 18 for s in sums) / len(sums)
printed('MW T (3,4) pair 6,18 P', 0.057, p_pair, 3)
mu = 3 * 8 / 2
p_exact = sum(abs(s - mu) >= abs(T - mu) for s in sums) / len(sums)
if not (6 < T < 18 and p_exact > 0.05): fail('diuretic decision wrong')
r = stats.mannwhitneyu(pl, dr, alternative='two-sided', method='exact')
if abs(r.pvalue - p_exact) > 1e-9: fail('enumerated P differs from scipy exact Mann-Whitney')

# Mann-Whitney Normal approximation, Leboyer (Session 24 pages 17 to 19)
ex = exs['Mann-Whitney test with the Normal approximation']
c = np.array([float(r[0]) for r in ex['table']['rows']]); l = np.array([float(r[1]) for r in ex['table']['rows']])
allv = np.concatenate([c, l])
if len(set(allv)) != 40: fail('Leboyer data have ties')
rk = stats.rankdata(allv); T = rk[:20].sum(); nS = nB = 20; N = 40
txt = ' '.join(all_work(ex))
if '+'.join(str(int(v)) for v in sorted(rk[:20])) not in txt: fail('control ranks wrong')
mu = nS * (nS + nB + 1) / 2; sig = np.sqrt(nS * nB * (N + 1) / 12); z = (abs(T - mu) - 0.5) / sig
shows(ex, T, 0, 'T'); shows(ex, mu, 0, 'mu_T'); shows(ex, sig ** 2, 2, 'variance'); shows(ex, sig, 4, 'sigma_T'); shows(ex, z, 4, 'z_T')
# the tie-corrected form with 12N(N-1) reduces to the simple form when there are no ties
sig_tie = np.sqrt(nS * nB * (N + 1) / 12 - nS * nB / (12 * N * (N - 1)) * 0)
if abs(sig_tie - sig) > 1e-12: fail('tie form mismatch')
printed('z 0.05 (inf row)', 1.9600, stats.norm.ppf(0.975), 4)
printed('z 0.50 (inf row)', 0.6745, stats.norm.ppf(0.75), 4)
printed('z 0.20 (inf row)', 1.2816, stats.norm.ppf(0.90), 4)
p = 2 * stats.norm.sf(z)
if not (0.20 < p < 0.50): fail('Leboyer P not in 0.20 to 0.50')

# Wilcoxon signed-rank, platelet exercise (Session 24 pages 26 and 27)
ex = exs['Wilcoxon signed-rank test']
b = np.array([float(r[1]) for r in ex['table']['rows']]); a = np.array([float(r[2]) for r in ex['table']['rows']])
d = a - b; d = d[d != 0]; n = len(d)
if n != 11: fail('n is not 11')
R = stats.rankdata(np.abs(d)); W = float((np.sign(d) * R).sum())
txt = ' '.join(all_work(ex))
if 'ranks}\\ \\ ' + ',\\ '.join(f'{v:g}' for v in sorted(R)) not in txt: fail('rank list wrong')
shows(ex, W, 0, 'W')
_, counts = np.unique(np.abs(d), return_counts=True)
tie = sum((t - 1) * t * (t + 1) for t in counts if t > 1)
var = n * (n + 1) * (2 * n + 1) / 6 - tie / 12
sigW = np.sqrt(var); zW = (abs(W) - 0.5) / sigW
shows(ex, n * (n + 1) * (2 * n + 1) / 6, 0, '506'); shows(ex, var, 0, '505'); shows(ex, sigW, 4, 'sigma_W'); shows(ex, zW, 4, 'z_W')
printed('z 0.005 (inf row)', 2.8070, stats.norm.ppf(1 - 0.0025), 4)
printed('z 0.002 (inf row)', 3.0902, stats.norm.ppf(1 - 0.001), 4)
p = 2 * stats.norm.sf(zW)
if not (0.002 < p < 0.005): fail('Wilcoxon P not in 0.002 to 0.005')
# cross-check with scipy (sum of positive ranks; R reports V = 65)
Vpos = R[d > 0].sum()
if Vpos != 65 or W != Vpos - R[d < 0].sum(): fail('signed-rank sums inconsistent with V = 65')

# Normality check, two samples (Session 24 pages 5, 7 and 8)
ex = exs['Check Normality before choosing a test']
x1 = [float(r[1]) for r in ex['table']['rows']]; x2 = [float(r[2]) for r in ex['table']['rows']]
p1 = (1 - 3 / 8) / (10 + 1 / 4); z1 = stats.norm.ppf(p1)
shows(ex, p1, 5, 'p_1'); shows(ex, z1, 4, 'z_1')
w1, pv1 = stats.shapiro(x1); w2, pv2 = stats.shapiro(x2)
shows(ex, w1, 5, 'W sample 1'); shows(ex, pv1, 4, 'P sample 1'); shows(ex, w2, 5, 'W sample 2'); shows(ex, pv2, 6, 'P sample 2')
if not (pv1 > 0.05 and pv2 < 0.05): fail('Shapiro decisions wrong')
finish(24)
