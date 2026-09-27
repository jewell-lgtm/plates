import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeSightings, STORAGE_KEY } from './collection';
export async function loadCollection() { return decodeSightings(await AsyncStorage.getItem(STORAGE_KEY)); }
export async function setSighting(code: string, date: string | null) {
  const next = await loadCollection();
  if (date === null) delete next[code]; else next[code] = date;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
export async function requestPersistence() { return false; }
