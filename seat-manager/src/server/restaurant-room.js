import { DurableObject } from 'cloudflare:workers';
import { applyWrites, readSnapshot } from './persistence.js';
import { initializeSchema } from './schema.js';

export class RestaurantRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.restaurantId = env.RESTAURANT_ID || 'centre-street';
    initializeSchema(ctx.storage.sql, this.restaurantId);
  }

  readSnapshotForTest() {
    return readSnapshot(this.ctx.storage.sql, this.restaurantId);
  }

  async applyWritesForTest(writes, revision) {
    await this.ctx.storage.transaction(async () => {
      applyWrites(this.ctx.storage.sql, this.restaurantId, writes, revision);
    });
  }

  async fetch() {
    return Response.json(
      {error:'NOT_IMPLEMENTED',message:'在线接口仍在建设中'},
      {status:501}
    );
  }
}
