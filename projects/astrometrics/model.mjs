// Calculation model, independent of the diagrams and DOM. SI-based conversions.
export const C_KM_S = 299792.458;
export const AU_KM = 149597870.7;
export const JULIAN_YEAR_SECONDS = 365.25 * 86400;
export const LY_KM = C_KM_S * JULIAN_YEAR_SECONDS;
export const ARCSEC_RAD = Math.PI / (180 * 3600);
export const PC_KM = AU_KM / ARCSEC_RAD;
export const KM_PER_MILE = 1.609344;
export const UNITS = { km: 1, au: AU_KM, ly: LY_KM, pc: PC_KM };
function positive(value, name) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be a positive finite number.`);
}
export function circumferenceFromLight(speedMiles, laps) {
  positive(speedMiles, 'Speed'); positive(laps, 'Circuits per second');
  return speedMiles / laps;
}
export function earthFromShadows(distance, shadow, height) {
  positive(distance, 'Separation'); positive(shadow, 'Shadow'); positive(height, 'Height');
  const angle = Math.atan(shadow / height) * 180 / Math.PI;
  return { angle, fraction: 360 / angle, circumference: distance * 360 / angle };
}
export function solarRanging(seconds, innerPeriod, earthPeriod = 365.25) {
  positive(seconds, 'Echo time'); positive(innerPeriod, 'Inner orbital period'); positive(earthPeriod, 'Earth period');
  if (innerPeriod >= earthPeriod) throw new RangeError('The inner planet must have a shorter orbital period.');
  const ratio = (innerPeriod / earthPeriod) ** (2 / 3);
  const separation = C_KM_S * seconds / 2;
  return { ratio, separation, au: separation / (1 - ratio) };
}
export function parallax(arcseconds) {
  positive(arcseconds, 'Parallax');
  if (arcseconds >= 90 * 3600) throw new RangeError('Parallax must be less than 90 degrees.');
  return { parsecs: 1 / arcseconds, km: PC_KM / arcseconds, triangleKm: AU_KM / Math.tan(arcseconds * ARCSEC_RAD) };
}
export function convert(value, from, to) {
  if (!Number.isFinite(value) || value < 0 || !Object.hasOwn(UNITS, from) || !Object.hasOwn(UNITS, to)) throw new RangeError('Choose a valid distance and unit.');
  const result = value * (UNITS[from] / UNITS[to]);
  if (!Number.isFinite(result)) throw new RangeError('That distance is too large.');
  return result;
}
