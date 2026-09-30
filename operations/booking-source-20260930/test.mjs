import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {after} from 'node:test';
import {patchAssets} from './patch.mjs';
const root=process.env.BOOKING_ASSET_ROOT||await mkdtemp(path.join(tmpdir(),'hotpot-source-test-'));
if(!process.env.BOOKING_ASSET_ROOT){
 const files=JSON.parse(gunzipSync(await readFile(new URL('./baseline-assets.json.gz',import.meta.url))).toString());
 for(const [file,body] of Object.entries(files)){await mkdir(path.dirname(path.join(root,file)),{recursive:true});await writeFile(path.join(root,file),body);}
 await patchAssets(root);after(()=>rm(root,{recursive:true,force:true}));
}
const module=await import('data:text/javascript;base64,'+Buffer.from(await readFile(root+'/domain/booking-attribution.js','utf8')).toString('base64'));
const {bookingAttributionFromSearch:parse,captureBookingAttribution:capture,isPaidBookingAttribution:paid,normalizeBookingAttribution:normalize}=module;
const context={hostname:'reservation.centrestjhotpot.ca',pathname:'/book',referrer:''};
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const location=search=>({...context,search});
test('standard UTM and internal fields retain campaign and source',()=>{
 const a=parse('?utm_source=instagram&utm_medium=paid_social&utm_campaign=pinned&utm_content=video',context);
 assert.equal(a.source,'instagram');assert.equal(a.campaignName,'pinned');assert.equal(a.content,'video');assert.ok(paid(a));
 assert.equal(parse('?source=google&medium=cpc&campaignName=search&utm_source=instagram',context).source,'google');
});
test('Google click identifiers persist and classify paid',()=>{
 for(const kind of ['gclid','gbraid','wbraid']){const a=parse('?'+kind+'=Valid_123',context);assert.equal(a.clickIdType,kind);assert.equal(a.source,'google');assert.ok(paid(a));assert.deepEqual(normalize(a),a);}
});
test('Facebook click identifier alone does not prove advertising',()=>{
 const a=parse('?fbclid=Valid_123',context);assert.equal(a.source,'facebook');assert.equal(a.medium,'social');assert.equal(paid(a),false);
});
test('external search, social, referral and internal website sources',()=>{
 for(const [referrer,source,medium] of [['https://www.google.ca/search?q=hotpot','google','organic'],['https://l.instagram.com/','instagram','social'],['https://example.com/','example.com','referral'],['https://centrestjhotpot.ca/menu/','centrestjhotpot.ca','referral']]){
 const a=parse('',{...context,referrer});assert.equal(a.source,source);assert.equal(a.medium,medium);assert.equal(paid(a),false);
 }
 assert.equal(parse('',{...context,referrer:'https://reservation.centrestjhotpot.ca/book'}).source,'unknown');
});
test('no signal and malformed links retain honest unknown source without query or private token',()=>{
 for(const query of ['','?gclid=bad%20id','?landingPage=https://evil.test/']){const a=parse(query,context);assert.equal(a.source,'unknown');assert.equal(a.landingPage,'/book');assert.equal(paid(a),false);}
 assert.equal(parse(''),null);
 assert.throws(()=>normalize({source:'google',unexpected:'field'}));
});
test('reload preserves capture, new tagged visit replaces it, expired cache is ignored',()=>{
 const s=storage(),now=10000000;
 capture(location('?utm_source=google&utm_medium=cpc'),'',s,now);
 assert.equal(capture(location(''),'',s,now+1000).source,'google');
 assert.equal(capture(location('?utm_source=instagram&utm_medium=paid_social'),'',s,now+2000).source,'instagram');
 assert.equal(capture(location(''),'',s,now+2000+1800001).source,'unknown');
});
test('storage failure and invalid referrer do not block booking source capture',()=>{
 const bad={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.equal(capture(location('?utm_source=google&utm_medium=cpc'),'not a URL',bad).source,'google');
});
test('browser saves attribution on creation but excludes private management page',async()=>{
 const code=await readFile(root+'/client/booking-client.js','utf8');
 assert.ok(code.includes('const attribution=managing?null:captureBookingAttribution('));
 assert.match(code,/attribution/);assert.ok(code.includes('partySize'));
});
test('counts unique reservations and guests with approval state, cancellations and actual seating separated',()=>{
 const now=Date.now(),a={source:'google',medium:'cpc',campaignName:'Search'};
 const record=(id,partySize,approvalStatus,status='confirmed')=>({id,partySize,approvalStatus,status,source:'website',createdAt:now-1000,attribution:a});
 const records=[record('pending',6,'pending'),record('approved',4,'confirmed'),record('seated',3,'confirmed','seated'),record('cancelled',2,'confirmed','cancelled'),record('approved',4,'confirmed'),record('alternative',5,'alternative-offered')];
 const [row]=module.bookingSourceSummary(records,now);
 assert.deepEqual(row.submitted,{groups:5,guests:20});assert.deepEqual(row.pending,{groups:2,guests:11});
 assert.deepEqual(row.confirmed,{groups:2,guests:7});assert.deepEqual(row.seated,{groups:1,guests:3});assert.deepEqual(row.cancelled,{groups:1,guests:2});
});
test('organic, unmarked historical bookings and social traffic stay separate from ads',()=>{
 const now=Date.now();const rows=module.bookingSourceSummary([null,{source:'google',medium:'organic'},{source:'instagram',medium:'social'},{source:'instagram',medium:'paid_social'}].map((attribution,i)=>({id:String(i),source:'website',status:'confirmed',approvalStatus:'confirmed',partySize:2,createdAt:now,attribution})),now);
 assert.equal(rows.filter(row=>row.paid).length,1);assert.equal(rows.find(row=>row.source==='unknown').confirmed.guests,2);
});
test('report excludes staff records and records outside its submission window',()=>{
 const now=Date.now(),base={source:'website',partySize:2,status:'confirmed',createdAt:now,attribution:{source:'google',medium:'cpc'}};
 assert.equal(module.bookingSourceSummary([{...base,source:'staff'},{...base,createdAt:now-31*86400000},{...base,createdAt:now+1},{...base,createdAt:NaN}],now).length,0);
});
test('staff report renders totals from actual records and escapes campaign text',async()=>{
 const {runInNewContext}=await import('node:vm'),code=await readFile(root+'/client/app.js','utf8');
 const renderer=code.slice(code.indexOf('function renderBookingSources(){'),code.indexOf('function renderModal(){'));
 const now=Date.now(),context={bookingSourceSummary:module.bookingSourceSummary,state:{reservations:[{id:'1',source:'website',createdAt:now,partySize:4,status:'confirmed',approvalStatus:'pending',attribution:{source:'google',medium:'cpc',campaignName:'<script>'}}]},now:()=>now,esc:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;'),notebookSheet:(_,html)=>html};
 const html=runInNewContext(renderer+'renderBookingSources()',context);
 assert.ok(html.includes('广告已确认：0组 · 0人'));assert.ok(html.includes('待确认 1组／4人'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
 assert.ok(code.includes("if(action==='show-booking-sources')"));
});
