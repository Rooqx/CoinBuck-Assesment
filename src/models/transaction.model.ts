/**
 * Transaction Schema
 */
// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, //For fast look up
    },
    transactionId: { type: String, unique: true, required: true }, // UUID or nanoid
    cryptoType: { type: String, enum: ["BTC", "ETH", "USDT"], required: true },
    amountInCrypto: { type: Number, required: true },
    conversionRate: { type: Number, required: true },
    amountInNaira: { type: Number, required: true },
    currencyFormat: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    errorMessage: { type: String }, // if failed
  },
  { timestamps: true }
); // adds createdAt & updatedAt

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
