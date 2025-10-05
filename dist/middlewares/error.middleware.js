"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.AuthorizationError = exports.AuthenticationError = exports.DatabaseError = exports.ValidationError = exports.AppError = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const logger_1 = require("../utils/logger");
/**
 * Custom Error class for application-specific errors
 * Extends native Error class with status code and additional properties
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Custom Error class for validation failures
 * Contains detailed field-level validation errors
 */
class ValidationError extends AppError {
    constructor(errors, message = "Validation failed") {
        super(message, 422);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
/**
 * Custom Error class for database operations failures
 */
class DatabaseError extends AppError {
    constructor(message = "Database operation failed") {
        super(message, 500);
    }
}
exports.DatabaseError = DatabaseError;
/**
 * Custom Error class for authentication failures
 */
class AuthenticationError extends AppError {
    constructor(message = "Authentication failed") {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Custom Error class for authorization failures
 */
class AuthorizationError extends AppError {
    constructor(message = "Access forbidden") {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Global error handling middleware for Express applications
 * Catches all errors and sends standardized JSON responses
 * Differentiates between operational errors and programming errors
 */
const errorHandler = (error, req, res, next) => {
    // Log error details for debugging and monitoring
    logError(error, req);
    // Handle specific error types with appropriate responses
    if (error instanceof ValidationError) {
        handleValidationError(error, res);
    }
    else if (error instanceof AuthenticationError) {
        handleAuthenticationError(error, res);
    }
    else if (error instanceof AuthorizationError) {
        handleAuthorizationError(error, res);
    }
    else if (error instanceof DatabaseError) {
        handleDatabaseError(error, res);
    }
    else if (error instanceof AppError) {
        handleAppError(error, res);
    }
    else {
        handleUnknownError(error, res);
    }
};
exports.errorHandler = errorHandler;
/**
 * Logs error details with request information
 * @param error - The error object
 * @param req - Express Request object for context
 */
const logError = (error, req) => {
    logger_1.logger.error("Error occurred:", {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        // Don't log sensitive headers
        headers: {
            "user-agent": req.get("user-agent"),
            "content-type": req.get("content-type"),
        },
    });
};
/**
 * Handles validation errors with detailed field information
 */
const handleValidationError = (error, res) => {
    responseHelper_1.ResponseHelper.error(res, error.message, error.statusCode, process.env.NODE_ENV === "development"
        ? { errors: error.errors }
        : undefined);
};
/**
 * Handles authentication errors (401 Unauthorized)
 */
const handleAuthenticationError = (error, res) => {
    responseHelper_1.ResponseHelper.error(res, error.message, error.statusCode);
};
/**
 * Handles authorization errors (403 Forbidden)
 */
const handleAuthorizationError = (error, res) => {
    responseHelper_1.ResponseHelper.error(res, error.message, error.statusCode);
};
/**
 * Handles database errors with appropriate messaging
 */
const handleDatabaseError = (error, res) => {
    const message = process.env.NODE_ENV === "production"
        ? "Database operation failed"
        : error.message;
    responseHelper_1.ResponseHelper.error(res, message, error.statusCode);
};
/**
 * Handles known application errors (operational errors)
 */
const handleAppError = (error, res) => {
    responseHelper_1.ResponseHelper.error(res, error.message, error.statusCode);
};
/**
 * Handles unknown/unexpected errors (programming errors, third-party lib errors)
 * Prevents leaking sensitive information in production
 */
const handleUnknownError = (error, res) => {
    const message = process.env.NODE_ENV === "production"
        ? "An unexpected error occurred. Please try again later."
        : error.message;
    const statusCode = 500;
    responseHelper_1.ResponseHelper.error(res, message, statusCode, process.env.NODE_ENV === "development" ? { stack: error.stack } : undefined);
};
/**
 * Async error wrapper middleware to catch errors in async routes
 * Eliminates the need for try-catch blocks in every async controller
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
