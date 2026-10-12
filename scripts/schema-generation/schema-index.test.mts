import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { schemaExportLines } from './schema-index.mts';

test('lists every exported schema in file order relative to the import directory', () => {
	const directory = mkdtempSync(path.join(tmpdir(), 'octo-schemas-'));
	try {
		mkdirSync(path.join(directory, 'nested'));
		writeFileSync(
			path.join(directory, 'B.ts'),
			'export const bSchema = 1;\nconst hiddenSchema = 2;\nexport const bOther = 3;\n',
		);
		writeFileSync(path.join(directory, 'A.ts'), 'export const aSchema = 1;\nexport const aExtraSchema = 2;\n');
		writeFileSync(path.join(directory, 'nested', 'C.ts'), 'export const cSchema = 1;\n');
		assert.deepEqual(schemaExportLines(directory, 'schemas'), [
			"export { aSchema } from './schemas/A';",
			"export { aExtraSchema } from './schemas/A';",
			"export { bSchema } from './schemas/B';",
			"export { cSchema } from './schemas/nested/C';",
		]);
		assert.deepEqual(schemaExportLines(directory, '.').slice(0, 1), ["export { aSchema } from './A';"]);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
