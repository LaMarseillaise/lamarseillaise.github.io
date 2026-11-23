import {createSwiftSolver} from './swift-solver.mjs';
let solver;
async function load() {
  const response = await fetch(new URL('./mastermind.wasm', import.meta.url));
  if (!response.ok) throw new Error(`Swift solver download failed (${response.status}).`);
  return createSwiftSolver(await response.arrayBuffer());
}
// Worker-local loading: the JavaScript option never downloads the Wasm module.
self.onmessage = async ({data}) => {
  try {
    const start = performance.now();
    const engine = await (solver ||= load().catch(error => { solver = null; throw error; }));
    const ready = performance.now();
    const result = engine.solve(data.turns, data.action);
    self.postMessage({id:data.id, result, timing:{setupMs:ready-start, solveMs:performance.now()-ready}});
  } catch (error) {
    self.postMessage({id:data.id, error:error.message});
  }
};
