# CineBook — Code Guide

A walkthrough of how the CineBook React Native app is put together: what each folder does, how data flows from TMDb to the screen, and where to look when you want to change something.

> Companion docs: `README.md` (setup), `DESIGN_SYSTEM.md` (visual specs), `CLAUDE.md` (conventions for AI agents). The Obsidian vault (`../TenTwenty`) holds the full design/decision knowledge base.

---

## 1. What the app does

| # | Screen | What it shows | Data |
|---|---|---|---|
| 01 | Watch Home | Upcoming movies as large image cards, infinite scroll | TMDb `/discover/movie` |
| 02 | Search Browse | Search field + grid of genre tiles | Local category list |
| 03 | Live Search | "Top Results" while typing | TMDb `/search/movie` |
| 04 | Search Results | "N Results Found", paginated | TMDb search or discover-by-genre |
| 05 | Movie Detail | Hero image, Get Tickets, Watch Trailer, genres, overview | TMDb details + images + videos |
| 06 | Showtimes | Date chips + showtime cards with a mini seat map | Mock (no booking API) |
| 07 | Seat Selection | Zoomable seat map, legend, selected seats, total | Mock |
| — | Trailer | Full-screen YouTube player, landscape, autoplay | YouTube key from TMDb videos |
| — | Splash | Native launch screen → animated logo → fades into the app | — |

---

## 2. Running it

```bash
npm install
cp .env.example .env        # set TMDB_READ_TOKEN, USE_MOCK_DATA
npm run pods                # iOS only
npm start                   # Metro (JS bundler)
npm run ios | npm run android
```

| Script | Purpose |
|---|---|
| `npm test` | Jest unit + component tests (MSW mocks TMDb) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run tmdb:smoke` | Calls every real TMDb endpoint with your token; prints statuses only |
| `npm run e2e` | Maestro flows |

**`.env`** (read at **native build time** by `react-native-config` — rebuild after editing):

| Key | Meaning |
|---|---|
| `TMDB_READ_TOKEN` | TMDb v4 *API Read Access Token* (long JWT starting `eyJ`), no quotes, no `Bearer` |
| `TMDB_API_BASE_URL` | `https://api.themoviedb.org/3` |
| `TMDB_IMAGE_BASE_URL` | `https://image.tmdb.org/t/p` |
| `USE_MOCK_DATA` | `true` = in-app mock data, `false` = real TMDb |

---

## 3. Big picture

The code is organised **by feature**, and every feature has three layers that only depend in one direction:

```
presentation ──► domain ◄── data
 (screens,        (types,      (mock + TMDb
  hooks,           interfaces,   repositories,
  components)      pure logic)   mappers, cache keys)
```

A request travels like this:

```
Screen
  └─ hook (TanStack Query: cache, cancel, paginate, offline)
       └─ repository interface (domain)
            ├─ mock repository           ← USE_MOCK_DATA=true
            └─ TMDb repository           ← USE_MOCK_DATA=false
                 └─ tmdbEndpoints.x(args)        (services/tmdb)
                      └─ tmdbClient.request()    (generic HTTP client, core/api)
                 └─ mapper: TMDb JSON → domain type
```

Screens never see raw TMDb JSON and never call `fetch`. Swapping mock ↔ TMDb changes no screen.

---

## 4. Folder by folder

```
src/
├── app/            start-up wiring: providers, query client, navigation
├── core/           shared building blocks (no feature knowledge)
├── services/tmdb/  everything TMDb-specific, in one place
├── features/       movies · search · showtimes · seating · trailer
├── mocks/          mock catalog, design artwork, fake latency
└── test/           MSW server, fixtures, render helper
```

### 4.1 `src/app/` — composition root

| File | What it does |
|---|---|
| `App.tsx` | Root component: providers → status bar → `NavigationContainer` (theme + deep links) → `RootStack`, with `AnimatedSplash` on top until it finishes |
| `AnimatedSplash.tsx` | In-app splash (see §4.1a) |
| `AppProviders.tsx` | Gesture root → safe areas → **persisted query client**; wires network status into the query library on mount |
| `queryClient.ts` | Default query behaviour (retry rules, offline pause) and **what gets saved to disk** |
| `cachePolicy.ts` | How long each kind of data is fresh / kept on disk |
| `navigation/` | Navigators, typed route params, tab bar, deep links, orientation |
| `screens/ComingSoonScreen.tsx` | Placeholder for the Dashboard / Media Library / More tabs |

```tsx
// AppProviders.tsx (simplified)
const [client] = useState(() => queryClient ?? createQueryClient());
useEffect(() => wireOnlineManager(), []);          // NetInfo → online/offline

<GestureHandlerRootView>
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <PersistQueryClientProvider client={client} persistOptions={persistOptions}>
      {children}
```

#### Navigation (`app/navigation/`)

```
RootStack                       (native stack, all headers hidden)
├── Tabs                        (custom AppTabBar; left rail on wide screens)
│   ├── Dashboard / MediaLibrary / More   → ComingSoonScreen
│   └── Watch → WatchStack
│         ├── WatchHome
│         ├── Search          (fade)
│         └── SearchResults   { query } | { genreId, genreName }
├── MovieDetail   { movieId }
├── Showtimes     { movieId }
├── SeatMap       { movieId, showtimeId }
└── Trailer       { videoKey, title }   full-screen modal, landscape
```

| File | Purpose |
|---|---|
| `types.ts` | Param lists + typed screen props (`RootStackScreenProps`, `WatchStackScreenProps`) |
| `RootStack.tsx` / `Tabs.tsx` / `WatchStack.tsx` | The three navigators above |
| `AppTabBar.tsx` | Dark rounded tab bar; becomes a vertical rail when width > 840; hides with the Android keyboard |
| `linking.ts` | `cinebook://` deep links (+ dev-only `-devInitialUrl` launch arg on iOS) |
| `orientation.ts` | Every screen follows the device; only the Trailer is forced to landscape |

**Tab bar safe areas.** Bottom bar: on iOS it may extend under the thin home indicator; on Android it always stays fully above the system navigation (3-button bar). Side rail: it widens by the left safe inset only where hardware really is (Android reports it one-sided; on iOS the app asks the native `InterfaceOrientation` module whether the Dynamic Island is on the left — `core/layout/useRailLeftInset.ts`). Screens beside the rail don't pad for that inset again.

Screens 01–04 are inside the Watch tab (tab bar visible); 05–07 and the trailer sit on the root stack, so they cover the tab bar — exactly like the design. Only **ids** are passed between screens; data is re-read from the cache.

### 4.1a Splash (`app/AnimatedSplash.tsx`)

1. **Native launch screen** — `#0C0F17` with the 128×126 mark centred (Android: window background + Android 12 splash; iOS: `LaunchScreen.storyboard`; iOS React root view also painted `#0C0F17`).
2. **AnimatedSplash** starts on the same frame, using the same artwork as **native image resources** (`{ uri: 'splash_mark' }` — Android drawables / iOS asset catalog), so it's on screen instantly. Nothing opaque renders until both images have loaded (1.5 s timeout fallback), so there's no blank frame.
3. ~1.8 s on the UI thread: mark rises 29 pt with a spring pop and a soft radial glow → "CineBook" wordmark slides in 24 pt below → hold → everything scales to 1.12 and fades out. Reduce motion → plain fade.
4. The app (`NavigationContainer`) mounts underneath as soon as the splash is opaque, so data loads during the animation.

### 4.2 `src/core/` — shared building blocks

| Folder | Contents |
|---|---|
| `api/` | `createHttpClient` (generic, API-agnostic) and `ApiError` |
| `config/` | `appConfig`: `language`, `useMockData`, `upcomingWindowDays` |
| `theme/` | Design tokens: `colors`, `typography` (+`fontFamily`), `spacing`, `radii`, `elevation` |
| `layout/` | `sizeClassFor` (compact/medium/expanded), `columnsFor`, `useResponsive`, `useLayoutWidth`, `useRailLeftInset` |
| `network/` | `wireOnlineManager` (NetInfo → TanStack), `useIsOnline` |
| `storage/` | MMKV instance + the synchronous query persister |
| `format/` | Date helpers (`formatLongDate`, `formatShortDate`, `addDays`, `toIsoDate`) |
| `hooks/` | `useDebouncedValue` |
| `types/` | `ImageSource = { uri } \| bundled asset` |
| `ui/` | Shared components (below) |

#### The generic HTTP client (`core/api/httpClient.ts`)

A request is **data**, not code:

```ts
interface Endpoint<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;                 // relative to baseUrl
  params?: QueryParams;         // undefined/null dropped
  body?: unknown;
  schema: ZodType<T>;           // response is validated against this
}

const client = createHttpClient({ baseUrl, headers, parseServerError });
const data = await client.request(endpoint, signal);
```

Every failure becomes one `ApiError` with a `kind`:

| `kind` | When |
|---|---|
| `network` | request never reached the server |
| `http` | error status **or** an error body (e.g. TMDb `{ success:false, status_message }`) — carries `status` and `code` |
| `parse` | not JSON, or didn't match the schema |
| `aborted` | cancelled because a newer request replaced it |

Headers are never put into error messages (no token leaks).

#### Design tokens (`core/theme/`)

No component hard-codes a colour or font size. Examples:

```ts
colors.primary          // #61C3F2  buttons, selected chip, accents
colors.textPrimary      // #202C43
colors.surfaceInverse   // #2E2739  tab bar
typography.subtitle     // Poppins-Medium 16/20
spacing.xl              // 20  screen gutter
radii.lg                // 10  cards, buttons
```

Font weight is chosen by **family name** (`Poppins-SemiBold`), never `fontWeight`, because Android ignores `fontWeight` on custom fonts.

#### Shared UI (`core/ui/`)

| Component | Role |
|---|---|
| `AppText` | Text with a typography variant + colour |
| `Icon` / `IconButton` | 24-grid SVG icon set; 44×44 accessible icon buttons |
| `Button` | 50-tall primary/outline; leading icon; loading/disabled |
| `SearchField` | 52-tall pill input; clear (×) only when there's text |
| `Chip` | `genre` (coloured pill) / `selectable` (date chip with glow) |
| `ZoomButton` | 28-pt white circle for the seat map |
| `AppHeader` | Every screen's header: left title, centred title+subtitle, back, trailing actions, transparent-over-hero, or custom content |
| `ScreenScaffold` | Header + body + sticky footer with safe areas |
| `ResponsiveGrid` | Grid whose column count comes from the measured width |
| `StateView` | One component for `loading` / `empty` / `error` / `offline` |
| `Skeleton`, `OfflineBanner`, `Divider`, `SectionHeader`, `AppImage`, `GradientOverlay` | Supporting pieces |

### 4.2a `src/native/` — app-level native module

`NativeInterfaceOrientation` (TurboModule, iOS only; `ios/CineBook/RCTInterfaceOrientation.mm`, registered via `codegenConfig` in `package.json`). Returns the window scene's interface orientation in degrees (90 = Dynamic Island on the left). Exists because iOS reports equal left/right safe-area insets in landscape. Not implemented on Android (returns `null` there).

### 4.3 `src/services/tmdb/` — the only place TMDb details live

| File | What's in it |
|---|---|
| `config.ts` | Base URLs, token (from `.env`), fixed params (`include_adult`, `sort_by`, `with_release_type`), image sizes |
| `client.ts` | `tmdbClient` = generic client + bearer header + TMDb error-body parsing |
| `endpoints.ts` | The operations as `Endpoint` factories |
| `schemas.ts` | zod schemas for TMDb responses (lenient: optional/nullable fields) |
| `images.ts` | `buildImageUrl(path, size)` → single-slash URL, or `null` for missing images |
| `genres.ts` | Fixed TMDb genre id → name table (the contract has no genre endpoint) |

```ts
// endpoints.ts — callers pass only what they own
tmdbEndpoints.upcomingMovies({ page, minDate, maxDate })
// → GET /discover/movie?include_adult=false&include_video=false&language=en-US
//       &page=…&sort_by=popularity.desc&with_release_type=2|3
//       &release_date.gte=…&release_date.lte=…

tmdbEndpoints.searchMovies({ query, page })   // GET /search/movie
tmdbEndpoints.moviesByGenre({ genreId, page })// GET /discover/movie?with_genres=…
tmdbEndpoints.movieDetails(id)                // GET /movie/{id}?language=en-US
tmdbEndpoints.movieVideos(id)                 // GET /movie/{id}/videos?language=en-US
tmdbEndpoints.movieImages(id)                 // GET /movie/{id}/images
```

Dependent endpoints throw before any request if the movie id isn't a positive integer.

> Rule: **don't put URLs, parameter names or TMDb constants in features.** Add them here.

### 4.4 `src/features/` — one folder per feature

Every feature follows the same shape:

```
features/<name>/
├── domain/        types.ts, <Name>Repository.ts (interface), pure functions
├── data/          index.ts (picks mock vs TMDb), mock…Repository.ts, tmdb…Repository.ts,
│                  mappers.ts, queryKeys.ts
└── presentation/  screens/, components/, hooks/
```

#### `movies/`

| File | Purpose |
|---|---|
| `domain/types.ts` | `Movie`, `MovieDetail`, `Genre`, `Video`, `Page<T>` |
| `domain/MoviesRepository.ts` | `getUpcoming`, `getDetail`, `getVideos`, `getGenres` |
| `domain/upcomingDateRange.ts` | Today → today + 180 days |
| `data/mappers.ts` | TMDb JSON → domain types (empty strings → `null`, image paths → URLs, key-less videos dropped) |
| `data/tmdbMoviesRepository.ts` | Calls `tmdbEndpoints`; detail fetches details + images **in parallel**, images optional |
| `data/mockMoviesRepository.ts` | Same interface over `mocks/catalog.ts` |
| `data/queryKeys.ts` | Cache keys incl. language and date window |
| `presentation/hooks/` | `useUpcomingMovies`, `useMovieDetail`, `useMovieTrailer`, `useGenreNames`, `cachedMovies` |
| `presentation/screens/` | `WatchHomeScreen` (01), `MovieDetailScreen` (05) |
| `presentation/components/` | `MovieHeroCard`, `MediaListItem` |

```ts
// tmdbMoviesRepository.getDetail — parallel, images may fail
const [details, images] = await Promise.all([
  tmdbClient.request(tmdbEndpoints.movieDetails(id), signal),
  tmdbClient.request(tmdbEndpoints.movieImages(id), signal)
    .catch(err => { if (isAborted(err)) throw err; return null; }),
]);
return toMovieDetail(details, images);   // backdrop falls back to images.backdrops[0]
```

`useMovieDetail` shows the movie **instantly** if it's already in any cached list (placeholder data), then fills in genres/runtime when details arrive.

#### `search/`

| File | Purpose |
|---|---|
| `domain/` | `Category` type, `SearchRepository` (`search`, `getByGenre`, `getCategories`) |
| `data/mockCategories.ts` | The 10 genre tiles from the design (local artwork, TMDb genre ids) |
| `data/queryKeys.ts` | `livePage` (typing, page 1) vs `results` (paginated) keys; `normaliseTerm()` |
| `presentation/hooks/useMovieSearch.ts` | Live search — see below |
| `presentation/hooks/useSearchResults.ts` | Infinite query for screen 04 |
| `presentation/screens/` | `SearchScreen` (02/03), `SearchResultsScreen` (04) |
| `presentation/components/` | `GenreTile`, `MovieResultsList` |

**Why results never go stale** (`useMovieSearch`):

```ts
const current = normaliseTerm(input);                 // trim + lowercase
const term = useDebouncedValue(current, 300);         // 300 ms debounce
const query = useQuery({
  queryKey: searchKeys.livePage(term),                // one cache entry per term
  queryFn: ({ signal }) => searchRepository.search(term, 1, signal), // cancellable
  enabled: term.length > 0 && isOnline,
});
const isCurrent = term === current;
const results = offlineResults ?? (isCurrent ? query.data?.results : undefined);
```

Results are only shown when they belong to what's typed **right now**; superseded requests are cancelled; offline it filters movies already in the cache.

#### `showtimes/` (mock only)

`ShowtimesRepository` → dates (10 days from max(today, release)) and showtimes (3 on weekdays, 5 on weekends, prices/halls from a slot table). `ShowtimesScreen` (06) selects the first date and auto-selects the first showtime of each day; `ShowtimeCard` renders a mini seat map.

#### `seating/` (mock only)

| File | Purpose |
|---|---|
| `domain/createSeatLayout.ts` | Pure, **seeded** generator of the design's hall: left/centre/right blocks (5/14/5 columns), curved shape via empty cells, VIP back row, ~45% sold |
| `domain/seatSelection.ts` | Reducer: toggle / remove / clear; rejects taken seats; max **8**; `totalPrice()` |
| `presentation/components/seatMetrics.ts` | Seat size derived from available width (fits any orientation) |
| `SeatGrid.tsx` | Pure renderer — used **both** for the showtime-card preview and the full map |
| `SeatMap.tsx` | Interactive viewport: pinch 1–3×, pan, ± buttons, scroll indicator — on the UI thread (Gesture Handler 3 + Reanimated) |
| `SeatGlyph`, `ScreenCurve`, `SeatLegend`, `SelectedSeatPill`, `PriceSummaryBar` | Pieces of screen 07 |
| `screens/SeatMapScreen.tsx` | Screen 07; side panel layout on wide screens |

```ts
// seatSelection.ts
toggle(seat):
  taken            → rejection 'taken'
  already selected → deselect
  8 selected       → rejection 'limit'
  else             → select
```

#### `trailer/`

| File | Purpose |
|---|---|
| `domain/pickTrailer.ts` | Official YouTube Trailer → Trailer → official Teaser → Teaser, newest first; `null` hides the button |
| `presentation/screens/TrailerScreen.tsx` | Full-screen landscape player; autoplay; ended → back; ✕ to close; error/offline views |

**Autoplay note:** `react-native-youtube-iframe`'s `play` prop never reaches the player (JSON vs plain-string message mismatch, and Android WebView dispatches messages on `document`). The screen injects a small script into the player page that calls `player.playVideo()` once YouTube's player is ready.

### 4.5 `src/mocks/`

| File | Contents |
|---|---|
| `catalog.ts` | The six movies from the design (real TMDb ids, genres, verified YouTube trailer keys) |
| `images.ts` | `require()`s of the design artwork in `assets/images/mock/` |
| `delay.ts` | `mockDelay(signal)` — fake latency (currently 0) that honours cancellation |

Mock data is **never saved to disk** (bundled image ids change between builds).

### 4.6 `src/test/` and tests

| Path | Purpose |
|---|---|
| `test/msw/` | MSW server + default TMDb handlers; any un-mocked request fails the test |
| `test/fixtures/movies.ts` | Raw TMDb-shaped payloads |
| `test/renderWithProviders.tsx` | Renders with safe areas + a fresh query client (async — always `await`) |
| `jest.setup.js` | Mocks for native modules (NetInfo, MMKV/Nitro, FastImage, YouTube player, safe-area, Worklets) |

What's tested: seat layout + selection + pricing, trailer picking, dates, layout maths, the HTTP client, **exact TMDb query params per endpoint**, mapping, offline screens, trailer autoplay/ended/error. (The whole-app render test is skipped — it hangs under Jest.)

---

## 5. State, caching & offline

| Concern | How |
|---|---|
| Server data | TanStack Query (all screens via hooks) |
| Saved to disk | MMKV via `PersistQueryClientProvider`; restored at launch |
| Freshness | Upcoming 1 h · details/videos 24 h · search 5 min |
| Kept on disk | 7 days (search: 1 day); only successful queries; version-tagged buster (`v4`) |
| Never on disk | Mock data, and any query whose data embeds **bundled images** (`meta: { persist: false }`, e.g. genre tiles) — bundled image ids change with every JS bundle |
| Offline | NetInfo → `onlineManager`; queries **pause** (don't fail) and resume on reconnect |
| Offline UI | Saved data + "Offline, showing saved results" banner; nothing saved → offline screen with Retry (never an endless spinner) |
| Images offline | FastImage disk cache (images already seen) |
| Retries | 2, except parse errors and 404 |
| Local UI state | `useState` / `useReducer` (e.g. seat selection) |

---

## 6. Responsive layout

| Size class | Width | Examples |
|---|---|---|
| compact | < 600 | phone portrait |
| medium | 600–840 | phone landscape, small tablet |
| expanded | > 840 | tablet landscape (tab bar becomes a left rail) |

Columns come from the **measured** container width: `columnsFor(width, minItemWidth, gap, max)`. Detail and seat map switch to two panes from *medium*.

---

## 7. Common tasks

**Add a TMDb call**
1. Add the response schema to `services/tmdb/schemas.ts`.
2. Add an `Endpoint` factory to `services/tmdb/endpoints.ts` (fixed params from `tmdbConfig`).
3. Add a method to the feature's repository interface (`domain/`), implement it in both the TMDb and mock repositories, and map the DTO in `mappers.ts`.
4. Add a cache key in `queryKeys.ts` and a hook in `presentation/hooks/`.
5. Test the exact params with MSW (see `services/tmdb/__tests__/tmdbEndpoints.test.ts`).

**Add a screen**
1. Add the route + params to `app/navigation/types.ts` and register it in the right stack.
2. Build it with `ScreenScaffold` + `AppHeader`; get data only through hooks.
3. Handle every state with `Skeleton` / `StateView` / `OfflineBanner`.

**Switch to real data** — set `USE_MOCK_DATA=false` in `.env`, rebuild, run `npm run tmdb:smoke`.

---

## 8. Gotchas

- `.env` changes need a **native rebuild**, not just a Metro reload.
- Babel: `react-native-worklets/plugin` must stay **last**; `@babel/plugin-transform-export-namespace-from` is required for zod 4.
- No Expo — it doesn't compile on the installed Xcode. Images use FastImage.
- Fonts: pick weight with `fontFamily.*`; after adding a font run `npx react-native-asset`.
- iOS build fails with "resource fork … detritus"? Build into the default DerivedData (`npm run ios`), not inside `~/Documents`.
- Android "Unable to load script" with only Gradle warnings? Usually the emulator lost networking — cold boot it.
- Native changes (splash assets, launch screen, `InterfaceOrientation` module, Info.plist) need `npm run pods` (iOS) and a native rebuild.
- Don't persist data that references `require()`d images — it renders blank after the next bundle.
