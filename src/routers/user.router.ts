import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  fetchAllWallets,
  fetchUserWallet,
} from "../controllers/wallet.controller";

const userRouter = Router();

//Get all wallet Route
userRouter.get("/", authMiddleware, fetchAllWallets);

//Get a user wallet Route
userRouter.get("/me", authMiddleware, fetchUserWallet);

export default userRouter;
