import { Request, Response } from "express";
import * as adminService from "./admin.service";
import * as hostRequestService from "../hostRequest/hostRequest.service";
import asyncHandler from "../../shared/asyncHandler";
import ApiResponse from "../../shared/apiResponse";
import prisma from "../../shared/prisma";

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
// backend/src/app/modules/admin/admin.controller.ts এ যোগ করুন

export const getAllHostRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const requests = await prisma.hostRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { fullName: true, email: true } } },
    });
    res.json(new ApiResponse(200, requests, "Requests fetched successfully"));
  }
);

export const handleHostRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const result = await hostRequestService.approveHostRequest(requestId);
    res.json(new ApiResponse(200, result, "User has been promoted to HOST"));
  }
);
// admin.controller.ts (বা hostRequest.controller.ts)

export const sendHostRequest = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const { message } = req.body;
    const userId = req.user.id; // মিডলওয়্যার থেকে আইডি আসছে

    const result = await hostRequestService.sendHostRequest(userId, message);

    res.json(
      new ApiResponse(200, result, "Your request has been submitted to Admin.")
    );
  }
);
