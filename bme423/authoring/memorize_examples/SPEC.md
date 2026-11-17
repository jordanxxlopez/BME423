# Worked examples for "Order to memorize"

"Order to memorize" lists each problem type as a fixed order of steps (what to write, and why).
Jordan wants every problem type to also show ONE real problem carried through those exact steps,
with all the work, so it is clear what each step looks like on paper. Nothing existing changes:
the examples are a new layer shown under each step.

Paths are relative to `/Users/jordanlopez/Documents/Codex/2026-11-02/con/work/BME423/bme423/`.
Python with NumPy/SciPy: `/Users/jordanlopez/fsl/bin/python3`.

## Read first
- The problem types and their steps: run
  `/Users/jordanlopez/fsl/bin/python3 -c "import sys,json;sys.path.insert(0,'authoring');import plain_study_content as p;print(json.dumps([l for l in p.LECTURES if l['id']==N][0]['memorize'],indent=1,ensure_ascii=False))"`
  for each of your sessions N. Every problem type has a `title`, `when` and `steps` (`do`, `why`, maybe `tex`).
- The course's own examples to use (prefer these, with their real numbers, over inventing):
  - MODULE II (Sessions 17–24): the lecture cases in `authoring/module2/session{N}.json` (Sessions
    18–24) and `module2-data.js` (Session 17, const BME_MODULE_II, cases), each with full steps.
  - MODULE I (Sessions 2–14): the slides `assets/session{N}/{page}.webp` (Read shows images; the
    lecture examples and exercises are there), the homework and exam with solutions as text in
    `/private/tmp/claude-501/-Users-jordanlopez--claude-spares-spare-LafK2d/1ac03891-04a7-466a-83a6-34aa1b876b6d/scratchpad/prof/`
    (`hw1.txt`, `hw1_solutions.txt`, `hw2.txt`, `hw2_solutions.txt`, `exam1_solutions.txt`), and the
    studio's existing MODULE I worked problems (search `data.js`, `practice-question-data.js`,
    `version-d-data.js` for the session's worked examples).
  - Printed class tables in `sources/tables/*.pdf` (read as images). Every critical value is the printed value.
- If a course source has an arithmetic slip, use the correct numbers and say so in your report (not in the example).

## Output: `authoring/memorize_examples/session{N}.json`, one file per session
```json
{"examples": [
 {"title": "<exactly the problem type's title>",
  "source": "Session 7 lecture example (page 12)" | "Homework 2 Problem 3" | "Exam 1 Question 4" | "Practice example",
  "prompt": "The problem as it is asked, short (inline math as \\( ... \\)).",
  "table": {"headers": ["..."], "rows": [["..."]]} or omit,
  "steps": [ {"say": "...", "work": ["display LaTeX", "..."]}, ... ]
 }]}
```
- ONE example per problem type, and EVERY problem type of your sessions gets one.
- `steps` has EXACTLY as many entries as the problem type has steps, in the same order. Entry k shows
  what you actually write for step k on this problem: `work` holds the LaTeX lines (general equation
  first if the step uses one, then the numbers plugged in, then the result), and `say` is one or two
  plain sentences saying what was done or what it means here. Steps that are words only (name the
  test, write the null hypothesis in words, write the conclusion) put the actual words in `say` and
  leave `work` empty or use a short LaTeX line such as the hypotheses.
- Use the course's notation (the same symbols as the step's `tex` and the lecture cases).
- Every number recomputed in Python before you write it; intermediate values to at least 4
  significant figures; critical values from the printed tables with row/column.

## Writing rules for `say` (the build rejects text that breaks them)
No colons, no semicolons, no dashes (" - ", "–", "—"), no "=" signs, no arrows in `say` (put any
equation in `work`). No "lecture", "slide", "professor", "thus", "hence", "note that", "basically",
"let's", and never "picture" as a noun. Every sentence 32 words or fewer. Plain, short, cause and
effect with "so" and "because". `prompt` may contain math and the course's own wording.

## Checks you must run
1. `authoring/memorize_examples/check_session{N}.py`: recomputes every number that appears in your
   `work` lines from the problem's raw inputs with NumPy/SciPy, re-evaluates each arithmetic line,
   and checks each printed critical value against SciPy within table rounding. It must exit 0.
2. `node authoring/module2/neuro/katex_check.mjs authoring/memorize_examples/session{N}.json` must pass
   (it checks every `work` string; also check that inline math in `prompt` and `say` compiles).
3. `/Users/jordanlopez/fsl/bin/python3 authoring/plain_study.py` must succeed (it validates titles,
   step counts and the writing rules, and rebuilds `plain-study-data.js`). Other agents run it at the
   same time for other sessions; if it fails only because of another session's file, say so.
Edit no file other than your session files and their check scripts.
