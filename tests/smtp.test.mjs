import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSmtpConfiguration,assertProductionConfiguration} from '../server/smtp.mjs';

test('IP-authenticated relay uses STARTTLS, an explicit sender, and no auth credentials',()=>{
  const env={
    NODE_ENV:'production',
    PUBLIC_ORIGIN:'https://www.beldenhomesinc.com',
    SMTP_RELAY:'true',
    SMTP_HOST:'smtp-relay.gmail.com',
    SMTP_PORT:'587',
    SMTP_FROM:'inquiries@beldenhomesinc.com'
  };
  const smtp=resolveSmtpConfiguration(env);
  assert.equal(smtp.mode,'relay');
  assert.equal(smtp.sender,'inquiries@beldenhomesinc.com');
  assert.equal(smtp.enabled,true);
  assert.deepEqual(smtp.transportOptions,{
    host:'smtp-relay.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    connectionTimeout:10000,
    greetingTimeout:10000,
    socketTimeout:20000,
    disableFileAccess:true,
    disableUrlAccess:true
  });
  assert.equal('auth' in smtp.transportOptions,false);
  assert.doesNotThrow(()=>assertProductionConfiguration(env,smtp));
});

test('authenticated SMTP remains supported and requires complete credentials',()=>{
  const env={
    NODE_ENV:'production',
    PUBLIC_ORIGIN:'https://www.beldenhomesinc.com',
    SMTP_USER:'mailer@beldenhomesinc.com',
    SMTP_PASS:'app-password'
  };
  const smtp=resolveSmtpConfiguration(env);
  assert.equal(smtp.mode,'authenticated');
  assert.equal(smtp.sender,'mailer@beldenhomesinc.com');
  assert.deepEqual(smtp.transportOptions.auth,{user:'mailer@beldenhomesinc.com',pass:'app-password'});
  assert.doesNotThrow(()=>assertProductionConfiguration(env,smtp));
  const incomplete=resolveSmtpConfiguration({...env,SMTP_PASS:''});
  assert.throws(()=>assertProductionConfiguration(env,incomplete),/SMTP/);
});

test('production relay requires an explicit FROM address and HTTPS origin',()=>{
  const env={NODE_ENV:'production',PUBLIC_ORIGIN:'https://www.beldenhomesinc.com',SMTP_RELAY:'true'};
  assert.throws(()=>assertProductionConfiguration(env,resolveSmtpConfiguration(env)),/SMTP_FROM/);
  const insecure={...env,PUBLIC_ORIGIN:'http://www.beldenhomesinc.com',SMTP_FROM:'inquiries@beldenhomesinc.com'};
  assert.throws(()=>assertProductionConfiguration(insecure,resolveSmtpConfiguration(insecure)),/PUBLIC_ORIGIN/);
});
