import { promises } from 'node:fs';
import * as path from 'node:path';
export async function normalizeUuidModel(modelsDir: string): Promise<void> {
	const uuidPath = path.join(modelsDir, 'UUID.ts');
	const uuidText = await promises.readFile(uuidPath, 'utf-8');

	if (!uuidText.includes('export type UUID = uuid;')) {
		await promises.writeFile(uuidPath, `${uuidText.trimEnd()}\nexport type UUID = uuid;\n`);
	}

	const modelFiles = await promises.readdir(modelsDir);
	await Promise.all(
		modelFiles
			.filter((modelFile) => modelFile.endsWith('.ts') && modelFile !== 'UUID.ts')
			.map(async (modelFile) => {
				const modelPath = path.join(modelsDir, modelFile);
				const modelText = await promises.readFile(modelPath, 'utf-8');
				await promises.writeFile(modelPath, modelText.replaceAll("from './uuid'", "from './UUID'"));
			}),
	);

	const indexPath = path.resolve(process.cwd(), 'src/index.ts');
	const indexText = await promises.readFile(indexPath, 'utf-8');
	await promises.writeFile(
		indexPath,
		indexText.replace(
			"export type { UUID } from './models/UUID';\nexport type { uuid } from './models/uuid';",
			"export type { UUID, uuid } from './models/UUID';",
		),
	);
}
