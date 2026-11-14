# BME423 Study Studio

Open: https://jordanxxlopez.github.io/BME423/bme423/

BME423 has its own repository and website, separate from the Study Studio
(https://jordanxxlopez.github.io/COGNITIVEPROCESSES/, which holds PSYC301, LING406 and LING285). It moved here
on 2026-11-14 so that each site stays under the 1 GB GitHub Pages limit and BME423 can grow without affecting
the other courses. Nothing in BME423 changed in the move. The files are copied as they were at
COGNITIVEPROCESSES commit 41f3be5, and earlier history stays in that repository.

- `bme423/` holds the course, its authoring scripts, sources and assets, exactly as before. See `bme423/README.md`.
- The root files (`course-switcher.*`, `course-module-buttons.*`, `reader-timer.*`, `studio-gradients.css`,
  `study-activity.js`) are the shared studio files that `bme423/index.html` loads. They keep the same paths,
  so nothing inside `bme423/` had to change.
- `course-switcher.js` uses full URLs for the courses on the other site. The copy in COGNITIVEPROCESSES differs
  only in its `HERE` line.
- `AGENTS.md` and `CLAUDE.md` are the same writing rules and advisory board as in COGNITIVEPROCESSES.
- GitHub Pages serves the `main` branch root. `.nojekyll` keeps files as they are.

Local preview: serve this folder (for example `python3 -m http.server 8423`) and open `/bme423/`.
