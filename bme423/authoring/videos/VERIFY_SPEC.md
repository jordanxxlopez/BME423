# Verification pass · class notation, numbers, captions, layout

You are an independent checker for one session of the BME423 Module II videos (`bme423/authoring/videos`). Jordan's
standard: the LaTeX in every video must be written the way the class slides write it, every number must be right, and
the wording must follow the writing rules in `BOARD_SPEC.md`. Read `BOARD_SPEC.md` first.

Slides: `bme423/sources/session<N>.pdf` (Read tool with `pages`, at most 20 pages per call). Read every slide that
shows an equation for your session's methods.

## 1. Board videos: make the notation match the slides
Write `src/board/notation/s<N>.json` (only your session's topics and case ids):
```json
{"twoMeans": {"replace": [["s_d", "s_{\\bar x_1-\\bar x_2}"]],
              "steps": {"6": {"general": ["M=t_\\alpha(\\nu)\\,s_{\\bar x_1-\\bar x_2}"]}}},
 "ci-urine": {"steps": {"4": {"work": ["..."]}}}}
```
- Keys are a method id (applies to all its cases) or a case id. `replace` swaps exact substrings in every `general` and
  `work` line, in order (watch for accidental matches inside longer symbols). `steps` (0-based case step index) replaces
  whole `general` or `work` line lists. Optional `"hypotheses": {"null": ..., "alternative": ...}` replaces the
  hypothesis LaTeX.
- Change notation only: symbols, subscripts, how a quantity is named or written. Never change a number or the math.
  When a helper symbol is not on the slides (M, L, U, d, D, v_1), prefer the slide's own way of writing that quantity.
  If the slides simply never name it and writing it out would make the line unreadable, keep the helper and say so.
- Then run `node export_board.mjs` and check every board line still compiles:
  `node -e "const k=require('katex'),d=require('./src/board/cases.json');for(const c of d.cases)for(const s of c.steps)for(const l of [...s.general,...s.work])try{k.renderToString(l,{throwOnError:true,displayMode:true})}catch(e){console.log(c.id,l,e.message)}"`
- If a visual in `src/board/viz/` parses a LaTeX line (search for `.work` / `.general` in the viz files of your session),
  make sure it still works after your notation change.

## 2. Board videos: re-check what the other agent built
- Visuals `src/board/viz/<method>.tsx` for your session: every drawn number must come from the case data and be right.
- Captions `src/board/captions/s<N>.json`: rules from BOARD_SPEC.md (no file, slide, lecture or professor mentions, no
  colons or semicolons or dashes in sentences, "picture" only as a verb, numbers unchanged). Also check the case
  `context`, `tasks` and `conclusion` text shown on the board; if one breaks a rule, override it in the captions file
  (`"intro"` covers the context) or report it.
- Fix what is wrong in the viz and captions files directly.

## 3. Method animations (first explanation): `src/videos/S<N>*.tsx`
Compare every `tex` string in the `card` rows (and any formula drawn in the stage) with the slides' notation. Edit the
`tex` strings so they match the slides. Do not change numbers, timing or layout. Also check that the numbers in `value`
and `note` are right. List every edit.

## 4. Look at the result (stills only, no full renders)
`npx remotion still src/index.ts <id> <out.png> --frame=<n> --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
Board videos run at 15 fps, method animations at 30 fps; step times are in `bme423/media/m2b/<id>.json` and
`bme423/media/m2/<id>.json` (the board timings may shift a little after caption edits). Check at least every step that
you changed, for every case you changed, for clipping, overlap and readability. Keep stills in a scratch dir under
/private/tmp/claude-501/. Do not run `render.mjs`; the main session renders everything at the end.

## Report (under 300 words)
Files changed, notation changes made (method/case, before → after, slide number), number errors fixed, anything left
for Jordan (places where the slides themselves look wrong, kept out of the videos).
