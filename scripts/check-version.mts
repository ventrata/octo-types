// A merge to main publishes the package only when its version is new (.github/workflows/npm-publish.yml), so a pull
// request must bump the version exactly when the published package changes: when a file dist is built from changes,
// or a package.json field consumers see. CI, docs, tests, the generator scripts and dev dependencies don't need one.
//
// Usage: node --experimental-strip-types scripts/check-version.mts [base ref, default origin/main]
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

/** The files dist is built from (the `build` script). */
export const PACKAGE_SOURCES = ['src', 'tsconfig.json', 'tsconfig.esm.json', 'scripts/prepare-esm.mts'];

/** package.json fields that don't change the package for its consumers. */
const UNPUBLISHED_FIELDS = new Set(['version', 'devDependencies', 'overrides']);

/** The only scripts npm runs when a consumer installs the package from the registry. */
const INSTALL_SCRIPTS = new Set(['preinstall', 'install', 'postinstall']);

type Manifest = Record<string, unknown>;

function published(manifest: Manifest): Manifest {
	const fields = Object.entries(manifest).filter(([key]) => !UNPUBLISHED_FIELDS.has(key));
	const scripts = Object.entries((manifest.scripts ?? {}) as Record<string, string>);
	return {
		...Object.fromEntries(fields),
		scripts: Object.fromEntries(scripts.filter(([name]) => INSTALL_SCRIPTS.has(name))),
	};
}

export function manifestChanged(before: Manifest, after: Manifest): boolean {
	return !isDeepStrictEqual(published(before), published(after));
}

export interface Verdict {
	ok: boolean;
	message: string;
}

/** `changes` are the files that change the published package; `baseVersion` is the version on the base branch. */
export function verdict(baseVersion: string, version: string, changes: string[]): Verdict {
	if (version !== baseVersion) return { ok: true, message: `Version changed: ${baseVersion} -> ${version}` };
	if (changes.length === 0)
		return { ok: true, message: 'The published package does not change; no version bump needed.' };
	return {
		ok: false,
		message: [
			`The published package changes, but the version is still ${version}. Bump it in package.json.`,
			'Changed:',
			...changes.map((file) => `  ${file}`),
		].join('\n'),
	};
}

const git = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8' }).trim();
const manifestAt = (rev: string): Manifest => JSON.parse(git('show', `${rev}:package.json`));

export function checkVersion(baseRef = 'origin/main'): Verdict {
	const mergeBase = git('merge-base', baseRef, 'HEAD');
	const sources = git('diff', '--name-only', mergeBase, 'HEAD', '--', ...PACKAGE_SOURCES)
		.split('\n')
		.filter(Boolean);
	const head = manifestAt('HEAD');
	const changes = manifestChanged(manifestAt(mergeBase), head) ? [...sources, 'package.json'] : sources;
	return verdict(String(manifestAt(baseRef).version), String(head.version), changes);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const { ok, message } = checkVersion(process.argv[2]);
	if (ok) {
		console.log(message);
	} else {
		// GitHub Actions shows an `::error::` line as an annotation; `%0A` keeps the rest of the message in it.
		console.log(`::error::${message.replaceAll('\n', '%0A')}`);
		process.exitCode = 1;
	}
}
