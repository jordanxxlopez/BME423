// Checks that every LaTeX string in a neuro pack compiles in KaTeX.
// node authoring/module2/neuro/katex_check.mjs <file.json> [more files]
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url'; import {createRequire} from 'node:module';
const here = path.dirname(fileURLToPath(import.meta.url)); const require = createRequire(import.meta.url);
const katex = require(path.resolve(here, '../../videos/node_modules/katex'));
let bad = 0, n = 0;
const tex = (s, where, display) => { n++; try { katex.renderToString(s, {throwOnError: true, displayMode: display, strict: false}); } catch (e) { bad++; console.log('KATEX', where, '::', s, '::', e.message.slice(0, 120)); } };
const inline = (s, where) => { if (typeof s !== 'string') return; for (const m of s.matchAll(/\\\((.+?)\\\)/gs)) tex(m[1], where, false); const open = (s.match(/\\\(/g) || []).length, close = (s.match(/\\\)/g) || []).length; if (open !== close) { bad++; console.log('UNBALANCED', where, '::', s.slice(0, 100)); } };
for (const f of process.argv.slice(2)) { const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const c of d.cases || []) { const w = f + ' ' + c.id;
    for (const k of ['context', 'conclusion', 'symbols', 'title']) inline(c[k], w + ' ' + k); (c.tasks || []).forEach((t, i) => inline(t, w + ' task' + i));
    for (const k of ['null', 'alternative']) if (c.hypotheses?.[k]) tex(c.hypotheses[k], w + ' hyp', true);
    (c.steps || []).forEach((s, i) => { (s.general || []).forEach(g => tex(g, w + ' step' + i + ' general', true)); (s.work || []).forEach(g => tex(g, w + ' step' + i + ' work', true)); inline(s.words, w + ' step' + i + ' words'); }); }
  for (const q of d.questions || []) { const w = f + ' ' + q.id; inline(q.stem, w); (q.options || []).forEach(o => inline(o, w)); inline(q.why, w); (q.equations || []).forEach(e => tex(e, w + ' eq', true)); }
  for (const q of d.exam || []) { const w = f + ' ' + q.id; (q.paragraphs || []).forEach(p => inline(p, w)); (q.parts || []).forEach(p => inline(p, w));
    (q.solution || []).forEach((s, i) => { (s.general || []).forEach(g => tex(g, w + ' sol' + i, true)); (s.work || []).forEach(g => tex(g, w + ' sol' + i, true)); inline(s.words, w + ' sol' + i); }); inline(q.conclusion, w); }
  for (const x of JSON.parse(fs.readFileSync(f, 'utf8')).examples || []) { const w = f + ' ' + x.title; inline(x.prompt, w + ' prompt');
    (x.table?.headers || []).forEach(h => inline(String(h), w + ' table')); (x.table?.rows || []).forEach(r => r.forEach(v => inline(String(v), w + ' table')));
    (x.steps || []).forEach((s, i) => { (s.work || []).forEach(g => tex(g, w + ' step' + i + ' work', true)); inline(s.say, w + ' step' + i + ' say'); }); }
}
console.log(bad ? `${bad} problems in ${n} strings` : `all ${n} LaTeX strings compile`); process.exit(bad ? 1 : 0);
