import {samples} from './samples.mjs';
import {fibonacci,validateN,memoTrace} from './model.mjs';

class FibonacciLab extends HTMLElement {
  connectedCallback() {
    if (this.built) { window.addEventListener('message',this.onMessage); return; }
    this.built=true; this.drafts=new Map(); this.key='javascript:simple';
    const helpId='editor-help-'+crypto.randomUUID();
    this.innerHTML=`<div class="lab-controls"><label>Language<select data-language>${Object.entries(samples).map(([key,s])=>`<option value="${key}">${s.name}${s.runnable?'':' · reference'}</option>`).join('')}</select></label><label data-variant-label>Approach<select data-variant><option value="simple" selected>Simple recursion</option><option value="memo">Memoization</option><option value="iterative">Iteration</option></select></label><label>Term n<input data-n type="number" min="0" max="500" step="1" value="10" inputmode="numeric"></label></div>
    <p data-note class="hint"></p><label class="editor-label">Source code<textarea data-editor spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="${helpId}"></textarea></label>
    <p id="${helpId}" class="hint">Edit a runnable example, then run it. Tab moves to the next control. Edits stay in this tab until you reload. Reference examples are read-only.</p>
    <div class="actions"><button data-run>Run JavaScript</button><button data-stop disabled>Stop</button><button data-reset>Restore sample</button></div>
    <p data-status role="status" aria-live="polite">Ready. F(10) should be 55.</p><div class="result-panel"><h3>Returned value</h3><pre data-result aria-label="Returned value">—</pre><p data-timing class="hint"></p></div>`;
    this.$=selector=>this.querySelector(selector);
    this.$('[data-language]').addEventListener('change',()=>this.select());
    this.$('[data-variant]').addEventListener('change',()=>this.select());
    this.$('[data-run]').addEventListener('click',()=>this.run());
    this.$('[data-stop]').addEventListener('click',()=>this.stop('Stopped. You can edit the code and run again.'));
    this.$('[data-reset]').addEventListener('click',()=>{this.stop(); this.drafts.delete(this.key); this.showSource(); this.$('[data-result]').textContent='—'; this.$('[data-timing]').textContent=''; this.$('[data-status]').textContent='Sample restored.';});
    this.onMessage=event=>this.receive(event); window.addEventListener('message',this.onMessage);
    this.showSource();
  }
  disconnectedCallback() {this.stop();window.removeEventListener('message',this.onMessage);}
  select() {
    this.drafts.set(this.key,this.$('[data-editor]').value); this.stop();
    this.key=this.$('[data-language]').value+':'+this.$('[data-variant]').value;
    this.showSource(); this.$('[data-result]').textContent='—';this.$('[data-timing]').textContent='';
    this.$('[data-status]').textContent=this.sample.runnable?'Ready to run.':'Reference source only; this language does not run here yet.';
  }
  get sample() {return samples[this.$('[data-language]').value];}
  showSource() {
    const sample=this.sample;
    this.$('[data-editor]').value=this.drafts.get(this.key)??sample.variants?.[this.$('[data-variant]').value]??sample.source;
    this.$('[data-editor]').readOnly=!sample.runnable;
    this.$('[data-variant-label]').hidden=!sample.runnable;
    this.$('[data-n]').disabled=!sample.runnable;
    this.$('[data-note]').textContent=sample.note;
    this.$('[data-run]').textContent=sample.runnable?'Run '+sample.name:'Reference only';
    this.$('[data-run]').disabled=!sample.runnable;
    this.$('[data-reset]').disabled=!sample.runnable;
  }
  stop(message) {
    clearTimeout(this.timer);this.frame?.remove();this.frame=null;this.token=null;
    if(this.$) {this.$('[data-stop]').disabled=true;this.$('[data-run]').disabled=!this.sample.runnable;}
    if(message) this.$('[data-status]').textContent=message;
  }
  async run() {
    this.stop();let n;
    try {n=validateN(this.$('[data-n]').value);} catch(error){this.$('[data-status]').textContent=error.message;this.$('[data-n]').focus();return;}
    this.expected=String(fibonacci(n));this.runN=n;
    const token=this.token=crypto.randomUUID();
    this.$('[data-run]').disabled=true;this.$('[data-stop]').disabled=false;
    this.$('[data-result]').textContent='—';this.$('[data-timing]').textContent='';
    this.$('[data-status]').textContent='Loading '+this.sample.name+'… Stop is available while loading.';
    this.timer=setTimeout(()=>this.stop('Runtime loading timed out. Check your connection and retry.'),90000);
    try {
      const response=await fetch(new URL('./worker.mjs',import.meta.url));
      if(!response.ok) throw new Error('Could not load the code runner.');
      const workerSource=await response.text();if(this.token!==token)return;
      const frame=this.frame=document.createElement('iframe');
      frame.setAttribute('sandbox','allow-scripts');frame.hidden=true;frame.title='Isolated code runner';frame.referrerPolicy='no-referrer';
      frame.src=new URL('./runner.html',import.meta.url);
      const language=this.$('[data-language]').value, code=this.$('[data-editor]').value;
      frame.onload=()=>{if(this.token===token)frame.contentWindow.postMessage({type:'run',workerSource,language,code,n,token},'*');};
      this.append(frame);
    } catch(error){if(this.token===token)this.stop(error.message);}
  }
  receive(event) {
    if(!this.frame || event.source!==this.frame.contentWindow || event.data?.token!==this.token)return;
    const data=event.data;
    if(data.type==='ready') {
      clearTimeout(this.timer);this.timer=setTimeout(()=>this.stop('Stopped after 4 seconds of execution. Try a smaller n or memoization.'),4000);
      this.$('[data-status]').textContent='Running F('+this.runN+')…';
    } else if(data.type==='result') {
      const value=String(data.value).slice(0,10000);
      this.$('[data-result]').textContent=value;
      this.$('[data-timing]').textContent=`Runtime preparation: ${(data.loadingMs/1000).toFixed(2)} s. Source evaluation + calculation: ${data.executionMs.toFixed(2)} ms. Each run starts fresh; this is not a language benchmark.`;
      this.stop(value===this.expected?`Matches the independent result for F(${this.runN}). One input checked, not a proof of correctness.`:`Does not match F(${this.runN}). Expected ${this.expected}.`);
    } else if(data.type==='error')this.stop('Could not complete: '+String(data.message).slice(0,2000));
  }
}
customElements.define('fibonacci-lab',FibonacciLab);

class MemoWalkthrough extends HTMLElement {
  connectedCallback(){
    if(this.built)return;this.built=true;
    this.innerHTML=`<div class="lab-controls"><label>Trace term n<input data-n type="number" min="0" max="20" value="6" inputmode="numeric"></label><button data-start>Start over</button><button data-step>Next step</button><button data-finish>Show all steps</button></div><p data-summary></p><ol class="cache" aria-label="Memoization cache"></ol><p data-event role="status" aria-live="polite"></p><details><summary>Read the completed trace</summary><ol data-log></ol></details>`;
    this.$=s=>this.querySelector(s);
    this.$('[data-start]').onclick=()=>this.reset();this.$('[data-n]').onchange=()=>this.reset();
    this.$('[data-step]').onclick=()=>this.step();this.$('[data-finish]').onclick=()=>this.step(true);this.reset();
  }
  reset(){
    let n;try{n=validateN(this.$('[data-n]').value,20);}catch(e){this.$('[data-event]').textContent=e.message;return;}
    const {events,naiveCalls}=memoTrace(n);this.events=events;this.position=0;
    this.$('[data-summary]').textContent=`For F(${n}), simple recursion makes ${naiveCalls} calls. Memoization makes ${events.length}. Both produce ${fibonacci(n)}. Counts include base cases and cache hits.`;
    this.$('.cache').replaceChildren();this.$('[data-log]').replaceChildren();
    for(let k=0;k<=Math.max(1,n);k++){const li=document.createElement('li');li.dataset.k=k;li.textContent=`F(${k}) = ${k<2?k:'?'}`;if(k<2)li.classList.add('filled');this.$('.cache').append(li);}
    this.$('[data-event]').textContent='Start with F(0) = 0 and F(1) = 1 already cached. Follow the recursive calls as they return.';
    this.$('[data-step]').disabled=false;this.$('[data-finish]').disabled=false;
  }
  step(all=false){
    do{
      const event=this.events[this.position++];if(!event)break;
      this.querySelector('.active')?.classList.remove('active');
      const cell=this.$(`[data-k="${event.n}"]`);cell.textContent=`F(${event.n}) = ${event.value}`;cell.classList.add('filled','active');
      const message=event.kind==='hit'?`Reuse F(${event.n}) = ${event.value} from the cache.`:`Add F(${event.n-1}) + F(${event.n-2}); store F(${event.n}) = ${event.value}.`;
      const li=document.createElement('li');li.textContent=message;this.$('[data-log]').append(li);
      this.$('[data-event]').textContent=`Step ${this.position} of ${this.events.length}. ${message}`;
    }while(all&&this.position<this.events.length);
    const done=this.position>=this.events.length;this.$('[data-step]').disabled=done;this.$('[data-finish]').disabled=done;
  }
}
customElements.define('memo-walkthrough',MemoWalkthrough);
