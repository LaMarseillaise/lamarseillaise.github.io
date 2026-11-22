import assert from 'node:assert/strict';
import { Calculator } from './engine.mjs';

function run(keys) { const calc = new Calculator(); for (const key of keys) calc.press(key); return calc; }
const cases = [
  ['12+34=', '46'], ['9-12=', '-3'], ['7*8=', '56'], ['9/4=', '2.25'],
  ['.1+.2=', '0.3'], ['1.2.3+2=', '3.23'], ['2+3*4=', '20'],
  ['2+*3=', '6'], ['5==', '5'], ['5+2==', '7'], ['2+3=4', '4'],
  ['2+3=.5', '0.5'], ['8/0=', 'Cannot divide by zero'], ['0/0=', 'Cannot divide by zero'],
  ['8/0=7', '7'], ['8/0=+', 'Cannot divide by zero'], ['9+2=*3=', '33'],
];
for (const [keys, expected] of cases) assert.equal(run(keys).display, expected, keys);
assert.equal(run(['5', 'sign', '*', '2', '=']).display, '-10');
assert.equal(run(['5', '*', 'sign', '2', '=']).display, '-10');
assert.equal(run(['1', '2', 'backspace']).display, '1');
assert.equal(run(['1', '+', 'clear', '3', '=']).display, '3');
const first = run('5+2='), second = run('9');
second.press('clear'); assert.equal(first.display, '7');
assert.equal(run('1234567890123456').display, '123456789012345');
const tiny = run('1/100000000=');
tiny.press('sign'); tiny.press('backspace');
assert.equal(tiny.display, '0');
const tinyEntry = run('1/100000000=');
tinyEntry.press('sign'); tinyEntry.press('.'); tinyEntry.press('5');
assert.equal(tinyEntry.display, '0.5');
console.log(`${cases.length + 8} calculator checks passed.`);
