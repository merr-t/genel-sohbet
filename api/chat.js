const crypto=require('crypto');
const U=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,K=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
const RAW=process.env.CHAT_AUTH||'{}';let A={};try{A=JSON.parse(RAW)}catch(e){}
const sec=crypto.createHash('sha256').update('k|'+RAW).digest();
const rd=async c=>(await(await fetch(U,{method:'POST',headers:{authorization:'Bearer '+K},body:JSON.stringify(c)})).json()).result;
const hr=()=>+new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hourCycle:'h23',timeZone:'Europe/Istanbul'}).format(new Date())%24;
const pb=(pw,rec)=>new Promise(ok=>{const[s,h]=rec.split(':');crypto.pbkdf2(pw.normalize('NFC'),Buffer.from(s,'hex'),A.IT,32,'sha256',(e,d)=>ok(!e&&crypto.timingSafeEqual(d,Buffer.from(h,'hex'))))});
const sig=e=>crypto.createHmac('sha256',sec).update(String(e)).digest('hex');
const mk=()=>{const e=Date.now()+600000;return e+'.'+sig(e)};
const vt=t=>{const[e,s]=String(t).split('.');if(!e||!s||+e<Date.now())return false;const x=Buffer.from(sig(e)),y=Buffer.from(s);return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const ID=/^[0-9a-f]{24}$/;
module.exports=async(req,res)=>{
res.setHeader('cache-control','no-store');res.setHeader('x-content-type-options','nosniff');
try{
if(req.method==='POST'&&(req.body||{}).a==='decoy'){try{const d=JSON.parse(process.env.DECOY_CHAT||'[]');return res.json(Array.isArray(d)?d.slice(0,50):[])}catch(e){return res.json([])}}
if(!U||!K||!A.T)return res.status(500).end();
const b=req.body||{};
if(req.method==='POST'&&b.a==='login'){
const ip=(req.headers['x-forwarded-for']||'').split(',')[0].trim()||'x',rk='rl:'+ip;
if(+(await rd(['GET',rk]))>=10)return res.status(429).end();
const pw=String(b.pw||'').slice(0,100);
const ok=(await pb(pw,A.T[hr()]))||(await pb(pw,A.P2));
if(!ok){if((await rd(['INCR',rk]))==1)await rd(['EXPIRE',rk,600]);return res.status(401).end()}
return res.json({token:mk()})}
if(!vt((req.headers.authorization||'').slice(7)))return res.status(401).end();
if(req.method==='GET'){
if(req.query.b){const id=String(req.query.b);if(!ID.test(id))return res.status(400).end();const v=await rd(['GET','b:'+id]);if(!v)return res.status(404).end();const i=v.indexOf('|'),c=v.slice(0,i);
res.setHeader('content-type',/^(image\/(png|jpeg|gif|webp)|audio\/[\w.+-]+|video\/[\w.+-]+)$/.test(c)?c:'application/octet-stream');
return res.send(Buffer.from(v.slice(i+1),'base64'))}
return res.json(((await rd(['LRANGE','msgs',0,149]))||[]).map(x=>JSON.parse(x)).reverse())}
if(req.method==='POST'){
if(b.a==='up'){const d=String(b.d||'');if(!d||d.length>820000||!/^[A-Za-z0-9+/=]+$/.test(d))return res.status(400).end();
const id=crypto.randomBytes(12).toString('hex');await rd(['SET','b:'+id,String(b.c||'').slice(0,60)+'|'+d,'EX',2592000]);return res.json({id})}
if(b.a==='send'){const m=b.m||{};if(!['txt','img','aud','vid','file'].includes(m.k))return res.status(400).end();
const o={k:m.k,ts:Date.now()};if(m.t)o.t=String(m.t).slice(0,2000);
if(m.k==='txt'){if(!o.t)return res.status(400).end()}
else{if(!ID.test(m.a||''))return res.status(400).end();o.a=m.a;o.n=String(m.n||'').slice(0,120);o.s=+m.s||0}
await rd(['LPUSH','msgs',JSON.stringify(o)]);await rd(['LTRIM','msgs',0,499]);return res.json({ok:1})}}
res.status(405).end()}catch(e){res.status(500).end()}};
