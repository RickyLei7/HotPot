import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(process.env.BOOKING_CLIENT,'utf8');
const block=source.slice(source.indexOf('  function removeChallenge(){'),source.indexOf('  function renderTimeOptions('));
assert(block.includes('async function mountChallenge()'));
function harness({load='success'}={}){
 const elements=new Map();const $=id=>{if(!elements.has(id))elements.set(id,{hidden:false,disabled:false,textContent:'',value:'',dataset:{},replaceChildren(){}});return elements.get(id)};
 $('name').value='測試客人';$('phone').value='(403) 555-0100';$('note').value='Window seat';$('sms-consent').checked=false;$('form').hidden=false;
 const widgets=[],timers=new Map();let next=0;
 const turnstile={remove(){},render(target,options){widgets.push(options);return widgets.length}};
 const document={createElement(){return {remove(){}}},head:{append(script){if(load==='success')queueMicrotask(()=>script.onload());else if(load==='failure')queueMicrotask(()=>script.onerror())}}};
 const context=vm.createContext({$,document,window:{turnstile},bookingError:e=>e.code,bookingSubmitLabel:()=> 'Book now',setTimeout(fn){timers.set(++next,fn);return next},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(`let managing=false,challengeGeneration=0,challengeToken='',widget=null,scriptPromise=null,availability={siteKey:'test',reviewSlots:[]},reservedAt=123,pending=null,requiresReview=false;const message=(text='',error=false)=>{$('message').textContent=text;$('message').dataset.kind=error?'error':'ok'};${block};this.start=mountChallenge;this.remove=removeChallenge;`,context);
 return {$,widgets,start:context.start,remove:context.remove,timers,snapshot:()=>['name','phone','note'].map(id=>$(id).value).concat($('sms-consent').checked)};
}
for(const callback of ['expired-callback','timeout-callback','unsupported-callback','error-callback'])test(callback+' blocks submission, recovers and preserves guest fields',async()=>{
 const h=harness(),fields=h.snapshot();await h.start();let widget=h.widgets.at(-1);widget.callback('valid-one');assert.equal(h.$('submit').disabled,false);
 widget[callback]();assert.equal(h.$('submit').disabled,true);assert.equal(h.$('security-retry').hidden,false);assert(h.$('message').textContent);
 await h.start();assert.equal(h.$('submit').disabled,true);assert.equal(h.$('security-retry').hidden,true);
 widget.callback('stale-token');assert.equal(h.$('submit').disabled,true);
 h.widgets.at(-1).callback('valid-two');assert.equal(h.$('submit').disabled,false);assert.equal(h.$('message').textContent,'');assert.deepEqual(h.snapshot(),fields);
});
test('script download failure exposes retry and keeps guest fields',async()=>{const h=harness({load:'failure'}),fields=h.snapshot();await h.start();assert.equal(h.$('security-retry').hidden,false);assert.equal(h.$('submit').disabled,true);assert.deepEqual(h.snapshot(),fields)});
test('script download timeout exposes retry',async()=>{const h=harness({load:'timeout'});const pending=h.start();h.timers.values().next().value();await pending;assert.equal(h.$('security-retry').hidden,false);assert.equal(h.$('submit').disabled,true)});
test('closed form ignores a late script and creates no widget',async()=>{const h=harness();const pending=h.start();h.$('form').hidden=true;await pending;assert.equal(h.widgets.length,0);assert.equal(h.$('submit').disabled,true)});
test('changing selection invalidates the old security token and callbacks',async()=>{const h=harness();await h.start();const old=h.widgets[0];old.callback('old');h.remove();await h.start();old.callback('late');assert.equal(h.$('submit').disabled,true);h.widgets.at(-1).callback('new');assert.equal(h.$('submit').disabled,false)});
