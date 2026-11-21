// JavaScript adaptation of Andur Carr's Code, Game and Knuth Swift types.
export const COLORS = Object.freeze(['Black', 'Blue', 'Green', 'Red', 'White', 'Yellow']);
export const LENGTH = 4;
export const MAX_ATTEMPTS = 12;
export const CODES = Object.freeze(Array.from({ length: 6 ** LENGTH }, (_, id) =>
  Object.freeze([Math.floor(id / 216), Math.floor(id / 36) % 6, Math.floor(id / 6) % 6, id % 6])));

export function validateCode(code) {
  if (!Array.isArray(code) || code.length !== LENGTH ||
      !code.every(c => Number.isInteger(c) && c >= 0 && c < COLORS.length)) {
    throw new RangeError('Choose four colors, each from 0 through 5.');
  }
}
export function codeId(code) {
  validateCode(code);
  return code.reduce((id, c) => id * 6 + c, 0);
}
export function feedback(secret, guess) {
  validateCode(secret); validateCode(guess);
  let exact = 0;
  const a = Array(6).fill(0), b = Array(6).fill(0);
  for (let i = 0; i < LENGTH; i++) {
    if (secret[i] === guess[i]) exact++;
    a[secret[i]]++; b[guess[i]]++;
  }
  return { exact, partial: a.reduce((sum, count, i) => sum + Math.min(count, b[i]), 0) - exact };
}
export function randomCode(random = Math.random) {
  return Array.from({ length: LENGTH }, () => {
    const value = random();
    if (!(value >= 0 && value < 1)) throw new RangeError('Random source must return [0, 1).');
    return Math.floor(value * COLORS.length);
  });
}
export class Game {
  #secret;
  #turns = [];
  #revealed = false;
  constructor(secret = randomCode()) { validateCode(secret); this.#secret = [...secret]; }
  get turns() { return this.#turns.map(t => ({ ...t, guess: [...t.guess] })); }
  get solved() { return this.#turns.at(-1)?.exact === LENGTH; }
  get over() { return this.solved || this.#revealed || this.#turns.length >= MAX_ATTEMPTS; }
  get answer() { return this.over ? [...this.#secret] : null; }
  guess(code) {
    if (this.over) throw new Error('This round is over. Start a new round.');
    const result = feedback(this.#secret, code);
    this.#turns.push({ guess: [...code], ...result });
    return { ...result };
  }
  reveal() { this.#revealed = true; return this.answer; }
}

// A lazily built 1,296 x 1,296 byte lookup replaces repeated Swift scoring.
// The solver receives guesses and feedback only, never the hidden secret.
let scores;
function scoreTable() {
  if (scores) return scores;
  scores = new Uint8Array(CODES.length ** 2);
  const counts = CODES.map(code => {
    const result = new Uint8Array(6);
    for (const color of code) result[color]++;
    return result;
  });
  for (let i = 0; i < CODES.length; i++) {
    for (let j = 0; j <= i; j++) {
      let exact = 0, total = 0;
      for (let p = 0; p < LENGTH; p++) exact += Number(CODES[i][p] === CODES[j][p]);
      for (let c = 0; c < 6; c++) total += Math.min(counts[i][c], counts[j][c]);
      scores[i * CODES.length + j] = scores[j * CODES.length + i] = exact * 5 + total - exact;
    }
  }
  return scores;
}
export function candidatesFor(turns) {
  if (!Array.isArray(turns) || turns.length > MAX_ATTEMPTS) throw new RangeError('Invalid turn history.');
  const table = scoreTable();
  let candidates = CODES.map((_, id) => id);
  for (const turn of turns) {
    const id = codeId(turn.guess);
    const { exact, partial } = turn;
    if (!Number.isInteger(exact) || !Number.isInteger(partial) || exact < 0 || partial < 0 ||
        exact + partial > LENGTH) throw new RangeError('Invalid feedback.');
    candidates = candidates.filter(c => table[id * CODES.length + c] === exact * 5 + partial);
  }
  if (!candidates.length) throw new RangeError('No code matches this feedback.');
  return candidates;
}
export function nextGuess(turns) {
  const candidates = candidatesFor(turns);
  if (turns.at(-1)?.exact === LENGTH) throw new Error('The code is already solved.');
  if (turns.length >= MAX_ATTEMPTS) throw new Error('No attempts remain.');
  if (!turns.length) return { guess: [0, 0, 1, 1], remaining: CODES.length, worstCase: 256 };
  if (candidates.length === 1) return { guess: [...CODES[candidates[0]]], remaining: 1, worstCase: 1 };
  const table = scoreTable(), possible = new Set(candidates);
  let best = -1, smallestWorstCase = Infinity;
  for (let id = 0; id < CODES.length; id++) {
    const buckets = new Uint16Array(21);
    let worst = 0;
    for (const candidate of candidates) {
      worst = Math.max(worst, ++buckets[table[id * CODES.length + candidate]]);
      if (worst > smallestWorstCase) break;
    }
    // Keep Swift's candidate preference; replace random ties with numeric order.
    if (worst < smallestWorstCase ||
        (worst === smallestWorstCase && possible.has(id) && !possible.has(best))) {
      best = id; smallestWorstCase = worst;
    }
  }
  return { guess: [...CODES[best]], remaining: candidates.length, worstCase: smallestWorstCase };
}
