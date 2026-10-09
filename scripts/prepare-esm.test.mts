import assert from 'node:assert/strict';
import test from 'node:test';
import { rewriteRelativeImportSpecifiers } from './prepare-esm.mts';

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

test('rewrites relative module specifiers and preserves existing extensions', () => {
	assert.equal(rewriteRelativeImportSpecifiers(input), expected);
});

test('rewrites dynamic imports without modifying comments or string contents', () => {
	const source = `// import './comment';\nconst text = "from './string'";\nconst module = import('./lazy');`;
	assert.equal(rewriteRelativeImportSpecifiers(source), source.replace("import('./lazy')", "import('./lazy.js')"));
});
