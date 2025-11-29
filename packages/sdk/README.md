# @repo/sdk

A small TypeScript SDK package intended to be used by both frontend and backend code within this monorepo.

Usage (frontend):

```ts
import { createClient } from '@repo/sdk';

const api = createClient('/api');
const data = await api.get('/health');
```

Usage (backend / node):

```ts
import { createClient } from '@repo/sdk';

const api = createClient(process.env.BACKEND_URL ?? 'http://localhost:3000');
const result = await api.post('/do-something', { foo: 'bar' });
```

Build

From repo root (pnpm workspace):

```bash
pnpm --filter @repo/sdk build
```

Notes

- The SDK uses the global `fetch` API. Node 18+ has a global fetch implementation. If you target older Node versions, install a fetch polyfill.
- Add more helpers/types as needed.
