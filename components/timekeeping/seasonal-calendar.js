import {DAY,EPOCH,fromInstant,yearStart,seasonalLeap,seasonalLabel,seasonNames} from '../../projects/calendars-and-clocks/model.mjs';
import {styles,utcLabel} from './common.js';
export class SeasonalCalendar extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this.year=fromInstant(Date.now()).year;this.ordinal=fromInstant(Date.now()).ordinal;}
  connectedCallback(){
    if(!this.shadowRoot.hasChildNodes())this.shadowRoot.innerHTML=`<style>${styles}.seasons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.5rem 0}.weeks{display:grid;grid-template-columns:repeat(13,1fr);gap:3px}.week{height:28px;background:#335458;border-radius:2px}.week.current{background:#edc780}.season{border:1px solid #536b6c;padding:1rem;border-radius:5px}.season h3{margin:0 0 .8rem}.extra{border:1px dashed #8da59d;border-radius:5px;padding:.5rem .8rem;margin-top:1rem}.extra.current{border-color:#edc780;color:#edc780}.regular-only{font-size:.85rem;color:#b9cbc9}.presets{margin:1rem 0}@media(max-width:650px){.seasons{grid-template-columns:1fr}}
    </style><div class="panel"><div class="controls"><label>Seasonal year<input id="year" type="number" min="10001" max="19999" step="1"></label><button id="show" type="button">Show year</button><button id="today" type="button">Today</button></div><p id="error" class="error" role="status"></p><div class="seasons" id="seasons"></div><label for="day">Day through the year <output id="day-count"></output><input id="day" type="range" min="0" step="1" value="0"></label><div class="controls presets"><button id="previous" type="button">Previous day</button><button id="next" type="button">Next day</button><button id="leap" type="button">Leap Day</button><button id="year-day" type="button">Year Day</button></div><output class="large" id="date" aria-live="polite"></output><p id="bounds"></p><p id="explain" class="caption"></p><p class="caption">Each block is one complete seven-day week. The highlighted block contains the selected day. Extra days have no season, week or weekday.</p></div>`;
    this.abort?.abort();this.abort=new AbortController();const o={signal:this.abort.signal},$=id=>this.shadowRoot.getElementById(id);
    $('year').value=this.year;
    $('show').addEventListener('click',()=>{const y=Number($('year').value);if(!Number.isInteger(y)||y<10001||y>19999){$('error').textContent='Choose a whole seasonal year from 10001 to 19999.';return;}this.year=y;this.ordinal=0;$('error').textContent='';this.update();},o);
    $('today').addEventListener('click',()=>{const d=fromInstant(Date.now());this.year=d.year;this.ordinal=d.ordinal;$('year').value=this.year;$('error').textContent='';this.update();},o);
    $('day').addEventListener('input',()=>{this.ordinal=+$('day').value;this.update();},o);
    for(const [id,delta] of [['previous',-1],['next',1]])$(id).addEventListener('click',()=>{this.ordinal+=delta;this.update();},o);
    $('leap').addEventListener('click',()=>{this.ordinal=182;this.update();},o);$('year-day').addEventListener('click',()=>{this.ordinal=364+Number(seasonalLeap(this.year));this.update();},o);this.update();
  }
  disconnectedCallback(){this.abort?.abort();}
  update(){
    const $=id=>this.shadowRoot.getElementById(id),leap=seasonalLeap(this.year),length=365+Number(leap),ms=EPOCH+(yearStart(this.year)+this.ordinal)*DAY,d=fromInstant(ms);
    $('day').max=length-1;$('day').value=this.ordinal;$('day-count').textContent=`${this.ordinal+1} of ${length}`;$('date').textContent=seasonalLabel(d);$('bounds').textContent=`Begins ${utcLabel(ms)} · ends ${utcLabel(ms+DAY)} (exclusive).`;
    $('previous').disabled=this.ordinal===0;$('next').disabled=this.ordinal===length-1;$('leap').disabled=!leap;
    $('explain').textContent=d.kind==='regular'?'Day numbers 1–7 belong to this calendar, not Gregorian weekday names.':d.kind==='leap-day'?'Between Seasons II and III. The next day is Season III, week 1, day 1.':'After Season IV. The next day begins the next year, Season I, week 1, day 1.';
    $('seasons').innerHTML=seasonNames.map((name,i)=>`<div class="season"><h3>Season ${name} <span class="regular-only">· 91 days</span></h3><div class="weeks" aria-label="Thirteen weeks">${Array.from({length:13},(_,w)=>`<span class="week ${d.season===i+1&&d.week===w+1?'current':''}" title="Week ${w+1}"></span>`).join('')}</div>${i===1&&leap?`<div class="extra ${d.kind==='leap-day'?'current':''}">Then: Leap Day</div>`:''}${i===3?`<div class="extra ${d.kind==='year-day'?'current':''}">Then: Year Day</div>`:''}</div>`).join('');
  }
}
customElements.define('seasonal-calendar',SeasonalCalendar);
