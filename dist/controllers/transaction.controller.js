"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserTransactions = exports.fetchAllTransactions = exports.conversion = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const transaction_service_1 = require("../services/transaction.service");
const responseHelper_1 = require("../utils/responseHelper");
const newTransaction = new transaction_service_1.TransactionService();
exports.conversion = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const { amount, cryptoType, bank } = req.body;
    const userId = req.user.sub;
    //  use the transaction service
    const transaction = await newTransaction.convertToNaira(userId, Number(amount), cryptoType, bank);
    //Return response
    return responseHelper_1.ResponseHelper.created(res, transaction, "Transaction Created");
});
exports.fetchAllTransactions = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const transactions = await newTransaction.fetchAllTransactions();
    //Return response
    return responseHelper_1.ResponseHelper.success(res, { transactions: transactions }, "Transaction Created");
});
exports.fetchUserTransactions = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
    const userTransactions = await newTransaction.fetchUserTransactions(id);
    //Return response
    if (userTransactions.length === 0)
        return responseHelper_1.ResponseHelper.success(res, { transactions: [] }, "You currently do not have any transaction");
    return responseHelper_1.ResponseHelper.success(res, userTransactions, "User Transactions fetched");
});
