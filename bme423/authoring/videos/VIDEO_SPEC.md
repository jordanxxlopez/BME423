# BME423 Module II animations · build guide

Project: `bme423/authoring/videos` (Remotion 4 + React + SVG + KaTeX). Output: `bme423/media/m2/<id>.mp4`,
`<id>.png` (poster) and `<id>.json` (step times). The finished reference is
`src/videos/S17TwoMeans.tsx` — copy its structure, pacing and look exactly.

## Style (taken from @datasciencefoundry, @spacetranscendental, @mathverselab)
Dark navy stage, yellow `C.signal` for the key quantity, cyan `C.noise` for spread/uncertainty, group colors
from `GROUP`, glowing dots (`Glow`), a numbered step badge, an idea card on the right, a caption band at the
bottom with **highlighted** key words. Motion should show the idea: points dropping in, bars growing, a line
settling, intervals stretching, a value sliding past a cutoff.

## Fixed zones (never break these)
`Frame` (src/kit/Frame.tsx) draws the title band, step badge, idea card and caption band. Your component only
returns SVG for the STAGE (760 × 434 px, origin top-left of the stage). Rules:
- Sentences go in `caption` (max about 115 characters, at most 2 lines). Formulas and worked numbers go in `card`
  rows (`label`, `tex`, `value`, `note`). Only short labels (numbers, group names, "d = 220") go in the stage,
  using `Label`, and they must not sit on top of data marks or each other.
- Keep every mark inside 0..760 × 0..434. Leave 30 px for axis tick labels. Check the axis label at the bottom.
- The card shows the newest 3 rows; each step should add at most 1–2 rows. Keep `value` under ~38 characters
  (put longer arithmetic in `note`, which wraps; use `\n` for a second line).
- Data only overlap when the data really overlap (e.g. dots at equal values).

## Content rules
- Use the lecture's own example and numbers from `authoring/module2/session<N>.json` (cases) or
  `module2-data.js` (Session 17). Recompute every number you show (node or `/Users/jordanlopez/fsl/bin/python3`).
  Never invent study data; an illustration (e.g. repeated sampling) must say so in its caption.
- Follow the exam order: name the method, the null hypothesis in words, the general equation before the
  numbers, the critical value **from the class table, naming it** ("class t table (two-tailed), row 18,
  column 0.05 → 2.101"; "class F table, numerator 2 across the top, denominator 6 down the side, lightface 0.05";
  "class chi-square table, 1 df, 0.05 → 3.841"; "class t table infinity row → 1.96"), then the conclusion.
  If a row/column is not printed, show the bracketing entries and say so.
- Captions follow Jordan's writing rules: plain full sentences, cause and effect with "so"/"because", real
  terms, no "picture" as a noun, no mention of the lecture/slides/professor, no colons or semicolons in captions.
- 5–9 seconds per step, 6–10 steps, 40–80 s total. One step = one idea.

## Files
- `src/videos/S<session><Method>.tsx`, e.g. `S18Line.tsx`. Export `meta` and `export default` the component.
  New files register themselves (src/videos/index.ts); do not edit the registry or the kit.
- `meta = {id: 's<session>-<methodId>', session, method: '<method id exactly as in the data>', title, cases, steps}`.
  `id` uses the method id, e.g. `s18-s18line`, `s17-oneMean`.
- `cases`: for every worked case of this method you can map, an array with one entry per case step giving the
  video step number (1-based) that shows that case step. The studio uses it to play the matching step beside
  each worked step. Look up case steps in the session JSON / module2-data.js.
- If you need a helper that is not in the kit, put it inside your own video file.

## Render and check (required before you are done)
1. `node render.mjs <id>` (renders with the installed Google Chrome; ~1–2 min per video).
2. Grab one still from the middle of EVERY step:
   `ffmpeg -loglevel error -y -ss <t> -i ../../media/m2/<id>.mp4 -frames:v 1 -vf scale=640:-1 /tmp/<id>_<k>.png`
   (step times are in `../../media/m2/<id>.json`), tile them, and LOOK at them (Read tool shows images).
3. Fix anything clipped, overlapping, cut off at an edge, wrapped badly, unreadable, or wrong, and re-render.
4. Report: ids, durations, steps, case mappings, any slide/number issues found.
