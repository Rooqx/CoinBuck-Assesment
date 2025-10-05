"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
class ResponseHelper {
    static success(res, data = null, message = "Success", statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message = "Internal server error", statusCode = 500, details = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString(),
        };
        if (details && process.env.NODE_ENV === "development") {
            response.details = details;
        }
        return res.status(statusCode).json(response);
    }
    static created(res, data = null, message = "Resource created successfully") {
        return this.success(res, data, message, 201);
    }
    static notFound(res, message = "Resource not found") {
        return this.error(res, message, 404);
    }
    static unauthorized(res, message = "Unauthorized access") {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = "Forbidden") {
        return this.error(res, message, 403);
    }
    static badRequest(res, message = "Bad request", details = null) {
        return this.error(res, message, 400, details);
    }
    static validationError(res, errors, message = "Validation failed") {
        return this.error(res, message, 422, { errors });
    }
}
exports.ResponseHelper = ResponseHelper;
