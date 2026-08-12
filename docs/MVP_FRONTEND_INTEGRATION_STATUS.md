# MVP Frontend Integration Status

Build status: Build Verified (`npm run build`)

Runtime status: Runtime Verification Required. The backend server and PostgreSQL were not started by this frontend task, so live network verification remains.

## Backend Verification Summary

The frontend was aligned to the actual `web-system-backend/lab-hub-backend/src/routes` and `src/controllers` implementation.

Important confirmed differences:

- `GET /api/users/me` currently returns token-derived minimal `user` data, not a full profile row.
- Calendar list requires `start` and `end` query parameters.
- Backend request bodies use camelCase in many domains, for example `leaveType`, `startDate`, `budgetId`, `itemName`, `pubType`, `minRole`.
- Publications `pubType` values are `sci`, `kci`, `intl_conf`, `domestic_conf`.
- Budget categories are `personnel`, `activity`, `material`, `other`.
- Files are URL metadata based: `fileUrl` is required and `storage_type` is forced to `drive`.
- Credentials categories are `wifi`, `server`, `cloud`, `license`, `other`.
- Public applications currently do not process attachments in the controller.
- Attendance, leave, budget, and procurement do not provide list/read APIs in the MVP spec.

## Endpoint Status

| Domain | Endpoint | API Function | UI Status | Backend Verified | Status |
|---|---|---:|---:|---:|---|
| Auth | POST /api/auth/register | Yes | Yes | Yes | UI Connected |
| Auth | POST /api/auth/login | Yes | Yes | Yes | UI Connected |
| Auth | POST /api/auth/refresh | Yes | Yes | Yes | Implemented |
| Auth | POST /api/auth/logout | Yes | Yes | Yes | UI Connected |
| Auth | POST /api/auth/password/reset-request | Yes | Yes | Yes | UI Connected |
| Auth | POST /api/auth/password/reset | Yes | Yes | Yes | UI Connected |
| Users | GET /api/users/me | Yes | Yes | Yes | Partially Connected |
| Users | GET /api/users/admin-dashboard | Yes | Yes | Yes | UI Connected |
| Attendance | POST /api/attendance/check-in | Yes | Yes | Yes | UI Connected |
| Attendance | POST /api/attendance/check-out | Yes | Yes | Yes | UI Connected |
| Leave | POST /api/leave/requests | Yes | Yes | Yes | UI Connected |
| Leave | PUT /api/leave/requests/:id/review | Yes | Yes | Yes | UI Connected |
| Calendar | POST /api/calendar/events | Yes | Yes | Yes | UI Connected |
| Calendar | GET /api/calendar/events | Yes | Yes | Yes | UI Connected |
| Calendar | GET /api/calendar/events/:id | Yes | API module | Yes | Implemented |
| Calendar | PATCH /api/calendar/events/:id | Yes | Yes | Yes | UI Connected |
| Calendar | DELETE /api/calendar/events/:id | Yes | Yes | Yes | UI Connected |
| Calendar | POST /api/calendar/events/:id/exceptions | Yes | Yes | Yes | UI Connected |
| Calendar | POST /api/calendar/events/:id/split | Yes | Yes | Yes | UI Connected |
| Notices | POST /api/notices | Yes | Yes | Yes | UI Connected |
| Notices | GET /api/notices | Yes | Yes | Yes | UI Connected |
| Notices | GET /api/notices/:id | Yes | Yes | Yes | UI Connected |
| Budget | POST /api/budget/expenses | Yes | Yes | Yes | UI Connected |
| Budget | PUT /api/budget/expenses/:id/review | Yes | Yes | Yes | UI Connected |
| Publications | POST /api/publications | Yes | Yes | Yes | UI Connected |
| Publications | GET /api/publications | Yes | Yes | Yes | UI Connected |
| Publications | GET /api/publications/:id | Yes | Yes | Yes | UI Connected |
| Publications | PATCH /api/publications/:id | Yes | Yes | Yes | UI Connected |
| Publications | DELETE /api/publications/:id | Yes | Yes | Yes | UI Connected |
| Files | POST /api/files | Yes | Yes | Yes | UI Connected |
| Files | GET /api/files | Yes | Yes | Yes | UI Connected |
| Files | GET /api/files/:id | Yes | API module | Yes | Implemented |
| Files | GET /api/files/:id/download | Yes | Yes | Yes | UI Connected |
| Files | PATCH /api/files/:id | Yes | Yes | Yes | UI Connected |
| Files | DELETE /api/files/:id | Yes | Yes | Yes | UI Connected |
| Procurement | POST /api/procurement/requests | Yes | Yes | Yes | UI Connected |
| Procurement | PUT /api/procurement/requests/:id/review | Yes | Yes | Yes | UI Connected |
| Procurement | PUT /api/procurement/requests/:id/status | Yes | Yes | Yes | UI Connected |
| Credentials | POST /api/credentials | Yes | Yes | Yes | UI Connected |
| Credentials | GET /api/credentials | Yes | Yes | Yes | UI Connected |
| Credentials | GET /api/credentials/:id | Yes | API module | Yes | Implemented |
| Credentials | GET /api/credentials/:id/reveal | Yes | Yes | Yes | UI Connected |
| Credentials | POST /api/credentials/:id/copy | Yes | Yes | Yes | UI Connected |
| Credentials | PATCH /api/credentials/:id | Yes | Yes | Yes | UI Connected |
| Credentials | DELETE /api/credentials/:id | Yes | Yes | Yes | UI Connected |
| Notifications | GET /api/notifications | Yes | Yes | Yes | UI Connected |
| Notifications | GET /api/notifications/unread-count | Yes | API module | Yes | Implemented |
| Notifications | POST /api/notifications | Yes | Yes | Yes | UI Connected |
| Notifications | PATCH /api/notifications/read-all | Yes | Yes | Yes | UI Connected |
| Notifications | PATCH /api/notifications/:id/read | Yes | Yes | Yes | UI Connected |
| Applications Public | POST /api/public/applications | Yes | Yes | Yes | UI Connected |
| Applications Admin | GET /api/applications | Yes | Yes | Yes | UI Connected |
| Applications Admin | GET /api/applications/:id | Yes | Yes | Yes | UI Connected |
| Applications Admin | PATCH /api/applications/:id | Yes | Yes | Yes | UI Connected |
| Applications Admin | DELETE /api/applications/:id | Yes | Yes | Yes | UI Connected |

## Frontend Modules Created

- `src/api/client.js`: fetch wrapper, envelope handling, auth header, refresh flow, network/server error split.
- `src/api/authApi.js`
- `src/api/usersApi.js`
- `src/api/attendanceApi.js`
- `src/api/leaveApi.js`
- `src/api/calendarApi.js`
- `src/api/noticesApi.js`
- `src/api/budgetApi.js`
- `src/api/publicationsApi.js`
- `src/api/filesApi.js`
- `src/api/procurementApi.js`
- `src/api/credentialsApi.js`
- `src/api/notificationsApi.js`
- `src/api/applicationsApi.js`
- `src/api/mappers.js`

## UI Integration

Implemented:

- Auth login/register/logout/token refresh/password reset screens.
- Protected internal portal and public `/apply` page.
- Notices list/detail/create.
- Calendar list/create/update/delete/exception/split.
- Publications list/detail/create/update/delete.
- Files list/create/update/delete/download-link flow.
- Credentials list/create/update/delete/reveal/copy without list password exposure.
- Notifications list/read-all/read-one/send.
- Admin applications list/detail/status memo/delete.
- Attendance check-in/check-out.
- Leave, budget, and procurement create/review/status actions through direct-ID MVP controls.

Partially connected:

- My Page shows only fields actually available from `/api/users/me` and login response. Profile edit is disabled because no profile update API exists in the spec.
- Admin dashboard displays only the actual protected response; user approval/member management mock behavior was not carried forward.

Blocked by Missing Read API:

- Attendance history and today status read.
- Leave request list and leave balance read.
- Budget list and expense list read.
- Procurement request list read.
- Research projects API is not defined in the MVP spec.

## Mock Data Handling

Removed from active runtime:

- `src/main.jsx` now imports `src/AppIntegrated.jsx`, which does not import `src/data/mockData.js`.
- Active pages use real API responses, empty states, or session-only successful mutation responses.

Retained but inactive:

- `src/App.jsx` and `src/data/mockData.js` remain in the repository but are no longer imported by the application entrypoint.
- Existing historical page files remain, but `src/AppIntegrated.jsx` uses `src/pages/ApiPages.jsx` for API-connected pages.

## Security And Permissions

- Bearer access token is attached by the common API client.
- 401 responses trigger a refresh-token access token renewal attempt.
- Refresh failure clears local auth state.
- Frontend RBAC is UX-only via `RoleGuard`/`hasRole`; backend 403 is still surfaced.
- Credentials never display password in list data. Password is revealed only after `GET /api/credentials/:id/reveal` and cleared from UI state after 30 seconds.
- Copy calls the copy audit endpoint after obtaining a reveal value.
- Tokens and passwords are not logged to console.

## Environment

`.env.example`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

No `.env` file was created or committed.

## Remaining Work

- Run live integration tests with backend and PostgreSQL running.
- Replace direct-ID MVP review controls once backend list/read APIs exist.
- Expand `/api/users/me` backend response or add profile APIs before enabling profile edit.
- Add backend-supported attachments for public applications if the controller is extended.
