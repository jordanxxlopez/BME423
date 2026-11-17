"""Independent check of authoring/module2/neuro/session23b.json.
Recomputes every answer and every entry of `values` from raw inputs typed here (and from the case
tables) with NumPy/SciPy, re-evaluates the arithmetic of the work lines, and checks ids, topics,
wording rules and quiz structure. Exits 0 only if everything agrees.
Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session23b.py
"""
import json, math, os, re, sys
import numpy as np
from scipy.spatial.distance import cdist
from scipy.special import expit
from scipy.stats import zscore  # noqa: F401  (z-scores below use the stated mean and SD)

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "session23b.json"), encoding="utf-8"))
REF = json.load(open(os.path.join(HERE, "ref", "session23.json"), encoding="utf-8"))
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
 "n23-b-vowel-formant-knn": dict(q=[0.5, 0], K=3, n=6, klass="Back"),
 "n23-b-instrument-timbre-knn": dict(q=[5, 3], K=5, n=6, klass="Clarinet", K3class="Trumpet"),
 "n23-b-fear-freezing-minmax": dict(min=4.2, max=152.6, mean=61.37, median=58.8),
 "n23-b-working-memory-zscore": dict(mean=[6.7, 452], sd=[1.3, 64], p1=[5, 520], p2=[9, 498]),
 "n23-b-recognition-memory-confusion": dict(TN=654, FP=146, FN=212, TP=588, answer="accuracy"),
 "n23-b-alarm-call-detector-rare": dict(TN=1964, FP=12, FN=18, TP=6, answer="accuracy"),
 "n23-b-dyslexia-screen-sensspec": dict(TN=176, FP=34, FN=5, TP=25, answer="sensitivity"),
 "n23-b-anxiety-questionnaire-sensspec": dict(TN=138, FP=6, FN=16, TP=20, answer="sensitivity"),
 "n23-b-voicing-sigmoid-neuron": dict(w=[6.2, -1.8], w0=-3.1, X=[[0.7, 0.4], [0.2, 0.6]]),
 "n23-b-beat-threshold-sse": dict(w=[1.5, 2.0], w0=-1.6, X=[[0.8, 0.3], [0.2, 0.4], [0.5, 0.2], [0.6, 0.5]], y=[1, 0, 1, 0]),
}
WANT_TOPICS = {"s23knn": 2, "s23scaling": 2, "s23confusion": 2, "s23sensspec": 2, "s23neuron": 2}

def cm_metrics(TN, FP, FN, TP):
    n = TN + FP + FN + TP
    return dict(n=n, accuracy=(TP + TN) / n, errorRate=(FP + FN) / n,
                sensitivity=TP / (TP + FN) if TP + FN else 0.0, specificity=TN / (TN + FP))

def check_case(c):
    cid, v, rows = c["id"], c["values"], c["table"]["rows"]
    raw = RAW[cid]; t = c["topic"]
    if t == "s23knn":
        q = np.array(raw["q"], float); P = np.array([r[1:3] for r in rows], float)
        names = [r[0] for r in rows]; cls = [r[3] for r in rows]
        keys = list(v["distances"].keys())
        need(v["newSample"] == raw["q"] and len(rows) == raw["n"] and 4 <= len(rows) <= 6 and len(set(cls)) == 2 and v["K"] == raw["K"], cid + " inputs")
        d = cdist([q], P)[0]
        need(np.all(np.diff(np.sort(d)) > 1e-9), cid + " tie in distance ranks")
        need(close([v["distances"][k] for k in keys], d), cid + " distances")
        order = [keys[i] for i in np.argsort(d)]
        K = raw["K"]
        need(v["neighbors"] == order[:K], cid + " neighbors")
        votes = [cls[keys.index(k)] for k in order[:K]]
        klass = raw["klass"]
        need(v["class"] == klass and max(set(votes), key=votes.count) == klass and votes.count(klass) > K / 2, cid + " class is not the plurality class")
        p = votes.count(klass) / K
        need(close(v["p" + klass], p) and close(c["answer"], p), cid + " probability")
        need(f"Use a K-NN classification with K = {K}." in " ".join(c["tasks"]), cid + " task wording")
        need("with the following results (training set):" in c["context"], cid + " training-set wording")
        need(f"({raw['q'][0]}, {raw['q'][1]})" in c["tasks"][0], cid + " task point")
        if "K3class" in raw:
            v3 = [cls[keys.index(k)] for k in order[:3]]
            need(max(set(v3), key=v3.count) == raw["K3class"] != klass, cid + " K = 3 class should differ")
    elif t == "s23scaling" and "min" in raw:
        mn, mx = raw["min"], raw["max"]
        tab = {r[0]: r[1] for r in rows}
        need(tab["Min."] == mn and tab["Max."] == mx and tab["Mean"] == raw["mean"] and tab["Median"] == raw["median"], cid + " table")
        need(tab["Min."] <= tab["1st Qu."] <= tab["Median"] <= tab["3rd Qu."] <= tab["Max."], cid + " summary order")
        sc = lambda x: (x - mn) / (mx - mn)
        for k, val in dict(min=mn, max=mx, mean=raw["mean"], median=raw["median"], range=mx - mn,
                           scaledMean=sc(raw["mean"]), scaledMedian=sc(raw["median"])).items():
            need(close(v[k], val), f"{cid} {k}")
        need(close(c["answer"], sc(raw["mean"])), cid + " answer")
    elif t == "s23scaling":
        m, s = np.array(raw["mean"], float), np.array(raw["sd"], float)
        p1, p2 = np.array(raw["p1"], float), np.array(raw["p2"], float)
        z1, z2 = (p1 - m) / s, (p2 - m) / s
        need(close(v["mean"], m) and close(v["sd"], s) and v["participant1"] == raw["p1"] and v["participant2"] == raw["p2"], cid + " inputs")
        need(close(v["z1"], z1) and close(v["z2"], z2), cid + " z-scores")
        need(close(v["distRaw"], cdist([p1], [p2])[0, 0]) and close(v["distScaled"], cdist([z1], [z2])[0, 0]), cid + " distances")
        need(close(c["answer"], cdist([z1], [z2])[0, 0]), cid + " answer")
        # the stated dominance must be true
        need((p1 - p2)[1] ** 2 > 0.9 * ((p1 - p2) ** 2).sum() and (z1 - z2)[0] ** 2 > 0.9 * ((z1 - z2) ** 2).sum(), cid + " dominance claim")
    elif t in ("s23confusion", "s23sensspec"):
        TN, FP, FN, TP = raw["TN"], raw["FP"], raw["FN"], raw["TP"]
        need(rows[0][1:] == [TN, FP, TN + FP] and rows[1][1:] == [FN, TP, FN + TP]
             and rows[2][1:] == [TN + FN, FP + TP, TN + FP + FN + TP], cid + " table cells/totals")
        need(c["table"]["headers"][0] == "Actual \\ Predicted", cid + " header")
        met = cm_metrics(TN, FP, FN, TP)
        for k in ("TN", "FP", "FN", "TP"): need(v[k] == raw[k], f"{cid} {k}")
        for k, val in met.items():
            if k in v: need(close(v[k], val), f"{cid} {k}")
        for k in ("accuracy", "sensitivity", "specificity"): need(k in v, f"{cid} missing {k}")
        if "accuracyAlwaysNo" in v:
            a0 = cm_metrics(TN + FP, 0, FN + TP, 0)
            need(close(v["accuracyAlwaysNo"], a0["accuracy"]) and close(v["sensitivityAlwaysNo"], a0["sensitivity"]), cid + " always-no")
            need(a0["accuracy"] > met["accuracy"], cid + " always-no should beat the detector on accuracy")
        need(close(c["answer"], met[raw["answer"]]), cid + " answer")
    elif t == "s23neuron" and "y" not in raw:
        w, w0, X = np.array(raw["w"]), raw["w0"], np.array(raw["X"])
        S = w0 + X @ w
        need(close(v["weights"], w) and close(v["bias"], w0) and close(v["inputs"], X), cid + " inputs")
        need(close(v["weightedSum"], X[0] @ w) and close(v["netInput"], S) and close(v["outputs"], expit(S)), cid + " sums/outputs")
        need(v["threshold"] == [int(s >= 0) for s in S], cid + " threshold outputs")
        need(close(c["answer"], expit(S[0])), cid + " answer")
    elif t == "s23neuron":
        w, w0, X, y = np.array(raw["w"]), raw["w0"], np.array(raw["X"]), np.array(raw["y"])
        S = w0 + X @ w
        need(np.all(np.abs(S) > 1e-9), cid + " a sum sits exactly on the threshold")
        P = (S >= 0).astype(int); E = y - P
        need([r[1:3] for r in rows] == raw["X"] and [r[3] for r in rows] == raw["y"], cid + " table")
        need(close(v["sums"], S) and v["predictions"] == P.tolist() and v["errors"] == E.tolist(), cid + " sums/predictions/errors")
        need(close(v["SSE"], (E ** 2).sum()) and close(c["answer"], (E ** 2).sum()), cid + " SSE")
    else:
        need(False, cid + " unknown topic")

# ---- arithmetic of the work lines ----
def to_py(s):
    s = s.replace("\\left", "").replace("\\right", "").replace("\\ ", "").replace(" ", "").replace("\\quad", "")
    s = re.sub(r"(?<![a-z])e\^\{([^{}]*)\}", r"math.exp(\1)", s)
    for _ in range(6):
        s = re.sub(r"\\sqrt\{([^{}]*)\}", r"math.sqrt(\1)", s)
        s = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"((\1)/(\2))", s)
        s = re.sub(r"\^\{([^{}]*)\}", r"**(\1)", s)
    s = s.replace("^", "**").replace("\\times", "*").replace("\\cdot", "*")
    s = re.sub(r"([0-9)])\(", r"\1*(", s)  # implicit multiplication 6.2(0.7)
    return s
SAFE = re.compile(r"^[0-9+\-*/().,a-z ]*$")
def evaluate(expr):
    p = to_py(expr)
    bare = re.sub(r"math\.sqrt|math\.exp|abs", "", p)
    if not SAFE.match(p) or re.search(r"[a-z]", bare) or not re.search(r"\d", p):
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
    for piece in re.split(r",\\ |,\\quad|\\Rightarrow|\\to", line):
        sides = [as_vec(evaluate(s)) for s in piece.split("=")]
        sides = [s for s in sides if s is not None]
        for a, b in zip(sides, sides[1:]):
            n_checked += 1
            need(len(a) == len(b) and all(abs(p - q) <= 6e-6 * max(1.0, abs(q)) for p, q in zip(a, b)), f"{cid} work arithmetic: {line}")
        for mm in re.finditer(r"(?<![0-9.)])(-?[0-9.]+)(<|\\ge ?)(-?[0-9.]+)(?![0-9.(])", piece.replace(" ", "")):
            n_checked += 1
            a, b = float(mm.group(1)), float(mm.group(3))
            need(a < b if mm.group(2) == "<" else a >= b, f"{cid} work comparison: {line}")
    # ranked lists "A\ (0.5)<C\ (0.70711)<..." must be ascending
    if "<" in line and re.search(r"\\ \([0-9.]+\)<", line):
        vals = [float(x) for x in re.findall(r"\\ \(([0-9.]+)\)", line)]
        n_checked += 1
        need(all(a < b for a, b in zip(vals, vals[1:])), f"{cid} ranking order: {line}")
    # threshold lines "f(0.2)=1"
    for mm in re.finditer(r"f\((-?[0-9.]+)\)=([01])", line):
        n_checked += 1
        need(int(float(mm.group(1)) >= 0) == int(mm.group(2)), f"{cid} threshold: {line}")

# ---- structure and wording ----
KEYS = ["id", "title", "topic", "context", "unit", "table", "tasks", "hypotheses", "symbols", "steps", "conclusion", "source",
        "lookup", "values", "module", "tolerance", "answerName", "answer"]
need(list(REF["cases"][0].keys()) == KEYS, "reference key set changed")
ids = [c["id"] for c in D["cases"]]
need(len(ids) == 10 and len(set(ids)) == 10 and all(i.startswith("n23-b-") for i in ids), "case ids")
need(set(ids) == set(RAW), "case ids differ from the checked list")
need(len({c["title"] for c in D["cases"]}) == 10, "titles not unique")
count = {}
BANNED = r"picture|professor|lecture|slide|session|\bsimply\b|\bjust\b|note that|recall that"
for c in D["cases"]:
    cid = c["id"]; count[c["topic"]] = count.get(c["topic"], 0) + 1
    need(list(c.keys()) == KEYS, cid + " key set differs from the reference cases")
    need(c["topic"] in METHODS and c["module"] == 23 and c["source"] == "Original neuroscience practice example", cid + " topic/module/source")
    need(c["hypotheses"] is None and c["lookup"] is None, cid + " hypotheses/lookup must be null as in the reference")
    if c["topic"] in ("s23knn", "s23confusion", "s23sensspec"):
        need(c["symbols"] == REFCASE[c["topic"]][0]["symbols"], cid + " symbols differ from the reference case")
    if c["topic"] == "s23scaling" and "min" in c["values"]:
        need(c["symbols"] == REFCASE["s23scaling"][0]["symbols"], cid + " symbols differ from the reference case")
    need(len(c["steps"]) >= min(len(r["steps"]) for r in REFCASE[c["topic"]]), cid + " fewer steps than the reference case")
    need(abs(c["tolerance"] - max(0.005 * abs(c["answer"]), 0.001)) < 1e-12, cid + " tolerance")
    texts = [c["context"], c["conclusion"], c["title"]] + c["tasks"] + [s["words"] for s in c["steps"]]
    # context and tasks keep the course's own punctuation ("differences in scale; the scaled data
    # are unitless", "(training set):"). Colons and semicolons stay banned in conclusion and step words.
    for tx in [c["conclusion"]] + [s["words"] for s in c["steps"]]:
        need(":" not in tx and ";" not in tx, f"{cid} colon or semicolon in: {tx[:60]}")
    for tx in texts:
        need(not re.search(BANNED, tx, re.I), f"{cid} banned word in: {tx[:60]}")
    for s in c["steps"]:
        need(s["title"] and s["general"] and s["work"] and s["words"], cid + " empty step field")
        for i, w in enumerate(s["work"]):
            check_work(cid, w)
            if w.startswith("=") and i:  # continuation line, check it against the end of the previous line
                check_work(cid, s["work"][i - 1].split("=")[-1] + w)
    check_case(c)
need(count == WANT_TOPICS, f"topic counts {count}")

qs = D["questions"]
need([q["id"] for q in qs] == [f"m2-n23-qb{i:02d}" for i in range(1, 11)], "question ids")
for q in qs:
    need(q["module"] == 23 and q["topic"] in METHODS, q["id"] + " module/topic")
    need(q["case"] is None or q["case"] in ids, q["id"] + " case")
    need(len(q["options"]) == 4 and len(set(q["options"])) == 4 and q["correct"] in range(4), q["id"] + " options")
    need(1 <= len([s for s in re.split(r"(?<=[.?])\s+", q["why"]) if s]) <= 3 and q["equations"], q["id"] + " why/equations")
    need(not re.search(BANNED, q["stem"] + q["why"] + " ".join(q["options"]), re.I), q["id"] + " banned word")
    need(":" not in q["why"] and ";" not in q["why"], q["id"] + " colon or semicolon in why")
    for e in q["equations"]: check_work(q["id"], e)
need(sum(q["case"] is not None for q in qs) == 6, "numeric/conceptual split should be 6/4")
need({q["correct"] for q in qs} == {0, 1, 2, 3}, "correct index is not varied")
need({q["topic"] for q in qs} == METHODS, "every method should have a quiz question")
# numeric keys of the quiz, recomputed from raw inputs
def opt(i): return qs[i - 1]["options"][qs[i - 1]["correct"]]
def num(s): return float(re.findall(r"-?[0-9]*\.?[0-9]+", s)[-1])
need(abs(num(opt(1)) - math.dist([0.5, 0], [1, -0.5])) < 1e-5, "qb01 key")
need(opt(2).startswith("Clarinet") and abs(num(opt(2)) - 3 / 5) < 1e-9, "qb02 key")
need(abs(num(opt(3)) - (61.37 - 4.2) / (152.6 - 4.2)) < 1e-5, "qb03 key")
need(abs(num(opt(5)) - 1976 / 2000) < 1e-9, "qb05 key")
need(abs(num(opt(6)) - 20 / 36) < 1e-5, "qb06 key")
need(abs(num(opt(8)) - expit(-3.1 + 6.2 * 0.7 - 1.8 * 0.4)) < 1e-5, "qb08 key")
need(opt(4).startswith("False positive") and opt(7) == "Sensitivity" and num(opt(9)) == 1.0 and "reaction time" in opt(10), "conceptual keys")
# the stated distractors of the numeric questions come from the named mistakes
need(abs(num(qs[2]["options"][1]) - 61.37 / 152.6) < 1e-5 and abs(num(qs[2]["options"][2]) - 57.17 / 152.6) < 1e-5, "qb03 distractors")
need(abs(num(qs[7]["options"][2]) - expit(6.2 * 0.7 - 1.8 * 0.4)) < 1e-5, "qb08 distractor")
need(abs(num(qs[5]["options"][3]) - 20 / 26) < 1e-5, "qb06 distractor")
need(isinstance(D.get("notes"), list) and D["notes"], "notes")

if errors:
    print("\n".join("FAIL " + e for e in errors)); print(f"{len(errors)} problems"); sys.exit(1)
print(f"session23b OK: {len(D['cases'])} cases, {len(qs)} questions, {n_checked} work-line equalities and comparisons re-evaluated")
