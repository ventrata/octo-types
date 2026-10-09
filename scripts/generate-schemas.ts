import { existsSync, promises } from 'node:fs';
import * as path from 'node:path';
import * as glob from 'glob';
import { generate } from 'ts-to-zod';
import {
	applyRules,
	assertSchemasAreComplete,
	dropUnusedZodImport,
	findExportedSchemaNames,
	findSchemaExports,
	importPlaceholderSchemas,
	tidyBlankLines,
	toModuleSpecifier,
	toSchemaName,
	typeRecursiveSchemas,
	typeRequiredAnySchemas,
	useZodNamespaceImport,
	type GeneratedSchema,
} from './schema-generation/transforms';
import { normalizeUuidModel } from './schema-generation/normalize-models';

const CONFIG = {
	ignorePatterns: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
	relativePaths: {
		models: 'src/models',
		schemas: 'src/schemas',
		rules: 'src/rules',
		index: 'src/index.ts',
	},
	specificModels: [] as string[],
};

const SCHEMA_SECTION_HEADER = '\n\n// Zod Schemas';

async function generateSchemas(): Promise<void> {
	const modelsDir = path.resolve(process.cwd(), CONFIG.relativePaths.models);
	const schemasDir = path.resolve(process.cwd(), CONFIG.relativePaths.schemas);

	await normalizeUuidModel(modelsDir);

	const modelFiles = await findModelFiles(modelsDir);
	console.log(`Generating Zod schemas for ${modelFiles.length} models`);

	const schemas = await Promise.all(modelFiles.map((modelFile) => buildSchema(modelFile, modelsDir, schemasDir)));

	console.log(`Typed ${typeRequiredAnySchemas(schemas)} schemas that use required z.any()`);
	console.log(`Wrapped ${typeRecursiveSchemas(schemas)} recursive schemas in z.lazy()`);
	assertSchemasAreComplete(schemas);

	await writeSchemas(schemas, schemasDir);
	await writeIndexExports(schemasDir);
}

async function findModelFiles(modelsDir: string): Promise<string[]> {
	if (CONFIG.specificModels.length === 0) {
		return glob.sync('**/*.ts', { cwd: modelsDir, ignore: CONFIG.ignorePatterns }).sort();
	}

	const matches = CONFIG.specificModels.map((spec) => {
		const modelFile = spec.endsWith('.ts') ? spec : `${spec}.ts`;
		if (existsSync(path.join(modelsDir, modelFile))) return [modelFile];

		return glob.sync(`**/${path.basename(modelFile)}`, { cwd: modelsDir, ignore: CONFIG.ignorePatterns });
	});

	return Array.from(new Set(matches.flat())).sort();
}

async function buildSchema(modelFile: string, modelsDir: string, schemasDir: string): Promise<GeneratedSchema> {
	const modelPath = path.join(modelsDir, modelFile);
	const schemaPath = path.join(schemasDir, modelFile);
	const modelImportPath = toModuleSpecifier(path.relative(path.dirname(schemaPath), modelPath));
	const modelText = await promises.readFile(modelPath, 'utf-8');

	const generated = generate({ sourceText: modelText, getSchemaName: toSchemaName });
	if (generated.errors.length > 0) {
		throw new Error(`ts-to-zod reported errors for ${modelFile}: ${generated.errors.join(', ')}`);
	}

	let text = generated.getZodSchemasFile(modelImportPath);
	text = importPlaceholderSchemas(text, modelText);
	const modelName = path.basename(modelFile, '.ts');
	if (existsSync(path.resolve(CONFIG.relativePaths.rules, `${modelName}.ts`))) text = applyRules(text, modelName);
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

async function writeSchemas(schemas: GeneratedSchema[], schemasDir: string): Promise<void> {
	if (CONFIG.specificModels.length === 0) {
		await promises.rm(schemasDir, { recursive: true, force: true });
	}

	await Promise.all(
		schemas.map(async (schema) => {
			const schemaPath = path.join(schemasDir, schema.relativePath);
			await promises.mkdir(path.dirname(schemaPath), { recursive: true });
			await promises.writeFile(schemaPath, tidyBlankLines(schema.text));
		}),
	);

	console.log(`Wrote ${schemas.length} schema files to ${CONFIG.relativePaths.schemas}`);
}

async function writeIndexExports(schemasDir: string): Promise<void> {
	const indexPath = path.resolve(process.cwd(), CONFIG.relativePaths.index);
	const indexText = await promises.readFile(indexPath, 'utf-8');
	const schemaFiles = glob.sync('**/*.ts', { cwd: schemasDir }).sort().reverse();

	const exported = new Set<string>();
	const exportLines: string[] = [];

	for (const schemaFile of schemaFiles) {
		const moduleName = toModuleSpecifier(schemaFile).replace(/^\.\//, '');
		const schemaText = await promises.readFile(path.join(schemasDir, schemaFile), 'utf-8');

		for (const schemaName of findExportedSchemaNames(schemaText)) {
			if (exported.has(schemaName)) continue;

			exported.add(schemaName);
			exportLines.push(`export { ${schemaName} } from './schemas/${moduleName}';`);
		}
	}

	const modelExports = indexText.split(SCHEMA_SECTION_HEADER)[0].trimEnd();
	await promises.writeFile(indexPath, `${modelExports}${SCHEMA_SECTION_HEADER}\n${exportLines.join('\n')}\n`);

	console.log(`Updated ${CONFIG.relativePaths.index} with ${exportLines.length} schema exports`);
}

generateSchemas().catch((err) => {
	console.error(err);
	process.exit(1);
});
