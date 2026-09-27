const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
const { plates, byCode, normalizeCode, decodeSightings } = require('../src/collection.ts');
const { factFor, hasCuratedFact } = require('../src/facts.ts');
test('catalogue contains unique regional codes, recent additions and no government codes', () => {
 assert.equal(plates.length,716);assert.equal(byCode.size,plates.length);
 for(const p of plates) { assert.match(p.code,/^[A-ZÄÖÜ]{1,3}$/);assert(p.place && p.state && p.places.length); }
 for(const c of ['B','MU','MUC','WBG','BÜS']) assert(byCode.has(c));
 for(const c of ['Y','X','BD','EHI','ZZZ']) assert(!byCode.has(c));
 assert.equal(new Set(plates.map(p=>p.state)).size,16);
});
test('input accepts lowercase, surrounding spaces and decomposed umlauts',()=>{
 assert.equal(normalizeCode(' b '),'B'); assert.equal(normalizeCode('bu\u0308s'),'BÜS');assert.equal(normalizeCode('B AB 123'),'B AB 123');
});
test('storage rejects corrupt structure and ignores unknown codes or invalid dates',()=>{
 const date='2026-09-27T12:00:00.000Z';
 assert.deepEqual(decodeSightings(null),{});assert.deepEqual(decodeSightings(JSON.stringify({B:date,ZZZ:date,M:'oops',HH:5})),{B:date});
 for(const value of ['{','[]','null','4']) assert.throws(()=>decodeSightings(value));
});
test('every code has a researched bilingual fact, never just the generic fallback',()=>{
 for(const p of plates) {
  assert(hasCuratedFact(p.code), `Missing researched fact: ${p.code}`);
  for(const language of ['en','de']) {
   const f=factFor(p,language);
   assert(f.title && f.text); assert.equal(f.label,undefined,`Fallback for ${p.code}/${language}`);
   assert.equal(new URL(f.source).protocol,'https:');
  }
 }
 assert.match(factFor(byCode.get('B')).text,/Teufelsberg/);
});
test('research records match the catalogue and retain source provenance',()=>{
 const research=require('../src/data/facts.json');
 for(const [code,record] of Object.entries(research)) {
  assert(byCode.has(code),`Unknown code ${code}`);
  assert(record.place.trim(),`Missing story location for ${code}`);
  assert.match(record.verifiedAt,/^\d{4}-\d{2}-\d{2}$/);
  assert(record.evidence.trim());
  assert.notEqual(record.en.text,record.de.text);
  for(const language of ['en','de']) assert(record[language].text.length>60);
 }
 assert.match(factFor(byCode.get('EIL')).text,/wrong house/i);
 assert.match(factFor(byCode.get('FEU'),'de').text,/Sage/);
});
const { groupPlates, collectionRows, regionFor } = require('../src/collection.ts');
test('all 716 mystery plates belong to one alphabetically ordered region', () => {
 const groups = groupPlates({}, 'all');
 assert.equal(groups.length, 13);
 assert.deepEqual(groups.map(g=>g.title), groups.map(g=>g.title).sort((a,b)=>a.localeCompare(b,'de')));
 const codes = groups.flatMap(g=>g.plates.map(p=>p.code));
 assert.equal(codes.length,716);assert.equal(new Set(codes).size,716);
 for(const g of groups){assert.equal(g.spotted,0);assert.equal(g.total,g.plates.length);assert.deepEqual(g.plates.map(p=>p.code),g.plates.map(p=>p.code).sort((a,b)=>a.localeCompare(b,'de')));}
 assert.equal(regionFor('Berlin'),regionFor('Brandenburg'));
 assert.equal(regionFor('Hamburg'),regionFor('Schleswig-Holstein'));
 assert.equal(regionFor('Bremen'),regionFor('Niedersachsen'));
});
test('filters keep regional membership, progress and complete grid rows', () => {
 const seen={B:'2026-09-27',P:'2026-09-27',HH:'2026-09-27',HB:'2026-09-27',H:'2026-09-27'};
 const groups=groupPlates(seen,'seen');
 assert.equal(groups.length,3);
 assert.deepEqual(groups.find(g=>g.title==='Berlin / Brandenburg').plates.map(p=>p.code),['B','P']);
 assert.equal(groups.find(g=>g.title==='Bremen / Niedersachsen').spotted,2);
 assert.equal(groupPlates(seen,'unseen').flatMap(g=>g.plates).length,711);
 for(const columns of [3,4,5,6]) {
  const rows=collectionRows({},'all',columns);
  assert.equal(rows.filter(r=>r.kind==='heading').length,13);
  assert.equal(rows.filter(r=>r.kind==='plates').flatMap(r=>r.plates).length,716);
  for(const row of rows.filter(r=>r.kind==='plates')) { assert(row.plates.length<=columns);assert.equal(new Set(row.plates.map(p=>regionFor(p.state))).size,1); }
 }
 assert.deepEqual(collectionRows({},'seen',3),[]);
});
const {parseBackup,mergeSightings,createBackup}=require('../src/backup.ts');
const {validLocation,decodeLocations}=require('../src/locationModel.ts');
test('backup validation is strict and merge preserves first sighting dates',()=>{
 const original={B:'2026-09-25T00:00:00Z'};
 assert.deepEqual(parseBackup(createBackup(original)),original);
 for(const sightings of [{ZZZ:'2026-09-27'}, {B:'nope'}, []]) assert.throws(()=>parseBackup(JSON.stringify({app:'schildersafari',version:1,sightings})));
 assert.deepEqual(mergeSightings(original,{B:'2026-09-27T00:00:00Z',HH:'2026-09-27T00:00:00Z'}),{...original,HH:'2026-09-27T00:00:00Z'});
});
test('coordinates must be finite, within geographic bounds and timestamped',()=>{
 const location={latitude:52.52,longitude:13.405,accuracy:10,capturedAt:'2026-09-27T10:00:00Z'};
 assert(validLocation(location));
 for(const change of [{latitude:91},{longitude:181},{latitude:NaN},{accuracy:-1},{capturedAt:'oops'}])assert(!validLocation({...location,...change}));
 assert.deepEqual(decodeLocations(JSON.stringify({B:location,ZZZ:location})),{B:location});
});
test('German facts exist for every code',()=>{
 for(const p of plates)assert.notEqual(factFor(p,'de').text,factFor(p,'en').text);
 assert.match(factFor(byCode.get('B'),'de').text,/Schutthaufen/);
});
