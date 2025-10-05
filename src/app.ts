import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ENV,
  MONGO_URI,
  PORT,
} from "./configs/env.config";
import { connectToMongo } from "./database/mongo";
import { TransactionService } from "./services/transaction.service";
import transactionRouter from "./routers/transaction.router";
import walletRouter from "./routers/wallet.routes";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import arcjetMiddleware from "./middlewares/arcject.middleware";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

//Rate limiter and  bot protection
app.use(arcjetMiddleware);
//Routes
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/wallets", walletRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

//Global express server
app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Hello from Server (Express + TS) 👋");
});
console.log(MONGO_URI);

app.listen(PORT, async () => {
  console.log(`✅Server running at http://localhost:${PORT}`);
  await connectToMongo();
  //await connectToRedis();
  console.log(`Environment:${ENV}`);
});
