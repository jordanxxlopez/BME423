// Render every registered video (or the ids given on the command line) to bme423/media/m2/.
// Also writes a poster PNG per video and media/m2/manifest.json with each step's start and end time,
// so the studio can play one step at a time.
import path from 'node:path'; import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
const here = path.dirname(fileURLToPath(import.meta.url));
const outA = path.resolve(here, '../../media/m2'), outB = path.resolve(here, '../../media/m2b');
for (const d of [outA, outB]) fs.mkdirSync(d, {recursive: true});
const conc = Number((process.argv.find(a => a.startsWith('--conc=')) || '--conc=2').slice(7));
const metaOnly = process.argv.includes('--meta-only');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
// Use an installed Chrome/Chromium (Remotion's own download is not available here).
const browserExecutable = process.env.REMOTION_CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts')});
const comps = await getCompositions(serveUrl, {browserExecutable});
for (const comp of comps) {
  if (only.length && !only.includes(comp.id)) continue;
  const board = comp.id.startsWith('b-'); const out = board ? outB : outA; const rel = board ? 'media/m2b' : 'media/m2';
  const file = path.join(out, `${comp.id}.mp4`);
  if (!metaOnly) await renderMedia({composition: comp, serveUrl, codec: 'h264', outputLocation: file, crf: board ? 27 : 22, pixelFormat: 'yuv420p', concurrency: conc, timeoutInMilliseconds: 120000, browserExecutable});
  // Board videos are mostly still pages, so a still-image re-encode keeps text sharp at a quarter of the size.
  if (!metaOnly && board) { const tmp = file.replace(/\.mp4$/, '.tmp.mp4'); fs.renameSync(file, tmp);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, '-c:v', 'libx264', '-crf', '30', '-tune', 'stillimage', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file]); fs.unlinkSync(tmp); }
  const meta = comp.defaultProps.meta;
  let t = 0; const steps = meta.steps.map((s, k) => { const start = t; t += Math.round(s.seconds * comp.fps) / comp.fps; return {step: k + 1, title: s.title, start: +start.toFixed(3), end: +t.toFixed(3)}; });
  const posterFrame = Math.min(comp.durationInFrames - 1, Math.round((board ? steps[Math.min(2, steps.length - 1)].start + 4 : steps[Math.max(0, steps.length - 3)].start + 2) * comp.fps));
  if (!metaOnly) await renderStill({composition: comp, serveUrl, output: path.join(out, `${comp.id}.png`), frame: posterFrame, imageFormat: 'png', browserExecutable});
  // One timing file per video, so several renders can run at once without clobbering each other.
  fs.writeFileSync(path.join(out, `${comp.id}.json`), JSON.stringify({id: comp.id, file: `${rel}/${comp.id}.mp4`, poster: `${rel}/${comp.id}.png`, session: meta.session, method: meta.method, title: meta.title, duration: +t.toFixed(3), cases: meta.cases || {}, steps, ...(board ? {case: meta.case, kind: 'board'} : {})}, null, 1));
  console.log(metaOnly ? 'timings' : 'rendered', comp.id, fs.existsSync(file) ? (fs.statSync(file).size / 1e6).toFixed(2) + ' MB' : '', steps.length, 'steps');
}
