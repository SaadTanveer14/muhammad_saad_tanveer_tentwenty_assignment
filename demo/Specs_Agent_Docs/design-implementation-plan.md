# Movie Booking App: Dynamic Design Implementation Plan

## 0. Source notes

- The two SVGs (`01.svg`, `02.svg`) are screens, not the design system. Their text is converted to outlines, so no font names or type styles could be read from them.
- Colors were extracted from SVG code and sampled from the JPGs.
- JPGs are @2x. All dimensions below are halved to **1x points on a 375pt-wide frame**.
- If your design system file uses different token names, keep your names and map these values onto them.

---

## 1. Screens in scope

| # | Screen | Source file |
|---|---|---|
| 1 | Watch home (hero feed) | `01.svg` |
| 2 | Genre browse grid | `02.svg` |
| 3 | Search with live results and keyboard | `03_2x.jpg` |
| 4 | Search results ("3 Results Found") | `04_2x.jpg` |
| 5 | Movie detail | `05_2x.jpg` |
| 6 | Date and showtime picker | `06_2x.jpg` |
| 7 | Seat selection | `07_2x.jpg` |

Most screens share one scaffold: a `#F6F6FA` page background and a white header separated by a 1pt `#EFEFEF` line. The movie detail screen (5) is the exception: its header is transparent and overlays the full-bleed hero image.

---

## 2. Design tokens

Every component reads from tokens. **No raw hex values or font sizes inside components.**

### 2.1 Colors

| Token | Value | Used for |
|---|---|---|
| `color.bg.page` | `#F6F6FA` | Screen background |
| `color.bg.surface` | `#FFFFFF` | Headers, bottom panels, seat legend panel |
| `color.bg.input` | `#F2F2F7` | Search field, unselected date chips |
| `color.bg.muted` | `#F6F6F6` | Seat pill, total price box |
| `color.bg.navbar` | `#2E2739` | Bottom tab bar |
| `color.border.subtle` | `#EFEFEF` | Header divider, search border, section dividers |
| `color.text.primary` | `#202C43` | Titles, headings, icons |
| `color.text.secondary` | `#827D88` | Inactive tab labels, meta text |
| `color.text.tertiary` | ~`#A0A0A8` *(confirm in DS)* | Genre subtitle, overview body |
| `color.text.onDark` | `#FFFFFF` | Text on hero images and navbar |
| `color.brand.primary` | `#61C3F2` | CTAs, selected chip, "more" dots, selected card border |
| `color.accent.teal` | `#15D2BC` | Genre chip |
| `color.accent.pink` | `#E26CA6` | Genre chip |
| `color.accent.purple` | `#564CA3` | Genre chip, VIP seat |
| `color.accent.gold` | `#CD9C0F` | Genre chip, selected seat |
| `color.seat.unavailable` | `#CECED0` | Taken seats |
| `color.control.scrollbar` | `#B6B8C4` | Seat map scroll indicator |

**Semantic aliases** (so seats can be restyled without touching genres):

```
seat.selected  → accent.gold
seat.vip       → accent.purple
seat.regular   → brand.primary
seat.taken     → seat.unavailable
```

### 2.2 Typography

Typeface: **Poppins** (status bar and keyboard are system UI). Sizes below are measured from the mockups; confirm against your DS.

| Token | Size / Weight | Where |
|---|---|---|
| `type.h1` | 18 / Medium | "Genres", "Overview", "Date", "Watch" header |
| `type.h2` | 17 / Medium | Nav title "The King's Man", "3 Results Found" |
| `type.title` | 16–17 / Medium | Result row title, hero card title, hero date |
| `type.button` | 15 / SemiBold | Primary and outline buttons |
| `type.body` | 13 / Regular, line height 19 | Overview paragraph, legend labels |
| `type.label` | 13 / Medium | Chips, date chips, "Top Results" |
| `type.caption` | 12 / Regular | Genre subtitle, showtime meta, tab labels |
| `type.micro` | 7–9 / Regular | Seat row numbers, "SCREEN" |

### 2.3 Spacing

Scale: `2, 4, 8, 10, 12, 16, 20, 24, 32, 40`

| Usage | Value |
|---|---|
| Screen gutter | 20 |
| Detail screen section gutter | 40 |
| Gap between list rows / hero cards | 20 |
| Gap between grid cells, buttons, showtime cards | 10 |
| Gap between date chips | 12 |
| Thumbnail → title gap | 20 |

### 2.4 Radius

| Token | Value | Used for |
|---|---|---|
| `radius.sm` | 8 | Date chips |
| `radius.md` | 10 | Cards, thumbnails, buttons, pills |
| `radius.pill` | 999 | Search field, genre chips |
| `radius.navbar` | 27 | Tab bar, top corners only |

The 30pt device frame radius is from the mockup and should **not** be implemented.

### 2.5 Elevation

- Selected date chip: soft blue glow (brand color, low opacity).
- Zoom buttons: light neutral shadow.
- Everything else is flat.

---

## 3. Reusable component inventory

Dimensions are at 1x. Rule of thumb: **heights are fixed, widths stretch to the parent.**

### 3.1 Primitives

| Component | Notes |
|---|---|
| `AppText(variant)` | Reads from typography tokens |
| `Icon(name, size, color)` | Single icon set |
| `Divider` | 1pt, `border.subtle` |
| `Spacer(token)` | Spacing tokens only |

### 3.2 Controls

| Component | Spec |
|---|---|
| `PrimaryButton` | 50 tall, `radius.md`, `brand.primary` fill, props: `fullWidth`, `loading`, `disabled` |
| `OutlineButton` | 50 tall, 1.5pt border, optional leading icon ("Watch Trailer") |
| `IconButton` | 44×44 hit area (back, close, more) |
| `ZoomButton` | 28 circle, white, light shadow |
| `SearchField` | 51 tall, pill, `bg.input` + `border.subtle`, leading search icon, trailing clear button shown only when text is present |
| `Chip` | `variant: genre` → 24 tall, pill, color from data. `variant: selectable` → 32 tall date chip, brand fill + shadow when selected |

### 3.3 Composites

| Component | Spec |
|---|---|
| `AppHeader` | `title`, `subtitle` (brand color), back button, trailing actions, `transparent` mode for detail hero |
| `BottomTabBar` | 4 items, ~74 tall, active white, inactive `text.secondary`, top radius 27 |
| `MovieHeroCard` | 335×180 image, bottom gradient, title inset 20 |
| `GenreTile` | Image + dark overlay + label, aspect 1.625:1 |
| `MediaListItem` | 130×100 thumbnail, 20 gap, title, genre caption, trailing "more" button. Used on screens 3 and 4 |
| `SectionHeader` | Label + divider ("Top Results") |
| `ShowtimeCard` | 249×145, mini seat map preview, time/cinema/hall above, "From 50$ or 2500 bonus" below, brand border when selected |
| `SeatMap` | Renders from `SeatLayout`, props: `scale`, `interactive` |
| `SeatLegend` | 2×2 grid of seat type + label |
| `SelectedSeatPill` | 30 tall, `bg.muted`, `radius.md`, ✕ to deselect |
| `PriceSummaryBar` | Total box (108×50) + `PrimaryButton` (216×50) |

### 3.4 Layouts

| Component | Role |
|---|---|
| `ScreenScaffold` | Header, scroll body, optional sticky footer, tab bar, safe areas |
| `ResponsiveGrid(minItemWidth)` | Computes columns from available width |

> **Key reuse:** `SeatMap` renders both the tiny preview inside `ShowtimeCard` and the full interactive map on screen 7. Only `scale` and `interactive` change.

---

## 4. Making it dynamic (data-driven)

### 4.1 Models

```
Movie      { id, title, genres[], posterUrl, backdropUrl, releaseDate, overview, trailerUrl }
Genre      { id, name, imageUrl, colorToken }
Showtime   { id, startTime, cinema, hall, priceFrom, bonusFrom, layoutId }
SeatLayout {
  screenLabel,
  sections[{
    id,
    rows[{
      label,
      seats[{ id, number, type: regular | vip, status: free | taken }]
    }]
  }]
}
```

### 4.2 Rules

- **Genre chip color** comes from `genre.colorToken`. If missing, cycle `[teal, pink, purple, gold]` by index. No hex values in the component.
- **Seat map** is built entirely from `SeatLayout`. Sections become left, center and right blocks with an aisle gap. Missing seats are empty cells, so the curved outline in the design comes out naturally.
- **Pricing** is looked up per seat type; the total is computed from selected seats.
- **Selected seat pill**: one pill per selected seat (e.g. "4 / 3 row"); ✕ deselects that seat.
- **Search** is debounced (~300 ms). Screen 3 shows live "Top Results" while the keyboard is open; "Go" navigates to screen 4 with an "N Results Found" count.
- **States** (not in the mockups, add to the spec now): loading skeletons, empty state ("No results"), error state with retry.

---

## 5. Portrait and landscape behavior

Decide layout by **available width, not orientation**, so the same rules cover tablets and split screen.

| Breakpoint | Width |
|---|---|
| Compact | < 600 |
| Medium | 600–840 |
| Expanded | > 840 |

| Screen | Compact (phone portrait) | Medium / Expanded (landscape, tablet) |
|---|---|---|
| Watch home | 1 column of hero cards | Grid, `minItemWidth ≈ 320`, hero aspect locked ~1.86:1 |
| Genre browse | 2 columns | 3–5 columns, same tile aspect (1.625:1) |
| Search / results | List rows | 2-column list, thumbnail size fixed |
| Movie detail | Hero stacked above info | Two panes: hero + CTAs left (~45%), genres + overview right, independent scroll |
| Showtimes | Horizontal carousels | Same carousels, more cards visible, CTA pinned bottom-right (max width 360) |
| Seat selection | Map above legend and summary | Map left filling height; legend, pills and price in a 320-wide right panel |
| Tab bar | Bottom bar | Navigation rail on the left (expanded) |

### Cross-cutting rules

- Reading text (overview) never exceeds ~720 wide.
- Images use aspect ratios, not fixed heights.
- Respect left and right safe areas in landscape (notch moves to the side).
- Seat map is pinch-zoomable and pannable; +/- buttons step through the same zoom scale.
- In landscape the keyboard takes most of the screen, so search results must scroll above it.

---

## 6. Build order

1. **Tokens and theme** (colors, type, spacing, radius), structured for light and dark mode even if only light ships.
2. **Primitives and controls**, each with a preview/story in every state.
3. **Layout**: `ScreenScaffold`, `AppHeader`, `BottomTabBar`, `ResponsiveGrid`.
4. **Composites**, with `SeatMap` last (most complex).
5. **Screens**, wired to mock data first, then the API.
6. **Breakpoint pass**: test every screen at widths 375, 667 (landscape phone), 834 and 1194.

---

## 7. Design issues to raise with the designer

- "Timless" is a typo for "Timeless".
- Screen 6 says "In Theaters December 22, 2021", but screen 7 books March 5, 2021.
- Confirm the seat pill format ("4 / 3 row") means seat / row.
- Overview text uses Title Case on every word, which will look wrong with real API text. Render as sentence case from data.
