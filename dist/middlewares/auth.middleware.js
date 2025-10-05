"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const error_middleware_1 = require("./error.middleware");
const env_config_1 = require("../configs/env.config");
const authMiddleware = (req, _res, next) => {
    // Prefer access token from cookie, fall back to Authorization header
    //console.log("Auth middleware hit");
    const token = req.cookies?.refreshToken ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : undefined);
    if (!token) {
        return next(new error_middleware_1.AppError("Unauthorized - No token provided", 401));
    }
    //console.log("Verifying token:", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.REFRESH_TOKEN_SECRET);
        req.user = decoded;
        return next();
    }
    catch (err) {
        // optional: handle expired token separately
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            console.error("Refresh token expired:", err);
            return next(new error_middleware_1.AppError("Unauthorized - Token expired", 401));
        }
        console.error("Error verifying token:", err);
        return next(new error_middleware_1.AppError("Unauthorized - Invalid token", 401));
    }
};
exports.default = authMiddleware;
