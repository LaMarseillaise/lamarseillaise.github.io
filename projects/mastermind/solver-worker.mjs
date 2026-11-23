import { nextGuess, candidatesFor } from './engine.mjs';
self.onmessage = ({ data }) => {
  try {
    const start = performance.now();
    const result = data.action === 'count'
      ? { remaining: candidatesFor(data.turns).length }
      : nextGuess(data.turns);
    self.postMessage({ id: data.id, result, timing: { setupMs: 0, solveMs: performance.now() - start } });
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message });
  }
};
