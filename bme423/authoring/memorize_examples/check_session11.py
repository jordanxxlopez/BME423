"""Check script for authoring/memorize_examples/session11.json.
Recomputes every number in the work lines from the raw problem inputs, re-evaluates each
arithmetic line, and checks each printed table value against SciPy. Exits 0 when all pass.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/memorize_examples/check_session11.py"""
import json, math, re, sys, pathlib
import numpy as np
from scipy import stats

HERE = pathlib.Path(__file__).resolve().parent
FAIL = []

def fail(msg):
    FAIL.append(msg)

# ---------- LaTeX arithmetic evaluator ----------
def _brace(s, i):
    """s[i] == '{'; return (content, index after the matching '}')."""
    depth = 0
    for j in range(i, len(s)):
        if s[j] == '{': depth += 1
        elif s[j] == '}':
            depth -= 1
            if depth == 0: return s[i + 1:j], j + 1
    raise ValueError('unbalanced braces in ' + s)

def _expand(s):
    out, i = '', 0
    while i < len(s):
        for cmd in ('\\dfrac', '\\tfrac', '\\frac'):
            if s.startswith(cmd, i) and i + len(cmd) < len(s) and s[i + len(cmd)] == '{':
                a, k = _brace(s, i + len(cmd)); b, k = _brace(s, k)
                out += '((' + _expand(a) + ')/(' + _expand(b) + '))'; i = k; break
        else:
            if s.startswith('\\sqrt{', i):
                a, k = _brace(s, i + 5); out += 'sqrt(' + _expand(a) + ')'; i = k
            elif s.startswith('^{', i):
                a, k = _brace(s, i + 1); out += '**(' + _expand(a) + ')'; i = k
            else:
                out += s[i]; i += 1
    return out

def evaluate(seg):
    """Numeric value of a LaTeX segment, or None when it holds symbols."""
    s = seg.split('\\;')[0].strip().rstrip(',').strip()
    if not s: return None
    for a, b in (('\\left', ''), ('\\right', ''), ('\\,', ''), ('\\!', ''), ('\\ ', ''),
                 ('\\lvert', 'abs('), ('\\rvert', ')'), ('\\cdot', '*'), ('\\times', '*')):
        s = s.replace(a, b)
    try:
        s = _expand(s)
    except ValueError:
        return None
    s = re.sub(r'\^(\d)', r'**\1', s).replace('{', '(').replace('}', ')')
    s = re.sub(r'(?<=[\d\)])\s*(?=[\(as])', '*', s)
    s = s.replace('a*bs(', 'abs(').replace('s*qrt(', 'sqrt(')
    if not re.fullmatch(r'[\d\.\s\+\-\*/\(\)a-z]+', s): return None
    if set(re.findall(r'[a-z]+', s)) - {'sqrt', 'abs'}: return None
    if not re.search(r'\d', s): return None
    try:
        return float(eval(s, {'__builtins__': {}}, {'sqrt': math.sqrt, 'abs': abs}))
    except Exception:
        return None

def _decimals(seg):
    s = seg.split('\\;')[0].strip().rstrip(',').strip()
    m = re.fullmatch(r'-?\d+(?:\.(\d+))?', s)
    if not m: return None
    return len(m.group(1) or '')

REL = re.compile(r'(=|<|>|\\approx|\\sim)')

def check_line(line, where, prev_tail):
    """Split on relations, group '='-linked segments, check equal groups agree and
    neighbouring groups obey < or >. Returns the last segment text for '=' continuations."""
    if line.startswith('=') and prev_tail is not None:
        line = prev_tail + line
    for expr in re.split(r'\\quad|\\qquad', line):
        parts = REL.split(expr)
        segs, rels = parts[0::2], parts[1::2]
        groups, ops = [[segs[0]]], []
        for r, sgm in zip(rels, segs[1:]):
            if r in ('=', '\\approx'): groups[-1].append(sgm)
            else: ops.append(r); groups.append([sgm])
        vals = []
        for g in groups:
            nums = [(evaluate(x), _decimals(x), x) for x in g]
            nums = [n for n in nums if n[0] is not None]
            for (a, da, xa), (b, db, xb) in zip(nums, nums[1:]):
                tol = (0.5 * 10 ** -da if da is not None else 0) + (0.5 * 10 ** -db if db is not None else 0) \
                      + 4e-4 * max(abs(a), abs(b)) + 1e-12
                if abs(a - b) > tol:
                    fail(f'{where}: "{xa.strip()}" ({a:.6g}) does not equal "{xb.strip()}" ({b:.6g}) in {line}')
            vals.append(nums[0][0] if nums else None)
        for op, a, b in zip(ops, vals, vals[1:]):
            if a is None or b is None or op == '\\sim': continue
            if (op == '<' and not a < b) or (op == '>' and not a > b):
                fail(f'{where}: {a:.6g} {op} {b:.6g} is false in {line}')
    tail = REL.split(line)[-1]
    return tail

# ---------- every number in work must come from the problem ----------
def literals(line):
    s = re.sub(r'_\{[^{}]*\}', '', line)            # subscripts are labels like t_{12}, alpha levels
    s = re.sub(r'_\w', '', s)
    s = re.sub(r'\\(mathrm|text)\{[^{}]*\}', '', s)  # unit and word text
    return re.findall(r'\d+\.\d+|\d+', s)

def check_literals(line, where, allowed):
    for lit in literals(line):
        v = float(lit); d = len(lit.split('.')[1]) if '.' in lit else 0
        if d == 0 and v <= 10: continue                # small structural integers (1/2, 3-1, powers)
        tol = 0.5 * 10 ** -d * 1.001 + 1e-12
        if not any(abs(abs(a) - v) <= tol for a in allowed):
            fail(f'{where}: number {lit} is not one of the recomputed values ({line})')

# ---------- printed critical values ----------
def crit(dist, alpha, df1, df2=None):
    if dist == 't': return stats.t.isf(alpha / 2, df1) if df1 != math.inf else stats.norm.isf(alpha / 2)
    if dist == 'F': return stats.f.isf(alpha, df1, df2)
    raise ValueError(dist)

def check_printed(ex_text, printed):
    """printed: list of (latex substring that must appear, dist, alpha, df1, df2, printed value, tol)."""
    for sub, dist, alpha, df1, df2, val, tol in printed:
        if sub not in ex_text: fail(f'printed value line missing from work: {sub}')
        true = crit(dist, alpha, df1, df2)
        if abs(true - val) > tol: fail(f'{sub}: printed {val} but SciPy gives {true:.4f}')

def check_bracket(dist, alpha, df1, df2, lo, hi, label):
    true = crit(dist, alpha, df1, df2)
    if not lo < true < hi: fail(f'{label}: true cutoff {true:.4f} not inside printed bracket {lo} to {hi}')

def run(session, checks):
    data = json.loads((HERE / f'session{session}.json').read_text())
    by_title = {e['title']: e for e in data['examples']}
    for title, fn in checks.items():
        ex = by_title.get(title)
        if ex is None: fail(f'missing example "{title}"'); continue
        allowed, printed = fn()
        text = '\n'.join(w for st in ex['steps'] for w in st['work'])
        for k, st in enumerate(ex['steps']):
            tail = None
            for w in st['work']:
                where = f'{title} step {k + 1}'
                tail = check_line(w, where, tail)
                check_literals(w, where, allowed)
        check_printed(text, printed)
    if FAIL:
        print('\n'.join(FAIL)); print(f'session {session}: {len(FAIL)} problems'); sys.exit(1)
    n = sum(len(st['work']) for e in data['examples'] for st in e['steps'])
    print(f'session {session}: all {n} work lines recomputed and every printed cutoff checked')

# ---------------- Session 11 ----------------
def ztest_hw2():
    """Homework 2 Problem 2(a): p1 0.565 of 186, p2 0.455 of 220, 205 of 406 female."""
    p1, n1, p2, n2, events = 0.565, 186, 0.455, 220, 205
    if n1 + n2 != 406: fail('totals')
    p = events / (n1 + n2); inv = 1 / n1 + 1 / n2; yates = 0.5 * inv
    gap = abs(p1 - p2); num = gap - yates
    pr = round(p, 4); var = pr * (1 - pr) * inv; den = math.sqrt(var); z = num / den
    z_exact = (gap - yates) / math.sqrt(p * (1 - p) * inv)
    if abs(z - z_exact) > 5e-4: fail('rounding the pooled proportion changes z')
    if not (1.96 < z_exact < 2.5758): fail('z decision should be 0.01 < P < 0.05')
    allowed = [p1, n1, p2, n2, events, n1 + n2, p, pr, 1 - pr, inv, yates, gap, num, var, den, z, z_exact,
               1.96, 2.5758, 0.05, 0.01]
    printed = [(r't_{0.05}(\infty)=1.9600', 't', 0.05, math.inf, None, 1.9600, 0.00005),
               (r't_{0.01}(\infty)=2.5758', 't', 0.01, math.inf, None, 2.5758, 0.00005)]
    return allowed, printed

run(11, {'z test for two proportions': ztest_hw2})
