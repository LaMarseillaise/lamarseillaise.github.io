import {CODES, codeId, MAX_ATTEMPTS} from './engine.mjs';

const errors = new Map([
  [-1, 'Invalid guess or feedback.'], [-2, 'No code matches this feedback.'],
  [-3, 'The code is already solved.'], [-4, 'No attempts remain.'],
  [-5, 'The Swift solver is not initialized.']
]);
function checked(value) {
  if (value < 0) throw new RangeError(errors.get(value) || 'Swift solver failed.');
  return value;
}
export async function createSwiftSolver(bytes) {
  const {instance} = await WebAssembly.instantiate(bytes, {});
  const api = instance.exports;
  api._initialize(); api.mm_init();
  return {
    solve(turns, action = 'guess') {
      if (!Array.isArray(turns) || turns.length > MAX_ATTEMPTS) throw new RangeError('Invalid turn history.');
      // Validate before crossing the integer ABI; Wasm coerces fractions/NaN.
      const history = turns.map(turn => {
        if (!turn || !Number.isInteger(turn.exact) || !Number.isInteger(turn.partial) ||
            turn.exact < 0 || turn.partial < 0 || turn.exact + turn.partial > 4) throw new RangeError('Invalid feedback.');
        return {id:codeId(turn.guess), exact:turn.exact, partial:turn.partial};
      });
      api.mm_reset();
      for (const turn of history) checked(api.mm_observe(turn.id, turn.exact, turn.partial));
      const remaining = checked(api.mm_remaining());
      if (action === 'count') return {remaining};
      const id = checked(api.mm_next());
      return {guess:[...CODES[id]], remaining, worstCase:checked(api.mm_worst())};
    }
  };
}
