import {atInstant, DAYS, FESTIVALS, roman} from './calendar.mjs';

const $ = id => document.getElementById(id);
const svgNS = 'http://www.w3.org/2000/svg';
const pad = value => String(value).padStart(2, '0');
for (let i = 0; i < 100; i++) {
  const tick = document.createElementNS(svgNS, 'line');
  Object.entries({x1:200,y1:i % 10 === 0 ? 23 : 28,x2:200,y2:35,transform:`rotate(${i * 3.6} 200 200)`,class:`tick${i % 10 === 0 ? ' major' : ''}`}).forEach(([key,value]) => tick.setAttribute(key,value));
  $('ticks').append(tick);
}
for (let i = 0; i < 10; i++) {
  const numeral = document.createElementNS(svgNS, 'text'), angle = i * Math.PI / 5;
  numeral.setAttribute('x', 200 + 142 * Math.sin(angle));
  numeral.setAttribute('y', 200 - 142 * Math.cos(angle));
  numeral.setAttribute('class','numeral');
  numeral.textContent = roman(i || 10);
  $('numerals').append(numeral);
}

let zone = 'Europe/Paris', frozen = null, lastDate = '', civilFormatter;
function setFormatter() {
  civilFormatter = new Intl.DateTimeFormat('en-GB', {timeZone:zone,day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
}
function announce() {
  $('clock-status').textContent = `${frozen ? 'Paused' : 'Live'} · modern civil time · ${zone.replaceAll('_',' ')}`;
}
function render() {
  try {
    const instant = frozen || new Date();
    const {calendar:c, clock:t} = atInstant(instant, zone);
    $('decimal-clock').textContent = `${t.hour}:${pad(t.minute)}:${pad(t.second)}`;
    $('civil-date').textContent = `${civilFormatter.format(instant)} · ${zone.replaceAll('_',' ')}`;
    $('hour-hand').setAttribute('transform', `rotate(${t.fraction * 360} 200 200)`);
    $('minute-hand').setAttribute('transform', `rotate(${t.fraction * 10 % 1 * 360} 200 200)`);
    $('second-hand').setAttribute('transform', `rotate(${t.fraction * 1000 % 1 * 360} 200 200)`);
    const dateKey = `${c.year}/${c.month}/${c.day}`;
    if (dateKey !== lastDate) {
      lastDate = dateKey;
      $('day-name').textContent = c.dayName;
      $('republican-date').textContent = c.month === 13 ? 'Sansculottides' : `${c.day} ${c.monthName}`;
      $('republican-year').textContent = `An ${c.yearName}`;
      const festival = c.month === 13, start = festival ? 0 : (c.decade - 1) * 10;
      const labels = festival ? FESTIVALS.slice(0,c.yearLength - 360) : DAYS;
      $('decade-label').textContent = festival ? 'The complementary festival days' : `Décade ${c.decade} · ${c.monthName}`;
      $('decade').classList.toggle('festivals', festival);
      $('decade').setAttribute('aria-label', festival ? 'Complementary festival days' : 'Days of the current décade');
      $('decade').replaceChildren(...labels.map((label,index) => {
        const li = document.createElement('li'), number = document.createElement('strong'), name = document.createElement('span');
        number.textContent = start + index + 1; name.textContent = label; name.lang = 'fr';
        if (start + index + 1 === c.day) li.setAttribute('aria-current','date');
        li.append(number,name); return li;
      }));
    }
  } catch (error) {
    $('clock-status').textContent = 'The date could not be calculated. Check your device clock and time-zone support.';
    console.error(error);
    return false;
  }
  return true;
}
$('zone').addEventListener('change', () => {
  zone = $('zone').value === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : $('zone').value;
  setFormatter(); announce(); render();
});
$('pause').addEventListener('click', () => {
  frozen = frozen ? null : new Date();
  $('pause').setAttribute('aria-pressed', String(Boolean(frozen)));
  $('pause').textContent = frozen ? 'Resume display' : 'Pause display';
  announce(); render();
});
setFormatter(); announce();
if (render()) setInterval(() => { if (!frozen && !document.hidden) render(); }, 200);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
