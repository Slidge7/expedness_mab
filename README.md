# Expedness mobile & web client

React Native CLI app (**not Expo**) for the Expedness trader expenses system.

- **Web (current focus):** `npm run web` → http://localhost:3000
- **Android:** `npm run android` (requires Metro: `npm start`)
- **iOS:** Not supported for this product; `ios/` is template-only

Full project documentation lives in the parent repo: **[../README.md](../README.md)** and **[../docs/](../docs/)**.

## Quick start (web)

```powershell
npm install
npm run web
```

Ensure the Spring Boot API is running on port **7001** (see [../docs/SETUP.md](../docs/SETUP.md)).

API base URL: `src/api/client.ts` → `BASE_URL` (default `http://localhost:7001`).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run web` | Webpack dev server |
| `npm run build:web` | Production bundle in `web-build/` |
| `npm start` | Metro (Android) |
| `npm run android` | Run on Android device/emulator |
| `npm test` | Jest |
| `npm run lint` | ESLint |

## Structure

See [../docs/FRONTEND.md](../docs/FRONTEND.md).

## Requirements

- Node.js ≥ 20
- For Android: JDK, Android SDK, device/emulator
