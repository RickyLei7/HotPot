import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';

// Supply a reviewed release fixture. Every booking request is fulfilled locally;
// this check cannot create a production reservation or send a notification.
const fixture=process.env.BOOKING_QA_FIXTURE;
assert(fixture,'Set BOOKING_QA_FIXTURE to the reviewed release asset directory');
const {chromium,webkit}=createRequire(process.env.BOOKING_QA_PACKAGE||new URL('../../package.json',import.meta.url))('playwright');
const origin='https://reservation.centrestjhotpot.ca',parent='https://centrestjhotpot.ca';
const results=[],real=process.env.BOOKING_QA_REAL_TEST_KEY==='1';
const report=process.env.BOOKING_QA_REPORT||'/tmp/hotpot-booking-security-qa.json';
for(const [engine,type] of [['chrome',chromium],['webkit',webkit]]){
 if(process.env.BOOKING_QA_SMOKE==='1'&&engine!=='chrome')continue;
 const browser=await type.launch({headless:true});
 try{for(const width of [390,768,1440])for(const embedded of [false,true]){
  if(process.env.BOOKING_QA_SMOKE==='1'&&(width!==390||embedded))continue;
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  const errors=[],submissions=[];
  const slot=Date.now()+3*86400000,token='a'.repeat(64);
  let renderCount=0;
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.origin===parent&&url.pathname==='/')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width"><iframe title="Online booking" style="width:100%;height:850px;border:0" sandbox="allow-forms allow-scripts allow-same-origin allow-popups" src="${origin}/embed/book"></iframe>`});
   if(url.hostname==='challenges.cloudflare.com'&&url.pathname.includes('/turnstile/v0/api.js')&&!real)return route.fulfill({contentType:'text/javascript',body:`window.__securityTest={renders:[],removed:[]};window.turnstile={render(el,options){window.__securityTest.renders.push(options);el.textContent='Local security fixture';return window.__securityTest.renders.length;},remove(id){window.__securityTest.removed.push(id);}};`});
   if(real&&(url.hostname==='challenges.cloudflare.com'||url.hostname.endsWith('.challenges.cloudflare.com')))return route.continue();
   if(url.origin!==origin)return route.abort();
   if(url.pathname==='/api/public/bookings/availability')return route.fulfill({json:{slots:[slot],reviewSlots:[],formNonce:'local-nonce',siteKey:real?'1x00000000000000000000AA':'local-key'}});
   if(url.pathname==='/api/public/bookings'){
    const body=request.postDataJSON();submissions.push(body);
    if(!real&&submissions.length===1)return route.fulfill({status:400,json:{code:'CHALLENGE_FAILED'}});
    if(!real&&submissions.length===2)return route.abort();
    return route.fulfill({json:{booking:{...body,bookingNumber:'LOCAL-TEST',status:'confirmed',approvalStatus:'approved',version:1,canEdit:true,canCancel:true},manageUrl:`${origin}/b/#${token}`}});
   }
   if(!['GET','HEAD'].includes(request.method()))throw new Error('Unexpected local-fixture write '+url.pathname);
   const path=['/book','/embed/book'].includes(url.pathname)?'/book.html':url.pathname;
   assert(!path.includes('..'));
   try{const bytes=await readFile(path==='/client/booking-client.js'&&process.env.BOOKING_QA_CLIENT?process.env.BOOKING_QA_CLIENT:resolve(fixture,'.'+path));return route.fulfill({contentType:path.endsWith('.js')?'application/javascript':path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':'text/html',body:bytes});}
   catch{return route.fulfill({status:404,body:'Local fixture not found'});}
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(15000);
  const item={engine,width,embedded,realCloudflareTestKey:real};
  try{
   await page.goto(embedded?parent:origin+'/book');
   const frame=embedded?page.frames().find(f=>f.url().startsWith(origin+'/embed/book')):page.mainFrame();
   assert(frame,'Booking frame missing');
   await frame.locator('#booking-time:enabled').waitFor();
   await frame.locator('#booking-time').selectOption(String(slot));
   await frame.locator('#booking-name').fill('Local Test Guest');
   await frame.locator('#booking-phone').fill('4035550100');
   await frame.locator('#booking-note').fill('Synthetic test only');
   await frame.locator('#booking-sms-decline').check();
   if(!real)assert(await frame.locator('#booking-submit').isDisabled());
   const invoke=async key=>{await frame.evaluate(key=>{const options=window.__securityTest.renders.at(-1);options[key](key==='callback'?'local-token':undefined);},key);};
   if(!real){
    await frame.waitForFunction(()=>window.__securityTest?.renders.length);
    for(const key of ['error-callback','expired-callback','timeout-callback','unsupported-callback']){
     await invoke('callback');assert.equal(await frame.locator('#booking-submit').isDisabled(),false);
     await invoke(key);
     assert.equal(await frame.locator('#booking-submit').isDisabled(),true,key+' must block submission');
     assert.equal(await frame.locator('#booking-security-retry').isVisible(),true,key+' must offer recovery');
     assert.match(await frame.locator('#booking-message').innerText(),/security/i);
     assert.equal(await frame.locator('#booking-name').inputValue(),'Local Test Guest');
     assert.equal(await frame.locator('#booking-note').inputValue(),'Synthetic test only');
     assert.equal(await frame.locator('#booking-sms-decline').isChecked(),true);
     await invoke('callback');
     assert.equal(await frame.locator('#booking-security-retry').isVisible(),false);
     assert.equal(await frame.locator('#booking-message').innerText(),'');
    }
    await invoke('error-callback');
    renderCount=await frame.evaluate(()=>window.__securityTest.renders.length);
    await frame.locator('#booking-security-retry').click();
    await frame.waitForFunction(n=>window.__securityTest.renders.length>n,renderCount);
    await frame.evaluate(()=>window.__securityTest.renders.at(-2).callback('stale-token'));
    assert(await frame.locator('#booking-submit').isDisabled(),'Old widget cannot re-enable submission');
    await invoke('callback');
    assert.equal(await frame.locator('#booking-message').innerText(),'');
    item.recoveryCallbacks=4;item.staleCallbackIgnored=true;item.guestFieldsPreserved=true;
    await frame.locator('#booking-submit').click();
    await frame.waitForFunction(n=>window.__securityTest.renders.length>n,renderCount+1);
    await invoke('callback');
    assert.equal(await frame.locator('#booking-message').innerText(),'','Successful verification clears the server challenge error');
    await frame.locator('#booking-submit').click();
    await frame.locator('#booking-retry').waitFor({state:'visible'});
    assert.equal(submissions[0].idempotencyKey,submissions[1].idempotencyKey);
    assert(await frame.locator('#booking-name').isDisabled());
    await frame.locator('#booking-retry').click();
    assert.deepEqual(submissions[2],submissions[1],'Uncertain result retries the identical request');
    item.uncertainRetryPreserved=true;
   }else{
    await frame.locator('#booking-submit:enabled').waitFor({timeout:30000});
    await frame.locator('#booking-submit').click();
   }
   await frame.locator('#booking-result').waitFor({state:'visible'});
   assert.match(await frame.locator('#booking-facts').innerText(),/403.*555.*0100/);
   assert.equal(await frame.locator('#booking-manage').getAttribute('href'),`${origin}/b/#${token}`);
   assert.equal(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   assert.deepEqual(errors,[]);
   Object.assign(item,{confirmationVisible:true,localCreateRequests:submissions.length,productionBookingsCreated:0,passed:true});
  }catch(error){Object.assign(item,{passed:false,error:error.message,errors});}
  finally{results.push(item);console.log(JSON.stringify(item));await context.close();}
 }}finally{await browser.close();}
}
await mkdir(resolve(report,'..'),{recursive:true});await writeFile(report,JSON.stringify(results,null,2));
assert(results.every(item=>item.passed),'Booking security acceptance failed; see '+report);
