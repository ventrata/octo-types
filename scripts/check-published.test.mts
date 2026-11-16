import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublished } from './check-published.mts';

const found = () => {};
const failing = (stderr: string) => () => {
	throw Object.assign(new Error('npm view failed'), { stderr });
};

test('isPublished is true when npm finds the version', () => {
	assert.equal(isPublished('@ventrata/octo-types', '0.1.2', found), true);
});

test('isPublished is false when npm finds no such version', () => {
	assert.equal(isPublished('@ventrata/octo-types', '9.9.9', failing('npm error code E404')), false);
});

test('isPublished rethrows any other npm failure', () => {
	assert.throws(
		() => isPublished('@ventrata/octo-types', '0.1.2', failing('npm error code ETIMEDOUT')),
		/npm view failed/,
	);
});

test('isPublished asks npm for the exact version', () => {
	let asked = '';
	isPublished('@ventrata/octo-types', '0.1.3', (spec) => {
		asked = spec;
	});
	assert.equal(asked, '@ventrata/octo-types@0.1.3');
});
