export const TIME_ZONE='America/New_York';
export const STALE_MS=120000;
export const PRESETS=[
 {name:'Harvard Square, Cambridge',lat:42.3736,lon:-71.119},
 {name:'South Station, Boston',lat:42.3523,lon:-71.0552},
 {name:'Back Bay, Boston',lat:42.3473,lon:-71.0758}
];
export function validPoint(p){return Number.isFinite(p?.lat)&&Number.isFinite(p?.lon)&&Math.abs(p.lat)<=85&&Math.abs(p.lon)<=180;}
export function distanceMeters(a,b){
 const rad=Math.PI/180, dlat=(b.lat-a.lat)*rad,dlon=(b.lon-a.lon)*rad;
 const h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;
 return 6371000*2*Math.asin(Math.sqrt(Math.min(1,h)));
}
export function nearbyStops(stops,point,limit=6,radius=1600){
 if(!validPoint(point))return [];
 return stops.map(s=>({...s,distance:distanceMeters(point,s)})).filter(s=>s.distance<=radius).sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id)).slice(0,limit);
}
export function searchStops(stops,query){
 const q=query.trim().toLocaleLowerCase();if(q.length<2)return [];
 return stops.filter(s=>s.id===q||s.name.toLocaleLowerCase().includes(q)).sort((a,b)=>(a.id===q?-1:b.id===q?1:a.name.localeCompare(b.name))).slice(0,10);
}
export function normalizeStops(payload){
 if(!Array.isArray(payload?.data))throw new Error('The stop service returned an unexpected response.');
 const seen=new Set();
 return payload.data.map(s=>({id:String(s.id),name:s.attributes?.description||s.attributes?.name,lat:s.attributes?.latitude,lon:s.attributes?.longitude})).filter(s=>{
 if(!s.name||!validPoint(s)||seen.has(s.id))return false;seen.add(s.id);return true;
 });
}
const relationship=(item,name)=>item.relationships?.[name]?.data?.id;
export function normalizePredictions(payload,stopIds){
 if(!Array.isArray(payload?.data))throw new Error('The arrival service returned an unexpected response.');
 const included=new Map((payload.included||[]).map(item=>[item.type+':'+item.id,item.attributes]));
 const byStop=new Map(stopIds.map(id=>[id,[]]));const seen=new Set();
 for(const p of payload.data){
  const a=p.attributes||{},stop=relationship(p,'stop'),route=included.get('route:'+relationship(p,'route'))||{},trip=included.get('trip:'+relationship(p,'trip'))||{};
  if(!byStop.has(stop)||seen.has(p.id)||a.revenue_status==='NON_REVENUE'||(route.type!=null&&route.type!==3))continue;
  seen.add(p.id);
  const state=a.schedule_relationship;
  if(state==='NO_DATA')continue;
  const cancelled=state==='CANCELLED'||state==='CANCELED',skipped=state==='SKIPPED';
  const departure=a.departure_time,arrival=a.arrival_time;
  const timestamp=Date.parse(departure||arrival),uncertainty=departure?a.departure_uncertainty:a.arrival_uncertainty;
  if(!cancelled&&!skipped&&(!Number.isFinite(timestamp)||uncertainty>301))continue;
  const kind=cancelled?'Cancelled':skipped?'Stop skipped':uncertainty===300?'Schedule-based estimate':uncertainty===301?'Prediction · delayed':'Live prediction';
  byStop.get(stop).push({id:String(p.id),route:route.short_name||route.long_name||relationship(p,'route')||'Bus',destination:a.trip_headsign||trip.headsign||'Destination unavailable',time:Number.isFinite(timestamp)?timestamp:null,kind,cancelled:cancelled||skipped,arrivalOnly:!departure,description:typeof a.status==='string'?a.status:''});
 }
 for(const rows of byStop.values())rows.sort((a,b)=>(a.time??Infinity)-(b.time??Infinity));
 return byStop;
}
export function visibleArrivals(rows,now,recorded=false){return rows.filter(r=>recorded||r.time==null||r.time>=now-30000).slice(0,4);}
export function timeLabel(row,now,stale=false,recorded=false){
 if(row.cancelled)return row.kind;
 if(!Number.isFinite(row.time))return 'Time unavailable';
 const clock=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:TIME_ZONE}).format(row.time);
 if(stale||recorded)return clock+' ET';
 const seconds=(row.time-now)/1000;
 if(seconds<=60)return 'Due';
 return Math.ceil(seconds/60)+' min';
}
export function locationError(error){
 return ({1:'Location permission was declined. Choose an area or search for a stop below.',2:'Your location is unavailable. Choose an area or search for a stop below.',3:'Location lookup timed out. Choose an area or search for a stop below.'})[error?.code]||'Location is not available in this browser. Choose an area or search for a stop below.';
}
export function projectPoint(point,zoom){
 const scale=256*2**zoom,lat=point.lat*Math.PI/180;
 return {x:(point.lon+180)/360*scale,y:(1-Math.log(Math.tan(lat)+1/Math.cos(lat))/Math.PI)/2*scale};
}
export function fitZoom(stops,width,height){
 if(!stops.length)return 15;
 for(let z=18;z>=12;z--){const p=stops.map(s=>projectPoint(s,z));if(Math.max(...p.map(s=>s.x))-Math.min(...p.map(s=>s.x))<=width-100&&Math.max(...p.map(s=>s.y))-Math.min(...p.map(s=>s.y))<=height-100)return z;}
 return 12;
}
export function spreadMarkers(points,width,height){
 const used=[];
 return points.map(p=>{
  let best;
  for(let r=0;r<=240&&!best;r+=48)for(let i=0;i<(r?12:1);i++){
   const x=Math.max(24,Math.min(width-24,p.x+r*Math.cos(i*Math.PI/6))),y=Math.max(24,Math.min(height-24,p.y+r*Math.sin(i*Math.PI/6)));
   if(used.every(q=>Math.hypot(q.x-x,q.y-y)>=47)){best={x,y};break;}
  }
  const result=best||p;used.push(result);return {...p,displayX:result.x,displayY:result.y};
 });
}
