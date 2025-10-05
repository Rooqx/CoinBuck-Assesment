import { AppError, asyncHandler } from "../middlewares/error.middleware";
import type { NextFunction, Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { ResponseHelper } from "../utils/responseHelper";
import mongoose from "mongoose";

const newTransaction = new TransactionService();

export const conversion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount, cryptoType, bank } = req.body;
    const userId = req.user.sub;

    //  use the transaction service
    const transaction = await newTransaction.convertToNaira(
      userId,
      Number(amount),
      cryptoType,
      bank
    );
    //Return response
    return ResponseHelper.created(res, transaction, "Transaction Created");
  }
);
export const fetchAllTransactions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const transactions = await newTransaction.fetchAllTransactions();

    //Return response
    return ResponseHelper.success(
      res,
      { transactions: transactions },
      "Transaction Created"
    );
  }
);

export const fetchUserTransactions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userTransactions = await newTransaction.fetchUserTransactions(id);

    //Return response
    if (userTransactions.length === 0)
      return ResponseHelper.success(
        res,
        { transactions: [] },
        "You currently do not have any transaction"
      );
    return ResponseHelper.success(
      res,
      userTransactions,
      "User Transactions fetched"
    );
  }
);
