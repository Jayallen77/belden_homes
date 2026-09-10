import nodemailer from 'nodemailer';
if(!process.env.SMTP_USER||!process.env.SMTP_PASS)throw new Error('Set SMTP_USER and SMTP_PASS securely on the server first.');
const mail=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.gmail.com',port:Number(process.env.SMTP_PORT||465),secure:process.env.SMTP_PORT!=='587',requireTLS:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},connectionTimeout:10000,socketTimeout:20000});
try{await mail.verify();console.log('SMTP connection and authentication succeeded. This check does not send an email or confirm inbox delivery.');}finally{mail.close();}
