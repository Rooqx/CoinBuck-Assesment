"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserWallet = exports.fetchAllWallets = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const wallet_service_1 = require("../services/wallet.service");
const responseHelper_1 = require("../utils/responseHelper");
exports.fetchAllWallets = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const wallets = await wallet_service_1.WalletService.getAllWallet();
    //Return response
    return responseHelper_1.ResponseHelper.success(res, { wallets: wallets }, "wallets fetched");
});
exports.fetchUserWallet = (0, error_middleware_1.asyncHandler)(async (req, res, next) => {
    const id = req.params.id;
    const userWallet = await wallet_service_1.WalletService.getUserWallet(id);
    //Return response
    return responseHelper_1.ResponseHelper.success(res, userWallet, "User wallet fetched");
});
