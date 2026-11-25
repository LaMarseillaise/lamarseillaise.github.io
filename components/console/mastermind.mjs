import {Game, randomCode, MAX_ATTEMPTS} from '../../projects/mastermind/engine.mjs';

// Adapted from Andur's Swift ConsoleView: same palette, grading, and box drawing.
export const PEGS = Object.freeze(['⚫️', '🔵', '🟢', '🔴', '⚪️', '🟡']);
export function parseCode(value) {
  if (typeof value !== 'string' || !/^[1-6]{4}$/.test(value)) {
    throw new RangeError('Use a quoted string of four digits, each 1–6, e.g. "1123". Repeats are allowed.');
  }
  return [...value].map(Number).map(n => n - 1);
}
export function formatBoard(game, style = 'emoji') {
  if (!['emoji', 'text'].includes(style)) throw new RangeError('Choose "emoji" or "text".');
  const code = values => values.map(n => style === 'emoji' ? PEGS[n] : String(n + 1)).join(' ');
  const turns = game.turns;
  const width = style === 'emoji' ? 11 : 7;
  const rule = '━'.repeat(width + 2);
  const empty = Array(4).fill(style === 'emoji' ? '▫️' : '.').join(' ');
  const concealed = Array(4).fill(style === 'emoji' ? '❔' : '?').join(' ');
  const lines = [
    'MASTERMIND · console round',
    style === 'emoji' ? PEGS.map((peg, i) => `${i + 1}: ${peg}`).join('  ') : 'Pegs: 1 black · 2 blue · 3 green · 4 red · 5 white · 6 yellow',
    style === 'emoji' ? 'Grades: 🔴 exact · ⚪️ partial · ▪️ empty (unordered)' : 'Grades: E exact · P partial · . empty (unordered)',
    `    ┏${rule}┳${rule}┓`,
    `Code┃ ${game.answer ? code(game.answer) : concealed} ┃ ${' '.repeat(width)} ┃`,
    `    ┣${rule}╋${rule}┫`
  ];
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const turn = turns[i];
    const grades = turn ? [...Array(turn.exact).fill(style === 'emoji' ? '🔴' : 'E'),
      ...Array(turn.partial).fill(style === 'emoji' ? '⚪️' : 'P'),
      ...Array(4 - turn.exact - turn.partial).fill(style === 'emoji' ? '▪️' : '.')].join(' ') : empty;
    lines.push(`${String(i + 1).padStart(2)}  ┃ ${turn ? code(turn.guess) : empty} ┃ ${grades} ┃${turn ? `  ${turn.guess.map(n => n + 1).join('')} · ${turn.exact} exact, ${turn.partial} partial` : ''}`);
  }
  lines.push(`    ┗${rule}┻${rule}┛`);
  lines.push(game.solved ? `Solved in ${turns.length} guesses.` : game.over ? 'Round ended. Code revealed above.' : `${turns.length}/${MAX_ATTEMPTS} guesses. Try andur.guess("1123") or await andur.hint().`);
  return lines.join('\n');
}

// Each console round owns its worker. The visible game's worker/state is untouched.
export function createSolverClient(engine, workerFactory = (url, options) => new Worker(url, options)) {
  let worker, pending, serial = 0;
  function cancel(message = 'Round changed.') {
    worker?.terminate(); worker = null;
    if (pending) { clearTimeout(pending.timer); pending.reject(new Error(message)); pending = null; }
  }
  return {
    cancel,
    solve(turns) {
      if (pending) return Promise.reject(new Error('A guess is already being calculated.'));
      return new Promise((resolve, reject) => {
        try {
          if (!worker) {
            const path = engine === 'swift' ? 'swift-worker.mjs' : 'solver-worker.mjs';
            worker = workerFactory(new URL(`../../projects/mastermind/${path}`, import.meta.url), {type: 'module'});
            worker.onmessage = ({data}) => {
              if (!pending || pending.id !== data.id) return;
              const request = pending; pending = null; clearTimeout(request.timer);
              if (data.error) { worker.terminate(); worker = null; request.reject(new Error(data.error)); }
              else request.resolve(data.result);
            };
            worker.onerror = () => cancel('Solver could not load. Retry, or start with {engine: "javascript"}.');
            worker.onmessageerror = () => cancel('Solver returned an unreadable message.');
          }
          const id = ++serial;
          pending = {id, resolve, reject, timer: setTimeout(() => cancel('Solver timed out. Retry or switch engines.'), 30000)};
          // Only observed guesses/grades cross this boundary, never the secret.
          worker.postMessage({id, turns});
        } catch (error) { cancel(error.message); reject(error); }
      });
    }
  };
}

export function createConsoleGame({write = text => console.log(text), random = Math.random, solverFactory = createSolverClient} = {}) {
  let game, solver, generation = 0, busy = false, role = 'break';
  function board(style = 'emoji') {
    if (!game) throw new Error('Start with await andur.play("mastermind").');
    const text = formatBoard(game, style); write(text); return text;
  }
  function stop() { generation++; solver?.cancel(); solver = null; busy = false; }
  function checkPlayable() {
    if (!game) throw new Error('Start with await andur.play("mastermind").');
    if (game.over) throw new Error('Round ended. Start another with await andur.play("mastermind").');
    if (busy) throw new Error('The solver is thinking. Use andur.quit() to cancel.');
  }
  function submit(code) {
    const grade = game.guess(code); board();
    if (game.over) { solver?.cancel(); solver = null; }
    return grade;
  }
  async function computer(auto = false) {
    checkPlayable(); busy = true;
    const round = generation;
    try {
      do {
        const result = await solver.solve(game.turns);
        if (round !== generation) return;
        write(`Minimax: ${result.remaining} possible codes; worst-case group ${result.worstCase}.`);
        submit(result.guess);
      } while (auto && !game.over);
    } catch (error) {
      if (round === generation) throw error;
    } finally { if (round === generation) busy = false; }
  }
  return {
    async start(options = {}) {
      const {engine = 'swift', code} = options;
      const nextRole = options.role ?? (code === undefined ? 'break' : 'make');
      if (!['swift', 'javascript'].includes(engine)) throw new RangeError('Engine must be "swift" or "javascript".');
      if (!['make', 'break'].includes(nextRole)) throw new RangeError('Role must be "make" or "break".');
      if (nextRole === 'break' && code !== undefined) throw new RangeError('Set a code only in Make mode.');
      const secret = nextRole === 'make' ? parseCode(code) : randomCode(random);
      stop(); role = nextRole; game = new Game(secret); solver = solverFactory(engine);
      write(`Hello, code${role === 'break' ? 'breaker' : 'maker'}. Solver: ${engine === 'swift' ? 'compiled Swift / WebAssembly' : 'JavaScript'}.\nEmoji from the original Swift console. andur.board("text") offers a plain-text alternative.`);
      board();
      if (role === 'make') await computer(true);
    },
    board,
    guess(value) {
      const code = parseCode(value); checkPlayable();
      if (role !== 'break') throw new Error('The computer is breaking this code. Use await andur.hint() to resume after an error.');
      return submit(code);
    },
    hint() { return computer(role === 'make'); },
    quit() { stop(); if (game) { game.reveal(); return board(); } write('No active console round.'); }
  };
}
