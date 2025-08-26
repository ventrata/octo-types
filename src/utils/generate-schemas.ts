import { existsSync, promises } from 'node:fs';
import * as path from 'node:path';
import * as glob from 'glob';
import { generate } from 'ts-to-zod';

type ZanySchema = {
	fullMatch: string;
	schemaName: string;
};

const CONFIG = {
	ignorePatterns: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
	relativePaths: {
		models: 'src/models',
		schemas: 'src/schemas',
	},
	specificModels: [],
};

async function generateSchemas() {
	const { modelsDir, schemasDir } = setupDirectories();

	try {
		await ensureDirectoryExists(schemasDir);

		const files =
			CONFIG.specificModels.length > 0
				? await findSpecificModelFiles(modelsDir, CONFIG.specificModels)
				: findTypeScriptFiles(modelsDir);

		console.log(`Found ${files.length} TypeScript files to process`);

		await Promise.all(files.map((file) => processFile(file, { modelsDir, schemasDir })));

		console.log('Analyzing and fixing circular dependencies...');
		await fixCircularDependencies(schemasDir);

		await updateIndexFileWithSchemas(schemasDir);

		console.log('Finished generating Zod schemas');
	} catch (err) {
		console.error('Unhandled error:', err);
		process.exit(1);
	}
}

function setupDirectories() {
	const projectRoot = process.cwd();

	return {
		modelsDir: path.resolve(projectRoot, CONFIG.relativePaths.models),
		schemasDir: path.resolve(projectRoot, CONFIG.relativePaths.schemas),
	};
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
	try {
		await promises.mkdir(dirPath, { recursive: true });
		console.log(`Created directory at ${dirPath}`);
	} catch (err) {
		console.error(`Error creating directory: ${err}`);
		throw err;
	}
}

function findTypeScriptFiles(dir: string): string[] {
	return glob.sync('**/*.ts', {
		cwd: dir,
		ignore: CONFIG.ignorePatterns,
	});
}

async function findSpecificModelFiles(dir: string, modelSpecs: string[]): Promise<string[]> {
	const result: string[] = [];

	for (const spec of modelSpecs) {
		const normalizedSpec = spec.endsWith('.ts') ? spec : `${spec}.ts`;

		if (await promises.stat(path.join(dir, normalizedSpec)).catch(() => null)) {
			result.push(normalizedSpec);
			continue;
		}

		const fileName = path.basename(normalizedSpec);
		const matches = glob.sync(`**/${fileName}`, {
			cwd: dir,
			ignore: CONFIG.ignorePatterns,
		});

		result.push(...matches);
	}

	return Array.from(new Set(result));
}

async function processFile(file: string, dirs: { modelsDir: string; schemasDir: string }): Promise<void> {
	const { modelsDir, schemasDir } = dirs;
	const inputPath = path.join(modelsDir, file);
	const relativePath = path.relative(modelsDir, inputPath);
	const outputDir = path.dirname(path.join(schemasDir, relativePath));
	const fileName = path.basename(relativePath, '.ts');
	const outputPath = path.join(outputDir, `${fileName}.ts`);

	try {
		await ensureDirectoryExists(outputDir);

		const sourceText = await promises.readFile(inputPath, 'utf-8');
		const result = generateSchema(sourceText);

		if (result.errors.length > 0) {
			console.warn(`Errors in ${file}:`, result.errors);
		}

		const modelImportPathRaw = path.relative(outputDir, inputPath).replace(/\.ts$/, '');
		const modelImportPath = (modelImportPathRaw.startsWith('.') ? modelImportPathRaw : `./${modelImportPathRaw}`)
			.split(path.sep)
			.join('/');

		let zodSchemasText = result.getZodSchemasFile(modelImportPath);

		zodSchemasText = replaceZanySchemas(zodSchemasText);
		zodSchemasText = addRules(zodSchemasText, fileName);

		if (!zodSchemasText.includes('z.')) {
			zodSchemasText = zodSchemasText.replace(/import\s*{\s*z\s*}\s*from\s*["']zod["'];\s*\n?/g, '');
		}

		zodSchemasText = `${zodSchemasText
			.split('\n')
			.map((line) => line.trimEnd())
			.filter((line, idx, arr) => line !== '' || (idx > 0 && arr[idx - 1] !== ''))
			.join('\n')
			.trimEnd()}\n`;

		await promises.writeFile(outputPath, zodSchemasText);
		console.log(`Created schema file: ${outputPath}`);
	} catch (err) {
		console.error(`Error processing ${file}:`, err);
	}
}

function generateSchema(sourceText: string) {
	return generate({
		sourceText,
		getSchemaName: (name) => `${name.charAt(0).toLowerCase() + name.slice(1)}Schema`,
	});
}

function replaceZanySchemas(fileContent: string): string {
	const zanySchemas = findZanySchemas(fileContent);
	if (zanySchemas.length === 0) return fileContent;

	const importsToAdd: string[] = [];
	let modifiedContent = fileContent;

	for (const schema of zanySchemas) {
		const baseName = schema.schemaName.replace(/Schema$/, '');
		const fileName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

		importsToAdd.push(`import { ${schema.schemaName} } from "./${fileName}";`);
		modifiedContent = modifiedContent.replace(schema.fullMatch, '');
	}

	return reorganizeImports(modifiedContent, importsToAdd);
}

function findZanySchemas(content: string): ZanySchema[] {
	const zanyRegex = /const\s+([a-zA-Z0-9_]+)\s+=\s+z\.any\(\);/g;
	const zanySchemas: ZanySchema[] = [];
	let match = zanyRegex.exec(content);

	while (match !== null) {
		zanySchemas.push({
			fullMatch: match[0],
			schemaName: match[1],
		});
		match = zanyRegex.exec(content);
	}

	return zanySchemas;
}

function reorganizeImports(content: string, newImports: string[]): string {
	if (newImports.length === 0) return content;

	const existingImportRegex = /^import .+ from .+;\n*/gm;
	const matches = content.match(existingImportRegex);
	const existingImports: string[] = matches ? [...matches] : [];
	const endOfImportsIndex = existingImports.reduce((lastIndex: number, imp: string) => {
		const index = content.indexOf(imp);
		return index > lastIndex ? index + imp.length : lastIndex;
	}, 0);
	const cleanedContent = content.slice(endOfImportsIndex).replace(/^\s*\n+/g, '');

	return `${content.slice(0, endOfImportsIndex).trimEnd()}\n${newImports.join('\n')}\n\n${cleanedContent}`;
}

export function addRules(zodSchemasText: string, fileName: string): string {
	const rulesFilePath = path.resolve(process.cwd(), 'src/rules', `${fileName}.ts`);

	if (!existsSync(rulesFilePath)) {
		return zodSchemasText;
	}

	const ruleFunctionName = `${fileName.charAt(0).toLowerCase() + fileName.slice(1)}Rule`;
	const schemaRegex = /(}\))\s*;/g;
	const refineCall = `.superRefine(${ruleFunctionName}())`;

	const modifiedText = zodSchemasText.replace(schemaRegex, `$1${refineCall};`);
	const importLine = `import { ${ruleFunctionName} } from '../rules/${fileName}';\n`;

	return importLine + modifiedText;
}

function toPascalCase(name: string): string {
	return name
		.split(/[-_\s]/)
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join('');
}

async function fixCircularDependencies(schemasDir: string): Promise<void> {
	const schemaFiles = glob.sync('**/*.ts', { cwd: schemasDir });
	const dependencyGraph = new Map<string, Set<string>>();
	const schemaContents = new Map<string, string>();

	for (const schemaFile of schemaFiles) {
		const baseName = path.basename(schemaFile, '.ts');
		const schemaFilePath = path.join(schemasDir, schemaFile);
		const content = await promises.readFile(schemaFilePath, 'utf-8');
		schemaContents.set(baseName, content);

		const dependencies = new Set<string>();
		const importRegex = /import\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g;
		let match;
		// biome-ignore lint/suspicious/noAssignInExpressions: <any>
		while ((match = importRegex.exec(content)) !== null) {
			const importPath = match[1];
			if (importPath.startsWith('./') || importPath.startsWith('../')) {
				const importedFile = path.basename(importPath, '.ts');
				if (importedFile !== baseName) {
					dependencies.add(importedFile);
				}
			}
		}
		dependencyGraph.set(baseName, dependencies);
	}

	const visited = new Set<string>();
	const recursionStack = new Set<string>();
	const circularSchemas = new Set<string>();

	function detectCycles(node: string): void {
		if (recursionStack.has(node)) {
			circularSchemas.add(node);
			return;
		}
		if (visited.has(node)) return;

		visited.add(node);
		recursionStack.add(node);

		const dependencies = dependencyGraph.get(node) || new Set();
		for (const dep of dependencies) {
			detectCycles(dep);
		}

		recursionStack.delete(node);
	}

	for (const schema of dependencyGraph.keys()) {
		if (!visited.has(schema)) {
			detectCycles(schema);
		}
	}

	for (const schemaName of circularSchemas) {
		const content = schemaContents.get(schemaName);
		if (!content) continue;

		const exportConstRegex = /export\s+const\s+(\w+Schema)\s*=\s*z\.(object|union|array|record|tuple|map)\s*\(/;
		const match = content.match(exportConstRegex);
		if (!match) continue;

		const schemaVarName = match[1];
		const typeName = toPascalCase(schemaName);

		const importTypeLine = `import { type ${typeName} } from "../models/${typeName}";`;
		let updatedContent = content;

		if (!content.includes(importTypeLine)) {
			const lines = content.split('\n');
			const insertAt = Math.min(3, lines.length);
			lines.splice(insertAt, 0, importTypeLine);
			updatedContent = lines.join('\n');
		}

		const annotatedLazy = `export const ${schemaVarName}: z.ZodSchema<${typeName}> = z.lazy(() => z.$2(`;
		updatedContent = updatedContent.replace(exportConstRegex, annotatedLazy);

		const exportStart = updatedContent.indexOf(`export const ${schemaVarName}`);
		if (exportStart !== -1) {
			const afterStart = updatedContent.slice(exportStart);
			const closeIdx = afterStart.indexOf('});');
			if (closeIdx !== -1) {
				updatedContent =
					updatedContent.slice(0, exportStart) +
					afterStart.slice(0, closeIdx) +
					'}));' +
					afterStart.slice(closeIdx + 3);
			}
		}

		const schemaFilePath = path.join(schemasDir, `${schemaName}.ts`);
		await promises.writeFile(schemaFilePath, updatedContent);
	}
}

async function updateIndexFileWithSchemas(schemasDir: string): Promise<void> {
	try {
		const projectRoot = process.cwd();
		const indexPath = path.join(projectRoot, 'src', 'index.ts');

		if (!existsSync(indexPath)) return;

		let indexContent = await promises.readFile(indexPath, 'utf-8');
		const schemaFiles = glob.sync('**/*.ts', {
			cwd: schemasDir,
		});

		const schemaExports: string[] = [];
		const seenSchemaNames = new Set<string>();

		for (const schemaFile of schemaFiles) {
			const baseName = path.basename(schemaFile, '.ts');
			const schemaFilePath = path.join(schemasDir, schemaFile);
			const schemaContent = await promises.readFile(schemaFilePath, 'utf-8');

			const exportRegex = /export\s+const\s+(\w+Schema)\s*=/g;
			let match: RegExpExecArray | null;

			match = exportRegex.exec(schemaContent);
			while (match !== null) {
				const schemaName = match[1];
				if (!seenSchemaNames.has(schemaName)) {
					seenSchemaNames.add(schemaName);
					const exportStatement = `export { ${schemaName} } from './schemas/${baseName}';`;
					if (!indexContent.includes(exportStatement)) {
						schemaExports.push(exportStatement);
					}
				}
				match = exportRegex.exec(schemaContent);
			}
		}

		if (schemaExports.length > 0) {
			if (!indexContent.includes('// Zod Schemas')) {
				indexContent += '\n\n// Zod Schemas';
			}
			indexContent += `\n${schemaExports.join('\n')}`;

			await promises.writeFile(indexPath, indexContent);
			console.log(`Updated index file with ${schemaExports.length} schema exports`);
		} else {
			console.log('No new schema exports to add to index file');
		}
	} catch (err) {
		console.error('Error updating index file with schemas:', err);
	}
}

generateSchemas().catch((err) => console.log(err));
