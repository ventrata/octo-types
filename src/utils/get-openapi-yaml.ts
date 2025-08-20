import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';

async function fetchAndSaveYaml() {
	const url =
		'https://raw.githubusercontent.com/ventrata/octo-typespec/main/tsp-output/%40typespec/openapi3/openapi.Ventrata.yaml';

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
	}

	const yamlText = await response.text();

	const outputPath = path.join('src', 'openapi.yaml');
	await writeFile(outputPath, yamlText, 'utf-8');
	console.log(`OpenAPI YAML saved to ${outputPath}`);
}

fetchAndSaveYaml().catch((e) => console.error(e));
