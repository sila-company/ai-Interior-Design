# App Store Connect — Atelier Membership setup

Step-by-step guide for configuring the **$19.99/month** Atelier Membership
subscription, App Store Connect API key (server verification), and sandbox
testing.

**Product ID (iOS + backend):** `com.atelier.interiordesign.membership.monthly`  
**Bundle ID:** `com.atelier.interiordesign`

---

## Prerequisites

1. Enrolled in the [Apple Developer Program](https://developer.apple.com/programs/).
2. App record created (or ready to create) in [App Store Connect](https://appstoreconnect.apple.com/).
3. Xcode project open: `Atelier/Atelier.xcodeproj`.

---

## 1. Agreements, Tax, and Banking

1. Open [App Store Connect](https://appstoreconnect.apple.com/) → **Agreements, Tax, and Banking**.
2. Complete the **Paid Applications** agreement.
3. Add **Banking** and **Tax** information.

Subscriptions cannot go live until this is complete.

---

## 2. App ID — enable In-App Purchase

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list).
2. Open (or create) App ID: `com.atelier.interiordesign`.
3. Enable **In-App Purchase** capability.
4. Save.

In Xcode:

1. Select **Atelier** target → **Signing & Capabilities**.
2. Add **In-App Purchase** capability (if not already present).
3. Choose your **Team** for signing (see [Atelier/README.md](../Atelier/README.md)).

---

## 3. Create subscription group and product

1. App Store Connect → your app → **Subscriptions** (under Monetization).
2. Create subscription group:
   - **Reference name:** `atelier_membership`
3. Add subscription inside the group:

| Field | Value |
|-------|-------|
| Reference name | Atelier Membership Monthly |
| Product ID | `com.atelier.interiordesign.membership.monthly` |
| Duration | 1 month |
| Price | **$19.99** (Tier 20) |

4. Add **localization** (at minimum English):
   - **Display name:** Atelier Membership
   - **Description:** Unlimited AI room redesigns, saved rooms, and shoppable suggestions.

5. Submit the subscription for review with your app (or as part of the same version).

---

## 4. App Store metadata (subscriptions)

In App Store Connect → app version:

1. **Privacy Policy URL:** `https://<your-domain>/privacy`
2. **Terms of Use (EULA):** Apple standard EULA or custom URL `https://<your-domain>/terms`
3. **Support URL:** `https://<your-domain>/support`

Upload a **screenshot of the in-app paywall** when App Review requests subscription metadata.

---

## 5. App Store Connect API key (server verification)

The API key is used by the **Atelier API** on Vercel to verify StoreKit 2
transactions. It is **not** embedded in the iOS app.

1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API**.
2. Click **Generate API Key** (or use an existing key with appropriate access).
3. Name it (e.g. `Atelier Server`).
4. Role: **App Manager** or **Admin** (must access In-App Purchase data).
5. Download the `.p8` file **once** — Apple does not let you download it again.

Record these values:

| Variable | Where to find it |
|----------|------------------|
| `APPLE_ISSUER_ID` | Integrations → App Store Connect API (Issuer ID at top) |
| `APPLE_KEY_ID` | Key list (10-character Key ID) |
| `APPLE_PRIVATE_KEY` | Contents of the downloaded `.p8` file (PEM) |
| `APPLE_BUNDLE_ID` | `com.atelier.interiordesign` |
| `APPLE_ENVIRONMENT` | `Sandbox` for testing, `Production` for live |

Add to Vercel (Project Settings → Environment Variables). See
[vercel-deploy.md](./vercel-deploy.md) for the full env list.

---

## 6. Sandbox tester accounts

1. App Store Connect → **Users and Access** → **Sandbox** → **Testers**.
2. Create a sandbox Apple ID (use a unique email; not your real Apple ID).
3. On a test device or simulator (iOS 15+):
   - Sign out of Media & Purchases for your real Apple ID if needed.
   - When prompted during a test purchase, sign in with the **sandbox** account.

Sandbox subscriptions renew on an accelerated schedule (e.g. monthly → minutes)
for testing expiry and renewal.

---

## 7. Local testing with StoreKit Configuration

Before App Store Connect products are approved:

1. In Xcode: **File → New → File → StoreKit Configuration File**.
2. Name it `Atelier.storekit` and add to the Atelier target.
3. Add auto-renewable subscription:
   - Product ID: `com.atelier.interiordesign.membership.monthly`
   - Price: $19.99 / 1 month
4. **Product → Scheme → Edit Scheme → Run → Options** → set **StoreKit Configuration** to `Atelier.storekit`.

Run on Simulator to test purchase UI without a sandbox account.

---

## 8. End-to-end sandbox test checklist

| Step | Expected result |
|------|-----------------|
| New user signs up | 2 free redesigns available |
| 3rd redesign attempt | Paywall shown |
| Subscribe (sandbox) | Apple purchase sheet completes |
| App syncs transaction | `POST /api/subscription/sync` → membership active |
| Generate redesign | Allowed (unlimited while active) |
| Restore purchases | Membership restored after reinstall |
| Let sandbox sub lapse | Server marks expired → paywall returns |

---

## 9. App Privacy (Connect questionnaire)

When completing **App Privacy** for the app listing:

- **Data collected:** Email, name, photos, purchase history (subscription status).
- **Data linked to user:** Yes (account-based).
- **Tracking:** No (Atelier does not use third-party ad tracking).
- **Purposes:** App functionality, account management.

Align answers with [Privacy Policy](https://<your-domain>/privacy) and
`Atelier/Atelier/PrivacyInfo.xcprivacy`.

---

## 10. Apple Review notes

- Provide a **demo account** (email/password) for the Atelier API, or note that
  reviewers can register in-app.
- For subscription testing, provide a **sandbox Apple ID** or note that
  StoreKit Configuration is enabled in the review build.
- **Restore Purchases** must be visible on the membership screen.
- Subscription terms (auto-renew, price, cancel via Apple ID) must appear before purchase.

---

## Quick reference

| Item | Value |
|------|-------|
| Subscription group | `atelier_membership` |
| Product ID | `com.atelier.interiordesign.membership.monthly` |
| Price | $19.99 / month |
| Free tier | 2 lifetime redesigns per account |
| iOS config | Product ID string only (no API key in app) |
| Server config | `APPLE_*` env vars on Vercel |

Official documentation:

- [Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/)
- [StoreKit 2](https://developer.apple.com/documentation/storekit)
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
