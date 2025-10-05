import { AppError, asyncHandler } from "../middlewares/error.middleware";
import { formatCurrency } from "../utils/currencyFormatter";
import { generateTransactionId } from "../utils/generateTransactionId";
import { calculateRate } from "../utils/rateCalculator";
import Transaction from "../models/transaction.model";
import User from "../models/user.model";
import { logger } from "../utils/logger";
import { WalletService } from "./wallet.service";
import mongoose from "mongoose";
import { getExchangeRate } from "../utils/mockExchangeRate";

/**
 * This service is to handle conversion, transaction creation, update balances.
 */

export class TransactionService {
  private sanitizer(transaction: any) {
    if (!transaction) return null;
    const obj = transaction.toObject
      ? transaction.toObject()
      : { ...transaction };
    delete obj.password;
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
  }
  //Convert to naira logic
  public async convertToNaira(
    userId: string,
    amount: number,
    cryptoType: string,
    bank: string
  ) {
    //  Basic input validation
    if (!amount || !cryptoType || !bank)
      throw new AppError(
        "Missing required fields: amount, cryptoType, bank",
        400
      );
    if (amount <= 0) throw new AppError("Amount must be greater than 0", 400);

    //  Check if crypto type is supported
    const supportedCryptos = ["BTC", "ETH", "USDT"];
    if (!supportedCryptos.includes(cryptoType))
      throw new AppError(`Unsupported crypto type: ${cryptoType}`, 400);

    //  Calculate conversion and prepare data
    const nairaAmount = await calculateRate(amount, cryptoType);

    const conversionRate = await getExchangeRate(cryptoType);

    const format = formatCurrency(nairaAmount); //Format teh amount some like ₦7,500.00

    const transactionId = generateTransactionId(); // Generate a unique id for the transaction

    //  Create transaction first (outside session)
    // This ensures we always have a record even if something fails later
    const transaction = await Transaction.create({
      status: "PENDING", //Eventually gets updated to either SUCCESS OR FAILED
      userId,
      transactionId,
      cryptoType,
      amountInCrypto: amount,
      currencyFormat: format,
      conversionRate: conversionRate,
      recipientBank: bank,
      amountInNaira: nairaAmount,
    });
    if (!transaction) {
      throw new AppError("Failed to create transaction", 500);
    }
    //log transaction
    logger.info("New Transaction Processing", {
      userId: userId,
      transactionId: transactionId,
      cryptoType: cryptoType,
      amountInCrypto: amount,
      currencyFormat: format,
      conversionRate: conversionRate,
      status: "PENDING",
    });
    //  Start a session for wallet balance updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      //  Validate wallet balance before processing
      await WalletService.validateBalance(userId, cryptoType, amount);

      //  Perform balance updates atomically inside the session
      await WalletService.debit(userId, amount, cryptoType, session);
      await WalletService.credit(userId, nairaAmount, "NGN", session);

      //  Mark transaction as successful
      transaction.status = "SUCCESS";
      await transaction.save();

      //  Commit the session
      await session.commitTransaction();

      //  Log success
      logger.info("Transaction processed successfully", {
        id: transaction._id,
        userId: userId,
        transactionId: transactionId,
        cryptoType: cryptoType,
        amountInCrypto: amount,
        currencyFormat: format,
        amountInNaira: nairaAmount,
      });

      const safeTransaction = this.sanitizer(transaction);
      //  Return response
      return {
        success: true,
        message: "Transaction processed successfully",
        safeTransaction,
      };
    } catch (err: any) {
      //  abort the transaction on error
      await session.abortTransaction();

      //  Mark the same transaction as failed
      transaction.status = "FAILED";
      transaction.errorMessage = err.message;
      await transaction.save();

      //  Log the failed transaction
      logger.error("Transaction failed", {
        error: err.message,
        id: transaction._id,
        userId: userId,
        transactionId: transactionId,
        cryptoType: cryptoType,
        amountInCrypto: amount,
        currencyFormat: format,
        amountInNaira: nairaAmount,
      });

      const safeTransaction = this.sanitizer(transaction);

      //  Return failure response but still include the transaction record
      return {
        success: false,
        message: err.message,
        safeTransaction,
      };
    } finally {
      // 💡 Step 13: Always end the session
      session.endSession();
    }
  }

  //Fetch all transactions logic
  public async fetchAllTransactions() {
    const transactions = await Transaction.find();
    if (!transactions || transactions.length === 0)
      throw new AppError("NO Transactions found", 404);
    return transactions;
  }

  //Fetch all transactions logic
  public async fetchUserTransactions(userId: string) {
    //Check if user exist in the data base
    const userExist = await User.exists({ _id: userId }); //Used exists for optimized, faster and cost effective compare to findById()
    //Validate
    if (!userExist) throw new AppError("User not found", 404);

    //Get User transactions
    const transactions = (await Transaction.find({ userId })
      .sort({
        createdAt: -1,
      })
      .lean()) as any; //Sort to sort the transactions and lean to make it mongoose skip hydration mak9ing it cost effective
    if (!transactions) throw new AppError("Transactions not found", 404);

    //return the transactions
    return transactions;
  }
}
