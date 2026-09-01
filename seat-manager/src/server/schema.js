const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS metadata (
    restaurant_id TEXT PRIMARY KEY,
    revision INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS walkins (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 40),
    status TEXT NOT NULL CHECK (status IN ('waiting','notified','seated','left')),
    notified_at INTEGER,
    table_plan_confirmed INTEGER NOT NULL CHECK (table_plan_confirmed IN (0,1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL CHECK (version >= 1)
  )`,
  `CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 40),
    reserved_at INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('confirmed','arrived','seated','no-show','cancelled')),
    table_plan_confirmed INTEGER NOT NULL CHECK (table_plan_confirmed IN (0,1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL CHECK (version >= 1)
  )`,
  `CREATE TABLE IF NOT EXISTS occupancies (
    table_id INTEGER PRIMARY KEY CHECK (table_id BETWEEN 1 AND 10),
    restaurant_id TEXT NOT NULL,
    party_id TEXT NOT NULL,
    party_kind TEXT NOT NULL CHECK (party_kind IN ('walkin','reservation')),
    party_name TEXT NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 40),
    seated_at INTEGER NOT NULL,
    expected_end_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    version INTEGER NOT NULL CHECK (version >= 1)
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    csrf_token TEXT NOT NULL,
    pin_version TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS login_limits (
    restaurant_id TEXT NOT NULL,
    bucket_key TEXT NOT NULL,
    window_started_at INTEGER NOT NULL,
    failures INTEGER NOT NULL DEFAULT 0 CHECK (failures >= 0),
    lock_level INTEGER NOT NULL DEFAULT 0 CHECK (lock_level >= 0),
    locked_until INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL,
    PRIMARY KEY (restaurant_id, bucket_key)
  )`,
  `CREATE TABLE IF NOT EXISTS command_results (
    restaurant_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    response_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    PRIMARY KEY (restaurant_id, idempotency_key)
  )`,
  'CREATE INDEX IF NOT EXISTS walkins_restaurant_created ON walkins (restaurant_id, created_at)',
  'CREATE INDEX IF NOT EXISTS reservations_restaurant_reserved ON reservations (restaurant_id, reserved_at)',
  'CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions (expires_at)',
  'CREATE INDEX IF NOT EXISTS login_limits_expiry ON login_limits (expires_at)',
  'CREATE INDEX IF NOT EXISTS command_results_expiry ON command_results (expires_at)'
];

export function initializeSchema(sql, restaurantId = 'centre-street') {
  for (const statement of STATEMENTS) sql.exec(statement);
  sql.exec(
    'INSERT OR IGNORE INTO metadata (restaurant_id, revision) VALUES (?, 0)',
    restaurantId
  );
}
