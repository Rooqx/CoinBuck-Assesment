"use strict";
/**
 *
 * Winston-based logger for structured, leveled logging.
 * - Logs to console in both dev & prod
 * - In production, outputs JSON for easy parsing by log aggregators (ELK, Datadog, etc.)
 * - Supports log levels: error, warn, info, http, debug
 * - Can easily be extended to log into files, databases, or external services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const { combine, timestamp, printf, colorize, errors, json } = winston_1.format;
// Custom log format for development (pretty output)
const devFormat = combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), // include stack trace in error logs
printf(({ level, message, timestamp, stack, ...meta }) => {
    return `[${timestamp}] [${level}]: ${stack || message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
}));
// Production format (JSON for log management systems)
const prodFormat = combine(timestamp(), errors({ stack: true }), json());
// Create Winston logger instance
exports.logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || "info", // default level = info
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    transports: [
        new winston_1.transports.Console(), // log everything to console
        // You can add file transports here if needed:
        // new transports.File({ filename: "logs/error.log", level: "error" }),
        // new transports.File({ filename: "logs/combined.log" }),
    ],
});
