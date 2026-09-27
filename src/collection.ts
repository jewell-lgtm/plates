import data from './data/plates.json';
export type Plate = (typeof data)[number];
export type Sightings = Record<string, string>;
export const plates: Plate[] = data;
export const byCode = new Map(plates.map(p => [p.code, p]));
export const STORAGE_KEY = 'plates.sightings.v1';
export function normalizeCode(value: string) { return value.trim().toLocaleUpperCase('de-DE').normalize('NFC'); }
export function decodeSightings(raw: string | null): Sightings {
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid collection');
  return Object.fromEntries(Object.entries(parsed).filter(([code, date]) => byCode.has(code) && typeof date === 'string' && !Number.isNaN(Date.parse(date))));
}
export const CATALOG_SOURCE = 'https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/kfz-zulassung/kfz-kennzeichen-deutschland/';

export type CollectionFilter = 'all' | 'seen' | 'unseen';
const combinedStates: Record<string, string> = {
  Berlin: 'Berlin / Brandenburg', Brandenburg: 'Berlin / Brandenburg',
  'Freie Hansestadt Bremen': 'Bremen / Niedersachsen',
  Bremen: 'Bremen / Niedersachsen', Niedersachsen: 'Bremen / Niedersachsen',
  'Freie und Hansestadt Hamburg': 'Hamburg / Schleswig-Holstein',
  Hamburg: 'Hamburg / Schleswig-Holstein', 'Schleswig-Holstein': 'Hamburg / Schleswig-Holstein',
};
export function regionFor(state: string) { return combinedStates[state] ?? state; }
export function groupPlates(seen: Sightings, filter: CollectionFilter) {
  const regions = new Map<string, Plate[]>();
  for (const plate of plates) {
    const title = regionFor(plate.state);
    if (!regions.has(title)) regions.set(title, []);
    regions.get(title)!.push(plate);
  }
  return [...regions.entries()].sort(([a], [b]) => a.localeCompare(b, 'de')).map(([title, all]) => ({
    title,
    total: all.length,
    spotted: all.filter(p => !!seen[p.code]).length,
    plates: all.filter(p => filter === 'all' || (filter === 'seen' ? !!seen[p.code] : !seen[p.code]))
      .sort((a, b) => a.code.localeCompare(b.code, 'de')),
  })).filter(group => group.plates.length > 0);
}
export type CollectionRow =
  | { kind: 'heading'; key: string; title: string; total: number; spotted: number }
  | { kind: 'plates'; key: string; plates: Plate[] };
export function collectionRows(seen: Sightings, filter: CollectionFilter, columns: number): CollectionRow[] {
  return groupPlates(seen, filter).flatMap(group => {
    const rows: CollectionRow[] = [{ kind: 'heading', key: group.title, title: group.title, total: group.total, spotted: group.spotted }];
    for (let i = 0; i < group.plates.length; i += columns) {
      rows.push({ kind: 'plates', key: `${group.title}:${i}`, plates: group.plates.slice(i, i + columns) });
    }
    return rows;
  });
}
