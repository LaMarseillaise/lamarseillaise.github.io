// A small invitation, not a DevTools detector. No game engine loads until play().
let controller, loading, generation = 0;
const output = value => { console.log(value); };
const help = `Hello, fellow inspector.
These projects are meant to be taken apart.

await andur.play("mastermind")                New Break round; Swift/Wasm solver
andur.guess("1123")                          Four pegs, numbered 1–6
andur.board()                                Emoji board
andur.board("text")                          Plain-text board
await andur.hint()                           Submit a minimax guess
await andur.make("6654")                      Watch Swift break your code
await andur.play("mastermind", {engine: "javascript"})
andur.quit()                                 End the round and reveal the code
await andur.projects()                       Demos and source links
andur.about()                                How this started
andur.guide()                                A guide for source readers

Console rounds are independent of the visible game. No account, analytics,
or AI service. Only same-site game assets load; reload clears the round.`;
function active() {
  if (!controller) throw new Error('First run await andur.play("mastermind").');
  return controller;
}
export const andur = Object.freeze({
  help: () => output(help),
  async play(name = 'mastermind', options = {}) {
    if (name !== 'mastermind') throw new RangeError('Available game: "mastermind".');
    const ticket = ++generation;
    const module = await (loading ||= import('./mastermind.mjs').catch(error => { loading = null; throw error; }));
    if (ticket !== generation) return;
    controller ||= module.createConsoleGame();
    await controller.start(options);
  },
  make: (code, options = {}) => andur.play('mastermind', {...options, role: 'make', code}),
  guess: value => active().guess(value),
  board: style => { active().board(style); },
  hint: () => active().hint(),
  quit() { generation++; if (controller) controller.quit(); else output('No active console round.'); },
  async projects() {
    const response = await fetch(new URL('../../content/catalog.json', import.meta.url));
    if (!response.ok) throw new Error(`Project directory unavailable (${response.status}).`);
    const {projects} = await response.json();
    const rows = projects.map(({title, slug}) => ({project: title,
      demo: new URL(`/projects/${slug}/`, location.origin).href,
      source: `https://github.com/LaMarseillaise/lamarseillaise.github.io/tree/master/projects/${slug}`}));
    console.table(rows); return rows;
  },
  about: () => output('Around 1994, my father downloaded Land of the Fuzzies. My sister and I discovered that its HyperCard buttons, fields, and scripts were easy to change, and began making games of our own. I still want software creation to feel that approachable. — Andur'),
  guide: () => output(new URL('../../agents.html', import.meta.url).href)
});
if (!('andur' in globalThis)) {
  Object.defineProperty(globalThis, 'andur', {value: andur, configurable: true});
  console.info('Hello, fellow inspector. These projects are meant to be taken apart.\nTry andur.help() for a look around—or a game.');
}
