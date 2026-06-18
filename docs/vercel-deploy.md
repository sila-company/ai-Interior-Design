# Vercel deployment

This repo deploys as one Vercel project:

- Web app: `artifacts/mockup-sandbox`, served at `/`
- Backend API: `artifacts/api-server`, served by `api/[...path].ts` at `/api/*`
- iOS app: points `API_BASE_URL` at the same deployed Vercel domain

## Vercel project settings

Create/import the Vercel project from the repository root, not from
`artifacts/mockup-sandbox`.

The root `vercel.json` sets:

- Build command: `pnpm --filter @workspace/mockup-sandbox run build`
- Output directory: `artifacts/mockup-sandbox/dist`
- API function: `api/[...path].ts`

## Required environment variables

Set these in Vercel Project Settings -> Environment Variables:

```text
OPENAI_API_KEY=...
JWT_SECRET=...
DATABASE_URL=...
BLOB_READ_WRITE_TOKEN=...
```

### Membership (Apple In-App Purchase)

Required for production subscription verification:

```text
APPLE_BUNDLE_ID=com.atelier.interiordesign
APPLE_ISSUER_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...   # contents of App Store Connect .p8 key (PEM or base64)
APPLE_ENVIRONMENT=Sandbox   # or Production
```

Optional generation limits (defaults shown):

```text
FREE_REDESIGN_LIMIT=2
SUBSCRIBER_DAILY_CAP=50
```

Use Vercel Blob for `BLOB_READ_WRITE_TOKEN`; use Neon, Supabase, or another
Postgres host for `DATABASE_URL`.

## Database schema

After `DATABASE_URL` is available locally, push the Drizzle schema:

```bash
pnpm --filter @workspace/db run push
```

## Deploy

```bash
vercel
vercel --prod
```

After deployment, test:

```text
https://ateliertech.vercel.app/api/healthz
```

## iOS configuration

Copy the example plist:

```bash
cp Atelier/Atelier/Config/Secrets.plist.example Atelier/Atelier/Config/Secrets.plist
```

Set:

```text
API_BASE_URL=https://ateliertech.vercel.app
```

The Swift app already appends paths like `api/auth/login`, so do not include
`/api` at the end of `API_BASE_URL`.
