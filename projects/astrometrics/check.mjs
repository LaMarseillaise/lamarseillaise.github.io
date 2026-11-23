import assert from 'node:assert/strict';
import { C_KM_S, AU_KM, LY_KM, PC_KM, UNITS, circumferenceFromLight, earthFromShadows, solarRanging, parallax, convert } from './model.mjs';
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual-expected) <= tolerance*Math.max(1,Math.abs(expected)), `${actual} != ${expected}`);
near(circumferenceFromLight(186000,7), 26571.428571428572);
near(circumferenceFromLight(186000,7.5),24800);
// A 45-degree shadow is exactly the stick height: eight arcs close the circle.
near(earthFromShadows(100,100,100).circumference, 800);
// Familiar simplified Eratosthenes geometry, checked independently against a known angle.
near(earthFromShadows(800,100*Math.tan(Math.PI/25),100).circumference,40000);
const e = earthFromShadows(800,12.6,100);
assert.ok(e.circumference>40000 && e.circumference<40200);
near(earthFromShadows(1600,12.6,100).circumference, 2*e.circumference);
assert.ok(earthFromShadows(800,25.2,100).circumference < e.circumference);
// Period ratio 1/8 gives orbital-radius ratio 1/4; round-trip factor must be two.
const r = solarRanging(100,1,8);
near(r.ratio,.25); near(r.separation,14989622.9); near(r.au,19986163.866666667);
const ratio=(224.7/365.25)**(2/3);
near(solarRanging(2*AU_KM*(1-ratio)/C_KM_S,224.7).au,AU_KM);
near(LY_KM,9460730472580.8); near(PC_KM,30856775814913.67);
near(parallax(1).parsecs,1); near(parallax(.5).parsecs,2);
near(convert(1,'pc','ly'),3.2615637771674336);
for (const from of Object.keys(UNITS)) for (const to of Object.keys(UNITS)) {
  for (const amount of [0,.0001,1,20,1e10]) near(convert(convert(amount,from,to),to,from),amount);
}
// Every parallax slider position has finite positive distance and agrees with exact geometry.
let previous=Infinity;
for(let i=1;i<=40;i++) {
  const p=i*.05, d=parallax(p); assert.ok(d.parsecs<previous); previous=d.parsecs;
  near(d.triangleKm,d.km,1e-10);
}
for(const n of [0,-1,Infinity,NaN]) {
  assert.throws(()=>circumferenceFromLight(186000,n),RangeError);
  assert.throws(()=>earthFromShadows(800,n,100),RangeError);
  assert.throws(()=>solarRanging(n,224.7),RangeError);
  assert.throws(()=>parallax(n),RangeError);
}
assert.throws(()=>solarRanging(200,365.25),RangeError);
assert.throws(()=>convert(-1,'km','pc'),RangeError);
assert.throws(()=>convert(1,'__proto__','km'),RangeError);
assert.throws(()=>convert(Infinity,'km','au'),RangeError);
console.log('Passed: independent geometry anchors, round-trip radar, all 40 parallax settings, 80 unit round-trips, and invalid-input checks.');
