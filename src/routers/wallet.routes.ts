import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  fetchAllWallets,
  fetchUserWallet,
} from "../controllers/wallet.controller";
import { addId } from "../middlewares/addIdToParams.middleware";

const walletRouter = Router();

//Get all wallet Route
walletRouter.get("/", authMiddleware, fetchAllWallets);

//Get a user wallet Route
walletRouter.get("/me", authMiddleware, addId, fetchUserWallet);

export default walletRouter;
