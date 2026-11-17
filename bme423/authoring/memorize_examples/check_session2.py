"""Check script for authoring/memorize_examples/session2.json: recomputes every number in the worked
examples from the raw inputs, checks printed z-table values against SciPy, traces every number in
each work line to a computed value, and compiles all LaTeX with the studio KaTeX. Exits 0 when clean."""
SESSION = 2
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
# ---- Session 2: Homework 1 Problem 4 (freshman and senior heights) ----
fr = np.array([65, 69, 59, 64, 62, 67, 68, 62, 64, 65], float)
se = np.array([69, 66, 70, 71, 72, 67, 70, 71, 72, 69], float)
n = 10
C = []
def c(p, v, w): C.append(1); close(p, v, w)

def course_pct(x, p):
    s = np.sort(x); pos = 1 + p * (len(x) - 1) / 100; k = int(np.floor(pos)); f = pos - k
    return pos, k, f, s[k - 1] + f * (s[k] - s[k - 1]) if f else s[k - 1]

# percentile
sf = np.sort(fr)
ok(list(sf) == [59, 62, 62, 64, 64, 65, 65, 67, 68, 69], 'freshman sort')
pos, k, f, p75 = course_pct(fr, 75)
c('7.75', pos, 'position 75'); c('7', k, 'k'); c('0.75', f, 'f'); c('6.75', 75 * 9 / 100, '75(9)/100')
c('65', sf[6], 'x7'); c('67', sf[7], 'x8'); c('1.5', f * (sf[7] - sf[6]), 'f gap'); c('66.5', p75, '75th pct')
c('66.5', np.percentile(fr, 75), 'numpy linear percentile agrees')
# SE
c('645', fr.sum(), 'sum'); c('64.5', fr.mean(), 'mean')
ss = ((fr - fr.mean()) ** 2).sum(); c('82.5', ss, 'SS')
v = ss / 9; s = v ** .5
c('9.167', v, 'var'); c('3.028', s, 'sd'); c('3.028', np.std(fr, ddof=1), 'sd numpy')
c('3.162', 10 ** .5, 'sqrt10'); c('0.9574', s / 10 ** .5, 'SE'); c('0.9574', stats.sem(fr), 'SE scipy')
# Normality (seniors)
ss2 = np.sort(se)
ok(list(ss2) == [66, 67, 69, 69, 70, 70, 71, 71, 72, 72], 'senior sort')
c('697', se.sum(), 'sum sr'); c('69.7', se.mean(), 'mean sr'); c('70', np.median(se), 'median')
SS2 = ((se - se.mean()) ** 2).sum(); c('36.1', SS2, 'SS sr')
s2 = np.std(se, ddof=1); c('4.011', SS2 / 9, 'var sr'); c('2.003', s2, 'sd sr')
c('67.70', se.mean() - s2, 'mean-s'); c('71.70', se.mean() + s2, 'mean+s')
p16 = course_pct(se, 16); p84 = course_pct(se, 84)
c('2.44', p16[0], 'pos16'); c('2', p16[1], 'k16'); c('0.44', p16[2], 'f16'); c('67.88', p16[3], 'x16')
c('8.56', p84[0], 'pos84'); c('8', p84[1], 'k84'); c('0.56', p84[2], 'f84'); c('71.56', p84[3], 'x84')
c('67.88', np.percentile(se, 16), 'numpy 16'); c('71.56', np.percentile(se, 84), 'numpy 84')

allowed = list(fr) + list(se) + [n, 1, 2, 75, 100, 16, 84, 5, 6, 7, 8, 9, 10, 3, pos, f, 75 * 9 / 100, 1.5, p75,
           fr.sum(), fr.mean(), ss, v, s, 10 ** .5, s / 10 ** .5, se.sum(), se.mean(), 70, SS2, SS2 / 9, s2,
           se.mean() - s2, se.mean() + s2, *p16[:3], p16[3], *p84[:3], p84[3]]
scan_numbers(allowed)
finish(len(C))
