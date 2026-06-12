#!/bin/bash
set -euo pipefail

pnpm install --frozen-lockfile

# Atelier API does not require Postgres; only push schema when configured.
if [ -n "${DATABASE_URL:-}" ]; then
  pnpm --filter @workspace/db run push
fi
