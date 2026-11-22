// Immediate-execution calculator: operations run left to right, as on a desk calculator.
const operations = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => { if (b === 0) throw new Error('Cannot divide by zero'); return a / b; },
};

export class Calculator {
  constructor() { this.clear(); }
  clear() {
    this.entry = '0'; this.operand = null; this.operation = null;
    this.fresh = true; this.error = null;
  }
  get display() { return this.error || this.entry; }
  press(key) {
    if (key === 'clear') { this.clear(); return; }
    if (this.error) {
      if (/^[0-9.]$/.test(key)) this.clear();
      else return;
    }
    if (/^\d$/.test(key)) {
      if (this.fresh || this.entry.includes('e')) { this.entry = key; this.fresh = false; }
      else if (this.entry.replace(/[-.]/g, '').length < 15) {
        this.entry = this.entry === '0' ? key : this.entry === '-0' ? `-${key}` : this.entry + key;
      }
    } else if (key === '.') {
      if (this.fresh || this.entry.includes('e')) { this.entry = '0.'; this.fresh = false; }
      else if (!this.entry.includes('.')) this.entry += '.';
    } else if (key === 'sign') {
      if (this.fresh && this.operation) this.entry = '0';
      this.entry = this.entry.startsWith('-') ? this.entry.slice(1) : `-${this.entry}`;
      this.fresh = false;
    } else if (key === 'backspace') {
      if (!this.fresh) {
        this.entry = this.entry.includes('e') ? '0' : this.entry.slice(0, -1);
        if (!this.entry || this.entry === '-') this.entry = '0';
      }
    } else if (Object.hasOwn(operations, key)) {
      if (this.operation && !this.fresh && !this.evaluate()) return;
      this.operand = Number(this.entry); this.operation = key; this.fresh = true;
    } else if (key === '=' && this.operation && !this.fresh) {
      this.evaluate();
    }
  }
  evaluate() {
    try {
      const result = operations[this.operation](this.operand, Number(this.entry));
      if (!Number.isFinite(result)) throw new Error('Result is too large');
      this.entry = String(Number(result.toPrecision(15)));
      this.operand = null; this.operation = null; this.fresh = true;
      return true;
    } catch (error) { this.error = error.message; return false; }
  }
}
