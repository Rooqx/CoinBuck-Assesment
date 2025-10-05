"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _UserService_sanitizeUser;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_middleware_1 = require("../middlewares/error.middleware");
const user_model_1 = __importDefault(require("../models/user.model"));
const wallet_service_1 = require("./wallet.service");
const logger_1 = require("../utils/logger");
class UserService {
    //Create User
    static async createUser(email, password) {
        //Validations
        if (!email || !password) {
            throw new error_middleware_1.AppError("Email and password are required", 400);
        }
        //Check if user exists
        const existing = await user_model_1.default.findOne({ email });
        if (existing) {
            throw new error_middleware_1.AppError("Account with this email already exists", 409);
        }
        //hashing password for safe storage using bcrypt
        const saltRounds = Number(12);
        const hashed = await bcryptjs_1.default.hash(password, saltRounds);
        //create the user
        const created = await user_model_1.default.create({
            email,
            password: hashed,
        });
        //create Wallet for the user
        const wallet = await wallet_service_1.WalletService.createWallet(created._id);
        logger_1.logger.info("New wallet created", {
            userId: wallet.userId,
            balances: wallet.balances,
            walletId: wallet._id,
        });
        //Sanitize the user to remove sensitive data like password etcetera
        const safe = __classPrivateFieldGet(this, _a, "m", _UserService_sanitizeUser).call(this, created);
        logger_1.logger.info("New User created", {
            userId: safe._id,
            email: safe.email,
            role: safe.role,
        });
        return safe;
    }
    //Get all user
    static async getAllUser() {
        const users = await user_model_1.default.find();
        if (!users || users.length === 0)
            throw new error_middleware_1.AppError("No user found");
        return users;
    }
    //Get a user details
    static async getUser(userId) {
        //Validate if user id is present and not empty
        if (!userId || userId === "")
            throw new error_middleware_1.AppError("User id is missing", 400);
        const user = await user_model_1.default.findById(userId); //finding user
        if (!user)
            throw new error_middleware_1.AppError("User not found", 404); //Validating
        return __classPrivateFieldGet(this, _a, "m", _UserService_sanitizeUser).call(this, user); // sanitize before returning
    }
}
exports.UserService = UserService;
_a = UserService, _UserService_sanitizeUser = function _UserService_sanitizeUser(user) {
    if (!user)
        return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
};
