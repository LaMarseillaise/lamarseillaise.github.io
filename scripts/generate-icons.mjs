// Render original vector artwork with resvg; no dependency is needed by the site.
// node scripts/generate-icons.mjs /path/to/@resvg/resvg-js/index.js
import {writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {Resvg}=await import(pathToFileURL(resolve(process.argv[2])).href);
const root=new URL('../',import.meta.url),icons=new URL('assets/icons/',root);
await mkdir(icons,{recursive:true});
const artwork='<g fill="#fff"><path d="M32 9 43 20 32 29 21 20Z"/><path d="M55 32 44 43 35 32 44 21Z"/><path d="M32 55 21 44 32 35 43 44Z"/><path d="M9 32 20 21 29 32 20 43Z"/></g>';
function svg(color,adaptive=false){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Andur Carr — four facets</title>${adaptive?'<style>@media(prefers-color-scheme:dark){.tile{fill:#11151c}}</style>':''}<rect class="tile" width="64" height="64" rx="13" fill="${color}"/>${artwork}</svg>\n`;}
function ico(images){const header=Buffer.alloc(6+16*images.length);header.writeUInt16LE(1,2);header.writeUInt16LE(images.length,4);let offset=header.length;images.forEach(({size,png},i)=>{const at=6+16*i;header[at]=size;header[at+1]=size;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(png.length,at+8);header.writeUInt32LE(offset,at+12);offset+=png.length;});return Buffer.concat([header,...images.map(i=>i.png)]);}
for(const [variant,color] of Object.entries({blue:'#173e86',black:'#11151c'})){
 const source=svg(color);await writeFile(new URL(`mark-${variant}.svg`,icons),source);const icoImages=[];
 for(const size of [16,32,48,180,192,512]){const png=new Resvg(source,{fitTo:{mode:'width',value:size}}).render().asPng();await writeFile(new URL(`${variant}-${size}.png`,icons),png);if(size<=48)icoImages.push({size,png});}
 await writeFile(new URL(`favicon-${variant}.ico`,icons),ico(icoImages));if(variant==='blue')await writeFile(new URL('favicon.ico',root),ico(icoImages));
}
await writeFile(new URL('favicon.svg',root),svg('#173e86',true));
console.log('Rendered blue and black SVG, 16/32/48/180/192/512 PNG, and ICO variants.');
