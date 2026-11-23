"""Validate the published inventory and SVG dependencies without third parties."""
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
import hashlib
import json
import re
import xml.etree.ElementTree as ET

base = Path(__file__).parent
catalog = json.loads((base / 'catalog.json').read_text())
assert len(catalog) == 65
assert len({item['path'] for item in catalog}) == 65
assert Counter(item['category'] for item in catalog) == {
    'Religions & sects': 32, 'Objects & materials': 16, 'Technical tools': 8,
    'Ships & transport': 4, 'Arms & artillery': 5,
}
assert {item['name'] for item in catalog if item['creditKind'] == 'public-domain'} == {'Hinduism', 'Sikhism', 'Daoism'}
assert {item['name'] for item in catalog if item['creditKind'] == 'adaptation'} == {'Shaiva', 'Shakti', 'Vaishnava'}

class Gallery(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('class') == 'art-link':
            self.links.append(attrs['href'])

page = Gallery()
page.feed((base / 'index.html').read_text())
assert Counter(page.links) == Counter(item['path'] for item in catalog)
for item in catalog:
    data = (base / item['path']).read_bytes()
    assert hashlib.sha256(data).hexdigest() == item['sha256'], item['path']
    root = ET.fromstring(data)
    assert root.tag == '{http://www.w3.org/2000/svg}svg'
    assert root.get('viewBox')
    ids = [node.get('id') for node in root.iter() if node.get('id')]
    assert len(ids) == len(set(ids)), item['path']
    refs = []
    for node in root.iter():
        assert node.tag.split('}')[-1] not in ('script', 'foreignObject')
        for key, value in node.attrib.items():
            assert not key.lower().startswith('on')
            if key.split('}')[-1] == 'href':
                assert value.startswith('#'), item['path']
                refs.append(value[1:])
            refs.extend(re.findall(r'url\(#([^)]*)\)', value))
    assert set(refs) <= set(ids), (item['path'], set(refs) - set(ids))
print('PASS: 65 unique assets, category coverage, credits, gallery links, source hashes and self-contained SVG references.')
