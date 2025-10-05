"use strict";
/**
 * Wallet Schema
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const walletSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, //For fast look up
    },
    balances: {
        BTC: { type: Number, default: 10 },
        ETH: { type: Number, default: 100 },
        USDT: { type: Number, default: 1000 },
        NGN: { type: Number, default: 0 }, // fiat
    },
}, { timestamps: true });
const Wallet = mongoose_1.default.model("Wallet", walletSchema);
exports.default = Wallet;
