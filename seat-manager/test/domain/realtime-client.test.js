import test from 'node:test';
import assert from 'node:assert/strict';
import { createRealtimeClient } from '../../src/client/realtime.js';

class FakeSocket {
  constructor() {
    this.readyState = 0;
    this.listeners = new Map();
  }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type,listeners);
  }
  emit(type, event = {}) {
    for (const listener of this.listeners.get(type) || []) listener(event);
  }
  open() { this.readyState=1; this.emit('open'); }
  message(value) { this.emit('message',{data:JSON.stringify(value)}); }
  close() { this.readyState=3; this.emit('close'); }
  async flush() { await Promise.resolve(); await Promise.resolve(); }
}

class FakeOnlineTarget {
  constructor() { this.listeners=new Map(); }
  addEventListener(type,listener) { this.listeners.set(type,listener); }
  removeEventListener(type) { this.listeners.delete(type); }
  emit(type) { this.listeners.get(type)?.(); }
}

test('connect fetches an authoritative snapshot before reporting online', async () => {
  const events=[];
  const fakeSocket=new FakeSocket();
  const client=createRealtimeClient({
    socketFactory:()=> fakeSocket,
    loadSnapshot:async()=> {events.push('load');return {revision:7};},
    onSnapshot:value=> events.push(`snapshot:${value.revision}`),
    onState:value=> events.push(value),
    schedule:callback=> callback()
  });
  await client.connect();
  fakeSocket.open();
  await fakeSocket.flush();
  assert.deepEqual(events.slice(-3),['load','snapshot:7','online']);
  assert.equal(client.getState(),'online');
});

test('snapshot messages replace local state', async () => {
  const snapshots=[];
  const fakeSocket=new FakeSocket();
  const client=createRealtimeClient({
    socketFactory:()=> fakeSocket,
    loadSnapshot:async()=> ({revision:1}),
    onSnapshot:value=> snapshots.push(value),
    onState:()=> {}
  });
  await client.connect();
  fakeSocket.open();
  await fakeSocket.flush();
  fakeSocket.message({type:'snapshot',revision:2,snapshot:{revision:2,walkins:[{id:'w1'}]}});
  assert.deepEqual(snapshots.at(-1),{revision:2,walkins:[{id:'w1'}]});
});

test('reconnect delays use 1, 2, 4, 8, then capped 15 seconds', async () => {
  const delays=[];
  const callbacks=[];
  const sockets=[];
  const client=createRealtimeClient({
    socketFactory:()=> {const socket=new FakeSocket();sockets.push(socket);return socket;},
    loadSnapshot:async()=> ({revision:1}),onSnapshot:()=> {},onState:()=> {},
    schedule:(callback,delay)=> {callbacks.push(callback);delays.push(delay);return callbacks.length;},
    cancelSchedule:()=> {}
  });
  await client.connect();
  for (let attempt=0;attempt<6;attempt+=1) {
    sockets.at(-1).close();
    callbacks.shift()();
  }
  assert.deepEqual(delays,[1000,2000,4000,8000,15000,15000]);
});

test('browser offline disables realtime and online reconnects immediately', async () => {
  const states=[];
  const sockets=[];
  const onlineTarget=new FakeOnlineTarget();
  const client=createRealtimeClient({
    socketFactory:()=> {const socket=new FakeSocket();sockets.push(socket);return socket;},
    loadSnapshot:async()=> ({revision:1}),onSnapshot:()=> {},
    onState:value=> states.push(value),onlineTarget,
    schedule:()=> {throw new Error('offline should not schedule a delayed reconnect');},
    cancelSchedule:()=> {}
  });
  await client.connect();
  onlineTarget.emit('offline');
  assert.equal(client.getState(),'offline');
  onlineTarget.emit('online');
  assert.equal(sockets.length,2);
  assert.equal(client.getState(),'reconnecting');
  client.disconnect();
  assert.equal(client.getState(),'offline');
  assert.equal(onlineTarget.listeners.size,0);
});
