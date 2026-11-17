"""Check script for authoring/memorize_examples/session20.json (run with NumPy/SciPy). Exits 0 when every number checks."""
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


# ---- Session 20 specific checks: every number from the raw inputs ----
import numpy as np
from scipy import stats
HERE = pathlib.Path(__file__).resolve().parent
ex = {e['title']: e for e in load(HERE / 'session20.json')['examples']}['Paired t test']
check_example_arithmetic(ex)

before = np.array([25, 25, 27, 44, 30, 67, 53, 53, 52, 60, 28.])
after = np.array([27, 29, 37, 56, 46, 82, 57, 80, 61, 59, 43.])
rows = ex['table']['rows']
if [float(r[1]) for r in rows] != list(before) or [float(r[2]) for r in rows] != list(after):
    fail('table does not hold the course before and after values')
d = after - before
if list(d) != [2, 4, 10, 12, 16, 15, 4, 27, 9, -1, 15]:
    fail('differences do not match the Session 20 page 10 differences')
n = len(d); dbar = d.mean(); ss = ((d - dbar) ** 2).sum(); sd = d.std(ddof=1); se = sd / np.sqrt(n); t = dbar / se
shows(ex, d.sum(), 0, 'sum of d'); shows(ex, dbar, 4, 'mean difference'); shows(ex, ss, 4, 'sum of squares')
shows(ex, sd ** 2, 4, 'variance'); shows(ex, sd, 4, 'SD'); shows(ex, se, 4, 'SE'); shows(ex, t, 4, 't')
r = stats.ttest_rel(after, before)
if abs(r.statistic - t) > 1e-12: fail('t does not match scipy ttest_rel')
shows(ex, r.pvalue, 6, 'R P value')
lo, hi = stats.t.interval(0.95, n - 1, loc=dbar, scale=se)
shows(ex, lo, 6, 'R CI lower'); shows(ex, hi, 6, 'R CI upper')
shows(ex, dbar - 2.228 * round(se, 4), 4, 'hand CI lower'); shows(ex, dbar + 2.228 * round(se, 4), 4, 'hand CI upper')
printed('t 0.05 (10)', 2.228, stats.t.ppf(1 - 0.025, 10), 3)
printed('t 0.002 (10)', 4.144, stats.t.ppf(1 - 0.001, 10), 3)
printed('t 0.001 (10)', 4.587, stats.t.ppf(1 - 0.0005, 10), 3)
if not (0.001 < r.pvalue < 0.002): fail('exact P is not inside 0.001 to 0.002')
finish(20)
