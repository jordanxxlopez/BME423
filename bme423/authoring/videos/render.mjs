// Render every registered video (or the ids given on the command line) to bme423/media/m2/.
// Also writes a poster PNG per video and media/m2/manifest.json with each step's start and end time,
// so the studio can play one step at a time.
import path from 'node:path'; import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill} from '@remotion/renderer';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../../media/m2'); fs.mkdirSync(out, {recursive: true});
const metaOnly = process.argv.includes('--meta-only');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
// Use an installed Chrome/Chromium (Remotion's own download is not available here).
const browserExecutable = process.env.REMOTION_CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts')});
const comps = await getCompositions(serveUrl, {browserExecutable});
for (const comp of comps) {
  if (only.length && !only.includes(comp.id)) continue;
  const file = path.join(out, `${comp.id}.mp4`);
  if (!metaOnly) await renderMedia({composition: comp, serveUrl, codec: 'h264', outputLocation: file, crf: 22, pixelFormat: 'yuv420p', concurrency: 2, timeoutInMilliseconds: 120000, browserExecutable});
  const meta = comp.defaultProps.meta;
  let t = 0; const steps = meta.steps.map((s, k) => { const start = t; t += Math.round(s.seconds * 30) / 30; return {step: k + 1, title: s.title, start: +start.toFixed(3), end: +t.toFixed(3)}; });
  const posterFrame = Math.min(comp.durationInFrames - 1, Math.round((steps[Math.max(0, steps.length - 3)].start + 2) * 30));
  if (!metaOnly) await renderStill({composition: comp, serveUrl, output: path.join(out, `${comp.id}.png`), frame: posterFrame, imageFormat: 'png', browserExecutable});
  // One timing file per video, so several renders can run at once without clobbering each other.
  fs.writeFileSync(path.join(out, `${comp.id}.json`), JSON.stringify({id: comp.id, file: `media/m2/${comp.id}.mp4`, poster: `media/m2/${comp.id}.png`, session: meta.session, method: meta.method, title: meta.title, duration: +t.toFixed(3), cases: meta.cases || {}, steps}, null, 1));
  console.log(metaOnly ? 'timings' : 'rendered', comp.id, fs.existsSync(file) ? (fs.statSync(file).size / 1e6).toFixed(2) + ' MB' : '', steps.length, 'steps');
}
