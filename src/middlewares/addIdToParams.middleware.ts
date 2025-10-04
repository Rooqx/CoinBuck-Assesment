import { asyncHandler } from "./error.middleware";
import type { NextFunction, Response, Request } from "express";

/**
 * This function is to add id to the url instead of manual input
 */
export const addId = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.sub) {
      return next(new Error("User not authenticated"));
    }
    const id = req.user?.sub;
    req.params.id = id;
    next();
  }
);
