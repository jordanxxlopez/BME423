// Print the start frame (15 fps) and seconds of every step of a board video, without rendering.  node boardtimes.mjs <caseId>
import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('src/board/cases.json', 'utf8')); const c = d.cases.find(x => x.id === process.argv[2]);
const caps = Object.assign({}, ...fs.readdirSync('src/board/captions').filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync('src/board/captions/' + f, 'utf8'))));
const o = caps[c.id] || {}; const cap = k => o[k] !== undefined ? o[k] : k === 'intro' ? c.context : k === 'end' ? c.conclusion : c.steps[Number(k)].words;
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const secs = [cl(4 + cap('intro').length / 16, 8, 16), ...c.steps.map((s, k) => cl(3 + s.general.length + 1.5 * s.work.length + cap(String(k)).length / 17 + (s.lookup ? 2.5 : 0), 7, 24)), cl(4 + cap('end').length / 16, 8, 16)];
let f = 0; secs.forEach((s, i) => { const n = Math.round(s * 15); console.log(`step ${i + 1}\tstart ${f}\tend ${f + n - 1}\t${s.toFixed(1)}s`); f += n; });
