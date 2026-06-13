# Atelier API (Node.js + TypeScript)

Shared backend for the iOS app and web app.

## Stack

- **Express 5** API server (`artifacts/api-server`)
- **Postgres** + **Drizzle** (`lib/db`) — users, named rooms, saved redesigns
- **Replit App Storage** — persistent uploaded room photos and generated redesign images
- **JWT** auth — Bearer token (iOS keychain) or `atelier_token` cookie (web)
- **OpenAPI** contract (`lib/api-spec/openapi.yaml`)
- **Zod** validation (`lib/api-zod`) — used by the server
- **OpenAI** `gpt-image-2` — image edits run on the server only

## Architecture

```
iOS / Web  →  Atelier API  →  Postgres
                          →  Replit App Storage
                          →  OpenAI
```

The OpenAI API key lives **only on the server**, never in mobile or web clients.
In production, uploaded room photos and generated redesigns should be stored in Replit App Storage. If `REPLIT_OBJECT_STORAGE_BUCKET_ID` is unset, the API falls back to local filesystem storage for development.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/styles` | List design styles |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/rooms` | List user's named rooms |
| `POST` | `/api/rooms` | Create room (multipart: `name`, `image`) |
| `GET` | `/api/rooms/:id` | Room detail + redesign history |
| `POST` | `/api/redesigns` | Generate redesign for a saved room (`roomId`, `styleId`) |

## Run locally

1. Copy env file and configure secrets:

   ```bash
   cp .env.example .env
   # Edit .env — set OPENAI_API_KEY, DATABASE_URL, JWT_SECRET
   # On Replit, also set REPLIT_OBJECT_STORAGE_BUCKET_ID for persistent images
   ```

2. Push the database schema (requires Postgres):

   ```bash
   export $(grep -v '^#' .env | xargs)
   pnpm --filter @workspace/db run push
   ```

3. Install dependencies (from repo root):

   ```bash
   pnpm install
   pnpm run typecheck:libs
   ```

4. Start the API server (uses `tsx` — no esbuild bundle required on Mac):

   ```bash
   export $(grep -v '^#' .env | xargs)
   pnpm --filter @workspace/api-server run dev
   ```

   `PORT` defaults to `5001` in `.env.example` (macOS often reserves `5000` for AirPlay). For a production-style bundle (e.g. Replit/Linux), use `pnpm --filter @workspace/api-server run dev:bundle`.

5. Test health:

   ```bash
   curl http://127.0.0.1:5001/api/healthz
   ```

## iOS app configuration

In `Atelier/Atelier/Config/Secrets.plist`:

```xml
<key>API_BASE_URL</key>
<string>http://127.0.0.1:5001</string>
```

Use your Mac's LAN IP instead of `127.0.0.1` when testing on a physical iPhone.

## Regenerate Zod schemas

After changing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Web app (mobile-first)

The mobile web app lives in `artifacts/mockup-sandbox/` and mirrors the iOS flow.

1. Start the API server (terminal 1):

   ```bash
   export $(grep -v '^#' .env | xargs)
   pnpm --filter @workspace/api-server run dev
   ```

2. Start the web app (terminal 2):

   ```bash
   pnpm --filter @workspace/mockup-sandbox run dev
   ```

3. Open `http://127.0.0.1:5173` in your browser. On desktop it renders in a phone-width shell; on mobile it feels like a native app.

The Vite dev server proxies `/api` to `http://127.0.0.1:5001`.
