# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The project lives in `source/` (the repo root holds only `README.md`); all paths and commands here are relative to `source/`.

CineBook is a bare React Native app (TypeScript, New Architecture) that lists upcoming TMDb movies and leads through detail → trailer → seat selection. The full spec lives outside the repo (`CineBook-Project-Plan.md`); the README summarises it.

## Commands

```bash
npm test                                   # Jest (RNTL + MSW)
npx jest src/core/api                      # tests under a path
npx jest -t "maps TMDb DTOs"               # single test by name
npm run typecheck                          # tsc --noEmit
npm run lint                               # eslint .
npm run format                             # prettier on src/
npm run pods                               # iOS: bundle exec pod install
npm run android | npm run ios              # build + run
npm run e2e                                # Maestro flows in .maestro/
npm run tmdb:smoke                         # live-call every TMDb operation with the .env token
```

Android build without a device: `cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a`.

`.env` (git-ignored, copy from `.env.example`) holds `TMDB_READ_TOKEN`; it is read by `react-native-config` at **native build time**, so rebuild after changing it.

## Architecture

Feature-first clean architecture under `src/`, with dependency rule `presentation → domain ← data`:

- `app/` — composition root. `AppProviders.tsx` stacks GestureHandler → SafeArea → `PersistQueryClientProvider`, and wires NetInfo into TanStack's `onlineManager`. `queryClient.ts` sets defaults (no retry on `parse`/404) and decides which queries get persisted; `cachePolicy.ts` holds per-resource `staleTime`/persist windows. `navigation/`: `RootStack` (Tabs + screens that cover the tab bar: MovieDetail, Showtimes, SeatMap, Trailer modal) → `Tabs` (custom `AppTabBar`; becomes a left rail on expanded widths) → `WatchStack` (WatchHome, Search, SearchResults). All navigators use `headerShown: false`; each screen draws its own `AppHeader` inside `ScreenScaffold`. Param lists live in `types.ts`.
- `core/` — feature-agnostic: `api/` (the only `fetch` call), `theme/` tokens, `layout/` (size class by **width**, not orientation: compact < 600 ≤ medium ≤ 840 < expanded; `columnsFor()` for grids; `useLayoutWidth()` measures the real container so rails/split screen count), `storage/` (MMKV + query persister), `network/`, `ui/` kit.
- `features/<name>/{domain,data,presentation}` — `movies`, `search`, `trailer`, `showtimes`, `seating`.
- `mocks/` — the mock catalog (the design's six movies, real YouTube trailer keys), bundled artwork in `assets/images/mock/`, and `mockDelay()` (abortable latency, currently 0).

Key conventions spanning multiple files:

- **API layers (generic → specific):**
  - `core/api/httpClient.ts` — `createHttpClient({ baseUrl, headers, parseServerError })`, API-agnostic. Requests are data: `Endpoint<T> = { method?, path, params?, body?, schema }`. Every response is zod-validated; every failure is an `ApiError` (`network | http | parse | aborted`, plus `status`/`code`). Headers never appear in errors.
  - `services/tmdb/` — the **only** place TMDb specifics live: `config.ts` (base URLs, token from `.env`, fixed params like `include_adult`, `sort_by`, `with_release_type`, image sizes), `client.ts` (the configured client + TMDb error-body parsing), `endpoints.ts` (the six spec operations as `Endpoint` factories; callers pass only page/query/dates/movie id), `schemas.ts` (response DTOs), `images.ts` (`buildImageUrl`, slash-normalised, `null` for missing paths), `genres.ts` (static genre id→name; there's no genre endpoint in the contract).
  - `core/config/appConfig.ts` — app-owned values: `language` (in every request and cache key), `useMockData`, `upcomingWindowDays`.
  - Don't put URLs, param names or constants in features — add them to `services/tmdb` or `appConfig`.
- **Repositories:** each feature's `domain/` declares an interface; `data/index.ts` picks the mock or TMDb implementation via `appConfig.useMockData` (`USE_MOCK_DATA` in `.env`). TMDb repos are thin: `tmdbClient.request(tmdbEndpoints.x(...), signal)` → mapper. Movie detail fetches details + images in parallel and tolerates an images failure. Showtimes and seating are mock-only (no booking API). Hooks wrap repositories in TanStack Query; screens call hooks only.
- **API contract:** `Movie_DB_API_AGENT_SPEC` (kept outside the repo). Upcoming = `/discover/movie` with a release-date window (not `/movie/upcoming`); only documented fields are used (so no title logos).
- **API boundary:** Raw TMDb shapes (`poster_path`, …) live only in `services/tmdb/schemas.ts`; `features/movies/data/mappers.ts` converts them to domain types (empty strings → `null`). Screens never see DTOs.
- **Query keys** are factories in `features/*/data/queryKeys.ts` and include every input that changes a response (language, page, date window). The first segment matters: `queryClient.ts` persists `['search', …]` for 1 day vs 7 days otherwise. Live search (`livePage`, one page) and the results screen (`results`, infinite) use different keys because the cached shapes differ. Search terms go through `normaliseTerm()` first.
- **Offline:** `networkMode: 'online'` means queries pause (not fail) while offline. Use `useIsOnline()` / `OfflineBanner` for cached-content-while-offline, and `StateView state="offline"` when there is no cache. Every non-content state goes through `StateView` (`loading | empty | error | offline`).
- **Styling:** all spacing/colors/radii/typography come from `core/theme` tokens (4pt grid); text uses `AppText` with a `variant`. **`DESIGN_SYSTEM.md` is the design reference** (Figma node IDs, token tables, per-component specs) — follow it for any UI work and update it alongside `core/theme`. Font is Poppins (`assets/fonts`, linked via `npx react-native-asset`); pick weight with `fontFamily.*`, never `fontWeight`.
- **Seat map:** one pure `SeatGrid` renders both the preview on `ShowtimeCard` and the interactive map; `SeatMap` adds pinch/pan (Gesture Handler 3 hooks + Reanimated, clamped in a worklet), ± buttons and the scroll indicator. Seat size comes from `seatMetrics()` (fits the available width). The hall shape comes from `createSeatLayout()` (pure, deterministic per seed); selection is `seatSelectionReducer`.
- **Images:** `ImageSource` (`core/types`) is `{ uri }` (TMDb) or a `require()` id (mocks); render with `AppImage`. Mock data is never persisted to disk because `require()` ids change between bundles.

## Testing

- `src/test/setupAfterEnv.ts` starts the MSW server with `onUnhandledFrame: 'error'` (MSW 3 name — not `onUnhandledRequest`), so any un-mocked request fails the test. Default TMDb handlers are in `src/test/msw/handlers.ts` (base URL exported as `TMDB`); override per test with `server.use(...)`. Fixtures are raw DTO JSON in `src/test/fixtures/`.
- `renderWithProviders` (and RNTL 14's `render`) are **async** — always `await` them.
- `App.test.tsx` is skipped: rendering the whole app hangs under Jest since the tabs/FlashList UI landed (the app itself runs fine). Needs investigation.
- `jest.setup.js` mocks native modules (NetInfo, react-native-config with `TMDB_READ_TOKEN=test-token`, Nitro for MMKV, safe-area, FastImage, and the YouTube player — its stand-in exposes `onChangeState`/`onError` so the trailer lifecycle can be driven) and stubs Worklets' `getUIRuntimeHolder` for Gesture Handler 3. MMKV auto-switches to an in-memory store under Jest.
- `jest.config.js` uses Reanimated's Jest resolver and transforms MSW's ESM-only deps (`.mjs` included). If a new ESM-only package breaks with "Cannot use import statement", add it to `transformIgnorePatterns`.

## Toolchain gotchas

- **No Expo.** Expo was removed because Expo SDK 57's native layer (`expo-modules-jsi`) doesn't compile on Xcode 26.2. Don't add Expo modules; images use `@d11/react-native-fast-image` (disk cache for offline posters).
- RN 0.86.3, iOS deployment target 15.1.
- `babel.config.js`: `react-native-worklets/plugin` must stay the **last** plugin. The test-only plugins (`babel-plugin-transform-import-meta` — keep on v2, v3 needs Babel 8 — and `@babel/plugin-transform-class-static-block`) exist so Jest can run MSW 3's ESM code.
- Fonts: after adding a font to `assets/fonts`, run `npx react-native-asset` (it updates the Xcode project, `Info.plist` and Android assets).
- `babel.config.js` also needs `@babel/plugin-transform-export-namespace-from` for zod 4 (Metro fails on `export * as` without it).
- Bundle/application ID is `com.cinebook` on both platforms (Maestro `appId`). URL scheme `cinebook://` (see `linking.ts`). Dev-only on iOS, open any screen at launch without the system prompt: `xcrun simctl launch booted com.cinebook -devInitialUrl cinebook://movie/476669/showtimes`.
- If codesign fails with "resource fork, Finder information, or similar detritus", the build products are inside `Documents` (iCloud xattrs): build into the default DerivedData (`npm run ios` does), not `-derivedDataPath ios/build`. Deleting `ios/build` also deletes codegen output — re-run `npm run pods`.
