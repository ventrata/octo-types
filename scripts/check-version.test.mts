import assert from 'node:assert/strict';
import test from 'node:test';
import { manifestChanged, verdict } from './check-version.mts';

const manifest = {
	name: '@ventrata/octo-types',
	version: '0.1.2',
	exports: { '.': { types: './dist/index.d.ts' } },
	peerDependencies: { zod: '^4.6.5' },
	devDependencies: { zod: '^4.6.5' },
	overrides: { lodash: '4.18.1' },
};

test('manifestChanged ignores the version, dev dependencies and overrides', () => {
	const after = {
		...manifest,
		version: '0.1.3',
		devDependencies: { zod: '^4.6.7' },
		overrides: { lodash: '4.18.1', minimatch: '11.0.8' },
	};
	assert.equal(manifestChanged(manifest, after), false);
});

test('manifestChanged ignores scripts other than the install hooks', () => {
	const before = { ...manifest, scripts: { build: 'tsc', prepare: 'npm run build' } };
	assert.equal(manifestChanged(before, { ...before, scripts: { build: 'tsc -b', 'check:version': 'node x' } }), false);
	assert.equal(manifestChanged(before, { ...before, scripts: { ...before.scripts, postinstall: 'node x' } }), true);
});

test('manifestChanged ignores the order of the fields', () => {
	const { name, ...rest } = manifest;
	assert.equal(manifestChanged(manifest, { ...rest, name }), false);
});

test('manifestChanged sees a field consumers get', () => {
	assert.equal(manifestChanged(manifest, { ...manifest, peerDependencies: { zod: '^4.6.6' } }), true);
	assert.equal(manifestChanged(manifest, { ...manifest, exports: {} }), true);
});

test('verdict passes a bumped version', () => {
	assert.equal(verdict('0.1.2', '0.1.3', ['src/index.ts']).ok, true);
});

test('verdict passes an unchanged version when the package does not change', () => {
	assert.equal(verdict('0.1.2', '0.1.2', []).ok, true);
});

test('verdict fails an unchanged version when the package changes, listing the changes', () => {
	const { ok, message } = verdict('0.1.2', '0.1.2', ['src/openapi.yaml', 'package.json']);
	assert.equal(ok, false);
	assert.match(message, /still 0\.1\.2/);
	assert.match(message, /src\/openapi\.yaml/);
	assert.match(message, /package\.json/);
});
