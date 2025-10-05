"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const error_middleware_1 = require("../middlewares/error.middleware");
/**
 * This is the wallet service which handles all the wallet logics
 */
class WalletService {
    //This is a function to get the user balance from the wallet
    static async getBalance(userId, session) {
        const wallet = (await wallet_model_1.default.findOne({ userId }).session(session));
        if (!wallet)
            throw new error_middleware_1.AppError("Wallet not found", 404);
        return wallet.balances;
    }
    //Func to compare balance with update amounts
    static async validateBalance(userId, cryptoType, amount, session) {
        const balances = await this.getBalance(userId, session);
        if (!balances[cryptoType] || balances[cryptoType] < amount) {
            throw new error_middleware_1.AppError("Insufficient balance", 400);
        }
    }
    //Func to create wallet of new users
    static async createWallet(userId) {
        //Validate
        if (!userId)
            throw new error_middleware_1.AppError("User id is missing", 400);
        const newWallet = await wallet_model_1.default.create({ userId: userId });
        if (!newWallet)
            throw new error_middleware_1.AppError("Wallet not created", 400);
        //Return wallet
        return newWallet;
    }
    //Fetch all wallets
    static async getAllWallet() {
        const wallets = await wallet_model_1.default.find();
        //Validate
        if (!wallets || wallets.length === 0)
            throw new error_middleware_1.AppError("No wallets found", 404);
        //Return wallets
        return wallets;
    }
    //Fetch a user wallet
    static async getUserWallet(userId) {
        //Validate
        if (!userId)
            throw new error_middleware_1.AppError("User id is missing", 400);
        //Find wallet
        const wallet = await wallet_model_1.default.findOne({ userId });
        //Validate
        if (!wallet)
            throw new error_middleware_1.AppError("Wallet not found", 404);
        //Return wallet
        return wallet;
    }
    //Debit Logic
    static async debit(userId, amount, cryptoType, session) {
        //Find wallet
        const wallet = (await wallet_model_1.default.findOne({ userId }));
        //validate
        if (!wallet)
            throw new error_middleware_1.AppError("Wallet not found", 404);
        //Compare balance with user balance
        if (wallet.balances[cryptoType] < amount) {
            throw new error_middleware_1.AppError("Insufficient crypto balance", 400);
        }
        //Update user wallet
        wallet.balances[cryptoType] -= amount;
        await wallet.save({ session });
        return wallet;
    }
    //Credit Logic
    static async credit(userId, amount, cryptoType, session) {
        //Find wallet
        const wallet = (await wallet_model_1.default.findOne({ userId }));
        //validate
        if (!wallet)
            throw new error_middleware_1.AppError("Wallet not found", 404);
        //Update user wallet
        wallet.balances[cryptoType] += amount;
        await wallet.save({ session });
        return wallet;
    }
}
exports.WalletService = WalletService;
