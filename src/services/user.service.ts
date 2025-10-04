import bcrypt from "bcryptjs";
import { AppError } from "../middlewares/error.middleware";
import User from "../models/user.model";
import { WalletService } from "./wallet.service";
import { logger } from "../utils/logger";

export class UserService {
  //Func to remove sensitive data like password etcetera form the user object

  static #sanitizeUser(user: any) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
  }
  //Create User
  static async createUser(email: string, password: string) {
    //Validations
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    //Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("Account with this email already exists", 409);
    }

    //hashing password for safe storage using bcrypt
    const saltRounds = Number(12);
    const hashed = await bcrypt.hash(password, saltRounds);

    //create the user
    const created = await User.create({
      email,
      password: hashed,
    });

    //create Wallet for the user
    const wallet = await WalletService.createWallet(created._id as any);
    logger.info("New wallet created", {
      userId: wallet.userId,
      balances: wallet.balances,
      walletId: wallet._id,
    });

    //Sanitize the user to remove sensitive data like password etcetera
    const safe = this.#sanitizeUser(created);
    logger.info("New User created", {
      userId: safe._id,
      email: safe.email,
      role: safe.role,
    });
    return safe;
  }

  //Get all user
  static async getAllUser() {
    const users = await User.find();
    if (!users || users.length === 0) throw new AppError("No user found");
    return users;
  }

  //Get a user details
  static async getUser(userId: string) {
    //Validate if user id is present and not empty
    if (!userId || userId === "") throw new AppError("User id is missing", 400);

    const user = await User.findById(userId); //finding user
    if (!user) throw new AppError("User not found", 404); //Validating
    return this.#sanitizeUser(user); // sanitize before returning
  }
}
