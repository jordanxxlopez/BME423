"""Crop the class table scans (sources/tables/*.pdf) around every cell the Module II cases look up.

Writes public/tables/<key>.png and src/board/tables.json with the positions of the row label, the
column heading and the printed cell inside each crop, so the board videos can circle the real entry.
Cell positions were read from the 200 dpi scans (grid projection for the t table page 1, macOS text
recognition for the rest) and every crop was checked by eye. Run: python3 prep_tables.py
"""
import json, pathlib, pymupdf
from PIL import Image, ImageDraw
HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parents[1] / 'sources' / 'tables'
OUT = HERE / 'public' / 'tables'; OUT.mkdir(parents=True, exist_ok=True)
T1_ROWS = [407, 439, 473, 507, 543, 590, 624, 658, 691, 724, 770, 805, 841, 874, 907, 951, 985, 1020, 1056, 1090, 1134, 1167, 1200, 1234, 1270, 1317, 1351, 1384, 1417, 1450, 1497, 1532, 1567, 1601, 1634, 1678, 1712, 1748, 1783, 1818, 1861, 1894]
T1_KEYS = [str(k) for k in list(range(1, 41)) + [42, 44]]
T1_COLS = dict(zip(['0.50', '0.20', '0.10', '0.05', '0.02', '0.01', '0.005', '0.002', '0.001'], [316, 418, 520, 626, 742, 858, 980, 1110, 1241]))
# table: file, page, rotate, label x, header y, row height, column width
TABLES = {
  't1': ('t_table.pdf', 1, 0, 238, 353, 34, 116),
  't2': ('t_table.pdf', 2, 0, 372, 403, 35, 128),
  'F': ('F_table.pdf', 1, 0, 38, 129, 57, 62),
  'c1': ('Chi_Squared_Table1.pdf', 1, -90, 204, 293, 23, 98),
  'c2': ('Chi_Squared_Table2.pdf', 1, 0, 231, 748, 32, 125),
}
def t1(row, col): return ('t1', T1_COLS[col], T1_ROWS[T1_KEYS.index(row)])
# lookup key (file|page|row|column as stored in the cases) -> (table, cell x, cell y)
CELLS = {}
for r, c in [('9','0.05'),('18','0.05'),('15','0.05'),('24','0.05'),('11','0.05'),('19','0.01'),('26','0.05'),('34','0.05'),('42','0.05'),
             ('30','0.05'),('8','0.05'),('8','0.001'),('16','0.05'),('32','0.05'),('32','0.02'),('42','0.001'),('17','0.05'),('28','0.05'),
             ('10','0.05'),('7','0.05'),('6','0.05'),('6','0.01'),('6','0.02'),('10','0.01'),('10','0.02')]:
    CELLS[f't_table.pdf|1|{r}|{c}'] = t1(r, c)
CELLS['t_table.pdf|2|infinity|0.05'] = CELLS['t_table.pdf|2|∞|0.05'] = ('t2', 801, 1354)
CELLS['t_table.pdf|2|infinity|0.01'] = ('t2', 1046, 1355)
CELLS['F_table.pdf|1|ν_d=17|ν_n=2 (lightface, P<.05)'] = ('F', 151, 1149)
CELLS['F_table.pdf|1|ν_d=28|ν_n=3 (lightface, P<.05)'] = ('F', 218, 1789)
for r, c, x, y in [('6', '2', 154, 466), ('8', '2', 154, 584), ('10', '2', 154, 700), ('9', '1', 92, 643)]:
    for col in (f'{c} (lightface, P<.05)', f'{c} (0.05 lightface)'):
        CELLS[f'F_table.pdf|1|{r}|{col}'] = ('F', x, y)
CELLS['Chi_Squared_Table1.pdf|1|1|.05'] = ('c1', 579, 337)
CELLS['Chi_Squared_Table2.pdf|1|1|0.050'] = ('c2', 1077, 790)

def page(tab):
    f, pg, rot = TABLES[tab][:3]
    pix = pymupdf.open(SRC / f)[pg - 1].get_pixmap(dpi=200)
    im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    return im.rotate(rot, expand=True) if rot else im

def spans(a, b, half_a, half_b, gap=14):
    """Two 1-D windows around a and b; merged when they touch. Returns [(lo, hi)] in page px."""
    w1, w2 = (a - half_a, a + half_a), (b - half_b, b + half_b)
    return [(min(w1[0], w2[0]), max(w1[1], w2[1]))] if w2[0] - w1[1] < 40 else [w1, w2]

def build():
    pages, out = {}, {}
    for key, (tab, cx, cy) in sorted(CELLS.items()):
        f, pg, rot, lx, hy, rh, cw = TABLES[tab]
        im = pages.setdefault(tab, page(tab))
        xs = spans(lx, cx, 27, int(cw * 1.6)); ys = spans(hy, cy, 26, int(rh * 2.6))
        G = 16
        Wd = sum(b - a for a, b in xs) + G * (len(xs) - 1); Ht = sum(b - a for a, b in ys) + G * (len(ys) - 1)
        canvas = Image.new('RGB', (Wd, Ht), (255, 255, 255)); dr = ImageDraw.Draw(canvas)
        def mapx(x):
            off = 0
            for a, b in xs:
                if a <= x <= b: return off + x - a
                off += b - a + G
        def mapy(y):
            off = 0
            for a, b in ys:
                if a <= y <= b: return off + y - a
                off += b - a + G
        oy = 0
        for ya, yb in ys:
            ox = 0
            for xa, xb in xs:
                canvas.paste(im.crop((xa, ya, xb, yb)), (ox, oy)); ox += xb - xa + G
            oy += yb - ya + G
        # gaps drawn as soft grey bands so the cut is honest
        ox = 0
        for xa, xb in xs[:-1]:
            ox += xb - xa; dr.rectangle([ox + 4, 0, ox + G - 5, Ht], fill=(232, 232, 236)); ox += G
        oy = 0
        for ya, yb in ys[:-1]:
            oy += yb - ya; dr.rectangle([0, oy + 4, Wd, oy + G - 5], fill=(232, 232, 236)); oy += G
        name = key.replace('|', '_').replace(' ', '').replace('(', '').replace(')', '').replace('<', 'lt').replace('=', '').replace(',', '').replace('ν', 'v').replace('∞', 'infinity')
        canvas.save(OUT / f'{name}.png', optimize=True)
        out[key] = {'img': f'tables/{name}.png', 'w': Wd, 'h': Ht, 'table': tab, 'cell': [mapx(cx), mapy(cy)],
                    'label': [mapx(lx), mapy(cy)], 'head': [mapx(cx), mapy(hy)], 'rowH': rh if tab != 'F' else 30, 'colW': cw}
    (HERE / 'src' / 'board').mkdir(exist_ok=True)
    (HERE / 'src' / 'board' / 'tables.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(len(out), 'crops')
    return out

if __name__ == '__main__':
    build()
