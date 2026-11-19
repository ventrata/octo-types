// Whether package.json's version is already on npm. A merge to main that doesn't change the published package keeps
// its version (scripts/check-version.mts), and npm refuses to publish a version twice, so the publish workflow skips
// such merges instead of failing.
//
// Prints the answer, and in GitHub Actions also writes `published=true|false` to the step's outputs.
//
// Usage: node --experimental-strip-types scripts/check-published.mts
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Runs `npm view <spec> version`; throws, with npm's stderr, when it fails. */
type NpmView = (spec: string) => void;

const npmView: NpmView = (spec) => {
	execFileSync('npm', ['view', spec, 'version'], { stdio: ['ignore', 'ignore', 'pipe'] });
};

/** npm answers E404 both for a version that doesn't exist and for a package that was never published. Any other
 *  failure (the network, auth) is rethrown, so the workflow fails instead of publishing blindly. */
export function isPublished(name: string, version: string, view: NpmView = npmView): boolean {
	try {
		view(`${name}@${version}`);
		return true;
	} catch (error) {
		if (String((error as { stderr?: unknown }).stderr).includes('E404')) return false;
		throw error;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'));
	const published = isPublished(name, version);
	console.log(published ? `${name}@${version} is already published.` : `${name}@${version} is not published yet.`);
	if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `published=${published}\n`);
}
