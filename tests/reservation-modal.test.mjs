import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');

async function reservationClickPrevented(link){
  const clickHandlers=[];
  const document={
    body:{classList:{toggle(){}}},documentElement:{lang:'en'},referrer:'',
    querySelector(){return null;},querySelectorAll(){return [];},getElementById(){return null;},
    addEventListener(type,handler){if(type==='click')clickHandlers.push(handler);},
    createElement(){return {classList:{add(){}},setAttribute(){},appendChild(){}};},
    head:{appendChild(){}},
  };
  const window={
    location:{href:'https://centrestjhotpot.ca/',pathname:'/',hostname:'centrestjhotpot.ca',search:'',hash:'',assign(){}},
    sessionStorage:{getItem(){return null;},setItem(){}},addEventListener(){},setTimeout(){},innerHeight:800,scrollY:0,
  };
  vm.runInNewContext(await read('../public/site-events.js'),{window,document,URL,URLSearchParams,Math,String,Object,Boolean,RegExp});
  const event={target:link,defaultPrevented:false,button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,
    preventDefault(){this.defaultPrevented=true;}};
  for(const handler of clickHandlers)handler(event);
  return event.defaultPrevented;
}

function bookingLink({direct=false}={}){
  return {
    href:'https://reservation.centrestjhotpot.ca/book',target:'',textContent:'Open booking page',className:'',
    classList:{contains(){return false;}},closest(selector){return selector==='a'?this:null;},
    getAttribute(name){return name==='href'?this.href:null;},
    hasAttribute(name){return name==='data-reservation-direct'?direct:false;},
  };
}

test('reservation modal keeps direct and telephone fallbacks',async()=>{
  const nav=await read('../app/site-nav.tsx');
  const layout=await read('../app/layout.tsx');
  const events=await read('../public/site-events.js');
  assert.match(nav,/href="https:\/\/reservation\.centrestjhotpot\.ca\/book"/);
  assert.match(layout,/href="tel:\+14034553188"/);
  assert.match(events,/import\("\/reservation-modal\.js\?v=20260914"\)/);
  assert.match(events,/online_booking_click/);
});

test('reservation launcher stays accessible and modal assets stay lazy',async()=>{
  const nav=await read('../app/site-nav.tsx');
  const events=await read('../public/site-events.js');
  assert.match(nav,/aria-haspopup="dialog"/);
  assert.match(nav,/data-reservation-launcher/);
  assert.match(events,/event\.preventDefault\(\)/);
  assert.match(events,/window\.location\.assign\(link\.href\)/);
  assert.match(events,/setAttribute\("aria-haspopup", "dialog"\)/);
  assert.doesNotMatch(events,/reservationLoader|reservationStyles/);
});

test('direct booking fallback is never intercepted by the dialog controller',async()=>{
  assert.equal(await reservationClickPrevented(bookingLink({direct:true})),false);
});

test('modal constrains iframe and lifecycle messages',async()=>{
  const modal=await read('../public/reservation-modal.js');
  assert.match(modal,/BOOKING_ORIGIN='https:\/\/reservation\.centrestjhotpot\.ca'/);
  assert.match(modal,/EMBED_URL=`\$\{BOOKING_ORIGIN\}\/embed\/book`/);
  assert.match(modal,/allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox/);
  assert.doesNotMatch(modal,/sandbox',\s*'[^']*allow-top-navigation/);
  assert.match(modal,/event\.origin!==BOOKING_ORIGIN/);
  assert.match(modal,/event\.source!==frame\.contentWindow/);
  assert.match(modal,/data\.source!=='hotpot-booking'/);
  assert.match(modal,/booking:ready/);
  assert.match(modal,/booking:dirty/);
  assert.match(modal,/booking:completed/);
  assert.match(modal,/booking:request-close/);
  assert.match(modal,/hotpot:booking-completed/);
  assert.doesNotMatch(modal,/postMessage/);
});

test('trusted message check requires exact origin source marker and payload',async()=>{
  const {trustedBookingMessage}=await import('../public/reservation-modal.js');
  const contentWindow={};
  const frame={contentWindow};
  const valid={
    origin:'https://reservation.centrestjhotpot.ca',
    source:contentWindow,
    data:{source:'hotpot-booking',type:'booking:ready'},
  };
  assert.equal(trustedBookingMessage(valid,frame),true);
  assert.equal(trustedBookingMessage({...valid,origin:'https://evil.example'},frame),false);
  assert.equal(trustedBookingMessage({...valid,source:{}},frame),false);
  assert.equal(trustedBookingMessage({...valid,data:{...valid.data,source:'other'}},frame),false);
  assert.equal(trustedBookingMessage({...valid,data:{...valid.data,privateUrl:'/b/#secret'}},frame),false);
});

test('modal protects dismissal and restores page state',async()=>{
  const modal=await read('../public/reservation-modal.js');
  assert.match(modal,/setTimeout\([\s\S]*},15_?000\)/);
  assert.match(modal,/reservation-dialog-confirm/);
  assert.match(modal,/if\(!dirty\)\{close\(\);return;\}/);
  assert.match(modal,/window\.scrollTo\(\{left:scrollX,top:scrollY/);
  assert.match(modal,/previousFocus[^\n]*focus\(\{preventScroll:true\}\)/);
  assert.match(modal,/href="\$\{BOOKING_URL\}" data-reservation-direct/);
  assert.doesNotMatch(modal,/backdrop[^\n]*addEventListener|reservation-dialog-backdrop[^\n]*onclick/);
});

test('reservation dialog is responsive and cache keys are current',async()=>{
  const css=await read('../public/reservation-modal.css');
  const layout=await read('../app/layout.tsx');
  const htmlFiles=[];
  async function collect(directory){
    for(const entry of await readdir(directory,{withFileTypes:true})){
      const url=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
      if(entry.isDirectory())await collect(url);
      else if(entry.name.endsWith('.html'))htmlFiles.push(url);
    }
  }
  await collect(new URL('../public/',import.meta.url));
  assert.match(css,/width:min\(640px,calc\(100vw - 32px\)\)/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/height:100dvh/);
  assert.match(css,/width:44px;height:44px/);
  assert.match(layout,/site-events\.js\?v=20260914-reservation-modal/);
  for(const file of htmlFiles){
    const html=await readFile(file,'utf8');
    assert.doesNotMatch(html,/site-events\.js\?v=20260829-conversion/,file.pathname);
  }
});
