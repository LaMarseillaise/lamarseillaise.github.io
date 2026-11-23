export const styles = `
:host{display:block;color:var(--ink,#f2f3ef);font:1rem/1.6 system-ui,sans-serif}*{box-sizing:border-box}
button,input,select{font:inherit;color:inherit}button,select,input{border:1px solid #6a807e;border-radius:5px;background:#152c30;min-height:44px;padding:.5rem .75rem;max-width:100%}
select{appearance:none;padding-right:2.2rem;background-image:linear-gradient(45deg,transparent 50%,#b9cbc9 50%),linear-gradient(135deg,#b9cbc9 50%,transparent 50%);background-position:calc(100% - 17px) 50%,calc(100% - 12px) 50%;background-size:5px 5px;background-repeat:no-repeat}button{cursor:pointer}button:hover{background:#29494c}button:disabled{opacity:.45;cursor:default}button[aria-pressed=true]{border-color:#edc780;background:#34443c}
:focus-visible{outline:3px solid #edc780;outline-offset:3px}label{display:grid;gap:.35rem}input[type=range]{padding:0;width:100%;accent-color:#edc780}
.controls{display:flex;align-items:end;flex-wrap:wrap;gap:1rem}.controls label{flex:1 1 180px}.controls button{flex:0 0 auto}
.muted,.caption{color:#b9cbc9}.caption{font-size:.9rem}.error{color:#ffcfb7;min-height:1.6em}h3{font:1.5rem/1.3 Georgia,serif;margin:0 0 1rem}p{margin:.75rem 0}
output{display:block;font-variant-numeric:tabular-nums}.large{font:clamp(1.5rem,4vw,2.4rem)/1.3 Georgia,serif;color:#edc780;overflow-wrap:anywhere}
.panel{padding:clamp(1rem,3vw,2rem);border:1px solid #536b6c;border-radius:8px;background:#10272b}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.readout{border-top:1px solid #536b6c;padding-top:1rem;min-width:0}.readout small{display:block;color:#b9cbc9;margin-bottom:.4rem}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:600px){.grid{grid-template-columns:1fr}.controls{align-items:stretch}.controls button{flex:1 1 auto}}
`;
export const utcInput = ms => new Date(ms).toISOString().slice(0,19);
export const utcLabel = ms => new Date(ms).toISOString().replace('T',' ').replace(/\.\d{3}Z$/, ' UTC');
