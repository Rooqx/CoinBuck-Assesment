# CoinBuck-Assesment — API README

Short overview

This repository is an Express + TypeScript API for simple crypto-to-fiat conversions, user auth (cookie JWTs), wallets and transactions. The README below documents how to run the app, the public endpoints, how authentication works, required environment variables and a few testing tips.

## Quick start

Prerequisites:

- Node-compatible runtime (this project uses Bun in package.json dev script but Node works for built output)
- MongoDB running and accessible from the machine

Install dependencies and run in development (project uses Bun in the starter):

```bash
# start development server (hot reload via bun)
bun install
bun run dev
```

Build and run with Node after TypeScript compilation:

```bash
# compile to JS
bun run build
# run compiled app
node dist/app.js
```

The server listens on the port defined by the `PORT` environment variable (see env list below). The express app mounts routes under `/api/v1`.

## Required environment variables

The app loads .env files. Minimum/env keys used in code:

- PORT — server port (e.g. 3000)
- NODE_ENV — `development` or `production`
- MONGO_URI — MongoDB connection string
- ACCESS_TOKEN_EXPIRES_IN — jwt access token expiry (e.g. `15m`)
- ACCESS_TOKEN_SECRET — secret for signing access tokens
- REFRESH_TOKEN_EXPIRES_IN — jwt refresh token expiry (e.g. `7d`)
- REFRESH_TOKEN_EXPIRES_MS — refresh token maxAge in ms (used for cookie)
- REFRESH_TOKEN_SECRET — secret for signing refresh tokens
- ARCJET_KEY, ARCJET_ENV — (optional) used by arcjet middleware

Place these in a `.env` (or `.env.development`) file at repo root. The repo's env loader picks: `.env.${NODE_ENV}.local`, `.env.local`, `.env` in that priority order.

## Auth overview

- When users sign up or sign in, the server issues two cookies: `accessToken` and `refreshToken`.
- The `accessToken` cookie is short-lived and is set with `httpOnly` and `secure` (in production) and `maxAge` of ~50 minutes (see `getAccessCookieOpts`).
- The `refreshToken` cookie is long-lived (maxAge from `REFRESH_TOKEN_EXPIRES_MS`) and also `httpOnly`.
- Important: the `auth` middleware (used by protected routes) currently prefers the `refreshToken` cookie for authentication and falls back to an Authorization header `Bearer <token>`. It verifies tokens with the `REFRESH_TOKEN_SECRET`. That means the refresh token is the token validated by default in the middleware.

Tips:

- When testing in Postman / Insomnia, allow cookies and call `POST /api/v1/auth/signin` to get cookies set. Use the same session for subsequent protected requests.
- You can also include a `Authorization: Bearer <token>` header — the middleware accepts that as fallback.

## Routes (summary)

Base path: `/api/v1`

Auth

- POST `/api/v1/auth/signup`
  - Body: { email: string, password: string }
  - Response: 201 with user object and cookies set (`accessToken`, `refreshToken`).
- POST `/api/v1/auth/signin`
  - Body: { email: string, password: string }
  - Response: 200 with sanitized user and cookies set.
- POST `/api/v1/auth/logout`
  - Currently returns a plain "Logout" response; does not clear cookies automatically.

Transactions

- POST `/api/v1/transactions/convert` (protected)
  - Auth required (cookie or Bearer header). The middleware will read `refreshToken` cookie by default.
  - Body: { amount: number, cryptoType: "BTC"|"ETH"|"USDT" }
  - Behaviour: Creates a transaction record (PENDING), validates and updates wallet balances inside a mongoose transaction, then marks transaction SUCCESS or FAILED.
  - Response: 201 with transaction info.
- GET `/api/v1/transactions/` (protected)
  - Returns all transactions. Requires auth.
- GET `/api/v1/transactions/me` (protected)
  - `addId` middleware populates `req.params.id` from `req.user.sub` (the JWT `sub` claim). Returns transactions for the authenticated user.

Wallets

- GET `/api/v1/wallets/` (protected) — returns all wallets
- GET `/api/v1/wallets/me` (protected) — returns wallet for authenticated user (uses `addId` middleware)

Users (NOTE: potential bug)

- GET `/api/v1/users/` (protected) — currently wired to `fetchAllWallets` from `wallet.controller.ts` which likely is incorrect; the `user` routes appear to call wallet controller functions. This looks like a copy/paste mistake and should be fixed to call the correct user controller functions (e.g. `fetchAllUser` and `fetchUser`).

## Request/response examples

Signup (curl):

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"secret123"}' \
  -c cookiejar.txt
```

Signin (curl — cookies stored):

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"secret123"}' \
  -c cookiejar.txt
```

Call protected convert route (reuse cookies stored in cookiejar.txt):

```bash
curl -i -X POST http://localhost:3000/api/v1/transactions/convert \
  -H 'Content-Type: application/json' \
  -d '{"amount":0.001, "cryptoType":"BTC"}' \
  -b cookiejar.txt
```

If you prefer sending a Bearer token instead of cookies (middleware accepts it as fallback):

```bash
curl -i -X POST http://localhost:3000/api/v1/transactions/convert \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <REFRESH_OR_ACCESS_TOKEN>' \
  -d '{"amount":0.001, "cryptoType":"BTC"}'
```

## How conversion & transactions work (high level)

1. Controller receives request (`amount` and `cryptoType`).
2. `TransactionService.convertToNaira` validates inputs and supported cryptos.
3. It calculates the naira equivalent via `calculateRate` and formats it.
4. A Transaction document is created with status `PENDING`.
5. A mongoose session starts; wallet balances are validated and updated atomically via `WalletService.debit` and `WalletService.credit` using that session.
6. If wallet updates succeed, transaction status is set to `SUCCESS` and session commits. On error, the session is aborted and transaction marked `FAILED` (with `errorMessage`).

This approach ensures a transaction record always exists and wallet updates are atomic.

## Testing tips / debug checklist

- Cookies: the server uses `httpOnly` cookies so browser JS won't see tokens. Use Postman/Insomnia with "send cookies" enabled or use curl's `-c`/`-b` cookiejar.
- If a protected endpoint returns 401, check whether cookies were set and that the `REFRESH_TOKEN_SECRET` matches the secret used to sign tokens.
- `auth.middleware` validates the `refreshToken` by default. If you intended the `accessToken` to be verified, change the middleware to verify `ACCESS_TOKEN_SECRET` and read the `accessToken` cookie.
- The `/api/v1/users` router appears to call wallet controller functions. If you expect user endpoints, change imports in `src/routers/user.router.ts` to use the correct functions from `src/controllers/user.controller.ts`.
- To clear login state in tests, clear cookies or call a logout route that you update to clear `accessToken` / `refreshToken` cookies with `res.clearCookie(...)`.
- Database: make sure `MONGO_URI` is reachable; the app prints the resolved `MONGO_URI` when starting.

## Small suggested improvements (low-risk)

- Fix `user.router.ts` to import and use the `user.controller` functions (looks like a copy/paste bug).
- Make `auth.middleware` verify `accessToken` by default (short-lived) and use `refreshToken` only for refresh flows. Right now middleware verifies refresh token — document this clearly or change code.
- Implement logout to clear cookies and optionally revoke refresh tokens (store them server-side or in redis).
- Add request validation (e.g. zod/joi) for stronger input checks and clearer 422 responses.

## Where to look in the code

- Entry: `src/app.ts`
- Routers: `src/routers/*.ts` (auth, transactions, wallets, users)
- Controllers: `src/controllers/*.ts`
- Services: `src/services/*.ts` (transaction, wallet, user)
- Models: `src/models/*.ts`
- Utils: `src/utils/*.ts` (currency formatting, rate calculator, token cookie helpers)

---

If you want, I can:

- Open a small PR that fixes `user.router.ts` wiring.
- Add example Postman collection or automated tests for the happy paths.

Let me know which follow-up you'd like.
