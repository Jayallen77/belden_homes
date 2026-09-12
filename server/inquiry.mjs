import {createHash,randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

export const DESTINATION='inquiries@beldenhomesinc.com';
export function smtpErrorDetails(error){
 const details={};
 for(const key of ['code','responseCode','command','response','messageId'])if(error?.[key]!=null)details[key]=error[key];
 return details;
}
const modelNames=new Set(['','Greater Ops','Shifty','Super Bee','Ramsey','Bungalow','Camp','Hogancamp','Office','Modular options']);
export function validateInquiry(data){
 if(!data||typeof data!=='object'||Array.isArray(data))return {error:'Please complete the inquiry form.'};
 const values={};for(const key of ['name','phone','email','model','message','website','requestId']){if(data[key]!=null&&typeof data[key]!=='string')return {error:'Please check your form entries.'};values[key]=(data[key]||'').trim();}
 if(values.website)return {error:'Unable to submit this inquiry. Please call 607-693-1364.'};
 if(values.name.length<2||values.name.length>100||/[\r\n\x00-\x1f]/.test(values.name))return {error:'Enter your name (2–100 characters).'};
 if(values.phone.length>30||!/^[+\d().\s-]+$/.test(values.phone)||values.phone.replace(/\D/g,'').length<10||values.phone.replace(/\D/g,'').length>15)return {error:'Enter a phone number with 10 to 15 digits.'};
 if(values.email.length>254||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.email))return {error:'Enter a valid email address.'};
 if(!modelNames.has(values.model))return {error:'Choose a home from the list.'};
 if(values.message.length<10||values.message.length>5000||values.message.includes('\0'))return {error:'Enter a message between 10 and 5,000 characters.'};
 if(values.requestId&&!/^[a-f0-9-]{36}$/i.test(values.requestId))return {error:'Please reload the form and try again.'};
 values.requestId ||= randomUUID();return {values};
}
export function createInquiryHandler({transport,sender,journalDir,allowedOrigin,trustProxy=false}){
 const attempts=new Map();const active=new Set();
 return async(req,res)=>{
  const json=(status,payload,headers={})=>{
   const html=req.headers['content-type']?.startsWith('application/x-www-form-urlencoded')&&req.headers.accept?.includes('text/html');
   res.writeHead(status,{'Content-Type':html?'text/html; charset=utf-8':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});
   if(!html)return res.end(JSON.stringify(payload));
   const message=payload.ok?'Your inquiry has been sent to Belden Homes. We’ll respond using the contact information you provided.':payload.message;
   res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Inquiry ${payload.ok?'sent':'not sent'} | Belden Homes Inc.</title><link rel="stylesheet" href="/assets/css/styles.css"></head><body><main class="section container narrow"><h1>${payload.ok?'Thank you.':'Your inquiry was not confirmed.'}</h1><p>${message}</p><a class="btn primary" href="/contact.html">Return to contact page</a></main></body></html>`);
  };
  if(req.method!=='POST')return json(405,{ok:false,message:'Use the inquiry form to submit a request.'},{Allow:'POST'});
  if(req.headers.origin&&req.headers.origin!==allowedOrigin)return json(403,{ok:false,message:'Please submit the form from the Belden Homes website.'});
  if(req.headers['sec-fetch-site']==='cross-site')return json(403,{ok:false,message:'Please submit the form from the Belden Homes website.'});
  const ip=trustProxy?String(req.headers['x-real-ip']||req.socket.remoteAddress):req.socket.remoteAddress;
  const now=Date.now();for(const [key,value]of attempts)if(value.until<now)attempts.delete(key);
  if(!attempts.has(ip)){if(attempts.size>=10000)return json(429,{ok:false,message:'The form is busy. Please try again shortly.'},{'Retry-After':'900'});attempts.set(ip,{count:0,until:now+900000});}
  const attempt=attempts.get(ip);if(++attempt.count>5)return json(429,{ok:false,message:'Too many attempts. Please wait 15 minutes or call 607-693-1364.'},{'Retry-After':String(Math.ceil((attempt.until-now)/1000))});
  if(!/^application\/(json|x-www-form-urlencoded)(;|$)/i.test(req.headers['content-type']||''))return json(415,{ok:false,message:'Please use the inquiry form.'});
  let data;try{let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16384){json(413,{ok:false,message:'Your message is too long. Please shorten it and try again.'});return;}chunks.push(chunk);}const body=Buffer.concat(chunks).toString('utf8');data=req.headers['content-type'].startsWith('application/json')?JSON.parse(body):Object.fromEntries(new URLSearchParams(body));}catch{return json(400,{ok:false,message:'We could not read the inquiry. Please check your entries and try again.'});}
  const checked=validateInquiry(data);if(checked.error)return json(400,{ok:false,message:checked.error});
  if(!transport||!sender)return json(503,{ok:false,message:'Online inquiries are temporarily unavailable. Please call 607-693-1364 or email inquiries@beldenhomesinc.com. Your entries have been kept.'});
  const v=checked.values;const id=v.requestId;const hash=createHash('sha256').update(JSON.stringify([v.name,v.phone,v.email,v.model,v.message])).digest('hex');const file=join(journalDir,id+'.json');
  if(active.has(id))return json(409,{ok:false,message:'This inquiry is still being processed. Please wait before trying again.'});
  active.add(id);
  try{
   await mkdir(journalDir,{recursive:true,mode:0o700});
   let previous;try{previous=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
   if(previous){if(previous.hash!==hash)return json(409,{ok:false,message:'Please reload the form before sending a different inquiry.'});if(previous.status==='accepted')return json(200,{ok:true});return json(409,{ok:false,message:'Delivery of your previous inquiry could not be confirmed. Please call 607-693-1364 before resending.'});}
   await writeFile(file,JSON.stringify({hash,status:'pending',at:new Date().toISOString()}),{flag:'wx',mode:0o600});
   const sent=await transport.sendMail({from:{name:'Belden Homes Website',address:sender},to:DESTINATION,replyTo:{name:v.name,address:v.email},subject:'Website inquiry'+(v.model?' — '+v.model:''),text:`Name: ${v.name}\nPhone: ${v.phone}\nEmail: ${v.email}\nHome: ${v.model||'Not sure yet'}\n\n${v.message}\n\nInquiry reference: ${id}`,messageId:`<${id}@beldenhomesinc.com>`,disableFileAccess:true,disableUrlAccess:true});
   if(!sent.accepted?.some(address=>String(address).toLowerCase()===DESTINATION))throw new Error('Recipient not accepted');
   await writeFile(file,JSON.stringify({hash,status:'accepted',at:new Date().toISOString()}),{mode:0o600});
   return json(200,{ok:true});
  }catch(error){console.error('Inquiry SMTP failure:',JSON.stringify(smtpErrorDetails(error)));return json(502,{ok:false,message:'We could not confirm delivery. Please call 607-693-1364 or email inquiries@beldenhomesinc.com before resending. Your entries have been kept.'});}
  finally{active.delete(id);}
 };
}
