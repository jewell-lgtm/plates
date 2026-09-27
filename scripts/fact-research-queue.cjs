// One record per distinct place label, retaining every matching code and state.
// Prints a reproducible search queue; does not scrape or publish search results.
const plates = require('../src/data/plates.json');
const places = new Map();
for (const plate of plates) for (const place of plate.places) {
 const entry = places.get(place) || { place, codes: [], states: [] };
 entry.codes.push(plate.code);
 if (!entry.states.includes(plate.state)) entry.states.push(plate.state);
 places.set(place, entry);
}
console.log(JSON.stringify([...places.values()].map(entry => ({
 ...entry,
 queries: [
  `"${entry.place}" ${entry.states.join(' ')} kuriose Fakten Besonderheiten Stadtgeschichte`,
  `"${entry.place}" ungewöhnliche Sehenswürdigkeiten Tourismus Museum`,
  `"${entry.place}" "Wussten Sie"`,
  `"${entry.place}" Sagen Traditionen Erfindungen`,
 ],
})), null, 2));
