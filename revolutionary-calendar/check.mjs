import assert from 'node:assert/strict';
import {EPOCH, DAY_MS, fromGregorian, toGregorian, isLeapYear, yearStart, roman, decimalTime, atInstant} from './calendar.mjs';

// Independently documented dates from the calendar's actual period of use.
for (const [gregorian, expected] of [
  [[1792,9,22],[1,1,1]], [[1793,9,22],[2,1,1]],
  [[1794,7,27],[2,11,9]], [[1795,9,22],[3,13,6]],
  [[1795,9,23],[4,1,1]], [[1799,11,9],[8,2,18]],
  [[1805,12,31],[14,4,10]],
]) {
  const actual = fromGregorian(...gregorian);
  assert.deepEqual([actual.year,actual.month,actual.day], expected, gregorian.join('-'));
}
// Walk an entire 400-year cycle using explicit leap-year enumeration, rather
// than the closed-form year-start calculation used by the implementation.
const leapYears = new Set(Array.from({length:100},(_,i) => 3 + 4*i).filter(y => ![99,199,299].includes(y)));
let elapsed = 0;
for (let year = 1; year <= 400; year++) {
  assert.equal(yearStart(year), elapsed);
  assert.equal(isLeapYear(year), leapYears.has(year));
  for (let ordinal = 0; ordinal < (leapYears.has(year) ? 366 : 365); ordinal++) {
    const month = Math.floor(ordinal/30)+1, day = ordinal%30+1;
    const date = new Date(EPOCH + elapsed*DAY_MS);
    const actual = fromGregorian(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate());
    assert.deepEqual([actual.year,actual.month,actual.day],[year,month,day]);
    assert.equal(toGregorian(year,month,day).getTime(),date.getTime());
    elapsed++;
  }
}
assert.equal(elapsed,146097);
assert.equal(roman(235),'CCXXXV');
assert.equal(roman(1999),'MCMXCIX');
for (const args of [[1792,9,21],[2026,2,29],[2026,13,1],[2026,0,1],[2026,1,0]]) assert.throws(() => fromGregorian(...args),RangeError);
for (const args of [[1,13,6],[3,13,7],[0,1,1],[3,0,1],[3,1,31]]) assert.throws(() => toGregorian(...args),RangeError);
assert.equal(decimalTime(0,0,0).total,0);
assert.equal(decimalTime(12,0,0).total,50000);
assert.equal(decimalTime(23,59,59,999).total,99999);
for (let second = 0; second < 86400; second++) {
  const time = decimalTime(Math.floor(second/3600),Math.floor(second/60)%60,second%60);
  const expected = Number(BigInt(second)*100000n/86400n);
  assert.equal(time.total,expected);
  assert.equal(time.hour*10000+time.minute*100+time.second,expected);
}
assert.throws(() => decimalTime(24,0,0),RangeError);
// Modern Paris daylight-saving discontinuities are deliberate wall-clock
// behavior. Both calendar and decimal clock must use the same civil date.
for (const [iso,expected] of [
  ['2026-01-01T11:00:00Z',[2026,1,1,12,0,0]],
  ['2026-07-01T10:00:00Z',[2026,7,1,12,0,0]],
  ['2026-03-29T00:59:59Z',[2026,3,29,1,59,59]],
  ['2026-03-29T01:00:00Z',[2026,3,29,3,0,0]],
  ['2026-10-25T00:59:59Z',[2026,10,25,2,59,59]],
  ['2026-10-25T01:00:00Z',[2026,10,25,2,0,0]],
  ['2026-11-22T23:00:00Z',[2026,11,23,0,0,0]],
]) {
  const actual = atInstant(new Date(iso));
  assert.deepEqual(['year','month','day','hour','minute','second'].map(key => actual.civil[key]),expected);
  assert.deepEqual(actual.calendar,fromGregorian(...expected.slice(0,3)));
  assert.equal(actual.clock.total,decimalTime(...expected.slice(3)).total);
}
assert.equal(atInstant(new Date('2026-11-22T23:00:00Z'),'UTC').civil.day,22);
assert.equal(atInstant(new Date('2026-11-22T07:00:00Z'),'America/Los_Angeles').civil.day,21);
console.log('PASS: 7 historical anchors; all 146,097 dates in a 400-year cycle; every ordinary second; invalid dates; Paris DST and time-zone boundaries.');
