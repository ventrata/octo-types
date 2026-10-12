import { globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
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

export function generateSchemas(): void {
	normalizeUuidModel(MODELS_DIR, INDEX_PATH);

	const modelFiles = globSync('**/*.ts', { cwd: MODELS_DIR }).sort();
	console.log(`Generating Zod schemas for ${modelFiles.length} models`);

	const schemas = modelFiles.map(buildSchema);
	console.log(`Typed ${typeRequiredAnySchemas(schemas)} schemas that use required z.any()`);
	console.log(`Wrapped ${typeRecursiveSchemas(schemas)} recursive schemas in z.lazy()`);
	assertSchemasAreComplete(schemas);

	writeSchemas(schemas);
	writeIndexExports();
}

function buildSchema(modelFile: string): GeneratedSchema {
	const modelPath = path.join(MODELS_DIR, modelFile);
	const schemaPath = path.join(SCHEMAS_DIR, modelFile);
	const modelImportPath = toModuleSpecifier(path.relative(path.dirname(schemaPath), modelPath));
	const modelText = readFileSync(modelPath, 'utf-8');

	const generated = generate({ sourceText: modelText, getSchemaName: toSchemaName });
	if (generated.errors.length > 0) {
		throw new Error(`ts-to-zod reported errors for ${modelFile}: ${generated.errors.join(', ')}`);
	}

	let text = generated.getZodSchemasFile(modelImportPath);
	text = importPlaceholderSchemas(text, modelText);
	text = dropUnusedZodImport(text);
	text = useZodNamespaceImport(text);

	return {
		relativePath: modelFile,
		modelImportPath,
		exports: findSchemaExports(text, modelText),
		text,
	};
}

function writeSchemas(schemas: GeneratedSchema[]): void {
	rmSync(SCHEMAS_DIR, { recursive: true, force: true });
	for (const schema of schemas) {
		const schemaPath = path.join(SCHEMAS_DIR, schema.relativePath);
		mkdirSync(path.dirname(schemaPath), { recursive: true });
		writeFileSync(schemaPath, tidyBlankLines(schema.text));
	}
	console.log(`Wrote ${schemas.length} schema files to ${path.relative(process.cwd(), SCHEMAS_DIR)}`);
}

function writeIndexExports(): void {
	const indexText = readFileSync(INDEX_PATH, 'utf-8');
	const exportLines = schemaExportLines(SCHEMAS_DIR, 'schemas');
	const modelExports = indexText.split(SCHEMA_SECTION_HEADER)[0].trimEnd();
	writeFileSync(INDEX_PATH, `${modelExports}${SCHEMA_SECTION_HEADER}\n${exportLines.join('\n')}\n`);
	console.log(`Updated ${path.relative(process.cwd(), INDEX_PATH)} with ${exportLines.length} schema exports`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	generateSchemas();
}
