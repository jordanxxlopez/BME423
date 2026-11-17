#!/usr/bin/env python3
"""Independent check of authoring/module2/practice/session22.json.

Recomputes every answer and every `values` entry from raw inputs typed here (not read from the
work lines) with NumPy/SciPy, re-evaluates the arithmetic of every work line, checks that every
k-Means assignment and every K-NN ranking is tie-free, checks the R kmeans() tables against the
exact optimum for each k, checks ids, topics, keys and step structure against the lecture cases,
and scans the solution text for colons, semicolons and banned words. Session 22 has no printed
critical values, so every lookup must be null. Exits 0 when all checks pass.

Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session22.py
"""
import itertools
import json
import math
import os
import re
import sys
from collections import Counter

import numpy as np
from scipy.spatial.distance import cdist, minkowski

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "session22.json"), encoding="utf-8"))
REF = json.load(open(os.path.join(HERE, "..", "neuro", "ref", "session22.json"), encoding="utf-8"))
CASES = {c["id"]: c for c in D["cases"]}
REF_CASE = {c["id"]: c for c in REF["cases"]}
# reference (lecture) case whose keys, steps and notation each method copies
MODEL = {"s22distance": "s22-medicine-distance", "s22kmeans": "s22-exercise-sbp-crp", "s22withinss": "s22-ages-withinss", "s22knn": "s22-mesh-knn"}
errors = []
nchecks = 0


def ok(cond, msg):
    global nchecks
    nchecks += 1
    if not cond:
        errors.append(msg)


def close(a, b, t=1e-9):
    return abs(float(a) - float(b)) <= t * max(1.0, abs(float(a)), abs(float(b)))


# ---------------------------------------------------------------- raw inputs (typed here)
DIST = {  # id -> (q, r, graded)
    "p22-hydrogel-scaffold-distance": ([12, 85], [18, 77], "euclidean"),
    "p22-cardiometabolic-profile-distance": ([2, 5, 3], [6, 2, 4], "minkowski3"),
}
KM = {  # id -> (points, initial centroids, graded (cluster, coordinate))
    "p22-hba1c-bmi-kmeans": ([[2, 2], [3, 1], [6, 7], [8, 6]], [[1, 3], [4, 4]], (2, 0)),
    "p22-heart-rate-vo2max-kmeans": ([[1, 6], [2, 8], [4, 4], [7, 2], [8, 3]], [[3, 7], [6, 4]], (2, 0)),
    "p22-platelet-mpv-kmeans": ([[2, 7], [3, 8], [5, 6], [6, 2], [7, 3], [9, 1]], [[4, 8], [5, 4]], (2, 1)),
}
WS = {  # id -> (data, R starting centres for k = 2, chosen k, R betweenss as printed)
    "p22-wound-closure-withinss": ([9, 10, 12, 13, 25, 27, 28, 30, 31, 33], [10, 20], 2, "777.6"),
    "p22-rescue-inhaler-withinss": ([1, 2, 2, 3, 8, 9, 10, 16, 17, 19], [5, 17], 3, "319.4333"),
}
KNN = {  # id -> (training rows, new object, chosen class, votes)
    "p22-breast-lesion-knn": ([("A", 2, 2, "Benign"), ("B", 3, 4, "Benign"), ("C", 4, 7, "Malignant"), ("D", 7, 6, "Malignant"), ("E", 6, 3, "Benign")], [5, 4], "Benign", 2),
    "p22-sepsis-lactate-wbc-knn": ([("A", 8, 7, "Sepsis"), ("B", 7, 9, "Sepsis"), ("C", 6, 6, "Sepsis"), ("D", 2, 3, "No sepsis"), ("E", 3, 1, "No sepsis"), ("F", 4, 4, "No sepsis")], [7, 6], "Sepsis", 3),
    "p22-kidney-stone-knn": ([("A", 4, 5, "Uric acid"), ("B", 5, 5, "Uric acid"), ("C", 3, 6, "Uric acid"), ("D", 7, 6, "Calcium oxalate"), ("E", 9, 7, "Calcium oxalate"), ("F", 10, 6, "Calcium oxalate")], [6, 6], "Uric acid", 2),
}


def tol(a):
    return max(0.001, abs(a) * 0.005)


def lloyd_step(X, C):
    d = cdist(X, C)
    srt = np.sort(d, axis=1)
    tie_free = bool(np.all(srt[:, 1] - srt[:, 0] > 1e-9))
    lab = d.argmin(axis=1)
    newC = np.array([X[lab == j].mean(axis=0) for j in range(len(C))])
    return d, lab + 1, newC, tie_free


# ---------------------------------------------------------------- distances
for cid, (q, r, graded) in DIST.items():
    c, v = CASES[cid], CASES[cid]["values"]
    ok(c["topic"] == "s22distance", f"{cid} topic")
    ok([row[1:] for row in c["table"]["rows"]] == [q, r], f"{cid} table")
    e, m1, m3 = minkowski(q, r, 2), minkowski(q, r, 1), minkowski(q, r, 3)
    ok(v["q"] == q and v["r"] == r, f"{cid} q/r")
    ok(close(v["euclidean"], e) and close(v["manhattan"], m1) and close(v["minkowski3"], m3), f"{cid} distances")
    ok(m1 >= e >= m3, f"{cid} ordering")
    ans = {"euclidean": e, "minkowski3": m3}[graded]
    ok(close(c["answer"], ans) and close(c["tolerance"], tol(ans)), f"{cid} answer/tolerance")
    ok(c["answerName"] == {"euclidean": "Distance (Euclidean)", "minkowski3": "Distance (Minkowski, p = 3)"}[graded], f"{cid} answerName")
    ok(set(v) == {"q", "r", "euclidean", "manhattan", "minkowski3"}, f"{cid} values keys")

# ---------------------------------------------------------------- single k-Means iteration
for cid, (pts, C0, (gj, gk)) in KM.items():
    c, v = CASES[cid], CASES[cid]["values"]
    X, C0 = np.array(pts, float), np.array(C0, float)
    ok(c["topic"] == "s22kmeans", f"{cid} topic")
    ok([row[1:] for row in c["table"]["rows"]] == pts and [row[0] for row in c["table"]["rows"]] == list(range(1, len(pts) + 1)), f"{cid} table")
    ok(3 <= len(pts) <= 10 and all(float(a).is_integer() and 0 < a < 10 for p in pts for a in p), f"{cid} small integers")
    d, lab, newC, tie_free = lloyd_step(X, C0)
    ok(tie_free, f"{cid} a point is equally close to both centroids")
    ok(len(set(lab.tolist())) == 2, f"{cid} empty cluster")
    ok(v["points"] == pts and v["initial"] == C0.astype(int).tolist(), f"{cid} points/initial")
    ok(np.allclose(v["distC1"], d[:, 0]) and np.allclose(v["distC2"], d[:, 1]), f"{cid} distances")
    ok(v["labels"] == lab.tolist(), f"{cid} labels")
    ok(np.allclose(v["newC1"], newC[0]) and np.allclose(v["newC2"], newC[1]), f"{cid} new centroids")
    ans = newC[gj - 1][gk]
    feat = c["table"]["headers"][1 + gk]
    ok(c["answerName"] == f"New centroid C{gj} {feat} coordinate" and close(c["answer"], ans) and close(c["tolerance"], tol(ans)), f"{cid} answer")
    h = c["table"]["headers"]
    for j in range(2):  # the task states each initial centroid in the exercise form "C1: SBP = 2, CRP = 2"
        ok(f"C{j+1}: {h[1]} = {int(C0[j, 0])}, {h[2]} = {int(C0[j, 1])}" in c["tasks"][0], f"{cid} initial centroid C{j+1} not in task")
    ok("perform a single iteration of the k-Means algorithm with k = 2. Use the Euclidian distance formula for your calculations." in c["tasks"][0], f"{cid} exercise wording")
    ok("AND the new centroids of the two updated clusters after this single iteration" in c["tasks"][1], f"{cid} exercise wording 2")
    ok("the scaled data are unitless" in c["context"], f"{cid} scaling sentence")
    ok(f"C1 = ({newC[0][0]:.5g}, {newC[0][1]:.5g})" in c["conclusion"] and f"C2 = ({newC[1][0]:.6g}, {newC[1][1]:.6g})" in c["conclusion"], f"{cid} conclusion centroids")

# ---------------------------------------------------------------- withinss and the number of clusters


def best(x, k):  # optimal 1-D k-means = best contiguous split of the sorted data
    xs = np.sort(np.asarray(x, float))
    out = None
    for cuts in itertools.combinations(range(1, len(xs)), k - 1):
        g = np.split(xs, cuts)
        w = [float(((a - a.mean()) ** 2).sum()) for a in g]
        if out is None or sum(w) < sum(out[2]) - 1e-12:
            out = (g, [len(a) for a in g], w)
    return out


def r7(x):  # R prints 7 significant digits
    return float(f"{x:.7g}")


for cid, (x, start, kchosen, rbtw) in WS.items():
    c, v = CASES[cid], CASES[cid]["values"]
    xa = np.array(x, float)
    ok(c["topic"] == "s22withinss", f"{cid} topic")
    ok(v["ages"] == x and all(str(n) in c["context"] for n in x), f"{cid} data")
    ok(f"c({start[0]}, {start[1]})" in c["context"], f"{cid} starting centres in context")
    # k = 2 from the stated starting centres: run Lloyd to convergence, compare with the optimum
    C = np.array(start, float).reshape(-1, 1)
    X1 = xa.reshape(-1, 1)
    for _ in range(50):
        _, lab, Cn, tf = lloyd_step(X1, C)
        ok(tf, f"{cid} tie in the hand k = 2 run from the starting centres")
        if np.allclose(Cn, C):
            break
        C = Cn
    g2, s2, w2 = best(x, 2)
    ok(sorted([sorted(xa[lab == 1].tolist()), sorted(xa[lab == 2].tolist())]) == sorted([sorted(a.tolist()) for a in g2]), f"{cid} k=2 from the starting centres is not the optimum")
    cl = [sorted(xa[lab == j].tolist()) for j in (1, 2)]
    ok(all((", ".join(str(int(a)) for a in g) + " (centroid") in c["context"] for g in cl), f"{cid} clusters in context")
    ss1, ss2 = [float(((np.array(g) - np.mean(g)) ** 2).sum()) for g in cl]
    tss = float(((xa - xa.mean()) ** 2).sum())
    ok(close(v["ss1"], ss1) and close(v["ss2"], ss2) and close(v["totWithin"], ss1 + ss2), f"{cid} ss1/ss2/totWithin")
    ok(close(v["totalSS"], tss) and close(v["between"], tss - ss1 - ss2), f"{cid} totalSS/between")
    ok(close(float(rbtw), r7(tss - ss1 - ss2), 1e-12), f"{cid} R betweenss {rbtw}")
    tots = [tss]
    rows = c["table"]["rows"]
    ok([r[0] for r in rows] == [1, 2, 3, 4], f"{cid} k column")
    for k in (2, 3, 4):
        tots.append(sum(best(x, k)[2]))
    for row, k in zip(rows, (1, 2, 3, 4)):
        g, sz, w = best(x, k) if k > 1 else ([xa], [len(x)], [tss])
        if k == 2:  # R lists the clusters in the order of the starting centres
            sz, w = [len(a) for a in cl], [ss1, ss2]
        ok(sorted(int(a) for a in row[1].split()) == sorted(sz), f"{cid} k={k} size {row[1]} vs {sz}")
        printed = [float(a) for a in row[2].split()]
        ok(sorted(printed) == sorted(r7(a) for a in w) or all(close(a, b, 6e-7) for a, b in zip(sorted(printed), sorted(w))), f"{cid} k={k} withinss {row[2]} vs {w}")
        # cluster sizes and withinss belong together (same cluster in the same position)
        pairs_printed = sorted(zip([int(a) for a in row[1].split()], printed))
        pairs_true = sorted(zip(sz, [r7(a) for a in w]))
        ok(all(a[0] == b[0] and close(a[1], b[1], 1e-6) for a, b in zip(pairs_printed, pairs_true)), f"{cid} k={k} size/withinss pairing")
        ok(close(row[3], r7(sum(w)), 1e-9), f"{cid} k={k} tot.withinss {row[3]} vs {sum(w)}")
    ok(close(v["totWithinK3"], r7(tots[2])) and close(v["totWithinK4"], r7(tots[3])), f"{cid} totWithinK3/K4")
    drops = -np.diff(tots)
    elbow = 2 if drops[0] > 10 * drops[1] else 3
    if elbow == 3:
        ok(drops[1] > 10 * drops[2], f"{cid} elbow at 3 not clear {drops}")
    ok(v["chosenK"] == kchosen == elbow, f"{cid} chosen k {v['chosenK']} vs elbow {elbow}")
    ok(close(c["answer"], ss1 + ss2) and close(c["tolerance"], tol(ss1 + ss2)) and c["answerName"] == "tot.withinss", f"{cid} answer")
    ok(f"k = {kchosen} is chosen" in c["conclusion"], f"{cid} conclusion k")
ok(sorted(v[2] for v in WS.values()) == [2, 3], "one elbow at k = 2 and one at k = 3")

# ---------------------------------------------------------------- K-NN
for cid, (train, new, win, votes) in KNN.items():
    c, v = CASES[cid], CASES[cid]["values"]
    ok(c["topic"] == "s22knn", f"{cid} topic")
    ok([list(r) for r in c["table"]["rows"]] == [list(t) for t in train], f"{cid} table")
    ok(4 <= len(train) <= 6 and len({t[3] for t in train}) == 2, f"{cid} training set shape")
    names = [t[0] for t in train]
    P = np.array([t[1:3] for t in train], float)
    d = cdist(P, np.array([new], float)).ravel()
    order = np.argsort(d)
    ok(np.min(np.diff(d[order])) > 1e-6, f"{cid} tied distances")
    ok(v["newMesh"] == new, f"{cid} new object")
    ok(all(re.search(rf"\b{n}\b", c["context"] + " " + c["tasks"][0]) for n in new), f"{cid} new object not in question")
    ok(set(v["distances"]) == set(names) and all(close(v["distances"][n], d[i]) for i, n in enumerate(names)), f"{cid} distances")
    ok(all(v["ranks"][names[i]] == int(np.where(order == i)[0][0]) + 1 for i in range(len(names))), f"{cid} ranks")
    nb = [names[i] for i in order[:3]]
    ok(v["neighbors"] == nb and v["K"] == 3, f"{cid} neighbors")
    cls = [train[i][3] for i in order[:3]]
    w = max(set(cls), key=cls.count)
    ok(w == win and cls.count(w) == votes, f"{cid} vote {cls}")
    p = cls.count(w) / 3
    ok(close(v["pFail"], p) and close(c["answer"], p) and close(c["tolerance"], tol(p)) and c["answerName"] == "Probability", f"{cid} probability")
    ok(f"classified as {w}" in c["conclusion"] and f"{votes}/3" in c["conclusion"], f"{cid} conclusion")
    ok("with the following results (training set):" in c["context"], f"{cid} training set wording")
    ok(re.search(rf"classify the new \w+ as {re.escape(sorted({t[3] for t in train}, key=lambda s: [t[3] for t in train].index(s))[0])} or ", c["tasks"][0]) is not None
       and "Use a K-NN classification with K = 3." in c["tasks"][0], f"{cid} K-NN wording")
outvoted = [cid for cid, (train, new, win, votes) in KNN.items()
            if train[int(np.argmin(cdist(np.array([t[1:3] for t in train], float), np.array([new], float)).ravel()))][3] != win]
ok(outvoted == ["p22-kidney-stone-knn"], f"exactly the kidney stone case has its nearest neighbor outvoted {outvoted}")

# ---------------------------------------------------------------- structure and wording
methods = {m["id"] for m in REF["methods"]}
ids = [c["id"] for c in D["cases"]]
ok(len(ids) == 10 and len(set(ids)) == 10 and all(i.startswith("p22-") for i in ids), "case ids")
ok(set(ids) == set(DIST) | set(KM) | set(WS) | set(KNN), "every case is recomputed by this script")
ok(Counter(c["topic"] for c in D["cases"]) == Counter({"s22distance": 2, "s22kmeans": 3, "s22withinss": 2, "s22knn": 3}), "topic counts")
ok(len({c["title"] for c in D["cases"]}) == 10, "titles unique")
ok(D["questions"] == [] and isinstance(D["notes"], list) and D["notes"], "questions empty, notes present")
for c in D["cases"]:
    rc = REF_CASE[MODEL[c["topic"]]]
    cid = c["id"]
    ok(c["topic"] in methods and c["module"] == 22 and c["source"] == "Original practice example in the course style", f"{cid} topic/module/source")
    ok(c["lookup"] is None and c["hypotheses"] is None, f"{cid} lookup/hypotheses must be null")
    ok(set(c.keys()) == set(rc.keys()), f"{cid} keys differ from ref {set(c) ^ set(rc)}")
    ok(set(c["values"].keys()) == set(rc["values"].keys()), f"{cid} values keys differ {set(c['values']) ^ set(rc['values'])}")
    ok(c["symbols"] == rc["symbols"], f"{cid} symbols differ from ref")
    ok(len(c["steps"]) >= len(rc["steps"]), f"{cid} too few steps")
    if c["topic"] == "s22kmeans":  # one distance step per point, then labels and centroids, as in the exercise case
        want = [f"Distances for {c['steps'][0]['title'].split()[2]} {i}" for i in range(1, len(c["table"]["rows"]) + 1)] + ["Assign labels", "New centroids"]
        ok([s["title"] for s in c["steps"]] == want, f"{cid} step titles")
        gens = [s["general"] for s in c["steps"]]
        ok(all(g == rc["steps"][0]["general"] for g in gens[:-2]) and gens[-2] == rc["steps"][-2]["general"] and gens[-1] == rc["steps"][-1]["general"], f"{cid} general equations")
    else:
        ok([s["title"] for s in c["steps"]] == [s["title"] for s in rc["steps"]], f"{cid} step titles")
        for s, rs in zip(c["steps"], rc["steps"]):
            same_gen = s["general"] == rs["general"]
            ok(same_gen or c["topic"] == "s22knn" and s["title"] in ("Set up", "Read the neighbor classes", "Classify and give the probability"), f"{cid} general differs in {s['title']}")
    for s in c["steps"]:
        ok(bool(s["title"] and s["general"] and s["work"] and s["words"]), f"{cid} empty step part")
    solution_text = [c["conclusion"]] + [s["words"] for s in c["steps"]]
    question_text = [c["context"], c["title"]] + c["tasks"]
    for t in solution_text:
        ok(":" not in t and ";" not in t, f"{cid} colon/semicolon in: {t[:70]}")
    for t in solution_text + question_text:
        ok(not re.search(r"\bpictur", t, re.I) and not re.search(r"professor|lecture|slide|session|\bsimply\b|\bjust\b|note that|recall that", t, re.I), f"{cid} banned word in: {t[:70]}")
    ok(not re.search(r"\b(19|20)\d\d\b", " ".join(question_text)), f"{cid} a year appears in the question")

# ---------------------------------------------------------------- arithmetic of every work line


def to_py(s):
    s = s.replace("\\left", "").replace("\\right", "").replace("\\ ", "")
    for _ in range(6):
        s = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"((\1)/(\2))", s)
        s = re.sub(r"\\sqrt\{([^{}]*)\}", r"sqrt(\1)", s)
    s = s.replace("^{1/3}", "**(1/3)")
    s = re.sub(r"\^(\d)", r"**\1", s)
    s = re.sub(r"\|([^|]+)\|", r"abs(\1)", s)
    return s


def numeric(s):
    p = to_py(s).strip()
    if not re.fullmatch(r"[0-9+\-*/(). ]*((sqrt|abs)[0-9+\-*/(). ]*)*", p) or not re.search(r"\d", p):
        return None
    try:
        r = eval(p, {"__builtins__": {}}, {"sqrt": math.sqrt, "abs": abs})
    except Exception:
        return None
    return float(r) if isinstance(r, (int, float)) else None


def split_top(s, sep):
    out, depth, cur, i = [], 0, "", 0
    while i < len(s):
        ch = s[i]
        if ch in "({":
            depth += 1
        elif ch in ")}":
            depth -= 1
        if depth == 0 and s.startswith(sep, i):
            out.append(cur)
            cur = ""
            i += len(sep)
            continue
        cur += ch
        i += 1
    return out + [cur]


NWORK = 0


def check_work(cid, line):
    global NWORK
    m = re.fullmatch(r"C_\d=\\left\((\\frac\{[^{}]*\}\{\d+\}),(\\frac\{[^{}]*\}\{\d+\})\\right\)=\(([\d.]+),([\d.]+)\)", line)
    if m:  # centroid written as a pair of means
        NWORK += 1
        ok(abs(numeric(m.group(1)) - float(m.group(3))) < 6e-6 and abs(numeric(m.group(2)) - float(m.group(4))) < 6e-6, f"{cid} work centroid pair {line}")
        return
    m = re.fullmatch(r"y_\d=[12]\\ \(([\d.]+)<([\d.]+)\)", line)
    if m:
        NWORK += 1
        ok(float(m.group(1)) < float(m.group(2)), f"{cid} work comparison false {line}")
        return
    m = re.fullmatch(r"([A-Z])\\ \(([\d.]+)\)(<[A-Z]\\ \([\d.]+\))+", line)
    if m:  # ranking line
        NWORK += 1
        nums = [float(a) for a in re.findall(r"\(([\d.]+)\)", line)]
        ok(all(a < b for a, b in zip(nums, nums[1:])), f"{cid} ranking not increasing {line}")
        return
    for part in split_top(line, ",\\ "):
        for rel, op in (("\\ge", lambda a, b: a >= b - 1e-12), ("\\to", lambda a, b: a > b)):
            if rel in part and "=" not in part:
                nums = [numeric(p) for p in part.split(rel)]
                if all(n is not None for n in nums) and len(nums) > 1:
                    NWORK += 1
                    ok(all(op(a, b) for a, b in zip(nums, nums[1:])), f"{cid} work relation false {line}")
        sides = [numeric(x) for x in split_top(part, "=")]
        vals = [x for x in sides if x is not None]
        if len(vals) > 1:
            NWORK += 1
            ok(all(abs(a - vals[0]) <= max(6e-5, 6e-6 * abs(vals[0])) for a in vals[1:]), f"{cid} work arithmetic {line} {vals}")


for c in D["cases"]:
    for s in c["steps"]:
        for w in s["work"]:
            check_work(c["id"], w)
ok(NWORK >= 70, f"too few work lines were evaluated ({NWORK})")

if errors:
    print(f"FAILED {len(errors)} of {nchecks} checks")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print(f"OK practice session22: {len(D['cases'])} cases, {nchecks} checks passed, {NWORK} numeric work lines re-evaluated, no printed critical values in this session")
