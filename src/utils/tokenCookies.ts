import { ENV, REFRESH_TOKEN_EXPIRES_MS } from "../configs/env.config";

// cookie options for access token (short-lived)
export function getAccessCookieOpts() {
  const isProd = ENV === "production";
  return {
    httpOnly: true, // JS on frontend cannot access it
    secure: isProd, // only send over HTTPS in production
    sameSite: "lax" as "lax" | "strict" | "none",
    path: "/",
    maxAge: 1000 * 60 * 50, // 50 minutes
  };
}
// cookie options for refresh token
export function getRefreshCookieOpts() {
  const isProd = ENV === "production";
  const maxAge = Number(REFRESH_TOKEN_EXPIRES_MS); // default 7 days in ms
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as "lax" | "strict" | "none",
    path: "/",
    maxAge,
  };
}
