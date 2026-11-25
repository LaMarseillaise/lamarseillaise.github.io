import {STALE_MS,TIME_ZONE,visibleArrivals,timeLabel} from './model.mjs';
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class TransitStopCard extends HTMLElement {
 constructor(){
  super();this.attachShadow({mode:'open'});
  this.shadowRoot.innerHTML=`<style>
  :host{display:block;color:#16313d;font:1rem/1.5 system-ui,sans-serif;min-width:0;height:100%}:host([hidden]){display:none!important}*{box-sizing:border-box}
  article{height:100%;padding:1.1rem;background:white;border:1px solid #9cb9c5;border-radius:.8rem;overflow-wrap:anywhere}
  :host([selected]) article{border:2px solid #14657b;padding:calc(1.1rem - 1px)}h3{font-size:1.15rem;line-height:1.35;margin:.3rem 0 .5rem}.meta,.stamp{color:#425f6b;font-size:.85rem;margin:.3rem 0}
  .number{font-weight:700;color:#14657b}.arrival-list{list-style:none;padding:0;margin:1rem 0}.arrival-list li{padding:.65rem 0;border-top:1px solid #d4e2e7;display:grid;grid-template-columns:auto 1fr;gap:.3rem .6rem}
  .route{background:#16313d;color:white;border-radius:.3rem;padding:.15rem .4rem;font-weight:700;align-self:start;min-width:2rem;text-align:center}
  .destination{font-weight:600}.when{display:block;color:#14657b;font-weight:700}.kind{display:block;font-size:.85rem;color:#425f6b}
  button,a{font:inherit;min-height:44px;display:inline-flex;align-items:center;padding:.5rem .65rem;border-radius:.35rem;color:#16313d}button{border:1px solid #9cb9c5;background:#e9f5fa;cursor:pointer}a{margin-left:.3rem}button:focus-visible,a:focus-visible{outline:3px solid #14657b;outline-offset:3px}.empty{padding:.8rem 0}.stamp{border-top:1px solid #d4e2e7;padding-top:.7rem} [hidden]{display:none!important}
  </style><article><div class="number"></div><h3></h3><p class="meta"></p><p class="stamp"></p><ul class="arrival-list"></ul><div class="actions"><button type="button">Show on map</button><a target="_blank" rel="noopener">Official stop page</a></div></article>`;
  this.shadowRoot.querySelector('button').onclick=()=>this.dispatchEvent(new CustomEvent('stop-select',{detail:{id:this._data?.stop.id},bubbles:true,composed:true}));
 }
 set data(value){this._data=value;this.render();}get data(){return this._data;}
 connectedCallback(){this.timer=setInterval(()=>this.updateTimes(),30000);this.render();}
 disconnectedCallback(){clearInterval(this.timer);}
 render(){
  if(!this._data)return;const {stop,index=1,popup=false}=this._data;const $=s=>this.shadowRoot.querySelector(s);
  $('.number').textContent='STOP '+index; $('h3').textContent=stop.name;
  $('.meta').textContent='MBTA · Stop '+stop.id+(Number.isFinite(stop.distance)?' · '+Math.round(stop.distance)+' m straight-line distance':'');
  $('button').hidden=popup;$('button').setAttribute('aria-label','Show '+stop.name+' on map');
  $('a').href='https://www.mbta.com/stops/'+encodeURIComponent(stop.id);this.updateTimes();
 }
 updateTimes(){
  if(!this._data)return;
  const {rows=[],fetchedAt,recorded=false,loading=false,error=false}=this._data;
  const now=Date.now(),stale=!recorded&&(error||!fetchedAt||now-fetchedAt>STALE_MS),list=this.shadowRoot.querySelector('.arrival-list');
  const visible=visibleArrivals(rows,recorded?fetchedAt:now,recorded);
  list.innerHTML=visible.map(r=>`<li><span class="route">${escapeHTML(r.route)}</span><div><span class="destination">${escapeHTML(r.destination)}</span><span class="when">${escapeHTML(timeLabel(r,now,stale,recorded))}${r.arrivalOnly&&!r.cancelled?' · arrival only':''}</span><span class="kind">${recorded?'Recorded · ':stale?'Older data · ':''}${escapeHTML(r.kind)}${r.description?' · '+escapeHTML(r.description):''}</span></div></li>`).join('');
  if(!visible.length){const li=document.createElement('li');li.className='empty';li.textContent=loading?'Loading arrival predictions…':error?'Arrival data unavailable. Check the official stop page.':'No upcoming predictions returned. This does not mean there is no service.';list.append(li);}
  const stamp=this.shadowRoot.querySelector('.stamp');
  if(recorded)stamp.textContent='Recorded example · '+new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:TIME_ZONE}).format(fetchedAt)+' ET. Not current travel information.';
  else if(loading)stamp.textContent='Fetching predictions…';
  else if(stale)stamp.textContent=error?'Refresh failed. Any times shown are older data; use the official stop page.':'Data is over two minutes old. Refresh before relying on these times.';
  else stamp.textContent='Retrieved '+new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit',timeZone:TIME_ZONE}).format(fetchedAt)+' ET · predictions can change.';
 }
}
customElements.define('transit-stop-card',TransitStopCard);
