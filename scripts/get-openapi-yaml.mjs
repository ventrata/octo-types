import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const SPEC_URL =
	'https://raw.githubusercontent.com/ventrata/octo-typespec/main/tsp-output/%40typespec/openapi3/openapi.Ventrata.yaml';

export async function fetchAndSaveYaml({ fetchImpl = fetch, outputPath = 'src/openapi.yaml', url = SPEC_URL } = {}) {
	const response = await fetchImpl(url);
	if (!response.ok) throw new Error(`Failed to fetch OpenAPI: ${response.status} ${response.statusText}`);
	const yamlText = await response.text();
	if (!yamlText.trim()) throw new Error('Downloaded OpenAPI specification is empty');
	await writeFile(outputPath, yamlText, 'utf-8');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	fetchAndSaveYaml().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
