"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addId = void 0;
const error_middleware_1 = require("./error.middleware");
/**
 * This function is to add id to the url instead of manual input
 */
exports.addId = (0, error_middleware_1.asyncHandler)(async (req, _res, next) => {
    if (!req.user?.sub) {
        return next(new Error("User not authenticated"));
    }
    const id = req.user?.sub;
    req.params.id = id;
    next();
});
