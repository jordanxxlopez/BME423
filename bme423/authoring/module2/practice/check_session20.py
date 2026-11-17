"""Independent check of authoring/module2/practice/session20.json.

Recomputes every answer and every `values` entry from the raw table of each case with NumPy/SciPy
(paired t, pooled unpaired t, repeated measures ANOVA, plus an independent regression route for the
ANOVA residual), compares the real R t.test() printouts with SciPy, checks every printed critical
value against SciPy within table rounding, re-evaluates every arithmetic chain and inequality in the
`work` lines, checks the structure against the reference case of the same method, and scans words
and conclusions for colons, semicolons and banned words.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session20.py
"""
import json, math, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session20.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, '..', 'neuro', 'ref', 'session20.json'), encoding='utf-8'))

# ---------------------------------------------------------------- shared helpers
errors = []
def need(cond, msg):
    if not cond:
        errors.append(msg)
def close(a, b, rel=1e-9, ab=1e-9):
    return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))
def decimals(s):
    s = s.strip()
    return len(s.split('.')[1]) if '.' in s else 0

def _braced(s, i):
    """s[i] == '{' -> (content, index after the closing brace)"""
    depth = 0
    for j in range(i, len(s)):
        if s[j] == '{': depth += 1
        elif s[j] == '}':
            depth -= 1
            if depth == 0: return s[i + 1:j], j + 1
    raise ValueError(s)

def to_py(seg):
    """LaTeX arithmetic -> Python expression, or None when the segment holds symbols."""
    s = seg.strip()
    for a, b in [('\\left', ''), ('\\right', ''), ('\\,', ''), ('\\ ', ''), ('\\quad', ''), ('\\cdot', '*'), ('\\times', '*'), ('−', '-')]:
        s = s.replace(a, b)
    if not s: return None
    out = ''
    i = 0
    while i < len(s):
        if s.startswith('\\frac', i) or s.startswith('\\tfrac', i):
            i = s.index('{', i)
            a, i = _braced(s, i); b, i = _braced(s, i)
            pa, pb = to_py(a), to_py(b)
            if pa is None or pb is None: return None
            out += f'(({pa})/({pb}))'
        elif s.startswith('\\sqrt', i):
            a, i = _braced(s, i + 5)
            pa = to_py(a)
            if pa is None: return None
            out += f'sqrt({pa})'
        elif s.startswith('e^{', i):
            a, i = _braced(s, i + 2)
            pa = to_py(a)
            if pa is None: return None
            out += f'exp({pa})'
        elif s[i] == '^':
            if s[i + 1] == '{':
                a, i = _braced(s, i + 1)
                pa = to_py(a)
                if pa is None: return None
                out += f'**({pa})'
            else:
                out += '**' + s[i + 1]; i += 2
        elif s[i] in '[]':
            out += '(' if s[i] == '[' else ')'; i += 1
        elif s[i] in '0123456789.+-*/() ':
            out += s[i]; i += 1
        else:
            return None
    out = re.sub(r'(\d|\))\s*\(', r'\1*(', out)
    out = re.sub(r'\)\s*(\d)', r')*\1', out)
    out = re.sub(r'\)\s*(sqrt|exp)', r')*\1', out)
    out = re.sub(r'(\d)\s*(sqrt|exp)', r'\1*\2', out)
    if not re.search(r'\d', out): return None
    return out

def ev(seg):
    p = to_py(seg)
    if p is None: return None
    try:
        return float(eval(p, {'__builtins__': {}}, {'sqrt': math.sqrt, 'exp': math.exp}))
    except Exception:
        return None

def seg_tol(seg):
    m = re.fullmatch(r'\s*-?(\d+)(?:\.(\d+))?\s*', seg)
    if m:
        d = len(m.group(2) or '')
        return 10 ** (-d)
    return None

def check_pm(cid, a_str, rest_lo, rest_hi):
    m = re.fullmatch(r'(-?[0-9.]+)\\pm([0-9.]+)\(([0-9.]+)\)', a_str.strip())
    if m:
        c, t, s = float(m[1]), float(m[2]), float(m[3])
        lo, hi = c - t * s, c + t * s
    else:
        m = re.fullmatch(r'(-?[0-9.]+)\\pm([0-9.]+)', a_str.strip())
        if not m:
            need(False, f'{cid}: cannot parse +- line {a_str}'); return
        lo, hi = float(m[1]) - float(m[2]), float(m[1]) + float(m[2])
    for got, exp in [(rest_lo, lo), (rest_hi, hi)]:
        need(abs(float(got) - exp) <= max(1.01 * 10 ** (-decimals(got)), 2e-3 * abs(exp)), f'{cid}: interval end {got} vs {exp:.6f} in {a_str}')

def check_work_line(cid, w, nxt=None):
    """re-evaluates every numeric equality and inequality chain in one work line"""
    if 'begin{bmatrix}' in w or '\\texttt' in w: return 0
    n_checked = 0
    if '\\leftrightarrow' in w:
        w = w.split('\\leftrightarrow')[-1]
        if '\\pm' not in w: return 0
    if '\\pm' in w:
        m = re.search(r'([^=:]*\\pm[^=]*)=\[(-?[0-9.]+),\\?\s*(-?[0-9.]+)\]', w)
        if m:
            check_pm(cid, m[1].replace('\\ ', '').split(':')[-1], m[2], m[3]); return 1
        if nxt is not None:
            m2 = re.fullmatch(r'\[(-?[0-9.]+),\\ (-?[0-9.]+)\]', nxt.strip())
            if m2:
                check_pm(cid, w, m2[1], m2[2]); return 1
        need(False, f'{cid}: unchecked +- line {w}'); return 0
    w = re.sub(r'\\ \((?:P|0\.\d+)[<>].*\)$', '', w)
    parts = [p for p in re.split(r',\\ (?=[^,]*=)', w)] if w.count('=') > 1 and ',\\ ' in w else [w]
    for part in parts:
        if ',' in part and not re.search(r'\\frac|\\sqrt', part):
            continue
        toks = re.split(r'(=|<|>)', part)
        segs, ops = toks[0::2], toks[1::2]
        groups = [[segs[0]]]
        rel = []
        for op, sg in zip(ops, segs[1:]):
            if op == '=':
                groups[-1].append(sg)
            else:
                rel.append(op); groups.append([sg])
        gvals = []
        for g in groups:
            vals = [(s, ev(s)) for s in g]
            nums = [(s, v) for s, v in vals if v is not None]
            if len(nums) >= 2:
                last_s, last_v = nums[-1]
                t = seg_tol(last_s)
                for s, v in nums[:-1]:
                    tl = max(5e-4 * abs(last_v), 1.01 * t if t is not None else 1e-9, 1e-9)
                    need(abs(v - last_v) <= tl, f'{cid}: {s} = {v:.6g} but line says {last_s} in  {w}')
                    n_checked += 1
            gvals.append(nums[-1][1] if nums else None)
        for (op, a, b) in zip(rel, gvals[:-1], gvals[1:]):
            if a is None or b is None: continue
            need(a > b if op == '>' else a < b, f'{cid}: inequality fails in {w}')
            n_checked += 1
    return n_checked

def check_all_work(case):
    n = 0
    for s in case['steps']:
        ws = s.get('work', [])
        for i, w in enumerate(ws):
            n += check_work_line(case['id'], w, ws[i + 1] if i + 1 < len(ws) else None)
    return n

T_ROWS_PRINTED = set(range(1, 41)) | {42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 90, 100, 120, 140, 160, 180, 200}
F_ROWS_PRINTED = set(range(1, 31)) | {32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 60, 70, 80, 100, 120}
NORMAL = {1.96: 0.05, 1.960: 0.05, 3.2905: 0.001, 2.3263: 0.02, 1.2816: 0.20, 1.6449: 0.10, 2.5758: 0.01}

def tcrit(a, df): return stats.t.ppf(1 - a / 2, df)

def check_crit_lines(cid, case):
    """every printed critical value written in work lines is checked against SciPy within table rounding"""
    n = 0
    for s in case['steps']:
        for w in s.get('work', []):
            for a, df, v in re.findall(r't_\{([0-9.]+)\}\((\d+)\)=([0-9.]+)', w):
                need(int(df) in T_ROWS_PRINTED, f'{cid}: t row {df} is not printed')
                need(abs(tcrit(float(a), int(df)) - float(v)) <= 0.0011, f'{cid}: t_{a}({df})={v} vs SciPy {tcrit(float(a), int(df)):.4f}')
                n += 1
            for a, n1, n2, v in re.findall(r'F_\{([0-9.]+)\}\((\d+),(\d+)\)=([0-9.]+)', w):
                need(int(n2) in F_ROWS_PRINTED, f'{cid}: F row {n2} is not printed')
                need(abs(stats.f.ppf(1 - float(a), int(n1), int(n2)) - float(v)) <= 0.011, f'{cid}: F_{a}({n1},{n2})={v} vs SciPy')
                n += 1
            for v in re.findall(r'(?<![0-9.])(1\.960|3\.2905|2\.3263|1\.2816|1\.6449)(?![0-9])', w):
                a = NORMAL[float(v)]
                need(abs(stats.norm.ppf(1 - a / 2) - float(v)) <= 0.0006, f'{cid}: Normal cutoff {v}')
                n += 1
    return n

def check_lookup(cid, lk):
    if lk is None: return
    path, v = lk['path'], lk['value']
    if path.endswith('t_table.pdf'):
        col = float(lk['column'])
        if lk['row'] == '∞':
            need(abs(stats.norm.ppf(1 - col / 2) - v) <= 0.0006, f'{cid}: lookup inf row')
            need(lk['page'] == 2, f'{cid}: inf row is on page 2')
        else:
            row = int(lk['row'])
            need(row in T_ROWS_PRINTED, f'{cid}: lookup row {row} not printed')
            need(abs(tcrit(col, row) - v) <= 0.0011, f'{cid}: lookup t {row} {v}')
            need(lk['page'] == (1 if row <= 46 else 2), f'{cid}: lookup page')
            if lk['actualDf'] != row:
                need(lk['approximation'] is True and row < lk['actualDf'], f'{cid}: bracketed row must be the lower printed row and flagged')
            else:
                need(lk['approximation'] is False, f'{cid}: approximation flag')
    elif path.endswith('F_table.pdf'):
        nn = int(re.search(r'(\d+)', lk['column'])[1]); dd = int(re.search(r'(\d+)', lk['row'])[1])
        need(dd in F_ROWS_PRINTED, f'{cid}: F row')
        need(abs(stats.f.ppf(0.95, nn, dd) - v) <= 0.011, f'{cid}: lookup F {nn},{dd} {v}')
        need(lk['page'] == (1 if dd <= 34 else 2), f'{cid}: F page')
    elif 'Chi_Squared' in path:
        need(abs(stats.chi2.ppf(1 - float(lk['column']), int(lk['row'])) - v) <= 0.0011, f'{cid}: lookup chi')
    else:
        need(False, f'{cid}: unknown table {path}')

BANNED = re.compile(r'\b(picture|pictured|professor|lecture|slide|slides|session)\b', re.I)
def check_style(case):
    cid = case['id']
    texts = [('conclusion', case['conclusion'])] + [(f'step {i+1} words', s['words']) for i, s in enumerate(case['steps'])]
    if case.get('hypotheses'):
        texts += [('nullWords', case['hypotheses']['nullWords']), ('alternativeWords', case['hypotheses']['alternativeWords'])]
    for name, t in texts:
        plain = re.sub(r'\\\(.*?\\\)', '', t)
        need(':' not in plain and ';' not in plain, f'{cid}: colon or semicolon in {name}')
        need(not BANNED.search(t), f'{cid}: banned word in {name}')
    for name, t in [('context', case['context']), ('title', case['title'])] + [('task', x) for x in case['tasks']]:
        need(not BANNED.search(t), f'{cid}: banned word in {name}')
        need('Session' not in t, f'{cid}: session in {name}')

def cmp_values(c, exp):
    got = c['values']
    need(set(got) == set(exp), f'{c["id"]}: values keys differ {set(got) ^ set(exp)}')
    for k, e in exp.items():
        g = got.get(k)
        if isinstance(e, (bool, np.bool_)):
            need(g is bool(e), f'{c["id"]}: values.{k} {g} != {e}')
        elif isinstance(e, str):
            need(g == e, f'{c["id"]}: values.{k}')
        elif isinstance(e, (list, tuple, np.ndarray)) and len(e) and isinstance(e[0], str):
            need(g == list(e), f'{c["id"]}: values.{k}')
        elif isinstance(e, (list, tuple, np.ndarray)):
            need(g is not None and len(g) == len(e) and all(close(float(a), float(b), 1e-9, 1e-9) for a, b in zip(g, e)), f'{c["id"]}: values.{k} {g} != {list(e)}')
        else:
            need(g is not None and close(float(g), float(e), 1e-9, 1e-12), f'{c["id"]}: values.{k} {g} != {e}')

def bracket_ok(cid, t, df, case):
    """the P range written in the last step must be the true one for the printed row"""
    a = abs(t)
    cols = [0.50, 0.20, 0.10, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001]
    crit = [tcrit(x, df) for x in cols]
    p = 2 * stats.t.sf(a, df)
    last = ' '.join(case['steps'][7]['work'])
    m = re.search(r'([0-9.]+)<P<([0-9.]+)', last)
    if m:
        need(float(m[1]) < p < float(m[2]), f'{cid}: P range {m[0]} but P = {p:.4g}')
    elif 'P>0.50' in last:
        need(p > 0.5, f'{cid}: P>0.50 wrong')
    elif 'P<0.001' in last:
        need(p < 0.001, f'{cid}: P<0.001 wrong')
    else:
        need(False, f'{cid}: no P range')

def chk_paired(c, withR=False):
    rows = c['table']['rows']
    x1 = np.array([r[1] for r in rows], float); x2 = np.array([r[2] for r in rows], float)
    d = np.round(x2 - x1, 10); n = len(d)
    dbar = d.mean(); ss = float(((d - dbar) ** 2).sum()); var = ss / (n - 1); sd = math.sqrt(var); se = sd / math.sqrt(n); t = dbar / se
    tt = stats.ttest_rel(x2, x1)
    need(close(tt.statistic, t, 1e-9), f'{c["id"]}: scipy paired t')
    crit = round(tcrit(0.05, n - 1), 3)
    exp = dict(n=n, differences=d.tolist(), dbar=dbar, sumSqDev=ss, varianceD=var, sd=sd, se=se, t=t, df=n - 1, critical=crit, exactP=float(tt.pvalue), reject=abs(t) > crit)
    # the subtraction list in the work line matches the table
    w = c['steps'][1]['work'][0]
    pairs = re.findall(r'(-?[0-9.]+)-(-?[0-9.]+)', w[w.index('(') + 1:])
    need(len(pairs) == n and all(close(float(a), b2) and close(float(b), b1) for (a, b), b1, b2 in zip(pairs, x1, x2)), f'{c["id"]}: subtraction list')
    lst = [float(v) for v in re.search(r'd_i=\((.*)\),', c['steps'][1]['work'][1])[1].split(',')]
    need(np.allclose(lst, d), f'{c["id"]}: difference list')
    if withR:
        v = c['values']; out = v['rOutput']
        q = stats.t.ppf(0.975, n - 1)
        exp.update(ciLowerPrinted=dbar - crit * se, ciUpperPrinted=dbar + crit * se, ciLowerR=dbar - q * se, ciUpperR=dbar + q * se, rOutput=out, rCode=v['rCode'])
        txt = '\n'.join(out)
        need(out[0] == '\tPaired t-test' and out[1] == '', f'{c["id"]}: R header lines')
        m = re.search(r'data:  (\w+) and (\w+)', txt)
        need(m and v['rCode'] == f't.test({m[1]}, {m[2]}, paired = TRUE)', f'{c["id"]}: rCode vs data line')
        m = re.search(r't = (-?[0-9.]+), df = (\d+), p-value = ([0-9.e\-]+)', txt)
        need(abs(float(m[1]) - t) <= 0.51 * 10 ** (-decimals(m[1])), f'{c["id"]}: R t {m[1]} vs {t}')
        need(int(m[2]) == n - 1, f'{c["id"]}: R df')
        need(close(float(m[3]), tt.pvalue, 1e-3), f'{c["id"]}: R p {m[3]} vs {tt.pvalue}')
        lo, hi = out[out.index('95 percent confidence interval:') + 1].split()
        need(abs(float(lo) - (dbar - q * se)) < 1e-6 and abs(float(hi) - (dbar + q * se)) < 1e-6, f'{c["id"]}: R CI')
        need(abs(float(out[-1]) - dbar) < 1e-6, f'{c["id"]}: R mean difference')
        need(out[2 + 2] == 'alternative hypothesis: true mean difference is not equal to 0' or 'alternative hypothesis: true mean difference is not equal to 0' in out, f'{c["id"]}: alternative line')
        # R code vectors in the R step equal the table columns
        rw = [x for x in c['steps'][8]['work'] if '<-' in x]
        vecs = {re.search(r'\{(\w+) <-', x)[1]: [float(y) for y in re.search(r'c\((.*)\)', x)[1].split(',')] for x in rw}
        need(len(vecs) == 2 and any(np.allclose(vv, x1) for vv in vecs.values()) and any(np.allclose(vv, x2) for vv in vecs.values()), f'{c["id"]}: R vectors differ from table')
        # quoted numbers in the step words and the marking lines are in the printout
        for s in c['steps'][8:]:
            for q_ in re.findall(r'(?:t = |df = |p-value = |from |to |difference of )(-?[0-9][0-9.]*[0-9])', s['words'] + ' '.join(s['work'])):
                need(q_ in txt, f'{c["id"]}: quoted {q_} not in R output')
        need(len(c['steps']) == 10, f'{c["id"]}: R steps')
    cmp_values(c, exp); need(close(c['answer'], t), f'{c["id"]}: answer')
    bracket_ok(c['id'], t, n - 1, c)

def chk_unpaired(c):
    rows = c['table']['rows']
    before = np.array([r[1] for r in rows], float); after = np.array([r[2] for r in rows], float)
    n1 = n2 = len(rows)
    x1, x2 = after.mean(), before.mean(); s1, s2 = after.std(ddof=1), before.std(ddof=1)
    sp = ((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2); se = math.sqrt(sp / n1 + sp / n2); t = (x1 - x2) / se
    tt = stats.ttest_ind(after, before)
    need(close(tt.statistic, t, 1e-9), f'{c["id"]}: scipy unpaired t')
    df = n1 + n2 - 2; crit = round(tcrit(0.05, df), 3)
    exp = dict(n1=n1, n2=n2, x1=x1, x2=x2, s1=s1, s2=s2, pooledVariance=sp, se=se, t=t, df=df, critical=crit, exactP=float(tt.pvalue), reject=abs(t) > crit)
    cmp_values(c, exp); need(close(c['answer'], t), f'{c["id"]}: answer')
    need(not exp['reject'], f'{c["id"]}: unpaired should not reject')
    tp = stats.ttest_rel(after, before)
    need(f'{tp.statistic:.3f}' in ' '.join(c['tasks']) and f'{tp.statistic:.3f}' in c['conclusion'], f'{c["id"]}: quoted paired t')
    need(tp.pvalue < 0.001, f'{c["id"]}: paired P < 0.001 claim')
    m = re.search(r'([0-9.]+)<P<([0-9.]+)', ' '.join(c['steps'][5]['work']))
    if m: need(float(m[1]) < tt.pvalue < float(m[2]), f'{c["id"]}: P range')
    else: need('P>0.50' in ' '.join(c['steps'][5]['work']) and tt.pvalue > 0.5, f'{c["id"]}: P range')

def chk_rm(c):
    X = np.array([r[1:] for r in c['table']['rows']], float); n, m = X.shape
    S = X.mean(1); Tm = X.mean(0); G = X.mean()
    SStot = float(((X - G) ** 2).sum()); SSbs = float(m * ((S - G) ** 2).sum()); SSw = float(((X - S[:, None]) ** 2).sum())
    SSt = float(n * ((Tm - G) ** 2).sum()); SSr = float(SStot - SSbs - SSt)
    need(close(SSw - SSt, SSr, 1e-9, 1e-9), f'{c["id"]}: partition')
    dft, dfr = m - 1, (n - 1) * (m - 1); MSt, MSr = SSt / dft, SSr / dfr; F = MSt / MSr
    c05, c01 = round(stats.f.ppf(0.95, dft, dfr), 2), round(stats.f.ppf(0.99, dft, dfr), 2)
    need(abs(c05 - c['values']['critical05']) < 0.011 and abs(c01 - c['values']['critical01']) < 0.011, f'{c["id"]}: F criticals')
    c05, c01 = c['values']['critical05'], c['values']['critical01']
    p = stats.f.sf(F, dft, dfr)
    exp = dict(n=n, m=m, subjectMeans=S.tolist(), treatmentMeans=Tm.tolist(), grandMean=G, SStotal=SStot, SSbetweenSubjects=SSbs, SSwithinSubjects=SSw,
               SStreat=SSt, SSres=SSr, DFtreat=dft, DFres=dfr, MStreat=MSt, MSres=MSr, F=F, critical05=c05, critical01=c01, exactP=p, reject=F > c05)
    cmp_values(c, exp); need(close(c['answer'], F), f'{c["id"]}: answer')
    # an independent route, the two-way ANOVA without interaction on the long table, gives the same F
    y = X.flatten(); subj = np.repeat(np.arange(n), m); trt = np.tile(np.arange(m), n)
    D_ = np.column_stack([np.ones(n * m)] + [(subj == i).astype(float) for i in range(1, n)] + [(trt == j).astype(float) for j in range(1, m)])
    r = y - D_ @ np.linalg.lstsq(D_, y, rcond=None)[0]
    need(close(float(r @ r), SSr, 1e-8, 1e-8), f'{c["id"]}: residual SS by regression')
    last = ' '.join(c['steps'][8]['work'])
    if F > c01: need('P<0.01' in last and p < 0.01, f'{c["id"]}: P<0.01')
    elif F > c05: need('0.01<P<0.05' in last and 0.01 < p < 0.05, f'{c["id"]}: 0.01<P<0.05')
    else: need(p > 0.05, f'{c["id"]}: P>0.05')
    need(c['table']['headers'][0] == 'Subject' and len(c['table']['headers']) == m + 1, f'{c["id"]}: headers')

# ---------------------------------------------------------------- structure
REFC = {c['id']: c for c in REF['cases']}
METHODS = {m['id'] for m in REF['methods']}
MODEL = {'s20paired': 's20-oc-paired', 's20unpaired': 's20-oc-unpaired', 's20pairedR': 's20-hr-posture-r', 's20rmanova': 's20-breathing-rmanova'}
ids = [c['id'] for c in D['cases']]
need(len(ids) == 10, 'expected 10 cases')
need(len(set(ids)) == len(ids), 'duplicate ids')
need(D['questions'] == [], 'questions must be empty')
need(set(D) == {'cases', 'questions', 'notes'}, 'top-level keys')
from collections import Counter
cnt = Counter(c['topic'] for c in D['cases'])
need(set(cnt) == METHODS, f'every method covered {cnt}')
need(max(cnt.values()) - min(cnt.values()) <= 1, f'cases spread evenly {cnt}')
titles = [c['title'] for c in D['cases']]
need(len(set(titles)) == len(titles), 'titles unique')
for c in D['cases']:
    cid = c['id']
    ref = REFC[MODEL[c['topic']]]
    need(re.fullmatch(r'p20-[a-z0-9-]+', cid) is not None, f'{cid}: id form')
    need(c['module'] == 20, f'{cid}: module')
    need(c['source'] == 'Original practice example in the course style', f'{cid}: source')
    need(set(c) == set(ref), f'{cid}: case keys differ {set(c) ^ set(ref)}')
    need(set(c['values']) == set(ref['values']), f'{cid}: values keys differ {set(c["values"]) ^ set(ref["values"])}')
    need(len(c['steps']) >= len(ref['steps']), f'{cid}: fewer steps than the reference case')
    need([s['title'] for s in c['steps']] == [s['title'] for s in ref['steps']], f'{cid}: step titles differ from the reference case')
    lks = [s['classTable'] for s in c['steps'] if 'classTable' in s]
    need(c['lookup'] in lks, f'{cid}: lookup must be one of the step classTables')
    for s in c['steps']:
        need(set(s) <= {'title', 'general', 'work', 'words', 'classTable'}, f'{cid}: step keys')
        if 'classTable' in s and s['classTable']['path'].endswith('t_table.pdf'):
            check_lookup(cid, s['classTable'])
        elif 'classTable' in s:
            lk = s['classTable']; dft, dfr = lk['actualDf']
            need(lk['row'] == str(dfr) and lk['column'].startswith(str(dft)) and dfr in F_ROWS_PRINTED and lk['page'] == 1, f'{cid}: F lookup form')
            need(abs(stats.f.ppf(0.95, dft, dfr) - lk['value']) <= 0.011, f'{cid}: F lookup value')
    need(abs(c['tolerance'] - max(0.001, round(abs(c['answer']) * 0.005, 6))) < 1e-9, f'{cid}: tolerance')
    check_style(c)
    for t_ in c['tasks']:
        need('Assume that any quantities of interest are Normally distributed.' in t_ or t_.startswith('(ii)'), f'{cid}: task wording')

by = {c['id']: c for c in D['cases']}
for c in D['cases']:
    if c['topic'] == 's20paired': chk_paired(c)
    elif c['topic'] == 's20pairedR': chk_paired(c, True)
    elif c['topic'] == 's20unpaired': chk_unpaired(c)
    else: chk_rm(c)

nwork = sum(check_all_work(c) for c in D['cases'])
ncrit = sum(check_crit_lines(c['id'], c) for c in D['cases'])

if errors:
    print(f'{len(errors)} problem(s)')
    for e in errors: print(' -', e)
    sys.exit(1)
print(f'session20.json OK: {len(D["cases"])} cases, {nwork} work-line equalities and inequalities and {ncrit} printed critical values re-checked')
