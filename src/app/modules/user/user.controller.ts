import { Request, Response } from "express";
import * as userService from "./user.service";
import ApiResponse from "../../shared/apiResponse";
import asyncHandler from "../../shared/asyncHandler";

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    res.json(new ApiResponse(200, user, "User profile fetched successfully"));
  }
);

export const updateProfile = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const user = await userService.updateProfile(
      req.user!.id,
      req.body,
      req.file
    );
    res.json(new ApiResponse(200, user, "Profile updated successfully"));
  }
);

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAllUsers(req.query);
  res.json(new ApiResponse(200, result, "Users fetched successfully"));
});
