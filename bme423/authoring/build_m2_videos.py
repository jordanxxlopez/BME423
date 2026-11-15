"""Collect media/m2/<id>.json and media/m2b/<id>.json (written by authoring/videos/render.mjs) into m2-videos-data.js.

media/m2 holds the method animations (first explanation). media/m2b holds the "worked on the board" videos
(second explanation), one per worked case.

Checks that every video file and poster exists, that step times are increasing, and that each
case mapping points at real video steps. Run:  python3 bme423/authoring/build_m2_videos.py
"""
import json, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'media' / 'm2'
videos, problems = {}, []
for p in sorted(MEDIA.glob('*.json')) + sorted((ROOT / 'media' / 'm2b').glob('*.json')):
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
by_method, board_by_method, board_by_case = {}, {}, {}
for v in videos.values():
    if v.get('kind') == 'board':
        board_by_method.setdefault(v['method'], []).append(v['id']); board_by_case[v['case']] = v['id']
    else:
        by_method.setdefault(v['method'], []).append(v['id'])
(ROOT / 'm2-videos-data.js').write_text(
    '// Built by authoring/build_m2_videos.py from media/m2/*.json. Do not edit by hand.\n'
    'const BME_M2_VIDEOS=' + json.dumps({'videos': videos, 'byMethod': by_method, 'boardByMethod': board_by_method, 'boardByCase': board_by_case}, ensure_ascii=False) + ';\n')
print('wrote m2-videos-data.js with', len(videos), 'videos (', len(board_by_case), 'board),', sum(len(v['steps']) for v in videos.values()), 'steps')
