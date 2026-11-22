import { Calculator } from './engine.mjs';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; width: min(100%, 23rem); font-family: system-ui, sans-serif; color: #16313d; }
    * { box-sizing: border-box; }
    .case { padding: 1.1rem; border: 1px solid #9ebac6; border-radius: 1.25rem; background: #dcecf2; box-shadow: 0 12px 30px #16313d18; }
    .pending { min-height: 1.5rem; font-size: .9rem; text-align: right; color: #425f6b; }
    output { display: block; min-height: 5.5rem; padding: 1rem; margin-bottom: 1rem; border-radius: .5rem; background: #fff; text-align: right; font: 1.8rem/1.4 ui-monospace, monospace; overflow-wrap: anywhere; }
    .keys { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .55rem; }
    button { border: 1px solid #aac4cf; border-radius: .6rem; min-height: 3.5rem; background: #fff; color: #16313d; font: 1.25rem system-ui, sans-serif; cursor: pointer; }
    button:hover { filter: brightness(.94); }
    button:active { transform: translateY(1px); }
    button:focus-visible { outline: 3px solid #16313d; outline-offset: 2px; }
    .operator { background: #14657b; color: white; border-color: #14657b; }
    .equals { background: #a34123; color: white; border-color: #a34123; }
    .clear { grid-column: span 2; font-size: 1rem; }
    .hint { font-size: .9rem; line-height: 1.6; margin: 1rem 0 0; }
    @media (prefers-reduced-motion: reduce) { button:active { transform: none; } }
  </style>
  <section class="case" aria-label="Calculator">
    <div class="pending" aria-live="off"></div>
    <output aria-label="Result" aria-live="polite" aria-atomic="true">0</output>
    <div class="keys">
      <button class="clear" data-key="clear">Clear</button>
      <button data-key="sign" aria-label="Change sign">±</button>
      <button data-key="backspace" aria-label="Delete last digit">⌫</button>
      <button data-key="7">7</button><button data-key="8">8</button><button data-key="9">9</button><button class="operator" data-key="+" aria-label="Add">+</button>
      <button data-key="4">4</button><button data-key="5">5</button><button data-key="6">6</button><button class="operator" data-key="-" aria-label="Subtract">−</button>
      <button data-key="1">1</button><button data-key="2">2</button><button data-key="3">3</button><button class="operator" data-key="*" aria-label="Multiply">×</button>
      <button data-key="." aria-label="Decimal point">.</button><button data-key="0">0</button><button class="equals" data-key="=" aria-label="Equals">=</button><button class="operator" data-key="/" aria-label="Divide">÷</button>
    </div>
    <p class="hint">Use the buttons or type while a calculator button is focused. Enter: equals. Escape: clear. Backspace: delete.</p>
  </section>`;

export class AndurCalculator extends HTMLElement {
  constructor() {
    super();
    this.model = new Calculator();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this.shadowRoot.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button) this.press(button.dataset.key);
    });
    this.shadowRoot.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = { Enter: '=', Escape: 'clear', Backspace: 'backspace' }[event.key] || event.key;
      if (/^[0-9.+*/=-]$/.test(key) || ['clear', 'backspace'].includes(key)) {
        event.preventDefault(); this.press(key);
      }
    });
  }
  press(key) {
    this.model.press(key);
    this.shadowRoot.querySelector('output').textContent = this.model.display;
    this.shadowRoot.querySelector('.pending').textContent = this.model.operation
      ? `${this.model.operand} ${{ '*': '×', '/': '÷', '-': '−', '+': '+' }[this.model.operation]}` : '';
    this.dispatchEvent(new CustomEvent('calculate', { detail: { value: this.model.error ? null : Number(this.model.entry), error: this.model.error }, bubbles: true, composed: true }));
  }
}
if (!customElements.get('andur-calculator')) customElements.define('andur-calculator', AndurCalculator);
