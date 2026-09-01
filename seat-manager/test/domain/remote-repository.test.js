import test from 'node:test';
import assert from 'node:assert/strict';
import { createRemoteRepository } from '../../src/data/remote-repository.js';
import { createAuthClient } from '../../src/client/auth.js';

const jsonResponse = (body,status=200) => new Response(JSON.stringify(body),{
  status,headers:{'Content-Type':'application/json'}
});

test('load requests the authorized no-store snapshot',async()=>{
  const calls=[];
  const repo=createRemoteRepository({
    fetchImpl:async(url,options)=>{calls.push([url,options]);return jsonResponse({snapshot:{revision:4}});},
    getCsrfToken:()=> 'csrf-1'
  });
  assert.deepEqual(await repo.load(),{revision:4});
  assert.deepEqual(calls,[['/api/snapshot',{credentials:'same-origin',cache:'no-store'}]]);
});

test('command sends the same idempotency key and CSRF without discarding conflict details',async()=>{
  let request;
  const fetchImpl=async(url,options)=>{
    request={url,options};
    return jsonResponse({
      code:'TABLE_OCCUPIED',message:'桌位刚被其他设备更新',snapshot:{revision:8}
    },409);
  };
  const repo=createRemoteRepository({fetchImpl,getCsrfToken:()=> 'csrf-1'});
  const command={type:'party.seat',idempotencyKey:'seat-1'};
  await assert.rejects(repo.command(command),error=>{
    assert.equal(error.status,409);
    assert.equal(error.code,'TABLE_OCCUPIED');
    assert.equal(error.snapshot.revision,8);
    return true;
  });
  assert.equal(request.url,'/api/commands');
  assert.equal(request.options.headers['X-CSRF-Token'],'csrf-1');
  assert.deepEqual(JSON.parse(request.options.body),command);
});

test('auth client creates one non-personal device ID and reuses it for login',async()=>{
  const mem=new Map();
  const storage={getItem:key=>mem.get(key)??null,setItem:(key,value)=>mem.set(key,value)};
  const requests=[];
  const client=createAuthClient({
    storage,uid:()=> 'random-device-id',
    fetchImpl:async(url,options)=>{requests.push([url,options]);return jsonResponse({authenticated:true,csrfToken:'csrf',expiresAt:99});}
  });
  assert.equal(client.getDeviceId(),'random-device-id');
  assert.equal(client.getDeviceId(),'random-device-id');
  assert.deepEqual(await client.login('2468'),{authenticated:true,csrfToken:'csrf',expiresAt:99});
  assert.equal(requests.length,1);
  assert.deepEqual(JSON.parse(requests[0][1].body),{pin:'2468',deviceId:'random-device-id'});
  assert.equal(requests[0][1].credentials,'same-origin');
});

test('auth client rejects anything other than exactly four digits before sending',async()=>{
  let calls=0;
  const client=createAuthClient({
    storage:{getItem:()=>null,setItem:()=>{}},uid:()=> 'random-device-id',
    fetchImpl:async()=>{calls+=1;return jsonResponse({});}
  });
  for(const pin of ['123','12345','12x4',1234]) {
    await assert.rejects(client.login(pin),error=>error.code==='PIN_FORMAT');
  }
  assert.equal(calls,0);
});

test('session and logout use same-origin credentials and session CSRF',async()=>{
  const calls=[];
  const responses=[
    jsonResponse({authenticated:true,csrfToken:'csrf-2',expiresAt:100}),
    jsonResponse({authenticated:false})
  ];
  const client=createAuthClient({
    storage:{getItem:()=> 'device-existing',setItem:()=>{}},uid:()=> 'unused',
    fetchImpl:async(url,options)=>{calls.push([url,options]);return responses.shift();}
  });
  const session=await client.session();
  await client.logout(session.csrfToken);
  assert.deepEqual(calls,[
    ['/api/session',{credentials:'same-origin',cache:'no-store'}],
    ['/api/logout',{
      method:'POST',credentials:'same-origin',
      headers:{'X-CSRF-Token':'csrf-2'}
    }]
  ]);
});

test('HTTP client errors preserve retry and cooldown fields',async()=>{
  const client=createAuthClient({
    storage:{getItem:()=> 'device-existing',setItem:()=>{}},uid:()=> 'unused',
    fetchImpl:async()=>jsonResponse({
      code:'LOGIN_COOLDOWN',retryAfterSeconds:900,authenticated:false
    },429)
  });
  await assert.rejects(client.login('2468'),error=>{
    assert.equal(error.status,429);
    assert.equal(error.code,'LOGIN_COOLDOWN');
    assert.equal(error.retryAfterSeconds,900);
    return true;
  });
});
