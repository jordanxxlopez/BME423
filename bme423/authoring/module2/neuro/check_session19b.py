"""Checks authoring/module2/neuro/session19b.json.

Every model is refitted here from the invented data stored in DATA (NumPy, SciPy, statsmodels),
then each R table, each entry of `values`, each graded answer and each printed critical value
in the pack is compared with the recomputed number. Exit code 0 means everything agrees.

    /Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session19b.py
"""
import json
import math
import os
import re
import sys

import numpy as np
import statsmodels.api as sm
from scipy import stats

# All data are invented for practice.
DATA = {'slopes': {'musicians': {'age': [20, 21, 22, 23, 24, 26, 28, 28, 33, 36, 39, 44, 46, 49, 54, 55, 59, 66, 67, 68, 70,
                                  73],
                          'srt': [-5.2, -6.5, -5.0, -3.6, -4.5, -7.2, -6.8, -7.1, -6.0, -6.7, -3.4, -4.9, -2.9, -4.9,
                                  -4.6, -4.8, -4.2, -3.9, -3.9, -4.8, -5.2, -3.9]},
            'nonmusicians': {'age': [21, 23, 26, 32, 34, 35, 40, 40, 42, 42, 44, 48, 50, 52, 52, 54, 54, 62, 62, 63,
                                     71, 72, 72],
                             'srt': [-5.5, -5.9, -6.0, -2.4, -5.0, -5.1, -6.3, -3.4, -3.4, -3.1, -4.8, -1.7, -4.4,
                                     -4.3, -3.3, -3.2, -2.1, 0.6, -2.0, -0.5, -0.7, -2.2, -3.4]}},
 'pitch': {'y': [21, 36, 21, 21, 29, 25, 43, 11, 28, 33, 19, 27, 31, 24, 24, 22],
           'x1': [7, 11, 13, 13, 8, 24, 8, 20, 5, 10, 10, 13, 10, 17, 14, 24],
           'x2': [17, 4, 17, 17, 16, 6, 5, 15, 12, 10, 17, 7, 8, 11, 9, 9]},
 'lapses': {'lapses': [6, 8, 16, 8, 9, 10, 5, 11, 11, 8, 7, 15, 12, 12, 16, 15, 3, 7, 16, 8, 7, 9, 9, 8],
            'sleep': [7.7, 7.6, 6.5, 7.0, 4.8, 7.3, 8.7, 6.8, 4.9, 8.0, 7.3, 5.8, 5.7, 4.5, 5.1, 5.2, 6.3, 7.5, 5.2,
                      7.6, 6.0, 6.3, 4.8, 7.8],
            'adhd': [11, 17, 45, 38, 10, 26, 8, 24, 34, 20, 27, 43, 36, 10, 45, 37, 8, 20, 32, 14, 16, 11, 15, 36]},
 'vocab': {'vocab': [315, 245, 224, 280, 100, 217, 312, 184, 223, 283, 167, 213, 82, 212, 243, 282, 325, 238, 323,
                     173, 132, 175, 216, 135, 234, 67, 205, 61, 69, 121],
           'age': [30, 23, 29, 28, 18, 24, 28, 23, 22, 24, 21, 29, 18, 26, 28, 27, 29, 26, 25, 20, 24, 24, 26, 21, 24,
                   21, 24, 18, 18, 22],
           'adultwords': [19.6, 10.7, 7.6, 6.8, 19.4, 18.4, 21.3, 15.6, 17.2, 16.4, 19.9, 13.3, 18.1, 11.5, 6.0, 16.5,
                          13.5, 17.1, 21.2, 21.3, 7.8, 10.5, 10.7, 11.7, 16.9, 10.5, 8.8, 8.1, 8.0, 9.8],
           'screen': [3.3, 0.6, 1.9, 0.1, 2.4, 1.3, 2.1, 1.7, 0.4, 0.9, 0.7, 0.7, 3.2, 3.4, 2.3, 2.3, 1.7, 0.5, 1.5,
                      1.2, 0.1, 3.5, 1.2, 3.0, 1.6, 0.5, 1.7, 0.0, 1.2, 3.0]},
 'tone': {'level': [0, 0, 0, 0, 2, 2, 2, 2, 4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10, 12, 12, 12, 12, 14,
                    14, 14, 14, 16, 16, 16, 16, 18, 18, 18, 18],
          'detect': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0,
                     1, 1, 1, 1, 1, 1, 1, 1]},
 'ap': {'startage': [14, 10, 11, 10, 8, 14, 14, 3, 11, 6, 3, 7, 5, 9, 3, 3, 13, 3, 7, 12, 9, 5, 12, 13, 12, 5, 3, 6,
                     7, 12, 3, 6, 6, 11, 12, 5, 12, 7, 10, 5, 9, 8, 4, 8, 12, 6, 4, 8, 7, 9],
        'ap': [0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0,
               0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0]}}

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.join(HERE, "session19b.json")
METHODS = {"s19margin", "s19design", "s19slopes", "s19mlrfit", "s19mlrtest", "s19logistic"}


# ---------- refits from the invented data ----------
def rp(p):
    """P value in the form R prints it (3 significant digits)."""
    if p < 1e-4:
        return "%.2e" % p
    return "%.3g" % p if p >= 0.001 else ("%.6f" % p).rstrip("0")


def lm(y, *xs):
    X = sm.add_constant(np.column_stack([np.asarray(x, float) for x in xs]))
    return sm.OLS(np.asarray(y, float), X).fit()


def lm_print(r):
    """Numbers as summary(lm()) prints them: 4 decimals, t to 3 decimals."""
    return {
        "est": [round(float(v), 4) for v in r.params],
        "se": [round(float(v), 4) for v in r.bse],
        "t": [round(float(v), 3) for v in r.tvalues],
        "p": [rp(float(v)) for v in r.pvalues],
        "s": float("%.4g" % np.sqrt(r.scale)),
        "df": int(r.df_resid),
        "R2": round(float(r.rsquared), 4),
        "adjR2": round(float(r.rsquared_adj), 4),
        "F": float("%.4g" % r.fvalue),
        "Fp": "%.4g" % r.f_pvalue,
        "ci": [[round(float(a), 4), round(float(b), 4)] for a, b in r.conf_int()],
    }


def glm_print(y, x):
    r = sm.GLM(np.asarray(y, float), sm.add_constant(np.asarray(x, float)), family=sm.families.Binomial()).fit()
    return {
        "est": [round(float(v), 5) for v in r.params],
        "se": [round(float(v), 5) for v in r.bse],
        "z": [round(float(v), 3) for v in r.tvalues],
        "p": [rp(float(v)) for v in r.pvalues],
    }


def refits():
    d = DATA
    out = {}
    out["slopesM"] = lm_print(lm(d["slopes"]["musicians"]["srt"], d["slopes"]["musicians"]["age"]))
    out["slopesN"] = lm_print(lm(d["slopes"]["nonmusicians"]["srt"], d["slopes"]["nonmusicians"]["age"]))
    out["lapses"] = lm_print(lm(d["lapses"]["lapses"], d["lapses"]["sleep"], d["lapses"]["adhd"]))
    v = d["vocab"]
    out["vocabFull"] = lm_print(lm(v["vocab"], v["age"], v["adultwords"], v["screen"]))
    out["vocabRefit"] = lm_print(lm(v["vocab"], v["age"], v["adultwords"]))
    out["tone"] = glm_print(d["tone"]["detect"], d["tone"]["level"])
    out["ap"] = glm_print(d["ap"]["ap"], d["ap"]["startage"])
    return out


# ---------- expected values per case (from raw inputs only) ----------
def exp_margin(m1, n1, m2, n2):
    p1, p2 = m1 / n1, m2 / n2
    pooled = (m1 + m2) / (n1 + n2)
    se = math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
    d = p1 - p2
    M = 1.96 * se
    return {"m1": m1, "n1": n1, "m2": m2, "n2": n2, "p1": p1, "p2": p2, "pooled": pooled, "se": se,
            "critical": 1.96, "difference": d, "margin": M, "lower": d - M, "upper": d + M,
            "reject": not (d - M <= 0 <= d + M)}


def exp_design(a, b, c, d):
    O = np.array([[a, b], [c, d]], float)
    E = np.outer(O.sum(1), O.sum(0)) / O.sum()
    chi = float((((np.abs(O - E) - 0.5) ** 2) / E).sum())
    rT, rC = a / (a + b), c / (c + d)
    return {"nTD": a, "nTA": b, "nCD": c, "nCA": d, "nT": a + b, "nC": c + d, "riskT": rT, "riskC": rC,
            "RR": rT / rC, "chiSquare": chi, "df": 1, "critical": 3.841, "reject": chi > 3.841}, E


def exp_slopes(R):
    bM, sbM = R["slopesM"]["est"][1], R["slopesM"]["se"][1]
    bN, sbN = R["slopesN"]["est"][1], R["slopesN"]["se"][1]
    nM, nN = len(DATA["slopes"]["musicians"]["age"]), len(DATA["slopes"]["nonmusicians"]["age"])
    se = math.hypot(sbM, sbN)
    t = (bM - bN) / se
    return {"bM": bM, "sbM": sbM, "bF": bN, "sbF": sbN, "nM": nM, "nF": nN, "difference": bM - bN,
            "seDiff": se, "t": t, "df": nM + nN - 4, "critical": 2.021, "reject": abs(t) > 2.021}


def exp_fit():
    p = DATA["pitch"]
    y = np.array(p["y"], float)
    X = np.column_stack([np.ones(len(y)), p["x1"], p["x2"]]).astype(float)
    b = np.linalg.solve(X.T @ X, X.T @ y)
    ssres = float(((y - X @ b) ** 2).sum())
    sstot = float(((y - y.mean()) ** 2).sum())
    n, k = len(y), 2
    s2 = ssres / (n - k - 1)
    return {"n": n, "k": k, "b0": float(b[0]), "b1": float(b[1]), "b2": float(b[2]), "SSres": ssres,
            "SStot": sstot, "s2": s2, "s": math.sqrt(s2), "R2": 1 - ssres / sstot}, X, y


LAPSES_AT = (6, 30)      # sleep hours, ADHD score used for the hand prediction
VOCAB_AT = (24, 15)      # age in months, thousands of adult words per day
TONE_AT = 12             # dB SPL
AP_AT = (4, 12)          # start ages in years


def exp_lapses(R):
    r = R["lapses"]
    n, k = len(DATA["lapses"]["lapses"]), 2
    F = (r["R2"] / k) / ((1 - r["R2"]) / (n - k - 1))
    tc = 2.080
    b, s = r["est"], r["se"]
    return {"n": n, "k": k, "R2": r["R2"], "F": F, "dfMod": k, "dfRes": n - k - 1, "Fcritical": 3.47,
            "tSleep": b[1] / s[1], "tADHD": b[2] / s[2], "tcritical": tc,
            "ciSleep": [b[1] - tc * s[1], b[1] + tc * s[1]], "ciADHD": [b[2] - tc * s[2], b[2] + tc * s[2]],
            "prediction": b[0] + b[1] * LAPSES_AT[0] + b[2] * LAPSES_AT[1], "reject": F > 3.47}


def exp_vocab(R):
    f, g = R["vocabFull"], R["vocabRefit"]
    tc = 2.056
    b, s = f["est"], f["se"]
    return {"n": len(DATA["vocab"]["vocab"]), "k": 3, "F": f["F"], "tScreen": b[3] / s[3],
            "ciScreen": [b[3] - tc * s[3], b[3] + tc * s[3]], "refitB0": g["est"][0], "refitAge": g["est"][1],
            "refitAdultWords": g["est"][2], "age": VOCAB_AT[0], "adultWords": VOCAB_AT[1],
            "prediction": g["est"][0] + g["est"][1] * VOCAB_AT[0] + g["est"][2] * VOCAB_AT[1]}


def logistic(b0, b1, x):
    return 1 / (1 + math.exp(-(b0 + b1 * x)))


def exp_tone(R):
    b0, b1 = R["tone"]["est"]
    eta = b0 + b1 * TONE_AT
    p = logistic(b0, b1, TONE_AT)
    p2 = round(p, 2)
    return {"b0": b0, "b1": b1, "level": TONE_AT, "eta": eta, "probability": p, "oddsSlide": p2 / (1 - p2),
            "oddsExact": math.exp(eta), "z": b1 / R["tone"]["se"][1]}


def exp_ap(R):
    b0, b1 = R["ap"]["est"]
    return {"b0": b0, "b1": b1, "p4": logistic(b0, b1, AP_AT[0]), "p12": logistic(b0, b1, AP_AT[1]),
            "odds4": math.exp(b0 + b1 * AP_AT[0]), "oddsPerYear": math.exp(b1), "z": b1 / R["ap"]["se"][1],
            "halfwayAge": -b0 / b1}


# ---------- comparison helpers ----------
FAILS = []


def fail(msg):
    FAILS.append(msg)
    print("FAIL", msg)


def same(got, want, tol=1e-9):
    if isinstance(want, bool) or isinstance(got, bool):
        return got is want
    if isinstance(want, (list, tuple)):
        return isinstance(got, list) and len(got) == len(want) and all(same(g, w, tol) for g, w in zip(got, want))
    return abs(float(got) - float(want)) <= tol * max(1.0, abs(float(want)))


def check_values(case, want):
    got = case["values"]
    if set(got) != set(want):
        fail("%s values keys differ: %s" % (case["id"], sorted(set(got) ^ set(want))))
    for k, w in want.items():
        if k in got and not same(got[k], w):
            fail("%s values[%s] = %r, recomputed %r" % (case["id"], k, got[k], w))


def check_answer(case, want):
    if abs(case["answer"] - want) > case["tolerance"]:
        fail("%s answer %r vs %r" % (case["id"], case["answer"], want))
    lo = max(0.001, 0.004 * abs(want))
    if not (lo <= case["tolerance"] <= max(0.0011, 0.006 * abs(want))):
        fail("%s tolerance %r is not about 0.5%% of %r" % (case["id"], case["tolerance"], want))


def check_coef_rows(case, rows, pr, names, stat="t"):
    for row, name, e, s, t, p in zip(rows, names, pr["est"], pr["se"], pr[stat], pr["p"]):
        cells = row[-5:]
        if cells[0] != name or not same(cells[1], e) or not same(cells[2], s) or not same(cells[3], t) \
                or float(cells[4]) != float(p):
            fail("%s R row %s does not match the refit %s" % (case["id"], row, (name, e, s, t, p)))


def summary_row(pr, k):
    return ["Residual SE %s on %d df" % (pr["s"], pr["df"]), "Multiple R² %s" % pr["R2"],
            "Adjusted R² %s" % pr["adjR2"], "F %s on %d and %d DF" % (pr["F"], k, pr["df"]), "p %s" % pr["Fp"]]


# printed-table critical values used anywhere in the pack: (kind, df..., alpha) -> printed value
PRINTED_T = {(40, 0.05): 2.021, (40, 0.02): 2.423, (40, 0.01): 2.704,
             (21, 0.05): 2.080, (21, 0.002): 3.527, (21, 0.001): 3.819,
             (26, 0.05): 2.056, (27, 0.001): 3.690,
             ("inf", 0.05): 1.960, ("inf", 0.02): 2.3263, ("inf", 0.01): 2.5758, ("inf", 0.001): 3.2905}
PRINTED_F = {(2, 21, 0.05): 3.47, (2, 21, 0.01): 5.78, (3, 26, 0.05): 2.98, (3, 26, 0.01): 4.64}
PRINTED_CHI = {(1, 0.05): 3.841, (1, 0.025): 5.024, (1, 0.01): 6.635, (1, 0.001): 10.828}


def check_printed_tables():
    for (df, a), v in PRINTED_T.items():
        true = stats.norm.ppf(1 - a / 2) if df == "inf" else stats.t.ppf(1 - a / 2, df)
        if abs(true - v) > (0.00006 if df == "inf" else 0.0011):
            fail("t table (%s, %s) printed %s but SciPy gives %.5f" % (df, a, v, true))
    for (dn, dd, a), v in PRINTED_F.items():
        true = stats.f.ppf(1 - a, dn, dd)
        if abs(true - v) > 0.0075:
            fail("F table (%s, %s, %s) printed %s but SciPy gives %.4f" % (dn, dd, a, v, true))
    for (df, a), v in PRINTED_CHI.items():
        true = stats.chi2.ppf(1 - a, df)
        if abs(true - v) > 0.0006:
            fail("chi-square table (%s, %s) printed %s but SciPy gives %.4f" % (df, a, v, true))


def check_lookup(case, path, page, row, column, value, actual, approx):
    want = {"path": path, "page": page, "row": row, "column": column, "value": value, "actualDf": actual,
            "approximation": approx}
    if case["lookup"] != want:
        fail("%s lookup %r differs from %r" % (case["id"], case["lookup"], want))
    if not any(s.get("classTable") == want for s in case["steps"]):
        fail("%s has no step carrying the lookup as classTable" % case["id"])


# ---------- text and structure rules ----------
CASE_KEYS = ["id", "title", "topic", "context", "unit", "table", "tasks", "hypotheses", "symbols", "steps",
             "conclusion", "source", "lookup", "values", "module", "tolerance", "answerName", "answer"]
MIN_STEPS = {"s19margin": 7, "s19design": 7, "s19slopes": 6, "s19mlrfit": 6, "s19mlrtest": 6, "s19logistic": 4}
BANNED = re.compile(r"\b(picture|pictured|professor|lecture|slide|session)\b", re.I)


def strip_math(s):
    s = re.sub(r"\\\(.+?\\\)", " ", s, flags=re.S)
    return s.replace("__ : 1", " ")          # the odds blank is written this way in the task wording


def check_text(where, s, strict=True):
    if BANNED.search(s):
        fail("%s uses a banned word: %s" % (where, s[:90]))
    if strict and re.search(r"[:;]", strip_math(s)):
        fail("%s has a colon or semicolon: %s" % (where, s[:90]))


def check_structure(pack):
    ids = [c["id"] for c in pack["cases"]]
    if len(ids) != 10 or len(set(ids)) != 10:
        fail("need 10 unique case ids")
    counts = {}
    for c in pack["cases"]:
        counts[c["topic"]] = counts.get(c["topic"], 0) + 1
        if list(c.keys()) != CASE_KEYS:
            fail("%s key set differs from the reference cases" % c["id"])
        if not c["id"].startswith("n19-b-") or c["module"] != 19 or c["topic"] not in METHODS:
            fail("%s id, module or topic" % c["id"])
        if c["source"] != "Original neuroscience practice example":
            fail("%s source" % c["id"])
        if len(c["steps"]) < MIN_STEPS[c["topic"]]:
            fail("%s has too few steps" % c["id"])
        check_text(c["id"] + " context", c["context"], strict=False)   # his own phrases keep their punctuation
        check_text(c["id"] + " conclusion", c["conclusion"])
        check_text(c["id"] + " title", c["title"])
        for t in c["tasks"]:
            check_text(c["id"] + " task", t, strict=False)
        if c["hypotheses"]:
            check_text(c["id"] + " nullWords", c["hypotheses"]["nullWords"])
            check_text(c["id"] + " alternativeWords", c["hypotheses"]["alternativeWords"])
        for s in c["steps"]:
            if not s["general"] or not s["work"] or not s["words"]:
                fail("%s step '%s' is incomplete" % (c["id"], s["title"]))
            check_text(c["id"] + " step words", s["words"])
    if counts != {"s19margin": 2, "s19design": 2, "s19slopes": 1, "s19mlrfit": 1, "s19mlrtest": 2, "s19logistic": 2}:
        fail("topic counts %r" % counts)
    qs = pack["questions"]
    if [q["id"] for q in qs] != ["m2-n19-qb%02d" % i for i in range(1, 11)]:
        fail("question ids")
    for q in qs:
        if q["module"] != 19 or q["topic"] not in METHODS:
            fail("%s module or topic" % q["id"])
        if q["case"] is not None and q["case"] not in ids:
            fail("%s points at a missing case" % q["id"])
        if len(q["options"]) != 4 or len(set(q["options"])) != 4 or q["correct"] not in (0, 1, 2, 3):
            fail("%s options" % q["id"])
        if not q["equations"]:
            fail("%s has no equations" % q["id"])
        for s in [q["stem"], q["why"]] + q["options"]:
            check_text(q["id"], s, strict=False)
    if len({q["correct"] for q in qs}) < 4:
        fail("correct index is not varied")
    if sum(q["case"] is not None for q in qs) != 6:
        fail("expected 6 numeric questions tied to a case")


def option_number(q):
    return float(re.sub(r"[^0-9.\-]", "", q["options"][q["correct"]]))


# ---------- main ----------
def main():
    pack = json.load(open(PACK, encoding="utf-8"))
    cases = {c["id"]: c for c in pack["cases"]}
    R = refits()
    check_structure(pack)
    check_printed_tables()
    T = "sources/tables/t_table.pdf"

    # margin of error (two cases), raw inputs are the counts in the table
    for cid in ("n19-b-pitch-matching-margin", "n19-b-mind-wandering-margin"):
        c = cases[cid]
        (g1, m1, n1), (g2, m2, n2) = c["table"]["rows"]
        w = exp_margin(m1, n1, m2, n2)
        check_values(c, w)
        check_answer(c, w["margin"])
        check_lookup(c, T, 2, "∞", "0.05", 1.96, None, False)
    if cases["n19-b-pitch-matching-margin"]["values"]["reject"] is not True:
        fail("pitch matching should reject")
    if cases["n19-b-mind-wandering-margin"]["values"]["reject"] is not False:
        fail("mind wandering should not reject")

    # relative risk and chi-square (two cases)
    for cid in ("n19-b-earplugs-noise-notch", "n19-b-balance-training-falls"):
        c = cases[cid]
        (g1, a, b, t1), (g2, cc, d, t2) = c["table"]["rows"]
        if t1 != a + b or t2 != cc + d:
            fail(cid + " row totals")
        w, E = exp_design(a, b, cc, d)
        check_values(c, w)
        check_answer(c, w["RR"])
        check_lookup(c, "sources/tables/Chi_Squared_Table1.pdf", 1, "1", ".05", 3.841, 1, False)
    if not (5.024 < cases["n19-b-earplugs-noise-notch"]["values"]["chiSquare"] < 6.635):
        fail("earplug chi-square should sit between the .025 and .01 columns")
    if cases["n19-b-balance-training-falls"]["values"]["reject"] is not False:
        fail("balance trial should not reject")

    # comparing two slopes, both regressions refitted from the data
    c = cases["n19-b-speech-noise-slopes"]
    w = exp_slopes(R)
    rows = c["table"]["rows"]
    for row, key, grp in zip(rows, ("slopesM", "slopesN"), ("musicians", "nonmusicians")):
        n = len(DATA["slopes"][grp]["age"])
        if row[1:] != [n, R[key]["est"][1], R[key]["se"][1], R[key]["s"]]:
            fail("slopes table row %r does not match the refit" % row)
    check_values(c, w)
    check_answer(c, w["t"])
    if w["df"] != 41:
        fail("slopes df")
    check_lookup(c, T, 1, "40", "0.05", 2.021, 41, True)
    if not (2.423 < abs(w["t"]) < 2.704):
        fail("slopes t should sit between the 0.02 and 0.01 cutoffs of row 40")
    if not (stats.t.ppf(0.99, 41) < abs(w["t"]) < stats.t.ppf(0.995, 41)):
        fail("slopes P range is not the same with the exact 41 df")

    # least squares by matrix
    c = cases["n19-b-pitch-threshold-fit"]
    w, X, y = exp_fit()
    p = DATA["pitch"]
    if c["table"]["rows"] != [[i + 1, p["y"][i], p["x1"][i], p["x2"][i]] for i in range(len(y))]:
        fail("pitch table differs from the data")
    check_values(c, w)
    check_answer(c, w["b1"])
    if c["lookup"] is not None:
        fail("pitch fit lookup should be null")
    r = lm(p["y"], p["x1"], p["x2"])
    if not np.allclose(r.params, [w["b0"], w["b1"], w["b2"]]) or abs(r.rsquared - w["R2"]) > 1e-10:
        fail("matrix solution disagrees with the statsmodels fit")
    blob = json.dumps(c["steps"])
    XtX, Xty, inv = X.T @ X, X.T @ y, np.linalg.inv(X.T @ X)
    for v in list(XtX.flatten()) + list(Xty):
        if ("%d" % v) not in blob:
            fail("pitch fit cross-product %d is not in the steps" % v)
    for v in inv.flatten():
        if ("%.6f" % v) not in blob:
            fail("pitch fit inverse entry %.6f is not in the steps" % v)

    # reading a summary(): lapses
    c = cases["n19-b-vigilance-lapses-summary"]
    pr = R["lapses"]
    rows = c["table"]["rows"]
    check_coef_rows(c, rows[:3], pr, ["(Intercept)", "Sleep", "ADHD"])
    if rows[3] != summary_row(pr, 2):
        fail("lapses summary row %r vs %r" % (rows[3], summary_row(pr, 2)))
    w = exp_lapses(R)
    check_values(c, w)
    check_answer(c, w["F"])
    check_lookup(c, "sources/tables/F_table.pdf", 1, "ν_d=21", "ν_n=2 (lightface, P<.05)", 3.47, 21, False)
    if not (3.527 < abs(w["tSleep"]) < 3.819 and abs(w["tADHD"]) > 3.819 and w["F"] > 5.78):
        fail("lapses P ranges")
    if abs(w["F"] - pr["F"]) > 0.02:
        fail("lapses F from R squared is far from the printed F")

    # summary, confint, refit: vocabulary
    c = cases["n19-b-toddler-vocabulary-refit"]
    f, g = R["vocabFull"], R["vocabRefit"]
    rows = c["table"]["rows"]
    names = ["(Intercept)", "Age", "AdultWords", "Screen"]
    check_coef_rows(c, rows[0:4], f, names)
    if rows[4][1:] != summary_row(f, 3):
        fail("vocab full summary row %r vs %r" % (rows[4], summary_row(f, 3)))
    for row, name, ci in zip(rows[5:9], names, f["ci"]):
        if row[1] != name or not same(row[2], ci[0]) or not same(row[3], ci[1]):
            fail("vocab confint row %r vs %r" % (row, ci))
    check_coef_rows(c, rows[9:12], g, names[:3])
    if rows[12][1:] != summary_row(g, 2):
        fail("vocab refit summary row %r vs %r" % (rows[12], summary_row(g, 2)))
    w = exp_vocab(R)
    check_values(c, w)
    check_answer(c, w["prediction"])
    check_lookup(c, T, 1, "26", "0.05", 2.056, 26, False)
    if not (abs(w["tScreen"]) < 2.056 and w["ciScreen"][0] < 0 < w["ciScreen"][1] and f["F"] > 4.64):
        fail("vocab decisions")
    if min(abs(g["t"][1]), abs(g["t"][2])) <= 3.690 or min(abs(f["t"][1]), abs(f["t"][2])) <= 2.056:
        fail("vocab kept variables")
    if abs(w["ciScreen"][0] - f["ci"][3][0]) > 0.01 or abs(w["ciScreen"][1] - f["ci"][3][1]) > 0.01:
        fail("vocab hand interval is far from confint()")

    # logistic regression, rising curve
    c = cases["n19-b-tone-detection"]
    check_coef_rows(c, c["table"]["rows"], R["tone"], ["(Intercept)", "Level"], stat="z")
    w = exp_tone(R)
    check_values(c, w)
    check_answer(c, w["probability"])
    check_lookup(c, T, 2, "∞", "0.05", 1.96, None, False)
    if not (w["b1"] > 0 and abs(w["z"]) > 3.2905):
        fail("tone slope")

    # logistic regression, falling curve
    c = cases["n19-b-absolute-pitch-start-age"]
    check_coef_rows(c, c["table"]["rows"], R["ap"], ["(Intercept)", "StartAge"], stat="z")
    w = exp_ap(R)
    check_values(c, w)
    check_answer(c, w["p4"])
    check_lookup(c, T, 2, "∞", "0.05", 1.96, None, False)
    if not (w["b1"] < 0 and 2.3263 < abs(w["z"]) < 2.5758 and w["p4"] > w["p12"]):
        fail("absolute pitch slope")

    # numeric quiz questions: the keyed option is the recomputed number
    q = {x["id"]: x for x in pack["questions"]}
    keyed = {
        "m2-n19-qb01": (exp_margin(67, 150, 48, 160)["margin"], 5e-5),
        "m2-n19-qb03": (exp_design(23, 137, 61, 179)[0]["RR"], 5e-5),
        "m2-n19-qb05": (exp_slopes(R)["t"], 5e-4),
        "m2-n19-qb07": (exp_lapses(R)["F"], 5e-3),
        "m2-n19-qb08": (exp_vocab(R)["prediction"], 5e-3),
        "m2-n19-qb09": (exp_tone(R)["probability"], 5e-5),
    }
    for qid, (want, tol) in keyed.items():
        if q[qid]["case"] is None or abs(option_number(q[qid]) - want) > tol:
            fail("%s keyed option %s vs %r" % (qid, q[qid]["options"][q[qid]["correct"]], want))

    if FAILS:
        print("%d problems" % len(FAILS))
        sys.exit(1)
    print("session19b: 10 cases and 10 questions agree with the refits and the printed tables")


if __name__ == "__main__":
    main()
