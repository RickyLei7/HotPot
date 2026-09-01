import { DomainCommandError } from '../shared/contracts.js';

const asBoolean = value => Number(value) === 1;

const mapWalkin = row => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  partySize: Number(row.party_size),
  status: row.status,
  notifiedAt: row.notified_at == null ? null : Number(row.notified_at),
  tablePlanConfirmed: asBoolean(row.table_plan_confirmed),
  createdAt: Number(row.created_at),
  updatedAt: Number(row.updated_at),
  version: Number(row.version)
});

const mapReservation = row => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  partySize: Number(row.party_size),
  reservedAt: Number(row.reserved_at),
  status: row.status,
  tablePlanConfirmed: asBoolean(row.table_plan_confirmed),
  createdAt: Number(row.created_at),
  updatedAt: Number(row.updated_at),
  version: Number(row.version)
});

const mapOccupancy = row => ({
  tableId: Number(row.table_id),
  partyId: row.party_id,
  partyKind: row.party_kind,
  partyName: row.party_name,
  partySize: Number(row.party_size),
  seatedAt: Number(row.seated_at),
  expectedEndAt: Number(row.expected_end_at),
  createdAt: Number(row.created_at),
  updatedAt: Number(row.updated_at),
  version: Number(row.version)
});

export function readSnapshot(sql, restaurantId) {
  const metadata = [...sql.exec(
    'SELECT revision FROM metadata WHERE restaurant_id = ?',
    restaurantId
  )][0];
  return {
    walkins: [...sql.exec(
      'SELECT * FROM walkins WHERE restaurant_id = ? ORDER BY created_at, id',
      restaurantId
    )].map(mapWalkin),
    reservations: [...sql.exec(
      'SELECT * FROM reservations WHERE restaurant_id = ? ORDER BY reserved_at, id',
      restaurantId
    )].map(mapReservation),
    occupancies: [...sql.exec(
      'SELECT * FROM occupancies WHERE restaurant_id = ? ORDER BY table_id',
      restaurantId
    )].map(mapOccupancy),
    revision: Number(metadata?.revision || 0)
  };
}

function upsertWalkin(sql, restaurantId, record) {
  sql.exec(`INSERT INTO walkins (
      id, restaurant_id, name, phone, party_size, status, notified_at,
      table_plan_confirmed, created_at, updated_at, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      restaurant_id=excluded.restaurant_id, name=excluded.name, phone=excluded.phone,
      party_size=excluded.party_size, status=excluded.status, notified_at=excluded.notified_at,
      table_plan_confirmed=excluded.table_plan_confirmed, created_at=excluded.created_at,
      updated_at=excluded.updated_at, version=excluded.version`,
    record.id, restaurantId, record.name, record.phone, record.partySize, record.status,
    record.notifiedAt, record.tablePlanConfirmed ? 1 : 0, record.createdAt,
    record.updatedAt, record.version
  );
}

function upsertReservation(sql, restaurantId, record) {
  sql.exec(`INSERT INTO reservations (
      id, restaurant_id, name, phone, party_size, reserved_at, status,
      table_plan_confirmed, created_at, updated_at, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      restaurant_id=excluded.restaurant_id, name=excluded.name, phone=excluded.phone,
      party_size=excluded.party_size, reserved_at=excluded.reserved_at, status=excluded.status,
      table_plan_confirmed=excluded.table_plan_confirmed, created_at=excluded.created_at,
      updated_at=excluded.updated_at, version=excluded.version`,
    record.id, restaurantId, record.name, record.phone, record.partySize, record.reservedAt,
    record.status, record.tablePlanConfirmed ? 1 : 0, record.createdAt,
    record.updatedAt, record.version
  );
}

function upsertOccupancy(sql, restaurantId, record) {
  sql.exec(`INSERT INTO occupancies (
      table_id, restaurant_id, party_id, party_kind, party_name, party_size,
      seated_at, expected_end_at, created_at, updated_at, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(table_id) DO UPDATE SET
      restaurant_id=excluded.restaurant_id, party_id=excluded.party_id,
      party_kind=excluded.party_kind, party_name=excluded.party_name,
      party_size=excluded.party_size, seated_at=excluded.seated_at,
      expected_end_at=excluded.expected_end_at, created_at=excluded.created_at,
      updated_at=excluded.updated_at, version=excluded.version`,
    record.tableId, restaurantId, record.partyId, record.partyKind, record.partyName,
    record.partySize, record.seatedAt, record.expectedEndAt, record.createdAt,
    record.updatedAt, record.version
  );
}

function applyWrite(sql, restaurantId, write) {
  if (write.operation === 'upsert') {
    if (write.entity === 'walkin') return upsertWalkin(sql, restaurantId, write.record);
    if (write.entity === 'reservation') return upsertReservation(sql, restaurantId, write.record);
    if (write.entity === 'occupancy') return upsertOccupancy(sql, restaurantId, write.record);
  }
  if (write.operation === 'delete') {
    if (write.entity === 'walkin') {
      sql.exec('DELETE FROM walkins WHERE restaurant_id = ? AND id = ?', restaurantId, write.record.id);
      return;
    }
    if (write.entity === 'reservation') {
      sql.exec('DELETE FROM reservations WHERE restaurant_id = ? AND id = ?', restaurantId, write.record.id);
      return;
    }
    if (write.entity === 'occupancy') {
      sql.exec(
        'DELETE FROM occupancies WHERE restaurant_id = ? AND table_id = ?',
        restaurantId,
        write.record.tableId
      );
      return;
    }
  }
  throw new DomainCommandError('INVALID_WRITE', '无法保存这个资料变更', 500);
}

export function applyWrites(sql, restaurantId, writes, revision) {
  for (const write of writes) applyWrite(sql, restaurantId, write);
  sql.exec(
    `INSERT INTO metadata (restaurant_id, revision) VALUES (?, ?)
     ON CONFLICT(restaurant_id) DO UPDATE SET revision=excluded.revision`,
    restaurantId,
    revision
  );
}

export function readCommandResult(sql, idempotencyKey, restaurantId) {
  const row = [...sql.exec(
    `SELECT response_json FROM command_results
     WHERE restaurant_id = ? AND idempotency_key = ?`,
    restaurantId,
    idempotencyKey
  )][0];
  if (!row) return null;
  try {
    return JSON.parse(row.response_json);
  } catch {
    throw new DomainCommandError('INVALID_COMMAND_CACHE', '操作记录无法读取', 500);
  }
}

export function saveCommandResult(
  sql,
  idempotencyKey,
  restaurantId,
  response,
  createdAt,
  expiresAt
) {
  sql.exec(`INSERT INTO command_results (
      restaurant_id, idempotency_key, response_json, created_at, expires_at
    ) VALUES (?, ?, ?, ?, ?)`,
    restaurantId,
    idempotencyKey,
    JSON.stringify(response),
    createdAt,
    expiresAt
  );
}

export function deleteExpiredCommandResults(sql, now) {
  sql.exec('DELETE FROM command_results WHERE expires_at <= ?', now);
}
