export function validateN(value, max=500) {
  if (!/^\d+$/.test(String(value))) throw new Error('Enter a whole number from 0 to ' + max + '.');
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n > max) throw new Error('Enter a whole number from 0 to ' + max + '.');
  return n;
}
// Independent iterative oracle; never executes the visitor's source.
export function fibonacci(n) {
  validateN(n);
  let a=0n, b=1n;
  for (let i=0; i<n; i++) [a,b]=[b,a+b];
  return a;
}
export function memoTrace(n) {
  validateN(n,20);
  const cache = new Map([[0,0n],[1,1n]]), events=[];
  function visit(k) {
    if (cache.has(k)) { events.push({kind:'hit',n:k,value:String(cache.get(k))}); return cache.get(k); }
    const value=visit(k-1)+visit(k-2);
    cache.set(k,value); events.push({kind:'store',n:k,value:String(value)}); return value;
  }
  visit(n);
  return {events, naiveCalls:2n*fibonacci(n+1)-1n};
}
