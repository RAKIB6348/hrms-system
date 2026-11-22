# PeopleFlow HRMS

A modern, responsive human resource management system interface built as a **frontend-only React application**. This repository currently contains a complete UI prototype powered by fictional demonstration data — there is no backend service, database, or authentication layer connected.

> **Scope:** React + Vite + TypeScript frontend only. All records shown in the application are sample data defined in `frontend/src/mocks/data.ts`.

---

## Project Overview

PeopleFlow HRMS provides a single-page enterprise interface for everyday HR operations: workforce management, recruitment, attendance, leave, payroll, performance, employee finance, reporting, administration, and settings.

The application was built with a feature-based architecture and reusable component system. Every screen is reachable from a collapsible sidebar, and every interaction is implemented with local React state or browser persistence. A dedicated mock-data layer keeps the UI decoupled from data sources, so a real API can be introduced later without rewriting page components.

| Property | Value |
| --- | --- |
| Project name | PeopleFlow HRMS |
| Application directory | `frontend/` |
| Version | 1.0.0 |
| Application type | Client-side single-page application (SPA) |
| Data source | Local mock data (no network requests) |
| Current phase | Frontend demonstration / prototype |

---

## Features

### Application shell

- Collapsible sidebar with 11 top-level modules and expandable submenus.
- Active-item highlighting, hover transitions, icon-based navigation, and a mobile drawer.
- Header with page title, breadcrumb trail, global search (`Ctrl`/`Cmd` + `K`), notification dropdown, user profile dropdown, and light/dark theme toggle.
- Responsive layouts for desktop, tablet, and mobile screens.

### Dashboard

- Six KPI cards: Total Employees, Present Today, Absent Today, Employees on Leave, Monthly Payroll, and Open Positions.
- Charts for attendance overview, department distribution, and monthly recruitment trends.
- Recent Employees, Pending Leave Requests, Upcoming Birthdays, and Recent Activities panels.
- Loading skeletons while mock data resolves.

### Employees

- Employee list with search, filters, sorting, pagination, profile navigation, and delete confirmation.
- Employee profile with overview, personal details, documents, and attendance tabs.
- Add Employee form with field-level validation.
- Department and designation lists with create, edit, and delete dialogs.

### Recruitment

- Recruitment dashboard with hiring funnel, pipeline chart, trends, active jobs, and recent applications.
- Job openings list, job detail view, and a validated Create Job form.
- Applications table with candidate rating, stage filtering, and stage progression.
- Kanban recruitment pipeline with candidate movement between stages.

### Attendance

- Attendance dashboard with KPIs, work hours, status breakdown, and monthly trend.
- Daily attendance with date/shift selection, refresh, save, and mark-present actions.
- Attendance history with searchable records and export action.
- Shift management with create, edit, and delete dialogs.

### Leave management

- Leave dashboard with request KPIs, leave-type balances, and request trends.
- Leave requests with inline approve/reject actions.
- Leave type configuration with allowances, carry-forward rules, and colors.
- Monthly leave calendar showing scheduled time off.

### Payroll

- Payroll dashboard with cost trends, batch progress, and recent records.
- Salary structure management.
- Payroll batches with processing status and mark-paid action.
- Demo payslip generation from mock employee/salary data, with a searchable and filterable payslip records list.
- Printable and downloadable payslip detail view with earnings, deductions, and net pay.

### Performance

- Performance dashboard with rating distribution, department scores, goal progress, and top performers.
- Employee reviews table with rating, period, goals, and status.
- Goals and KPIs cards with progress bars, priorities, and status tabs.

### Employee finance

- Finance dashboard with outstanding loans, pending advances, EMI collection, and recovery trends.
- Employee loans table with outstanding-balance indicators.
- Salary advances with approve/reject actions.

### Reports and analytics

- HR analytics: headcount growth, gender distribution, department headcount, and attrition trend.
- Attendance reports: monthly overview and attendance rate by department.
- Payroll reports: cost trend, department distribution, and payroll summary.

### Administration and settings

- User management with activation/deactivation.
- Role management with create, edit, and delete dialogs.
- Permissions matrix with module-level action toggles.
- Company settings with selectable currency and timezone. The demo defaults to **BDT (৳)** and **Asia/Dhaka (UTC+06:00)**; saved values persist in the browser.
- General settings for appearance (light/dark theme), notification preferences, and data/privacy toggles.

### Shared UI behavior

- Data tables support text search, dropdown filters, column sorting, and pagination.
- Forms use `react-hook-form` with Zod schemas where validation is required.
- Destructive actions use confirmation dialogs; successful actions use toast notifications.
- Loading skeletons, empty states, status badges, and reusable statistics cards are used throughout.
- The demo workspace is clearly identified in the interface; no production credentials or live services are configured.

---

## Technology Stack

**Core**

| Technology | Version (package.json) | Use |
| --- | --- | --- |
| React | `^18.3.1` | UI library |
| React DOM | `^18.3.1` | DOM rendering |
| Vite | `^5.4.11` | Development server and build tool |
| TypeScript | `^5.7.2` | Static typing |
| Tailwind CSS | `^3.4.17` | Utility-first styling and theming |

**Routing, state, and data**

| Technology | Version (package.json) | Use |
| --- | --- | --- |
| React Router | `^6.28.0` | Client-side routing, lazy-loaded routes |
| Zustand | `^5.0.1` | UI preferences and company settings persistence |
| TanStack Query | `^5.59.20` | Mock-query abstraction used by dashboard loading states |

**UI and presentation**

| Technology | Version (package.json) | Use |
| --- | --- | --- |
| Radix UI primitives | various `@radix-ui/*` packages | Accessible dialogs, dropdowns, selects, tabs, and other widgets |
| shadcn/ui-style components | local `src/components/ui/` | Reusable component layer built on Radix + Tailwind |
| Lucide React | `^0.468.0` | Icon set |
| Recharts | `^2.13.3` | Charts and data visualization |
| Sonner | `^1.7.1` | Toast notifications |
| `class-variance-authority`, `clsx`, `tailwind-merge` | various | Component variant and class composition |

**Forms and utilities**

| Technology | Version (package.json) | Use |
| --- | --- | --- |
| react-hook-form | `^7.54.1` | Form state and submission |
| Zod | `^3.24.1` | Schema validation |
| `@hookform/resolvers` | `^3.9.1` | Zod integration for forms |

**Development tooling**

- `@vitejs/plugin-react`, PostCSS, Autoprefixer, ESLint 8, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- `components.json` records the shadcn/ui-style configuration.

> Note: `date-fns` and the Radix Popover package are installed as dependencies but are not currently imported by the application.

---

## Project Structure

```text
hrms-system/
├── README.md                       # This document
└── frontend/
    ├── index.html                  # HTML entry point
    ├── package.json                # Dependencies and npm scripts
    ├── package-lock.json
    ├── vite.config.ts              # Vite config, React plugin, @ alias, dev server
    ├── tsconfig.json               # TypeScript project references
    ├── tsconfig.app.json           # App compiler options
    ├── tsconfig.node.json          # Build-tool compiler options
    ├── tailwind.config.js          # Theme tokens, dark mode, animations
    ├── postcss.config.js
    ├── .eslintrc.cjs
    ├── components.json             # shadcn/ui-style configuration
    ├── public/
    │   └── favicon.svg
    ├── README.md                   # Short in-directory quick start
    └── src/
        ├── main.tsx                # React root, providers, router
        ├── app/
        │   └── providers.tsx       # Query client, tooltips, toaster
        ├── routes/
        │   └── index.tsx           # Route table with lazy-loaded pages
        ├── layouts/
        │   ├── MainLayout.tsx      # Shell and suspense fallback
        │   ├── Sidebar.tsx         # Collapsible responsive navigation
        │   └── Header.tsx          # Breadcrumbs, search, notifications, profile
        ├── components/
        │   ├── ui/                 # shadcn-style primitives (19 components)
        │   ├── common/             # DataTable, CrudPage, StatCard, dialogs, etc.
        │   └── charts/             # ChartCard and shared chart options
        ├── features/
        │   └── dashboard/          # Dashboard KPI configuration
        ├── hooks/
        │   ├── use-theme.ts        # Theme/sidebar store (persisted)
        │   ├── use-company-settings.ts  # Company settings store (persisted)
        │   ├── use-mobile.ts       # Responsive breakpoint detection
        │   └── use-mock-query.ts   # Data-access seam for a future API
        ├── lib/
        │   ├── utils.ts            # Class, currency, number, and date helpers
        │   └── navigation.ts       # Menu configuration and page titles
        ├── mocks/
        │   └── data.ts             # All fictional demonstration records
        ├── pages/                  # 38 route pages + 404, grouped by module
        │   ├── admin/
        │   ├── attendance/
        │   ├── employees/
        │   ├── finance/
        │   ├── leave/
        │   ├── payroll/
        │   ├── performance/
        │   ├── recruitment/
        │   ├── reports/
        │   └── settings/
        ├── styles/
        │   └── index.css           # Tailwind layers and light/dark design tokens
        └── types/
            └── index.ts            # Shared domain TypeScript types
```

There are **83 source files** under `frontend/src/`. Page components are loaded on demand through `React.lazy`, which keeps the initial bundle small.

---

## Prerequisites

- **Linux** with a Bash-compatible shell.
- **Node.js 18 or newer** (the project was validated with Node.js `v22.23.2`).
- **npm 9 or newer** (validated with npm `12.2.3`).
- A modern browser with JavaScript enabled (Chrome, Firefox, Edge, or Safari).
- Internet access on first install to download npm packages.

Check your installed versions:

```bash
node --version
npm --version
```

---

## Installation Instructions (Linux)

```bash
# 1. Move into the frontend directory
cd ~/Videos/hrms-system/frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The development server is then available at:

```text
http://localhost:5173
```

`vite.config.ts` sets `host: true`, so the server also listens on the machine's local network addresses.

To stop the server, press `Ctrl + C` in the terminal.

---

## Environment Configuration

No environment configuration is required.

- There is no `.env` file and no `VITE_*` variables in the source code.
- No API keys, database URLs, or credentials are needed.
- The application never calls an external service; all data comes from local mock modules.
- The development port (`5173`) and the `@` import alias are configured directly in `frontend/vite.config.ts`.
- Theme, company preferences, and generated demo payroll records are stored in the browser under the `localStorage` keys `hrms-ui-preferences`, `hrms-company-settings`, and `hrms-payroll-store`.

---

## Development Server Commands

Run all commands from `~/Videos/hrms-system/frontend`:

```bash
# Start the Vite development server with hot module replacement
npm run dev

# Start on an explicit host and port
npm run dev -- --host 0.0.0.0 --port 5173

# Preview the production build (run npm run build first)
npm run preview

# Preview the production build on a custom port
npm run preview -- --port 4173
```

Default preview URL: `http://localhost:4173`.

---

## Available npm Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `vite` | Starts the development server |
| `build` | `tsc -b && vite build` | Runs the TypeScript project check, then builds for production |
| `typecheck` | `tsc -b --pretty false` | Runs TypeScript checks without emitting output |
| `lint` | `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0` | Lints all TypeScript/TSX sources and fails on warnings |
| `preview` | `vite preview` | Serves the contents of `dist/` locally |

---

## Application Routes

All routes use `createBrowserRouter` and render inside `MainLayout`. Routes are wrapped in `Suspense` and lazy-loaded.

| Route | Page |
| --- | --- |
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Dashboard |
| `/employees` | Employee List |
| `/employees/new` | Add Employee |
| `/employees/:id` | Employee Profile |
| `/employees/departments` | Departments |
| `/employees/designations` | Designations |
| `/recruitment` | Recruitment Dashboard |
| `/recruitment/jobs` | Job Openings |
| `/recruitment/jobs/new` | Create Job |
| `/recruitment/jobs/:id` | Job Details |
| `/recruitment/applications` | Applications |
| `/recruitment/pipeline` | Recruitment Pipeline |
| `/attendance` | Attendance Dashboard |
| `/attendance/daily` | Daily Attendance |
| `/attendance/history` | Attendance History |
| `/attendance/shifts` | Shift Management |
| `/leave` | Leave Dashboard |
| `/leave/requests` | Leave Requests |
| `/leave/types` | Leave Types |
| `/leave/calendar` | Leave Calendar |
| `/payroll` | Payroll Dashboard |
| `/payroll/structures` | Salary Structure |
| `/payroll/batches` | Payroll Batches |
| `/payroll/payslips` | Payslip Preview |
| `/performance` | Performance Dashboard |
| `/performance/reviews` | Employee Reviews |
| `/performance/goals` | Goals & KPIs |
| `/finance` | Finance Dashboard |
| `/finance/loans` | Employee Loans |
| `/finance/advances` | Salary Advances |
| `/reports` | HR Analytics |
| `/reports/attendance` | Attendance Reports |
| `/reports/payroll` | Payroll Reports |
| `/admin` | Redirects to `/admin/users` |
| `/admin/users` | User Management |
| `/admin/roles` | Role Management |
| `/admin/permissions` | Permissions |
| `/settings` | Redirects to `/settings/general` |
| `/settings/company` | Company Settings |
| `/settings/general` | General Settings |
| `*` | 404 — Page Not Found |

Dynamic segments: `:id` is an employee ID for `/employees/:id` and a job ID for `/recruitment/jobs/:id`.

---

## UI Components and Libraries

**Local component layer**

- `src/components/ui/`: 19 reusable primitives — `avatar`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `label`, `progress`, `select`, `separator`, `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`, and `tooltip`.
- `src/components/common/`: `DataTable` (search, filters, sort, pagination), `CrudPage` (generic create/edit/delete), `ConfirmDialog`, `DemoNotice`, `EmptyState`, `PageHeader`, `StatCard`, and `StatusBadge`.
- `src/components/charts/ChartCard.tsx`: consistent chart card wrapper and shared Recharts axis/tooltip options.

**External libraries**

- Radix UI supplies accessible behavior for overlays, menus, selects, tabs, switches, dialogs, progress, and tooltips.
- Tailwind CSS with CSS variables provides the light/dark design system; `tailwindcss-animate` adds transitions.
- `class-variance-authority`, `clsx`, and `tailwind-merge` handle component variants and class merging through the `cn()` helper.
- Recharts renders bar, area, and pie charts with animations disabled for deterministic rendering.
- Lucide React provides all icons; Sonner provides toast notifications.
- `react-hook-form` + Zod validate the Add Employee and Create Job forms.

---

## Mock Data and Demo Mode

`frontend/src/mocks/data.ts` is the single source of demonstration data. It defines fictional employees, departments, designations, attendance records, shifts, leave requests, leave types, job openings, applications, payroll records, batches, salary structures, reviews, goals, loans, advances, users, roles, permissions, activities, and dashboard aggregates. The file is explicitly marked as demonstration-only.

The application remains in demo mode:

- No HTTP requests are made to any backend or third-party API.
- No database connection exists.
- There is no real authentication; the profile and sign-out controls display demo notices.
- Interactions (create, edit, delete, approve, reject, stage changes, status toggles) update local React state.
- Theme/sidebar preferences, company settings, and generated demo payroll records persist via Zustand `persist` in browser `localStorage`.
- A visible demo notice appears throughout the UI to remind users that data is fictional.

`frontend/src/hooks/use-mock-query.ts` is the intended integration seam: it currently resolves local data with a short simulated delay so loading skeletons can be exercised. Replacing its loader with a `fetch()` call is the planned way to introduce a real API without changing page components.

Company settings default to the Bangladeshi Taka (`BDT`, symbol `৳`) and the `Asia/Dhaka` timezone. `formatCurrency` uses `Intl.NumberFormat` with the narrow symbol for BDT, and `formatDate` accepts an optional timezone. Saving settings persists the selection; previously saved preferences are preserved.

---

## Build Instructions

```bash
cd ~/Videos/hrms-system/frontend

# Type-check and create an optimized production build in dist/
npm run build

# Optionally serve the build locally
npm run preview
```

The build performs two steps: `tsc -b` validates the TypeScript project, then `vite build` produces hashed, code-split assets in `frontend/dist/`. Chunks are split by route and shared chart/UI bundles to avoid a single oversized JavaScript file.

---

## Testing and Validation

There is currently **no automated test suite** (no unit, integration, or end-to-end test framework is configured). Validation is performed with static checks, a production build, and manual/browser smoke testing.

Commands:

```bash
cd ~/Videos/hrms-system/frontend

npm run typecheck   # TypeScript project check
npm run lint        # ESLint, zero warnings allowed
npm run build       # Production build
npm run preview     # Serve dist/ for manual checks
```

Checks completed on the current implementation:

- TypeScript project check: passed.
- ESLint with `--max-warnings 0`: passed.
- Vite production build: passed without chunk-size warnings.
- Route audit: every sidebar link resolves to a declared route.
- Browser smoke test: all 38 route pages rendered without runtime errors.
- Responsive review: desktop (1440 px) and mobile (390 px) layouts verified.
- Theme review: light and dark modes verified visually.
- BDT/Asia-Dhaka behavior: option selection, formatting previews, save persistence across navigation, and preservation of existing saved preferences verified in a headless browser.

---

## Current Development Status

**Status: frontend prototype complete; backend not implemented.**

- All 38 application pages plus a 404 page are implemented and navigable.
- The UI, theming, responsive behavior, shared components, forms, tables, dialogs, and local state interactions are complete.
- Data is entirely fictional and local; no API, database, Django application, or PostgreSQL instance is part of this repository.
- Company and UI preferences are the only persisted state, stored in the browser.
- Static checks and the production build pass.
- No automated tests are configured yet.

---

## Future Development Roadmap

The following items are **not implemented** and represent suggested next steps:

1. **API integration** — Replace the mock loader in `use-mock-query.ts` with HTTP requests to a future service, including error states and caching strategies.
2. **Authentication and authorization** — Add a real sign-in flow, protected routes, and role-based UI permissions.
3. **Backend service** — Introduce a separate backend project with persistent storage and business rules; keep it out of this frontend directory.
4. **Automated testing** — Add Vitest and React Testing Library for component/unit tests, plus Playwright for route and responsive regression tests.
5. **Accessibility audit** — Verify keyboard navigation, focus management, ARIA attributes, and color contrast against WCAG guidance.
6. **Internationalization** — Extend the existing currency/timezone foundation into full locale and translation support.
7. **File handling** — Implement document upload/download and logo upload rather than demo notices.
8. **Server-side persistence** — Move company settings and user preferences out of `localStorage` into a user profile endpoint.
9. **Real notifications** — Connect the notification dropdown to live events instead of the sample activity list.
10. **Operational polish** — Add CI checks for typecheck, lint, tests, and builds, along with deployment configuration.

---

No commits or pushes are performed by this project documentation. The application can be run locally with the commands in the installation section above.
