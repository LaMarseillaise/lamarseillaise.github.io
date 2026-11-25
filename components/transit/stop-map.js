import './stop-card.js';
import {projectPoint,fitZoom,spreadMarkers} from './model.mjs';
export class TransitStopMap extends HTMLElement {
 constructor(){
  super();this.attachShadow({mode:'open'});this.zoom=null;this.stops=[];this.cards=new Map();
  this.shadowRoot.innerHTML=`<style>
  :host{display:block;color:#16313d;font:1rem/1.5 system-ui,sans-serif;min-width:0}:host([hidden]){display:none!important}*{box-sizing:border-box}
  .frame{position:relative}.stage{position:relative;height:480px;background:#e2edf0;overflow:hidden;border:1px solid #9cb9c5;border-radius:.8rem}
  .tiles,.pins,svg{position:absolute;inset:0}.tiles img{position:absolute;width:256px;height:256px;max-width:none}.pins{pointer-events:none}svg{pointer-events:none;width:100%;height:100%}
  .pin{pointer-events:auto;position:absolute;transform:translate(-50%,-50%);width:44px;height:44px;border:2px solid white;box-shadow:0 2px 6px #0007;border-radius:50%;background:#16313d;color:white;font:bold 1rem system-ui;cursor:pointer;z-index:2}
  .pin[aria-expanded=true]{background:#14657b;outline:3px solid #16313d;outline-offset:2px;z-index:3}.pin:focus-visible{outline:4px solid #a23d15;outline-offset:3px;z-index:4}
  .controls{position:absolute;left:.6rem;top:.6rem;display:flex;gap:.3rem;z-index:5}.controls button,.close{min-height:44px;min-width:44px;background:white;color:#16313d;border:1px solid #7897a5;border-radius:.3rem;font:inherit;padding:.45rem;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #14657b;outline-offset:3px}
  .attribution{position:absolute;bottom:0;left:0;z-index:5;background:#fffE;color:#16313d;padding:.15rem .5rem;font-size:.8rem}.attribution a{display:inline-block;padding:.15rem}
  .popup{position:absolute;right:.7rem;top:.7rem;width:min(340px,calc(100% - 5rem));max-height:calc(100% - 3rem);overflow:auto;z-index:6;border:2px solid #14657b;border-radius:.8rem;background:white;box-shadow:0 8px 24px #16313d44}
  .close{display:block;margin:.4rem .4rem .2rem auto;padding:.4rem .8rem}.hint{font-size:.9rem;margin:.6rem 0;color:#425f6b}.tile-error{position:absolute;bottom:2.7rem;left:.5rem;right:.5rem;background:#fff;padding:.4rem;z-index:4;font-size:.85rem}[hidden]{display:none!important}
  @media(max-width:620px){.stage{height:380px}.popup{position:relative;inset:auto;width:100%;max-height:none;margin-top:.6rem}.frame{position:relative}.stage .popup{display:none}}
  </style><div class="frame"><div class="stage" role="group" aria-label="Nearby bus stops map"><div class="tiles" aria-hidden="true"></div><svg aria-hidden="true"></svg><div class="pins"></div><div class="controls"><button data-in aria-label="Zoom in">+</button><button data-out aria-label="Zoom out">−</button><button data-fit>Fit stops</button></div><p class="tile-error" hidden>Some map tiles could not load. The stop pins and list view are still available.</p><div class="attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a></div></div><section class="popup" aria-label="Selected stop" hidden><button class="close">Close stop card</button><transit-stop-card></transit-stop-card></section></div><p class="hint">Select a numbered stop for its arrivals. Nearby pins are separated for easier tapping; lines point to their actual locations. North is up.</p><span role="status" class="selection-status"></span>`;
  const $=s=>this.shadowRoot.querySelector(s);this.$=$;
  $('[data-in]').onclick=()=>{this.zoom=Math.min(18,(this.zoom??15)+1);this.draw();};
  $('[data-out]').onclick=()=>{this.zoom=Math.max(12,(this.zoom??15)-1);this.draw();};
  $('[data-fit]').onclick=()=>{this.zoom=null;this.draw();};
  $('.close').onclick=()=>this.close();this.shadowRoot.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.selected){event.preventDefault();this.close();}});
 }
 connectedCallback(){this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(this.$('.stage'));this.draw();}
 disconnectedCallback(){this.observer?.disconnect();}
 set data({stops,cards,selectedId}){
  const changed=this.stops.map(s=>[s.id,s.lat,s.lon].join(':')).join(',')!==stops.map(s=>[s.id,s.lat,s.lon].join(':')).join(',');this.stops=stops;this.cards=cards;this.selected=selectedId;
  if(changed){this.zoom=null;this.draw();}else this.renderSelection();
 }
 draw(){
  const focusedId=this.shadowRoot.activeElement?.classList.contains('pin')?this.shadowRoot.activeElement.dataset.id:null;
  const stage=this.$('.stage'),width=stage.clientWidth,height=stage.clientHeight;if(width<50||!this.stops.length)return;
  this.zoom??=fitZoom(this.stops,width,height);
  const points=this.stops.map(s=>projectPoint(s,this.zoom));
  const center={x:(Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2,y:(Math.min(...points.map(p=>p.y))+Math.max(...points.map(p=>p.y)))/2};
  const left=center.x-width/2,top=center.y-height/2,key=[this.zoom,width,height,left,top].join(':');
  if(key!==this.tileKey){
   this.tileKey=key;this.$('.tiles').replaceChildren();this.$('.tile-error').hidden=true;
   for(let x=Math.floor(left/256);x<=Math.floor((left+width)/256);x++)for(let y=Math.floor(top/256);y<=Math.floor((top+height)/256);y++){
    if(x<0||y<0||x>=2**this.zoom||y>=2**this.zoom)continue;
    const img=document.createElement('img');img.alt='';img.width=256;img.height=256;img.style.left=(x*256-left)+'px';img.style.top=(y*256-top)+'px';img.referrerPolicy='strict-origin-when-cross-origin';
    img.onerror=()=>{this.$('.tile-error').hidden=false;};img.src=`https://tile.openstreetmap.org/${this.zoom}/${x}/${y}.png`;this.$('.tiles').append(img);
   }
  }
  this.$('.pins').replaceChildren();this.$('svg').replaceChildren();
  const visible=points.map((p,i)=>({...p,x:p.x-left,y:p.y-top,i})).filter(p=>p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height);
  for(const p of spreadMarkers(visible,width,height)){
   const stop=this.stops[p.i],button=document.createElement('button');button.className='pin';button.textContent=p.i+1;button.dataset.id=stop.id;button.setAttribute('aria-label',`Stop ${p.i+1}: ${stop.name}`);button.style.left=p.displayX+'px';button.style.top=p.displayY+'px';
   button.onclick=()=>{this.selectStop(stop.id);this.dispatchEvent(new CustomEvent('stop-select',{detail:{id:stop.id},bubbles:true,composed:true}));};this.$('.pins').append(button);
   const line=document.createElementNS('http://www.w3.org/2000/svg','line');for(const [k,v]of Object.entries({x1:p.x,y1:p.y,x2:p.displayX,y2:p.displayY,stroke:'#16313d','stroke-width':2}))line.setAttribute(k,v);this.$('svg').append(line);
   const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');for(const [k,v]of Object.entries({cx:p.x,cy:p.y,r:4,fill:'#16313d',stroke:'white'}))circle.setAttribute(k,v);this.$('svg').append(circle);
  }
  this.$('[data-in]').disabled=this.zoom>=18;this.$('[data-out]').disabled=this.zoom<=12;this.renderSelection();
  if(focusedId)[...this.shadowRoot.querySelectorAll('.pin')].find(p=>p.dataset.id===focusedId)?.focus();
 }
 selectStop(id,focus=false){this.selected=id;this.renderSelection();if(focus){const pin=[...this.shadowRoot.querySelectorAll('.pin')].find(p=>p.dataset.id===id);if(pin)pin.focus();else {this.zoom=null;this.draw();[...this.shadowRoot.querySelectorAll('.pin')].find(p=>p.dataset.id===id)?.focus();}}}
 renderSelection(){
  const data=this.cards.get(this.selected);this.$('.popup').hidden=!data;
  for(const p of this.shadowRoot.querySelectorAll('.pin'))p.setAttribute('aria-expanded',String(p.dataset.id===this.selected));
  if(data){this.$('transit-stop-card').data={...data,popup:true};this.$('.selection-status').textContent='Selected '+data.stop.name+'. Its arrival card is open.';}else this.$('.selection-status').textContent='';
 }
 close(){const previous=this.selected;this.selected=null;this.renderSelection();[...this.shadowRoot.querySelectorAll('.pin')].find(p=>p.dataset.id===previous)?.focus();this.dispatchEvent(new CustomEvent('stop-close',{bubbles:true,composed:true}));}
}
customElements.define('transit-stop-map',TransitStopMap);
