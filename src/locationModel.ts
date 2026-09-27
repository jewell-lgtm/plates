import { byCode } from './collection';
export type SavedLocation = { latitude: number; longitude: number; accuracy: number | null; capturedAt: string };
export type Locations = Record<string, SavedLocation>;
export const LOCATIONS_KEY = 'schildersafari.locations.v1';
export function validLocation(value: unknown): value is SavedLocation {
 if (!value || typeof value !== 'object') return false;
 const v = value as SavedLocation;
 return typeof v.latitude === 'number' && Number.isFinite(v.latitude) && Math.abs(v.latitude) <= 90 && typeof v.longitude === 'number' && Number.isFinite(v.longitude) && Math.abs(v.longitude) <= 180 && (v.accuracy === null || (typeof v.accuracy === 'number' && Number.isFinite(v.accuracy) && v.accuracy >= 0)) && typeof v.capturedAt === 'string' && !Number.isNaN(Date.parse(v.capturedAt));
}
export function decodeLocations(raw: string | null): Locations {
 if (!raw) return {};
 const data: unknown = JSON.parse(raw);
 if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid locations');
 return Object.fromEntries(Object.entries(data).filter(([code, location]) => byCode.has(code) && validLocation(location)));
}
