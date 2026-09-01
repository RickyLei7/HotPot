import { applyRestaurantCommand } from '../domain/commands.js';
import {
  applyWrites,
  deleteExpiredCommandResults,
  readCommandResult,
  readSnapshot,
  saveCommandResult
} from './persistence.js';

const COMMAND_RESULT_TTL_MS = 24 * 60 * 60 * 1000;

export function executeCommand(storage, sql, restaurantId, command, context) {
  return storage.transactionSync(() => {
    const cached = command?.idempotencyKey
      ? readCommandResult(sql, command.idempotencyKey, restaurantId)
      : null;
    if (cached) return {response:cached,committed:false};

    const current = readSnapshot(sql, restaurantId);
    const output = applyRestaurantCommand(current, command, context);
    applyWrites(sql, restaurantId, output.writes, output.snapshot.revision);
    const response = {snapshot:output.snapshot,result:output.result};
    saveCommandResult(
      sql,
      command.idempotencyKey,
      restaurantId,
      response,
      context.now,
      context.now + COMMAND_RESULT_TTL_MS
    );
    deleteExpiredCommandResults(sql, context.now);
    return {response,committed:true};
  });
}
