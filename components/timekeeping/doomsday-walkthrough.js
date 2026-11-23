import {doomsday,parseDate,weekdays,gregorianLeap,mod} from '../../projects/calendars-and-clocks/model.mjs';
import {styles} from './common.js';
export class DoomsdayWalkthrough extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this.step=0;}
  connectedCallback(){
    if(!this.shadowRoot.hasChildNodes())this.shadowRoot.innerHTML=`<style>${styles}.steps{padding:0;list-style:none;counter-reset:steps}.steps li{counter-increment:steps;border-top:1px solid #536b6c;padding:1.2rem 0 1.2rem 2.5rem;position:relative}.steps li:before{content:counter(steps);position:absolute;left:0;color:#edc780;font:1.6rem Georgia,serif}.steps strong{color:#edc780}.steps li[hidden]{display:none}.answer{margin-top:1.5rem}.controls label{flex:1 1 200px}</style><div class="panel"><form id="form" class="controls"><label>A Gregorian date<input id="date" type="date" min="0001-01-01" max="9999-12-31" value="2026-11-23" required></label><button type="submit">Start walkthrough</button><button id="practice" type="button">Practice a date</button></form><p class="caption">Dates are interpreted as Gregorian, even before local adoption. Your date stays in this browser; it is not stored or sent anywhere.</p><p id="error" class="error" role="status"></p><ol class="steps" id="steps"></ol><div class="controls"><button id="next" type="button">Reveal next step</button><button id="all" type="button">Show all steps</button><button id="reset" type="button">Hide steps</button></div><p id="progress" role="status"></p><output id="answer" class="large answer"></output></div>`;
    this.abort?.abort();this.abort=new AbortController();const o={signal:this.abort.signal},$=id=>this.shadowRoot.getElementById(id);
    $('form').addEventListener('submit',e=>{e.preventDefault();this.start();},o);$('date').addEventListener('input',()=>this.start(),o);
    $('practice').addEventListener('click',()=>{const y=1900+Math.floor(Math.random()*200),m=1+Math.floor(Math.random()*12),d=1+Math.floor(Math.random()*28);$('date').value=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;this.start();},o);
    $('next').addEventListener('click',()=>{this.step=Math.min(6,this.step+1);this.reveal();},o);$('all').addEventListener('click',()=>{this.step=6;this.reveal();},o);$('reset').addEventListener('click',()=>{this.step=0;this.reveal();},o);this.start();
  }
  disconnectedCallback(){this.abort?.abort();}
  start(){const $=id=>this.shadowRoot.getElementById(id);this.step=0;this.valid=false;
    try{const [y,m,d]=parseDate($('date').value),r=doomsday(y,m,d);this.result=r;this.valid=true;$('error').textContent='';
      const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
      const steps=[`Find the century anchor. For ${r.century*100}–${r.century*100+99}, it is <strong>${weekdays[r.anchor]}</strong>. The sequence for centuries starting 1600, 1700, 1800, 1900 is Tuesday, Sunday, Friday, Wednesday; repeat every 400 years.`,
        `Split the final two year digits into twelves: <strong>${r.tail} = 12 × ${r.quotient} + ${r.remainder}</strong>. Keep both quotient and remainder.`,
        `Count whole fours in the remainder: floor(${r.remainder} ÷ 4) = ${r.fours}. Add the three numbers: <strong>${r.quotient} + ${r.remainder} + ${r.fours} = ${r.sum}</strong>.`,
        `Move ${r.sum} weekdays forward from ${weekdays[r.anchor]}, wrapping every seven. The year's doomsday is <strong>${weekdays[r.doom]}</strong>.`,
        `In ${months[m-1]}, use <strong>${months[m-1]} ${r.monthDay}</strong> as the matching doomsday. ${m<=2?`${y} is ${gregorianLeap(y)?'a leap':'a common'} year, which affects the January and February anchors.`:'The month anchor is a fixed date whose distance from the other anchors is a multiple of seven.'}`,
        `The target day is ${d} − ${r.monthDay} = <strong>${r.difference}</strong> days from that anchor. ${r.difference<0?'Count backward':'Count forward'}; equivalently advance ${mod(r.difference,7)} modulo seven from ${weekdays[r.doom]}. The result is <strong>${weekdays[r.weekday]}</strong>.`];
      $('steps').innerHTML=steps.map(s=>`<li hidden>${s}</li>`).join('');
    }catch(error){$('steps').replaceChildren();$('error').textContent=error.message;}this.reveal();
  }
  reveal(){const $=id=>this.shadowRoot.getElementById(id);[...$('steps').children].forEach((li,i)=>li.hidden=i>=this.step);$('next').disabled=!this.valid||this.step===6;$('all').disabled=!this.valid||this.step===6;$('reset').disabled=!this.valid||this.step===0;$('progress').textContent=this.valid?`${this.step} of 6 steps revealed.`:'';$('answer').textContent=this.valid&&this.step===6?weekdays[this.result.weekday]:'';}
}
customElements.define('doomsday-walkthrough',DoomsdayWalkthrough);
