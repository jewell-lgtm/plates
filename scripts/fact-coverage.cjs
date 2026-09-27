const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
const { plates } = require('../src/collection.ts');
const { hasCuratedFact } = require('../src/facts.ts');
const missing = plates.filter(p => !hasCuratedFact(p.code));
console.log(`${plates.length - missing.length}/${plates.length} codes have researched facts in German and English; ${missing.length} generic fallbacks.`);
if (missing.length) {
 console.log(`Missing: ${missing.map(p => p.code).join(', ')}`);
 process.exitCode = 1;
}
