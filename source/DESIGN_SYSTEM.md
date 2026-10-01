# CineBook Design System

The single reference for how CineBook looks. Every screen and component should be built from the tokens and patterns below. If a design needs something that isn't here, add it here **and** in `src/core/theme` in the same change.

**Source of truth:** [Figma — CineBook](https://www.figma.com/design/bwVy4ys5LCKoo27Uvr4UMV/Untitled?node-id=1-2010&m=dev)

| Frame | Node | Screen |
| --- | --- | --- |
| Guide | `1:2010` | Font + colour palette |
| 01 | `1:1809` | Watch — upcoming movies list |
| 02 | `1:1910` | Search — genre/category grid |
| 03 | `1:1970` | Search — typing, top results |
| 04 | `1:1856` | Search — results found |
| 05 | `1:1380` | Movie detail |
| 06 | `1:1415` | Date & hall selection |
| 07 | `1:1452` | Seat map & checkout |

Artboards are 375 × 812 (iPhone X). Designs are drawn at 1×. Build layouts with flex and `useResponsive`, not fixed positions.

---

## 1. Rules

1. **Tokens only.** Colours, spacing, radii and type come from `core/theme` (`colors`, `spacing`, `radii`, `typography`). No raw hex values or font names in feature code.
2. **Text is always `AppText`** with a `variant`. Change `color` with the prop, never with a new font size.
3. **Pick weight with the font family, not `fontWeight`.** Poppins is a separate file per weight. `fontWeight` plus a custom family falls back to the system font on Android. Use `typography.*` or `fontFamily.*`.
4. **4 pt grid.** Spacing values come from `spacing`. When Figma uses an off-grid value (10, 11, 15), round it to the nearest token.
5. **Non-content states** (loading, empty, error, offline) always go through `StateView`, styled with these tokens.
6. **Poster and backdrop images are data**, not bundled assets. Load them from TMDb with `@d11/react-native-fast-image`, clip them to `radii.lg`, and keep text readable with a scrim or gradient.

---

## 2. Typography

**Font: Poppins** ([Google Fonts](https://fonts.google.com/specimen/Poppins), OFL; license in `assets/licenses/`).

The files live in `assets/fonts/` and are linked natively by `npx react-native-asset`, configured in `react-native.config.js`. Android copies them into `android/app/src/main/assets/fonts`. iOS lists them under `UIAppFonts` and adds them to the Xcode project. **After adding a weight, re-run `npx react-native-asset` and rebuild the app.**

| `fontFamily.*` | PostScript name |
| --- | --- |
| `regular` | `Poppins-Regular` |
| `medium` | `Poppins-Medium` |
| `semibold` | `Poppins-SemiBold` |
| `bold` | `Poppins-Bold` |

### Type scale (`typography`)

| Variant | Family | Size / line height | Tracking | Used for (Figma) |
| --- | --- | --- | --- | --- |
| `display` | Bold | 24 / 30 | — | Large hero headings (reserved) |
| `title` | Medium | 18 / 22 | — | Movie title on list card (01) |
| `subtitle` | Medium | 16 / 20 | — | Header titles, section headings ("Genres", "Overview", "Date"), category tile labels, result row titles, release line on detail |
| `amount` | SemiBold | 16 / 20 | 0.2 | Price ("$ 50") |
| `body` | Regular | 14 / 20 | — | Search input text & placeholder |
| `button` | SemiBold | 14 / 20 | 0.2 | Button labels |
| `paragraph` | Regular | 12 / 19 (1.6) | — | Long-form copy (overview) |
| `caption` | Medium | 12 / 15 | — | "Top Results", result genre, seat legend, hall/time meta |
| `chip` | SemiBold | 12 / 20 | — | Genre tags, date chips |
| `label` | Regular | 10 / 12 | -0.2 | "Total Price", "3 row", tab bar labels |

Titles in the designs are rendered in title case (Figma `capitalize`). Format the data rather than applying a text transform on long-form copy.

---

## 3. Colour

### Palette (Guide frame)

| Swatch | Hex | `palette.*` |
| --- | --- | --- |
| Dark purple | `#2E2739` | `navy700` |
| Off-white | `#F6F6FA` | `grey50` |
| Mid grey-purple | `#827D88` | `grey700` |
| Sky blue | `#61C3F2` | `blue` |
| Light grey | `#DBDBDF` | `grey300` |
| Teal | `#15D2BC` | `teal` |
| Pink | `#E26CA5` | `pink` |
| Indigo | `#564CA3` | `purple` |
| Mustard | `#CD9D0F` | `gold` |

Also used on the screens: ink `#202C43` (all dark text), `#F2F2F6` (search field), `#EFEFEF` (hairlines), `#A6A6A6` (chips/unavailable), `#8F8F8F` (paragraph text).

### Semantic tokens (`colors`) — use these

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#F6F6FA` | Screen background |
| `surface` | `#FFFFFF` | Headers, bottom sheets, detail body |
| `surfaceMuted` | `#F2F2F6` | Search field fill |
| `surfaceInverse` | `#2E2739` | Bottom tab bar |
| `textPrimary` | `#202C43` | Default text |
| `textSecondary` | `#827D88` | Secondary meta text |
| `textMuted` | `#8F8F8F` | Paragraphs, seat legend |
| `textDisabled` | `#DBDBDF` | Genre caption under result titles |
| `textInverse` | `#FFFFFF` | Text on images, filled buttons, tab bar |
| `placeholder` | `rgba(32,44,67,0.3)` | Input placeholder |
| `primary` | `#61C3F2` | Primary buttons, selected chip, active outlines, "more" dots, subtitle accents |
| `primaryGlow` | `rgba(35,170,235,0.27)` | Glow under selected date chip |
| `border` | `#DBDBDF` | Dividers between list sections |
| `divider` | `#EFEFEF` | Header bottom hairline, input border |
| `chip` | `rgba(166,166,166,0.1)` | Unselected chip / info box fill |
| `imageScrim` | `rgba(0,0,0,0.3)` | Overlay on category tile images |
| `overlay` | `rgba(0,0,0,0.6)` | Modal backdrops |
| `success` | `#15D2BC` | Positive state |
| `danger` | `#E4505F` | Errors (not in Figma; app-defined) |
| `skeleton` | `#EFEFEF` | Loading placeholders |
| `genre[i]` | teal, pink, indigo, mustard | Genre tag backgrounds, cycled by index |

### Seat map (`colors.seat`)

| Status | Colour | Legend label |
| --- | --- | --- |
| `available` | `#61C3F2` | Regular (price) |
| `vip` | `#564CA3` | VIP (price) |
| `selected` | `#CD9D0F` | Selected |
| `taken` | `#A6A6A6` @ 50% | Not available |
| `wheelchair` | `#15D2BC` | Not in Figma; app-defined, must stay distinct from `available` |
| `blocked` | `#EFEFEF` | Not in Figma; gaps / unusable |

---

## 4. Spacing, radii, elevation

**Spacing (`spacing`)** is on a 4 pt grid: `xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 · huge 40`.

| Where | Value |
| --- | --- |
| Screen horizontal gutter | `xl` (20) |
| Gap between list cards | `xl` (20) |
| Gap in 2-column category grid | `sm`/`md` (design: 10) |
| Gap between date chips | `md` (12) |
| Gap between genre tags | `xs` (4) (design: 5) |
| Detail body side padding | `huge` (40) |

**Radii (`radii`)**

| Token | Value | Use |
| --- | --- | --- |
| `sm` | 4 | Seat glyphs |
| `lg` | 10 | Cards, images, buttons, chips, info boxes |
| `xl` | 16 | Genre tags |
| `sheet` | 27 | Top corners of the bottom tab bar |
| `pill` | 999 | Search field (design: 30 on a 52 pt field), round icon buttons |

**Elevation**
- Hall card, selected: 1 pt `primary` border plus shadow `0 1 4 rgba(0,0,0,0.25)`.
- Selected date chip: glow `0 0 10.5 primaryGlow`.
- Headers: no shadow; a 1 pt `divider` bottom border on a `surface` background.

---

## 5. Components

Specs come from the Figma frames. Reuse `core/ui` components where they exist (`AppText`, `Button`, `Screen`, `StateView`, `Skeleton`, `OfflineBanner`). New shared pieces go in `core/ui`; feature-specific pieces go in `features/<name>/presentation/components`.

### Header (01, 04, 06, 07)
- White `surface` with a `divider` bottom border. Content sits below the safe area.
- **Title**: `subtitle`, `textPrimary`. Left-aligned on the list screen, with a 36 pt search icon button on the right.
- **With back button** (04–07): 30 pt chevron, 15 pt gap, then the title.
- **Centred variant** (06, 07): the title (`subtitle`) with a line below it in `caption` and `primary` (e.g. "In Theaters December 22, 2021", "March 5, 2021 | 12:30 Hall 1").

### Movie card (01)
- Full width minus the gutters, **180 pt tall**, `radii.lg`, image cover.
- Bottom 70 pt gradient from transparent to `#000`.
- Title in `title`, `textInverse`, 20 pt inset from the left and bottom.
- Cards 20 pt apart.

### Search field (02–03)
- Height 52, `surfaceMuted` fill, 1 pt `divider` border, `radii.pill`.
- Search icon on the left; clear (×) icon on the right when there's text.
- Input in `body`; placeholder in `placeholder` ("TV shows, movies and more").

### Category tile (02)
- 2-column grid, **100 pt tall**, `radii.lg`, image cover with an `imageScrim` overlay.
- Label in `subtitle`, `textInverse`, bottom-left inset of about 10 pt.

### Result row (03–04)
- Thumbnail **130 × 100**, `radii.lg`, then a 20 pt gap.
- Title in `subtitle` `textPrimary`; genre below it in `caption` `textDisabled`.
- Trailing "more" dots (20 × 4) in `primary`.
- Rows 20 pt apart. The section label ("Top Results", `caption`) sits above a `border` divider.

### Movie detail hero (05)
- Backdrop about 466 pt tall, full bleed behind a transparent header, with a gradient scrim top and bottom.
- Centred, from top to bottom: title logo or title, the release line (`subtitle`, `textInverse`), then two buttons.
- **Buttons**: 243 × 50, 10 pt apart.
  - **Get Tickets**: `Button` primary.
  - **Watch Trailer**: `Button` outline, with a white label and a play glyph on the image.
- **Body**: `surface`, 40 pt side padding.
  - "Genres" (`subtitle`), then a row of genre tags.
  - A hairline divider.
  - "Overview" (`subtitle`), then the overview text in `paragraph` `textMuted`.

### Genre tag (05)
- Padding 10 × 2, `radii.xl`, background `colors.genre[i % 4]`.
- Label in `chip`, `textInverse`.

### Button (`core/ui/Button`)
- Minimum height 50, `radii.lg`, label in `button`.
- **primary**: `primary` fill, `textInverse` label.
- **outline**: 1 pt `primary` border, transparent fill.
- **Wide CTA** (06–07): full width minus the gutter (06), or 216 pt next to the price box (07).
- **States**: pressed at 0.8 opacity, disabled at 0.5.

### Date chip (06)
- Padding 16 × 6, `radii.lg`, label in `chip`.
- **Selected**: `primary` fill, `textInverse` label, `primaryGlow` shadow.
- **Unselected**: `chip` fill, `textPrimary` label.
- Horizontal scroll with a 12 pt gap.

### Hall card (06)
- About 249 × 145, `radii.lg`, `surface`, with a mini seat-map preview. Horizontal scroll with a 10 pt gap.
- **Above the card**: time in `caption` `textPrimary`, then the hall in `caption` `textSecondary`.
- **Below the card**: "From **50$** or **2500 bonus**" in `caption` `textMuted`, with the amounts in `textPrimary` SemiBold.
- **Selected**: `primary` border plus elevation.

### Seat map (07)
- Curved "SCREEN" line in `primary`, with the label in `label` `textSecondary`.
- Row numbers down the left in `label`.
- Seats coloured by `colors.seat` and grouped by aisles.
- Zoom +/− controls: 29 pt white circles at the bottom right, plus a horizontal scroll indicator.
- **Legend**: 2 × 2 grid, each a 17 pt seat glyph plus a `caption` `textMuted` label.
- **Selected-seat pill**: `chip` fill, `radii.lg`, 30 pt tall. Contains "4 /" in `body` Medium, "3 row" in `label`, and a × to remove.
- **Footer**:
  - Price box: 108 × 50, `chip` fill, `radii.lg`, "Total Price" in `label`, amount in `amount`.
  - "Proceed to pay" `Button` primary filling the remaining width.

### Bottom tab bar (01–04)
- 75 pt tall, `surfaceInverse`, `radii.sheet` top corners.
- Four tabs: Dashboard, Watch, Media Library, More.
- Icons are 16–24 pt; labels use `label`.
- **Active tab**: white label in Poppins SemiBold.
- **Inactive tabs**: white at 54% opacity.

Figma uses Roboto for the tab bar; we use Poppins for consistency.

---

## 6. Keeping this in sync

1. **When Figma changes:** re-pull the values with the Figma MCP (`get_design_context` on the frame's node ID), then update `core/theme` and this file in the same commit.
2. **Never fork a value locally.** If a screen needs a new colour or size, add a token first.
3. **Hex values from Figma** come from exact fills in the design context or the SVG exports. Don't eyeball them from screenshots.
