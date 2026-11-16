# Exam 1 format questions with neuroscience settings (30 written questions)

Read `NEURO_SPEC.md` in this folder first: its "How the professor asks questions", "Content
rules" and writing rules all apply. This file adds the Exam 1 question types and the output shape.

Sources to read as images (Read tool) before writing:
- `/private/tmp/claude-501/-Users-jordanlopez--claude-spares-spare-UiFIRY/b9b55927-792a-4ff1-8382-d9c101af9587/scratchpad/prof/exam1_solutions.pdf` (the real Exam 1 with solutions, 13 pages)
- same folder: `hw1.pdf`, `hw1_solutions.pdf`, `hw2.pdf`, `hw2_solutions.pdf`, `hw_guidelines.pdf`
- printed tables in `sources/tables/` (z, t, F, chi-square). Critical values MUST be printed values.

## Exam cover rules (a solution must satisfy all of them)
1. State the statistical procedure for any question in which an inference is made.
2. State the null hypothesis in words about the problem ("μ1 = μ2 is not an acceptable null hypothesis").
3. Show the generic equations before numbers are plugged in, and the main intermediate calculations.
4. Report the critical value, the degrees of freedom and the level of significance, then the complete conclusion.
5. If the null hypothesis is rejected, include the P value (a range from the table, e.g. P < 0.01).
6. Do not isolate differences among multiple groups unless directed.
7. Interval data may be assumed Normally distributed with equal variances unless noted.

## Question types and how many to write (30 in total)
Follow the real exam's wording skeletons. Change the setting to neuroscience / psychology /
hearing / speech / music, and change every number.
- T1 (3 questions, 15 points each). Discrete random variable. "The distribution function (d.f.) of
  the discrete random variable Y (F(y)) is plotted below:" [step plot with 3 or 4 jumps at simple
  fractions]. Parts: "i) Write the equation for the probability function (p.f.) of Y (f(y)) that is
  associated with the d.f. shown above. The equation must completely define f(y) for all values of
  y." "ii) What is the probability that Y > __?" "iii) What is the probability that __ < Y < __?"
  (non-integer bounds, strict inequalities). These stay abstract like the exam (no story), but one
  of the three may say what Y counts in one clause (e.g. "the number of ... in a trial").
- T2 (3, 15 points). Continuous random variable. "The probability density function (p.d.f.) of the
  continuous random variable X is:" [piecewise, zero outside one interval, integrates to 1]. Parts:
  "i) What is the expected value of the random variable X (i.e., what is E[X])?" "ii) Write the
  equation for the distribution function (d.f.) (F(x)) of X that is associated with the p.d.f.
  above. The equation must completely define F(x) for all values of x." "iii) What is the __th
  percentile of the random variable X?" Use a different density shape in each (increasing line,
  decreasing line, constant plus slope or quadratic) with exact answers.
- T3 (4, 10 points). Sampling distribution of the mean with the z table. "[Measure] ([ABBR]) is a
  commonly used marker of [function]. In the population of [who], [ABBR] is Normally distributed
  with mean of __ [units] and standard deviation of __ [units]. What is the probability that the
  mean value of [ABBR] in a sample of [n, a perfect square] [who] is between __ and __ [units]?"
  Make the standard error clean and the z values land on printed z-table entries.
- T4 (4, 20 points). One-way balanced ANOVA from a table of group means and standard deviations
  (three groups, equal n of 8 to 15, test not named), ending "Based on these data, is there a
  difference in the [outcome] among these three groups? Use a significance level of α = 0.05 for
  your inference. (Note: If a difference exists, do not identify which groups are different.)"
- T5 (3, 15 points). Holm pairwise t tests after ANOVA, with a Mean / Variance / n table and an R
  `aov` table (Df, Sum Sq, Mean Sq, F value, Pr(>F), Signif. codes line), using the exam's task
  paragraph ("Perform the appropriate form of multiple pairwise comparisons, testing every group
  against every other group, using the Holm correction ... The only other information you will
  need are the sample mean values and n values from the data table."). The R numbers must be
  internally consistent (Mean Sq = Sum Sq / Df, F = ratio, Residual Mean Sq = mean of the three
  variances for equal n, Treatment Sum Sq from the means).
- T6 (4, 20 points). Chi-square test on a 2x3 (or 3x2) contingency table of counts with Totals,
  three randomized arms, test not named, ending "Based on this sample, is there a difference in
  rates of [outcome] among the different treatment groups? Use a significance level of α = 0.05
  for your inference. (Note: If you do find a difference, do not isolate differences.)"
- T7 (3, 5 points). Odds ratio from a retrospective case-control 2x2 table with the plain-language
  sentence task ("Quantify the degree of association between ... Provide your result in a single
  complete sentence that would convey your conclusion in a way that could be understood by a
  non-expert in statistics or medicine (e.g., a typical reader of a local newspaper).").
- Reviewed but not on the exam, in his homework wording (6 questions):
  two-sample t test from n, mean, s with unequal n (2 questions, 15 points);
  one-sample t test against a reference value (1, 10 points);
  z Test for two proportions, with Yates correction as in his homework solution (1, 15 points);
  Bonferroni pairwise t tests after a stated ANOVA with s²_with given (1, 15 points);
  2x2 chi-square with Yates then relative risk in one plain sentence, prospective study (1, 20 points).

Outcome mix across the 30: about three quarters of the inference questions reject, the rest do
not. Solutions use his notation (s²_wit, s²_bet, ν_n, ν_d, F_α(ν_n, ν_d), t_α(ν), E_ij,
(n_c − 1)(n_r − 1), α_j = α_T/(k − j + 1), OR = (n_ED · n_UN)/(n_UD · n_EN)). Use the CORRECT
degrees of freedom and table brackets (the posted exam solution mis-reads one F lookup; do not copy that).

## Output shape
`authoring/module2/neuro/exam1.json`:
```json
{"exam": [ {
  "id": "nx1-01", "type": "T4", "points": 20, "topic": "One-way ANOVA from summary statistics",
  "title": "Spine density and housing",
  "paragraphs": ["story paragraph(s), inline math as \\( ... \\)"],
  "figure": null,
  "table": {"caption": "", "headers": ["Group", "Mean ... (unit)", "Std.Dev. (unit)"], "rows": [["1", "8.2", "1.4"]]},
  "rOutput": null,
  "parts": ["the task sentence(s); one string per part, with i) ii) iii) labels when there are parts"],
  "solution": [ {"title": "Statistical test", "general": [], "work": [], "words": "..."},
                {"title": "Null hypothesis", "general": [], "work": [], "words": "..."},
                {"title": "...", "general": ["generic LaTeX"], "work": ["numbers LaTeX"], "words": "..."} ],
  "conclusion": "complete conclusion in context with the P range when rejecting",
  "answer": {"name": "F statistic", "value": 8.887, "tolerance": 0.05},
  "values": {"...": 0}
} ], "notes": []}
```
- `figure` for T1: `{"type": "stepdf", "points": [[y, F(y)], ...], "ticks": {"y": [..], "F": ["1/3", "1/2", "1"]}}`
  (the page draws the step plot with open and filled circles). For T2 use `"piecewise"`:
  `{"type": "piecewise", "latex": "f(x)=\\begin{cases} ... \\end{cases}"}`.
- `rOutput`: a plain-text string exactly as R prints it (monospace, with newlines), or null.
- `general` / `work` are display LaTeX without `$`; `words` plain sentences (inline math allowed).
- Table cells are strings.

## Verification you must do
- `authoring/module2/neuro/check_exam1.py` recomputes every answer and every entry of `values`
  from the raw inputs with NumPy/SciPy (and SymPy for T1/T2 if useful) and exits 0.
- `node authoring/module2/neuro/katex_check.mjs authoring/module2/neuro/exam1.json` passes.
- Every critical value is the printed table value (bracket conservatively when the df row is missing and say so).
