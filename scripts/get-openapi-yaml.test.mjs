import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fetchAndSaveYaml } from './get-openapi-yaml.mjs';

test('download failures preserve the existing specification', async () => {
	const directory = await mkdtemp(path.join(tmpdir(), 'octo-openapi-'));
	const outputPath = path.join(directory, 'openapi.yaml');
	try {
		await writeFile(outputPath, 'original');
		await assert.rejects(
			fetchAndSaveYaml({ outputPath, fetchImpl: async () => new Response('', { status: 503 }) }),
			/503/,
		);
		await assert.rejects(fetchAndSaveYaml({ outputPath, fetchImpl: async () => new Response('') }), /empty/);
		assert.equal(await readFile(outputPath, 'utf8'), 'original');
		await fetchAndSaveYaml({ outputPath, fetchImpl: async () => new Response('openapi: 3.0.0') });
		assert.equal(await readFile(outputPath, 'utf8'), 'openapi: 3.0.0');
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});
