import { RESTAURANT_TABLES } from './tables.js';

export const DINING_MS = 90 * 60 * 1000;
export const TURN_BUFFER_MS = 10 * 60 * 1000;
export const OCCUPANCY_WINDOW_MS = DINING_MS + TURN_BUFFER_MS;
export const NOTIFICATION_RETURN_MS = 5 * 60 * 1000;

export function diningStartsAt(seatedAt) {
  return Number(seatedAt) + TURN_BUFFER_MS;
}

export function formatTableClockTime(timestamp) {
  const date = new Date(timestamp);
  const twoDigits = value => String(value).padStart(2, '0');
  return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`;
}

export function requiresTableConfirmation(partySize) {
  return Number(partySize) > 6;
}

export function isTablePlanConfirmed(party) {
  return !requiresTableConfirmation(party.partySize) || party.tablePlanConfirmed === true;
}

export function nextAnonymousWalkInName(walkins) {
  const highest = walkins.reduce((max, walkin) => {
    const match = String(walkin.name ?? '').match(/^无(?:名字|名)客人 #(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `无名客人 #${highest + 1}`;
}

export function normalizeAnonymousGuestName(name) {
  return String(name ?? '').replace(/^无名字客人(?= #\d+$)/, '无名客人');
}

export function findPartyWithKind(state, id) {
  const walkin = state.walkins.find(party => party.id === id);
  if (walkin) return {party:walkin,kind:'walkin'};
  const reservation = state.reservations.find(party => party.id === id);
  return reservation ? {party:reservation,kind:'reservation'} : null;
}

export function formatWaitDuration(startedAt, referenceTime = Date.now()) {
  const elapsedSeconds = Math.max(0, Math.floor((referenceTime - startedAt) / 1000));
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const secondsText = String(seconds).padStart(2, '0');
  if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}m ${secondsText}s`;
  return `${minutes}m ${secondsText}s`;
}

export function markWalkInNotified(walkin, notifiedAt) {
  return {...walkin,status:'notified',notifiedAt};
}

export function notificationWindowState(walkin, referenceTime = Date.now()) {
  const isNotified = walkin.status === 'notified' && Number.isFinite(walkin.notifiedAt);
  const elapsedMs = isNotified ? Math.max(0, referenceTime - walkin.notifiedAt) : 0;
  return {isNotified,elapsedMs,expired:isNotified && elapsedMs >= NOTIFICATION_RETURN_MS};
}

export function tableDropMode(party, table, busyTableIds = []) {
  if (!isTablePlanConfirmed(party) || busyTableIds.includes(table.id)) return 'blocked';
  if (party.partySize <= table.capacity) return 'seat';
  if (party.partySize > 6) return 'multi';
  return 'blocked';
}

export function partitionReservationsByDay(reservations, referenceTime) {
  const start = new Date(referenceTime);
  start.setHours(0, 0, 0, 0);
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startMs = start.getTime();
  const tomorrowMs = tomorrow.getTime();
  const sorted = [...reservations].sort((a, b) => a.reservedAt - b.reservedAt);
  return {
    today: sorted.filter(r => r.reservedAt >= startMs && r.reservedAt < tomorrowMs),
    upcoming: sorted.filter(r => r.reservedAt >= tomorrowMs)
  };
}

export function summarizeReservations(reservations) {
  return {
    groupCount: reservations.length,
    guestCount: reservations.reduce((sum, reservation) => sum + Number(reservation.partySize || 0), 0)
  };
}

export function buildTodayReservationPreview(reservations, limit = 5) {
  const safeLimit = Math.max(0, Number(limit) || 0);
  return {
    reservations: reservations.slice(0, safeLimit),
    totalCount: reservations.length,
    hasMore: reservations.length > safeLimit
  };
}

export function buildUpcomingReservationStats(reservations, referenceTime, dayCount = 14) {
  const firstDay = new Date(referenceTime);
  firstDay.setHours(0, 0, 0, 0);
  firstDay.setDate(firstDay.getDate() + 1);
  const sorted = [...reservations].sort((a, b) => a.reservedAt - b.reservedAt);

  return Array.from({length: Math.max(0, dayCount)}, (_, index) => {
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() + index);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const dayReservations = sorted.filter(r => r.reservedAt >= start.getTime() && r.reservedAt < end.getTime());
    return {
      dateStart: start.getTime(),
      reservations: dayReservations,
      ...summarizeReservations(dayReservations)
    };
  });
}

export function applyReservationEdit(reservation, edits) {
  const partySize = Number(edits.partySize);
  const partySizeChanged = partySize !== Number(reservation.partySize);
  return {
    ...reservation,
    ...edits,
    partySize,
    tablePlanConfirmed: partySize <= 6
      ? true
      : partySizeChanged ? false : reservation.tablePlanConfirmed === true
  };
}

function combinations(items, maxCount = 4) {
  const out = [];
  const walk = (start, picked) => {
    if (picked.length) out.push([...picked]);
    if (picked.length >= maxCount) return;
    for (let i = start; i < items.length; i++) {
      picked.push(items[i]);
      walk(i + 1, picked);
      picked.pop();
    }
  };
  walk(0, []);
  return out;
}

function preferredCapacityPattern(partySize) {
  if (partySize <= 2) return [2];
  if (partySize <= 4) return [4];
  if (partySize <= 6) return [6];
  if (partySize <= 8) return [4,4];
  if (partySize <= 10) return [6,4];
  if (partySize <= 12) return [6,6];
  if (partySize <= 14) return [6,4,4];
  if (partySize <= 16) return [6,6,4];
  return [];
}

function patternPenalty(combo, partySize) {
  const want = preferredCapacityPattern(partySize).sort((a,b)=>b-a);
  const got = combo.map(t=>t.capacity).sort((a,b)=>b-a);
  const len = Math.max(want.length, got.length);
  let penalty = Math.abs(want.length - got.length) * 10;
  for (let i=0;i<len;i++) penalty += Math.abs((want[i] ?? 0) - (got[i] ?? 0));
  return penalty;
}

export function rankTableCombinations(partySize, availableTables) {
  if (partySize < 1 || partySize >= 17) return [];
  return combinations(availableTables)
    .filter(combo => combo.reduce((s,t)=>s+t.capacity,0) >= partySize)
    .sort((a,b) => {
      const ca=a.reduce((s,t)=>s+t.capacity,0), cb=b.reduce((s,t)=>s+t.capacity,0);
      const scoreA=(ca-partySize)*100 + a.length*8 + patternPenalty(a,partySize)*4;
      const scoreB=(cb-partySize)*100 + b.length*8 + patternPenalty(b,partySize)*4;
      if (scoreA !== scoreB) return scoreA-scoreB;
      return a.map(t=>t.id).join(',').localeCompare(b.map(t=>t.id).join(','), undefined, {numeric:true});
    });
}

export function findBestTableCombination(partySize, availableTables) {
  return rankTableCombinations(partySize, availableTables)[0] ?? [];
}

function tableFreeAt(tableId, when, blocks) {
  return !blocks.some(b => b.tableId === tableId && b.start < when + 1 && b.end > when);
}

export function canSeatWithoutReservationConflict({ now, proposedTableIds, reservations, occupancies }) {
  const proposalEnd = now + OCCUPANCY_WINDOW_MS;
  const blocks = occupancies.map(o => ({ tableId:o.tableId, start:o.seatedAt ?? 0, end:o.expectedEndAt }));
  for (const tableId of proposedTableIds) blocks.push({tableId,start:now,end:proposalEnd});

  const future = reservations
    .filter(r => ['confirmed','arrived'].includes(r.status)
      && isTablePlanConfirmed(r)
      && r.reservedAt >= now
      && r.reservedAt <= proposalEnd)
    .sort((a,b)=>a.reservedAt-b.reservedAt);

  for (const reservation of future) {
    if (reservation.partySize >= 17) continue;
    const free = RESTAURANT_TABLES.filter(t => tableFreeAt(t.id, reservation.reservedAt, blocks));
    const combo = findBestTableCombination(reservation.partySize, free);
    if (!combo.length) return false;
    for (const table of combo) {
      blocks.push({tableId:table.id,start:reservation.reservedAt,end:reservation.reservedAt+OCCUPANCY_WINDOW_MS});
    }
  }
  return true;
}

export function recommendWalkInSeat({ now, walkins, reservations, occupancies }) {
  const busy = new Set(occupancies.filter(o=>o.expectedEndAt>now).map(o=>o.tableId));
  const available = RESTAURANT_TABLES.filter(t=>!busy.has(t.id));
  const waiting = walkins
    .filter(w=>['waiting','notified'].includes(w.status) && isTablePlanConfirmed(w) && !notificationWindowState(w,now).expired)
    .sort((a,b)=>(a.createdAt??0)-(b.createdAt??0));

  for (const walkin of waiting) {
    if (walkin.partySize >= 17) continue;
    for (const combo of rankTableCombinations(walkin.partySize, available)) {
      if (canSeatWithoutReservationConflict({
        now,
        proposedTableIds: combo.map(t=>t.id),
        reservations,
        occupancies
      })) {
        return {
          walkInId: walkin.id,
          tableIds: combo.map(t=>t.id),
          reason: `${walkin.partySize} guests fit with future reservations protected`
        };
      }
    }
  }
  return null;
}

export function availableTablesAt(now, occupancies) {
  const busy=new Set(occupancies.filter(o=>o.expectedEndAt>now).map(o=>o.tableId));
  return RESTAURANT_TABLES.filter(t=>!busy.has(t.id));
}
