"""Check script for authoring/memorize_examples/session4.json: recomputes every number in the worked
examples from the raw inputs, checks printed z-table values against SciPy, traces every number in
each work line to a computed value, and compiles all LaTeX with the studio KaTeX. Exits 0 when clean."""
SESSION = 4
import json, re, sys, math, pathlib, subprocess
import numpy as np
from scipy import stats

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / 'authoring'))
from plain_study_content import LECTURES

DATA = json.loads((HERE / f'session{SESSION}.json').read_text())
EX = {e['title']: e for e in DATA['examples']}
fails = []

def ok(cond, msg):
    if not cond:
        fails.append(msg)

def close(printed, value, where):
    """printed is the number as written; value is the recomputed value. Pass if value rounds to printed."""
    s = str(printed)
    dec = len(s.split('.')[1]) if '.' in s else 0
    tol = 0.5 * 10 ** (-dec) + 1e-9 if dec else 1e-9
    ok(abs(float(s) - value) <= tol, f'{where}: printed {s} but recomputed {value!r}')

def scan_numbers(allowed):
    """Every number in every work line must be a recomputed or given value (to its printed rounding)."""
    for e in DATA['examples']:
        for j, st in enumerate(e['steps']):
            for line in st['work']:
                clean = re.sub(r'\\[a-zA-Z]+', ' ', line)
                for tok in re.findall(r'\d+(?:\.\d+)?', clean):
                    dec = len(tok.split('.')[1]) if '.' in tok else 0
                    tol = 0.5 * 10 ** (-dec) + 1e-9 if dec else 1e-9
                    if not any(abs(abs(v) - float(tok)) <= tol for v in allowed):
                        fails.append(f'{e["title"]} step {j+1}: number {tok} not traced to a computed value')

def structure():
    lec = next(l for l in LECTURES if l['id'] == SESSION)
    titles = [m['title'] for m in lec['memorize']]
    ok(sorted(titles) == sorted(EX), f'titles differ: {sorted(titles)} vs {sorted(EX)}')
    for m in lec['memorize']:
        if m['title'] in EX:
            ok(len(EX[m['title']]['steps']) == len(m['steps']), f'{m["title"]}: step count')

def katex():
    """Compile every work line (display) and inline math in prompt and say with the studio's KaTeX."""
    items = []
    for e in DATA['examples']:
        for s in [e['prompt']] + [st['say'] for st in e['steps']]:
            items += [[m, False] for m in re.findall(r'\\\((.+?)\\\)', s, re.S)]
        for st in e['steps']:
            items += [[w, True] for w in st['work']]
    js = ("const k=require(process.argv[1]);const items=JSON.parse(require('fs').readFileSync(0,'utf8'));let bad=0;"
          "for(const [s,d] of items){try{k.renderToString(s,{throwOnError:true,displayMode:d,strict:false})}"
          "catch(e){bad++;console.log('KATEX',s,e.message.slice(0,100))}}console.log(items.length);process.exit(bad?1:0)")
    r = subprocess.run(['node', '-e', js, str(ROOT / 'authoring' / 'videos' / 'node_modules' / 'katex')],
                       input=json.dumps(items), capture_output=True, text=True)
    ok(r.returncode == 0, 'KaTeX: ' + r.stdout.strip())
    return len(items)

def finish(n_checks):
    structure()
    n_tex = katex()
    if fails:
        print('\n'.join(fails)); print(f'session {SESSION}: {len(fails)} problems'); sys.exit(1)
    print(f'session {SESSION}: all {n_checks} arithmetic checks pass, every work number traced, {n_tex} LaTeX strings compile')
# ---- Session 4: Exam 1 Question 2, Homework 1 Problem 3(a) ----
from scipy import integrate, optimize
C = []
def c(p, v, w): C.append(1); close(p, v, w)
f = lambda x: x / 8 if 0 < x <= 4 else 0.0
F = lambda x: integrate.quad(f, 0, min(max(x, 0), 4))[0]
c('1', integrate.quad(f, 0, 4)[0], 'total area')
for xx in (0.5, 1.7, 3.2): c(f'{xx*xx/16:.6f}', F(xx), f'F({xx}) matches x^2/16')
c('0', F(-1), 'F below'); c('1', F(5), 'F above'); c('0', 0 ** 2 / 16, 'F(0)'); c('1', 4 ** 2 / 16, 'F(4)')
cc = optimize.brentq(lambda x: F(x) - .75, 0.01, 4)
c('12', 16 * 3 / 4, 'c^2'); c('3.464', cc, '75th pct'); c('3.464', 2 * 3 ** .5, '2 sqrt3'); c('3.464', 12 ** .5, 'sqrt12')
EX_ = integrate.quad(lambda x: x * f(x), 0, 4)[0]
c('2.667', EX_, 'E[X]'); c('64', 4 ** 3, '4^3'); ok(abs(64 / 24 - 8 / 3) < 1e-12, '64/24 = 8/3'); C.append(1)
# HW1 3(a)(i)
roots = np.sort(np.roots([1, 0.2, -2]))
c('8.04', 0.2 ** 2 + 4 * 2, 'discriminant'); c('2.8355', 8.04 ** .5, 'sqrt disc')
c('-1.5177', roots[0], 'neg root'); c('1.3177', roots[1], 'pos root')
c('1', integrate.quad(lambda x: 0.1 + x, 0, roots[1])[0], 'area with c')
c('1', 0.1 * roots[1] + roots[1] ** 2 / 2, 'antiderivative at c')
allowed = [0, 1, 2, 3, 4, 8, 16, 24, 64, 12, 12 ** .5, cc, 0.75, EX_, 0.1, 0.2, 8.04, 8.04 ** .5, *roots, 0.04, 100]
scan_numbers(allowed)
finish(len(C))
