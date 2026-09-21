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
	const schemaContents = new Map<
		string,
		{
			content: string;
			relativePath: string;
		}
	>();

	for (const schemaFile of schemaFiles) {
		const baseName = path.basename(schemaFile, '.ts');
		const schemaFilePath = path.join(schemasDir, schemaFile);
		const content = await promises.readFile(schemaFilePath, 'utf-8');
		schemaContents.set(baseName, {
			content,
			relativePath: schemaFile,
		});

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
	const recursionStack: string[] = [];
	const circularSchemas = new Set<string>();

	function detectCycles(node: string): void {
		const existingIndex = recursionStack.indexOf(node);
		if (existingIndex !== -1) {
			for (const schema of recursionStack.slice(existingIndex)) {
				circularSchemas.add(schema);
			}
			return;
		}
		if (visited.has(node)) return;

		visited.add(node);
		recursionStack.push(node);

		const dependencies = dependencyGraph.get(node) || new Set();
		for (const dep of dependencies) {
			detectCycles(dep);
		}

		recursionStack.pop();
	}

	for (const schema of dependencyGraph.keys()) {
		if (!visited.has(schema)) {
			detectCycles(schema);
		}
	}

	for (const schemaName of circularSchemas) {
		const metadata = schemaContents.get(schemaName);
		if (!metadata) continue;
		const { content, relativePath } = metadata;

		const exportMatches = Array.from(content.matchAll(/export\s+const\s+(\w+Schema)\s*=/g));
		if (exportMatches.length === 0) continue;

		let updatedContent = content;
		const seenImports = new Set<string>();

		for (const match of exportMatches) {
			const schemaVarName = match[1];
			const baseTypeName = schemaVarName.replace(/Schema$/, '');
			const typeName = toPascalCase(baseTypeName);
			const importTypeLine = getTypeImportLine(relativePath, typeName, schemasDir);

			if (!seenImports.has(importTypeLine)) {
				updatedContent = ensureTypeImport(updatedContent, importTypeLine);
				seenImports.add(importTypeLine);
			}

			updatedContent = ensureSchemaIsLazy(updatedContent, schemaVarName, typeName);
		}

		const schemaFilePath = path.join(schemasDir, relativePath);
		await promises.writeFile(schemaFilePath, updatedContent);
	}
}

function ensureTypeImport(content: string, importLine: string): string {
	if (content.includes(importLine)) {
		return content;
	}

	const lines = content.split('\n');
	const trimmedImport = importLine.trimEnd();
	const firstImportIndex = lines.findIndex((line) => line.startsWith('import '));

	if (firstImportIndex !== -1) {
		lines.splice(firstImportIndex, 0, trimmedImport);
	} else {
		let insertAt = 0;
		while (insertAt < lines.length && lines[insertAt].startsWith('//')) {
			insertAt += 1;
		}
		lines.splice(insertAt, 0, trimmedImport);
	}

	return lines.join('\n');
}

function ensureSchemaIsLazy(content: string, schemaVarName: string, typeName: string): string {
	const exportRegex = new RegExp(`export\\s+const\\s+${schemaVarName}\\s*[:=]`);
	if (!exportRegex.test(content)) {
		return content;
	}

	let updatedContent = content;
	const annotationRegex = new RegExp(`export\\s+const\\s+${schemaVarName}\\s*:\\s*z\\.ZodSchema<${typeName}>\\s*=`);
	if (!annotationRegex.test(updatedContent)) {
		const assignmentRegex = new RegExp(`export\\s+const\\s+${schemaVarName}\\s*=\\s*`);
		updatedContent = updatedContent.replace(
			assignmentRegex,
			`export const ${schemaVarName}: z.ZodSchema<${typeName}> = `,
		);
	}

	const exportIndex = updatedContent.indexOf(`export const ${schemaVarName}`);
	if (exportIndex === -1) return updatedContent;

	const equalsIndex = updatedContent.indexOf('=', exportIndex);
	if (equalsIndex === -1) return updatedContent;

	const semicolonIndex = findExpressionEnd(updatedContent, equalsIndex + 1);
	if (semicolonIndex === -1) return updatedContent;

	const expression = updatedContent.slice(equalsIndex + 1, semicolonIndex);
	const trimmedExpression = expression.trimStart();

	if (trimmedExpression.startsWith('z.lazy')) {
		return updatedContent;
	}

	const leadingWhitespace = expression.slice(0, expression.length - trimmedExpression.length);
	const wrappedExpression = `${leadingWhitespace}z.lazy(() => ${trimmedExpression})`;

	return updatedContent.slice(0, equalsIndex + 1) + wrappedExpression + updatedContent.slice(semicolonIndex);
}

function getTypeImportLine(relativeSchemaPath: string, typeName: string, schemasDir: string): string {
	const schemaFileDir = path.dirname(path.join(schemasDir, relativeSchemaPath));
	const modelsDir = path.join(process.cwd(), CONFIG.relativePaths.models);
	const targetTypePath = path.join(modelsDir, typeName);
	let importPath = path.relative(schemaFileDir, targetTypePath);

	if (!importPath.startsWith('.')) {
		importPath = `./${importPath}`;
	}

	importPath = importPath.split(path.sep).join('/');

	return `import { type ${typeName} } from '${importPath}';`;
}

function findExpressionEnd(content: string, startIndex: number): number {
	let depth = 0;
	for (let idx = startIndex; idx < content.length; idx++) {
		const char = content[idx];
		if (char === '(' || char === '{' || char === '[') {
			depth += 1;
		} else if (char === ')' || char === '}' || char === ']') {
			depth = Math.max(depth - 1, 0);
		} else if (char === ';' && depth === 0) {
			return idx;
		}
	}
	return -1;
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
