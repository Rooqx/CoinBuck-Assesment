"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const wallet_controller_1 = require("../controllers/wallet.controller");
const addIdToParams_middleware_1 = require("../middlewares/addIdToParams.middleware");
const walletRouter = (0, express_1.Router)();
//Get all wallet Route
walletRouter.get("/", auth_middleware_1.default, wallet_controller_1.fetchAllWallets);
//Get a user wallet Route
walletRouter.get("/me", auth_middleware_1.default, addIdToParams_middleware_1.addId, wallet_controller_1.fetchUserWallet);
exports.default = walletRouter;
