# CineBook

React Native (TypeScript, New Architecture) app that lists upcoming movies from
TMDb and carries the user through to seat selection.

## Deliverables

| Item | Link |
|---|---|
| GitHub repo | [muhammad_saad_tanveer_tentwenty_assignment (`api_integrations`)](https://github.com/SaadTanveer14/muhammad_saad_tanveer_tentwenty_assignment/tree/api_integrations) |
| Demo screen recording | [Google Drive](https://drive.google.com/file/d/1XVewe78BcX0MeNwzcEZhI3Nr5WVvW1Ve/view?usp=drive_link) |
| Installable build (APK) | [Google Drive](https://drive.google.com/file/d/13pPLU5UeeGLDgZZYmxgOZjsDhFhk5Mx_/view?usp=sharing) |
| Code structure walkthrough | [Google Drive](https://drive.google.com/file/d/1cpbclm_hHt-kobbxKFZYlKG48kcJPtdx/view?usp=sharing) |
| How I work | [Google Drive](https://drive.google.com/file/d/1vPZloIiju63fqhcENFJ5y0RyoA10Ztzf/view?usp=sharing) |

## Repository layout

```
CineBook/
├── README.md       this file
└── source/         the React Native project (package.json, src/, ios/, android/, docs)
```

All commands below run from `source/`. Paths in this README (`src/…`,
`.maestro/`, `jest.config.js`) are relative to `source/`.

## Getting started

Prerequisites: Node 22.13+ / 24 LTS, JDK 17, Android SDK 36, Xcode + CocoaPods.

```bash
cd source
npm install
cp .env.example .env          # then set TMDB_READ_TOKEN (TMDb v4 read access token)
npm run pods                  # iOS only
npm run ios                   # or: npm run android
```

`.env` is git-ignored and read by `react-native-config` at build time — rebuild
the native app after changing it.

## Scripts

| Script | What it does |
|---|---|
| `npm test` | Jest + React Native Testing Library + MSW |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run e2e` | Maestro flows in `.maestro/` |

## Architecture

Feature-first clean architecture: `presentation → domain ← data`.

```
src/
├── app/            composition root: providers, query client, cache policy, navigation
├── core/           feature-agnostic: api client, theme tokens, layout, storage, network, ui kit
├── features/
│   ├── movies/     domain types · TMDb DTOs (zod) + mappers + query keys · list/detail screens
│   ├── search/     query keys + normalisation · search API · search screen
│   ├── trailer/    full-screen trailer modal
│   └── seating/    seat/hall domain types · seat map screen
└── test/           MSW server + handlers, fixtures, renderWithProviders
```

- **Domain** is plain TypeScript — no React, no networking.
- **Data** is the only layer that sees raw TMDb shapes. Every response is
  validated with zod in `core/api/httpClient.ts`; failures become a typed
  `ApiError` (`network | http | parse | aborted`).
- **Presentation** screens call hooks only.

## Offline-first

- TanStack Query cache is persisted to MMKV (`core/storage`) and restored on launch.
- NetInfo drives `onlineManager` (`core/network`); offline queries pause and
  resume on reconnect.
- Freshness/persistence windows live in `app/cachePolicy.ts`.
- `OfflineBanner` for cached content; `StateView state="offline"` when nothing is cached.

## Toolchain notes

- **No Expo.** Expo SDK 57's native layer doesn't compile on Xcode 26.2, so
  images use `@d11/react-native-fast-image` (disk-cached, works offline)
  instead of `expo-image`.
- **RN 0.86.3**, iOS deployment target **15.1**.
- **Babel:** `react-native-worklets/plugin` must stay the last plugin.
- **Jest:** MSW 3 is ESM-only; `jest.config.js` transforms it and
  `babel-plugin-transform-import-meta` and
  `@babel/plugin-transform-class-static-block` (test env only) handle its syntax.
  Reanimated/Worklets use their own Jest resolver.

## Build order

1. ~~Foundation~~ — providers, persistence, NetInfo, navigation, theme, `StateView`, test utils
2. Movie list — `useInfiniteQuery` + FlashList
3. Movie detail + trailer — `pickTrailer()`, detail states, trailer modal lifecycle
4. Search — race-condition test first, then hook + screen
5. Seat map — reducer + layout generator, then UI + gestures
6. Polish — orientation/tablet, accessibility, Maestro E2E




Testing Update