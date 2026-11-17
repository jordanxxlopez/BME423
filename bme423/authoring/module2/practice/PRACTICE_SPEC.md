# More regular practice problems in the course's own style (MODULE II, Sessions 17–24)

Goal: more worked problems like the ones the course actually asks, with the plain medical, physiology,
biology and biomedical-engineering settings the course itself uses (blood pressure, cholesterol,
platelets, drugs and placebo, CRP, FEV1, glucose, heart rate, birth weight, clinical trials, lab
assays, devices). NOT neuroscience: a separate neuroscience pack already exists. Nothing existing is
edited.

Paths are relative to `/Users/jordanlopez/Documents/Codex/2026-11-02/con/work/BME423/bme423/`.

## Read first
1. `authoring/module2/neuro/NEURO_SPEC.md`, sections "How the professor asks questions" (items 1–12),
   "Content rules" (except the neuroscience settings list), "Case object", "Verification you must do".
   Everything there applies, with the settings changed as below.
2. The course's own questions, as text: `/private/tmp/claude-501/-Users-jordanlopez--claude-spares-spare-LafK2d/1ac03891-04a7-466a-83a6-34aa1b876b6d/scratchpad/prof/hw3.txt`
   (Homework 3, the homework for Sessions 17–21) and `exam1_solutions.txt`, `hw1.txt`, `hw2.txt`
   in the same folder. Also the PDF `/Users/jordanlopez/Downloads/BME423_Fa2026_Hwk3.pdf` (Read with `pages`).
   Copy their wording skeletons, part structure (i), (ii), (iii), constraint tags and data layout.
3. `authoring/module2/neuro/ref/session{N}.json` for your sessions: methods, every lecture case in the
   studio format, sample quiz questions. Your cases copy the step structure, notation, symbols,
   `values` key names and `lookup` form of the lecture case of the same method.
4. The slides `assets/session{N}/{page}.webp` for the lecture exercises and examples; the lecture's own
   exercises show exactly how he asks for that method.
5. Printed class tables in `sources/tables/` (t, F, chi-square, z, Mann-Whitney T, Wilcoxon W). Every
   critical value must be a printed value with its row and column recorded.

## What to write per session
- 10 new worked cases, two per method where the session has 5 methods (spread evenly otherwise), in
  the course's own settings and wording. Each case is a full question the way he would put it on a
  homework or exam (short study story in past tense, glosses in parentheses, units in full once,
  the data table, then the parts), with a complete full-credit solution in the studio's step format.
- Mix outcomes: about 1 in 4 do not reject; a few land close to a cutoff; degrees of freedom sometimes
  miss a printed row (bracket conservatively and say so).
- Make the settings varied and concrete (a real-sounding assay, instrument and unit) and different
  from each other, from the lecture cases and from the session's neuroscience packs
  (`authoring/module2/neuro/session{N}a.json`, `session{N}b.json`). All data invented; never cite a
  real study, author or year, never state a drug's effect as fact.
- `source` is exactly "Original practice example in the course style".
- ids `p{N}-<short-slug>` (e.g. `p20-statin-ldl-paired`), unique. `module` = N. `topic` = a method id
  of the session.
- No quiz questions are needed (write `"questions": []`).

## Wording
- In `context` and `tasks`, keep the course's own exact phrases with their punctuation (for example
  "(Note: If a difference exists, do not identify which groups are different.)", "Note: some useful
  summations have already been calculated for you below, which you can use.", "DO NOT use R.",
  "Assume that any quantities of interest are Normally distributed.").
- In step `words`, `conclusion` and the hypotheses in words: plain short present-tense sentences, cause
  and effect with "so"/"because", no colons or semicolons, never "picture" as a noun, no mention of
  the professor, the lecture, a slide or a session number.

## Output and checks
For each of your sessions N: `authoring/module2/practice/session{N}.json` with
`{"cases":[...],"questions":[],"notes":[...]}` and `authoring/module2/practice/check_session{N}.py`
that recomputes every answer and `values` entry from the raw inputs with NumPy/SciPy, checks every
printed critical value against SciPy within table rounding, re-evaluates every `work` line, checks the
structure (ids, topics, keys versus the lecture case of the same method), and scans `words` and
`conclusion` for colons, semicolons and banned words. It must exit 0. Also
`node authoring/module2/neuro/katex_check.mjs authoring/module2/practice/session{N}.json` must pass.
Python: `/Users/jordanlopez/fsl/bin/python3`. `Rscript` is available for R output.
Do not edit any other file.
