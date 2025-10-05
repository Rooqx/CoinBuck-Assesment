"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const log_model_1 = __importDefault(require("../models/log.model"));
const { combine, timestamp, printf, colorize, errors, json } = winston_1.format;
// Custom log format for development (pretty output)
const devFormat = combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), printf(({ level, message, timestamp, stack, ...meta }) => {
    return `[${timestamp}] [${level}]: ${stack || message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
}));
// Production format (JSON for log management systems)
const prodFormat = combine(timestamp(), errors({ stack: true }), json());
// Create Winston logger instance
exports.logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || "info",
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    transports: [new winston_1.transports.Console()],
});
//  Hook to also store logs in MongoDB
const logToDatabase = async (level, message, meta) => {
    try {
        await log_model_1.default.create({
            level,
            message,
            meta,
            requestId: meta?.requestId || null,
        });
    }
    catch (err) {
        console.error(" Failed to save log to MongoDB:", err);
    }
};
//  Override default logging methods
const levels = ["info", "warn", "error"];
levels.forEach((level) => {
    const original = exports.logger[level];
    exports.logger[level] = function (message, meta) {
        // Log to console (default Winston behavior)
        original.call(exports.logger, message, meta);
        // Also save in DB
        logToDatabase(level, message, meta);
    };
});
