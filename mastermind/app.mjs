import { COLORS, MAX_ATTEMPTS, Game, randomCode } from './engine.mjs';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries(['positions','editor','editor-title','code-form','submit','step',
  'hint','reveal','new','status','analysis','secret','history','empty','counter','legend'].map(id => [id, $(id)]));
let mode = 'break', phase = 'play', game, chosenSecret, busy = false, generation = 0;
let worker, pending, requestId = 0;

function peg(color) {
  const el = document.createElement('span');
  el.className = `peg ${color === null ? 'unknown' : `color-${color}`}`;
  el.textContent = color === null ? '?' : String(color + 1);
  el.setAttribute('aria-label', color === null ? 'Hidden' : COLORS[color]);
  return el;
}
function drawCode(container, code) { container.replaceChildren(...code.map(peg)); }
const selects = Array.from({ length:4 }, (_, i) => {
  const label = document.createElement('label'); label.className = 'position';
  const name = document.createElement('span'); name.textContent = `Peg ${i + 1}`;
  const dot = peg(0); dot.setAttribute('aria-hidden','true');
  const select = document.createElement('select');
  select.setAttribute('aria-label', `Color for peg ${i + 1}`);
  COLORS.forEach((color, index) => select.add(new Option(`${index + 1} ${color}`, String(index))));
  select.addEventListener('change', () => {
    dot.className = `peg color-${select.value}`; dot.textContent = String(Number(select.value) + 1);
  });
  label.append(name, dot, select); ui.positions.append(label);
  return select;
});
COLORS.forEach((color, i) => {
  const item = document.createElement('span');
  const dot = peg(i); dot.setAttribute('aria-hidden','true');
  item.append(dot, document.createTextNode(color)); ui.legend.append(item);
});
function editorCode() { return selects.map(s => Number(s.value)); }
function setEditor(code) {
  selects.forEach((s, i) => { s.value = String(code[i]); s.dispatchEvent(new Event('change')); });
}
function say(text) { ui.status.textContent = text; }
function cancelSolver() {
  generation++;
  if (worker) { worker.terminate(); worker = null; }
  if (pending) { pending.reject(new Error('Round changed.')); pending = null; }
  busy = false;
}
function askSolver(turns) {
  return new Promise((resolve, reject) => {
    if (!worker) {
      worker = new Worker(new URL('./solver-worker.mjs', import.meta.url), { type:'module' });
      worker.onmessage = ({ data }) => {
        if (!pending || pending.id !== data.id) return;
        const current = pending; pending = null;
        if (data.error) current.reject(new Error(data.error)); else current.resolve(data.result);
      };
      worker.onerror = () => {
        const current = pending; pending = null;
        worker?.terminate(); worker = null;
        current?.reject(new Error('The solver could not load. Please try again or reload this page.'));
      };
    }
    pending = { id:++requestId, resolve, reject };
    worker.postMessage({ id:requestId, turns });
  });
}
function render() {
  const over = game?.over ?? false;
  const editing = phase === 'setup' || (mode === 'break' && !over);
  ui['code-form'].hidden = !editing;
  ui.editor.disabled = busy;
  ui.submit.disabled = busy;
  ui['editor-title'].textContent = phase === 'setup' ? 'Choose the secret code' : 'Build your guess';
  ui.submit.textContent = phase === 'setup' ? 'Lock in code' : 'Check guess';
  ui.step.hidden = mode !== 'make' || phase === 'setup' || over;
  ui.step.disabled = busy;
  ui.step.textContent = busy ? 'Considering the possibilities…' : 'Make the next guess';
  ui.hint.hidden = mode !== 'break' || over;
  ui.hint.disabled = busy;
  ui.reveal.hidden = phase === 'setup' || mode === 'make' || over;
  ui.reveal.disabled = busy;
  ui.new.disabled = false;
  ui.secret.setAttribute('aria-label', over ? 'Revealed code' : mode === 'make' && phase !== 'setup' ? 'Your secret code' : 'Secret code hidden');
  drawCode(ui.secret, over ? game.answer : mode === 'make' && phase !== 'setup' ? chosenSecret : [null,null,null,null]);
  const turns = game?.turns ?? [];
  ui.counter.textContent = `${turns.length} / ${MAX_ATTEMPTS} guesses`;
  ui.empty.hidden = turns.length > 0;
  ui.history.replaceChildren(...turns.map((turn, index) => {
    const row = document.createElement('li'); row.className = `turn${turn.exact === 4 ? ' solved' : ''}`;
    row.setAttribute('aria-label', `Guess ${index + 1}: ${turn.guess.map(c => COLORS[c]).join(', ')}. ${turn.exact} exact, ${turn.partial} elsewhere.`);
    const number = document.createElement('span'); number.className = 'turn-number'; number.textContent = String(index + 1);
    const code = document.createElement('span'); code.className = 'turn-code'; drawCode(code, turn.guess);
    const result = document.createElement('span'); result.className = 'turn-feedback'; result.textContent = `${turn.exact} / ${turn.partial}`;
    for (const child of [number,code,result]) child.setAttribute('aria-hidden','true');
    row.append(number,code,result); return row;
  }));
}
function startRound() {
  cancelSolver(); ui.analysis.textContent = ''; setEditor([0,0,1,1]);
  phase = mode === 'make' ? 'setup' : 'play';
  chosenSecret = null; game = mode === 'break' ? new Game(randomCode()) : null;
  say(mode === 'make' ? 'Pick four colors for the computer to uncover. Repeats are allowed.' : 'A fresh code is hidden. Choose four colors and check your first guess.');
  render();
}
function reportTurn() {
  const turns = game.turns, last = turns.at(-1);
  if (game.solved) say(`${mode === 'make' ? 'The computer cracked' : 'You cracked'} the code in ${turns.length} ${turns.length === 1 ? 'guess' : 'guesses'}!`);
  else if (game.over) say('Twelve guesses used. The secret is revealed. Try a new round.');
  else say(`Guess ${turns.length}: ${last.exact} exact, ${last.partial} elsewhere. ${MAX_ATTEMPTS - turns.length} guesses left.`);
  render();
  if (game.over) ui.new.focus();
}
ui['code-form'].addEventListener('submit', event => {
  event.preventDefault(); if (busy) return;
  if (phase === 'setup') {
    chosenSecret = editorCode(); game = new Game(chosenSecret); phase = 'play';
    say('Your code is set. The computer sees only the feedback from its guesses.'); render(); ui.step.focus();
  } else if (mode === 'break' && !game.over) {
    game.guess(editorCode()); ui.analysis.textContent = ''; reportTurn();
    if (!game.over) selects[0].focus();
  }
});
async function solveStep(hint) {
  if (busy || !game || game.over) return;
  const round = generation;
  busy = true; say('Comparing guesses against the remaining possible codes…'); render();
  try {
    const result = await askSolver(game.turns);
    if (round !== generation) return;
    busy = false;
    ui.analysis.textContent = `Before this guess: ${result.remaining.toLocaleString()} possible ${result.remaining === 1 ? 'code' : 'codes'}. Largest feedback group: ${result.worstCase.toLocaleString()}.`;
    if (hint) {
      setEditor(result.guess); say('Suggested guess loaded. Choose “Check guess” to play it, or change any color.'); render(); ui.submit.focus();
    } else { game.guess(result.guess); reportTurn(); }
  } catch (error) {
    if (round !== generation) return;
    busy = false; say(error.message); render();
  }
}
ui.step.addEventListener('click', () => solveStep(false));
ui.hint.addEventListener('click', () => solveStep(true));
ui.reveal.addEventListener('click', () => {
  if (busy || !game || game.over) return;
  game.reveal(); say('Round ended. The hidden code is now revealed.'); ui.analysis.textContent = ''; render(); ui.new.focus();
});
ui.new.addEventListener('click', () => { startRound(); selects[0].focus(); });
document.querySelectorAll('input[name="mode"]').forEach(input => input.addEventListener('change', () => {
  mode = input.value; startRound();
}));
window.addEventListener('pagehide', cancelSolver);
startRound();
