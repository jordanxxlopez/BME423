"""Check script for authoring/memorize_examples/session18.json (run with NumPy/SciPy). Exits 0 when every number checks."""
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


# ---- Session 18 specific checks: every number from the raw inputs ----
N = 18
PATH = HERE / 'session18.json'
data = load(PATH)
E = {e['title']: e for e in data['examples']}
step_counts(N, data['examples'])
for e in data['examples']:
    check_example_arithmetic(e)

# Fit by hand: Martians, Table 8-1 (Session 18 page 15), unrounded throughout
ex = E['Fit the line and test the slope by hand']
x = np.array([31, 32, 33, 34, 35, 35, 40, 41, 42, 46.])
y = np.array([7.8, 8.3, 7.6, 9.1, 9.6, 9.8, 11.8, 12.1, 14.7, 13.0])
if [[float(a), float(b)] for a, b in ex['table']['rows']] != [[a, b] for a, b in zip(x, y)]:
    fail('Martian table changed')
n = len(x)
Sx, Sy, Sxx, Sxy, Syy = x.sum(), y.sum(), (x * x).sum(), (x * y).sum(), (y * y).sum()
for v, dec, lab in ((Sx, 0, 'sum x'), (Sy, 1, 'sum y'), (Sxx, 0, 'sum x2'), (Sxy, 1, 'sum xy'), (Syy, 2, 'sum y2')):
    shows(ex, v, dec, lab)
num = n * Sxy - Sx * Sy; den = n * Sxx - Sx**2
b = num / den; a = y.mean() - b * x.mean()
fit = stats.linregress(x, y)
if abs(fit.slope - b) > 1e-12 or abs(fit.intercept - a) > 1e-12: fail('slope or intercept disagrees with scipy')
shows(ex, n * Sxy, 0, 'n sum xy'); shows(ex, Sx * Sy, 1, 'sum x sum y'); shows(ex, num, 1, 'numerator')
shows(ex, n * Sxx, 0, 'n sum x2'); shows(ex, Sx**2, 0, '(sum x)^2'); shows(ex, den, 0, 'denominator')
shows(ex, b, 7, 'b'); shows(ex, b, 4, 'b 4dp'); shows(ex, x.mean(), 1, 'x bar'); shows(ex, y.mean(), 2, 'y bar')
shows(ex, a, 6, 'a'); shows(ex, a, 3, 'a 3dp')
sx2 = x.var(ddof=1); sy2 = y.var(ddof=1)
shows(ex, (n - 1) * sx2, 1, 'Sxx'); shows(ex, (n - 1) * sy2, 3, 'Syy'); shows(ex, sx2, 5, 'sx2'); shows(ex, np.sqrt(sx2), 6, 'sx')
shows(ex, sy2, 6, 'sy2'); shows(ex, sy2 - b * b * sx2, 6, 'bracket')
syx = np.sqrt((n - 1) / (n - 2) * (sy2 - b * b * sx2))
syx_raw = np.sqrt(((y - a - b * x) ** 2).sum() / (n - 2))
if abs(syx - syx_raw) > 1e-12: fail('shortcut s_y|x differs from residual s_y|x')
shows(ex, syx, 7, 's_y|x')
sb = syx / np.sqrt(n - 1) / np.sqrt(sx2); sa = syx * np.sqrt(1 / n + x.mean()**2 / ((n - 1) * sx2))
if abs(sb - fit.stderr) > 1e-12 or abs(sa - fit.intercept_stderr) > 1e-12: fail('s_a or s_b disagrees with scipy')
shows(ex, sb, 8, 's_b'); shows(ex, sa, 6, 's_a'); shows(ex, 1 / n + x.mean()**2 / ((n - 1) * sx2), 6, 's_a bracket')
t = b / sb; shows(ex, t, 6, 't'); shows(ex, t, 3, 't 3dp')
if abs(t - fit.slope / fit.stderr) > 1e-9: fail('t disagrees with scipy')
printed('t 0.05 (8)', 2.306, tcrit(0.05, 8), 3); printed('t 0.001 (8)', 5.041, tcrit(0.001, 8), 3)
if not fit.pvalue < 0.001: fail('slope P should be below 0.001')
for est, s_, dec in ((b, sb, 4), (a, sa, 4)):
    shows(ex, 2.306 * s_, 7 if est is b else 6, 'margin')
shows(ex, b - 2.306 * sb, 4, 'b lower'); shows(ex, b + 2.306 * sb, 4, 'b upper')
shows(ex, a - 2.306 * sa, 2, 'a lower'); shows(ex, a + 2.306 * sa, 4, 'a upper')
if not (b - 2.306 * sb < 0.5 < b + 2.306 * sb and a - 2.306 * sa < -8 < a + 2.306 * sa): fail('true line not inside')

# Interval at x0: Martians at 40 cm, slide inputs (Session 18 pages 24 and 25)
ex = E['Interval for the mean versus one observation at a given x']
a0, b0, syx0, n0, xb0, sx0, x0 = -6.0, 0.44, 1.02, 10, 36.9, 5.0, 40
yh = a0 + b0 * x0; br = 1 / n0 + (x0 - xb0)**2 / ((n0 - 1) * sx0**2)
sm = syx0 * np.sqrt(br); sn = syx0 * np.sqrt(1 + br)
shows(ex, yh, 1, 'y hat'); shows(ex, br, 7, 'bracket'); shows(ex, 1 + br, 7, '1+bracket')
shows(ex, sm, 7, 'SE mean'); shows(ex, sn, 6, 'SE new')
shows(ex, 2.306 * sm, 7, 'margin mean'); shows(ex, 2.306 * sn, 6, 'margin new')
shows(ex, yh - 2.306 * sm, 2, 'mean lower'); shows(ex, yh + 2.306 * sm, 2, 'mean upper')
shows(ex, yh - 2.306 * sn, 3, 'obs lower'); shows(ex, yh + 2.306 * sn, 2, 'obs upper'); shows(ex, sn / sm, 3, 'ratio')

# Correlation: Martians, Table 8-3 totals (Session 18 pages 39 to 41)
ex = E['Correlation and its test']
sxy, sxx, syy = 99.9, 224.9, 51.8
r = sxy / np.sqrt(sxx * syy); tr = r * np.sqrt((n - 2) / (1 - r * r))
shows(ex, sxx * syy, 2, 'product'); shows(ex, np.sqrt(sxx * syy), 4, 'root'); shows(ex, r, 7, 'r')
shows(ex, 1 - r * r, 7, '1-r2'); shows(ex, 8 / (1 - r * r), 5, 'ratio'); shows(ex, tr, 6, 't'); shows(ex, tr, 3, 't 3dp')
shows(ex, r * r, 7, 'r2')
rr = stats.pearsonr(x, y)
if abs(rr.statistic - r) > 0.001: fail('Table 8-3 r far from raw-data r')

# Compare slopes: Plutonians (Session 18 pages 26, 29 and 36)
ex = E['Compare the slopes of two groups']
bM, sbM, bF, sbF, nM, nF = 3.2833, 0.2041, 2.029, 0.4708, 18, 18
shows(ex, bM / sbM, 2, 't males'); shows(ex, bF / sbF, 3, 't females')
printed('t 0.05 (16)', 2.120, tcrit(0.05, 16), 3); printed('t 0.001 (16)', 4.015, tcrit(0.001, 16), 3)
if not (bF / sbF > 4.015 and bM / sbM > 4.015): fail('both single slopes should pass 0.001')
se = np.sqrt(sbM**2 + sbF**2); t2 = (bM - bF) / se
shows(ex, sbM**2, 8, 'sbM2'); shows(ex, sbF**2, 7, 'sbF2'); shows(ex, sbM**2 + sbF**2, 7, 'sum'); shows(ex, se, 7, 'SE')
shows(ex, bM - bF, 4, 'difference'); shows(ex, t2, 6, 't'); shows(ex, t2, 3, 't 3dp')
printed('t 0.05 (32)', 2.037, tcrit(0.05, 32), 3); printed('t 0.02 (32)', 2.449, tcrit(0.02, 32), 3)
p2 = 2 * stats.t.sf(t2, nM + nF - 4)
if not (0.02 < p2 < 0.05): fail('slope comparison P not between 0.02 and 0.05')

katex_all(PATH)
finish(N)
