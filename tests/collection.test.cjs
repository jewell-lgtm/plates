const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
const { plates, byCode, normalizeCode, decodeSightings } = require('../src/collection.ts');
const { factFor } = require('../src/facts.ts');
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
test('every code has a sourced fact and Berlin has its specific curiosity',()=>{
 for(const p of plates) { const f=factFor(p); assert(f.title && f.text);assert.equal(new URL(f.source).protocol,'https:'); }
 assert.match(factFor(byCode.get('B')).text,/Teufelsberg/);
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
