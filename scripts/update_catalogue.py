"""Refresh regional plate snapshot from ADAC; requires beautifulsoup4."""
import json
import re
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

URL = 'https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/kfz-zulassung/kfz-kennzeichen-deutschland/'
html = urllib.request.urlopen(URL).read()
soup = BeautifulSoup(html, 'html.parser')
entries = {}
for row in soup.select('table tr')[1:]:
    cells = [cell.get_text(' ', strip=True) for cell in row.select('td')]
    if len(cells) != 3 or '*' in cells[0] or not re.fullmatch('[A-ZÄÖÜ]{1,3}', cells[0]):
        continue
    code, place, state = cells
    if code in entries:
        if place not in entries[code]['places']:
            entries[code]['places'].append(place)
    else:
        entries[code] = dict(code=code, place=place, state=state, places=[place])
if len(entries) < 650 or not {'B', 'MUC', 'MU', 'BÜS'}.issubset(entries):
    raise RuntimeError('Unexpected source structure: refusing to replace catalogue')
target = Path(__file__).resolve().parents[1] / 'src/data/plates.json'
target.write_text(json.dumps(sorted(entries.values(), key=lambda p: p['code']), ensure_ascii=False, indent=2) + '\n')
print(f'Updated {len(entries)} codes. Review the diff and update the documented source date.')
