# Athithya OS - Test Credentials

## Demo Accounts (auto-seeded on backend startup)
| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Owner   | owner@athithya.com       | owner123    |
| Manager | manager@athithya.com     | manager123  |
| Waiter  | waiter@athithya.com      | waiter123   |

## Auth Endpoints
- POST `/api/auth/login` — `{email, password}` → returns `{token, user}` + httpOnly cookie
- POST `/api/auth/logout`
- GET  `/api/auth/me` — requires Bearer token or cookie

## Notes
- Tokens are JWT (HS256), 24h expiry, sent as `Authorization: Bearer <token>` AND httpOnly cookie.
- Frontend stores token in localStorage and sends as Bearer header.
