"""Package the extra course-style practice problems into module2-practice-data.js.

Reads authoring/module2/practice/session{N}.json (worked cases in the course's own style and
settings, written to authoring/module2/practice/PRACTICE_SPEC.md), validates them against the
MODULE II methods and existing cases, and writes module2-practice-data.js. No existing data file is
changed. Run:  python3 bme423/authoring/build_module2_practice.py
"""
import json, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'authoring' / 'module2' / 'practice'
problems = []

def js_const(path, name):
    code = f"const fs=require('fs');const vm=require('vm');const c={{}};vm.createContext(c);vm.runInContext(fs.readFileSync({json.dumps(str(path))},'utf8').replace('const {name}','var {name}'),c);process.stdout.write(JSON.stringify(c.{name}))"
    return json.loads(subprocess.run(['node', '-e', code], capture_output=True, text=True, check=True).stdout)

base, extra = js_const(ROOT / 'module2-data.js', 'BME_MODULE_II'), js_const(ROOT / 'module2-sessions-data.js', 'BME_MODULE_II_EXTRA')
neuro = js_const(ROOT / 'module2-neuro-data.js', 'BME_MODULE_II_NEURO')
methods = {m['id']: m.get('module', 17) for m in base['methods'] + extra['methods']}
taken = {c['id'] for c in base['cases'] + extra['cases'] + neuro['cases']}

cases = []
for path in sorted(SRC.glob('session*.json'), key=lambda p: int(re.findall(r'\d+', p.stem)[0])):
    n = int(re.findall(r'\d+', path.stem)[0])
    pack = json.loads(path.read_text())
    for c in pack['cases']:
        w = f'{path.name} {c.get("id")}'
        if not str(c.get('id', '')).startswith(f'p{n}-'): problems.append(f'{w}: id must start with p{n}-')
        if c['id'] in taken or any(x['id'] == c['id'] for x in cases): problems.append(f'{w}: duplicate case id')
        if methods.get(c.get('topic')) != n: problems.append(f'{w}: topic {c.get("topic")} is not a Session {n} method')
        if c.get('module') != n: problems.append(f'{w}: module must be {n}')
        missing = {'title', 'context', 'table', 'tasks', 'symbols', 'steps', 'conclusion', 'values', 'tolerance', 'answerName', 'answer'} - set(c)
        if missing: problems.append(f'{w}: missing {sorted(missing)}')
        if not isinstance(c.get('answer'), (int, float)) or not c.get('tolerance', 0) > 0: problems.append(f'{w}: answer/tolerance must be numbers')
        for i, s in enumerate(c.get('steps', [])):
            if not {'title', 'general', 'work', 'words'} <= set(s): problems.append(f'{w}: step {i + 1} missing keys')
        if re.search(r'\b(the|a|this) [a-z]* ?picture\b|\bpictured as\b', json.dumps(c, ensure_ascii=False)): problems.append(f'{w}: "picture" used as a noun')
        c['source'] = 'Original practice example in the course style'
        c['coursePractice'] = True
        cases.append(c)

if problems:
    print('\n'.join(problems)); sys.exit(f'{len(problems)} problems; nothing written')
(ROOT / 'module2-practice-data.js').write_text(
    '// Built by authoring/build_module2_practice.py from authoring/module2/practice/*.json. Do not edit by hand.\n'
    'const BME_MODULE_II_PRACTICE=' + json.dumps({'cases': cases}, ensure_ascii=False) + ';\n')
per = {n: sum(c['module'] == n for c in cases) for n in sorted({c['module'] for c in cases})}
print('wrote module2-practice-data.js:', len(cases), 'cases', per)
