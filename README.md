# 💰 CoinBuck Assessment — Backend (Node.js + Bun)

### 🚀 Overview

This project is an **Express + TypeScript API** for crypto-to-fiat conversions, wallet and transaction management, and secure authentication using JWT-based cookies.  
It demonstrates modular structure, token-based auth, and atomic wallet transactions built on **MongoDB** and **Mongoose**.

---

## 🧩 Quick Endpoints Reference

## ⚡ Rate Limiting Note

> 🚫 If you spam any endpoint more than **5 times in quick succession**,  
> you’ll receive a **429 Too Many Requests** error.

### 🧠 AUTH ROUTES

- **POST** `/api/v1/auth/signup` → Create a new user account
- **POST** `/api/v1/auth/signin` → Login and receive cookies (`accessToken`, `refreshToken`)
- **POST** `/api/v1/auth/logout` → Logout (currently returns plain message)

### 💸 TRANSACTION ROUTES

- **POST** `/api/v1/transactions/convert` → Convert crypto → fiat (protected)
- **GET** `/api/v1/transactions/` → Get all transactions (protected)
- **GET** `/api/v1/transactions/me` → Get transactions for the logged-in user (protected)

### 👛 WALLET ROUTES

- **GET** `/api/v1/wallets/` → Get all wallets (protected)
- **GET** `/api/v1/wallets/me` → Get the authenticated user’s wallet (protected)

### 👥 USER ROUTES

- **GET** `/api/v1/users/` → Get all wallets (protected)
- **GET** `/api/v1/users/me` → Get the authenticated user’s wallet (protected)

---

## 🧠 AUTHENTICATION FLOW

- On signup/signin, two cookies are issued:
  - `accessToken` → short-lived (≈15 min)
  - `refreshToken` → long-lived (from `REFRESH_TOKEN_EXPIRES_MS`)
- Both cookies are `httpOnly` and `secure` (in production).

⚙️ **Auth Middleware**

- Verifies the `refreshToken` by default using `REFRESH_TOKEN_SECRET`
- Falls back to `Authorization: Bearer <token>` header if cookies are not present
- You can modify it to validate the access token instead for better session control

---

### 🔑 Routes & Usage (Detailed)

#### 1️⃣ **Signup**

- **POST** `http://localhost:4000/api/v1/auth/signup`
- **Body:**
  ```json
  {
    "email": "example@gmail.com",
    "password": "123456"
  }
  ```

#### 2️⃣ **Signin**

- **POST** `http://localhost:4000/api/v1/auth/signin`
- **Body:**
  ```json
  {
    "email": "example@gmail.com",
    "password": "123456"
  }
  ```

#### 3️⃣ **Logout**

- **POST** `http://localhost:4000/api/v1/auth/logout`
- **Description:** Ends session (currently returns a plain message, does not yet clear cookies)

---

#### 4️⃣ **Convert Crypto → Fiat**

- **POST** `http://localhost:4000/api/v1/transactions/convert`
- **Body:**
  ```json
  {
    "amount": 0.001,
    "cryptoType": "BTC"
  }
  ```
- **Auth Required:** Yes (via cookies or `Authorization` header)

#### 5️⃣ **Get All Transactions**

- **GET** `http://localhost:4000/api/v1/transactions/`
- **Auth Required:** Yes

#### 6️⃣ **Get My Transactions**

- **GET** `http://localhost:4000/api/v1/transactions/me`
- **Auth Required:** Yes

---

#### 7️⃣ **Get All Wallets**

- **GET** `http://localhost:4000/api/v1/wallets/`
- **Auth Required:** Yes

#### 8️⃣ **Get My Wallet**

- **GET** `http://localhost:4000/api/v1/wallets/me`
- **Auth Required:** Yes

---

## ⚙️ HOW TRANSACTIONS WORK (HIGH LEVEL)

1. Receive request with `{ amount, cryptoType }`
2. Validate input & check supported crypto types
3. Convert crypto → NGN using current exchange rate
4. Create a new `Transaction` record (status `PENDING`)
5. Start a **Mongoose session** for atomic operations
6. Debit crypto wallet → credit fiat wallet
7. If successful, mark as `SUCCESS`; else rollback and mark `FAILED`

This ensures every wallet update and transaction record stays consistent and atomic.

---

## 🧪 TESTING TIPS

- Enable cookies in Postman or Insomnia.
- If you get `401 Unauthorized`, ensure:
  - Cookies are set properly.
  - `REFRESH_TOKEN_SECRET` matches the one used to sign tokens.
- Auth middleware validates the **refresh token** by default — adjust if you prefer validating the **access token**.
- To simulate logout, clear browser cookies or update the logout route to use `res.clearCookie()`.
- Fix the `/api/v1/users` route if it points to wallet controllers.

---

## 🧩 Run Locally

Clone the project:

```bash
git clone https://github.com/yourusername/coinbuck-assessment.git
cd coinbuck-assessment
```

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Your server will start at `http://localhost:4000`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and include the following:

```bash
PORT=4000

MONGO_URI=mongodb://localhost:27017/
ACCESS_TOKEN_SECRET=your_access_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here

ACCESS_TOKEN_EXPIRES_MS=900000
REFRESH_TOKEN_EXPIRES_MS=604800000

COOKIE_SECRET=cookie_secret_here
NODE_ENV=development

ARCJET_SECRET=arcjet_secret_here
ARCJET_ENV=development
```

## 📁 PROJECT STRUCTURE

```
src/
 ├── app.ts
 ├── routers/
 │    ├── auth.router.ts
 │    ├── transactions.router.ts
 │    ├── wallets.router.ts
 │    └── users.router.ts
 ├── controllers/
 ├── configs/
 ├── database/
 ├── services/
 ├── models/
 └── utils/

```

---
