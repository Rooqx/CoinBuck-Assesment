/**
 * Wallet Schema
 */

import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, //For fast look up
    },
    balances: {
      BTC: { type: Number, default: 10 },
      ETH: { type: Number, default: 100 },
      USDT: { type: Number, default: 1000 },
      NGN: { type: Number, default: 0 }, // fiat
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
