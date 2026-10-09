import { writeFile } from 'node:fs/promises';

const SPEC_URL =
	'https://raw.githubusercontent.com/ventrata/octo-typespec/main/tsp-output/%40typespec/openapi3/openapi.Ventrata.yaml';

type FetchAndSaveOptions = { fetchImpl?: typeof fetch; outputPath?: string; url?: string };

export async function fetchAndSaveYaml({
	fetchImpl = fetch,
	outputPath = 'src/openapi.yaml',
	url = SPEC_URL,
}: FetchAndSaveOptions = {}): Promise<void> {
	const response = await fetchImpl(url);
	if (!response.ok) throw new Error(`Failed to fetch OpenAPI: ${response.status} ${response.statusText}`);
	const yamlText = await response.text();
	if (!yamlText.trim()) throw new Error('Downloaded OpenAPI specification is empty');
	await writeFile(outputPath, yamlText, 'utf-8');
}

if (import.meta.main) {
	fetchAndSaveYaml().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
