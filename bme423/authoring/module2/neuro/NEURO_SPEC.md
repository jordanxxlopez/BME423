# Neuroscience / psychology question pack (added next to the existing cases)

Goal: many NEW practice questions with neuroscience, psychology, hearing, speech, language and
music settings, asked the way this course's professor asks questions, each with a complete
step-by-step solution in the studio's existing case format. Nothing existing is edited.

Paths are relative to `/Users/jordanlopez/Documents/Codex/2026-11-02/con/work/BME423/bme423/`.

## Files to read first
- `authoring/module2/neuro/ref/session{N}.json`: the session's methods (id, title, trigger,
  formula), EVERY existing worked case in full, and 8 sample quiz questions. Your new cases copy
  the step structure, depth, notation and tone of the existing case of the same method.
- Lecture slides if you need to check a formula: `assets/session{N}/{page}.webp` (Read shows images).
- Printed class tables: `sources/tables/t_table.pdf`, `F_table.pdf`, `Chi_Squared_Table1.pdf`,
  `Chi_Squared_Table2.pdf`, `z_table_NormalDist.pdf` (Read them as images/PDF pages), and
  `statistical-table-reference.json`. Critical values MUST be the printed ones.
- Python with SciPy, NumPy and statsmodels: `/Users/jordanlopez/fsl/bin/python3`.

## How the professor asks questions (imitate exactly)
1. A question is a short study story, then the task. 2 to 5 sentences, past tense, often passive:
   "A study was reported concerning...", "Researchers interested in ... did a study to evaluate ...",
   "In a study looking at ...", "In a clinical trial, ...", "The table below shows data on ...",
   "Subjects were randomized into ...", "were randomly assigned to ...".
2. Every technical term gets a short gloss in parentheses the first time, and abbreviations are
   introduced in parentheses: "cerebrospinal fluid (CSF)", "(time elapsed between the illumination
   of a lightbulb and the subject's pressing a button)", "(measurement 1)".
3. Units are written once in full with the abbreviation, then abbreviated: "milliseconds (ms)".
   Table headers carry the unit: "Reaction Time (ms)".
4. Groups have plain descriptive names ("Awake / Asleep", "Warm and beating / Stopped and on
   ice", "Placebo / Drug"). Rows are "Subject", "Patient", "Person", "Family", "Neuron", ...
5. He usually does NOT name the test in hand problems. The design words decide it: "each subject
   was evaluated ... and again ..." (paired), "randomized into three groups" (ANOVA),
   "Normally distributed" (always capital N). He does name regression, k-Means, K-NN, Holm, and
   says "Use a z Test" / "Use a chi-square test" sometimes.
6. The ask is one direct sentence, always two-sided, always "a difference":
   - "Based on the recorded data, is there evidence that [variable] is different in these two states?"
   - "Is there a difference in [variable] over time?"
   - "What is the 95% confidence interval for the difference in the proportion of ... between the two ... groups?"
   - "Based on your calculations for b, is the trend between [Y] and [X] statistically significant?"
   - "What is the 95% Confidence Interval for the mean [Y] at [X] of [x0]?" / "... for an observation of [Y] at ..."
   - "Calculate the correlation (Pearson coefficient) between [Y] and [X]."
   - "perform a single iteration of the k-Means algorithm with k = 2. Use the Euclidian distance formula for your calculations."
   - "classify the new [object] as [A] or [B]. Use a K-NN classification with K = 3."
   - "Provide your result in a single complete sentence that would convey your conclusion in a way that could be understood by a non-expert in statistics or medicine (e.g., a typical reader of a local newspaper)."
7. Constraint tags he uses: "DO NOT use R.", "Assume that any quantities of interest are Normally
   distributed.", "Using only your calculations for Parts (i) and (ii), ...", "Answer this question
   without doing a t test.", "Please state how you reached your conclusions.", "Make sure to show
   your intermediate calculations.", "Note: some useful summations have already been calculated
   for you below, which you can use.", "(Note: If a difference exists, do not identify which groups
   are different.)", "Use a significance level of α = 0.05 for your inference."
8. Alpha is often not stated (default: start at 0.05, then check stricter levels and give a P range).
9. Parts are chained: (i), (ii), (iii) or a), b), c); later parts reuse earlier answers.
10. Heavy arithmetic is pre-computed: regression problems supply the summations; multiple and
    logistic regression, comparing slopes, and elbow questions supply R output (`summary(lm())`,
    `glm(..., family="binomial")`, `kmeans` fields) exactly as R prints it.
11. Number design: realistic, not tidy. Paired tables n = 10 or 11; repeated measures n = 4 to 6
    subjects by 3 conditions; hand regression about 10 raw points (or more with all sums given);
    proportions from counts of about 20 to 500; summary means with n = 10 to 30 per group (or very
    large n to force the infinity row); McNemar 20 to 40 subjects; k-means 3 to 10 points with small
    integers; K-NN 4 to 6 training points. Mix outcomes: most reject, but about 1 in 4 cases does
    NOT reject, and a few land close to a cutoff. Include a paired difference of the opposite sign
    sometimes. Degrees of freedom may miss a printed row (then bracket conservatively with the
    printed rows and say so).
12. A full-credit solution, in this order: name the statistical procedure; the null hypothesis in
    WORDS about this problem (never just "μ1 = μ2"); the generic equation BEFORE the numbers;
    intermediate values with at least 4 significant figures; degrees of freedom; the critical
    value from the printed table with df and alpha ("Start with α = 0.05", then stricter columns);
    the comparison; a complete conclusion in context; a P range if rejecting ("P < 0.01"), never
    an exact P unless it comes from supplied R output. Conclusions say "there is a difference",
    and intervals are read as "does / does not contain 0".

## Content rules
- Settings: neuroscience, psychology, hearing and auditory neuroscience, speech and language,
  music, sleep, memory, attention, EEG, fMRI, reward and dopamine, stress, pain, vision, motor
  control, development, aging, animal learning and behaviour, addiction, mood, clinical
  neurology. Make them interesting and concrete (a real-sounding paradigm, instrument and unit).
  Every case in your file uses a DIFFERENT setting. Use the themes assigned to you for at least
  half of your cases.
- All data are invented for practice. Do not cite or name real studies, authors, years or drugs'
  proven effects as fact. Plausible magnitudes and units only (e.g. reaction times 200 to 700 ms,
  hearing thresholds in dB HL, EEG amplitudes in μV, firing rates in spikes/s).
- `source` is exactly "Original neuroscience practice example".
- Notation and symbols: exactly those of the existing case of the same method in the ref file
  (they were matched to the lecture slides). Do not introduce new symbols.
- Writing: neutral, impersonal, present tense in the solution `words`; plain everyday wording;
  short sentences. Never use the word "picture" as a noun. No colons or semicolons inside
  `tasks`, `words`, `context` or `conclusion` sentences (use a period or "so"/"because").
  Do not mention "the professor", "the lecture", "the slide" or a session number.
- LaTeX: same conventions as the ref cases (`general` and `work` are display LaTeX without `$`;
  inline math in text fields as `\\( ... \\)`). Every `work` line must be true arithmetic.

## Case object (same keys as the ref cases)
`id, title, topic, context, unit, table{headers,rows}, tasks[], hypotheses{null,alternative,
nullWords,alternativeWords} or null, symbols, steps[{title, general[], work[], words, lookup?}],
conclusion, source, lookup, values, module, tolerance, answerName, answer` plus any optional
keys the ref case of that method carries (for example R output fields). Copy the ref case's key
set for that method exactly, including where it stores R output and table lookups.
- `id`: `n{N}-<short-slug>` (for example `n20-caffeine-vigilance`). Unique.
- `title`: short, names the setting (it is shown in a dropdown).
- `context` is the professor-style story. `tasks` are the professor-style asks, in his wording.
- `lookup`: `{"path","page","row","column","value","actualDf","approximation"}` for the printed
  critical value, in the same form as the ref case; null where the ref case has null.
- `answerName` names the one graded number (e.g. "t statistic", "Lower endpoint", "Chi-square",
  "Slope b", "F statistic", "Distance", "Probability"); `answer` its value; `tolerance` about
  0.5% of the value and at least 0.001. `values` holds the key inputs and results, with the same
  key names the ref case of that method uses (the videos and checks read them).
- At least as many steps as the ref case of that method.

## Quiz questions
`{"id":"m2-n{N}-q{letter}{01..}","module":N,"topic":<method id>,"stem","options":[4 strings],
"correct":0-3,"why","case":<one of your case ids or null>,"equations":[LaTeX]}`
About 60% numeric (tied to one of your cases; the right value plus three wrong values that come
from common mistakes) and 40% conceptual about choosing or reading the method in a neuroscience
setting (case null). Four distinct options. Vary the correct index. `why` is 1 to 3 sentences.

## Verification you must do
1. Write `authoring/module2/neuro/check_session{N}{letter}.py`: for each case it recomputes the
   answer and every entry of `values` from the raw inputs with NumPy/SciPy (not by reading your
   own work lines) and asserts agreement within tolerance, and checks each printed critical value
   against SciPy (for table values, within rounding of the printed table). It must exit 0.
2. Every `work` line: recompute the arithmetic. Every general/work LaTeX string must compile in
   KaTeX: run `node authoring/module2/neuro/katex_check.mjs <your json file>` and fix every error.
3. `json.load` succeeds; ids unique and prefixed; every question's `case` exists in your file;
   every `topic` is a method id of the session.

## Output
One JSON file: `authoring/module2/neuro/session{N}{letter}.json` with
`{"cases":[...],"questions":[...],"notes":[...]}`. `notes` lists anything a reviewer should know
(for example a df row that had to be bracketed). Do not edit any other existing file.
