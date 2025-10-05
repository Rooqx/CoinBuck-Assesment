"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Transaction Schema
 */
// models/Transaction.js
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, //For fast look up
    },
    transactionId: { type: String, unique: true, required: true }, // UUID or nanoid
    cryptoType: { type: String, enum: ["BTC", "ETH", "USDT"], required: true },
    amountInCrypto: { type: Number, required: true },
    amountInNaira: { type: Number, required: true },
    currencyFormat: { type: String, required: true },
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "SUCCESS",
    },
    errorMessage: { type: String }, // if failed
}, { timestamps: true }); // adds createdAt & updatedAt
const Transaction = mongoose_1.default.model("Transaction", transactionSchema);
exports.default = Transaction;
