"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const wallet_controller_1 = require("../controllers/wallet.controller");
const userRouter = (0, express_1.Router)();
//Get all wallet Route
userRouter.get("/", auth_middleware_1.default, wallet_controller_1.fetchAllWallets);
//Get a user wallet Route
userRouter.get("/me", auth_middleware_1.default, wallet_controller_1.fetchUserWallet);
exports.default = userRouter;
