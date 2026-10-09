import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { parseSource } from './ast.mjs';

const DIST_ESM_DIR = 'dist/esm';
const ESM_GLOB = `${DIST_ESM_DIR}/**/*.js`;
const ESM_PACKAGE_JSON_PATH = path.join(DIST_ESM_DIR, 'package.json');
const SPECIFIER_WITH_EXT = /\.(?:js|json|mjs|cjs)$/;

export function rewriteRelativeImportSpecifiers(source) {
	const edits = [];
	const file = parseSource(source);
	const visit = (node) => {
		let specifier;
		if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier;
		if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
			specifier = node.arguments[0];
		if (
			specifier &&
			ts.isStringLiteral(specifier) &&
			/^\.\.?\//.test(specifier.text) &&
			!SPECIFIER_WITH_EXT.test(specifier.text)
		) {
			edits.push(specifier.end - 1);
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
	for (const position of edits.sort((a, b) => b - a))
		source = `${source.slice(0, position)}.js${source.slice(position)}`;
	return source;
}

function rewriteEsmOutputFiles() {
	const files = globSync(ESM_GLOB);
	if (files.length === 0) {
		throw new Error(`Expected ESM output files matching "${ESM_GLOB}", but none were found.`);
	}

	for (const file of files) {
		const source = readFileSync(file, 'utf8');
		const rewritten = rewriteRelativeImportSpecifiers(source);
		if (rewritten !== source) writeFileSync(file, rewritten);
	}
}

function writeEsmPackageJson() {
	mkdirSync(DIST_ESM_DIR, { recursive: true });
	// Keep sideEffects false in the ESM folder so bundlers can tree-shake unused exports.
	writeFileSync(ESM_PACKAGE_JSON_PATH, `${JSON.stringify({ type: 'module', sideEffects: false }, null, '\t')}\n`);
}

export function prepareEsm() {
	rewriteEsmOutputFiles();
	writeEsmPackageJson();
}

const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntrypoint) {
	prepareEsm();
}
