# Atelier — iOS App

Native SwiftUI iOS app for AI interior design.

## Requirements

- macOS with **Xcode 16+**
- iOS 17+ (Simulator or physical iPhone)

## Open in Xcode

1. Open `Atelier.xcodeproj` in Xcode:
   ```bash
   open Atelier.xcodeproj
   ```
2. Select the **Atelier** scheme and an iPhone simulator (e.g. iPhone 16).
3. Press **⌘R** to build and run.

## First-time signing

**Important:** `DEVELOPMENT_TEAM` is intentionally left unset in the Xcode
project. Each developer must choose their own Team locally — do not commit a
team ID to the repository.

If Xcode asks you to sign the app:

1. Select the **Atelier** project in the navigator.
2. Select the **Atelier** target → **Signing & Capabilities**.
3. Check **Automatically manage signing**.
4. Choose your **Team** (your Apple ID works for Simulator and device testing).

For App Store distribution, use the Apple Developer team that owns
`com.atelier.interiordesign` and enable **In-App Purchase** on the app ID.

## Project structure

```
Atelier/
├── Atelier.xcodeproj
└── Atelier/
    ├── AtelierApp.swift
    ├── Components/
    │   ├── AppBackground.swift
    │   └── CameraPicker.swift
    ├── Views/
    │   ├── LandingView.swift
    │   └── StyleSelectionView.swift
    └── Assets.xcassets
```

## Photo upload flow

1. Tap **Upload a room photo** or the preview card.
2. Choose **Take Photo** (device only) or **Choose from Library**.
3. Your room photo appears in the preview card.
4. Tap **Continue** to confirm and move to the next step.

## API server

The iOS app talks to the **Atelier API** (Node.js), not OpenAI directly.

1. Start the backend — see [backend/README.md](../backend/README.md)
2. Copy the example secrets file:
   ```bash
   cp Atelier/Config/Secrets.example.plist Atelier/Config/Secrets.plist
   ```
3. Set `API_BASE_URL` to `http://127.0.0.1:5000` (simulator) or your Mac's IP (physical device).
4. `Secrets.plist` is gitignored — never commit secrets.

## Full app flow

1. Upload a room photo.
2. Choose a design style.
3. Review on the summary screen, then tap **Generate redesign**.
4. Wait for OpenAI to generate your redesign (usually 30–90 seconds).
5. Compare **Before / After** and save to Photos.

## Results screen

- Drag the **before/after slider** to compare your original room with the redesign
- **Save to Photos** or **Share redesign**
- **Try another style** keeps your room photo and returns to style selection
- **Start over** returns to the landing page
