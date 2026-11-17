#!/usr/bin/env python3
"""Independent check of authoring/module2/practice/session21.json.

Recomputes every answer and every `values` entry from raw inputs typed here (not read from the
work lines) with NumPy/SciPy/statsmodels, checks the printed critical values against SciPy,
re-evaluates the arithmetic of every work line, checks ids, topics, keys and step structure
against the lecture cases, and scans the solution text for colons, semicolons and banned words.
Exits 0 when all checks pass.

Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/practice/check_session21.py
"""
import json
import math
import os
import re
import sys
from collections import Counter

import numpy as np
from scipy import stats
from statsmodels.stats.contingency_tables import mcnemar

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "session21.json"), encoding="utf-8"))
REF = json.load(open(os.path.join(HERE, "..", "neuro", "ref", "session21.json"), encoding="utf-8"))
CASES = {c["id"]: c for c in D["cases"]}
errors = []
nchecks = 0


def ok(cond, msg):
    global nchecks
    nchecks += 1
    if not cond:
        errors.append(msg)


def close(a, b, tol=1e-9):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


# ---------------------------------------------------------------- raw inputs (typed here, not read from the JSON)
RM = {
    "p21-walking-glucose-rmanova": [[118, 112, 106], [124, 121, 113], [110, 104, 101], [131, 122, 117], [115, 113, 104]],
    "p21-carpal-grip-rmanova": [[21, 23, 27], [30, 31, 36], [18, 20, 23], [26, 25, 31], [23, 26, 28], [29, 28, 35]],
    "p21-hemoglobin-meters-rmanova": [[13.8, 14.3, 13.5], [12.2, 12.4, 12.6], [15.1, 15.4, 14.7], [11.6, 12.3, 11.8]],
}
RM_REJECT = {"p21-walking-glucose-rmanova": True, "p21-carpal-grip-rmanova": True, "p21-hemoglobin-meters-rmanova": False}
HOLM = {  # case id -> (parent rmAnova case, condition names)
    "p21-walking-glucose-holm": ("p21-walking-glucose-rmanova", ["Baseline", "6 weeks", "12 weeks"]),
    "p21-carpal-grip-holm": ("p21-carpal-grip-rmanova", ["1 month", "3 months", "6 months"]),
}
MC = {  # case id -> (a, b, c, d, topic, reject)
    "p21-iron-anemia-mcnemar": (8, 13, 2, 11, "s21mcnemar", True),
    "p21-low-salt-hypertension-mcnemar": (9, 7, 3, 7, "s21mcnemar", False),
    "p21-cardiac-rehab-ischemia-mcnemar": (6, 15, 4, 13, "s21mcnemar", True),
    "p21-troponin-poc-diagnostic": (9, 1, 13, 17, "s21diagnostic", True),
    "p21-smartwatch-af-diagnostic": (6, 10, 3, 11, "s21diagnostic", False),
}
# printed class tables (read from the PDF page images)
F_PRINTED = {6: (5.14, 10.92), 8: (4.46, 8.65), 10: (4.10, 7.56)}
T_COLS = [0.50, 0.20, 0.10, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001]
T_PRINTED = {6: [0.718, 1.440, 1.943, 2.447, 3.143, 3.707, 4.317, 5.208, 5.959],
             8: [0.706, 1.397, 1.860, 2.306, 2.896, 3.355, 3.833, 4.501, 5.041],
             10: [0.700, 1.372, 1.812, 2.228, 2.764, 3.169, 3.581, 4.144, 4.587]}
CHI_PRINTED = {0.10: 2.706, 0.05: 3.841, 0.025: 5.024, 0.01: 6.635, 0.005: 7.879}

# printed tables agree with SciPy to the printed rounding
for df, (c05, c01) in F_PRINTED.items():
    ok(abs(stats.f.isf(0.05, 2, df) - c05) < 0.006 and abs(stats.f.isf(0.01, 2, df) - c01) < 0.006, f"F table row {df}")
for df, row in T_PRINTED.items():
    for a, v in zip(T_COLS, row):
        ok(abs(stats.t.isf(a / 2, df) - v) < 0.0006, f"t table row {df} col {a}")
for a, v in CHI_PRINTED.items():
    ok(abs(stats.chi2.isf(a, 1) - v) < 0.0006, f"chi-square table col {a}")


def rm_anova(x):
    x = np.asarray(x, float)
    n, m = x.shape
    S, T, G = x.mean(axis=1), x.mean(axis=0), x.mean()
    sub_ss = ((x - S[:, None]) ** 2).sum(axis=1)
    ssw = sub_ss.sum()
    sst = n * ((T - G) ** 2).sum()
    ssb = m * ((S - G) ** 2).sum()
    sstot = ((x - G) ** 2).sum()
    ssr = sstot - ssb - sst  # independent route to the residual
    dft, dfr = m - 1, (n - 1) * (m - 1)
    return dict(n=n, m=m, S=S, T=T, G=G, sub_ss=sub_ss, ssw=ssw, sst=sst, ssb=ssb, sstot=sstot, ssr=ssr,
                dft=dft, dfr=dfr, mst=sst / dft, msr=ssr / dfr, F=(sst / dft) / (ssr / dfr))


def check_lookup(cid, lk, path, row, column, value):
    ok(lk["path"] == path and lk["page"] == 1 and str(lk["row"]) == str(row) and lk["column"] == column
       and close(lk["value"], value), f"{cid} lookup {lk}")


# ---------------------------------------------------------------- repeated-measures ANOVA
for cid, raw in RM.items():
    c, v = CASES[cid], CASES[cid]["values"]
    r = rm_anova(raw)
    ok(c["topic"] == "s21rmAnova", f"{cid} topic")
    ok(np.allclose([row[1:] for row in c["table"]["rows"]], raw), f"{cid} table differs from raw data")
    ok(4 <= r["n"] <= 6 and r["m"] == 3, f"{cid} design size")
    ok(v["n"] == r["n"] and v["m"] == r["m"] and v["dfTreat"] == r["dft"] and v["dfRes"] == r["dfr"], f"{cid} n/m/df")
    for key, val in [("subjectMeans", r["S"]), ("treatmentMeans", r["T"]), ("subjectSS", r["sub_ss"])]:
        ok(np.allclose(v[key], val, rtol=1e-9, atol=1e-9), f"{cid} {key}")
    for key, val in [("grandMean", r["G"]), ("ssWithin", r["ssw"]), ("ssTreat", r["sst"]), ("ssRes", r["ssr"]),
                     ("ssBetween", r["ssb"]), ("ssTotal", r["sstot"]), ("msTreat", r["mst"]), ("msRes", r["msr"]), ("F", r["F"])]:
        ok(abs(v[key] - val) < 1e-8 * max(1, abs(val)), f"{cid} {key}: {v[key]} vs {val}")
    ok(close(r["ssw"], r["sst"] + r["ssr"], 1e-9), f"{cid} partition")
    p = stats.f.sf(r["F"], r["dft"], r["dfr"])
    ok(abs(v["exactP"] - p) < 1e-9, f"{cid} exactP")
    c05, c01 = F_PRINTED[r["dfr"]]
    ok(v["critical"] == c05 and v["critical01"] == c01, f"{cid} critical values")
    ok(v["reject"] == (r["F"] > c05) == RM_REJECT[cid] == (p < 0.05), f"{cid} decision")
    want = "P<0.01" if r["F"] > c01 else ("0.01<P<0.05" if r["F"] > c05 else "P>0.05")
    ok(v["pRange"] == want, f"{cid} pRange")
    ok((p < 0.01) == (want == "P<0.01") and (p > 0.05) == (want == "P>0.05"), f"{cid} pRange vs exact P")
    check_lookup(cid, c["lookup"], "sources/tables/F_table.pdf", r["dfr"], "2 (0.05 lightface)", c05)
    ok(c["lookup"]["actualDf"] == [2, r["dfr"]] and c["lookup"]["approximation"] is False, f"{cid} lookup df")
    ok(c["answerName"] == "F statistic" and abs(c["answer"] - r["F"]) <= c["tolerance"], f"{cid} answer")
    ok(("Reject H0" in c["conclusion"]) == RM_REJECT[cid] and ("Do not reject H0" in c["conclusion"]) == (not RM_REJECT[cid]), f"{cid} conclusion decision")
    # cross-check with a two-way additive model (subject + condition) fitted by least squares
    x = np.asarray(raw, float)
    n, m = x.shape
    X = np.zeros((n * m, 1 + (n - 1) + (m - 1)))
    X[:, 0] = 1
    for s in range(n):
        for t in range(m):
            i = s * m + t
            if s:
                X[i, s] = 1
            if t:
                X[i, n - 1 + t] = 1
    y = x.reshape(-1)
    res_full = ((y - X @ np.linalg.lstsq(X, y, rcond=None)[0]) ** 2).sum()
    Xr = X[:, :n]
    res_red = ((y - Xr @ np.linalg.lstsq(Xr, y, rcond=None)[0]) ** 2).sum()
    F_ls = ((res_red - res_full) / (m - 1)) / (res_full / ((n - 1) * (m - 1)))
    ok(abs(F_ls - r["F"]) < 1e-6 * max(1, r["F"]), f"{cid} F vs least squares {F_ls}")

# ---------------------------------------------------------------- Holm
for cid, (parent, names) in HOLM.items():
    c, v = CASES[cid], CASES[cid]["values"]
    r = rm_anova(RM[parent])
    ok(c["topic"] == "s21holm", f"{cid} topic")
    ok(r["F"] > F_PRINTED[r["dfr"]][0] and CASES[parent]["values"]["reject"], f"{cid} parent ANOVA must reject")
    means = [round(float(t), 4) for t in r["T"]]
    msr = round(float(r["msr"]), 6)
    ok(list(v["means"].keys()) == names and np.allclose(list(v["means"].values()), means, atol=1e-12), f"{cid} means {v['means']} vs {means}")
    ok(np.allclose(means, r["T"], atol=1e-12), f"{cid} means are exact")
    ok(abs(v["msRes"] - msr) < 1e-12 and v["n"] == r["n"] and v["dfRes"] == r["dfr"], f"{cid} msRes/n/df")
    ok([row[1] for row in c["table"]["rows"]] == means and [row[0] for row in c["table"]["rows"]] == names, f"{cid} table")
    for num in means + [msr]:
        s = ("%.6f" % num).rstrip("0").rstrip(".")
        ok(s in c["context"], f"{cid} context lacks {s}")
    ok(("F = " + ("%.3f" % r["F"]).rstrip("0").rstrip(".")) in c["context"], f"{cid} context F")
    ok(f"DF_res = {r['dfr']}" in c["context"] and f"n = {r['n']}" in c["context"], f"{cid} context df/n")
    se = math.sqrt(2 * msr / r["n"])
    ok(abs(v["se"] - se) < 1e-12, f"{cid} se")
    tv = {}
    for i in range(3):
        for j in range(i + 1, 3):
            tv[f"{names[i]} vs {names[j]}"] = (means[i] - means[j]) / se
    order = sorted(tv, key=lambda k: -abs(tv[k]))
    ok(list(v["tValues"].keys()) == order, f"{cid} order of comparisons")
    for k in order:
        ok(abs(v["tValues"][k] - tv[k]) < 1e-9, f"{cid} t {k}")
        i, j = [names.index(z) for z in k.split(" vs ")]
        t_full = (r["T"][i] - r["T"][j]) / math.sqrt(2 * r["msr"] / r["n"])
        ok(abs(t_full - tv[k]) < 2e-3, f"{cid} rounded vs full t {k}")
    ok(np.allclose(v["holmAlphas"], [0.05 / 3, 0.05 / 2, 0.05]), f"{cid} holm alphas")
    row = T_PRINTED[r["dfr"]]
    cut = [row[5], row[4], row[3]]  # stricter printed columns 0.01, 0.02 and the 0.05 column
    out_tab, alive = {}, True
    for kk, k in enumerate(order):
        alive = alive and abs(tv[k]) > cut[kk]
        out_tab[k] = alive
    out_exact, alive = {}, True
    for kk, k in enumerate(order):
        pval = 2 * stats.t.sf(abs(tv[k]), r["dfr"])
        alive = alive and pval < 0.05 / (3 - kk)
        out_exact[k] = alive
    ok(out_tab == out_exact, f"{cid} bracketed table decision differs from exact Holm {out_tab} {out_exact}")
    # no |t| falls between the two printed columns that bracket a Holm level
    for kk, k in enumerate(order[:2]):
        lo, hi = (row[4], row[5]) if kk == 0 else (row[3], row[4])
        ok(not (lo < abs(tv[k]) < hi), f"{cid} |t| of {k} falls inside the bracket")
    ok(v["outcomes"] == out_tab and list(v["outcomes"].keys()) == order, f"{cid} outcomes")
    ok(c["answer"] == v["tValues"][order[0]] and abs(c["answer"] - tv[order[0]]) <= c["tolerance"], f"{cid} answer")
    ok(c["answerName"] == "t statistic (largest |t| comparison)", f"{cid} answerName")
    check_lookup(cid, c["lookup"], "sources/tables/t_table.pdf", r["dfr"], "0.01", row[5])
    ok(c["lookup"]["bracketValues"] == [row[4], row[5]] and c["lookup"]["approximation"] is True, f"{cid} lookup bracket")
    for st in c["steps"]:
        ct = st.get("classTable")
        if ct:
            ok(close(ct["value"], row[T_COLS.index(float(ct["column"]))]), f"{cid} classTable {ct}")
            for b, bv in zip(ct.get("bracket", []), ct.get("bracketValues", [])):
                ok(close(bv, row[T_COLS.index(float(b))]), f"{cid} bracket {b}")
    # the conclusion quotes each t and names which pairs are not shown to differ
    for k in order:
        ok(("%.3f" % tv[k]) in c["conclusion"] or ("%.3f" % abs(tv[k])) in c["conclusion"], f"{cid} conclusion lacks t of {k}")
ok(sum(not all(CASES[h]["values"]["outcomes"].values()) for h in HOLM) == 1, "exactly one Holm case stops before the last pair")

# ---------------------------------------------------------------- McNemar / diagnostic
for cid, (a, b, cc, d, topic, rej) in MC.items():
    c, v = CASES[cid], CASES[cid]["values"]
    ok(c["topic"] == topic, f"{cid} topic")
    ok([row[1:] for row in c["table"]["rows"]] == [[a, b], [cc, d]], f"{cid} table")
    N = a + b + cc + d
    ok(20 <= N <= 40 and (v["a"], v["b"], v["c"], v["d"], v["N"], v["df"]) == (a, b, cc, d, N, 1), f"{cid} counts")
    for num in (a, b, cc, d, N, a + b, cc + d):
        ok(re.search(rf"\b{num}\b", c["context"]) is not None, f"{cid} context lacks {num}")
    E = (b + cc) / 2
    chi = (abs(b - cc) - 1) ** 2 / (b + cc)  # algebraically the same Yates-corrected statistic
    chi_formula = (abs(b - E) - 0.5) ** 2 / E + (abs(cc - E) - 0.5) ** 2 / E
    sm = mcnemar(np.array([[a, b], [cc, d]]), exact=False, correction=True)
    ok(close(chi, chi_formula) and close(chi, sm.statistic), f"{cid} chi2 routes disagree")
    ok(close(v["E"], E) and close(v["chi2"], chi), f"{cid} E/chi2")
    p = stats.chi2.sf(chi, 1)
    ok(abs(v["exactP"] - p) < 1e-12 and abs(p - sm.pvalue) < 1e-12, f"{cid} exactP")
    ok(v["critical"] == 3.841 and v["reject"] == (chi > 3.841) == rej == (p < 0.05), f"{cid} decision")
    # P range from the printed row df = 1
    cuts = sorted(CHI_PRINTED.items(), key=lambda kv: kv[1])  # (alpha, value) by increasing value
    lab = {0.10: "0.10", 0.05: "0.05", 0.025: "0.025", 0.01: "0.01", 0.005: "0.005"}
    if chi < cuts[0][1]:
        want = "P>0.10"
    elif chi > cuts[-1][1]:
        want = "P<0.005"
    else:
        want = next(f"{lab[a2]}<P<{lab[a1]}" for (a1, v1), (a2, v2) in zip(cuts, cuts[1:]) if v1 < chi < v2)
    ok(v["pRange"] == want, f"{cid} pRange {v['pRange']} vs {want}")
    ok(want.replace("<", " < ").replace(">", " > ").replace("P > ", "P > ") in c["conclusion"] or want.replace("<", " < ") in c["conclusion"], f"{cid} conclusion P range")
    check_lookup(cid, c["lookup"], "sources/tables/Chi_Squared_Table2.pdf", 1, "0.050", 3.841)
    ok(c["answerName"] == "Chi-square" and abs(c["answer"] - chi) <= c["tolerance"], f"{cid} answer")
    ok(("Reject H0" in c["conclusion"]) == rej, f"{cid} conclusion decision")
    if topic == "s21mcnemar":
        _, _, _, exp = stats.chi2_contingency(np.array([[a, b], [cc, d]]), correction=True)
        # the printed Yates formula applied literally (SciPy caps the correction at |O - E|, giving 0 when |O - E| < 1/2)
        chi_ind = float(((np.abs(np.array([[a, b], [cc, d]]) - exp) - 0.5) ** 2 / exp).sum())
        ok(close(v["independentChi2"], chi_ind) and np.allclose(v["independentExpected"], exp), f"{cid} independent chi-square")
    else:
        ok("independentChi2" not in v, f"{cid} unexpected key")

# ---------------------------------------------------------------- structure
topics = {m["id"] for m in REF["methods"]}
ref_by_topic = {}
for rc in REF["cases"]:
    ref_by_topic.setdefault(rc["topic"], rc)
ids = [c["id"] for c in D["cases"]]
ok(len(ids) == 10 and len(set(ids)) == 10 and all(i.startswith("p21-") for i in ids), "case ids")
ok(set(ids) == set(RM) | set(HOLM) | set(MC), "every case is recomputed by this script")
ok(Counter(c["topic"] for c in D["cases"]) == Counter({"s21rmAnova": 3, "s21holm": 2, "s21mcnemar": 3, "s21diagnostic": 2}), "topic counts")
ok(len({c["title"] for c in D["cases"]}) == 10, "titles unique")
ok(D["questions"] == [] and isinstance(D["notes"], list) and D["notes"], "questions empty, notes present")
nreject = sum(RM_REJECT.values()) + sum(z[5] for z in MC.values())
ok(nreject == 5, "3 of the 8 test cases do not reject")
for c in D["cases"]:
    rc = ref_by_topic[c["topic"]]
    ok(set(c.keys()) == set(rc.keys()), f"{c['id']} keys differ from ref: {set(c) ^ set(rc)}")
    ok(set(c["values"].keys()) == set(rc["values"].keys()), f"{c['id']} values keys differ: {set(c['values']) ^ set(rc['values'])}")
    ok(set(c["lookup"].keys()) == set(rc["lookup"].keys()), f"{c['id']} lookup keys")
    ok(set(c["hypotheses"].keys()) == set(rc["hypotheses"].keys()), f"{c['id']} hypotheses keys")
    ok(len(c["steps"]) >= len(rc["steps"]) and [s["title"].split(":")[0] for s in c["steps"]] == [s["title"].split(":")[0] for s in rc["steps"]], f"{c['id']} step structure")
    ok(c["symbols"] == rc["symbols"], f"{c['id']} symbols differ from ref")
    ok(c["source"] == "Original practice example in the course style" and c["module"] == 21 and c["topic"] in topics, f"{c['id']} source/module/topic")
    ok(c["tolerance"] >= 0.001 and abs(c["tolerance"] - max(0.001, abs(c["answer"]) * 0.005)) < 1e-12, f"{c['id']} tolerance")
    for s, rs in zip(c["steps"], rc["steps"]):
        ok(s["general"] == rs["general"] or s["title"].startswith("Comparison"), f"{c['id']} general equation differs in '{s['title']}'")
        ok(("classTable" in s) == ("classTable" in rs), f"{c['id']} classTable presence in '{s['title']}'")
        ok(bool(s["work"]) and bool(s["words"]), f"{c['id']} empty step part")
    solution_text = [c["conclusion"], c["hypotheses"]["nullWords"], c["hypotheses"]["alternativeWords"]] + [s["words"] for s in c["steps"]]
    question_text = [c["context"], c["title"]] + c["tasks"]
    for t in solution_text:
        ok(":" not in t and ";" not in t, f"{c['id']} colon/semicolon in: {t[:70]}")
    for t in solution_text + question_text:
        ok(not re.search(r"\bpictur", t, re.I) and not re.search(r"professor|lecture|slide|session|\bsimply\b|\bjust\b|note that|recall that", t, re.I),
           f"{c['id']} banned word in: {t[:70]}")
    for t in question_text:  # only his own "(Note: ...)" tag may carry a colon in the question text
        ok(";" not in t and ":" not in t.replace("(Note: ", "(Note "), f"{c['id']} stray colon/semicolon in question text: {t[:70]}")
    ok(not re.search(r"\b(19|20)\d\d\b", " ".join(question_text)), f"{c['id']} a year appears in the question")
    if c["topic"] == "s21rmAnova":
        joined = " ".join([c["context"]] + c["tasks"])
        ok("Normally distributed" in joined and "DO NOT use R." in joined and "(Note: If a difference exists, do not identify which" in joined, f"{c['id']} course phrases")
    if c["topic"] == "s21holm":
        ok(c["tasks"][0].startswith("Perform the appropriate form of multiple pairwise comparisons") and "using the Holm correction" in c["tasks"][0]
           and c["tasks"][1].startswith("Present your final/overall conclusion"), f"{c['id']} Exam 1 Holm wording")

# ---------------------------------------------------------------- arithmetic of every work line
SAFE = re.compile(r"^[0-9+\-*/(). ]+$")


def to_num(tex):
    s = tex.strip()
    s = re.sub(r"^\|t\|:\\ ", "", s)
    s = s.replace("\\left", "").replace("\\right", "").replace("[", "(").replace("]", ")")
    s = re.sub(r"\\text\{\(stricter printed column\)\}", "", s).replace("\\ ", " ").strip()
    s = s.replace("\\frac12", "(1/2)")
    prev = None
    while prev != s:
        prev = s
        s = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"((\1)/(\2))", s)
        s = re.sub(r"\\sqrt\{([^{}]*)\}", r"((\1)**0.5)", s)
    s = re.sub(r"\|([^|]+)\|", r"abs(\1)", s)
    s = s.replace("^2", "**2")
    s = re.sub(r"(\d|\))\s*\(", r"\1*(", s)
    if not s or not SAFE.match(s.replace("abs", "")):
        return None
    try:
        return float(eval(s, {"__builtins__": {}}, {"abs": abs}))
    except Exception:
        return None


nevaluated = 0


def check_line(where, line):
    global nevaluated
    for seg in re.split(r",\\quad|,\\ |\\Rightarrow", line):
        toks = re.split(r"(=|<|>)", seg)
        vals = [to_num(t) if i % 2 == 0 else t for i, t in enumerate(toks)]
        for i in range(1, len(toks) - 1, 2):
            L, op, R = vals[i - 1], toks[i], vals[i + 1]
            if L is None or R is None:
                continue
            nevaluated += 1
            if op == "=":
                ok(abs(L - R) <= max(6e-4, 6e-5 * abs(R)), f"ARITHMETIC {where}: {toks[i-1]} = {toks[i+1]} (computed {L:.6f})")
            elif op == "<":
                ok(L < R, f"INEQUALITY {where}: {seg}")
            else:
                ok(L > R, f"INEQUALITY {where}: {seg}")


nlines = 0
for c in D["cases"]:
    for i, s in enumerate(c["steps"]):
        for w in s["work"]:
            nlines += 1
            check_line(f"{c['id']} step {i + 1}", w)
ok(nevaluated >= 100, f"too few evaluated relations ({nevaluated})")

if errors:
    print(f"FAILED {len(errors)} of {nchecks} checks")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print(f"OK practice session21: {len(D['cases'])} cases, {nchecks} checks passed, "
      f"{nevaluated} arithmetic relations re-evaluated in {nlines} work lines")
