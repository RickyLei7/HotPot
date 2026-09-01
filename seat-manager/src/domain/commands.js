import { COMMAND_TYPES, DomainCommandError, emptySnapshot } from '../shared/contracts.js';
import { RESTAURANT_TABLES } from './tables.js';
import {
  OCCUPANCY_WINDOW_MS,
  applyReservationEdit,
  canSeatWithoutReservationConflict,
  isTablePlanConfirmed,
  nextAnonymousWalkInName,
  requiresTableConfirmation,
  tableDropMode
} from './scheduler.js';

const ACTIVE_WALKIN_STATUSES = new Set(['waiting', 'notified']);
const ACTIVE_RESERVATION_STATUSES = new Set(['confirmed', 'arrived']);
const NO_SHOW_GRACE_MS = 15 * 60 * 1000;

function fail(code, message, status = 400) {
  throw new DomainCommandError(code, message, status);
}

function boundedPartySize(value) {
  const partySize = Number(value);
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 40) {
    fail('INVALID_PARTY_SIZE', '人数必须是 1 到 40 的整数');
  }
  return partySize;
}

function requiredTimestamp(value, code, message) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) fail(code, message);
  return timestamp;
}

function changedAt(context) {
  const value = Number(context?.now);
  if (!Number.isFinite(value)) fail('SERVER_TIME_REQUIRED', '服务器时间不可用', 500);
  return value;
}

function assertVersion(record, expectedVersion) {
  if (Number(expectedVersion) !== Number(record.version)) {
    fail('STALE_VERSION', '资料已被另一台设备更新，请重新操作', 409);
  }
}

function updateRecord(record, updates, now) {
  Object.assign(record, updates, {updatedAt: now, version: Number(record.version) + 1});
  return record;
}

function findById(records, id, kind) {
  const record = records.find(item => item.id === id);
  if (!record) fail('PARTY_NOT_FOUND', `${kind}资料不存在`, 404);
  return record;
}

function partyCollection(next, partyKind) {
  if (partyKind === 'walkin') return next.walkins;
  if (partyKind === 'reservation') return next.reservations;
  fail('INVALID_PARTY_KIND', '客人类型无效');
}

function targetedWrite(writes, entity, record) {
  writes.push({entity, operation: 'upsert', record});
}

export function applyKnownCommand(next, command, context, writes) {
  const now = changedAt(context);

  switch (command.type) {
    case COMMAND_TYPES.NOTIFY_WALKIN: {
      const record = findById(next.walkins, command.id, '排队');
      assertVersion(record, command.expectedVersion);
      if (!ACTIVE_WALKIN_STATUSES.has(record.status)) {
        fail('INVALID_WALKIN_STATUS', '这组客人目前不能通知');
      }
      updateRecord(record, {status: 'notified', notifiedAt: now}, now);
      targetedWrite(writes, 'walkin', record);
      return;
    }

    case COMMAND_TYPES.CANCEL_WALKIN: {
      const record = findById(next.walkins, command.id, '排队');
      assertVersion(record, command.expectedVersion);
      if (!ACTIVE_WALKIN_STATUSES.has(record.status)) {
        fail('INVALID_WALKIN_STATUS', '这组客人目前不能标记离开');
      }
      updateRecord(record, {status: 'left'}, now);
      targetedWrite(writes, 'walkin', record);
      return;
    }

    case COMMAND_TYPES.CREATE_RESERVATION: {
      const name = String(command.name || '').trim();
      if (!name) fail('RESERVATION_NAME_REQUIRED', '订位需要客人名字');
      const partySize = boundedPartySize(command.partySize);
      const reservedAt = requiredTimestamp(
        command.reservedAt,
        'INVALID_RESERVATION_TIME',
        '请选择有效的订位时间'
      );
      const record = {
        id: context.uid(),
        name,
        phone: String(command.phone || '').trim(),
        partySize,
        reservedAt,
        status: 'confirmed',
        tablePlanConfirmed: !requiresTableConfirmation(partySize),
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      next.reservations.push(record);
      targetedWrite(writes, 'reservation', record);
      return;
    }

    case COMMAND_TYPES.EDIT_RESERVATION: {
      const record = findById(next.reservations, command.id, '订位');
      assertVersion(record, command.expectedVersion);
      if (!ACTIVE_RESERVATION_STATUSES.has(record.status)) {
        fail('INVALID_RESERVATION_STATUS', '这个订位目前不能修改');
      }
      const name = String(command.name || '').trim();
      if (!name) fail('RESERVATION_NAME_REQUIRED', '订位需要客人名字');
      const edits = {
        name,
        phone: String(command.phone || '').trim(),
        partySize: boundedPartySize(command.partySize),
        reservedAt: requiredTimestamp(
          command.reservedAt,
          'INVALID_RESERVATION_TIME',
          '请选择有效的订位时间'
        )
      };
      const edited = applyReservationEdit(record, edits);
      Object.assign(record, edited, {updatedAt: now, version: Number(record.version) + 1});
      targetedWrite(writes, 'reservation', record);
      return;
    }

    case COMMAND_TYPES.SET_RESERVATION_STATUS: {
      const record = findById(next.reservations, command.id, '订位');
      assertVersion(record, command.expectedVersion);
      if (!['arrived', 'no-show', 'cancelled'].includes(command.status)) {
        fail('INVALID_RESERVATION_STATUS', '订位状态无效');
      }
      if (!ACTIVE_RESERVATION_STATUSES.has(record.status)) {
        fail('INVALID_RESERVATION_STATUS', '这个订位目前不能更改状态');
      }
      if (command.status === 'no-show' && now < Number(record.reservedAt) + NO_SHOW_GRACE_MS) {
        fail('NO_SHOW_GRACE_ACTIVE', '仍在迟到保留的 15 分钟内');
      }
      updateRecord(record, {status: command.status}, now);
      targetedWrite(writes, 'reservation', record);
      return;
    }

    case COMMAND_TYPES.CONFIRM_TABLE_PLAN: {
      const records = partyCollection(next, command.partyKind);
      const record = findById(records, command.partyId, '客人');
      assertVersion(record, command.expectedVersion);
      const active = command.partyKind === 'walkin'
        ? ACTIVE_WALKIN_STATUSES.has(record.status)
        : ACTIVE_RESERVATION_STATUSES.has(record.status);
      if (!active) fail('INVALID_PARTY_STATUS', '这组客人目前不能确认桌位组合');
      updateRecord(record, {tablePlanConfirmed: true}, now);
      targetedWrite(writes, command.partyKind, record);
      return;
    }

    case COMMAND_TYPES.SEAT_PARTY: {
      const records = partyCollection(next, command.partyKind);
      const record = findById(records, command.partyId, '客人');
      assertVersion(record, command.expectedVersion);
      const active = command.partyKind === 'walkin'
        ? ACTIVE_WALKIN_STATUSES.has(record.status)
        : ACTIVE_RESERVATION_STATUSES.has(record.status);
      if (!active) fail('INVALID_PARTY_STATUS', '这组客人目前不能入座');
      if (!isTablePlanConfirmed(record)) {
        fail('TABLE_PLAN_CONFIRMATION_REQUIRED', '请先确认多人桌位组合');
      }

      const tableIds = Array.isArray(command.tableIds) ? command.tableIds.map(Number) : [];
      const uniqueIds = [...new Set(tableIds)];
      if (!tableIds.length || uniqueIds.length !== tableIds.length) {
        fail('INVALID_TABLE_SELECTION', '请选择有效桌位');
      }
      const tables = uniqueIds.map(id => RESTAURANT_TABLES.find(table => table.id === id));
      if (tables.some(table => !table)) fail('INVALID_TABLE_SELECTION', '请选择有效桌位');

      const busyIds = next.occupancies.map(occupancy => occupancy.tableId);
      if (uniqueIds.some(id => busyIds.includes(id))) {
        fail('TABLE_OCCUPIED', '桌位刚被其他设备使用，请重新选择', 409);
      }

      const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
      if (totalCapacity < record.partySize) fail('INSUFFICIENT_CAPACITY', '所选桌位容纳不下这组客人');
      if (tables.length === 1 && tableDropMode(record, tables[0], busyIds) === 'blocked') {
        fail('INVALID_TABLE_SELECTION', '这个桌位不适合这组客人');
      }

      if (command.protectFutureReservations === true && !canSeatWithoutReservationConflict({
        now,
        proposedTableIds: uniqueIds,
        reservations: next.reservations,
        occupancies: next.occupancies
      })) {
        fail('FUTURE_RESERVATION_CONFLICT', '这个桌位组合会影响即将到店的订位');
      }

      updateRecord(record, {status: 'seated'}, now);
      targetedWrite(writes, command.partyKind, record);
      for (const tableId of uniqueIds) {
        const occupancy = {
          tableId,
          partyId: record.id,
          partyKind: command.partyKind,
          partyName: record.name,
          partySize: record.partySize,
          seatedAt: now,
          expectedEndAt: now + OCCUPANCY_WINDOW_MS,
          createdAt: now,
          updatedAt: now,
          version: 1
        };
        next.occupancies.push(occupancy);
        targetedWrite(writes, 'occupancy', occupancy);
      }
      return;
    }

    case COMMAND_TYPES.CLEAR_TABLE: {
      const tableId = Number(command.tableId);
      const index = next.occupancies.findIndex(record => record.tableId === tableId);
      if (index < 0) fail('OCCUPANCY_NOT_FOUND', '这个桌位已经是空桌', 404);
      const record = next.occupancies[index];
      assertVersion(record, command.expectedVersion);
      next.occupancies.splice(index, 1);
      writes.push({entity: 'occupancy', operation: 'delete', record: {tableId}});
      return;
    }

    default:
      fail('UNKNOWN_COMMAND', '无法识别这个操作');
  }
}

export function applyRestaurantCommand(snapshot, command, context) {
  if (!command?.idempotencyKey) fail('IDEMPOTENCY_REQUIRED', '操作缺少安全编号');
  const next = structuredClone({...emptySnapshot(), ...(snapshot || {})});
  const writes = [];
  const now = changedAt(context);

  switch (command.type) {
    case COMMAND_TYPES.CREATE_WALKIN: {
      const partySize = boundedPartySize(command.partySize);
      const record = {
        id: context.uid(),
        name: String(command.name || '').trim() || nextAnonymousWalkInName(next.walkins),
        phone: String(command.phone || '').trim(),
        partySize,
        status: 'waiting',
        notifiedAt: null,
        tablePlanConfirmed: !requiresTableConfirmation(partySize),
        createdAt: now,
        updatedAt: now,
        version: 1
      };
      next.walkins.push(record);
      targetedWrite(writes, 'walkin', record);
      break;
    }

    case COMMAND_TYPES.NOTIFY_WALKIN:
    case COMMAND_TYPES.CANCEL_WALKIN:
    case COMMAND_TYPES.CREATE_RESERVATION:
    case COMMAND_TYPES.EDIT_RESERVATION:
    case COMMAND_TYPES.SET_RESERVATION_STATUS:
    case COMMAND_TYPES.CONFIRM_TABLE_PLAN:
    case COMMAND_TYPES.SEAT_PARTY:
    case COMMAND_TYPES.CLEAR_TABLE:
      applyKnownCommand(next, command, context, writes);
      break;

    default:
      fail('UNKNOWN_COMMAND', '无法识别这个操作');
  }

  next.revision = Number(snapshot?.revision || 0) + 1;
  return {snapshot: next, writes, result: {revision: next.revision}};
}
