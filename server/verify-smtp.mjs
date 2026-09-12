import nodemailer from 'nodemailer';
import {resolveSmtpConfiguration} from './smtp.mjs';

const smtp=resolveSmtpConfiguration(process.env);
if(!smtp.enabled){
  const requirement=smtp.mode==='relay'?'Set SMTP_RELAY=true and SMTP_FROM securely on the server first.':'Set SMTP_USER and SMTP_PASS securely on the server first.';
  throw new Error(requirement);
}
const mail=nodemailer.createTransport(smtp.transportOptions);
try{
  await mail.verify();
  console.log(`SMTP ${smtp.mode} connection and TLS handshake succeeded. This check does not send an email or confirm inbox delivery.`);
}finally{
  mail.close();
}
