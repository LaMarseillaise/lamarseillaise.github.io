const template = document.createElement('template');
template.innerHTML = `
<style>
:host{display:block;min-width:0}
.track{display:flex;gap:1.4rem;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:4px;padding:4px 4px 1.25rem;scrollbar-color:var(--accent,#14657b) transparent;overscroll-behavior-inline:contain}
::slotted(*){flex:0 0 calc((100% - 2.8rem)/3);height:auto;min-width:0;scroll-snap-align:start}
.controls{display:flex;align-items:center;justify-content:flex-end;gap:.7rem;padding:.5rem 0}
button{min-height:44px;padding:.5rem 1rem;border:1px solid var(--rule,#bfd6df);border-radius:6px;background:white;color:var(--ink,#16313d);font:600 1rem/1.4 system-ui;cursor:pointer}
button:disabled{opacity:.45;cursor:default}
button:focus-visible,.track:focus-visible{outline:3px solid var(--accent,#14657b);outline-offset:3px}
.status{margin-right:auto;font:400 .875rem/1.5 system-ui;color:var(--muted,#425f6b)}
@media(max-width:900px){::slotted(*){flex-basis:calc((100% - 1.4rem)/2)}}
@media(max-width:580px){::slotted(*){flex-basis:88%}.controls{flex-wrap:wrap}}
@media print{.track{display:block;overflow:visible}.controls{display:none}::slotted(*){break-inside:avoid;margin-bottom:1rem}}
</style><div class="track" tabindex="0" role="group" aria-label="Project cards; use Left and Right arrow keys to browse"><slot></slot></div><div class="controls"><span class="status" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="previous" aria-label="Previous projects">Previous</button><button type="button" class="next" aria-label="Next projects">Next</button></div>`;

/** Owns scrolling only; children own their content. No autoplay or focus stealing. */
export class ProjectCarousel extends HTMLElement {
  constructor() {
    super();this.attachShadow({mode:'open'}).append(template.content.cloneNode(true));
    this.track=this.shadowRoot.querySelector('.track');
    this.slotElement=this.shadowRoot.querySelector('slot');
    this.previous=this.shadowRoot.querySelector('.previous');
    this.next=this.shadowRoot.querySelector('.next');
    this.status=this.shadowRoot.querySelector('.status');
  }
  connectedCallback() {
    this.setAttribute('role','region');this.setAttribute('aria-roledescription','carousel');
    if(!this.hasAttribute('aria-label'))this.setAttribute('aria-label','Projects');
    this.controller=new AbortController();const options={signal:this.controller.signal};
    this.previous.addEventListener('click',()=>this.move(-1),options);
    this.next.addEventListener('click',()=>this.move(1),options);
    this.track.addEventListener('scroll',()=>{cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(()=>this.update());},{...options,passive:true});
    this.track.addEventListener('keydown',event=>{
      // Keep normal link and child-control keyboard behavior.
      if(event.composedPath()[0]!==this.track)return;
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
        event.preventDefault();
        if(event.key==='Home'||event.key==='End')this.go(event.key==='Home'?0:this.cards.length-1);
        else this.move(event.key==='ArrowRight'?1:-1);
      }
    },options);
    this.slotElement.addEventListener('slotchange',()=>this.update(),options);
    this.resizeObserver=new ResizeObserver(()=>this.update());this.resizeObserver.observe(this.track);
    this.update();
  }
  disconnectedCallback(){this.controller?.abort();this.resizeObserver?.disconnect();cancelAnimationFrame(this.frame);}
  get cards(){return this.slotElement.assignedElements();}
  get current(){const left=this.track.getBoundingClientRect().left;return this.cards.reduce((best,card,i,cards)=>Math.abs(card.getBoundingClientRect().left-left)<Math.abs(cards[best].getBoundingClientRect().left-left)?i:best,0);}
  go(index){
    const card=this.cards[Math.max(0,Math.min(index,this.cards.length-1))];if(!card)return;
    const left=this.track.scrollLeft+card.getBoundingClientRect().left-this.track.getBoundingClientRect().left-4;
    this.track.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  move(direction){this.go(this.current+direction);}
  update(){
    const cards=this.cards,rect=this.track.getBoundingClientRect();
    const visible=cards.map((card,i)=>({i,rect:card.getBoundingClientRect()})).filter(item=>item.rect.right>rect.left+8&&item.rect.left<rect.right-8);
    const text=visible.length?`Projects ${visible[0].i+1}–${visible.at(-1).i+1} of ${cards.length}`:'No projects';
    if(this.status.textContent!==text)this.status.textContent=text;
    this.previous.disabled=this.track.scrollLeft<=2;
    this.next.disabled=this.track.scrollLeft+this.track.clientWidth>=this.track.scrollWidth-2;
  }
}
if(!customElements.get('project-carousel'))customElements.define('project-carousel',ProjectCarousel);
