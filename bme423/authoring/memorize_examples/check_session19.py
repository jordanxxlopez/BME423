"""Check script for authoring/memorize_examples/session19.json (run with NumPy/SciPy). Exits 0 when every number checks."""
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


# ---- Session 19 specific checks: every number from the raw inputs ----
N = 19
PATH = HERE / 'session19.json'
data = load(PATH)
E = {e['title']: e for e in data['examples']}
step_counts(N, data['examples'])
for e in data['examples']:
    check_example_arithmetic(e)

# Multiple regression summary: child SBP (Session 19 pages 24 and 25)
ex = E['Read a multiple regression summary from R']
b0, b1, s1, b2, s2 = -15.6892, 0.4225, 0.1185, 0.4150, 0.1248
n, k, R2 = 20, 2, 0.5973
F = (R2 / k) / ((1 - R2) / (n - k - 1))
shows(ex, R2 / k, 5, 'R2/k'); shows(ex, (1 - R2) / (n - k - 1), 8, 'residual part'); shows(ex, F, 2, 'F')
printed('F 0.05 (2,17)', 3.59, stats.f.ppf(0.95, 2, 17), 2); printed('F 0.01 (2,17)', 6.11, stats.f.ppf(0.99, 2, 17), 2)
if abs(stats.f.sf(12.61, 2, 17) - 0.0004388) > 0.000005: fail('F P value does not match R output')
t1, t2 = b1 / s1, b2 / s2
shows(ex, t1, 3, 't mother'); shows(ex, t2, 3, 't father')
printed('t 0.05 (17)', 2.110, tcrit(0.05, 17), 3)
for t_, pr in ((t1, 0.00238), (t2, 0.00401)):
    if abs(2 * stats.t.sf(t_, 17) - pr) > 0.00002: fail(f'Pr(>|t|) {pr} does not match t {t_}')
shows(ex, 2.110 * s1, 4, 'margin mother'); shows(ex, 2.110 * s2, 4, 'margin father')
shows(ex, b1 - 2.110 * s1, 4, 'mother lower'); shows(ex, b1 + 2.110 * s1, 4, 'mother upper')
shows(ex, b2 - 2.110 * s2, 4, 'father lower'); shows(ex, b2 + 2.110 * s2, 4, 'father upper')
q = stats.t.ppf(0.975, 17)  # what confint() uses
for est, s_, lo_ in ((b1, s1, b1 - 2.110 * s1), (b2, s2, b2 - 2.110 * s2)):
    if abs((est - q * s_) - lo_) > 0.0001: fail('hand interval differs from confint by more than rounding')
pred = b0 + b1 * 130 + b2 * 150
shows(ex, b1 * 130, 3, 'mother term'); shows(ex, b2 * 150, 2, 'father term'); shows(ex, pred, 4, 'prediction')

# Logistic: CHD at age 60 (Session 19 pages 35 and 36)
ex = E['Probability and odds from a logistic model']
B0, B1, age = -5.30945, 0.11092, 60
eta = B0 + B1 * age; p = 1 / (1 + np.exp(-eta)); odds = p / (1 - p)
shows(ex, B1 * age, 4, 'b1 x'); shows(ex, eta, 5, 'eta'); shows(ex, np.exp(-eta), 7, 'e^-eta'); shows(ex, 1 + np.exp(-eta), 7, '1+e^-eta')
shows(ex, p, 7, 'p'); shows(ex, 1 - p, 7, '1-p'); shows(ex, odds, 6, 'odds')
shows(ex, np.exp(B0), 9, 'e^b0'); shows(ex, np.exp(B1 * age), 4, 'e^b1x')
if abs(np.exp(B0) * np.exp(B1 * age) - odds) > 1e-9: fail('odds routes disagree')
if abs(B1 / 0.02406 - 4.610) > 0.0005: fail('z value for AGE')
if abs(0.79 / 0.21 - 3.76) > 0.005: fail('rounded-p odds')
for w in ('3.84', '3.76', '0.79'):
    if w not in ' '.join(st['say'] for st in ex['steps']): fail(f'say should mention {w}')

katex_all(PATH)
finish(N)
