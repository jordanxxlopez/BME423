"""Collect media/m2/<id>.json (written by authoring/videos/render.mjs) into m2-videos-data.js.

Checks that every video file and poster exists, that step times are increasing, and that each
case mapping points at real video steps. Run:  python3 bme423/authoring/build_m2_videos.py
"""
import json, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'media' / 'm2'
videos, problems = {}, []
for p in sorted(MEDIA.glob('*.json')):
    v = json.loads(p.read_text())
    for key in ('file', 'poster'):
        if not (ROOT / v[key]).exists():
            problems.append(f'{v["id"]}: missing {v[key]}')
    starts = [s['start'] for s in v['steps']]
    if starts != sorted(starts) or any(s['end'] <= s['start'] for s in v['steps']):
        problems.append(f'{v["id"]}: step times out of order')
    for case, mapping in (v.get('cases') or {}).items():
        if any(k is not None and not (1 <= k <= len(v['steps'])) for k in mapping):
            problems.append(f'{v["id"]}: case {case} maps to a step that does not exist')
    videos[v['id']] = v
if problems:
    print('\n'.join(problems)); sys.exit(f'{len(problems)} problems; nothing written')
by_method = {}
for v in videos.values():
    by_method.setdefault(v['method'], []).append(v['id'])
(ROOT / 'm2-videos-data.js').write_text(
    '// Built by authoring/build_m2_videos.py from media/m2/*.json. Do not edit by hand.\n'
    'const BME_M2_VIDEOS=' + json.dumps({'videos': videos, 'byMethod': by_method}, ensure_ascii=False) + ';\n')
print('wrote m2-videos-data.js with', len(videos), 'videos,', sum(len(v['steps']) for v in videos.values()), 'steps')
