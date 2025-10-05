"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUser = exports.fetchAllUser = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const responseHelper_1 = require("../utils/responseHelper");
const user_service_1 = require("../services/user.service");
exports.fetchAllUser = (0, error_middleware_1.asyncHandler)(async (_req, res, next) => {
    const users = await user_service_1.UserService.getAllUser();
    //Return response
    return responseHelper_1.ResponseHelper.success(res, { users: users }, "Users fetched");
});
exports.fetchUser = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
    const user = await user_service_1.UserService.getUser(id);
    //Return response
    return responseHelper_1.ResponseHelper.success(res, user, "User fetched");
});
