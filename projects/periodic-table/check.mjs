import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {position,subshells,shells,findElement,halfLife,initialIsotope} from './model.mjs';
const data=JSON.parse(await readFile(new URL('data.json',import.meta.url)));
const elements=data.elements;
assert.equal(elements.length,118);
for(const [index,e] of elements.entries()) {
  assert.equal(e.z,index+1);
  const sub=subshells(e,elements);
  assert.equal(sub.reduce((sum,s)=>sum+s.count,0),e.z,`${e.symbol} electron count`);
  assert.equal(new Set(sub.map(s=>`${s.n}${s.l}`)).size,sub.length);
  for(const s of sub) assert.ok(s.count>0&&s.count<={s:2,p:6,d:10,f:14}[s.l]);
  assert.ok(e.isotopes.length>0);
  assert.equal(new Set(e.isotopes.map(i=>i.a)).size,e.isotopes.length);
  for(const i of e.isotopes) {
    assert.equal(i.a,e.z+i.n);
    assert.ok(i.abundance===null||Number(i.abundance)>0&&Number(i.abundance)<=100);
    assert.ok(i.binding===null||Number(i.binding)>=0&&Number(i.binding)<10000);
    assert.ok(!['eV','keV','MeV'].includes(i.unit_hl),'Do not display resonance widths as half-lives');
  }
}
for(const wide of [false,true]) {
  const cells=elements.map(e=>position(e.z,wide));
  assert.equal(new Set(cells.map(p=>`${p.row},${p.col}`)).size,118);
  for(const p of cells) assert.ok(p.row>=1&&p.row<=(wide?7:10)&&p.col>=1&&p.col<=(wide?32:18));
}
assert.deepEqual(position(57,true),{row:6,col:3});
assert.deepEqual(position(71,true),{row:6,col:17});
assert.deepEqual(position(72,true),{row:6,col:18});
assert.deepEqual(position(57),{row:9,col:3});
assert.deepEqual(position(103),{row:10,col:17});
assert.deepEqual(position(118),{row:7,col:18});
assert.throws(()=>position(0),RangeError);
const el=symbol=>elements.find(e=>e.symbol===symbol);
assert.deepEqual(shells(el('C'),elements),[2,4]);
assert.deepEqual(shells(el('Fe'),elements),[2,8,14,2]);
assert.deepEqual(shells(el('Cu'),elements),[2,8,18,1]);
assert.deepEqual(shells(el('Pd'),elements),[2,8,18,18]);
assert.deepEqual(shells(el('Lr'),elements),[2,8,18,32,32,8,3]);
assert.equal(findElement(' CU ',elements),el('Cu'));
assert.equal(findElement('26',elements),el('Fe'));
assert.equal(findElement('carb',elements),el('C'));
assert.equal(findElement('119',elements),null);
assert.equal(findElement('',elements),null);
assert.equal(initialIsotope(el('C')).a,12);
const c14=el('C').isotopes.find(i=>i.a===14);
assert.equal(c14.abundance,null);
assert.equal(halfLife(c14),'5700 (30) years');
assert.equal(halfLife({...c14,operator_hl:'GT'}),'> 5700 (30) years');
assert.equal(halfLife({...c14,half_life:null}),'Not supplied');
assert.equal(halfLife(initialIsotope(el('C'))),'Stable in this evaluation');
// Independent atomic-mass defect sanity check guards keV/MeV and per-nucleon units.
// Atomic masses include electrons; hydrogen mass cancels them to this precision.
for(const symbol of ['C','Fe','U']) {
  const e=el(symbol), i=initialIsotope(e);
  const energy=(e.z*1.00782503223+i.n*1.00866491595-Number(i.atomic_mass)/1e6)*931.49410242/i.a;
  assert.ok(Math.abs(energy-Number(i.binding)/1000)<.002,`${symbol} mass-defect cross-check`);
}
console.log(`PASS: 118 configurations; 328 selected nuclides; both table geometries; search, isotope defaults, qualifiers, and independent mass-defect checks.`);
