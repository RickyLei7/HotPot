const BOOKING_ORIGIN='https://reservation.centrestjhotpot.ca';
const BOOKING_URL=`${BOOKING_ORIGIN}/book`;
const EMBED_URL=`${BOOKING_ORIGIN}/embed/book`;
let activeDialog=null;

export function trustedBookingMessage(event,frame){
  const data=event.data;
  if(event.origin!==BOOKING_ORIGIN||event.source!==frame.contentWindow||!data||data.source!=='hotpot-booking'||typeof data.type!=='string')return false;
  const fieldsByType={
    'booking:ready':['source','type'],
    'booking:dirty':['source','type','dirty'],
    'booking:completed':['source','type','status'],
    'booking:request-close':['source','type']
  };
  const fields=Object.prototype.hasOwnProperty.call(fieldsByType,data.type)?fieldsByType[data.type]:null;
  return Boolean(fields&&Object.keys(data).length===fields.length&&Object.keys(data).every(key=>fields.includes(key))
    &&(data.type!=='booking:dirty'||typeof data.dirty==='boolean')
    &&(data.type!=='booking:completed'||['confirmed','pending'].includes(data.status)));
}

export function openReservationModal({trigger,language='en'}={}){
  if(activeDialog)return activeDialog;
  if(!document.querySelector('link[data-reservation-style]')){
    const stylesheet=document.createElement('link');
    stylesheet.rel='stylesheet';stylesheet.href='/reservation-modal.css?v=20260914';
    stylesheet.dataset.reservationStyle='';document.head.append(stylesheet);
  }
  const zh=language==='zh-Hant';
  const root=document.createElement('dialog');
  root.className='reservation-dialog-root';
  root.setAttribute('aria-labelledby','reservation-dialog-title');
  root.setAttribute('aria-modal','true');
  root.setAttribute('role','dialog');
  // This template contains static interface text only, never booking data.
  root.innerHTML=`<div class="reservation-dialog-backdrop" aria-hidden="true"></div>
    <section class="reservation-dialog">
      <header class="reservation-dialog-header">
        <h2 id="reservation-dialog-title" tabindex="-1">${zh?'預訂座位 / Reserve a Table':'Reserve a Table / 預訂座位'}</h2>
        <button class="reservation-dialog-close" type="button" aria-label="${zh?'關閉訂位視窗':'Close reservation dialog'}">×</button>
      </header>
      <div class="reservation-dialog-content">
        <div class="reservation-dialog-loading" role="status" aria-live="polite">
          <p class="reservation-dialog-status">${zh?'正在準備訂位表格…':'Getting your booking form ready…'}</p>
          <button class="reservation-dialog-retry" type="button" hidden>${zh?'再試一次':'Try again'}</button>
          <a class="reservation-dialog-fallback" href="${BOOKING_URL}" data-reservation-direct>Open booking page / 打開訂位頁面</a>
        </div>
        <div class="reservation-dialog-confirm" role="alertdialog" aria-modal="true" aria-labelledby="reservation-discard-title" hidden>
          <h3 id="reservation-discard-title">${zh?'要離開訂位表格嗎？':'Leave this booking form?'}</h3>
          <p>${zh?'尚未提交的資料將不會儲存。':'Your unfinished details will not be saved.'}</p>
          <button class="reservation-dialog-keep" type="button">${zh?'繼續填寫':'Keep filling in'}</button>
          <button class="reservation-dialog-discard" type="button">${zh?'離開':'Leave form'}</button>
        </div>
      </div>
    </section>`;
  const find=selector=>root.querySelector(selector);
  const content=find('.reservation-dialog-content');
  const loading=find('.reservation-dialog-loading');
  const status=find('.reservation-dialog-status');
  const retry=find('.reservation-dialog-retry');
  const confirmation=find('.reservation-dialog-confirm');
  const heading=find('#reservation-dialog-title');
  const closeButton=find('.reservation-dialog-close');
  const previousFocus=trigger||document.activeElement;
  const scrollX=window.scrollX,scrollY=window.scrollY;
  const body=document.body;
  const properties=['position','top','left','width','overflow'];
  const bodyStyles=properties.map(name=>[name,body.style.getPropertyValue(name),body.style.getPropertyPriority(name)]);
  let frame,dirty=false,ready=false,completed=false,timer;
  function close(){
    clearTimeout(timer);window.removeEventListener('message',onMessage);
    root.close();root.remove();activeDialog=null;
    for(const [name,value,priority] of bodyStyles){
      if(value)body.style.setProperty(name,value,priority);else body.style.removeProperty(name);
    }
    window.scrollTo({left:scrollX,top:scrollY,behavior:'instant'});
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  function requestClose(){
    if(!dirty){close();return;}
    confirmation.hidden=false;frame.inert=true;loading.inert=true;closeButton.inert=true;
    find('.reservation-dialog-keep').focus();
  }
  function keep(){
    confirmation.hidden=true;frame.inert=false;loading.inert=false;closeButton.inert=false;
    closeButton.focus();
  }
  function load(){
    clearTimeout(timer);frame?.remove();ready=false;completed=false;dirty=false;
    loading.hidden=false;retry.hidden=true;
    status.textContent=zh?'正在準備訂位表格…':'Getting your booking form ready…';
    frame=document.createElement('iframe');
    frame.title=zh?'網上訂位表格':'Online reservation form';
    // Private booking-management links leave the embedded form only after an
    // explicit customer click. Popups need this narrow allowance; top-level
    // navigation remains blocked because no navigation permission is granted.
    // A private guest link may open only as a new, detached tab.  The iframe
    // never receives top-navigation permission, so it cannot replace the
    // restaurant website.
    frame.setAttribute('sandbox','allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    frame.referrerPolicy='no-referrer';frame.src=EMBED_URL;
    frame.style.visibility='hidden';frame.inert=true;content.prepend(frame);
    frame.addEventListener('error',()=>{
      clearTimeout(timer);
      status.textContent=zh?'表格未能載入，請再試一次。':'The form could not load. Please try again.';
      retry.hidden=false;
    });
    timer=setTimeout(()=>{
      status.textContent=zh?'表格未能載入，請再試一次。':'The form is taking a little longer. Please try again.';
      retry.hidden=false;
    },15000);
  }
  function onMessage(event){
    if(!trustedBookingMessage(event,frame))return;
    const data=event.data;
    if(data.type==='booking:ready'){
      ready=true;clearTimeout(timer);loading.hidden=true;
      frame.style.visibility='';frame.inert=!confirmation.hidden;
    }else if(data.type==='booking:dirty'){
      // Honor dirty immediately, including during initialization, to avoid lost input.
      dirty=data.dirty;
    }else if(data.type==='booking:completed'&&ready&&!completed){
      completed=true;dirty=false;
      window.dispatchEvent(new CustomEvent('hotpot:booking-completed',{detail:{status:data.status}}));
    }else if(data.type==='booking:request-close')requestClose();
  }
  closeButton.onclick=requestClose;
  find('.reservation-dialog-keep').onclick=keep;
  find('.reservation-dialog-discard').onclick=close;
  retry.onclick=load;
  root.addEventListener('cancel',event=>{event.preventDefault();if(confirmation.hidden)requestClose();else keep();});
  window.addEventListener('message',onMessage);
  document.body.append(root);
  try{root.showModal();}catch(error){window.removeEventListener('message',onMessage);root.remove();throw error;}
  body.style.position='fixed';body.style.top=`-${scrollY}px`;body.style.left=`-${scrollX}px`;
  body.style.width='100%';body.style.overflow='hidden';
  activeDialog=root;load();heading.focus({preventScroll:true});
  return root;
}
