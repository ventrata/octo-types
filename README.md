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

- `npm run generate` regenerates models and both schema variants from the checked-in `src/openapi.yaml`.
- `npm run generate:update` downloads the latest specification, then regenerates everything. Download failures stop the command.
- `npm run build` cleans `dist` and builds both module formats. Generation utilities are excluded from the published output.
- `npm run check` checks package and tooling types, formatting, and lint.
- `npm test` checks source transformations, downloads, recursion, package exports, TypeScript consumers, and browser bundle sizes.

Generation tooling lives in `scripts/`, with its TypeScript configuration in
`tsconfig.scripts.json`. Pure schema transformations and dependency analysis
live in `scripts/schema-generation/`.
