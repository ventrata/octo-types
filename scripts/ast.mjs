import ts from 'typescript';

export function parseSource(source, fileName = 'source.ts') {
	return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

export function transformSource(source, transformer, fileName = 'source.ts') {
	const result = ts.transform(parseSource(source, fileName), [transformer]);
	try {
		return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0]);
	} finally {
		result.dispose();
	}
}

export function exportedSchemaNames(source) {
	return parseSource(source).statements.flatMap((statement) => {
		if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
			return [];
		return statement.declarationList.declarations.flatMap((declaration) =>
			ts.isIdentifier(declaration.name) && declaration.name.text.endsWith('Schema') ? [declaration.name.text] : [],
		);
	});
}
