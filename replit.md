# Atelier — Replit

AI interior design: upload a room photo, pick a style, get an AI redesign.

## Replit services

| Service | Package | Port | URL path |
|---------|---------|------|----------|
| **API** | `artifacts/api-server` | `8080` | `/api/*` |
| **Web** | `artifacts/mockup-sandbox` | `8081` | `/` (main app — matches iOS) |
| **Mobile** | `artifacts/mobile` (Expo, legacy) | `18115` | `/__expo` only |

In the Preview dropdown, choose **Atelier Web** — not "Atelier Mobile (legacy)".

## Secrets (required)

Set in **Replit → Secrets**:

| Secret | Used by |
|--------|---------|
| `OPENAI_API_KEY` | API server — room redesign generation |

Optional (legacy DB template only):

| Secret | Used by |
|--------|---------|
| `DATABASE_URL` | `lib/db` — only pushed on git pull when set |

## After git pull

`scripts/post-merge.sh` runs automatically and runs `pnpm install`. Postgres schema push runs only when `DATABASE_URL` is set.

## Local commands (on Replit shell)

```bash
# API (port 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Web app (port 8081, site root)
PORT=8081 BASE_PATH=/ API_PROXY_TARGET=http://127.0.0.1:8080 \
  pnpm --filter @workspace/mockup-sandbox run dev

# Expo mobile
pnpm --filter @workspace/mobile run dev
```

## Production deploy

Replit autoscale deploy builds and runs:

- **API:** `pnpm --filter @workspace/api-server run build` → `node artifacts/api-server/dist/index.mjs`
- **Web:** `pnpm --filter @workspace/mockup-sandbox run build` → `vite preview`

Health check: `GET /api/healthz`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + OpenAI `gpt-image-2`
- Web: Vite + React (mobile-first, mirrors iOS app)
- Mobile: Expo 54 + React Native (legacy prototype — not yet aligned with iOS)
- iOS: native SwiftUI app in `Atelier/` (built in Xcode, not on Replit)

## Mac vs Replit

`pnpm-workspace.yaml` keeps **linux-x64** binaries for Replit and **darwin** binaries for local Mac dev. Both environments should work after `pnpm install`.

Local Mac defaults: API `5001`, web `5173`. Replit uses `8080` / `8081` via artifact env vars.
