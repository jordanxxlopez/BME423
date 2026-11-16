"""Checks authoring/module2/neuro/session22a.json.

Every answer and every entry of `values` is recomputed with NumPy from the raw
inputs (the case table plus the stated new object / initial centroids), not from
the work lines. Every numeric work line is also re-evaluated. Session 22 has no
printed critical values, so every `lookup` must be null. Exits 0 when all pass.
"""
import json, math, os, re, sys
import numpy as np
from scipy.spatial.distance import cdist, minkowski

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session22a.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session22.json'), encoding='utf-8'))
METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {c['topic']: set(c.keys()) for c in REF['cases']}
REFSTEPS = {}
for c in REF['cases']:
    REFSTEPS[c['topic']] = min(REFSTEPS.get(c['topic'], 99), len(c['steps']))
errors = []


def err(*a):
    errors.append(' '.join(str(x) for x in a))


def close(a, b, t=1e-9):
    return abs(float(a) - float(b)) <= t + 1e-12


def same(cid, key, got, exp, t=1e-9):
    if isinstance(exp, (list, tuple, np.ndarray)):
        exp = list(np.asarray(exp).tolist())
        if len(got) != len(exp):
            return err(cid, key, 'length', got, exp)
        for g, e in zip(got, exp):
            same(cid, key, g, e, t)
    elif isinstance(exp, str):
        if got != exp:
            err(cid, key, got, '!=', exp)
    else:
        if not close(got, exp, t):
            err(cid, key, got, '!=', exp)


def lloyd_step(X, C):
    d = cdist(X, C)
    srt = np.sort(d, axis=1)
    assert np.all(srt[:, 1] - srt[:, 0] > 1e-9), 'tie between centroids'
    lab = d.argmin(axis=1)
    newC = np.array([X[lab == j].mean(axis=0) for j in range(len(C))])
    return d, lab + 1, newC


def check_values(c):
    cid, v, rows, topic = c['id'], c['values'], c['table']['rows'], c['topic']
    seen = set()

    def chk(key, exp, t=1e-9):
        seen.add(key)
        if key not in v:
            return err(cid, 'missing values key', key)
        same(cid, key, v[key], exp, t)

    if topic == 's22idea':
        new = np.array(v['newEpoch'], float); seen.add('newEpoch')
        if not all(str(n) in c['context'] for n in v['newEpoch']):
            err(cid, 'new object not in context')
        d = {r[0]: float(np.linalg.norm(np.array(r[1:3], float) - new)) for r in rows}
        for k, x in d.items():
            chk(k, x)
        near = min(d, key=d.get)
        chk('nearest', near)
        chk('assigned', {r[0]: r[3] for r in rows}[near])
        ans = d[near]
    elif topic == 's22distance':
        q, r = np.array(rows[0][1:], float), np.array(rows[1][1:], float)
        chk('q', q); chk('r', r)
        e, m, k3 = minkowski(q, r, 2), minkowski(q, r, 1), minkowski(q, r, 3)
        chk('euclidean', e); chk('manhattan', m); chk('minkowski3', k3)
        if not (m >= e >= k3):
            err(cid, 'ordering')
        ans = {'Distance (Euclidean)': e, 'Distance (Manhattan)': m, 'Distance (Minkowski, p = 3)': k3}[c['answerName']]
    elif topic == 's22kmeans' and 'iterations' in v:
        x = np.array([r[0] for r in rows], float).reshape(-1, 1)
        chk('vot', x.ravel()); chk('k', 2)
        C0 = np.array(v['initial'], float).reshape(-1, 1); seen.add('initial')
        for r in rows:  # table distance columns
            if not (float(r[1]) == C0[0, 0] and float(r[2]) == C0[1, 0] and float(r[3]) == abs(r[0] - C0[0, 0]) and float(r[4]) == abs(r[0] - C0[1, 0])):
                err(cid, 'table row', r)
        d1, l1, C1 = lloyd_step(x, C0)
        same(cid, 'table labels', [r[5] for r in rows], l1)
        chk('iter1Labels', l1); chk('iter1Centroids', C1.ravel())
        d2, l2, C2 = lloyd_step(x, C1)
        chk('iter2Labels', l2); chk('iter2Centroids', C2.ravel())
        its, lab, Cc = 2, l2, C2
        while True:
            _, ln, Cn = lloyd_step(x, Cc); its += 1
            if np.array_equal(ln, lab):
                break
            lab, Cc = ln, Cn
        chk('iterations', its)
        if np.array_equal(l1, l2):
            err(cid, 'iteration 2 changes nothing')
        ans = C1[1, 0]
    elif topic == 's22kmeans':
        X = np.array([r[1:3] for r in rows], float)
        chk('points', X)
        C0 = np.array(v['initial'], float); seen.add('initial')
        for j in range(2):
            if f"= {int(C0[j, 0])}," not in c['tasks'][0] or f"= {int(C0[j, 1])})" not in c['tasks'][0]:
                err(cid, 'initial centroid not in task')
        d, lab, newC = lloyd_step(X, C0)
        chk('distC1', d[:, 0]); chk('distC2', d[:, 1]); chk('labels', lab)
        chk('newC1', newC[0]); chk('newC2', newC[1])
        m = re.match(r'New centroid C([12]) (\S+) coordinate', c['answerName'])
        ans = newC[int(m.group(1)) - 1][c['table']['headers'][1:].index(m.group(2))]
    elif topic == 's22withinss':
        x = np.array(v['latencies'], float); seen.add('latencies')
        if not all(str(int(n)) in c['context'] for n in x):
            err(cid, 'data not in context')

        def best(k):  # optimal 1-D k-means = best contiguous split of the sorted data
            xs = np.sort(x); n = len(xs); out = None
            import itertools
            for cuts in itertools.combinations(range(1, n), k - 1):
                g = np.split(xs, cuts)
                w = [float(((a - a.mean()) ** 2).sum()) for a in g]
                if out is None or sum(w) < sum(out[1]):
                    out = ([len(a) for a in g], w)
            return out
        tss = float(((x - x.mean()) ** 2).sum())
        s2, w2 = best(2); s3, w3 = best(3); s4, w4 = best(4)
        chk('ss1', w2[0]); chk('ss2', w2[1]); chk('totWithin', sum(w2)); chk('totalSS', tss, 1e-8)
        chk('between', tss - sum(w2), 1e-8); chk('totWithinK3', sum(w3)); chk('totWithinK4', sum(w4))
        tots = [tss, sum(w2), sum(w3), sum(w4)]
        drops = -np.diff(tots)
        chk('chosenK', 2)
        if not (drops[0] > 10 * drops[1] and drops[1] < 0.05 * tss):
            err(cid, 'elbow not at 2', drops)
        # table strings as R prints them (7 significant digits)
        for row, (sz, w) in zip(rows, [([len(x)], [tss]), (s2, w2), (s3, w3), (s4, w4)]):
            if [int(a) for a in row[1].split()] != sz:
                err(cid, 'size', row)
            if not all(close(float(a), b, 6e-6 * max(1, b)) for a, b in zip(row[2].split(), w)):
                err(cid, 'withinss', row, w)
            if not close(row[3], sum(w), 6e-5):
                err(cid, 'tot.withinss', row, sum(w))
        ans = sum(w2)
    elif topic == 's22knn':
        newkey = [k for k in v if k.startswith('new')][0]; seen.add(newkey)
        new = np.array(v[newkey], float)
        if not all(re.search(rf'\b{int(n)}\b', c['context']) for n in new):
            err(cid, 'new object not in context')
        names = [r[0] for r in rows]
        d = cdist(np.array([r[1:3] for r in rows], float), new.reshape(1, -1)).ravel()
        order = np.argsort(d)
        if np.min(np.diff(d[order])) < 1e-6:
            err(cid, 'tied distances')
        seen.add('distances'); seen.add('ranks')
        if set(v['distances']) != set(names) or set(v['ranks']) != set(names):
            err(cid, 'names')
        for i, nm in enumerate(names):
            same(cid, 'distances.' + nm, v['distances'][nm], d[i])
            same(cid, 'ranks.' + nm, v['ranks'][nm], int(np.where(order == i)[0][0]) + 1)
        chk('K', 3)
        nb = [names[i] for i in order[:3]]
        chk('neighbors', nb)
        cls = [rows[i][3] for i in order[:3]]
        win = max(set(cls), key=cls.count)
        p = cls.count(win) / 3
        pkey = [k for k in v if k.startswith('p')][0]
        if pkey[1:].lower() != win.lower():
            err(cid, 'probability key', pkey, win)
        chk(pkey, p)
        frac = f"Probability of {cls.count(win)}/3 that"
        if frac not in c['conclusion'] or f"classified as {win}" not in c['conclusion']:
            err(cid, 'conclusion text')
        if not (4 <= len(rows) <= 6 and len({r[3] for r in rows}) == 2):
            err(cid, 'training set shape')
        ans = p
    else:
        return err(cid, 'unknown topic', topic)
    extra = set(v) - seen
    if extra:
        err(cid, 'unchecked values keys', extra)
    same(cid, 'answer', c['answer'], ans)
    t = max(0.001, abs(ans) * 0.005)
    if not close(c['tolerance'], t, 1e-9):
        err(cid, 'tolerance', c['tolerance'], t)


# ---------- work-line arithmetic: every purely numeric side of an equality chain must agree
def to_py(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('\\ ', '')
    for _ in range(6):
        s = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s)
        s = re.sub(r'\\sqrt\{([^{}]*)\}', r'sqrt(\1)', s)
    s = s.replace('^{1/3}', '**(1/3)')
    s = re.sub(r'\^(\d)', r'**\1', s)
    s = re.sub(r'\|([^|]+)\|', r'abs(\1)', s)
    return s


def numeric(s):
    p = to_py(s)
    if not re.fullmatch(r'[0-9+\-*/(). ]*((sqrt|abs)[0-9+\-*/(). ]*)*', p) or not re.search(r'\d', p):
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


NWORK = 0


def check_work(cid, line):
    global NWORK
    m = re.fullmatch(r'C_\d=\\left\((\\frac\{[^{}]*\}\{\d+\}),(\\frac\{[^{}]*\}\{\d+\})\\right\)=\(([\d.]+),([\d.]+)\)', line)
    if m:  # centroid written as a pair of means
        NWORK += 1
        if abs(numeric(m.group(1)) - float(m.group(3))) > 5e-6 or abs(numeric(m.group(2)) - float(m.group(4))) > 5e-6:
            err(cid, 'work centroid pair', line)
        return
    m = re.fullmatch(r'y_\d=[12]\\ \(([\d.]+)<([\d.]+)\)', line)
    if m:  # label line with its two distances
        NWORK += 1
        if not float(m.group(1)) < float(m.group(2)):
            err(cid, 'work comparison false', line)
        return
    for part in split_top(line, ',\\ '):
        part = re.sub(r'\\Rightarrow.*$', '', part)
        part = re.sub(r'\\ \(\\text\{[^}]*\}\)$', '', part)
        for rel, op in (('\\ge', lambda a, b: a >= b), ('<', lambda a, b: a < b), ('\\to', lambda a, b: a > b)):
            if rel in part and '=' not in part:
                nums = [numeric(re.sub(r'^[A-Za-z]\\ \(|^\(|\)$', '', p.strip()) if rel == '<' else p) for p in part.split(rel)]
                if rel == '<' and '\\text' in part:
                    nums = [float(m) for m in re.findall(r'\(([\d.]+)\)', part)]
                if all(n is not None for n in nums) and len(nums) > 1:
                    NWORK += 1
                    if not all(op(a, b) for a, b in zip(nums, nums[1:])):
                        err(cid, 'work relation false', line)
        sides = [numeric(x) for x in split_top(part, '=')]
        vals = [x for x in sides if x is not None]
        if len(vals) > 1:
            NWORK += 1
            if any(abs(a - vals[0]) > 5e-5 * max(1, abs(vals[0]) / 100) for a in vals[1:]):
                err(cid, 'work arithmetic', line, vals)


BAN = re.compile(r'[:;]|\bpicture\b|\bprofessor\b|\blecture\b|\bslide\b|\bsession\b', re.I)
BAN_WORDS = re.compile(r'\bpicture\b|\bprofessor\b|\blecture\b|\bslide\b|\bsession\b', re.I)
ids = set()
for c in D['cases']:
    cid = c['id']
    if cid in ids or not cid.startswith('n22-'):
        err(cid, 'id')
    ids.add(cid)
    if c['topic'] not in METHODS:
        err(cid, 'topic')
    if set(c.keys()) != REFKEYS[c['topic']]:
        err(cid, 'key set differs from ref', set(c.keys()) ^ REFKEYS[c['topic']])
    if len(c['steps']) < REFSTEPS[c['topic']]:
        err(cid, 'too few steps')
    if c['source'] != 'Original neuroscience practice example' or c['module'] != 22 or c['lookup'] is not None or c['hypotheses'] is not None:
        err(cid, 'fixed fields')
    # context and tasks keep the exercise's own punctuation ("differences in scale; the scaled
    # data are unitless", "initial centroids:", "(training set):"), so colons and semicolons are
    # allowed there. They stay banned in the conclusion and the step words.
    for txt in [c['context']] + c['tasks']:
        if BAN_WORDS.search(txt):
            err(cid, 'banned wording', BAN_WORDS.search(txt).group(0), '::', txt[:70])
    for txt in [c['conclusion']] + [s['words'] for s in c['steps']]:
        if BAN.search(txt):
            err(cid, 'banned wording', BAN.search(txt).group(0), '::', txt[:70])
    for s in c['steps']:
        if not (s['title'] and s['general'] and s['work'] and s['words']):
            err(cid, 'empty step part')
        for w in s['work']:
            check_work(cid, w)
    check_values(c)

from collections import Counter
cnt = Counter(c['topic'] for c in D['cases'])
if cnt != Counter({'s22idea': 1, 's22distance': 2, 's22kmeans': 3, 's22withinss': 1, 's22knn': 3}):
    err('topic counts', cnt)

qids = set()
for i, q in enumerate(D['questions'], 1):
    if q['id'] != f'm2-n22-qa{i:02d}' or q['id'] in qids:
        err(q['id'], 'question id')
    qids.add(q['id'])
    if q['module'] != 22 or q['topic'] not in METHODS:
        err(q['id'], 'module/topic')
    if len(q['options']) != 4 or len(set(q['options'])) != 4 or q['correct'] not in range(4):
        err(q['id'], 'options')
    if q['case'] is not None and q['case'] not in ids:
        err(q['id'], 'case')
    if not q['why'] or not q['equations']:
        err(q['id'], 'why/equations')
if len(D['questions']) != 10 or len(D['cases']) != 10:
    err('counts')
if len({q['correct'] for q in D['questions']}) < 4:
    err('correct index not varied')

# numeric questions: recompute the keyed option from the raw case tables
C = {c['id']: c for c in D['cases']}
num = lambda s: float(re.sub(r'[\\() ]', '', s))
Q = {q['id']: q for q in D['questions']}
key = lambda i: Q[f'm2-n22-qa{i:02d}']['options'][Q[f'm2-n22-qa{i:02d}']['correct']]
tb = lambda cid: C[cid]['table']['rows']
r = tb('n22-fricative-distance'); same('qa02', 'key', num(key(2)), minkowski(r[0][1:], r[1][1:], 2), 6e-6)
r = tb('n22-odor-glomeruli-distance'); same('qa03', 'key', num(key(3)), minkowski(r[0][1:], r[1][1:], 1), 6e-6)
x = np.array([a[0] for a in tb('n22-vot-kmeans')], float).reshape(-1, 1)
same('qa04', 'key', num(key(4)), lloyd_step(x, np.array([[10.], [40.]]))[2][1, 0], 6e-6)
X = np.array([a[1:3] for a in tb('n22-talker-pitch-kmeans')], float)
nc = lloyd_step(X, np.array([[2., 2.], [6., 5.]]))[2][1]
if key(5) != f'\\(({nc[0]:g},{nc[1]:g})\\)':
    err('qa05 key', key(5), nc)
same('qa07', 'key', num(key(7)), C['n22-saccade-latency-withinss']['values']['between'], 6e-4)
if key(9) != '\\(2/3\\)' or not close(C['n22-neuron-type-knn']['answer'], 2 / 3):
    err('qa09 key')
nnum = sum(1 for q in D['questions'] if q['case'])
if nnum != 6:
    err('numeric question count', nnum)

if NWORK < 60:
    err('too few work lines were evaluated', NWORK)
if errors:
    print('\n'.join(errors)); print(f'FAILED: {len(errors)} problems'); sys.exit(1)
print(f'session22a OK: {len(D["cases"])} cases, {len(D["questions"])} questions, {NWORK} numeric work lines re-evaluated, no printed critical values in this session')
