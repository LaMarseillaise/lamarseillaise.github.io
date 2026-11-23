import {COLORS, MAX_ATTEMPTS} from './engine.mjs';
import {Session} from './session.mjs';

const $ = id => document.getElementById(id);
let worker, pending, requestId = 0, previouslyOver = false;
function cancel() {
  worker?.terminate(); worker = null;
  if (pending) { pending.reject(new Error('Round changed.')); pending = null; }
}
function solve(turns) {
  return new Promise((resolve,reject) => {
    if (!worker) {
      worker = new Worker(new URL('./solver-worker.mjs',import.meta.url),{type:'module'});
      worker.onmessage = ({data}) => {
        if (!pending || pending.id !== data.id) return;
        const request = pending; pending = null;
        if (data.error) request.reject(new Error(data.error)); else request.resolve(data.result);
      };
      worker.onerror = () => {
        const request = pending; pending = null; worker?.terminate(); worker = null;
        request?.reject(new Error('The solver could not load.'));
      };
    }
    pending = {id:++requestId,resolve,reject};
    worker.postMessage({id:requestId,turns});
  });
}
function peg(color, removable = false, index = 0) {
  const node = document.createElement(removable ? 'button' : 'span');
  node.className = `peg color-${color}`; node.textContent = String(color+1);
  if (removable) {
    node.type = 'button'; node.dataset.remove = index;
    node.setAttribute('aria-label',`Remove peg ${index+1}, number ${color+1}`);
  } else node.setAttribute('aria-hidden','true');
  return node;
}
function cells(code, editable, hidden = false) {
  return Array.from({length:4},(_,i) => {
    const cell = document.createElement('div'); cell.className = 'code-cell';
    if (code?.[i] !== undefined) cell.append(peg(code[i],editable,i));
    else {
      const hole = document.createElement('span'); hole.className = hidden ? 'cover' : 'hole';
      hole.setAttribute('aria-hidden','true'); hole.textContent = hidden ? '?' : '';
      cell.append(hole);
    }
    return cell;
  });
}
function grades(turn) {
  const grade = document.createElement('div'); grade.className = 'grade';
  if (turn) grade.setAttribute('aria-label',`${turn.exact} exact, ${turn.partial} partial`);
  else grade.setAttribute('aria-hidden','true');
  for (let i=0;i<4;i++) {
    const cell = document.createElement('span'); cell.className = 'grade-cell';
    const pin = document.createElement('span');
    pin.className = turn && i<turn.exact ? 'grade-peg exact' : turn && i<turn.exact+turn.partial ? 'grade-peg partial' : 'grade-hole';
    pin.setAttribute('aria-hidden','true'); cell.append(pin); grade.append(cell);
  }
  return grade;
}
const palette = COLORS.map((_,i) => {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'palette-button';
  button.setAttribute('aria-label',`Add peg ${i+1}`); button.title = `Add peg ${i+1} (key ${i+1})`;
  button.append(peg(i)); button.disabled = true;
  button.addEventListener('click',() => session.add(i)); $('palette').append(button); return button;
});
const hint = document.createElement('button'); hint.type = 'button'; hint.id = 'hint'; hint.className = 'hint icon';
hint.setAttribute('aria-label','Suggest and submit an optimal guess'); hint.title = 'Suggest and submit an optimal guess'; hint.textContent = '🛟';
hint.addEventListener('click',() => {
  const round = session.generation;
  session.suggest()?.then(() => { if (round === session.generation && !session.over) palette[0].focus(); });
});
function render(state) {
  $('status').textContent = state.status; $('analysis').textContent = state.analysis;
  $('break').setAttribute('aria-pressed',String(state.mode==='break'));
  $('make').setAttribute('aria-pressed',String(state.mode==='make'));
  $('new').disabled = false; $('end').disabled = state.over;
  palette.forEach(button => button.disabled = !state.editing);
  $('counter').textContent = `${state.turns.length} / ${MAX_ATTEMPTS}`;
  $('code-label').textContent = state.phase==='setup' ? 'Set the code' : 'The code';
  $('code-row').classList.toggle('active',state.phase==='setup');
  $('secret').replaceChildren(...cells(state.code,state.phase==='setup' && state.editing,state.mode==='break'&&!state.over));
  $('secret').setAttribute('aria-label',state.code ? `Code: ${state.code.map(c=>c+1).join(', ') || 'empty'}` : 'Secret code hidden');
  const rows = Array.from({length:MAX_ATTEMPTS},(_,i) => {
    const turn = state.turns[i], active = !state.over && state.phase==='play' && i===state.turns.length;
    const row = document.createElement('li'); row.className = `board-row${active?' active':''}${turn?.exact===4?' solved':''}`;
    row.dataset.row = i+1;
    row.setAttribute('aria-label',turn ? `Guess ${i+1}: ${turn.guess.map(c=>c+1).join(', ')}; ${turn.exact} exact, ${turn.partial} partial.` : `Guess ${i+1}${active?', current':''}`);
    if (active) row.setAttribute('aria-current','step');
    const guess = document.createElement('div'); guess.className = 'guess';
    guess.append(...cells(turn?.guess || (active ? state.draft : []),active && state.editing));
    const grade = grades(turn);
    if (active && state.mode==='break') {
      grade.removeAttribute('aria-hidden'); hint.disabled = state.busy;
      grade.append(hint);
    }
    row.append(guess,grade); return row;
  });
  $('history').replaceChildren(...rows);
  if (state.over && !previouslyOver) $('new').focus();
  previouslyOver = state.over;
}
const session = new Session({solve,cancel,changed:render});
$('code-row').append(grades(null));
$('board').addEventListener('click',event => {
  const target = event.target.closest('[data-remove]');
  if (!target) return;
  const index = Number(target.dataset.remove); session.remove(index);
  const next = document.querySelector(`[data-remove="${Math.min(index,session.draft.length-1)}"]`);
  (next || palette[0]).focus();
});
for (const mode of ['break','make']) $(mode).addEventListener('click',()=>session.start(mode));
$('new').addEventListener('click',()=>session.start());
$('end').addEventListener('click',()=>session.end());
document.addEventListener('keydown',event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,[contenteditable]')) return;
  if (/^[1-6]$/.test(event.key)) {event.preventDefault();session.add(Number(event.key)-1);}
  else if (event.key==='Backspace' && session.editing) {event.preventDefault();session.remove(session.draft.length-1);}
});
window.addEventListener('pagehide',()=>session.stop());
window.addEventListener('pageshow',event => {
  if (!event.persisted) return;
  if (session.mode==='make' && session.phase==='play' && !session.over) void session.runSolver(true);
  else session.emit();
});
