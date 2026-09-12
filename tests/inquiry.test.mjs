import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createInquiryHandler,validateInquiry,DESTINATION,smtpErrorDetails} from '../server/inquiry.mjs';
const sample=()=>({name:'Form verification',phone:'607-555-0100',email:'validation@example.invalid',model:'Camp',message:'This is a local automated form test.',requestId:randomUUID()});
test('validates required fields, email, phone, model, and message server-side',()=>{
 assert.ok(validateInquiry(sample()).values);
 for(const change of [{name:''},{phone:'123'},{email:'bad'},{model:'unknown'},{message:'short'},{name:'Bad\r\nHeader'},{website:'spam'},{email:['a']},{requestId:'../escape'}])assert.ok(validateInquiry({...sample(),...change}).error,JSON.stringify(change));
});
async function harness(t,transport){const dir=await mkdtemp(join(tmpdir(),'belden-inquiry-'));const handler=createInquiryHandler({transport,sender:'inquiries@beldenhomesinc.com',journalDir:dir,allowedOrigin:'https://www.beldenhomesinc.com'});const server=http.createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(async()=>{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});});return async(data=sample(),extra={})=>fetch(`http://127.0.0.1:${server.address().port}/api/inquiry`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.beldenhomesinc.com',...extra},body:JSON.stringify(data)});}
test('sends only to the intended inbox and prevents duplicate email after retry',async t=>{const messages=[];const post=await harness(t,{sendMail:async mail=>{messages.push(mail);return {accepted:[DESTINATION]};}});const data=sample();let response=await post(data);assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});response=await post(data);assert.equal(response.status,200);assert.equal(messages.length,1);assert.equal(messages[0].to,DESTINATION);assert.deepEqual(messages[0].from,{name:'Belden Homes Website',address:'inquiries@beldenhomesinc.com'});assert.equal(messages[0].replyTo.address,data.email);assert.ok(messages[0].text.includes('Home: Camp'));assert.equal((await post({...data,message:'A different inquiry with the same reference.'})).status,409);});
test('missing SMTP returns an actionable error, never success',async t=>{const post=await harness(t,null);const response=await post();assert.equal(response.status,503);const result=await response.json();assert.equal(result.ok,false);assert.ok(result.message.includes(DESTINATION));});
test('captures safe SMTP stage and response details without inquiry contents',()=>{
 const details=smtpErrorDetails(Object.assign(new Error('Mail command failed'),{code:'EENVELOPE',responseCode:550,command:'RCPT TO',response:'550 5.7.1 Relay denied',messageId:'<test@beldenhomesinc.com>'}));
 assert.deepEqual(details,{code:'EENVELOPE',responseCode:550,command:'RCPT TO',response:'550 5.7.1 Relay denied',messageId:'<test@beldenhomesinc.com>'});
});
test('SMTP failures and unaccepted recipients cannot produce success',async t=>{for(const transport of [{sendMail:async()=>{throw Object.assign(new Error('failure'),{code:'ECONNECTION'});}},{sendMail:async()=>({accepted:[]})}]){const post=await harness(t,transport);const data=sample();assert.equal((await post(data)).status,502);assert.equal((await post(data)).status,409);}});
test('rejects cross-origin requests and rate-limits repeated attempts',async t=>{const post=await harness(t,null);assert.equal((await post(sample(),{Origin:'https://attacker.invalid'})).status,403);for(let i=0;i<5;i++)assert.equal((await post({...sample(),name:''})).status,400);const response=await post();assert.equal(response.status,429);assert.ok(response.headers.get('retry-after'));});
