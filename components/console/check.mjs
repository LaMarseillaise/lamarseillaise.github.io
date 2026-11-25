import assert from 'node:assert/strict';
import {createConsoleGame, createSolverClient, parseCode, formatBoard} from './mastermind.mjs';
import {Game, nextGuess} from '../../projects/mastermind/engine.mjs';

assert.deepEqual(parseCode('1126'), [0, 0, 1, 5]);
for (const input of ['', '112', '11234', '1230', '12 3', 1123, '🔴🔴🔴🔴', null]) assert.throws(() => parseCode(input));
const calls = [], logs = [];
const game = createConsoleGame({random: () => 0, write: t => logs.push(t), solverFactory: engine => ({
  cancel() {}, async solve(turns) { calls.push({engine, turns}); return nextGuess(turns); }
})});
await game.start();
assert(!logs.at(-1).includes('⚫️ ⚫️ ⚫️ ⚫️'));
assert.deepEqual(game.guess('1212'), {exact: 2, partial: 0});
assert.throws(() => game.guess('333'));
assert(logs.at(-1).includes('1/12'));
await game.hint();
assert.equal(calls[0].engine, 'swift');
assert.deepEqual(Object.keys(calls[0]), ['engine', 'turns']);
assert.equal(calls[0].turns.length, 1);
game.quit();
assert(logs.at(-1).includes('⚫️ ⚫️ ⚫️ ⚫️'));
assert.throws(() => game.guess('1111'), /ended/);
await assert.rejects(game.start({code: '123'}));
for (const engine of ['swift', 'javascript']) {
  await game.start({code: '6654', engine});
  assert.match(logs.at(-1), /Solved in [1-5] guesses/);
}
await game.start();
await assert.rejects(game.start({engine:'invalid'}));
assert.deepEqual(game.guess('1111'), {exact:4, partial:0}); // invalid start preserved round
assert.match(game.board('text'), /Code┃ 1 1 1 1/);
assert.throws(() => game.board('invalid'));
const exhausted = new Game([0,0,0,0]);
for (let i=0;i<12;i++) exhausted.guess([1,1,1,1]);
assert.match(formatBoard(exhausted), /Code┃ ⚫️ ⚫️ ⚫️ ⚫️/);
assert.equal(formatBoard(exhausted).split('\n').filter(l=>/^\s*\d+  ┃/.test(l)).length, 12);

let release, shouldFail = true;
const delayed = createConsoleGame({random:()=>0, write:t=>logs.push(t), solverFactory:()=>({cancel(){},
  solve:()=>new Promise(resolve=> {release=resolve;})})});
await delayed.start();
const pending = delayed.hint();
assert.throws(()=>delayed.guess('1111'), /thinking/);
await delayed.start();
const last = logs.at(-1);
release({guess:[0,0,0,0], remaining:1, worstCase:1});
await pending;
assert.equal(logs.at(-1),last); // old solver cannot change new round
const retry = createConsoleGame({random:()=>0, write:()=>{}, solverFactory:()=>({cancel(){},
  async solve() { if(shouldFail) {shouldFail=false; throw Error('download failed');} return {guess:[0,0,0,0]}; }})});
await retry.start();
await assert.rejects(retry.hint(), /download failed/);
await retry.hint();
assert.throws(()=>retry.guess('1111'), /ended/);

let worker;
const client=createSolverClient('swift', (url, options)=> {
  assert.match(url.pathname,/swift-worker.mjs$/); assert.equal(options.type,'module');
  return worker={terminate(){this.terminated=true;},postMessage(data){this.data=data;}};
});
let request=client.solve([]);
await assert.rejects(client.solve([]), /already/);
assert.deepEqual(Object.keys(worker.data),['id','turns']);
worker.onmessage({data:{id:worker.data.id+1,result:{guess:[]}}});
worker.onmessage({data:{id:worker.data.id,result:{guess:[0,0,1,1]}}});
assert.deepEqual(await request,{guess:[0,0,1,1]});
request=client.solve([]); client.cancel(); await assert.rejects(request,/changed/); assert(worker.terminated);
request=client.solve([]); worker.onerror(); await assert.rejects(request,/load/);
request=client.solve([]); worker.onmessage({data:{id:worker.data.id,error:'bad data'}}); await assert.rejects(request,/bad data/);
request=client.solve([]); worker.onmessage({data:{id:worker.data.id,result:{guess:[0,0,1,1]}}}); await request; client.cancel();
console.log('PASS: emoji/text boards, code validation, independent rounds, both roles, minimax play, cancellation, recovery, and worker lifecycle.');
