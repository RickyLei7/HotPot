export { RestaurantRoom } from './restaurant-room.js';

const CSP="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' wss:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";

function secureAssetResponse(response){
  const headers=new Headers(response.headers);
  headers.set('Content-Security-Policy',CSP);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','no-referrer');
  headers.set('X-Frame-Options','DENY');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname === '/ws') {
      const id = env.RESTAURANT_ROOM.idFromName(env.RESTAURANT_ID);
      return env.RESTAURANT_ROOM.get(id).fetch(request);
    }
    return secureAssetResponse(await env.ASSETS.fetch(request));
  }
};
