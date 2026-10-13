import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { findExportedSchemaNames } from '../ast.mts';
import { findCyclicNodes } from './dependencies.mts';
import {
	annotateSchema,
	assertSchemasAreComplete,
	dropUnusedZodImport,
	importPlaceholderSchemas,
	tidyBlankLines,
	toModuleSpecifier,
	typeRecursiveSchemas,
	typeRequiredAnySchemas,
	type GeneratedSchema,
} from './transforms.mts';

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

test('replaces placeholder schemas for imported types with imports from their schema files', () => {
	const modelText = "import type { Price } from './Pricing';\nexport type Item = { price: Price; unit: Unit };";
	const schemaText = [
		"import { z } from 'zod';",
		'const priceSchema = z.any();',
		'const unitSchema = z.any();',
		'export const itemSchema = z.object({ price: priceSchema, unit: unitSchema });',
	].join('\n');
	const output = importPlaceholderSchemas(schemaText, modelText);
	assert.match(output, /import \{ priceSchema \} from '\.\/Pricing';/);
	assert.match(output, /import \{ unitSchema \} from '\.\/Unit';/);
	assert.doesNotMatch(output, /z\.any\(\)/);
});

test('drops the zod import only when z is unused', () => {
	const unused = "import { z } from 'zod';\nimport { aSchema } from './A';\nexport const bSchema = aSchema;";
	assert.equal(dropUnusedZodImport(unused), "\nimport { aSchema } from './A';\nexport const bSchema = aSchema;");
	const used = "import { z } from 'zod';\nexport const bSchema = z.string();";
	assert.equal(dropUnusedZodImport(used), used);
});

test('casts schemas with required z.any() properties to their model type', () => {
	const schema: GeneratedSchema = {
		relativePath: 'Item.ts',
		modelImportPath: '../models/Item',
		exports: [{ schemaName: 'itemSchema', typeName: 'Item' }, { schemaName: 'helperSchema' }],
		text: "import * as z from 'zod';\nexport const itemSchema = z.object({ value: z.any() });",
	};
	assert.equal(typeRequiredAnySchemas([schema]), 1);
	assert.match(schema.text, /itemSchema: z\.ZodType<Item> = z\.object\(\{[\s\S]*\}\) as z\.ZodType<Item>/);
	assert.match(schema.text, /import \{ type Item \} from '\.\.\/models\/Item';/);
});

test('reports schemas that import missing exports', () => {
	const schema = (name: string, text: string, exports: string[]): GeneratedSchema => ({
		relativePath: `${name}.ts`,
		modelImportPath: `../models/${name}`,
		exports: exports.map((schemaName) => ({ schemaName })),
		text,
	});
	const complete = [schema('A', "import { bSchema } from './B';", ['aSchema']), schema('B', '', ['bSchema'])];
	assert.doesNotThrow(() => assertSchemasAreComplete(complete));
	const broken = [schema('A', "import { cSchema } from './B';", ['aSchema']), schema('B', '', [])];
	assert.throws(() => assertSchemasAreComplete(broken), /A\.ts: missing cSchema from \.\/B\nB\.ts: no exported schema/);
});

test('collapses blank lines and separates exported declarations', () => {
	assert.equal(
		tidyBlankLines('\nimport a;  \n\n\n\nconst x = 1;\nexport const ySchema = x;\nexport const zSchema = x;\n\n'),
		'import a;\n\nconst x = 1;\n\nexport const ySchema = x;\n\nexport const zSchema = x;\n',
	);
});

test('converts relative file paths to module specifiers', () => {
	assert.equal(toModuleSpecifier('Booking.ts'), './Booking');
	assert.equal(toModuleSpecifier(path.join('..', 'models', 'Booking.ts')), '../models/Booking');
});
