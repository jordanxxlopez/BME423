"""Checks authoring/module2/neuro/session23a.json.

Every answer and every entry of `values` is recomputed with NumPy from the raw
inputs (the case table plus the numbers stated in the context), not from the
work lines. Every numeric work line is also re-evaluated. Session 23 has no
printed critical values, so every `lookup` must be null. Exits 0 when all pass.
"""
import json, math, os, re, sys
from collections import Counter
import numpy as np
from scipy.special import expit

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session23a.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, 'ref', 'session23.json'), encoding='utf-8'))
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
    if isinstance(exp, dict):
        if set(got) != set(exp):
            return err(cid, key, 'keys', set(got) ^ set(exp))
        for k in exp:
            same(cid, f'{key}.{k}', got[k], exp[k], t)
    elif isinstance(exp, (list, tuple, np.ndarray)):
        exp = list(np.asarray(exp).tolist())
        if len(got) != len(exp):
            return err(cid, key, 'length', got, exp)
        for g, e in zip(got, exp):
            same(cid, key, g, e, t)
    elif isinstance(exp, str):
        if got != exp:
            err(cid, key, got, '!=', exp)
    elif not close(got, exp, t):
        err(cid, key, got, '!=', exp)


def ctx_num(c, pattern):
    m = re.search(pattern, c['context'])
    if not m:
        err(c['id'], 'context number not found', pattern)
        return float('nan')
    return float(m.group(1))


def cells(rows):
    (TN, FP), (FN, TP) = rows[0][1:3], rows[1][1:3]
    if rows[0][3] != TN + FP or rows[1][3] != FN + TP or rows[2][1:] != [TN + FN, FP + TP, TN + FP + FN + TP]:
        err('table totals', rows)
    return TN, FP, FN, TP


def check_values(c):
    cid, v, rows, topic = c['id'], c['values'], c['table']['rows'], c['topic']
    seen = set()

    def chk(key, exp, t=1e-9):
        seen.add(key)
        if key not in v:
            return err(cid, 'missing values key', key)
        same(cid, key, v[key], exp, t)

    if topic == 's23knn':
        K = int(re.search(r'Use a K-NN classification with K = (\d+)\.', c['tasks'][0]).group(1))
        chk('K', K)
        new = np.array(v['newSample'], float); seen.add('newSample')
        if not all(re.search(rf'\b{int(n)}\b', c['context']) for n in new):
            err(cid, 'new sample not in context')
        names = [r[0] for r in rows]
        X = np.array([r[1:3] for r in rows], float)
        d = np.sqrt(((X - new) ** 2).sum(axis=1))
        order = np.argsort(d)
        if np.min(np.diff(d[order])) < 1e-6:
            err(cid, 'tied distances')
        chk('distances', {nm: d[i] for i, nm in enumerate(names)})
        chk('neighbors', [names[i] for i in order[:K]])
        cls = [rows[i][3] for i in order[:K]]
        cnt = Counter(cls).most_common()
        if len(cnt) > 1 and cnt[0][1] == cnt[1][1]:
            err(cid, 'tied vote')
        win, k = cnt[0]
        chk('class', win)
        pkey = 'p' + win.replace('-', ' ').title().replace(' ', '')
        chk(pkey, k / K)
        if f'Probability of {k}/{K} that' not in c['conclusion'] or f'classified as {win}' not in c['conclusion']:
            err(cid, 'conclusion text')
        if '(training set):' not in c['context'] or 'Use the Euclidian distance formula for your calculations.' not in c['tasks'][0]:
            err(cid, 'course wording missing')
        ans = k / K
    elif topic == 's23scaling' and rows[0][0] == 'Min.':
        st = {r[0]: float(r[1]) for r in rows}
        mn, mx = st['Min.'], st['Max.']
        new = ctx_num(c, r'had an SBR of (\d+(?:\.\d+)?)\.')
        chk('min', mn); chk('max', mx); chk('mean', st['Mean']); chk('median', st['Median'])
        chk('range', mx - mn); chk('newValue', new)
        sc = lambda x: (x - mn) / (mx - mn)
        chk('scaledMean', sc(st['Mean'])); chk('scaledMedian', sc(st['Median'])); chk('scaledNew', sc(new))
        if not (st['Min.'] <= st['1st Qu.'] <= st['Median'] <= st['3rd Qu.'] <= st['Max.']):
            err(cid, 'summary order')
        ans = sc(new)
    elif topic == 's23scaling':
        x = np.array([r[1] for r in rows], float)
        new = ctx_num(c, r'had a PTA of ([\d.]+) dB HL')
        chk('data', x); chk('mean', x.mean()); chk('sumSq', ((x - x.mean()) ** 2).sum())
        sd = x.std(ddof=1)
        chk('sd', sd); chk('newValue', new)
        chk('zNew', (new - x.mean()) / sd); chk('zMin', (x.min() - x.mean()) / sd)
        ans = (new - x.mean()) / sd
    elif topic in ('s23confusion', 's23sensspec'):
        TN, FP, FN, TP = cells(rows)
        n = TN + FP + FN + TP
        for k, val in (('TN', TN), ('FP', FP), ('FN', FN), ('TP', TP), ('n', n)):
            chk(k, val)
        res = {'Accuracy': (TP + TN) / n, 'Sensitivity': TP / (TP + FN), 'Specificity': TN / (TN + FP)}
        chk('accuracy', res['Accuracy']); chk('sensitivity', res['Sensitivity']); chk('specificity', res['Specificity'])
        if 'errorRate' in v:
            chk('errorRate', (FP + FN) / n)
        if 'accuracyAlwaysPass' in v:
            chk('accuracyAlwaysPass', (TN + FP) / n)
            prev = (FN + TP) / n
            if not (prev < 0.01 and res['Accuracy'] > 0.95 and res['Sensitivity'] < 0.5 and (TN + FP) / n > res['Accuracy']):
                err(cid, 'not a rare-condition case')
        ans = res[c['answerName']]
    elif topic == 's23neuron' and 'SSE' in v:
        w = [ctx_num(c, rf'w{j} = (-?\d+(?:\.\d+)?)') for j in (1, 2, 3)]
        w0 = ctx_num(c, r'w0 = (-?\d+(?:\.\d+)?)')
        X = np.array([r[1:4] for r in rows], float); y = np.array([r[4] for r in rows], float)
        s = w0 + X @ np.array(w)
        yh = (s >= 0).astype(float)
        e = y - yh
        chk('weights', w); chk('bias', w0); chk('sums', s); chk('predictions', yh); chk('errors', e)
        chk('SSE', float((e ** 2).sum()))
        if np.min(np.abs(s)) < 1e-6:
            err(cid, 'net input on the threshold')
        ans = float((e ** 2).sum())
    elif topic == 's23neuron':
        w = np.array([r[1] for r in rows], float); x = np.array([r[2] for r in rows], float)
        for r in rows:
            if not close(r[3], r[1] * r[2], 1e-9):
                err(cid, 'product column', r)
        for j in range(3):
            if not close(w[j], ctx_num(c, rf'w{j+1} = (-?\d+(?:\.\d+)?)')) or not close(x[j], ctx_num(c, rf'x{j+1} = (\d+(?:\.\d+)?)')):
                err(cid, 'table vs context', j)
        w0 = ctx_num(c, r'w0 = (-?\d+(?:\.\d+)?)')
        w1l = ctx_num(c, r'the weight w1 was (\d+(?:\.\d+)?)\.')
        chk('weights', w); chk('inputs', x); chk('bias', w0)
        chk('weightedSum', w @ x); chk('netInput', w0 + w @ x); chk('output', expit(w0 + w @ x))
        chk('thresholdOutput', 1 if w0 + w @ x >= 0 else 0)
        w2 = w.copy(); w2[0] = w1l
        chk('w1LTP', w1l); chk('netInputLTP', w0 + w2 @ x); chk('outputLTP', expit(w0 + w2 @ x))
        ans = expit(w0 + w @ x)
    else:
        return err(cid, 'unknown topic', topic)
    extra = set(v) - seen
    if extra:
        err(cid, 'unchecked values keys', extra)
    same(cid, 'answer', c['answer'], ans)
    if not close(c['tolerance'], max(0.001, abs(ans) * 0.005), 1e-12):
        err(cid, 'tolerance', c['tolerance'])


# ---------- work-line arithmetic: every purely numeric side of an equality chain must agree
def to_py(s):
    s = s.replace('\\left', '').replace('\\right', '').replace('\\ ', '').replace('\\quad', '')
    for _ in range(6):
        s = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}', r'((\1)/(\2))', s)
        s = re.sub(r'\\sqrt\{([^{}]*)\}', r'sqrt(\1)', s)
        s = re.sub(r'e\^\{([^{}]*)\}', r'exp(\1)', s)
    s = re.sub(r'\^(\d)', r'**\1', s)
    s = re.sub(r'(\d|\))\(', r'\1*(', s)
    return s


def numeric(s):
    p = to_py(s).strip()
    if not p or not re.fullmatch(r'(?:[0-9+\-*/(). ]|sqrt|exp)*', p) or not re.search(r'\d', p):
        return None
    try:
        r = eval(p, {'__builtins__': {}}, {'sqrt': math.sqrt, 'exp': math.exp})
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


def check_work(c, line):
    global NWORK
    cid = c['id']
    if re.fullmatch(r'(?:[A-G]\\ \([\d.]+\)<)+[A-G]\\ \([\d.]+\)', line):  # ranking line
        NWORK += 1
        pairs = re.findall(r'([A-G])\\ \(([\d.]+)\)', line)
        ds = [float(b) for _, b in pairs]
        if any(a >= b for a, b in zip(ds, ds[1:])):
            err(cid, 'ranking not ascending', line)
        for nm, val in pairs:
            if abs(c['values']['distances'][nm] - float(val)) > 5e-6:
                err(cid, 'ranking value', nm, val)
        return
    m = re.fullmatch(r'([\d.]+)<([\d.]+)', line)
    if m:
        NWORK += 1
        if not float(m.group(1)) < float(m.group(2)):
            err(cid, 'work comparison false', line)
        return
    m = re.fullmatch(r'(?:\\hat y_\d=)?f\((-?[\d.]+)\)=([01])', line)
    if m:  # threshold activation
        NWORK += 1
        if int(m.group(2)) != (1 if float(m.group(1)) >= 0 else 0):
            err(cid, 'threshold output wrong', line)
        return
    for part in split_top(line, ',\\ '):
        sides = [numeric(x) for x in split_top(part, '=')]
        vals = [x for x in sides if x is not None]
        if len(vals) > 1:
            NWORK += 1
            if any(abs(a - vals[0]) > 5e-5 * max(1, abs(vals[0])) for a in vals[1:]):
                err(cid, 'work arithmetic', line, vals)


# context and tasks keep the course's own punctuation ("differences in scale; the scaled data
# are unitless", "(training set):"), so colons and semicolons are allowed there. They stay
# banned in the conclusion and the step words.
BAN = re.compile(r'[:;]|\bpicture\b|\bpictured\b|\bprofessor\b|\blecture\b|\bslide\b|\bsession\b|\bsimply\b|\bnote that\b|\brecall that\b', re.I)
BAN_WORDS = re.compile(r'\bpicture\b|\bpictured\b|\bprofessor\b|\blecture\b|\bslide\b|\bsession\b', re.I)
ids = set()
for c in D['cases']:
    cid = c['id']
    if cid in ids or not cid.startswith('n23-'):
        err(cid, 'id')
    ids.add(cid)
    if c['topic'] not in METHODS:
        err(cid, 'topic')
    if set(c.keys()) != REFKEYS[c['topic']]:
        err(cid, 'key set differs from ref', set(c.keys()) ^ REFKEYS[c['topic']])
    if len(c['steps']) < REFSTEPS[c['topic']]:
        err(cid, 'too few steps')
    if c['source'] != 'Original neuroscience practice example' or c['module'] != 23 or c['lookup'] is not None or c['hypotheses'] is not None:
        err(cid, 'fixed fields')
    for txt in [c['context'], c['title']] + c['tasks']:
        if BAN_WORDS.search(txt):
            err(cid, 'banned wording', BAN_WORDS.search(txt).group(0), '::', txt[:70])
    for txt in [c['conclusion']] + [s['words'] for s in c['steps']]:
        if BAN.search(txt):
            err(cid, 'banned wording', BAN.search(txt).group(0), '::', txt[:70])
    for s in c['steps']:
        if not (s['title'] and s['general'] and s['work'] and s['words']):
            err(cid, 'empty step part')
        for w in s['work']:
            check_work(c, w)
    check_values(c)

cnt = Counter(c['topic'] for c in D['cases'])
if cnt != Counter({m: 2 for m in METHODS}):
    err('topic counts', cnt)
if len({c['title'] for c in D['cases']}) != len(D['cases']):
    err('titles not unique')

qids = set()
for i, q in enumerate(D['questions'], 1):
    if q['id'] != f'm2-n23-qa{i:02d}' or q['id'] in qids:
        err(q['id'], 'question id')
    qids.add(q['id'])
    if q['module'] != 23 or q['topic'] not in METHODS:
        err(q['id'], 'module/topic')
    if len(q['options']) != 4 or len(set(q['options'])) != 4 or q['correct'] not in range(4):
        err(q['id'], 'options')
    if q['case'] is not None and (q['case'] not in ids or [x for x in D['cases'] if x['id'] == q['case']][0]['topic'] != q['topic']):
        err(q['id'], 'case')
    if not q['why'] or not q['equations']:
        err(q['id'], 'why/equations')
    if BAN_WORDS.search(q['stem'] + q['why']):
        err(q['id'], 'banned wording')
if len(D['questions']) != 10 or len(D['cases']) != 10:
    err('counts')
if len({q['correct'] for q in D['questions']}) < 4:
    err('correct index not varied')
if sum(1 for q in D['questions'] if q['case']) != 6:
    err('numeric question count')
if {q['topic'] for q in D['questions']} != METHODS:
    err('every method needs a question')

# numeric questions: recompute the keyed option from the raw case tables
C = {c['id']: c for c in D['cases']}
Q = {q['id']: q for q in D['questions']}
num = lambda s: float(re.sub(r'[\\() ]', '', s))


def key(i):
    q = Q[f'm2-n23-qa{i:02d}']
    return num(q['options'][q['correct']])


def wrong(i):
    q = Q[f'm2-n23-qa{i:02d}']
    return [num(o) for j, o in enumerate(q['options']) if j != q['correct']]


r = {x[0]: x for x in C['n23-eeg-seizure-knn']['table']['rows']}
same('qa01', 'key', key(1), math.dist((5, 4), r['C'][1:3]), 6e-6)
pta = np.array([x[1] for x in C['n23-audiogram-pta-zscore']['table']['rows']], float)
same('qa03', 'key', key(3), (47 - pta.mean()) / pta.std(ddof=1), 6e-6)
if not any(close(wv, (47 - pta.mean()) / pta.std(ddof=0), 6e-6) for wv in wrong(3)):
    err('qa03', 'n-divisor distractor missing')
TN, FP, FN, TP = cells(C['n23-newborn-oae-rare']['table']['rows'])
same('qa05', 'key', key(5), (TN + FP) / (TN + FP + FN + TP), 6e-6)
TN, FP, FN, TP = cells(C['n23-stroke-lvo-sensspec']['table']['rows'])
same('qa06', 'key', key(6), TN / (TN + FP), 6e-6)
if any(close(wv, key(6), 1e-6) for wv in wrong(6)):
    err('qa06 duplicate')
same('qa07', 'key', key(7), expit(-1.2 + 2.5 * 0.8 - 1.5 * 0.4 + 1.0 * 0.5), 6e-6)
same('qa07', 'key vs case', key(7), C['n23-pyramidal-sigmoid-ltp']['answer'], 6e-6)
same('qa09', 'key', key(9), C['n23-motor-neuron-threshold-sse']['answer'])

if NWORK < 50:
    err('too few work lines were evaluated', NWORK)
if errors:
    print('\n'.join(errors)); print(f'FAILED: {len(errors)} problems'); sys.exit(1)
print(f'session23a OK: {len(D["cases"])} cases, {len(D["questions"])} questions, {NWORK} numeric work lines re-evaluated, no printed critical values in this session')
