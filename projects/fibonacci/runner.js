// No allow-same-origin on the embedding iframe: code cannot read the site's storage or DOM.
window.addEventListener('message', function start(event) {
  if (event.source !== parent || event.data?.type !== 'run') return;
  window.removeEventListener('message',start);
  const {workerSource,language,code,n,token}=event.data;
  const reply=data=>parent.postMessage({...data,token},'*');
  try {
    const url=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'}));
    const worker=new Worker(url);
    worker.onmessage=({data})=>reply(data);
    worker.onerror=event=>reply({type:'error',message:event.message || 'The runtime could not start. Check your connection and retry.'});
    worker.postMessage({language,code,n});
  } catch(error) { reply({type:'error',message:String(error.message)}); }
});
