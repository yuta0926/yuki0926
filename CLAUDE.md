# CLAUDE.md

This file provides implementation guidance for AI coding agents working on the Wine Stocker project.

## Project Overview

Wine Stocker is a wine inventory management web application.

The application is designed as a practical back-office tool for managing wine stock, search, detail views, registration, editing, and future stock movement operations. The UI direction is text-first, calm, premium, and operational rather than image-heavy or e-commerce-like.

## Repository Structure

```text
yuki0926/
└── wine-app/
    ├── backend/
    │   ├── app/
    │   │   ├── routers/
    │   │   │   └── wines.py
    │   │   ├── __init__.py
    │   │   ├── crud.py
    │   │   ├── database.py
    │   │   ├── main.py
    │   │   ├── models.py
    │   │   └── schemas.py
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   └── wine.db
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── app/
    │   │   │   ├── providers.tsx
    │   │   │   └── router.tsx
    │   │   ├── components/
    │   │   │   ├── common/
    │   │   │   └── layout/
    │   │   │       └── AppLayout.tsx
    │   │   ├── config/
    │   │   │   └── env.ts
    │   │   ├── features/
    │   │   │   └── wines/
    │   │   │       ├── api/
    │   │   │       │   └── winesApi.ts
    │   │   │       ├── components/
    │   │   │       │   ├── WinePagination.tsx
    │   │   │       │   ├── WineSearchForm.tsx
    │   │   │       │   ├── WineTableView.tsx
    │   │   │       │   └── WineViewToggle.tsx
    │   │   │       ├── hooks/
    │   │   │       │   └── useWines.ts
    │   │   │       └── types/
    │   │   │           └── wine.ts
    │   │   ├── lib/
    │   │   │   ├── apiClient.ts
    │   │   │   └── queryClient.ts
    │   │   ├── pages/
    │   │   │   ├── NotFoundPage.tsx
    │   │   │   ├── WineCreatePage.tsx
    │   │   │   ├── WineDetailPage.tsx
    │   │   │   ├── WineEditPage.tsx
    │   │   │   └── WineListPage.tsx
    │   │   ├── theme/
    │   │   │   └── theme.ts
    │   │   ├── App.tsx
    │   │   ├── index.css
    │   │   ├── main.tsx
    │   │   └── vite-env.d.ts
    │   ├── DESIGN.md
    │   ├── Dockerfile
    │   ├── nginx.conf
    │   ├── package.json
    │   └── vite.config.ts
    │
    ├── cloudbuild.yaml
    └── CLAUDE.md
```

If the actual repository differs from this structure, inspect the current files before editing and preserve the existing organization.

## Technology Stack

### Backend

- FastAPI
- SQLAlchemy 2.x
- Supabase Postgres in production; SQLite fallback for local development (`DATABASE_URL` unset)
- Alembic for schema migrations
- Uvicorn for local development
- Cloud Run for deployment

### Frontend

- React
- Vite
- TypeScript
- React Router
- TanStack Query
- Material UI
- Tailwind CSS

### Deployment

- **Backend**: GitHub main branch push triggers Cloud Build (`wine-app/cloudbuild.yaml`) → Artifact Registry → Cloud Run service `wine-api`, region `asia-northeast1`, GCP project `billing-app-20240401`. `DATABASE_URL` is injected from Secret Manager secret `wine-db-url` (Supabase Postgres, Transaction pooler connection string).
- **Frontend**: Vercel, Git-integrated auto-deploy on push to main. Root Directory `wine-app/frontend`. Production URL: `https://yuki0926.vercel.app`. Env var `VITE_API_BASE_URL` is set in the Vercel project settings (not build-time injected via Cloud Build like before). `frontend/vercel.json` provides the SPA rewrite fallback needed for client-side routes (React Router) to resolve on direct navigation/refresh.
- The old Cloud Run frontend service (`wine-web`) has been retired; do not reference it as a live deployment target.
- Migrated from Cloud Run+SQLite to this Vercel+Supabase setup on 2026-07-14/15; see `wine-app/MIGRATION_VERCEL_SUPABASE.md` for the full migration record.

## Development Environments

There are two supported development environments:

1. **Local development**: primary mode, especially when using Claude Code.
2. **GitHub Codespaces**: secondary mode for browser-based development or temporary remote workspaces.

Claude Code is expected to run mainly on the local machine. Therefore, when giving commands or making assumptions, prefer local paths and local URLs unless the user explicitly says they are working in Codespaces.

## Local Development — Primary Workflow

Use this workflow when working from a local clone of the repository.

Assume the repository root is the local `wine-app` directory, not `/workspaces/...`.

Example local paths:

```text
/path/to/wine-app
~/projects/wine-app
C:\Users\<user>\projects\wine-app
```

When writing commands for Claude Code, prefer relative paths from the repository root.

Good:

```bash
cd backend
cd frontend
```

Avoid hard-coding Codespaces paths unless the task is explicitly Codespaces-related.

Bad for local-first instructions:

```bash
cd /workspaces/yuki0926/wine-app/backend
```

### Local Backend

Run from the repository root.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On Windows PowerShell, activation is different:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Schema is managed by Alembic. `backend/wine.db` already has the schema applied, so existing clones need no action. On a fresh clone or after deleting `wine.db`, run once before starting uvicorn:

```bash
cd backend
alembic upgrade head
```

`DATABASE_URL` is unset by default, so both uvicorn and Alembic target the local SQLite file. Set `DATABASE_URL` (e.g. to a Supabase Postgres connection string) only when you intentionally want to point local development at a remote database.

Local backend checks:

```text
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/api/wines
```

### Local Frontend

Run from the repository root.

```bash
cd frontend
npm install
npm run dev
```

Local frontend URL:

```text
http://127.0.0.1:5173/
```

Build check:

```bash
cd frontend
npm run build
```

### Local Environment Variables

Create `frontend/.env.local`.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Do not add a trailing slash.

Good:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Bad:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/
```

After changing `.env.local`, restart Vite.

### Local CORS

FastAPI should allow local frontend origins:

```python
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

If using local frontend and local backend, no Codespaces URL should be required.

### Local Claude Code Guidance

When Claude Code is used locally:

- assume local execution unless the user says Codespaces
- use relative repository paths
- do not suggest Codespaces port visibility fixes for local errors
- use `http://127.0.0.1:8000` for the backend
- use `http://127.0.0.1:5173` for the frontend
- avoid committing local `.env.local` files
- do not hard-code local absolute paths in source code

Claude Code may inspect and edit files directly, but should still follow the project structure and design guidance in this document and `frontend/DESIGN.md`.

## GitHub Codespaces Development — Secondary Workflow

Use this workflow only when the user is actively working in Codespaces.

Codespaces paths usually look like:

```text
/workspaces/yuki0926/wine-app
```

### Codespaces Backend

Run from the Codespaces repository root.

```bash
cd /workspaces/yuki0926/wine-app/backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Codespaces backend URL:

```text
https://<codespace-name>-8000.app.github.dev/api/wines
```

If the forwarded 8000 URL returns `302 Found` and redirects to `github.dev/pf-signin`, the port is private. Set port 8000 visibility to Public from the Ports tab.

### Codespaces Frontend

Run from the Codespaces repository root.

```bash
cd /workspaces/yuki0926/wine-app/frontend
npm install
npm run dev -- --host 0.0.0.0
```

Codespaces frontend URL:

```text
https://<codespace-name>-5173.app.github.dev/
```

### Codespaces Environment Variables

Create or edit `frontend/.env.local`.

```env
VITE_API_BASE_URL=https://<codespace-name>-8000.app.github.dev
```

Do not add a trailing slash. Restart Vite after changing this file.

### Codespaces CORS

FastAPI should allow the forwarded frontend origin. For Codespaces development, this regex is acceptable:

```python
allow_origin_regex=r"https://.*-5173\.app\.github\.dev"
```

For production, do not rely on broad development regexes. Use the concrete Vercel production URL through `CORS_ORIGINS`.

## Environment Variables Summary

### Local `.env.local`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Codespaces `.env.local`

```env
VITE_API_BASE_URL=https://<codespace-name>-8000.app.github.dev
```

### Production

Production frontend builds should receive the deployed backend URL during build or deployment. Do not hard-code production API URLs inside React components.

## Backend CORS Summary

Local development origins:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Codespaces development origin pattern:

```text
https://.*-5173.app.github.dev
```

Production origins:

```text
Vercel production URL only (https://yuki0926.vercel.app)
```

## Backend Implementation Guidelines

### API Design

Use `/api` as the API prefix.

Current core endpoints:

```text
GET    /api/wines
POST   /api/wines
GET    /api/wines/{id}
PATCH  /api/wines/{id}
DELETE /api/wines/{id}
```

Keep response shapes stable once the frontend depends on them.

### Wine Model Fields

The core wine data model includes:

```text
id
original_no
order_date
wine_type
style_type
name
name_kana
country
producer
grape_variety
vintage
size
retail_price
purchase_price
quantity
sale_price
location
comment
ai_check_status
created_at
updated_at
```

When adding new fields:

1. Update SQLAlchemy model.
2. Update Pydantic schemas.
3. Update CRUD logic.
4. Update frontend TypeScript types.
5. Update list/detail/create/edit views as needed.

### Search and Filtering

`GET /api/wines` should support:

- keyword search over name, name kana, producer, country, grape variety, and comment
- exact filters for wine type, style type, country, vintage, and location
- partial filters for producer and grape variety if implemented
- price min/max filters
- `in_stock` boolean filter
- sorting
- `skip` and `limit` pagination

Keep query parameters simple and serializable from `URLSearchParams`.

### Duplicate Checks

Maintain application-level duplicate checks for:

```text
name + producer + vintage + size + location
```

Return HTTP 409 when a duplicate is detected.

### Database Note

Production uses Supabase Postgres (`DATABASE_URL` set via Secret Manager on Cloud Run). SQLite is local-development-only now, used when `DATABASE_URL` is unset. Schema changes go through Alembic (`backend/migrations/`) — do not rely on `Base.metadata.create_all()`, which was removed from `main.py`.

## Frontend Implementation Guidelines

### Architecture

Use feature-based organization.

```text
features/wines/
├── api/
├── components/
├── hooks/
└── types/
```

Do not put wine-specific business logic into global components.

### Data Fetching

Use TanStack Query for server state.

- API calls live in `features/wines/api/winesApi.ts`.
- Query hooks live in `features/wines/hooks/useWines.ts`.
- UI components receive data as props and should not directly call `fetch`.

### API Client

All API calls should go through `src/lib/apiClient.ts`.

The API client should:

- prepend `env.apiBaseUrl`
- parse JSON responses
- handle `204 No Content`
- throw a structured `ApiError` for non-2xx responses

Do not hard-code API base URLs in components.

### Routing

Expected routes:

```text
/                -> redirect to /wines
/wines           -> wine list
/wines/new       -> create wine
/wines/:wineId   -> wine detail
/wines/:wineId/edit -> edit wine
*                -> not found
```

Routes should render inside `AppLayout` unless intentionally public or standalone.

## UI and Design Guidelines

Read `frontend/DESIGN.md` before making visual changes.

The current design direction is:

```text
Warm Minimal Admin
```

This means:

- warm ivory background
- white/cream surfaces
- deep forest green primary color
- muted burgundy accents only where appropriate
- thin borders
- restrained shadows
- practical, management-focused layouts
- image-free by default

### Design System Source of Truth

Use `src/theme/theme.ts` as the source of truth for:

- colors
- typography
- radius
- shadows
- MUI component overrides

Use Tailwind mainly for:

- flex/grid layout
- spacing
- responsive behavior
- page-level composition

Avoid defining the same color or radius independently in many components.

### View Mode Policy for Wine List

The default wine list view is a text-first list/table view.

A future image-based card view may be added when wine images are available. Card view is an alternate browsing mode, not the default operational view.

If both list and card views exist:

- use the same backend query
- preserve the same search/filter/sort state
- do not reset pagination unless explicitly designed
- keep labels as `リスト表示` and `カード表示`

Suggested component structure:

```text
WineListPage
├── WineSearchForm
├── WineViewToggle
├── WineTableView
├── WineCardGridView
└── WinePagination
```

Do not design the card view as an e-commerce product catalog. The app is an inventory management system.

### Table/List UI

For management screens, prefer table/list layouts.

Table column alignment:

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

Prices and stock counts should be right-aligned.

### Badge UI

Use a shared badge component for wine type and style.

Expected badge categories:

```text
赤ワイン
白ワイン
オレンジワイン
ロゼ
Classic
ナチュール
```

Badges should support recognition without becoming visually loud.

## Component Naming Guidelines

Prefer explicit names:

```text
WineTableView
WineCardGridView
WineSearchForm
WinePagination
WineViewToggle
WineDetailHeader
WineInfoCard
WineStockSummary
WinePriceInfo
WineManagementInfo
WineHistoryTable
```

Avoid vague names like:

```text
Card
Table
List
Form
Panel
```

unless they are truly generic and live under `components/common`.

## Detail Page Direction

The wine detail page should behave as an operational hub, not just a static detail page.

Recommended sections:

```text
Header
├── back to list
├── wine name
├── type/style badges
├── stock status
└── actions: edit, delete, stock movement

Main
├── basic information
├── stock summary
├── price information
├── management information
├── comment/memo
└── future stock movement history
```

On desktop, use a two-column layout:

```text
left: primary wine information
right: stock summary and actions
```

On mobile/tablet, stack sections in one column.

## TypeScript Guidelines

Use TypeScript strictly.

- Avoid `any`.
- Prefer explicit types for API responses and component props.
- Keep API response types in `features/*/types`.
- Let component-local variables infer types when obvious.
- Use `type` for props unless interface extension is needed.

If a component receives server data, handle nullable fields gracefully.

Display fallback:

```text
-
```

for missing scalar values.

## Material UI Guidelines

Use MUI for form controls, buttons, table, drawers, menus, dialogs, chips, and pagination.

Prefer theme overrides for global behavior.

Use `sx` for component-specific adjustments.

Use Tailwind for layout wrappers.

Example:

```tsx
<div className="flex flex-col gap-6">
  <Paper sx={{ p: 3 }}>
    ...
  </Paper>
</div>
```

Do not overuse nested `sx` when a simple Tailwind layout class is enough.

### MUI Version Compatibility

Some MUI APIs may differ by version.

For `ListItemText`, prefer:

```tsx
<ListItemText
  primary={label}
  slotProps={{
    primary: {
      sx: {
        fontSize: 14,
        fontWeight: 600,
      },
    },
  }}
/>
```

If a Material icon import fails, either:

1. choose a confirmed existing icon in `node_modules/@mui/icons-material`, or
2. use `SvgIcon` with an inline path for small utility icons.

## Tailwind Guidelines

Tailwind should be connected to MUI CSS variables where possible.

Use Tailwind for:

```text
flex
grid
gap
padding
margin
width
height
responsive breakpoints
```

Avoid hard-coded theme colors in Tailwind classes unless mapped in `index.css`.

Good:

```tsx
<div className="bg-app-background text-app-text">
```

Avoid:

```tsx
<div className="bg-[#f8f7f2] text-[#22241f]">
```

## Error Handling UX

List pages should show:

- loading state
- error state
- empty state
- refetching indicator when useful

Do not leave screens blank on errors.

When an API call fails, show a user-readable message and preserve layout.

## Accessibility Guidelines

- Buttons must have accessible labels when icon-only.
- Table should have `aria-label`.
- Do not use color as the only indicator for state.
- Use semantic headings in page order.
- Links to detail pages should be keyboard accessible.

## Implementation Workflow

When making changes:

1. Inspect the current files first.
2. Make the smallest coherent change.
3. Keep existing API contracts unless the task requires changing them.
4. Run frontend build after TypeScript changes.
5. Run backend manually if backend behavior changed.
6. Verify browser Console and Network tabs for frontend/API changes.

Recommended local checks:

```bash
cd frontend
npm run build
```

```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Recommended Codespaces checks:

```bash
cd /workspaces/yuki0926/wine-app/frontend
npm run build
```

```bash
cd /workspaces/yuki0926/wine-app/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Common Troubleshooting

### Frontend blank screen

Check browser Console first.

Common causes:

- failed import
- invalid MUI icon import
- React Router context issue
- environment variable missing
- TypeScript build errors not yet fixed

### API request returns 302 in Codespaces

The backend port is private and GitHub is redirecting to sign-in.

Fix:

```text
Ports tab -> 8000 -> Visibility -> Public
```

### CORS error

Confirm:

- frontend origin is `https://<codespace>-5173.app.github.dev`
- backend CORS allows that origin
- backend was restarted after CORS changes

### Failed to fetch

Check:

- backend process is running
- frontend was restarted after `.env.local` changes
- local mode: `VITE_API_BASE_URL` is `http://127.0.0.1:8000`
- Codespaces mode: `VITE_API_BASE_URL` points to the 8000 forwarded URL
- Codespaces mode: 8000 port is visible/public if browser fetches are redirected

## Do Not Do

Do not:

- assume Codespaces when the user is working locally
- hard-code Codespaces URLs in source files
- hard-code Cloud Run URLs in components
- duplicate design tokens in multiple files
- use `any` to silence type errors
- turn the app into an e-commerce-style wine catalog
- make wine images required for list screens
- reset filters when switching list/card views
- ignore backend/frontend type mismatches
- modify deployment files without understanding current Cloud Build and Cloud Run setup

## Current Product Priorities

1. Make the wine list screen stable and polished.
2. Preserve future option for card view with images.
3. Implement wine detail screen in the same design system.
4. Implement create/edit flows with validation.
5. Add delete confirmation and user feedback.
6. Later: stock movement history, image upload (Supabase Storage), Excel import.
