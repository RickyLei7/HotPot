import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(process.env.BOOKING_CLIENT,'utf8');
const start=source.indexOf("  $('form').addEventListener('keydown',event=>{");
const end=source.indexOf("\n  $('submit').onclick=",start);
assert(start>0&&end>start);
function harness(){
 const counts={prevent:0,focus:0,blur:0};let handler;
 const name={tagName:'INPUT',type:'text',blur(){counts.blur++}};
 const phone={tagName:'INPUT',type:'tel',focus(){counts.focus++},blur(){counts.blur++}};
 const fields={name,phone,form:{addEventListener(type,fn){assert.equal(type,'keydown');handler=fn}}};
 vm.runInNewContext(source.slice(start,end),{$:id=>fields[id]});
 return {counts,name,phone,send(target,props={}){handler({key:'Enter',isComposing:false,keyCode:13,target,preventDefault(){counts.prevent++},...props})}};
}
for(const [label,props] of [['active composition',{isComposing:true}],['Safari composition commit',{isComposing:false,keyCode:229}]]){
 test(label+' keeps name focus and native candidate selection',()=>{const h=harness();h.send(h.name,props);assert.deepEqual(h.counts,{prevent:0,focus:0,blur:0})});
 test(label+' keeps telephone focus',()=>{const h=harness();h.send(h.phone,props);assert.deepEqual(h.counts,{prevent:0,focus:0,blur:0})});
}
test('ordinary Enter moves name to telephone without submitting',()=>{const h=harness();h.send(h.name);assert.deepEqual(h.counts,{prevent:1,focus:1,blur:0})});
test('ordinary Enter on telephone dismisses keyboard without submitting',()=>{const h=harness();h.send(h.phone);assert.deepEqual(h.counts,{prevent:1,focus:0,blur:1})});
test('textarea retains native newlines',()=>{const h=harness();h.send({tagName:'TEXTAREA'});assert.deepEqual(h.counts,{prevent:0,focus:0,blur:0})});
test('radio Enter retains native behavior',()=>{const h=harness();h.send({tagName:'INPUT',type:'radio'});assert.deepEqual(h.counts,{prevent:0,focus:0,blur:0})});
