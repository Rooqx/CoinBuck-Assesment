"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const currencyFormatter_1 = require("../utils/currencyFormatter");
const generateTransactionId_1 = require("../utils/generateTransactionId");
const rateCalculator_1 = require("../utils/rateCalculator");
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const logger_1 = require("../utils/logger");
const wallet_service_1 = require("./wallet.service");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * This service is to handle conversion, transaction creation, update balances.
 */
class TransactionService {
    //Convert to naira logic
    async convertToNaira(userId, amount, cryptoType) {
        //  Basic input validation
        if (!amount || !cryptoType)
            throw new error_middleware_1.AppError("Missing required fields: amount, cryptoType", 400);
        if (amount <= 0)
            throw new error_middleware_1.AppError("Amount must be greater than 0", 400);
        //  Check if crypto type is supported
        const supportedCryptos = ["BTC", "ETH", "USDT"];
        if (!supportedCryptos.includes(cryptoType))
            throw new error_middleware_1.AppError(`Unsupported crypto type: ${cryptoType}`, 400);
        //  Calculate conversion and prepare data
        const nairaAmount = await (0, rateCalculator_1.calculateRate)(amount, cryptoType);
        const format = (0, currencyFormatter_1.formatCurrency)(nairaAmount);
        const transactionId = (0, generateTransactionId_1.generateTransactionId)();
        //  Create transaction first (outside session)
        // This ensures we always have a record even if something fails later
        const transaction = await transaction_model_1.default.create({
            userId,
            transactionId,
            cryptoType,
            amountInCrypto: amount,
            currencyFormat: format,
            amountInNaira: nairaAmount,
            status: "PENDING",
        });
        //  Start a session for wallet balance updates
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            //  Validate wallet balance before processing
            await wallet_service_1.WalletService.validateBalance(userId, cryptoType, amount);
            //  Perform balance updates atomically inside the session
            await wallet_service_1.WalletService.debit(userId, amount, cryptoType, session);
            await wallet_service_1.WalletService.credit(userId, nairaAmount, "NGN", session);
            //  Mark transaction as successful
            transaction.status = "SUCCESS";
            await transaction.save();
            //  Commit the session
            await session.commitTransaction();
            //  Log success
            logger_1.logger.info("Transaction processed successfully", {
                cryptoType,
                amountInCrypto: amount,
                currencyFormat: format,
                amountInNaira: nairaAmount,
            });
            //  Return response
            return {
                success: true,
                message: "Transaction processed successfully",
                transaction,
            };
        }
        catch (err) {
            //  abort the transaction on error
            await session.abortTransaction();
            //  Mark the same transaction as failed
            transaction.status = "FAILED";
            transaction.errorMessage = err.message;
            await transaction.save();
            //  Log the failed transaction
            logger_1.logger.error("Transaction failed", {
                error: err.message,
                cryptoType,
                amountInCrypto: amount,
                currencyFormat: format,
                amountInNaira: nairaAmount,
            });
            //  Return failure response but still include the transaction record
            return {
                success: false,
                message: err.message,
                transaction,
            };
        }
        finally {
            // 💡 Step 13: Always end the session
            session.endSession();
        }
    }
    //Fetch all transactions logic
    async fetchAllTransactions() {
        const transactions = await transaction_model_1.default.find();
        if (!transactions || transactions.length === 0)
            throw new error_middleware_1.AppError("NO Transactions found", 404);
        return transactions;
    }
    //Fetch all transactions logic
    async fetchUserTransactions(userId) {
        //Check if user exist in the data base
        const userExist = await user_model_1.default.exists({ _id: userId }); //Used exists for optimized, faster and cost effective compare to findById()
        //Validate
        if (!userExist)
            throw new error_middleware_1.AppError("User not found", 404);
        //Get User transactions
        const transactions = (await transaction_model_1.default.find({ userId })
            .sort({
            createdAt: -1,
        })
            .lean()); //Sort to sort the transactions and lean to make it mongoose skip hydration mak9ing it cost effective
        if (!transactions)
            throw new error_middleware_1.AppError("Transactions not found", 404);
        //return the transactions
        return transactions;
    }
}
exports.TransactionService = TransactionService;
