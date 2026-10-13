import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { findExportedSchemaNames } from '../ast.mts';
import { toModuleSpecifier } from './transforms.mts';

export function findSchemaFiles(schemasDir: string): string[] {
	return globSync('**/*.ts', { cwd: schemasDir }).sort();
}

export function schemaExportLines(schemasDir: string, importDir: string): string[] {
	return findSchemaFiles(schemasDir).flatMap((schemaFile) => {
		const modulePath = path.posix.join(importDir, toModuleSpecifier(schemaFile));
		const schemaText = readFileSync(path.join(schemasDir, schemaFile), 'utf8');
		return findExportedSchemaNames(schemaText).map((name) => `export { ${name} } from './${modulePath}';`);
	});
}
