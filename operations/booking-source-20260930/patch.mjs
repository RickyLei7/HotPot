import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
export async function patchAssets(root){
 const edit=async(file,before,after)=>{const p=path.join(root,file),s=await readFile(p,'utf8');if(!s.includes(before))throw Error('Unexpected live baseline: '+file);await writeFile(p,s.replace(before,after));};
 const parser=`export function bookingAttributionFromSearch(search,context={}){
  const params=new URLSearchParams(search||'');
  const candidate=Object.fromEntries(KEYS.map(key=>[key,params.get(key)||'']));
  const mapping={utm_source:'source',utm_medium:'medium',utm_campaign:'campaignName',utm_id:'campaignId',utm_content:'content',utm_term:'term'};
  for(const [query,key] of Object.entries(mapping))if(!candidate[key])candidate[key]=params.get(query)||'';
  for(const type of ['gclid','gbraid','wbraid'])if(params.get(type)){
    candidate.clickIdType=type;candidate.clickId=params.get(type);
    candidate.source='google';candidate.medium='cpc';break;
  }
  // A Facebook click identifier alone does not prove that the visit was paid.
  if(!candidate.clickId&&params.get('fbclid')){
    candidate.clickIdType='fbclid';candidate.clickId=params.get('fbclid');
    candidate.source=candidate.source||'facebook';candidate.medium=candidate.medium||'social';
  }
  let host='';try{host=new URL(context.referrer||'').hostname.toLowerCase();}catch{}
  if(!candidate.source&&host&&host!==context.hostname){
    if(/(^|\\.)google\\.[a-z.]+$/.test(host)){candidate.source='google';candidate.medium='organic';}
    else if(/(^|\\.)bing\\.com$/.test(host)){candidate.source='bing';candidate.medium='organic';}
    else if(/(^|\\.)instagram\\.com$/.test(host)){candidate.source='instagram';candidate.medium='social';}
    else if(/(^|\\.)facebook\\.com$/.test(host)){candidate.source='facebook';candidate.medium='social';}
    else{candidate.source=host;candidate.medium='referral';}
  }
  if(!candidate.referrerHost&&host&&host!==context.hostname)candidate.referrerHost=host;
  if(!candidate.landingPage&&context.pathname)candidate.landingPage=context.pathname;
  if(!candidate.source&&context.pathname){candidate.source='unknown';candidate.medium='none';}
  try{return normalizeBookingAttribution(candidate);}catch{
    // Malformed link fields must not discard all source recording or block booking.
    return context.pathname?normalizeBookingAttribution({source:'unknown',medium:'none',landingPage:context.pathname}):null;
  }
}

export function captureBookingAttribution(location,referrer,storage,now=Date.now()){
 const context={referrer,hostname:location.hostname,pathname:location.pathname};
 const incoming=bookingAttributionFromSearch(location.search,context);
 const key='hotpot_booking_source_v1';
 let cached=null;
 try{const record=JSON.parse(storage?.getItem(key)||'null');
   if(record&&Number.isFinite(record.capturedAt)&&now>=record.capturedAt&&now-record.capturedAt<=30*60*1000)cached=normalizeBookingAttribution(record.attribution);
 }catch{}
 const result=incoming?.source==='unknown'&&cached?cached:incoming;
 try{if(result)storage?.setItem(key,JSON.stringify({capturedAt:now,attribution:result}));}catch{}
 return result;
}

export function isPaidBookingAttribution(attribution){
 return Boolean(attribution&&(/^(cpc|ppc|paid|paid_social|paid-social|paid_search|paid-search|display|cpm)$/i.test(attribution.medium||'')||(['gclid','gbraid','wbraid'].includes(attribution.clickIdType)&&attribution.source==='google')));
}
export function bookingSourceSummary(records,now,days=30){
 const rows=new Map(),seen=new Set(),cutoff=now-days*86400000;
 for(const record of records){
  if(record.source!=='website'||!Number.isFinite(Number(record.createdAt))||Number(record.createdAt)<cutoff||Number(record.createdAt)>now)continue;
  if(record.id&&seen.has(record.id))continue;if(record.id)seen.add(record.id);
  const a=record.attribution||{},paid=isPaidBookingAttribution(a),source=a.source||'unknown',medium=a.medium||'none';
  const campaign=a.campaignName||a.campaignId||'',content=a.content||'',key=JSON.stringify([paid,source,medium,campaign,content]);
  const count=()=>({groups:0,guests:0});
  const row=rows.get(key)||{paid,source,medium,campaign,content,submitted:count(),pending:count(),confirmed:count(),seated:count(),cancelled:count()};
  const guests=Number(record.partySize),add=target=>{target.groups++;target.guests+=Number.isFinite(guests)&&guests>0?guests:0;};
  add(row.submitted);
  if(['cancelled','no-show'].includes(record.status))add(row.cancelled);
  else if(['pending','alternative-offered'].includes(record.approvalStatus)||record.status==='pending')add(row.pending);
  else if(['confirmed','arrived','seated'].includes(record.status))add(row.confirmed);
  if(record.status==='seated')add(row.seated);
  rows.set(key,row);
 }
 return [...rows.values()].sort((a,b)=>Number(b.paid)-Number(a.paid)||b.submitted.groups-a.submitted.groups||a.source.localeCompare(b.source));
}
`;
 await edit('domain/booking-attribution.js',`export function bookingAttributionFromSearch(search){\n  const params=new URLSearchParams(search||'');\n  const candidate=Object.fromEntries(KEYS.map(key=>[key,params.get(key)||'']));\n  try{return normalizeBookingAttribution(candidate);}catch{return null;}\n}`,parser);
 await edit('client/booking-client.js','{bookingAttributionFromSearch}','{captureBookingAttribution}');
 await edit('client/booking-client.js','bookingAttributionFromSearch(location.search)',"captureBookingAttribution(location,document.referrer,(()=>{try{return sessionStorage;}catch{return null;}})())");

 await edit('client/app.js',"import {queueLabel", "import {bookingSourceSummary} from '../domain/booking-attribution.js';\nimport {queueLabel");
 await edit('client/app.js','function renderModal(){',`function renderBookingSources(){
 const rows=bookingSourceSummary(state.reservations,now());
 const total=rows.filter(row=>row.paid).reduce((sum,row)=>({groups:sum.groups+row.confirmed.groups,guests:sum.guests+row.confirmed.guests}),{groups:0,guests:0});
 const body='<p class="hint">最近30天 · 按提交日期统计。每笔订位按1组计算，人数取订位人数。</p><h3>广告已确认：'+total.groups+'组 · '+total.guests+'人</h3>'+rows.map(row=>'<article class="row"><div class="row-name">'+(row.paid?'付费广告 · ':'非付费／未知 · ')+esc(row.source==='unknown'?'来源未知':row.source)+' / '+esc(row.medium)+'</div><div class="row-meta">'+esc([row.campaign,row.content].filter(Boolean).join(' · '))+'</div><p>提交 '+row.submitted.groups+'组／'+row.submitted.guests+'人 · 待确认 '+row.pending.groups+'组／'+row.pending.guests+'人</p><p>已确认 '+row.confirmed.groups+'组／'+row.confirmed.guests+'人 · 已入座 '+row.seated.groups+'组／'+row.seated.guests+'人</p><small>取消或未到 '+row.cancelled.groups+'组／'+row.cancelled.guests+'人</small></article>').join('')+'<p class="hint">已确认包含已入座；已入座人数按订位人数统计。未知来源不能判为广告无效，也不计入广告成绩。每位订位成本＝同期广告实际花费÷该广告已确认人数；到店成本用已入座人数。人数为0时不计算。</p>';
 return notebookSheet('订位来源与人数',body);
}
function renderModal(){
 if(modal.type==='booking-sources')return renderBookingSources();`);
 await edit('client/app.js','<button class="more-menu-item more-menu-danger" data-action="open-clear">','<button class="more-menu-item" data-action="show-booking-sources"><strong>订位来源与人数</strong><span>广告、自然来源与未知来源 · 最近30天</span></button><button class="more-menu-item more-menu-danger" data-action="open-clear">');
 await edit('client/app.js',"if(action==='open-more')", "if(action==='show-booking-sources'){modal={type:'booking-sources'};render();return;}\n  if(action==='open-more')");
 const sw=await readFile(path.join(root,'sw.js'),'utf8'),cache=sw.match(/const CACHE='([^']+)'/);if(!cache)throw Error('Unexpected service worker cache');
 await edit('sw.js',cache[1],'hotpot-seat-shell-2026.09.30.source2');
}
if(process.argv[1]===new URL(import.meta.url).pathname)await patchAssets(process.argv[2]);
