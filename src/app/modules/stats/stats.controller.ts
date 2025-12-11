import { Request, Response } from "express";
import ApiResponse from "../../shared/apiResponse";
import asyncHandler from "../../shared/asyncHandler";
import * as statsService from "./stats.service";
export const getPublicStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await statsService.getPublicStats();
    res.json(new ApiResponse(200, stats, "Public stats fetched successfully"));
  }
);
