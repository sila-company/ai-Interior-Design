# Atelier — Replit

AI interior design: upload a room photo, pick a style, get an AI redesign.

## Replit services

| Service | Package | Port | URL path |
|---------|---------|------|----------|
| **API** | `artifacts/api-server` | `8080` | `/api/*` |
| **Web** | `artifacts/mockup-sandbox` | `8081` | `/` |

In the Preview dropdown, choose **Atelier Web**.

## Secrets (required)

Set in **Replit → Secrets**:

| Secret | Used by |
|--------|---------|
| `OPENAI_API_KEY` | API server — room redesign generation |
| `DATABASE_URL` | Postgres — users, rooms, saved redesigns |
| `JWT_SECRET` | API server — auth tokens (long random string) |

## After git pull

`scripts/post-merge.sh` runs automatically: `pnpm install`, then `drizzle-kit push` when `DATABASE_URL` is set.

## Local commands (on Replit shell)

```bash
# API (port 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Web app (port 8081, site root)
PORT=8081 BASE_PATH=/ API_PROXY_TARGET=http://127.0.0.1:8080 \
  pnpm --filter @workspace/mockup-sandbox run dev
```

## Production deploy

Replit autoscale deploy builds and runs:

- **API:** `pnpm --filter @workspace/api-server run build` → `node artifacts/api-server/dist/index.mjs`
- **Web:** `pnpm --filter @workspace/mockup-sandbox run build` → `vite preview`

Health check: `GET /api/healthz`

## API routes

| Route | Purpose |
|-------|---------|
| `GET /api/healthz` | Health check |
| `GET /api/styles` | Design style catalog |
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in |
| `POST /api/auth/logout` | Sign out |
| `GET /api/auth/me` | Current user |
| `GET/POST /api/rooms` | List / create named rooms |
| `GET/PATCH/DELETE /api/rooms/:id` | Room detail, rename, delete |
| `POST /api/redesigns` | Generate redesign for a saved room |
| `GET /api/uploads/*` | Serve stored images (auth-gated) |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Postgres (Drizzle) + OpenAI `gpt-image-2`
- Web: Vite + React (mobile-first, mirrors iOS)
- iOS: native SwiftUI app in `Atelier/` (built in Xcode, not on Replit)

## Mac vs Replit

`pnpm-workspace.yaml` keeps **linux-x64** binaries for Replit and **darwin** binaries for local Mac dev.

Local Mac defaults: API `5001`, web `5173`. Replit uses `8080` / `8081` via artifact env vars.
