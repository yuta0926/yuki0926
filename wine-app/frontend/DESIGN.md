---
name: Wine Stocker
version: 0.1.1
status: draft
updated: 2026-07-06

principles:
  - calm
  - structured
  - operational-first
  - premium-by-restraint

colors:
  background: "#F8F7F2"
  surface: "#FFFEFA"
  surface-muted: "#F4F2EC"

  primary: "#183F2D"
  primary-hover: "#123322"
  primary-soft: "#EDF2ED"

  text-primary: "#22241F"
  text-secondary: "#62655D"
  text-muted: "#8A8C84"

  border: "#E4E1D8"
  border-strong: "#D4D0C5"

  success: "#3F6B4F"
  warning: "#A56B2A"
  danger: "#A84848"
  info: "#526F7A"

wineColors:
  red:
    text: "#934444"
    background: "#FBEFEF"
    border: "#E8CACA"
  white:
    text: "#526B48"
    background: "#F0F4EC"
    border: "#CCD8C5"
  orange:
    text: "#9A682F"
    background: "#FBF1E4"
    border: "#E8CFAE"
  rose:
    text: "#A15C68"
    background: "#F9EDEF"
    border: "#E8CBD1"
  sparkling:
    text: "#7A6A35"
    background: "#F6F0DA"
    border: "#DED19A"

styleColors:
  classic:
    text: "#62645E"
    background: "#F1F1EC"
    border: "#E0E0D8"
  natural:
    text: "#456148"
    background: "#EDF2E9"
    border: "#D5DFD0"

typography:
  display:
    fontFamily: "Shippori Mincho, Yu Mincho, serif"
    fontWeight: 500
  ui:
    fontFamily: "Noto Sans JP, Hiragino Kaku Gothic ProN, Yu Gothic, sans-serif"
  scale:
    page-title:
      fontSize: "2.25rem"
      lineHeight: 1.35
      letterSpacing: "0.04em"
      fontFamily: "display"
    section-title:
      fontSize: "1.25rem"
      lineHeight: 1.5
      fontWeight: 600
      fontFamily: "ui"
    body:
      fontSize: "0.875rem"
      lineHeight: 1.7
      fontWeight: 400
      fontFamily: "ui"
    table-body:
      fontSize: "0.8125rem"
      lineHeight: 1.6
      fontWeight: 400
      fontFamily: "ui"
    label:
      fontSize: "0.75rem"
      lineHeight: 1.5
      fontWeight: 500
      fontFamily: "ui"

spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"

rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"

shadows:
  panel: "0 4px 16px rgb(38 44 38 / 5%)"
  floating: "0 8px 24px rgb(38 44 38 / 8%)"

layout:
  header-height: "88px"
  sidebar-width: "228px"
  page-padding-x: "32px"
  page-padding-y: "32px"

wineList:
  defaultView: "list"
  supportedViews:
    - "list"
    - "card"
  viewSwitcherLabels:
    list: "リスト表示"
    card: "カード表示"
  imagePolicy:
    currentRequirement: "optional"
    defaultAssumption: "no-images"
    futureMode: "image-card-view"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    color: "#FFFFFF"
    borderRadius: "{rounded.md}"
    minHeight: "44px"
  panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    borderRadius: "{rounded.lg}"
    boxShadow: "{shadows.panel}"
  table:
    headerBackground: "#FAF9F5"
    rowHoverBackground: "#FAFBF7"
    borderColor: "{colors.border}"
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border-strong}"
    focusBorderColor: "{colors.primary}"
    focusRing: "0 0 0 3px rgb(24 63 45 / 10%)"
---

# Wine Stocker Design System

## Overview

Wine Stocker is a calm, structured inventory management interface for restaurants and wine cellars.

The visual direction is **Warm Minimal Admin**: a warm ivory base, restrained deep-green accents, quiet borders, and table-first layouts. The product should feel refined and trustworthy, but never decorative at the expense of operational clarity.

The UI is not a luxury wine catalogue. It is a back-office tool with a premium finish.

## Design Principles

### Calm

Use a warm off-white background instead of pure white. Avoid high-saturation colors. The screen may contain dense information, so the base palette must reduce visual fatigue.

### Structured

Prioritize predictable information architecture:

```text
Header
Sidebar
Page title
Search/filter panel
Main data area
Pagination or secondary content
```

The user should always understand where they are, what is being filtered, and what action is primary.

### Operational First

Wine name, stock count, sale price, storage location, and producer must be easy to scan.

For management screens, table and list layouts are preferred as the default operational view. Images may be added later, and the design system should allow an alternate image-based card view without making images required.

### Premium by Restraint

Do not add heavy shadows, glossy gradients, gold-heavy luxury styling, or decorative wine imagery.

Premium quality should come from:

- consistent spacing
- thin borders
- restrained color use
- readable typography
- clear hierarchy
- calm empty states

## Color Usage

### Background and Surfaces

- `background` is used for the app canvas.
- `surface` is used for cards, panels, tables, drawers, and headers.
- `surface-muted` is used for subtle blocks, inactive states, and low-emphasis areas.

Use `surface` for most interactive containers. Avoid placing dense table content directly on `background`.

### Primary Color

`primary` is a deep forest green. Use it for:

- primary actions
- active sidebar items
- selected pagination
- focused form controls
- important links

Do not use primary as a large background except for deliberate navigation or call-to-action elements.

### Text

- `text-primary`: core labels, table values, page titles
- `text-secondary`: metadata, helper text, navigation labels
- `text-muted`: placeholders, empty states, low-emphasis captions

## Wine Badges

Wine type and style badges should be quiet visual identifiers, not strong status indicators.

### Wine Type

- Red wine uses muted burgundy.
- White wine uses soft green.
- Orange wine uses warm amber.
- Rosé uses muted rose.
- Sparkling uses muted brass.

Badges must use a tinted background, matching text color, and a subtle border.

### Style

- `Classic`: neutral gray-beige.
- `ナチュール`: soft green.

Do not use saturated green or red backgrounds for these badges.

## Typography

### Display Font

Use the display font only for:

- logo text
- page titles
- major editorial-style headings

Do not use the display font inside dense tables or forms.

### UI Font

Use the UI font for:

- navigation
- buttons
- form labels
- table headers
- table body
- helper text

### Numeric Values

Prices, stock counts, vintage, and pagination numbers should align consistently.

- Prices: right aligned
- Stock counts: right aligned
- Vintage: centered or right aligned depending on table density

## Layout

### App Shell

The app uses a fixed header and persistent sidebar on desktop.

```text
Header height: 88px
Sidebar width: 228px
Main content padding: 32px
```

On smaller screens, the sidebar may collapse into a drawer, but desktop-first inventory management is the primary target.

### Page Structure

Each page should follow this structure:

1. Page header
2. Primary actions
3. Search/filter or summary panel
4. Main content
5. Footer controls, pagination, or related records

## Components

### Header

The header contains:

- Wine Stocker logo
- primary action button
- notification icon
- help icon
- user avatar

The header background is `surface`, with a bottom border. Avoid heavy shadow.

### Sidebar

The sidebar background is `surface`.

Active navigation item:

- `primary-soft` background
- `primary` text
- `primary` left border

Inactive items use `text-secondary`. Hover state uses a very subtle muted background.

### Buttons

#### Primary Button

Use for the main action on a screen:

- 新規登録
- 保存
- 検索
- 入出庫登録

Primary buttons use `primary` background and white text.

#### Secondary Button

Use for low-risk actions:

- 戻る
- キャンセル
- 詳細
- インポート

Secondary buttons use surface background, border, and primary or secondary text.

#### Danger Button

Use only for destructive actions such as deletion.

Danger buttons should not dominate the screen. Prefer outlined danger styling unless the user is in a confirmation dialog.

### Panels and Cards

Panels are used for search filters, summaries, and detail sections.

Panel style:

- `surface` background
- `border` outline
- `lg` radius
- `panel` shadow

Avoid nesting too many bordered panels inside one another.

### Forms

Form controls should be 48px tall where possible.

Labels should be small, calm, and placed consistently. Focus state uses primary border and a subtle primary ring.

### Tables

Tables are the default presentation for list screens.

Table rules:

- header background: `#FAF9F5`
- row height: 56px minimum
- row divider: `border`
- row hover: `#FAFBF7`
- table body font: `table-body`

Column alignment:

```text
ワイン名       left
種類           left
スタイル       left
生産者         left
生産国         left
Vintage        center
売価           right
在庫本数       right
保管場所       left
アクション     center
```

### List and Card View Modes

The default wine list view is the text-first list/table view. This is the primary operational view and must prioritize fast scanning, sorting, filtering, comparing stock counts, comparing prices, and locating storage positions.

A future image-based card view may be added when wine images are available. The card view is an alternate browsing mode, not the default operational mode. It may emphasize:

- wine image
- wine name
- wine type/style badges
- producer
- country
- vintage
- sale price
- stock count
- storage location

If both views exist, the view switcher should use the same search/filter state and the same backend query. Switching views must not reset filters, pagination, or sort order unless explicitly designed.

Recommended view switch labels:

```text
リスト表示
カード表示
```

List view remains the default. Card view should gracefully handle wines with no image by using a quiet text-only fallback or a neutral placeholder; however, images must never be required to understand or operate the inventory.

### Pagination

Active page uses primary background and white text. Inactive page items use surface background and border.

Pagination should be visually quiet and placed inside or directly below the table container.

## Page Patterns

### Wine List Page

The list page is the most important operational screen.

Default recommended structure:

```text
Page title
Description
Search/filter panel
Result count
View switcher, if multiple views exist
Wine list/table view
Pagination
```

The list page should not require wine images. It should prioritize scannability and search accuracy.

#### Default List View

Use the list/table view as the default. It is best for day-to-day inventory operations because it supports comparison across many records.

The default list view should make these fields immediately visible:

- ワイン名
- 種類
- スタイル
- 生産者
- 生産国
- Vintage
- 売価
- 在庫本数
- 保管場所
- アクション

#### Optional Card View

A card view may be added later when wine images are registered. It should be treated as an optional alternate view for more visual browsing, not as the main operational interface.

Card view should follow the same design tokens and visual restraint as the list view:

- warm surface cards
- thin borders
- subtle shadows
- quiet badges
- clear text hierarchy
- no e-commerce-like presentation

Image cards should not become product sales cards. They are still inventory records.

#### View Switcher

If both list and card views are implemented, use a simple segmented control near the result count or toolbar.

```text
[リスト表示] [カード表示]
```

The selected state uses `primary` or `primary-soft`.

Changing views should preserve:

- keyword
- filters
- sort order
- pagination, unless UX testing shows page reset is clearer
- fetched data model

Implementation should separate the data container from the visual presentation:

```text
WineListPage
├── WineSearchForm
├── WineViewToggle
├── WineTableView
├── WineCardGridView
└── WinePagination
```

### Wine Detail Page

The detail page is both a record view and an operational hub.

Recommended structure:

```text
Back link + actions
Wine title + badges + stock status
Basic information
Inventory summary
Price information
Management information
Comment
Inventory history
```

Primary action should be `入出庫登録` or `編集`, depending on the final workflow.

### Wine Create/Edit Page

Use a single-column or two-column form layout.

Group fields into:

- 基本情報
- 価格情報
- 在庫・保管情報
- コメント

The save action should be sticky or clearly available at the top and bottom on long forms.

## Implementation Guidance

### Source of Truth

Use Material UI theme tokens as the source of truth for:

- colors
- typography
- component overrides
- radius
- shadows

Use Tailwind CSS mainly for:

- layout
- spacing
- responsive grids
- flex alignment
- page-level composition

Avoid defining competing color systems in both MUI and Tailwind.

### Recommended Files

```text
frontend/src/theme/theme.ts
frontend/src/index.css
frontend/src/components/common/WineBadge.tsx
frontend/src/components/layout/AppLayout.tsx
frontend/src/features/wines/components/WineTableView.tsx
frontend/src/features/wines/components/WineCardGridView.tsx
frontend/src/features/wines/components/WineViewToggle.tsx
frontend/src/features/wines/components/WineSearchForm.tsx
frontend/src/features/wines/components/WinePagination.tsx
```

### Naming

Use semantic token names instead of color names where possible:

```text
primary
surface
border
text-secondary
wine-red-bg
```

Avoid names like `green-900` or `beige-light` in component code.

## Accessibility

- Maintain visible focus styles on all inputs and buttons.
- Do not rely on color alone for critical state.
- Use readable contrast for badges and muted text.
- Ensure table actions have accessible labels.
- Keep destructive actions clearly labeled and confirmed.

## Do / Don't

### Do

- Use calm neutral surfaces.
- Keep tables readable.
- Treat list/table view as the default operational view.
- Allow an optional image-card view without requiring images.
- Use badges for quick recognition.
- Make inventory numbers easy to compare.
- Prefer quiet hierarchy over decorative effects.

### Don't

- Do not make the app look like an e-commerce wine shop.
- Do not use bottle imagery as a required part of the layout.
- Do not let card view become an e-commerce-style product catalogue.
- Do not use heavy black-and-gold luxury styling.
- Do not overuse shadows.
- Do not introduce saturated status colors unless necessary.

## Example Tailwind v4 Theme Mapping

```css
@theme inline {
  --color-app-background: var(--mui-palette-background-default);
  --color-app-surface: var(--mui-palette-background-paper);
  --color-app-primary: var(--mui-palette-primary-main);
  --color-app-primary-dark: var(--mui-palette-primary-dark);
  --color-app-primary-soft: var(--mui-palette-primary-light);
  --color-app-text: var(--mui-palette-text-primary);
  --color-app-text-secondary: var(--mui-palette-text-secondary);
  --color-app-border: var(--mui-palette-divider);

  --font-sans: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
  --font-display: "Shippori Mincho", "Yu Mincho", serif;
}
```

## Example CSS Variables

```css
:root {
  --color-background: #F8F7F2;
  --color-surface: #FFFEFA;
  --color-surface-muted: #F4F2EC;

  --color-primary: #183F2D;
  --color-primary-hover: #123322;
  --color-primary-soft: #EDF2ED;

  --color-text-primary: #22241F;
  --color-text-secondary: #62655D;
  --color-text-muted: #8A8C84;

  --color-border: #E4E1D8;
  --color-border-strong: #D4D0C5;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  --shadow-panel: 0 4px 16px rgb(38 44 38 / 5%);
  --shadow-floating: 0 8px 24px rgb(38 44 38 / 8%);

  --app-header-height: 88px;
  --app-sidebar-width: 228px;
}
```
