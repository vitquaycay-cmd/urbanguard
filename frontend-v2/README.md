# UrbanGuard Frontend v2

Main UrbanGuard web app built with Vite, React, TypeScript, Tailwind, Leaflet, Socket.IO client, and Recharts.

## Features

| Area | Description |
|---|---|
| Auth | Login/register, protected routes, current-user context |
| Map | Validated reports, danger markers, clustering, heatmap toggle |
| Safe route | Calls `urbanguard-ai` `/real-safe-route` with current danger points |
| Reports | User report form with image upload and GPS position |
| Notifications | Notification list, read-all, delete-all |
| Admin users | User list, filters, ban/unban |
| Admin reports | UI exists, but some backend report-management endpoints are not implemented yet |

## Environment

Create `frontend-v2/.env` when the backend is not on the default URL:

```env
VITE_API_URL=http://localhost:3000
```

The safe-route service currently calls:

```text
http://127.0.0.1:5000/real-safe-route
```

## Commands

```bash
npm install
npm run dev
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run lint
```

Default dev URL:

```text
http://localhost:3002
```

## Important Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Route tree and app-level providers |
| `src/hooks/CurrentUserProvider.tsx` | Current-user loading and refresh logic |
| `src/hooks/currentUserContext.ts` | Current-user context shape |
| `src/hooks/useCurrentUser.tsx` | Current-user hook |
| `src/services/auth.api.ts` | Auth, tokens, notifications API helpers |
| `src/services/report.api.ts` | Report and admin-report API helpers |
| `src/services/user.api.ts` | Admin user API helpers |
| `src/pages/MapPage.tsx` | Safe-route page shell |
| `src/components/ActiveReportsMap.tsx` | Leaflet map and realtime report loading |
| `src/pages/AccountManagementPage.tsx` | Admin user-management page |
| `src/pages/ReportManagementPage.tsx` | Admin report-management page |

## Auth Notes

Login flow:

1. `LoginPage` calls `loginRequest`.
2. Tokens are stored in local storage.
3. `refreshUser()` loads `/api/auth/me`.
4. Protected routes can render once `CurrentUserProvider` has the user.

Logout flow:

1. Sidebar calls `/api/auth/logout` when a refresh token exists.
2. Local tokens are removed.
3. Current-user context is cleared.
4. User is navigated to `/login`.

If `/api/auth/me` returns `401` or `403`, the provider clears stored tokens.

## Known Gaps

- Full lint still fails in files outside the recent user/auth work.
- Report-management page calls backend endpoints that are not currently exposed by `backend/src/reports/reports.controller.ts`.
- Vote UI expects `trustScore` and `userVote`, but backend vote response currently uses `newTrustScore`.

