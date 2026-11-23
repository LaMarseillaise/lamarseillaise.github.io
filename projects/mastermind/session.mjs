import {Game, randomCode, COLORS, LENGTH} from './engine.mjs';

// DOM-independent interaction state. Guard every awaited result against a
// new round, role change, or surrender that happens while the worker is busy.
export class Session {
  constructor({solve, cancel = () => {}, changed = () => {}, secret = randomCode}) {
    this.solve = solve; this.cancel = cancel; this.changed = changed; this.createSecret = secret;
    this.mode = 'break'; this.generation = 0; this.start();
  }
  get editing() { return !this.busy && (this.phase === 'setup' || (this.phase === 'play' && this.mode === 'break' && !this.game.over)); }
  get over() { return this.phase === 'ended' || Boolean(this.game?.over); }
  snapshot() {
    return {mode:this.mode, phase:this.phase, busy:this.busy, editing:this.editing, over:this.over,
      draft:[...this.draft], turns:this.game?.turns || [],
      code:this.phase === 'setup' ? [...this.draft] : this.mode === 'make' ? [...this.secret] : this.game?.answer,
      status:this.status, analysis:this.analysis};
  }
  emit() { this.changed(this.snapshot()); }
  stop() { this.generation++; this.cancel(); this.busy = false; }
  start(mode = this.mode) {
    if (!['break','make'].includes(mode)) throw new RangeError('Invalid role');
    this.stop(); this.mode = mode; this.draft = []; this.analysis = '';
    this.phase = mode === 'make' ? 'setup' : 'play';
    this.secret = null; this.game = mode === 'break' ? new Game(this.createSecret()) : null;
    this.status = mode === 'make' ? 'Set your code above the divider. The fourth peg starts the computer.' : 'Add four pegs to the highlighted row. The fourth peg submits your guess.';
    this.emit();
  }
  add(color) {
    if (!Number.isInteger(color) || color < 0 || color >= COLORS.length) throw new RangeError('Invalid peg');
    if (!this.editing) return;
    this.draft.push(color);
    if (this.draft.length !== LENGTH) { this.emit(); return; }
    const code = [...this.draft]; this.draft = [];
    if (this.phase === 'setup') {
      this.secret = code; this.game = new Game(code); this.phase = 'play';
      void this.runSolver(true);
    } else { this.analysis = ''; this.game.guess(code); this.report(); }
  }
  remove(index) {
    if (!this.editing || !Number.isInteger(index) || index < 0 || index >= this.draft.length) return;
    this.draft.splice(index,1); this.emit();
  }
  report() {
    const turns = this.game.turns, last = turns.at(-1);
    if (this.game.solved) this.status = `${this.mode === 'make' ? 'The computer solved' : 'You solved'} the code in ${turns.length} ${turns.length === 1 ? 'guess' : 'guesses'}.`;
    else if (this.game.over) this.status = 'Twelve guesses used. The code is revealed.';
    else this.status = this.mode === 'make' ? `Guess ${turns.length}: ${last.exact} exact, ${last.partial} partial. The computer is finding its next guess…` : `Guess ${turns.length}: ${last.exact} exact, ${last.partial} partial. Add four pegs for your next guess.`;
    this.emit();
  }
  suggest() {
    if (this.mode !== 'break' || this.phase !== 'play' || this.over) return;
    return this.runSolver(false);
  }
  async runSolver(automatic) {
    if (this.busy || !this.game || this.over) return;
    const round = this.generation;
    this.busy = true; this.status = automatic ? 'The computer is finding its next guess…' : 'Finding and playing an optimal guess…'; this.emit();
    try {
      do {
        const result = await this.solve(this.game.turns);
        if (round !== this.generation) return;
        this.draft = []; this.game.guess(result.guess);
        this.analysis = `${result.remaining.toLocaleString()} possible ${result.remaining === 1 ? 'code' : 'codes'} before the last guess.`;
        this.report();
      } while (automatic && !this.game.over);
      this.busy = false; this.emit();
    } catch (error) {
      if (round !== this.generation) return;
      this.busy = false;
      this.status = `${error.message} ${automatic ? 'Start a new round to retry the computer.' : 'You can keep playing or try help again.'}`;
      this.emit();
    }
  }
  end() {
    if (this.over) return;
    this.stop();
    if (this.game) this.game.reveal();
    else { this.secret = [...this.draft]; this.draft = []; }
    this.phase = 'ended'; this.analysis = '';
    this.status = this.game ? 'Round ended. The code is revealed.' : 'Code setup ended. Start a new round to play.';
    this.emit();
  }
}
