export { RestaurantRoom } from './restaurant-room.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname === '/ws') {
      const id = env.RESTAURANT_ROOM.idFromName(env.RESTAURANT_ID);
      return env.RESTAURANT_ROOM.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};
