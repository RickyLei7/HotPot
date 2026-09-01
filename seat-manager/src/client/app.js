import { RESTAURANT_TABLES, formatTableCardNumber, formatTableReference } from '../domain/tables.js';
import { OCCUPANCY_WINDOW_MS, applyReservationEdit, availableTablesAt, buildTodayReservationPreview, buildUpcomingReservationStats, canSeatWithoutReservationConflict, diningStartsAt, findBestTableCombination, findPartyWithKind, formatTableClockTime, formatWaitDuration, isTablePlanConfirmed, markWalkInNotified, nextAnonymousWalkInName, normalizeAnonymousGuestName, notificationWindowState, partitionReservationsByDay, rankTableCombinations, recommendWalkInSeat, requiresTableConfirmation, summarizeReservations, tableDropMode } from '../domain/scheduler.js';
import { createAuthClient } from './auth.js';
import { createRealtimeClient } from './realtime.js';
import { createRemoteRepository } from '../data/remote-repository.js';

const app=document.querySelector('#app');
const authClient=createAuthClient({storage:window.localStorage});
let authSession=null;
const repo=createRemoteRepository({getCsrfToken:()=>authSession?.csrfToken??''});
let realtimeClient=null;
let connectionState='offline';
let state={walkins:[],reservations:[],occupancies:[],revision:0};
let modal=null;
let toastTimer=null;
let dragState=null;
const APP_VERSION='2026.09.01';

const uid=()=>crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const now=()=>Date.now();
const esc=(s='')=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtTime=ms=>new Intl.DateTimeFormat('en-CA',{hour:'numeric',minute:'2-digit'}).format(new Date(ms));
const fmtDate=ms=>new Intl.DateTimeFormat('en-CA',{weekday:'short',month:'short',day:'numeric'}).format(new Date(ms));
const fmtDay=ms=>new Intl.DateTimeFormat('zh-CN',{weekday:'short',month:'numeric',day:'numeric'}).format(new Date(ms));
const toLocalDateTimeInput=ms=>{const date=new Date(ms);date.setMinutes(date.getMinutes()-date.getTimezoneOffset());return date.toISOString().slice(0,16)};
const minutesWait=created=>Math.max(0,Math.floor((now()-created)/60000));
const persist=()=>{};
function update(mutator){state=mutator(structuredClone(state));persist();render()}
function toast(message){clearTimeout(toastTimer);let old=document.querySelector('.toast');if(old)old.remove();const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.appendChild(el);toastTimer=setTimeout(()=>el.remove(),2600)}
function renderLoading(message='正在连接餐厅资料…'){
  app.innerHTML=`<section class="login-shell"><div class="login-card loading-card"><div class="login-mark">鼎鑽</div><h1>Hotpot Seat Manager</h1><div class="loading-line"><span></span>${esc(message)}</div></div></section>`;
}
function renderPin(error=''){
  connectionState='offline';
  app.innerHTML=`<section class="login-shell"><div class="login-card"><div class="login-mark">鼎鑽</div><p class="login-eyebrow">STAFF ONLY · 员工使用</p><h1>Hotpot Seat Manager</h1><p class="login-copy">输入店内共用的 4 位密码</p><form id="pin-form"><label for="staff-pin">Staff PIN / 员工密码</label><input id="staff-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required autofocus><button class="btn primary full" type="submit">进入订位系统</button><p class="login-error" role="alert">${esc(error)}</p></form><p class="privacy-note">不会记录员工姓名或个人 Apple / Google 账号</p></div></section>`;
  app.querySelector('#pin-form').addEventListener('submit',submitLogin);
}
function loginErrorMessage(error){
  if(error?.code==='LOGIN_COOLDOWN')return `尝试次数太多，请在 ${Math.ceil(Number(error.retryAfterSeconds||60)/60)} 分钟后再试`;
  if(error?.code==='PIN_FORMAT')return '请输入 4 位数字密码';
  if(error?.status===401)return '密码不正确，请重新输入';
  return '暂时无法连接，请检查网络后重试';
}
async function submitLogin(event){
  event.preventDefault();
  const form=event.currentTarget;const pin=String(new FormData(form).get('pin')||'');
  const button=form.querySelector('button');button.disabled=true;button.textContent='正在验证…';
  try{authSession=await authClient.login(pin);form.reset();await startDashboard()}
  catch(error){renderPin(loginErrorMessage(error))}
}
async function startDashboard(){
  renderLoading('正在读取最新订位和桌位…');
  state=await repo.load();
  render();
  realtimeClient?.disconnect();
  realtimeClient=createRealtimeClient({
    loadSnapshot:()=>repo.load(),
    onSnapshot:snapshot=>{state=snapshot;render()},
    onState:next=>{connectionState=next;render()}
  });
  await realtimeClient.connect();
}
async function logoutStaff(){
  try{
    await authClient.logout(authSession?.csrfToken??'');
    realtimeClient?.disconnect();authSession=null;modal=null;state={walkins:[],reservations:[],occupancies:[],revision:0};renderPin();
  }catch{toast('暂时无法安全退出，请检查网络后重试')}
}
async function bootstrap(){
  renderLoading();
  try{authSession=await authClient.session();await startDashboard()}
  catch(error){if(error?.status===401)renderPin();else renderPin('暂时无法连接，请检查网络后重试')}
}
function refreshWaitTimers(){const tick=now();let notificationExpired=false;app.querySelectorAll('[data-wait-started]').forEach(el=>{el.textContent=formatWaitDuration(Number(el.dataset.waitStarted),tick)});app.querySelectorAll('[data-notified-started]').forEach(el=>{const windowState=notificationWindowState({status:'notified',notifiedAt:Number(el.dataset.notifiedStarted)},tick);el.textContent=formatWaitDuration(Number(el.dataset.notifiedStarted),tick);const button=el.closest('.notify-only');if(windowState.expired&&!button?.classList.contains('expired'))notificationExpired=true});if(notificationExpired&&!modal&&!dragState)render()}
function currentOccupancy(tableId){return state.occupancies.find(o=>o.tableId===tableId && o.expectedEndAt>now())}
function activeReservation(r){return ['confirmed','arrived'].includes(r.status)}
function reservationEligible(r){return activeReservation(r) && isTablePlanConfirmed(r)}
function waitingWalkins(){return state.walkins.filter(w=>['waiting','notified'].includes(w.status)).sort((a,b)=>a.createdAt-b.createdAt)}
function nextReservation(){return partitionReservationsByDay(state.reservations.filter(reservationEligible),now()).today.filter(r=>r.reservedAt>=now()-15*60000)[0]}
function waitBadge(min){return min>=30?'hot':min>=20?'warn':''}
function estimateWait(w){
  const times=[now(),...state.occupancies.filter(o=>o.expectedEndAt>now()).map(o=>o.expectedEndAt)].sort((a,b)=>a-b);
  for(const t of [...new Set(times)]){
    const simulatedOcc=state.occupancies.filter(o=>o.expectedEndAt>t);
    const rec=recommendWalkInSeat({now:t,walkins:[w],reservations:state.reservations,occupancies:simulatedOcc});
    if(rec) return Math.max(0,Math.ceil((t-now())/60000));
  }
  return null;
}
function recommendation(){return recommendWalkInSeat({now:now(),walkins:state.walkins,reservations:state.reservations,occupancies:state.occupancies})}
function partyById(id){return findPartyWithKind(state,id)?.party}
function activeReservationGroups(){return partitionReservationsByDay(state.reservations.filter(activeReservation),now())}
function localDayKey(ms){const date=new Date(ms);return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`}
function reservationsForDate(reservations,dateStart){const key=localDayKey(dateStart);return reservations.filter(r=>localDayKey(r.reservedAt)===key).sort((a,b)=>a.reservedAt-b.reservedAt)}
function groupReservationsByDate(reservations){
  const groups=[];
  for(const reservation of [...reservations].sort((a,b)=>a.reservedAt-b.reservedAt)){
    const key=localDayKey(reservation.reservedAt);let group=groups.find(item=>item.key===key);
    if(!group){group={key,dateStart:reservation.reservedAt,reservations:[]};groups.push(group)}
    group.reservations.push(reservation);
  }
  return groups;
}

function render(){
  const rec=recommendation(); const recParty=rec?partyById(rec.walkInId):null; const next=nextReservation();
  const free=availableTablesAt(now(),state.occupancies).length; const waiters=waitingWalkins();
  const {today,upcoming}=activeReservationGroups();const todaySummary=summarizeReservations(today);const upcomingSummary=summarizeReservations(upcoming);
  const connectionLabel={online:'Online / 在线',reconnecting:'Reconnecting / 重新连接',offline:'Offline / 离线'}[connectionState];
  app.innerHTML=`<div class="app-shell">
    <header class="topbar">
      <div class="brand"><h1>Hotpot Seat Manager <span class="version">v${APP_VERSION}</span></h1><p>鼎鑽火鍋 · ${new Intl.DateTimeFormat('en-CA',{weekday:'long',month:'short',day:'numeric'}).format(new Date())} · 90 min + 10 min turn</p></div>
      <div class="header-controls"><div class="session-controls"><span class="connection-state ${connectionState}" role="status"><i></i>${connectionLabel}</span><button class="logout-button" data-action="logout">Logout / 安全退出</button></div><div class="top-actions"><button class="btn" data-action="add-reservation">+ Reservation</button><button class="btn primary" data-action="add-walkin">+ Walk-in</button></div></div>
    </header>
    <section class="stats">
      <div class="stat"><span>Free tables 空桌</span><strong>${free}</strong><div class="sub">of 10 tables</div></div>
      <div class="stat"><span>Waiting 排队</span><strong>${waiters.length}</strong><div class="sub">${waiters.reduce((s,w)=>s+w.partySize,0)} guests</div></div>
      <button class="stat stat-button" data-action="show-today-stats"><span>Today reservations 今日订位</span><strong>${todaySummary.guestCount}</strong><div class="sub">${todaySummary.groupCount} groups${next?` · Next ${fmtTime(next.reservedAt)}`:' · No more today'}</div></button>
      <button class="stat stat-button" data-action="show-upcoming-stats"><span>Upcoming 未来订位</span><strong>${upcomingSummary.guestCount}</strong><div class="sub">${upcomingSummary.groupCount} groups · 查看14天趋势</div></button>
    </section>
    ${rec && recParty ? `<section class="recommend"><span class="pulse"></span><div class="recommend-main"><div class="recommend-label">SEAT NEXT · 系统建议</div><strong>${esc(recParty.name)} · ${recParty.partySize}人 → ${formatTableReference(rec.tableIds)}</strong><div class="recommend-detail">等候 ${minutesWait(recParty.createdAt)} 分钟 · 不影响后面的订位</div></div><button class="btn" data-action="auto-seat" data-id="${recParty.id}">Seat now 入座</button></section>` : `<section class="recommend empty"><span class="pulse"></span><div class="recommend-main"><div class="recommend-label">SEAT NEXT · 系统建议</div><strong>目前没有需要立即安排的 Walk-in</strong><div class="recommend-detail">有空桌时系统会自动挑选合适的下一组</div></div></section>`}
    <div class="layout">
      <section class="panel"><div class="panel-title"><h2>Tables 桌位</h2><span>绿色 = 空桌</span></div><div class="tables">${RESTAURANT_TABLES.map(renderTable).join('')}</div></section>
      <div class="stack">
        <section class="panel service-panel walkin-panel"><div class="panel-title"><h2>Walk-in Queue 排队</h2><span>${waiters.length} groups</span></div><div class="list">${waiters.length?waiters.map(renderWalkin).join(''):'<div class="empty-state">现在没有排队客人</div>'}</div></section>
        <section class="panel service-panel reservations-panel"><div class="panel-title"><h2>Reservations 订位</h2><span>迟到保留 15 分钟 · Hold for 15 min</span></div><div class="list">${renderReservations()}</div></section>
      </div>
    </div>
  </div>${modal?renderModal():''}`;
  bindEvents();
}

function renderTable(t){
  const o=currentOccupancy(t.id);
  return `<article class="table-card ${o?'busy':'free'}" data-drop-table="${t.id}"><div class="table-head"><span class="table-name">${formatTableCardNumber(t.id)}</span><span class="capacity">${t.capacity} seats</span></div>${o?`<div class="table-status"><strong class="guest-name">${esc(normalizeAnonymousGuestName(o.partyName))}</strong><span>${o.partySize} 人</span></div><div class="table-actions"><div class="dining-start">开始吃 ${formatTableClockTime(diningStartsAt(o.seatedAt))}</div><div class="table-foot">预计 ${fmtTime(o.expectedEndAt)} 空桌</div><button class="table-clear" data-action="clear-table" data-table="${t.id}">Clear / 清桌</button></div>`:'<div class="availability"><strong>空桌</strong><span>Available</span></div>'}</article>`;
}
function renderWalkin(w){
  const wait=minutesWait(w.createdAt), needsConfirmation=requiresTableConfirmation(w.partySize)&&!isTablePlanConfirmed(w);
  const est=needsConfirmation?null:estimateWait(w);const notified=w.status==='notified';
  const notifyState=notificationWindowState(w,now());
  const planBadge=requiresTableConfirmation(w.partySize)?`<span class="badge ${needsConfirmation?'warn':'ok'}">${needsConfirmation?'待确认拼桌':'拼桌已确认'}</span>`:'';
  const statusText=needsConfirmation?'需先确认拼桌':notifyState.expired?'已通知超过5分钟 · 可安排下一组':notified?'已通知 · 5分钟内回来':est===0?'有合适桌位':est!=null?`预计约 ${est} 分钟`:'暂时无法估算';
  const phoneControl=w.phone?`<div class="phone-reveal"><span>Phone 电话</span><strong>${esc(w.phone)}</strong></div>`:'';
  const notifyButton=notified
    ? `<button class="btn small notify-only notified ${notifyState.expired?'expired':''}" data-action="notify" data-id="${w.id}"><span>Notify again / 再次通知</span><small>已通知 <strong data-notified-started="${w.notifiedAt}">${formatWaitDuration(w.notifiedAt,now())}</strong>${notifyState.expired?' · 可安排下一组':' · 5分钟内回来'}</small></button>`
    : `<button class="btn small notify-only" data-action="notify" data-id="${w.id}">Notify / 通知</button>`;
  return `<article class="row ${needsConfirmation?'':'drag-ready'}" ${needsConfirmation?'':`data-drag-party="${w.id}"`}><div class="row-top"><div><div class="row-name"><span class="guest-name">${esc(normalizeAnonymousGuestName(w.name))}</span> · ${w.partySize}人 ${planBadge}</div><div class="row-meta">${w.phone?'已留电话':'No phone'} · ${statusText}</div></div><div class="row-right"><div class="wait" data-wait-started="${w.createdAt}">${formatWaitDuration(w.createdAt,now())}</div><span class="badge ${notifyState.expired?'hot':waitBadge(wait)}">${notifyState.expired?'Next OK':notified?'Notified':'Waiting'}</span></div></div>${needsConfirmation?'':`<div class="drag-hint">⠿ 拖到左边桌位入座</div>`}<div class="row-actions walkin-actions"><div class="contact-actions">${phoneControl}${notifyButton}</div>${needsConfirmation?`<button class="btn small confirm" data-action="confirm-table-plan" data-id="${w.id}">确认拼桌</button>`:''}<button class="btn small soft seat-action" data-action="manual-seat" data-kind="walkin" data-id="${w.id}" ${needsConfirmation?'disabled':''}>Seat / 入座</button><button class="btn small danger" data-action="cancel-walkin" data-id="${w.id}">Left / 离开</button></div></article>`;
}
function renderReservationRow(r,showDate){
  const lateMin=Math.floor((now()-r.reservedAt)/60000);const late=lateMin>0;const needsConfirmation=requiresTableConfirmation(r.partySize)&&!isTablePlanConfirmed(r);
  const draggable=!showDate&&!needsConfirmation;
  const planBadge=requiresTableConfirmation(r.partySize)?`<span class="badge ${needsConfirmation?'warn':'ok'}">${needsConfirmation?'待确认拼桌':'拼桌已确认'}</span>`:'';
  const when=showDate?`${fmtDate(r.reservedAt)} · ${fmtTime(r.reservedAt)}`:fmtTime(r.reservedAt);
  const statusText=needsConfirmation?'等待确认拼桌':r.status==='arrived'?'客人已到':late?`迟到 ${lateMin} 分钟`:'Confirmed';
  const phoneDisplay=r.phone?`<div class="phone-reveal reservation-phone"><span>Phone 电话</span><strong>${esc(r.phone)}</strong></div>`:'';
  return `<article class="row ${draggable?'drag-ready':''}" ${draggable?`data-drag-party="${r.id}"`:''}><div class="row-top"><div><div class="row-name">${when} · <span class="guest-name">${esc(normalizeAnonymousGuestName(r.name))}</span> · ${r.partySize}人 ${planBadge}</div><div class="row-meta">${r.phone?'':'No phone · '}${statusText}</div></div><div class="row-right"><span class="badge ${needsConfirmation?'warn':r.status==='arrived'?'ok':lateMin>=15?'hot':''}">${needsConfirmation?'Pending':r.status==='arrived'?'Arrived':lateMin>=15?'Release OK':'Booked'}</span></div></div>${phoneDisplay}${draggable?'<div class="drag-hint">⠿ 拖到左边桌位入座</div>':''}<div class="row-actions">${needsConfirmation?`<button class="btn small confirm" data-action="confirm-table-plan" data-id="${r.id}">确认拼桌</button>`:''}${r.status!=='arrived'&&!showDate?`<button class="btn small" data-action="arrived" data-id="${r.id}">Arrived / 已到店</button>`:''}<button class="btn small soft" data-action="manual-seat" data-kind="reservation" data-id="${r.id}" ${needsConfirmation||showDate?'disabled':''}>Seat / 入座</button>${!showDate?`<button class="btn small danger" data-action="no-show" data-id="${r.id}" ${lateMin<15?'disabled':''}>No-show</button>`:''}<button class="btn small" data-action="edit-reservation" data-id="${r.id}">Edit / 修改</button><button class="btn small danger" data-action="cancel-reservation" data-id="${r.id}">Cancel</button></div></article>`;
}
function renderReservations(){
  const {today}=partitionReservationsByDay(state.reservations.filter(activeReservation),now());
  const todaySummary=summarizeReservations(today);const preview=buildTodayReservationPreview(today);
  return `<section class="reservation-group"><div class="reservation-group-title"><strong>Today 今日订位</strong><span>${todaySummary.groupCount}组 · ${todaySummary.guestCount}人</span></div>${preview.reservations.length?preview.reservations.map(r=>renderReservationRow(r,false)).join(''):'<div class="empty-state compact">今天没有未完成订位</div>'}${preview.hasMore?`<button class="reservation-more" data-action="show-today-stats">查看全部今日订位 · ${todaySummary.groupCount}组 / ${todaySummary.guestCount}人</button>`:''}</section>`;
}

function renderReservationStatsModal(){
  const active=state.reservations.filter(activeReservation);const {today,upcoming}=partitionReservationsByDay(active,now());
  if(modal.scope==='today'){
    const summary=summarizeReservations(today);
    return `<div class="sheet-backdrop" data-action="close-modal"><section class="sheet stats-sheet" role="dialog" aria-modal="true"><div class="sheet-head"><div><h2>今日订位统计</h2><p>Today reservations</p></div><button class="icon-btn" data-action="close-modal">×</button></div><div class="stat-overview"><div><strong>${summary.guestCount}</strong><span>总人数</span></div><div><strong>${summary.groupCount}</strong><span>订位组数</span></div></div><div class="stats-detail-list">${today.length?today.map(r=>renderReservationRow(r,false)).join(''):'<div class="empty-state">今天没有未完成订位</div>'}</div></section></div>`;
  }
  const daily=buildUpcomingReservationStats(active,now(),14);const maxGuests=Math.max(1,...daily.map(day=>day.guestCount));
  const selected=modal.dateStart!=null?daily.find(day=>day.dateStart===modal.dateStart):null;const upcomingSummary=summarizeReservations(upcoming);
  const endOfWindow=new Date(daily[daily.length-1].dateStart);endOfWindow.setDate(endOfWindow.getDate()+1);const beyond=upcoming.filter(r=>r.reservedAt>=endOfWindow.getTime());const beyondSummary=summarizeReservations(beyond);
  return `<div class="sheet-backdrop" data-action="close-modal"><section class="sheet stats-sheet" role="dialog" aria-modal="true"><div class="sheet-head"><div><h2>未来订位统计</h2><p>未来 14 天 · 点击日期查看名单</p></div><button class="icon-btn" data-action="close-modal">×</button></div><div class="stat-overview"><div><strong>${upcomingSummary.guestCount}</strong><span>未来总人数</span></div><div><strong>${upcomingSummary.groupCount}</strong><span>未来订位组数</span></div></div><div class="daily-stats">${daily.map(day=>`<button class="day-stat ${selected?.dateStart===day.dateStart?'selected':''} ${day.guestCount===maxGuests&&day.guestCount>0?'busiest':''}" data-action="select-reservation-day" data-date-start="${day.dateStart}"><span class="day-label">${fmtDay(day.dateStart)}${day.guestCount===maxGuests&&day.guestCount>0?'<em>最忙</em>':''}</span><span class="day-bar"><i style="width:${day.guestCount?Math.max(7,Math.round(day.guestCount/maxGuests*100)):0}%"></i></span><span class="day-count"><strong>${day.guestCount}人</strong><small>${day.groupCount}组</small></span></button>`).join('')}</div>${selected?`<section class="selected-day"><div class="selected-day-title"><strong>${fmtDay(selected.dateStart)} 订位名单</strong><span>${selected.groupCount}组 · ${selected.guestCount}人</span></div><div class="stats-detail-list">${selected.reservations.length?selected.reservations.map(r=>renderReservationRow(r,true)).join(''):'<div class="empty-state compact">这一天暂无订位</div>'}</div></section>`:'<div class="stats-prompt">选择上面的日期，即可查看当天客人名单</div>'}${beyond.length?`<div class="beyond-note">14 天后还有 ${beyondSummary.groupCount} 组 · ${beyondSummary.guestCount} 人</div>`:''}<details class="all-reservations"><summary>查看全部未来订位 · ${upcomingSummary.groupCount}组</summary><div class="all-reservation-list">${groupReservationsByDate(upcoming).map(group=>{const summary=summarizeReservations(group.reservations);return `<section class="reservation-date-block"><div class="reservation-group-title"><strong>${fmtDay(group.dateStart)}</strong><span>${summary.groupCount}组 · ${summary.guestCount}人</span></div>${group.reservations.map(r=>renderReservationRow(r,true)).join('')}</section>`}).join('')||'<div class="empty-state">暂无未来订位</div>'}</div></details></section></div>`;
}

function renderModal(){
  if(modal.type==='add'||modal.type==='edit'){
    const isEdit=modal.type==='edit';const isRes=modal.kind==='reservation';const existing=isEdit?state.reservations.find(r=>r.id===modal.id):null;const local=toLocalDateTimeInput(existing?.reservedAt??now());
    return `<div class="sheet-backdrop" data-action="close-modal"><section class="sheet" role="dialog" aria-modal="true"><div class="sheet-head"><h2>${isEdit?'Edit Reservation 修改订位':isRes?'Add Reservation 新增订位':'Add Walk-in 新增排队'}</h2><button class="icon-btn" data-action="close-modal">×</button></div><form id="party-form"><div class="form-grid"><div class="field"><label>${isRes?'Name 姓名':'Name 姓名（可留空）'}</label><input ${isRes?'required':''} name="name" autocomplete="off" value="${esc(existing?.name??'')}" ${isRes?'':'placeholder="留空将自动命名"'}></div><div class="field"><label>Party size 人数</label><input required name="partySize" type="number" min="1" max="40" value="${existing?.partySize??2}"></div><div class="field"><label>Phone 电话</label><input name="phone" inputmode="tel" value="${esc(existing?.phone??'')}"></div>${isRes?`<div class="field"><label>Date & time 日期与时间</label><input required name="reservedAt" type="datetime-local" value="${local}"></div>`:''}<div class="field full"><div class="hint">${isEdit?'修改人数后如超过 6 人，需要重新确认拼桌。':isRes?'可以登记今天或未来日期；7 人以上保存后需要先确认拼桌。':'姓名留空会自动生成无名字客人编号；7 人以上需要先确认拼桌。'}</div></div></div><div class="sheet-actions"><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn primary" type="submit">${isEdit?'Save changes 保存修改':'Save'}</button></div></form></section></div>`;
  }
  if(modal.type==='reservation-stats')return renderReservationStatsModal();
  if(modal.type==='drop-confirm'){
    const party=partyById(modal.id);const table=RESTAURANT_TABLES.find(t=>t.id===modal.tableId);
    return `<div class="sheet-backdrop" data-action="close-modal"><section class="sheet compact-sheet" role="dialog" aria-modal="true"><div class="sheet-head"><h2>确认拖动入座</h2><button class="icon-btn" data-action="close-modal">×</button></div><div class="drop-summary"><strong>${esc(party?.name)} · ${party?.partySize}人</strong><span>→ ${formatTableReference([table?.id])} · ${table?.capacity} seats</span></div><div class="hint">确认后会立即开始 90 分钟用餐计时。</div><div class="sheet-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="confirm-drop-seat">确认入座</button></div></section></div>`;
  }
  if(modal.type==='seat'){
    const party=partyById(modal.id);const free=availableTablesAt(now(),state.occupancies);const chosen=modal.selected??[];const seats=chosen.reduce((s,id)=>s+(RESTAURANT_TABLES.find(t=>t.id===id)?.capacity??0),0);return `<div class="sheet-backdrop" data-action="close-modal"><section class="sheet" role="dialog" aria-modal="true"><div class="sheet-head"><h2>Seat ${esc(party?.name)} · ${party?.partySize}人</h2><button class="icon-btn" data-action="close-modal">×</button></div><div class="hint">系统建议只是建议。你可以手动选择任何空桌；容量达到人数后即可入座。</div><div class="table-picker">${RESTAURANT_TABLES.map(t=>{const disabled=!free.some(f=>f.id===t.id);const sel=chosen.includes(t.id);return `<button type="button" class="pick ${sel?'selected':''}" data-action="toggle-table" data-table="${t.id}" ${disabled?'disabled':''}>${formatTableReference([t.id])}<br><span style="font-size:12px;font-weight:500">${t.capacity} seats</span></button>`}).join('')}</div><div class="picker-total">已选 ${chosen.length} 张桌 · ${seats} seats ${seats>=party.partySize?'✓':''}</div><div class="sheet-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="confirm-seat" ${seats<party.partySize?'disabled':''}>Seat now 入座</button></div></section></div>`;
  }
  return '';
}

function busyTableIds(){return state.occupancies.filter(o=>o.expectedEndAt>now()).map(o=>o.tableId)}
function tableForDropElement(el){return RESTAURANT_TABLES.find(t=>t.id===Number(el?.dataset.dropTable))}
function highlightDropTargets(party){
  const busy=busyTableIds();
  app.querySelectorAll('[data-drop-table]').forEach(el=>{
    const table=tableForDropElement(el);const mode=tableDropMode(party,table,busy);
    el.classList.toggle('drop-valid',mode!=='blocked');el.classList.toggle('drop-invalid',mode==='blocked');
  });
}
function clearDragVisuals(){
  dragState?.ghost?.remove();dragState?.row?.classList.remove('dragging');document.body.classList.remove('drag-active');
  app.querySelectorAll('[data-drop-table]').forEach(el=>el.classList.remove('drop-valid','drop-invalid','drop-over'));
}
function detachDragListeners(){document.removeEventListener('pointermove',movePartyDrag);document.removeEventListener('pointerup',finishPartyDrag);document.removeEventListener('pointercancel',cancelPartyDrag)}
function cancelPartyDrag(e){
  if(!dragState||(e&&e.pointerId!==dragState.pointerId))return;detachDragListeners();clearDragVisuals();dragState=null;
}
function movePartyDrag(e){
  if(!dragState||e.pointerId!==dragState.pointerId)return;
  const distance=Math.hypot(e.clientX-dragState.startX,e.clientY-dragState.startY);
  if(!dragState.started&&distance<8)return;
  if(!dragState.started){
    dragState.started=true;dragState.row.classList.add('dragging');document.body.classList.add('drag-active');highlightDropTargets(dragState.party);
    const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=`${dragState.party.name} · ${dragState.party.partySize}人`;document.body.appendChild(ghost);dragState.ghost=ghost;
  }
  e.preventDefault();dragState.ghost.style.left=`${e.clientX+14}px`;dragState.ghost.style.top=`${e.clientY+14}px`;
  app.querySelectorAll('.drop-over').forEach(el=>el.classList.remove('drop-over'));
  const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop-table]');if(target?.classList.contains('drop-valid'))target.classList.add('drop-over');
}
function finishPartyDrag(e){
  if(!dragState||e.pointerId!==dragState.pointerId)return;
  const current=dragState;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop-table]');const table=tableForDropElement(target);
  const mode=table?tableDropMode(current.party,table,busyTableIds()):'blocked';
  detachDragListeners();clearDragVisuals();dragState=null;
  if(!current.started)return;
  if(mode==='seat'){modal={type:'drop-confirm',id:current.party.id,kind:current.kind,tableId:table.id};render();return}
  if(mode==='multi'){openSeat(current.party.id,current.kind,[table.id]);return}
  toast('这个桌位不适合或目前不可用');
}
function beginPartyDrag(e){
  if((e.pointerType==='mouse'&&e.button!==0)||e.target.closest('button,a'))return;
  const row=e.currentTarget;const found=findPartyWithKind(state,row.dataset.dragParty);const party=found?.party;if(!party||!isTablePlanConfirmed(party))return;
  dragState={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,row,party,kind:found.kind,started:false,ghost:null};
  document.addEventListener('pointermove',movePartyDrag);document.addEventListener('pointerup',finishPartyDrag);document.addEventListener('pointercancel',cancelPartyDrag);
}

function bindEvents(){
  app.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',e=>{const action=el.dataset.action;if(action==='close-modal' && e.target!==el && el.classList.contains('sheet-backdrop'))return;handleAction(action,el)}));
  const writeActions=new Set(['add-reservation','add-walkin','clear-table','notify','cancel-walkin','arrived','no-show','cancel-reservation','confirm-table-plan','manual-seat','auto-seat','confirm-drop-seat','confirm-seat']);
  if(connectionState!=='online')app.querySelectorAll('[data-action]').forEach(el=>{if(writeActions.has(el.dataset.action))el.disabled=true});
  if(connectionState==='online')app.querySelectorAll('[data-drag-party]').forEach(el=>el.addEventListener('pointerdown',beginPartyDrag));
  const form=app.querySelector('#party-form'); if(form)form.addEventListener('submit',submitParty);
  if(form&&connectionState!=='online')form.querySelector('button[type="submit"]').disabled=true;
}
function handleAction(action,el){
  if(action==='logout'){logoutStaff();return}
  if(action==='add-reservation'){modal={type:'add',kind:'reservation'};render();return}
  if(action==='add-walkin'){modal={type:'add',kind:'walkin'};render();return}
  if(action==='edit-reservation'){modal={type:'edit',kind:'reservation',id:el.dataset.id};render();return}
  if(action==='show-today-stats'){modal={type:'reservation-stats',scope:'today'};render();return}
  if(action==='show-upcoming-stats'){modal={type:'reservation-stats',scope:'upcoming'};render();return}
  if(action==='select-reservation-day'){modal={...modal,dateStart:Number(el.dataset.dateStart)};render();return}
  if(action==='close-modal'){modal=null;render();return}
  if(action==='clear-table'){const tableId=Number(el.dataset.table);update(s=>{s.occupancies=s.occupancies.filter(o=>o.tableId!==tableId);return s});toast(`${formatTableReference([tableId])} 已清桌`);return}
  if(action==='notify'){const id=el.dataset.id;const contactedAt=now();update(s=>{const index=s.walkins.findIndex(x=>x.id===id);if(index>=0)s.walkins[index]=markWalkInNotified(s.walkins[index],contactedAt);return s});toast('已通知，5分钟返回窗口开始');return}
  if(action==='cancel-walkin'){const id=el.dataset.id;update(s=>{const w=s.walkins.find(x=>x.id===id);if(w)w.status='left';return s});return}
  if(action==='arrived'){const id=el.dataset.id;update(s=>{const r=s.reservations.find(x=>x.id===id);if(r)r.status='arrived';return s});return}
  if(action==='no-show'){const id=el.dataset.id;update(s=>{const r=s.reservations.find(x=>x.id===id);if(r)r.status='no-show';return s});toast('订位已释放');return}
  if(action==='cancel-reservation'){const id=el.dataset.id;update(s=>{const r=s.reservations.find(x=>x.id===id);if(r)r.status='cancelled';return s});return}
  if(action==='confirm-table-plan'){const id=el.dataset.id;update(s=>{const party=s.walkins.find(x=>x.id===id)||s.reservations.find(x=>x.id===id);if(party)party.tablePlanConfirmed=true;return s});toast('拼桌安排已确认');return}
  if(action==='manual-seat'){openSeat(el.dataset.id,el.dataset.kind);return}
  if(action==='auto-seat'){autoSeatWalkin(el.dataset.id);return}
  if(action==='confirm-drop-seat'){commitSeat(modal.id,modal.kind,[modal.tableId]);return}
  if(action==='toggle-table'){const id=Number(el.dataset.table);const selected=new Set(modal.selected??[]);selected.has(id)?selected.delete(id):selected.add(id);modal={...modal,selected:[...selected].sort((a,b)=>a-b)};render();return}
  if(action==='confirm-seat'){commitSeat(modal.id,modal.kind,modal.selected??[]);return}
}
function submitParty(e){e.preventDefault();const fd=new FormData(e.currentTarget);const partySize=Math.max(1,Math.min(40,Number(fd.get('partySize'))||1));const enteredName=String(fd.get('name')||'').trim();const name=enteredName||(modal.kind==='walkin'?nextAnonymousWalkInName(state.walkins):'');const base={id:uid(),name,phone:String(fd.get('phone')||'').trim(),partySize,createdAt:now(),tablePlanConfirmed:!requiresTableConfirmation(partySize)};if(!base.name)return;
  if(modal.type==='edit'){
    const reservationId=modal.id;const reservedAt=new Date(String(fd.get('reservedAt'))).getTime();const edits={name,phone:base.phone,partySize,reservedAt};
    update(s=>{const index=s.reservations.findIndex(r=>r.id===reservationId);if(index>=0)s.reservations[index]=applyReservationEdit(s.reservations[index],edits);return s});
    modal=null;render();toast('订位修改已保存');return;
  }
  if(modal.kind==='walkin') update(s=>{s.walkins.push({...base,status:'waiting'});return s});
  else {const reservedAt=new Date(String(fd.get('reservedAt'))).getTime();update(s=>{s.reservations.push({...base,reservedAt,status:'confirmed'});return s})}
  modal=null;render();toast('Saved');
}
function openSeat(id,kind,initialTableIds=[]){const party=partyById(id);if(party&&!isTablePlanConfirmed(party)){toast('请先确认拼桌安排');return}const free=availableTablesAt(now(),state.occupancies);let suggested=[...initialTableIds];if(!suggested.length&&party&&party.partySize<17){if(kind==='walkin'){
    for(const combo of rankTableCombinations(party.partySize,free)){
      if(canSeatWithoutReservationConflict({now:now(),proposedTableIds:combo.map(t=>t.id),reservations:state.reservations,occupancies:state.occupancies})){suggested=combo.map(t=>t.id);break}
    }
  } else suggested=findBestTableCombination(party.partySize,free).map(t=>t.id)}
  modal={type:'seat',id,kind,selected:suggested};render();
}
function autoSeatWalkin(id){const rec=recommendation();if(!rec||rec.walkInId!==id){toast('桌位情况已变化，请重新查看建议');render();return}commitSeat(id,'walkin',rec.tableIds)}
function commitSeat(id,kind,tableIds){const party=partyById(id);if(!party)return;const t=now();update(s=>{for(const tableId of tableIds)s.occupancies.push({tableId,partyId:id,partyName:party.name,partySize:party.partySize,seatedAt:t,expectedEndAt:t+OCCUPANCY_WINDOW_MS});if(kind==='walkin'){const w=s.walkins.find(x=>x.id===id);if(w)w.status='seated'}else{const r=s.reservations.find(x=>x.id===id);if(r)r.status='seated'}return s});modal=null;render();toast(`${party.name} → ${formatTableReference(tableIds)}`)}

bootstrap();
setInterval(refreshWaitTimers,1000);
setInterval(()=>{if(authSession&&!modal&&!dragState)render()},30000);
