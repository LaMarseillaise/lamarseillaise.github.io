"""Check static navigation, migration entry points, and generated collection content."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.ids = []; self.links = []; self.path = path
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        for name in ('href','src'):
            if name in attrs: self.links.append(attrs[name])

pages = {p.resolve():Page(p) for p in ROOT.rglob('*.html') if '.git' not in p.parts and 'content' not in p.relative_to(ROOT).parts}
checked = 0
def check_link(source, link):
    global checked
    url = urlsplit(link)
    if url.scheme or url.netloc: return
    target = ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else source.parent / unquote(url.path)
    if not url.path: target = source
    if target.is_dir(): target = target / 'index.html'
    target = target.resolve()
    assert target.exists(), f'Missing local target: {source.relative_to(ROOT)} -> {link}'
    if url.fragment and target in pages:
        assert unquote(url.fragment) in pages[target].ids, f'Missing fragment: {source} -> {link}'
    checked += 1

for path, page in pages.items():
    assert len(page.ids) == len(set(page.ids)), f'Duplicate IDs: {path}'
    for link in page.links: check_link(path,link)
for path in ROOT.rglob('*.css'):
    for link in re.findall(r'url\([\s\'\"]*([^\)\'\"]+)',path.read_text()):
        check_link(path,link.strip())

catalog = json.loads((ROOT/'content/catalog.json').read_text())
for kind in ['projects','articles']:
    slugs = [item['slug'] for item in catalog[kind]]
    assert len(slugs)==len(set(slugs)), f'Duplicate {kind} slugs'
for item in catalog['projects']:
    slug=item['slug']; old=(ROOT/slug/'index.html').read_text()
    assert f'href="/projects/{slug}/"' in old
    assert '/components/legacy-redirect.js' in old
    assert (ROOT/'projects'/slug/'index.html').exists()
home = (ROOT/'index.html').read_text()
latest = sorted(catalog['articles'],key=lambda item:item['date'],reverse=True)[0]
assert f'/musings/{latest["slug"]}/' in home
generated = [ROOT/'index.html', ROOT/'projects/index.html', *ROOT.glob('musings/**/index.html')]
before = {p:p.read_bytes() for p in generated}
subprocess.run(['python3',str(ROOT/'scripts/render-content.py')],check=True,capture_output=True)
assert all(p.read_bytes()==contents for p,contents in before.items()), 'Generated content was stale; inspect and rerun check'
print(f'PASS: {len(pages)} HTML pages, {checked} local links/assets/fragments, eight legacy entry points, latest article, and deterministic content rendering.')
