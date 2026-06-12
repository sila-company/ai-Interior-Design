#!/bin/bash
set -euo pipefail

pnpm install --frozen-lockfile

if [ -n "${DATABASE_URL:-}" ]; then
  pnpm --filter @workspace/db run push
fi
