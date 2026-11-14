"""ANOVA, step by step: within-group noise, between-group signal, F, the class F table.

Deterministic teaching animation (matplotlib + FFmpeg, no generative models).
Data are Exam 1 Question 4 (bone loss, three groups, n = 12): means 0.43, 2.62, 3.98 and
SDs 1.6, 2.68, 1.63. The dots are seeded draws rescaled so each group has exactly that mean
and SD, so every number on screen equals the exam solution (F = 9.314).

Run:  /Users/jordanlopez/fsl/bin/python3 bme423/authoring/animations/anova_two_variations.py
Writes bme423/media/anova-two-variations.mp4 and a poster PNG.
"""
import pathlib, math
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.animation import FFMpegWriter
from scipy import stats

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'media'; OUT.mkdir(exist_ok=True)
FPS, W, H = 30, 12.8, 7.2

BG, INK, MUTED = '#0f1420', '#e8edf5', '#8a96ab'
SIGNAL, NOISE = '#f2b632', '#3fd0d4'
GROUP = ['#6aa7ff', '#ff7fb6', '#b48cff']
NAMES = ['Estrogen cream', 'Calcium 2000 mg', 'Placebo + placebo']
MEANS = np.array([0.43, 2.62, 3.98]); SDS = np.array([1.6, 2.68, 1.63]); N = 12; M = 3
F_ROWS = {32: 3.29, 34: 3.28}           # printed class F table, numerator 2, upper tail 0.05
plt.rcParams.update({'font.family': 'monospace', 'font.monospace': ['Menlo', 'DejaVu Sans Mono'],
                     'mathtext.fontset': 'dejavusans', 'text.color': INK})

rng = np.random.default_rng(423)
Z = [(lambda z: (z - z.mean()) / z.std(ddof=1))(rng.standard_normal(N)) for _ in range(M)]
JIT = [rng.uniform(-0.16, 0.16, N) for _ in range(M)]
ROWS = np.array([2.0, 1.0, 0.0])

def stats_for(means):
    s_wit = (SDS ** 2).mean(); grand = means.mean(); s_xbar = means.var(ddof=1)
    s_bet = N * s_xbar; return s_wit, grand, s_xbar, s_bet, s_bet / s_wit

S_WIT, GRAND, S_XBAR, S_BET, F_OBS = stats_for(MEANS)
assert abs(F_OBS - 9.314) < 0.001 and abs(S_WIT - 4.1331) < 1e-3

def ease(t): t = min(max(t, 0), 1); return t * t * (3 - 2 * t)

# Timeline in seconds: (start, end) of each scene.
T = dict(drop=(0, 4), means=(4, 7.5), grand=(7.5, 10.5), within=(10.5, 18.5), between=(18.5, 26.5),
         ratio=(26.5, 31.5), table=(31.5, 41), shrink=(41, 51), end=(51, 54))
TOTAL = T['end'][1]

CAPTIONS = [
    ((0, 4), 'Three groups of 12 women, rate of bone loss in percent per year.'),
    ((4, 7.5), 'Each white tick is a group mean.'),
    ((7.5, 10.5), 'The yellow line is the grand mean, the average of the three group means.'),
    ((10.5, 18.5), 'Within-group variation is how far each woman sits from her own group mean.\nTreatment cannot change it, so it is the noise.'),
    ((18.5, 26.5), 'Between-group variation is how far the group means sit from the grand mean.\nIf the treatments differ, it grows, so it is the signal.'),
    ((26.5, 31.5), 'F divides the signal estimate by the noise estimate.\nBoth estimate the same variance when there is no effect, so F would be near 1.'),
    ((31.5, 41), 'Class F table, numerator 2 across the top. Denominator 33 is not printed,\nso use rows 32 and 34 (3.29 and 3.28). F is beyond both, so reject.'),
    ((41, 51), 'Same noise, but the group means move together.\nThe signal shrinks, so F falls below the cutoff and there is no evidence of a difference.'),
    ((51, 54), 'ANOVA asks whether the signal is large compared with the noise.'),
]

def frac(t, key): a, b = T[key]; return ease((t - a) / (b - a))

def draw(t, fig):
    fig.clf(); fig.patch.set_facecolor(BG)
    ax = fig.add_axes([0.07, 0.44, 0.56, 0.44]); ax.set_facecolor(BG)
    side = fig.add_axes([0.66, 0.44, 0.31, 0.44]); side.set_facecolor(BG); side.axis('off')
    fig.text(0.5, 0.94, 'ANOVA · two kinds of variation', ha='center', fontsize=22, color=SIGNAL, weight='bold')

    shrink = frac(t, 'shrink')
    means = MEANS + (GRAND - MEANS) * 0.82 * shrink
    s_wit, grand, s_xbar, s_bet, F = stats_for(means)

    ax.set_xlim(-6, 11); ax.set_ylim(-0.7, 2.7)
    for sp in ['top', 'right', 'left']: ax.spines[sp].set_visible(False)
    ax.spines['bottom'].set_color(MUTED); ax.tick_params(colors=MUTED, labelsize=11); ax.set_yticks([])
    ax.set_xlabel('rate of bone loss (%/year)', color=MUTED, fontsize=12)

    xs = np.linspace(-6, 11, 300)
    for g in range(M):
        y0 = ROWS[g]; pts = means[g] + SDS[g] * Z[g]
        ax.text(-5.9, y0 + 0.42, NAMES[g], color=GROUP[g], fontsize=11, va='bottom')
        dens = stats.norm.pdf(xs, means[g], SDS[g]); dens = dens / dens.max() * 0.38
        ax.fill_between(xs, y0, y0 + dens * frac(t, 'drop'), color=GROUP[g], alpha=0.10)
        ax.plot(xs, y0 + dens * frac(t, 'drop'), color=GROUP[g], lw=1.2, alpha=0.7)
        for i in range(N):
            delay = (g * N + i) / (M * N) * 2.4
            p = ease((t - delay) / 1.0)
            if p <= 0: continue
            y = y0 + 0.12 + JIT[g][i] * 0.5 + (1 - p) * 1.4
            if t >= T['within'][0] and t < T['shrink'][0]:
                q = frac(t, 'within'); x1 = means[g] + (pts[i] - means[g]) * (1 - q) * 0 + pts[i]
                ax.plot([means[g], means[g] + (pts[i] - means[g]) * q], [y, y], color=NOISE, lw=1.4, alpha=0.75)
            ax.scatter(pts[i], y, s=34, color=GROUP[g], alpha=p, zorder=3, edgecolors='none')
        if t >= T['means'][0]:
            a = frac(t, 'means'); ax.plot([means[g]] * 2, [y0 - 0.05, y0 + 0.5], color='white', lw=2.4, alpha=a, zorder=4)
        if t >= T['between'][0] and t < T['end'][1]:
            q = frac(t, 'between')
            ax.annotate('', xy=(grand + (means[g] - grand) * q, y0 - 0.22), xytext=(grand, y0 - 0.22),
                        arrowprops=dict(arrowstyle='->', color=SIGNAL, lw=2.2), zorder=5)
    if t >= T['grand'][0]:
        a = frac(t, 'grand'); ax.plot([grand, grand], [-0.55, 2.62], color=SIGNAL, lw=2.0, alpha=a, zorder=2)
        ax.text(grand, 2.64, f'grand mean {grand:.3f}', color=SIGNAL, ha='center', fontsize=11, alpha=a)

    # Right panel: the running calculation, revealed scene by scene.
    lines = []
    if t >= T['within'][0]:
        lines.append((NOISE, 'noise · within groups', r'$s^2_{wit}=\frac{1}{m}\sum s_i^2=\frac{1.6^2+2.68^2+1.63^2}{3}$', f'= {s_wit:.3f}'))
    if t >= T['between'][0]:
        lines.append((SIGNAL, 'signal · between groups', r'$s^2_{\bar X}=\frac{\sum(\bar x_i-\bar X)^2}{m-1},\quad s^2_{bet}=n\,s^2_{\bar X}$', f'= 12 × {s_xbar:.3f} = {s_bet:.3f}'))
    if t >= T['ratio'][0]:
        lines.append((INK, 'F ratio', r'$F=\frac{s^2_{bet}}{s^2_{wit}},\quad \nu_n=m-1=2,\ \nu_d=m(n-1)=33$', f'F = {s_bet:.3f} / {s_wit:.3f} = {F:.2f}'))
    y = 0.98
    for col, head, tex, val in lines:
        side.text(0.0, y, head, color=col, fontsize=12, weight='bold', va='top', transform=side.transAxes)
        side.text(0.0, y - 0.09, tex, color=INK, fontsize=12.5, va='top', transform=side.transAxes)
        side.text(0.0, y - 0.21, val, color=col, fontsize=13, va='top', transform=side.transAxes)
        y -= 0.33

    # Bottom strip: signal vs noise bars, then the F distribution with the table cutoff.
    if t >= T['ratio'][0]:
        bx = fig.add_axes([0.07, 0.17, 0.25, 0.17]); bx.set_facecolor(BG); bx.axis('off')
        a = frac(t, 'ratio'); top = max(S_BET, 40)
        bx.barh([1], [s_bet * a], color=SIGNAL, height=0.55); bx.barh([0], [s_wit * a], color=NOISE, height=0.55)
        bx.set_xlim(0, top * 1.05); bx.set_ylim(-0.6, 1.6)
        bx.text(0, 1.45, f'signal {s_bet:.1f}', color=SIGNAL, fontsize=11); bx.text(0, -0.55, f'noise {s_wit:.2f}', color=NOISE, fontsize=11)
    if t >= T['table'][0]:
        fx = fig.add_axes([0.40, 0.19, 0.55, 0.15]); fx.set_facecolor(BG)
        for sp in ['top', 'right', 'left']: fx.spines[sp].set_visible(False)
        fx.spines['bottom'].set_color(MUTED); fx.tick_params(colors=MUTED, labelsize=10); fx.set_yticks([])
        grid = np.linspace(0.01, 11, 400); pdf = stats.f.pdf(grid, 2, 33)
        reveal = frac(t, 'table'); k = max(2, int(len(grid) * min(1, reveal * 1.6)))
        fx.plot(grid[:k], pdf[:k], color=INK, lw=1.6); fx.set_xlim(0, 11); fx.set_ylim(0, pdf.max() * 1.15)
        cut = F_ROWS[34]; tail = grid >= cut
        fx.fill_between(grid[tail & (np.arange(len(grid)) < k)], 0, pdf[tail & (np.arange(len(grid)) < k)], color=SIGNAL, alpha=0.35)
        fx.axvline(cut, color=SIGNAL, lw=1.2, ls='--'); fx.text(cut + 0.1, pdf.max() * 1.02, 'cutoff 3.28 to 3.29', color=SIGNAL, fontsize=10)
        if reveal > 0.55:
            fx.axvline(min(F, 10.9), color='white', lw=2.2); fx.text(min(F, 10.9) + 0.1, pdf.max() * 0.55, f'F = {F:.2f}', color='white', fontsize=11)
        fx.text(11, pdf.max() * 1.02, 'F with 2 and 33 df', color=MUTED, fontsize=10, ha='right')
        verdict = 'reject H0 · P < 0.05' if F > F_ROWS[32] else 'do not reject H0'
        fig.text(0.95, 0.375, verdict, ha='right', fontsize=14, weight='bold', color=SIGNAL if F > F_ROWS[32] else NOISE)

    for (a, b), text in CAPTIONS:
        if a <= t < b or (b == TOTAL and t >= a):
            alpha = min(1, (t - a) / 0.4, (b - t) / 0.4 if b != TOTAL else 1)
            fig.text(0.5, 0.018, text, ha='center', va='bottom', fontsize=14, color=INK, alpha=max(alpha, 0), linespacing=1.4)

fig = plt.figure(figsize=(W, H), dpi=100)
writer = FFMpegWriter(fps=FPS, codec='libx264', bitrate=2400, extra_args=['-pix_fmt', 'yuv420p', '-preset', 'slow'])
out = OUT / 'anova-two-variations.mp4'
with writer.saving(fig, str(out), dpi=100):
    for f in range(int(TOTAL * FPS) + 1):
        draw(f / FPS, fig); writer.grab_frame(facecolor=BG)
draw(T['table'][1] - 0.5, fig); fig.savefig(OUT / 'anova-two-variations-poster.png', facecolor=BG, dpi=100)
print('wrote', out, round(out.stat().st_size / 1e6, 2), 'MB; F =', round(F_OBS, 3))
