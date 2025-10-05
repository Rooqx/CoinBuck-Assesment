"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const addIdToParams_middleware_1 = require("../middlewares/addIdToParams.middleware");
const transactionRouter = (0, express_1.Router)();
//Convert Route
transactionRouter.post("/convert", auth_middleware_1.default, transaction_controller_1.conversion);
//Update transaction
transactionRouter.get("/", auth_middleware_1.default, transaction_controller_1.fetchAllTransactions);
//Update transaction
transactionRouter.get("/me", auth_middleware_1.default, addIdToParams_middleware_1.addId, transaction_controller_1.fetchUserTransactions);
exports.default = transactionRouter;
