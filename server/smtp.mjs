function portFrom(env,relay){
  const fallback=relay?587:465;
  const port=Number(env.SMTP_PORT||fallback);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('SMTP_PORT must be a valid TCP port.');
  return port;
}

export function resolveSmtpConfiguration(env=process.env){
  const relay=env.SMTP_RELAY==='true';
  const user=env.SMTP_USER?.trim();
  const pass=env.SMTP_PASS;
  const sender=(env.SMTP_FROM||user||'').trim();
  const port=portFrom(env,relay);
  const heloName=env.SMTP_HELO_NAME?.trim();
  if(heloName&&!/^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(heloName))throw new Error('SMTP_HELO_NAME must be a valid hostname.');
  const transportOptions={
    host:(env.SMTP_HOST||(relay?'smtp-relay.gmail.com':'smtp.gmail.com')).trim(),
    port,
    ...(heloName?{name:heloName}:{}),
    secure:port===465,
    requireTLS:true,
    connectionTimeout:10000,
    greetingTimeout:10000,
    socketTimeout:20000,
    disableFileAccess:true,
    disableUrlAccess:true
  };
  if(!relay&&user&&pass)transportOptions.auth={user,pass};
  return {
    mode:relay?'relay':'authenticated',
    sender,
    enabled:relay?Boolean(sender):Boolean(user&&pass&&sender),
    transportOptions
  };
}

export function assertProductionConfiguration(env=process.env,smtp=resolveSmtpConfiguration(env)){
  if(env.NODE_ENV!=='production')return;
  if(!env.PUBLIC_ORIGIN?.startsWith('https://'))throw new Error('Set PUBLIC_ORIGIN to the canonical HTTPS origin before starting production.');
  if(smtp.mode==='relay'&&!smtp.sender)throw new Error('Set SMTP_FROM when SMTP_RELAY=true.');
  if(smtp.mode==='authenticated'&&!smtp.enabled)throw new Error('Set SMTP_USER and SMTP_PASS before starting production authenticated SMTP.');
}
