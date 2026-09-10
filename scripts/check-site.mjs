import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist/client');
const models=JSON.parse(await readFile('data/belden-models.json','utf8'));
assert.equal(models.length,8);assert.equal(new Set(models.map(m=>m.slug)).size,8);
const expected=['Bungalow','Camp','Greater Ops','Hogancamp','Office','Ramsey','Shifty','Super Bee'];
assert.deepEqual(models.map(m=>m.name).sort(),expected);
assert.equal(models.filter(m=>m.viewing==='onsite').length,7);assert.equal(models.find(m=>m.viewing==='offsite').name,'Camp');
const htmlFiles=(await readdir(root)).filter(f=>f.endsWith('.html')).concat((await readdir(join(root,'homes'))).map(f=>'homes/'+f));
assert.deepEqual((await readdir(join(root,'homes'))).sort(),models.map(m=>m.slug+'.html').sort());
let links=0;const failures=[];
for(const file of htmlFiles){const content=await readFile(join(root,file),'utf8');
 if(/single[\s-]?wide|double[\s-]?wide|phoenix|info@belden|mu cephei|mustang|charger|elite \d|GSX|Sirius|Palmer/i.test(content))failures.push(`${file}: obsolete content`);
 if(!content.includes('Monday–Thursday')||!content.includes('9:00 AM–4:00 PM'))failures.push(`${file}: hours missing`);
 if((content.match(/<h1[ >]/g)||[]).length!==1)failures.push(`${file}: heading structure`);
 for(const match of content.matchAll(/(?:src|href)="([^"]+)"/g)){const target=match[1].replaceAll('&amp;','&');if(/^(https?:|mailto:|tel:|sms:|data:)/.test(target))continue;const url=new URL(target,`http://local/${file}`);const path=decodeURIComponent(url.pathname);const asset=join(root,path==='/'?'index.html':path);try{const info=await stat(asset);assert.ok(info.isFile());if(url.hash&&asset.endsWith('.html')){const source=await readFile(asset,'utf8');assert.ok(source.includes(`id="${url.hash.slice(1)}"`),`missing ${url.hash}`);}links++;}catch(e){failures.push(`${file}: broken target ${target}`);}}
}
assert.ok(!(await readdir(join(root,'assets'))).includes('MODEL PHOTOS'),'raw assets must not be public');
assert.ok(!(await readdir(root)).includes('data'),'source data must not be public');
assert.deepEqual(failures,[]);console.log(`Passed: ${htmlFiles.length} HTML pages, ${links} internal references, 8 exact model routes, hours, terminology, and source-file exclusion.`);
