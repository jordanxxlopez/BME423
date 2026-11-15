// Export the Module II worked cases (the exact class equations used in the studio) for the board videos.
// Reads ../../module2-data.js and ../../module2-sessions-data.js, writes src/board/cases.json.
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '../..');
const load = f => new Function(fs.readFileSync(path.join(root, f), 'utf8').replace(/^const (\w+)\s*=/m, 'return '))();
const A = load('module2-data.js'), B = load('module2-sessions-data.js');
const methods = [...A.methods, ...B.methods], cases = [...A.cases, ...B.cases];
// Board copy only: plain wording for text shown on the board (no source references, no semicolons).
const plain = t => !t ? t : t
  .replace(/\s*\(slide:\s*\\\(.*?\\\)\)/g, '').replace(/\s*\(slide:[^)]*\)/g, '').replace(/\s*\(the slide[^)]*\)/gi, '')
  .replace(/From the slide's rounded inputs/g, 'From the rounded inputs').replace(/the Session \d+ pooled standard error/g, 'the pooled standard error')
  .replace(/from the lecture exercise/g, 'from the earlier exercise')
  .replace(/\(([^()]*)\)/g, (_m, inner) => '(' + inner.replace(/;\s+/g, ', ') + ')')
  .replace(/;\s+(\S+)/g, (_m, w) => /^[a-z]{3,}$/.test(w) ? '. ' + w[0].toUpperCase() + w.slice(1) : ', ' + w)
  .replace(/([A-Za-z0-9)]): (\S+)/g, (_m, a, w) => /^[a-z]{3,}$/.test(w) ? a + '. ' + w[0].toUpperCase() + w.slice(1) : a + ', ' + w);
const keep = ({id, title, topic, context, unit, table, tasks, hypotheses, symbols, steps, conclusion, values, module}) =>
  ({id, title, topic, session: module || 17, context: plain(context), unit, table, tasks: (tasks || []).map(plain), hypotheses, symbols, conclusion: plain(conclusion), values,
    steps: steps.map(({title, general, work, words, classTable, tableLookup}) => ({title, general: general || [], work: work || [], words: words || '', lookup: classTable || tableLookup || null}))});
const concepts = JSON.parse(fs.readFileSync(path.join(here, 'src/board/concepts.json'), 'utf8'));
const out = {methods: methods.map(m => ({id: m.id, session: m.module || 17, title: m.title})), cases: [...concepts, ...cases.map(keep)]};
// Class notation: src/board/notation/s<session>.json rewrites the board copy so symbols match the session slides.
// {"<topic or caseId>": {"replace": [[from, to], ...], "steps": {"<k>": {"general": [...], "work": [...]}}}}
// "replace" pairs are exact string swaps on every general and work line (applied in order); "steps" replaces whole lines.
const NOTE = Object.assign({}, ...fs.readdirSync(path.join(here, 'src/board/notation')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(here, 'src/board/notation', f), 'utf8'))));
let swaps = 0;
for (const c of out.cases) for (const key of [c.topic, c.id]) { const n = NOTE[key]; if (!n) continue;
  c.steps.forEach((st, k) => {
    for (const part of ['general', 'work']) st[part] = st[part].map(line => (n.replace || []).reduce((l, [a, b]) => { if (l.includes(a)) swaps++; return l.split(a).join(b); }, line));
    const o = (n.steps || {})[k]; if (o) { for (const part of ['general', 'work']) if (o[part]) { st[part] = o[part]; swaps++; } if (o.title) st.title = o.title; }
  });
  if (n.hypotheses && c.hypotheses) Object.assign(c.hypotheses, n.hypotheses);
  if (n.text) Object.assign(c, n.text); // board-only wording fixes for the title, tasks or conclusion box
}
fs.writeFileSync(path.join(here, 'src/board/cases.json'), JSON.stringify(out));
console.log(swaps, 'notation changes applied');
console.log(out.methods.length, 'methods,', out.cases.length, 'cases');
