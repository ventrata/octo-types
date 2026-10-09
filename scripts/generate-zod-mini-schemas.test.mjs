import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { transformSchemaSource } from './generate-zod-mini-schemas.mjs';

const input = `
import * as z from 'zod';
import type { Example } from './Example';

export const exampleSchema: z.ZodType<Example> = z.object({
  value: z.string().optional().nullable(),
  intersection: z.object({ left: z.string() }).and(z.object({ right: z.number() })),
});
`;

test('classic and Mini schemas parse recursive intersections with identical results', () => {
	const source = `
		import * as z from 'zod';
		type Tree = { name: string; children?: Tree[] | null };
		export const treeSchema: z.ZodType<Tree> = z.lazy(() =>
			z.object({ name: z.string() }).and(z.object({ children: z.array(treeSchema).optional().nullable() })));
	`;
	const evaluate = (text) => {
		const { outputText } = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
		const exports = {};
		new Function('require', 'exports', outputText)(createRequire(import.meta.url), exports);
		return exports.treeSchema;
	};
	const classic = evaluate(source);
	const mini = evaluate(transformSchemaSource(source));
	for (const value of [
		{ name: 'root' },
		{ name: 'root', children: null },
		{ name: 'root', children: [{ name: 'leaf' }] },
	]) {
		assert.deepEqual(mini.parse(value), classic.parse(value));
	}
	for (const value of [{}, { name: 'root', children: [{}] }]) {
		assert.equal(classic.safeParse(value).success, false);
		assert.equal(mini.safeParse(value).success, false);
	}
});

test('converts nested wrappers, intersections and type annotations', () => {
	const output = transformSchemaSource(input);

	assert.match(output, /from ['"]zod\/mini['"]/);
	assert.match(output, /z\.ZodMiniType<Example>/);
	assert.match(output, /z\.nullable\(z\.optional\(z\.string\(\)\)\)/);
	assert.match(output, /z\.intersection\(z\.object\([\s\S]+z\.object\(/);
	assert.doesNotMatch(output, /\)\.(?:optional|nullable|and)\(/);
});
