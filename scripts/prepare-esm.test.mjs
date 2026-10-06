import assert from 'node:assert/strict';
import { rewriteRelativeImportSpecifiers } from './prepare-esm.mjs';

const input = [
	"import { foo } from './foo';",
	"import './polyfill';",
	'export { bar } from "../bar";',
	"import baz from './already.js';",
	"import json from './config.json';",
].join('\n');

const expected = [
	"import { foo } from './foo.js';",
	"import './polyfill.js';",
	'export { bar } from "../bar.js";',
	"import baz from './already.js';",
	"import json from './config.json';",
].join('\n');

assert.equal(rewriteRelativeImportSpecifiers(input), expected);
console.log('prepare-esm rewrite test passed');
