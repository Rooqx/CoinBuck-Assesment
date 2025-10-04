import Wallet from "../models/wallet.model";
import { AppError } from "../middlewares/error.middleware";
import type mongoose from "mongoose";
/**
 * This service is to fetch/store crypto - NGN rate (dummy rate)
 */
export class WalletService {
  //This is a function to get the user balance from the wallet
  static async getBalance(userId: string) {
    const wallet = (await Wallet.findOne({ userId })) as any;
    if (!wallet) throw new AppError("Wallet not found", 404);
    return wallet.balances;
  }

  static async validateBalance(
    userId: string,
    cryptoType: string,
    amount: number
  ) {
    const balances = await this.getBalance(userId);
    if (!balances[cryptoType] || balances[cryptoType] < amount) {
      throw new AppError("Insufficient balance", 400);
    }
  }

  static async createWallet(userId: string) {
    //Validate
    if (!userId) throw new AppError("User id is missing", 400);

    const newWallet = await Wallet.create({ userId: userId });
    if (!newWallet) throw new AppError("Wallet not created", 400);
    //Return wallet
    return newWallet;
  }

  static async getAllWallet() {
    const wallets = await Wallet.find();
    //Validate
    if (!wallets || wallets.length === 0)
      throw new AppError("No wallets found", 404);
    //Return wallets
    return wallets;
  }

  static async getUserWallet(userId: string) {
    //Validate

    if (!userId) throw new AppError("User id is missing", 400);

    //Find wallet
    const wallet = await Wallet.findOne({ userId });
    //Validate
    if (!wallet) throw new AppError("Wallet not found", 404);
    //Return wallet
    return wallet;
  }
  //Debit Logic
  static async debit(
    userId: string,
    amount: number,
    cryptoType: string,
    session?: mongoose.ClientSession
  ) {
    //Find wallet
    const wallet = (await Wallet.findOne({ userId })) as any;
    //validate
    if (!wallet) throw new AppError("Wallet not found", 404);
    //Compare balance with user balance
    if (wallet.balances[cryptoType] < amount) {
      throw new AppError("Insufficient crypto balance", 400);
    }
    //Update user wallet
    wallet.balances[cryptoType] -= amount;
    await wallet.save({ session });
    return wallet;
  }

  //Credit Logic
  static async credit(
    userId: string,
    amount: number,
    cryptoType: string,
    session?: mongoose.ClientSession
  ) {
    //Find wallet
    const wallet = (await Wallet.findOne({ userId })) as any;
    //validate
    if (!wallet) throw new AppError("Wallet not found", 404);
    //Update user wallet
    wallet.balances[cryptoType] += amount;
    await wallet.save({ session });
    return wallet;
  }
}
