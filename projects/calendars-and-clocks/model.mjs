// Pure arithmetic for Andur's calendar. No astronomy, timezone or DST input.
export const DAY = 86_400_000;
export const EPOCH = Date.UTC(1999, 11, 22, 12);
export const MIN_YEAR = 10001, MAX_YEAR = 19999;
export const mod = (n, d) => ((n % d) + d) % d;
export const seasonalLeap = y => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) && y % 4000 !== 0;
const accumulated = y => 365 * (y - 1) + Math.floor((y - 1) / 4) - Math.floor((y - 1) / 100) + Math.floor((y - 1) / 400) - Math.floor((y - 1) / 4000);
const epochDays = accumulated(12000);
export function yearStart(y) {
  if (!Number.isInteger(y) || y < MIN_YEAR || y > MAX_YEAR + 1) throw new RangeError('Seasonal year must be 10001–19999.');
  return accumulated(y) - epochDays;
}
export function hexadecimal(ms) {
  if (!Number.isFinite(ms)) throw new RangeError('Invalid instant.');
  return Math.floor(mod(ms + DAY / 2, DAY) / DAY * 65536).toString(16).toUpperCase().padStart(4, '0');
}
export function fromInstant(ms) {
  if (!Number.isFinite(ms)) throw new RangeError('Invalid instant.');
  const offset = Math.floor((ms - EPOCH) / DAY);
  if (offset < yearStart(MIN_YEAR) || offset >= yearStart(MAX_YEAR + 1)) throw new RangeError('Outside the supported seasonal calendar range.');
  let lo = MIN_YEAR, hi = MAX_YEAR + 1;
  while (hi - lo > 1) { const mid = Math.floor((lo + hi) / 2); if (yearStart(mid) <= offset) lo = mid; else hi = mid; }
  const year = lo, ordinal = offset - yearStart(year), leap = seasonalLeap(year);
  const kind = ordinal === 364 + Number(leap) ? 'year-day' : leap && ordinal === 182 ? 'leap-day' : 'regular';
  const regular = ordinal - Number(leap && ordinal > 182);
  return {year, ordinal, leap, kind, season: kind === 'regular' ? Math.floor(regular / 91) + 1 : null,
    week: kind === 'regular' ? Math.floor(regular % 91 / 7) + 1 : null,
    day: kind === 'regular' ? regular % 7 + 1 : null,
    start: EPOCH + offset * DAY};
}
export function toInstant({year, kind = 'regular', season, week, day}) {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) throw new RangeError('Seasonal year must be 10001–19999.');
  const leap = seasonalLeap(year);
  let ordinal;
  if (kind === 'year-day') ordinal = 364 + Number(leap);
  else if (kind === 'leap-day' && leap) ordinal = 182;
  else if (kind === 'regular' && Number.isInteger(season) && season >= 1 && season <= 4 && Number.isInteger(week) && week >= 1 && week <= 13 && Number.isInteger(day) && day >= 1 && day <= 7) {
    ordinal = (season - 1) * 91 + (week - 1) * 7 + day - 1;
    if (leap && ordinal >= 182) ordinal++;
  } else throw new RangeError('Invalid seasonal date or leap day in a common year.');
  return EPOCH + (yearStart(year) + ordinal) * DAY;
}
export const seasonNames = ['I','II','III','IV'];
export function seasonalLabel(value) {
  return value.kind === 'year-day' ? `${value.year} · Year Day` : value.kind === 'leap-day' ? `${value.year} · Leap Day` : `${value.year} · Season ${seasonNames[value.season - 1]} · Week ${value.week} · Day ${value.day}`;
}
export const gregorianLeap = y => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export function validateDate(y,m,d) {
  const lengths = [31,gregorianLeap(y)?29:28,31,30,31,30,31,31,30,31,30,31];
  if (![y,m,d].every(Number.isInteger) || y < 1 || y > 9999 || m < 1 || m > 12 || d < 1 || d > lengths[m-1]) throw new RangeError('Enter a valid Gregorian date, years 0001–9999.');
}
export function doomsday(y,m,d) {
  validateDate(y,m,d);
  const century = Math.floor(y/100), anchor = mod(5 * (century % 4) + 2,7);
  const tail = y % 100, quotient = Math.floor(tail/12), remainder = tail%12, fours = Math.floor(remainder/4);
  const sum = quotient + remainder + fours, doom = mod(anchor+sum,7);
  const monthDay = [gregorianLeap(y)?4:3,gregorianLeap(y)?29:28,14,4,9,6,11,8,5,10,7,12][m-1];
  const difference = d-monthDay;
  return {century, anchor, tail, quotient, remainder, fours, sum, doom, monthDay, difference, weekday:mod(doom+difference,7)};
}
export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError('Enter a date as YYYY-MM-DD.');
  const parts = value.split('-').map(Number); validateDate(...parts); return parts;
}
export function parseInstant(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) throw new RangeError('Enter a UTC date and time.');
  const [date,time] = value.split('T'), [y,m,d] = parseDate(date), [h,min,s=0] = time.split(':').map(Number);
  if (h > 23 || min > 59 || s > 59) throw new RangeError('Invalid time.');
  const result = new Date(0); result.setUTCFullYear(y,m-1,d); result.setUTCHours(h,min,s,0);
  return result.getTime();
}
export const dstExamples = {
  spring: {start:Date.UTC(2026,2,8,9,30), label:'8 March 2026 · clocks move forward'},
  autumn: {start:Date.UTC(2026,10,1,8,30), label:'1 November 2026 · clocks move back'},
};
export function zoneDisplay(ms, zone, hour12 = false) {
  return new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',...(hour12?{hour12:true}:{hourCycle:'h23'}),timeZoneName:'shortOffset'}).format(ms);
}
