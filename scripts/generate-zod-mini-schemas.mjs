import { globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { exportedSchemaNames, transformSource } from './ast.mjs';

const SCHEMAS_DIR = path.resolve('src/schemas');
const MINI_SCHEMAS_DIR = path.resolve('src/schemas-mini');

const METHOD_WRAPPERS = {
	optional: { name: 'optional', arity: 0 },
	nullable: { name: 'nullable', arity: 0 },
	and: { name: 'intersection', arity: 1 },
};

export function miniTransformer(context) {
	const { factory } = context;
	const visit = (node) => {
		node = ts.visitEachChild(node, visit, context);
		if (
			ts.isImportDeclaration(node) &&
			ts.isStringLiteral(node.moduleSpecifier) &&
			node.moduleSpecifier.text === 'zod'
		) {
			return factory.updateImportDeclaration(
				node,
				node.modifiers,
				factory.createImportClause(false, undefined, factory.createNamespaceImport(factory.createIdentifier('z'))),
				factory.createStringLiteral('zod/mini'),
				node.attributes,
			);
		}
		if (
			ts.isTypeReferenceNode(node) &&
			ts.isQualifiedName(node.typeName) &&
			ts.isIdentifier(node.typeName.left) &&
			node.typeName.left.text === 'z' &&
			node.typeName.right.text === 'ZodType'
		) {
			return factory.updateTypeReferenceNode(
				node,
				factory.createQualifiedName(factory.createIdentifier('z'), 'ZodMiniType'),
				node.typeArguments,
			);
		}
		if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
			const wrapper = METHOD_WRAPPERS[node.expression.name.text];
			if (wrapper && node.arguments.length === wrapper.arity) {
				return factory.createCallExpression(
					factory.createPropertyAccessExpression(factory.createIdentifier('z'), wrapper.name),
					undefined,
					[node.expression.expression, ...node.arguments],
				);
			}
		}
		return node;
	};
	return (source) => ts.visitNode(source, visit);
}

export function transformSchemaSource(sourceText, fileName = 'schema.ts') {
	return transformSource(sourceText, miniTransformer, fileName);
}

function transformSchemaFile(filePath) {
	const sourceText = readFileSync(filePath, 'utf8');
	return transformSchemaSource(sourceText, filePath);
}

function writeMiniSchema(relativePath, content) {
	const outputPath = path.join(MINI_SCHEMAS_DIR, relativePath);
	mkdirSync(path.dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, `${content.trimEnd()}\n`);
}

function writeMiniIndex(schemaFiles) {
	const exportLines = [];

	for (const schemaFile of schemaFiles) {
		const schemaPath = path.join(SCHEMAS_DIR, schemaFile);
		const content = readFileSync(schemaPath, 'utf8');
		const names = exportedSchemaNames(content);
		const moduleName = schemaFile.replace(/\.ts$/, '').split(path.sep).join('/');

		for (const name of names) {
			exportLines.push(`export { ${name} } from './${moduleName}';`);
		}
	}

	writeFileSync(path.join(MINI_SCHEMAS_DIR, 'index.ts'), `${exportLines.join('\n')}\n`);
}

export function generateMiniSchemas() {
	const schemaFiles = globSync('**/*.ts', { cwd: SCHEMAS_DIR }).sort();
	if (schemaFiles.length === 0) {
		throw new Error(`No schema files found in ${SCHEMAS_DIR}`);
	}

	// Avoid publishing schemas that were removed or renamed in the classic output.
	rmSync(MINI_SCHEMAS_DIR, { recursive: true, force: true });
	mkdirSync(MINI_SCHEMAS_DIR, { recursive: true });

	for (const schemaFile of schemaFiles) {
		const schemaPath = path.join(SCHEMAS_DIR, schemaFile);
		const transformed = transformSchemaFile(schemaPath);
		writeMiniSchema(schemaFile, transformed);
	}

	writeMiniIndex(schemaFiles);
	console.log(`Generated ${schemaFiles.length} zod/mini schema files in src/schemas-mini`);
}

const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntrypoint) {
	generateMiniSchemas();
}
