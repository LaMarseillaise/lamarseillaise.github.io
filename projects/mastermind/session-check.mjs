import assert from 'node:assert/strict';
import {Session} from './session.mjs';
import {nextGuess} from './engine.mjs';
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
function controlled(secret = [0,1,2,3]) {
  const requests = [], changes = [];
  const session = new Session({secret:()=>secret,changed:state=>changes.push(state),
    solve:turns=>new Promise((resolve,reject)=>requests.push({turns,resolve,reject}))});
  return {session,requests,changes};
}
function enter(session,code) {code.forEach(color=>session.add(color));}
const {session:s,requests} = controlled();
assert.equal(s.snapshot().code,null);
enter(s,[0,1,2]); s.remove(1);
assert.deepEqual(s.snapshot().draft,[0,2]);
assert.equal(s.game.turns.length,0);
s.add(1); s.add(3);
assert.deepEqual(s.game.turns[0].guess,[0,2,1,3]);
assert.deepEqual(s.draft,[]);
assert.deepEqual([s.game.turns[0].exact,s.game.turns[0].partial],[2,2]);
assert.equal(s.snapshot().code,null);
// Help submits a real guess immediately on resolution, overriding a draft.
s.add(5); const hinted = s.suggest();
assert.equal(requests.length,1); assert.equal(s.busy,true);
s.add(4); s.remove(0); s.suggest();
assert.deepEqual(s.draft,[5]); assert.equal(requests.length,1);
assert.deepEqual(Object.keys(requests[0].turns[0]).sort(),['exact','guess','partial']);
requests[0].resolve({guess:[0,1,2,3],remaining:2,worstCase:1}); await hinted;
assert.equal(s.game.solved,true); assert.equal(s.game.turns.length,2); assert.deepEqual(s.draft,[]);
assert.deepEqual(s.snapshot().code,[0,1,2,3]);
s.add(0); assert.deepEqual(s.draft,[]);
// Making a code automatically chains successive requests without user input.
const auto = controlled(); auto.session.start('make');
enter(auto.session,[0,1,2]); auto.session.remove(1);
assert.deepEqual(auto.session.snapshot().code,[0,2]);
auto.session.add(1); auto.session.add(3);
assert.equal(auto.requests.length,1); assert.deepEqual(auto.requests[0].turns,[]);
auto.requests[0].resolve({guess:[0,0,1,1],remaining:1296,worstCase:256}); await flush();
assert.equal(auto.requests.length,2); assert.equal(auto.session.game.turns.length,1);
auto.requests[1].resolve({guess:[0,2,1,3],remaining:1,worstCase:1}); await flush();
assert.equal(auto.session.game.solved,true); assert.equal(auto.session.busy,false);
assert.equal(auto.requests.length,2);
// A late response must not affect a new round, role, or ended round.
for (const action of ['new','role','end']) {
 const c=controlled(); const wait=c.session.suggest();
 if(action==='new') c.session.start();
 else if(action==='role') c.session.start('make');
 else c.session.end();
 const before=c.session.snapshot();
 c.requests[0].resolve({guess:[0,1,2,3],remaining:1296,worstCase:256}); await wait;
 assert.deepEqual(c.session.snapshot(),before,action);
}
const stopped=controlled();stopped.session.start('make');enter(stopped.session,[0,1,2,3]);stopped.session.end();
stopped.requests[0].resolve({guess:[0,0,1,1],remaining:1296,worstCase:256});await flush();
assert.equal(stopped.requests.length,1);assert.equal(stopped.session.game.turns.length,0);assert.equal(stopped.session.over,true);
const failed=controlled();failed.session.add(4);const rejected=failed.session.suggest();
failed.requests[0].reject(new Error('Offline'));await rejected;
assert.equal(failed.session.editing,true);assert.deepEqual(failed.session.draft,[4]);
assert.match(failed.session.status,/Offline/);
const exhausted=controlled();for(let i=0;i<12;i++)enter(exhausted.session,[5,5,5,5]);
assert.equal(exhausted.session.over,true);assert.equal(exhausted.session.game.turns.length,12);
const abandoned=controlled();abandoned.session.start('make');abandoned.session.add(2);abandoned.session.end();
assert.equal(abandoned.session.editing,false);abandoned.session.add(3);assert.deepEqual(abandoned.session.snapshot().code,[2]);
// Real minimax integration: repeated colors and mixed codes finish unaided.
for (const code of [[5,5,5,5],[0,1,2,3],[0,0,1,1]]) {
 const real = new Session({solve:async turns=>nextGuess(turns)});real.start('make');enter(real,code);
 for(let i=0;i<10&&real.busy;i++)await flush();
 assert.equal(real.game.solved,true);assert(real.game.turns.length<=5);
}
console.log('PASS: automatic four-peg submission, removal/shift, immediate help, automatic Make play, duplicate-request guard, stale responses, end/cancel, errors, twelve-turn limit and real minimax integration.');
