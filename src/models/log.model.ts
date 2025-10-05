import mongoose, { Schema, Document } from "mongoose";

export interface ILog extends Document {
  level: "info" | "warn" | "error";
  message: string;
  meta?: Record<string, any>;
  requestId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const logSchema = new Schema<ILog>(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: Object,
      default: {},
    },
    requestId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Log = mongoose.model<ILog>("Log", logSchema);
export default Log;
