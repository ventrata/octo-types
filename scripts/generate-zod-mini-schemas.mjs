import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SCHEMAS_DIR = path.resolve('src/schemas');
const MINI_SCHEMAS_DIR = path.resolve('src/schemas-mini');

function rewriteSourceFile(sourceFile) {
	const rewriteTransformer = (context) => {
		const { factory } = context;

		const visitTypeNode = (node) => {
			if (
				ts.isTypeReferenceNode(node) &&
				ts.isQualifiedName(node.typeName) &&
				ts.isIdentifier(node.typeName.left) &&
				node.typeName.left.text === 'z' &&
				node.typeName.right.text === 'ZodType'
			) {
				return factory.updateTypeReferenceNode(
					node,
					factory.createQualifiedName(factory.createIdentifier('z'), factory.createIdentifier('ZodMiniType')),
					node.typeArguments?.map((typeArg) => ts.visitNode(typeArg, visitTypeNode)),
				);
			}

			return ts.visitEachChild(node, visitNode, context);
		};

		const visitNode = (node) => {
			if (
				ts.isImportDeclaration(node) &&
				ts.isStringLiteral(node.moduleSpecifier) &&
				node.moduleSpecifier.text === 'zod'
			) {
				return factory.updateImportDeclaration(
					node,
					node.modifiers,
					node.importClause,
					factory.createStringLiteral('zod/mini'),
					node.attributes,
				);
			}

			if (ts.isTypeNode(node)) {
				return visitTypeNode(node);
			}

			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression) &&
				ts.isIdentifier(node.expression.name)
			) {
				const methodName = node.expression.name.text;
				const target = ts.visitNode(node.expression.expression, visitNode);
				const args = node.arguments.map((arg) => ts.visitNode(arg, visitNode));

				if (methodName === 'optional' && node.arguments.length === 0) {
					return factory.createCallExpression(
						factory.createPropertyAccessExpression(factory.createIdentifier('z'), factory.createIdentifier('optional')),
						undefined,
						[target],
					);
				}

				if (methodName === 'nullable' && node.arguments.length === 0) {
					return factory.createCallExpression(
						factory.createPropertyAccessExpression(factory.createIdentifier('z'), factory.createIdentifier('nullable')),
						undefined,
						[target],
					);
				}

				if (methodName === 'and' && node.arguments.length === 1) {
					return factory.createCallExpression(
						factory.createPropertyAccessExpression(
							factory.createIdentifier('z'),
							factory.createIdentifier('intersection'),
						),
						undefined,
						[target, args[0]],
					);
				}
			}

			return ts.visitEachChild(node, visitNode, context);
		};

		return (rootNode) => ts.visitNode(rootNode, visitNode);
	};

	const transformed = ts.transform(sourceFile, [rewriteTransformer]).transformed[0];
	return transformed;
}

function transformSchemaFile(filePath) {
	const sourceText = readFileSync(filePath, 'utf8');
	const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const transformedFile = rewriteSourceFile(sourceFile);

	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	return printer.printFile(transformedFile);
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
		const matches = content.matchAll(/export\s+const\s+(\w+Schema)\b/g);
		const moduleName = schemaFile.replace(/\.ts$/, '').split(path.sep).join('/');

		for (const match of matches) {
			exportLines.push(`export { ${match[1]} } from './${moduleName}';`);
		}
	}

	writeFileSync(path.join(MINI_SCHEMAS_DIR, 'index.ts'), `${exportLines.join('\n')}\n`);
}

function generateMiniSchemas() {
	const schemaFiles = globSync('**/*.ts', { cwd: SCHEMAS_DIR }).sort();
	if (schemaFiles.length === 0) {
		throw new Error(`No schema files found in ${SCHEMAS_DIR}`);
	}

	for (const schemaFile of schemaFiles) {
		const schemaPath = path.join(SCHEMAS_DIR, schemaFile);
		const transformed = transformSchemaFile(schemaPath);
		writeMiniSchema(schemaFile, transformed);
	}

	writeMiniIndex(schemaFiles);
	console.log(`Generated ${schemaFiles.length} zod/mini schema files in src/schemas-mini`);
}

generateMiniSchemas();
