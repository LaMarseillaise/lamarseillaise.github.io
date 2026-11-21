import { nextGuess, candidatesFor } from './engine.mjs';
self.onmessage = ({ data }) => {
  try {
    const result = data.action === 'count'
      ? { remaining: candidatesFor(data.turns).length }
      : nextGuess(data.turns);
    self.postMessage({ id: data.id, result });
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message });
  }
};
