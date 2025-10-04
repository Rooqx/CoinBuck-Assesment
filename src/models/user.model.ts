/**
 * User Schema
 */
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    name: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    password: { type: String, minLength: 6, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
