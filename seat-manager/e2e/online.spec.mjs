import { join } from 'node:path';

const wait = milliseconds => new Promise(resolve=>setTimeout(resolve,milliseconds));

async function waitUntil(check,{timeout=10_000,interval=100,message='condition'}={}){
  const deadline=Date.now()+timeout;
  let lastError;
  while(Date.now()<deadline){
    try{if(await check())return}catch(error){lastError=error}
    await wait(interval);
  }
  throw new Error(`Timed out waiting for ${message}${lastError?`: ${lastError.message}`:''}`);
}

const rowFor=(page,name)=>page.locator('article.row',{hasText:name}).first();
const tableFor=(page,tableId)=>page.locator(`[data-drop-table="${tableId}"]`);

async function login(page,baseUrl,errors){
  page.on('console',message=>{
    if(message.type()!=='error')return;
    const text=message.text();
    const expectedLocalNoise=text.includes('An SSL certificate error occurred when fetching the script')
      || text.includes('status of 401 (Unauthorized)')
      || text.includes('status of 409 (Conflict)');
    if(!expectedLocalNoise)errors.push(`console: ${text}`);
  });
  page.on('pageerror',error=>errors.push(`page: ${error.message}`));
  await page.goto(baseUrl,{waitUntil:'domcontentloaded'});
  await page.locator('#staff-pin').fill('2468');
  await page.locator('#pin-form button[type="submit"]').click();
  await page.locator('.connection-state.online').waitFor({state:'visible',timeout:10_000});
}

async function addWalkin(page,{name,phone='403-555-0100',partySize=2}){
  await page.getByRole('button',{name:'+ Walk-in'}).click();
  const form=page.locator('#party-form');
  await form.locator('[name="name"]').fill(name);
  await form.locator('[name="phone"]').fill(phone);
  await form.locator('[name="partySize"]').fill(String(partySize));
  await form.locator('button[type="submit"]').click();
  await form.waitFor({state:'detached'});
}

function localDateTimeInput(timestamp){
  const date=new Date(timestamp);
  date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
  return date.toISOString().slice(0,16);
}

async function addReservation(page,{name,phone='403-555-0200',partySize=2}){
  await page.getByRole('button',{name:'+ Reservation'}).click();
  const form=page.locator('#party-form');
  await form.locator('[name="name"]').fill(name);
  await form.locator('[name="phone"]').fill(phone);
  await form.locator('[name="partySize"]').fill(String(partySize));
  await form.locator('[name="reservedAt"]').fill(localDateTimeInput(Date.now()+30*60_000));
  await form.locator('button[type="submit"]').click();
  await form.waitFor({state:'detached'});
}

async function waitForName(pages,name){
  await Promise.all(pages.map(page=>rowFor(page,name).waitFor({state:'visible',timeout:10_000})));
}

async function chooseTable(page,name,tableId){
  await rowFor(page,name).getByRole('button',{name:/Seat \/ 入座/}).click();
  const pick=page.locator(`[data-action="toggle-table"][data-table="${tableId}"]`);
  if(!await pick.evaluate(element=>element.classList.contains('selected')))await pick.click();
}

export async function runAcceptance({browser,baseUrl,artifactDirectory}){
  const profiles=[
    {name:'ipad-mini',viewport:{width:1133,height:744}},
    {name:'android-tablet',viewport:{width:1280,height:800}},
    {name:'phone',viewport:{width:390,height:844}},
    {name:'desktop',viewport:{width:1440,height:900}}
  ];
  const contexts=[];const pages=[];const errors=[];
  try{
    for(const profile of profiles){
      const context=await browser.newContext({viewport:profile.viewport,ignoreHTTPSErrors:true});
      const page=await context.newPage();
      contexts.push(context);pages.push(page);
      await login(page,baseUrl,errors);
    }

    await addWalkin(pages[0],{name:'E2E Walkin',phone:'403-555-1100'});
    await waitForName(pages,'E2E Walkin');

    await rowFor(pages[0],'E2E Walkin').getByRole('button',{name:/Notify/}).click();
    await Promise.all(pages.map(page=>rowFor(page,'E2E Walkin').getByText('Notified',{exact:true}).waitFor({timeout:10_000})));

    await addReservation(pages[1],{name:'E2E Reservation',phone:'403-555-2200'});
    await waitForName(pages,'E2E Reservation');
    for(const page of pages)await rowFor(page,'E2E Reservation').getByText('403-555-2200',{exact:true}).waitFor();

    await rowFor(pages[2],'E2E Reservation').getByRole('button',{name:/Arrived/}).click();
    await Promise.all(pages.map(page=>rowFor(page,'E2E Reservation').getByText('Arrived',{exact:true}).waitFor({timeout:10_000})));

    await rowFor(pages[3],'E2E Reservation').dragTo(tableFor(pages[3],9));
    await pages[3].getByRole('button',{name:'确认入座'}).click();
    await Promise.all(pages.map(page=>tableFor(page,9).getByText('E2E Reservation',{exact:true}).waitFor({timeout:10_000})));

    await addWalkin(pages[0],{name:'Race A'});
    await addWalkin(pages[1],{name:'Race B'});
    await waitForName(pages,['Race A','Race B'][0]);
    await waitForName(pages,['Race A','Race B'][1]);
    await chooseTable(pages[0],'Race A',10);
    await chooseTable(pages[1],'Race B',10);
    await Promise.all([
      pages[0].locator('.sheet').getByRole('button',{name:'Seat now 入座'}).click({noWaitAfter:true}),
      pages[1].locator('.sheet').getByRole('button',{name:'Seat now 入座'}).click({noWaitAfter:true})
    ]);
    await waitUntil(async()=>{
      const texts=await Promise.all([tableFor(pages[0],10).textContent(),tableFor(pages[1],10).textContent()]);
      return texts.every(text=>text.includes('Race A')||text.includes('Race B'));
    },{message:'one authoritative table-10 winner'});
    await waitUntil(async()=>await pages[0].locator('.operation-error').count()+await pages[1].locator('.operation-error').count()===1,{message:'one seating conflict'});

    await contexts[2].setOffline(true);
    await pages[2].locator('.connection-state.offline').waitFor({timeout:10_000});
    await addWalkin(pages[3],{name:'Reconnect Guest'});
    await contexts[2].setOffline(false);
    await pages[2].locator('.connection-state.online').waitFor({timeout:15_000});
    await rowFor(pages[2],'Reconnect Guest').waitFor({timeout:10_000});

    for(let index=0;index<pages.length;index+=1){
      const page=pages[index];
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      if(overflow>1)throw new Error(`${profiles[index].name} has ${overflow}px horizontal overflow`);
      if(await page.locator('vite-error-overlay, [data-nextjs-dialog-overlay]').count())throw new Error(`${profiles[index].name} rendered an error overlay`);
      await page.screenshot({path:join(artifactDirectory,`${profiles[index].name}.png`),fullPage:true});
    }
    if(errors.length)throw new Error(`Browser errors:\n${errors.join('\n')}`);
    return {profiles:profiles.map(profile=>profile.name),artifactDirectory};
  }catch(error){
    const diagnostics=[];
    for(let index=0;index<pages.length;index+=1){
      const page=pages[index];
      await page.screenshot({path:join(artifactDirectory,`failure-${profiles[index].name}.png`),fullPage:true}).catch(()=>{});
      diagnostics.push({
        profile:profiles[index].name,
        table10:await tableFor(page,10).textContent().catch(()=>null),
        errors:await page.locator('.operation-error').allTextContents().catch(()=>[]),
        modals:await page.locator('.sheet').allTextContents().catch(()=>[]),
        raceRows:await page.locator('article.row').filter({hasText:'Race'}).allTextContents().catch(()=>[])
      });
    }
    error.message+=`\nPage diagnostics: ${JSON.stringify(diagnostics,null,2)}`;
    throw error;
  }finally{
    await Promise.all(contexts.map(context=>context.close().catch(()=>{})));
  }
}
