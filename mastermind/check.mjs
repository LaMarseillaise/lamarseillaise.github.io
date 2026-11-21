// Run: node mastermind/check.mjs. No dependencies or network required.
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { CODES, feedback, randomCode, Game, candidatesFor, nextGuess } from './engine.mjs';

// Independent scoring oracle: consume unmatched pegs instead of counting colors.
function oracle(secret, guess) {
  let exact = 0, partial = 0;
  const left = [], right = [];
  for (let i = 0; i < 4; i++) {
    if (secret[i] === guess[i]) exact++;
    else { left.push(secret[i]); right.push(guess[i]); }
  }
  for (const color of right) {
    const index = left.indexOf(color);
    if (index >= 0) { partial++; left.splice(index, 1); }
  }
  return { exact, partial };
}
assert.equal(new Set(CODES.map(c => c.join(''))).size, 1296);
for (const secret of CODES) for (const guess of CODES) {
  assert.deepEqual(feedback(secret, guess), oracle(secret, guess));
}
for (const invalid of [[],[0,0,0],[0,0,0,6],[0,0,0,-1],[0,0,0,1.5],[0,0,0,'1'],[0,0,0,NaN]]) {
  assert.throws(() => feedback(invalid,[0,0,0,0]), RangeError);
}
assert.deepEqual(randomCode(() => 0), [0,0,0,0]);
assert.deepEqual(randomCode(() => 0.999999), [5,5,5,5]);
for (const bad of [-1,1,NaN]) assert.throws(() => randomCode(() => bad), RangeError);
const secret = [5,5,5,5], game = new Game(secret); secret[0] = 0;
assert.equal(game.answer, null);
for (let i = 0; i < 11; i++) game.guess([0,0,0,0]);
assert.equal(game.over, false); game.guess([5,5,5,5]);
assert.equal(game.solved, true); assert.equal(game.over, true);
assert.throws(() => game.guess([5,5,5,5]));
const loss = new Game([1,1,1,1]);
for (let i = 0; i < 12; i++) loss.guess([0,0,0,0]);
assert.equal(loss.over, true); assert.equal(loss.solved, false);
assert.deepEqual(loss.answer,[1,1,1,1]);
const revealed = new Game([2,2,2,2]); revealed.reveal(); assert.equal(revealed.over,true);
assert.throws(() => revealed.guess([2,2,2,2]));
const clone = new Game([1,2,3,4]), guess = [0,0,0,0]; clone.guess(guess); guess[0] = 4;
const turns = clone.turns; turns[0].guess[0] = 5;
assert.equal(clone.turns[0].guess[0],0);
assert.throws(() => candidatesFor([{guess:[0,0,0,0],exact:3,partial:1}]), RangeError);
assert.throws(() => candidatesFor([{guess:[0,0,0,0],exact:-1,partial:0}]), RangeError);
assert.throws(() => nextGuess([{guess:[0,0,0,0],exact:4,partial:0}]));

// Explore the entire decision tree, partitioning with the independent oracle.
// Each leaf is one secret, without asking the solver to inspect that secret.
const distribution = {}, seen = new Set(); let nodes = 0;
function walk(history, possible) {
  const choice = nextGuess(history); nodes++;
  assert.equal(choice.remaining, possible.length);
  assert.deepEqual(candidatesFor(history), possible);
  const groups = new Map();
  for (const id of possible) {
    const result = oracle(CODES[id], choice.guess), key = result.exact * 5 + result.partial;
    if (!groups.has(key)) groups.set(key, { result, ids:[] });
    groups.get(key).ids.push(id);
  }
  assert.equal(choice.worstCase, Math.max(...[...groups.values()].map(g => g.ids.length)));
  // Independently check minimax score across every alternative at early nodes.
  if (history.length <= 1) {
    let best = Infinity;
    for (const code of CODES) {
      const buckets = new Map();
      for (const id of possible) {
        const f = oracle(CODES[id], code), key = f.exact * 5 + f.partial;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      best = Math.min(best, Math.max(...buckets.values()));
    }
    assert.equal(choice.worstCase, best);
  }
  for (const {result, ids} of groups.values()) {
    const count = history.length + 1;
    if (result.exact === 4) {
      assert.equal(ids.length,1); assert(!seen.has(ids[0])); seen.add(ids[0]);
      distribution[count] = (distribution[count] ?? 0) + 1;
    } else {
      assert(count < 5, `Unsolved after five guesses: ${ids}`);
      walk([...history, {guess:choice.guess,...result}], ids);
    }
  }
}
walk([], CODES.map((_,i) => i));
assert.equal(seen.size,1296);

// Exercise the shipped worker protocol in a Node adapter (not a browser test).
const source = `const {parentPort} = await import('node:worker_threads');
globalThis.self = {postMessage:data=>parentPort.postMessage(data)};
await import(${JSON.stringify(new URL('./solver-worker.mjs',import.meta.url).href)});
parentPort.on('message',data=>self.onmessage({data}));`;
const worker = new Worker(new URL(`data:text/javascript,${encodeURIComponent(source)}`), {type:'module'});
try {
  const ask = data => new Promise((resolve,reject) => {
    worker.once('message',resolve); worker.once('error',reject); worker.postMessage(data);
  });
  const answer = await ask({id:7,turns:[]});
  assert.equal(answer.id,7); assert.deepEqual(answer.result.guess,[0,0,1,1]);
  const error = await ask({id:8,turns:[{guess:[0],exact:0,partial:0}]});
  assert.equal(error.id,8); assert.equal(typeof error.error,'string');
} finally { await worker.terminate(); }
console.log(JSON.stringify({passed:true,scoringPairs:1296**2,secretsSolved:seen.size,maximumGuesses:Math.max(...Object.keys(distribution).map(Number)),distribution,decisionNodes:nodes},null,2));
