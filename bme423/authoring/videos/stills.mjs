// Contact sheet for checking a rendered video: one still late in every step (when all lines are written).
// node stills.mjs <id> [outdir]  ->  <outdir>/<id>_sheet.png
import fs from 'node:fs'; import path from 'node:path'; import {execFileSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)); const id = process.argv[2]; const outDir = process.argv[3] || '/tmp';
const dir = id.startsWith('b-') ? 'm2b' : 'm2'; const meta = JSON.parse(fs.readFileSync(path.resolve(here, `../../media/${dir}/${id}.json`), 'utf8'));
const mp4 = path.resolve(here, `../../media/${dir}/${id}.mp4`); const tmp = fs.mkdtempSync(path.join(outDir, 'st-')); const files = [];
for (const s of meta.steps) { const t = s.start + (s.end - s.start) * 0.85; const f = path.join(tmp, `${String(s.step).padStart(2, '0')}.png`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(t), '-i', mp4, '-frames:v', '1', '-vf', 'scale=640:-1', f]); files.push(f); }
const cols = 2, rows = Math.ceil(files.length / cols); const out = path.join(outDir, `${id}_sheet.png`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(tmp, '%02d.png'), '-vf', `tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', out]);
console.log(out, files.length, 'steps');
