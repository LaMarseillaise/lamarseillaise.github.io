// Runs only inside a disposable worker in an opaque-origin sandbox frame.
self.onmessage = async ({data:{language,code,n}}) => {
  const send = self.postMessage.bind(self);
  const started=performance.now();
  try {
    let evaluate;
    if (language === 'javascript') {
      evaluate = () => new Function('n', '"use strict";\n'+code+'\nreturn String(fib(n));')(n);
    } else if (language === 'python') {
      const {loadPyodide} = await import('https://cdn.jsdelivr.net/pyodide/v314.0.8/full/pyodide.mjs');
      const py = await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v314.0.8/full/', stdout:()=>{}, stderr:()=>{}});
      evaluate = () => py.runPython(code+'\nstr(fib('+n+'))');
    } else if (language === 'ruby') {
      const {DefaultRubyVM} = await import('https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.10.1/dist/browser/+esm');
      const response = await fetch('https://cdn.jsdelivr.net/npm/@ruby/4.0-wasm-wasi@2.10.1/dist/ruby+stdlib.wasm');
      if (!response.ok) throw new Error('Ruby download failed: '+response.status);
      const module = await WebAssembly.compile(await response.arrayBuffer());
      const {vm} = await DefaultRubyVM(module);
      evaluate = () => vm.eval(code+'\nfib('+n+').to_s').toString();
    } else throw new Error('This language is a reference example.');
    const loadingMs=performance.now()-started;
    send({type:'ready',loadingMs});
    const executionStart=performance.now();
    const value=String(await evaluate());
    const executionMs=performance.now()-executionStart;
    if (value.length>10000) throw new Error('Output exceeded 10,000 characters.');
    send({type:'result',value,loadingMs,executionMs});
  } catch (error) { send({type:'error',message:String(error?.message || error).slice(0,2000)}); }
};
