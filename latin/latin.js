import { passages, relations, tokens, validConnection, connectionKey } from './passages.mjs';

const $ = selector => document.querySelector(selector);
const storageKey = 'andur-latin-readings-v1';
let drafts = {}, current = passages[0], selected = null, active = null;
let storageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) drafts = stored;
} catch { storageAvailable = false; }

function draft() { return drafts[current.id]; }
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(drafts));
    storageAvailable = true;
    $('#save-status').textContent = 'Saved in this browser.';
  } catch {
    storageAvailable = false;
    $('#save-status').textContent = 'Browser storage is unavailable. Export your reading before leaving.';
  }
}
function textElement(tag, text) {
  const element = document.createElement(tag); element.textContent = text; return element;
}
for (const passage of passages) {
  const option = textElement('option', passage.title); option.value = passage.id;
  $('#passage').append(option);
}
for (const [type, relation] of Object.entries(relations)) {
  const option = textElement('option', relation.label); option.value = type;
  $('#relation').append(option);
}

function loadPassage() {
  current = passages.find(p => p.id === $('#passage').value) || passages[0];
  const stored = drafts[current.id];
  const count = tokens(current).length;
  drafts[current.id] = {
    translation: typeof stored?.translation === 'string' ? stored.translation : '',
    notes: typeof stored?.notes === 'string' ? stored.notes : '',
    connections: Array.isArray(stored?.connections) ? stored.connections.filter(link => validConnection(link, count)) : [],
  };
  selected = null; active = null;
  $('#translation').value = draft().translation; $('#notes').value = draft().notes;
  $('#source-note').textContent = current.note; $('#source').href = current.source;
  $('#words').replaceChildren();
  tokens(current).forEach((token, index) => {
    // Separate punctuation still occupies a token, but cannot be a link endpoint.
    if (!/\p{L}/u.test(token)) { $('#words').append(textElement('span', token)); return; }
    const button = textElement('button', token);
    button.type = 'button'; button.className = 'word'; button.dataset.index = index;
    button.setAttribute('aria-label', `${token}, word ${index + 1}`);
    button.setAttribute('aria-pressed', 'false');
    const number = textElement('small', String(index + 1)); number.setAttribute('aria-hidden', 'true');
    button.append(number); $('#words').append(button);
  });
  $('#selection').textContent = 'Select a first word.';
  $('#save-status').textContent = storageAvailable ? 'Drafts save in this browser as you write.' : 'Browser storage is unavailable. Export your reading before leaving.';
  renderConnections();
}

function resetSelection() {
  selected = null;
  for (const button of $('#words').querySelectorAll('button')) button.setAttribute('aria-pressed', 'false');
  $('#selection').textContent = 'Select a first word.';
}

$('#words').addEventListener('click', event => {
  const button = event.target.closest('button[data-index]');
  if (!button) return;
  const index = Number(button.dataset.index);
  if (selected === null) {
    selected = index; button.setAttribute('aria-pressed', 'true');
    $('#selection').textContent = `Selected ${tokens(current)[index]} (word ${index + 1}). Select a second word.`;
  } else if (selected === index) { resetSelection(); }
  else {
    const link = { from: selected, to: index, type: $('#relation').value };
    const duplicate = draft().connections.find(item => connectionKey(item) === connectionKey(link));
    if (!duplicate) draft().connections.push(link);
    active = connectionKey(link); resetSelection();
    $('#selection').textContent = duplicate ? 'That connection already exists.' : `${relations[link.type].label} connection added.`;
    save(); renderConnections();
  }
});

function describe(link) {
  const words = tokens(current);
  const separator = ['reference', 'agreement'].includes(link.type) ? ' ↔ ' : ' → ';
  return `${relations[link.type].label}: ${words[link.from]} (${link.from + 1})${separator}${words[link.to]} (${link.to + 1})`;
}

function renderConnections() {
  $('#connections').replaceChildren();
  const visible = $('#show-links').checked;
  $('#connections').hidden = !visible;
  $('#empty').hidden = visible && draft().connections.length > 0;
  $('#empty').textContent = visible ? 'No connections yet.' : 'Connections hidden. Your annotations are still saved.';
  for (const link of draft().connections) {
    const row = document.createElement('li'); row.style.setProperty('--link-color', relations[link.type].color);
    row.append(textElement('span', describe(link)));
    const remove = textElement('button', 'Remove'); remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${describe(link)}`);
    remove.addEventListener('click', () => {
      const at = draft().connections.indexOf(link);
      draft().connections.splice(at, 1); active = null; save(); renderConnections();
      const next = $('#connections').querySelectorAll('button')[Math.min(at, draft().connections.length - 1)];
      (next || $('#clear-selection')).focus();
      $('#selection').textContent = 'Connection removed.';
    });
    row.addEventListener('pointerenter', () => { active = connectionKey(link); draw(); });
    row.addEventListener('pointerleave', () => { active = null; draw(); });
    row.addEventListener('focusin', () => { active = connectionKey(link); draw(); });
    row.addEventListener('focusout', () => { active = null; draw(); });
    row.append(remove); $('#connections').append(row);
  }
  requestAnimationFrame(draw);
}

function draw() {
  const svg = $('#lines'); svg.replaceChildren();
  const visible = $('#show-links').checked;
  for (const button of $('#words').querySelectorAll('button')) button.style.removeProperty('border-bottom-color');
  if (!visible) return;
  const board = $('#passage-board').getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${board.width} ${board.height}`);
  draft().connections.forEach((link, index) => {
    const from = $(`#words [data-index="${link.from}"]`), to = $(`#words [data-index="${link.to}"]`);
    if (!from || !to) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const x1 = a.left - board.left + a.width / 2, x2 = b.left - board.left + b.width / 2;
    const y1 = a.bottom - board.top + 2, y2 = b.bottom - board.top + 2;
    const lift = 12 + index % 3 * 7;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // Wrapped-line links travel in the left gutter instead of crossing unrelated words.
    const gutter = 3 + index % 3 * 2;
    path.setAttribute('d', Math.abs(y1 - y2) < 10
      ? `M ${x1} ${y1} C ${x1} ${y1 + lift}, ${x2} ${y2 + lift}, ${x2} ${y2}`
      : `M ${x1} ${y1} V ${y1 + lift} H ${gutter} V ${y2 + lift} H ${x2} V ${y2}`);
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', relations[link.type].color);
    path.setAttribute('stroke-width', connectionKey(link) === active ? '3.5' : '2');
    path.setAttribute('opacity', active && connectionKey(link) !== active ? '.2' : '.85');
    if (['reference', 'agreement'].includes(link.type)) path.setAttribute('stroke-dasharray', '4 3');
    svg.append(path);
    if (!active || connectionKey(link) === active) {
      from.style.borderBottomColor = relations[link.type].color;
      to.style.borderBottomColor = relations[link.type].color;
    }
  });
}

$('#passage').addEventListener('change', loadPassage);
$('#relation').addEventListener('change', () => { resetSelection(); $('#relation-note').textContent = relations[$('#relation').value].note; });
$('#relation-note').textContent = relations[$('#relation').value].note;
$('#clear-selection').addEventListener('click', resetSelection);
$('#show-links').addEventListener('change', renderConnections);
for (const field of ['translation', 'notes']) {
  $(`#${field}`).addEventListener('input', event => { draft()[field] = event.target.value; save(); });
}
$('#export').addEventListener('click', () => {
  const data = { version: 1, passage: { id: current.id, title: current.title, text: current.text, source: current.source }, ...draft() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${current.id}-reading.json`;
  anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
new ResizeObserver(() => requestAnimationFrame(draw)).observe($('#passage-board'));
document.fonts.ready.then(() => requestAnimationFrame(draw));
loadPassage();
