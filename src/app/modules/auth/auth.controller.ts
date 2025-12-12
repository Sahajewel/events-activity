import { NextFunction, Request, Response } from "express";

import * as authService from "./auth.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";
import { AuthRequest } from "../../middlewares/auth";

export const register = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await authService.register(req.body);

    // res.cookie("token", result.token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   partitioned: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res
      .status(201)
      .json(new ApiResponse(201, result, "User registered successfully"));
  }
);

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  // res.cookie("token", result.token, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "none",
  //   partitioned: true,
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

  res.json(new ApiResponse(200, result, "Login successful"));
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  // res.clearCookie("token");
  res.json(new ApiResponse(200, null, "Logout successful"));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.json(new ApiResponse(200, user, "Profile fetched successfully"));
});
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(new ApiResponse(200, null, result.message));
  }
);

// ✅ ফিক্সড resetPassword কন্ট্রোলার (প্রস্তাবিত)
// ✅ ফিক্সড resetPassword কন্ট্রোলার (যদি টোকেন বডি থেকে আসে)
// src/controllers/authController.ts

// ✅ এই কন্ট্রোলারটিই ব্যবহার করুন, কারণ আপনার ফ্রন্টএন্ডের জন্য এটিই সবচেয়ে সহজ।
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    // টোকেন, ইমেল ও নতুন পাসওয়ার্ড সবই রিকোয়েস্ট বডি থেকে আসছে বলে ধরে নিচ্ছি
    const { token, email, newPassword } = req.body;

    // আপনার authService এ পাঠানো হচ্ছে
    await authService.resetPassword(token, email, newPassword);
    res.json(new ApiResponse(200, null, "Password reset successful"));
  }
);
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    // ফ্রন্টএন্ড রিকোয়েস্ট বডিতে { refreshToken } পাঠাচ্ছে
    const { refreshToken } = req.body;

    // সার্ভিস ফাংশনকে কল করা হলো
    const result = await authService.refreshToken(refreshToken);

    res.json(new ApiResponse(200, result, "Token refreshed successfully"));
  }
);
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. ইউজার আইডি রিকোয়েস্ট থেকে নিন (সাধারণত অথেনটিকেশন মিডলওয়্যার থেকে আসে)
    const userId = req.user!.id; // ধরে নিলাম req.user এ আইডি আছে
    const { currentPassword, newPassword } = req.body;

    // 2. সার্ভিস লেয়ারে ডেটা পাঠান
    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Password updated successfully!",
      // ডেটা হিসেবে কিছু না দিলেও হবে
      data: result,
    });
  } catch (error) {
    next(error); // এরর হ্যান্ডলার-এ পাঠান
  }
};
