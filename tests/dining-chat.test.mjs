import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const code = await readFile(new URL('../public/dining-chat.js', import.meta.url), 'utf8');

function harness(small = true) {
  let document;
  class Element {
    constructor() { this.dataset = {}; this.attributes = {}; this.children = []; this.inert = false; this.hidden = true; this.isConnected = true; this.listeners = new Map(); this.style = { overflow:'auto', setProperty() {} }; this.classes = new Set(); this.classList = { add:x=>this.classes.add(x), remove:x=>this.classes.delete(x), toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x), contains:x=>this.classes.has(x) }; }
    append(child) { this.children.push(child); child.parentElement = this; }
    addEventListener(name, cb) { this.listeners.set(name, cb); }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
    closest() { return this; }
    focus() { document.activeElement = this; }
    blur() { if (document.activeElement === this) document.activeElement = null; }
    getClientRects() { return [{}]; }
  }
  const body = new Element(), nav = new Element(), wrapper = new Element(), main = new Element(), root = new Element();
  body.append(nav); body.append(wrapper); wrapper.append(main); wrapper.append(root);
  const panel = new Element(), launcher = new Element(), home = new Element(), backdrop = new Element(), close = new Element(), input = new Element(), privacy = new Element();
  nav.inert = true; // A pre-existing inert state must survive chat.
  root.dataset.language = 'en';
  root.querySelector = selector => ({ '[data-chat-panel]':panel, '[data-chat-launcher]':launcher, '.dining-chat-backdrop':backdrop, textarea:input, '.dining-chat-close':close })[selector];
  root.querySelectorAll = () => [backdrop, close];
  panel.querySelectorAll = () => [close, input, privacy];
  home.setAttribute('data-chat-open', ''); launcher.setAttribute('data-chat-open', '');
  const listeners = new Map(), windowListeners = new Map(), viewportListeners = new Map(), media = { matches:small };
  let booking = false;
  document = { body, readyState:'complete', activeElement:null, querySelector: selector => selector === '[data-dining-helper]' ? root : booking ? new Element() : null,
    querySelectorAll:()=>[home,launcher], addEventListener:(name,cb)=>listeners.set(name,cb) };
  const window = { matchMedia:()=>media, innerHeight:580, visualViewport:{height:580,offsetTop:0,addEventListener:(name,cb)=>viewportListeners.set(name,cb)}, addEventListener:(name,cb)=>windowListeners.set(name,cb) };
  vm.runInNewContext(code, { document, window });
  const open = () => listeners.get('click')({target:home,preventDefault(){}});
  return { window, body, nav, main, root, panel, launcher, home, close, input, privacy, backdrop, document, media, listeners, windowListeners, viewportListeners, open, setBooking:value=>{booking=value;} };
}

test('chat opens only deliberately, is idempotent, preserves existing inert states and restores focus', () => {
  const c = harness();
  assert.equal(c.panel.hidden, true);
  assert.equal(c.launcher.hidden, false);
  c.listeners.get('hotpot:page-ready')();
  c.open();
  assert.equal(c.panel.hidden, false);
  assert.equal(c.panel.attributes['aria-modal'], 'true');
  assert.equal(c.main.inert, true, 'nested page background is inert');
  assert.equal(c.body.style.overflow, 'hidden');
  assert.equal(c.document.activeElement, c.close, 'opening does not invoke the keyboard');
  c.close.listeners.get('click')();
  assert.equal(c.main.inert, false);
  assert.equal(c.nav.inert, true);
  assert.equal(c.body.style.overflow, 'auto');
  assert.equal(c.document.activeElement, c.home);
});

test('mobile focus wraps, Escape closes and desktop remains non-modal after resizing', () => {
  const c = harness(); c.open();
  c.privacy.focus();
  c.panel.listeners.get('keydown')({key:'Tab',preventDefault(){}});
  assert.equal(c.document.activeElement, c.close);
  c.panel.listeners.get('keydown')({key:'Tab',shiftKey:true,preventDefault(){}});
  assert.equal(c.document.activeElement, c.privacy);
  c.media.matches = false; c.windowListeners.get('resize')();
  assert.equal(c.panel.attributes['aria-modal'], undefined);
  assert.equal(c.main.inert, false);
  assert.equal(c.body.style.overflow, 'auto');
  c.panel.listeners.get('keydown')({key:'Escape',preventDefault(){},stopPropagation(){}});
  assert.equal(c.panel.hidden, true);
});

test('booking handoff closes and releases chat synchronously; chat cannot reopen over booking', () => {
  const c = harness(); c.open(); c.input.focus();
  c.listeners.get('hotpot:booking-opening')();
  assert.equal(c.panel.hidden, true);
  assert.equal(c.main.inert, false);
  assert.equal(c.body.style.overflow, 'auto');
  assert.equal(c.document.activeElement, null, 'input is blurred before booking opens');
  c.setBooking(true); c.open();
  assert.equal(c.panel.hidden, true);
  c.setBooking(false); c.open();
  assert.equal(c.panel.hidden, false);
});

// iOS keyboards resize visualViewport while the layout viewport can remain tall.
test('chat responds to keyboard viewport height and restores the full layout on dismiss', () => {
  const c = harness();
  c.open();
  assert.equal(c.root.classes.has('is-chat-compact'), false);
  c.window.visualViewport.height = 280;
  c.viewportListeners.get('resize')();
  assert.equal(c.root.classes.has('is-chat-compact'), true);
  assert.equal(c.panel.hidden, false);
  c.window.visualViewport.height = 844;
  c.viewportListeners.get('resize')();
  assert.equal(c.root.classes.has('is-chat-compact'), false);
  c.close.listeners.get('click')();
  assert.equal(c.main.inert, false);
});
