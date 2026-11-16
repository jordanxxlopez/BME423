"""Checks authoring/module2/neuro/session17b.json.
Recomputes every case from the raw table inputs with NumPy/SciPy, checks the printed
critical values against SciPy, re-evaluates the arithmetic of every work line, and lints
ids, topics, key sets and wording. Exits 0 only if everything agrees."""
import json, math, os, re, sys
import numpy as np
from scipy import stats

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session17b.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session17.json'), encoding='utf-8'))
errors = []
def err(*a): errors.append(' '.join(str(x) for x in a))
def close(a, b, rel=1e-9, ab=1e-12): return abs(a - b) <= max(ab, rel * max(abs(a), abs(b)))

METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {}
for c in REF['cases']:
    REFKEYS.setdefault(c['topic'], set(c.keys()))
REFKEYS['twoMeans'] = set(next(c for c in REF['cases'] if c['id'] == 'ci-urine').keys())
REFVAL = {t: set(next(c for c in REF['cases'] if c['topic'] == t)['values'].keys()) for t in REFKEYS}
REFSTEPS = {t: min(len(c['steps']) for c in REF['cases'] if c['topic'] == t) for t in REFKEYS}

def printed_t(df, alpha):
    """Value a 3-decimal two-tailed t table prints."""
    return round(float(stats.t.ppf(1 - alpha / 2, df)), 3)

def check_values(c, got):
    v = c['values']
    for k, x in got.items():
        if k not in v: err(c['id'], 'values missing', k); continue
        if isinstance(x, bool):
            if v[k] is not x: err(c['id'], 'values', k, v[k], '!=', x)
        elif not close(float(v[k]), float(x), rel=1e-9): err(c['id'], 'values', k, v[k], '!=', x)
    for k in v:
        if k not in got: err(c['id'], 'values has unchecked key', k)
    if abs(c['answer'] - got['lower']) > c['tolerance']: err(c['id'], 'answer', c['answer'], got['lower'])
    if c['answerName'] != 'Lower endpoint': err(c['id'], 'answerName')
    if c['tolerance'] < 0.001 or c['tolerance'] > max(0.002, 0.006 * abs(c['answer'])): err(c['id'], 'tolerance', c['tolerance'])

def check_lookup(c, alpha, df=None):
    lk = c['lookup']; step = [s for s in c['steps'] if 'tableLookup' in s]
    if len(step) != 1 or step[0]['tableLookup'] != lk: err(c['id'], 'step tableLookup differs from case lookup')
    if lk['path'] != 'sources/tables/t_table.pdf' or lk['column'] != f'{alpha:.2f}': err(c['id'], 'lookup path/column')
    z = float(stats.norm.ppf(1 - alpha / 2))
    if df is None:  # Normal reference from the infinity row
        if lk['row'] != 'infinity' or lk['page'] != 2 or not lk.get('normalReference') or abs(lk['value'] - z) > 0.0005: err(c['id'], 'z lookup', lk)
    elif df <= 200:
        if lk['row'] != str(df) or lk['actualDf'] != df or lk['approximation'] or lk['page'] != (1 if df <= 46 else 2): err(c['id'], 't lookup row', lk)
        if not (df <= 40 or df % 2 == 0): err(c['id'], 'df is not a printed row', df)
        if abs(lk['value'] - printed_t(df, alpha)) > 0.0011: err(c['id'], 't value', lk['value'], printed_t(df, alpha))
    else:
        if lk['row'] != 'infinity' or lk['actualDf'] != df or not lk['approximation'] or lk['page'] != 2: err(c['id'], 'large-df lookup', lk)
        if abs(lk['value'] - z) > 0.0005: err(c['id'], 'infinity value', lk['value'])
        exact = float(stats.t.ppf(1 - alpha / 2, df))
        if abs(exact - lk['value']) > 0.005: err(c['id'], 'infinity row too far from exact t', exact)
    if c['values']['critical'] != lk['value']: err(c['id'], 'critical != lookup value')

for c in D['cases']:
    t = c['topic']; rows = c['table']['rows']; v = c['values']
    if t not in REFKEYS: err(c['id'], 'bad topic', t); continue
    want = set(REFKEYS[t])
    extra = set(c.keys()) - want - {'alternativeTableAnswer'}
    if extra or want - set(c.keys()): err(c['id'], 'key set differs from ref', extra, want - set(c.keys()))
    if set(v.keys()) != REFVAL[t]: err(c['id'], 'values key set differs from ref', set(v.keys()) ^ REFVAL[t])
    if len(c['steps']) < REFSTEPS[t]: err(c['id'], 'too few steps')
    if c['source'] != 'Original neuroscience practice example' or c['module'] != 17: err(c['id'], 'source/module')
    conf = v['confidence']; alpha = round(1 - conf, 2)
    if t == 'oneMean':
        n, x, sd = rows[0]
        df = n - 1; tc = c['lookup']['value']; check_lookup(c, alpha, df)
        se = sd / np.sqrt(n); M = tc * se
        check_values(c, dict(n=n, x=x, sd=sd, confidence=conf, df=df, se=se, critical=tc, margin=M, lower=x - M, upper=x + M))
        lo, hi = stats.t.interval(conf, df, loc=x, scale=se)   # exact interval, table rounding only
        if abs(lo - (x - M)) > 0.002 * se * 3 or abs(hi - (x + M)) > 0.002 * se * 3: err(c['id'], 'scipy interval', lo, hi)
    elif t == 'twoMeans':
        (g1, n1, x1, s1), (g2, n2, x2, s2) = rows
        df = n1 + n2 - 2; tc = c['lookup']['value']; check_lookup(c, alpha, df)
        var = ((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / df
        se = np.sqrt(var / n1 + var / n2); d = x1 - x2; M = tc * se; L = d - M; U = d + M
        check_values(c, dict(n1=n1, n2=n2, x1=x1, x2=x2, s1=s1, s2=s2, confidence=conf, df=df, variance=var, se=se, critical=tc,
                             difference=d, margin=M, lower=L, upper=U, reject=bool(not (L <= 0 <= U))))
        r = stats.ttest_ind_from_stats(x1, s1, n1, x2, s2, n2, equal_var=True)   # independent route
        if not close(r.statistic, d / se, rel=1e-9): err(c['id'], 'pooled SE disagrees with scipy t')
        if (r.pvalue < alpha) != v['reject']: err(c['id'], 'decision disagrees with scipy p', r.pvalue)
        if 'alternativeTableAnswer' in c:
            a = c['alternativeTableAnswer']
            if df <= 200 or a['row'] != '200' or abs(a['critical'] - printed_t(200, alpha)) > 0.0011 or not close(a['lower'], d - a['critical'] * se): err(c['id'], 'alternativeTableAnswer')
            if ((d - a['critical'] * se) <= 0 <= (d + a['critical'] * se)) == v['reject']: err(c['id'], 'row 200 changes the decision')
        elif df > 200: err(c['id'], 'large df without alternativeTableAnswer')
    elif t == 'oneProportion':
        m, n, p0 = rows[0]
        zc = c['lookup']['value']; check_lookup(c, alpha)
        p = m / n; var = p * (1 - p); se = np.sqrt(var / n); M = zc * se; L = p - M; U = p + M
        check_values(c, dict(m=m, n=n, p=p, reference=p0, confidence=conf, variance=var, se=se, critical=zc, margin=M, lower=L, upper=U,
                             reject=bool(not (L <= p0 <= U))))
        if c['hypotheses']['null'] != f'H_0:p={p0:g}': err(c['id'], 'null hypothesis reference')
    elif t == 'twoProportions':
        (g1, m1, n1), (g2, m2, n2) = rows
        zc = c['lookup']['value']; check_lookup(c, alpha)
        p1 = m1 / n1; p2 = m2 / n2; pp = (m1 + m2) / (n1 + n2); var = pp * (1 - pp)
        se = np.sqrt(var * (1 / n1 + 1 / n2)); d = p1 - p2; M = zc * se; L = d - M; U = d + M
        check_values(c, dict(m1=m1, n1=n1, m2=m2, n2=n2, p1=p1, p2=p2, pooled=pp, variance=var, se=se, rawSE=se, difference=d, critical=zc,
                             confidence=conf, margin=M, lower=L, upper=U, reject=bool(not (L <= 0 <= U))))
        chi2 = stats.chi2_contingency([[m1, n1 - m1], [m2, n2 - m2]], correction=False)[0]   # pooled z squared
        if not close(chi2, (d / se) ** 2, rel=1e-9): err(c['id'], 'pooled SE disagrees with chi-square')
        if c.get('rounded') is not False: err(c['id'], 'rounded flag')
    # the conclusion and the decision step must quote the computed bounds and the right verdict
    for k in ('lower', 'upper'):
        s = f"{v[k]:.7g}"
        if s not in c['conclusion']: err(c['id'], 'conclusion lacks', s)
    if 'reject' in v:
        g = c['steps'][-1]['general'][0]
        if ('\\notin' in g) != v['reject']: err(c['id'], 'decision step sign')
        txt = c['conclusion']
        if v['reject'] != ('does not contain' in txt): err(c['id'], 'conclusion verdict wording')
        if v['reject'] != ('there is a difference' in txt or 'is different from' in txt and 'no evidence' not in txt): err(c['id'], 'conclusion difference wording')

# ---- arithmetic of every work line -------------------------------------------------
NUM = r'-?\d+(?:\.\d+)?'
def to_py(seg):
    s = seg.replace('\\left', '').replace('\\right', '').replace(' ', '')
    for _ in range(20):
        s2 = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s)
        s2 = re.sub(r'\\frac(\d)\{([^{}]*)\}', r'((\1)/(\2))', s2)
        s2 = re.sub(r'\\sqrt\{([^{}]*)\}', r'sqrt(\1)', s2)
        if s2 == s: break
        s = s2
    s = s.replace('^2', '**2')
    s = re.sub(r'(\d|\))\(', r'\1*(', s)
    s = s.replace('sqrt*(', 'sqrt(')
    if re.search(r'[A-Za-z\\{}_<>\[\],]', s.replace('sqrt', '')): return None
    return s
def evaluate(seg):
    s = to_py(seg)
    if s is None or not re.search(r'\d', s): return None
    try: return float(eval(s, {'__builtins__': {}}, {'sqrt': math.sqrt}))
    except Exception: return None
nwork = 0
def check_line(where, line):
    global nwork
    for part in re.split(r',\\quad|\\qquad', line):
        segs = re.split(r'\\approx|=', part)
        vals = [(s, evaluate(s)) for s in segs]
        vals = [(s, x) for s, x in vals if x is not None]
        if len(vals) < 2: continue
        nwork += 1
        scale = max([abs(float(n)) for s, _ in vals for n in re.findall(NUM, s)] + [abs(x) for _, x in vals])
        base = vals[-1][1]
        for s, x in vals:
            if abs(x - base) > 2e-6 * scale + 1e-12: err(where, 'work arithmetic', line, '::', s, '=', x, 'vs', base)
for c in D['cases']:
    for i, s in enumerate(c['steps']):
        for w in s['work']: check_line(f"{c['id']} step{i}", w)
        if not s['general'] or not s['work'] or not s['words']: err(c['id'], 'empty step part', i)
for q in D['questions']:
    for e in q['equations']: check_line(q['id'], e)

# ---- questions ---------------------------------------------------------------------
ids = [c['id'] for c in D['cases']]
if len(ids) != 10 or len(set(ids)) != 10 or any(not i.startswith('n17-') for i in ids): err('case ids')
if set(ids) & {c['id'] for c in REF['cases']}: err('id clashes with ref')
if len({c['title'] for c in D['cases']}) != 10: err('duplicate titles')
from collections import Counter
if Counter(c['topic'] for c in D['cases']) != Counter(oneMean=2, twoMeans=3, oneProportion=3, twoProportions=2): err('topic counts')
qs = D['questions']
if [q['id'] for q in qs] != [f'm2-n17-qb{i:02d}' for i in range(1, 11)]: err('question ids')
for q in qs:
    if q['module'] != 17 or q['topic'] not in METHODS: err(q['id'], 'module/topic')
    if len(q['options']) != 4 or len(set(q['options'])) != 4 or q['correct'] not in range(4): err(q['id'], 'options')
    if q['case'] is not None and q['case'] not in ids: err(q['id'], 'case')
    if q['case'] is not None and q['topic'] != next(c for c in D['cases'] if c['id'] == q['case'])['topic']: err(q['id'], 'topic differs from case')
    if not 1 <= len(re.findall(r'[.!?](?:\s|$)', q['why'])) <= 3: err(q['id'], 'why length')
if len({q['correct'] for q in qs}) < 4: err('correct index not varied')
if sum(q['case'] is not None for q in qs) != 6: err('numeric share')
# numeric keys recomputed from raw inputs
V = {c['id']: c for c in D['cases']}
def num(opt): return float(re.search(NUM, opt.replace('\\(', '')).group())
def keyed(qid, value):
    q = next(x for x in qs if x['id'] == qid); got = num(q['options'][q['correct']])
    if abs(got - value) > 5e-7 * max(1, abs(value)) * 10: err(qid, 'keyed option', got, 'expected', value)
    for i, o in enumerate(q['options']):
        if i != q['correct'] and abs(num(o) - value) <= 0.01 * abs(value): err(qid, 'distractor too close', o)
keyed('m2-n17-qb01', 23.6 / np.sqrt(16))
_v2 = (13 * 5.2 ** 2 + 12 * 6.1 ** 2) / 25
keyed('m2-n17-qb02', np.sqrt(_v2 / 14 + _v2 / 13))
if f"{_v2:.7g}" not in next(x for x in qs if x['id'] == 'm2-n17-qb02')['stem']: err('qb02 stem variance')
_sp = np.sqrt((411 * 236 ** 2 + 387 * 251 ** 2) / 798); _se = _sp * np.sqrt(1 / 412 + 1 / 388)
keyed('m2-n17-qb03', (1184 - 1231) - 1.96 * _se)
if f"{_se:.7g}" not in next(x for x in qs if x['id'] == 'm2-n17-qb03')['stem']: err('qb03 stem SE')
keyed('m2-n17-qb04', 1.96 * np.sqrt((268 / 480) * (1 - 268 / 480) / 480))
_p = 65 / 138; keyed('m2-n17-qb05', np.sqrt(_p * (1 - _p) * (1 / 70 + 1 / 68)))
keyed('m2-n17-qb06', 4.3 + printed_t(11, 0.01) * 1.9 / np.sqrt(12))

# ---- wording lint ------------------------------------------------------------------
def lint(where, s, strict=True):
    plain = re.sub(r'\\\(.+?\\\)', '', s)
    if strict and (':' in plain or ';' in plain): err(where, 'colon or semicolon ::', s[:90])
    if re.search(r'\bpicture', plain, re.I): err(where, 'word picture')
    if re.search(r'\b(professor|lecture|slide|session)\b', plain, re.I): err(where, 'banned reference ::', s[:90])
for c in D['cases']:
    for k in ('context', 'conclusion', 'title'): lint(c['id'] + ' ' + k, c[k])
    for t_ in c['tasks']: lint(c['id'] + ' task', t_)
    for s in c['steps']: lint(c['id'] + ' words', s['words']); lint(c['id'] + ' step title', s['title'])
    if c.get('hypotheses'):
        lint(c['id'] + ' hyp', c['hypotheses']['nullWords']); lint(c['id'] + ' hyp', c['hypotheses']['alternativeWords'])
    if 'Normally' not in c['context'] and c['topic'] in ('oneMean', 'twoMeans'): err(c['id'], 'Normally distributed tag missing')
    if re.search(r'\bnormal(ly)?\b', c['context']): err(c['id'], 'lower-case normal')
for q in qs:
    lint(q['id'] + ' stem', q['stem']); lint(q['id'] + ' why', q['why'])
    for o in q['options']: lint(q['id'] + ' option', o)

contain = [c['id'] for c in D['cases'] if c['values'].get('reject') is False]
print(f"cases {len(D['cases'])}, questions {len(qs)}, work/equation lines re-evaluated {nwork}, intervals containing the null {len(contain)}: {contain}")
if errors:
    print(f'{len(errors)} PROBLEMS'); [print(' -', e) for e in errors]; sys.exit(1)
print('session17b OK'); sys.exit(0)
