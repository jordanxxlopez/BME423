# Style review of a neuroscience question pack (one session, files a and b)

Work in `/Users/jordanlopez/Documents/Codex/2026-11-02/con/work/BME423/bme423/`.
Python: `/Users/jordanlopez/fsl/bin/python3`. Scratch scripts go in your scratchpad, not the repo.

Read first:
- `authoring/module2/neuro/NEURO_SPEC.md`, section "How the professor asks questions" and "Content rules".
- `authoring/module2/neuro/ref/session{N}.json`: his own lecture cases in the studio format.
- His real wording: `/private/tmp/claude-501/-Users-jordanlopez--claude-spares-spare-UiFIRY/b9b55927-792a-4ff1-8382-d9c101af9587/scratchpad/prof/hw3.txt`
  (the homework for Sessions 17 to 22) and `exam1_solutions.txt` in the same folder.

The numbers have already been checked by a separate blind solver. You review WORDING ONLY.
Do not change any number, table cell, value, answer, step order or LaTeX arithmetic.

## What to check and fix, case by case

Question text (`context`, `tasks`, `title`, table `headers`):
1. It reads like his questions: short past-tense study story, then one direct ask in his fixed
   wording (see the spec's list of asks and constraint tags). Fix asks that drifted from his wording.
2. RESTORE HIS EXACT PHRASES. The writers were told to avoid colons and semicolons everywhere,
   and that made them reword some of his own phrases. In `context` and `tasks` his phrasing wins,
   with his punctuation, for example "(Note: If a difference exists, do not identify which groups
   are different.)", "Note: some useful summations have already been calculated for you below,
   which you can use.", "The data were standardized to avoid any issues associated with
   differences in scale; the scaled data are unitless.", "... with the following results
   (training set):", "initial centroids:". Put those back where a reworded version stands.
3. Every technical term has a short gloss in parentheses at first use, abbreviations are
   introduced in parentheses, units are written once in full with the abbreviation, table headers
   carry the unit, groups have plain descriptive names, "Normally" has a capital N.
4. He usually does not name the test in hand problems. Remove a test name from the question text
   unless it is one he does name (regression, k-Means, K-NN, Holm, "Use a z Test", "Use a
   chi-square test").
5. The story must not give away the answer, must not cite a real study, author or year, and must
   not state a drug's or treatment's effect as established fact. The settings should be concrete
   and interesting (a real-sounding paradigm, instrument and unit). The 20 cases of the session
   should not repeat a setting; if two are near-duplicates, say so in your report (do not rewrite
   data).
6. Anything the student needs must be visible in the question (context, table, tasks). If a task
   refers to output or data that is not shown, flag it in your report.

Solution text (`steps[].words`, `steps[].title`, `conclusion`, `hypotheses.nullWords`,
`alternativeWords`, question `stem`, `options`, `why`):
7. Plain everyday wording, short sentences, present tense, neutral and impersonal. Cause then
   effect with "so" and "because". Real terms stay, with a short gloss. No analogies, no filler,
   no "simply", "just", "note that", "recall that", "it is important to".
8. No colons or semicolons in `words`, `conclusion` and the hypotheses in words (step titles such
   as "Comparison 1: A vs B" keep theirs). No sentence of the form "Label: sentence".
9. Never "picture" as a noun (no "the overall picture", "pictured as"). Say model, plot, diagram, data.
10. No mention of "the professor", "the lecture", "the slide", "in class" or a session number.
11. The null hypothesis in words is about THIS problem (never only "μ1 = μ2"). Conclusions say
    "there is a difference" / "there is no evidence of a difference", intervals are read as
    "does / does not contain 0", a P range is given when rejecting, never an exact P unless it
    comes from supplied R output. No causal wording for a non-randomized design.
12. Quiz `why` is 1 to 3 plain sentences and is true. Stems are in his voice.

## How to work
- Edit the two JSON files directly with minimal, targeted edits (a small Python script that
  loads, edits specific strings and dumps with `indent=1, ensure_ascii=False` is fine; keep key
  order). Add a line to `notes` only if a reviewer needs to know something new.
- The check scripts scan some text (banned words, colons). If a restored phrase of his trips a
  check, loosen that check in `check_session{N}{a,b}.py` for `context` and `tasks` only. Do not
  edit any other file.
- When done, all four must pass:
  `/Users/jordanlopez/fsl/bin/python3 authoring/module2/neuro/check_session{N}a.py` (and b), exit 0;
  `node authoring/module2/neuro/katex_check.mjs authoring/module2/neuro/session{N}a.json` (and b).

## Report (concise)
How many cases and questions needed edits, the kinds of edits with two or three before/after
examples, anything flagged but not changed, and the check results.
