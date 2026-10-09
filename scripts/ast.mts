import ts from 'typescript';

export type Rewrite = (node: ts.Node, factory: ts.NodeFactory) => ts.Node;

export function parse(text: string): ts.SourceFile {
	return ts.createSourceFile('source.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/** Rewrite every node bottom-up and print the result. */
export function transform(text: string, rewrite: Rewrite): string {
	const result = ts.transform(parse(text), [
		(context) => {
			const visit: ts.Visitor = (node) => rewrite(ts.visitEachChild(node, visit, context), context.factory);
			return (source) => ts.visitNode(source, visit) as ts.SourceFile;
		},
	]);
	try {
		return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0]);
	} finally {
		result.dispose();
	}
}

export function isExported(node: ts.Statement): boolean {
	return ts.canHaveModifiers(node) && !!ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

export function isZodCall(node: ts.Node | undefined, name: string): node is ts.CallExpression {
	return (
		!!node &&
		ts.isCallExpression(node) &&
		ts.isPropertyAccessExpression(node.expression) &&
		ts.isIdentifier(node.expression.expression) &&
		node.expression.expression.text === 'z' &&
		node.expression.name.text === name
	);
}

export function isZodImport(node: ts.Node): node is ts.ImportDeclaration {
	return (
		ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === 'zod'
	);
}

/** Rewrite a `zod` import to `import * as z from '<moduleName>'`. */
export function zodNamespaceImport(
	node: ts.ImportDeclaration,
	factory: ts.NodeFactory,
	moduleName = 'zod',
): ts.ImportDeclaration {
	return factory.updateImportDeclaration(
		node,
		node.modifiers,
		factory.createImportClause(false, undefined, factory.createNamespaceImport(factory.createIdentifier('z'))),
		factory.createStringLiteral(moduleName),
		node.attributes,
	);
}

export function findExportedSchemaNames(text: string): string[] {
	return parse(text).statements.flatMap((statement) => {
		if (!ts.isVariableStatement(statement) || !isExported(statement)) return [];
		return statement.declarationList.declarations.flatMap((declaration) =>
			ts.isIdentifier(declaration.name) && declaration.name.text.endsWith('Schema') ? [declaration.name.text] : [],
		);
	});
}
