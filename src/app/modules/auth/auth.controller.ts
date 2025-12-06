import { Request, Response } from "express";

import * as authService from "./auth.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";
import { tr } from "zod/v4/locales";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json(new ApiResponse(200, result, "Login successful"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json(new ApiResponse(200, null, "Logout successful"));
});

export const getMe = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const user = await authService.getProfile(req.user!.id);
    res.json(new ApiResponse(200, user, "Profile fetched successfully"));
  }
);
