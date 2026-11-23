import {hexadecimal,fromInstant,seasonalLabel,parseInstant,zoneDisplay,mod,DAY} from '../../projects/calendars-and-clocks/model.mjs';
import {styles,utcInput,utcLabel} from './common.js';
export class ClockComparison extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this.live=true;this.instant=Date.now();}
  connectedCallback(){
    if(!this.shadowRoot.hasChildNodes()) this.shadowRoot.innerHTML=`<style>${styles}
    .hex{font:clamp(3rem,10vw,6rem)/1.2 ui-monospace,monospace;letter-spacing:.08em;color:#edc780}.hero-clock{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:2rem;margin:1.5rem 0}.track{height:8px;background:#344c4c;margin-top:1rem}.track span{display:block;background:#edc780;height:100%}.hex-key{display:flex;justify-content:space-between;font-size:.8rem;color:#b9cbc9}.state{color:#8bd8cc}@media(max-width:600px){.hero-clock{grid-template-columns:1fr;gap:.5rem}}
    </style><div class="panel"><div class="controls"><label>Conventional timezone<select id="zone"><option value="America/Los_Angeles">Los Angeles / Eugene</option><option value="UTC">UTC</option><option value="Europe/London">London</option><option value="Asia/Kolkata">Kolkata</option><option value="Asia/Tokyo">Tokyo</option><option value="Pacific/Auckland">Auckland</option></select></label><button id="toggle" type="button">Pause clock</button></div>
    <div class="hero-clock"><div><small>One global hexadecimal clock</small><output aria-live="off" id="hex" class="hex" aria-label="Hexadecimal time"></output><div class="track" aria-hidden="true"><span id="progress"></span></div><div class="hex-key" aria-hidden="true"><span>0000</span><span>8000</span><span>FFFF</span></div></div><div><small>Andur’s seasonal calendar</small><output aria-live="off" id="season" class="large"></output><p class="caption">Neither this date nor the hexadecimal clock changes with the timezone selector.</p></div></div>
    <div class="grid"><div class="readout"><small>24-hour civil clock</small><output aria-live="off" id="civil24"></output></div><div class="readout"><small>12-hour civil clock</small><output aria-live="off" id="civil12"></output></div><div class="readout"><small>Decimal division of the local civil day</small><output aria-live="off" id="decimal"></output></div><div class="readout"><small>The same instant in UTC</small><output aria-live="off" id="utc"></output></div></div>
    <p id="state" class="state" role="status">Live · your device’s clock</p><form id="freeze" class="controls"><label>Inspect an instant (UTC)<input id="instant" type="datetime-local" step="1" min="0002-01-01T00:00" max="9998-12-31T23:59:59" required></label><button type="submit">Inspect instant</button></form><p id="error" class="error" role="status"></p><p class="caption">Live readouts are not announced every second. Pause to read them at your own pace. Decimal time here divides the selected civil clock’s 24-hour labels into 100,000 parts; it repeats or skips along with those labels at DST changes.</p></div>`;
    this.abort?.abort();this.abort=new AbortController();const options={signal:this.abort.signal};const $=id=>this.shadowRoot.getElementById(id);
    $('zone').addEventListener('change',()=>this.update(),options);
    $('toggle').addEventListener('click',()=>{this.live=!this.live;if(!this.live)$('instant').value=utcInput(this.instant);this.update();},options);
    $('freeze').addEventListener('submit',event=>{event.preventDefault();try{const ms=parseInstant($('instant').value);fromInstant(ms);this.instant=ms;this.live=false;$('error').textContent='';this.update();}catch(error){$('error').textContent=error.message;}},options);
    if(!$('instant').value)$('instant').value=utcInput(this.instant);
    this.update();clearInterval(this.timer);this.timer=setInterval(()=>{if(this.live)this.update();},500);
  }
  disconnectedCallback(){clearInterval(this.timer);this.abort?.abort();}
  update(){
    const $=id=>this.shadowRoot.getElementById(id);if(this.live)this.instant=Date.now();const ms=this.instant,zone=$('zone').value;
    $('hex').textContent=hexadecimal(ms);$('season').textContent=seasonalLabel(fromInstant(ms));$('progress').style.width=`${mod(ms+DAY/2,DAY)/DAY*100}%`;
    $('civil24').textContent=zoneDisplay(ms,zone);$('civil12').textContent=zoneDisplay(ms,zone,true);$('utc').textContent=utcLabel(ms);
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(ms).filter(p=>p.type!=='literal').map(p=>[p.type,+p.value]));
    const decimal=Math.floor((parts.hour*3600+parts.minute*60+parts.second)/86400*100000).toString().padStart(5,'0');
    $('decimal').textContent=`${decimal[0]}:${decimal.slice(1,3)}:${decimal.slice(3)}`;
    $('toggle').textContent=this.live?'Pause clock':'Resume live';const state=this.live?'Live · your device’s clock':'Paused · all readouts share one instant';if($('state').textContent!==state)$('state').textContent=state;
  }
}
customElements.define('clock-comparison',ClockComparison);
