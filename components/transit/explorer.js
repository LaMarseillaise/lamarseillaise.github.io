import './stop-map.js';
import {PRESETS,nearbyStops,searchStops,locationError} from './model.mjs';
import {loadStops,loadArrivals} from './mbta.mjs';
export class TransitExplorer extends HTMLElement {
 constructor(){
  super();this.attachShadow({mode:'open'});this.stops=[];this.directory=[];this.cards=new Map();this.selected=null;this.mode='map';this.generation=0;this.provider={loadStops,loadArrivals};this.positionRequester=(success,error,options)=>navigator.geolocation.getCurrentPosition(success,error,options);
  this.shadowRoot.innerHTML=`<style>
  :host{display:block;font:1rem/1.6 system-ui,sans-serif;color:#16313d}:host([hidden]){display:none!important}*{box-sizing:border-box}.toolbar{padding:1.2rem;background:#fff;border:1px solid #bfd6df;border-radius:.8rem;margin-bottom:1rem}label{display:block;font-weight:600}select,input,button{font:inherit;color:inherit;min-height:44px;border:1px solid #7897a5;border-radius:.35rem;padding:.5rem .75rem}select,input{background:white;max-width:100%;width:100%}input{min-width:0}select{appearance:none;padding-right:2rem;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='10'%3E%3Cpath d='m2 2 5 5 5-5' fill='none' stroke='%2316313d' stroke-width='2'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .65rem center}button{background:white;cursor:pointer}button:disabled{opacity:.55;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #14657b;outline-offset:3px}
  .row{display:flex;align-items:end;flex-wrap:wrap;gap:.8rem}.area{flex:1 1 15rem}.search{margin-top:1rem}.search label{flex:1 1 18rem}.hint{font-size:.9rem;color:#425f6b;margin:.5rem 0}.location{background:#16313d;color:white}.view-bar{display:flex;flex-wrap:wrap;gap:.8rem;justify-content:space-between;align-items:center;margin:1rem 0}.toggle{display:flex;gap:.3rem}.toggle [aria-pressed=true]{background:#16313d;color:white}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1rem}.status{padding:.75rem 0;margin:0}.coverage{color:#425f6b;font-size:.9rem}.results{list-style:none;padding:0;display:grid;gap:.4rem}.results button{width:100%;text-align:left}.recorded{background:#fff2d9;border-left:4px solid #8b5706;padding:.8rem}.area-name{font-size:1.3rem;margin:.6rem 0}.empty{padding:1rem;border:1px solid #bfd6df;border-radius:.7rem}.actions{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}[hidden]{display:none!important}
  </style><div class="toolbar"><div class="row"><label class="area">Explore an area<select data-area><option value="" disabled>Choose a Boston area</option>${PRESETS.map((p,i)=>`<option value="${i}"${i===0?' selected':''}>${p.name}</option>`).join('')}</select></label><button class="location" data-location>Use my location</button></div><p class="hint">Live coverage: MBTA buses in Greater Boston. Location is optional; nearby-stop matching happens on your device.</p><form class="row search"><label>Search a bus stop by name or ID<input type="search" data-search placeholder="For example: Harvard or 110" minlength="2" maxlength="100"></label><button data-search-button>Find stops</button></form><ul class="results" aria-label="Matching stops" hidden></ul><p class="hint">No location permission? Choose an area above or search a stop. Distances are straight-line estimates, not walking routes.</p><p data-location-status role="status"></p></div>
  <p data-status role="status" class="status" aria-live="polite">Loading the bus stop directory…</p><p class="recorded" hidden>Recorded example. These are saved observations, not current arrivals.</p><h2 class="area-name"></h2>
  <div class="view-bar"><div class="toggle" role="group" aria-label="Stop display"><button data-view="map" aria-pressed="true">Map view</button><button data-view="list" aria-pressed="false">List view</button></div><button data-refresh>Refresh arrivals</button></div>
  <div data-views><transit-stop-map></transit-stop-map><div class="grid" role="region" aria-label="Nearby stop cards" hidden></div></div><p class="empty" hidden></p><p class="coverage">Bus predictions from MBTA. All clock times use Eastern Time. This independent example does not show every service alert or provide journey planning.</p><div class="actions"><button data-recorded>Try recorded example</button><button data-live hidden>Return to live data</button></div>`;
  this.$=s=>this.shadowRoot.querySelector(s);
  this.$('[data-area]').onchange=()=>{this.$('[data-location-status]').textContent='';this.loadPlace(PRESETS[Number(this.$('[data-area]').value)]);};
  this.$('[data-location]').onclick=()=>this.locate();
  this.$('form').onsubmit=e=>{e.preventDefault();this.search();};
  this.$('[data-refresh]').onclick=()=>this.refresh();
  this.$('[data-recorded]').onclick=()=>this.recordedExample();
  this.$('[data-live]').onclick=()=>this.loadPlace(PRESETS[Number(this.$('[data-area]').value)]);
  for(const b of this.shadowRoot.querySelectorAll('[data-view]'))b.onclick=()=>this.setView(b.dataset.view);
  this.shadowRoot.addEventListener('stop-select',event=>{event.stopPropagation();const fromList=event.composedPath().some(n=>n===this.$('.grid'));this.selected=event.detail.id;this.setView('map');this.updateSelection();this.$('transit-stop-map').selectStop(this.selected,fromList);});
  this.shadowRoot.addEventListener('stop-close',()=>{this.selected=null;this.updateSelection();});
 }
 connectedCallback(){if(!this.started){this.started=true;this.$('[data-location]').disabled=false;this.loadPlace(PRESETS[0]);}else this.renderCards();}
 disconnectedCallback(){this.generation++;this.controller?.abort();clearTimeout(this.cooldown);this.started=false;}
 begin(){clearTimeout(this.cooldown);this.controller?.abort();this.controller=new AbortController();const id=++this.generation;this.$('[data-refresh]').disabled=true;return id;}
 active(id){return id===this.generation&&this.isConnected;}
 async loadPlace(place){
  const id=this.begin();this.recorded=false;this.selected=null;this.place=place;
  const presetIndex=PRESETS.findIndex(p=>p.name===place.name);this.$('[data-area]').value=presetIndex<0?'':String(presetIndex);
  this.$('.recorded').hidden=true;this.$('[data-live]').hidden=true;this.$('.results').hidden=true;this.$('.area-name').textContent=place.name;
  this.stops=[];this.cards.clear();this.renderCards();this.$('[data-status]').textContent='Finding nearby MBTA bus stops…';
  try{
   const directory=await this.provider.loadStops(this.controller.signal);if(!this.active(id))return;this.directory=directory;
   this.stops=nearbyStops(this.directory,place);this.cards=new Map(this.stops.map((stop,index)=>[stop.id,{stop,index:index+1,loading:true}]));this.renderCards();
   if(!this.stops.length){this.$('[data-status]').textContent='No supported bus stops within 1.6 km of this location. This first version covers Greater Boston, not Eugene or other cities. Choose a Boston area to explore the live example.';return;}
   await this.fetchPredictions(id);
  }catch(error){if(this.active(id))this.$('[data-status]').textContent=error.message;}
  finally{if(this.active(id))this.unlockRefresh();}
 }
 async fetchPredictions(id){
  this.$('[data-status]').textContent='Loading predictions for '+this.stops.length+' nearby stops…';
  try{
   const data=await this.provider.loadArrivals(this.stops,this.controller.signal);if(!this.active(id))return;
   this.cards=new Map(this.stops.map((stop,index)=>[stop.id,{stop,index:index+1,rows:data.byStop.get(stop.id)||[],fetchedAt:data.fetchedAt}]));
   this.$('[data-status]').textContent=`Showing ${this.stops.length} nearby bus stops. Select a pin or switch to list view.${data.partial?' The service returned a partial set of predictions.':''}`;
  }catch(error){if(!this.active(id))return;for(const card of this.cards.values()){card.error=true;card.loading=false;}this.$('[data-status]').textContent=error.message;}
  if(this.active(id))this.renderCards();
 }
 async refresh(){if(this.recorded||!this.stops.length)return;const id=this.begin();await this.fetchPredictions(id);if(this.active(id))this.unlockRefresh();}
 unlockRefresh(){clearTimeout(this.cooldown);this.cooldown=setTimeout(()=>{if(this.isConnected)this.$('[data-refresh]').disabled=this.recorded||!this.stops.length;},15000);}
 setView(mode){this.mode=mode;this.$('transit-stop-map').hidden=mode!=='map';this.$('.grid').hidden=mode!=='list';for(const b of this.shadowRoot.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===mode));}
 renderCards(){
  this.$('[data-views]').hidden=!this.stops.length;this.$('.empty').hidden=!!this.stops.length;this.$('.empty').textContent='No stop cards to display. Choose an area, search a stop, or try the recorded example.';
  this.$('.grid').replaceChildren();for(const data of this.cards.values()){const card=document.createElement('transit-stop-card');card.data=data;card.toggleAttribute('selected',data.stop.id===this.selected);this.$('.grid').append(card);}
  this.$('transit-stop-map').data={stops:this.stops,cards:this.cards,selectedId:this.selected};this.setView(this.mode);
 }
 updateSelection(){for(const card of this.$('.grid').children)card.toggleAttribute('selected',card.data.stop.id===this.selected);this.$('transit-stop-map').data={stops:this.stops,cards:this.cards,selectedId:this.selected};}
 search(){
  const query=this.$('[data-search]').value;
  if(!this.directory.length){this.$('[data-status]').textContent='The stop directory is unavailable. Retry an area or load the recorded example.';return;}
  const matches=searchStops(this.directory,query);this.$('.results').replaceChildren();this.$('.results').hidden=!matches.length;
  for(const stop of matches){const li=document.createElement('li'),button=document.createElement('button');button.textContent=stop.name+' · Stop '+stop.id;button.type='button';button.onclick=()=>{this.$('[data-location-status]').textContent='';this.loadPlace({...stop,name:'Near '+stop.name});};li.append(button);this.$('.results').append(li);}
  this.$('[data-status]').textContent=matches.length?`${matches.length} matching stops shown. Select one to find stops nearby.`:'No matching stops. Try part of a Greater Boston stop name or choose an area.';
 }
 locate(){
  if(!navigator.geolocation){this.$('[data-location-status]').textContent=locationError();return;}
  const generation=this.generation;this.$('[data-location]').disabled=true;this.$('[data-location-status]').textContent='Waiting for location permission…';
  this.positionRequester(position=>{
   if(!this.isConnected)return;this.$('[data-location]').disabled=false;if(generation!==this.generation)return;
   this.$('[data-location-status]').textContent='Location found (accuracy about '+Math.round(position.coords.accuracy)+' m). Coordinates are used in this tab only.';
   this.loadPlace({name:'Near your location',lat:position.coords.latitude,lon:position.coords.longitude});
  },error=>{if(!this.isConnected)return;this.$('[data-location]').disabled=false;if(generation!==this.generation)return;this.$('[data-location-status]').textContent=locationError(error);},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
 }
 async recordedExample(){
  const id=this.begin();this.$('[data-status]').textContent='Loading the recorded example…';
  try{
   const response=await fetch(new URL('../../projects/transit/recorded.json',import.meta.url),{signal:this.controller.signal});if(!response.ok)throw new Error('The recorded example could not be loaded.');const example=await response.json();if(!this.active(id))return;
   this.recorded=true;this.$('[data-area]').value='0';this.selected=null;this.stops=example.stops;this.directory=example.stops;this.place=PRESETS[0];this.cards=new Map(example.cards.map(data=>[data.stop.id,{...data,recorded:true}]));
   this.$('.area-name').textContent='Harvard Square · recorded example';this.$('.recorded').hidden=false;this.$('[data-live]').hidden=false;this.$('.results').hidden=true;this.$('[data-location-status]').textContent='';
   this.$('[data-status]').textContent='Recorded example loaded. All times are historical; no live arrivals are being fetched.';this.renderCards();
  }catch(error){if(this.active(id))this.$('[data-status]').textContent=error.message;}
 }
}
customElements.define('transit-explorer',TransitExplorer);
