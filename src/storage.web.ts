import { decodeSightings, Sightings, STORAGE_KEY } from './collection';
const DB_NAME = 'plates';
const STORE = 'collection';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other plates tabs and retry.'));
  });
}
// Read and merge in one transaction: concurrent tabs cannot overwrite each other's finds.
async function transact(change?: { code: string; date: string | null }): Promise<Sightings> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const request = store.get(STORAGE_KEY);
    let next: Sightings;
    let failure: unknown;
    request.onsuccess = () => {
      try {
        // Keep the old AsyncStorage/localStorage data as a migration backup.
        // Once migrated, even an empty collection is authoritative in IndexedDB.
        const raw = request.result === undefined ? localStorage.getItem(STORAGE_KEY) : request.result;
        next = decodeSightings(raw);
        if (change) {
          if (change.date === null) delete next[change.code];
          else next[change.code] ??= change.date;
        }
        store.put(JSON.stringify(next), STORAGE_KEY);
      } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { db.close(); resolve(next); };
    tx.onabort = tx.onerror = () => { db.close(); reject(failure ?? tx.error ?? new Error('Collection could not be saved')); };
  });
}
export function loadCollection() { return transact(); }
export function setSighting(code: string, date: string | null) { return transact({ code, date }); }
export async function requestPersistence() {
  try {
    if (!navigator.storage?.persist) return false;
    return await navigator.storage.persisted() || await navigator.storage.persist();
  } catch { return false; }
}
