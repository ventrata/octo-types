import { globSync, promises } from 'node:fs';
import * as path from 'node:path';
import { generate } from 'ts-to-zod';
import { normalizeUuidModel } from './schema-generation/normalize-models.mts';
import { schemaExportLines } from './schema-generation/schema-index.mts';
import {
	assertSchemasAreComplete,
	dropUnusedZodImport,
	findSchemaExports,
	importPlaceholderSchemas,
	tidyBlankLines,
	toModuleSpecifier,
	toSchemaName,
	typeRecursiveSchemas,
	typeRequiredAnySchemas,
	useZodNamespaceImport,
	type GeneratedSchema,
} from './schema-generation/transforms.mts';

const MODELS_DIR = path.resolve('src/models');
const SCHEMAS_DIR = path.resolve('src/schemas');
const INDEX_PATH = path.resolve('src/index.ts');

const SCHEMA_SECTION_HEADER = '\n\n// Zod Schemas';

async function generateSchemas(): Promise<void> {
	await normalizeUuidModel(MODELS_DIR, INDEX_PATH);

	const modelFiles = globSync('**/*.ts', { cwd: MODELS_DIR }).sort();
	console.log(`Generating Zod schemas for ${modelFiles.length} models`);

	const schemas = await Promise.all(modelFiles.map(buildSchema));
	console.log(`Typed ${typeRequiredAnySchemas(schemas)} schemas that use required z.any()`);
	console.log(`Wrapped ${typeRecursiveSchemas(schemas)} recursive schemas in z.lazy()`);
	assertSchemasAreComplete(schemas);

	await writeSchemas(schemas);
	await writeIndexExports();
}

async function buildSchema(modelFile: string): Promise<GeneratedSchema> {
	const modelPath = path.join(MODELS_DIR, modelFile);
	const schemaPath = path.join(SCHEMAS_DIR, modelFile);
	const modelImportPath = toModuleSpecifier(path.relative(path.dirname(schemaPath), modelPath));
	const modelText = await promises.readFile(modelPath, 'utf-8');

	const generated = generate({ sourceText: modelText, getSchemaName: toSchemaName });
	if (generated.errors.length > 0) {
		throw new Error(`ts-to-zod reported errors for ${modelFile}: ${generated.errors.join(', ')}`);
	}

	let text = generated.getZodSchemasFile(modelImportPath);
	text = importPlaceholderSchemas(text, modelText);
	text = dropUnusedZodImport(text);
	text = useZodNamespaceImport(text);
	text = tidyBlankLines(text);

	return {
		relativePath: modelFile,
		modelImportPath,
		exports: findSchemaExports(text, modelText),
		text,
	};
}

async function writeSchemas(schemas: GeneratedSchema[]): Promise<void> {
	// Start from an empty directory so removed models do not leave stale schemas behind.
	await promises.rm(SCHEMAS_DIR, { recursive: true, force: true });
	await Promise.all(
		schemas.map(async (schema) => {
			const schemaPath = path.join(SCHEMAS_DIR, schema.relativePath);
			await promises.mkdir(path.dirname(schemaPath), { recursive: true });
			await promises.writeFile(schemaPath, tidyBlankLines(schema.text));
		}),
	);
	console.log(`Wrote ${schemas.length} schema files to ${path.relative(process.cwd(), SCHEMAS_DIR)}`);
}

async function writeIndexExports(): Promise<void> {
	const indexText = await promises.readFile(INDEX_PATH, 'utf-8');
	const exportLines = schemaExportLines(SCHEMAS_DIR, 'schemas');
	const modelExports = indexText.split(SCHEMA_SECTION_HEADER)[0].trimEnd();
	await promises.writeFile(INDEX_PATH, `${modelExports}${SCHEMA_SECTION_HEADER}\n${exportLines.join('\n')}\n`);
	console.log(`Updated ${path.relative(process.cwd(), INDEX_PATH)} with ${exportLines.length} schema exports`);
}

generateSchemas().catch((err) => {
	console.error(err);
	process.exit(1);
});
