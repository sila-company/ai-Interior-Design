# Atelier

Atelier is an AI-powered interior designer that turns a room photo into a fully shoppable, stylized space with a single click.

You take a photo, choose a vibe, set a budget, and see your room redesigned with real, in-stock products that can be purchased immediately.

## Product Vision

Atelier combines room understanding, AI staging, product recommendations, and multi-retailer checkout into one flow:

1. Upload or capture a room photo.
2. Choose a design vibe, color palette, and budget.
3. Generate a photorealistic redesign of the same room.
4. View the real furniture and decor used in the redesign.
5. Buy the full room layout through a unified checkout experience.

## Key Features

### Photo-to-Canvas Engine

Maps the uploaded room photo, estimates the room structure, and digitally removes existing furniture to create a clean canvas for redesign.

### Vibe & Budget Quiz

Guides the user through a short questionnaire covering:

- Interior style, such as minimalist, cozy, luxurious, industrial, or Scandinavian
- Preferred color palette
- Room type
- Budget range
- Optional constraints, such as items to keep or avoid

### Real-Product Mapping

Curates furniture and decor only from a database of real, in-stock products. Each product can include:

- Retailer
- Price
- Availability
- Dimensions
- Product images
- Affiliate tracking links

### Photorealistic Staging

Uses AI to blend selected real product images into the user's room photo while matching:

- Lighting
- Perspective
- Shadows
- Scale
- Materials
- Existing architectural details

### Universal Multi-Store Checkout

Lets users purchase an entire room layout from multiple retailers through one automated cart experience, with shipping and fulfillment coordinated across stores.

## Current App Surfaces

This repository currently contains several app surfaces and support packages:

- `Atelier/` - native SwiftUI iOS app
- `artifacts/mockup-sandbox/` - mobile-first React/Vite web app
- `artifacts/api-server/` - Node.js/Express backend API
- `artifacts/mobile/` - Expo React Native mobile package
- `lib/` - shared API, validation, and database packages

## Target Architecture

```text
iOS / Web / Android
        |
        v
Atelier API
        |
        +--> AI image generation and staging
        +--> Product catalog and inventory data
        +--> Affiliate tracking
        +--> Multi-retailer cart orchestration
```

The backend owns sensitive credentials, including OpenAI and retailer API keys. Client apps should call the Atelier API rather than third-party services directly.

## Core User Flow

1. User uploads a room photo.
2. App analyzes the room and creates a blank design canvas.
3. User completes the vibe and budget quiz.
4. Backend selects real products that fit the room, style, and budget.
5. AI generates a staged redesign using those products.
6. User reviews the before/after result and product list.
7. User edits, swaps, saves, shares, or purchases the room.

## Long-Term Goal

Atelier should feel less like a generic image generator and more like a personal interior designer that can produce a realistic, purchasable room plan in minutes.

The key product promise is:

> See your real room redesigned with real products you can actually buy.
