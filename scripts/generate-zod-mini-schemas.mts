import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { isZodImport, transform, zodNamespaceImport } from './ast.mts';
import { findSchemaFiles, schemaExportLines } from './schema-generation/schema-index.mts';

const SCHEMAS_DIR = path.resolve('src/schemas');
const MINI_SCHEMAS_DIR = path.resolve('src/schemas-mini');

const METHOD_WRAPPERS: Record<string, { name: string; arity: number }> = {
	optional: { name: 'optional', arity: 0 },
	nullable: { name: 'nullable', arity: 0 },
	and: { name: 'intersection', arity: 1 },
};

function toMini(node: ts.Node, factory: ts.NodeFactory): ts.Node {
	if (isZodImport(node)) return zodNamespaceImport(node, factory, 'zod/mini');
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
}

export function transformSchemaSource(sourceText: string): string {
	return transform(sourceText, toMini);
}

export function generateMiniSchemas(): void {
	const schemaFiles = findSchemaFiles(SCHEMAS_DIR);
	if (schemaFiles.length === 0) {
		throw new Error(`No schema files found in ${SCHEMAS_DIR}`);
	}

	// Avoid publishing schemas that were removed or renamed in the classic output.
	rmSync(MINI_SCHEMAS_DIR, { recursive: true, force: true });

	for (const schemaFile of schemaFiles) {
		const outputPath = path.join(MINI_SCHEMAS_DIR, schemaFile);
		const transformed = transformSchemaSource(readFileSync(path.join(SCHEMAS_DIR, schemaFile), 'utf8'));
		mkdirSync(path.dirname(outputPath), { recursive: true });
		writeFileSync(outputPath, `${transformed.trimEnd()}\n`);
	}

	writeFileSync(path.join(MINI_SCHEMAS_DIR, 'index.ts'), `${schemaExportLines(SCHEMAS_DIR, '.').join('\n')}\n`);
	console.log(`Generated ${schemaFiles.length} zod/mini schema files in src/schemas-mini`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	generateMiniSchemas();
}
