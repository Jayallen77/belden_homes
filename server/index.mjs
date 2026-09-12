import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve,extname,sep} from 'node:path';
import nodemailer from 'nodemailer';
import {createInquiryHandler} from './inquiry.mjs';
import {resolveSmtpConfiguration,assertProductionConfiguration} from './smtp.mjs';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir=resolve(root,'dist/client');
const port=Number(process.env.PORT||3000);
const origin=process.env.PUBLIC_ORIGIN||`http://localhost:${port}`;
const smtp=resolveSmtpConfiguration(process.env);
assertProductionConfiguration(process.env,smtp);
const transport=smtp.enabled?nodemailer.createTransport(smtp.transportOptions):null;
const inquiry=createInquiryHandler({transport,sender:smtp.sender,journalDir:resolve(process.env.INQUIRY_JOURNAL_DIR||join(root,'.runtime/inquiries')),allowedOrigin:origin,trustProxy:process.env.TRUST_PROXY==='true'});
const redirects={
 '/homes/belden-62412-elite-10-28603h.html':'/homes/shifty.html',
 '/homes/belden-62472-mu-cephei-28683a.html':'/homes/ramsey.html',
 '/homes/belden-15440-bungalow-12-24482a.html':'/homes/bungalow.html',
 '/homes/belden-62330-mustang-14602b.html':'/homes/camp.html',
 '/homes/belden-16040-charger-28523b.html':'/homes/hogancamp.html',
 '/homes/belden-16202-super-bee-28523f.html':'/homes/super-bee.html',
 '/contact-usform/':'/contact.html',
 '/inventory-of-homes/':'/inventory.html'
};
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://design.cavcohomes.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/api/inquiry')return await inquiry(req,res);
  if(pathname==='/healthz'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end('{"ok":true}');}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
  if(redirects[pathname]){res.writeHead(301,{Location:redirects[pathname]});return res.end();}
  const file=resolve(publicDir,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(publicDir+sep)||pathname.includes('\0')){res.writeHead(400);return res.end('Bad request');}
  let info;try{info=await stat(file);if(!info.isFile())throw new Error('Not a file');}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});return res.end(req.method==='HEAD'?undefined:await readFile(join(publicDir,'404.html')));}
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'});
  if(req.method==='HEAD')return res.end();
  createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch{if(!res.headersSent)res.writeHead(400);res.end('Bad request');}
});
server.requestTimeout=30000;server.headersTimeout=10000;
server.listen(port,process.env.HOST||'127.0.0.1',()=>{console.log(`Belden Homes: http://localhost:${port}`);if(!transport)console.log('SMTP is not configured; inquiry submissions return an explicit unavailable response.');});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{transport?.close();process.exit(0);}));
