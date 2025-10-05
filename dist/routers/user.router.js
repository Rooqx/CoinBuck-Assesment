"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const user_controller_1 = require("../controllers/user.controller");
const addIdToParams_middleware_1 = require("../middlewares/addIdToParams.middleware");
const userRouter = (0, express_1.Router)();
//Get all wallet Route
//userRouter.get("/", authMiddleware, fetchAllUser);
//Get a user wallet Route
userRouter.get("/me", auth_middleware_1.default, addIdToParams_middleware_1.addId, user_controller_1.fetchUser);
exports.default = userRouter;
