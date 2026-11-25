const output = document.querySelector('#result');
const run = document.querySelector('#run');
function assert(test, message) { if (!test) throw new Error(message); }
run.addEventListener('click', async () => {
  run.disabled = true; output.textContent = 'Running…';
  try {
    const {andur} = await import('./entrance.mjs');
    assert(window.andur === andur, 'Global namespace installed');
    assert(!performance.getEntriesByType('resource').some(r => /engine.mjs|mastermind.wasm/.test(r.name)), 'Entrypoint must not preload game/solver');
    andur.help();
    const abandoned = andur.play(); andur.quit(); await abandoned;
    await andur.play(); await andur.hint(); andur.quit();
    const {createConsoleGame} = await import('./mastermind.mjs');
    const logs = [];
    for (const engine of ['swift','javascript']) {
      const game = createConsoleGame({write:t=>logs.push(t), random:()=>0});
      await game.start({engine});
      assert(!logs.at(-1).includes('⚫️ ⚫️ ⚫️ ⚫️'), 'Secret concealed');
      game.guess('1212'); await game.hint(); game.quit();
      await game.start({engine, code:'6654'});
      assert(/Solved in [1-5] guesses/.test(logs.at(-1)), `${engine} Make solved`);
      const other = createConsoleGame({write:()=>{}, random:()=>.99});
      await other.start({engine});
      assert(other.guess('1111').exact === 0, 'Independent game');
      assert(/Solved/.test(game.board()), 'Other game preserved'); other.quit();
    }
    const projects = await andur.projects();
    assert(projects.some(p=>p.project==='Mastermind'), 'Catalog contains Mastermind');
    output.textContent = 'PASS: lazy entrance, canceled module load, real Swift/Wasm and JavaScript workers, Break/hints/Make, hidden code, isolated rounds, and catalog.\n\n'+logs.at(-1);
  } catch (error) { output.textContent='FAIL: '+error.stack; }
  // Reload to rerun: lazy-load assertion requires a fresh document.
});
