"""Check script for authoring/memorize_examples/session23.json (run with NumPy/SciPy). Exits 0 when every number checks."""
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


# ---- Session 23 specific checks: every number from the raw inputs ----
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent
exs = {e['title']: e for e in load(HERE / 'session23.json')['examples']}
for e in exs.values():
    check_example_arithmetic(e)

# K-NN for K = 3 and 5, tumor exercise (Session 23 page 35)
ex = exs['Classify a new sample with K-NN for two values of K']
T = {r[0]: (float(r[1]), float(r[2]), r[3]) for r in ex['table']['rows']}
if T != {'A': (4, 3, 'Benign'), 'B': (3, 3, 'Benign'), 'C': (4, 5, 'Malignant'), 'D': (6, 4, 'Malignant'),
         'E': (5, 6, 'Malignant'), 'F': (1, 3, 'Benign'), 'G': (7, 7, 'Malignant')}: fail('tumor table changed')
q = np.array([4., 4.])
dist = {k: float(np.hypot(v[0] - q[0], v[1] - q[1])) for k, v in T.items()}
for k, v in dist.items(): shows(ex, v, 4 if abs(v - round(v)) > 1e-12 else 0, f'd_{k}')
order = sorted(dist, key=lambda k: (dist[k], k))
if order[:5] != ['A', 'C', 'B', 'D', 'E']: fail('tumor ranking wrong')
for K, want, p in ((3, 'Benign', 2 / 3), (5, 'Malignant', 3 / 5)):
    v = [T[k][2] for k in order[:K]]
    win = max(set(v), key=v.count)
    if win != want or abs(v.count(win) / K - p) > 1e-12: fail(f'K={K} vote wrong')
    shows(ex, p, 4 if K == 3 else 1, f'P at K={K}')
# the A and C tie cannot change either vote: both are inside the first 3
if not (dist['A'] == dist['C'] < dist['B']): fail('tie claim wrong')

# Confusion matrix (Session 23 page 17)
ex = exs['Read a confusion matrix']
rows = ex['table']['rows']
TN, FP = int(rows[0][1]), int(rows[0][2]); FN, TP = int(rows[1][1]), int(rows[1][2])
if (TN, FP, FN, TP) != (61, 0, 2, 37): fail('confusion matrix changed')
N = TN + FP + FN + TP
acc, err, sens, spec = (TP + TN) / N, (FP + FN) / N, TP / (TP + FN), TN / (TN + FP)
shows(ex, acc, 2, 'accuracy'); shows(ex, err, 2, 'error rate'); shows(ex, sens, 4, 'sensitivity'); shows(ex, spec, 0, 'specificity')
if f'{sens:.3f}' != '0.949': fail('sensitivity does not match the printed row proportion 0.949')

# Run K-NN in R (Session 23 pages 12 to 20, BreastCancerClassification.R)
ex = exs['Run K-NN in R']
txt = ' '.join(all_work(ex))
script = pathlib.Path('/Users/jordanlopez/Downloads/BreastCancerClassification.R')
if script.exists():
    src = script.read_text()
    for frag in ['wbcd <- wbcd[-1]', 'lapply(wbcd[2:31], normalize)', 'wbcd_n[1:469, ]', 'wbcd_n[470:569, ]',
                 'wbcd[1:469, 1]', 'wbcd[470:569, 1]', 'k = 21, prob=TRUE', 'scale(wbcd[-1])', 'prop.chisq = FALSE']:
        if frag not in src: fail(f'R script no longer contains {frag}')
for frag in [r'wbcd <- wbcd[-1]', r'wbcd[2:31], normalize', r'wbcd\_n[1:469, ]', r'wbcd\_n[470:569, ]',
             r'wbcd[1:469, 1]', r'wbcd[470:569, 1]', r'k = 21, prob = TRUE', r'scale(wbcd[-1])', 'CrossTable']:
    if frag not in txt: fail(f'R example missing {frag}')
if 357 + 212 != 569 or 469 + 100 != 569: fail('row counts')
mn, mx, mean = 6.981, 28.110, 14.127
shows(ex, mx - mn, 3, 'range'); shows(ex, mean - mn, 3, 'mean minus min'); shows(ex, (mean - mn) / (mx - mn), 4, 'scaled radius')
# CrossTable results printed in the course (pages 17, 19, 20): (TN, FP, FN, TP)
for name, (tn, fp, fn, tp) in {'min-max K=21': (61, 0, 2, 37), 'z K=21': (61, 0, 5, 34),
                               'min-max K=1': (58, 3, 1, 38), 'min-max K=27': (61, 0, 4, 35)}.items():
    if tn + fp + fn + tp != 100: fail(f'{name} does not total 100')
    shows(ex, (tn + tp) / 100, 2, f'{name} accuracy')
    if f'FN={fn}' not in txt.replace(' ', '') or f'FP={fp}' not in txt.replace(' ', ''): fail(f'{name} counts missing')
finish(23)
