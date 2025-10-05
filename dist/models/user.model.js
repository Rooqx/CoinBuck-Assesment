"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * User Schema
 */
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, unique: true },
    name: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    password: { type: String, minLength: 6, required: true },
}, { timestamps: true });
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
