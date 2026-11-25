import {normalizeStops,normalizePredictions} from './model.mjs';
const ROOT='https://api-v3.mbta.com/';
let cachedStops,stopsAt=0,blockedUntil=0;
async function request(path,params,signal){
 if(Date.now()<blockedUntil)throw new Error('The transit service is rate-limiting requests. Please wait a minute, then refresh.');
 const url=new URL(path,ROOT);url.search=new URLSearchParams(params);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
 try{
  const response=await fetch(url,{signal:controller.signal});
  if(response.status===429){blockedUntil=Date.now()+60000;throw new Error('The transit service is busy. Please wait a minute, then refresh.');}
  if(!response.ok)throw new Error('The transit service is unavailable ('+response.status+'). Please try again.');
  return await response.json();
 }catch(error){
  if(signal?.aborted)throw error;
  if(error.name==='AbortError')throw new Error('The transit service took too long to respond. Please try again.');
  if(error instanceof TypeError)throw new Error('Could not reach the transit service. Check your connection or try the recorded example.');
  throw error;
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export async function loadStops(signal){
 if(cachedStops&&Date.now()-stopsAt<900000)return cachedStops;
 const json=await request('stops',{'filter[route_type]':'3','filter[location_type]':'0','fields[stop]':'name,latitude,longitude,description','page[limit]':'10000'},signal);
 if(json.links?.next)throw new Error('The stop directory is larger than this example supports. Try the recorded example.');
 cachedStops=normalizeStops(json);stopsAt=Date.now();return cachedStops;
}
export async function loadArrivals(stops,signal){
 const json=await request('predictions',{'filter[stop]':stops.map(s=>s.id).join(','),'include':'route,trip','page[limit]':'500'},signal);
 return {byStop:normalizePredictions(json,stops.map(s=>s.id)),fetchedAt:Date.now(),partial:!!json.links?.next};
}
