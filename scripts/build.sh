#!/bin/bash
# Build: install deps (once) + compile host entry + bundle the client half.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d node_modules ]; then
  npm install --no-audit --no-fund
fi

echo "=== Compiling host entry (src/index.ts -> lib/index.js) ==="
npx tsc -p tsconfig.host.json

echo "=== Bundling client half (src/client/index.ts -> lib/client.js) ==="
npm run build:client
echo "=== Build complete ==="
