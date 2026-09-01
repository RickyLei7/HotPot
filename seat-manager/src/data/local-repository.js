export function createLocalRepository(storage, key = 'hotpot-seat-manager-v1') {
  return {
    async load() {
      try {
        const raw = storage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    async save(snapshot) {
      storage.setItem(key, JSON.stringify(snapshot));
      return snapshot;
    }
  };
}
