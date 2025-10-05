"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessCookieOpts = getAccessCookieOpts;
exports.getRefreshCookieOpts = getRefreshCookieOpts;
const env_config_1 = require("../configs/env.config");
// cookie options for access token (short-lived)
function getAccessCookieOpts() {
    const isProd = env_config_1.ENV === "production";
    return {
        httpOnly: true, // JS on frontend cannot access it
        secure: isProd, // only send over HTTPS in production
        sameSite: "lax",
        path: "/",
        maxAge: 1000 * 60 * 50, // 50 minutes
    };
}
// cookie options for refresh token
function getRefreshCookieOpts() {
    const isProd = env_config_1.ENV === "production";
    const maxAge = Number(env_config_1.REFRESH_TOKEN_EXPIRES_MS); // default 7 days in ms
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge,
    };
}
