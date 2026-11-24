import {position, subshells, shells, findElement, halfLife, initialIsotope} from './model.mjs';

const families = {'Nonmetal':'#459879','Noble gas':'#7e77b4','Alkali metal':'#c58153','Alkaline earth metal':'#b2a043','Metalloid':'#659e95','Halogen':'#598cae','Transition metal':'#6289ab','Post-transition metal':'#7d939e','Lanthanide':'#b67695','Actinide':'#ae7d63'};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const configHTML = config => escape(config).replace(/(\d[spdf])(\d+)/g, '$1<sup>$2</sup>').replace(/\](?=\d)/g, '] ');

class ElectronShells extends HTMLElement {
  show(element, elements) {
    const counts = shells(element, elements);
    const step = 110 / counts.length;
    let drawing = `<circle cx="160" cy="140" r="19" fill="#e3efe8"/><text x="160" y="146">${element.symbol}</text>`;
    counts.forEach((count,i) => {
      const radius = 24 + step*(i+1);
      drawing += `<circle class="ring" cx="160" cy="140" r="${radius}"/>`;
      for(let j=0;j<count;j++) {
        const angle = 2*Math.PI*j/count - Math.PI/2 + i*.15;
        drawing += `<circle class="electron" cx="${160+radius*Math.cos(angle)}" cy="${140+radius*Math.sin(angle)}" r="3.1"/>`;
      }
    });
    this.innerHTML = `<svg viewBox="0 0 320 280" role="img" aria-label="${element.name}: ${counts.join(', ')} electrons in successive principal shells. Counting diagram, not electron paths.">${drawing}</svg><div class="shell-summary">${counts.map((count,i)=>`<span>n=${i+1}: <strong>${count}</strong></span>`).join('')}</div>`;
  }
}
customElements.define('electron-shells', ElectronShells);

class PeriodicExplorer extends HTMLElement {
  async connectedCallback() {
    try {
      const response = await fetch(new URL('./data.json', import.meta.url));
      if (!response.ok) throw new Error('Data could not be loaded');
      this.data = await response.json();
      this.elements = this.data.elements;
      this.render();
    } catch (error) {
      this.innerHTML = '<p class="page-width" role="alert">The element data could not be loaded. Please reload to try again. The source links below remain available.</p>';
      console.error(error);
    }
  }
  render() {
    this.innerHTML = `<section class="table-section" id="table-controls" aria-label="Periodic table">
      <div class="table-toolbar"><form role="search"><label for="element-search">Find an element</label><input id="element-search" type="search" placeholder="Name, symbol, or number" autocomplete="off" maxlength="40"><button class="plain-button" type="submit">Find</button></form><label class="tile-size"><input id="larger-tiles" type="checkbox">Larger tiles (scroll if needed)</label><p class="table-status" role="status" id="search-status"></p></div>
      <div class="table-scroll" tabindex="0" role="region" aria-label="Periodic table; scroll horizontally on small screens"><div class="element-grid">
        ${this.elements.map(e=>{
          const narrow=position(e.z), wide=position(e.z,true);
          return `<button type="button" class="element" data-z="${e.z}" style="--col:${narrow.col};--row:${narrow.row};--wide-col:${wide.col};--wide-row:${wide.row};--family:${families[e.category]}" title="${e.name} · ${e.z}" aria-label="${e.z}, ${e.name}, ${e.symbol}, ${e.category}" aria-pressed="false" tabindex="-1"><span class="number">${e.z}</span><strong>${e.symbol}</strong><span class="element-name">${e.name}</span></button>`;
        }).join('')}
        <span class="series-marker" style="grid-row:6" aria-hidden="true">57–71</span><span class="series-marker" style="grid-row:7" aria-hidden="true">89–103</span><span class="series-label" style="grid-row:9" aria-label="Lanthanides, elements 57 to 71"><span class="series-name">Lanthanides</span><br>57–71</span><span class="series-label" style="grid-row:10" aria-label="Actinides, elements 89 to 103"><span class="series-name">Actinides</span><br>89–103</span>
      </div></div>
      <div class="table-caption"><p><span class="wide-caption">Continuous 32-column view.</span><span class="compact-caption">18-column view with inset series.</span> Use arrow keys to explore; Enter to select.</p><a href="#element-detail">Selected element details</a></div>
      <details class="legend-wrap"><summary>Element categories</summary><div class="legend" aria-label="Element categories">${Object.entries(families).map(([name,color])=>`<span style="--family:${color}"><i aria-hidden="true"></i>${name}</span>`).join('')}</div></details>
      </section><section class="detail page-width" id="element-detail" aria-labelledby="element-title"></section>`;
    this.querySelector('#larger-tiles').addEventListener('change',event=>this.toggleAttribute('data-roomy',event.target.checked));
    this.querySelector('form').addEventListener('submit', event=>{
      event.preventDefault();
      const element = findElement(this.querySelector('input').value,this.elements);
      if (!element) { this.querySelector('#search-status').textContent='No match. Try a name, symbol, or atomic number from 1 to 118.'; return; }
      this.select(element.z, true);
      this.querySelector('#search-status').textContent=`Selected ${element.name}, element ${element.z}.`;
    });
    this.querySelector('.element-grid').addEventListener('click',event=>{
      const button=event.target.closest('[data-z]');
      if(button) this.select(Number(button.dataset.z),true);
    });
    this.querySelector('.element-grid').addEventListener('keydown',event=>{
      const button=event.target.closest('[data-z]');
      if (!button || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const z=Number(button.dataset.z), wide=matchMedia('(min-width:1200px)').matches, current=position(z,wide);
      let next=z;
      if(event.key==='ArrowLeft') next=Math.max(1,z-1);
      if(event.key==='ArrowRight') next=Math.min(118,z+1);
      if(event.key==='Home') next=1;
      if(event.key==='End') next=118;
      if(event.key==='ArrowUp'||event.key==='ArrowDown') {
        const direction=event.key==='ArrowUp'?-1:1;
        const candidates=this.elements.map(e=>({z:e.z,...position(e.z,wide)})).filter(p=>(p.row-current.row)*direction>0);
        candidates.sort((a,b)=>Math.abs(a.row-current.row)-Math.abs(b.row-current.row)||Math.abs(a.col-current.col)-Math.abs(b.col-current.col));
        next=candidates[0]?.z??z;
      }
      this.querySelectorAll('[data-z]').forEach(b=>b.tabIndex=Number(b.dataset.z)===next?0:-1);
      this.querySelector(`[data-z="${next}"]`).focus();
    });
    const parameter=new URL(location.href).searchParams.get('element');
    this.select(findElement(parameter||'C',this.elements)?.z||6,false);
  }
  select(z, reveal) {
    const element=this.elements[z-1];
    this.selected=element;
    this.querySelectorAll('[data-z]').forEach(button=>{
      button.setAttribute('aria-pressed',String(Number(button.dataset.z)===z));
      button.tabIndex=Number(button.dataset.z)===z?0:-1;
    });
    const detail=this.querySelector('.detail');
    detail.innerHTML=`<div class="detail-heading"><div class="symbol-card"><span>${z}</span><strong>${element.symbol}</strong></div><div><p class="eyebrow">${element.category}</p><h2 id="element-title" tabindex="-1">${element.name}</h2><p>${z} protons · ${z} electrons when neutral · ${escape(element.state)}</p><a class="small" href="#table-controls">Back to the table</a></div></div>
      <div class="detail-columns"><article class="panel"><h3>Electron structure</h3><p class="small">Neutral atom · ground-state configuration</p><p class="configuration">${configHTML(element.configuration)}</p>
        ${element.configurationSource?'<p class="small">Lawrencium follows <a href="https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=frames&amp;element=103">NIST’s 7p configuration</a>, rather than the older 6d assignment in the PubChem download.</p>':''}
        <electron-shells></electron-shells><p class="small">Shell populations, not orbital paths. Spacing is schematic.</p>
        <details><summary>Expand the subshells</summary><p class="small">Electrons / capacity, grouped by principal shell; this is not an energy-order diagram.</p><div class="subshells">${subshells(element,this.elements).map(s=>`<span class="subshell"><strong>${s.n}${s.l}</strong><em>${s.count} / ${{s:2,p:6,d:10,f:14}[s.l]}</em></span>`).join('')}</div></details>
        <p class="small"><a href="https://pubchem.ncbi.nlm.nih.gov/element/${z}">Element reference at PubChem</a></p>
      </article><article class="panel"><h3>Isotopes & nuclei</h3><p class="small">Naturally abundant isotopes in the snapshot, plus selected radioactive examples. All are ground states.</p><div class="isotope-list" role="group" aria-label="Choose an isotope">${element.isotopes.map(i=>`<button class="isotope-chip" type="button" data-a="${i.a}" aria-pressed="false">${element.symbol}-${i.a}</button>`).join('')}</div><div class="isotope-detail" aria-live="polite" aria-atomic="true"></div></article></div>`;
    detail.querySelector('electron-shells').show(element,this.elements);
    detail.querySelector('.isotope-list').addEventListener('click',event=>{
      const button=event.target.closest('[data-a]');
      if(button) this.selectIsotope(element.isotopes.find(i=>i.a===Number(button.dataset.a)));
    });
    this.selectIsotope(initialIsotope(element));
    if(reveal) {
      const url=new URL(location.href);url.searchParams.set('element',element.symbol);history.replaceState(null,'',url);
      const button=this.querySelector(`[data-z="${z}"]`), scroller=this.querySelector('.table-scroll');
      scroller.scrollLeft=button.offsetLeft-scroller.offsetLeft-scroller.clientWidth/2+button.offsetWidth/2;
      if(matchMedia('(max-width:700px)').matches) { detail.querySelector('h2').focus({preventScroll:true});detail.scrollIntoView({behavior:'instant',block:'start'}); }
    }
  }
  selectIsotope(isotope) {
    this.querySelectorAll('[data-a]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.a)===isotope.a)));
    const abundance=isotope.abundance===null?'Not supplied':`${isotope.abundance}%${isotope.unc_a?` ± ${isotope.unc_a} percentage points`:''}`;
    const energy=isotope.binding===null?'Not supplied':`${(Number(isotope.binding)/1000).toFixed(4)} MeV / nucleon`;
    this.querySelector('.isotope-detail').innerHTML=`<div class="nuclide-title"><strong><sup>${isotope.a}</sup>${this.selected.symbol}</strong><span>${this.selected.z} p + ${isotope.n} n</span></div>
      <dl class="measurements"><div><dt>Mass number</dt><dd>${isotope.a} nucleons</dd></div><div><dt>Natural abundance</dt><dd>${escape(abundance)}</dd></div><div><dt>Half-life</dt><dd>${escape(halfLife(isotope))}</dd></div><div><dt>Binding energy / A</dt><dd>${escape(energy)}</dd></div></dl>
      ${isotope.abundance===null?'<p class="small">This example has no abundance value in the snapshot. That is not evidence of zero natural occurrence.</p>':`<div class="abundance-bar" aria-hidden="true"><span style="--abundance:${Number(isotope.abundance)}%"></span></div>`}
      ${isotope.me_systematics==='Y'?'<p class="small">The source flags the mass as estimated from systematics; the binding value should be read accordingly.</p>':''}
      <p class="small">IAEA snapshot · Nuclear binding, not electron binding.<br>Half-life uncertainty notation and source dates are explained below.</p>`;
  }
}
customElements.define('periodic-explorer',PeriodicExplorer);
