import '../../components/transit/explorer.js';
const example=await fetch('./recorded.json').then(r=>r.json());
const button=document.querySelector('#run'),output=document.querySelector('#result');
const tick=()=>new Promise(resolve=>setTimeout(resolve,30));
const assert=(condition,label)=>{if(!condition)throw new Error(label);};
button.onclick=async()=>{
 button.disabled=true;output.textContent='Running…';let explorer;
 try{
  explorer=document.createElement('transit-explorer');
  const goodProvider={loadStops:async()=>example.stops,loadArrivals:async(stops)=>({byStop:new Map(stops.map(s=>[s.id,example.cards.find(c=>c.stop.id===s.id).rows])),fetchedAt:Date.now()})};
  explorer.provider=goodProvider;document.querySelector('#fixture').replaceChildren(explorer);await tick();
  const root=explorer.shadowRoot;
  assert(root.querySelectorAll('.grid transit-stop-card').length===6,'six cards');
  root.querySelector('[data-view="list"]').click();assert(!root.querySelector('.grid').hidden,'list view');
  const first=root.querySelector('.grid transit-stop-card');first.shadowRoot.querySelector('button').click();
  const map=root.querySelector('transit-stop-map');assert(!map.hidden&&!map.shadowRoot.querySelector('.popup').hidden,'list to map popup');await tick();assert(map.shadowRoot.activeElement?.classList.contains('pin'),'marker focus survives resize');
  map.shadowRoot.querySelector('.close').click();assert(map.shadowRoot.querySelector('.popup').hidden,'popup close');
  for(const [code,word]of [[1,'declined'],[2,'unavailable'],[3,'timed out']]){
   explorer.positionRequester=(_success,error)=>error({code});root.querySelector('[data-location]').click();assert(root.querySelector('[data-location-status]').textContent.includes(word),'location error '+code);assert(!root.querySelector('[data-location]').disabled,'location button recovers');
  }
  explorer.positionRequester=success=>success({coords:{latitude:44.05,longitude:-123.09,accuracy:100}});root.querySelector('[data-location]').click();await tick();assert(root.querySelector('[data-status]').textContent.includes('No supported'),'outside coverage');assert(root.querySelector('[data-views]').hidden,'old map hidden outside coverage');
  await explorer.loadPlace({lat:42.3736,lon:-71.119,name:'Fixture'});await tick();
  explorer.provider={...goodProvider,loadArrivals:async()=>{throw new Error('Simulated outage');}};await explorer.refresh();assert(root.querySelector('[data-status]').textContent==='Simulated outage','outage message');assert(root.querySelector('.grid transit-stop-card').shadowRoot.querySelector('.stamp').textContent.includes('Refresh failed'),'old arrivals marked stale');
  explorer.provider=goodProvider;await explorer.refresh();assert(root.querySelector('[data-status]').textContent.includes('Showing 6'),'refresh recovery');
  let delayedResolve,delayedSuccess;
  explorer.provider={...goodProvider,loadStops:()=>new Promise(resolve=>{delayedResolve=resolve;})};
  const old=explorer.loadPlace({lat:44.05,lon:-123.09,name:'Old request'});await tick();explorer.provider=goodProvider;await explorer.loadPlace({lat:42.3736,lon:-71.119,name:'New request'});delayedResolve([]);await old;
  assert(root.querySelector('.area-name').textContent==='New request'&&root.querySelectorAll('.grid transit-stop-card').length===6,'late request ignored');
  explorer.positionRequester=success=>{delayedSuccess=success;};root.querySelector('[data-location]').click();await explorer.loadPlace({lat:42.3736,lon:-71.119,name:'Manual choice'});delayedSuccess({coords:{latitude:44.05,longitude:-123.09,accuracy:100}});await tick();assert(root.querySelector('.area-name').textContent==='Manual choice','late geolocation ignored');
  const stale=document.createElement('transit-stop-card');stale.data={...example.cards[0],fetchedAt:Date.now()-180000};document.querySelector('#fixture').append(stale);assert(stale.shadowRoot.querySelector('.stamp').textContent.includes('over two minutes'),'stale indicator');
  await explorer.recordedExample();assert(root.querySelector('.recorded').hidden===false,'recorded banner');assert(root.querySelector('.grid transit-stop-card').shadowRoot.querySelector('.stamp').textContent.includes('Not current'),'recorded card label');
  explorer.remove();document.querySelector('#fixture').prepend(explorer);await tick();assert(root.querySelectorAll('.grid transit-stop-card').length===6,'reconnection');
  output.textContent='PASS: six independent cards; list/map synchronization; popup close; denied, unavailable and timed-out location; outside coverage; failed/stale arrivals and recovery; late feed and geolocation responses; recorded labels; component reconnection.';
 }catch(error){output.textContent='FAIL: '+error.message;}finally{button.disabled=false;}
};
