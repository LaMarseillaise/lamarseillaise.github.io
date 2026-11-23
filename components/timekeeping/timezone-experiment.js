import {dstExamples,zoneDisplay,hexadecimal} from '../../projects/calendars-and-clocks/model.mjs';
import {styles,utcLabel} from './common.js';
export class TimezoneExperiment extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});}
  connectedCallback(){
    if(!this.shadowRoot.hasChildNodes())this.shadowRoot.innerHTML=`<style>${styles}.moment{margin-block:1.5rem}.utc{font:1rem ui-monospace,monospace}</style><div class="panel"><label>Los Angeles / Eugene transition<select id="case"><option value="spring">Spring 2026 · missing hour</option><option value="autumn">Autumn 2026 · repeated hour</option></select></label><div class="moment"><small>Local civil time</small><output class="large" id="local"></output><output class="utc" id="utc"></output><p>Global hexadecimal time: <output style="display:inline" id="hex"></output></p></div><label for="elapsed">Minutes elapsed in this example <output id="minutes"></output><input id="elapsed" type="range" min="0" max="120" step="1" value="29"></label><div class="controls"><button id="back" type="button">Previous minute</button><button id="next" type="button">Next minute</button></div><p id="result" role="status"></p><p class="caption">A fixed historical example, using your browser’s timezone data. UTC and the hexadecimal clock continue forward. Governments can change future timezone rules.</p></div>`;
    this.abort?.abort();this.abort=new AbortController();const o={signal:this.abort.signal},$=id=>this.shadowRoot.getElementById(id);
    $('case').addEventListener('change',()=>{$('elapsed').value=29;this.update();},o);$('elapsed').addEventListener('input',()=>this.update(),o);
    for(const [id,delta] of [['back',-1],['next',1]])$(id).addEventListener('click',()=>{$('elapsed').value=Number($('elapsed').value)+delta;this.update();},o);this.update();
  }
  disconnectedCallback(){this.abort?.abort();}
  update(){const $=id=>this.shadowRoot.getElementById(id),v=Number($('elapsed').value),spring=$('case').value==='spring',ms=dstExamples[$('case').value].start+v*60000;
    $('local').textContent=zoneDisplay(ms,'America/Los_Angeles');$('utc').textContent=utcLabel(ms);$('hex').textContent=hexadecimal(ms);$('minutes').textContent=String(v);$('back').disabled=v===0;$('next').disabled=v===120;
    $('result').textContent=v<30?'Move past minute 29 to cross the transition.':spring?'01:59 was followed by 03:00. The 02:00–02:59 local labels never occurred.':'01:59 was followed by 01:00. The 01:00–01:59 local labels occur twice, with different UTC offsets.';
  }
}
customElements.define('timezone-experiment',TimezoneExperiment);
