// Adapted from Andur Carr's RegimeWeb Ruby and revolutionary JavaScript projects.
// This arithmetic extension retains their leap rule, with the epoch corrected
// to 22 September 1792. It does not compute the autumn equinox.
export const DAY_MS = 86_400_000;
export const EPOCH = Date.UTC(1792, 8, 22);
export const MONTHS = Object.freeze([
  'Vendémiaire', 'Brumaire', 'Frimaire', 'Nivôse', 'Pluviôse', 'Ventôse',
  'Germinal', 'Floréal', 'Prairial', 'Messidor', 'Thermidor', 'Fructidor',
]);
export const DAYS = Object.freeze(['Primidi', 'Duodi', 'Tridi', 'Quartidi', 'Quintidi', 'Sextidi', 'Septidi', 'Octidi', 'Nonidi', 'Décadi']);
export const FESTIVALS = Object.freeze(['Jour de la Vertu', 'Jour du Génie', 'Jour du Travail', "Jour de l’Opinion", 'Jour des Récompenses', 'Jour de la Révolution']);

export function isLeapYear(year) {
  return year % 4 === 3 && (year % 100 !== 99 || year % 400 === 399);
}
export function yearStart(year) {
  if (!Number.isInteger(year) || year < 1 || year > 9000) throw new RangeError('Year outside supported range');
  return (year - 1) * 365 + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);
}
export function roman(value) {
  if (!Number.isInteger(value) || value < 1 || value > 9000) throw new RangeError('Invalid Roman numeral');
  const pairs = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let result = '';
  for (const [number, glyph] of pairs) while (value >= number) { result += glyph; value -= number; }
  return result;
}

export function fromGregorian(year, month, day) {
  if (![year, month, day].every(Number.isInteger) || year < 1792 || year > 9999) throw new RangeError('Invalid Gregorian date');
  const stamp = Date.UTC(year, month - 1, day), date = new Date(stamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || stamp < EPOCH) throw new RangeError('Date must be on or after 22 September 1792');
  const elapsed = (stamp - EPOCH) / DAY_MS;
  let republicanYear = Math.floor(elapsed / 365.2425) + 1;
  while (elapsed < yearStart(republicanYear)) republicanYear--;
  while (elapsed >= yearStart(republicanYear + 1)) republicanYear++;
  const ordinal = elapsed - yearStart(republicanYear);
  const republicanMonth = Math.floor(ordinal / 30) + 1;
  const republicanDay = ordinal % 30 + 1;
  return {
    year: republicanYear, month: republicanMonth, day: republicanDay,
    yearName: roman(republicanYear), ordinal,
    monthName: republicanMonth === 13 ? 'Sansculottides' : MONTHS[republicanMonth - 1],
    dayName: republicanMonth === 13 ? FESTIVALS[republicanDay - 1] : DAYS[(republicanDay - 1) % 10],
    decade: republicanMonth === 13 ? null : Math.floor((republicanDay - 1) / 10) + 1,
    yearLength: isLeapYear(republicanYear) ? 366 : 365,
  };
}

export function toGregorian(year, month, day) {
  yearStart(year); // Validate before computing a timestamp.
  const max = month === 13 ? (isLeapYear(year) ? 6 : 5) : 30;
  if (!Number.isInteger(month) || month < 1 || month > 13 || !Number.isInteger(day) || day < 1 || day > max) throw new RangeError('Invalid Republican date');
  return new Date(EPOCH + (yearStart(year) + (month - 1) * 30 + day - 1) * DAY_MS);
}

const formatters = new Map();
export function civilParts(instant, timeZone = 'Europe/Paris') {
  if (!(instant instanceof Date) || !Number.isFinite(instant.getTime())) throw new RangeError('Invalid instant');
  if (!formatters.has(timeZone)) formatters.set(timeZone, new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }));
  return Object.fromEntries(formatters.get(timeZone).formatToParts(instant)
    .filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
}

export function decimalTime(hour, minute, second, millisecond = 0) {
  if (![hour,minute,second,millisecond].every(Number.isInteger) || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59 || millisecond < 0 || millisecond > 999) throw new RangeError('Invalid civil time');
  const elapsed = hour * 3_600_000 + minute * 60_000 + second * 1000 + millisecond;
  // Integer arithmetic avoids a rounded 100,000 at the end of the day.
  const total = Math.floor(elapsed * 100_000 / DAY_MS);
  return { hour: Math.floor(total / 10000), minute: Math.floor(total / 100) % 100, second: total % 100, total, fraction: elapsed / DAY_MS };
}
export function atInstant(instant, timeZone = 'Europe/Paris') {
  const civil = civilParts(instant, timeZone);
  return { civil, calendar: fromGregorian(civil.year, civil.month, civil.day), clock: decimalTime(civil.hour, civil.minute, civil.second, instant.getUTCMilliseconds()) };
}
