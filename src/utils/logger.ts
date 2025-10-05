import { createLogger, format, transports } from "winston";
import Log from "../models/log.model";
const { combine, timestamp, printf, colorize, errors, json } = format;

// Custom log format for development (pretty output)
const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    return `[${timestamp}] [${level}]: ${stack || message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
    }`;
  })
);

// Production format (JSON for log management systems)
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

// Create Winston logger instance
export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

//  Hook to also store logs in MongoDB
const logToDatabase = async (level: string, message: string, meta?: any) => {
  try {
    await Log.create({
      level,
      message,
      meta,
      requestId: meta?.requestId || null,
    });
  } catch (err) {
    console.error(" Failed to save log to MongoDB:", err);
  }
};

//  Override default logging methods
const levels = ["info", "warn", "error"] as const;

levels.forEach((level) => {
  const original = (logger as any)[level];
  (logger as any)[level] = function (message: string, meta?: any) {
    // Log to console (default Winston behavior)
    original.call(logger, message, meta);
    // Also save in DB
    logToDatabase(level, message, meta);
  };
});
