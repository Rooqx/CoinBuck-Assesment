import type { NextFunction, Request, Response } from "express";
import { AppError, asyncHandler } from "../middlewares/error.middleware";
import { UserService } from "../services/user.service";
import { ResponseHelper } from "../utils/responseHelper";
import User from "../models/user.model";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from "../configs/env.config";
import {
  getAccessCookieOpts,
  getRefreshCookieOpts,
} from "../utils/tokenCookies";
import bcrypt from "bcryptjs";
import { type Secret, type SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

// helper: remove sensitive fields before sending user object
function sanitizeUser(user: any) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

// helper: sign JWTs (self-contained so this works in an assessment)
function signAccessToken(payload: object) {
  const secret = ACCESS_TOKEN_SECRET as Secret;
  const expiresIn = ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
}

function signRefreshToken(payload: object) {
  const secret = REFRESH_TOKEN_SECRET as Secret;
  const expiresIn = REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
}

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const account = await UserService.createUser(email, password);

    // minimal payload; include whatever claims you need
    const payload = { sub: account._id, email: account.email };
    console.log("payload;", payload);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // set access token cookie (short-lived)
    res.cookie("accessToken", accessToken, getAccessCookieOpts());

    // set refresh token cookie (httpOnly so client JS can't read it)
    res.cookie("refreshToken", refreshToken, getRefreshCookieOpts());
    return ResponseHelper.created(
      res,
      { user: account },
      "Account creation successful"
    );
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Invalid credentials", 401);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }
    // console.log("User found:", user);

    // compare password with hashed password
    //  console.log("Comparing passwords");
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new AppError("Invalid credentials", 401);
    }

    // minimal payload; include whatever claims you need
    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // set access token cookie (short-lived)
    res.cookie("accessToken", accessToken, getAccessCookieOpts());

    // set refresh token cookie (httpOnly so client JS can't read it)
    res.cookie("refreshToken", refreshToken, getRefreshCookieOpts());

    const sanitizedUser = sanitizeUser(user);
    return ResponseHelper.success(res, { user: sanitizedUser }, "Logged in");
  }
);
