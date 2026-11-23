// Checks the actual shipped Swift binary, not a JavaScript stand-in.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Worker} from 'node:worker_threads';
import {CODES, feedback, nextGuess} from './engine.mjs';
import {createSwiftSolver} from './swift-solver.mjs';
const bytes = await readFile(new URL('./mastermind.wasm',import.meta.url));
const module = await WebAssembly.compile(bytes);
assert.deepEqual(WebAssembly.Module.imports(module), []);
const api = (await WebAssembly.instantiate(module, {})).exports;
assert.equal(api.mm_next(), -5);
api._initialize(); api.mm_init();
for (let a=0;a<1296;a++) for (let b=0;b<1296;b++) {
  const score=feedback(CODES[a],CODES[b]);
  assert.equal(api.mm_score(a,b),score.exact*5+score.partial);
}
assert.equal(api.mm_score(-1,0),-1); assert.equal(api.mm_score(0,1296),-1);
assert.equal(api.mm_observe(1296,0,0),-1);
assert.equal(api.mm_observe(0,3,1),-2);
assert.equal(api.mm_remaining(),1296); // rejection is atomic
assert.equal(api.mm_observe(0,4,0),1); assert.equal(api.mm_next(),-3);
assert.equal(api.mm_observe(0,4,0),-3);
api.mm_reset();
for(let i=0;i<12;i++) assert.equal(api.mm_observe(0,0,0),625);
assert.equal(api.mm_next(),-4); assert.equal(api.mm_observe(0,0,0),-4);

const swift = await createSwiftSolver(bytes);
let nodes=0; const solved=new Set(), distribution={};
function walk(history, possible) {
  const result=swift.solve(history); nodes++;
  assert.deepEqual(result,nextGuess(history));
  assert.equal(result.remaining,possible.length);
  assert.equal(swift.solve(history,'count').remaining,possible.length);
  const groups=new Map();
  for (const id of possible) {
    const f=feedback(CODES[id],result.guess), key=f.exact*5+f.partial;
    if(!groups.has(key)) groups.set(key,{f,ids:[]});
    groups.get(key).ids.push(id);
  }
  for(const {f,ids} of groups.values()) {
    if(f.exact===4) {
      assert.equal(ids.length,1); assert(!solved.has(ids[0])); solved.add(ids[0]);
      distribution[history.length+1]=(distribution[history.length+1]||0)+1;
    } else {
      assert(history.length<4);
      walk([...history,{guess:result.guess,...f}],ids);
    }
  }
}
walk([],CODES.map((_,i)=>i));
assert.equal(solved.size,1296);
for(const turns of [null, [{}], [{guess:[0,0,0,0],exact:NaN,partial:0}], [{guess:[0,0,0,0],exact:1.1,partial:0}], [{guess:[0,0,0,6],exact:0,partial:0}], [{guess:[0,0,0,0],exact:3,partial:1}], Array(13).fill({guess:[0,0,0,0],exact:0,partial:0})]) assert.throws(()=>swift.solve(turns));
assert.deepEqual(swift.solve([]),nextGuess([]));
assert.equal(swift.solve([{guess:[1,2,3,4],exact:4,partial:0}],'count').remaining,1);
assert.throws(()=>swift.solve([{guess:[1,2,3,4],exact:4,partial:0}]));

// Run the shipped browser worker with only its host messaging/fetch adapted.
const source=`import {parentPort} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
let fail=true;
globalThis.fetch=async url=>{ if(fail) {fail=false;return {ok:false,status:503};} const data=await readFile(url); return {ok:true,arrayBuffer:async()=>data}; };
globalThis.self={postMessage:data=>parentPort.postMessage(data)};
await import(${JSON.stringify(new URL('./swift-worker.mjs',import.meta.url).href)});
parentPort.on('message',data=>self.onmessage({data}));`;
const worker=new Worker(new URL(`data:text/javascript,${encodeURIComponent(source)}`),{type:'module'});
function ask(data) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Worker timed out')),15000);
    worker.once('message', result=>{clearTimeout(timer);resolve(result);});
    worker.once('error', error=>{clearTimeout(timer);reject(error);});
    worker.postMessage(data);
  });
}
try {
  assert.match((await ask({id:1,turns:[]})).error,/503/);
  const answer=await ask({id:2,turns:[]});
  assert.equal(answer.id,2); assert.deepEqual(answer.result,nextGuess([]));
  assert(answer.timing.setupMs>=0 && answer.timing.solveMs>=0);
  const history=[{guess:[0,0,1,1],exact:0,partial:0}];
  assert.deepEqual((await ask({id:3,turns:history})).result,nextGuess(history));
  assert.equal((await ask({id:4,action:'count',turns:history})).result.remaining,256);
  assert.equal(typeof (await ask({id:5,turns:[{}]})).error,'string');
} finally { await worker.terminate(); }
console.log(JSON.stringify({passed:true,wasmBytes:bytes.length,scoringPairs:1296**2,decisionNodes:nodes,secretsSolved:solved.size,distribution,maximumGuesses:5,workerLoadFailureAndRetry:true},null,2));
