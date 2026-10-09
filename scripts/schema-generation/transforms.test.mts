import assert from 'node:assert/strict';
import test from 'node:test';
import { findCyclicNodes } from './dependencies.mts';
import { findExportedSchemaNames } from '../ast.mts';
import { annotateSchema, typeRecursiveSchemas, type GeneratedSchema } from './transforms.mts';

test('annotations preserve delimiters inside string literals and comments', () => {
	const source = "export const exampleSchema = z.object({ value: z.literal('};(') }); // comment";
	const output = annotateSchema(source, 'exampleSchema', 'Example', './Example', { wrapLazy: true });
	assert.match(output, /z\.ZodType<Example>/);
	assert.match(output, /z\.lazy/);
	assert.match(output, /literal\(["']};\(["']\)/);
	assert.deepEqual(findExportedSchemaNames(output), ['exampleSchema']);
});

test('cycle detection includes overlapping cycles and self references', () => {
	const dependencies = new Map([
		['A', new Set(['B', 'C'])],
		['B', new Set(['A'])],
		['C', new Set(['B'])],
		['D', new Set(['D'])],
		['E', new Set(['A'])],
	]);
	assert.deepEqual([...findCyclicNodes(dependencies)].sort(), ['A', 'B', 'C', 'D']);
});

test('wraps mutually recursive modules while leaving independent modules eager', () => {
	const schema = (name: string, dependency?: string): GeneratedSchema => ({
		relativePath: `${name}.ts`,
		modelImportPath: `../models/${name}`,
		exports: [{ schemaName: `${name.toLowerCase()}Schema`, typeName: name }],
		text: `${dependency ? `import { ${dependency.toLowerCase()}Schema } from './${dependency}';` : ''}\nexport const ${name.toLowerCase()}Schema = z.object({});`,
	});
	const schemas = [schema('A', 'B'), schema('B', 'A'), schema('C')];
	assert.equal(typeRecursiveSchemas(schemas), 2);
	assert.match(schemas[0].text, /z\.lazy/);
	assert.match(schemas[1].text, /z\.lazy/);
	assert.doesNotMatch(schemas[2].text, /z\.lazy/);
});
