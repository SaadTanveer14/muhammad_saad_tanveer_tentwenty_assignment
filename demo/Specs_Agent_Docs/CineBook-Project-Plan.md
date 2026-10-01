# CineBook — Project Architecture & Setup Plan

A React Native (TypeScript, New Architecture) app that lists upcoming movies from TMDb and carries the user through to seat selection.

---

## 1. Assignment Summary

| Screen | Purpose | Endpoint(s) |
|---|---|---|
| 01 Movie list | Entry point; all upcoming movies. Must feel instant and scale to any length. | `GET /3/movie/upcoming` |
| 02 Movie detail | Movie info + full-screen autoplay trailer that returns to detail on end; user can exit early. No dead states. | `GET /3/movie/{id}`, `/videos`, `/images` |
| 03 Movie search | Immediate search; results must always match the current query, never a stale one. | `GET /3/search/movie` |
| 04 Seat mapping | UI only: layout, states, visual precision. No booking logic. | — |

**Quality bar (every screen):** offline-first with a caching/refetch strategy, all states designed (loading, empty, error, offline), pixel-precise responsive UI in portrait and landscape, and meaningful behaviour-driven tests.

**Platform targets:** Android (target API 36) and iOS 15+.

---

## 2. Architecture

### 2.1 Pattern: feature-first clean architecture

Code is organised by **feature**. Each feature has three layers with a strict dependency rule:

```
presentation  ──►  domain  ◄──  data
```

- **Domain**: plain TypeScript types (`Movie`, `MovieDetail`, `Trailer`, `Seat`) and pure functions. No React, no networking.
- **Data**: TMDb calls, zod validation of responses, and mappers from DTOs (`poster_path`, `release_date`) to domain models. Screens never see raw API shapes.
- **Presentation**: screens, components and hooks. Screens call hooks only, which keeps them thin and testable.

### 2.2 Stack

| Concern | Choice | Reason |
|---|---|---|
| Navigation | React Navigation (native stack) | Native transitions, typed params, modal presentation for trailer |
| Server state & cache | TanStack Query | Caching, stale-while-revalidate, cancellation, offline mode |
| Persistence | react-native-mmkv + query persister | Synchronous storage, so cached data is on screen at first frame |
| Connectivity | @react-native-community/netinfo | Drives TanStack Query's `onlineManager` |
| Lists | @shopify/flash-list | View recycling for long lists |
| Images | expo-image | Disk cache (works offline), blurhash placeholders |
| Trailer | react-native-youtube-iframe | TMDb videos are YouTube keys; exposes `ended` state |
| Gestures | react-native-gesture-handler + Reanimated | Seat map pinch/pan on the UI thread |
| Validation | zod | Fails loudly in one known place at the API boundary |
| Config | react-native-config | Keeps the TMDb token out of the repo |
| Testing | Jest, React Native Testing Library, MSW, Maestro | Behaviour tests with a realistic network; E2E flow |

### 2.3 Folder structure

```
src/
├── app/                      # composition root
│   ├── App.tsx               # providers: QueryClient, persister, navigation, theme
│   ├── navigation/           # RootStack, typed ParamList, linking
│   └── queryClient.ts        # defaults, onlineManager wiring, persister
├── core/                     # shared, feature-agnostic
│   ├── api/                  # httpClient (fetch + bearer token + AbortSignal), errors
│   ├── theme/                # tokens: spacing (4pt grid), colors, typography, radii
│   ├── layout/               # useResponsive(): columns, gutters, orientation
│   ├── storage/              # MMKV instance + query persister
│   └── ui/                   # Screen, StateView (loading/empty/error/offline), Skeleton, Button
├── features/
│   ├── movies/
│   │   ├── domain/           # Movie, MovieDetail types
│   │   ├── data/             # tmdbMovies.ts, dto.ts (zod), mappers.ts, queryKeys.ts
│   │   └── presentation/     # MovieListScreen, MovieDetailScreen, hooks, MovieCard
│   ├── search/
│   │   ├── data/
│   │   └── presentation/     # SearchScreen, useMovieSearch
│   ├── trailer/
│   │   ├── domain/           # pickTrailer()
│   │   └── presentation/     # TrailerScreen (full-screen modal)
│   └── seating/
│       ├── domain/           # Seat, SeatStatus, layout generator, selection reducer
│       └── presentation/     # SeatMapScreen, Seat, Legend, ScreenCurve, SelectionBar
└── test/                     # MSW handlers, fixtures, renderWithProviders
```

---

## 3. Offline-First Strategy

- The TanStack Query cache is persisted to MMKV and restored synchronously on launch, so the app shows cached data immediately and revalidates in the background.
- NetInfo feeds `onlineManager`. Offline, queries **pause** instead of failing and refetch automatically on reconnect.
- expo-image's disk cache keeps previously loaded posters and backdrops available offline.

| Resource | staleTime | Persisted for |
|---|---|---|
| Upcoming list | ~1 hour | 7 days |
| Detail, videos, images | ~24 hours | 7 days |
| Search results | ~5 minutes | 1 day (recent queries only) |

**UI rules:**
- Offline **with** cache: show data plus a small "Offline, showing saved results" banner.
- Offline **without** cache: dedicated offline state with Retry. Never an endless spinner.

---

## 4. Screen Plans

### 01 — Movie list
- `useInfiniteQuery` over `/movie/upcoming` pages, rendered with FlashList.
- Instant feel: persisted cache on first frame, skeletons only on true first launch, fixed item sizes, blurhash poster placeholders, early `onEndReached` prefetch.
- Column count from `useWindowDimensions` (portrait, landscape, tablet).
- States: pull-to-refresh, inline footer error with retry for a failed page, empty state.

### 02 — Movie detail
- Detail, videos and images fetched in parallel (separate query keys or `append_to_response=videos,images`).
- List item data used as placeholder so the header renders with no gap.
- `pickTrailer()` (pure): official YouTube "Trailer", then "Teaser". No trailer → button hidden or disabled with a label.
- Trailer is a full-screen modal route:
  - Autoplays on open (allow inline media autoplay on iOS WebView).
  - On `ended` → `navigation.goBack()`.
  - Exit anytime: close button, Android back, iOS swipe-to-dismiss.
  - Player error or offline → error view with Back. Never a black screen.

### 03 — Movie search
Correctness approach:
1. Light debounce (~250 ms).
2. Normalised term in the query key, so each term has its own cache entry (revisited terms are instant).
3. TanStack's `AbortSignal` cancels superseded requests.
4. Results render only when they belong to the current input.

```ts
const term = useDebouncedValue(input.trim().toLowerCase(), 250);
const q = useQuery({
  queryKey: ['search', term],
  queryFn: ({ signal }) => searchMovies(term, signal),
  enabled: term.length > 0,
});
const isCurrent = term === input.trim().toLowerCase();
```

- While `!isCurrent` or fetching: subtle "Searching…" indicator.
- Offline: fall back to local filtering of cached movies.
- States: idle prompt, "No results for X", error with retry, offline.

### 04 — Seat mapping (UI only)
- Domain: pure layout generator (rows, aisles, gaps from config) and a `useReducer` selection reducer.
- Seat states: available, selected, taken, wheelchair, blocked; max-selection rule.
- UI: curved screen indicator, seat grid, legend, sticky selection summary bar.
- Seat size computed from available width so the grid fits both orientations; pinch-to-zoom and pan for large rooms.
- Accessibility label on every seat, e.g. "Row F, seat 12, available".
- All spacing and colours from theme tokens.

---

## 5. Testing Plan (TDD)

MSW mocks TMDb; tests assert what a user would observe.

| Area | Test |
|---|---|
| Search race | Type "bat" then "batman"; resolve "bat" **after** "batman"; assert only Batman results ever appear. |
| Offline | Hydrate persisted cache, NetInfo offline; list and offline banner render, no spinner. |
| Trailer | Simulated `ended` event returns to detail; close button works mid-playback. |
| Detail | No YouTube trailer in videos → trailer button hidden or disabled. |
| Seating | Reducer: select, deselect, reject taken seats, max limit. Screen: tapping a seat updates summary bar. |
| Mappers | Malformed DTO produces a typed error, not a crash. |
| E2E (Maestro) | List → detail → trailer → back → seats, on both platforms. |

---

## 6. Setup Steps

### 6.1 Prerequisites
- Node (current LTS)
- **Android:** JDK 17, Android Studio with SDK Platform 36 and an emulator
- **iOS (macOS only):** Xcode, CocoaPods, Ruby `bundler`

```bash
node -v
java -version
```

### 6.2 Create the project
The default template is TypeScript with the New Architecture enabled.

```bash
npx @react-native-community/cli@latest init CineBook
cd CineBook
git init && git add . && git commit -m "chore: init React Native project"
```

### 6.3 Install dependencies

```bash
# Navigation
npm i @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context

# Server state, persistence, connectivity
npm i @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
npm i react-native-mmkv react-native-nitro-modules @react-native-community/netinfo

# Lists, trailer, gestures/animation
npm i @shopify/flash-list react-native-youtube-iframe react-native-webview
npm i react-native-gesture-handler react-native-reanimated react-native-worklets

# Validation and environment config
npm i zod react-native-config

# Images (Expo modules in a bare RN app)
npx install-expo-modules@latest
npx expo install expo-image

# Testing
npm i -D @testing-library/react-native msw
```

### 6.4 Configure

`babel.config.js` — the worklets plugin must be **last**:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
```

`android/build.gradle` — confirm `targetSdkVersion = 36` and `compileSdkVersion = 36`.

`.env` (git-ignored) and `.env.example` (committed):

```
TMDB_READ_TOKEN=your_tmdb_v4_read_access_token
```

### 6.5 Run

```bash
cd ios && bundle install && bundle exec pod install && cd ..
npm run android   # or: npm run ios
```

Commit once the default welcome screen runs.

---

## 7. Build Order (Milestones)

1. **Foundation:** providers, query client + MMKV persistence, NetInfo wiring, typed navigation, theme tokens, `StateView`, test utilities (`renderWithProviders`, MSW).
2. **Movie list:** tests first (loading, cached/offline, error, pagination), then implementation.
3. **Movie detail + trailer:** `pickTrailer()` unit tests, detail screen states, trailer modal lifecycle.
4. **Search:** race-condition test first, then hook and screen.
5. **Seat map:** reducer and layout generator tests, then UI and gestures.
6. **Polish:** orientation and tablet checks, accessibility pass, Maestro E2E flow.
7. **README:** document decisions (architecture, caching policy, search correctness, trailer lifecycle) and how to run tests.
