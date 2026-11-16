#!/usr/bin/env python3
"""Independent check of authoring/module2/neuro/session21a.json.

Recomputes every answer and every `values` entry from the raw inputs with NumPy/SciPy/statsmodels
(not from the work lines), checks the printed critical values against SciPy, re-evaluates the
arithmetic of every work line, and checks ids, topics and the writing rules. Exits 0 when all pass.

Run: /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session21a.py
"""
import json
import math
import os
import re
import sys

import numpy as np
from scipy import stats
from statsmodels.stats.contingency_tables import mcnemar

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "session21a.json"), encoding="utf-8"))
REF = json.load(open(os.path.join(HERE, "ref", "session21.json"), encoding="utf-8"))
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
    "n21-mmn-deviant-type": [[-3.2, -3.4, -2.1], [-4.5, -4.2, -3.0], [-2.6, -3.1, -1.8], [-3.9, -4.3, -2.5], [-2.9, -2.6, -1.7], [-3.5, -3.9, -2.6]],
    "n21-insomnia-sleep-latency": [[52, 44, 30], [41, 37, 28], [65, 49, 35], [38, 35, 22], [47, 36, 27]],
    "n21-placebo-heat-pain": [[44.2, 45.0, 44.9], [46.1, 45.4, 46.0], [43.5, 44.1, 43.4], [45.3, 45.6, 46.0]],
}
RM_REJECT = {"n21-mmn-deviant-type": True, "n21-insomnia-sleep-latency": True, "n21-placebo-heat-pain": False}
TREMOR = [[19, 13, 12], [13, 16, 8], [21, 13, 13], [12, 14, 6], [17, 12, 11]]  # raw table behind n21-dbs-tremor-holm
HOLM = {  # case id -> (raw data, condition names)
    "n21-mmn-deviant-holm": (RM["n21-mmn-deviant-type"], ["Frequency deviant", "Duration deviant", "Intensity deviant"]),
    "n21-insomnia-sleep-latency-holm": (RM["n21-insomnia-sleep-latency"], ["Baseline", "2 weeks", "6 weeks"]),
    "n21-dbs-tremor-holm": (TREMOR, ["Stimulation off", "60 Hz", "130 Hz"]),
}
MC = {  # case id -> (a, b, c, d, topic, reject)
    "n21-tinnitus-sound-therapy": (9, 14, 3, 10, "s21mcnemar", True),
    "n21-shift-nurses-daytime-sleep": (10, 9, 3, 6, "s21mcnemar", False),
    "n21-hearing-app-audiologist": (12, 11, 2, 15, "s21diagnostic", True),
    "n21-eeg-spike-detector": (10, 9, 2, 11, "s21diagnostic", False),
}
# printed class tables (read from the PDFs)
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
    ok([row[1:] for row in c["table"]["rows"]] == [list(map(float, q)) for q in raw]
       or np.allclose([row[1:] for row in c["table"]["rows"]], raw), f"{cid} table differs from raw data")
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

ok(sum(not x for x in RM_REJECT.values()) == 1, "exactly one repeated-measures case should not reject")

# ---------------------------------------------------------------- Holm
for cid, (raw, names) in HOLM.items():
    c, v = CASES[cid], CASES[cid]["values"]
    r = rm_anova(raw)
    ok(c["topic"] == "s21holm", f"{cid} topic")
    ok(r["F"] > F_PRINTED[r["dfr"]][0], f"{cid} parent ANOVA must reject")
    means = [round(float(t), 4) for t in r["T"]]
    msr = round(float(r["msr"]), 6)
    ok(list(v["means"].keys()) == names and np.allclose(list(v["means"].values()), means, atol=1e-12), f"{cid} means {v['means']} vs {means}")
    ok(abs(v["msRes"] - msr) < 1e-12 and v["n"] == r["n"] and v["dfRes"] == r["dfr"], f"{cid} msRes/n/df")
    ok([row[1] for row in c["table"]["rows"]] == means and [row[0] for row in c["table"]["rows"]] == names, f"{cid} table")
    # context must state the same summary numbers
    for num in means + [msr]:
        s = ("%.6f" % num).rstrip("0").rstrip(".")
        ok(s in c["context"], f"{cid} context lacks {s}")
    ok(("F = " + ("%.3f" % r["F"]).rstrip("0").rstrip(".")) in c["context"], f"{cid} context F")
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
        # full-precision t agrees with the rounded-input t to well inside the tolerance
        i, j = [names.index(z) for z in k.split(" vs ")]
        t_full = (r["T"][i] - r["T"][j]) / math.sqrt(2 * r["msr"] / r["n"])
        ok(abs(t_full - tv[k]) < 2e-3, f"{cid} rounded vs full t {k}")
    ok(np.allclose(v["holmAlphas"], [0.05 / 3, 0.05 / 2, 0.05]), f"{cid} holm alphas")
    # step-down with the printed (stricter) columns, as the solution does
    row = T_PRINTED[r["dfr"]]
    cut = [row[5], row[4], row[3]]  # 0.01, 0.02, 0.05 columns
    out_tab, alive = {}, True
    for kk, k in enumerate(order):
        alive = alive and abs(tv[k]) > cut[kk]
        out_tab[k] = alive
    # step-down with exact SciPy P values at the true Holm levels
    out_exact, alive = {}, True
    for kk, k in enumerate(order):
        pval = 2 * stats.t.sf(abs(tv[k]), r["dfr"])
        alive = alive and pval < 0.05 / (3 - kk)
        out_exact[k] = alive
    ok(out_tab == out_exact, f"{cid} bracketed table decision differs from exact Holm {out_tab} {out_exact}")
    ok(v["outcomes"] == out_tab and list(v["outcomes"].keys()) == order, f"{cid} outcomes")
    ok(c["answer"] == v["tValues"][order[0]] and abs(c["answer"] - tv[order[0]]) <= c["tolerance"], f"{cid} answer")
    ok(c["answerName"] == "t statistic (largest |t| comparison)", f"{cid} answerName")
    check_lookup(cid, c["lookup"], "sources/tables/t_table.pdf", r["dfr"], "0.01", row[5])
    ok(c["lookup"]["bracketValues"] == [row[4], row[5]] and c["lookup"]["approximation"] is True, f"{cid} lookup bracket")
    # every classTable value in the steps is a printed entry of that row
    for st in c["steps"]:
        ct = st.get("classTable")
        if ct:
            ok(close(ct["value"], row[T_COLS.index(float(ct["column"]))]), f"{cid} classTable {ct}")
            for b, bv in zip(ct.get("bracket", []), ct.get("bracketValues", [])):
                ok(close(bv, row[T_COLS.index(float(b))]), f"{cid} bracket {b}")

# continuation cases reuse the parent values
for child, parent in [("n21-mmn-deviant-holm", "n21-mmn-deviant-type"), ("n21-insomnia-sleep-latency-holm", "n21-insomnia-sleep-latency")]:
    pv, cv = CASES[parent]["values"], CASES[child]["values"]
    ok(pv["reject"] and cv["n"] == pv["n"] and cv["dfRes"] == pv["dfRes"] and abs(cv["msRes"] - pv["msRes"]) < 6e-7
       and np.allclose(list(cv["means"].values()), pv["treatmentMeans"], atol=6e-5), f"{child} does not continue {parent}")

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
    lo, hi = [float(z) for z in re.findall(r"[0-9.]+", v["pRange"])] * (2 if v["pRange"].count("P") and "<P<" not in v["pRange"] else 1)
    if "<P<" in v["pRange"]:
        ok(lo < p < hi and lo in CHI_PRINTED and hi in CHI_PRINTED and CHI_PRINTED[hi] < chi < CHI_PRINTED[lo], f"{cid} pRange {v['pRange']}")
    elif v["pRange"].startswith("P>"):
        ok(p > lo and chi < CHI_PRINTED[lo], f"{cid} pRange {v['pRange']}")
    else:
        ok(p < lo and chi > CHI_PRINTED[lo], f"{cid} pRange {v['pRange']}")
    check_lookup(cid, c["lookup"], "sources/tables/Chi_Squared_Table2.pdf", 1, "0.050", 3.841)
    ok(c["answerName"] == "Chi-square" and abs(c["answer"] - chi) <= c["tolerance"], f"{cid} answer")
    if topic == "s21mcnemar":
        chi_ind, _, _, exp = stats.chi2_contingency(np.array([[a, b], [cc, d]]), correction=True)
        ok(close(v["independentChi2"], chi_ind) and np.allclose(v["independentExpected"], exp), f"{cid} independent chi-square")
    else:
        ok("independentChi2" not in v, f"{cid} unexpected key")
ok(sum(z[5] for z in MC.values() if z[4] == "s21mcnemar") == 1, "one s21mcnemar case rejects and one does not")

# ---------------------------------------------------------------- structure
topics = {m["id"] for m in REF["methods"]}
ref_by_topic = {}
for rc in REF["cases"]:
    ref_by_topic.setdefault(rc["topic"], rc)
ids = [c["id"] for c in D["cases"]]
ok(len(ids) == 10 and len(set(ids)) == 10 and all(i.startswith("n21-") for i in ids), "case ids")
ok(set(ids) == set(RM) | set(HOLM) | set(MC), "every case is recomputed by this script")
from collections import Counter
ok(Counter(c["topic"] for c in D["cases"]) == Counter({"s21rmAnova": 3, "s21holm": 3, "s21mcnemar": 2, "s21diagnostic": 2}), "topic counts")
ok(len({c["title"] for c in D["cases"]}) == 10, "titles unique")
for c in D["cases"]:
    rc = ref_by_topic[c["topic"]]
    ok(set(c.keys()) == set(rc.keys()), f"{c['id']} keys differ from ref: {set(c) ^ set(rc)}")
    ok(set(c["values"].keys()) == set(rc["values"].keys()), f"{c['id']} values keys differ: {set(c['values']) ^ set(rc['values'])}")
    ok(set(c["lookup"].keys()) == set(rc["lookup"].keys()), f"{c['id']} lookup keys")
    ok(len(c["steps"]) >= len(rc["steps"]) and [s["title"].split(":")[0] for s in c["steps"]] == [s["title"].split(":")[0] for s in rc["steps"]], f"{c['id']} step structure")
    ok(c["symbols"] == rc["symbols"], f"{c['id']} symbols differ from ref")
    ok(c["source"] == "Original neuroscience practice example" and c["module"] == 21 and c["topic"] in topics, f"{c['id']} source/module/topic")
    ok(c["tolerance"] >= 0.001 and abs(c["tolerance"] - max(0.001, abs(c["answer"]) * 0.005)) < 1e-5, f"{c['id']} tolerance")
    for s, rs in zip(c["steps"], rc["steps"]):
        ok(s["general"] == rs["general"] or s["title"].startswith("Comparison"), f"{c['id']} general equation differs in '{s['title']}'")
        ok(("classTable" in s) == ("classTable" in rs), f"{c['id']} classTable presence in '{s['title']}'")
    texts = [c["context"], c["conclusion"]] + c["tasks"] + [s["words"] for s in c["steps"]] + [c["hypotheses"]["nullWords"], c["hypotheses"]["alternativeWords"]]
    question_text = [c["context"]] + c["tasks"]  # his own "(Note: ...)" tag keeps its colon in the question text only
    for t in texts:
        tt = t.replace("(Note: ", "(Note ") if any(t is q for q in question_text) else t
        ok(":" not in tt and ";" not in tt, f"{c['id']} colon/semicolon in: {t[:70]}")
        ok(not re.search(r"\bpictur", t, re.I) and not re.search(r"professor|lecture|slide|session", t, re.I), f"{c['id']} banned word in: {t[:70]}")
    ok("Normally" in c["context"] or c["topic"] != "s21rmAnova", f"{c['id']} Normally")

qids = [q["id"] for q in D["questions"]]
ok(qids == [f"m2-n21-qa{i:02d}" for i in range(1, 11)], "question ids")
for q in D["questions"]:
    ok(q["module"] == 21 and q["topic"] in topics and (q["case"] is None or q["case"] in CASES), f"{q['id']} module/topic/case")
    ok(len(q["options"]) == 4 and len(set(q["options"])) == 4 and q["correct"] in range(4), f"{q['id']} options")
    ok(q["case"] is None or CASES[q["case"]]["topic"] == q["topic"], f"{q['id']} topic matches its case")
    ok(1 <= len([s for s in re.split(r"(?<=[a-z0-9)])\. ", q["why"]) if s]) <= 3, f"{q['id']} why length")
ok(sum(q["case"] is not None for q in D["questions"]) == 6, "6 numeric questions tied to a case")
ok(len({q["correct"] for q in D["questions"]}) == 4, "correct index varies")
ok(Counter(q["topic"] for q in D["questions"]) == Counter({"s21rmAnova": 3, "s21holm": 3, "s21mcnemar": 2, "s21diagnostic": 2}), "question topics")


def opt(q):
    return float(re.sub(r"[\\()]", "", q["options"][q["correct"]]))


QN = {q["id"]: q for q in D["questions"]}
r1, r2, r3 = rm_anova(RM["n21-mmn-deviant-type"]), rm_anova(RM["n21-insomnia-sleep-latency"]), rm_anova(TREMOR)
ok(abs(opt(QN["m2-n21-qa01"]) - r1["sst"]) < 6e-5, "qa01")
ok(abs(opt(QN["m2-n21-qa02"]) - r2["F"]) < 6e-5, "qa02")
ok(abs(opt(QN["m2-n21-qa04"]) - math.sqrt(2 * round(r1["msr"], 6) / 6)) < 6e-7, "qa04")
ok(abs(opt(QN["m2-n21-qa05"]) - (round(r3["T"][0], 4) - round(r3["T"][2], 4)) / math.sqrt(2 * round(r3["msr"], 6) / 5)) < 6e-4, "qa05")
ok(abs(opt(QN["m2-n21-qa07"]) - (abs(14 - 3) - 1) ** 2 / 17) < 6e-5, "qa07")
ok(abs(opt(QN["m2-n21-qa09"]) - (11 + 2) / 2) < 1e-9, "qa09")
ok(QN["m2-n21-qa03"]["options"][QN["m2-n21-qa03"]["correct"]] == "Repeated measures ANOVA", "qa03")
ok("stops" in QN["m2-n21-qa06"]["options"][QN["m2-n21-qa06"]["correct"]], "qa06")
ok("change" in QN["m2-n21-qa08"]["options"][QN["m2-n21-qa08"]["correct"]], "qa08")
ok(QN["m2-n21-qa10"]["options"][QN["m2-n21-qa10"]["correct"]].startswith("McNemar"), "qa10")

# ---------------------------------------------------------------- arithmetic of every work line and question equation
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


nevaluated = 0
nlines = 0
for c in D["cases"]:
    for i, s in enumerate(c["steps"]):
        for w in s["work"]:
            nlines += 1
            check_line(f"{c['id']} step {i + 1}", w)
for q in D["questions"]:
    for e in q["equations"]:
        check_line(q["id"], e)
ok(nevaluated >= 120, f"too few evaluated relations ({nevaluated})")

if errors:
    print(f"FAILED {len(errors)} of {nchecks} checks")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print(f"OK session21a: {len(D['cases'])} cases, {len(D['questions'])} questions, {nchecks} checks passed, "
      f"{nevaluated} arithmetic relations re-evaluated in {nlines} work lines")
