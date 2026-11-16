"""Independent check of authoring/module2/neuro/session22b.json.
Recomputes every answer and every entry of `values` from the raw inputs (the case tables and
the stated starting centroids) with NumPy/SciPy, re-evaluates the arithmetic of the work lines,
and checks ids, topics, wording rules and quiz structure. Exits 0 only if everything agrees.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session22b.py
"""
import itertools, json, math, os, re, sys
import numpy as np
from scipy.spatial.distance import cdist, minkowski

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "session22b.json"), encoding="utf-8"))
REF = json.load(open(os.path.join(HERE, "ref", "session22.json"), encoding="utf-8"))
METHODS = {m["id"] for m in REF["methods"]}
REFCASE = {}
for c in REF["cases"]:
    REFCASE.setdefault(c["topic"], []).append(c)
errors = []
def need(cond, msg):
    if not cond: errors.append(msg)
def close(a, b, tol=1e-9):
    return np.allclose(np.asarray(a, float), np.asarray(b, float), rtol=0, atol=tol)

# ---- raw inputs, typed here independently of the JSON values ----
RAW = {
 "n22-b-bat-call-nearest": dict(q=[6, 4]),
 "n22-b-personality-distance": dict(),
 "n22-b-symptom-profile-distance": dict(),
 "n22-b-chronotype-bedtime-kmeans": dict(x=[15, 30, 40, 85, 120, 150, 165, 180, 195], init=[30, 100]),
 "n22-b-mouse-open-field-kmeans": dict(init=[[1, 1], [5, 5]], n=4),
 "n22-b-meditation-eeg-kmeans": dict(init=[[3, 3], [6, 6]], n=5),
 "n22-b-hearing-threshold-withinss": dict(x=[6, 9, 12, 15, 21, 48, 52, 57, 63, 68], init=[10, 40]),
 "n22-b-cortisol-withinss": dict(x=[5, 6, 8, 14, 15, 17, 18, 27, 29, 31], init=[8, 29]),
 "n22-b-bird-call-knn": dict(q=[5, 5], n=5),
 "n22-b-brain-scan-knn": dict(q=[4, 4], n=6),
}
WANT_TOPICS = {"s22idea": 1, "s22distance": 2, "s22kmeans": 3, "s22withinss": 2, "s22knn": 2}

def lloyd(X, C):
    """Plain k-means (assign to nearest centroid, recompute means). Returns the history."""
    X = np.asarray(X, float).reshape(len(X), -1); C = np.asarray(C, float).reshape(len(C), -1)
    hist = []
    while True:
        dist = cdist(X, C)
        srt = np.sort(dist, axis=1)
        assert np.all(srt[:, 1] - srt[:, 0] > 1e-9), "tie between centroids"
        y = dist.argmin(axis=1)
        if hist and np.array_equal(hist[-1][0], y):
            return hist, dist
        C = np.array([X[y == j].mean(axis=0) for j in range(len(C))])
        hist.append((y, C.copy(), dist))

def best_partition(x, k):
    """Global minimum of the total within-cluster SS for sorted 1-D data (contiguous clusters)."""
    x = np.sort(np.asarray(x, float)); n = len(x); best = None
    for cuts in itertools.combinations(range(1, n), k - 1):
        parts = np.split(x, cuts)
        tot = sum(((p - p.mean()) ** 2).sum() for p in parts)
        if best is None or tot < best[0] - 1e-12:
            best = (tot, [len(p) for p in parts], [((p - p.mean()) ** 2).sum() for p in parts])
    return best

def nums(s): return [float(t) for t in str(s).split()]

def check_case(c):
    cid, v, rows = c["id"], c["values"], c["table"]["rows"]
    raw = RAW[cid]; t = c["topic"]
    if t == "s22idea":
        q = np.array(raw["q"], float); P = np.array([r[1:3] for r in rows], float)
        d = cdist([q], P)[0]
        need(len(set(np.round(d, 9))) == len(d), cid + " distance tie")
        need(v["newCall"] == raw["q"], cid + " newCall")
        for i in range(len(rows)): need(close(v[f"call{i+1}"], d[i]), f"{cid} call{i+1}")
        j = int(d.argmin())
        need(v["nearest"] == rows[j][0] and v["assigned"] == rows[j][3], cid + " nearest/assigned")
        need(close(c["answer"], d.min()), cid + " answer")
        need(f"({raw['q'][0]}, {raw['q'][1]})" in c["tasks"][0], cid + " task point")
    elif t == "s22distance":
        q, r = np.array(rows[0][1:], float), np.array(rows[1][1:], float)
        need(v["q"] == rows[0][1:] and v["r"] == rows[1][1:], cid + " q/r")
        need(close(v["euclidean"], minkowski(q, r, 2)), cid + " euclidean")
        need(close(v["manhattan"], minkowski(q, r, 1)), cid + " manhattan")
        need(close(v["minkowski3"], minkowski(q, r, 3)), cid + " minkowski3")
        need(v["manhattan"] >= v["euclidean"] >= v["minkowski3"], cid + " order")
        need(close(c["answer"], minkowski(q, r, 3)), cid + " answer")
    elif t == "s22kmeans" and "ages" in v:
        x = raw["x"]
        need(v["ages"] == x and [r[0] for r in rows] == x and v["initial"] == raw["init"] and v["k"] == 2, cid + " inputs")
        need(all(str(n) in c["context"] for n in x + raw["init"]), cid + " context numbers")
        hist, _ = lloyd(x, raw["init"])
        need(len(hist) == 2 and v["iterations"] == 3, cid + " needs exactly two changing iterations then a stable third")
        need(v["iter1Labels"] == (hist[0][0] + 1).tolist() and v["iter2Labels"] == (hist[1][0] + 1).tolist(), cid + " labels")
        need(v["iter1Labels"] != v["iter2Labels"], cid + " iteration 2 must change a label")
        need(close(v["iter1Centroids"], hist[0][1].ravel()) and close(v["iter2Centroids"], hist[1][1].ravel()), cid + " centroids")
        for r, lab in zip(rows, v["iter1Labels"]):
            need(float(r[3]) == abs(r[0] - raw["init"][0]) and float(r[4]) == abs(r[0] - raw["init"][1]) and r[5] == lab
                 and r[1] == str(raw["init"][0]) and r[2] == str(raw["init"][1]), f"{cid} table row {r[0]}")
        need(close(c["answer"], hist[0][1].ravel()[1]), cid + " answer")
    elif t == "s22kmeans":
        P = [r[1:3] for r in rows]
        need(v["points"] == P and v["initial"] == raw["init"] and len(P) == raw["n"] and 3 <= len(P) <= 5, cid + " inputs")
        need([r[0] for r in rows] == list(range(1, len(P) + 1)), cid + " row ids")
        for j, cc in enumerate(raw["init"]):
            need(f"= {cc[0]}," in c["tasks"][0] and f"= {cc[1]})" in c["tasks"][0], f"{cid} task centroid {j+1}")
        dist = cdist(np.array(P, float), np.array(raw["init"], float))
        need(np.all(np.abs(dist[:, 0] - dist[:, 1]) > 1e-9), cid + " tie")
        y = dist.argmin(axis=1); X = np.array(P, float)
        need(close(v["distC1"], dist[:, 0]) and close(v["distC2"], dist[:, 1]), cid + " distances")
        need(v["labels"] == (y + 1).tolist() and set(y) == {0, 1}, cid + " labels")
        n1, n2 = X[y == 0].mean(axis=0), X[y == 1].mean(axis=0)
        need(close(v["newC1"], n1) and close(v["newC2"], n2), cid + " new centroids")
        m = re.match(r"New centroid C([12]) (.+) coordinate$", c["answerName"])
        need(bool(m), cid + " answerName")
        if m:
            co = c["table"]["headers"][1:].index(m.group(2))
            need(close(c["answer"], (n1 if m.group(1) == "1" else n2)[co]), cid + " answer")
        need(f"each of the {len(P)} data points AND" in c["tasks"][1], cid + " task wording")
    elif t == "s22withinss":
        x = np.array(raw["x"], float)
        need(v["ages"] == raw["x"] and all(str(n) in c["context"] for n in raw["x"]), cid + " inputs")
        need(f"c({raw['init'][0]}, {raw['init'][1]})" in c["context"], cid + " R call")
        tss = ((x - x.mean()) ** 2).sum()
        # k = 2: the stated final partition must be a fixed point of k-means and the global minimum
        tot2, size2, ss2 = best_partition(x, 2)
        cl = [x[:size2[0]], x[size2[0]:]]
        for part in cl:
            need(f"(centroid {('%.5f' % part.mean()).rstrip('0').rstrip('.')})" in c["context"], f"{cid} centroid {part.mean()} not stated in context")
        hist, _ = lloyd(x, [p.mean() for p in cl])
        need(len(hist) == 1 and (hist[0][0] == np.repeat([0, 1], size2)).all(), cid + " k=2 partition is not stable")
        # the hand algorithm started from the centroids named in the context must reach that partition, with no tie
        try:
            hist0, _ = lloyd(x, raw["init"])
            need((hist0[-1][0] == np.repeat([0, 1], size2)).all(), cid + " stated starting centroids do not reach the reported k=2 clusters")
        except AssertionError:
            need(False, cid + " tie between centroids when started from the stated centroids")
        need(close(v["ss1"], ss2[0]) and close(v["ss2"], ss2[1]) and close(v["totWithin"], tot2), cid + " ss1/ss2/totWithin")
        need(close(v["totalSS"], tss) and close(v["between"], tss - tot2), cid + " totalSS/between")
        b3, b4 = best_partition(x, 3), best_partition(x, 4)
        need(close(v["totWithinK3"], b3[0]) and close(v["totWithinK4"], b4[0]), cid + " k=3/k=4 totals")
        need(close(c["answer"], tot2), cid + " answer")
        # the printed R table (7 significant digits) against the recomputed partitions
        for row, (tot, size, ss) in zip(rows, [(tss, [len(x)], [tss]), (tot2, size2, ss2), b3, b4]):
            need(sorted(nums(row[1])) == sorted(size), f"{cid} k={row[0]} size")
            need(len(nums(row[2])) == row[0] and np.allclose(sorted(nums(row[2])), sorted(ss), rtol=5e-7, atol=0), f"{cid} k={row[0]} withinss")
            need(math.isclose(row[3], tot, rel_tol=5e-7) and math.isclose(sum(nums(row[2])), tot, rel_tol=1e-6), f"{cid} k={row[0]} tot.withinss")
        drops = -np.diff([tss, tot2, b3[0], b4[0]])
        k = v["chosenK"]
        # elbow: the drop into the chosen k is large, the next drop is small relative to it
        need(k in (2, 3) and drops[k - 1] < 0.25 * drops[k - 2] and all(drops[i] > 0.1 * tss for i in range(k - 1)), cid + " chosenK is not the elbow")
    elif t == "s22knn":
        key = [k for k in v if k.startswith("new")][0]
        q = np.array(raw["q"], float); P = np.array([r[1:3] for r in rows], float)
        names = [r[0] for r in rows]; cls = [r[3] for r in rows]
        need(v[key] == raw["q"] and len(rows) == raw["n"] and 4 <= len(rows) <= 6 and len(set(cls)) == 2 and v["K"] == 3, cid + " inputs")
        d = cdist([q], P)[0]
        need(np.all(np.diff(np.sort(d)) > 1e-9), cid + " tie in distance ranks")
        for n, dd in zip(names, d): need(close(v["distances"][n], dd), f"{cid} distance {n}")
        order = [names[i] for i in np.argsort(d)]
        need(v["ranks"] == {n: i + 1 for i, n in enumerate(order)} and v["neighbors"] == order[:3], cid + " ranks/neighbors")
        pk = [k for k in v if k.startswith("p")][0]; klass = pk[1:]
        votes = [cls[names.index(n)] for n in order[:3]]
        need(close(v[pk], votes.count(klass) / 3) and close(c["answer"], votes.count(klass) / 3), cid + " probability")
        need(max(set(votes), key=votes.count) == klass, cid + " reported class is not the plurality class")
        need("Use a K-NN classification with K = 3." in " ".join(c["tasks"]), cid + " task wording")
        need(f"({raw['q'][0]}, {raw['q'][1]})" in c["tasks"][0], cid + " task point")
    else:
        need(False, cid + " unknown topic")

# ---- arithmetic of the work lines ----
def to_py(s):
    s = s.replace("\\left", "").replace("\\right", "").replace("\\ ", "").replace(" ", "")
    for _ in range(6):
        s = re.sub(r"\\sqrt\{([^{}]*)\}", r"math.sqrt(\1)", s)
        s = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"((\1)/(\2))", s)
        s = re.sub(r"\^\{([^{}]*)\}", r"**(\1)", s)
    s = re.sub(r"\|([^|]*)\|", r"abs(\1)", s)
    s = s.replace("^", "**")
    return s
SAFE = re.compile(r"^[0-9+\-*/().,a-z ]*$")
def evaluate(expr):
    p = to_py(expr)
    if not SAFE.match(p) or re.sub(r"math\.sqrt|abs", "", p) != re.sub(r"[a-z]", "", re.sub(r"math\.sqrt|abs", "", p)) or not re.search(r"\d", p):
        return None
    try:
        val = eval(p, {"__builtins__": {}}, {"math": math, "abs": abs})
    except Exception:
        return None
    return val
def as_vec(val):
    if isinstance(val, (int, float)): return [float(val)]
    if isinstance(val, tuple) and all(isinstance(z, (int, float)) for z in val): return [float(z) for z in val]
    return None
n_checked = 0
def check_work(cid, line):
    global n_checked
    for piece in re.split(r",\\ |\\Rightarrow|\\to", line):
        piece = re.sub(r"\\ \(\\text\{[^{}]*\}\)", "", piece)
        sides = [as_vec(evaluate(s)) for s in piece.split("=")]
        sides = [s for s in sides if s is not None]
        for a, b in zip(sides, sides[1:]):
            n_checked += 1
            need(len(a) == len(b) and all(abs(p - q) <= 6e-6 * max(1.0, abs(q)) for p, q in zip(a, b)), f"{cid} work arithmetic: {line}")
        for mm in re.finditer(r"([0-9.]+)(<|\\ge ?)([0-9.]+)", piece.replace(" ", "")):
            n_checked += 1
            a, b = float(mm.group(1)), float(mm.group(3))
            need(a < b if mm.group(2) == "<" else a >= b, f"{cid} work comparison: {line}")

# ---- structure and wording ----
KEYS = ["id", "title", "topic", "context", "unit", "table", "tasks", "hypotheses", "symbols", "steps", "conclusion", "source",
        "lookup", "values", "module", "tolerance", "answerName", "answer"]
ids = [c["id"] for c in D["cases"]]
need(len(ids) == 10 and len(set(ids)) == 10 and all(i.startswith("n22-b-") for i in ids), "case ids")
need(set(ids) == set(RAW), "case ids differ from the checked list")
count = {}
for c in D["cases"]:
    cid = c["id"]; count[c["topic"]] = count.get(c["topic"], 0) + 1
    need(list(c.keys()) == KEYS, cid + " key set differs from the reference cases")
    need(c["topic"] in METHODS and c["module"] == 22 and c["source"] == "Original neuroscience practice example", cid + " topic/module/source")
    need(c["hypotheses"] is None and c["lookup"] is None, cid + " hypotheses/lookup must be null as in the reference")
    need(c["symbols"] == REFCASE[c["topic"]][0]["symbols"] or c["topic"] == "s22idea", cid + " symbols differ from the reference case")
    need(len(c["steps"]) >= min(len(r["steps"]) for r in REFCASE[c["topic"]]), cid + " fewer steps than the reference case")
    need(abs(c["tolerance"] - max(0.005 * abs(c["answer"]), 0.001)) < 1e-12, cid + " tolerance")
    texts = [c["context"], c["conclusion"]] + c["tasks"] + [s["words"] for s in c["steps"]]
    # context and tasks keep the exercise's own punctuation ("differences in scale; the scaled
    # data are unitless", "initial centroids:", "(training set):"). Colons and semicolons stay
    # banned in the conclusion and the step words.
    for tx in [c["conclusion"]] + [s["words"] for s in c["steps"]]:
        need(":" not in tx and ";" not in tx, f"{cid} colon or semicolon in: {tx[:60]}")
    for tx in texts:
        need(not re.search(r"picture|professor|lecture|slide|session", tx, re.I), f"{cid} banned word in: {tx[:60]}")
    for s in c["steps"]:
        need(s["title"] and s["general"] and s["work"] and s["words"], cid + " empty step field")
        for w in s["work"]: check_work(cid, w)
    if cid in RAW: check_case(c)
need(count == WANT_TOPICS, f"topic counts {count}")

qs = D["questions"]
need([q["id"] for q in qs] == [f"m2-n22-qb{i:02d}" for i in range(1, 11)], "question ids")
for q in qs:
    need(q["module"] == 22 and q["topic"] in METHODS, q["id"] + " module/topic")
    need(q["case"] is None or q["case"] in ids, q["id"] + " case")
    need(len(q["options"]) == 4 and len(set(q["options"])) == 4 and q["correct"] in range(4), q["id"] + " options")
    need(1 <= len([s for s in re.split(r"(?<=[.?])\s+", q["why"]) if s]) <= 4 and q["equations"], q["id"] + " why/equations")
    for e in q["equations"]: check_work(q["id"], e)
need(sum(q["case"] is not None for q in qs) == 6, "numeric/conceptual split should be 6/4")
need(len({q["correct"] for q in qs}) == 4, "correct index is not varied")
# numeric keys of the quiz, recomputed from raw inputs
def opt(q): return qs[q - 1]["options"][qs[q - 1]["correct"]]
def num(s): return float(re.sub(r"[^0-9.]", "", s))
need(abs(num(opt(2)) - minkowski([14, 32], [28, 23], 2)) < 1e-5, "qb02 key")
need(abs(num(opt(3)) - minkowski([17, 9], [11, 20], 3)) < 1e-5, "qb03 key")
need(abs(num(opt(4)) - np.mean([85, 120, 150, 165, 180, 195])) < 1e-5, "qb04 key")
need(opt(5).replace("\\ ", "").replace(" ", "") == "\\((6.5,6.5)\\)", "qb05 key")
need(abs(num(opt(7)) - best_partition(RAW["n22-b-hearing-threshold-withinss"]["x"], 2)[0]) < 1e-5, "qb07 key")
need(abs(num(opt(9)) - 2 / 3) < 1e-5, "qb09 key")
need(isinstance(D.get("notes"), list) and D["notes"], "notes")

if errors:
    print("\n".join("FAIL " + e for e in errors)); print(f"{len(errors)} problems"); sys.exit(1)
print(f"session22b OK: {len(D['cases'])} cases, {len(qs)} questions, {n_checked} work-line equalities and comparisons re-evaluated")
