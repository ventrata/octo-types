import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST_ESM_DIR = 'dist/esm';
const ESM_GLOB = `${DIST_ESM_DIR}/**/*.js`;
const ESM_PACKAGE_JSON_PATH = path.join(DIST_ESM_DIR, 'package.json');
const SPECIFIER_WITH_EXT = /\.(?:js|json|mjs|cjs)$/;
const RELATIVE_SPECIFIER = /((?:from|import)\s*)(['"])(\.\.?\/[^'"]+?)\2/g;

export function rewriteRelativeImportSpecifiers(source) {
	return source.replace(RELATIVE_SPECIFIER, (match, lead, quote, specifier) => {
		if (SPECIFIER_WITH_EXT.test(specifier)) return match;
		return `${lead}${quote}${specifier}.js${quote}`;
	});
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
