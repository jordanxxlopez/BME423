"""Package the neuroscience question packs into module2-neuro-data.js.

Reads authoring/module2/neuro/session{N}{letter}.json (cases + quiz questions for MODULE II) and
authoring/module2/neuro/exam1.json (Exam 1 format written questions), validates them against the
existing MODULE II methods and cases, and writes module2-neuro-data.js. No existing data file is
changed. Run:  python3 bme423/authoring/build_module2_neuro.py
"""
import json, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'authoring' / 'module2' / 'neuro'
problems = []

def js_const(path, name):
    """Load a `const NAME={...};` data file through node (the files are plain JS, not JSON)."""
    code = f"const fs=require('fs');const vm=require('vm');const c={{}};vm.createContext(c);vm.runInContext(fs.readFileSync({json.dumps(str(path))},'utf8').replace('const {name}','var {name}'),c);process.stdout.write(JSON.stringify(c.{name}))"
    return json.loads(subprocess.run(['node', '-e', code], capture_output=True, text=True, check=True).stdout)

base, extra = js_const(ROOT / 'module2-data.js', 'BME_MODULE_II'), js_const(ROOT / 'module2-sessions-data.js', 'BME_MODULE_II_EXTRA')
methods = {m['id']: m.get('module', 17) for m in base['methods'] + extra['methods']}
old_cases = {c['id']: c for c in base['cases'] + extra['cases']}
old_questions = {q['id'] for q in base['questions'] + extra['questions']}
ref_keys = {}
for c in old_cases.values():
    ref_keys.setdefault(c['topic'], set(c.keys()))

cases, questions = [], []
for path in sorted(SRC.glob('session*.json')):
    pack = json.loads(path.read_text())
    n = int(re.match(r'session(\d+)', path.name).group(1))
    ids_here = {c['id'] for c in pack['cases']}
    for c in pack['cases']:
        w = f'{path.name} {c.get("id")}'
        if not str(c.get('id', '')).startswith(f'n{n}-'): problems.append(f'{w}: id must start with n{n}-')
        if c['id'] in old_cases or any(x['id'] == c['id'] for x in cases): problems.append(f'{w}: duplicate case id')
        if methods.get(c.get('topic')) != n: problems.append(f'{w}: topic {c.get("topic")} is not a Session {n} method')
        if c.get('module') != n: problems.append(f'{w}: module must be {n}')
        missing = {'title', 'context', 'table', 'tasks', 'symbols', 'steps', 'conclusion', 'values', 'tolerance', 'answerName', 'answer'} - set(c)
        if missing: problems.append(f'{w}: missing {sorted(missing)}')
        if not isinstance(c.get('answer'), (int, float)) or not c.get('tolerance', 0) > 0: problems.append(f'{w}: answer/tolerance must be numbers')
        if not isinstance(c.get('table'), dict) or 'headers' not in c['table'] or 'rows' not in c['table']: problems.append(f'{w}: table needs headers and rows')
        for i, s in enumerate(c.get('steps', [])):
            if not {'title', 'general', 'work', 'words'} <= set(s): problems.append(f'{w}: step {i + 1} missing keys')
        text = json.dumps(c, ensure_ascii=False)
        if re.search(r'\b(the|a|this) [a-z]* ?picture\b|\bpictured as\b', text): problems.append(f'{w}: "picture" used as a noun')
        c['source'] = 'Original neuroscience practice example'
        c['neuro'] = True
        cases.append(c)
    for q in pack['questions']:
        w = f'{path.name} {q.get("id")}'
        if q['id'] in old_questions or any(x['id'] == q['id'] for x in questions): problems.append(f'{w}: duplicate question id')
        if methods.get(q.get('topic')) != n or q.get('module') != n: problems.append(f'{w}: topic/module mismatch')
        if len(q.get('options', [])) != 4 or len(set(q['options'])) != 4: problems.append(f'{w}: needs 4 distinct options')
        if q.get('correct') not in (0, 1, 2, 3): problems.append(f'{w}: correct must be 0-3')
        if q.get('case') is not None and q['case'] not in ids_here: problems.append(f'{w}: case {q["case"]} not in this file')
        q.setdefault('equations', [])
        questions.append(q)

exam = []
exam_path = SRC / 'exam1.json'
if exam_path.exists():
    for q in json.loads(exam_path.read_text())['exam']:
        w = f'exam1.json {q.get("id")}'
        missing = {'id', 'type', 'points', 'topic', 'title', 'paragraphs', 'parts', 'solution', 'conclusion'} - set(q)
        if missing: problems.append(f'{w}: missing {sorted(missing)}')
        if any(x['id'] == q['id'] for x in exam): problems.append(f'{w}: duplicate id')
        for k in ('figure', 'table', 'rOutput'): q.setdefault(k, None)
        exam.append(q)

if problems:
    print('\n'.join(problems)); sys.exit(f'{len(problems)} problems; nothing written')
(ROOT / 'module2-neuro-data.js').write_text(
    '// Built by authoring/build_module2_neuro.py from authoring/module2/neuro/*.json. Do not edit by hand.\n'
    'const BME_MODULE_II_NEURO=' + json.dumps({'cases': cases, 'questions': questions, 'exam': exam}, ensure_ascii=False) + ';\n')
per = {n: sum(c['module'] == n for c in cases) for n in sorted({c['module'] for c in cases})}
print('wrote module2-neuro-data.js:', len(cases), 'cases', per, '·', len(questions), 'quiz questions ·', len(exam), 'exam-format questions')
