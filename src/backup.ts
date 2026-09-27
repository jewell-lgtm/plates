import { byCode, decodeSightings, Sightings } from './collection';
export function createBackup(sightings: Sightings) {
 return JSON.stringify({ app: 'schildersafari', version: 1, sightings }, null, 2);
}
export function parseBackup(text: string): Sightings {
 if (text.length > 200_000) throw new Error('Invalid backup');
 const value = JSON.parse(text);
 if (!value || value.app !== 'schildersafari' || value.version !== 1 || !value.sightings || typeof value.sightings !== 'object' || Array.isArray(value.sightings)) throw new Error('Invalid backup');
 const decoded = decodeSightings(JSON.stringify(value.sightings));
 if (Object.keys(decoded).length !== Object.keys(value.sightings).length) throw new Error('Invalid backup');
 for (const code of Object.keys(decoded)) if (!byCode.has(code)) throw new Error('Invalid backup');
 return decoded;
}
export function mergeSightings(existing: Sightings, incoming: Sightings): Sightings {
 const merged = { ...existing };
 for (const [code, date] of Object.entries(incoming)) if (!merged[code] || Date.parse(date) < Date.parse(merged[code])) merged[code] = date;
 return merged;
}
