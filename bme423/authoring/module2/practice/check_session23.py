"""Checks authoring/module2/practice/session23.json.

Every answer and every entry of `values` is recomputed with NumPy/SciPy from the raw inputs (the
case table plus the numbers stated in the context), not from the work lines. Every numeric work
line is re-evaluated. Session 23 has no printed critical values, so every `lookup` must be null.
Structure (ids, topics, key sets and step counts against the lecture case of the same method) and
wording (colons, semicolons and banned words in `words` and `conclusion`) are checked too.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session23.py
Exits 0 when everything passes.
"""
import json, math, os, re, sys
from collections import Counter
import numpy as np
from scipy.special import expit

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'session23.json'), encoding='utf-8'))
REF = json.load(open(os.path.join(HERE, '..', 'neuro', 'ref', 'session23.json'), encoding='utf-8'))
SRC = 'Original practice example in the course style'
METHODS = {m['id'] for m in REF['methods']}
REFKEYS = {c['topic']: set(c.keys()) for c in REF['cases']}
REFSTEPS = {}
for c in REF['cases']:
    REFSTEPS[c['topic']] = max(REFSTEPS.get(c['topic'], 0), len(c['steps']))
REFHEAD = {c['topic']: c['table']['headers'][0] for c in REF['cases'] if c['topic'] in ('s23confusion', 's23sensspec')}
errors = []


def err(*a):
    errors.append(' '.join(str(x) for x in a))


def close(a, b, t=1e-9):
    return abs(float(a) - float(b)) <= t + 1e-12


def same(cid, key, got, exp, t=1e-9):
    if isinstance(exp, dict):
        if not isinstance(got, dict) or set(got) != set(exp):
            return err(cid, key, 'keys', got, exp)
        for k in exp:
            same(cid, f'{key}.{k}', got[k], exp[k], t)
    elif isinstance(exp, (list, tuple, np.ndarray)):
        exp = list(np.asarray(exp).tolist())
        if len(got) != len(exp):
            return err(cid, key, 'length', got, exp)
        for gv, e in zip(got, exp):
            same(cid, key, gv, e, t)
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


def cells(cid, rows):
    (TN, FP), (FN, TP) = rows[0][1:3], rows[1][1:3]
    if rows[0][3] != TN + FP or rows[1][3] != FN + TP or rows[2][1:] != [TN + FN, FP + TP, TN + FP + FN + TP]:
        err(cid, 'table totals', rows)
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
        m = re.search(r'Using the K-NN classifier \(Euclidean distance\), classify the new \w+ as .+ with K = (\d+)\. Include the associated probability of your classification\.', c['tasks'][0])
        if not m:
            return err(cid, 'course wording of the K-NN ask missing')
        K = int(m.group(1))
        chk('K', K)
        new = np.array(v['newSample'], float); seen.add('newSample')
        if not re.search(rf'score of {int(new[0])} and an? [\w ]+ score of {int(new[1])}\.', c['context']):
            err(cid, 'new sample not stated in the context')
        names = [r[0] for r in rows]
        X = np.array([r[1:3] for r in rows], float)
        d = np.sqrt(((X - new) ** 2).sum(axis=1))
        order = np.argsort(d, kind='stable')
        if np.min(np.diff(d[order])) < 1e-6:
            err(cid, 'tied distances')
        chk('distances', {nm: d[i] for i, nm in enumerate(names)})
        chk('neighbors', [names[i] for i in order[:K]])
        cnt = Counter(rows[i][3] for i in order[:K]).most_common()
        if len(cnt) > 1 and cnt[0][1] == cnt[1][1]:
            err(cid, 'tied vote')
        win, k = cnt[0]
        chk('class', win)
        chk('p' + win.replace('-', ' ').title().replace(' ', ''), k / K)
        if f'classified as {win} with probability {k}/{K}' not in c['conclusion']:
            err(cid, 'conclusion text')
        ans = k / K
    elif topic == 's23scaling' and rows[0][0] == 'Min.':
        st = {r[0]: float(r[1]) for r in rows}
        mn, mx = st['Min.'], st['Max.']
        new = ctx_num(c, r'A new \w+ had an? [\w ]+? of (\d+(?:\.\d+)?) ')
        chk('min', mn); chk('max', mx); chk('mean', st['Mean']); chk('median', st['Median'])
        chk('range', mx - mn); chk('newValue', new)
        sc = lambda x: (x - mn) / (mx - mn)
        chk('scaledMean', sc(st['Mean'])); chk('scaledMedian', sc(st['Median'])); chk('scaledNew', sc(new))
        if not (st['Min.'] <= st['1st Qu.'] <= st['Median'] <= st['3rd Qu.'] <= st['Max.']):
            err(cid, 'summary order')
        ans = sc(new)
    elif topic == 's23scaling':
        x = np.array([r[1] for r in rows], float)
        new = ctx_num(c, r'A new \w+ had an? [\w ]+? of (\d+(?:\.\d+)?) ')
        sd = x.std(ddof=1)
        chk('data', x); chk('mean', x.mean()); chk('sumSq', ((x - x.mean()) ** 2).sum())
        chk('sd', sd); chk('newValue', new)
        chk('zNew', (new - x.mean()) / sd); chk('zMin', (x.min() - x.mean()) / sd)
        ans = (new - x.mean()) / sd
    elif topic in ('s23confusion', 's23sensspec'):
        if c['table']['headers'][0] != REFHEAD[topic]:
            err(cid, 'table header differs from ref')
        TN, FP, FN, TP = cells(cid, rows)
        n = TN + FP + FN + TP
        for k, val in (('TN', TN), ('FP', FP), ('FN', FN), ('TP', TP), ('n', n)):
            chk(k, val)
        res = {'Accuracy': (TP + TN) / n, 'Sensitivity': TP / (TP + FN), 'Specificity': TN / (TN + FP)}
        chk('accuracy', res['Accuracy']); chk('sensitivity', res['Sensitivity']); chk('specificity', res['Specificity'])
        if 'errorRate' in v or topic == 's23confusion':
            chk('errorRate', (FP + FN) / n)
        if 'accuracyAlwaysNegative' in v:
            chk('accuracyAlwaysNegative', (TN + FP) / n)
            prev = (FN + TP) / n
            if not (prev < 0.01 and res['Accuracy'] > 0.95 and res['Sensitivity'] < 0.5 and (TN + FP) / n > res['Accuracy']):
                err(cid, 'not a rare-condition case')
            m = re.search(r'showed that (\d+) of the ([\d,]+) ', c['context'])
            if not m or int(m.group(1)) != FN + TP or int(m.group(2).replace(',', '')) != n:
                err(cid, 'context counts do not match the table')
        ans = res[c['answerName']]
    elif topic == 's23neuron' and 'SSE' in v:
        w = [ctx_num(c, rf'w{j} = (-?\d+(?:\.\d+)?)') for j in (1, 2, 3)]
        w0 = ctx_num(c, r'w0 = (-?\d+(?:\.\d+)?)')
        X = np.array([r[1:4] for r in rows], float); y = np.array([r[4] for r in rows], float)
        s = w0 + X @ np.array(w)
        yh = expit(s); e = y - yh
        chk('weights', w); chk('bias', w0); chk('sums', s); chk('predictions', yh); chk('errors', e)
        chk('SSE', float((e ** 2).sum()))
        yt = (s >= 0).astype(float)
        if np.min(np.abs(s)) < 1e-6:
            err(cid, 'net input on the threshold')
        chk('thresholdPredictions', yt); chk('thresholdSSE', float(((y - yt) ** 2).sum()))
        if 'sigmoid' not in c['context']:
            err(cid, 'activation not stated')
        ans = float((e ** 2).sum())
    elif topic == 's23neuron':
        names = [r[0] for r in rows]
        w = np.array([r[1] for r in rows], float); x = np.array([r[2] for r in rows], float)
        for r in rows:
            if not close(r[3], r[1] * r[2], 1e-6):
                err(cid, 'product column', r)
        for xv in x:
            if not re.search(rf'\b{xv:g}\b', c['context']):
                err(cid, 'input not stated in the context', xv)
        m = re.search(r'weight (-?[\d.]+) into the hidden neuron and (-?[\d.]+) into the output, and the hidden-to-output weight was (-?[\d.]+)\.', c['context'])
        b0, v0, v1 = (float(t) for t in m.groups())
        s = b0 + w @ x; h = expit(s)
        chk('weights', dict(zip(names, w))); chk('inputs', dict(zip(names, x)))
        chk('biasHidden', b0); chk('biasOutput', v0); chk('hiddenToOutput', v1)
        chk('weightedSum', w @ x); chk('netInput', s); chk('hidden', h); chk('prediction', v0 + v1 * h)
        ans = v0 + v1 * h
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
        if [p[0] for p in pairs] != sorted(c['values']['distances'], key=c['values']['distances'].get):
            err(cid, 'ranking order', line)
        for nm, val in pairs:
            if abs(c['values']['distances'][nm] - float(val)) > 5e-6:
                err(cid, 'ranking value', nm, val)
        return
    for part in split_top(line, ',\\ '):
        m = re.fullmatch(r'(?:\\hat y_\d=)?f\((-?[\d.]+)\)=([01])', part)
        if m:  # threshold activation
            NWORK += 1
            if int(m.group(2)) != (1 if float(m.group(1)) >= 0 else 0):
                err(cid, 'threshold output wrong', part)
            continue
        sides = [numeric(x) for x in split_top(part, '=')]
        vals = [x for x in sides if x is not None]
        if len(vals) > 1:
            NWORK += 1
            if any(abs(a - vals[0]) > 5e-5 * max(1, abs(vals[0])) for a in vals[1:]):
                err(cid, 'work arithmetic', line, vals)


def joined_work(step):
    """continuation lines (starting with = or +) are joined to the line before them"""
    out = []
    for w in step['work']:
        if out and (w.startswith('=') or w.startswith('+')):
            out[-1] += w
        else:
            out.append(w)
    return out


# context and tasks keep the course's own punctuation, so colons and semicolons are allowed there.
# They stay banned in the conclusion and the step words.
BAN = re.compile(r'[:;]|\bpicture\b|\bpictured\b|\bprofessor\b|\blecture\b|\bslide\b|\bsession\b|\bsimply\b|\bnote that\b|\brecall that\b', re.I)
BAN_WORDS = re.compile(r'\bpicture\b|\bpictured\b|\bprofessor\b|\blecture\b|\bslide\b|\bsession\b', re.I)
NEURO = ('seizure', 'eeg', 'neuron in the brain', 'hearing', 'concussion', 'tremor', 'memory', 'dyslexia', 'anxiety')
ids = set()
for c in D['cases']:
    cid = c['id']
    if cid in ids or not re.fullmatch(r'p23-[a-z0-9-]+', cid):
        err(cid, 'id')
    ids.add(cid)
    if c['topic'] not in METHODS:
        err(cid, 'topic')
    if set(c.keys()) != REFKEYS[c['topic']]:
        err(cid, 'key set differs from ref', set(c.keys()) ^ REFKEYS[c['topic']])
    if len(c['steps']) < REFSTEPS[c['topic']]:
        err(cid, 'too few steps')
    if c['source'] != SRC or c['module'] != 23 or c['lookup'] is not None or c['hypotheses'] is not None:
        err(cid, 'fixed fields')
    for txt in [c['context'], c['title']] + c['tasks']:
        if BAN_WORDS.search(txt):
            err(cid, 'banned wording', BAN_WORDS.search(txt).group(0), '::', txt[:70])
        if any(t in txt.lower() for t in NEURO):
            err(cid, 'neuroscience setting', txt[:70])
    for txt in [c['conclusion']] + [s['words'] for s in c['steps']]:
        if BAN.search(txt):
            err(cid, 'banned wording', BAN.search(txt).group(0), '::', txt[:70])
    for s in c['steps']:
        if not (s['title'] and s['general'] and s['work'] and s['words']):
            err(cid, 'empty step part')
        for w in joined_work(s):
            check_work(c, w)
    check_values(c)

cnt = Counter(c['topic'] for c in D['cases'])
if cnt != Counter({m: 2 for m in METHODS}):
    err('topic counts', cnt)
if len({c['title'] for c in D['cases']}) != len(D['cases']):
    err('titles not unique')
if len(D['cases']) != 10 or D['questions'] != [] or not D['notes']:
    err('counts, questions or notes')
if not any('accuracyAlwaysNegative' in c['values'] for c in D['cases']):
    err('no rare-condition case')

if NWORK < 50:
    err('too few work lines were evaluated', NWORK)
if errors:
    print('\n'.join(errors)); print(f'FAILED: {len(errors)} problems'); sys.exit(1)
print(f'session23 OK: {len(D["cases"])} cases, {NWORK} numeric work lines re-evaluated, all values recomputed, no printed critical values in this session')
