import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {samples} from './samples.mjs';
import {fibonacci,validateN,memoTrace} from './model.mjs';
const fixtures=new Map([[0,'0'],[1,'1'],[2,'1'],[10,'55'],[20,'6765'],[78,'8944394323791464'],[79,'14472334024676221'],[100,'354224848179261915075'],[500,'139423224561697880139724382870407283950070256587697307264108962948325571622863290691557658876222521294125']]);
for(const [n,value] of fixtures) assert.equal(String(fibonacci(n)),value);
for(const bad of [-1,'',1.5,'1e2',501,Infinity,NaN])assert.throws(()=>validateN(bad));
for(let n=0;n<=20;n++){
 const trace=memoTrace(n);
 assert.equal(trace.events.at(-1).value,String(fibonacci(n)));
 assert.equal(trace.events.length,n<2?1:2*n-1);
 assert.equal(trace.events.filter(e=>e.kind==='store').length,Math.max(0,n-1));
 let calls=0;function naive(k){calls++;return k<2?k:naive(k-1)+naive(k-2);}naive(n);
 assert.equal(trace.naiveCalls,BigInt(calls));
}
for(const [variant,source]of Object.entries(samples.javascript.variants)){
 const run=new Function('n',source+';return String(fib(n))');
 for(const n of (variant==='simple'?[0,1,2,10,20]:[...fixtures.keys()]))assert.equal(run(n),String(fibonacci(n)));
}
for(const language of ['ruby','python'])for(const [variant,source]of Object.entries(samples[language].variants)){
 const cases=variant==='simple'?[0,1,2,10,20]:[...fixtures.keys()];
 const program=language==='ruby'?source+'\n'+cases.map(n=>`puts fib(${n})`).join('\n'):source+'\n'+cases.map(n=>`print(fib(${n}))`).join('\n');
 const output=execFileSync(language==='ruby'?'ruby':'python3',['-c',program].map((v,i)=>language==='ruby'&&i===0?'-e':v),{encoding:'utf8'}).trim().split('\n');
 assert.deepEqual(output,cases.map(n=>String(fibonacci(n))));
}
console.log('PASS: independent fixtures through F(500), invalid inputs, all trace counts 0–20, and all JavaScript/Ruby/Python samples (native runtimes). Browser WASM and UI require separate checks.');
