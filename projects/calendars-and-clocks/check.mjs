import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {DAY,EPOCH,fromInstant,toInstant,yearStart,seasonalLeap,hexadecimal,doomsday,parseDate,parseInstant,dstExamples,zoneDisplay,MIN_YEAR,MAX_YEAR} from './model.mjs';

const oracle=JSON.parse(execFileSync('python3',[fileURLToPath(new URL('./oracle.py',import.meta.url))],{encoding:'utf8'}));
const digest=createHash('sha256');let extra=0,leaps=0;
for(let offset=0;offset<oracle.days;offset++){
  const ms=EPOCH+offset*DAY,d=fromInstant(ms);
  digest.update(`${d.year},${d.ordinal},${d.kind},${d.season??0},${d.week??0},${d.day??0},${d.start}\n`);
  assert.equal(toInstant(d),ms,`inverse at offset ${offset}`);
  assert.deepEqual(fromInstant(ms+DAY-1),d,`last millisecond at offset ${offset}`);
  if(d.kind==='year-day')extra++;if(d.kind==='leap-day')leaps++;
}
assert.equal(digest.digest('hex'),oracle.sha256,'full record stream matches independent sequential Python oracle');
assert.equal(extra,4000);assert.equal(leaps,969);assert.equal(yearStart(16000),oracle.days);
assert.equal(yearStart(12000),0);assert.equal(seasonalLeap(12000),false);assert.equal(seasonalLeap(14000),true);
assert.equal(fromInstant(EPOCH-1).year,11999);assert.equal(fromInstant(EPOCH-1).kind,'year-day');
assert.equal(toInstant({year:11999,kind:'year-day'}),EPOCH-DAY);
assert.equal(new Date(toInstant({year:12001,season:1,week:1,day:1})).toISOString(),'2000-12-21T12:00:00.000Z');
assert.equal(new Date(toInstant({year:12026,season:1,week:1,day:1})).toISOString(),'2025-12-21T12:00:00.000Z');
assert.equal(new Date(toInstant({year:12027,season:1,week:1,day:1})).toISOString(),'2026-12-21T12:00:00.000Z');
for(const year of [10001,11996,11999,12000,12024,12100,12400,14000,15999,19999]){
  const start=EPOCH+yearStart(year)*DAY;
  assert.equal(fromInstant(start).year,year);assert.equal(fromInstant(start+DAY*(365+Number(seasonalLeap(year)))-1).kind,'year-day');
  assert.equal(fromInstant(start+181*DAY).day,7);
  if(seasonalLeap(year)){
    const middle=toInstant({year,kind:'leap-day'});
    assert.equal(fromInstant(middle-1).season,2);assert.equal(fromInstant(middle).season,null);
    assert.equal(fromInstant(middle+DAY).season,3);assert.equal(fromInstant(middle+DAY).day,1);
  } else assert.equal(fromInstant(start+182*DAY).season,3);
}
for(const ms of [NaN,Infinity,EPOCH+yearStart(MIN_YEAR)*DAY-1,EPOCH+yearStart(MAX_YEAR+1)*DAY])assert.throws(()=>fromInstant(ms),RangeError);
for(const value of [{year:12000,kind:'leap-day'},{year:12026,season:5,week:1,day:1},{year:12026,season:1,week:14,day:1},{year:12026,season:1,week:1,day:0},{year:20000,kind:'year-day'}])assert.throws(()=>toInstant(value),RangeError);

// Native Date weekday progression is independent of the mental Doomsday rule.
let dates=0;
for(let ms=Date.UTC(1600,0,1);ms<Date.UTC(2000,0,1);ms+=DAY){
  const d=new Date(ms),r=doomsday(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate());
  assert.equal(r.weekday,d.getUTCDay(),d.toISOString());dates++;
}
assert.equal(dates,146097);
for(const value of ['0001-01-01','0099-12-31','1900-03-01','2000-02-29','2026-11-23','2100-03-01','9999-12-31']){
  const [y,m,d]=parseDate(value),native=new Date(0);native.setUTCFullYear(y,m-1,d);native.setUTCHours(0,0,0,0);
  assert.equal(doomsday(y,m,d).weekday,native.getUTCDay());
}
assert.equal(doomsday(1800,4,4).anchor,5);assert.equal(doomsday(1900,4,4).anchor,3);
for(const value of ['1900-02-29','2100-02-29','2026-04-31','0000-01-01','','2026-13-01','2026-1-1'])assert.throws(()=>parseDate(value),RangeError);
for(const value of ['2026-02-30T12:00','2026-01-01T24:00','2026-01-01T12:60','2026-01-01T12:00:60'])assert.throws(()=>parseInstant(value),RangeError);
assert.equal(new Date(parseInstant('0099-01-01T00:00')).getUTCFullYear(),99);

for(const base of [EPOCH,-DAY/2]){
  for(let tick=0;tick<65536;tick++){
    const boundary=base+Math.ceil(tick*DAY/65536),hex=tick.toString(16).toUpperCase().padStart(4,'0');
    assert.equal(hexadecimal(boundary),hex);
    assert.equal(hexadecimal(boundary-1),((tick+65535)%65536).toString(16).toUpperCase().padStart(4,'0'));
  }
}
assert.equal(hexadecimal(Date.UTC(2026,0,1,12)),'0000');assert.equal(hexadecimal(Date.UTC(2026,0,1,0)),'8000');
const spring=dstExamples.spring.start,autumn=dstExamples.autumn.start;
assert.match(zoneDisplay(spring+29*60000,'America/Los_Angeles'),/01:59:00.*GMT-8/);
assert.match(zoneDisplay(spring+30*60000,'America/Los_Angeles'),/03:00:00.*GMT-7/);
assert.match(zoneDisplay(autumn+29*60000,'America/Los_Angeles'),/01:59:00.*GMT-7/);
assert.match(zoneDisplay(autumn+30*60000,'America/Los_Angeles'),/01:00:00.*GMT-8/);
console.log(`PASS: ${oracle.days.toLocaleString('en-US')} seasonal days matched independent Python oracle, ${extra} Year Days / ${leaps} Leap Days, all inverses and final milliseconds; ${dates.toLocaleString('en-US')} Gregorian weekdays; epoch/limits/invalid dates; 131,072 hex tick boundaries; both DST transitions.`);
