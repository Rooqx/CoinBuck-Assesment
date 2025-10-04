import { AppError, asyncHandler } from "../middlewares/error.middleware";
import { formatCurrency } from "../utils/currencyFormatter";
import { generateTransactionId } from "../utils/generateTransactionId";
import { calculateRate } from "../utils/rateCalculator";
import Transaction from "../models/transaction.model";
import User from "../models/user.model";
import { logger } from "../utils/logger";
import { WalletService } from "./wallet.service";
import mongoose from "mongoose";

/**
 * This service is to handle conversion, transaction creation, update balances.
 */

export class TransactionService {
  //Convert to naira logic
  public async convertToNaira(
    userId: string,
    amount: number,
    cryptoType: string
  ) {
    //  Basic input validation
    if (!amount || !cryptoType)
      throw new AppError("Missing required fields: amount, cryptoType", 400);
    if (amount <= 0) throw new AppError("Amount must be greater than 0", 400);

    //  Check if crypto type is supported
    const supportedCryptos = ["BTC", "ETH", "USDT"];
    if (!supportedCryptos.includes(cryptoType))
      throw new AppError(`Unsupported crypto type: ${cryptoType}`, 400);

    //  Calculate conversion and prepare data
    const nairaAmount = await calculateRate(amount, cryptoType);
    const format = formatCurrency(nairaAmount);
    const transactionId = generateTransactionId();

    //  Create transaction first (outside session)
    // This ensures we always have a record even if something fails later
    const transaction = await Transaction.create({
      userId,
      transactionId,
      cryptoType,
      amountInCrypto: amount,
      currencyFormat: format,
      amountInNaira: nairaAmount,
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
