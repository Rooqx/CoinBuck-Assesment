import type { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares/error.middleware";

import { ResponseHelper } from "../utils/responseHelper";
import { UserService } from "../services/user.service";

export const fetchAllUser = asyncHandler(
  async (_req: Request, res: Response, next: NextFunction) => {
    const users = await UserService.getAllUser();

    //Return response
    return ResponseHelper.success(res, { users: users }, "Users fetched");
  }
);

export const fetchUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const user = await UserService.getUser(id);

    //Return response
    return ResponseHelper.success(res, user, "User fetched");
  }
);
