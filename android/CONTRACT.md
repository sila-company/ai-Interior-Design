# Android API Contract Notes

The Android v1 client uses hand-written Retrofit DTOs based on the Express route
implementations under `artifacts/api-server/src/routes`.

`lib/api-spec/openapi.yaml` is not safe as the Android source of truth for v1
generation. It still describes the old `/api/redesigns` multipart contract and
does not include the current auth, rooms, room-detail, upload-image, or
authenticated redesign history endpoints.

Runtime routes verified for this foundation:

- `POST /api/auth/login` returns `{ token, user }`.
- `GET /api/auth/me` returns `{ user }` and requires bearer auth.
- `GET /api/rooms` returns a room array with protected upload URLs.
- `GET /api/rooms/:roomId` returns `{ room, redesigns }`; nested redesigns do
  not include `originalImageUrl`.
- `GET /api/styles` returns the style catalog.
- `GET /api/redesigns` returns redesigns with `originalImageUrl`.
- `POST /api/redesigns` accepts `{ roomId, styleId, products? }` and may return
  `imageBase64` plus `resultImageUrl`.
- `GET /api/uploads/*` requires bearer auth and only serves paths owned by the
  authenticated user.
