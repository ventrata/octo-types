import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import ts from 'typescript';

const projectRoot = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);

test('package supports CJS, ESM, TypeScript and browser tree-shaking', async () => {
	execFileSync('npm', ['run', 'build'], { cwd: projectRoot, stdio: 'inherit' });

	const cjs = require('@ventrata/octo-types');
	assert.ok(cjs.CapabilityId, 'CommonJS entry point should export CapabilityId');

	const esm = await import('@ventrata/octo-types');
	assert.ok(esm.CapabilityId, 'native ESM entry point should export CapabilityId');

	const classic = await import('@ventrata/octo-types/schemas/BookingGifts');
	const mini = await import('@ventrata/octo-types/schemas-mini/BookingGifts');
	for (const value of [{ giftPayment: null }, {}]) {
		assert.equal(mini.bookingGiftsSchema.safeParse(value).success, classic.bookingGiftsSchema.safeParse(value).success);
	}

	const classicIndex = await import('@ventrata/octo-types');
	const miniIndex = await import('@ventrata/octo-types/schemas-mini');
	assert.deepEqual(
		Object.keys(miniIndex).sort(),
		Object.keys(classicIndex)
			.filter((name) => name.endsWith('Schema'))
			.sort(),
	);
	assert.ok(require('@ventrata/octo-types/schemas-mini').bookingGiftsSchema);

	for (const name of ['bookingSchema', 'productSchema', 'octo_ErrorInvalidProductIDSchema']) {
		assert.ok(classicIndex[name], `missing classic schema ${name}`);
		assert.ok(miniIndex[name], `missing Mini schema ${name}`);
		for (const value of [null, {}, { id: 'test' }, [], 'invalid']) {
			assert.equal(miniIndex[name].safeParse(value).success, classicIndex[name].safeParse(value).success, name);
		}
	}

	for (const extension of ['mts', 'cts']) {
		const fileName = path.join(projectRoot, 'scripts', `consumer.${extension}`);
		const contents = `
		import { CapabilityId, type Booking, bookingSchema } from '@ventrata/octo-types';
		import { bookingGiftsSchema } from '@ventrata/octo-types/schemas-mini';
		import { productSchema } from '@ventrata/octo-types/schemas-mini/Product';
		const parsed: Booking = bookingSchema.parse({});
		bookingGiftsSchema.safeParse({}); productSchema.safeParse({}); console.log(CapabilityId, parsed);
	`;
		const options = {
			strict: true,
			noEmit: true,
			skipLibCheck: false,
			target: ts.ScriptTarget.ES2021,
			module: ts.ModuleKind.NodeNext,
			moduleResolution: ts.ModuleResolutionKind.NodeNext,
		};
		const host = ts.createCompilerHost(options);
		const readFile = host.readFile.bind(host);
		host.readFile = (name) => (name === fileName ? contents : readFile(name));
		const program = ts.createProgram([fileName], options, host);
		const diagnostics = ts.getPreEmitDiagnostics(program);
		assert.equal(
			diagnostics.length,
			0,
			ts.formatDiagnosticsWithColorAndContext(diagnostics, {
				getCanonicalFileName: (name) => name,
				getCurrentDirectory: () => projectRoot,
				getNewLine: () => '\n',
			}),
		);
	}

	async function bundle(source) {
		const result = await build({
			stdin: { contents: source, resolveDir: projectRoot, sourcefile: 'bundle-test.mjs' },
			bundle: true,
			minify: true,
			format: 'esm',
			platform: 'browser',
			write: false,
		});
		return gzipSync(result.outputFiles[0].contents, { level: 9 }).byteLength;
	}

	const enumSize = await bundle("import { CapabilityId } from '@ventrata/octo-types'; console.log(CapabilityId);");
	assert.ok(enumSize < 2_000, `enum-only bundle is unexpectedly large: ${enumSize} bytes gzipped`);

	const classicSchemaSize = await bundle(
		"import { bookingGiftsSchema } from '@ventrata/octo-types/schemas/BookingGifts'; console.log(bookingGiftsSchema.safeParse({}));",
	);
	assert.ok(
		classicSchemaSize < 50_000,
		`classic Zod schema bundle is unexpectedly large: ${classicSchemaSize} bytes gzipped`,
	);

	const miniSchemaSize = await bundle(
		"import { bookingGiftsSchema } from '@ventrata/octo-types/schemas-mini/BookingGifts'; console.log(bookingGiftsSchema.safeParse({}));",
	);
	assert.ok(miniSchemaSize < 15_000, `Zod Mini schema bundle is unexpectedly large: ${miniSchemaSize} bytes gzipped`);

	console.log(
		`package integration tests passed (enum ${enumSize} B, classic schema ${classicSchemaSize} B, mini schema ${miniSchemaSize} B gzipped)`,
	);
});
