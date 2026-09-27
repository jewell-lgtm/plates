import { byCode, decodeSightings, Sightings, STORAGE_KEY } from './collection';
import { decodeLocations, LOCATIONS_KEY, Locations, SavedLocation, validLocation } from './locationModel';
import { mergeSightings } from './backup';
function openDatabase(): Promise<IDBDatabase> {
 return new Promise((resolve, reject) => {
  const request = indexedDB.open('plates', 1); // Retain the original database through the rebrand.
  request.onupgradeneeded = () => request.result.createObjectStore('collection');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Close other app tabs and retry.'));
 });
}
async function transact(change?: (seen: Sightings, locations: Locations) => void): Promise<{ seen: Sightings; locations: Locations }> {
 const db = await openDatabase();
 return new Promise((resolve, reject) => {
  const tx = db.transaction('collection', 'readwrite');
  const store = tx.objectStore('collection');
  const sightingRequest = store.get(STORAGE_KEY);
  const locationRequest = store.get(LOCATIONS_KEY);
  let seen: Sightings; let locations: Locations; let failure: unknown;
  locationRequest.onsuccess = () => {
   try {
    const raw = sightingRequest.result === undefined ? localStorage.getItem(STORAGE_KEY) : sightingRequest.result;
    seen = decodeSightings(raw);
    locations = decodeLocations(locationRequest.result ?? null);
    for (const code of Object.keys(locations)) if (!seen[code]) delete locations[code];
    change?.(seen, locations);
    store.put(JSON.stringify(seen), STORAGE_KEY);
    store.put(JSON.stringify(locations), LOCATIONS_KEY);
   } catch (error) { failure = error; tx.abort(); }
  };
  tx.oncomplete = () => { db.close(); resolve({ seen, locations }); };
  tx.onabort = tx.onerror = () => { db.close(); reject(failure ?? tx.error ?? new Error('Collection could not be saved')); };
 });
}
export async function loadCollection() { return (await transact()).seen; }
export async function loadLocations() { return (await transact()).locations; }
export async function setSighting(code: string, date: string | null) {
 if (!byCode.has(code)) throw new Error('Invalid code');
 return (await transact((seen, locations) => {
  if (date === null) { delete seen[code]; delete locations[code]; } else seen[code] ??= date;
 })).seen;
}
export async function importCollection(incoming: Sightings) {
 return (await transact(seen => Object.assign(seen, mergeSightings(seen, incoming)))).seen;
}
export async function setLocation(code: string, location: SavedLocation | null) {
 if (location && !validLocation(location)) throw new Error('Invalid location');
 return (await transact((seen, locations) => {
  if (!seen[code]) throw new Error('Spot this plate first');
  if (location === null) delete locations[code]; else locations[code] = location;
 })).locations;
}
export async function requestPersistence() {
 try { return !!navigator.storage?.persist && (await navigator.storage.persisted() || await navigator.storage.persist()); }
 catch { return false; }
}
