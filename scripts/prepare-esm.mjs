import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const relativeSpecifier = /((?:from|import)\s*)(['"])(\.\.?\/[^'"]+?)\2/g;

for (const file of globSync('dist/esm/**/*.js')) {
	const source = readFileSync(file, 'utf8');
	const rewritten = source.replace(relativeSpecifier, (match, lead, quote, specifier) => {
		if (/\.(?:js|json|mjs|cjs)$/.test(specifier)) return match;
		return `${lead}${quote}${specifier}.js${quote}`;
	});

	if (rewritten !== source) writeFileSync(file, rewritten);
}

mkdirSync('dist/esm', { recursive: true });
writeFileSync('dist/esm/package.json', `${JSON.stringify({ type: 'module', sideEffects: false }, null, '\t')}\n`);
