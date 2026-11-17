"""Check script for authoring/memorize_examples/session3.json: recomputes every number in the worked
examples from the raw inputs, checks printed z-table values against SciPy, traces every number in
each work line to a computed value, and compiles all LaTeX with the studio KaTeX. Exits 0 when clean."""
SESSION = 3
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
# ---- Session 3: Homework 1 Problem 2, Exam 1 Question 1 ----
from fractions import Fraction as Fr
C = []
def c(p, v, w): C.append(1); close(p, v, w)
f2 = {0: .2, 3: 0, 4: .4, 5: .2, 8: .2, 10: .1}
f3 = {-2: .3, 1: .3, 3: -.1, 4.5: .1, 7: .4}
f4 = {.5: .4, 1: .1, 2: .4}
f5 = {1: Fr(1, 6), 2: Fr(2, 6), 3: Fr(1, 2)}
c('1.1', sum(f2.values()), 'sum f2'); c('1.0', sum(f3.values()), 'sum f3'); c('0.9', sum(f4.values()), 'sum f4')
ok(sum(f5.values()) == 1, 'sum f5'); C.append(1)
ok(min(f3.values()) == -0.1 and min(f2.values()) >= 0 and min(f4.values()) >= 0 and min(f5.values()) >= 0, 'signs'); C.append(1)
valid = [name for name, f in (('f2', f2), ('f3', f3), ('f4', f4), ('f5', f5))
         if all(0 <= float(v) <= 1 for v in f.values()) and abs(float(sum(f.values())) - 1) < 1e-12]
ok(valid == ['f5'], f'valid set {valid}'); C.append(1)
# Exam 1 Q1: staircase heights read from the graph
Fsteps = {-2: Fr(1, 3), 1: Fr(1, 2), 3: Fr(1)}
def F(y):
    h = Fr(0)
    for k, v in Fsteps.items():
        if y >= k: h = v
    return h
f = {}; prev = Fr(0)
for k in sorted(Fsteps): f[k] = Fsteps[k] - prev; prev = Fsteps[k]
ok(f == {-2: Fr(1, 3), 1: Fr(1, 6), 3: Fr(1, 2)}, f'jumps {f}'); C.append(1)
ok(sum(f.values()) == 1, 'pf sums to 1'); C.append(1)
ok(1 - F(-1) == Fr(2, 3) and f[1] + f[3] == Fr(2, 3), 'P(Y>-1)'); C.append(1)
ok(F(2.25) - F(-0.5) == Fr(1, 6) and F(2.25) == Fr(1, 2) and F(-0.5) == Fr(1, 3), 'P(-0.5<Y<2.25)'); C.append(1)
ok(sum(v for y, v in f.items() if -0.5 < y < 2.25) == Fr(1, 6), 'direct interval sum'); C.append(1)
# Homework 1 Problem 2(b)
x = np.array([-1, 2, 3, 7.]); p = np.array([.55, .15, .1, .2])
mu = (x * p).sum(); terms = (x - mu) ** 2 * p; var = terms.sum(); ex2 = (x ** 2 * p).sum()
c('1', p.sum(), 'sum p'); c('-0.55', -1 * .55, 'term1'); c('0.3', 2 * .15, 'term2'); c('0.3', 3 * .1, 'term3'); c('1.4', 7 * .2, 'term4')
c('1.45', mu, 'E[X]'); c('3.301', terms[0], 'v1'); c('0.04538', terms[1], 'v2'); c('0.2403', terms[2], 'v3'); c('6.161', terms[3], 'v4')
c('9.7475', var, 'Var'); c('11.85', ex2, 'E[X2]'); c('2.1025', mu ** 2, 'mu2'); c('9.7475', ex2 - mu ** 2, 'shortcut'); c('3.122', var ** .5, 'SD')
allowed = [*f2, *f2.values(), *f3, *f3.values(), *f4, *f4.values(), 1, 2, 3, 6, 1.1, 1.0, 0.9, 0, -2, 0.5, 2.25, -1,
           *x, *p, 1.4, 0.3, mu, *terms, var, ex2, mu ** 2, var ** .5, 1 - mu, 2 - mu, 3 - mu, 7 - mu, 4, 5, 8, 10]
scan_numbers(allowed)
finish(len(C))
