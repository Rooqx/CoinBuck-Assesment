"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const user_service_1 = require("../services/user.service");
const responseHelper_1 = require("../utils/responseHelper");
const user_model_1 = __importDefault(require("../models/user.model"));
const env_config_1 = require("../configs/env.config");
const tokenCookies_1 = require("../utils/tokenCookies");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// helper: remove sensitive fields before sending user object
function sanitizeUser(user) {
    if (!user)
        return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
}
// helper: sign JWTs (self-contained so this works in an assessment)
function signAccessToken(payload) {
    const secret = env_config_1.ACCESS_TOKEN_SECRET;
    const expiresIn = env_config_1.ACCESS_TOKEN_EXPIRES_IN;
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
}
function signRefreshToken(payload) {
    const secret = env_config_1.REFRESH_TOKEN_SECRET;
    const expiresIn = env_config_1.REFRESH_TOKEN_EXPIRES_IN;
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
}
exports.register = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    const account = await user_service_1.UserService.createUser(email, password);
    // minimal payload; include whatever claims you need
    const payload = { sub: account._id, email: account.email };
    console.log("payload;", payload);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    // set access token cookie (short-lived)
    res.cookie("accessToken", accessToken, (0, tokenCookies_1.getAccessCookieOpts)());
    // set refresh token cookie (httpOnly so client JS can't read it)
    res.cookie("refreshToken", refreshToken, (0, tokenCookies_1.getRefreshCookieOpts)());
    return responseHelper_1.ResponseHelper.created(res, { user: account }, "Account creation successful");
});
exports.login = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new error_middleware_1.AppError("Invalid credentials", 401);
    }
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        throw new error_middleware_1.AppError("Invalid credentials", 401);
    }
    // console.log("User found:", user);
    // compare password with hashed password
    //  console.log("Comparing passwords");
    const ok = await bcryptjs_1.default.compare(password, user.password);
    if (!ok) {
        throw new error_middleware_1.AppError("Invalid credentials", 401);
    }
    // minimal payload; include whatever claims you need
    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    // set access token cookie (short-lived)
    res.cookie("accessToken", accessToken, (0, tokenCookies_1.getAccessCookieOpts)());
    // set refresh token cookie (httpOnly so client JS can't read it)
    res.cookie("refreshToken", refreshToken, (0, tokenCookies_1.getRefreshCookieOpts)());
    const sanitizedUser = sanitizeUser(user);
    return responseHelper_1.ResponseHelper.success(res, { user: sanitizedUser }, "Logged in");
});
