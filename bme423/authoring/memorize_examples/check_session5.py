"""Check script for authoring/memorize_examples/session5.json: recomputes every number in the worked
examples from the raw inputs, checks printed z-table values against SciPy, traces every number in
each work line to a computed value, and compiles all LaTeX with the studio KaTeX. Exits 0 when clean."""
SESSION = 5
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
# ---- Session 5: Homework 1 Problem 3(b)(ii), Exam 1 Question 3 ----
C = []
def c(p, v, w): C.append(1); close(p, v, w)
# Printed z table values used (row z, printed F(z)), each checked against SciPy to 4 decimals.
TABLE = {1.15: '0.8749', 2.30: '0.9893', 2.00: '0.9773', 4.00: '1.0000', 0.67: '0.7486', 0.68: '0.7517'}
for z, pv in TABLE.items():
    C.append(1); ok(abs(float(pv) - stats.norm.cdf(z)) <= 0.0001, f'z table row {z:.2f}: printed {pv} vs SciPy {stats.norm.cdf(z):.5f}')
mu, sd = 95, 8.7
za, zb = (85 - mu) / sd, (115 - mu) / sd
c('-1.149', za, 'z85'); c('2.299', zb, 'z115'); c('-1.15', round(za, 2), 'z85 row'); c('2.30', round(zb, 2), 'z115 row')
c('0.1251', 1 - float(TABLE[1.15]), 'F(-1.15)'); c('0.8642', float(TABLE[2.30]) - (1 - float(TABLE[1.15])), 'table answer')
c('0.864', stats.norm.cdf(115, mu, sd) - stats.norm.cdf(85, mu, sd), 'exact answer agrees to 3 d.p.')
# Exam 1 Q3
se = 6 / 16 ** .5; c('1.5', se, 'SE'); c('-2', (15 - 18) / se, 'z15'); c('4', (24 - 18) / se, 'z24')
c('0.9773', float(TABLE[4.00]) - (1 - float(TABLE[2.00])), 'table answer Q3')
c('0.977', stats.norm.cdf(24, 18, se) - stats.norm.cdf(15, 18, se), 'exact Q3 agrees to 3 d.p.')
# percentile
ok(float(TABLE[0.67]) < 0.75 < float(TABLE[0.68]), '0.75 bracketed'); C.append(1)
c('0.675', (0.67 + 0.68) / 2, 'course reads z halfway between rows 0.67 and 0.68')
ok(0.67 < -stats.norm.ppf(.25) < 0.68, 'exact z25 lies between table rows'); C.append(1)
c('5.8725', 8.7 * 0.675, '8.7*0.675'); c('89.1275', 95 - 8.7 * 0.675, 'x25'); c('89.13', stats.norm.ppf(.25, mu, sd), 'exact x25 agrees')
allowed = [mu, sd, 85, 115, za, zb, 1.15, 2.30, *[float(v) for v in TABLE.values()], *TABLE, 0.1251, 0.8642, 0.864,
           2, 18, 6, 16, 4, 1.5, 15, 24, 1, 0.9773, 0.25, 0.75, 0.675, 5.8725, 89.1275, 89.13, 1.0, 100, 25, 0.977]
scan_numbers(allowed)
finish(len(C))
