"""Check script for authoring/memorize_examples/session17.json (run with NumPy/SciPy). Exits 0 when every number checks."""
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


# ---- additions for Sessions 17 to 19: e^{...} lines, step counts, KaTeX ----
import subprocess
import numpy as np
from scipy import stats
_tex_to_py_base = tex_to_py
def tex_to_py(s):  # noqa: F811  (lets value() evaluate e^{...} as exp)
    out = _tex_to_py_base(s)
    out = re.sub(r'(?<![A-Za-z])e\*\*\(', 'exp(', out)
    return re.sub(r'(\d|\))\s*exp\(', r'\1*exp(', out)
ALLOWED = re.compile(r'^(?:[\d\.\+\-\*/\(\)\s]|abs|sqrt|exp)+$')
def value(seg):  # noqa: F811
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
        return float(eval(py, {'__builtins__': {}}, {'sqrt': math.sqrt, 'abs': abs, 'exp': math.exp}))
    except Exception:
        return None

HERE = pathlib.Path(__file__).resolve().parent
BME = HERE.parents[1]

def step_counts(N, examples):
    sys.path.insert(0, str(BME / 'authoring'))
    import plain_study_content as p
    mem = [l for l in p.LECTURES if l['id'] == N][0]['memorize']
    titles = [m['title'] for m in mem]
    got = [e['title'] for e in examples]
    if sorted(got) != sorted(titles):
        fail(f'example titles {got} do not match problem types {titles}')
    for m in mem:
        e = next((e for e in examples if e['title'] == m['title']), None)
        if e and len(e['steps']) != len(m['steps']):
            fail(f'{m["title"]}: {len(e["steps"])} example steps for {len(m["steps"])} memorize steps')
        NCHECK[0] += 1

def katex_all(path):
    js = r'''
const fs=require('fs');const katex=require(process.argv[1]);const d=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));let bad=0,n=0;
const tex=(s,w,disp)=>{n++;try{katex.renderToString(s,{throwOnError:true,displayMode:disp,strict:false})}catch(e){bad++;console.log('KATEX',w,'::',s,'::',e.message.slice(0,100))}};
const inl=(s,w)=>{if(typeof s!=='string')return;for(const m of s.matchAll(/\\\((.+?)\\\)/gs))tex(m[1],w,false);if((s.match(/\\\(/g)||[]).length!==(s.match(/\\\)/g)||[]).length){bad++;console.log('UNBALANCED',w)}};
for(const e of d.examples){inl(e.prompt,e.title+' prompt');if(e.table){e.table.headers.forEach(h=>inl(String(h),e.title+' header'));e.table.rows.forEach(r=>r.forEach(c=>inl(String(c),e.title+' cell')))}
 e.steps.forEach((s,i)=>{(s.work||[]).forEach(w=>tex(w,e.title+' step '+(i+1),true));inl(s.say,e.title+' say '+(i+1))})}
console.log(bad?bad+' KaTeX problems in '+n:'all '+n+' KaTeX strings compile');process.exit(bad?1:0);'''
    kpath = str(BME / 'authoring' / 'videos' / 'node_modules' / 'katex')
    r = subprocess.run(['node', '-e', js, kpath, str(path)], capture_output=True, text=True)
    print(r.stdout.strip())
    if r.returncode != 0:
        fail('KaTeX: ' + (r.stdout + r.stderr).strip()[-400:])
    NCHECK[0] += 1

def tcrit(alpha, df):
    return stats.norm.ppf(1 - alpha / 2) if df == 'inf' else stats.t.ppf(1 - alpha / 2, df)

def in_work(ex, s, label):
    txt = ' '.join(all_work(ex))
    NCHECK[0] += 1
    if s not in txt:
        fail(f'{ex["title"]}: expected "{s}" ({label}) in the work')


# ---- Session 17 specific checks: every number from the raw inputs ----
N = 17
PATH = HERE / 'session17.json'
data = load(PATH)
E = {e['title']: e for e in data['examples']}
step_counts(N, data['examples'])
for e in data['examples']:
    check_example_arithmetic(e)

# One mean: Session 17 page 10 (n 10, mean 67, SD 9)
ex = E['Confidence interval for one mean']
n, xb, s = 10, 67.0, 9.0
se = s / np.sqrt(n); tc = 2.262; M = tc * se
printed('t 0.05 (9)', tc, tcrit(0.05, 9), 3)
shows(ex, np.sqrt(n), 6, 'sqrt 10'); shows(ex, se, 6, 'SE'); shows(ex, M, 6, 'margin')
shows(ex, xb - M, 5, 'lower'); shows(ex, xb + M, 5, 'upper')
lo, hi = stats.t.interval(0.95, n - 1, loc=xb, scale=se)
if abs(lo - (xb - M)) > 0.003: fail('one mean: table interval far from exact t interval')

# Two means: Session 17 page 6 (diuretic 10, 1400, 245; placebo 10, 1180, 144)
ex = E['Confidence interval for a difference of two means']
n1 = n2 = 10; x1, x2, s1, s2 = 1400., 1180., 245., 144.
sp2 = ((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2)
se = np.sqrt(sp2 * (1 / n1 + 1 / n2)); tc = 2.101; M = tc * se
printed('t 0.05 (18)', tc, tcrit(0.05, 18), 3)
shows(ex, x1 - x2, 0, 'difference'); shows(ex, (n1 - 1) * s1**2, 0, 'contribution 1'); shows(ex, (n2 - 1) * s2**2, 0, 'contribution 2')
shows(ex, sp2, 1, 'pooled variance'); shows(ex, sp2 * (1 / n1 + 1 / n2), 1, 'variance of difference')
shows(ex, se, 5, 'SE'); shows(ex, M, 4, 'margin'); shows(ex, x1 - x2 - M, 4, 'lower'); shows(ex, x1 - x2 + M, 4, 'upper')
shows(ex, x1 - x2 - M, 2, 'lower 2dp'); shows(ex, x1 - x2 + M, 2, 'upper 2dp')
r = stats.ttest_ind_from_stats(x1, s1, n1, x2, s2, n2, equal_var=True)
if abs((x1 - x2) / se - r.statistic) > 1e-9: fail('two means: SE does not match scipy pooled t')

# One proportion: Session 17 pages 14 and 15 (177 of 500)
ex = E['Confidence interval for one proportion']
m, n = 177, 500; p = m / n; se = np.sqrt(p * (1 - p) / n); zc = 1.96; M = zc * se
printed('t 0.05 (inf)', 1.9600, tcrit(0.05, 'inf'), 4)
shows(ex, p, 3, 'p hat'); shows(ex, p * (1 - p), 6, 'p(1-p)'); shows(ex, p * (1 - p) / n, 9, 'variance')
shows(ex, se, 8, 'SE'); shows(ex, M, 8, 'margin'); shows(ex, p - M, 7, 'lower'); shows(ex, p + M, 7, 'upper')
shows(ex, p - M, 4, 'lower 4dp'); shows(ex, p + M, 4, 'upper 4dp')
if p - M < 0.5 < p + M: fail('one proportion: 0.5 should be outside')

# Two proportions: Session 17 page 12 (placebo 18/25, aspirin 6/19), unrounded
ex = E['Confidence interval for a difference of two proportions']
m1, n1, m2, n2 = 18, 25, 6, 19
p1, p2 = m1 / n1, m2 / n2; pp = (m1 + m2) / (n1 + n2); d = p1 - p2
se = np.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2)); M = 1.96 * se
shows(ex, p1, 2, 'p1'); shows(ex, p2, 7, 'p2'); shows(ex, d, 7, 'difference'); shows(ex, pp, 7, 'pooled')
shows(ex, pp * (1 - pp), 7, 'pooled variance'); shows(ex, 1 / n1 + 1 / n2, 8, 'size term'); shows(ex, se, 7, 'SE')
shows(ex, M, 7, 'margin'); shows(ex, d - M, 7, 'lower'); shows(ex, d + M, 7, 'upper')
shows(ex, 100 * (d - M), 2, 'lower points'); shows(ex, 100 * (d + M), 2, 'upper points')

# Decide from intervals: Homework 3 Problem 1 (82 of 93 alive vs 72 of 98 alive)
ex = E['Decide significance from intervals only']
rows = ex['table']['rows']
if [rows[0][1], rows[0][2], rows[1][1], rows[1][2]] != ['82', '11', '72', '26']: fail('HW3 table changed')
a1, n1, a2, n2 = 82, 82 + 11, 72, 72 + 26
p1, p2 = a1 / n1, a2 / n2; pp = (a1 + a2) / (n1 + n2); d = p1 - p2
se = np.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2))
printed('t 0.01 (inf)', 2.5758, tcrit(0.01, 'inf'), 4)
shows(ex, p1, 7, 'p1'); shows(ex, p2, 7, 'p2'); shows(ex, d, 7, 'difference'); shows(ex, pp, 7, 'pooled'); shows(ex, se, 8, 'SE')
M95, M99 = 1.96 * se, 2.5758 * se
shows(ex, M95, 7, 'margin 95'); shows(ex, M99, 7, 'margin 99')
shows(ex, d - M95, 5, 'lower 95'); shows(ex, d + M95, 4, 'upper 95'); shows(ex, d - M99, 7, 'lower 99'); shows(ex, d + M99, 4, 'upper 99')
if not (d - M95 > 0 and d - M99 < 0): fail('HW3: 95% should exclude 0 and 99% include it')
# the decision also holds with the rounded 2.576 and with the exact Normal quantile
for z in (2.576, stats.norm.ppf(0.995)):
    if d - z * se >= 0: fail('HW3: 99% decision depends on the cutoff rounding')

katex_all(PATH)
finish(N)
