import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { normalizeUuidModel } from './normalize-models.mts';

function withModels(index: string, run: (modelsDir: string, indexPath: string) => void): void {
	const directory = mkdtempSync(path.join(tmpdir(), 'octo-models-'));
	const indexPath = path.join(directory, 'index.ts');
	try {
		writeFileSync(path.join(directory, 'UUID.ts'), 'export type uuid = string;\n');
		writeFileSync(
			path.join(directory, 'Booking.ts'),
			"import type { uuid } from './uuid';\nexport type Booking = { id: uuid };\n",
		);
		writeFileSync(indexPath, index);
		run(directory, indexPath);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
}

test('merges the uuid and UUID models and is idempotent', () => {
	const index = "export type { UUID } from './models/UUID';\nexport type { uuid } from './models/uuid';\n";
	withModels(index, (modelsDir, indexPath) => {
		for (let run = 0; run < 2; run++) {
			normalizeUuidModel(modelsDir, indexPath);
			assert.equal(
				readFileSync(path.join(modelsDir, 'UUID.ts'), 'utf8'),
				'export type uuid = string;\nexport type UUID = uuid;\n',
			);
			assert.match(readFileSync(path.join(modelsDir, 'Booking.ts'), 'utf8'), /from '\.\/UUID'/);
			assert.equal(readFileSync(indexPath, 'utf8'), "export type { UUID, uuid } from './models/UUID';\n");
		}
	});
});

test('fails when the generated index no longer contains the UUID exports', () => {
	withModels("export type { Booking } from './models/Booking';\n", (modelsDir, indexPath) => {
		assert.throws(() => normalizeUuidModel(modelsDir, indexPath), /UUID exports/);
	});
});
