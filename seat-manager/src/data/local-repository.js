import { applyRestaurantCommand } from '../domain/commands.js';
import { emptySnapshot } from '../shared/contracts.js';

export function createLocalRepository(
  storage,
  {key = 'hotpot-seat-manager-v1', clock = Date.now, uid = crypto.randomUUID} = {}
) {
  const listeners = new Set();
  const read = () => {
    try {
      const raw = storage.getItem(key);
      return raw ? {...emptySnapshot(), ...JSON.parse(raw)} : emptySnapshot();
    } catch {
      return emptySnapshot();
    }
  };

  const publish = snapshot => {
    for (const listener of listeners) listener(snapshot);
  };

  return {
    async load() {
      return read();
    },
    async save(snapshot) {
      storage.setItem(key, JSON.stringify(snapshot));
      publish(snapshot);
      return snapshot;
    },
    async command(command) {
      const output = applyRestaurantCommand(read(), command, {now: clock(), uid});
      storage.setItem(key, JSON.stringify(output.snapshot));
      publish(output.snapshot);
      return output;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
