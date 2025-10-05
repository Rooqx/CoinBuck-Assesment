"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARCJET_ENV = exports.ARCJET_KEY = exports.REFRESH_TOKEN_SECRET = exports.REFRESH_TOKEN_EXPIRES_MS = exports.REFRESH_TOKEN_EXPIRES_IN = exports.ACCESS_TOKEN_SECRET = exports.ACCESS_TOKEN_EXPIRES_IN = exports.MONGO_URI = exports.ENV = exports.PORT = void 0;
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Set the current environment (default to 'development')
const NODE_ENV = process.env.NODE_ENV || "development";
// Priority order: .env.[env].local → .env.local → .env
const envFiles = [`.env.${NODE_ENV}.local`, `.env.local`, `.env`];
for (const file of envFiles) {
    const fullPath = path_1.default.resolve(process.cwd(), file);
    if ((0, fs_1.existsSync)(fullPath)) {
        (0, dotenv_1.config)({ path: fullPath });
        console.log(`Loaded environment variables from ${file}`);
        break; // Stop after loading the first found file
    }
}
// Export all required environment variables
_a = process.env, exports.PORT = _a.PORT, exports.ENV = _a.NODE_ENV, exports.MONGO_URI = _a.MONGO_URI, exports.ACCESS_TOKEN_EXPIRES_IN = _a.ACCESS_TOKEN_EXPIRES_IN, exports.ACCESS_TOKEN_SECRET = _a.ACCESS_TOKEN_SECRET, exports.REFRESH_TOKEN_EXPIRES_IN = _a.REFRESH_TOKEN_EXPIRES_IN, exports.REFRESH_TOKEN_EXPIRES_MS = _a.REFRESH_TOKEN_EXPIRES_MS, exports.REFRESH_TOKEN_SECRET = _a.REFRESH_TOKEN_SECRET, exports.ARCJET_KEY = _a.ARCJET_KEY, exports.ARCJET_ENV = _a.ARCJET_ENV;
