"""Independent check of authoring/module2/neuro/session24a.json.
Recomputes every answer and every `values` entry from the raw table of each case with NumPy/SciPy
(rank sums, signed-rank sums, mu, sigma, z, exact permutation P by brute-force enumeration), checks
the printed critical values against a transcription of the class tables and against the exact
no-tie distributions, re-runs shapiro.test in R when Rscript is available, re-evaluates the
arithmetic of the work lines, and checks ids, keys, wording rules and questions.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session24a.py
"""
import json, os, re, sys, shutil, subprocess, itertools, math
import numpy as np
from scipy import stats
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session24a.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session24.json'), encoding='utf-8'))
errors = []
def need(cond, msg):
    if not cond: errors.append(msg)
def close(a, b, rel=1e-9, ab=1e-9): return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))

METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {}
for c in REF['cases']:
    REFKEYS.setdefault(c['topic'], []).append((set(c.keys()), set(c['values'].keys()), len(c['steps'])))

# printed class tables (transcribed from the PDFs, page 1 of each)
MW_TABLE = {(5, 7): ((20, 45, .048), (17, 48, .010)), (4, 7): ((13, 35, .042), (10, 38, .012))}
# The printed tables give P to 3 decimals (some rounded, some truncated). One printed entry is internally inconsistent and is kept as
# printed (it is what the class table shows): row n_S = 4, n_B = 7, near .01, "10,38  P = .012". The exact
# no-tie P of T <= 10 or T >= 38 is 0.00606, and .012 is the P of 11,37. It is flagged in the notes.
KNOWN_MISPRINT = {(4, 7, 10, 38): 0.0060606}
W_TABLE = {7: ((28, .016), (24, .046)), 8: ((32, .024), (28, .054))}
T_INF = {'0.50': 0.6745, '0.20': 1.2816, '0.10': 1.6449, '0.05': 1.9600, '0.02': 2.3263, '0.01': 2.5758, '0.005': 2.8070, '0.002': 3.0902, '0.001': 3.2905}
for a, v in T_INF.items():
    need(abs(stats.norm.ppf(1 - float(a) / 2) - v) <= 6e-5, f't table infinity row {a} {v}')

def cmp_values(cid, got, exp):
    need(set(got) == set(exp), f'{cid}: values keys differ {set(got) ^ set(exp)}')
    for k, e in exp.items():
        gv = got.get(k)
        if isinstance(e, (bool, np.bool_)): need(gv is bool(e), f'{cid}: values.{k} {gv} != {e}')
        elif isinstance(e, str): need(gv == e, f'{cid}: values.{k}')
        elif isinstance(e, (list, tuple, np.ndarray)):
            need(gv is not None and len(gv) == len(e) and all((x == y) if isinstance(y, str) else close(float(x), float(y)) for x, y in zip(gv, e)), f'{cid}: values.{k} {gv} != {list(e)}')
        else: need(gv is not None and close(float(gv), float(e)), f'{cid}: values.{k} {gv} != {e}')

def check_work_arith(cid, steps):
    """re-evaluate simple arithmetic shown in the work lines"""
    for s in steps:
        for w in s['work']:
            for a, b, c, pc in re.findall(r'\\frac\{(-?[0-9.]+)\}\{(-?[0-9.]+)\}=(-?[0-9.]+)(\\%)?', w):
                need(close(float(a) / float(b) * (100 if pc else 1), float(c), 6e-6, 6e-6), f'{cid}: {w}')
            for a, b, c in re.findall(r'\\sqrt\{\\frac\{([0-9.]+)\}\{(\d+)\}\}=([0-9.]+)', w):
                need(close((float(a) / float(b)) ** .5, float(c), 6e-6), f'{cid}: {w}')
            for a, c in re.findall(r'\\sqrt\{([0-9.]+)\}=([0-9.]+)', w):
                need(close(float(a) ** .5, float(c), 6e-6), f'{cid}: {w}')
            m = re.search(r'\\sqrt\{([0-9.]+)-([0-9.]+)\}=\\sqrt\{([0-9.]+)\}', w)
            if m: need(close(float(m[1]) - float(m[2]), float(m[3]), 6e-6), f'{cid}: {w}')
            m = re.search(r'\\sqrt\{([0-9.]+)-\\frac\{([0-9.]+)\}\{12\}\}=\\sqrt\{([0-9.]+)\}', w)
            if m: need(close(float(m[1]) - float(m[2]) / 12, float(m[3]), 1e-9), f'{cid}: {w}')
            m = re.fullmatch(r'T=([0-9.+]+)=([0-9.]+)', w)
            if m: need(close(sum(float(x) for x in m[1].split('+')), float(m[2])), f'{cid}: {w}')
            m = re.fullmatch(r'W=([0-9.]+)-([0-9.]+)=(-?[0-9.]+)', w)
            if m: need(close(float(m[1]) - float(m[2]), float(m[3])), f'{cid}: {w}')
            m = re.fullmatch(r'\\text\{check\}\\ \\frac\{(\d+)\((\d+)\)\}\{2\}-2\(([0-9.]+)\)=(-?[0-9.]+)', w)
            if m: need(close(int(m[1]) * int(m[2]) / 2 - 2 * float(m[3]), float(m[4])), f'{cid}: {w}')
            m = re.fullmatch(r'\\text\{check\}\\ ([0-9.]+)\+([0-9.]+)=([0-9.]+)=\\frac\{(\d+)\((\d+)\)\}\{2\}', w)
            if m: need(close(float(m[1]) + float(m[2]), float(m[3])) and close(float(m[3]), int(m[4]) * int(m[5]) / 2), f'{cid}: {w}')
            for tie in re.findall(r'\((\d+)\\cdot(\d+)\\cdot(\d+)\)', w):
                t = int(tie[1]); need(int(tie[0]) == t - 1 and int(tie[2]) == t + 1, f'{cid}: tie term {tie}')
            m = re.fullmatch(r'((?:\(\d+\\cdot\d+\\cdot\d+\)\+?)+)=(\d+)', w)
            if m: need(sum(int(a) * int(b) * int(c) for a, b, c in re.findall(r'\((\d+)\\cdot(\d+)\\cdot(\d+)\)', m[1])) == int(m[2]), f'{cid}: {w}')
            for vals, num, den, res in re.findall(r'([0-9,]+)\\to\\frac\{([0-9+]+)\}\{(\d+)\}=([0-9.]+)', w):
                parts = [int(x) for x in num.split('+')]
                need(len(parts) == int(den) and parts == list(range(parts[0], parts[0] + len(parts))) and close(sum(parts) / int(den), float(res)), f'{cid}: tie rank {num}/{den}')
            m = re.fullmatch(r't_\{([0-9.]+)\}\(\\infty\)=([0-9.]+)<([0-9.]+)<t_\{([0-9.]+)\}\(\\infty\)=([0-9.]+)', w)
            if m:
                need(close(T_INF[m[1]], float(m[2]), 0, 1e-9) and close(T_INF[m[4]], float(m[5]), 0, 1e-9) and float(m[2]) < float(m[3]) < float(m[5]), f'{cid}: {w}')

def check_text(c):
    cid = c['id']
    strict = [c['conclusion'], c['hypotheses']['nullWords'], c['hypotheses']['alternativeWords']] + [s['words'] for s in c['steps']]
    for tx in strict:
        need(':' not in tx and ';' not in tx, f'{cid}: colon or semicolon in "{tx[:60]}"')
    for tx in strict + [c['context'], c['title']] + c['tasks']:
        need(not re.search(r'\bpicture', tx, re.I) and not re.search(r'professor|lecture|slide|session \d', tx, re.I), f'{cid}: banned word in "{tx[:60]}"')
    need(c['hypotheses']['nullWords'].startswith('There is no difference'), f'{cid}: null in words')
    if c['topic'] != 's24normal': need('distributions of' in c['hypotheses']['nullWords'], f'{cid}: null wording should be about distributions')

# ---------------------------------------------------------------- exact enumerations (brute force, independent of the builder)
def exact_mw(S, B):
    allv = np.array(list(S) + list(B), float); r = stats.rankdata(allv); nS = len(S); N = len(allv)
    mu = nS * (N + 1) / 2; Tobs = r[:nS].sum(); dev = abs(Tobs - mu) - 1e-9
    combos = np.array(list(itertools.combinations(range(N), nS)))
    sums = r[combos].sum(1)
    return float((np.abs(sums - mu) >= dev).mean()), len(combos)

def exact_w(dnz):
    r = stats.rankdata(np.abs(dnz)); Wobs = (np.sign(dnz) * r).sum()
    signs = np.array(list(itertools.product((-1, 1), repeat=len(r))))
    Ws = signs @ r
    return float((np.abs(Ws) >= abs(Wobs) - 1e-9).mean()), len(signs)

def mw_table_P(nS, nB, lo, hi):
    """exact no-tie probability of T <= lo or T >= hi"""
    sums = np.array([sum(c) for c in itertools.combinations(range(1, nS + nB + 1), nS)])
    return float(((sums <= lo) | (sums >= hi)).mean())

def w_table_P(n, c):
    r = np.arange(1, n + 1); Ws = np.array(list(itertools.product((-1, 1), repeat=n))) @ r
    return float((np.abs(Ws) >= c).mean())

def zbracket_line(z):
    cols = list(T_INF)
    lo = [k for k in cols if z > T_INF[k]][-1]; i = cols.index(lo)
    return f'{cols[i + 1]}<P<{lo}' if i < len(cols) - 1 else 'P<0.001'

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
        return m, s, int(((x > m - s) & (x < m + s)).sum()), int(((x > m - 2 * s) & (x < m + 2 * s)).sum())
    m1, s1, a1, b1 = summ(x1); m2, s2, a2, b2 = summ(x2)
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
        vals_ = [float(t) for t in re.search(name + r' <- c\(([^)]*)\)', rc)[1].split(',')]
        need(np.allclose(vals_, x), f'{cid}: rCode data {name}')
    exp = dict(n=n, mean1=m1, sd1=s1, within1SD_1=a1, mean2=m2, sd2=s2, within1SD_2=a2, within2SD_2=b2, W1=rW[0], P1=rP[0], W2=rW[1], P2=rP[1], reject2=rP[1] < 0.05, rOutput=v['rOutput'], rCode=rc)
    cmp_values(cid, v, exp)
    need(c['answerName'] == 'Shapiro-Wilk W (sample 2)' and close(c['answer'], rW[1]), f'{cid}: answer')
    need(c['lookup'] is None, f'{cid}: lookup should be null')
    # percentages in work lines
    w3 = ' '.join(c['steps'][2]['work']); w6 = ' '.join(c['steps'][5]['work'])
    need(f'\\frac{{{a1}}}{{10}}' in w3 and f'\\frac{{{b1}}}{{10}}' in w3 and f'\\frac{{{a2}}}{{10}}' in w6 and f'\\frac{{{b2}}}{{10}}' in w6, f'{cid}: range counts in work lines')
    return dict(W2=rW[1], P2=rP[1], s2=s2, x2=x2, reject=rP[1] < 0.05)

def mw_groups(c):
    rows = c['table']['rows']; names = list(dict.fromkeys(r[0] for r in rows))
    g1 = [r[1] for r in rows if r[0] == names[0]]; g2 = [r[1] for r in rows if r[0] == names[1]]
    S, B = (g1, g2) if len(g1) <= len(g2) else (g2, g1)
    allv = np.array([r[1] for r in rows], float); rk = stats.rankdata(allv)
    need(np.allclose(rk, [float(r[2]) for r in rows]), f"{c['id']}: rank column of the table is wrong")
    rS = stats.rankdata(np.array(S + B, float))
    return S, B, rS

def check_mwtable(c):
    cid = c['id']; S, B, r = mw_groups(c); nS, nB = len(S), len(B); N = nS + nB
    need(nB <= 8, f'{cid}: n_B must be <= 8')
    T = r[:nS].sum(); mu = nS * (N + 1) / 2
    U = stats.mannwhitneyu(S, B).statistic; need(close(T, U + nS * (nS + 1) / 2), f'{cid}: T vs SciPy U')
    (lo, hi, p05), (lo1, hi1, p01) = MW_TABLE[(nS, nB)]
    for l_, h_, p_ in ((lo, hi, p05), (lo1, hi1, p01)):
        ex_ = mw_table_P(nS, nB, l_, h_)
        if (nS, nB, l_, h_) in KNOWN_MISPRINT: need(abs(ex_ - KNOWN_MISPRINT[(nS, nB, l_, h_)]) < 1e-6, f'{cid}: known misprint check')
        else: need(abs(ex_ - p_) < 0.001, f'{cid}: printed critical values {l_},{h_} P={p_} vs exact no-tie P {ex_}')
    ex, ncomb = exact_mw(S, B); reject = T <= lo or T >= hi
    v = c['values']; ks = [k for k in v if isinstance(v[k], list) and len(v[k]) in (nS, nB) and k not in ('critical', 'critical01')]
    exp = {ks[0]: S, ks[1]: B} if len(v[ks[0]]) == nS else {ks[0]: B, ks[1]: S}
    exp.update(nS=nS, nB=nB, T=T, muT=mu, combinations=math.comb(N, nS), critical=[lo, hi], critical01=[lo1, hi1], tableP=p05, exactP=ex, reject=reject)
    need(ncomb == math.comb(N, nS), f'{cid}: combinations')
    cmp_values(cid, v, exp)
    need(c['answerName'] == 'Rank sum T' and close(c['answer'], T), f'{cid}: answer')
    lk = c['lookup']; need(lk['value'] == f'{lo}, {hi}' and lk['row'] == f'n_S = {nS}, n_B = {nB}' and lk['page'] == 1 and lk['path'].endswith('MannWhitney_RankSumT_Table.pdf') and f'P = {p05:.3f}'.replace('0.', '.') in lk['column'], f'{cid}: lookup')
    need(c['steps'][4].get('tableLookup') == lk, f'{cid}: step lookup')
    last = c['steps'][-1]['work'][-1]
    if reject:
        need(not (T <= lo1 or T >= hi1) and last == f'{p01:.3f}<P<{p05:.3f}' and p01 < ex < p05 + 0.01, f'{cid}: P bracket {last} (exact {ex})')
    else:
        need(last == f'P>{p05:.3f}' and ex > p05, f'{cid}: P bracket {last}')
    return dict(T=T, mu=mu, ex=ex, reject=reject)

def check_mwnormal(c):
    cid = c['id']; S, B, r = mw_groups(c); nS, nB = len(S), len(B); N = nS + nB
    need(nB > 8, f'{cid}: n_B must be > 8')
    T = r[:nS].sum(); mu = nS * (N + 1) / 2
    tau = [t for t in Counter(S + B).values() if t > 1]; ts = sum((t - 1) * t * (t + 1) for t in tau)
    need(len(tau) > 0, f'{cid}: should contain ties')
    v0 = nS * nB * (N + 1) / 12; sig = (v0 - nS * nB / (12 * N * (N - 1)) * ts) ** .5   # N - 1 form
    z = (abs(T - mu) - .5) / sig
    # SciPy's asymptotic test uses the same tie correction and continuity correction
    sp = stats.mannwhitneyu(S, B, method='asymptotic', use_continuity=True)
    need(close(sp.pvalue, 2 * stats.norm.sf(z), 1e-9), f'{cid}: z_T disagrees with SciPy tie-corrected P')
    ex, _ = exact_mw(S, B); reject = z > 1.96
    v = c['values']; ks = [k for k in v if isinstance(v[k], list)]
    exp = {ks[0]: S, ks[1]: B} if len(v[ks[0]]) == nS else {ks[0]: B, ks[1]: S}
    exp.update(nS=nS, nB=nB, T=T, muT=mu, tieSum=ts, varianceNoTies=v0, sigmaT=sig, zT=z, critical=1.96, exactP=ex, reject=reject)
    cmp_values(cid, v, exp)
    need(c['answerName'] == 'z_T statistic' and close(c['answer'], z), f'{cid}: answer')
    need(c['steps'][-1]['work'][-1] == zbracket_line(z), f'{cid}: P bracket')
    need(any('12N(N-1)' in g for s in c['steps'] for g in s['general']) and not any('N+1)}\\sum' in g or '12N(N+1)' in g for s in c['steps'] for g in s['general']), f'{cid}: tie term must use N - 1')
    return dict(T=T, mu=mu, ts=ts, v0=v0, sig=sig, z=z, reject=reject, N=N, nS=nS, nB=nB)

def w_data(c):
    rows = c['table']['rows']; b = np.array([r[1] for r in rows], float); a = np.array([r[2] for r in rows], float); d = a - b
    need(np.allclose(d, [r[3] for r in rows]), f"{c['id']}: difference column")
    dn = d[d != 0]; rk = stats.rankdata(np.abs(dn))
    need(np.allclose(rk, [float(r[4]) for r in rows if r[3] != 0]) and np.allclose(np.sign(dn) * rk, [float(r[5]) for r in rows if r[3] != 0]), f"{c['id']}: rank columns")
    need(all(r[4] == 'dropped' for r in rows if r[3] == 0), f"{c['id']}: zero rows must be dropped")
    return b, a, d, dn, rk

def check_wtable(c):
    cid = c['id']; b, a, d, dn, rk = w_data(c); n = len(dn); W = (np.sign(dn) * rk).sum()
    need(n <= 8, f'{cid}: n must be <= 8')
    Wplus = rk[dn > 0].sum(); spW = stats.wilcoxon(a, b, zero_method='wilcox', method='approx').statistic
    need(close(min(Wplus, rk.sum() - Wplus), spW), f'{cid}: W+ vs SciPy')
    for c_, p_ in W_TABLE[n]:
        need(abs(w_table_P(n, c_) - p_) < 0.001, f'{cid}: printed W critical value {c_} P={p_} vs exact no-tie P {w_table_P(n, c_)}')
    # the 0.05-level cutoff is the smallest printed value whose P does not exceed 0.05 (row n = 7: 24, P = .046)
    c1, p1 = min((c_, p_) for c_, p_ in W_TABLE[n] if p_ <= 0.05)
    ex, npat = exact_w(dn); reject = abs(W) >= c1
    exp = dict(before=list(b), after=list(a), differences=list(d), n=n, W=W, patterns=npat, critical=c1, exactP=ex, reject=reject)
    cmp_values(cid, c['values'], exp)
    need(c['answerName'] == 'Signed-rank sum W' and close(c['answer'], W), f'{cid}: answer')
    lk = c['lookup']; need(lk['value'] == c1 and lk['row'] == f'n = {n}' and lk['page'] == 1 and lk['path'].endswith('WilcoxonW_Table.pdf') and f'P = {p1:.3f}'.replace('0.', '.') in lk['column'], f'{cid}: lookup')
    need(c['steps'][4].get('tableLookup') == lk, f'{cid}: step lookup')
    last = c['steps'][-1]['work'][-1]
    need(last == (f'P<{p1:.3f}' if reject else f'P>{p1:.3f}'), f'{cid}: P line')
    need((ex < p1 + 0.001) if reject else (ex > p1), f'{cid}: exact P {ex} inconsistent with the bracket')
    return dict(W=W, n=n, d=d, dn=dn, reject=reject, zeros=int((d == 0).sum()))

def check_wnormal(c):
    cid = c['id']; b, a, d, dn, rk = w_data(c); n = len(dn); W = (np.sign(dn) * rk).sum()
    need(n > 8, f'{cid}: n must be > 8')
    tau = [t for t in Counter(np.abs(dn)).values() if t > 1]; ts = sum((t - 1) * t * (t + 1) for t in tau)
    v0 = n * (n + 1) * (2 * n + 1) / 6; sig = (v0 - ts / 12) ** .5; z = (abs(W) - .5) / sig
    # SciPy works on W+ (= (W + n(n+1)/2)/2), whose continuity correction is half of ours, so compare the
    # uncorrected z, |W|/sigma_W, which checks the tie-corrected sigma_W independently
    sp = stats.wilcoxon(a, b, zero_method='wilcox', correction=False, method='approx')
    need(close(stats.norm.isf(sp.pvalue / 2), abs(W) / sig, 1e-8), f'{cid}: sigma_W disagrees with SciPy tie-corrected variance')
    reject = z > 1.96
    exp = dict(before=list(b), after=list(a), differences=list(d), n=n, W=W, tieSum=ts, varianceNoTies=v0, sigmaW=sig, zW=z, critical=1.96,
               exactNormalP=2 * stats.norm.sf(z), pairedT=stats.ttest_rel(a, b).statistic, reject=reject)
    cmp_values(cid, c['values'], exp)
    need(c['answerName'] == 'z_W statistic' and close(c['answer'], z), f'{cid}: answer')
    need(c['steps'][-1]['work'][-1] == zbracket_line(z), f'{cid}: P bracket')
    return dict(W=W, n=n, ts=ts, v0=v0, sig=sig, z=z, reject=reject, zeros=int((d == 0).sum()))

R = {}; ids = set()
for c in D['cases']:
    cid = c['id']
    need(cid.startswith('n24-') and cid not in ids, f'{cid}: id'); ids.add(cid)
    need(c['topic'] in METHODS and c['module'] == 24 and c['source'] == 'Original neuroscience practice example', f'{cid}: topic/module/source')
    refs = REFKEYS[c['topic']]
    need(any(set(c.keys()) == rk for rk, _, _ in refs), f'{cid}: case keys differ from ref')
    need(len(c['steps']) >= max(n for _, _, n in refs), f'{cid}: fewer steps than the ref case')
    need(close(c['tolerance'], max(0.005 * abs(c['answer']), 0.001)), f'{cid}: tolerance')
    for s in c['steps']: need(s['general'] and s['work'] and s['words'], f'{cid}: empty step part')
    check_text(c); check_work_arith(cid, c['steps'])
    R[cid] = {'s24normal': check_normal, 's24mwtable': check_mwtable, 's24mwnormal': check_mwnormal, 's24wtable': check_wtable, 's24wnormal': check_wnormal}[c['topic']](c)

cnt = Counter(c['topic'] for c in D['cases'])
need(all(cnt[m] == 2 for m in METHODS) and len(D['cases']) == 10 and len(D['questions']) == 10, f'need two cases per method and 10 questions {cnt}')
need(sum(1 for c in D['cases'] if not R[c['id']]['reject']) >= 2, 'outcome mix')
need(any(R[c['id']].get('zeros', 0) > 0 for c in D['cases']), 'a Wilcoxon case must drop a zero difference')
need(any(c['topic'] == 's24normal' and R[c['id']]['reject'] for c in D['cases']), 'a Normality case must fail Shapiro-Wilk')
need(len({c['title'] for c in D['cases']}) == 10, 'titles unique')

# ---------------------------------------------------------------- questions
def optval(q): return float(re.search(r'\\\((-?[0-9.]+)\\\)', q['options'][q['correct']])[1])
qids = set()
for i, q in enumerate(D['questions'], 1):
    qid = q['id']
    need(qid == 'm2-n24-qa%02d' % i and qid not in qids, f'{qid}: id'); qids.add(qid)
    need(q['module'] == 24 and q['topic'] in METHODS, f'{qid}: module/topic')
    need(len(q['options']) == 4 and len(set(q['options'])) == 4 and q['correct'] in (0, 1, 2, 3), f'{qid}: options')
    need(q['case'] is None or q['case'] in ids, f'{qid}: case')
    need(isinstance(q['equations'], list) and q['why'], f'{qid}: why/equations')
    need(not re.search(r'\bpicture|professor|lecture|slide', q['stem'] + q['why'], re.I), f'{qid}: banned word')
    if q['case']: need(q['topic'] == [c['topic'] for c in D['cases'] if c['id'] == q['case']][0], f'{qid}: topic does not match its case')
need(len({q['correct'] for q in D['questions']}) == 4, 'correct index should vary over 0-3')
need(sum(1 for q in D['questions'] if q['case']) == 6, 'six numeric questions')
Q = {q['id']: q for q in D['questions']}
expq = {'m2-n24-qa01': float(np.std(R['n24-sleep-latency-normality']['x2'], ddof=1)),
        'm2-n24-qa02': R['n24-nerve-block-pain-ranksum']['T'],
        'm2-n24-qa03': R['n24-smoking-craving-ranksum']['sig'],
        'm2-n24-qa04': R['n24-concussion-reaction-time-ranksum']['z'],
        'm2-n24-qa06': R['n24-back-pain-mindfulness-signedrank']['z']}
for k, v in expq.items():
    need(close(optval(Q[k]), v, 6e-6), f'{k}: keyed option {optval(Q[k])} != {v}')
# distractor that encodes the slide's N + 1 misprint
cr = R['n24-smoking-craving-ranksum']; wrongN1 = (cr['v0'] - cr['nS'] * cr['nB'] / (12 * cr['N'] * (cr['N'] + 1)) * cr['ts']) ** .5
need(any(close(float(re.search(r'\\\(([0-9.]+)\\\)', o)[1]), wrongN1, 6e-6) for o in Q['m2-n24-qa03']['options']), 'qa03: N+1 distractor')
tn = R['n24-tinnitus-sound-therapy-signedrank']
need(Q['m2-n24-qa05']['options'][Q['m2-n24-qa05']['correct']] == f"n = {tn['n']} and W = {int(tn['W'])}", 'qa05 keyed option')
d9 = np.array(tn['d']); rk9 = stats.rankdata(np.abs(d9)); need(f"W = {int((np.sign(d9) * rk9).sum())}" in ' '.join(Q['m2-n24-qa05']['options']), 'qa05 zero-kept distractor')

if errors:
    print('\n'.join(errors)); print(f'{len(errors)} PROBLEMS'); sys.exit(1)
print(f'session24a OK: {len(D["cases"])} cases, {len(D["questions"])} questions, all values recomputed')
