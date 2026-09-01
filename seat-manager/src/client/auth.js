import { RepositoryError } from '../shared/contracts.js';
import { requireJson } from '../data/remote-repository.js';

const DEVICE_KEY='hotpot-seat-manager-device-v1';

export function createAuthClient({
  fetchImpl=fetch,
  storage=localStorage,
  uid=()=> crypto.randomUUID()
}={}) {
  const getDeviceId=()=>{
    let deviceId=storage.getItem(DEVICE_KEY);
    if (!deviceId) {
      deviceId=uid();
      storage.setItem(DEVICE_KEY,deviceId);
    }
    return deviceId;
  };

  return {
    getDeviceId,
    async login(pin) {
      if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
        throw new RepositoryError(400,'PIN_FORMAT','请输入 4 位数字密码');
      }
      const response=await fetchImpl('/api/login',{
        method:'POST',
        credentials:'same-origin',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({pin,deviceId:getDeviceId()})
      });
      return requireJson(response);
    },
    async session() {
      const response=await fetchImpl('/api/session',{
        credentials:'same-origin',cache:'no-store'
      });
      return requireJson(response);
    },
    async logout(csrfToken) {
      const response=await fetchImpl('/api/logout',{
        method:'POST',credentials:'same-origin',
        headers:{'X-CSRF-Token':csrfToken}
      });
      return requireJson(response);
    }
  };
}
