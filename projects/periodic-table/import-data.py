"""Build the checked-in educational snapshot from downloaded official source files.
Usage: python3 import-data.py /path/pubchem.json /path/iaea.csv
No network calls. Source data must be reviewed before updating the snapshot date.
"""
import csv, json, sys, hashlib
from pathlib import Path
p, n = map(Path, sys.argv[1:])
table = json.loads(p.read_text())['Table']
elements = [dict(zip(table['Columns']['Column'], row['Cell'])) for row in table['Row']]
nuclides = list(csv.DictReader(n.open()))
examples = {1:[3],6:[14],27:[60],43:[99],53:[131],55:[137],92:[233],94:[239],95:[241]}
result=[]
for raw in elements:
    z=int(raw['AtomicNumber'])
    rows=[r for r in nuclides if int(r['z'])==z]
    selected=[r for r in rows if r['abundance'] and float(r['abundance'])>0]
    for r in rows:
        if int(r['n'])+z in examples.get(z,[]) and r not in selected: selected.append(r)
    if not selected:
        candidates=[r for r in rows if r['half_life_sec'] and r['unit_hl'] not in ('eV','keV','MeV')]
        if candidates: selected=[max(candidates,key=lambda r:float(r['half_life_sec']))]
    isotopes=[]
    for r in sorted(selected,key=lambda r:int(r['n'])):
        isotopes.append({'a':z+int(r['n']), 'n':int(r['n']), **{k:r[k] or None for k in ['abundance','unc_a','half_life','operator_hl','unc_hl','unit_hl','binding','unc_ba','atomic_mass','me_systematics','ENSDFpublicationcut-off']}})
    result.append({'z':z,'symbol':raw['Symbol'],'name':raw['Name'],'category':raw['GroupBlock'],'configuration':raw['ElectronConfiguration'],'state':raw['StandardState'],'isotopes':isotopes})
# Explicit, sourced correction; retain the original value for provenance.
lr=result[102]
lr['pubchemConfiguration']=lr['configuration']
lr['configuration']='[Rn]5f14 7s2 7p1'
lr['configurationSource']='https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=frames&element=103'
assert len(result)==118 and all(e['isotopes'] for e in result)
data={'retrieved':'2026-11-24','nuclearExtractionDates':sorted(set(r['Extraction_date'] for r in nuclides)), 'sources':{'elements':'https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON','nuclides':'https://nds.iaea.org/relnsd/v0/data?fields=ground_states&nuclides=all'},'sourceSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest(),n.name:hashlib.sha256(n.read_bytes()).hexdigest()},'elements':result}
Path(__file__).with_name('data.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Built {len(result)} elements and {sum(len(e["isotopes"]) for e in result)} selected ground-state nuclides.')
