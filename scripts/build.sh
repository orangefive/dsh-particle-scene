#!/bin/bash
# Build: install deps (once) + bundle the client half with tsdown.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d node_modules ]; then
  npm install --no-audit --no-fund
fi

npm run build:client
echo "=== Build complete: lib/client.js ==="
