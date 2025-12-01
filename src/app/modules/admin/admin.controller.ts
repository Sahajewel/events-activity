import { Request, Response } from "express";
import * as adminService from "./admin.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    res.json(
      new ApiResponse(200, stats, "Dashboard stats fetched successfully")
    );
  }
);

export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await adminService.updateUserRole(
      req.params.userId,
      req.body.role
    );
    res.json(new ApiResponse(200, user, "User role updated successfully"));
  }
);

export const toggleUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await adminService.toggleUserStatus(req.params.userId);
    res.json(new ApiResponse(200, user, "User status updated successfully"));
  }
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.deleteUser(req.params.userId);
  res.json(new ApiResponse(200, result, "User deleted successfully"));
});

export const updateEventStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const event = await adminService.updateEventStatus(
      req.params.eventId,
      req.body.status
    );
    res.json(new ApiResponse(200, event, "Event status updated successfully"));
  }
);
