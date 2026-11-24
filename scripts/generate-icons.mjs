// Render original vector artwork with resvg; no dependency is needed by the site.
// node scripts/generate-icons.mjs /path/to/@resvg/resvg-js/index.js
import {writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {Resvg}=await import(pathToFileURL(resolve(process.argv[2])).href);
const root=new URL('../',import.meta.url),icons=new URL('assets/icons/',root);
await mkdir(icons,{recursive:true});
// A rises above an open, chamfered C. Broad strokes keep the initials legible at 16px.
const artwork='<g fill="#fff"><path fill-rule="evenodd" d="M16 13h8l9 36h-7l-2-9h-9l-2 9H6Zm1 20h5l-2.5-11Z"/><path d="M58 19H43l-8 8v14l8 8h15v-7H46l-4-4v-8l4-4h12Z"/></g>';
function svg(color,adaptive=false){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Andur Carr — AC monogram</title>${adaptive?'<style>@media(prefers-color-scheme:dark){.tile{fill:#11151c}}</style>':''}<rect class="tile" width="64" height="64" rx="13" fill="${color}"/>${artwork}</svg>\n`;}
function ico(images){const header=Buffer.alloc(6+16*images.length);header.writeUInt16LE(1,2);header.writeUInt16LE(images.length,4);let offset=header.length;images.forEach(({size,png},i)=>{const at=6+16*i;header[at]=size;header[at+1]=size;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(png.length,at+8);header.writeUInt32LE(offset,at+12);offset+=png.length;});return Buffer.concat([header,...images.map(i=>i.png)]);}
for(const [variant,color] of Object.entries({blue:'#173e86',black:'#11151c'})){
 const source=svg(color);await writeFile(new URL(`mark-${variant}.svg`,icons),source);const icoImages=[];
 for(const size of [16,32,48,180,192,512]){const png=new Resvg(source,{fitTo:{mode:'width',value:size}}).render().asPng();await writeFile(new URL(`${variant}-${size}.png`,icons),png);if(size<=48)icoImages.push({size,png});}
 await writeFile(new URL(`favicon-${variant}.ico`,icons),ico(icoImages));if(variant==='blue')await writeFile(new URL('favicon.ico',root),ico(icoImages));
}
await writeFile(new URL('favicon.svg',root),svg('#173e86',true));
console.log('Rendered blue and black SVG, 16/32/48/180/192/512 PNG, and ICO variants.');
