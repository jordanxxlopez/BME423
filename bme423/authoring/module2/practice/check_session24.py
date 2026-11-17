"""Independent check of authoring/module2/practice/session24.json.

Recomputes every answer and every `values` entry from the raw table of each case with NumPy/SciPy
(rank sums, signed-rank sums, mu, sigma, z, exact permutation P by brute-force enumeration), checks
the printed critical values against a transcription of the class tables and against the exact no-tie
distributions, re-runs shapiro.test in R when Rscript is available, re-evaluates the arithmetic of the
work lines, and checks ids, key sets and step counts against the lecture case of the same method, and
the wording rules (no colons, semicolons or banned words in words, conclusion and hypotheses in words).
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session24.py
Exits 0 when everything passes.
"""
import json, os, re, sys, shutil, subprocess, itertools, math
import numpy as np
from scipy import stats
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session24.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, '..', 'neuro', 'ref', 'session24.json'), encoding='utf-8'))
SRC = 'Original practice example in the course style'
errors = []
NWORK = [0]


def need(cond, msg):
    if not cond:
        errors.append(msg)


def close(a, b, rel=1e-9, ab=1e-9):
    return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))


METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {}
for c in REF['cases']:
    REFKEYS.setdefault(c['topic'], []).append((set(c.keys()), len(c['steps'])))

# printed class tables (transcribed from page 1 of each PDF): (lower, upper, P) near .05 and near .01
MW_TABLE = {(4, 8): ((14, 38, .048), (11, 41, .008)), (6, 6): ((26, 52, .041), (23, 55, .009))}
MISPRINTED_ROW = (4, 7)   # printed near .01 as 10,38 with P = .012, exact P about .006. No case may use it.
W_TABLE = {7: ((28, .016), (24, .046)), 8: ((32, .024), (28, .054))}
T_INF = {'0.50': 0.6745, '0.20': 1.2816, '0.10': 1.6449, '0.05': 1.9600, '0.02': 2.3263, '0.01': 2.5758, '0.005': 2.8070, '0.002': 3.0902, '0.001': 3.2905}
for a, v in T_INF.items():
    need(abs(stats.norm.ppf(1 - float(a) / 2) - v) <= 6e-5, f't table infinity row {a} {v}')


def cmp_values(cid, got, exp):
    need(set(got) == set(exp), f'{cid}: values keys differ {set(got) ^ set(exp)}')
    for k, e in exp.items():
        gv = got.get(k)
        if isinstance(e, (bool, np.bool_)):
            need(gv is bool(e), f'{cid}: values.{k} {gv} != {e}')
        elif isinstance(e, str):
            need(gv == e, f'{cid}: values.{k}')
        elif isinstance(e, (list, tuple, np.ndarray)):
            need(gv is not None and len(gv) == len(e) and all((x == y) if isinstance(y, str) else close(float(x), float(y)) for x, y in zip(gv, e)), f'{cid}: values.{k} {gv} != {list(e)}')
        else:
            need(gv is not None and close(float(gv), float(e)), f'{cid}: values.{k} {gv} != {e}')


# ---------------------------------------------------------------- generic work-line arithmetic
def to_py(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('\\ ', '').replace('\\quad', '').replace('\\frac12', '(1/2)')
    s = re.sub(r'\|([^|]*)\|', r'abs(\1)', s)
    for _ in range(6):
        s = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s)
        s = re.sub(r'\\sqrt\{([^{}]*)\}', r'sqrt(\1)', s)
    s = re.sub(r'\^(\d)', r'**\1', s)
    s = re.sub(r'(\d|\))\(', r'\1*(', s)
    return s


def numeric(s):
    p = to_py(s).strip()
    if not p or not re.fullmatch(r'(?:[0-9+\-*/(). ]|sqrt|abs)*', p) or not re.search(r'\d', p):
        return None
    try:
        r = eval(p, {'__builtins__': {}}, {'sqrt': math.sqrt, 'abs': abs})
    except Exception:
        return None
    return r if isinstance(r, (int, float)) else None


def split_top(s, sep):
    out, depth, cur, i = [], 0, '', 0
    while i < len(s):
        ch = s[i]
        if ch in '({':
            depth += 1
        elif ch in ')}':
            depth -= 1
        if depth == 0 and s.startswith(sep, i):
            out.append(cur); cur = ''; i += len(sep); continue
        cur += ch; i += 1
    return out + [cur]


def generic(cid, line):
    for part in split_top(line, ',\\ '):
        sides = [numeric(x) for x in split_top(part, '=')]
        vals = [x for x in sides if x is not None]
        if len(vals) > 1:
            NWORK[0] += 1
            need(all(abs(a - vals[0]) <= 6e-5 * max(1, abs(vals[0])) for a in vals[1:]), f'{cid}: work arithmetic {line} {vals}')


def check_work_arith(cid, steps):
    """re-evaluate the arithmetic shown in the work lines (special forms plus every numeric equality chain)"""
    for s in steps:
        for w in s['work']:
            generic(cid, w)
            for a, b, c, pc in re.findall(r'\\frac\{(-?[0-9.]+)\}\{(-?[0-9.]+)\}=(-?[0-9.]+)(\\%)?', w):
                NWORK[0] += 1; need(close(float(a) / float(b) * (100 if pc else 1), float(c), 6e-6, 6e-6), f'{cid}: {w}')
            m = re.fullmatch(r'\\text\{check\}\\ \\frac\{(\d+)\((\d+)\)\}\{2\}-2\(([0-9.]+)\)=(-?[0-9.]+)', w)
            if m:
                NWORK[0] += 1; need(close(int(m[1]) * int(m[2]) / 2 - 2 * float(m[3]), float(m[4])), f'{cid}: {w}')
            m = re.fullmatch(r'\\text\{check\}\\ ([0-9.]+)\+([0-9.]+)=([0-9.]+)=\\frac\{(\d+)\((\d+)\)\}\{2\}', w)
            if m:
                NWORK[0] += 1; need(close(float(m[1]) + float(m[2]), float(m[3])) and close(float(m[3]), int(m[4]) * int(m[5]) / 2), f'{cid}: {w}')
            for tie in re.findall(r'\((\d+)\\cdot(\d+)\\cdot(\d+)\)', w):
                t = int(tie[1]); need(int(tie[0]) == t - 1 and int(tie[2]) == t + 1, f'{cid}: tie term {tie}')
            m = re.fullmatch(r'((?:\(\d+\\cdot\d+\\cdot\d+\)\+?)+)=(\d+)', w)
            if m:
                NWORK[0] += 1; need(sum(int(a) * int(b) * int(c) for a, b, c in re.findall(r'\((\d+)\\cdot(\d+)\\cdot(\d+)\)', m[1])) == int(m[2]), f'{cid}: {w}')
            for vals, num_, den, res in re.findall(r'([0-9.,]+)\\to\\frac\{([0-9+]+)\}\{(\d+)\}=([0-9.]+)', w):
                parts = [int(x) for x in num_.split('+')]
                NWORK[0] += 1
                need(len(parts) == int(den) == len(vals.split(',')) and parts == list(range(parts[0], parts[0] + len(parts))) and close(sum(parts) / int(den), float(res)), f'{cid}: tie rank {num_}/{den}')
            m = re.fullmatch(r't_\{([0-9.]+)\}\(\\infty\)=([0-9.]+)<([0-9.]+)<t_\{([0-9.]+)\}\(\\infty\)=([0-9.]+)', w)
            if m:
                NWORK[0] += 1
                need(close(T_INF[m[1]], float(m[2]), 0, 1e-9) and close(T_INF[m[4]], float(m[5]), 0, 1e-9) and float(m[2]) < float(m[3]) < float(m[5]), f'{cid}: {w}')
            m = re.fullmatch(r'z_1=\\Phi\^\{-1\}\(([0-9.]+)\)=(-?[0-9.]+)', w)
            if m:
                NWORK[0] += 1; need(close(stats.norm.ppf(float(m[1])), float(m[2]), 0, 6e-6), f'{cid}: {w}')
            m = re.fullmatch(r'\\binom\{(\d+)\}\{(\d+)\}=(\d+)', w)
            if m:
                NWORK[0] += 1; need(math.comb(int(m[1]), int(m[2])) == int(m[3]), f'{cid}: {w}')
            m = re.fullmatch(r'(-?[0-9.]+)<x<(-?[0-9.]+)', w)
            if m:
                NWORK[0] += 1
            m = re.fullmatch(r'\|z_[TW]\|=([0-9.]+)([<>])1\.9600', w)
            if m:
                NWORK[0] += 1; need((float(m[1]) > 1.96) == (m[2] == '>'), f'{cid}: {w}')


def check_text(c):
    cid = c['id']
    strict = [c['conclusion'], c['hypotheses']['nullWords'], c['hypotheses']['alternativeWords']] + [s['words'] for s in c['steps']]
    for tx in strict:
        need(':' not in tx and ';' not in tx, f'{cid}: colon or semicolon in "{tx[:60]}"')
        need(not re.search(r'\bsimply\b|\bnote that\b|\brecall that\b', tx, re.I), f'{cid}: banned filler in "{tx[:60]}"')
    for tx in strict + [c['context'], c['title']] + c['tasks']:
        need(not re.search(r'\bpicture', tx, re.I) and not re.search(r'professor|lecture|slide|session \d', tx, re.I), f'{cid}: banned word in "{tx[:60]}"')
        need(not re.search(r'seizure|\bEEG\b|tinnitus|concussion|dopamine|\bfMRI\b|\bsleep onset', tx, re.I), f'{cid}: neuroscience setting in "{tx[:60]}"')
    need(c['hypotheses']['nullWords'].startswith('There is no difference'), f'{cid}: null in words')
    if c['topic'] != 's24normal':
        need('distributions of' in c['hypotheses']['nullWords'], f'{cid}: null wording should be about distributions')


# ---------------------------------------------------------------- exact enumerations (brute force, independent of the builder)
def exact_mw(S, B):
    allv = np.array(list(S) + list(B), float); r = stats.rankdata(allv); nS = len(S); N = len(allv)
    mu = nS * (N + 1) / 2; dev = abs(r[:nS].sum() - mu) - 1e-9
    if math.comb(N, nS) <= 100_000:   # brute force over every split
        sums = np.array([r[list(cmb)].sum() for cmb in itertools.combinations(range(N), nS)])
        return float((np.abs(sums - mu) >= dev).mean())
    # larger N: count the splits exactly with a dictionary over (group size, doubled rank sum)
    ways = {(0, 0): 1}
    for x in (int(round(2 * v)) for v in r):
        new = dict(ways)
        for (k, s), w in ways.items():
            if k < nS:
                new[(k + 1, s + x)] = new.get((k + 1, s + x), 0) + w
        ways = new
    hit = sum(w for (k, s), w in ways.items() if k == nS and abs(s / 2 - mu) >= dev)
    return hit / math.comb(N, nS)


def exact_w(dnz):
    r = stats.rankdata(np.abs(dnz)); Wobs = (np.sign(dnz) * r).sum()
    Ws = np.array(list(itertools.product((-1, 1), repeat=len(r)))) @ r
    return float((np.abs(Ws) >= abs(Wobs) - 1e-9).mean()), len(Ws)


def mw_table_P(nS, nB, lo, hi):
    sums = np.array([sum(c) for c in itertools.combinations(range(1, nS + nB + 1), nS)])
    return float(((sums <= lo) | (sums >= hi)).mean())


def w_table_P(n, c):
    Ws = np.array(list(itertools.product((-1, 1), repeat=n))) @ np.arange(1, n + 1)
    return float((np.abs(Ws) >= c).mean())


def zbracket_line(z):
    cols = list(T_INF)
    lo = [k for k in cols if z > T_INF[k]][-1]; i = cols.index(lo)
    return f'{cols[i + 1]}<P<{lo}' if i < len(cols) - 1 else 'P<0.001'


def nums_in(s):
    return [float(x) for x in re.findall(r'[-+]?\d+(?:\.\d+)?', s)]


# ---------------------------------------------------------------- per method
def check_normal(c):
    cid = c['id']; rows = c['table']['rows']; n = len(rows)
    need(n == 10, f'{cid}: n')
    x1 = np.array([r[1] for r in rows], float); x2 = np.array([r[2] for r in rows], float)
    need(list(x1) == sorted(x1) and list(x2) == sorted(x2), f'{cid}: table values should be sorted')
    for i, r in enumerate(rows, 1):
        p = (i - 3 / 8) / (n + 1 / 4)
        need(close(r[3], p, 0, 6e-6) and close(r[4], stats.norm.ppf(p), 0, 6e-6), f'{cid}: plotting position row {i}')

    def summ(x):
        m, s = x.mean(), x.std(ddof=1)
        return m, s, ((x - m) ** 2).sum(), int(((x > m - s) & (x < m + s)).sum()), int(((x > m - 2 * s) & (x < m + 2 * s)).sum())
    m1, s1, ss1, a1, b1 = summ(x1); m2, s2, ss2, a2, b2 = summ(x2)
    for x, m, s in ((x1, m1, s1), (x2, m2, s2)):   # no value sits within rounding of a range boundary
        need(min(np.min(np.abs(x - (m + k * s))) for k in (-2, -1, 1, 2)) > 0.005 * s, f'{cid}: a value is too close to a range boundary')
    W1, P1 = stats.shapiro(x1); W2, P2 = stats.shapiro(x2)
    v = c['values']; out = '\n'.join(v['rOutput'])
    rW = [float(t) for t in re.findall(r'W = ([0-9.]+)', out)]; rP = [float(t) for t in re.findall(r'p-value = ([0-9.e-]+)', out)]
    need(len(rW) == 2 and close(rW[0], W1, 0, 6e-6) and close(rW[1], W2, 0, 6e-6), f'{cid}: R W vs SciPy {W1},{W2}')
    need(len(rP) == 2 and close(rP[0], P1, 6e-4) and close(rP[1], P2, 6e-4), f'{cid}: R p vs SciPy {P1},{P2}')
    need('\tShapiro-Wilk normality test' in v['rOutput'] and out in c['tasks'][-1], f'{cid}: R output not printed in the task exactly')
    if shutil.which('Rscript'):
        live = subprocess.run(['Rscript', '-e', v['rCode']], capture_output=True, text=True).stdout.strip('\n').split('\n')
        need(live == v['rOutput'], f'{cid}: stored R output differs from a fresh Rscript run')
    rc = v['rCode']
    for name, x in zip(re.findall(r'(\w+) <- c\(', rc), (x1, x2)):
        vals_ = [float(t) for t in re.search(r'^' + name + r' <- c\(([^)]*)\)', rc, re.M)[1].split(',')]
        need(np.allclose(vals_, x), f'{cid}: rCode data {name}')
    exp = dict(n=n, mean1=m1, sd1=s1, within1SD_1=a1, mean2=m2, sd2=s2, within1SD_2=a2, within2SD_2=b2, W1=rW[0], P1=rP[0], W2=rW[1], P2=rP[1],
               reject2=rP[1] < 0.05, rOutput=v['rOutput'], rCode=rc)
    cmp_values(cid, v, exp)
    need(c['answerName'] == 'Shapiro-Wilk W (sample 2)' and close(c['answer'], rW[1]), f'{cid}: answer')
    need(c['lookup'] is None, f'{cid}: lookup should be null')
    st = c['steps']
    w3 = ' '.join(st[2]['work']); w6 = ' '.join(st[5]['work'])
    need(f'\\frac{{{a1}}}{{10}}' in w3 and f'\\frac{{{b1}}}{{10}}' in w3 and f'\\frac{{{a2}}}{{10}}' in w6 and f'\\frac{{{b2}}}{{10}}' in w6, f'{cid}: range counts in work lines')
    # printed mean, sum of squares, SD and range limits against the data
    need(close(nums_in(st[1]['work'][0])[-1], m1, 1e-6) and close(nums_in(st[1]['work'][1])[-1], ss1, 1e-6) and close(nums_in(st[1]['work'][2])[-1], s1, 6e-6), f'{cid}: sample 1 mean/SS/SD lines')
    lo1, hi1 = nums_in(st[2]['work'][1]); need(close(lo1, m1 - s1, 6e-6) and close(hi1, m1 + s1, 6e-6), f'{cid}: sample 1 range line')
    need(close(nums_in(st[5]['work'][0])[-1], m2, 1e-6) and close(nums_in(st[5]['work'][1])[0], ss2, 1e-6) and close(nums_in(st[5]['work'][1])[-1], s2, 6e-6), f'{cid}: sample 2 mean/SD lines')
    lo2, hi2 = nums_in(st[5]['work'][2]); need(close(lo2, m2 - s2, 6e-6) and close(hi2, m2 + s2, 6e-6), f'{cid}: sample 2 range line')
    for k, (W_, P_) in ((4, (rW[0], rP[0])), (6, (rW[1], rP[1]))):
        ww = st[k]['work'][0]
        need(f'W={W_:.5f}' in ww and (('<0.05' in ww) == (P_ < 0.05)) and (('reject' in st[k]['general'][0]) and (('do not' in st[k]['general'][0]) == (P_ >= 0.05))), f'{cid}: Shapiro decision step {k}')
    return dict(reject=rP[1] < 0.05, P2=rP[1])


def mw_groups(c):
    rows = c['table']['rows']; names = list(dict.fromkeys(r[0] for r in rows))
    g1 = [r[1] for r in rows if r[0] == names[0]]; g2 = [r[1] for r in rows if r[0] == names[1]]
    need(len(g1) <= len(g2), f"{c['id']}: the smaller group should be listed first")
    S, B = g1, g2
    rk = stats.rankdata(np.array([r[1] for r in rows], float))
    need(np.allclose(rk, [float(r[2]) for r in rows]), f"{c['id']}: rank column of the table is wrong")
    need(c['table']['headers'][2] == f'Rank (all {len(rows)} together)', f"{c['id']}: rank header")
    return S, B, rk


def check_T_line(c, r, nS):
    lines = [w for s in c['steps'] for w in s['work'] if w.startswith('T=') and '+' in w]
    need(len(lines) == 1, f"{c['id']}: one T sum line expected")
    if lines:
        addends = sorted(float(x) for x in lines[0][2:].split('=')[0].split('+'))
        need(np.allclose(addends, sorted(r[:nS])), f"{c['id']}: T addends are not the ranks of the smaller group")


def check_mwtable(c):
    cid = c['id']; S, B, r = mw_groups(c); nS, nB = len(S), len(B); N = nS + nB
    need(nB <= 8 and (nS, nB) != MISPRINTED_ROW, f'{cid}: n_B must be <= 8 and the misprinted row must not be used')
    T = r[:nS].sum(); mu = nS * (N + 1) / 2
    U = stats.mannwhitneyu(S, B).statistic; need(close(T, U + nS * (nS + 1) / 2), f'{cid}: T vs SciPy U')
    (lo, hi, p05), (lo1, hi1, p01) = MW_TABLE[(nS, nB)]
    for l_, h_, p_ in ((lo, hi, p05), (lo1, hi1, p01)):
        ex_ = mw_table_P(nS, nB, l_, h_)
        need(abs(ex_ - p_) < 0.001, f'{cid}: printed critical values {l_},{h_} P={p_} vs exact no-tie P {ex_}')
    ex = exact_mw(S, B); reject = T <= lo or T >= hi
    v = c['values']; ks = [k for k in v if isinstance(v[k], list) and k not in ('critical', 'critical01')]
    exp = {ks[0]: S, ks[1]: B}
    exp.update(nS=nS, nB=nB, T=T, muT=mu, combinations=math.comb(N, nS), critical=[lo, hi], critical01=[lo1, hi1], tableP=p05, exactP=ex, reject=reject)
    cmp_values(cid, v, exp)
    need(c['answerName'] == 'Rank sum T' and close(c['answer'], T), f'{cid}: answer')
    lk = c['lookup']
    need(lk['value'] == f'{lo}, {hi}' and lk['row'] == f'n_S = {nS}, n_B = {nB}' and lk['page'] == 1 and lk['path'] == 'sources/tables/MannWhitney_RankSumT_Table.pdf'
         and f'P = {p05:.3f}'.replace('0.', '.') in lk['column'], f'{cid}: lookup')
    need(c['steps'][4].get('tableLookup') == lk, f'{cid}: step lookup')
    last = c['steps'][-1]['work'][-1]
    if reject:
        need(not (T <= lo1 or T >= hi1) and last == f'{p01:.3f}<P<{p05:.3f}' and p01 < ex < p05 + 0.01, f'{cid}: P bracket {last} (exact {ex})')
    else:
        need(last == f'P>{p05:.3f}' and ex > p05, f'{cid}: P bracket {last}')
    check_T_line(c, r, nS)
    return dict(T=T, reject=reject, close=False)


def check_mwnormal(c):
    cid = c['id']; S, B, r = mw_groups(c); nS, nB = len(S), len(B); N = nS + nB
    need(nB > 8, f'{cid}: n_B must be > 8')
    T = r[:nS].sum(); mu = nS * (N + 1) / 2
    tau = [t for t in Counter(S + B).values() if t > 1]; ts = sum((t - 1) * t * (t + 1) for t in tau)
    need(len(tau) > 0, f'{cid}: should contain ties')
    v0 = nS * nB * (N + 1) / 12; sig = (v0 - nS * nB / (12 * N * (N - 1)) * ts) ** .5   # N - 1 form (the slides misprint N + 1)
    z = (abs(T - mu) - .5) / sig
    sp = stats.mannwhitneyu(S, B, method='asymptotic', use_continuity=True)   # same tie and continuity correction
    need(close(sp.pvalue, 2 * stats.norm.sf(z), 1e-9), f'{cid}: z_T disagrees with SciPy tie-corrected P')
    ex = exact_mw(S, B); reject = z > 1.96
    v = c['values']; ks = [k for k in v if isinstance(v[k], list)]
    exp = {ks[0]: S, ks[1]: B}
    exp.update(nS=nS, nB=nB, T=T, muT=mu, tieSum=ts, varianceNoTies=v0, sigmaT=sig, zT=z, critical=1.96, exactP=ex, reject=reject)
    cmp_values(cid, v, exp)
    need(c['answerName'] == 'z_T statistic' and close(c['answer'], z), f'{cid}: answer')
    need(c['steps'][-1]['work'][-1] == zbracket_line(z), f'{cid}: P bracket')
    need(c['lookup'] == {"path": "sources/tables/t_table.pdf", "page": 2, "row": "∞", "column": "0.05", "value": 1.96, "actualDf": None, "approximation": False}, f'{cid}: lookup')
    gen = [gg for s in c['steps'] for gg in s['general']]
    need(any('12N(N-1)' in gg for gg in gen) and not any('12N(N+1)' in gg for gg in gen), f'{cid}: tie term must use N - 1')
    tl = [w for s in c['steps'] for w in s['work'] if '\\cdot' in w]
    need(len(tl) == 1 and int(tl[0].split('=')[-1]) == ts, f'{cid}: printed tie sum')
    check_T_line(c, r, nS)
    return dict(T=T, z=z, reject=reject, close=abs(z - 1.96) < 0.1)


def w_data(c):
    rows = c['table']['rows']; b = np.array([r[1] for r in rows], float); a = np.array([r[2] for r in rows], float)
    d = np.round(a - b, 9)
    need(np.allclose(d, [r[3] for r in rows]), f"{c['id']}: difference column")
    dn = d[d != 0]; rk = stats.rankdata(np.abs(dn))
    need(np.allclose(rk, [float(r[4]) for r in rows if r[3] != 0]) and np.allclose(np.sign(dn) * rk, [float(r[5]) for r in rows if r[3] != 0]), f"{c['id']}: rank columns")
    need(all(r[4] == 'dropped' and r[5] == 'dropped' for r in rows if r[3] == 0), f"{c['id']}: zero rows must be dropped")
    st = c['steps']
    dl = [w for s in st for w in s['work'] if w.startswith('d=(')]
    need(len(dl) == 1 and np.allclose(nums_in(dl[0]), d), f"{c['id']}: printed differences")
    sl = [w for s in st for w in s['work'] if w.startswith('|d|\\ \\text{sorted}=')]
    need(len(sl) == 1 and np.allclose(nums_in(sl[0]), sorted(np.abs(dn))), f"{c['id']}: printed sorted magnitudes")
    rl = [w for s in st for w in s['work'] if w.startswith('\\text{signed ranks}=')]
    need(len(rl) == 1 and np.allclose(nums_in(rl[0]), np.sign(dn) * rk), f"{c['id']}: printed signed ranks")
    nl = [re.match(r'n=(\d+)-(\d+)=(\d+)', w) for s in st for w in s['work'] if re.match(r'n=\d+-\d+=\d+', w)]
    need(len(nl) == 1 and [int(x) for x in nl[0].groups()] == [len(d), len(d) - len(dn), len(dn)], f"{c['id']}: printed n line")
    return b, a, d, dn, rk


def check_wtable(c):
    cid = c['id']; b, a, d, dn, rk = w_data(c); n = len(dn); W = (np.sign(dn) * rk).sum()
    need(n <= 8, f'{cid}: n must be <= 8')
    Wplus = rk[dn > 0].sum(); spW = stats.wilcoxon(a, b, zero_method='wilcox', method='approx').statistic
    need(close(min(Wplus, rk.sum() - Wplus), spW), f'{cid}: W+ vs SciPy')
    for c_, p_ in W_TABLE[n]:
        need(abs(w_table_P(n, c_) - p_) < 0.001, f'{cid}: printed W critical value {c_} P={p_} vs exact no-tie P {w_table_P(n, c_)}')
    # the 0.05-level cutoff is the smallest printed value whose P does not exceed 0.05 (row n = 7 gives 24, P = .046)
    c1, p1 = min((c_, p_) for c_, p_ in W_TABLE[n] if p_ <= 0.05)
    ex, npat = exact_w(dn); reject = abs(W) >= c1
    exp = dict(before=list(b), after=list(a), differences=list(d), n=n, W=W, patterns=npat, critical=c1, exactP=ex, reject=reject)
    cmp_values(cid, c['values'], exp)
    need(c['answerName'] == 'Signed-rank sum W' and close(c['answer'], W), f'{cid}: answer')
    lk = c['lookup']
    need(lk['value'] == c1 and lk['row'] == f'n = {n}' and lk['page'] == 1 and lk['path'] == 'sources/tables/WilcoxonW_Table.pdf' and f'P = {p1:.3f}'.replace('0.', '.') in lk['column'], f'{cid}: lookup')
    need(c['steps'][4].get('tableLookup') == lk, f'{cid}: step lookup')
    if reject:
        need(c1 == max(cc for cc, _ in W_TABLE[n]), f'{cid}: P < p is only valid beyond the largest printed value')
    last = c['steps'][-1]['work'][-1]
    need(last == (f'P<{p1:.3f}' if reject else f'P>{p1:.3f}'), f'{cid}: P line')
    need((ex < p1 + 0.001) if reject else (ex > p1), f'{cid}: exact P {ex} inconsistent with the bracket')
    return dict(W=W, reject=reject, zeros=int((d == 0).sum()), close=abs(abs(W) - c1) <= 2)


def check_wnormal(c):
    cid = c['id']; b, a, d, dn, rk = w_data(c); n = len(dn); W = (np.sign(dn) * rk).sum()
    need(n > 8, f'{cid}: n must be > 8')
    tau = [t for t in Counter(np.abs(dn)).values() if t > 1]; ts = sum((t - 1) * t * (t + 1) for t in tau)
    v0 = n * (n + 1) * (2 * n + 1) / 6; sig = (v0 - ts / 12) ** .5; z = (abs(W) - .5) / sig
    # SciPy works on W+, whose continuity correction is half of ours, so compare the uncorrected z, |W|/sigma_W
    sp = stats.wilcoxon(a, b, zero_method='wilcox', correction=False, method='approx')
    need(close(stats.norm.isf(sp.pvalue / 2), abs(W) / sig, 1e-8), f'{cid}: sigma_W disagrees with SciPy tie-corrected variance')
    reject = z > 1.96
    exp = dict(before=list(b), after=list(a), differences=list(d), n=n, W=W, tieSum=ts, varianceNoTies=v0, sigmaW=sig, zW=z, critical=1.96,
               exactNormalP=2 * stats.norm.sf(z), pairedT=stats.ttest_rel(a, b).statistic, reject=reject)
    cmp_values(cid, c['values'], exp)
    need(c['answerName'] == 'z_W statistic' and close(c['answer'], z), f'{cid}: answer')
    need(c['steps'][-1]['work'][-1] == zbracket_line(z), f'{cid}: P bracket')
    need(c['lookup'] == {"path": "sources/tables/t_table.pdf", "page": 2, "row": "∞", "column": "0.05", "value": 1.96, "actualDf": None, "approximation": False}, f'{cid}: lookup')
    tl = [w for s in c['steps'] for w in s['work'] if '\\cdot' in w]
    need(len(tl) == 1 and int(tl[0].split('=')[-1]) == ts, f'{cid}: printed tie sum')
    return dict(W=W, z=z, reject=reject, zeros=int((d == 0).sum()), close=abs(z - 1.96) < 0.1)


R = {}; ids = set()
for c in D['cases']:
    cid = c['id']
    need(re.fullmatch(r'p24-[a-z0-9-]+', cid) is not None and cid not in ids, f'{cid}: id'); ids.add(cid)
    need(c['topic'] in METHODS and c['module'] == 24 and c['source'] == SRC, f'{cid}: topic/module/source')
    refs = REFKEYS[c['topic']]
    need(any(set(c.keys()) == rk for rk, _ in refs), f'{cid}: case keys differ from ref')
    need(len(c['steps']) >= max(n for _, n in refs), f'{cid}: fewer steps than the ref case')
    need(close(c['tolerance'], max(0.005 * abs(c['answer']), 0.001)), f'{cid}: tolerance')
    for s in c['steps']:
        need(s['title'] and s['general'] and s['work'] and s['words'], f'{cid}: empty step part')
    check_text(c); check_work_arith(cid, c['steps'])
    R[cid] = {'s24normal': check_normal, 's24mwtable': check_mwtable, 's24mwnormal': check_mwnormal, 's24wtable': check_wtable, 's24wnormal': check_wnormal}[c['topic']](c)

cnt = Counter(c['topic'] for c in D['cases'])
need(all(cnt[m] == 2 for m in METHODS) and len(D['cases']) == 10, f'need two cases per method {cnt}')
need(D['questions'] == [] and len(D['notes']) > 0, 'questions must be empty and notes present')
tests = [c['id'] for c in D['cases'] if c['topic'] != 's24normal']
need(2 <= sum(1 for t in tests if not R[t]['reject']) <= 4, 'outcome mix (about 1 in 4 tests should not reject)')
need(sum(1 for t in tests if R[t].get('close')) >= 2, 'a few results should land close to a cutoff')
need(all(R[c['id']].get('zeros', 0) > 0 for c in D['cases'] if c['topic'] in ('s24wtable', 's24wnormal')), 'every Wilcoxon case should drop a zero difference')
need(any(c['topic'] == 's24normal' and R[c['id']]['reject'] for c in D['cases']), 'a Normality case must fail Shapiro-Wilk')
need(any(c['topic'] == 's24normal' and not R[c['id']]['reject'] for c in D['cases']), 'a Normality case must keep Normality')
need(len({c['title'] for c in D['cases']}) == 10, 'titles unique')
need(NWORK[0] >= 80, f'too few work lines evaluated {NWORK[0]}')

if errors:
    print('\n'.join(errors)); print(f'{len(errors)} PROBLEMS'); sys.exit(1)
print(f'session24 OK: {len(D["cases"])} cases, {NWORK[0]} work-line checks, all values recomputed, printed critical values verified')
