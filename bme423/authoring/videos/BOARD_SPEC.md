# Second explanation · "worked on the board" videos

Project: `bme423/authoring/videos`. These are an alternative to the existing method animations (`src/videos`, dark theme),
which stay as they are. There is one board video per worked case (id `b-<caseId>`), rendered to `bme423/media/m2b/`.

## How a board video is built (already done, do not edit unless told)
- `export_board.mjs` copies every worked case from the studio data (`module2-data.js`, `module2-sessions-data.js`)
  into `src/board/cases.json`, plus the two concept videos in `src/board/concepts.json`. The equations on the board are
  the case's own `general` (class equation) and `work` (numbers plugged in) LaTeX lines, so the notation is the class
  notation by construction.
- `src/board/Board.tsx` draws the page: video step 1 is the question (tasks + context), steps 2..n+1 are the case steps
  in order, and the last step is the conclusion. Case step k (0-based) is video step k+2.
- On a step with a class table lookup the right panel shows the real class table scan (`public/tables`, made by
  `prep_tables.py`) with the row and column traced to the printed value. Do not change those crops.
- Otherwise the right panel shows the method visual `src/board/viz/<methodId>.tsx` if it exists, else the case's data
  table (or the hypotheses on a hypotheses step).

## Your job per method: write `src/board/viz/<methodId>.tsx`
Reference: `src/board/viz/oneMean.tsx` and helpers in `src/board/viz/_kit.tsx` (do not edit the kit; put extra helpers
in your own file).
- `export default` a `VizC` from `../Board`: props `{c, k, t, w, h}`. `c` is the case, `k` is -1 for the question,
  0..n-1 for case steps, n for the conclusion, `t` is seconds into the step, `w = 400`, `h = 464`. Return SVG (a `<g>`)
  drawn inside 0..400 × 0..464 on a white panel. Return `null` for a step to fall back to the data table / hypotheses.
- One visual must work for EVERY case of that method. Read each case in `src/board/cases.json` (steps, `values`,
  `table`) and branch on step titles or values if the cases differ. Never hard-code one case's numbers.
- Every number drawn must come from `c.values`, `c.table` or arithmetic on them. Never invent data. If you need an
  illustration (e.g. a sketch of a distribution) keep it clearly schematic and unlabeled with numbers.
- The visual should show what the current step does: the quantity just computed appears, grows, moves, or is compared.
  Animate with `ramp(t, a, b)` (seconds). Lines on the board appear at about 0.9 s + 1.4 s per work line, so time your
  motion to follow them.
- Light theme only: colors from `P` in `../theme` (blue `P.blue`, red `P.red`, green `P.green`, highlighter `P.hi`, groups
  `P.group`), font `inter`. Text 14–17 px, short labels only (numbers, names). No sentences in the panel.
- Nothing may overlap unless the data really overlap. Keep 20 px margins. Axis labels and tick labels must be readable.

## Captions: `src/board/captions/s<session>.json`
`{"<caseId>": {"<k>": "caption", "intro": "caption", "end": "caption"}}`. By default the caption is the case step's
`words`, the question uses `context`, the end uses `conclusion`. Override a caption when it breaks Jordan's writing rules:
- No mention of files, PDF pages, slides, the lecture or the professor ("Open t_table.pdf, PDF page 1" becomes
  "Use the class t table (two-tailed)"). Name the class table and the row/column it uses.
- No colons, semicolons or dashes as punctuation in sentences (hyphenated words are fine). No "Label: sentence" lines.
- "picture" only as a verb. Plain full sentences, cause and effect with "so" or "because", the answer first.
- Keep every number and the meaning exactly. Captions over ~250 characters get small, so shorten when you can.
- Always write an `end` caption that adds something beyond the conclusion box (why the decision follows, or what it
  means in context), because the conclusion text is already on the board.
- Where a step's words explain a rounding difference from the source ("the slide rounds to 2.2"), say it plainly without
  naming the source, e.g. "Rounded to one decimal these are 2.2, 4.2, 3.6 and 1.4."

## Check the notation and the numbers (report, do not edit the studio data)
- Open the session slides `bme423/sources/session<N>.pdf` (Read tool with `pages`) and compare each case's `general`
  equations and symbols with how the slides write them. Report any notation that differs (file, case, step, what the slide
  shows).
- Recompute every `work` line (node or `/Users/jordanlopez/fsl/bin/python3`). Report any arithmetic that is wrong.
- Do not edit `module2-data.js`, `module2-sessions-data.js`, `src/board/cases.json`, `Board.tsx` or the kit. Report.

## Render and look
1. `node render.mjs b-<caseId> [more ids] --conc=2` (from `bme423/authoring/videos`).
2. `node stills.mjs b-<caseId> <your scratch dir>` makes a contact sheet with one still late in every step. LOOK at
   every sheet (Read tool). Fix anything clipped, overlapping, unreadable, mis-timed or wrong, and render again.
3. Report: files written, ids rendered with durations, notation or arithmetic discrepancies found, anything unresolved.
