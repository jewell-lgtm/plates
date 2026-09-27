import AsyncStorage from '@react-native-async-storage/async-storage';
import { byCode, decodeSightings, STORAGE_KEY, Sightings } from './collection';
import { decodeLocations, LOCATIONS_KEY, SavedLocation, validLocation } from './locationModel';
import { mergeSightings } from './backup';
export async function loadCollection() { return decodeSightings(await AsyncStorage.getItem(STORAGE_KEY)); }
export async function loadLocations() {
 const seen = await loadCollection();
 return Object.fromEntries(Object.entries(decodeLocations(await AsyncStorage.getItem(LOCATIONS_KEY))).filter(([code]) => !!seen[code]));
}
export async function setSighting(code: string, date: string | null) {
 if (!byCode.has(code)) throw new Error('Invalid code');
 const next = await loadCollection();
 if (date === null) {
  const locations = await loadLocations(); delete next[code]; delete locations[code];
  await AsyncStorage.multiSet([[STORAGE_KEY, JSON.stringify(next)], [LOCATIONS_KEY, JSON.stringify(locations)]]);
 } else { next[code] ??= date; await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
 return next;
}
export async function importCollection(incoming: Sightings) {
 const next = mergeSightings(await loadCollection(), incoming);
 await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next;
}
export async function setLocation(code: string, location: SavedLocation | null) {
 if (location && !validLocation(location)) throw new Error('Invalid location');
 if (!(await loadCollection())[code]) throw new Error('Spot this plate first');
 const next = await loadLocations();
 if (location === null) delete next[code]; else next[code] = location;
 await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(next)); return next;
}
export async function requestPersistence() { return false; }
