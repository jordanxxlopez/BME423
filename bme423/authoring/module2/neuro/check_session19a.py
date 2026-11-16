#!/usr/bin/env python3
"""Checks authoring/module2/neuro/session19a.json.

Every model is refitted here from the invented raw data stored below (statsmodels), the R-style
printed numbers are rebuilt from the fit, and the answer and every entry of `values` are
recomputed from those raw inputs. Printed critical values are compared with SciPy.
Run with /Users/jordanlopez/fsl/bin/python3. Exits 0 when everything agrees.
"""
import json, math, re, sys
from pathlib import Path
import numpy as np
import statsmodels.api as sm
from scipy import stats

HERE = Path(__file__).resolve().parent
FILE = HERE / 'session19a.json'
METHODS = {'s19margin', 's19design', 's19slopes', 's19mlrfit', 's19mlrtest', 's19logistic'}

# ---------------------------------------------------------------- invented raw data
MIGRAINE = {'m1': 87, 'n1': 210, 'm2': 58, 'n2': 205}          # pain free at 2 h: Drug, Placebo
HELMET = {'nTD': 21, 'nTA': 391, 'nCD': 41, 'nCA': 489}        # concussion / no concussion
TREMOR = {'med': {'years': [2, 5, 5, 6, 6, 6, 8, 8, 8, 9, 9, 9, 11, 11, 13],
                  'amp': [0.8, 5.6, 2.8, 4.7, 6.1, 5.8, 5.3, 8.5, 6.6, 5.5, 6.8, 5.7, 8.6, 6.3, 9.9]},
          'dbs': {'years': [1, 2, 2, 6, 6, 6, 7, 11, 11, 11, 12, 13, 14],
                  'amp': [0.4, 1.3, 3.8, 3.4, 4.2, 1.8, 2.5, 3.9, 5.6, 3.7, 4.3, 6.7, 4.2]}}
STROKE = {'y': [42, 44, 40, 25, 34, 39, 30, 41, 48, 39, 43, 33, 23, 42, 50],
          'x1': [2, 11, 12, 8, 3, 3, 2, 5, 11, 4, 11, 2, 2, 7, 3],
          'x2': [39, 19, 24, 11, 30, 33, 27, 22, 28, 20, 23, 24, 14, 27, 42]}
SLEEP = {'y': [26, 14, 21, 19, 19, 23, 24, 24, 23, 21, 18, 24],
         'x1': [109, 51, 59, 63, 59, 109, 114, 91, 48, 52, 71, 79],
         'x2': [2.8, 1.9, 3.5, 1.8, 2.6, 2.9, 2.7, 3.1, 3.5, 4.1, 2.3, 3.3]}
SMOKE = {'craving': [58, 43, 50, 42, 71, 46, 73, 56, 43, 55, 41, 47, 59, 59, 62, 37, 62, 60, 48, 46, 59, 25, 68, 77],
         'dependence': [5, 6, 6, 4, 10, 4, 7, 4, 5, 10, 2, 7, 5, 7, 8, 4, 7, 7, 5, 2, 7, 1, 9, 9],
         'hours': [14, 1, 16, 16, 10, 14, 13, 13, 3, 1, 5, 4, 9, 14, 12, 7, 9, 11, 13, 2, 13, 3, 10, 8]}
SPEECH = {'score': [71, 73, 62, 59, 85, 79, 66, 60, 66, 84, 77, 74, 77, 66, 79, 70, 71, 65, 74, 79, 63, 69, 63, 65, 69, 86, 73, 65, 88, 80],
          'age': [67, 68, 76, 82, 53, 56, 78, 82, 59, 61, 79, 65, 60, 78, 60, 65, 72, 69, 54, 52, 79, 76, 78, 69, 78, 62, 66, 77, 55, 61],
          'pta': [20, 16, 18, 17, 8, 11, 19, 31, 19, 5, 8, 14, 10, 22, 14, 30, 10, 14, 24, 13, 26, 16, 9, 18, 21, 5, 10, 20, 5, 12],
          'music': [14, 10, 20, 15, 1, 3, 11, 17, 1, 14, 15, 16, 18, 4, 11, 16, 7, 4, 10, 1, 4, 17, 14, 18, 17, 18, 6, 9, 12, 5]}
PAIN = {'tolerance': [42, 91, 66, 96, 91, 40, 57, 120, 88, 117, 85, 88, 46, 65, 87, 99, 82, 128, 73, 94, 74, 67, 96, 81, 54, 86, 89, 48, 84, 92, 86, 92, 81, 61, 85],
        'anxiety': [58, 69, 66, 48, 69, 70, 70, 27, 45, 53, 37, 42, 54, 62, 51, 32, 56, 65, 34, 50, 40, 67, 26, 46, 67, 44, 30, 61, 70, 71, 68, 41, 59, 70, 51],
        'sleep': [5.3, 7.2, 7.7, 8.7, 7.5, 5.1, 6.7, 6.7, 6.8, 8.8, 6.1, 5.5, 6.8, 7.4, 8.7, 7.1, 5.7, 8.7, 6.7, 7.5, 6.6, 5.5, 7.6, 8.0, 5.4, 6.6, 6.1, 5.3, 5.5, 8.8, 8.5, 6.2, 7.8, 4.7, 8.6],
        'catastrophizing': [37, 15, 23, 6, 33, 38, 13, 34, 17, 14, 16, 9, 39, 7, 19, 26, 21, 7, 38, 34, 36, 9, 18, 18, 15, 4, 33, 30, 7, 10, 18, 36, 35, 8, 37]}
ALC = {'dependence': [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
       'agefirst': [16, 16, 19, 21, 11, 12, 20, 21, 13, 14, 20, 15, 14, 20, 13, 15, 18, 17, 11, 11, 20, 19, 20, 16, 19, 14, 15, 19, 12, 14, 12, 15, 21, 12, 15, 15, 20, 13, 16, 13, 11, 19, 11, 14, 16, 16, 12, 21, 19, 21, 12, 18, 14, 16, 21, 14, 18, 12, 14, 21, 15, 16, 14, 12, 15, 17, 16, 19, 14, 17, 19, 21, 15, 11, 18, 16, 20, 16, 15, 11, 16, 18, 19, 20, 13, 17, 19, 13, 14, 20, 17, 16, 18, 16, 21, 19, 11, 12, 16, 20, 11, 18, 19, 19, 20, 13, 17, 19, 14, 13, 16, 11, 13, 20, 18, 20, 20, 20, 14, 16]}
TONE = {'heard': [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1],
        'level': [10, 10, 12, 12, 14, 14, 16, 16, 18, 18, 20, 20, 22, 22, 24, 24, 26, 26, 28, 28, 30, 30, 32, 32]}
# x values the questions ask about
ASK = {'smoke': (6, 8), 'speech': (70, 30), 'pain': (45, 7.5, 20), 'alc': 14, 'tone': (16, 30)}

# ---------------------------------------------------------------- printed class tables (read from the PDFs)
T_COLS = [0.05, 0.02, 0.01, 0.005, 0.002, 0.001]
T_TABLE = {21: [2.080, 2.518, 2.831, 3.135, 3.527, 3.819],
           24: [2.064, 2.492, 2.797, 3.091, 3.467, 3.745],
           26: [2.056, 2.479, 2.779, 3.067, 3.435, 3.707],
           27: [2.052, 2.473, 2.771, 3.057, 3.421, 3.690],
           31: [2.040, 2.453, 2.744, 3.022, 3.375, 3.633],
           'inf': [1.9600, 2.3263, 2.5758, 2.8070, 3.0902, 3.2905]}
F_TABLE = {(2, 21): (3.47, 5.78), (3, 26): (2.98, 4.64), (3, 30): (2.92, 4.51)}   # (0.05 lightface, 0.01 boldface)
CHI_05_1, CHI_01_1 = 3.841, 6.635


def tcrit(df, alpha=0.05):
    return T_TABLE[df][T_COLS.index(alpha)]


# ---------------------------------------------------------------- R-style number formatting
def sig(x, n):
    return float(f'{x:.{n - 1}e}')


def coef_decimals(vals):
    """Decimals R uses so the smallest magnitude in the Estimate / Std. Error columns keeps 4 significant digits."""
    m = min(abs(v) for v in vals)
    return max(0, 3 - math.floor(math.log10(m)))


def pfmt(p):
    """One p value as R prints it in a coefficient table: 3 significant digits, e-notation below 1e-4."""
    if p < 1e-4:
        return f'{p:.2e}'
    s = f'{p:.3g}'
    if len(s.replace('.', '').lstrip('0')) < 3:      # R keeps the trailing zeros, e.g. 0.0470
        return f'{p:.{2 - math.floor(math.log10(p))}f}'
    return float(s)


def pfmt_overall(p):
    """The p-value on the F-statistic line: 4 significant digits."""
    return f'{p:.3e}' if p < 1e-4 else f'{p:.4g}'


def ols(y, *xs):
    return sm.OLS(np.array(y, float), sm.add_constant(np.column_stack([np.array(x, float) for x in xs]))).fit()


def logit(y, x):
    return sm.GLM(np.array(y, float), sm.add_constant(np.array(x, float)), family=sm.families.Binomial()).fit()


def lm_rows(fit, names, lead=None):
    """Coefficient rows and the last summary row, as the R summary(lm()) prints them."""
    d = coef_decimals(list(fit.params) + list(fit.bse))
    rows = []
    for nm, b, s, t, p in zip(['(Intercept)'] + names, fit.params, fit.bse, fit.tvalues, fit.pvalues):
        r = [nm, round(float(b), d), round(float(s), d), round(float(t), 3), pfmt(float(p))]
        rows.append(([lead] if lead else []) + r)
    k = len(names); df = int(fit.df_resid)
    info = {'s': sig(math.sqrt(fit.scale), 4), 'R2': sig(fit.rsquared, 4), 'adjR2': sig(fit.rsquared_adj, 4),
            'F': sig(fit.fvalue, 4), 'p': pfmt_overall(float(fit.f_pvalue)), 'k': k, 'df': df, 'decimals': d}
    r2 = 'R²' if lead else 'Multiple R²'; adj = 'Adj R²' if lead else 'Adjusted R²'
    last = [f"Residual SE {info['s']:g} on {df} df", f"{r2} {info['R2']:g}", f"{adj} {info['adjR2']:g}",
            f"F {info['F']:g} on {k} and {df} DF", f"p {info['p']}"]
    rows.append(([lead] if lead else []) + last)
    return rows, info


def glm_rows(fit, name):
    d = coef_decimals(list(fit.params) + list(fit.bse))
    return [[nm, round(float(b), d), round(float(s), d), round(float(z), 3), pfmt(float(p))]
            for nm, b, s, z, p in zip(['(Intercept)', name], fit.params, fit.bse, fit.tvalues, fit.pvalues)]


# ---------------------------------------------------------------- recomputation of every case from the raw data
def expected():
    E = {}

    # --- margin of error: migraine trial
    m1, n1, m2, n2 = (MIGRAINE[k] for k in ('m1', 'n1', 'm2', 'n2'))
    p1, p2 = m1 / n1, m2 / n2
    pooled = (m1 + m2) / (n1 + n2)
    se = math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
    z = tcrit('inf'); M = z * se; d = p1 - p2
    E['n19-migraine-margin'] = {'answer': M, 'values': {
        'm1': m1, 'n1': n1, 'm2': m2, 'n2': n2, 'p1': p1, 'p2': p2, 'pooled': pooled, 'se': se, 'critical': z,
        'difference': d, 'margin': M, 'lower': d - M, 'upper': d + M, 'reject': not (d - M <= 0 <= d + M)},
        'table': [['Drug', m1, n1], ['Placebo', m2, n2]]}

    # --- study design: helmet cover and concussion
    a, b, c, dd = (HELMET[k] for k in ('nTD', 'nTA', 'nCD', 'nCA'))
    nT, nC = a + b, c + dd; N = nT + nC
    obs = np.array([[a, b], [c, dd]], float)
    exp = np.outer(obs.sum(1), obs.sum(0)) / N
    cells = (np.abs(obs - exp) - 0.5) ** 2 / exp
    chi = float(cells.sum())
    assert abs(chi - stats.chi2_contingency(obs, correction=True)[0]) < 1e-9
    E['n19-helmet-concussion-risk'] = {'answer': (a / nT) / (c / nC), 'values': {
        'nTD': a, 'nTA': b, 'nCD': c, 'nCA': dd, 'nT': nT, 'nC': nC, 'riskT': a / nT, 'riskC': c / nC,
        'RR': (a / nT) / (c / nC), 'chiSquare': chi, 'df': 1, 'critical': CHI_05_1, 'reject': chi > CHI_05_1},
        'table': [['Padded cover', a, b, nT], ['Standard helmet', c, dd, nC]],
        'extra': {'expected': exp, 'cells': cells, 'chiPlain': float(((obs - exp) ** 2 / exp).sum())}}

    # --- comparing slopes: tremor amplitude on years since diagnosis
    fm = ols(TREMOR['med']['amp'], TREMOR['med']['years']); fd = ols(TREMOR['dbs']['amp'], TREMOR['dbs']['years'])
    bM, sbM = round(float(fm.params[1]), 4), round(float(fm.bse[1]), 4)
    bF, sbF = round(float(fd.params[1]), 4), round(float(fd.bse[1]), 4)
    nM, nF = len(TREMOR['med']['amp']), len(TREMOR['dbs']['amp'])
    seD = math.hypot(sbM, sbF); t = (bM - bF) / seD; df = nM + nF - 4
    E['n19-parkinson-tremor-slopes'] = {'answer': t, 'values': {
        'bM': bM, 'sbM': sbM, 'bF': bF, 'sbF': sbF, 'nM': nM, 'nF': nF, 'difference': bM - bF, 'seDiff': seD,
        't': t, 'df': df, 'critical': tcrit(df), 'reject': abs(t) > tcrit(df)},
        'table': [['Medication only', nM, bM, sbM, sig(math.sqrt(fm.scale), 4)],
                  ['Deep brain stimulation', nF, bF, sbF, sig(math.sqrt(fd.scale), 4)]]}

    # --- multiple regression fit by matrices (two cases)
    for cid, D, ans in (('n19-stroke-arm-least-squares', STROKE, 'b1'), ('n19-sleep-recall-least-squares', SLEEP, 'b2')):
        y = np.array(D['y'], float); X = np.column_stack([np.ones(len(y)), D['x1'], D['x2']]).astype(float)
        XtX = X.T @ X; Xty = X.T @ y; inv = np.linalg.inv(XtX); bb = inv @ Xty
        fit = ols(D['y'], D['x1'], D['x2'])
        assert np.allclose(bb, fit.params)
        res = y - X @ bb; SSres = float(res @ res); SStot = float(((y - y.mean()) ** 2).sum())
        n, k = len(y), 2; s2 = SSres / (n - k - 1)
        vals = {'n': n, 'k': k, 'b0': float(bb[0]), 'b1': float(bb[1]), 'b2': float(bb[2]), 'SSres': SSres, 'SStot': SStot,
                's2': s2, 's': math.sqrt(s2), 'R2': 1 - SSres / SStot}
        E[cid] = {'answer': vals[ans], 'values': vals,
                  'table': [[i + 1, D['y'][i], D['x1'][i], D['x2'][i]] for i in range(n)],
                  'extra': {'XtX': XtX, 'Xty': Xty, 'inv': inv, 'fit': fit}}

    # --- reading a summary: cigarette craving (k = 2)
    fit = ols(SMOKE['craving'], SMOKE['dependence'], SMOKE['hours'])
    rows, info = lm_rows(fit, ['Dependence', 'Hours'])
    n, k = len(SMOKE['craving']), 2; dfr = n - k - 1
    R2 = info['R2']; F = (R2 / k) / ((1 - R2) / dfr); tc = tcrit(dfr)
    b0, (b1, s1), (b2, s2_) = rows[0][1], rows[1][1:3], rows[2][1:3]
    x1, x2 = ASK['smoke']
    E['n19-smoking-craving-summary'] = {'answer': F, 'values': {
        'n': n, 'k': k, 'R2': R2, 'F': F, 'dfMod': k, 'dfRes': dfr, 'Fcritical': F_TABLE[(k, dfr)][0],
        'tDependence': b1 / s1, 'tHours': b2 / s2_, 'tcritical': tc,
        'ciDependence': [b1 - tc * s1, b1 + tc * s1], 'ciHours': [b2 - tc * s2_, b2 + tc * s2_],
        'prediction': b0 + b1 * x1 + b2 * x2, 'reject': F > F_TABLE[(k, dfr)][0]},
        'table': rows, 'extra': {'info': info, 'fit': fit}}

    # --- reading a summary: cold pressor tolerance (k = 3, residual df 31 is not a printed F row)
    fit = ols(PAIN['tolerance'], PAIN['anxiety'], PAIN['sleep'], PAIN['catastrophizing'])
    rows, info = lm_rows(fit, ['Anxiety', 'Sleep', 'Catastrophizing'])
    n, k = len(PAIN['tolerance']), 3; dfr = n - k - 1
    R2 = info['R2']; F = (R2 / k) / ((1 - R2) / dfr); tc = tcrit(dfr)
    b0 = rows[0][1]; co = [rows[i][1:3] for i in (1, 2, 3)]
    xs = ASK['pain']
    E['n19-cold-pressor-summary'] = {'answer': b0 + sum(c_[0] * x for c_, x in zip(co, xs)), 'values': {
        'n': n, 'k': k, 'R2': R2, 'F': F, 'dfMod': k, 'dfRes': dfr, 'Fcritical': F_TABLE[(3, 30)][0],
        'tAnxiety': co[0][0] / co[0][1], 'tSleep': co[1][0] / co[1][1], 'tCatastrophizing': co[2][0] / co[2][1],
        'tcritical': tc,
        'ciAnxiety': [co[0][0] - tc * co[0][1], co[0][0] + tc * co[0][1]],
        'ciSleep': [co[1][0] - tc * co[1][1], co[1][0] + tc * co[1][1]],
        'ciCatastrophizing': [co[2][0] - tc * co[2][1], co[2][0] + tc * co[2][1]],
        'prediction': b0 + sum(c_[0] * x for c_, x in zip(co, xs)), 'reject': F > F_TABLE[(3, 30)][0]},
        'table': rows, 'extra': {'info': info, 'fit': fit}}

    # --- summary, confint, refit and prediction: speech in noise
    full = ols(SPEECH['score'], SPEECH['age'], SPEECH['pta'], SPEECH['music'])
    refit = ols(SPEECH['score'], SPEECH['age'], SPEECH['pta'])
    rf, inf_f = lm_rows(full, ['Age', 'PTA', 'Music'], lead='summary (full)')
    rr, inf_r = lm_rows(refit, ['Age', 'PTA'], lead='summary (refit)')
    ci = full.conf_int(0.05)
    rc = [['confint (full) 2.5% / 97.5%', nm, round(float(lo), 4), round(float(hi), 4), '', '']
          for nm, (lo, hi) in zip(['(Intercept)', 'Age', 'PTA', 'Music'], ci)]
    n, k = len(SPEECH['score']), 3; dfr = n - k - 1; tc = tcrit(dfr)
    bMu, sMu = rf[3][2], rf[3][3]
    age, pta = ASK['speech']
    rb0, rbA, rbP = rr[0][2], rr[1][2], rr[2][2]
    E['n19-speech-noise-refit'] = {'answer': rb0 + rbA * age + rbP * pta, 'values': {
        'n': n, 'k': k, 'F': inf_f['F'], 'tMusic': bMu / sMu, 'ciMusic': [bMu - tc * sMu, bMu + tc * sMu],
        'refitB0': rb0, 'refitAge': rbA, 'refitPTA': rbP, 'age': age, 'pta': pta,
        'prediction': rb0 + rbA * age + rbP * pta, 'tcritical': tc},
        'table': rf + rc + rr, 'extra': {'full': inf_f, 'refit': inf_r, 'fitFull': full, 'fitRefit': refit}}

    # --- logistic regression: alcohol dependence on age at first drink
    fit = logit(ALC['dependence'], ALC['agefirst']); rows = glm_rows(fit, 'AgeFirst')
    b0, b1, s1 = rows[0][1], rows[1][1], rows[1][2]; x = ASK['alc']
    eta = b0 + b1 * x; p = 1 / (1 + math.exp(-eta)); pr = round(p, 2)
    E['n19-first-drink-dependence'] = {'answer': p, 'values': {
        'b0': b0, 'b1': b1, 'age': x, 'eta': eta, 'probability': p, 'oddsSlide': pr / (1 - pr),
        'oddsExact': math.exp(eta), 'z': b1 / s1}, 'table': rows, 'extra': {'fit': fit}}

    # --- logistic regression: tone detection on sound level
    fit = logit(TONE['heard'], TONE['level']); rows = glm_rows(fit, 'Level')
    b0, b1, s1 = rows[0][1], rows[1][1], rows[1][2]; xa, xb = ASK['tone']
    pa = 1 / (1 + math.exp(-(b0 + b1 * xa))); pb = 1 / (1 + math.exp(-(b0 + b1 * xb)))
    E['n19-tone-detection-level'] = {'answer': pa, 'values': {
        'b0': b0, 'b1': b1, f'p{xa}': pa, f'p{xb}': pb, 'oddsPerDegree': math.exp(b1), 'z': b1 / s1,
        'halfwayTemp': -b0 / b1}, 'table': rows, 'extra': {'fit': fit}}
    return E


# ---------------------------------------------------------------- comparisons
errors = []


def need(ok, msg):
    if not ok:
        errors.append(msg)


def close(a, b, tol=1e-9):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (list, tuple)):
        return len(a) == len(b) and all(close(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, str) or isinstance(b, str):
        return str(a) == str(b)
    return abs(a - b) <= tol * max(1.0, abs(b))


def check_tables():
    """Every printed critical value used anywhere agrees with SciPy to the rounding of the printed table."""
    for df, row in T_TABLE.items():
        for a, v in zip(T_COLS, row):
            exact = stats.norm.ppf(1 - a / 2) if df == 'inf' else stats.t.ppf(1 - a / 2, df)
            need(abs(exact - v) < (0.00006 if df == 'inf' else 0.0006), f't table df {df} alpha {a}: printed {v}, SciPy {exact:.5f}')
    for (k, df), (f05, f01) in F_TABLE.items():
        need(abs(stats.f.ppf(0.95, k, df) - f05) < 0.006, f'F table ({k},{df}) 0.05 printed {f05}')
        need(abs(stats.f.ppf(0.99, k, df) - f01) < 0.006, f'F table ({k},{df}) 0.01 printed {f01}')
    need(abs(stats.chi2.ppf(0.95, 1) - CHI_05_1) < 0.0006 and abs(stats.chi2.ppf(0.99, 1) - CHI_01_1) < 0.0006, 'chi-square table row 1')
    # the conservative bracket used for residual df 31: the printed row 30 cutoff is larger than the exact df 31 cutoff
    need(F_TABLE[(3, 30)][0] > stats.f.ppf(0.95, 3, 31) and F_TABLE[(3, 30)][1] > stats.f.ppf(0.99, 3, 31), 'row 30 is not conservative for df 31')


def check_lookup(cid, look, where):
    if look is None:
        return
    need((HERE.parents[2] / look['path']).exists(), f'{cid} {where}: table file {look["path"]} missing')
    v = look['value']; path = look['path']
    if 't_table' in path:
        row = 'inf' if look['row'] == '∞' else int(look['row'])
        need(row in T_TABLE and abs(tcrit(row, float(look['column'])) - v) < 1e-9, f'{cid} {where}: t lookup {look}')
        need(look['page'] == (2 if row == 'inf' or row > 46 else 1), f'{cid} {where}: t table page')
    elif 'F_table' in path:
        dfd = int(re.search(r'ν_d=(\d+)', look['row']).group(1)); dfn = int(re.search(r'ν_n=(\d+)', look['column']).group(1))
        need(abs(F_TABLE[(dfn, dfd)][0] - v) < 1e-9, f'{cid} {where}: F lookup {look}')
        need(look['approximation'] == (look['actualDf'] != dfd), f'{cid} {where}: approximation flag')
    elif 'Chi_Squared' in path:
        need(abs(v - CHI_05_1) < 1e-9 and str(look['row']) == '1', f'{cid} {where}: chi-square lookup {look}')
    else:
        need(False, f'{cid} {where}: unknown table {path}')


KEYS = ['id', 'title', 'topic', 'context', 'unit', 'table', 'tasks', 'hypotheses', 'symbols', 'steps', 'conclusion',
        'source', 'lookup', 'values', 'module', 'tolerance', 'answerName', 'answer']
MIN_STEPS = {'s19margin': 7, 's19design': 7, 's19slopes': 6, 's19mlrfit': 6, 's19mlrtest': 6, 's19logistic': 4}
BANNED = re.compile(r'\b(professor|lecture|slide|session|pictured)\b|\b(the|a|this|that|full|whole|clear|big)\s+picture\b', re.I)


def main():
    d = json.loads(FILE.read_text())
    need(set(d) == {'cases', 'questions', 'notes'}, 'top-level keys')
    check_tables()
    E = expected()
    cases = d['cases']; ids = [c['id'] for c in cases]
    need(len(cases) == 10 and len(set(ids)) == 10, 'need 10 unique cases')
    need(set(ids) == set(E), f'case ids differ from the recomputed set: {sorted(set(ids) ^ set(E))}')
    topics = [c['topic'] for c in cases]
    need({t: topics.count(t) for t in METHODS} == {'s19margin': 1, 's19design': 1, 's19slopes': 1, 's19mlrfit': 2, 's19mlrtest': 3, 's19logistic': 2}, 'topic counts')
    for c in cases:
        cid = c['id']; e = E.get(cid)
        need(cid.startswith('n19-'), f'{cid}: id prefix')
        need(list(c.keys()) == KEYS, f'{cid}: key set differs from the reference cases')
        need(c['module'] == 19 and c['topic'] in METHODS and c['source'] == 'Original neuroscience practice example', f'{cid}: module/topic/source')
        need(len(c['steps']) >= MIN_STEPS[c['topic']], f'{cid}: too few steps')
        if e is None:
            continue
        # answer, tolerance and every value recomputed from the raw data
        need(close(c['answer'], e['answer']), f'{cid}: answer {c["answer"]} vs {e["answer"]}')
        need(c['tolerance'] >= 0.001 and abs(c['tolerance'] - max(0.001, round(0.005 * abs(e['answer']), 6))) < 1e-9, f'{cid}: tolerance')
        need(set(c['values']) == set(e['values']), f'{cid}: values keys {sorted(set(c["values"]) ^ set(e["values"]))}')
        for k_, v in e['values'].items():
            need(k_ in c['values'] and close(c['values'][k_], v), f'{cid}: values.{k_} {c["values"].get(k_)} vs {v}')
        # the table (raw data or R output) equals what the refit prints
        need(len(c['table']['rows']) == len(e['table']), f'{cid}: table row count')
        for r1, r2 in zip(c['table']['rows'], e['table']):
            need(close(r1, r2), f'{cid}: table row {r1} vs refit {r2}')
        check_lookup(cid, c['lookup'], 'case lookup')
        for i, s in enumerate(c['steps']):
            need(s.get('title') and s.get('general') and s.get('work') and s.get('words'), f'{cid} step {i + 1}: title, general, work and words needed')
            check_lookup(cid, s.get('classTable'), f'step {i + 1}')
        # wording rules
        for f_ in ['context', 'conclusion'] + [f'task{i}' for i in range(len(c['tasks']))] + [f'words{i}' for i in range(len(c['steps']))]:
            txt = c[f_] if f_ in c else c['tasks'][int(f_[4:])] if f_.startswith('task') else c['steps'][int(f_[5:])]['words']
            plain = re.sub(r'\\\(.+?\\\)', '', txt).replace('__ : 1', '')
            # context and tasks may carry the homework's own phrases with their punctuation
            need(f_ == 'context' or f_.startswith('task') or (':' not in plain and ';' not in plain), f'{cid} {f_}: colon or semicolon in "{txt[:60]}"')
        need(not BANNED.search(json.dumps(c, ensure_ascii=False)), f'{cid}: banned word')

    # decisions and P ranges stated in the solutions, from the raw data
    v = {c['id']: c['values'] for c in cases}
    need(v['n19-migraine-margin']['reject'] is True, 'migraine: interval should exclude 0')
    need(v['n19-helmet-concussion-risk']['reject'] is False, 'helmet: chi-square should not reject')
    t = v['n19-parkinson-tremor-slopes']['t']; need(tcrit(24, 0.02) < t < tcrit(24, 0.01), 'tremor: 0.01 < P < 0.02')
    s = v['n19-smoking-craving-summary']
    need(s['F'] > F_TABLE[(2, 21)][1] and s['tDependence'] > tcrit(21, 0.001) and tcrit(21, 0.05) < s['tHours'] < tcrit(21, 0.02), 'smoking: stated P ranges')
    p_ = v['n19-cold-pressor-summary']
    need(p_['F'] > F_TABLE[(3, 30)][1] and tcrit(31, 0.002) < abs(p_['tAnxiety']) < tcrit(31, 0.001) and p_['tSleep'] > tcrit(31, 0.001)
         and tcrit(31, 0.05) < abs(p_['tCatastrophizing']) < tcrit(31, 0.02), 'cold pressor: stated P ranges')
    sp = v['n19-speech-noise-refit']; ef = E['n19-speech-noise-refit']['extra']
    need(sp['F'] > F_TABLE[(3, 26)][1] and abs(sp['tMusic']) < tcrit(26) and sp['ciMusic'][0] < 0 < sp['ciMusic'][1], 'speech: Music should not be significant')
    need(all(abs(tv) > tcrit(26, 0.001) for tv in ef['fitFull'].tvalues[1:3]) and all(abs(tv) > tcrit(27, 0.001) for tv in ef['fitRefit'].tvalues[1:]), 'speech: Age and PTA P < 0.001')
    need(abs(v['n19-first-drink-dependence']['z']) > tcrit('inf', 0.001), 'first drink: P < 0.001')
    need(tcrit('inf', 0.05) < v['n19-tone-detection-level']['z'] < tcrit('inf', 0.02), 'tone: 0.02 < P < 0.05')

    # questions
    qs = d['questions']; qids = [q['id'] for q in qs]
    need(qids == [f'm2-n19-qa{i:02d}' for i in range(1, 11)], 'question ids')
    for q in qs:
        need(list(q.keys()) == ['id', 'module', 'topic', 'stem', 'options', 'correct', 'why', 'case', 'equations'], f'{q["id"]}: keys')
        need(q['module'] == 19 and q['topic'] in METHODS, f'{q["id"]}: module/topic')
        need(len(q['options']) == 4 and len(set(q['options'])) == 4 and q['correct'] in range(4), f'{q["id"]}: options')
        need(q['case'] is None or q['case'] in ids, f'{q["id"]}: unknown case')
        need(not BANNED.search(json.dumps(q, ensure_ascii=False)), f'{q["id"]}: banned word')
    need(len({q['correct'] for q in qs}) == 4, 'correct index should vary over 0..3')
    need(sum(q['case'] is not None for q in qs) == 6, 'six numeric questions tied to cases')

    def opt(qid):
        q = next(q for q in qs if q['id'] == qid)
        return float(re.search(r'-?\d+\.?\d*', q['options'][q['correct']].replace('\\(', '').replace('\\)', '')).group(0))
    numeric = {'m2-n19-qa01': (v['n19-migraine-margin']['margin'], 4), 'm2-n19-qa02': (v['n19-helmet-concussion-risk']['RR'], 4),
               'm2-n19-qa03': (v['n19-parkinson-tremor-slopes']['t'], 3), 'm2-n19-qa04': (v['n19-stroke-arm-least-squares']['s'], 3),
               'm2-n19-qa05': (v['n19-smoking-craving-summary']['F'], 2), 'm2-n19-qa06': (v['n19-first-drink-dependence']['probability'], 4)}
    for qid, (val, nd) in numeric.items():
        need(abs(opt(qid) - round(val, nd)) < 1e-9, f'{qid}: keyed option {opt(qid)} vs recomputed {round(val, nd)}')

    if errors:
        print('\n'.join(errors)); print(f'{len(errors)} problems'); sys.exit(1)
    print(f'session19a.json OK: {len(cases)} cases and {len(qs)} questions recomputed from the stored data')


if __name__ == '__main__':
    main()
