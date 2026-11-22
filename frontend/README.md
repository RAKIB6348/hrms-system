# PeopleFlow HRMS — Frontend Demo

A complete, responsive HRMS interface built with **React + Vite + TypeScript + Tailwind CSS**, shadcn/ui-style components (Radix primitives), React Router, TanStack Query, Zustand, Recharts, Lucide icons, react-hook-form + Zod and Sonner toasts.

> **Frontend only.** This project contains no backend, no database connection, no authentication and no API requests. Every record is fictional demonstration data defined in `src/mocks/data.ts`.

## Getting started

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | TypeScript project check + production build |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | ESLint over all `ts`/`tsx` files |
| `npm run preview` | Preview the production build |

## Feature coverage

- **Dashboard** — KPI cards, attendance/department/recruitment charts, recent employees, pending leave, birthdays and activity feed.
- **Employees** — list, profile, validated add form, departments and designations.
- **Recruitment** — dashboard, job openings, create job, job details, applications and a kanban pipeline.
- **Attendance** — dashboard, daily attendance, history and shift management.
- **Leave** — dashboard, requests with approve/reject, leave types and a monthly calendar.
- **Payroll** — dashboard, salary structure, batches and a printable payslip preview.
- **Performance** — dashboard, reviews and goals/KPIs.
- **Employee Finance** — dashboard, loans and salary advances.
- **Reports** — HR analytics, attendance reports and payroll reports.
- **Administration** — users, roles and a permissions matrix.
- **Settings** — company profile and general preferences (including light/dark theme).

Shared UI: collapsible responsive sidebar with expandable submenus, header with breadcrumbs, global search (`Ctrl/Cmd + K`), notifications, profile menu and theme toggle. Data tables support search, filters, sorting and pagination. Forms use Zod validation; destructive actions use confirmation dialogs; loading skeletons, empty states and toasts are used throughout.

## Architecture

```
src/
├── app/          # providers (query client, tooltip, toaster)
├── components/   # ui/ (shadcn-style), common/ (shared widgets), charts/
├── features/     # feature-oriented shared helpers
├── hooks/        # theme/store, mobile detection, mock-query seam
├── layouts/      # main layout, sidebar, header
├── lib/          # utilities, navigation config
├── mocks/        # all demonstration data (replace with API calls later)
├── pages/        # route pages grouped by module
├── routes/       # router definition (lazy-loaded pages)
├── styles/       # global styles & design tokens
└── types/        # shared TypeScript domain types
```

`src/hooks/use-mock-query.ts` is the single seam between the UI and data. Replace its loader with a real `fetch()` when a backend exists — page components do not need to change.
