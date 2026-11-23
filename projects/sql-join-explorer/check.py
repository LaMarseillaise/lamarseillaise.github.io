"""Compare the browser teaching model with the exact displayed SQL, using SQLite.
Synthetic fixtures only. No server, network, third-party packages, or employer data.
Requires Python 3 and Node.js (no third-party packages).
Usage from the repository root: python3 sql-join-explorer/check.py
"""
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
from html.parser import HTMLParser

class Queries(HTMLParser):
    def __init__(self):
        super().__init__(); self.queries = {}; self.current = None; self.ids = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'code' and attrs.get('id', '').startswith('sql-'):
            self.current = attrs['id']; self.queries[self.current] = ''
    def handle_data(self, data):
        if self.current: self.queries[self.current] += data
    def handle_endtag(self, tag):
        if tag == 'code': self.current = None

root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent
p = Queries(); p.feed((root / 'index.html').read_text())
assert len(p.ids) == len(set(p.ids)), 'duplicate HTML ids'
node_code = '''
const {explore} = await import(process.argv[1]);
const cases = [];
for(let payments=1;payments<=3;payments++) for(let refunds=0;refunds<=3;refunds++) {
  cases.push({payments,refunds,model:explore(payments,refunds)});
}
for(const args of [[0,0],[4,0],[1,-1],[1,4],[1.5,0],[1,NaN],['1',2]]) {
  let rejected = false;
  try { explore(...args); } catch(e) { rejected = e instanceof RangeError; }
  if(!rejected) throw new Error('Invalid input accepted: '+JSON.stringify(args));
}
console.log(JSON.stringify(cases));
'''
cases = json.loads(subprocess.check_output(['node','--input-type=module','-e',node_code,(root/'model.mjs').as_uri()],text=True))
for case in cases:
    payments, refunds, model = case['payments'], case['refunds'], case['model']
    db = sqlite3.connect(':memory:')
    db.executescript('CREATE TABLE payments(id INTEGER PRIMARY KEY, amount_cents INTEGER); CREATE TABLE refunds(id INTEGER PRIMARY KEY, payment_id INTEGER, amount_cents INTEGER);')
    db.executemany('INSERT INTO payments VALUES (?, ?)', [(i,1000) for i in range(1,payments+1)])
    db.executemany('INSERT INTO refunds VALUES (?, ?, ?)', [(i,1,i*100) for i in range(1,refunds+1)])
    for query,key in [('sql-joined','joinedTotal'),('sql-distinct','distinctTotal'),('sql-events','eventTotal')]:
        actual=db.execute(p.queries[query]).fetchone()[0]
        assert model[key]==actual,(payments,refunds,key,model[key],actual)
    actual_rows = db.execute('SELECT p.id,p.amount_cents,r.id,r.amount_cents FROM payments p LEFT JOIN refunds r ON r.payment_id=p.id ORDER BY p.id,r.id').fetchall()
    browser_rows = [(r['payment']['id'],r['payment']['cents'],r['refund']['id'] if r['refund'] else None,r['refund']['cents'] if r['refund'] else None) for r in model['joined']]
    assert actual_rows == browser_rows,(payments,refunds,'intermediate rows')
    assert model['eventTotal']==1000*payments-100*sum(range(1,refunds+1)), 'independent oracle'
    db.close()
assert [(c['model']['joinedTotal'],c['model']['distinctTotal'],c['model']['eventTotal']) for c in cases if (c['payments'],c['refunds'])==(1,2)] == [(1700,700,700)]
assert [(c['model']['joinedTotal'],c['model']['distinctTotal'],c['model']['eventTotal']) for c in cases if (c['payments'],c['refunds'])==(2,2)] == [(2700,700,1700)]
print('PASS: all 12 control combinations; 36 displayed-SQL totals; complete join rows; independent totals; seven invalid-input rejections; default/equal-payment counterexamples.')
