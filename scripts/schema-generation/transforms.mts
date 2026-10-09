import * as path from 'node:path';
import ts from 'typescript';
import {
	findExportedSchemaNames,
	isExported,
	isZodCall,
	isZodImport,
	parse,
	transform,
	zodNamespaceImport,
} from '../ast.mts';
import { findCyclicNodes } from './dependencies.mts';

export type SchemaExport = {
	schemaName: string;
	typeName?: string;
};

export type GeneratedSchema = {
	relativePath: string;
	modelImportPath: string;
	exports: SchemaExport[];
	text: string;
};

export function importPlaceholderSchemas(schemaText: string, modelText: string): string {
	const modelFileNames = importedModelFileNames(modelText);
	const imports: string[] = [];
	const source = parse(schemaText);
	const statements = source.statements.filter((statement) => {
		if (!ts.isVariableStatement(statement) || isExported(statement)) return true;
		if (statement.declarationList.declarations.length !== 1) return true;
		const declaration = statement.declarationList.declarations[0];
		if (
			!ts.isIdentifier(declaration.name) ||
			!declaration.name.text.endsWith('Schema') ||
			!isZodCall(declaration.initializer, 'any')
		)
			return true;
		const schemaName = declaration.name.text;
		const fileName = modelFileNames.get(schemaName) ?? toPascalCase(schemaName.replace(/Schema$/, ''));
		imports.push(`import { ${schemaName} } from './${fileName}';`);
		return false;
	});
	return appendImports(ts.createPrinter().printFile(ts.factory.updateSourceFile(source, statements)), imports);
}

export function importedModelFileNames(modelText: string): Map<string, string> {
	const fileNames = new Map<string, string>();

	for (const statement of parse(modelText).statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
		const bindings = statement.importClause?.namedBindings;
		if (!bindings || !ts.isNamedImports(bindings)) continue;
		const fileName = path.basename(statement.moduleSpecifier.text.replace(/\.ts$/, ''));
		for (const element of bindings.elements) fileNames.set(toSchemaName(element.name.text), fileName);
	}

	return fileNames;
}

export function dropUnusedZodImport(schemaText: string): string {
	const source = parse(schemaText);
	let used = false;
	const visit = (node: ts.Node): void => {
		if (ts.isImportDeclaration(node)) return;
		if (ts.isIdentifier(node) && node.text === 'z') used = true;
		ts.forEachChild(node, visit);
	};
	visit(source);
	if (used) return schemaText;
	let text = schemaText;
	const imports = source.statements.filter(isZodImport);
	for (const statement of imports.reverse())
		text = text.slice(0, statement.getStart(source)) + text.slice(statement.end);
	return text;
}

export function useZodNamespaceImport(schemaText: string): string {
	return transform(schemaText, (node, factory) => (isZodImport(node) ? zodNamespaceImport(node, factory) : node));
}

export function findSchemaExports(schemaText: string, modelText: string): SchemaExport[] {
	const typeNames = new Map<string, string>();
	for (const statement of parse(modelText).statements) {
		if (
			(ts.isTypeAliasDeclaration(statement) ||
				ts.isInterfaceDeclaration(statement) ||
				ts.isEnumDeclaration(statement)) &&
			isExported(statement)
		) {
			typeNames.set(toSchemaName(statement.name.text), statement.name.text);
		}
	}

	return findExportedSchemaNames(schemaText).map((schemaName) => ({
		schemaName,
		typeName: typeNames.get(schemaName),
	}));
}

export function typeRequiredAnySchemas(schemas: GeneratedSchema[]): number {
	let typed = 0;

	for (const schema of schemas) {
		if (!hasRequiredAny(schema.text)) continue;

		for (const { schemaName, typeName } of schema.exports) {
			if (!typeName) continue;

			schema.text = annotateSchema(schema.text, schemaName, typeName, schema.modelImportPath, { assert: true });
			typed += 1;
		}
	}

	return typed;
}

export function typeRecursiveSchemas(schemas: GeneratedSchema[]): number {
	const cyclicModules = findCyclicModules(schemas);
	let typed = 0;

	for (const schema of schemas) {
		const inCycle = cyclicModules.has(toModuleName(schema.relativePath));

		for (const { schemaName, typeName } of schema.exports) {
			if (!typeName) continue;
			if (!inCycle && !isLazySchema(schema.text, schemaName)) continue;

			schema.text = annotateSchema(schema.text, schemaName, typeName, schema.modelImportPath, { wrapLazy: true });
			typed += 1;
		}
	}

	return typed;
}

export function findCyclicModules(schemas: GeneratedSchema[]): Set<string> {
	const dependencies = new Map(
		schemas.map((schema) => [
			toModuleName(schema.relativePath),
			new Set(schemaImports(schema.text).map(({ moduleName }) => moduleName)),
		]),
	);

	return findCyclicNodes(dependencies);
}

export function annotateSchema(
	schemaText: string,
	schemaName: string,
	typeName: string,
	modelImportPath: string,
	options: { wrapLazy?: boolean; assert?: boolean } = {},
): string {
	const text = transform(schemaText, (node, factory) => {
		if (
			!ts.isVariableDeclaration(node) ||
			!ts.isIdentifier(node.name) ||
			node.name.text !== schemaName ||
			!node.initializer
		)
			return node;
		const annotation = factory.createTypeReferenceNode(
			factory.createQualifiedName(factory.createIdentifier('z'), 'ZodType'),
			[factory.createTypeReferenceNode(typeName)],
		);
		let value = node.initializer;
		if (options.wrapLazy && !isZodCall(value, 'lazy')) {
			value = factory.createCallExpression(
				factory.createPropertyAccessExpression(factory.createIdentifier('z'), 'lazy'),
				undefined,
				[
					factory.createArrowFunction(
						undefined,
						undefined,
						[],
						undefined,
						factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
						value,
					),
				],
			);
		}
		if (options.assert && !ts.isAsExpression(value)) value = factory.createAsExpression(value, annotation);
		return factory.updateVariableDeclaration(node, node.name, node.exclamationToken, annotation, value);
	});
	return ensureModelTypeImport(text, typeName, modelImportPath);
}

export function isLazySchema(schemaText: string, schemaName: string): boolean {
	return parse(schemaText).statements.some(
		(statement) =>
			ts.isVariableStatement(statement) &&
			statement.declarationList.declarations.some(
				(declaration) =>
					ts.isIdentifier(declaration.name) &&
					declaration.name.text === schemaName &&
					isZodCall(declaration.initializer, 'lazy'),
			),
	);
}

export function ensureModelTypeImport(schemaText: string, typeName: string, modelImportPath: string): string {
	const found = parse(schemaText).statements.some((statement) => {
		if (
			!ts.isImportDeclaration(statement) ||
			!ts.isStringLiteral(statement.moduleSpecifier) ||
			statement.moduleSpecifier.text !== modelImportPath
		)
			return false;
		const bindings = statement.importClause?.namedBindings;
		return (
			bindings && ts.isNamedImports(bindings) && bindings.elements.some((element) => element.name.text === typeName)
		);
	});
	if (found) return schemaText;

	return appendImports(schemaText, [`import { type ${typeName} } from '${modelImportPath}';`]);
}

export function assertSchemasAreComplete(schemas: GeneratedSchema[]): void {
	const exportsByModule = new Map(
		schemas.map((schema) => [
			toModuleName(schema.relativePath),
			new Set(schema.exports.map(({ schemaName }) => schemaName)),
		]),
	);

	const problems = schemas.flatMap((schema) => {
		if (schema.exports.length === 0) return `${schema.relativePath}: no exported schema`;

		const missing = schemaImports(schema.text)
			.filter(({ schemaName, moduleName }) => !exportsByModule.get(moduleName)?.has(schemaName))
			.map(({ schemaName, moduleName }) => `${schemaName} from ./${moduleName}`);

		return missing.length === 0 ? [] : `${schema.relativePath}: missing ${missing.join(', ')}`;
	});

	if (problems.length > 0) {
		throw new Error(`Generated schemas are incomplete:\n${problems.join('\n')}`);
	}
}

export function appendImports(text: string, imports: string[]): string {
	if (!imports.length) return text;
	const source = parse(text);
	const position = source.statements.filter(ts.isImportDeclaration).at(-1)?.end ?? 0;
	return `${text.slice(0, position)}\n${imports.join('\n')}\n${text.slice(position)}`;
}

export function tidyBlankLines(text: string): string {
	const lines = text
		.split('\n')
		.map((line) => line.trimEnd())
		.filter((line, index, all) => line !== '' || (index > 0 && all[index - 1] !== ''));

	const normalized = lines.join('\n').trimEnd();
	// Keep generated declarations separated after the AST printer normalizes whitespace.
	return `${normalized.replace(/\n(?=export const )/g, '\n\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

export function toSchemaName(typeName: string): string {
	return `${typeName.charAt(0).toLowerCase()}${typeName.slice(1)}Schema`;
}

export function toPascalCase(name: string): string {
	return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

export function toModuleName(relativePath: string): string {
	return path.basename(relativePath, '.ts');
}

export function toModuleSpecifier(relativePath: string): string {
	const modulePath = relativePath.replace(/\.ts$/, '').split(path.sep).join('/');

	return modulePath.startsWith('.') ? modulePath : `./${modulePath}`;
}

function hasRequiredAny(text: string): boolean {
	let found = false;
	const visit = (node: ts.Node): void => {
		if (ts.isPropertyAssignment(node) && isZodCall(node.initializer, 'any')) found = true;
		ts.forEachChild(node, visit);
	};
	visit(parse(text));
	return found;
}

function schemaImports(text: string): { schemaName: string; moduleName: string }[] {
	return parse(text).statements.flatMap((statement) => {
		if (
			!ts.isImportDeclaration(statement) ||
			!ts.isStringLiteral(statement.moduleSpecifier) ||
			!statement.moduleSpecifier.text.startsWith('./')
		)
			return [];
		const bindings = statement.importClause?.namedBindings;
		if (!bindings || !ts.isNamedImports(bindings)) return [];
		const moduleName = statement.moduleSpecifier.text.slice(2);
		return bindings.elements
			.filter((element) => element.name.text.endsWith('Schema'))
			.map((element) => ({ schemaName: element.name.text, moduleName }));
	});
}
