import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  fetchAllWallets,
  fetchUserWallet,
} from "../controllers/wallet.controller";
import { fetchAllUser, fetchUser } from "../controllers/user.controller";
import { addId } from "../middlewares/addIdToParams.middleware";

const userRouter = Router();

//Get all wallet Route
//userRouter.get("/", authMiddleware, fetchAllUser);

//Get a user wallet Route
userRouter.get("/me", authMiddleware, addId, fetchUser);

export default userRouter;
