# API Design Snapshot

All backend routes use the `/api` prefix. Swagger is available at `/api/docs` when the backend can connect to the database and start successfully.

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register account |
| `POST` | `/api/auth/login` | Public | Return access and refresh tokens |
| `GET` | `/api/auth/me` | JWT | Return current user |
| `POST` | `/api/auth/refresh` | Public body token | Rotate refresh token |
| `PATCH` | `/api/auth/password` | JWT | Change password |
| `POST` | `/api/auth/logout` | JWT | Delete one refresh token |

## Users

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | ADMIN | List users, filters and stats |
| `PATCH` | `/api/users/:id/role` | ADMIN | Change user role |
| `GET` | `/api/users/:id/profile` | JWT | User profile summary |
| `PATCH` | `/api/users/:id/ban` | ADMIN | Ban or unban user |

## Reports

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports/active` | Public | Validated, visible reports for map |
| `POST` | `/api/reports` | JWT | Create report with multipart `image` |
| `POST` | `/api/reports/:id/vote` | JWT | Toggle upvote/downvote |

Expected by frontend but not currently exposed:

| Method | Path | Used by |
|---|---|---|
| `GET` | `/api/reports` | Report management list/filter |
| `GET` | `/api/reports/:id` | Report detail |
| `PATCH` | `/api/reports/:id/status` | Approve/reject/resolve |
| `DELETE` | `/api/reports/:id` | Delete/hide report |

## Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/reports/pending` | ADMIN | FIFO pending report queue |

## Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | JWT | List notifications |
| `GET` | `/api/notifications/unread-count` | JWT | Count unread notifications |
| `PATCH` | `/api/notifications/read-all` | JWT | Mark all read |
| `PATCH` | `/api/notifications/:id/read` | JWT | Mark one read |
| `DELETE` | `/api/notifications` | JWT | Delete all user notifications |

## Statistics

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/statistics/overview` | Public currently | Report status overview |
| `GET` | `/api/statistics/heatmap-data` | Public currently | Heatmap points |

## Socket.IO

Namespace: `/realtime`

| Event | Direction | Description |
|---|---|---|
| `report:new` | Server to clients | New/validated report event |
| `report:update` | Server to clients | Report status/trust update event |
| `account:banned` | Server to a user room | Current user was banned |
| `notification:new` | Expected by frontend | Not fully wired in backend yet |

## AI Service

Base URL is configured separately. Backend defaults to `http://127.0.0.1:5000` when `AI_SERVICE_URL` is not set.

| Method | Path | Description |
|---|---|---|
| `POST` | `/analyze` | Multipart image analysis |
| `POST` | `/safe-route` | Basic route request |
| `POST` | `/real-safe-route` | Coordinate route request with danger points |
| `GET` | `/docs` | FastAPI docs |

