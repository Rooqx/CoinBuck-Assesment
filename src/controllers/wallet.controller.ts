import type { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { WalletService } from "../services/wallet.service";
import { ResponseHelper } from "../utils/responseHelper";

export const fetchAllWallets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const wallets = await WalletService.getAllWallet();

    //Return response
    return ResponseHelper.success(res, { wallets: wallets }, "wallets fetched");
  }
);

export const fetchUserWallet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userWallet = await WalletService.getUserWallet(id);

    //Return response
    return ResponseHelper.success(res, userWallet, "User wallet fetched");
  }
);
