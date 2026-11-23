import { circumferenceFromLight, earthFromShadows, solarRanging, parallax, convert } from './model.mjs';
const $ = id => document.getElementById(id);
const value = id => Number($(id).value);
const number = (n, digits = 4) => new Intl.NumberFormat('en-US', { maximumSignificantDigits: digits }).format(n);
const put = (id, text) => { $(id).textContent = text; };
const attr = (id, name, value) => $(id).setAttribute(name, String(value));
function light() {
  const laps = value('laps');
  put('laps-label', number(laps));
  put('light-equation', `186,000 miles/s ÷ ${number(laps)} circuits/s`);
  put('light-result', `≈ ${number(circumferenceFromLight(186000, laps), 3)} miles per circuit`);
}
function earth() {
  const shadow = value('shadow-length'), distance = value('separation');
  const result = earthFromShadows(distance, shadow, 100);
  put('shadow-readout', `${number(shadow)} cm`); put('separation-readout', `${number(distance)} km`);
  put('earth-result', `≈ ${number(result.circumference, 3)} km`);
  put('earth-reason', `The angle is about ${number(result.angle, 3)}°. Roughly ${number(result.fraction, 3)} copies of this arc make a complete circle.`);
  put('earth-working', `${number(distance)} km × 360° ÷ ${number(result.angle, 5)}° ≈ ${number(result.circumference, 4)} km.`);
  put('earth-angle-label', `Measured angular difference: ${number(result.angle, 3)}°`);
  put('shadow-length-label', `shadow: ${number(shadow)} cm`);
  const a = result.angle * 2.5 * Math.PI / 180; // Exaggerated globe only; not the measured angle.
  const x = 240 - 94 * Math.sin(a), y = 215 - 94 * Math.cos(a);
  const tipX = 240 - 114 * Math.sin(a), tipY = 215 - 114 * Math.cos(a);
  attr('earth-radii', 'd', `M240 121V215L${x} ${y}`);
  attr('earth-arc', 'd', `M240 121A94 94 0 0 0 ${x} ${y}`);
  $('sun-rays').innerHTML = `<path d="M240 50V100M${tipX} 50V${tipY-4}" class="gold-line" marker-end="url(#ray-arrow)"/><path d="M240 121V101M${x} ${y}L${tipX} ${tipY}" class="teal-line" stroke-width="4"/>`;
  $('site-points').innerHTML = `<circle cx="240" cy="121" r="4" class="gold-fill"/><circle cx="${x}" cy="${y}" r="4" class="teal-fill"/><text x="255" y="118">A</text><text x="${x-27}" y="${y+12}">B</text>`;
  // Both lengths in the stick triangle share one scale (100 cm = 113 SVG units).
  const end = 160 + shadow * 1.13;
  attr('stick-ray', 'd', `M160 30L${end} 143`);
  attr('stick-shadow', 'd', `M160 143H${end}`);
}
function solar() {
  const seconds = value('echo'), result = solarRanging(seconds, 224.7);
  put('echo-label', `${seconds} seconds`);
  put('au-result', `≈ ${number(result.au / 1e6, 3)} million km`);
  put('au-reason', `The echo gives a gap of ${number(result.separation / 1e6, 3)} million km. That gap is about ${number((1-result.ratio)*100, 3)}% of the Earth–Sun distance.`);
}
function star() {
  const p = value('parallax'), result = parallax(p);
  put('parallax-label', `${p.toFixed(2)} ${p === 1 ? 'arcsecond' : 'arcseconds'}`);
  put('star-result', `${number(result.parsecs)} ${result.parsecs === 1 ? 'parsec' : 'parsecs'}`);
  put('star-equivalents', `≈ ${number(convert(result.parsecs, 'pc', 'ly'))} lightyears · ${number(convert(result.parsecs, 'pc', 'au'), 4)} au`);
  put('star-shift', `The full shift between the two visits is ${number(2*p)} arcseconds; p is half of it.`);
  // Qualitative depth compression keeps a real stellar triangle readable on a screen.
  const y = 55 + 140 * (p - 0.05) / 1.95;
  attr('target-star', 'cy', y); attr('parallax-rays', 'd', `M100 310L240 ${y}L380 310`);
  attr('parallax-center', 'd', `M240 ${y}V310`);
  attr('p-label', 'y', y+40); put('p-label', `p = ${p.toFixed(2)}″`);
}
function units() {
  const raw = $('distance').value, amount = Number(raw), unit = $('unit').value;
  try {
    if (!raw.trim() || amount > 1e18) throw new RangeError('Enter a distance from 0 to 10¹⁸.');
    const results = Object.fromEntries(['km','au','ly','pc'].map(target => [target, convert(amount, unit, target)]));
    for (const [key,n] of Object.entries(results)) put(`in-${key}`, n && (n < .001 || n >= 1e15) ? n.toExponential(4) : number(n, 6));
    put('conversion-error', ''); $('distance').removeAttribute('aria-invalid');
  } catch {
    put('conversion-error', 'Enter a finite, non-negative distance up to 10¹⁸.'); attr('distance', 'aria-invalid', 'true');
    for (const key of ['km','au','ly','pc']) put(`in-${key}`, '—');
  }
}
const resets = {
  light: () => { $('laps').value = 7; light(); },
  earth: () => { $('shadow-length').value = 12.6; $('separation').value = 800; earth(); },
  solar: () => { $('echo').value = 276; solar(); },
  star: () => { $('parallax').value = 1; star(); },
};
for (const button of document.querySelectorAll('[data-reset]')) button.addEventListener('click', resets[button.dataset.reset]);
for (const [ids, fn] of [[['laps'],light],[['shadow-length','separation'],earth],[['echo'],solar],[['parallax'],star],[['distance','unit'],units]]) {
  for (const id of ids) $(id).addEventListener('input', fn);
  fn();
}
$('use-star').addEventListener('click', () => { $('distance').value = parallax(value('parallax')).parsecs; $('unit').value = 'pc'; units(); });
