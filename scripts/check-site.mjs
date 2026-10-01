import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=resolve('dist/client');
const models=JSON.parse(await readFile('data/belden-models.json','utf8'));
assert.equal(models.length,8);assert.equal(new Set(models.map(m=>m.slug)).size,8);
const expected=['Bungalow','Camp','Greater Ops','Hogancamp','Office','Ramsey','Shifty','Super Bee'];
assert.deepEqual(models.map(m=>m.name).sort(),expected);
assert.equal(models.filter(m=>m.viewing==='onsite').length,7);assert.equal(models.find(m=>m.viewing==='offsite').name,'Camp');
for(const [slug,number,area] of [['ramsey','28600E',1600],['shifty','28683A',1813]]){
 const model=models.find(m=>m.slug===slug);
 assert.equal(model.modelNumber,number,`${slug}: wrong physical home`);
 assert.equal(model.squareFootage,area,`${slug}: wrong square footage`);
 const page=await readFile(join(root,'homes',slug+'.html'),'utf8');
 assert.ok(page.includes(`<h1>${model.name}</h1>`)&&page.includes(`Model ${number}`));
 assert.ok(page.includes(`contact.html?model=${model.name}#inquiry`));
}
const camp=models.find(m=>m.slug==='camp');
assert.deepEqual(camp.photos.map(p=>p.src.split('/').pop()),['img_5324.webp','img_5321.webp','img_5323.webp','img_5325.webp']);
assert.ok(camp.photos.every(p=>/exterior/i.test(p.alt)&&/offsite/i.test(p.alt)));
assert.equal(models.reduce((count,m)=>count+m.photos.length,0),67);
const manifest=JSON.parse(await readFile('data/model-assets.json','utf8'));
for(const m of models)assert.ok((await stat(manifest[m.slug].floorplan)).isFile(),`${m.name}: missing original floorplan`);
const htmlFiles=(await readdir(root)).filter(f=>f.endsWith('.html')).concat((await readdir(join(root,'homes'))).map(f=>'homes/'+f));
assert.deepEqual((await readdir(join(root,'homes'))).sort(),models.map(m=>m.slug+'.html').sort());
let links=0;const failures=[];
for(const file of htmlFiles){const content=await readFile(join(root,file),'utf8');
 if(/single[\s-]?wide|double[\s-]?wide|phoenix|info@belden|mu cephei|mustang|charger|elite \d|GSX|Sirius|Palmer/i.test(content))failures.push(`${file}: obsolete content`);
 if(!content.includes('Monday–Thursday')||!content.includes('9:00 AM–4:00 PM'))failures.push(`${file}: hours missing`);
 if((content.match(/<h1[ >]/g)||[]).length!==1)failures.push(`${file}: heading structure`);
 for(const match of content.matchAll(/(?:src|href)="([^"]+)"/g)){const target=match[1].replaceAll('&amp;','&');if(/^(https?:|mailto:|tel:|sms:|data:)/.test(target))continue;const url=new URL(target,`http://local/${file}`);const path=decodeURIComponent(url.pathname);const asset=join(root,path==='/'?'index.html':path);try{const info=await stat(asset);assert.ok(info.isFile());if(/\/floorplan(?:-preview)?\.webp$/.test(path)){const version=createHash('sha256').update(await readFile(asset)).digest('hex').slice(0,12);assert.equal(url.searchParams.get('v'),version,'floorplan cache version mismatch');}if(url.hash&&asset.endsWith('.html')){const source=await readFile(asset,'utf8');assert.ok(source.includes(`id="${url.hash.slice(1)}"`),`missing ${url.hash}`);}links++;}catch(e){failures.push(`${file}: invalid target ${target}: ${e.message}`);}}
}
assert.ok(!(await readdir(join(root,'assets'))).includes('MODEL PHOTOS'),'raw assets must not be public');
assert.ok(!(await readdir(root)).includes('data'),'source data must not be public');
assert.deepEqual(failures,[]);console.log(`Passed: ${htmlFiles.length} HTML pages, ${links} internal references, 8 exact model routes, corrected identities, 67 photos, floorplan cache versions, hours, terminology, and source-file exclusion.`);
