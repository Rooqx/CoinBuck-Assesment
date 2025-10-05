import { Router } from "express";
import {
  conversion,
  fetchAllTransactions,
  fetchUserTransactions,
} from "../controllers/transaction.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { addId } from "../middlewares/addIdToParams.middleware";

const transactionRouter = Router();

//Convert Route
transactionRouter.post("/convert", authMiddleware, conversion);

//Update transaction
transactionRouter.get("/", authMiddleware, fetchAllTransactions);

//Update transaction
transactionRouter.get("/me", authMiddleware, addId, fetchUserTransactions);

export default transactionRouter;
