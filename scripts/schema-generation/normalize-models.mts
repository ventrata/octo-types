import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SPLIT_UUID_EXPORTS = "export type { UUID } from './models/UUID';\nexport type { uuid } from './models/uuid';";
const MERGED_UUID_EXPORTS = "export type { UUID, uuid } from './models/UUID';";

/**
 * The spec has both a `UUID` and a `uuid` schema. On a case-insensitive file system (macOS) the generator's
 * `uuid.ts` overwrites `UUID.ts`; on a case-sensitive one (Linux, CI) both files exist. Either way, this leaves
 * one `UUID.ts` that declares `uuid` and aliases `UUID` to it.
 */
export function normalizeUuidModel(modelsDir: string, indexPath: string): void {
	const uuidPath = path.join(modelsDir, 'UUID.ts');
	const lowerCasePath = path.join(modelsDir, 'uuid.ts');
	// readdirSync lists real names, so this is only true when both files exist (a case-sensitive file system).
	const modelFiles = readdirSync(modelsDir);
	if (modelFiles.includes('uuid.ts') && modelFiles.includes('UUID.ts')) {
		writeFileSync(uuidPath, readFileSync(lowerCasePath, 'utf-8'));
		unlinkSync(lowerCasePath);
	}
	const uuidText = readFileSync(uuidPath, 'utf-8');

	if (!uuidText.includes('export type UUID = uuid;')) {
		writeFileSync(uuidPath, `${uuidText.trimEnd()}\nexport type UUID = uuid;\n`);
	}

	for (const modelFile of readdirSync(modelsDir)) {
		if (!modelFile.endsWith('.ts') || modelFile === 'UUID.ts') continue;
		const modelPath = path.join(modelsDir, modelFile);
		const modelText = readFileSync(modelPath, 'utf-8');
		const normalized = modelText.replaceAll("from './uuid'", "from './UUID'");
		if (normalized !== modelText) writeFileSync(modelPath, normalized);
	}

	const indexText = readFileSync(indexPath, 'utf-8');
	if (indexText.includes(SPLIT_UUID_EXPORTS)) {
		writeFileSync(indexPath, indexText.replace(SPLIT_UUID_EXPORTS, MERGED_UUID_EXPORTS));
	} else if (!indexText.includes(MERGED_UUID_EXPORTS)) {
		throw new Error(`${indexPath} has neither the generated nor the merged UUID exports; update normalizeUuidModel`);
	}
}
