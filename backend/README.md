# Atelier API (Node.js + TypeScript)

Shared backend for the iOS app, web app, and Android app.

## Stack

- **Express 5** API server (`artifacts/api-server`)
- **OpenAPI** contract (`lib/api-spec/openapi.yaml`)
- **Zod** validation (`lib/api-zod`) — used by the server
- **React Query client** (`lib/api-client-react`) — for web
- **OpenAI** `gpt-image-2` — image edits run on the server only

## Architecture

```
iOS / Web / Android  →  Atelier API  →  OpenAI
```

The OpenAI API key lives **only on the server**, never in mobile or web clients.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/styles` | List design styles |
| `POST` | `/api/redesigns` | Upload room photo + `styleId`, get redesign |

### Create redesign (multipart)

```bash
curl -X POST http://127.0.0.1:5001/api/redesigns \
  -F "styleId=modern" \
  -F "image=@room.jpg"
```

## Run locally

1. Copy env file and add your OpenAI key:

   ```bash
   cp .env.example .env
   # Edit .env — set OPENAI_API_KEY
   ```

2. Install dependencies (from repo root):

   ```bash
   pnpm install
   ```

3. Start the API server (uses `tsx` — no esbuild bundle required on Mac):

   ```bash
   export $(grep -v '^#' .env | xargs)
   pnpm --filter @workspace/api-server run dev
   ```

   `PORT` defaults to `5001` in `.env.example` (macOS often reserves `5000` for AirPlay). For a production-style bundle (e.g. Replit/Linux), use `pnpm --filter @workspace/api-server run dev:bundle`.

4. Test health:

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

## Regenerate API clients

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

Web and Android apps can also use the generated client in `lib/api-client-react`.
