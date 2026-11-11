# @ventrata/octo-types

OCTO models and generated Zod schemas. The package provides CommonJS and ESM
builds, with tree-shaking enabled for browser bundlers.

```ts
import { CapabilityId, bookingGiftsSchema } from '@ventrata/octo-types';
import { bookingGiftsSchema as miniSchema } from '@ventrata/octo-types/schemas-mini';
```

Classic schemas support Zod's chaining methods. Mini schemas support `parse()`
and `safeParse()` and use the functional `zod/mini` API for smaller bundles.
Individual schemas are available through `schemas/BookingGifts` and
`schemas-mini/BookingGifts` subpaths.

## Development

Generation scripts are TypeScript (`.mts`) run directly by Node with `--experimental-strip-types`, no build step.

- `npm run generate` regenerates models and both schema variants from the checked-in `src/openapi.yaml`.
- `npm run generate:update` downloads the latest specification, then regenerates everything. Download failures stop the command.
- `npm run build` cleans `dist` and builds both module formats. Generation utilities are excluded from the published output.
- `npm run check` checks package and tooling types, formatting, and lint.
- `npm test` checks source transformations, downloads, recursion, and then builds the package to check its exports, TypeScript consumers, and browser bundle sizes.

`src/openapi.yaml` comes from [octo-typespec](https://github.com/ventrata/octo-typespec): a push to its `main`
opens or updates a sync PR here (branch `repo-sync/...`). The `Regenerate types on sync PRs` workflow then merges
`main` into that branch, regenerates the types, bumps the patch version and pushes, which reruns the checks. Review
the result, raise the version to minor if the spec removes or changes types, and merge. Every PR also checks that
the committed models and schemas match `src/openapi.yaml`.

Generation tooling lives in `scripts/`, with its TypeScript configuration in
`tsconfig.scripts.json`. Shared TypeScript AST helpers are in `scripts/ast.mts`;
schema transformations, dependency analysis and index generation live in
`scripts/schema-generation/`.
